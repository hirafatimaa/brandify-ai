import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

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

  // Try multiple model names (in order of latest/best first)
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
  
  // Try each model until one works
  for (const modelName of modelNames) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = client.getGenerativeModel({ model: modelName });
      const textResponse = await model.generateContent(prompt);
      const textResponseText = textResponse.response.text();
      
      // Parse JSON response
      let jsonMatch = textResponseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON response from AI');
      }
      
      textContent = JSON.parse(jsonMatch[0]);
      
      // Validate all required fields exist
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
  
  if (Object.keys(textContent).length === 0) {
    console.error('All models failed. Last error:', lastError);
    throw new Error(`Failed to generate brand content. Check your API key at https://aistudio.google.com/app/apikeys - Error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  }

  // Generate logo images (using placeholders for demo)
  let logoImages: string[] = [];
  
  try {
    logoImages = await generateLogoImages(businessName, tone, textContent.colors.primary);
  } catch (error) {
    console.error('Error generating logo images:', error);
    // Don't fail completely if images fail - return placeholders
    logoImages = ['', '', ''];
  }

  return {
    tagline: textContent.tagline || 'Create With Purpose',
    description: textContent.description || `${businessName} is a ${tone} brand designed for ${targetAudience}. We deliver excellence with every interaction.`,
    colors: textContent.colors || {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#F9FAFB',
      text: '#1F2937'
    },
    captions: textContent.captions || [
      `✨ Introducing ${businessName} - Your new favorite ${industry.toLowerCase()}`,
      `Join us on this journey. Premium quality, unforgettable experience.`,
      `Limited time offer! Discover what makes us different. 🚀`
    ],
    logoImages
  };
}

async function generateLogoImages(
  businessName: string,
  tone: string,
  primaryColor: string
): Promise<string[]> {
  // Use same model fallback array as text generation
  const modelNames = [
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ];
  
  // Ask the model to generate SVG code for logos
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

  // Generate all 3 logo prompts in parallel
  const logoPromises = logoPrompts.map(async (svgPrompt, i) => {
    // Try each model until one works
    for (const modelName of modelNames) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const response = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: svgPrompt
                }
              ]
            }
          ]
        });

        let svgCode = response.response.text().trim();
        
        // Extract SVG if wrapped in markdown code blocks
        if (svgCode.includes('```')) {
          const match = svgCode.match(/<svg[\s\S]*<\/svg>/i);
          if (match) {
            svgCode = match[0];
          }
        }
        
        // Validate it looks like SVG
        if (svgCode.includes('<svg') && svgCode.includes('</svg>')) {
          console.log(`Logo prompt ${i + 1} generated SVG with ${modelName}`);
          // Convert SVG to data URL so it can be embedded and displayed
          const encodedSvg = encodeURIComponent(svgCode);
          return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
        }
      } catch (error) {
        // Try next model if this one fails
        continue;
      }
    }
    
    // Fallback: generate a simple SVG placeholder if all models fail
    console.warn(`All models failed for logo prompt ${i + 1}, generating fallback SVG`);
    const fallbackSvg = generateFallbackLogoSvg(businessName, primaryColor, i);
    const encodedSvg = encodeURIComponent(fallbackSvg);
    return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
  });

  // Wait for all logo requests to complete in parallel
  const images = await Promise.all(logoPromises);
  return images;
}

// Helper function to generate a fallback SVG logo
function generateFallbackLogoSvg(businessName: string, primaryColor: string, variant: number): string {
  const initials = businessName.substring(0, 2).toUpperCase();
  const colors = [primaryColor, lightenColor(primaryColor, 20), darkenColor(primaryColor, 20)];
  const shapes = ['circle', 'square', 'hexagon'];
  
  const shape = shapes[variant % shapes.length];
  const bgColor = colors[variant % colors.length];
  
  let shapeHtml = '';
  if (shape === 'circle') {
    shapeHtml = `<circle cx="100" cy="100" r="80" fill="${bgColor}" opacity="0.8"/>`;
  } else if (shape === 'square') {
    shapeHtml = `<rect x="20" y="20" width="160" height="160" rx="10" fill="${bgColor}" opacity="0.8"/>`;
  } else {
    shapeHtml = `<polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="${bgColor}" opacity="0.8"/>`;
  }
  
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    ${shapeHtml}
    <text x="100" y="120" font-size="60" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">
      ${initials}
    </text>
  </svg>`;
}

// Helper to lighten a hex color
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R : 255) * 0x10000 +
    (G < 255 ? G : 255) * 0x100 + (B < 255 ? B : 255))
    .toString(16).slice(1);
}

// Helper to darken a hex color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
    (G > 0 ? G : 0) * 0x100 + (B > 0 ? B : 0))
    .toString(16).slice(1);
}
