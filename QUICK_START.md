# ⚡ Brandify AI - Quick Start Guide

## 30-Second Setup

```bash
# 1. Install
npm install

# 2. Add API key to .env.local (already has placeholder)
# - Open .env.local and replace with your key from aistudio.google.com

# 3. Run
npm run dev

# 4. Open
# → http://localhost:3000
```

## Get Gemini API Key

1. Go to: https://aistudio.google.com/app/apikeys
2. Click **"Create API Key"**  
3. Copy the key
4. Paste into `.env.local`

## Test The App

1. Enter: "Coffee Roasters"
2. Select: "Food & Beverage"
3. Enter: "Coffee enthusiasts 25-45"
4. Click: "Generate Brand Kit"
5. Wait 5-15 seconds
6. See results! ✨

## Available Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run code linter
```

## Key Files

| File | Purpose |
|------|---------|
| `.env.local` | Your API key lives here |
| `app/page.tsx` | Main home page |
| `app/api/generate/route.ts` | AI generation endpoint |
| `components/BrandForm.tsx` | Input form |
| `components/BrandOutput.tsx` | Results display |
| `lib/gemini.ts` | Gemini API integration |

## Demo Tips

✅ **Works great with:**
- Coffee shops
- Tech startups
- Fashion brands
- Fitness studios
- Real estate

✅ **Try different tones:**
- Modern: Clean, contemporary
- Luxury: Premium, exclusive
- Fun: Playful, energetic
- Minimal: Simple, elegant
- Bold: Strong, confident

## Features

- ✨ AI taglines
- 🎨 Color palettes
- 📸 Logo concepts
- 📱 Social captions
- 🔁 Regenerate variations
- 📋 Copy everything

## Troubleshooting

**API Key Error?**
- Check `.env.local` has your key
- Restart: `npm run dev`

**Timeout Error?**
- Retry in 10 seconds
- Check internet connection

**Port 3000 In Use?**
```bash
# Windows: Kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux: 
lsof -i :3000
kill -9 <PID>
```

**Won't Start?**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## Next Steps

- 📖 Read [README.md](./README.md) for full docs
- 🚀 See [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy
- 📊 Check [GitHub Copilot Instructions](./.github/copilot-instructions.md)

---

**Ready to generate amazing brands? 🎨✨**
