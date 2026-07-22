# Version 1.5 Event Bus

## Contract

The in-process typed Event Bus uses injected clocks and IDs, bounded diagnostics, isolated subscriber failures, and explicit unsubscribe cleanup. It contains no hidden singleton or external side effect.

## Failure behavior

One subscriber failure does not interrupt other subscribers. A bounded delivery-error record captures event identity and a short message without serializing sensitive payloads.

## Verification

Unit tests prove typed delivery, cleanup, ordering, bounded history, and subscriber error isolation. UI diagnostics expose only event names and timestamps.
