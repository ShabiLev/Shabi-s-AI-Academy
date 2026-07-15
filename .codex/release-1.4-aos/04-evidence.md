# Evidence

Evidence profiles capture command identity, timestamps, duration, exit code,
sanitized logs, coverage, Git relationships, and manual-review state. Run IDs and
branch fragments are path-safe, indexes are bounded, and heavy artifacts stay in
ignored run directories.

A missing package script is `notAvailable`; a failed prerequisite produces
`notRunDueToDependency`; neither becomes a pass. `latest/` is replaced only after
the command profile reaches summary generation. Manual UX, security, and content
gates remain human-owned and automation cannot promote them.

`quality:evidence:full` may call `validate:release`; `validate:release` must never
call an evidence profile, preventing recursion.
