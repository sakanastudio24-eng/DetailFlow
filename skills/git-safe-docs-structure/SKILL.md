---
name: git-safe-docs-structure
description: Plan and execute safe Git workflows for open-source documentation and repository file-structure changes. Use when tasks involve creating or updating docs, reorganizing folders, defining branch and PR strategy, preventing secret leaks, or scaling documentation architecture from small projects to complex monorepos.
---

# Git Safe Docs Structure

Use this skill to implement documentation and file-structure changes with low risk, clear history, and predictable review.

## Execute Workflow

1. Classify scope.
2. Run preflight checks.
3. Choose a structure profile.
4. Implement minimal safe commits.
5. Validate and prepare PR output.

### 1) Classify scope

- `docs-only`: content edits, diagrams, ADRs, guides.
- `docs+structure`: folder moves/renames and navigation updates.
- `architecture-scale`: monorepo-wide taxonomy, ownership, and governance changes.

### 2) Run preflight checks

- Run `scripts/git_docs_preflight.sh` from the repository root.
- Stop and resolve all failures before editing.
- Create a feature branch if current branch is `main` or `master`.
- Prefer branch names:
  - `docs/<topic>`
  - `chore/docs-structure/<topic>`
  - `arch/docs/<topic>`

### 3) Choose a structure profile

Load only the relevant file:

- Small systems: `references/structure-small.md`
- Medium systems: `references/structure-medium.md`
- Complex systems and monorepos: `references/structure-complex.md`

### 4) Implement minimal safe commits

- Separate content edits from mass file moves when possible.
- Use `git mv` for tracked renames.
- Keep commits atomic and reviewable.
- Use conventional commit style:
  - `docs(scope): clarify setup steps`
  - `chore(docs): reorganize api references by domain`
  - `docs(adr): record event-driven boundary decision`
- Never commit secrets, private keys, local env files, or customer data exports.

### 5) Validate and prepare PR output

- Run:
  - `git status --short`
  - `git diff --stat`
- Summarize PR with:
  - intent and impact
  - before/after structure snapshot
  - link migration notes (if paths changed)
  - contributor workflow updates (if any)

## Apply Safety Rules

- Prefer additive updates over destructive rewrites.
- Keep one canonical location per concept; replace duplicate docs with links.
- Keep hierarchy depth predictable (usually `docs/<domain>/<topic>/<artifact>`).
- Split architecture docs by concern: context, decision, interface, operations.
- Maintain open-source baseline files when applicable:
  - `README.md`
  - `LICENSE`
  - `CONTRIBUTING.md`
  - `CODE_OF_CONDUCT.md`
  - `SECURITY.md`

## Use Supporting Resources

- Operational checklists: `references/git-docs-safety-checklists.md`
- Command patterns: `references/git-command-playbook.md`
- Structure templates:
  - `references/structure-small.md`
  - `references/structure-medium.md`
  - `references/structure-complex.md`
- Automated preflight: `scripts/git_docs_preflight.sh`
