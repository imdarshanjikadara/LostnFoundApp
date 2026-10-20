# Tivoli ID Station — Lost & Found Hub (Auraria Campus)

A production-grade, secure Progressive Web App (PWA) built for the **Tivoli Student Union ID Station** serving the tri-institution Auraria Campus (**University of Colorado Denver, Metropolitan State University of Denver, and Community College of Denver**).

Engineered following **Apple Cupertino Human Interface Guidelines (HIG)**, featuring client-side HTML5 canvas image optimization, hardened Supabase PostgreSQL database storage with Row Level Security (RLS), role-based staff authentication, and Vercel serverless deployment.

---

## Table of Contents
1. [Core Features](#core-features)
2. [Design System & Apple UI/UX](#design-system--apple-ui-ux)
3. [Security Architecture & Cyber Defense](#security-architecture--cyber-defense)
4. [Client-Side Image Optimizer Pipeline](#client-side-image-optimizer-pipeline)
5. [Supabase Cloud Database & Storage](#supabase-cloud-database--storage)
6. [Project File Structure](#project-file-structure)
7. [Default Demo Accounts & Roles](#default-demo-accounts--roles)
8. [Local Development & Setup](#local-development--setup)
9. [Deployment to Vercel](#deployment-to-vercel)
10. [CSV Audit Export](#csv-audit-export)
11. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Core Features

- **Role-Based Access Control (RBAC)**:
  - **Admin Role**: Full authority to create student staff accounts, grant/revoke administrator rights, reset passwords, and manage Supabase database synchronization.
  - **Staff Role**: Log new found items, inspect items, mark verified claims, and export CSV logs.
- **Client-Side Image Optimization**: Dynamic HTML5 canvas downscaling guarantees camera photos are compressed under **250 KB** before cloud upload.
- **Instant Live Search & Filters**: Search across item titles, student ID numbers, bin locations, distinct markings, and staff initials in real time.
- **Verification & Claim Workflow**: Audit log recording student claimant name, verified phone / student ID, release timestamp, and releasing staff initials automatically capitalized.
- **Dual-Mode Persistence (Cloud + Offline Fallback)**:
  - **Live Cloud Mode**: Real-time sync with Supabase PostgreSQL and cloud photo storage.
  - **Offline Local Mode**: Automatic fallback to encrypted `localStorage` if Supabase credentials are not connected or during network outages.
- **PWA & Mobile Touch Ergonomics**: Native camera integration (`capture="environment"`), iOS safe-area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`), and minimum 44px tap targets.
- **Zero Emojis / 100% Vector Icons**: Custom-crafted SVG icon suite matching Apple SF Symbols.

---

## Design System & Apple UI/UX

The interface strictly adopts Apple Human Interface Guidelines:
- **Materials & Translucency**: Cupertino frosted glass (`backdrop-filter: blur(24px) saturate(190%)`) on headers, sticky navigation bars, and sheets.
- **Physical Spring Animations**: Smooth spring transitions for sheets rising from the bottom thumb-zone (`springSheetUp`).
- **Tactile Button Physics**:
  - No colored neon or glow blur effects.
  - Subtle background tint shifts (`hover:bg-[#00368C]`, `hover:bg-emerald-700`).
  - Tactile physical depression on press (`active:scale-[0.98]`).
  - Crisp 0.5px / 1px borders (`border-black/10`).
- **Typography & Brand Palette**:
  - Auraria Blue: `#0047BA` (Dark: `#00368C`, Light: `#1A62E8`)
  - Auraria Lime Accent: `#C2EC00` (Dark: `#A5C900`)
  - System font stack prioritizing `-apple-system`, `SF Pro Display`, `SF Pro Text`, and `Segoe UI`.
  - Enforced `font-size: 16px` on all inputs to eliminate iOS Safari viewport auto-zoom.

---

## Security Architecture & Cyber Defense

Designed to protect campus student data against common web attacks:

| Threat | Defense Implemented | Source File |
| :--- | :--- | :--- |
| **Credential Storage** | PBKDF2 key derivation with SHA-256 (10,000 rounds) + unique salt per account | [`js/utils/security.js`](file:///d:/Antigravity/LostnFoundApp/js/utils/security.js) |
| **Brute Force / Credential Stuffing** | Client-side rate limiting: 5 failed attempts locks session for 30 seconds with live countdown | [`js/utils/security.js`](file:///d:/Antigravity/LostnFoundApp/js/utils/security.js) |
| **Cross-Site Scripting (XSS)** | HTML entity encoding (`escapeHtml`) on all user-supplied titles, markings, and names | [`js/utils/security.js`](file:///d:/Antigravity/LostnFoundApp/js/utils/security.js) |
| **Formula Injection (CSV Injection)** | Single-quote escaping on cell values starting with `=, +, -, @` before generating CSV | [`js/utils/exportCsv.js`](file:///d:/Antigravity/LostnFoundApp/js/utils/exportCsv.js) |
| **Credential Leakage in Git** | Real `.env` is gitignored; clean `.env.example` provided; API proxy via `/api/config.js` | [`vercel.json`](file:///d:/Antigravity/LostnFoundApp/vercel.json), [`.gitignore`](file:///d:/Antigravity/LostnFoundApp/.gitignore) |
| **Clickjacking & MIME-Sniffing** | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and strict `Referrer-Policy` | [`vercel.json`](file:///d:/Antigravity/LostnFoundApp/vercel.json) |
| **Database Tampering** | PostgreSQL Row Level Security (RLS) policies enforcing validated INSERT and UPDATE | [`supabase/schema.sql`](file:///d:/Antigravity/LostnFoundApp/supabase/schema.sql) |

---

## Client-Side Image Optimizer Pipeline

Smartphone camera sensors produce images between 4 MB and 15 MB. The client-side image optimizer in [`js/utils/imageOptimizer.js`](file:///d:/Antigravity/LostnFoundApp/js/utils/imageOptimizer.js) compresses photos before upload:

```
[Camera / Photo File (4MB - 15MB)]
               │
               ▼
   [HTML5 Canvas Resizing]
   • Max dimension capped at 1280px (maintaining aspect ratio)
   • High-quality bicubic downscaling
               │
               ▼
     [Canvas JPEG Encoder]
   • Quality set to 0.75
   • Strip heavy EXIF metadata
               │
               ▼
[Optimized Output < 250 KB (Typically 80-140 KB)]
   • Immediate local preview
   • Fast, low-bandwidth upload to Supabase Storage
```

---

## Supabase Cloud Database & Storage

The database schema and policies are defined in [`supabase/schema.sql`](file:///d:/Antigravity/LostnFoundApp/supabase/schema.sql).

### Table: `lost_items`
```sql
create table public.lost_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  category text not null,
  identifier text default null,
  location text not null,
  staff_initials text not null,
  image_url text default null,
  status text not null default 'active' check (status in ('active', 'claimed')),
  claimed_at timestamptz default null,
  claimant_name text default null,
  claimant_contact text default null,
  released_by text default null
);
```

### Storage Bucket: `item-photos`
- Public read access for item thumbnails.
- Upload policy restricted to authenticated/anon staff keys.
- Enforced MIME-types: `image/jpeg`, `image/png`, `image/webp`.
- Maximum upload size: 2 MB limit per file.

---

## Project File Structure

```
LostnFoundApp/
├── .env                          # Local private Supabase environment variables (gitignored)
├── .env.example                  # Environment template for Vercel / GitHub
├── .gitignore                    # Git ignore file (protects .env and temp files)
├── api/
│   └── config.js                 # Vercel serverless function (safe config delivery in production)
├── css/
│   └── styles.css                # Apple HIG interaction styles, design tokens & safe-area insets
├── js/
│   ├── app.js                    # Main React application entry point & state management
│   ├── config.js                 # Local configuration fallback
│   ├── components/
│   │   ├── Header.js             # Fixed frosted glass header, search & category navigation
│   │   ├── Icons.js              # Complete vector SVG icon suite (100% emoji-free)
│   │   ├── ItemCard.js           # Inventory feed item card with tactile actions
│   │   ├── ItemDetailSheet.js    # Item inspection sheet with audit details
│   │   ├── ItemFormSheet.js      # "+ Log Item" modal sheet with camera capture & compression
│   │   ├── MarkClaimedModal.js   # Official student verification & release modal
│   │   ├── StaffSignInModal.js   # Secure staff login with lockout & PBKDF2 hashing
│   │   └── UserManagementModal.js# Admin console for staff accounts & Supabase sync
│   ├── data/
│   │   ├── categories.js         # Category metadata & storage location presets
│   │   ├── initialItems.js       # Seed inventory items
│   │   └── initialUsers.js       # Seed staff & admin accounts for offline mode
│   └── utils/
│       ├── exportCsv.js          # Sanitized inventory CSV export generator
│       ├── formatters.js         # Date, timestamp, and byte size formatters
│       ├── imageOptimizer.js     # Client-side HTML5 canvas downscaler (<250 KB JPEG)
│       ├── security.js           # PBKDF2 hasher, rate limiter & XSS sanitizer
│       └── supabaseClient.js     # Supabase client with local storage fallback
├── supabase/
│   ├── README.md                 # Supabase setup guide
│   └── schema.sql                # Complete PostgreSQL schema with RLS & storage buckets
├── auraria-logo-white-062824.svg # Official Auraria Campus brand mark
├── icon-192.svg                  # PWA mobile app icon (192x192)
├── icon-512.svg                  # PWA splash icon (512x512)
├── index.html                    # Single Page App shell
├── manifest.json                 # Web App Manifest for mobile installation
├── README.md                     # This documentation file
└── vercel.json                   # Vercel deployment & security headers config
```

---

## Default Demo Accounts & Roles

Pre-configured staff accounts for quick testing and initial station operation:

| Role | Email / Identifier | Password | Initials | Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@auraria.edu` | `Admin2026!` | **ADM** | Manage staff accounts, change roles, reset passwords, configure Supabase sync, log & claim items |
| **Student Staff** | `maya.staff@auraria.edu` | `Staff2026!` | **ML** | Log new items, mark items claimed, edit item details, export CSV inventory |

> [!TIP]
> The sign-in screen includes one-tap quick demo buttons for both roles to allow immediate testing without manual typing.

---

## Local Development & Setup

### Prerequisites
- Python 3.x (or any static HTTP server).

### 1. Configure Local Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Run Local Server
Start the local HTTP server:
```bash
python -m http.server 8080
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

---

## Deployment to Vercel

The repository is pre-configured for one-click deployment to Vercel via [`vercel.json`](file:///d:/Antigravity/LostnFoundApp/vercel.json) and [`api/config.js`](file:///d:/Antigravity/LostnFoundApp/api/config.js).

### Step-by-Step Deployment:
1. **Push to GitHub**:
   Ensure `.env` is **not** committed (`.gitignore` protects it).
   ```bash
   git add .
   git commit -m "Initial commit for Tivoli Lost & Found"
   git push origin main
   ```
2. **Import Project into Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your GitHub repository.
   - Framework Preset: **Other**.
3. **Set Environment Variables in Vercel**:
   Under **Project Settings > Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Public Anon Key
4. **Deploy**:
   - Click **Deploy**. Vercel will build and serve your app with automatic HTTPS.
   - The `/api/config.js` endpoint automatically delivers the Supabase configuration securely without hardcoding credentials in git.

---

## CSV Audit Export

Staff can export the entire lost and found inventory to CSV at any time by clicking the **"CSV"** button in the header.

- **Columns Exported**: ID, Title, Category, Identifier / Student ID, Storage Bin Location, Date Logged, Staff Initials, Status, Claim Date, Claimant Name, Claimant Phone / ID, Releasing Staff Initials, Photo URL.
- **Security Protection**: Built-in formula sanitization prefixes dangerous leading characters (`=`, `+`, `-`, `@`) with a quote to prevent CSV injection spreadsheet attacks.

---

## Troubleshooting & FAQ

#### Q: How do initials work in forms?
When an admin or staff member is logged in, their initials (e.g. `ADM` or `ML`) are automatically populated in strict capital letters in the "+ Log Item" form and "Mark Claimed" verification modal.

#### Q: What happens if Supabase goes offline?
The app automatically detects network or API disconnects and gracefully switches to local storage mode (`localStorage`). Items logged offline will be saved on the desk computer and can be synced later.

#### Q: Can I install this as an app on an iPad or iPhone?
Yes. Open the app URL in Safari, tap the Share icon, and select **"Add to Home Screen"**. The app will run in full-screen standalone mode without Safari browser toolbars.

---

*Auraria Higher Education Center • Tivoli Student Union • Lost & Found Desk*
