import type { ParseResult, Table } from "@/lib/architect/parseSql";
import { ConstraintBadge } from "./ConstraintBadge";

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.657 3.582 3 8 3s8-1.343 8-3V5" />
      <path d="M4 11v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" />
    </svg>
  );
}

function TableCard({ table }: { table: Table }) {
  return (
    <div
      className="overflow-hidden rounded-xl border animate-fade-in"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "#161618",
        boxShadow: "0 20px 60px -30px rgba(0,0,0,0.8)",
      }}
    >
      <header
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
            style={{
              backgroundColor: "rgba(245,165,36,0.08)",
              color: "#F5A524",
              border: "1px solid rgba(245,165,36,0.2)",
            }}
          >
            <DatabaseIcon className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Table
            </span>
            <span className="truncate font-mono text-base font-semibold text-foreground">
              {table.name}
            </span>
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {table.columns.length} {table.columns.length === 1 ? "column" : "columns"}
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
              style={{ backgroundColor: "rgba(255,255,255,0.015)" }}
            >
              <th className="px-5 py-2.5 text-left font-medium">Column</th>
              <th className="px-5 py-2.5 text-left font-medium">Type</th>
              <th className="px-5 py-2.5 text-left font-medium">Constraints</th>
            </tr>
          </thead>
          <tbody>
            {table.columns.map((c, i) => (
              <tr
                key={c.name + i}
                className="border-t transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <td className="px-5 py-3 font-mono text-[13px] text-foreground">{c.name}</td>
                <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{c.type}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {c.constraints.length === 0 ? (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    ) : (
                      c.constraints.map((con, j) => <ConstraintBadge key={j} c={con} />)
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="max-w-sm text-center">
        <div
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            backgroundColor: "rgba(255,255,255,0.02)",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <DatabaseIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-6 text-lg font-medium tracking-tight text-foreground">
          Awaiting Schema Input…
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Paste SQL or select a template to visualize your architecture.
        </p>
      </div>
    </div>
  );
}

type Props = {
  result: ParseResult | null;
};

export function SchemaPanel({ result }: Props) {
  return (
    <section
      className="flex min-h-0 min-w-0 flex-col gap-6 border-t p-6 lg:border-l lg:border-t-0 lg:p-10"
      style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#0D0D0F" }}
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ backgroundColor: "#38BDF8" }}
            />
            Visual Sandbox
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Schema</h2>
        </div>
        {result && result.tables.length > 0 && (
          <span
            className="shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
            style={{
              borderColor: "rgba(56,189,248,0.3)",
              color: "#38BDF8",
              backgroundColor: "rgba(56,189,248,0.05)",
            }}
          >
            {result.tables.length} {result.tables.length === 1 ? "table" : "tables"} parsed
          </span>
        )}
      </header>

      {!result ? (
        <EmptyState />
      ) : result.tables.length === 0 ? (
        <div
          className="rounded-xl border p-6 text-sm animate-fade-in"
          style={{
            borderColor: "rgba(239,68,68,0.25)",
            backgroundColor: "rgba(239,68,68,0.05)",
            color: "#FCA5A5",
          }}
        >
          {result.errors[0] ?? "Unable to parse SQL."}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {result.tables.map((t, i) => (
            <TableCard key={t.name + i} table={t} />
          ))}
        </div>
      )}
    </section>
  );
}
