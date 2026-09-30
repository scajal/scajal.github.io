---
title: "How I built a SaaS alone in four weeks"
description: "The solo founder tech stack behind Contamos: Laravel, managed auth, billing and hosting, plan limits in one place, and tests as the contract."
published: "2026-10-06"
translations: {"es": "lanzar-un-saas-solo-en-cuatro-semanas"}
---

I built [Contamos](/en/work/contamos/), a shared ledger for money kept in several currencies, alone. The first commit is dated 29 August 2026; about four weeks later it was in production at contamos.xyz, bilingual, with a free plan, a paid one, billing, and a remote MCP server that lets Claude or ChatGPT read and write the books.

If you are trying to build a SaaS solo, the question that matters is not which framework is fastest to type in. It is which decisions you can avoid owning. Every system you run yourself is a system you have to be awake for. What follows is the stack I chose, and more usefully, the reasons behind each choice.

## The one rule: nothing I have to operate

One person builds, runs and supports Contamos. That constraint decided almost everything. I did not ask "what is the best tool for authentication?" but "what is the version of authentication I never have to think about at 3 a.m.?"

That rule produced three purchases:

| Concern | Service | What it removes |
| --- | --- | --- |
| Hosting | Laravel Cloud | Servers, deploy scripts, scaling, TLS |
| Sign-in | WorkOS AuthKit | Password storage, resets, social login, sessions, OAuth for the MCP server |
| Billing | Paddle | Payments, invoices, and sales tax, as merchant of record |

Each of these costs money or margin. Each one is cheaper than the hours it replaces, and more importantly, none of them has a pager.

### Hosting: a deploy hook and nothing else

Production runs on Laravel Cloud. The deploy workflow in the repository is short: it refuses anything that is not `main`, refuses any commit whose test run has not passed, and then calls the environment's deploy hook. There is no server I log into.

### Sign-in: let someone else hold the passwords

WorkOS AuthKit handles sign-in. The app never stores a password. This paid for itself a second time later, when I built the MCP server: AI assistants need OAuth to connect on a user's behalf, and AuthKit is also the authorization server for that. Contamos only has to check the tokens it issues. I wrote up how that works in [building a remote MCP server in Laravel](/en/blog/remote-mcp-server-laravel/).

### Billing: a merchant of record, not a payment processor

The difference matters more than it looks. A payment processor moves the money and leaves tax compliance to you. A merchant of record sells the product on your behalf, so collecting and remitting sales tax and VAT in each country is its problem. For a solo founder in Uruguay selling to anyone, that is the only sane option. Paddle is the merchant of record, and Laravel Cashier for Paddle wires the subscription state into the app.

## A modular monolith, not microservices

The codebase is one Laravel application split into modules under `app/Modules`: `Core` (with `Identity`, `Finance` and `Catalog` inside), `Billing`, `Authentication`, `Administration`, `Marketing`, `Mcp` and `Support`. Each module owns its routes, models, actions and providers.

A monolith is the right shape for one person because the whole system fits in one head and one deploy. Modules give most of what people reach for microservices to get, which is boundaries you can see, without the network in between. When the MCP server arrived late in the build, it was a new module that called the actions the web controllers already use. Deleting a transaction from Claude runs the same `DeleteTransaction` action as deleting it from the browser.

The frontend is React through Inertia, so there is no separate API to design and version for the web app. Filament gives me an admin panel for free. The stack in full: Laravel 13, Inertia, React 19, Filament, Tailwind CSS.

## Plan limits declared once

Pricing logic is where solo SaaS projects quietly rot. The limit lives in a controller, a copy lives in the pricing page, another in an email, and eventually they disagree.

In Contamos every plan-limited feature is a [Laravel Pennant](https://laravel.com/docs/pennant) feature class that owns its own limit and knows how to measure usage:

```php
#[Name('accounts:create')]
class AddAccounts
{
    public function resolve(Team $team): bool
    {
        return ($limit = $this->limitOn($team->plan())) === null
            || $this->usage($team) < $limit;
    }

    public function limitOn(Plan $plan): ?int
    {
        return match ($plan) {
            Plan::Free => 3,
            Plan::Pro => null,
        };
    }

    public function usage(Team $team): int
    {
        return $team->accounts()->isActive()->count();
    }
}
```

A `Feature` enum lists every one of them. The web routes are gated with Pennant's `EnsureFeaturesAreActive` middleware, the MCP tools call the same check, and the pricing page reads its numbers from the same enum. Changing the free plan's account limit is a one-line change, and the app, the API and the marketing page all move together.

I did not get this right the first time. The git history shows the first version of the billing module being written and torn out on the same day. That was cheap, because it was day nine and nobody was paying yet.

## Tests are the contract

Working alone, there is no reviewer. Working with AI agents writing much of the code, there is a reviewer that is confident and sometimes wrong. In both cases the tests are what decides whether a change is correct.

Contamos has more than 1,500 tests, written with Pest. Continuous integration runs them in parallel along with Rector, Pint and PHPStan at level `max`, and the deploy workflow will not ship a commit whose tests did not pass. There are also scripts for 100% code coverage and 100% type coverage.

That sounds like overhead. In practice it is the thing that let me move fast without breaking money. It is still a ledger: amounts are exact decimals, never floats, and deleting a movement has to put the balance back exactly where it was. Those are properties I cannot eyeball across hundreds of changes, but a test can check them on every commit.

## AI in the loop, with rules

A large part of Contamos was written with AI agents. What made that work was not the model; it was the context around it. The repository carries an `AGENTS.md` with the project's rules, Laravel Boost gives the agents version-correct documentation for every installed package, and the codebase leans on typed interfaces and strict types so a wrong guess fails loudly.

The practical effect is that writing code stopped being the bottleneck. Deciding what to build, and judging whether what came back is right, became the job. I cover the day-to-day of that in [Claude Code on a real codebase](/en/blog/claude-code-on-a-real-codebase/).

## What I would tell another solo founder

- **Buy everything that has a pager.** Hosting, sign-in and billing are solved problems. Your product is not.
- **Pick a merchant of record** if you sell internationally from a small country. Tax compliance is not a weekend project.
- **Stay a monolith.** Use modules for boundaries. A network hop is not a boundary you need yet.
- **Put plan limits in one place** and make every surface read from it.
- **Write the tests before you need them.** Alone, they are the only reviewer that never gets tired.
- **Build the smallest thing that is honest.** The free plan had to be genuinely useful and the paid one worth paying for, which kept the scope tight from the start.

## Four weeks is a consequence, not a goal

Four weeks was not a target I set. It is what happens when most of the hard, boring problems are bought instead of built, the codebase is small enough to hold in one head, and the tests catch what I would have missed. The full context, constraints and outcome are in the [Contamos case study](/en/work/contamos/).
