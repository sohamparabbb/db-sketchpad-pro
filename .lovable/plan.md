# Architect — Text-to-SQL Schema Sandbox

A single-page premium developer tool built on the existing TanStack Start + Tailwind v4 stack. All work stays frontend; no backend, DB, or deps required.

## Design system (src/styles.css)

Extend the existing `:root` / `.dark` tokens and force dark mode by default on this page.

- `--background: #0B0B0C` (obsidian)
- `--card: #161618`
- `--foreground: #FFFFFF` (crisp white)
- `--muted-foreground: #8A8A90`
- `--border: rgba(255,255,255,0.06)`
- `--accent: #F5A524` (deep amber) — primary highlight
- `--accent-alt: #38BDF8` (cyber blue) — secondary highlight for keys/types
- Fonts loaded via `<link>` in `src/routes/__root.tsx`:
  - Headings/UI: **Geist** (geometric sans)
  - Mono/code: **JetBrains Mono**
- Register `--font-sans` and `--font-mono` in `@theme`.
- Generous padding scale, hairline 1px borders, subtle inner shadows on cards.

## Route & metadata

- Replace placeholder `src/routes/index.tsx` with the Architect page.
- Update `__root.tsx` head: title "Architect — SQL Schema Sandbox", matching description, og/twitter tags. Add `<html lang="en" class="dark">` so dark tokens apply globally.

## Layout (`src/routes/index.tsx`)

Top bar: small "ARCHITECT" wordmark left, subtle version tag right. Then a responsive split:

```text
grid-cols-1 lg:grid-cols-2  (stacks on mobile, side-by-side ≥1024px)
```

### Left — Input Panel (`src/components/architect/InputPanel.tsx`)
- Header: "SQL Schema Input" + subtitle "Paste DDL. Parse instantly. Visualize your architecture."
- Code editor: custom textarea composite with fixed line-number gutter (rendered from newline count), mono font, dark inset background, focus ring in amber.
- Prefilled with a clean `CREATE TABLE users (...)` PostgreSQL script.
- "Parse & Visualize" button: full-width, amber accent, `transition-transform hover:scale-[1.02]`.
- Templates section: 3 clickable cards ("E-commerce Orders Table", "User Auth Schema", "Analytics Events") that populate the editor on click. Templates stored as constants in `src/lib/architect/templates.ts`.

### Right — Visual Sandbox (`src/components/architect/SchemaPanel.tsx`)
- Empty state (centered): faint database glyph + "Awaiting Schema Input…" + subtitle.
- Populated state: "Schema Card" with header row (database icon + table name in mono) and a structured table with columns **Column Name / Data Type / Constraints**.
- Constraint pills: PRIMARY KEY (amber), FOREIGN KEY (blue), NOT NULL (neutral outline), UNIQUE, DEFAULT.
- Multiple tables render stacked with `animate-fade-in`.

## Parsing (`src/lib/architect/parseSql.ts`)

Client-side regex parser. No deps.

1. Strip block/line comments.
2. Match all `CREATE TABLE [IF NOT EXISTS] <name> ( ... );` blocks (balanced-parens split).
3. Split column definitions by commas at paren-depth 0.
4. For each definition:
   - Skip table-level constraints (`PRIMARY KEY (...)`, `FOREIGN KEY (...) REFERENCES ...`, `UNIQUE (...)`) but record them and attach to the referenced columns.
   - Otherwise: `name`, `type` (incl. parenthesised size, e.g. `VARCHAR(255)`), constraints via keyword scan (`PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `DEFAULT ...`, `REFERENCES <table>(<col>)` → FOREIGN KEY).
5. Return `{ tables: [{ name, columns: [{ name, type, constraints[] }] }], errors[] }`.
6. On parse failure, surface a small inline error banner in the sandbox panel.

## State

Local `useState` in the index route: `sql` string, `parsed` result, `hasParsed` flag. Clicking a template sets `sql`; clicking Parse runs the parser and updates `parsed`. Transitions on panel swap via `animate-fade-in` / `animate-scale-in` already available.

## Files to create / edit

- edit `src/routes/__root.tsx` — fonts link, dark class, metadata
- edit `src/styles.css` — palette overrides + font tokens
- edit `src/routes/index.tsx` — Architect page composition
- new `src/components/architect/InputPanel.tsx`
- new `src/components/architect/SchemaPanel.tsx`
- new `src/components/architect/ConstraintBadge.tsx`
- new `src/lib/architect/parseSql.ts`
- new `src/lib/architect/templates.ts`

## Out of scope

No persistence, no backend, no drag-to-connect ER diagram, no auth. Pure client-side visual sandbox.
