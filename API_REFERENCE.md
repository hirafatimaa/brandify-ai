# 🎨 Brandify AI - API Reference & Features

## API Endpoint

### POST `/api/generate`

Generates a complete brand kit for a business.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessName": "Urban Coffee Co.",
  "industry": "Food & Beverage",
  "targetAudience": "Coffee enthusiasts, young professionals",
  "tone": "modern"
}
```

**Query Parameters:**
- `businessName` (required): Name of the business (1-100 chars)
- `industry` (required): Industry category
- `targetAudience` (required): Description of target market
- `tone` (optional): Brand tone - "modern", "luxury", "fun", "minimal", "bold" (default: "modern")

**Success Response (200):**
```json
{
  "tagline": "Brew Good. Stay Better.",
  "description": "Urban Coffee Co. is a premium destination for coffee enthusiasts and busy professionals who value quality in every cup.",
  "colors": {
    "primary": "#8B4513",
    "secondary": "#D2B48C",
    "accent": "#FF8C00",
    "background": "#FFF8F0",
    "text": "#2F1F0F"
  },
  "captions": [
    "☕ New morning, new possibilities with Urban Coffee Co.",
    "Handcrafted excellence in every cup. Premium quality guaranteed.",
    "Join our coffee community. Limited time offer for our grand opening!"
  ],
  "logoImages": ["", "", ""]
}
```

**Error Response (400/500):**
```json
{
  "message": "Error description here"
}
```

---

## Industries Supported

```
- Technology
- Fashion
- Food & Beverage
- Health & Wellness
- Finance
- Education
- Entertainment
- Real Estate
- E-commerce
- Travel
- Automotive
- Other
```

---

## Brand Tones

| Tone | Description | Use Case |
|------|-------------|----------|
| **Modern** | Clean, contemporary, forward-thinking | Tech startups, modern brands |
| **Luxury** | Premium, exclusive, sophisticated | High-end products, services |
| **Fun** | Playful, energetic, approachable | Entertainment, youth brands |
| **Minimal** | Simple, elegant, understated | Minimalist brands, design-focused |
| **Bold** | Strong, confident, attention-grabbing | Disruptive brands, bold statements |

---

## Response Fields

### Tagline
- Length: 5-10 words
- Purpose: One-liner brand slogan
- Use: Website hero, social media bio

### Description
- Length: 2-3 sentences (~100-150 chars)
- Purpose: Brand mission/value statement
- Use: About page, brand guidelines

### Color Palette

#### Primary Color
- Main brand color
- Use: Primary CTA buttons, headers, logo

#### Secondary Color
- Supporting color
- Use: Secondary buttons, accents

#### Accent Color
- Highlight color
- Use: Links, hover states, special elements

#### Background Color
- Page background
- Use: Default page background

#### Text Color
- All text color
- Use: Body text, headings

### Captions (Instagram Ready)
- 3 different captions
- Length: 50-100 characters each
- Style: Engaging, brand-appropriate
- Include: Emojis, hooks, CTAs

### Logo Images
- 3 logo concepts
- Format: Currently placeholders (demo mode)
- In production: Could integrate DALL-E or Midjourney

---

## Example Requests

### Coffee Shop
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Bean Dreams Coffee",
    "industry": "Food & Beverage",
    "targetAudience": "Coffee enthusiasts aged 20-45",
    "tone": "luxury"
  }'
```

### Tech Startup
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "TechFlow AI",
    "industry": "Technology",
    "targetAudience": "Developers and tech enthusiasts",
    "tone": "modern"
  }'
```

### Fashion Brand
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Luna Apparel",
    "industry": "Fashion",
    "targetAudience": "Young women aged 18-35",
    "tone": "bold"
  }'
```

### Fitness Studio
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "PowerFit Studio",
    "industry": "Health & Wellness",
    "targetAudience": "Fitness enthusiasts looking for community",
    "tone": "fun"
  }'
```

---

## Response Times

| Component | Time |
|-----------|------|
| API Response Start | 1-2 seconds |
| Text Generation | 3-5 seconds |
| Color Generation | Instant |
| Captions Generation | 2-3 seconds |
| Total Generation | 5-15 seconds |
| Image Falling back | Instant |

---

## Rate Limits

- **Free Tier**: 60 requests per minute
- **Rate Limit Reset**: Every minute
- **Max Concurrent**: Handled by Vercel

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Missing required fields | Check all fields are provided |
| 401 | Invalid API key | Update `.env.local` with valid key |
| 500 | Server error | Retry in 10 seconds |
| 504 | Request timeout | Internet may be slow, retry |

---

## Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| Missing required fields | Form validation | Fill all required fields |
| API configuration error | Missing API key | Add GEMINI_API_KEY to .env.local |
| Generation timed out | Server too slow | Retry or check internet |
| Failed to generate | API error (rare) | Retry or check API key validity |

---

## Frontend Features

### UI Components
- ✅ Gradient header
- ✅ Premium card layout
- ✅ Smooth animations
- ✅ Loading skeleton
- ✅ Error alerts
- ✅ Copy buttons
- ✅ Regenerate button
- ✅ Mobile responsive

### Interactions
- ✅ Form validation (real-time)
- ✅ Copy to clipboard (with feedback)
- ✅ Regenerate variations
- ✅ Reset form ("Start New Brand Kit")
- ✅ Smooth scrolling
- ✅ Loading indicators

### Data Display
- ✅ Color swatches
- ✅ Hex codes
- ✅ Formatted descriptions
- ✅ Social captions
- ✅ Logo placeholders

---

## Customization Guide

### Change Default Tone
Edit `components/BrandForm.tsx`:
```typescript
const [tone, setTone] = useState('luxury'); // Change default
```

### Add New Industry
Edit `components/BrandForm.tsx`:
```typescript
const INDUSTRIES = [
  'Select an industry',
  'Your New Industry', // Add here
  'Technology',
  // ...
];
```

### Modify AI Prompt
Edit `lib/gemini.ts`, find and modify:
```typescript
const prompt = `You are a creative branding expert...` // Edit prompt
```

### Change Color Theme
Edit `tailwind.config.ts`:
```typescript
primary: {
  DEFAULT: 'hsl(220 90% 56%)', // Change to your color
}
```

---

## Performance Optimization

### Frontend
- Lazy loading components
- Optimized re-renders
- CSS animations use transform/opacity
- Minimal JavaScript bundle

### Backend
- Single API call per generation
- Efficient JSON parsing
- Timeout protection (maxDuration: 30s)
- Error boundary handling

### Deployment
- Vercel edge functions
- Automatic code splitting
- Image optimization
- Caching headers

---

## Troubleshooting API Issues

### "API key not found"
```
Solution: Add GEMINI_API_KEY to .env.local
```

### "Generation failed"
```
Solution: Check API key is valid
Try: Visit https://aistudio.google.com/app/apikeys
```

### "Request timeout"
```
Solution: Network connection may be slow
Try: Retry in 10 seconds
Check: Internet speed
```

### "Empty response"
```
Solution: Gemini API overloaded
Try: Retry immediately
```

---

## Best Practices

### ✅ Do's
- ✅ Use realistic company names
- ✅ Be specific about target audience
- ✅ Try different tones to see variations
- ✅ Regenerate for new ideas
- ✅ Copy important information

### ❌ Don'ts
- ❌ Don't submit empty fields
- ❌ Don't mock invalid API key
- ❌ Don't spam regenerate rapidly
- ❌ Don't close browser during generation
- ❌ Don't edit .env.local to wrong format

---

## Integration Examples

### React Hook
```typescript
const [brand, setBrand] = useState(null);
const [loading, setLoading] = useState(false);

const generateBrand = async (data) => {
  setLoading(true);
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const brand = await res.json();
  setBrand(brand);
  setLoading(false);
};
```

### Express.js Proxy
```typescript
app.post('/api/generate', async (req, res) => {
  const response = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' }
  });
  res.json(await response.json());
});
```

---

## Monitoring & Analytics

### Recommended Setup
- Vercel Analytics (built-in)
- Google Analytics (frontend)
- Sentry (error tracking)
- LogRocket (session replay)

### Key Metrics to Track
- API response time
- Generation success rate
- Error frequency
- User engagement
- Feature usage patterns

---

## Support & Resources

- 📖 [README.md](./README.md) - Full documentation
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- ⚡ [QUICK_START.md](./QUICK_START.md) - Quick reference
- ✅ [PRE_DEMO_CHECKLIST.md](./PRE_DEMO_CHECKLIST.md) - Demo prep

---

**API Version**: 1.0  
**Last Updated**: February 2025  
**Status**: Production Ready
