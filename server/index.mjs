import "dotenv/config";
import express from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "server/data/content.json");
const production = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5173);
const sessionMs = Number(process.env.SESSION_HOURS || 8) * 60 * 60 * 1000;
const adminIdentifier = process.env.ADMIN_IDENTIFIER?.trim().toLowerCase() || "";
const adminHash = process.env.ADMIN_PASSWORD_HASH || "";
const sessions = new Map();
const attempts = new Map();
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "25mb" }));
app.use((_, res, next) => {
  res.set({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY", "Permissions-Policy": "camera=(), microphone=(), geolocation=()" });
  next();
});

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map(value => { const index = value.indexOf("="); return [value.slice(0, index).trim(), decodeURIComponent(value.slice(index + 1))]; }));
}

function sessionKey(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function requireAdmin(req, res, next) {
  const token = parseCookies(req).zeb_session;
  const session = token && sessions.get(sessionKey(token));
  if (!session || session.expires <= Date.now()) {
    if (token) sessions.delete(sessionKey(token));
    res.clearCookie("zeb_session", { path: "/" });
    return res.status(401).json({ error: "Authentication required." });
  }
  session.expires = Date.now() + sessionMs;
  next();
}

function verifyOrigin(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (!origin) return res.status(403).json({ error: "Request origin is required." });
  try {
    if (new URL(origin).host !== req.get("host")) return res.status(403).json({ error: "Invalid request origin." });
  } catch { return res.status(403).json({ error: "Invalid request origin." }); }
  next();
}

async function readContent() {
  return JSON.parse(await fs.readFile(dataFile, "utf8"));
}

async function writeContent(content) {
  const temporary = `${dataFile}.${process.pid}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(content, null, 2));
  await fs.rename(temporary, dataFile);
}

function cleanEntry(body, id) {
  const allowedTypes = new Set(["Story", "Dish", "Spice", "Region", "Tradition"]);
  const status = body.status === "Draft" ? "Draft" : "Published";
  return {
    id, type: allowedTypes.has(body.type) ? body.type : "Story",
    title: String(body.title || "").trim().slice(0, 180), category: String(body.category || "Uncategorized").trim().slice(0, 80),
    excerpt: String(body.excerpt || "").trim().slice(0, 1000), image: String(body.image || "").trim().slice(0, 7_500_000),
    gallery: Array.isArray(body.gallery) ? body.gallery.slice(0, 6).map(image => String(image).slice(0, 7_500_000)) : [], status,
  };
}

app.use("/api", verifyOrigin);
app.post("/api/auth/login", async (req, res) => {
  const ip = req.ip || "unknown";
  const record = attempts.get(ip) || { count: 0, reset: Date.now() + 15 * 60_000 };
  if (record.reset < Date.now()) Object.assign(record, { count: 0, reset: Date.now() + 15 * 60_000 });
  if (record.count >= 5) return res.status(429).json({ error: "Too many login attempts. Try again later." });
  const identifier = String(req.body.identifier || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!adminIdentifier || !adminHash) return res.status(503).json({ error: "Admin authentication has not been configured on the server." });
  const validPassword = await bcrypt.compare(password, adminHash).catch(() => false);
  if (identifier !== adminIdentifier || !validPassword) {
    record.count += 1; attempts.set(ip, record);
    await new Promise(resolve => setTimeout(resolve, 450));
    return res.status(401).json({ error: "The email/username or password is incorrect." });
  }
  attempts.delete(ip);
  const token = crypto.randomBytes(32).toString("base64url");
  sessions.set(sessionKey(token), { expires: Date.now() + sessionMs });
  res.cookie("zeb_session", token, { httpOnly: true, secure: production, sameSite: "strict", path: "/", maxAge: sessionMs });
  res.json({ authenticated: true });
});

app.get("/api/auth/session", requireAdmin, (_, res) => res.json({ authenticated: true }));
app.post("/api/auth/logout", (req, res) => {
  const token = parseCookies(req).zeb_session;
  if (token) sessions.delete(sessionKey(token));
  res.clearCookie("zeb_session", { httpOnly: true, secure: production, sameSite: "strict", path: "/" });
  res.json({ authenticated: false });
});

app.get("/api/content", async (_, res) => res.json((await readContent()).filter(entry => entry.status !== "Draft")));
app.get("/api/admin/content", requireAdmin, async (_, res) => res.json(await readContent()));
app.post("/api/admin/content", requireAdmin, async (req, res) => {
  const content = await readContent();
  const entry = cleanEntry(req.body, Date.now());
  if (!entry.title) return res.status(400).json({ error: "A title is required." });
  content.unshift(entry); await writeContent(content); res.status(201).json(entry);
});
app.put("/api/admin/content/:id", requireAdmin, async (req, res) => {
  const content = await readContent(); const id = Number(req.params.id); const index = content.findIndex(entry => entry.id === id);
  if (index < 0) return res.status(404).json({ error: "Entry not found." });
  const entry = cleanEntry(req.body, id); if (!entry.title) return res.status(400).json({ error: "A title is required." });
  content[index] = entry; await writeContent(content); res.json(entry);
});
app.delete("/api/admin/content/:id", requireAdmin, async (req, res) => {
  const content = await readContent(); const next = content.filter(entry => entry.id !== Number(req.params.id));
  if (next.length === content.length) return res.status(404).json({ error: "Entry not found." });
  await writeContent(next); res.status(204).end();
});

if (production) {
  app.use(express.static(path.join(root, "dist"), { index: false, maxAge: "1h" }));
  app.get("*splat", (_, res) => res.sendFile(path.join(root, "dist/index.html")));
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
}

setInterval(() => { for (const [key, session] of sessions) if (session.expires <= Date.now()) sessions.delete(key); }, 15 * 60_000).unref();

export { app };

if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  app.listen(port, () => console.log(`Zaika-e-Bharat server running at http://localhost:${port}`));
}