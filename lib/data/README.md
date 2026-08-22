# Data

`seed.ts` contains the deterministic MVP dataset. Import `mockData` from this directory when a route, server component, or engine function needs the complete validated graph.

Named exports such as `participants`, `sunshineCells`, `flexibleResources`, `flexEvents`, and `settlements` are available for focused consumers. All timestamps are fixed ISO 8601 values so builds and tests remain deterministic.

`validate.ts` checks runtime schemas, unique identifiers, foreign keys, attribution shares, and the verification gate before settlement. Keep new fixtures consistent with these checks.
