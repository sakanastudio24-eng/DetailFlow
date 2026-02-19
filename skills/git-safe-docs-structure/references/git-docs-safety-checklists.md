# Git Docs Safety Checklists

## Before Editing

- Confirm repository root and active branch.
- Fetch latest remote state: `git fetch --all --prune`.
- Run `scripts/git_docs_preflight.sh`.
- Create a dedicated branch for the change.
- Confirm scope (`docs-only`, `docs+structure`, `architecture-scale`).

## During Editing

- Keep docs and structural moves in separate commits when possible.
- Update all changed links in the same branch.
- Avoid binary-heavy docs assets unless required.
- Keep generated files out of commits unless repository policy requires them.
- Preserve decision context in ADRs for architecture changes.

## Before Commit

- Inspect staged files: `git diff --cached --name-status`.
- Scan staged diff for sensitive data.
- Ensure commit message explains intent and impact.
- Ensure moved paths use `git mv` where practical.

## Before Opening PR

- Verify branch rebased or updated with base branch.
- Provide before/after directory summary.
- Document migration notes for renamed or removed paths.
- Highlight contributor-facing changes (`CONTRIBUTING.md`, templates, scripts).
- Request review from docs/code owners.

## Before Merge

- Confirm CI/documentation checks pass.
- Confirm no unresolved review threads.
- Confirm history is clean per repository policy.
- Confirm release/changelog note if docs change user behavior.
