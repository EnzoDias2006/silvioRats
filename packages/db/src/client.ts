import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

export function resolveSqlitePath(databaseUrl = process.env.DATABASE_URL) {
  const url = databaseUrl ?? "file:./data/silviorats.sqlite";
  return url.startsWith("file:") ? url.slice(5) : url;
}

const sqlitePath = resolveSqlitePath();
mkdirSync(dirname(sqlitePath), { recursive: true });

export const sqlite = new Database(sqlitePath);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });

export type DatabaseClient = typeof db;
