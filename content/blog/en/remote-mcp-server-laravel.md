---
title: "How to build a remote MCP server in Laravel"
description: "A Laravel MCP server that Claude and ChatGPT reach over OAuth, act as the signed-in user, dry-run bulk writes, log every change and can be revoked at once."
published: "2026-10-13"
translations: {"es": "servidor-mcp-remoto-laravel"}
---

A remote MCP server lets an AI assistant such as Claude or ChatGPT call your application's features as tools, over HTTP, on behalf of a real user. Building one in Laravel is mostly straightforward with the official `laravel/mcp` package. The hard part is not the protocol. It is making sure the assistant can do exactly what the user could do in your app, nothing more, and that everything it does is visible and can be stopped.

This is how I built the MCP server for [Contamos](/en/work/contamos/), a shared multi-currency ledger. It exposes 37 tools, and it works on real money records, so each of the decisions below had to hold up.

## What a remote MCP server needs

A local MCP server runs on the user's machine and trusts whoever launched it. A remote one sits on the internet, so it needs what any public API needs, plus a few things specific to an agent calling it:

1. **Authentication with OAuth**, so the assistant acts as a signed-in user, not as a shared API key.
2. **Authorization that matches the app**, meaning the same teams, roles and plan limits as the web.
3. **Tools designed for a model**, with clear descriptions, strict inputs and errors it can relay.
4. **A safety valve for bulk or destructive writes**, such as a dry run and an undo.
5. **An audit trail** that says which changes the assistant made.
6. **Revocation** that takes effect immediately, not when a token expires.

## Registering the server with laravel/mcp

The package gives you a `Server` class and a route macro. The server declares its name, version and instructions, and registers tools and prompts:

```php
use Laravel\Mcp\Facades\Mcp;

Mcp::web('mcp', ContamosServer::class)
    ->middleware([AuthenticateMcpToken::class, ThrottleRequests::using('mcp')])
    ->name('mcp.server');
```

The `instructions` are worth writing carefully. They are the system prompt the assistant reads before calling anything. Contamos uses them to state the rules that are easy for a model to get wrong: amounts are decimal strings and never floats, every team-scoped tool needs an explicit `team`, exchange rates are never invented, and destructive tools require the user's confirmation first.

Rather than listing tools by hand, the server's `boot()` method discovers every concrete `Tool` class in the module's `Tools` folder, so adding a tool is adding a file.

Because it is an HTTP endpoint that clients post JSON-RPC to, the route also has to be excluded from CSRF protection.

## OAuth for MCP: be a resource server, not an identity provider

The [MCP authorization specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) is built on OAuth 2.1. The flow is:

1. The assistant calls `/mcp` without a token.
2. The server answers `401` with a `WWW-Authenticate` header pointing at its protected resource metadata.
3. The assistant reads that metadata, finds the authorization server, and runs the OAuth flow with the user.
4. It comes back with a bearer token, and every call carries it.

You do not have to build the authorization server. Contamos already used WorkOS AuthKit for sign-in, and AuthKit can act as the authorization server for MCP clients. That leaves Contamos with two jobs: publish the metadata and verify the tokens.

The metadata is a small JSON document defined by [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728):

```php
Route::get('.well-known/oauth-protected-resource/{path?}', function () {
    return [
        'resource' => url('/mcp'),
        'authorization_servers' => ['https://'.config('services.workos.authkit_domain')],
        'bearer_methods_supported' => ['header'],
    ];
})->where('path', '.*')->name('mcp.oauth.protected-resource.nested');
```

The route name matters: `laravel/mcp` looks for it when it adds the `WWW-Authenticate` header to a refused request. List a single authorization server; in my experience clients only read the first entry.

### Verifying the token

The middleware in front of `/mcp` accepts only a bearer token in the `Authorization` header, then checks it the way any resource server should:

- the signature, against the authorization server's JSON Web Key Set, cached and refetched once when a token names a key the cache has not seen (keys rotate);
- the issuer is the AuthKit domain;
- the audience includes this server's exact `/mcp` URL, so a token minted for something else is refused;
- the token has an expiry and a subject;
- the subject maps to an active user in the database;
- the grant has not been revoked (more on that below).

Only then does it call `Auth::setUser($user)` for that request. From there on, every tool runs as that user.

The same middleware records the token's client ID and session in Laravel's hidden request `Context`. Those are what the audit trail and revocation use later.

## Authorization: the assistant is the user, not an admin

The rule I held to is that an assistant can reach exactly what its user can reach in the app. No service account, no elevated scope.

Every team-scoped tool goes through one helper that:

- resolves the `team` argument **only among the user's own teams**, so an unknown slug and someone else's team produce the same "Team not found" error and the call never reveals that a team exists;
- checks the team's plan for MCP access and for the specific feature, using the same Pennant feature checks the web routes use;
- checks the user's role on that team for anything that needs a permission;
- turns any refusal into a tool error with a sentence the assistant can repeat to the user, including an upgrade link when a plan limit is the reason.

The tools themselves call the same action classes as the web controllers. `delete_transaction` runs the same `DeleteTransaction` action the browser does, so validation, balance updates and side effects cannot drift between the two.

## Designing tools a model can use well

A tool is an API endpoint whose client is a language model. That changes a few defaults:

```php
#[Name('delete_transaction')]
#[Description('Delete a transaction of the team and revert its effect on the account balance. A transaction that is part of a transfer cannot be deleted here; delete the transfer instead.')]
#[IsDestructive]
class DeleteTransaction extends Tool
{
    public function schema(JsonSchema $schema): array
    {
        return [
            'team' => $schema->string()->description('The slug of the team, as listed by `list_teams`.')->required(),
            'transaction' => $schema->string()->description('The id of the transaction to delete.')->required(),
        ];
    }

    public function handle(Request $request, DeleteTransactionAction $delete): Response|ResponseFactory
    {
        // resolve the team, check permissions, then run the web's action
    }
}
```

- **Descriptions say what the tool will refuse**, not just what it does. The model reads them to plan.
- **Annotations are honest.** Read tools are marked `#[IsReadOnly]`, and deletes `#[IsDestructive]`, so clients can ask the user before running them.
- **Inputs are strict and unambiguous.** Money is a decimal string, [never a float](/en/blog/store-money-in-a-database/). Times need an IANA timezone. An account with several currencies requires an explicit currency rather than a guess.
- **Errors are sentences.** "Team not found. Call `list_teams` to see the slugs of the teams you belong to." is something the model can act on. A stack trace is not.
- **Outputs are structured.** `Response::structured()` returns JSON the model can reason over, rather than prose it has to parse.

## Dry runs and undo for bulk writes

The most useful tool is also the riskiest: `import_transactions`, which takes up to 200 rows from a bank statement. Its safety comes from three rules:

1. **Dry run first.** With `dry_run: true` it validates every row, totals them and lists suspected duplicates, writing nothing. The tool's description and the server instructions both tell the assistant to show that summary to the user before importing.
2. **All or nothing.** If any row fails validation, nothing is written, and each error names the row it belongs to. The import itself runs inside one database transaction.
3. **Undo as a tool.** A successful import returns an `import_id`, and `delete_import` removes exactly those rows. It refuses if any of them was edited since, so it never wipes a correction a person made.

Duplicate detection blocks the import unless the assistant passes `allow_duplicates: true`, which it is told to do only after the user confirms.

## An audit trail that names the assistant

Contamos keeps a team activity log. When a request comes through the MCP server, the server marks it in the hidden `Context`, and a callback on the activity logger adds `via: mcp` plus the client's ID and name to every entry written during that request. The causer is still the user, because it acted as them; the entry just says it was done through an assistant, and which one.

The result is that anyone on the team can open the activity log and see which entries a person made in the app and which were made by that person via an AI assistant, with the assistant named. A client that registered through a metadata document is identified by that document's URL, so its host is a readable name. Because of the way the log batches entries, an import of 200 rows reads as one entry, not 200.

## Revocation that works immediately

Access tokens are short-lived, but "short" is still too long when someone wants to disconnect an assistant now. Contamos keeps its own table of revoked grants. When a user disconnects an assistant from the app:

1. A revoked-grant row is saved for that user and client, timestamped.
2. The authorization is revoked at WorkOS.

The token middleware refuses any token whose client was revoked for that user after the token was issued. Reconnecting later issues new tokens, which the old revocation no longer covers. If the WorkOS call fails, the local row still blocks the assistant; retrying only retries WorkOS.

## Rate limiting

A looping agent can send a lot of requests. The `mcp` rate limiter allows 120 requests per minute per user, falling back to the IP address before a user is known, and answers with a JSON-RPC error the assistant can read and pass on, rather than a bare `429`.

## Summary

Building a remote MCP server in Laravel is less about MCP and more about treating an AI assistant as what it is: a new client acting as one of your users. Use `laravel/mcp` for the protocol, an existing identity provider as the OAuth authorization server, the same actions and checks as your web app for everything else, and give destructive work a dry run, an undo, an audit trail and an off switch. The [Contamos case study](/en/work/contamos/) has the rest of the context.
