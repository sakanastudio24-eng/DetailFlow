# Git Command Playbook

## Safe Branch Start

```bash
git fetch --all --prune
git switch main
git pull --ff-only
git switch -c docs/<topic>
```

## Inspect Working State

```bash
git status --short
git branch -vv
git log --oneline --decorate -n 15
```

## Rename and Reorganize Files Safely

```bash
git mv docs/api docs/reference/api
git mv docs/architecture/old.md docs/architecture/context.md
git status --short
```

## Stage Intentionally

```bash
git add docs/README.md docs/guides/
git add -p
```

## Review Diff for PR Readability

```bash
git diff --stat
git diff -- docs/
git diff --cached --stat
```

## Commit Patterns

```bash
git commit -m "docs(api): clarify authentication flow"
git commit -m "chore(docs): reorganize reference pages by domain"
git commit -m "docs(adr): add service boundary decision"
```

## Update Branch Before PR

```bash
git fetch origin
git rebase origin/main
# or: git merge origin/main
```

## Recover Safely (Non-Destructive)

```bash
git restore --staged <file>
git restore <file>
git reflog
```

Use destructive history edits only when repository policy and team agreement explicitly allow them.
