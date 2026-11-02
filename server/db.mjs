import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const sql = neon(process.env.DATABASE_URL);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS content_entries (
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
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash VARCHAR(64) PRIMARY KEY,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}

function mapRow(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt ?? "",
    image: row.image ?? "",
    gallery: row.gallery ?? [],
    status: row.status,
  };
}

function normalizeRows(result) {
  if (Array.isArray(result)) return result;
  return result?.rows ?? [];
}

export async function listContent({ publishedOnly = false } = {}) {
  const query = publishedOnly
    ? sql`SELECT * FROM content_entries WHERE status != 'Draft' ORDER BY id DESC`
    : sql`SELECT * FROM content_entries ORDER BY id DESC`;
  const rows = normalizeRows(await query);
  return rows.map(mapRow);
}

export async function getContentById(id) {
  const result = normalizeRows(await sql`SELECT * FROM content_entries WHERE id = ${id}`);
  if (result.length === 0) return null;
  return mapRow(result[0]);
}

export async function createContent(entry) {
  const result = normalizeRows(await sql`
    INSERT INTO content_entries (type, title, category, excerpt, image, gallery, status)
    VALUES (${entry.type}, ${entry.title}, ${entry.category}, ${entry.excerpt}, ${entry.image}, ${JSON.stringify(entry.gallery ?? [])}::jsonb, ${entry.status})
    RETURNING *
  `);
  return mapRow(result[0]);
}

export async function updateContent(id, entry) {
  const result = normalizeRows(await sql`
    UPDATE content_entries
    SET type = ${entry.type}, title = ${entry.title}, category = ${entry.category},
        excerpt = ${entry.excerpt}, image = ${entry.image},
        gallery = ${JSON.stringify(entry.gallery ?? [])}::jsonb,
        status = ${entry.status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `);
  if (result.length === 0) return null;
  return mapRow(result[0]);
}

export async function deleteContent(id) {
  const result = normalizeRows(await sql`DELETE FROM content_entries WHERE id = ${id} RETURNING id`);
  return result.length > 0;
}

export async function createSession(tokenHash, expiresAt) {
  await sql`
    INSERT INTO sessions (token_hash, expires_at)
    VALUES (${tokenHash}, ${expiresAt})
    ON CONFLICT (token_hash) DO UPDATE SET expires_at = ${expiresAt}
  `;
}

export async function getSession(tokenHash) {
  const result = normalizeRows(await sql`SELECT * FROM sessions WHERE token_hash = ${tokenHash}`);
  return result.length > 0 ? result[0] : null;
}

export async function updateSession(tokenHash, expiresAt) {
  await sql`
    UPDATE sessions SET expires_at = ${expiresAt} WHERE token_hash = ${tokenHash}
  `;
}

export async function deleteSession(tokenHash) {
  await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
}

export async function cleanupSessions() {
  await sql`DELETE FROM sessions WHERE expires_at <= NOW()`;
}
