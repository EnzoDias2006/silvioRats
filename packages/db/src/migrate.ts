import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./client";

const currentDir = dirname(fileURLToPath(import.meta.url));
export const migrationsFolder = join(currentDir, "migrations");

migrate(db, { migrationsFolder });
console.log("Database migrations applied.");
