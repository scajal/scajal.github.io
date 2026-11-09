---
title: "Multi-tenant en Laravel: una columna team_id o una base por tenant"
description: "team_id en una sola base o una base por tenant en Laravel: ventajas, cómo filtrar cada consulta, resolver el tenant con seguridad, roles y agregarlo después."
published: "2026-11-12"
translations: {"en": "multi-tenancy-in-laravel"}
---

Para la mayoría de las aplicaciones SaaS en Laravel, la forma correcta de hacer multi-tenant es una sola base de datos con una columna `team_id` (o `tenant_id`) en cada tabla que pertenece a un tenant. Una base o un esquema por tenant justifica su costo cuando el aislamiento es un requisito contractual, cuando hay pocos tenants grandes en lugar de muchos pequeños, o cuando los datos de cada tenant tienen que estar en una región concreta. En cualquiera de los dos casos, la columna es lo fácil. El trabajo está en que cada consulta, cada regla de validación y cada job pasen por el tenant, y en que pedir datos de otro falle igual que pedir datos que no existen.

Abajo están los dos modelos y después cómo apliqué el compartido en Contamos, un libro compartido para dinero en varias monedas donde el tenant es un equipo. El servicio ya no está en línea, pero el [código es open source](https://github.com/scajal/contamos), así que todo lo que sigue se puede comprobar.

## Los dos modelos

| | Una base, columna `team_id` | Una base (o esquema) por tenant |
|---|---|---|
| Aislamiento | Lógico: un `WHERE` olvidado filtra datos | Físico: una consulta no puede llegar a otro tenant |
| Migraciones | Se corren una vez | Una vez por tenant, y pueden fallar a mitad de camino |
| Reportes entre tenants | Una consulta | Una consulta por tenant, o un data warehouse aparte |
| Usuarios en varios tenants | Una tabla pivote | Igual hace falta una base central de usuarios |
| Restaurar un solo tenant | Difícil, las filas están mezcladas | Restaurar una base |
| Borrar un tenant | Borrado en cascada desde una fila | Eliminar la base |
| Costo por tenant | Casi cero | Una base, sus conexiones y sus backups |
| Vecinos ruidosos | Comparten cada índice y cada lock | Contenidos, si las bases están en servidores distintos |

En MySQL, un esquema es una base de datos. En PostgreSQL, un esquema por tenant queda en el medio: tablas separadas, un solo pool de conexiones y migraciones que igual se corren una vez por tenant.

Paquetes como [stancl/tenancy](https://tenancyforlaravel.com/) y [spatie/laravel-multitenancy](https://github.com/spatie/laravel-multitenancy) resuelven el cambio de conexión. Las decisiones de las secciones siguientes no las toman por ti.

## Por qué Contamos usa una sola base

Contamos está pensado para grupos pequeños, como una pareja o quienes comparten casa y parte de su dinero. Los tenants son muchos y diminutos, y una persona puede estar en varios. Esa forma lo decide.

Los equipos de un usuario son una relación muchos a muchos a través de la tabla `team_members`, que además guarda el rol:

```php
public function teams(): BelongsToMany
{
    return $this->belongsToMany(Team::class, 'team_members')
        ->using(Membership::class)
        ->withPivot('role', 'notification_preferences')
        ->withTimestamps()
        ->as('membership');
}
```

Cambiar de equipo es cambiar de URL, no de conexión. Con una base por tenant, los usuarios y sus membresías igual necesitarían una base central, y cada request tocaría dos.

No todo pertenece a un tenant. Las monedas y sus cotizaciones son las mismas para todos los equipos, así que viven en un módulo `Catalog` aparte, sin `team_id`. Los modelos que son de un equipo están en un namespace `Models\Team` (`Account`, `Transaction`, `Transfer`, `Tag`, `RecurringRule`, `BudgetPeriod`), de modo que el namespace ya dice si un modelo necesita filtrarse.

Cada una de esas tablas tiene su clave foránea `team_id` con `cascadeOnDelete()`, o cuelga de una tabla que la tiene. Las transacciones llevan `team_id` aunque su cuenta ya lo implique: una columna más y ningún join en la consulta más frecuente.

## Filtrar cada consulta por el tenant

En Laravel hay dos formas habituales de filtrar por tenant. Una es un global scope, normalmente agregado por un trait `BelongsToTenant`, que suma `where team_id = ?` a cada consulta del modelo. La otra es empezar cada consulta desde el tenant, `$team->transactions()`, y nunca desde `Transaction::query()`.

El global scope te cubre cuando te olvidas. Pero necesita sacar el tenant actual de algún lado, normalmente del request, y los comandos de consola y los jobs en cola no tienen request. Además esconde el filtro: una consulta que se lee como "todas las transacciones" devuelve las de un equipo.

Contamos no usa global scopes. Cada consulta de un tenant empieza desde el equipo, y el equipo se pasa de forma explícita en cada capa.

**Rutas.** Todas las rutas de equipo comparten el prefijo `teams/{team}`, y los modelos anidados usan `scopeBindings()`, así que Laravel resuelve `{transaction}` a través de `$team->transactions()`. El id de una transacción de otro equipo devuelve 404 antes de llegar al controlador.

```php
Route::as('finance.teams.')
    ->prefix('teams/{team}')
    ->middleware([Authenticate::class, ValidateSessionWithWorkOS::class, EnsureTeamMembership::class])
    ->group(function (): void {
        Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])
            ->name('transactions.show')
            ->scopeBindings();
    });
```

**Validación.** Un id que llega en el cuerpo del request no pasa por el route binding, así que cada regla `exists` lleva el equipo:

```php
Rule::exists(Account::class, new Account()->getKeyName())
    ->where(new Account()->team()->getForeignKeyName(), $team->getKey()),
```

Esta es la que se suele olvidar. Sin ella, un usuario puede registrar en su propio equipo una transacción que apunta a la cuenta de otro.

**Actions.** Las actions de dominio reciben el equipo con `->for($team)` y vuelven a consultar a través de él. `CreateTransaction` actualiza el saldo con `$this->team->accounts()->whereKey(...)->firstOrFail()`, dentro de la misma transacción de base de datos, así que una cuenta ajena también falla ahí.

**Comandos de consola.** El comando del resumen mensual recorre `Team::query()` y llama a `$action->for($team)` para cada equipo. Nada depende de un request que no existe.

**Índices.** La unicidad pasa a ser por tenant. Los nombres de etiquetas son únicos en `[team_id, name]`, no en `name`.

El enfoque explícito solo se sostiene si los tests lo verifican, que es la última sección.

## Resolver el tenant desde el request sin revelar nada

Un request puede indicar su tenant con un subdominio, un segmento de la ruta, un header o un "equipo actual" guardado para el usuario. Contamos usa el slug del equipo en la ruta, `/teams/{team}/...`, y guarda `current_team_id` en el usuario solo para saber adónde llevarlo al entrar.

Manda la ruta. `EnsureTeamMembership` verifica que el usuario pertenezca al equipo de la URL y, si no es su equipo actual, lo cambia:

```php
if (! $user->belongsToTeam($team)) {
    abort(Response::HTTP_FORBIDDEN);
}

if ($team->getKey() !== $user->currentTeam?->getKey()) {
    $user->switchTeam($team);
}
```

`switchTeam()` además fija `URL::defaults(['team' => $team->getRouteKey()])`, así que cada llamada a `route()` de ese request completa el equipo sola. Las funcionalidades del plan también siguen a la URL: Pennant resuelve su scope desde el equipo de la ruta, no desde el guardado, y dos pestañas abiertas en dos equipos no se pisan.

### No encontrado y prohibido tienen que verse igual

Si un equipo inexistente responde 404 y el de otra persona responde 403, la diferencia le dice a quien pregunta qué equipos existen. Cuando el identificador es el nombre de la empresa de un cliente en una app de facturación, eso importa.

La solución es buscar el tenant solo entre las membresías del propio usuario. El servidor MCP de Contamos hace exactamente eso en cada llamada a una herramienta:

```php
protected function resolveTeam(User $user, mixed $slug): Team
{
    $team = is_string($slug) && $slug !== ''
        ? $user->teams()->where(new Team()->qualifyColumn('slug'), $slug)->first()
        : null;

    if (! $team instanceof Team) {
        throw new ToolError('Team not found. Call `list_teams` to see the slugs of the teams you belong to.');
    }

    // ... después, el chequeo del plan para el acceso por MCP
}
```

Ninguna consulta puede encontrar el equipo de otro usuario, así que no hay nada que distinguir. El middleware web es menos estricto: 404 para un slug desconocido y 403 para un equipo al que no perteneces. En Contamos eso revela poco, porque los slugs salen del nombre del equipo y el formulario de configuración ya rechaza un slug ocupado. Donde los nombres de los tenants son sensibles, resolvería también las rutas web a través de las membresías y respondería 404 en ambos casos.

## Los roles van en la membresía

Un rol es una propiedad de un usuario en un equipo, no de un usuario, así que vive en el pivote. Contamos tiene tres roles en un enum, y cada uno otorga una lista fija de permisos:

```php
public function permissions(): array
{
    return match ($this) {
        self::Owner => Permission::cases(),
        self::Admin => [
            Permission::CancelInvitation,
            Permission::CreateInvitation,
            Permission::ManageNotifications,
            Permission::RemoveMember,
            Permission::UpdateMember,
            Permission::UpdateTeam,
            Permission::ViewActivity,
        ],
        self::Member => [
            Permission::CancelInvitation,
            Permission::CreateInvitation,
        ],
    };
}
```

Las rutas piden un permiso, no un rol, con un middleware que corre después del chequeo de membresía: `EnsureTeamPermission::using(Permission::DeleteTeam)`. El libro en sí no tiene permisos. Cualquiera en el equipo puede registrar y editar sus movimientos, porque para eso existe el equipo; los permisos cubren la administración del equipo.

**El plan puede cambiar un rol sin reescribirlo.** Elegir roles es una funcionalidad del plan de pago. En el plan gratuito, `Team::effectiveRole()` devuelve Admin para todos menos el owner, y el rol guardado no se toca, así que al volver a Pro se recupera. Todos los chequeos de permisos pasan por ese método.

**El personal de soporte no es un rol del equipo.** El soporte entra por un panel de administración aparte, abierto a una lista de emails definida en la configuración. Ningún equipo tiene un miembro "super admin", y ningún chequeo de permisos tiene que acordarse de él.

## Lo que cuesta agregar multi-tenant después

Agregar `team_id` a una app que ya tiene usuarios no es una migración. Es:

1. Una columna en cada tabla de un tenant, y un backfill que decide de quién es cada fila existente. Eso es una decisión de producto, no un script.
2. Cada índice único reconstruido como compuesto.
3. Revisar cada consulta, cada regla `exists` y cada route binding, porque el código funcionaba sin equipo y sigue funcionando.
4. URLs nuevas, y redirecciones para las viejas.
5. Jobs, tareas programadas, cachés, rutas de archivos y exportaciones, que antes eran globales.
6. Pasar la facturación al tenant, si los planes son por equipo. En Contamos, el modelo `Team` es el billable de Paddle.

Nada de eso es difícil por separado. Junto, toca casi todo el código, y cada lugar que se escapa es una filtración de datos, no un error visible.

En Contamos, las migraciones de `teams` y `team_members` se agregaron el primer día del repositorio, el 29 de agosto de 2026, antes de que el libro tuviera una tabla real. La tabla `transactions` se creó dos días después, ya con `team_id`. Si existe la posibilidad de que un producto se comparta, un equipo por usuario desde el principio cuesta poco y evita la reescritura.

## Probar el límite, no solo la funcionalidad

Como el filtro es explícito, los tests son lo que lo mantiene. Contamos tiene decenas de tests cuyo único trabajo es el límite, y se nota en el nombre: "returns 404 when the transaction belongs to another team", "never lists another team within the window", "rejects an account from another team". El del MCP verifica los dos tipos de fallo en un solo lugar:

```php
it('refuses an unknown team and a team the user is not in alike', function (): void {
    [$user] = mcpMember();
    $stranger = Team::factory()->create();
    subscribeToPro($stranger);

    $message = 'Team not found. Call `list_teams` to see the slugs of the teams you belong to.';

    ProbeServer::actingAs($user)
        ->tool(ProbeTeamTool::class, ['team' => 'no-such-team'])
        ->assertHasErrors([$message]);

    ProbeServer::actingAs($user)
        ->tool(ProbeTeamTool::class, ['team' => $stranger->slug])
        ->assertHasErrors([$message]);
});
```

El equipo ajeno está en el plan de pago, así que si la búsqueda alguna vez recorriera todos los equipos, nada más frenaría la llamada y el test fallaría.

## Resumen

- Usar una sola base con `team_id`, salvo que haga falta aislamiento físico, restaurar tenants por separado o residencia de datos.
- Dejar los datos de referencia compartidos fuera del tenant, y que los modelos de un tenant sean fáciles de reconocer.
- Filtrar las rutas con `scopeBindings()`, filtrar cada regla `exists` y pasar el tenant de forma explícita a actions, jobs y comandos.
- Tomar el tenant de la URL y buscarlo solo entre los equipos del propio usuario, para que un fallo no revele nada.
- Poner los roles en la membresía, chequear permisos y no roles, y dejar al personal de la plataforma fuera de los roles del tenant.
- Agregar el tenant en la primera semana, y escribir tests cuyo único trabajo sea intentar cruzar el límite.

La misma resolución de equipos es la que mantiene a un asistente de IA dentro de los equipos de su usuario, y la conté en [cómo armar un servidor MCP remoto en Laravel](/es/blog/servidor-mcp-remoto-laravel/). Verificar si una consulta puede cruzar de un equipo a otro es además una de las cosas que reviso a mano en [cómo usar Claude Code en un proyecto real](/es/blog/claude-code-en-un-proyecto-real/). El resto del sistema está en el [caso de Contamos](/es/work/contamos/).
