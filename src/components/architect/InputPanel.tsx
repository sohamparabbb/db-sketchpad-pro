import { useMemo } from "react";
import { TEMPLATES } from "@/lib/architect/templates";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onParse: () => void;
  onTemplate: (sql: string) => void;
  activeTemplateId?: string | null;
};

export function InputPanel({ value, onChange, onParse, onTemplate, activeTemplateId }: Props) {
  const lineCount = useMemo(() => Math.max(value.split("\n").length, 1), [value]);
  const lines = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1).join("\n"),
    [lineCount]
  );

  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-6 p-6 lg:p-10">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: "#F5A524" }} />
          Input
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">SQL Schema Input</h2>
        <p className="text-sm text-muted-foreground">
          Paste DDL. Parse instantly. Visualize your architecture.
        </p>
      </header>

      <div
        className="group relative flex min-h-[360px] flex-1 overflow-hidden rounded-xl border transition-colors"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: "#0E0E10",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
      >
        <pre
          aria-hidden
          className="select-none py-4 pl-4 pr-2 text-right font-mono text-xs leading-6 text-muted-foreground/60"
          style={{ minWidth: "3rem" }}
        >
          {lines}
        </pre>
        <textarea
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 resize-none bg-transparent py-4 pr-4 font-mono text-[13px] leading-6 text-foreground outline-none placeholder:text-muted-foreground/50"
          placeholder="CREATE TABLE users ( ... );"
        />
      </div>

      <button
        onClick={onParse}
        className="group relative w-full overflow-hidden rounded-xl px-5 py-3.5 text-sm font-semibold tracking-tight transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.99]"
        style={{
          backgroundColor: "#F5A524",
          color: "#0B0B0C",
          boxShadow: "0 10px 30px -12px rgba(245,165,36,0.5)",
        }}
      >
        Parse & Visualize
      </button>

      <div className="flex flex-col gap-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Templates
        </div>
        <div className="grid gap-2">
          {TEMPLATES.map((t) => {
            const active = activeTemplateId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTemplate(t.sql)}
                className="group flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all duration-200 hover:translate-x-0.5"
                style={{
                  borderColor: active ? "rgba(245,165,36,0.4)" : "rgba(255,255,255,0.06)",
                  backgroundColor: active ? "rgba(245,165,36,0.04)" : "#131315",
                }}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{t.label}</span>
                  <span className="truncate text-xs text-muted-foreground">{t.description}</span>
                </div>
                <span
                  className="ml-4 shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-foreground"
                  style={{ color: active ? "#F5A524" : undefined }}
                >
                  Load →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
