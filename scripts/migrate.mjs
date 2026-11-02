import { sql } from "../server/db.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const dataFile = path.join(process.cwd(), "server/data/content.json");

async function migrate() {
  console.log("Initializing database schema...");
  await sql`CREATE TABLE IF NOT EXISTS content_entries (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'Story',
    title VARCHAR(180) NOT NULL DEFAULT '',
    category VARCHAR(80) NOT NULL DEFAULT 'Uncategorized',
    excerpt TEXT DEFAULT '',
    image TEXT DEFAULT '',
    gallery JSONB DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'Published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`;

  const existing = await sql`SELECT COUNT(*) as count FROM content_entries`;
  const existingRows = existing.rows ?? existing;
  const count = Number(existingRows[0]?.count ?? 0);
  if (count > 0) {
    console.log(`Database already contains ${count} entries. Skipping migration.`);
    return;
  }

  console.log("Reading existing JSON content...");
  const content = JSON.parse(await fs.readFile(dataFile, "utf8"));
  console.log(`Found ${content.length} entries to migrate.`);

  for (const entry of content) {
    await sql`
      INSERT INTO content_entries (type, title, category, excerpt, image, gallery, status)
      VALUES (${entry.type}, ${entry.title}, ${entry.category}, ${entry.excerpt}, ${entry.image}, ${JSON.stringify(entry.gallery ?? [])}::jsonb, ${entry.status})
    `;
  }

  const verify = await sql`SELECT COUNT(*) as count FROM content_entries`;
  const verifyRows = verify.rows ?? verify;
  console.log(`Migration complete. ${verifyRows[0]?.count} entries in database.`);
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
