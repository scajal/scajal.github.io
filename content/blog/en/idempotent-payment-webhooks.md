---
title: "Idempotent payment webhooks in Laravel"
description: "How to handle payment webhooks idempotently in Laravel: verify the signature, store each event once, process it in a job, and let the database be the guard."
published: "2026-10-27"
translations: {"es": "webhooks-de-pago-idempotentes"}
---

A payment webhook will arrive more than once. Providers retry when your endpoint is slow, when it returns an error, and sometimes when it did neither. Handling payment webhooks idempotently means that the second, third or tenth delivery of the same event changes nothing: no second credit, no second email, no second row.

The short answer for Laravel: verify the signature, store each event under the provider's unique event id with a database unique constraint, answer fast, and do the work in a queued job that checks and changes state in one atomic step. The rest of this post is why each of those steps is there, with code, and with examples from two systems I work on: Contamos, which bills through Paddle, and Criptala, a crypto trading and payments platform.

## Why webhooks arrive twice

Webhook delivery is at-least-once by design. The provider cannot know whether your server processed an event, only whether it answered with a 2xx in time. So it retries:

- Your handler took longer than the provider's timeout, even though it finished.
- Your handler threw after doing half its work.
- The network dropped the response.
- Two deliveries of the same event overlapped because the first was still running.

Events also arrive out of order. A `subscription.updated` can land before the `subscription.created` it follows. Code that assumes one delivery, in order, will work in testing and fail in production.

## Step 1: Verify the signature before anything else

Anyone can POST to a public URL. Before reading the payload, check that it came from the provider. Paddle sends a `Paddle-Signature` header with a timestamp and an HMAC-SHA256 of `timestamp:raw_body`, signed with your webhook secret.

```php
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

function verifyPaddleSignature(Request $request, string $secret): void
{
    $parts = [];

    foreach (explode(';', (string) $request->header('Paddle-Signature')) as $part) {
        [$key, $value] = array_pad(explode('=', $part, 2), 2, '');
        $parts[$key] = $value;
    }

    $timestamp = (int) ($parts['ts'] ?? 0);
    $expected = hash_hmac('sha256', $timestamp.':'.$request->getContent(), $secret);

    // Reject stale signatures, so a captured request cannot be replayed later.
    if (time() - $timestamp > 5 || ! hash_equals($expected, $parts['h1'] ?? '')) {
        throw new AccessDeniedHttpException('Invalid webhook signature.');
    }
}
```

Three details matter. Sign the raw body with `getContent()`, not re-encoded JSON, or the bytes will not match. Compare with `hash_equals` to avoid timing leaks. And reject old timestamps: five seconds is what Laravel Cashier uses for Paddle.

If you use [Laravel Cashier for Paddle](https://laravel.com/docs/cashier-paddle), this is done for you once `PADDLE_WEBHOOK_SECRET` is set. That is what Contamos does. The webhook route is exempt from CSRF, and Cashier's middleware checks the signature.

## Step 2: Store every event once, keyed by its id

Every provider gives each event a unique id. In Paddle Billing it is `event_id`. Store the raw event under that id, and let a unique index enforce "once":

```php
Schema::create('webhook_events', function (Blueprint $table): void {
    $table->id();
    $table->string('provider');
    $table->string('event_id');
    $table->string('type');
    $table->json('payload');
    $table->timestamp('processed_at')->nullable();
    $table->timestamps();

    $table->unique(['provider', 'event_id']);
});
```

Keeping the raw payload is worth the disk. When something goes wrong, you can see exactly what the provider sent, and replay it after a fix.

The unique index is the important part. A check like "does this event exist?" followed by an insert has a race: two deliveries can both check, both see nothing, and both insert. The database is the only place that can say no to the second one atomically.

## Step 3: Answer fast, process in a job

The controller does as little as possible: verify, store, dispatch, return.

```php
class PaymentWebhookController
{
    public function __invoke(Request $request): Response
    {
        verifyPaddleSignature($request, config('services.paddle.webhook_secret'));

        $event = WebhookEvent::query()->createOrFirst(
            ['provider' => 'paddle', 'event_id' => $request->input('event_id')],
            ['type' => $request->input('event_type'), 'payload' => $request->all()],
        );

        if ($event->wasRecentlyCreated) {
            ProcessWebhookEvent::dispatch($event);
        }

        return response()->noContent();
    }
}
```

`createOrFirst` tries the insert and, if the unique index rejects it, returns the existing row instead of throwing. A duplicate delivery gets a 204 and nothing else.

Moving the work into a queued job keeps the response well inside the provider's timeout, which removes the most common cause of retries. It also gives you Laravel's own retries with backoff when a downstream call fails.

This step is a trade-off, not a rule. In Contamos, each Paddle handler is a couple of database writes, so it runs inline in Cashier's controller and stays fast. Once a handler calls other APIs, sends mail or touches several tables, a job is the safer place for it.

## Step 4: Make the handler idempotent too

Deduplicating deliveries is not enough. The job itself can run twice: a worker can crash after committing but before acknowledging the job. The handler must check and change state in one atomic step.

Lock the event row, check whether it was processed, do the work, mark it, all in one transaction:

```php
class ProcessWebhookEvent implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(public WebhookEvent $event) {}

    public function handle(): void
    {
        DB::transaction(function (): void {
            $event = WebhookEvent::query()->lockForUpdate()->findOrFail($this->event->id);

            if ($event->processed_at !== null) {
                return;
            }

            $this->apply($event->payload);

            $event->update(['processed_at' => now()]);
        });
    }
}
```

The same idea works without a separate events table: a conditional update that claims the state change. Contamos uses it for the end of a subscription, so the team owner is told once that the team dropped to the free plan, however many times Paddle delivers the event:

```php
$claimed = Subscription::query()
    ->where('paddle_id', $payload['data']['id'])
    ->whereNull('end_handled_at')
    ->update(['end_handled_at' => CarbonImmutable::now()]);

if ($claimed === 0) {
    return;
}
```

Only one request can move `end_handled_at` from null to a date. Every other one sees zero affected rows and stops. Billing transactions work the same way: each row carries Paddle's transaction id under a unique index, and the handler returns early if it already exists.

### Keep side effects out of the retry path

Emails, analytics events and calls to other services are not rolled back with the transaction. Send them after the commit (`DB::afterCommit()` or a job dispatched with `afterCommit()`), and decide what a failure means. In Contamos, reporting a purchase to Google Analytics is wrapped in `rescue()`: a failure is logged but never raised, so Paddle does not retry a webhook whose real work already succeeded.

## Step 5: Handle out-of-order delivery

Idempotency stops the same event from applying twice. It does not stop an older event from overwriting a newer state. Paddle includes `occurred_at` on every event; store it on the entity and only apply an update that is newer:

```php
Subscription::query()
    ->where('paddle_id', $data['id'])
    ->where(fn ($query) => $query
        ->whereNull('provider_updated_at')
        ->orWhere('provider_updated_at', '<', $occurredAt))
    ->update([
        'status' => $data['status'],
        'provider_updated_at' => $occurredAt,
    ]);
```

When an event references something you have not seen yet, fail the job and let it retry later instead of creating a half-built record.

## Step 6: Reconcile against the provider API

Webhooks are a notification, not a source of truth. Endpoints go down, secrets get rotated wrongly, and events get lost. A scheduled job that asks the provider for recent transactions and compares them with your records catches what webhooks missed. Treat a mismatch as something to report, not something to silently fix.

## Fiat reversals vs on-chain payments

At Criptala, fiat and crypto rails sit behind one API, and they fail differently. A bank transfer or card payment can be reversed days later. A confirmed on-chain transaction cannot be reversed at all. That changes how a webhook handler must think:

- **Fiat:** a "completed" event is not final. The model needs a later state for reversals and chargebacks, and money released on "completed" must be recoverable, which is much easier in a ledger where [every movement can be reverted exactly](/en/blog/multi-currency-ledger-design/).
- **Crypto:** the confirmation is final, so the risk is the opposite: crediting twice, or crediting the wrong order. A credit that goes out twice cannot be pulled back.

Two patterns from that codebase, at an architectural level. First, a webhook whose payment is already in the target state returns success immediately. An earlier version answered that case with a validation error, which only made the provider retry. Second, each provider reference is attached to exactly one payment. If a webhook arrives with a reference that another payment already owns, that is raised as an alert, never applied as a second credit.

## A checklist for payment webhooks

- Verify the signature against the raw body, with a timestamp tolerance.
- Store each event under the provider's event id, with a unique index.
- Return 2xx quickly; do heavy work in a queued job.
- In the handler, check and change state in one atomic step: a row lock or a conditional update.
- Send side effects after commit, and do not let their failure trigger a retry.
- Compare `occurred_at` so older events cannot overwrite newer state.
- Reconcile against the provider's API on a schedule.
- Model reversals for fiat; guard against double credit for crypto.

The common thread is that the database decides, not the code before it. For how this fits in a whole platform, see the [Criptala case study](/en/work/criptala/).
