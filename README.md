# Sarthak Rawat — Portfolio v2

Personal portfolio of Sarthak Rawat, a video editor and motion designer.
Built with **Next.js 16 (App Router) + Tailwind CSS v4 + Sanity CMS**, with
**React Three Fiber / drei / postprocessing** for 3D and **GSAP ScrollTrigger + Lenis** for motion.

## Sections
Hero (3D glass camera lens + video thumbnail marquee) → stats & clients → Showreel →
Selected Work (filterable) → What I Do (bento with animated mini-visuals and CSS-3D icons) →
Process (scroll/drag before–after) → Toolkit marquee → About & journey → Testimonials → FAQ → CTA + footer.

## Develop
```bash
npm install
npm run dev        # http://localhost:3000  — Studio at /studio
npm run build && npm start
```

## Content
All content lives in `src/content/site.ts` and is used automatically until Sanity is connected.
To edit everything from the CMS:

1. Create a free project at https://www.sanity.io/manage and copy the Project ID.
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SANITY_PROJECT_ID`.
3. In sanity.io/manage → API → CORS origins, add `http://localhost:3000` and your Vercel URL (allow credentials).
4. Optional: create an Editor token, set `SANITY_WRITE_TOKEN`, and run `npm run seed` to import all current content.
5. Open `/studio`.

Any collection left empty in Sanity falls back to the built-in content.

## Deploy (Vercel free tier)
Import the repo in Vercel (framework preset: Next.js), add the `NEXT_PUBLIC_SANITY_*` env vars, deploy.
Pages revalidate every 60 seconds, so CMS edits go live without redeploying.

## Screenshots
`node scripts/screenshots.mjs <outDir> [section,section]` against a running server captures
desktop + mobile shots of every section (see `docs/screenshots/`).

`legacy/` keeps the previous single-file site for reference; `public/resources.html` and
`public/motion_design_mastery_guide.html` are carried over unchanged.
