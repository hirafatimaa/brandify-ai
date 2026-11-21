# Brandify AI

Brandify turns a business brief into six logo directions and a working brand manual. Pick a direction to see its signatures, palette, typography and applications. Download the manual, the logo book or a ZIP with production artwork.

## Run locally

Use Node.js 20.9 or newer and Bun.

```bash
bun install
cp -n .env.example .env.local
bun run dev
```

Create a key in [Google AI Studio](https://aistudio.google.com/apikey). Paste it after `GEMINI_API_KEY=` in `.env.local` and restart the dev server. The default text model is `gemini-3.1-flash-lite`, which Google lists on its [free tier](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.1-flash-lite). Keep the key on the server. A missing key or a Gemini error opens a labeled local preview with preset logo directions and working exports.

Open [the brand brief](http://localhost:3000/create). Use the optional logo details to supply a concept, constraints and up to six cropped logo references. Upload a mark you have permission to modify if you want Gemini to propose an adapted direction.

## Generation and export

- `POST /api/generate` validates the brief, requests structured copy and logo recipes from Gemini, and builds outlined SVGs on the server. Gemini supplies two constructions for each pictorial direction so the renderer can try a second brief-specific mark when the first fails the silhouette or small-size checks.
- `POST /api/brand-export` renders the chosen direction as a landscape PDF or asset ZIP. It also produces a six-direction logo book and a standalone avatar.
- `POST /api/marketing` generates the separate marketing kit.

The [make-logo skill](https://github.com/arla6ka/design.how/tree/main/skills/make-logo) is vendored under `.agents/skills/make-logo` with its scripts and MIT license. The web implementation follows its grid recipes, outlined OFL fonts, 16 px checks, calibrated silhouette comparisons, direction book and production package. It uses public Are.na samples for additional comparisons when live generation is configured and those samples are available. The browser handles user image uploads locally and submits only low-resolution silhouettes. Public reference masks stay on the server. The site builds adaptations from explicitly opted-in uploaded marks. The upstream Python tools remain available for manual vector tracing and recalibration with a cleaned reference set.

The project began at the CWA Prompt-a-thon 2026 under the AI Brand Architect theme.
