# Structure Pattern: Medium Systems

Use for multi-service products or teams with several contributor groups.

## Goals

- Separate docs by domain without duplicating fundamentals.
- Support consistent onboarding and operations references.

## Suggested Layout

```text
.
├── README.md
├── CONTRIBUTING.md
├── docs/
│   ├── index.md
│   ├── product/
│   │   ├── concepts/
│   │   └── guides/
│   ├── engineering/
│   │   ├── architecture/
│   │   ├── api/
│   │   └── runbooks/
│   ├── operations/
│   │   ├── incidents/
│   │   └── maintenance/
│   └── governance/
│       ├── adr/
│       └── standards/
└── .github/
    ├── PULL_REQUEST_TEMPLATE.md
    └── ISSUE_TEMPLATE/
```

## Rules

- Keep shared concepts in one canonical file and cross-link.
- Store ADRs under `docs/governance/adr/`.
- Require owners for `engineering/`, `operations/`, and `governance/` docs.
