import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronDown, Eye, EyeOff, Landmark, LockKeyhole, LogOut, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CinematicExperience from "./CinematicExperience";

gsap.registerPlugin(ScrollTrigger);

type Page = "home" | "dishes" | "spices" | "regions" | "traditions" | "history" | "article" | "about" | "admin" | "login";
type Entry = { id: number; type: string; title: string; category: string; excerpt: string; image: string; gallery?: string[]; status?: "Draft" | "Published" };

const nav: { label: string; page: Page; drop?: boolean }[] = [
  { label: "Home", page: "home" }, { label: "Dishes", page: "dishes", drop: true },
  { label: "Spices", page: "spices", drop: true }, { label: "Regions", page: "regions", drop: true },
  { label: "Traditions", page: "traditions", drop: true }, { label: "About", page: "about" },
];

const defaultEntries: Entry[] = [
  { id: 1, type: "Story", title: "The Legacy of Ayurveda in Indian Cuisine", category: "Ancient Wisdom", excerpt: "How food, balance and the seasons shaped India's oldest culinary philosophy.", image: "/images/ayurveda-sage.jpg" },
  { id: 2, type: "Spice", title: "Turmeric: The Golden Spice", category: "Healing Spices", excerpt: "A journey through the sacred, medicinal and culinary life of haldi.", image: "/images/golden-turmeric.jpg" },
  { id: 3, type: "Dish", title: "The Ceremonial Indian Thali", category: "Royal Kitchens", excerpt: "A complete meal whose many flavours form one harmonious whole.", image: "/images/heritage-spices.jpg" },
  { id: 4, type: "Region", title: "The Kitchens of the Ganges", category: "Northern India", excerpt: "River, ritual and the enduring recipes of India's sacred cities.", image: "/images/bharat-hero.jpg" },
];

function useRoute() {
  const read = () => {
    if (location.pathname === "/admin/login") return { page: "login" as Page, id: null as number | null };
    if (location.pathname.startsWith("/admin")) return { page: "admin" as Page, id: null as number | null };
    const parts = (location.hash.slice(2) || "home").split("/");
    return { page: ((parts[0] as Page) || "home"), id: parts[1] ? Number(parts[1]) : null };
  };
  const [route, setRoute] = useState<{ page: Page; id: number | null }>(read());
  useEffect(() => { const sync = () => setRoute(read()); addEventListener("hashchange", sync); addEventListener("popstate", sync); return () => { removeEventListener("hashchange", sync); removeEventListener("popstate", sync); }; }, []);
  const go = (next: Page, id?: number) => { const url = next === "admin" ? "/admin" : next === "login" ? "/admin/login" : id !== undefined ? `/#/${next}/${id}` : `/#/${next}`; history.pushState({}, "", url); setRoute({ page: next, id: id ?? null }); scrollTo({ top: 0, behavior: "smooth" }); };
  return { ...route, go };
}

function Mandala() {
  return <svg viewBox="0 0 100 100" className="mandala" aria-hidden="true"><circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="40" opacity=".55" /><path d="M20 52h60M27 52V39l7-6 6 6V26l10-13 10 13v13l7-6 6 6v13M45 52V33h10v19" opacity=".52" /><path d="M25 58h50c-2 17-11 25-25 25S27 75 25 58Z" fill="rgba(188,102,36,.28)" /><path d="M31 62h38M35 68h30M41 75h18" opacity=".7" /><path d="M67 20l8 7-25 34-9-7Z" fill="rgba(218,153,61,.3)" /><path d="M44 16c0-7 3-11 6-14 3 3 6 7 6 14-3-2-5-3-6-8-1 5-3 6-6 8ZM36 17c6 0 10 2 14 7-7 1-12-1-14-7Zm28 0c-6 0-10 2-14 7 7 1 12-1 14-7Z" /></svg>;
}

function Header({ page, go, openSearch }: { page: Page; go: (p: Page) => void; openSearch: () => void }) {
  const [mobile, setMobile] = useState(false);
  return <header className="site-header"><button className="brand" onClick={() => go("home")} aria-label="Zaika-e-Bharat home"><Mandala /><span><strong>Zaika-e-Bharat</strong><small>ANCIENT FLAVOURS. ETERNAL STORIES.</small></span></button><nav className={mobile ? "nav open" : "nav"}>{nav.map(item => <button className={page === item.page ? "active" : ""} key={item.page} onClick={() => { go(item.page); setMobile(false); }}>{item.label}{item.drop && <ChevronDown size={12} />}</button>)}<button className="mobile-history" onClick={() => go("history")}>Food History</button></nav><div className="header-actions"><button className="search" onClick={openSearch} aria-label="Search"><Search size={24} /></button><button className="explore" onClick={() => go("regions")}><Landmark size={18} /> Explore India</button><button className="menu" onClick={() => setMobile(v => !v)} aria-label="Menu">{mobile ? <X /> : <Menu />}</button></div></header>;
}

const features = [
  ["Explore Dishes", "Stories behind every dish", "15% 52%", "dishes"], ["The Spice Archive", "Origins, uses & secrets", "34% 50%", "spices"],
  ["Regional India", "A culinary mosaic", "53% 50%", "regions"], ["Culinary Traditions", "Timeless techniques", "73% 50%", "traditions"],
  ["Indian Food History", "From ancient times", "91% 50%", "history"],
] as const;

function FeatureCard({ item, go, index }: { item: typeof features[number]; go: (p: Page) => void; index: number }) {
  return <motion.button className="feature-card" onClick={() => go(item[3])} initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45 + index * .09 }}><div className="feature-image" style={{ backgroundPosition: item[2] }} /><div className="feature-copy"><strong>{item[0]}</strong><span>{item[1]}</span></div><i><ArrowRight size={18} /></i></motion.button>;
}

function Home({ go }: { go: (p: Page) => void }) {
  const lower = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!lower.current) return; const ctx = gsap.context(() => gsap.from(".editorial-panel", { scrollTrigger: { trigger: lower.current, start: "top 92%" }, y: 34, opacity: 0, duration: .9, stagger: .14 }), lower); return () => ctx.revert(); }, []);
  const legacy = <><div className="time-feature-wrap"><div className="features time-features">{features.map((item, i) => <FeatureCard item={item} go={go} index={i} key={item[0]} />)}</div></div><section className="editorial time-editorial" ref={lower}><article className="editorial-panel story" onClick={() => go("article")}><div className="editorial-copy"><span>FEATURED STORY</span><h2>The Legacy of<br />Ayurveda in Indian Cuisine</h2><p>Discover how ancient wisdom shaped<br />the flavours of India.</p><button>Read the Story <ArrowRight /></button></div></article><article className="editorial-panel turmeric" onClick={() => go("spices")}><div className="editorial-copy"><span>THE SPICES OF INDIA</span><h2>Turmeric - The Golden Spice</h2><p>A journey of healing, flavour<br />and tradition.</p><button>Explore Spice <ArrowRight /></button></div></article><button className="heritage editorial-panel" onClick={() => go("regions")}><Landmark /><span>Discover India's<br />Culinary Heritage</span><small>Explore • Learn • Experience</small></button></section></>;
  return <CinematicExperience onDishes={() => go("dishes")} onSpices={() => go("spices")} onHistory={() => go("history")} legacy={legacy} />;
}

const pageInfo: Record<string, [string, string, string]> = {
  dishes: ["The Dish Archive", "Every recipe carries a memory", "Discover ceremonial feasts, humble hearth recipes and the dishes that have travelled through Indian history."],
  spices: ["The Spice Archive", "The soul of the Indian kitchen", "Trace the origins, rituals and healing traditions held within India's extraordinary spices."],
  regions: ["Regional India", "A culinary map of the subcontinent", "Journey from Himalayan kitchens to the coconut groves of the south, one region at a time."],
  traditions: ["Culinary Traditions", "Knowledge passed from hand to hand", "Explore ancient utensils, sacred preparations and techniques preserved across generations."],
  history: ["Indian Food History", "Five thousand years at the table", "Read the stories of trade, empire, faith and migration that shaped the food of India."],
};

function ArchivePage({ page, go, entries }: { page: Page; go: (p: Page, id?: number) => void; entries: Entry[] }) {
  const info = pageInfo[page] || pageInfo.history; const cards = [...entries, ...entries].slice(0, 6);
  return <main className="inner-page"><section className="inner-hero"><div className="inner-bg" /><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><span>ZAIKA-E-BHARAT COLLECTION</span><h1>{info[0]}</h1><h2>{info[1]}</h2><p>{info[2]}</p></motion.div></section><section className="archive-grid">{cards.map((entry, i) => <motion.article key={`${entry.id}-${i}`} whileHover={{ y: -7 }} onClick={() => go("article", entry.id)}><div className="archive-image" style={{ backgroundImage: `url(${entry.image})`, backgroundPosition: i === 2 ? "center" : undefined }} /><span>{entry.category}</span><h3>{entry.title}</h3><p>{entry.excerpt}</p><button>Read the story <ArrowRight /></button></motion.article>)}</section></main>;
}

function ArticlePage({ go, entries, articleId }: { go: (p: Page, id?: number) => void; entries: Entry[]; articleId: number | null }) {
  const entry = entries.find(e => e.id === articleId);
  if (!entry) return <main className="article-page"><section className="article-hero"><div><span>NOT FOUND</span><h1>Article not found</h1><p>The story you're looking for isn't in the archive.</p><button className="gold-button" onClick={() => go("home")}>Return Home <ArrowRight /></button></div></section></main>;
  return <main className="article-page"><section className="article-hero"><div><span>{entry.type.toUpperCase()} • {entry.category}</span><h1>{entry.title}</h1><p>{entry.excerpt}</p></div></section><article className="article-body"><div className="dropcap">{entry.title.charAt(0)}</div><p>{entry.excerpt}</p>{entry.gallery && entry.gallery.length > 0 && <section style={{ margin: "30px 0" }}>{entry.gallery.map((img, i) => <img key={i} src={img} alt={entry.title} style={{ width: "100%", height: "auto", borderRadius: "8px", marginBottom: "12px" }} />)}</section>}<p>This entry is part of the Zaika-e-Bharat culinary archive, preserving the stories behind India's table.</p><button className="gold-button" onClick={() => go("home")}>Explore More Stories <ArrowRight /></button></article></main>;
}

function AboutPage() { return <main className="about-page"><section><div><span>OUR PURPOSE</span><h1>Preserving the stories<br />behind India's table.</h1><p>Zaika-e-Bharat is a living archive of the people, places and traditions that have shaped Indian food. We document recipes not simply as instructions, but as vessels of memory.</p><p>From temple kitchens and royal courts to village hearths, our work celebrates the depth and beauty of India's culinary inheritance.</p></div></section></main>; }

function Admin({ entries, reload, logout, unauthorized }: { entries: Entry[]; reload: () => Promise<void>; logout: () => Promise<void>; unauthorized: () => void }) {
  const [draft, setDraft] = useState({ type: "Story", title: "", category: "", excerpt: "", image: "/images/ayurveda-sage.jpg", gallery: [] as string[], status: "Draft" as "Draft" | "Published" });
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const categories = Array.from(new Set(entries.map(entry => entry.category).filter(Boolean)));
  const request = async (url: string, options: RequestInit) => { const response = await fetch(url, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } }); if (response.status === 401) { unauthorized(); throw new Error("Your session expired. Please sign in again."); } if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || "The operation could not be completed."); } return response; };
  const save = async () => { if (!draft.title.trim()) { setMessage("A title is required."); return; } setSaving(true); setMessage(""); try { await request(editing ? `/api/admin/content/${editing}` : "/api/admin/content", { method: editing ? "PUT" : "POST", body: JSON.stringify(draft) }); await reload(); setEditing(null); setDraft({ type: "Story", title: "", category: "", excerpt: "", image: "/images/ayurveda-sage.jpg", gallery: [], status: "Draft" }); setMessage(editing ? "Changes saved securely." : "Entry added to the archive."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save."); } finally { setSaving(false); } };
  const remove = async (id: number) => { if (!confirm("Permanently delete this archive entry?")) return; setMessage(""); try { await request(`/api/admin/content/${id}`, { method: "DELETE" }); await reload(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete."); } };
  const edit = (entry: Entry) => { setEditing(entry.id); setDraft({ type: entry.type, title: entry.title, category: entry.category, excerpt: entry.excerpt, image: entry.image, gallery: entry.gallery || [], status: entry.status || "Published" }); scrollTo({ top: 180, behavior: "smooth" }); };
  const upload = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setDraft(current => ({ ...current, image: String(reader.result) })); reader.readAsDataURL(file); };
  const uploadGallery = async (files?: FileList | null) => { if (!files) return; const images = await Promise.all(Array.from(files).slice(0, 6).map(file => new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file); }))); setDraft(current => ({ ...current, gallery: [...current.gallery, ...images].slice(0, 6) })); };
  return <main className="admin-page"><div className="admin-head"><div className="admin-brand"><Mandala /><span>ZAIKA-E-BHARAT • SECURE ADMIN</span></div><button className="logout-button" onClick={logout}><LogOut size={17} /> Secure logout</button><h1>Content Atelier</h1><p>Publish and preserve the culinary archive.</p></div><div className="admin-layout"><section className="admin-form"><h2>{editing ? "Edit archive entry" : "Create a new entry"}</h2><label>Content type<select value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })}><option>Story</option><option>Dish</option><option>Spice</option><option>Region</option><option>Tradition</option></select></label><label>Title<input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Entry title" /></label><label>Category<input list="archive-categories" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} placeholder="Tradition, region or collection" /><datalist id="archive-categories">{categories.map(category => <option key={category}>{category}</option>)}</datalist></label><label>Summary<textarea value={draft.excerpt} onChange={e => setDraft({ ...draft, excerpt: e.target.value })} placeholder="A short editorial introduction" /></label><label>Image URL<input value={draft.image} onChange={e => setDraft({ ...draft, image: e.target.value })} /></label><label>Or upload an image<input className="file-input" type="file" accept="image/*" onChange={e => upload(e.target.files?.[0])} /></label><label>Image gallery, up to six<input className="file-input" type="file" multiple accept="image/*" onChange={e => uploadGallery(e.target.files)} /></label>{draft.gallery.length > 0 && <div className="gallery-manager">{draft.gallery.map((image, index) => <button type="button" key={`${image.slice(-20)}-${index}`} onClick={() => setDraft(current => ({ ...current, gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index) }))}><img src={image} alt={`Gallery item ${index + 1}`} /><span>Remove</span></button>)}</div>}<label>Publication status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as "Draft" | "Published" })}><option>Draft</option><option>Published</option></select></label>{message && <p className="admin-message" role="status">{message}</p>}<button className="gold-button" onClick={save} disabled={saving}>{saving ? "Saving securely..." : editing ? "Save Changes" : draft.status === "Published" ? "Publish Entry" : "Save Draft"} {!saving && <ArrowRight />}</button></section><section className="admin-list"><h2>Content archive</h2>{entries.map(entry => <div key={entry.id}><span>{entry.type}</span><section><strong>{entry.title}</strong><small>{entry.category} • {entry.status || "Published"}{entry.gallery?.length ? ` • ${entry.gallery.length} gallery images` : ""}</small></section><button onClick={() => edit(entry)}>Edit</button><button onClick={() => remove(entry.id)}>Delete</button></div>)}</section></div></main>;
}

function AdminLogin({ onAuthenticated, go }: { onAuthenticated: () => Promise<void>; go: (page: Page) => void }) {
  const [identifier, setIdentifier] = useState(""); const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(""); if (!identifier.trim() || !password) { setError("Enter your authorized email or username and password."); return; } setLoading(true); try { const response = await fetch("/api/auth/login", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: identifier.trim(), password }) }); const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.error || "Sign in failed."); setPassword(""); await onAuthenticated(); go("admin"); } catch (reason) { setError(reason instanceof Error ? reason.message : "Sign in failed."); } finally { setLoading(false); } };
  return <main className="login-page"><div className="login-atmosphere" /><motion.form className="login-card" onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}><div className="login-emblem"><Mandala /></div><span>ZAIKA-E-BHARAT</span><h1>Admin Console</h1><p>Authorized owner access only</p><label>Email or username<input autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} placeholder="owner@example.com" disabled={loading} /></label><label>Password<div className="password-field"><input type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" disabled={loading} /><button type="button" onClick={() => setVisible(current => !current)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff /> : <Eye />}</button></div></label>{error && <div className="login-error" role="alert">{error}</div>}<button className="login-submit" disabled={loading}>{loading ? <i className="login-spinner" /> : <LockKeyhole size={18} />}{loading ? "Verifying..." : "Enter Admin Console"}</button><button className="return-site" type="button" onClick={() => go("home")}>Return to public website</button></motion.form></main>;
}

function SearchModal({ close, entries, go }: { close: () => void; entries: Entry[]; go: (p: Page) => void }) {
  const [q, setQ] = useState(""); const result = entries.filter(e => `${e.title} ${e.category}`.toLowerCase().includes(q.toLowerCase()));
  return <motion.div className="search-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button className="close-search" onClick={close}><X /></button><div><span>SEARCH THE ARCHIVE</span><label><Search /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search dishes, spices and stories..." /></label>{q && <section>{result.map(e => <button key={e.id} onClick={() => { go("article"); close(); }}><small>{e.category}</small>{e.title}<ArrowRight /></button>)}</section>}</div></motion.div>;
}

export default function App() {
  const { page, id, go } = useRoute(); const [searching, setSearching] = useState(false);
  const [entries, setEntries] = useState<Entry[]>(defaultEntries); const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const loadPublic = async () => { try { const response = await fetch("/api/content"); if (response.ok) setEntries(await response.json()); } catch { /* Keep bundled content available if the network is temporarily unavailable. */ } };
  const loadAdmin = async () => { const response = await fetch("/api/admin/content", { credentials: "include" }); if (response.status === 401) throw new Error("unauthorized"); if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || "Unable to load the admin archive."); } setEntries(await response.json()); };
  const authenticate = async () => { const response = await fetch("/api/auth/session", { credentials: "include" }); if (!response.ok) throw new Error("unauthorized"); setAuthenticated(true); await loadAdmin(); };
  const unauthorized = () => { setAuthenticated(false); go("login"); };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => undefined); setAuthenticated(false); await loadPublic(); go("login"); };
  useEffect(() => { void loadPublic(); }, []);
  useEffect(() => { if (page !== "admin") return; setAuthenticated(null); authenticate().catch(unauthorized); }, [page]);
  let content;
  if (page === "home") content = <Home go={go} />;
  else if (["dishes", "spices", "regions", "traditions", "history"].includes(page)) content = <ArchivePage page={page} go={go} entries={entries} />;
  else if (page === "article") content = <ArticlePage go={go} entries={entries} articleId={id} />;
  else if (page === "about") content = <AboutPage />;
  else if (page === "login") content = <AdminLogin onAuthenticated={authenticate} go={go} />;
  else if (page === "admin") content = authenticated ? <Admin entries={entries} reload={loadAdmin} logout={logout} unauthorized={unauthorized} /> : <main className="auth-loading"><i className="login-spinner" /><span>Verifying secure session...</span></main>;
  else content = <Home go={go} />;
  const chrome = page !== "login";
  return <div className="app">{chrome && <Header page={page} go={go} openSearch={() => setSearching(true)} />}{content}{chrome && page !== "admin" && <footer><button onClick={() => go("home")}><Mandala /> Zaika-e-Bharat</button><span>Ancient flavours. Eternal stories.</span><button onClick={() => go("admin")}>Editorial Admin</button></footer>}<AnimatePresence>{searching && <SearchModal close={() => setSearching(false)} entries={entries} go={go} />}</AnimatePresence></div>;
}
