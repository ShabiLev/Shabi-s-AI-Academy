# Version 1.5 Scheduler

## Contract

The Scheduler validates explicit task definitions, permissions, timeouts, retry limits, and concurrency. Browser execution is manual simulation only; durable schedules map to GitHub Actions.

## Safety limits

Tasks declare one permission class, at most three attempts, a bounded timeout, and a concurrency policy. Unknown, disabled, duplicate, or concurrent tasks fail closed; background history is bounded.

## Execution ownership

The browser does not create a durable timer. GitHub Actions owns schedules and immutable artifacts; a future backend adapter must preserve the same validation contract.
