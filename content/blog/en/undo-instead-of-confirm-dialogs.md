---
title: "Undo instead of “Are you sure?”: server-side undo in Laravel and Inertia"
description: "Why confirmation dialogs get clicked through, and how to build undo on the server with Laravel and Inertia: a flashed toast, an exact reversal, and tests."
published: "2026-11-10"
translations: {"es": "deshacer-en-lugar-de-confirmar"}
---

A confirmation dialog asks people to be careful before they act. Undo lets them fix things after. For the actions people repeat all day, undo is the better safety net: offer it in the message that reports the write, let the server decide what can be undone and how, and reverse the write exactly, balances included. Keep confirmation for the few things that really cannot be taken back, and make those dialogs specific.

This post is how [Contamos](/en/work/contamos/), a shared multi-currency ledger I built with Laravel, Inertia and React, does it. The [code is open source](https://github.com/scajal/contamos), and the snippets below come from it, trimmed.

## Why “Are you sure?” stops working

A dialog that appears every time becomes part of the gesture. People learn where the button is, not what the question says. After the hundredth “Are you sure?”, the click on Continue is as automatic as the click that opened the dialog, so the one time it should stop someone, it does not. That is habituation, and no wording fixes it, because the problem is the repetition.

It also asks at the wrong moment. Most mistakes in a ledger are a wrong amount, account or day, and people notice them when they see the result, not before. A dialog shown before the write cannot catch an error the person has not seen yet.

Undo turns this around. The correct path costs nothing extra, the wrong one costs a single tap, and the offer appears while the person is looking at what just happened.

## Where the undo goes

The most common write in Contamos is recording a movement, often from a phone, right after paying for something. After an income, an expense, a transfer or a repeating entry is recorded, the “Saved” toast carries an Undo button. The controller comment states the trade: “so a wrong tap costs one tap rather than a trip through the row's menu and a confirmation.”

So the undo sits on the write, not on the delete. Deleting a row still asks first, because a delete in Contamos is permanent.

## The server decides what can be undone

The toast is a small server-side object. Besides the message, it can carry one action: a label, a URL and an HTTP method.

```php
/**
 * Offer a single action alongside the message. A write the user
 * can take back says so here rather than behind a confirmation
 * they would have had to read before acting.
 */
public function action(string $label, string $url, string $method = 'delete'): self
{
    $this->action = ['label' => $label, 'method' => $method, 'url' => $url];

    return $this;
}
```

`flash()` hands the toast to `Inertia::flash()`. The controller that records a movement decides whether to attach the action, and where it points:

```php
$toast = Toast::make(trans('Saved'));

if ($rule instanceof RecurringRule) {
    $toast->action(trans('Undo'), route('finance.teams.recurring-rules.undo', [
        'team' => $team->getRouteKey(),
        'recurringRule' => $rule->getRouteKey(),
    ]));
} elseif ($transaction instanceof Transaction && $this->isVisible($team, $transaction)) {
    $toast->action(trans('Undo'), route('finance.teams.transactions.destroy', [
        'team' => $team->getRouteKey(),
        'transaction' => $transaction->getRouteKey(),
    ]));
}

$toast->flash();

return back();
```

`TransferController::store` does the same with `finance.teams.transfers.destroy`, which takes the transfer back with both of its legs.

For transactions and transfers, the undo URL is the ordinary delete route. There is no undo endpoint and no undo token, so the undo passes the same checks as any delete: team membership, scoped route bindings and, for a transaction, the plan's history window. Only the repeating entry has its own `undo` route, because for a recurring rule, undoing and deleting mean different things.

## The client only renders it

On the React side, one listener turns any flashed toast into a notification. It does not know what a transaction is.

```tsx
router.on("flash", (event) => {
    const flashed = event.detail.flash.toast;

    if (!flashed) {
        return;
    }

    const action = flashed.action;

    const id: string = toast.add({
        actionProps: action
            ? {
                  children: action.label,
                  onClick: () => {
                      router.visit(action.url, { method: action.method, preserveScroll: true });

                      // The offer is spent, and the write it undid
                      // announces itself with a toast of its own.
                      toast.close(id);
                  },
              }
            : undefined,
        description: flashed.message,
    });
});
```

The flash travels with the redirect that answers the write, so the client never asks whether something can be undone; the answer arrives in the same response. Adding undo to another write is a server change only. I mentioned this channel in [Laravel Inertia vs a SPA with an API](/en/blog/laravel-inertia-vs-spa-api/); this is what sits behind it.

## Reversing the write exactly

In a ledger, undoing a write is more than removing a row. Contamos caches a balance per account and currency, and the undo has to put it back exactly. Deleting a transaction applies the inverse of its type's sign with the same amount, in SQL, inside the same database transaction as the delete:

```php
DB::transaction(function () use ($transaction): void {
    $this->team
        ?->accounts()
        ->whereKey($transaction->account_id)
        ->firstOrFail()
        ->currencies()
        ->updateExistingPivot($transaction->currency_id, [
            'balance' => DB::raw("balance {$transaction->type->inverseSign()} {$transaction->amount}"),
        ]);

    $transaction->delete();
});
```

An expense is reverted with `+`, an income with `-`. Deleting a transfer does the same for every transaction it owns, both legs and any fee. The reasoning behind these rules is in [how to design a multi-currency ledger](/en/blog/multi-currency-ledger-design/).

A repeating entry is the interesting case. Recording one creates a recurring rule and, when it is already due, its first occurrence. Deleting a rule from the rules page keeps what it generated as ordinary transactions, because that is history. Undoing an entry just recorded should leave nothing behind. Both use the same action, and the `undo` route adds one flag:

```php
$deleteRecurringRule->for($team)->withGeneratedTransactions()->using($recurringRule);
```

With the flag set, the action deletes each generated transaction through `DeleteTransaction`, reverting each balance, and then deletes the rule. It runs inside `TeamActivity::within`, so the whole undo reads as one entry in the team's activity log. Nor does the undo erase history: the log keeps both the creation and the deletion.

## How long the undo is offered

As long as the toast is on screen. Contamos sets no timeout, so Base UI's default applies: five seconds, paused while the pointer is over the toasts or the window loses focus. Clicking the button closes the toast, so the offer cannot be taken twice.

The server has no clock on it. Since the undo is the ordinary delete route, the server stores no pending undos, runs no job to expire them and needs no soft-delete column. The window is a UI decision; what can be undone, and how, is a server decision. Once the toast is gone, the way back is the normal delete, with its confirmation.

In one case the server holds the offer back. On the free plan, the list shows the last six months, and an older movement is not reachable by URL: its delete route answers 404. Recording one is still allowed, so the controller checks `isVisible` and flashes “Saved” without a button rather than offer an undo that would fail.

## What cannot be undone, and why

- **Deletes.** Contamos deletes rows for real; there are no soft deletes. So deleting a movement still opens a confirmation, and that dialog is built to be read: it names the amount, the account and the date of the row. The component's comment says why: “Naming the row is the point of the dialog: a movement cannot be brought back, so the reader has to recognise which one they are about to lose.”
- **Edits.** Saving an edit flashes “Saved” with no action. An undo would need the previous values restored and the balances moved again. The activity log records the old values, but nothing restores from it.
- **Deleting a team or a user account.** The rare, final actions get the most friction. Deleting your account asks you to type your email address. Deleting a team asks for its handle, and the dialog states the consequence: “This cannot be undone. Every member loses access to the team's accounts and transactions.”

That gives a simple split. Frequent and reversible gets undo. Rare and permanent gets a confirmation, specific enough that people read it.

## Undo for an AI client

Contamos also has a [remote MCP server](/en/blog/remote-mcp-server-laravel/), so Claude or ChatGPT can record movements on a user's behalf, including whole bank statements through `import_transactions`. A successful import returns an `import_id`, and `delete_import` undoes the entire import at once.

The `import_id` is not a new concept. The import runs inside `TeamActivity::within`, which opens one activity batch, and every transaction it creates logs a `created` entry with that batch's UUID. Undoing the import means finding those entries and checking that nobody has touched the rows since:

```php
$created = $team->activities()
    ->where('batch_uuid', $importId)
    ->where('subject_type', new Transaction()->getMorphClass())
    ->where('event', 'created')
    ->get();

// A transaction changed after the import was edited by
// somebody, and deleting it would wipe that work.
$edited = $team->activities()
    ->where('subject_type', new Transaction()->getMorphClass())
    ->whereIn('subject_id', $ids)
    ->where('event', 'updated')
    ->where(new Activity()->getKeyName(), '>', $created->max(new Activity()->getKeyName()))
    ->pluck('subject_id')
    // ...
```

If any row was edited, nothing is deleted and the error lists the edited IDs. Otherwise the tool deletes the transactions through the same `DeleteTransaction` action, in one database transaction, reverting every balance.

The web undo can skip that check; this one cannot. The toast lasts seconds, but `delete_import` has no time limit of its own, so an assistant can call it days later, after a person has fixed a category by hand. Instead of a timer, the server reads the activity log and refuses rather than wipe a correction.

The assistant side still confirms. The server's instructions tell the model to confirm with the user before any destructive tool, and `delete_import` is marked destructive. Here the confirmation does a different job: the person is not the one pressing the button, so asking is how they learn what the assistant is about to do.

## Testing undo

The tests treat the offer and its effect as separate things. A helper in `tests/Pest.php`, `flashedToastAction()`, reads the action from Inertia's flashed session data. One test asserts the exact shape of the offer: the label, the `delete` method and the URL of the transaction just created. Another follows the URL the server flashed, instead of building the route itself, and checks that the entry is gone:

```php
it('removes the entry when the undo the toast offers is taken', function (): void {
    // ... a member with an account in one currency

    $this->post(route('finance.teams.transactions.store', ['team' => $team->getRouteKey()]), transactionPayload([
        // ...
    ]));

    $undo = flashedToastAction();

    $this->delete($undo['url'])->assertRedirect();

    expect(Transaction::query()->count())->toBe(0);
});
```

The rest cover the edges. A movement dated two years back is saved with no action at all. Undoing a repeating entry removes the rule and its transaction, and the balance returns to zero. The recurring rule's `undo` route takes an account from 125 back to 100 after removing a generated income of 25. On the MCP side, `delete_import` removes exactly the imported rows and leaves an unrelated one in place, refuses when one of them was edited, and reports “Import not found.” for another team's import.

## Summary

- Confirmation dialogs get clicked through by habit, and they ask before the person can see the mistake.
- Put undo on the frequent write, in the toast that reports it, and let the server attach it; the client renders what it is sent.
- Point the undo at the existing delete route, so it passes the same checks and needs no tokens or expiry jobs.
- Reverse the write exactly: invert the balance effect in SQL, in the same database transaction.
- Withhold the offer when the undo would fail, and keep specific confirmations for what is truly permanent.
- When the undo has no time limit, as with an AI client, check that nobody changed the rows first.
- Test the offer and the effect separately, and follow the URL the server flashed.

The [Contamos case study](/en/work/contamos/) has the rest of the context.
