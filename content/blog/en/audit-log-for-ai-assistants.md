---
title: "An audit log for AI assistants in Laravel"
description: "Record when an AI assistant acted for a user in Laravel: keep the user as causer, name the assistant with hidden Context, batch bulk writes, skip prompts."
published: "2026-11-19"
translations: {"es": "registro-de-actividad-para-asistentes-de-ia"}
---

To audit what an AI assistant does on a user's behalf, keep the user as the one who made the change and record the assistant next to it: that the change came through an assistant, and which one. Attach that at the logging layer, from request-wide context, so no write path can forget it. Then group bulk writes into one entry, show the assistant's name wherever the log is read, and leave the prompts out.

In [how to build a remote MCP server in Laravel](/en/blog/remote-mcp-server-laravel/) this got one short section. This post is the implementation behind it, from [Contamos](/en/work/contamos/), a shared multi-currency ledger whose code is [open source on GitHub](https://github.com/scajal/contamos) under the MIT license. It uses `spatie/laravel-activitylog`, but the ideas don't depend on it.

## Why "the user did it" is no longer enough

A team activity log answers what changed, who changed it, and when. Contamos already had more than one kind of "who": its presenter tells apart a team member, the platform's support staff, a deleted account, and the system itself.

An assistant breaks the simple version. If a teammate sees that Ana deleted forty transactions, the next question is whether Ana did it or her assistant did it after misreading a statement. The first is a conversation about a decision. The second is about a tool that needs a tighter prompt, a dry run, or disconnecting.

Making the assistant the causer would be wrong the other way. It has no seat on the team and no role; it acted with the user's permissions, after the user authorized it. So the causer stays the user, and the entry carries a second fact: through which channel, and which client.

## What an entry carries

An entry written during an MCP call gets three extra properties. The causer column is unchanged.

```php
public static function activityProperties(): array
{
    if (! self::active()) {
        return [];
    }

    return [
        'via' => 'mcp',
        'client_id' => self::clientId(),
        'client_name' => self::clientName(),
    ];
}
```

`client_id` is whatever the OAuth token names as its client. A client that registered with a metadata document is identified by that document's URL, such as `https://claude.ai/oauth/mcp-oauth-client-metadata`, so its readable name is the host without `www.`: `claude.ai`. A client known only by an opaque ID, like `client_01ABC`, is named by that ID. Less friendly, but true.

The name is stored when the entry is written, not looked up on read. The list of connected assistants comes from WorkOS and loses an assistant once it is disconnected, so a name resolved later would go blank right when someone wants to know what it did.

## Carry it through the request with hidden Context

Three places each know a part of this. The token middleware knows the client. The MCP server knows the request is an MCP call. The activity logger writes the entry. In between are action classes such as `CreateTransaction`, which the web controllers call too.

Passing a `$viaAssistant` flag through those actions would teach every one of them about a channel they shouldn't care about, and any action that forgot to forward it would write an unmarked entry. Laravel's [Context](https://laravel.com/docs/context) is the better tool: values added to it live for the request and anything can read them. Contamos wraps it in a small helper:

```php
class McpContext
{
    protected const string VIA = 'mcp.via';
    protected const string CLIENT_ID = 'mcp.client_id';
    protected const string SESSION_ID = 'mcp.session_id';

    public static function enter(): void
    {
        Context::addHidden(self::VIA, true);
    }

    public static function identify(?string $clientId, ?string $sessionId): void
    {
        Context::addHidden(self::CLIENT_ID, $clientId);
        Context::addHidden(self::SESSION_ID, $sessionId);
    }

    public static function active(): bool
    {
        return Context::getHidden(self::VIA) === true;
    }
}
```

The middleware calls `identify($claims['client_id'], $claims['sid'])` right after `Auth::setUser($user)`, and the server's `boot()` calls `enter()`.

It uses the hidden variant on purpose: Laravel appends ordinary context to every application log line, and hidden context stays out of them, though both travel with queued jobs dispatched during the request. Client and session identifiers don't belong on every log line.

## Stamp every entry in one callback

With the context in place, one callback on the activity logger does the marking, registered in the identity module's service provider:

```php
LogActivityAction::clearBeforeLoggingCallbacks();

PendingActivityLog::beforeLogging(function (ActivityContract $activity): void {
    if ($activity instanceof Model) {
        $activity->setAttribute('batch_uuid', TeamActivity::uuid());
    }

    // The causer stays the user it acted as.
    if ($activity instanceof Activity && ($properties = McpContext::activityProperties()) !== []) {
        $activity->properties = collect($activity->properties ?? [])->merge($properties);
    }
});
```

Entries are written two ways: from model events, through a `LogsTeamActivity` trait on the team's models, and explicitly for the few changes a model event cannot see, such as a role change. Both pass through this callback, so a tool added next month is marked without doing anything. Clearing the callbacks first stops repeated boots, as in the test suite, from stacking them. The tests pin both sides: a tool run through the MCP server writes `via: mcp` and `client_name: claude.ai`, and a write from the web has no `via` key at all.

## Batching: one thing somebody did, one entry

The `import_transactions` tool can create up to 200 transactions from a bank statement, each with its own entry. Two hundred "created" lines would bury everything else, so entries written by one action share a `batch_uuid`, set by the callback above from this helper:

```php
public static function start(): void
{
    if (self::$depth === 0) {
        self::$uuid = (string) Str::uuid();
    }

    self::$depth++;
}

public static function within(Closure $callback): mixed
{
    self::start();

    try {
        return $callback();
    } finally {
        self::end();
    }
}
```

The depth counter is what makes it work. The import opens a batch and creates each row through `CreateTransactionEntry`, which opens one of its own. Only the outermost batch generates an ID, so the whole import shares one UUID, and the `finally` closes the batch even if the import throws.

Each change is still its own row, so no detail is lost. The timeline merges consecutive rows with the same `batch_uuid` into one entry with a "+N more" note, and opening it shows every row.

The batch ID has a second job: the import returns it to the assistant as `import_id`, and `delete_import` reads that batch to decide what to undo, refusing if a person has edited any of the rows since. I covered how that works in [undo instead of “Are you sure?”](/en/blog/undo-instead-of-confirm-dialogs/). A log complete enough to drive an undo is one you can trust as a record.

## Show it where the team reads the log

On the activity page, an entry that came through an assistant gets a badge next to the event:

```tsx
export const AssistantBadge = ({ assistant }: Props) => {
    const t = useLaravelReactI18n().t;

    if (!assistant) {
        return null;
    }

    return (
        <Badge variant="outline">
            <SparklesIcon data-icon="inline-start" />
            {assistant.name ? t("via :name", { name: assistant.name }) : t("via an AI assistant")}
        </Badge>
    );
};
```

The controller sends `assistant` as `null` for anything done in the app and as `{ name }` for anything done through MCP, so the raw properties never reach the browser. The badge shows in the timeline and in the detail sheet.

Owners and admins can open the log, on the Pro plan. Recording itself is never gated: a Free team sees the page locked, but its history keeps being written, and entries are kept for 365 days either way.

## Give the log back to the assistant

The same log is exposed to assistants as two read-only tools. `list_activity` returns the timeline 50 entries at a time with a cursor, with the page's filters: kind of record, member, and dates. `get_activity` returns one entry with the rest of its batch and the old and new value of each field.

Both go through the same gate as the page, permission first and plan second, so a member without access is never offered an upgrade they couldn't ask for. Each entry includes `via`, `client_id` and `client_name`, so a user can ask their assistant what changed through an assistant last week and what was done by hand. The page and the tools share one presenter trait, so their answers can't drift apart.

## What to record, and what to leave out

The log records the event, the record it concerns, and the fields that changed, before and after. Fields come only from an explicit list on each model. For a transaction: account, amount, category, currency, description, date, exchange rate and type. The trait's contract names what never goes in: "Timestamps, keys, balances and internal columns never belong here."

On the assistant's side it records the channel and the client. Not the prompt, the conversation, the raw tool arguments, the model's reasoning, the token or the session ID.

The reason is who reads the log. A prompt is something one person told their own tool, and it might hold a pasted statement, other people's names, or notes never meant for the team. The team's admins read the log, and it should say what changed in the shared ledger, which they could see in the app anyway.

That doesn't make it free of personal data: an invitation entry records the invitee's email, because the team sees it on the invitation. The rule isn't "no PII". It is that the log never holds more than the team could already see.

## Revocation and the log

When a user disconnects an assistant, Contamos saves a revoked-grant row for that user and client, then revokes the authorization at WorkOS. The token middleware then refuses any token for that client issued before the revocation, before a tool runs. Nothing more can be written through that grant, so its trail in the log simply stops.

The history stays. Entries are not rewritten or deleted, and because the name was stored at write time, they still read "via claude.ai" once the assistant is gone from the user's list.

What the team log doesn't show is the disconnection itself. An assistant is connected to a person's account, not to a team, and disconnecting it cuts it off from every team at once, so it is an account event. If your teams need to see when access ended, that's the entry to add.

## Summary

- Keep the user as the causer. The assistant acted with their permissions, so the responsibility stays theirs.
- Record the channel and the client on each entry, and store a readable name at write time so it survives disconnection.
- Carry that through the request with Laravel's hidden `Context`, not with flags passed through shared actions.
- Mark entries in one logger callback so no write path can skip it.
- Group what one action wrote under a batch ID that nested actions join, and reuse that ID for undo.
- Show the assistant in the UI, and give the log back to assistants as read-only tools behind the same checks.
- Leave prompts, conversations, tokens and session IDs out. The log should hold what the team can already see.

The rest of the server, from OAuth to dry runs, is in [the remote MCP server post](/en/blog/remote-mcp-server-laravel/). The product around it is in the [Contamos case study](/en/work/contamos/).
