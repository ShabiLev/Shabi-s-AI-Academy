# Evaluation Lab guide

## Capability boundary

Version 1.9 beta.1 is designed for **Academy deterministic evaluation** of
frozen local Mission outputs. It does not compare real model providers.
Connected workflow cards are previews only and do not write externally.

## Create a fair experiment

1. Open `/evaluations/new`.
2. Select one Mission snapshot and fixed Context Pack.
3. Select 2–5 versioned competitors of a compatible comparison type.
4. Select one rubric and independent evaluators.
5. Enter a deterministic seed, bounded repetition count, stop conditions, and
   mutation policy.
6. Resolve every validation error, then start to freeze the setup.

All competitors receive the same frozen input, constraints, rubric, and
evaluator policy. Changing any of them requires a new run.

## Read results

Do not treat a weighted summary as a standalone AI quality score. Inspect:

- exact competitor, prompt, team, rubric, and evaluator versions;
- each criterion's status and anchor;
- cited evidence and missing evidence;
- evaluator confidence and disagreements;
- sample size, repetition count, freshness, and limitations;
- certification and Reality Checker decision.

`not-scored` means evidence was insufficient; it is not a zero. A blocking
failure can prevent certification even when the weighted score is high.

## Pause and continue

Pause stores the exact competitor, repetition, evaluator, and state fingerprint.
After reload, Continue verifies all frozen versions and hashes. If anything
drifted, the run does not mix states; create an explicit fork/new run.

Cancellation preserves trace/evidence but does not invent a winner from partial
work.

## Suites and learning

Suites rerun frozen cases against an explicit protected baseline. Critical
regression blocks publication and baselines never update silently. A reviewed
failure can become a private Failure Case and removable Skill Map practice
evidence. Visits and one success never establish mastery.

## Privacy and recovery

Evaluation data is actor-scoped and local to the current browser. Trace/export
views omit hidden chain-of-thought and should not contain credentials, raw local
paths, or private documents. Use complete backup preview before import or
rollback, and review any quarantine warning before resetting a domain.

