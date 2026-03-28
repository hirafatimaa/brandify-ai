# Brandify AI - Hackathon Edition

Brandify AI is a premium, AI-powered brand identity generator that creates a complete brand kit in seconds. Built for rapid prototyping and demo-ready delivery, it generates naming support, color palettes, and logo concepts, plus human-in-the-loop refinement for logo feedback.

## Hackathon Context

**Event:** CWA Prompt-a-thon 2026
**Theme:** The AI Brand Architect


This project is our submission for the AI Brand Architect theme: an AI-powered branding assistant that accepts a business description and generates brand assets, logo ideas, and marketing content. We added a human-in-the-loop logo feedback flow to make the results closer to real-world brand iteration.

## Core Features

- One-click brand kit generation (tagline, description, palette, captions)
- AI and SVG logo concepts (3 per generation)
- Human-in-the-loop logo regeneration with feedback
- Premium UI with fast copy-to-clipboard and polished presentation
- Fallback paths for when AI quotas are unavailable

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + ShadCN UI
- Google Gemini API (text + image)
- Lucide React icons

## Quick Start

### Prerequisites
- Node.js 18+
- Gemini API key (free tier)

### Setup
```bash
npm install
```

Create `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

Run the dev server:
```bash
npm run dev
```

Open http://localhost:3000

## How It Works

1. Enter business name, industry, audience, and tone.
2. The app generates a full brand kit and 3 logo concepts.
3. Use “Regenerate” to create a fresh variant.
4. Use the human-in-the-loop logo feedback to refine a specific logo.

## API Endpoints

- `POST /api/generate` – Full brand kit
- `POST /api/regenerate-logo` – Single logo regeneration with feedback
- `POST /api/marketing-content` – Marketing content package

## Project Structure

```
app/            Next.js pages + API routes
components/     UI + brand output components
lib/            Gemini integration and generators
```

## Notes for Demo

- If Gemini quota is exceeded, the app falls back to local SVG logos and mock text.
- Use human-in-the-loop regeneration to show real-time improvement.

## Contact

Event Discord: https://discord.gg/QBAfrfvBWT
Organizer: codewithahsan.dev

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in Vercel
3. Add `GEMINI_API_KEY` in environment variables
4. Deploy

---

**Built with ❤️ for the CWA PROMPT-A-THON 2026. Ready to make real impact.**
