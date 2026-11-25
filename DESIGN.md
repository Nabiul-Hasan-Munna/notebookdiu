# UniverseDIU — Design System Specification (DESIGN.md)

## 1. Visual Hierarchy & Brand Philosophy
**UniverseDIU** pairs an aspirational cosmic university motif (*"Your Knowledge, Our Universe"*) with clean, academic utility.

- **Branding**: Planet Saturn with luminous orbit ring in cyan-blue gradient.
- **Tone**: Focused, academic, modern, and inspiring.
- **Theme Modes**:
  - **Cosmic Dusk (Landing/Login)**: `#060E22` with midnight gradients and glowing campus illumination.
  - **Academic Daytime (Core App & Feed)**: `#F8FAFC` slate canvas with elevated white cards (`#FFFFFF`).
  - **Command Center (Admin Dashboard)**: Deep navy `#0B1A3C` sidebar with enterprise data cards.

---

## 2. Color Palette & Semantics

| Token | Hex Value | Usage |
|---|---|---|
| `--diu-dark-950` | `#060E22` | Landing page background, dark modal overlays |
| `--diu-navy-900` | `#0B1A3C` | Primary brand navy, Top navbar background, Admin sidebar |
| `--diu-navy-800` | `#102452` | Sidebar hover states, card headers |
| `--diu-blue-600` | `#2563EB` | Primary CTA buttons, active links, brand accents |
| `--diu-blue-700` | `#1D4ED8` | Hover state for primary buttons |
| `--diu-cyan-400` | `#06B6D4` | Accent highlight, logo glow, badge indicator |
| `--diu-surface`  | `#FFFFFF` | Primary card background |
| `--diu-bg`       | `#F8FAFC` | Main app background canvas |
| `--diu-border`   | `#E2E8F0` | Default card and input borders |
| `--diu-text-main`| `#0F172A` | Primary typography color |
| `--diu-text-muted`| `#64748B` | Secondary metadata and timestamp text |

### Contribution Badges
- **Resource**: `bg-sky-50 text-sky-700 border-sky-200`
- **Knowledge**: `bg-indigo-50 text-indigo-700 border-indigo-200`
- **Question**: `bg-amber-50 text-amber-700 border-amber-200`
- **Project**: `bg-emerald-50 text-emerald-700 border-emerald-200`
- **PDF**: `bg-rose-50 text-rose-600 border-rose-200`
- **Video**: `bg-blue-50 text-blue-600 border-blue-200`
- **Link**: `bg-emerald-50 text-emerald-600 border-emerald-200`

---

## 3. Typography
- **Primary Font**: `Plus Jakarta Sans`, sans-serif (Weights: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold, 900 Black)
- **Monospace Font**: `JetBrains Mono`, monospace (Used for course codes `SE-322`, student IDs `201-15-xxxx`, and code snippets)

---

## 4. Component Standards

### 4.1 Navigation Bars
- **Desktop Navbar**: Height `64px` (`h-16`), background `#0B1A3C`, sticky at `top-0`, z-index `50`. Center search bar with shortcut key badge (`⌘K`).
- **Sidebar**: Width `260px` or 3 columns in a 12-column grid. Rounded card containers (`rounded-2xl border border-slate-200/80 p-3`).

### 4.2 Interactive Cards
- **Feed Cards**: Rounded `rounded-2xl`, border `border-slate-200/80`, padding `p-6`, shadow `shadow-sm`, hover lift transition `hover:border-slate-300 transition-all`.
- **KPI Stat Cards**: Elevated cards with large bold numbers (`text-2xl font-black`), tracking percentage trends, and semantic icons.

### 4.3 Mobile Simulator
- iPhone 15 frame specifications: `375px × 760px`, `border: 10px solid #1e293b`, `border-radius: 46px`, dynamic notch at top and 5-item bottom bar at bottom.
