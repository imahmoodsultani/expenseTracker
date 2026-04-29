/**
 * Migrates the Turso (LibSQL) database from CUID string IDs to integer auto-increment IDs.
 *
 * Run with:
 *   npx tsx scripts/migrate-turso-ids.ts
 *
 * Reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from .env.local.
 * Safe to run multiple times — aborts early if IDs are already integers.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as crypto from "crypto";
import * as fs from "fs";
import { createClient } from "@libsql/client";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MIGRATION_NAME = "20260429084930_init";
const MIGRATION_SQL_PATH = path.resolve(
  process.cwd(),
  `prisma/migrations/${MIGRATION_NAME}/migration.sql`
);

function computeChecksum(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf-8");
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("TURSO_DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  // ── Check if already migrated ────────────────────────────────────────────
  const checkUser = await client.execute("SELECT id FROM User LIMIT 1");
  if (checkUser.rows.length > 0) {
    const sampleId = checkUser.rows[0].id;
    if (typeof sampleId === "number" || (typeof sampleId === "bigint")) {
      console.log("✓ IDs are already integers — nothing to migrate.");
      await client.close();
      return;
    }
  }

  // ── Read all existing data ────────────────────────────────────────────────
  console.log("Reading existing data from Turso...");

  const [usersRes, projectsRes, categoriesRes, expensesRes, accountsRes, sessionsRes, verifyTokensRes] =
    await Promise.all([
      client.execute("SELECT * FROM User ORDER BY createdAt ASC"),
      client.execute("SELECT * FROM Project ORDER BY createdAt ASC"),
      client.execute("SELECT * FROM Category ORDER BY createdAt ASC"),
      client.execute("SELECT * FROM Expense ORDER BY createdAt ASC"),
      client.execute("SELECT * FROM Account"),
      client.execute("SELECT * FROM Session"),
      client.execute("SELECT * FROM VerificationToken"),
    ]);

  const users = usersRes.rows;
  const projects = projectsRes.rows;
  const categories = categoriesRes.rows;
  const expenses = expensesRes.rows;
  const accounts = accountsRes.rows;
  const sessions = sessionsRes.rows;
  const verifyTokens = verifyTokensRes.rows;

  console.log(
    `  Users: ${users.length}, Projects: ${projects.length}, Categories: ${categories.length}, Expenses: ${expenses.length}`
  );
  console.log(`  Accounts: ${accounts.length}, Sessions: ${sessions.length}`);

  // ── Build CUID → integer ID maps ─────────────────────────────────────────
  const userMap = new Map<string, number>();
  users.forEach((r, i) => userMap.set(String(r.id), i + 1));

  const projectMap = new Map<string, number>();
  projects.forEach((r, i) => projectMap.set(String(r.id), i + 1));

  const categoryMap = new Map<string, number>();
  categories.forEach((r, i) => categoryMap.set(String(r.id), i + 1));

  const expenseMap = new Map<string, number>();
  expenses.forEach((r, i) => expenseMap.set(String(r.id), i + 1));

  // ── Build batch statements ────────────────────────────────────────────────
  type Stmt = { sql: string; args?: (string | number | null | bigint)[] };
  const stmts: Stmt[] = [];

  stmts.push({ sql: "PRAGMA foreign_keys = OFF" });

  // Drop tables in reverse dependency order
  for (const t of ["Expense", "Category", "Project", "Account", "Session", "VerificationToken", "User"]) {
    stmts.push({ sql: `DROP TABLE IF EXISTS "${t}"` });
  }

  // Recreate tables (exact DDL from migration)
  stmts.push({
    sql: `CREATE TABLE "User" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "name" TEXT,
      "phoneNumber" TEXT,
      "address" TEXT,
      "emailVerified" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  });
  stmts.push({ sql: `CREATE UNIQUE INDEX "User_email_key" ON "User"("email")` });

  stmts.push({
    sql: `CREATE TABLE "Account" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "type" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token" TEXT,
      "access_token" TEXT,
      "expires_at" INTEGER,
      "token_type" TEXT,
      "scope" TEXT,
      "id_token" TEXT,
      "session_state" TEXT,
      CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  });
  stmts.push({
    sql: `CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`,
  });

  stmts.push({
    sql: `CREATE TABLE "Session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionToken" TEXT NOT NULL,
      "userId" INTEGER NOT NULL,
      "expires" DATETIME NOT NULL,
      CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  });
  stmts.push({ sql: `CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken")` });

  stmts.push({
    sql: `CREATE TABLE "VerificationToken" (
      "identifier" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "expires" DATETIME NOT NULL
    )`,
  });
  stmts.push({ sql: `CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token")` });
  stmts.push({
    sql: `CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token")`,
  });

  stmts.push({
    sql: `CREATE TABLE "Project" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "userId" INTEGER NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  });

  stmts.push({
    sql: `CREATE TABLE "Category" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "scope" TEXT NOT NULL,
      "isDeleted" BOOLEAN NOT NULL DEFAULT false,
      "userId" INTEGER,
      "projectId" INTEGER,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Category_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  });

  stmts.push({
    sql: `CREATE TABLE "Expense" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "title" TEXT NOT NULL,
      "amount" DECIMAL NOT NULL,
      "date" DATETIME NOT NULL,
      "description" TEXT,
      "categoryId" INTEGER NOT NULL,
      "userId" INTEGER NOT NULL,
      "projectId" INTEGER,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      "isRecurring" BOOLEAN NOT NULL DEFAULT false,
      "recurrenceFrequency" TEXT,
      "nextDueDate" DATETIME,
      "recurrenceLastGeneratedDate" DATETIME,
      "recurrenceParentId" INTEGER,
      CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Expense_recurrenceParentId_fkey" FOREIGN KEY ("recurrenceParentId") REFERENCES "Expense" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
  });

  // ── Insert Users ──────────────────────────────────────────────────────────
  for (let i = 0; i < users.length; i++) {
    const r = users[i];
    stmts.push({
      sql: `INSERT INTO "User" (id, email, password, name, phoneNumber, address, emailVerified, createdAt) VALUES (?,?,?,?,?,?,?,?)`,
      args: [i + 1, r.email as string, r.password as string, (r.name ?? null) as string | null, (r.phoneNumber ?? null) as string | null, (r.address ?? null) as string | null, (r.emailVerified ?? null) as string | null, r.createdAt as string],
    });
  }

  // ── Insert Projects ───────────────────────────────────────────────────────
  for (let i = 0; i < projects.length; i++) {
    const r = projects[i];
    const userId = userMap.get(String(r.userId));
    if (!userId) throw new Error(`Project ${r.id}: userId ${r.userId} not found in userMap`);
    stmts.push({
      sql: `INSERT INTO "Project" (id, name, userId, createdAt, updatedAt) VALUES (?,?,?,?,?)`,
      args: [i + 1, r.name as string, userId, r.createdAt as string, r.updatedAt as string],
    });
  }

  // ── Insert Categories ─────────────────────────────────────────────────────
  for (let i = 0; i < categories.length; i++) {
    const r = categories[i];
    const userId = r.userId ? (userMap.get(String(r.userId)) ?? null) : null;
    const projectId = r.projectId ? (projectMap.get(String(r.projectId)) ?? null) : null;
    const isDeleted = r.isDeleted ? 1 : 0;
    stmts.push({
      sql: `INSERT INTO "Category" (id, name, type, scope, isDeleted, userId, projectId, createdAt) VALUES (?,?,?,?,?,?,?,?)`,
      args: [i + 1, r.name as string, r.type as string, r.scope as string, isDeleted, userId, projectId, r.createdAt as string],
    });
  }

  // ── Insert Expenses ───────────────────────────────────────────────────────
  for (let i = 0; i < expenses.length; i++) {
    const r = expenses[i];
    const userId = userMap.get(String(r.userId));
    const categoryId = categoryMap.get(String(r.categoryId));
    const projectId = r.projectId ? (projectMap.get(String(r.projectId)) ?? null) : null;
    const recurrenceParentId = r.recurrenceParentId
      ? (expenseMap.get(String(r.recurrenceParentId)) ?? null)
      : null;
    const isRecurring = r.isRecurring ? 1 : 0;

    if (!userId) throw new Error(`Expense ${r.id}: userId ${r.userId} not found`);
    if (!categoryId) throw new Error(`Expense ${r.id}: categoryId ${r.categoryId} not found`);

    stmts.push({
      sql: `INSERT INTO "Expense" (id, title, amount, date, description, categoryId, userId, projectId, createdAt, updatedAt, isRecurring, recurrenceFrequency, nextDueDate, recurrenceLastGeneratedDate, recurrenceParentId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        i + 1,
        r.title as string,
        r.amount as string,
        r.date as string,
        (r.description ?? null) as string | null,
        categoryId,
        userId,
        projectId,
        r.createdAt as string,
        r.updatedAt as string,
        isRecurring,
        (r.recurrenceFrequency ?? null) as string | null,
        (r.nextDueDate ?? null) as string | null,
        (r.recurrenceLastGeneratedDate ?? null) as string | null,
        recurrenceParentId,
      ],
    });
  }

  // ── Insert Accounts (id stays CUID, userId remapped) ──────────────────────
  for (const r of accounts) {
    const userId = userMap.get(String(r.userId));
    if (!userId) {
      console.warn(`  Skipping Account ${r.id} — userId ${r.userId} not found`);
      continue;
    }
    stmts.push({
      sql: `INSERT INTO "Account" (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [r.id as string, userId, r.type as string, r.provider as string, r.providerAccountId as string, (r.refresh_token ?? null) as string | null, (r.access_token ?? null) as string | null, (r.expires_at ?? null) as number | null, (r.token_type ?? null) as string | null, (r.scope ?? null) as string | null, (r.id_token ?? null) as string | null, (r.session_state ?? null) as string | null],
    });
  }

  // ── Insert Sessions (id stays CUID, userId remapped) ─────────────────────
  for (const r of sessions) {
    const userId = userMap.get(String(r.userId));
    if (!userId) {
      console.warn(`  Skipping Session ${r.id} — userId ${r.userId} not found`);
      continue;
    }
    stmts.push({
      sql: `INSERT INTO "Session" (id, sessionToken, userId, expires) VALUES (?,?,?,?)`,
      args: [r.id as string, r.sessionToken as string, userId, r.expires as string],
    });
  }

  // ── Insert VerificationTokens (no FK to remap) ────────────────────────────
  for (const r of verifyTokens) {
    stmts.push({
      sql: `INSERT INTO "VerificationToken" (identifier, token, expires) VALUES (?,?,?)`,
      args: [r.identifier as string, r.token as string, r.expires as string],
    });
  }

  stmts.push({ sql: "PRAGMA foreign_keys = ON" });

  // ── Update _prisma_migrations ─────────────────────────────────────────────
  const checksum = computeChecksum(MIGRATION_SQL_PATH);
  const migrationId = crypto.randomUUID();
  const now = new Date().toISOString();

  stmts.push({
    sql: `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )`,
  });
  stmts.push({ sql: "DELETE FROM _prisma_migrations" });
  stmts.push({
    sql: `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES (?,?,?,?,?,?,?,?)`,
    args: [migrationId, checksum, now, MIGRATION_NAME, null, null, now, 1],
  });

  // ── Execute in batches of 50 ──────────────────────────────────────────────
  console.log(`\nExecuting ${stmts.length} statements...`);
  const BATCH = 50;
  for (let i = 0; i < stmts.length; i += BATCH) {
    const slice = stmts.slice(i, i + BATCH);
    await client.batch(slice as Parameters<typeof client.batch>[0], "write");
    process.stdout.write(`\r  Progress: ${Math.min(i + BATCH, stmts.length)}/${stmts.length}`);
  }
  console.log("\n\n✓ Migration complete.");
  console.log(`  Users migrated:      ${users.length}`);
  console.log(`  Projects migrated:   ${projects.length}`);
  console.log(`  Categories migrated: ${categories.length}`);
  console.log(`  Expenses migrated:   ${expenses.length}`);

  await client.close();
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message);
  process.exit(1);
});
