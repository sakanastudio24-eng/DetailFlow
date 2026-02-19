#!/usr/bin/env bash
set -euo pipefail

REPO_PATH="${1:-.}"
MAX_BYTES="${MAX_BYTES:-5242880}" # 5 MiB default warning threshold

cd "$REPO_PATH"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: Not inside a Git repository: $REPO_PATH" >&2
  exit 2
fi

warn_count=0
fail_count=0

print_section() {
  printf "\n== %s ==\n" "$1"
}

add_warn() {
  printf "WARN: %s\n" "$1"
  warn_count=$((warn_count + 1))
}

add_fail() {
  printf "FAIL: %s\n" "$1"
  fail_count=$((fail_count + 1))
}

print_section "Repository"
branch="$(git rev-parse --abbrev-ref HEAD)"
echo "Path: $(pwd)"
echo "Branch: $branch"

if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}')"
  counts="$(git rev-list --left-right --count "${upstream}...HEAD" 2>/dev/null || echo '0 0')"
  behind="$(echo "$counts" | awk '{print $1}')"
  ahead="$(echo "$counts" | awk '{print $2}')"
  echo "Upstream: $upstream (ahead:$ahead behind:$behind)"
else
  add_warn "No upstream tracking branch configured."
fi

if [[ "$branch" == "main" || "$branch" == "master" ]]; then
  add_warn "Direct work on $branch detected. Prefer a feature branch for docs changes."
fi

print_section "Working Tree"
status="$(git status --porcelain)"
if [[ -z "$status" ]]; then
  echo "Clean working tree."
else
  echo "$status"
  add_warn "Working tree is not clean."
fi

print_section "Open-Source Baseline Files"
required_files=(README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md)
for f in "${required_files[@]}"; do
  if [[ -e "$f" ]]; then
    echo "OK: $f"
  else
    add_warn "Missing recommended file: $f"
  fi
done

if [[ -d docs ]]; then
  echo "OK: docs/ directory present"
else
  add_warn "No docs/ directory present."
fi

print_section "Tracked Sensitive File Patterns"
sensitive_patterns=(
  '(^|/)\\.env(\\..*)?$'
  '(^|/)id_rsa(\\.pub)?$'
  '\\.pem$'
  '\\.p12$'
  '\\.key$'
  '(^|/).*secret.*$'
  '(^|/).*credential.*$'
)

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  for pattern in "${sensitive_patterns[@]}"; do
    if [[ "$file" =~ $pattern ]]; then
      add_fail "Potential sensitive file tracked: $file"
      break
    fi
  done
done < <(git ls-files)

print_section "Staged Secret-Like Tokens"
if git diff --cached --quiet; then
  echo "No staged changes."
else
  secret_hits="$(git diff --cached | grep -E -n 'AKIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----|xox[baprs]-|ghp_[A-Za-z0-9]{36}' || true)"
  if [[ -n "$secret_hits" ]]; then
    echo "$secret_hits"
    add_fail "Possible secret patterns detected in staged diff."
  else
    echo "No obvious secret token patterns in staged diff."
  fi
fi

print_section "Large Tracked Files"
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if [[ -f "$file" ]]; then
    size="$(wc -c < "$file" | tr -d '[:space:]')"
    if (( size > MAX_BYTES )); then
      size_mb="$(awk "BEGIN {printf \"%.2f\", $size/1048576}")"
      add_warn "Large tracked file: $file (${size_mb} MiB)"
    fi
  fi
done < <(git ls-files)

print_section "Summary"
echo "Warnings: $warn_count"
echo "Failures: $fail_count"

if (( fail_count > 0 )); then
  echo "Result: FAIL"
  exit 1
fi

echo "Result: PASS (warnings may still require action)"
exit 0
