import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Group } from "three";
import "./cinematic.css";

gsap.registerPlugin(ScrollTrigger);

type Props = { onDishes: () => void; onSpices: () => void; onHistory: () => void; legacy: ReactNode };

const objects = [
  { name: "Wood-fired Chulha", point: [22, 62], purpose: "An earthen hearth that concentrates fire beneath clay and metal vessels.", history: "Domestic hearths were centres of nourishment, ritual attention and shared household knowledge.", material: "Packed clay, stone and agricultural fuel", significance: "Its fire connected cooking, hospitality and the daily rhythm of the household." },
  { name: "Sil-batta", point: [43, 73], purpose: "A flat grinding stone used with a hand-held roller for herbs, spices and pastes.", history: "Stone grinding survives across regional Indian kitchens in many locally crafted forms.", material: "Carved local stone", significance: "The tool embodies knowledge learned through touch, sound and repetition." },
  { name: "Copper Handi", point: [64, 52], purpose: "A rounded vessel for slow cooking grains, pulses and festive preparations.", history: "Metal vessels varied with region, household resources and the food being prepared.", material: "Hammered copper with a traditional lining", significance: "Its form distributes heat and supports slow, attentive cooking." },
  { name: "Mortar and Pestle", point: [78, 68], purpose: "Used to bruise aromatics and grind spices immediately before cooking.", history: "Mortars appear in stone, wood and metal, adapted to local ingredients and craft traditions.", material: "Engraved bronze", significance: "Fresh grinding releases aroma at the moment a dish begins." },
];

const spices = [
  ["Turmeric", "Haldi", "South Asia", "A cultivated rhizome used for colour, flavour and living cultural traditions.", "Regional exchange and cultivation", "Savoury preparations, pickles and ceremonial use"],
  ["Black Pepper", "Kali mirch", "Western Ghats", "A vine fruit long associated with the humid landscapes of southwest India.", "Peninsular ports and long-distance exchange", "Heat, aroma and seasoning"],
  ["Cardamom", "Elaichi", "Southern forest regions", "A fragrant pod valued in savoury dishes, sweets and drinks.", "Forest cultivation and merchant routes", "Fragrance and layered sweetness"],
  ["Cloves", "Laung", "Indian Ocean exchange", "An aromatic flower bud incorporated into regional cooking through maritime connections.", "Indian Ocean trade", "Tempering, rice dishes and warming blends"],
  ["Cinnamon", "Dalchini", "Indian Ocean world", "Aromatic bark with intertwined culinary and commercial histories.", "Coastal and overland exchange", "Sweet and savoury preparations"],
  ["Saffron", "Kesar", "Kashmir and trade routes", "Delicate stigmas valued for fragrance and colour in ceremonial foods.", "Mountain cultivation and courtly exchange", "Rice, sweets and festive preparations"],
  ["Cumin", "Jeera", "Cultivated across regions", "An earthy seed frequently bloomed in fat to open a preparation.", "Regional agriculture and inland trade", "Tempering and spice blends"],
  ["Coriander", "Dhania", "Cultivated across India", "Fresh leaf and dried seed contribute distinct aromatic characters.", "Widespread regional cultivation", "Garnishes, pastes and spice blends"],
  ["Mustard", "Rai", "Eastern and peninsular India", "Seeds and pressed oil shape many regional food traditions.", "Local cultivation and regional commerce", "Tempering, pickling and cooking oil"],
  ["Fenugreek", "Methi", "Northwestern traditions", "A bittersweet seed and leaf used with deliberate restraint.", "Dry-region cultivation and exchange", "Breads, vegetable dishes and pickles"],
];

function Emblem() {
  return <svg viewBox="0 0 100 100" className="cinema-emblem" aria-hidden="true"><circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="40" opacity=".55" /><path d="M20 52h60M27 52V39l7-6 6 6V26l10-13 10 13v13l7-6 6 6v13M45 52V33h10v19" opacity=".52" /><path d="M25 58h50c-2 17-11 25-25 25S27 75 25 58Z" /><path d="M67 20l8 7-25 34-9-7Z" /><path d="M44 16c0-7 3-11 6-14 3 3 6 7 6 14M36 17c6 0 10 2 14 7M64 17c-6 0-10 2-14 7" /></svg>;
}

function Intro({ close }: { close: () => void }) {
  return <motion.div className="time-intro" exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 1 }}><div className="time-intro-bg" /><div className="time-mist" /><div className="time-birds"><i /><i /><i /><i /></div><div className="time-dust"><Canvas camera={{ position: [0, 0, 5] }}><Sparkles count={42} scale={[10, 5, 2]} size={1.4} speed={.12} color="#e6b867" /></Canvas></div><motion.div className="time-intro-copy" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: .45, delayChildren: .35 } } }}><motion.div variants={{ hidden: { opacity: 0, scale: .75 }, show: { opacity: 1, scale: 1, transition: { duration: 1.2 } } }}><Emblem /><strong>Zaika-e-Bharat</strong><small>ANCIENT FLAVOURS. ETERNAL STORIES.</small></motion.div><motion.p variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}>Before recipes were written, stories were cooked.</motion.p><motion.h1 variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}>Welcome to Zaika-e-Bharat</motion.h1><motion.button variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} onClick={close}>ENTER THE ANCIENT WORLD <ArrowRight /></motion.button></motion.div><button className="time-skip" onClick={close}>Skip intro</button></motion.div>;
}

function DustScene() {
  const group = useRef<Group>(null);
  useFrame(({ pointer, clock }) => { if (!group.current) return; group.current.position.x = pointer.x * .25; group.current.rotation.z = Math.sin(clock.elapsedTime * .12) * .02; });
  return <group ref={group}><Sparkles count={65} scale={[12, 6, 2]} size={1.5} speed={.16} color="#dfaa55" /></group>;
}

function Relic() {
  return <Canvas camera={{ position: [3, 2.2, 4], fov: 45 }}><ambientLight intensity={1.2} /><directionalLight position={[3, 5, 4]} intensity={3} color="#f4b45a" /><group rotation={[0, -.4, 0]}><mesh position={[0, -.45, 0]}><cylinderGeometry args={[1.05, .72, 1.1, 40]} /><meshStandardMaterial color="#8c431e" roughness={.55} metalness={.35} /></mesh><mesh position={[0, .12, 0]}><torusGeometry args={[.88, .13, 16, 40]} /><meshStandardMaterial color="#c27735" metalness={.65} roughness={.3} /></mesh><mesh position={[0, -.95, 0]}><torusGeometry args={[.65, .1, 12, 36]} /><meshStandardMaterial color="#54210f" /></mesh></group><OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={.8} /></Canvas>;
}

function Kitchen() {
  const [active, setActive] = useState(0); const item = objects[active];
  return <section className="museum-kitchen reveal-scene" id="ancient-kitchen"><header><span>SCENE III • THE LIVING KITCHEN</span><h2>Where knowledge lived<br />before it was written.</h2><p>Select an object to uncover the craft, material and memory held within it.</p></header><div className="kitchen-world"><div className="kitchen-world-image" />{objects.map((object, index) => <button key={object.name} className={`object-point ${active === index ? "active" : ""}`} style={{ left: `${object.point[0]}%`, top: `${object.point[1]}%` }} onClick={() => setActive(index)}><i /><span>{object.name}</span></button>)}<motion.aside key={item.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}><div className="relic-view"><Relic /></div><small>OBJECT {active + 1} / {objects.length}</small><h3>{item.name}</h3><p>{item.purpose}</p><dl><dt>Historical context</dt><dd>{item.history}</dd><dt>Materials</dt><dd>{item.material}</dd><dt>Cultural significance</dt><dd>{item.significance}</dd></dl></motion.aside></div></section>;
}

function Spices({ open }: { open: () => void }) {
  const [active, setActive] = useState(0); const spice = spices[active];
  return <section className="museum-spices reveal-scene"><div className="spice-photo"><span>{String(active + 1).padStart(2, "0")}</span></div><div className="spice-story"><span>SCENE IV • THE SPICE ROUTES</span><h2>A world held<br />in a single seed.</h2><motion.div className="spice-fact" key={spice[0]} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><small>{spice[1]} • {spice[2]}</small><h3>{spice[0]}</h3><p>{spice[3]}</p><dl><dt>Trade connections</dt><dd>{spice[4]}</dd><dt>Traditional uses</dt><dd>{spice[5]}</dd></dl></motion.div><div className="spice-selector">{spices.map((item, index) => <button className={active === index ? "active" : ""} onClick={() => setActive(index)} key={item[0]}><b>{String(index + 1).padStart(2, "0")}</b>{item[0]}</button>)}</div><button className="archive-link" onClick={open}>Enter the complete spice archive <ArrowRight /></button></div></section>;
}

export default function CinematicExperience({ onDishes, onSpices, onHistory, legacy }: Props) {
  const [intro, setIntro] = useState(() => localStorage.getItem("zeb-intro-seen") !== "true"); const root = useRef<HTMLElement>(null);
  const closeIntro = () => { localStorage.setItem("zeb-intro-seen", "true"); setIntro(false); };
  useEffect(() => { if (!root.current) return; const ctx = gsap.context(() => { gsap.utils.toArray<HTMLElement>(".reveal-scene").forEach(scene => gsap.from(scene.querySelectorAll(":scope > header, :scope > .spice-story, :scope > .documentary-copy"), { scrollTrigger: { trigger: scene, start: "top 78%" }, opacity: 0, y: 50, duration: 1, stagger: .15 })); gsap.to(".time-hero-bg", { scrollTrigger: { trigger: ".time-hero", start: "top top", end: "bottom top", scrub: 1 }, yPercent: 14, scale: 1.08 }); }, root); return () => ctx.revert(); }, []);
  return <main className="time-experience" ref={root}><AnimatePresence>{intro && <Intro close={closeIntro} />}</AnimatePresence><section className="time-hero"><div className="time-hero-bg" /><div className="time-hero-canvas"><Canvas camera={{ position: [0, 0, 6] }}><DustScene /></Canvas></div><motion.div className="time-hero-copy" initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}><span>STEP INTO ANCIENT INDIA</span><h1>THE TIMELESS<br />TASTE OF <em>INDIA</em></h1><p>Journey through centuries of culinary wisdom, forgotten recipes,<br /> sacred spices and the kitchens that shaped a civilisation.</p><div><button onClick={() => document.querySelector("#ancient-kitchen")?.scrollIntoView({ behavior: "smooth" })}>Begin Your Journey <ArrowRight /></button><button onClick={onHistory}>Explore Culinary Heritage</button></div></motion.div><small className="time-scene-label">SCENE I • ANCIENT INDIA AT SUNRISE</small></section><section className="settlement reveal-scene"><div className="documentary-copy"><span>SCENE II • ENTERING THE SETTLEMENT</span><h2>Follow the river.<br />Listen for the hearth.</h2><p>Across stone paths, river ghats and market lanes, food carried the memory of landscapes, seasons and exchange.</p></div></section><Kitchen /><Spices open={onSpices} /><section className="dish-documentary reveal-scene"><div className="documentary-copy"><span>SCENE VI • DISHES AND MEMORY</span><h2>Every preparation<br />leaves a trace.</h2><p>Explore dishes through documented evidence, regional practice, oral tradition and legend, clearly distinguished.</p><button onClick={onDishes}>Discover Ancient Dishes <ArrowRight /></button></div></section><section className="culinary-timeline reveal-scene"><div className="documentary-copy"><span>SCENE VII • CONTINUITY AND EXCHANGE</span><h2>The culinary timeline</h2><p>Food history is a conversation between ecology, movement, belief, craft and trade.</p></div><div className="timeline-row"><article><small>EARLY TEXTUAL TRADITIONS</small><h3>Food, ritual and hospitality</h3><p>Texts provide evidence of ingredients, ethics and meal customs interpreted within their contexts.</p></article><article><small>OCEAN AND OVERLAND EXCHANGE</small><h3>Ports, routes and ingredients</h3><p>Trade connected regions with wider worlds while local cooks transformed what arrived.</p></article><article><small>LIVING REGIONAL PRACTICE</small><h3>Knowledge carried forward</h3><p>Techniques survive through households, communities and artisans while continuing to change.</p></article></div></section><section className="legacy-content">{legacy}</section></main>;
}