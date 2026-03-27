import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with a dummy key if env var is missing to prevent crash on startup
const apiKey = process.env.GEMINI_API_KEY || 'dummy_key';
const client = new GoogleGenerativeAI(apiKey);

interface BrandKitInput {
  businessName: string;
  industry: string;
  targetAudience: string;
  tone: string;
}

interface BrandKit {
  tagline: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  captions: string[];
  logoImages: string[];
}

export async function generateBrandKit(input: BrandKitInput): Promise<BrandKit> {
  const { businessName, industry, targetAudience, tone } = input;

  const modelNames = [
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  const prompt = `You are a creative branding expert. Generate a premium brand kit for this business.

Business Name: ${businessName}
Industry: ${industry}
Target Audience: ${targetAudience}
Tone/Style: ${tone}

Please provide a JSON response with EXACTLY this structure (no markdown, just valid JSON):
{
  "tagline": "A short, catchy tagline (max 10 words)",
  "description": "A 2-3 sentence brand description",
  "colors": {
    "primary": "#HEX_CODE (main brand color)",
    "secondary": "#HEX_CODE (supporting color)",
    "accent": "#HEX_CODE (accent color)",
    "background": "#HEX_CODE (background color)",
    "text": "#HEX_CODE (text color)"
  },
  "captions": [
    "Instagram caption 1 (engaging, 50-100 chars)",
    "Instagram caption 2 (different tone)",
    "Instagram caption 3 (call-to-action focused)"
  ]
}

Make sure:
- All hex codes are valid capital letters (e.g., #FF5733, #1E3A5F)
- Tagline is memorable and reflects the ${tone} style
- Colors complement each other professionally and are diverse
- Captions are engaging, brand-appropriate, and suitable for ${industry}
- Return ONLY the JSON object, no markdown, no extra text`;

  let textContent: any = {};
  let lastError: any;
  
  if (process.env.GEMINI_API_KEY) {
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = client.getGenerativeModel({ model: modelName });
        const textResponse = await model.generateContent(prompt);
        const textResponseText = textResponse.response.text();
        
        let jsonMatch = textResponseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Failed to parse JSON response from AI');
        }
        
        textContent = JSON.parse(jsonMatch[0]);
        
        if (!textContent.tagline || !textContent.description || !textContent.colors || !textContent.captions) {
          throw new Error('Incomplete response from AI - missing required fields');
        }
        
        console.log(`✓ Successfully used model: ${modelName}`);
        break;
      } catch (error) {
        lastError = error;
        console.warn(`✗ Model ${modelName} failed:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }
  } else {
    console.warn('GEMINI_API_KEY is missing. Skipping direct Gemini API call.');
  }
  
  // TEXT FALLBACK SYSTEM
  if (Object.keys(textContent).length === 0) {
    console.warn('⚠️ [Fallback Triggered] Gemini text generation failed or key is missing. Using dynamic mock text fallback.');
    textContent = generateMockBrandText(businessName, industry, targetAudience, tone);
  }

  let logoImages: string[] = [];
  try {
    logoImages = await generateLogoImages(businessName, tone, textContent.colors.primary);
  } catch (error) {
    console.warn('⚠️ [Fallback Triggered] Logo generation failed:', error);
    // Absolute worst case fallback if generateLogoImages itself crashes completely
    logoImages = [
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateFallbackLogoSvg(businessName, textContent.colors.primary, 0))}`,
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateFallbackLogoSvg(businessName, textContent.colors.primary, 1))}`,
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateFallbackLogoSvg(businessName, textContent.colors.primary, 2))}`
    ];
  }

  return {
    tagline: textContent.tagline,
    description: textContent.description,
    colors: textContent.colors,
    captions: textContent.captions,
    logoImages
  };
}

// ─── TEXT FALLBACK LOGIC ───
function generateMockBrandText(businessName: string, industry: string, targetAudience: string, tone: string) {
  // Generate a primary color deterministically based on business name length to make mock feel somewhat unique
  const hue = (businessName.length * 25) % 360;
  
  return {
    tagline: `Elevating ${industry} for the modern world.`,
    description: `${businessName} is a ${tone} brand designed specifically for ${targetAudience}. We deliver excellence, innovation, and unforgettable experiences with every interaction inside the ${industry} space.`,
    colors: {
      primary: `hsl(${hue}, 75%, 50%)`,
      secondary: `hsl(${(hue + 45) % 360}, 60%, 45%)`,
      accent: `hsl(${(hue + 120) % 360}, 80%, 60%)`,
      background: '#FAFAFA',
      text: '#111827'
    },
    captions: [
      `✨ Introducing ${businessName} - Your new favorite ${industry.toLowerCase()} brand.`,
      `Join us on this journey. Premium quality, unforgettable experience crafted just for you in the ${tone} aesthetic.`,
      `Discover what makes us different. Click the link in our bio to learn more! 🚀`
    ]
  };
}

// ─── IMAGE GENERATION & FALLBACK LOGIC ───
async function generateLogoImages(
  businessName: string,
  tone: string,
  primaryColor: string
): Promise<string[]> {
  const modelNames = [
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ];
  
  const logoPrompts = [
    `Create an SVG logo for "${businessName}" in ${tone} style. Requirements:
    - Minimal, modern design with clean lines
    - Professional look suitable for ${tone} aesthetic
    - Dominant color: ${primaryColor}
    - SVG viewBox: "0 0 200 200"
    - Simple geometric shapes or abstract design
    - Text: "${businessName.substring(0, 2).toUpperCase()}" in the center
    
    Return ONLY valid SVG code wrapped in <svg> tags, no markdown or explanation.`,
    
    `Design an abstract icon/logo SVG for "${businessName}" brand. Specs:
    - ${tone} aesthetic with geometric shapes
    - Primary color ${primaryColor}
    - Accent colors: lighter and darker shades of ${primaryColor}
    - SVG viewBox: "0 0 200 200"
    - Modern, minimalist style
    - No text, pure icon design
    
    Return ONLY valid SVG code, no markdown or extra text.`,
    
    `Generate a professional brand mark SVG for "${businessName}". Details:
    - Style: ${tone} with premium feel
    - Main color: ${primaryColor}
    - Size: viewBox="0 0 200 200"
    - Circular or badge-like composition
    - Initials or monogram: "${businessName.substring(0, 1).toUpperCase()}"
    - Clean vector design
    
    Return ONLY the SVG code, nothing else.`
  ];

  const logoPromises = logoPrompts.map(async (svgPrompt, i) => {
    // 1. Primary: Try Gemini SVG Generation first
    if (process.env.GEMINI_API_KEY) {
      for (const modelName of modelNames) {
        try {
          const model = client.getGenerativeModel({ model: modelName });
          const response = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: svgPrompt }] }]
          });

          let svgCode = response.response.text().trim();
          
          if (svgCode.includes('```')) {
            const match = svgCode.match(/<svg[\s\S]*<\/svg>/i);
            if (match) svgCode = match[0];
          }
          
          if (svgCode.includes('<svg') && svgCode.includes('</svg>')) {
            console.log(`✓ Logo prompt ${i + 1} generated SVG with ${modelName}`);
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;
          }
        } catch (error) {
          continue; // Try next model
        }
      }
    }

    // 2. Fallback: Try Stability AI if Gemini fails
    try {
      if (process.env.STABILITY_API_KEY) {
        console.warn(`⚠️ [Fallback Triggered] Gemini failed for logo ${i + 1}. Attempting Stability AI...`);
        const stabilityImage = await generateStabilityAiImages(businessName, tone, primaryColor);
        if (stabilityImage) return stabilityImage;
      }
    } catch (err) {
      console.warn(`⚠️ [Fallback Triggered] Stability AI failed for logo ${i + 1}: `, err instanceof Error ? err.message : String(err));
    }

    // 3. Last Resort Fallback: Simple SVG Mock
    console.warn(`⚠️ [Fallback Triggered] All AI models failed for logo ${i + 1}. Using simple SVG placeholder.`);
    const fallbackSvg = generateFallbackLogoSvg(businessName, primaryColor, i);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;
  });

  return await Promise.all(logoPromises);
}

// Simulated Stability AI API integration (fallback)
async function generateStabilityAiImages(businessName: string, tone: string, primaryColor: string): Promise<string | null> {
  const stabilityApiKey = process.env.STABILITY_API_KEY;
  if (!stabilityApiKey) return null;

  const prompt = `A professional, minimalist, high-quality logo icon for the brand "${businessName}". The style should be modern and ${tone}. A dominant brand color of ${primaryColor} should be prominent on a clean white background. Flat vector illustration style, centered, high resolution.`;

  const engineId = 'stable-diffusion-v1-6';
  const apiHost = 'https://api.stability.ai';

  const response = await fetch(`${apiHost}/v1/generation/${engineId}/text-to-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${stabilityApiKey}`,
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height: 512,
      width: 512,
      samples: 1,
      steps: 30,
    }),
  });

  if (!response.ok) {
    throw new Error(`Stability API error: ${await response.text()}`);
  }

  const responseJSON = (await response.json());
  const artifact = responseJSON.artifacts[0];
  
  if (artifact && artifact.base64) {
    console.log('✓ Successfully generated image with Stability AI');
    return `data:image/png;base64,${artifact.base64}`;
  }
  
  throw new Error('No image artifact returned from Stability AI');
}

// ─── SVG MOCK GENERATION (LAST RESORT) ───
function generateFallbackLogoSvg(businessName: string, primaryColor: string, variant: number): string {
  const initials = businessName.substring(0, 2).toUpperCase() || 'AI';
  
  // Ensure we have a valid color, or default to a blue if primaryColor is a CSS variable
  let mainColor = primaryColor;
  if (!mainColor || mainColor.startsWith('hsl(')) {
    mainColor = '#4F46E5'; // Default indigo
  }
  
  const colors = [mainColor, lightenColor(mainColor, 20), darkenColor(mainColor, 20)];
  const shapes = ['circle', 'square', 'hexagon'];
  
  const shape = shapes[variant % shapes.length];
  const bgColor = colors[variant % colors.length];
  
  let shapeHtml = '';
  if (shape === 'circle') {
    shapeHtml = `<circle cx="100" cy="100" r="80" fill="${bgColor}" opacity="0.8"/>`;
  } else if (shape === 'square') {
    shapeHtml = `<rect x="25" y="25" width="150" height="150" rx="20" fill="${bgColor}" opacity="0.8"/>`;
  } else {
    shapeHtml = `<polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="${bgColor}" opacity="0.8"/>`;
  }
  
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#f8fafc"/>
    ${shapeHtml}
    <text x="100" y="120" font-size="52" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif">
      ${initials}
    </text>
  </svg>`;
}

function lightenColor(color: string, percent: number): string {
  if (color.startsWith('hsl')) return color; // Skip logic for HSL mocks
  if (!color.startsWith('#')) return color;
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R : 255) * 0x10000 + (G < 255 ? G : 255) * 0x100 + (B < 255 ? B : 255)).toString(16).slice(1);
}

function darkenColor(color: string, percent: number): string {
  if (color.startsWith('hsl')) return color; // Skip logic for HSL mocks
  if (!color.startsWith('#')) return color;
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 + (G > 0 ? G : 0) * 0x100 + (B > 0 ? B : 0)).toString(16).slice(1);
}
