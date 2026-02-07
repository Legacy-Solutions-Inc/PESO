# PESO Lambunao – NSRP Jobseeker Registration & Management System

A web-based internal system for **PESO Lambunao** that digitizes the DOLE **National Skills Registration Program (NSRP)** Jobseeker Registration Form. Staff can encode, manage, search, filter, and export jobseeker data in one place.

**Client:** Public Employment Service Office (PESO) – Lambunao  
**Program:** Department of Labor and Employment (DOLE) – NSRP

---

## Features

- **User management** — Role-based access (Admin, Encoder, Viewer); login, password reset
- **Jobseeker registration** — Encode the full NSRP form (personal info, employment status, job preference, education, training, eligibility, work experience, skills, certification, PESO-only fields)
- **Dashboard & records** — Table view, search, filters (age, sex, address, employment, skills, education, OFW/4Ps, etc.), view and edit profiles
- **Export** — CSV export (all or filtered) with DOLE reporting column consistency

*Phase 1 is internal use only; public self-registration and SMS/email blasting are out of scope.*

---

## Tech stack

| Layer      | Technology                    |
|-----------|-------------------------------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI        | React 19, [shadcn/ui](https://ui.shadcn.com), [Tailwind CSS](https://tailwindcss.com) v4, Radix UI |
| Backend   | [Supabase](https://supabase.com) (auth, database) |
| Validation| [Zod](https://zod.dev), React Hook Form |
| Language  | TypeScript                    |

---

## Prerequisites

- **Node.js** 18+ (or 20+ recommended)
- **npm** (or yarn/pnpm/bun)
- **Supabase** project (for auth and database)

---

## Getting started

### 1. Clone and install

```bash
git clone <repository-url>
cd my-app
npm install
```

### 2. Environment variables

Create a `.env.local` in the project root and add your Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: full app URL for email links (e.g. password reset, sign-up confirmation)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get the Supabase values from your [Supabase project](https://supabase.com/dashboard) → **Settings** → **API**. For production, set `NEXT_PUBLIC_SITE_URL` to your deployed URL.

### 3. Run the app

```bash
# Development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

### Other scripts

| Command       | Description        |
|---------------|--------------------|
| `npm run dev` | Start dev server   |
| `npm run build` | Production build  |
| `npm start`   | Run production server |
| `npm run lint`| Run ESLint        |

---

## Project structure

```
my-app/
├── app/              # Next.js App Router (pages, layouts, API routes)
├── components/       # React components (ui/ = primitives, domain-specific elsewhere)
├── lib/              # Utilities, Supabase client, helpers
├── hooks/            # Custom React hooks
├── docs/             # Requirements and project documentation
├── public/           # Static assets
└── supabase/         # Supabase config (optional local tooling)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/requirements.md](docs/requirements.md) | **Software Requirements Specification (SRS)** — functional and non-functional requirements, full form field specification |
| [AGENTS.md](AGENTS.md) | Development and AI/agent guidelines (stack conventions, Clean Code, Vercel) |

Feature work and form fields are based on **docs/requirements.md**; refer to it for exact field names, options, and business rules.

---

## Deployment

The app is built for [Vercel](https://vercel.com). Connect the repository in Vercel and set the same environment variables in the project settings. Preview deployments are created for pull requests; production deploys from the default branch.

---

## License

Proprietary — developed for PESO Lambunao under the DOLE NSRP program.
