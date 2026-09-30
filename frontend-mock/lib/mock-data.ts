import type {
  MetricItem,
  HowItWorksStep,
  FeatureItem,
  FrameworkItem,
  TestimonialItem,
  FaqItem,
  FileTreeItem,
} from "@/lib/types";

export type {
  MetricItem,
  HowItWorksStep,
  FeatureItem,
  FrameworkItem,
  TestimonialItem,
  FaqItem,
  FileTreeItem,
};

export const PLATFORM_METRICS: MetricItem[] = [
  {
    label: "Neural Response Time",
    shortLabel: "Neural Latency",
    value: "< 180ms",
    change: "Private agentic execution",
    accent: "violet",
  },
  {
    label: "WebContainer Boot Time",
    shortLabel: "WebContainer Boot",
    value: "140ms",
    change: "Zero cloud cold starts",
    accent: "cyan",
  },
  {
    label: "PostgreSQL Isolation",
    shortLabel: "DB Isolation",
    value: "100%",
    change: "Strict PathJail sandboxing",
    accent: "emerald",
  },
  {
    label: "AST Verification Score",
    shortLabel: "AST Verification",
    value: "99.2%",
    change: "ReAct AST compiler validation",
    accent: "amber",
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: "01",
    title: "Autonomous Spec & Architecture",
    subtitle: "Natural language converted into verified system contracts",
    description: "Input your prompt or architecture goals. Tinker's multi-agent planning engine generates formal UI contracts, database schemas, and single-stack runtime specs before writing a single line of code.",
    accent: "violet",
    details: ["Automatic SQL schema generation", "Single-stack PathJail boundary checks", "Shadcn & Tailwind v4 token mapping"],
    codeSnippet: `// 1. Planner Agent synthesizes app schema
const spec = await tinker.plan({
  name: "saas-analytics",
  stack: "react-vite",
  db: "postgresql-isolated"
});`,
  },
  {
    step: "02",
    title: "Instant In-Browser WebContainer",
    subtitle: "Zero cloud lag, sub-second HMR inside client microVM",
    description: "The entire application boots directly in your browser using WebAssembly Node.js microVMs. Full hot-module replacement, package installation, and live Vite/Next.js servers run entirely on your local machine.",
    accent: "cyan",
    details: ["Sub-50ms Hot Module Replacement", "Zero server provisioning costs", "100% offline development capable"],
    codeSnippet: `// 2. WebContainer boots local microVM
await webcontainer.mount(workspaceFiles);
await webcontainer.spawn("npm", ["run", "dev"]);
// Ready at http://localhost:5173 in 140ms`,
  },
  {
    step: "03",
    title: "Visual Agentation & Sandboxed DB",
    subtitle: "Point-and-click UI inspection with automatic AST patch loops",
    description: "Inspect live elements with Agentation. Click any component in the preview to capture its selector and styles, feeding targeted revision instructions directly into the local agent for immediate re-compilation.",
    accent: "emerald",
    details: ["Element selector capture", "Unified diff preview before commit", "Instant database rollback & migrations"],
    codeSnippet: `// 3. Agentation feedback loops back to agent
agentation.onAnnotationAdd(async (note) => {
  await tinker.patchAST({
    selector: note.elementPath,
    instruction: note.comment
  });
});`,
  },
];

export const CORE_FEATURES: FeatureItem[] = [
  {
    id: "webcontainer",
    title: "Instant In-Browser WebContainer",
    description: "Run Node.js, Vite, and Next.js applications directly in the browser with full hot module replacement and zero server lag. No remote server provisioning or cold starts.",
    tag: "Runtime",
    iconName: "Terminal",
    accent: "cyan",
    bentoSpan: "lg:col-span-2",
    highlightText: "Sub-50ms HMR",
  },
  {
    id: "private-engine",
    title: "Zero-Knowledge Code Privacy",
    description: "Your proprietary code never leaves your private environment. Zero external telemetry, zero model retraining, and 100% intellectual property sovereignty.",
    tag: "Security",
    iconName: "Shield",
    accent: "violet",
    bentoSpan: "lg:col-span-1",
    highlightText: "Zero Telemetry",
  },
  {
    id: "database-studio",
    title: "Dedicated PostgreSQL Sandbox",
    description: "Each project receives an isolated database container with live SQL query execution, relational visualizer, and automated schema migrations.",
    tag: "Database",
    iconName: "Database",
    accent: "emerald",
    bentoSpan: "lg:col-span-1",
    highlightText: "PathJail Guarded",
  },
  {
    id: "agentation-inspector",
    title: "Agentation Visual UI Inspector",
    description: "Click any DOM element in your live preview to instantly feed its exact selector, bounding box, and computed style back to the agent for targeted fixes.",
    tag: "Visual Feedback",
    iconName: "Crosshair",
    accent: "amber",
    bentoSpan: "lg:col-span-2",
    highlightText: "Point-and-Click Fixes",
  },
  {
    id: "single-stack",
    title: "Strict Single-Stack Isolation",
    description: "No messy hybrid sprawl. Projects run strictly in their dedicated environment: React 19, Next.js 16, or Python FastAPI without package conflicts.",
    tag: "Architecture",
    iconName: "Layers",
    accent: "indigo",
    bentoSpan: "lg:col-span-2",
    highlightText: "Zero Framework Sprawl",
  },
  {
    id: "diff-verification",
    title: "ReAct AST Diff Review & Safety",
    description: "Inspect line-level unified diffs with syntax verification before any code touches your project. Rollback anytime with one click.",
    tag: "Safety",
    iconName: "GitCompare",
    accent: "rose",
    bentoSpan: "lg:col-span-1",
    highlightText: "Human-in-the-Loop",
  },
];

export const SUPPORTED_FRAMEWORKS: FrameworkItem[] = [
  {
    id: "react",
    name: "Vite + React 19",
    tagline: "Lightning-fast client SPA with sub-second HMR and full Tailwind v4 support.",
    badge: "⚡ Most Popular",
    runtimeSpeed: "42ms HMR",
    accentColor: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
    features: ["React 19 Server Components", "Tailwind v4 OKLCH tokens", "Lucide icon library", "Radix UI Primitives"],
  },
  {
    id: "nextjs",
    name: "Next.js 16 (Turbopack)",
    tagline: "Fullstack App Router with React Server Components, Server Actions, and API routes.",
    badge: "▲ Production Grade",
    runtimeSpeed: "1.2s Build",
    accentColor: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400",
    features: ["App Router architecture", "Turbopack bundler", "Shadcn/UI preconfigured", "Server Action handlers"],
  },
  {
    id: "python",
    name: "Python FastAPI + SQLite",
    tagline: "Asynchronous backend REST APIs with automatic OpenAPI Swagger documentation.",
    badge: "🐍 Backend Core",
    runtimeSpeed: "65ms Response",
    accentColor: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    features: ["Pydantic v2 validation", "SQLAlchemy 2.0 ORM", "Automatic Swagger UI", "Pytest unit test runner"],
  },
  {
    id: "html",
    name: "HTML5 + Modern CSS",
    tagline: "Ultra-lean static websites with zero bundler overhead and instant page speed.",
    badge: "🌐 Lightweight",
    runtimeSpeed: "0ms Build",
    accentColor: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    features: ["Native CSS variables", "Modern flex/grid layouts", "Responsive viewport", "Zero JS dependencies"],
  },
];

export const TERMINAL_DEMO_LOGS = [
  { type: "cmd", text: "$ tinker create analytics-hub --stack vite-react19" },
  { type: "info", text: "⚡ Initializing isolated workspace in workspaces/analytics-hub" },
  { type: "pkg", text: "📦 WebContainer mounting packages: react@19, lucide-react, tailwindcss@4" },
  { type: "agent", text: "🤖 Tinker Agent [v1.0 Pro] starting autonomous ReAct loop..." },
  { type: "step", text: "🔍 Step 1: write_file src/components/MetricCard.tsx (+48 lines)" },
  { type: "step", text: "🔍 Step 2: edit_file src/App.tsx (mounted live chart widget)" },
  { type: "server", text: "🚀 Vite v6.0 dev server active at http://localhost:5173" },
  { type: "success", text: "✨ AST verification passed: 0 syntax errors, 0 runtime warnings." },
];

export const DEMO_FILE_TREE: FileTreeItem[] = [
  { name: "src", type: "folder" },
  { name: "components", type: "folder" },
  { name: "MetricCard.tsx", type: "file", extension: "tsx", active: true },
  { name: "ChartWidget.tsx", type: "file", extension: "tsx" },
  { name: "App.tsx", type: "file", extension: "tsx" },
  { name: "index.css", type: "file", extension: "css" },
  { name: "package.json", type: "file", extension: "json" },
  { name: "schema.sql", type: "file", extension: "sql" },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Alex Rivera",
    role: "Staff Infrastructure Engineer",
    company: "ScaleGrid Enterprise",
    avatarText: "AR",
    content: "Tinker gives us the speed of Cursor Web with 100% on-prem privacy. Being able to run local Ollama models with live WebContainers is a monumental leap for compliance-sensitive engineering teams.",
    rating: 5,
    highlightBadge: "Enterprise Security",
  },
  {
    name: "Sophia Chen",
    role: "Head of Product & Design",
    company: "VentureCraft Studio",
    avatarText: "SC",
    content: "The Agentation visual feedback inspector alone saved our designers and developers dozens of hours. I can point-and-click on any element in the live preview and the agent fixes the styling accurately.",
    rating: 5,
    highlightBadge: "UI Velocity",
  },
  {
    name: "Marcus Vance",
    role: "Principal Fullstack Architect",
    company: "FintechOS Core",
    avatarText: "MV",
    content: "Strict single-stack isolation is what everyone else missed. No hybrid package pollution. React is React, FastAPI is FastAPI, and the dedicated database sandbox guarantees clean reproducibility.",
    rating: 5,
    highlightBadge: "Architecture Cleanliness",
  },
];

export const FAQS: FaqItem[] = [
  {
    question: "Do I need third-party cloud API keys (OpenAI / Anthropic) to run Tinker?",
    answer: "No. Tinker features a self-contained private autonomous engine that executes directly within your isolated environment. Your code and intellectual property remain 100% confidential without requiring external cloud accounts or third-party API dependencies.",
  },
  {
    question: "How does the in-browser WebContainer run without a server?",
    answer: "WebContainers compile Node.js and the WebAssembly runtime directly inside your browser tab. All file operations, process executions, and package installations run securely in your client machine with sub-second hot reload.",
  },
  {
    question: "What is the Agentation visual inspector and how does it sync?",
    answer: "Agentation is an integrated visual feedback tool. When you run Tinker in development mode, a subtle toolbar lets you click any rendered DOM element to inspect its exact selector, bounding box, and computed CSS, instantly streaming feedback to the agent via MCP.",
  },
  {
    question: "Can I export my project to GitHub and deploy to Vercel or Docker?",
    answer: "Yes! Every Tinker workspace creates a clean Git repository with standard configurations (Dockerfiles, Vite configs, Next.js settings). You can export as a ZIP, push to GitHub, or trigger one-click CI/CD deployments anytime.",
  },
  {
    question: "How does PostgreSQL isolation work?",
    answer: "Each project is sandboxed using PathJail container boundaries with its own dedicated SQLite or PostgreSQL database file. No cross-project database leaks or schema conflicts can ever occur.",
  },
];

export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Architecture", href: "#architecture" },
    { label: "Supported Stacks", href: "#frameworks" },
    { label: "Changelog", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Agentation Guide", href: "https://agentation.com" },
    { label: "WebContainer Runtime", href: "#" },
    { label: "GitHub Repository", href: "https://github.com" },
  ],
  community: [
    { label: "Discord Community", href: "#" },
    { label: "Twitter / X", href: "#" },
    { label: "Security Whitepaper", href: "#" },
    { label: "Privacy & Isolation", href: "#" },
  ],
  company: [
    { label: "About Tinker", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Status Page", href: "#" },
  ],
};

export const LOGIN_STUDIO_TESTIMONIAL = {
  quote: "Tinker allowed our engineering organization to build on-premise fullstack MVPs in hours instead of weeks, with zero cloud compute costs and zero security vulnerabilities.",
  author: "Elena Rostova",
  role: "VP of Engineering, DataSphere",
  stats: [
    { label: "Neural Latency", val: "< 180ms" },
    { label: "Wasm Sandbox", val: "Node 22" },
    { label: "Privacy Guarantee", val: "100% Private" },
  ],
};

export const LOGIN_TERMINAL_SNIPPET = [
  "$ tinker session authenticate --method mTLS",
  "✓ Connecting to private Wasm runtime microVM...",
  "✓ Mounted 12 workspaces with PathJail integrity",
  "● Ready for autonomous ReAct development",
];

export const LOGIN_AURORA_STATS = [
  "Wasm Node 22 Runtime",
  "SOC-2 Type II Certified",
  "100% Code Privacy",
];

export const HERO_CONFIG = {
  videoUrl: "/hero-bg.mp4",
  badgeRelease: "Tinker 1.0 General Availability",
  badgeEngine: "Autonomous Intelligence Engine",
  headingLine1: "Build and run fullstack web apps at the",
  headingLine2: "speed of thought.",
  subtitle:
    "The autonomous AI software engineer powered by private neural execution, sub-second in-browser WebContainers, dedicated PostgreSQL sandboxes, and Agentation visual element feedback.",
  ctaPrimaryText: "Start Building Free",
  ctaSecondaryText: "See How It Works",
};




