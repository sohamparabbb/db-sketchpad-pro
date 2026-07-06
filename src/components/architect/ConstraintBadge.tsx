import type { Constraint } from "@/lib/architect/parseSql";

export function ConstraintBadge({ c }: { c: Constraint }) {
  const base =
    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase font-mono";

  switch (c.kind) {
    case "PRIMARY KEY":
      return (
        <span
          className={base}
          style={{
            borderColor: "rgba(245,165,36,0.35)",
            backgroundColor: "rgba(245,165,36,0.08)",
            color: "#F5A524",
          }}
        >
          PK
        </span>
      );
    case "FOREIGN KEY":
      return (
        <span
          className={base}
          style={{
            borderColor: "rgba(56,189,248,0.35)",
            backgroundColor: "rgba(56,189,248,0.08)",
            color: "#38BDF8",
          }}
          title={c.table ? `→ ${c.table}${c.column ? `(${c.column})` : ""}` : undefined}
        >
          FK → {c.table}
        </span>
      );
    case "NOT NULL":
      return (
        <span className={base} style={{ borderColor: "rgba(255,255,255,0.12)", color: "#E5E5E7" }}>
          NOT NULL
        </span>
      );
    case "UNIQUE":
      return (
        <span className={base} style={{ borderColor: "rgba(255,255,255,0.12)", color: "#E5E5E7" }}>
          UNIQUE
        </span>
      );
    case "DEFAULT":
      return (
        <span
          className={base}
          style={{ borderColor: "rgba(255,255,255,0.08)", color: "#8A8A90" }}
          title={`DEFAULT ${c.value}`}
        >
          DEFAULT
        </span>
      );
  }
}
