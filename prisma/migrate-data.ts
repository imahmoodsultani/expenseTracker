/**
 * One-time data migration: local MySQL → Turso (SQLite)
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... \
 *   MYSQL_URL=mysql://expense_user:expense_pass@localhost:3306/expense_tracker \
 *   npx tsx prisma/migrate-data.ts
 */

import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

// ─── Connect to Turso ─────────────────────────────────────────────────────────

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  console.error("Missing TURSO_DATABASE_URL");
  process.exit(1);
}

const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any) as any;

// ─── Connect to MySQL ─────────────────────────────────────────────────────────

const mysqlUrl = process.env.MYSQL_URL ?? "mysql://expense_user:expense_pass@localhost:3306/expense_tracker";

async function main() {
  const db = await mysql.createConnection(mysqlUrl);
  console.log("✓ Connected to MySQL");

  // ── Clear Turso first (children → parents order) ──────────────────────────
  console.log("  Clearing existing Turso data...");
  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ Turso cleared");

  // ── 1. Users ──────────────────────────────────────────────────────────────
  const [users] = await db.query<any[]>("SELECT * FROM User");
  console.log(`  Migrating ${users.length} users...`);
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        password: u.password,
        name: u.name ?? null,
        phoneNumber: u.phoneNumber ?? null,
        address: u.address ?? null,
        emailVerified: u.emailVerified ? new Date(u.emailVerified) : null,
        createdAt: new Date(u.createdAt),
      },
    });
  }
  console.log("  ✓ Users done");

  // ── 2. Accounts ───────────────────────────────────────────────────────────
  const [accounts] = await db.query<any[]>("SELECT * FROM Account");
  console.log(`  Migrating ${accounts.length} accounts...`);
  for (const a of accounts) {
    await prisma.account.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        userId: a.userId,
        type: a.type,
        provider: a.provider,
        providerAccountId: a.providerAccountId,
        refresh_token: a.refresh_token ?? null,
        access_token: a.access_token ?? null,
        expires_at: a.expires_at ?? null,
        token_type: a.token_type ?? null,
        scope: a.scope ?? null,
        id_token: a.id_token ?? null,
        session_state: a.session_state ?? null,
      },
    });
  }
  console.log("  ✓ Accounts done");

  // ── 3. Sessions ───────────────────────────────────────────────────────────
  const [sessions] = await db.query<any[]>("SELECT * FROM Session");
  console.log(`  Migrating ${sessions.length} sessions...`);
  for (const s of sessions) {
    await prisma.session.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        sessionToken: s.sessionToken,
        userId: s.userId,
        expires: new Date(s.expires),
      },
    });
  }
  console.log("  ✓ Sessions done");

  // ── 4. Verification tokens ────────────────────────────────────────────────
  const [tokens] = await db.query<any[]>("SELECT * FROM VerificationToken");
  console.log(`  Migrating ${tokens.length} verification tokens...`);
  for (const t of tokens) {
    await prisma.verificationToken.upsert({
      where: { token: t.token },
      update: {},
      create: {
        identifier: t.identifier,
        token: t.token,
        expires: new Date(t.expires),
      },
    });
  }
  console.log("  ✓ Verification tokens done");

  // ── 5. Projects ───────────────────────────────────────────────────────────
  const [projects] = await db.query<any[]>("SELECT * FROM Project");
  console.log(`  Migrating ${projects.length} projects...`);
  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        userId: p.userId,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
    });
  }
  console.log("  ✓ Projects done");

  // ── 6. Categories ─────────────────────────────────────────────────────────
  const [categories] = await db.query<any[]>("SELECT * FROM Category");
  console.log(`  Migrating ${categories.length} categories...`);
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        type: c.type,   // enum value stored as string — compatible
        scope: c.scope, // enum value stored as string — compatible
        isDeleted: Boolean(c.isDeleted),
        userId: c.userId ?? null,
        projectId: c.projectId ?? null,
        createdAt: new Date(c.createdAt),
      },
    });
  }
  console.log("  ✓ Categories done");

  // ── 7. Expenses (non-recurring parents first, then children) ──────────────
  const [expenses] = await db.query<any[]>(
    "SELECT * FROM Expense ORDER BY recurrenceParentId IS NOT NULL, createdAt ASC"
  );
  console.log(`  Migrating ${expenses.length} expenses...`);
  for (const e of expenses) {
    await prisma.expense.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        title: e.title,
        amount: e.amount,
        date: new Date(e.date),
        description: e.description ?? null,
        categoryId: e.categoryId,
        userId: e.userId,
        projectId: e.projectId ?? null,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
        isRecurring: Boolean(e.isRecurring),
        recurrenceFrequency: e.recurrenceFrequency ?? null,
        nextDueDate: e.nextDueDate ? new Date(e.nextDueDate) : null,
        recurrenceLastGeneratedDate: e.recurrenceLastGeneratedDate
          ? new Date(e.recurrenceLastGeneratedDate)
          : null,
        recurrenceParentId: e.recurrenceParentId ?? null,
      },
    });
  }
  console.log("  ✓ Expenses done");

  await db.end();
  await prisma.$disconnect();
  console.log("\n✅ Migration complete!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
