---
title: "Multi-currency ledger design: a database schema that holds"
description: "How to model a multi-currency ledger: one balance per currency, the exchange rate of the day on every movement, transfers as two legs, exact reversals."
published: "2026-10-15"
translations: {"es": "disenar-un-libro-contable-multimoneda"}
---

A multi-currency ledger should keep one balance per currency instead of one converted total, store the exchange rate of the day on every movement, record a currency exchange as two movements, one in each currency, and make every edit or deletion undo its effect exactly. Convert into a single currency only when someone asks a question that needs it, using the rates you stored, never today's rate.

That is the design behind Contamos, a shared ledger I built for money kept in pesos, dollars and crypto at the same time. This post walks through its database schema and the reasons for each decision.

## The problem with one converted total

Most personal finance tools, and most spreadsheets, pick a main currency and convert everything into it. It looks tidy, and it hides three problems:

- **The total moves on its own.** If the rate changes, the balance changes, even though nobody spent anything.
- **You lose what you actually hold.** "The equivalent of 2,000 dollars" does not tell you whether you can pay rent in pesos this week.
- **History rewrites itself.** A purchase converted at today's rate is not what that purchase cost when it happened.

The underlying mistake is treating conversion as storage. Conversion is a view. What happened is that a certain amount of a certain currency moved on a certain day, and that is what the ledger should record.

## The schema at a glance

Contamos keeps money in five tables. Stripped to the columns that matter here:

```sql
currencies        (id, code, decimal_places, type)
quotes            (id, currency_id, rate DECIMAL(36,18), observed_at, source)
account_currencies(id, account_id, currency_id, balance DECIMAL(38,18))  -- unique (account_id, currency_id)
transfers         (id, occurred_at, description)
transactions      (id, account_id, currency_id, amount DECIMAL(36,18), decimal_places,
                   type, quote DECIMAL(36,18), occurred_at, transfer_id NULL)
```

Every amount and rate is an exact `DECIMAL`. Why that matters, and how to keep it exact in PHP, is covered in [how to store money in a database](/en/blog/store-money-in-a-database/). The rest of this post is about the shape.

## One balance per currency

An account in Contamos is not a single number. It is a set of rows in `account_currencies`, one per currency it holds, with a unique constraint on the pair. A bank account with pesos and dollars has two balances, and the overview reads "12,400 UYU and 850 USD", which is what is actually there.

Each row in `currencies` carries its own `decimal_places`: 2 for the peso and the dollar, 6 for a stablecoin such as USDT, and whatever the chain or token contract says for any other crypto. Amounts are validated against it on the way in, and every transaction copies it when it is written, so a movement can still be read correctly if a currency's definition changes later.

The balance is a cached value. The source of truth is the list of transactions, and the balance of any account and currency is the signed sum of its movements. Keeping the cache is worth it because every screen needs balances and nobody wants to sum a year of transactions to draw one. The cost is that every write has to keep it correct, which is what the rest of the design is for.

## Store the exchange rate of the day on every movement

Every transaction stores a `quote`: the rate of its currency on the day it happened. In Contamos the rate is expressed against the US dollar, as how much of the currency one dollar buys. A peso expense on a day when a dollar bought 40.12 pesos stores `40.12`; a dollar expense stores `1`.

A few rules make this useful rather than decorative:

- **The rate is written once and never follows the market.** Reading a movement a year later gives the value it had on its own day.
- **The rate you actually got beats the published one.** If a card, an exchange house or a friend gave you their own rate, that is the one to store. Contamos takes the latest rate in its `quotes` catalogue at the transaction's date and time by default, and lets the user type their own.
- **No rate, no movement.** A transaction cannot be saved without one. A missing rate discovered at report time is much harder to fix than one asked for at entry.

The `quotes` table is a history, not a single current value per currency. Each row has an `observed_at` and a `source`, so a rate can be looked up for any moment, and a rate someone typed by hand can be told apart from one fetched automatically.

Anchoring every rate to one reference currency has a practical benefit: converting between any two currencies needs only two rates, not one per pair. An amount in pesos is worth `amount / quote` dollars, and from there any other currency is one multiplication away.

## Signs belong to the type, not the amount

Amounts in Contamos are always positive. A validation rule enforces `amount > 0`, and the direction comes from the transaction's `type`:

| Type | Effect on balance |
|---|---|
| `income` | + |
| `expense` | − |
| `opening_balance` | + |
| `transfer_in` | + |
| `transfer_out` | − |

Each type knows its sign and its inverse. That small decision removes a whole class of bugs, such as a negative expense quietly acting as income, and it makes reversal trivial, as the next sections show.

## Transfers and currency exchanges are two legs

Moving money between accounts, or from one currency to another, is not one movement. It is money leaving one place and money arriving at another, possibly in a different currency and at a rate that is not the market's.

Contamos records a transfer as a parent row in `transfers` and two transactions that point at it:

- a `transfer_out` on the origin account, in the origin currency, for the amount sent;
- a `transfer_in` on the destination account, in the destination currency, for the amount received.

Each leg carries its own quote. Changing 100 dollars into pesos at an exchange house that gave you 39.50 is recorded as 100 USD out and 3,950 UYU in. The effective rate is simply the ratio of the two amounts, and nothing is created or lost in between.

Fees are not folded into either leg. If the origin or the destination charges a fee, it becomes a separate `expense` on that side, in that side's currency, owned by the same transfer. Both balances stay honest, and the fee shows up where it was paid.

A transaction that belongs to a transfer is only edited or deleted through the transfer. Letting a user delete one leg on its own would leave half an exchange in the books.

## Reversals restore balances exactly

In a ledger with cached balances, the most important property is that undoing something puts every balance back exactly where it was. Contamos gets that from three rules:

1. **Every write is a database transaction.** Creating a movement inserts the row and adjusts the balance together, or neither happens.
2. **Balances move in SQL.** The adjustment is an update like `balance = balance + amount`, run by the database on exact decimals, never a value read into PHP, changed, and written back.
3. **Undo is the inverse sign.** Deleting a transaction applies the inverse of its type's sign with the same amount. Editing one reverts the old effect on the old account and currency, then applies the new effect on the new ones, so moving a transaction to another account or currency is handled by the same two steps. Deleting a transfer reverts both legs and any fees.

Because amounts are exact and signs are symmetric, `+ x` followed by `- x` is always zero. There is no rounding to drift and no float to leave a residue. That property is covered by tests on every create, update and delete path, since a balance that is off by one cent is a balance nobody trusts again.

## Report in one currency, on demand

With rates stored per movement, a question such as "how much did we spend on groceries this year, in dollars?" becomes a sum of `amount / quote` over the matching transactions. Every term uses the rate of its own day, so the answer does not change tomorrow, and re-running last year's report gives last year's number.

Contamos is deliberately conservative here. Balances and monthly reports stay in their own currencies, because that is what people act on, and each transaction shows its approximate value in dollars next to its rate. A combined figure is a view you compute when asked, clearly labelled as converted, never a number the ledger stores.

## When you need double-entry accounting

This design is not full double-entry bookkeeping. There is no chart of accounts, and income and expenses are single rows rather than pairs of debits and credits. For a shared household or group ledger, that is the right trade: the model matches how people think about their money, and transfers already get the two-sided treatment where it matters.

If you are building for accountants, for audited financial statements, or for a platform that holds other people's money, use real double-entry, where every entry is a set of postings that sum to zero per currency. The ideas above still apply: exact decimals, a rate stored per posting, and never converting as a way of storing.

## Summary

- Keep one balance per account and currency. Never store a converted total.
- Store each currency's decimal places as data, and copy them onto each movement.
- Save the exchange rate of the day on every transaction, prefer the rate actually obtained, and keep rates as a history, not a single current value.
- Keep amounts positive and let the type carry the sign.
- Record a transfer or a currency exchange as two legs, each in its own currency with its own rate, and fees as separate expenses.
- Wrap every write in a database transaction, move balances in SQL, and undo with the inverse sign.
- Convert into one currency only when a question needs it, using the stored rates.

The full story of the product this schema belongs to is in the [Contamos case study](/en/work/contamos/).
