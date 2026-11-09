---
title: "Multi-tenancy in Laravel: a team_id column or a database per tenant"
description: "team_id in one database or a database per tenant in Laravel: the trade-offs, scoping every query, resolving the tenant safely, roles, and adding it later."
published: "2026-11-12"
translations: {"es": "multi-tenant-en-laravel"}
---

For most Laravel SaaS applications, the right way to do multi-tenancy is one database with a `team_id` (or `tenant_id`) column on every table that belongs to a tenant. A database or schema per tenant is worth its cost when isolation is a contractual requirement, when you have a few large tenants rather than many small ones, or when each tenant's data has to live in a particular region. Either way, the column is the easy part. The work is making every query, validation rule and background job go through the tenant, and making a request for someone else's data fail the same way as a request for data that does not exist.

Below are both models, then how I applied the shared one in Contamos, a shared multi-currency ledger where the tenant is a team. The hosted service is closed, but the [code is open source](https://github.com/scajal/contamos), so everything here can be checked.

## The two models

| | One database, `team_id` column | Database (or schema) per tenant |
|---|---|---|
| Isolation | Logical: a missing `WHERE` leaks data | Physical: a query cannot reach another tenant |
| Migrations | Run once | Run once per tenant, and can fail halfway |
| Reports across tenants | One query | One query per tenant, or a separate warehouse |
| Users in several tenants | A pivot table | A central database for users anyway |
| Restoring one tenant | Hard, rows are mixed | Restore one database |
| Deleting one tenant | Cascading deletes from one row | Drop the database |
| Cost per tenant | Close to zero | A database, its connections and its backups |
| Noisy neighbours | Share every index and lock | Contained, if databases are on separate servers |

In MySQL, a schema is a database. In PostgreSQL, a schema per tenant sits in between: separate tables, one connection pool, migrations still run once per tenant.

Packages such as [stancl/tenancy](https://tenancyforlaravel.com/) and [spatie/laravel-multitenancy](https://github.com/spatie/laravel-multitenancy) handle the connection switching. They do not make the decisions below for you.

## Why Contamos uses one database

Contamos is built for small groups, such as a couple or flatmates sharing part of their money. Tenants are many and tiny, and one person can belong to several. That shape decides it.

A user's teams are a many-to-many relation through a `team_members` table, which also stores the role:

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

Switching teams is a change of URL, not of database connection. With a database per tenant, users and memberships would still need a central database, and every request would touch two.

Not everything belongs to a tenant. Currencies and their exchange rates are shared by every team, so they live in a separate `Catalog` module with no `team_id`. The models a team owns sit in a `Models\Team` namespace (`Account`, `Transaction`, `Transfer`, `Tag`, `RecurringRule`, `BudgetPeriod`), so a model's namespace tells you whether it needs scoping.

Each of those tables has a `team_id` foreign key with `cascadeOnDelete()`, or hangs off a table that does. Transactions carry `team_id` even though their account implies it: one column, and no join on the most frequent query.

## Scope every query through the tenant

There are two common ways to scope queries in Laravel. One is a global scope, usually added by a `BelongsToTenant` trait, that appends `where team_id = ?` to every query on the model. The other is to start every query from the tenant, `$team->transactions()`, never from `Transaction::query()`.

A global scope protects you when you forget. But it needs a current tenant from somewhere, usually the request, and commands and queued jobs have none. It also hides the filter: a query that reads as "all transactions" returns one team's.

Contamos has no global scopes. Every tenant query starts from the team, and the team is passed in explicitly at each layer.

**Routes.** All team routes share a `teams/{team}` prefix, and nested models use `scopeBindings()`, so Laravel resolves `{transaction}` through `$team->transactions()`. A transaction id from another team returns 404 before the controller runs.

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

**Validation.** An id in the request body does not go through route binding, so every `exists` rule carries the team:

```php
Rule::exists(Account::class, new Account()->getKeyName())
    ->where(new Account()->team()->getForeignKeyName(), $team->getKey()),
```

This is the one people miss. Without it, a user can post a transaction to their own team that points at someone else's account.

**Actions.** Domain actions take the team with `->for($team)` and query through it again. `CreateTransaction` updates the balance with `$this->team->accounts()->whereKey(...)->firstOrFail()`, inside the same database transaction, so a foreign account fails there too.

**Console commands.** The monthly summary command loops over `Team::query()` and calls `$action->for($team)` for each one. Nothing depends on a request that is not there.

**Indexes.** Uniqueness becomes per tenant. Tag names are unique on `[team_id, name]`, not on `name`.

The explicit approach only holds if tests check it, which is the last section.

## Resolve the tenant from the request without leaking it

A request can name its tenant by subdomain, path segment, header, or a "current team" stored for the user. Contamos uses the team's slug in the path, `/teams/{team}/...`, and keeps `current_team_id` on the user only to know where to land.

The route wins. `EnsureTeamMembership` checks that the user belongs to the team in the URL and, if it is not their current team, switches to it:

```php
if (! $user->belongsToTeam($team)) {
    abort(Response::HTTP_FORBIDDEN);
}

if ($team->getKey() !== $user->currentTeam?->getKey()) {
    $user->switchTeam($team);
}
```

`switchTeam()` also sets `URL::defaults(['team' => $team->getRouteKey()])`, so every `route()` call in that request fills in the team. Plan features follow the URL too: Pennant resolves its scope from the route team, not the stored one, so two tabs open on two teams do not step on each other.

### Not found and forbidden should look the same

If an unknown team answers 404 and someone else's answers 403, the difference tells a caller which teams exist. When the identifier is a client's company name in an invoicing app, that matters.

The fix is to look the tenant up only among the user's own memberships. Contamos' MCP server does exactly that for every tool call:

```php
protected function resolveTeam(User $user, mixed $slug): Team
{
    $team = is_string($slug) && $slug !== ''
        ? $user->teams()->where(new Team()->qualifyColumn('slug'), $slug)->first()
        : null;

    if (! $team instanceof Team) {
        throw new ToolError('Team not found. Call `list_teams` to see the slugs of the teams you belong to.');
    }

    // ... then the plan check for MCP access
}
```

No query can find another user's team, so there is nothing to tell apart. The web middleware is less strict: 404 for an unknown slug, 403 for a team you are not in. In Contamos that reveals little, since slugs come from team names and the team settings form already refuses a taken slug. Where tenant names are sensitive, I would resolve web routes through memberships too and answer 404 for both.

## Roles belong to the membership

A role is a property of a user on a team, not of a user, so it lives on the pivot. Contamos has three roles in an enum, and each grants a fixed list of permissions:

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

Routes ask for a permission, not a role, with a middleware that runs after the membership check: `EnsureTeamPermission::using(Permission::DeleteTeam)`. The ledger has no permission gates. Anyone on a team can record and edit its movements, since that is what the team is for; permissions cover running the team.

**The plan can bend a role without rewriting it.** Choosing roles is a paid feature. On the free plan, `Team::effectiveRole()` returns Admin for everyone but the owner, and the stored role stays untouched, so upgrading restores it. Every permission check goes through that method.

**Platform staff are not a team role.** Support goes through a separate admin panel, open to an allowlist of email addresses in configuration. No team has a "super admin" member, and no permission check has to remember one.

## What it costs to add tenancy later

Adding a `team_id` to an app that already has users is not one migration. It is:

1. A column on every tenant-owned table, and a backfill that decides who owns each existing row. That is a product decision, not a script.
2. Every unique index rebuilt as composite.
3. Every query, `exists` rule and route binding reviewed, because the code ran fine without a team and still does.
4. New URLs, and redirects for the old ones.
5. Jobs, scheduled commands, caches, file paths and exports, all of which used to be global.
6. Billing moved to the tenant, if plans are per team. In Contamos the `Team` model is the Paddle billable.

None of it is hard alone. Together it touches most of the codebase, and every missed spot is a data leak, not a crash.

In Contamos, the `teams` and `team_members` migrations were added on the repository's first day, 29 August 2026, before the ledger had a real table. The `transactions` table was created two days later with `team_id` already in it. If a product might ever be shared, a team per user from the start costs little and saves the rewrite.

## Test the boundary, not only the feature

Since the scoping is explicit, the tests are what keep it there. Contamos has dozens of tests whose only job is the boundary, named for it: "returns 404 when the transaction belongs to another team", "never lists another team within the window", "rejects an account from another team". The MCP one checks both kinds of miss in one place:

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

The stranger's team is on the paid plan, so if the lookup ever searched every team, nothing else would stop the call and the test would fail.

## Summary

- Use one database with a `team_id` unless you need physical isolation, per-tenant restores or data residency.
- Keep shared reference data outside the tenant, and make tenant-owned models easy to recognise.
- Scope routes with `scopeBindings()`, scope every `exists` rule, and pass the tenant explicitly to actions, jobs and commands.
- Take the tenant from the URL and look it up only among the user's own teams, so a miss reveals nothing.
- Put roles on the membership, check permissions rather than roles, and keep platform staff out of tenant roles.
- Add the tenant in the first week, and write tests whose only job is to cross the boundary.

The same team resolution is what keeps an AI assistant inside the user's own teams, which I covered in [how to build a remote MCP server in Laravel](/en/blog/remote-mcp-server-laravel/). Checking whether a query can cross from one team into another is also one of the things I review by hand in [Claude Code on a real codebase](/en/blog/claude-code-on-a-real-codebase/). The rest of the system is in the [Contamos case study](/en/work/contamos/).
