# Page guidance

Primary routes render a standard Page Introduction above the task. It identifies the product area and page, provides a short purpose statement, links valid breadcrumb parents, exposes the most useful next action, and links contextually to Help. Nested entities truncate safely and the current crumb is plain text.

The component reads `pageRegistry`; feature components should not duplicate route descriptions. Context badges are used only when state such as Local-only, Mock, Dry Run, or provider availability changes the user's decision.

On mobile, introductions stack and breadcrumbs remain one line with safe truncation. Guided tours and glossary popovers use the shared overlay scale and remain keyboard operable.
