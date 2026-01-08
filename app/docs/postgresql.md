## PostgreSQL Guide

This document outlines how PostgreSQL is used in this project, including local setup, environment configuration, Prisma integration, essential SQL queries, and upcoming database tasks.

---

### 1) Local Setup

- Install PostgreSQL 14+ (Windows Installer). Set a password for the `postgres` superuser.
- Create a database for this app (example):

```sql
CREATE DATABASE nexuspath;
```

- Optional user and privileges (recommended for local dev):

```sql
CREATE USER nexus WITH PASSWORD 'nexus_password';
GRANT ALL PRIVILEGES ON DATABASE nexuspath TO nexus;
```

Connection string format for `.env`:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/nexuspath?schema=public"
```

---

### 2) Prisma Integration

- Schema file: `prisma/schema.prisma`
- Generate client after schema changes:

```bash
npx prisma generate
```

- Create and run migrations (after adding models/fields):

```bash
npx prisma migrate dev --name init
```

- Inspect data quickly:

```bash
npx prisma studio
```

Current base model in use:

```prisma
model User {
  id       String @id @default(uuid())
  email    String @unique
  password String
  role     String @default("student") // "admin" | "faculty" | "student"
}
``;

---

### 3) Essential SQL (DDL/DML)

- Ensure `users` table (raw SQL reference equivalent of current Prisma model):

```sql
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student'
);
```

- Helpful indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);
```

- Insert sample users (for local testing only):

```sql
INSERT INTO "User" (email, password, role)
VALUES
  ('admin@example.com',  '$2b$10$<bcrypt-hash>', 'admin'),
  ('faculty@example.com','$2b$10$<bcrypt-hash>', 'faculty'),
  ('student@example.com','$2b$10$<bcrypt-hash>', 'student');
```

- Basic selects:

```sql
SELECT id, email, role FROM "User" ORDER BY email;
SELECT COUNT(*) FROM "User" WHERE role = 'student';
```

- Update/delete examples:

```sql
UPDATE "User" SET role = 'faculty' WHERE email = 'student@example.com';
DELETE FROM "User" WHERE email = 'faculty@example.com';
```

---

### 4) Future Tables (Planned)

These align with the roadmap and will be added via Prisma migrations:

```prisma
model CareerPath {
  id          String  @id @default(uuid())
  name        String
  description String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model StudentCareerPath {
  id           String @id @default(uuid())
  studentId    String
  careerPathId String
}

model Submission {
  id              String   @id @default(uuid())
  studentId       String
  skill           String
  score           Int
  createdAt       DateTime @default(now())
  // Phase 6 (Anti-Cheating)
  copyPasteCount  Int      @default(0)
  timeSpentSec    Int      @default(0)
  tabSwitches     Int      @default(0)
}
```

---

### 5) psql Quick Reference

```bash
psql -U nexus -h localhost -p 5432 -d nexuspath
```

Useful `psql` commands:

- List DBs: `\l`
- Connect: `\c nexuspath`
- List tables: `\dt`
- Describe table: `\d "User"`
- Quit: `\q`

---

### 6) Troubleshooting

- Cannot connect: verify Postgres service is running, credentials, and port 5432.
- Migration errors: ensure `DATABASE_URL` matches your DB and remove conflicting manual tables before re-running.
- Prisma client errors: re-run `npx prisma generate` after editing `schema.prisma`.

---

### 7) Upcoming Tasks (DB-related)

- Role-based authorization support data checks (T2.02)
  - Ensure `User.role` values are constrained at the app layer (possible enum in Prisma later).

- Admin User Management (T3.01)
  - Migrations to support audit fields (createdBy, updatedBy) if needed.

- Faculty–Student Assignment (T3.02)
  - Add relationship table (e.g., `FacultyStudent` with `facultyId`, `studentId`).

- Career Path (T4.01/T4.02)
  - Create `CareerPath`, `StudentCareerPath`, and optional `Skill` tables.

- AI & Analytics (T5/T7)
  - Extend `Submission` for analytics and AI recommendations.

- Anti-Cheating (T6.02)
  - Finalize `Submission` telemetry fields and indexes for reporting.

---

### 8) Handy Queries for Analytics (Preview)

```sql
-- Students count by role
SELECT role, COUNT(*) AS users
FROM "User"
GROUP BY role
ORDER BY users DESC;

-- Submissions per skill (requires `Submission`)
SELECT skill, COUNT(*) AS attempts, AVG(score)::int AS avg_score
FROM "Submission"
GROUP BY skill
ORDER BY attempts DESC;
```


