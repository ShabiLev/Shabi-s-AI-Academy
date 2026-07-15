# Git and Release

Work occurs on `feature/1.4.0-agent-operating-system`. Do not rewrite published
history, force push, discard unrelated work, or merge automatically. Use coherent
Conventional Commits after their relevant gates pass.

The release is not `Ready` unless mandatory automated gates pass, coverage meets
unchanged thresholds, evidence matches current HEAD, the tree is clean, and human
UX, security, and content reviews are recorded as passed or passed with warnings.
Absent human review therefore leaves a manual-review warning and prevents a final
release claim. Stop before push or merge without current-session authorization.
