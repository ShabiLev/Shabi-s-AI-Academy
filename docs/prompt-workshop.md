# Prompt Workshop

Version 0.5.0 provides a browser-local workspace for designing, reviewing, saving, and organizing professional prompts. No prompt content is uploaded to an API or server.

Each prompt stores a stable ID, title, description, language, category ID, tags, structured prompt fields, timestamps, version, and favorite state. Data and filters use `shabi-ai-academy.prompt-library.v1` in localStorage. Invalid records, schema mismatches, malformed JSON, and duplicate IDs are safely rejected or removed.

Meaningful edits increment the version. Viewing, exporting, copying, and favoriting do not. Duplicates receive a new ID, timestamps, translated Copy suffix, and Version 1.

The deterministic checklist totals 100: Task clarity 25, Context 20, Constraints 15, Output Format 20, Reusability 10, and Specificity 10. It evaluates structure—not factual truth, safety, or correctness—and calls no AI service.

Search covers title, description, tags, task, and localized categories. Filters persist, and results sort by updated date, created date, title, or quality. UTF-8 TXT/Markdown exports use sanitized filenames. Four samples remain unsaved until explicitly selected and saved.

Lesson 2 can open a QA draft in the Workshop; an existing draft is not overwritten without confirmation. Current limitations are browser-specific storage, no synchronization/collaboration, and structural-only evaluation. Future AI-assisted evaluation would require explicit consent and clear data controls.
