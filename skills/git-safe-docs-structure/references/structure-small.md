# Structure Pattern: Small Systems

Use for single-service or early-stage projects with one main audience.

## Goals

- Keep docs discoverable with minimal nesting.
- Keep contribution path obvious for first-time contributors.

## Suggested Layout

```text
.
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── docs/
    ├── getting-started.md
    ├── usage.md
    ├── architecture.md
    ├── operations.md
    └── faq.md
```

## Rules

- Keep `docs/` depth shallow (1-2 levels).
- Keep one page per concept.
- Place navigation links in `README.md` and `docs/getting-started.md`.
