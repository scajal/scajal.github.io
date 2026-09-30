---
title: "Inertia vs SPA + API in Laravel: when each is right"
description: "When Laravel with Inertia and React beats a separate SPA and API, when it does not, and how two production apps use both without duplicating logic."
published: "2026-09-30"
translations: {"es": "laravel-inertia-o-spa-con-api"}
---

Inertia vs a separate SPA with an API is mostly a question of who your clients are. If the only client is your own web app, Laravel with Inertia and React gives you a single-page app without building, versioning and securing an API for it. If you also have a mobile app, third-party integrators or an AI assistant calling in, you need an API anyway, and the useful question becomes which parts of the system should sit behind it.

I have made that choice twice in production. [Criptala](/en/work/criptala/), a crypto trading and payments platform, runs its web app on Inertia and React and also exposes versioned JSON APIs for a mobile app and for public integrations. [Contamos](/en/work/contamos/), a shared multi-currency ledger, is Inertia and React only, with an MCP server as its second client. Both keep one copy of the business logic. This post is how.

## What Inertia actually is

Inertia is not a framework. It is a protocol between a server-side router and a client-side renderer. A Laravel controller returns `Inertia::render('page/name', $props)` instead of a Blade view. On the first request the browser gets HTML; after that, links and forms make XHR requests, and the server answers with JSON naming the page component and its props. React swaps the page without a full reload.

What you give up is the API layer between your frontend and your backend, and that is the point:

- **Routing stays in Laravel.** There is no client router to keep in sync with server routes.
- **Auth is the session.** No tokens in local storage, no refresh flow, no CORS. Middleware, policies and `auth()` work as they do in any Laravel app.
- **Validation errors come back on their own.** A failed form request redirects back, and Inertia puts the errors into the page's props. The form shows them without an error-mapping layer.
- **State lives on the server.** A page's props are whatever the controller decided the user should see, computed with the same queries and policies as everything else.

## Why I default to Inertia for the web app

The expensive part of a separate SPA is rarely the React code. It is the second application you end up running: a client-side copy of your routes, your permission rules, your validation, and a cache of server state that has to be invalidated correctly. Each of those is a place where the frontend and the backend can disagree, and in a system that moves money, a disagreement is a bug a user will find before you do.

With Inertia, the server stays the only source of truth, and React is a rendering layer over it. That is the property I care about most, and it holds on both projects.

### Shared props carry what every page needs

Contamos shares a small set of props with every page from one middleware: the signed-in user, the locale, the colour scheme, onboarding progress, and what the user may do on the current team.

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),

        'locale' => fn (): string => App::currentLocale(),

        // What the user may do on their current team, so the
        // layout and the pages gate actions the same way the
        // server does.
        'permissions' => fn (): array => $this->permissions($request),

        'user' => Inertia::always($user),
    ];
}
```

The permissions prop is the piece I would miss most in a SPA. The server computes it with the same rules it enforces, so a button the user may not press is hidden, and a request the user may not make is still refused. The two cannot drift apart because there is only one definition.

### Typed routes with Wayfinder

A common objection to Inertia is that the frontend builds URLs from strings. Both projects use [Laravel Wayfinder](https://github.com/laravel/wayfinder), which generates TypeScript functions from your routes and controllers. A form in Contamos reads like this:

```tsx
import teams from "@/routes/identity/teams";

<Form {...teams.store.form()} disableWhileProcessing>
    {({ errors, processing }) => (
        // fields, with errors.name shown next to the input
    )}
</Form>
```

`teams.store.form()` gives the form its method and URL. Rename the route or change its parameters and the TypeScript build fails. That is the typed contract a SPA gets from an OpenAPI spec, without writing or maintaining the spec.

### Flash messages as a server-to-client channel

Inertia's flash data turns out to be a clean way for the server to tell the client something happened. In Contamos, a write that can be undone flashes a toast with an undo action, and the client only renders it. The server decides what can be undone and how; the React code does not know.

### SSR when first paint matters

Contamos renders pages on the server with Inertia's SSR, so public pages arrive as complete HTML for crawlers and for the first paint. Criptala keeps SSR behind an environment flag, off by default. SSR is optional with Inertia, and you can turn it on later without rewriting pages.

## When a separate SPA and API is right

Inertia is the wrong tool when the web app is one client among several, and the others are yours to support:

- **A native mobile app.** It cannot use a session-cookie protocol built for a browser, and it needs versioning, because old app builds stay installed for months.
- **Third parties.** Partners integrating with you need a documented, stable contract that outlives your UI redesigns.
- **A separate frontend team** that ships on its own release cycle and wants to own the client end to end.
- **Heavy client-side state** such as offline-first editing or a real-time trading screen, where most of the state genuinely belongs to the client.

What none of those require is putting your own web app behind the same API. That is the choice I keep making.

## Inertia and an API in the same Laravel app

Criptala has both. The web app is Inertia and React. Next to it, the same Laravel application serves a versioned mobile API for the React Native app, a versioned public API, and webhook endpoints. They are separate route files with their own middleware. The mobile API, for example, has its own authentication and request handling, none of which belongs in the web app's session flow.

What keeps this from turning into two backends is that the controllers are thin and the domain is shared. The rate calculation for a trade is one action class. The web checkout, the mobile quote endpoint and the public API all call it, and each wraps the result in its own shape: Inertia props for the web, JSON for the mobile and public APIs.

```
Inertia controller  ─┐
Mobile v1 controller ├──▶  CalculateRatesAction  ──▶  models, rules, database
Public v1 controller ─┘
```

The API layer is then what it should be: a translation of the domain into a stable external contract, versioned for clients you do not control, rather than a private pipe your own UI depends on.

## A second client without an API: MCP

Contamos has no REST API, but it does have a second client. Its [remote MCP server](/en/blog/remote-mcp-server-laravel/) lets Claude or ChatGPT read and write a user's ledger, and it follows the same rule. The MCP tool that deletes a transaction calls the same action as the web controller:

```php
// Web: TransactionController::destroy
$deleteTransaction->for($team)->using($transaction);
Toast::make(trans('Deleted'))->flash();
return back();

// MCP: DeleteTransaction tool
$deleteTransaction->for($team)->using($transaction);
return Response::structured(['deleted' => true, 'id' => $transaction->getKey()]);
```

The action reverts the balance, records the activity and enforces the rules. The controller answers with a redirect and a toast; the tool answers with structured data. Neither re-implements anything. If I add a mobile app to Contamos one day, it gets a third set of thin controllers over the same actions, not a rewrite of the web app.

## Inertia vs SPA: a short decision guide

| Your situation | What I would build |
|---|---|
| One web app, one team, Laravel backend | Inertia + React |
| Web app plus a native mobile app | Inertia for web, a versioned API for mobile, shared actions |
| Partners or public integrations | Inertia for web, a public API with its own versioning |
| AI assistants acting for users | Inertia for web, an MCP server over the same actions |
| Separate frontend team, independent releases | SPA + API |
| Offline-first or mostly client-side state | SPA + API, possibly with sync |

## The costs of Inertia worth knowing

It is not free. The frontend is coupled to Laravel: moving the UI to another backend later means rewriting the data layer. Page props are fetched per visit, so a page that polls or streams needs its own endpoints or Inertia's partial reloads used carefully. Every prop you pass is visible in the page source, so props must be shaped for the user, never a dump of a model. And a mobile team cannot reuse any of it; they get the API you build for them.

None of these have hurt either project, because the decision was never "Inertia instead of an API". It was Inertia for the web app, an API or MCP server where a real external client exists, and one set of actions under all of them.

## Conclusion

For a Laravel app whose main client is its own web UI, Inertia and React give you a single-page app with server-owned state, session auth, automatic validation errors and typed routes, and no private API to maintain. Add an API when a client appears that cannot use the session: a mobile app, a partner, an assistant. Keep the business logic in actions that every entry point calls, and the choice between Inertia and an API stops being all-or-nothing.
