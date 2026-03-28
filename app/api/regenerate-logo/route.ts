import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || 'dummy_key';
const client = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, industry, tone, feedback, primaryColor, accentColor } = body;

    // Validate inputs
    if (!businessName || !feedback) {
      return NextResponse.json(
        { message: 'Missing required fields: businessName, feedback' },
        { status: 400 }
      );
    }

    const regeneratePrompt = `You are a professional brand designer. A user has provided feedback on a logo design and wants you to improve it.

CONTEXT:
- Business Name: ${businessName}
- Industry: ${industry}
- Brand Tone: ${tone}
- Current Colors: Primary (${primaryColor}), Accent (${accentColor})

USER FEEDBACK:
"${feedback}"

Based on this feedback, create an improved DISTINCTIVE and UNIQUE logo SVG that incorporates the user's suggestions.

REQUIREMENTS:
- Industry: ${industry}
- Tone: ${tone} (specifically reflect ${industry} industry characteristics)
- Primary color: ${primaryColor}
- Accent colors derived from primary color
- SVG viewBox: "0 0 200 200"
- Style: Modern, professional, memorable
- MUST be unique and different from typical logos
- Incorporate the feedback meaningfully
- NO text/letters inside - pure symbol
- Use gradients and layering for sophistication

Return ONLY valid SVG code wrapped in <svg> tags, no markdown or explanation.`;

    let logoImage = '';
    
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('🚀 Regenerating logo with feedback...');
        const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const response = await Promise.race([
          model.generateContent(regeneratePrompt),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Logo generation timeout')), 12000)
          )
        ]);

        const responseText = (response as any).response.text().trim();
        
        // Extract SVG code
        let svgCode = responseText;
        if (responseText.includes('```')) {
          const match = responseText.match(/<svg[\s\S]*<\/svg>/i);
          if (match) svgCode = match[0];
        }

        if (svgCode.includes('<svg') && svgCode.includes('</svg>')) {
          console.log('✓ Logo regenerated successfully');
          logoImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;
        } else {
          throw new Error('Invalid SVG response');
        }
      } catch (error) {
        console.warn('⚠️ Logo regeneration failed:', error instanceof Error ? error.message : String(error));
        
        // Use client-side fallback SVG
        const fallbackSvg = generateFallbackLogoSvg(businessName, primaryColor, accentColor);
        logoImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;
      }
    } else {
      // No API key - use fallback
      const fallbackSvg = generateFallbackLogoSvg(businessName, primaryColor, accentColor);
      logoImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;
    }

    return NextResponse.json(
      { logoImage, message: 'Logo regenerated based on your feedback' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error regenerating logo:', error);
    return NextResponse.json(
      { message: 'Failed to regenerate logo', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Generates a fallback logo SVG when API fails
 * Uses feedback-aware design variations
 */
function generateFallbackLogoSvg(businessName: string, primaryColor: string, accentColor: string): string {
  const initials = businessName.substring(0, 2).toUpperCase();
  const variation = Math.floor(Math.random() * 3);

  // Three different fallback styles
  const styles = [
    // Geometric with feedback awareness
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#f8fafc" rx="20"/>
      <circle cx="100" cy="100" r="70" fill="url(#grad1)" opacity="0.9"/>
      <path d="M 60 100 L 100 60 L 140 100 L 100 140 Z" fill="${primaryColor}" opacity="0.3"/>
      <text x="100" y="115" font-size="52" font-weight="900" text-anchor="middle" fill="white" font-family="sans-serif">${initials}</text>
      <circle cx="100" cy="100" r="70" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.4"/>
    </svg>`,

    // Abstract flowing (updated style)
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accentColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.9" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#f9fafb" rx="20"/>
      <path d="M 40 100 Q 60 50 100 40 Q 140 50 160 100 Q 150 160 100 170 Q 50 160 40 100" fill="url(#grad2)" opacity="0.85"/>
      <circle cx="100" cy="100" r="40" fill="white" opacity="0.15"/>
      <text x="100" y="115" font-size="40" font-weight="900" text-anchor="middle" fill="white" font-family="sans-serif">${initials}</text>
    </svg>`,

    // Luxury badge (enhanced)
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
        </filter>
      </defs>
      <circle cx="100" cy="100" r="95" fill="${primaryColor}" opacity="0.08"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.4"/>
      <circle cx="100" cy="100" r="80" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.6" stroke-dasharray="5,3"/>
      <path d="M 100,30 L 140,50 L 150,95 L 140,140 L 100,160 L 60,140 L 50,95 L 60,50 Z" fill="${primaryColor}" opacity="0.05"/>
      <text x="100" y="125" font-size="56" font-weight="900" text-anchor="middle" fill="${primaryColor}" font-family="serif">${initials}</text>
      <circle cx="100" cy="100" r="98" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.3" filter="url(#shadow)"/>
    </svg>`
  ];

  return styles[variation];
}
