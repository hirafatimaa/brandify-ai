# Windows SWC Binary Fix Guide

## Problem
```
⚠ Attempted to load @next/swc-win32-x64-msvc, but an error occurred:
\\?\D:\Brandify-AI\node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node is not a valid Win32 application.
```

This error happens on Windows when the native SWC binary fails to load.

---

## Solution (Choose One)

### ✅ Quick Fix (Recommended)

Run this in PowerShell (as Administrator):

```powershell
# 1. Clean everything
npm cache clean --force
Remove-Item -Recurse -Force -Path node_modules
Remove-Item -Force -Path package-lock.json

# 2. Reinstall
npm install

# 3. Start dev server
npm run dev
```

### ✅ Using npm Clean Script

We added a convenient clean script to package.json:

```bash
npm run clean
```

### ✅ Manual Clean (Windows Command Prompt)

```cmd
@echo off
REM Clear npm cache
npm cache clean --force

REM Remove node_modules
rmdir /s /q node_modules

REM Remove lock files
del package-lock.json

REM Reinstall
npm install

REM Start dev
npm run dev
```

### ✅ Alternative: Disable SWC

If the above doesn't work, disable SWC in `next.config.js`:

```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,  // Add this line
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

Then:
```bash
npm run dev
```

---

## Preventive Measures

### Before Installing
```bash
# Clear Node.js cache
npm cache clean --force
```

### Use Node.js LTS
- Recommended: Node.js 18.x or 20.x LTS
- Download: https://nodejs.org

### Disable Antivirus During Install (If Needed)
- Some antivirus software locks files during npm install
- Temporarily disable Windows Defender/antivirus if issues persist

---

## Verification Checklist

After fixing, verify everything works:

```bash
# Check Node version
node --version
# Should be 18.x or higher

# Check npm version
npm --version
# Should be 9.x or higher

# Check dev server
npm run dev
# Should see: "✓ Ready in Xs" and "Local: http://localhost:3000"

# Open browser
# http://localhost:3000
# Should see Brandify AI app
```

---

## Advanced Troubleshooting

### Issue: "EBUSY" or "locked" errors
**Cause**: Files locked by another process  
**Solution**: 
```bash
# Restart PowerShell/Command Prompt as Administrator
# Close VS Code or other editors
# Run npm clean again
```

### Issue: "npm ERR! code ERESOLVE"
**Cause**: Dependency conflict  
**Solution**:
```bash
npm install --legacy-peer-deps
```

### Issue: Still fails after clean
**Solution**: Use Node Version Manager
```bash
# Install nvm-windows from https://github.com/coreybutler/nvm-windows
# Then:
nvm install 20.0.0
nvm use 20.0.0
npm install
npm run dev
```

---

## If All Else Fails

### Nuclear Option (Complete Reset)
```powershell
# 1. Remove everything
Remove-Item -Recurse -Force -Path node_modules
Remove-Item -Force -Path package-lock.json
Remove-Item -Force -Path .next

# 2. Clear npm cache completely
npm cache clean --force
npm config set registry https://registry.npmjs.org/

# 3. Fresh install
npm install

# 4. Build and test
npm run build
npm run dev
```

### Docker Alternative
If Windows issues persist, use Docker:
```bash
# Install Docker Desktop for Windows
# Then:
docker run -it -v %cd%:/app -w /app -p 3000:3000 node:20-alpine npm run dev
```

---

## Files Updated to Fix Issues

✅ **next.config.js** - Converted to CommonJS format  
✅ **package.json** - Updated eslint to v9, added clean script  
✅ **This file** - Comprehensive Windows fix guide

---

## Key Changes Made

### 1. next.config.js
```javascript
// Changed from:
export default nextConfig;

// To:
module.exports = nextConfig;

// Added SWC fallback:
experimental: {
  useWasmBinary: true,
},
```

### 2. package.json
```json
{
  "scripts": {
    "clean": "rmdir /s /q node_modules 2>nul || rm -rf node_modules && npm install"
  },
  "devDependencies": {
    "eslint": "^9"  // Updated from ^8
  }
}
```

---

## After Fixing

Once the dev server starts successfully, you should see:

```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

Then:
1. Open http://localhost:3000
2. Fill out form
3. Generate brand
4. Ready for demo! 🎉

---

## Questions?

Check these files:
- **QUICK_START.md** - Quick reference
- **README.md** - Full documentation
- **DEPLOYMENT.md** - Production guide

---

**Fixed for Windows! ✅**

Your Brandify AI is now optimized for Windows development.
