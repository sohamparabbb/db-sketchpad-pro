export type Template = {
  id: string;
  label: string;
  description: string;
  sql: string;
};

export const DEFAULT_SQL = `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

export const TEMPLATES: Template[] = [
  {
    id: "ecommerce",
    label: "E-commerce Orders Table",
    description: "Orders with customer + total",
    sql: `CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id),
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  total_cents INTEGER NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  shipped_at TIMESTAMPTZ
);`,
  },
  {
    id: "auth",
    label: "User Auth Schema",
    description: "Accounts + sessions",
    sql: `CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
  },
  {
    id: "analytics",
    label: "Analytics Events",
    description: "Event stream with metadata",
    sql: `CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_name VARCHAR(120) NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  session_id UUID NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
  },
];
