export type Constraint =
  | { kind: "PRIMARY KEY" }
  | { kind: "NOT NULL" }
  | { kind: "UNIQUE" }
  | { kind: "DEFAULT"; value: string }
  | { kind: "FOREIGN KEY"; table: string; column?: string };

export type Column = {
  name: string;
  type: string;
  constraints: Constraint[];
};

export type Table = {
  name: string;
  columns: Column[];
};

export type ParseResult = {
  tables: Table[];
  errors: string[];
};

function stripComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--[^\n]*/g, "");
}

// Split by commas at paren depth 0
function splitTopLevel(input: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  let inStr: string | null = null;
  for (const ch of input) {
    if (inStr) {
      buf += ch;
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inStr = ch;
      buf += ch;
      continue;
    }
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

// Extract table blocks handling nested parens
function extractTables(sql: string): { name: string; body: string }[] {
  const tables: { name: string; body: string }[] = [];
  const re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"']?)([\w.]+)\1\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    const name = m[2].split(".").pop() as string;
    const start = re.lastIndex; // position after opening (
    let depth = 1;
    let i = start;
    while (i < sql.length && depth > 0) {
      const c = sql[i];
      if (c === "(") depth++;
      else if (c === ")") depth--;
      i++;
    }
    if (depth === 0) {
      const body = sql.slice(start, i - 1);
      tables.push({ name, body });
    }
  }
  return tables;
}

function parseColumnDef(def: string): Column | null {
  const trimmed = def.trim();
  if (!trimmed) return null;

  // Match name + type (type may include (n) or (n,m))
  const m = trimmed.match(/^([`"']?)([\w]+)\1\s+([A-Za-z][\w]*(?:\s*\([^)]*\))?)(.*)$/);
  if (!m) return null;

  const name = m[2];
  const type = m[3].replace(/\s+/g, "").toUpperCase();
  const rest = m[4];
  const upper = rest.toUpperCase();

  const constraints: Constraint[] = [];
  if (/\bPRIMARY\s+KEY\b/.test(upper)) constraints.push({ kind: "PRIMARY KEY" });
  if (/\bNOT\s+NULL\b/.test(upper)) constraints.push({ kind: "NOT NULL" });
  if (/\bUNIQUE\b/.test(upper)) constraints.push({ kind: "UNIQUE" });

  const def0 = rest.match(/\bDEFAULT\s+([^,]+?)(?:\s+(?:NOT\s+NULL|UNIQUE|PRIMARY|REFERENCES|CHECK)\b|$)/i);
  if (def0) constraints.push({ kind: "DEFAULT", value: def0[1].trim() });

  const ref = rest.match(/\bREFERENCES\s+([`"']?)([\w.]+)\1(?:\s*\(\s*([`"']?)([\w]+)\3\s*\))?/i);
  if (ref) {
    constraints.push({
      kind: "FOREIGN KEY",
      table: ref[2].split(".").pop() as string,
      column: ref[4],
    });
  }

  return { name, type, constraints };
}

export function parseSql(sql: string): ParseResult {
  const errors: string[] = [];
  const cleaned = stripComments(sql);
  const raw = extractTables(cleaned);

  if (raw.length === 0) {
    return {
      tables: [],
      errors: ["No CREATE TABLE statements found."],
    };
  }

  const tables: Table[] = [];

  for (const { name, body } of raw) {
    const parts = splitTopLevel(body);
    const columns: Column[] = [];
    const tableLevelPk: string[] = [];
    const tableLevelUq: string[] = [];
    const tableLevelFk: { column: string; refTable: string; refColumn?: string }[] = [];

    for (const part of parts) {
      const upper = part.toUpperCase().trim();

      // table-level constraint: PRIMARY KEY (col, ...)
      const pk = part.match(/^\s*(?:CONSTRAINT\s+\w+\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pk) {
        pk[1].split(",").forEach((c) => tableLevelPk.push(c.trim().replace(/["`']/g, "")));
        continue;
      }
      const uq = part.match(/^\s*(?:CONSTRAINT\s+\w+\s+)?UNIQUE\s*\(([^)]+)\)/i);
      if (uq) {
        uq[1].split(",").forEach((c) => tableLevelUq.push(c.trim().replace(/["`']/g, "")));
        continue;
      }
      const fk = part.match(
        /^\s*(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([`"']?)([\w.]+)\2(?:\s*\(\s*([`"']?)([\w]+)\4\s*\))?/i
      );
      if (fk) {
        const cols = fk[1].split(",").map((c) => c.trim().replace(/["`']/g, ""));
        cols.forEach((c) =>
          tableLevelFk.push({
            column: c,
            refTable: fk[3].split(".").pop() as string,
            refColumn: fk[5],
          })
        );
        continue;
      }
      if (upper.startsWith("CHECK") || upper.startsWith("CONSTRAINT")) continue;

      const col = parseColumnDef(part);
      if (col) columns.push(col);
    }

    // Merge table-level constraints
    for (const c of columns) {
      if (tableLevelPk.includes(c.name) && !c.constraints.some((x) => x.kind === "PRIMARY KEY")) {
        c.constraints.push({ kind: "PRIMARY KEY" });
      }
      if (tableLevelUq.includes(c.name) && !c.constraints.some((x) => x.kind === "UNIQUE")) {
        c.constraints.push({ kind: "UNIQUE" });
      }
      const fk = tableLevelFk.find((f) => f.column === c.name);
      if (fk && !c.constraints.some((x) => x.kind === "FOREIGN KEY")) {
        c.constraints.push({ kind: "FOREIGN KEY", table: fk.refTable, column: fk.refColumn });
      }
    }

    tables.push({ name, columns });
  }

  return { tables, errors };
}
