# StatsTable string sort + Admin review fixes

## Context

`StatsTable` is a generic sortable table component. `getValue` was typed as `(row: T) => number`, making it impossible to sort string columns (e.g. player names) — the comparator did numeric subtraction which produces `NaN` on strings.

## Changes

### StatsTable.tsx

- `Column.getValue` return type widened from `number` to `string | number`
- Sort comparator branches on type:
  - Both strings → `localeCompare`
  - Otherwise → numeric subtraction (with `parseFloat` fallback for numeric strings)

### Admin.tsx

Minor fixes from user review of Step 3 output.
