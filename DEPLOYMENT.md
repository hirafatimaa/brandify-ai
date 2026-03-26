# 🚀 Brandify AI - Complete Setup & Deployment Guide

## ⚡ Quick Start (5 Minutes)

### 1️⃣ Prerequisites
- Node.js 18+ installed ([Download](https://nodejs.org))
- Google account (for Gemini API)
- Code editor (VS Code recommended)

### 2️⃣ Get Your API Key
1. Visit: https://aistudio.google.com/app/apikeys
2. Click **"Create API Key"**
3. Copy the key (starts with `AIzaSy...`)

### 3️⃣ Setup Project
```bash
# Navigate to project folder
cd Brandify-AI

# Install dependencies (one time only)
npm install

# Create .env.local file with your API key
echo GEMINI_API_KEY=your_api_key_here > .env.local

# OR manually create .env.local:
# - Open .env.local in texteditor
# - Paste: GEMINI_API_KEY=AIzaSy...

# Start development server
npm run dev
```

### 4️⃣ Open App
- Open browser → http://localhost:3000
- You should see the Brandify AI interface
- **Done! 🎉**

---

## 📋 Full Setup Instructions

### Step 1: Clone/Extract Project
```bash
cd Brandify-AI
ls -la  # Verify files exist
```

### Step 2: Install Node Modules
```bash
npm install
# Wait 2-3 minutes for completion
```

### Step 3: Configure API Key

**Option A: Using Terminal**
```bash
# Windows (PowerShell)
"GEMINI_API_KEY=AIzaSy..." | Out-File -Encoding UTF8 .env.local

# Mac/Linux
echo "GEMINI_API_KEY=AIzaSy..." > .env.local
```

**Option B: Manual Edit**
1. Open project folder in text editor
2. Create file: `.env.local`
3. Add this line:
   ```
   GEMINI_API_KEY=your_key_here
   ```
4. Save and close

### Step 4: Start Dev Server
```bash
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Localhost:3000
```

### Step 5: Test Application
1. Open http://localhost:3000 in browser
2. Enter a business name: "Coffee Shop Co"
3. Select industry: "Food & Beverage"
4. Enter target audience: "Coffee enthusiasts 25-45"
5. Click "Generate Brand Kit"
6. Wait 5-15 seconds
7. See your brand results!

---

## 🌐 Deploy to Vercel (Live URL)

### Prerequisites for Deployment
- GitHub account
- Git installed on your computer
- Vercel account (free)

### Step-by-Step Deployment

#### 1. Push to GitHub
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial Brandify AI commit"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/brandify-ai.git
git branch -M main
git push -u origin main
```

#### 2. Deploy on Vercel
1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Paste your GitHub repo URL
5. Click **"Import"**
6. In **Environment Variables**, add:
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSy...` (paste your key)
7. Click **"Deploy"**
8. Wait ~2 minutes
9. Get your live URL! 🎉

### Share Your App
- Live URL: `https://brandify-ai.vercel.app`
- Share with judges/friends
- Works on mobile too!

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@google/generative-ai'"
**Solution:**
```bash
npm install
npm run dev
```

### Issue: "GEMINI_API_KEY not found"
**Solution:**
1. Verify `.env.local` exists in root folder
2. Check it has: `GEMINI_API_KEY=AIzaSy...`
3. **Restart dev server**: Stop and run `npm run dev` again
4. Refresh browser

### Issue: "Generation timed out"
**Solution:**
- Check internet connection
- Retry in 10 seconds
- Gemini API may be slow during high traffic

### Issue: "Invalid API key"
**Solution:**
1. Go back to https://aistudio.google.com/app/apikeys
2. Create a new key
3. Copy entire key (including "AIzaSy" prefix)
4. Update `.env.local`
5. Restart dev server

### Issue: Port 3000 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Then restart
npm run dev
```

---

## 📦 Build for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npm start
```

---

## 🎯 Hackathon Demo Tips

### ⏱️ 2-Minute Demo Script
1. "This is Brandify AI - an AI-powered brand generator"
2. Click form field → "Tech Startup"
3. Select industry → "Technology"
4. Enter audience → "Young developers"
5. Click "Generate Brand Kit"
6. While loading, explain: "Using Google Gemini API for instant branding"
7. Results appear → Show tagline, colors, captions
8. Click color to copy hex code
9. Click regenerate for instant variations
10. End: "Complete brand kit in seconds, powered by AI"

### 💡 Highlight Features
- ✅ One-click branding
- ✅ AI-powered content
- ✅ Professional colors
- ✅ Social media captions
- ✅ Instant regeneration
- ✅ Copy-friendly format

### 🎨 Impress Judges
- Use realistic brand names (Nike, Starbucks tone)
- Show different industries (Tech, Fashion, Food)
- Demonstrate regenerate feature
- Highlight UI polish and responsiveness
- Show mobile version (works on phones too!)

---

## 📊 Performance

- **First Load**: 2-3 seconds
- **Brand Generation**: 5-15 seconds
- **Regenerate**: 3-10 seconds
- **Image Placeholders**: Instant

---

## 🔑 Real API Key Usage

This project uses actual Google Gemini API:
- **Free Tier**: 60 requests per minute
- **No Credit Card**: Free to use
- **Rate Limited**: Resets every minute
- **Production Ready**: Can handle hackathon demo traffic

### Cost
- **Your Cost**: $0 (using free tier)
- **Per 1 Million Tokens**: ~$0.075 (paid tier)
- **Approx per Generation**: <1 cent

---

## 📝 Project Structure

```
Brandify-AI/
├── app/
│   ├── page.tsx          # Main page
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── api/generate/
│       └── route.ts      # API endpoint
├── components/
│   ├── BrandForm.tsx     # Input form
│   ├── BrandOutput.tsx   # Results
│   └── ui/               # UI components
├── lib/
│   └── gemini.ts         # AI logic
├── .env.local            # Your API key
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.ts    # Styling config
└── README.md             # Documentation
```

---

## ✅ Verification Checklist

Before demo:
- [ ] `.env.local` has your API key
- [ ] `npm install` completed
- [ ] `npm run dev` shows no errors
- [ ] http://localhost:3000 loads
- [ ] Form fields are interactive
- [ ] "Generate Brand Kit" works
- [ ] Results display correctly
- [ ] Copy buttons work
- [ ] Regenerate button works
- [ ] No console errors (F12)

---

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Google Gemini API](https://ai.google.dev)
- [React Documentation](https://react.dev)

---

## 📞 Support

### Common Commands
```bash
# Start development
npm run dev

# Build production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### File Locations
- **API Key**: `.env.local`
- **Main Page**: `app/page.tsx`
- **Components**: `components/`
- **Styles**: `app/globals.css`, `tailwind.config.ts`
- **AI Logic**: `lib/gemini.ts`

---

## 🎉 You're Ready!

Your Brandify AI application is now complete and ready for:
- ✅ Local development
- ✅ Hackathon submission
- ✅ Production deployment
- ✅ Client presentations

**Happy branding! 🎨✨**

---

Last Updated: February 2025
Next.js 16 • Tailwind CSS • Google Gemini API
