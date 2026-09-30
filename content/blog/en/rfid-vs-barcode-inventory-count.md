---
title: "RFID vs barcode for inventory counts: what changes"
description: "RFID vs barcode for a physical inventory count: why line of sight sets the cost, where RFID struggles, and the reconciliation software that makes it pay off."
published: "2026-10-02"
translations: {"es": "inventario-rfid-vs-codigo-de-barras"}
---

The difference between RFID and barcode for an inventory count is not speed per scan. It is that a barcode needs a person pointing a scanner at every item, and RFID does not. A barcode count grows linearly with the number of things you own. An RFID count grows with the size of the space you have to walk through. That is a different shape of problem, and it is why an RFID inventory count can take a fraction of the effort.

I worked on one of these at heXa Sistemas. A client's annual stock count took five people about twenty hours each. After the move to RFID and a reconciliation pass, it took one person roughly three hours. This post covers why that happened, where RFID gets difficult, and why the tags were only half of the result.

## Why barcode inventory counts are slow

The typical annual count goes like this: close the premises, put people on the floor with barcode scanners and printed sheets, scan everything, then spend hours reconciling what was found against what the system believes is there. That is how the client in the [RFID case study](/en/work/hexa-rfid/) did it, and it is how most companies do it.

Every part of that is expensive for the same reason. A barcode is an optical code. It needs line of sight, reasonable lighting, a correct angle and one deliberate scan per item. So:

- **Effort is linear in item count.** Twice the stock means twice the scanning, no matter how well organised the team is.
- **Stacked items are a problem.** Anything behind something else has to be moved, scanned and put back.
- **Fatigue lowers accuracy.** After hours of repetitive scanning, people skip items or scan the same one twice. In our case the count was expensive, disruptive, and, because it was exhausting, not especially accurate.

None of this is a flaw in barcodes. For scanning one item at a till, they are close to perfect. They are just a poor fit for counting everything at once.

## How an RFID inventory count works

RFID tags carry an identifier that a reader picks up by radio instead of by sight. For inventory, the usual choice is passive UHF RFID, following the EPC Gen2 standard ([GS1 EPC/RFID](https://www.gs1.org/standards/epc-rfid)). The tags have no battery. They draw their power from the reader's signal and reply with their ID.

That changes how a count works:

- **No line of sight.** A reader can see a tag inside a box, behind another box, or under packaging.
- **Many tags at once.** The protocol is designed so a reader can take in large numbers of tags in a single pass, without a separate action for each one.
- **Distance.** Passive UHF tags can be read from metres away, depending on the reader, the antenna, the tag and what surrounds it.

A count stops being a sequence of scans and becomes a sweep of the space. One person walks the aisles with a handheld reader, or fixed readers cover the areas items pass through, and the tags answer.

## RFID vs barcode compared

| | Barcode | Passive UHF RFID |
|---|---|---|
| Line of sight | Required | Not required |
| Items per scan | One | Many |
| Read distance | Close range | Up to metres, depending on conditions |
| Cost per label | Close to zero | A few cents and up, more for special tags |
| Identifies | The product type (usually) | The individual item, if each tag is unique |
| Fails on | Damaged or hidden labels | Metal, liquids, dense stacking, badly placed tags |
| Result of a scan | Deterministic | Probabilistic, with duplicates |

The last row matters most for the software, and it is where most RFID projects succeed or fail.

## Where RFID struggles

RFID is not magic, and a count built on the assumption that every tag will always answer will be wrong. The general limits are well known:

- **Metal and liquids.** Metal reflects UHF signals and can detune tags placed directly on it. Water absorbs them. Items that are metallic or hold liquid need tags designed for that, or careful placement.
- **Reads are not guaranteed.** Tag orientation, distance, stacking density and the reader's power all affect whether a given tag answers on a given pass. Some tags answer many times, others not at all.
- **Tags get damaged.** A label on a box that gets dragged across shelves for a year will not always survive. Any system that uses tags in a real warehouse has to expect some of them to fail.
- **The people doing the count are not specialists.** If the procedure is complicated, it will not be followed correctly by someone who does it a few times a year.

This is why the case study describes the requirement as surviving a warehouse rather than a demo. A demo has twenty tagged items on a table. A warehouse has items stacked behind items, damaged tags, and staff who cannot be expected to remember a procedure.

## The software is the part that matters

A reader produces a stream of raw reads: tag IDs, often the same ones many times, with no idea what the stock is supposed to be. Nobody can use that directly. The software around it is what turns reads into a count, and it has three jobs.

### Deduplicate the reads

The same tag will be seen repeatedly, from different angles, on different passes, by more than one reader. The first step is to collapse the reads into one set of distinct tags that were seen during the count. Because each passive tag carries its own identifier, duplicates can be resolved by ID rather than guessed.

### Reconcile against expected stock

The set of tags seen is compared with what the system says should be there. Every item falls into one of a few buckets:

- **Found where expected.** The vast majority, which nobody needs to look at.
- **Missing.** Expected but not seen.
- **Unexpected.** Seen but not expected, or not known to the system at all.
- **In the wrong place.** Seen, but in a different location from the recorded one.

### Report the exceptions

The output is an exception report, not a list. In the words of the case study: nobody reads a list of everything that was found. They read the list of what disagrees.

That is also how RFID's limits are handled in practice. An item that is missing might be lost, or it might have a damaged tag or be stacked where the signal did not reach. The exception report tells a person exactly which items to go and check by hand, instead of asking them to check everything. The human effort is focused on the few items that need it.

## What changed: 100 person-hours to about 3

With RFID and the reconciliation pass, the count went from five people for twenty hours to one person for roughly three. That is about a 97% reduction in effort.

The more interesting change was what the count became. When it takes a hundred person-hours and requires closing, it happens once a year and everyone dreads it. When it takes one person an afternoon, it can be run whenever it is useful: before an audit, after a move, when the numbers look wrong.

The result came from changing the shape of the problem, not from making the old process faster. Faster barcode scanners, better sheets or more people would all have left the count linear in the number of items. RFID removed the one scan per item, and the software removed the need to look at everything.

## When barcodes are still the right choice

RFID is not the answer to every inventory problem. Barcodes are the better choice when:

- **Stock is small or counts are rare** enough that tagging every item costs more than the counting it saves.
- **Items are cheap.** A tag that costs a noticeable share of the item's price is hard to justify.
- **The environment is hostile to radio.** Mostly metal or liquid products can be tagged, but it costs more and needs more testing.
- **You scan one item at a time anyway**, such as at checkout or receiving, where a barcode is already a single fast action.

Many operations use both: barcodes where items are handled one at a time, RFID where things need to be counted in bulk.

## Summary

The case for RFID over barcode in an inventory count is structural. Barcodes need line of sight and one scan per item, so a count grows with your stock. Passive UHF RFID reads many tags at once, through packaging, at a distance, so a count becomes a walk through the space. RFID reads are imperfect, so the value comes from software that deduplicates the reads, reconciles them against expected stock, and gives people a short list of exceptions to check.

The full project is in the [RFID inventory system case study](/en/work/hexa-rfid/).
