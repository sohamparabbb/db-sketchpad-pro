import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { InputPanel } from "@/components/architect/InputPanel";
import { SchemaPanel } from "@/components/architect/SchemaPanel";
import { parseSql, type ParseResult } from "@/lib/architect/parseSql";
import { DEFAULT_SQL, TEMPLATES } from "@/lib/architect/templates";

export const Route = createFileRoute("/")({
  component: ArchitectPage,
});

function ArchitectPage() {
  const [sql, setSql] = useState<string>(DEFAULT_SQL);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const handleParse = () => {
    setResult(parseSql(sql));
  };

  const handleTemplate = (nextSql: string) => {
    setSql(nextSql);
    const tpl = TEMPLATES.find((t) => t.sql === nextSql);
    setActiveTemplateId(tpl?.id ?? null);
    setResult(parseSql(nextSql));
  };

  return (
    <div
      className="min-h-screen text-foreground"
      style={{ backgroundColor: "#0B0B0C" }}
    >
      <header
        className="flex items-center justify-between border-b px-6 py-4 lg:px-10"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-8 w-8 place-items-center rounded-md"
            style={{
              backgroundColor: "#F5A524",
              color: "#0B0B0C",
              boxShadow: "0 8px 24px -12px rgba(245,165,36,0.6)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M4 20L12 4l8 16" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14h10" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-[0.24em] text-foreground">
              ARCHITECT
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Schema Sandbox
            </span>
          </div>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            v1.0 · client-side parser
          </span>
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider"
            style={{
              borderColor: "rgba(56,189,248,0.25)",
              color: "#38BDF8",
              backgroundColor: "rgba(56,189,248,0.04)",
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#38BDF8" }}
            />
            Live
          </span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2">
        <InputPanel
          value={sql}
          onChange={(v) => {
            setSql(v);
            setActiveTemplateId(null);
          }}
          onParse={handleParse}
          onTemplate={handleTemplate}
          activeTemplateId={activeTemplateId}
        />
        <SchemaPanel result={result} />
      </main>
    </div>
  );
}
