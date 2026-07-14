# Deployment Prompt

## Purpose

Frame a deployment task (GitHub Pages build/publish) on top of the shared
AOS deployment workflow.

## Task-specific checklist

- Confirm the build target and base path match
  `.agent/knowledge/github-pages.md` before building.
- Run the Pages-specific build/evidence profile (`quality:evidence:pages`)
  rather than the default fast profile.
- Verify the deployed build post-publish per
  `.agent/release/deployment-verification.md` rather than assuming a
  successful build implies a working deploy.
- Confirm no secret or provider-specific environment value leaks into the
  static build output.
- Check CI status and artifact handling per
  `.agent/knowledge/github-actions.md`.
- Do not trigger a deployment without explicit user authorization in the
  current session.

## Shared workflow to load

Load `.agent/workflow/deployment.md` for the full process; this file adds
nothing to that process except task-specific framing.
