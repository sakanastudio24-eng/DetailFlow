# Structure Pattern: Complex Systems and Monorepos

Use for platform-scale systems, monorepos, or organizations with many services and teams.

## Goals

- Standardize documentation topology across many domains.
- Make ownership and lifecycle explicit.
- Reduce navigation drift over time.

## Suggested Layout

```text
.
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── docs/
│   ├── index.md
│   ├── platform/
│   │   ├── principles/
│   │   ├── architecture/
│   │   └── standards/
│   ├── domains/
│   │   ├── identity/
│   │   ├── billing/
│   │   └── notifications/
│   ├── services/
│   │   ├── service-a/
│   │   │   ├── README.md
│   │   │   ├── runbook.md
│   │   │   └── api.md
│   │   └── service-b/
│   ├── governance/
│   │   ├── adr/
│   │   ├── risk/
│   │   └── compliance/
│   └── operations/
│       ├── sre/
│       ├── incident-command/
│       └── disaster-recovery/
├── services/
│   ├── service-a/
│   └── service-b/
└── .github/
    ├── CODEOWNERS
    ├── workflows/
    └── PULL_REQUEST_TEMPLATE.md
```

## Rules

- Keep a mirrored relationship between `services/<name>` and `docs/services/<name>`.
- Enforce ownership with `CODEOWNERS` and docs reviewers.
- Separate stable standards from fast-changing runbooks.
- Add migration notes whenever moving or merging documentation domains.
