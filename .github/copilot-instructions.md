<!-- GitHub Copilot Instructions for Brandify AI -->

# Brandify AI - Production-Ready AI Brand Generator

This workspace contains a premium Next.js application for generating complete brand identities using Google Gemini API.

## Project Overview

- **Type**: Next.js 16 + TypeScript
- **Purpose**: AI-powered brand identity generation (taglines, colors, logos, captions)
- **Status**: Production-ready for hackathon demo
- **Key Features**: One-click brand generation, 5-color palettes, AI logo concepts, Instagram captions

## Key Technologies

- Next.js 16 (App Router)
- Tailwind CSS + ShadCN UI components
- Google Gemini API (text + image generation)
- TypeScript for type safety
- Lucide React icons

## Project Structure

```
/app           - Next.js pages and API routes
  /api/generate - AI brand generation endpoint
  /page.tsx     - Main home page
  /layout.tsx   - Root layout
/components       - React components
  /BrandForm.tsx    - Input form component
  /BrandOutput.tsx  - Results display component
  /ui/              - ShadCN UI component library
/lib              - Utility functions
  /gemini.ts    - Google Gemini API integration
```

## Development Workflow

1. **Setup**: Install dependencies → Configure Gemini API key → Start dev server
2. **Development**: Edit components in /components or pages in /app
3. **Testing**: Access http://localhost:3000 to test the application
4. **Building**: Run `npm run build` before deployment
5. **Deployment**: Push to GitHub and deploy to Vercel

## Important Configuration Files

- `.env.local` - Contains Gemini API key (REQUIRED)
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js build configuration
- `package.json` - Dependencies and scripts

## Key Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration Notes

- **Endpoint**: POST `/api/generate`
- **Provider**: Google Gemini API (free tier available)
- **Models Used**: 
  - `gemini-1.5-flash` for text generation
  - `gemini-2.0-flash` for image generation
- **Timeout**: ~10-20 seconds per request

## Common Tasks

### Add a New UI Component
1. Create file in `/components/ui/`
2. Export from component barrel exports
3. Use in pages with Tailwind styling

### Customize Brand Generation Prompt
- Edit the prompt in `/lib/gemini.ts`
- Adjust tone/style instructions
- Rebuild and test

### Change Application Theme
- Edit primary color in `tailwind.config.ts`
- Update CSS variables in `app/globals.css`
- No code changes needed

## Debugging Tips

1. Check browser console for errors
2. Verify `.env.local` has valid Gemini API key
3. Check terminal output for API errors
4. Ensure Node.js version is 18+
5. Clear `.next/` folder if build issues occur

## Production Deployment

Ready to deploy to Vercel:
1. Connect GitHub repository
2. Add `GEMINI_API_KEY` environment variable
3. Deploy - Next.js automatically optimizes build

## Performance Considerations

- Image generation (3 logos): 5-15 seconds
- Text generation: 2-5 seconds
- Total request: 10-20 seconds
- Cached responses where possible
- Graceful fallbacks for failed images

---

For more details, see README.md in the project root.
