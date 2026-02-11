# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server (localhost:3000, hot reload)
- `npm run build` — Production build
- `npm start` — Serve production build
- `npm run lint` — Run ESLint

No test runner is configured.

## Architecture

NeonLab is an educational web platform built with **Next.js 16 App Router**, **React 19**, **TypeScript**, and **Tailwind CSS 4**. It teaches React/Next.js concepts through interactive labs and projects.

### Routing

Three content sections, each following the same pattern:

| Route | Section | Data source | Component registry |
|-------|---------|-------------|--------------------|
| `/blog`, `/blog/[slug]` | Blog posts | `src/lib/posts.ts` | N/A (markdown-style) |
| `/lab`, `/lab/[slug]` | Mini-labs | `src/lib/labs.ts` | `src/labcontent/mini-labs/index.ts` |
| `/projects`, `/projects/[slug]` | Projects | `src/lib/projects/projects.ts` | `src/projectscontent/implementations/index.ts` |

### Content Registry Pattern

Each content section uses a two-part system:
1. **Metadata array** in `src/lib/` — defines slug, title, description, tags
2. **Component map** in the content directory — maps slugs to React components

Dynamic `[slug]/page.tsx` files resolve async params, look up metadata + component by slug, and render. If either is missing, a not-found fallback is shown.

```typescript
// Pattern in [slug]/page.tsx:
const params = await props.params;
const data = dataArray.find(item => item.slug === params.slug);
const Component = componentMap[params.slug as SlugType];
```

### Component Organization

Each content section in `/app` follows Container/Presentational split:
- `*List.tsx` — maps over data, renders cards
- `*Card.tsx` — pure presentational, receives props

Lab and project implementations live in their own directories under `src/labcontent/` and `src/projectscontent/`, each with a component file and an `index.ts` re-export.

### Client vs Server Components

- Components are Server Components by default
- Interactive components use `"use client"` directive (counters, forms, fetch demos)
- Mini-labs explicitly demonstrate both patterns (e.g., `client-counter` vs `server-time`)

### Styling

- Tailwind CSS 4 via PostCSS
- Neon theme defined in `src/app/globals.css` with custom CSS classes: `.neon-card` (fuchsia glow on hover), `.neon-link` (drop-shadow hover)
- Oxanium Google Font
- Layout containers use `mx-auto max-w-3xl` (blog) or `max-w-4xl` (projects)

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).
