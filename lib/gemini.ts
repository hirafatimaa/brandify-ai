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

interface MarketingKit {
  instagramPosts: InstagramPost[];
  linkedinPosts: LinkedInPost[];
  leadGeneration: LeadGeneration;
}

interface InstagramPost {
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  imageUrl?: string;
  simulatedComments: string[];
  aiReplies: string[];
}

interface LinkedInPost {
  caption: string;
  imagePrompt: string;
  imageUrl?: string;
  cta: string;
  simulatedComments: string[];
  aiReplies: string[];
}

interface LeadGeneration {
  coldDM: string;
  followUpDM: string;
  leadReply: string;
  closingMessage: string;
}

// ─── CLIENT-SIDE SVG LOGO GENERATOR (ZERO API COST) ───
function generateIndustrySpecificLogos(
  businessName: string,
  industry: string,
  primaryColor: string,
  accentColor: string
): string[] {
  const initials = businessName.substring(0, 2).toUpperCase();
  
  const logos = [
    // Logo 1: Geometric Industry-Specific Icon
    generateGeometricLogo(initials, industry, primaryColor, accentColor),
    
    // Logo 2: Abstract Flowing Design
    generateAbstractLogo(initials, industry, primaryColor, accentColor),
    
    // Logo 3: Premium Monogram Badge
    generateMonogramLogo(initials, primaryColor, accentColor)
  ];
  
  return logos.map(svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
}

// Geometric professional mark based on industry
function generateGeometricLogo(initials: string, industry: string, primary: string, accent: string): string {
  const industryElements: { [key: string]: { shape: string; pattern: string; accent: boolean } } = {
    'tech': { shape: 'circle', pattern: '◆◆◆', accent: true },
    'finance': { shape: 'triangle', pattern: '△△△', accent: true },
    'health': { shape: 'cross', pattern: '✚✚✚', accent: false },
    'fashion': { shape: 'curve', pattern: '◯◯◯', accent: true },
    'food': { shape: 'leaf', pattern: '🍃', accent: false },
    'real-estate': { shape: 'square', pattern: '□□□', accent: true },
    'education': { shape: 'star', pattern: '★★★', accent: true },
    'entertainment': { shape: 'circle', pattern: '⬤⬤⬤', accent: true },
  };
  
  const element = industryElements[industry.toLowerCase()] || industryElements['tech'];
  
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${accent};stop-opacity:0.8" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="#f8fafc" rx="20"/>
    <circle cx="100" cy="80" r="55" fill="url(#grad1)" opacity="0.9"/>
    <circle cx="100" cy="80" r="45" fill="none" stroke="${primary}" stroke-width="2" opacity="0.3"/>
    <text x="100" y="95" font-size="48" font-weight="900" text-anchor="middle" fill="white" font-family="sans-serif" letter-spacing="2">${initials}</text>
    <path d="M 50 150 Q 100 130 150 150" stroke="${accent}" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round"/>
  </svg>`;
}

// Abstract flowing design
function generateAbstractLogo(initials: string, industry: string, primary: string, accent: string): string {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${primary};stop-opacity:0.9" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="#f9fafb" rx="20"/>
    <path d="M 60 80 Q 80 40 100 60 Q 120 40 140 80 Q 150 120 100 160 Q 50 120 60 80" fill="url(#grad2)" opacity="0.85"/>
    <path d="M 80 95 Q 100 75 120 95 Q 115 125 100 135 Q 85 125 80 95" fill="white" opacity="0.2"/>
    <text x="100" y="125" font-size="32" font-weight="900" text-anchor="middle" fill="white" font-family="sans-serif">${initials}</text>
  </svg>`;
}

// Luxury monogram badge
function generateMonogramLogo(initials: string, primary: string, accent: string): string {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
      </filter>
    </defs>
    <circle cx="100" cy="100" r="90" fill="${primary}" opacity="0.08"/>
    <circle cx="100" cy="100" r="85" fill="none" stroke="${primary}" stroke-width="2" opacity="0.4"/>
    <circle cx="100" cy="100" r="78" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.6" stroke-dasharray="5,3"/>
    <polygon points="100,35 140,55 135,100 140,145 100,165 60,145 65,100 60,55" fill="${primary}" opacity="0.05"/>
    <text x="100" y="120" font-size="52" font-weight="900" text-anchor="middle" fill="${primary}" font-family="serif" letter-spacing="4">${initials}</text>
    <circle cx="100" cy="100" r="95" fill="none" stroke="${accent}" stroke-width="1" opacity="0.3" filter="url(#shadow)"/>
  </svg>`;
}

export async function generateBrandKit(input: BrandKitInput): Promise<BrandKit> {
  const { businessName, industry, targetAudience, tone } = input;

  const prompt = `You are an elite brand strategy consultant with decades of experience creating premium brands. Your task is to craft a sophisticated, market-ready brand identity.

BUSINESS PROFILE:
- Name: ${businessName}
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Brand Personality: ${tone}

CRITICAL REQUIREMENTS FOR HIGH-QUALITY OUTPUT:

TAGLINE GUIDELINES:
- Maximum 8 words, highly memorable and unique
- Must be emotionally resonant for ${targetAudience}
- Should communicate core value proposition
- Must reflect ${tone} aesthetic perfectly
- Avoid generic or overused phrases
- Inspire confidence and aspiration

DESCRIPTION GUIDELINES:
- 2-3 powerful sentences that tell the brand story
- Position ${businessName} as premium and differentiated
- Speak directly to ${targetAudience}'s desires and pain points
- Use vivid, sensory language
- Create emotional connection to the brand
- Emphasize unique value proposition

COLOR PALETTE PSYCHOLOGY:
- Primary color: Main brand identity, evoke leadership/trust in ${industry}
- Secondary color: Support primary, create visual hierarchy
- Accent color: Create energy and draw attention (complementary to primary)
- Background: Premium, sophisticated (usually light/neutral)
- Text: High contrast, readable, professional (usually dark)

SPECIFIC COLOR REQUIREMENTS:
- Use color psychology appropriate for ${industry}
- Ensure WCAG AA accessibility contrast ratios
- Create a cohesive 5-color palette that works across touchpoints
- All colors must be sophisticated and market-tested
- Avoid overly saturated or trendy colors
- Each color serves a specific purpose

CAPTION GUIDELINES (Instagram/Social):
1. First caption: Brand story/emotional hook (60-100 words) - Make them feel something
2. Second caption: Value proposition/benefit focused (50-80 words) - Show why it matters
3. Third caption: Engagement/action focused (40-70 words) - Clear CTA, create urgency

Each caption must:
- Be authentic to ${tone} voice
- Appeal specifically to ${targetAudience}
- Include 2-3 relevant hashtags where appropriate
- Use emojis strategically (not excessive)
- Be unique and avoid generic templates
- Drive engagement and brand awareness

OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no explanations):
{
  "tagline": "Your premium tagline here",
  "description": "Your brand story here",
  "colors": {
    "primary": "#HEX_CODE",
    "secondary": "#HEX_CODE",
    "accent": "#HEX_CODE",
    "background": "#HEX_CODE",
    "text": "#HEX_CODE"
  },
  "captions": [
    "Full Instagram caption 1",
    "Full Instagram caption 2",
    "Full Instagram caption 3"
  ]
}

VALIDATION CHECKLIST:
✓ All hex codes are uppercase with # prefix (e.g., #FF5733)
✓ Tagline is memorable and reflects ${tone}
✓ Colors are sophisticated and complementary
✓ Captions are unique, engaging, and platform-optimized
✓ Entire response is valid JSON
✓ No markdown formatting or extra text`;

  let textContent: any = {};
  
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('🚀 [BUDGET MODE] Generating brand text with gemini-2.0-flash (optimal cost)...');
      const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
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
      
      console.log(`✓ Brand text generated successfully (~3-5 seconds, minimal cost)`);
    } catch (error) {
      console.warn(`⚠️ [Fallback] Text generation failed:`, error instanceof Error ? error.message : String(error));
      // Will use fallback below
    }
  } else {
    console.warn('⚠️ GEMINI_API_KEY is missing. Using fallback text generation.');
  }
  
  // TEXT FALLBACK SYSTEM
  if (Object.keys(textContent).length === 0) {
    console.warn('⚠️ [Fallback Triggered] Using dynamic mock text generation (instant, free).');
    textContent = generateMockBrandText(businessName, industry, targetAudience, tone);
  }

  // ZERO-COST CLIENT-SIDE LOGO GENERATION (instant, no API calls)
  console.log('🎨 Generating logos with client-side SVG (instant, free)...');
  const logoImages = generateIndustrySpecificLogos(
    businessName, 
    industry, 
    textContent.colors.primary,
    textContent.colors.accent
  );
  console.log(`✓ 3 premium logos generated instantly (cost: $0)`);

  return {
    tagline: textContent.tagline,
    description: textContent.description,
    colors: textContent.colors,
    captions: textContent.captions,
    logoImages
  };
}

// ─── EFFICIENT MARKETING IMAGE GENERATION ───
async function generateMarketingImages(
  businessName: string,
  industry: string,
  tone: string,
  imagePrompts: { insta: string; linkedin: string }
): Promise<{ instaImage?: string; linkedinImage?: string }> {
  const images: { instaImage?: string; linkedinImage?: string } = {};

  // Only attempt if API key exists and we haven't hit quota
  if (!process.env.GEMINI_API_KEY) {
    return images;
  }

  try {
    // Try to generate Instagram key visual (1st image - most important)
    try {
      const instaImagePrompt = `Generate an Instagram-ready hero image SVG/design brief for "${businessName}" brand in ${industry}.

Specifications:
- Size: 1080x1080px square (Instagram standard)
- Style: ${tone} aesthetic
- Content: Eye-catching visual that represents ${businessName}'s value proposition
- Elements: Minimal text, focus on visual appeal, must work on all devices
- Color: Use brand colors efficiently
- Must be: Professional, scrollstop-worthy, on-brand

Recommend AI generation approach or provide detailed visual brief. Keep under 100 tokens.`;

      const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const timeout = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Instagram image timeout')), 6000)
      );

      const generatePromise = model.generateContent(instaImagePrompt).then((response) => {
        const text = response.response.text().trim();
        // Return as data URL SVG if it's SVG, otherwise return as image prompt
        if (text.includes('<svg')) {
          const match = text.match(/<svg[\s\S]*<\/svg>/i);
          if (match) {
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(match[0])}`;
          }
        }
        return undefined; // Use fallback prompt instead
      });

      const result = await Promise.race([generatePromise, timeout]) as string | undefined;
      if (result) {
        images.instaImage = result;
      }
    } catch (error) {
      // Silently continue if image generation fails
      console.warn('Instagram image generation skipped:', error instanceof Error ? error.message : '');
    }

    // Try to generate LinkedIn professional visual (thought leadership)
    try {
      const linkedinImagePrompt = `Create a professional LinkedIn-ready visual design for "${businessName}" thought leadership content.

Specifications:
- LinkedIn standard: 1200x628px
- Style: Professional, corporate, ${tone} aesthetic
- Content: Authority-building visual for ${industry} industry
- Elements: Could show data, insights, or professional presentation
- Color: Business-appropriate colors
- Must be: Clean, informative, professional

Brief description or SVG code. Keep under 80 tokens.`;

      const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const timeout = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('LinkedIn image timeout')), 6000)
      );

      const generatePromise = model.generateContent(linkedinImagePrompt).then((response) => {
        const text = response.response.text().trim();
        if (text.includes('<svg')) {
          const match = text.match(/<svg[\s\S]*<\/svg>/i);
          if (match) {
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(match[0])}`;
          }
        }
        return undefined;
      });

      const result = await Promise.race([generatePromise, timeout]) as string | undefined;
      if (result) {
        images.linkedinImage = result;
      }
    } catch (error) {
      console.warn('LinkedIn image generation skipped:', error instanceof Error ? error.message : '');
    }
  } catch (error) {
    console.warn('⚠️ [Image Generation] Skipped to preserve quota:', error instanceof Error ? error.message : '');
  }

  return images;
}

// ─── MARKETING KIT GENERATION ───
export async function generateMarketingKit(input: BrandKitInput): Promise<MarketingKit> {
  const { businessName, industry, targetAudience, tone } = input;

  const marketingPrompt = `You are an expert AI growth marketer, branding strategist, and social media content creator.

BUSINESS CONTEXT:
- Business Name: ${businessName}
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Brand Tone: ${tone}

Generate a complete marketing and lead generation kit with READY-TO-POST content for Instagram and LinkedIn.

Return STRICT JSON ONLY (no markdown, no explanations):

{
  "instagramPosts": [
    {
      "caption": "Scroll-stopping Instagram caption with hook + CTA (80-120 words, authentic, conversational, include emojis strategically)",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "imagePrompt": "Detailed, modern, aesthetic, brand-aligned Instagram visual prompt for AI image generation (minimal, clean, visually appealing, suitable for ${tone} brand)",
      "simulatedComments": [
        "Realistic user comment showing engagement",
        "Another authentic comment from target audience"
      ],
      "aiReplies": [
        "Friendly, personalized brand reply to first comment",
        "Engaging, value-driven reply to second comment"
      ]
    },
    {
      "caption": "Second scroll-stopping Instagram caption (different angle/benefit, 80-120 words)",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "imagePrompt": "Different modern Instagram visual concept for ${tone} brand (clean, on-brand, high-quality aesthetic)",
      "simulatedComments": [
        "Real-sounding comment from potential customer",
        "Another engaging comment"
      ],
      "aiReplies": [
        "Personalized response",
        "Value-adding response"
      ]
    },
    {
      "caption": "Third Instagram caption (story-driven, emotional, personal connection angle)",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "imagePrompt": "Story-driven visual for ${businessName} brand showing authentic moments or transformation",
      "simulatedComments": [
        "Emotional, relatable comment",
        "Another comment with question"
      ],
      "aiReplies": [
        "Heart-felt response",
        "Helpful, detailed answer"
      ]
    }
  ],
  "linkedinPosts": [
    {
      "caption": "Professional LinkedIn post building authority and trust (150-200 words, industry insights, value-driven, actionable)",
      "imagePrompt": "Clean, professional, minimalist LinkedIn visual concept (corporate, informative, data-driven aesthetic suitable for ${tone} brand)",
      "cta": "Soft call-to-action for engagement or leads (connection, message, visit link, etc)",
      "simulatedComments": [
        "Professional audience comment showing respect",
        "Another thoughtful, industry-relevant comment"
      ],
      "aiReplies": [
        "Insightful, helpful reply",
        "Engaging, value-adding response"
      ]
    },
    {
      "caption": "Second LinkedIn post (thought leadership angle, industry trend, unique perspective)",
      "imagePrompt": "Professional visual for thought leadership content suitable for LinkedIn",
      "cta": "Soft engagement or inquiry CTA",
      "simulatedComments": [
        "Comment from industry professional",
        "Another thoughtful contribution"
      ],
      "aiReplies": [
        "Knowledge-sharing response",
        "Collaborative, engaging reply"
      ]
    }
  ],
  "leadGeneration": {
    "coldDM": "Personalized LinkedIn cold outreach message (3-4 sentences, non-spammy, value-driven, specific to their industry/role, natural and human)",
    "followUpDM": "Friendly follow-up message if no reply (2-3 sentences, add value, soft ask for conversation)",
    "leadReply": "Response when lead shows interest (2-3 sentences, acknowledge their interest, next step invitation, build relationship)",
    "closingMessage": "Soft closing message to convert lead into customer (3-4 sentences, remind value, easy next step, professional but warm)"
  }
}

CRITICAL REQUIREMENTS:
- Instagram: Visually appealing, trendy, conversion-focused, use emojis wisely (2-3 per caption)
- LinkedIn: Professional, value-first, authority-building, help-oriented
- Image prompts: Detailed enough for AI generation, specify style/mood/aesthetic
- All captions: Feel human, conversational, NOT robotic or templated
- Comments: Realistic, varied, show authentic engagement from target audience
- Replies: Personalized, helpful, build community, not generic
- Focus: Attract attention AND convert leads
- Lead Gen: Non-salesy, relationship-first, value-driven approach`;

  const modelNames = [
    'gemini-2.0-flash',
    'gemini-1.5-flash', 
    'gemini-1.5-pro',
  ];

  let marketingContent: any = {};
  
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('🚀 [BUDGET MODE] Generating marketing kit with gemini-2.0-flash...');
      const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const response = await model.generateContent(marketingPrompt);
      const responseText = response.response.text();
      
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON response');
      }
      
      marketingContent = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!marketingContent.instagramPosts || !marketingContent.linkedinPosts || !marketingContent.leadGeneration) {
        throw new Error('Missing required fields in marketing kit');
      }
      
      console.log(`✓ Marketing kit generated successfully (minimal cost)`);
    } catch (error) {
      console.warn(`⚠️ [Fallback] Marketing kit generation failed:`, error instanceof Error ? error.message : String(error));
    }
  }

  // Fallback if generation fails
  if (Object.keys(marketingContent).length === 0) {
    console.warn('⚠️ [Fallback] Using dynamic marketing kit generation');
    marketingContent = generateFallbackMarketingKit(businessName, industry, targetAudience, tone);
  }

  // Skip image generation to save API quota - just use prompts for the user
  console.log('📊 Marketing kit ready (image generation skipped to preserve budget)');

  return {
    instagramPosts: marketingContent.instagramPosts || [],
    linkedinPosts: marketingContent.linkedinPosts || [],
    leadGeneration: marketingContent.leadGeneration || { coldDM: '', followUpDM: '', leadReply: '', closingMessage: '' }
  };
}

// ─── TEXT FALLBACK LOGIC ───
function generateMockBrandText(businessName: string, industry: string, targetAudience: string, tone: string) {
  // Generate a primary color deterministically based on business name length to make mock feel somewhat unique
  const hue = (businessName.length * 25) % 360;
  
  // Premium color palette generation
  const premiumColors: { [key: string]: string } = {
    'luxury': '#D4AF37',
    'modern': '#2563EB',
    'bold': '#E50914',
    'elegant': '#4B0082',
    'minimal': '#1F2937',
    'vibrant': '#FF6B35',
    'playful': '#FF1493',
    'professional': '#003366'
  };

  const toneKey = tone.toLowerCase().substring(0, 1);
  let primaryHex = premiumColors[tone.toLowerCase()] || `hsl(${hue}, 72%, 48%)`;

  // Enhanced fallback taglines by tone
  const taglines: { [key: string]: string } = {
    'luxury': `Premium ${industry} crafted for the discerning.`,
    'modern': `${businessName}: The future of ${industry}.`,
    'bold': `Redefining ${industry} standards.`,
    'elegant': `Sophisticated ${industry} reimagined.`,
    'minimal': `Essential ${industry} done right.`,
    'vibrant': `Energy and innovation in every ${industry.toLowerCase()}.`,
    'playful': `${industry} that brings joy.`,
    'professional': `${businessName}: Excellence in ${industry.toLowerCase()}.`
  };

  const selectedTagline = taglines[tone.toLowerCase()] || taglines['professional'];

  // Enhanced fallback descriptions
  const descriptions: { [key: string]: string } = {
    'luxury': `${businessName} represents the pinnacle of excellence in ${industry}, curated exclusively for ${targetAudience} who demand only the finest. Every detail reflects our commitment to uncompromising quality and timeless sophistication.`,
    'modern': `${businessName} reimagines ${industry} for today's forward-thinking ${targetAudience}. We combine cutting-edge innovation with intuitive design to create experiences that feel effortlessly advanced.`,
    'bold': `Bold, unapologetic, and undeniably ${tone}. ${businessName} challenges conventional ${industry} thinking and delivers transformative solutions designed for ${targetAudience} ready to make an impact.`,
    'elegant': `${businessName} embodies refined grace in the ${industry} space. Designed thoughtfully for ${targetAudience}, we craft timeless experiences infused with elegance and meaningful purpose.`,
    'minimal': `Simplicity meets sophistication at ${businessName}. We've distilled ${industry} to its essence for ${targetAudience} who appreciate clarity, functionality, and beautiful design.`,
    'vibrant': `${businessName} brings dynamic energy to ${industry}. We create bold, vibrant experiences for ${targetAudience} who refuse to blend in and demand brands that match their enthusiasm.`,
    'playful': `${businessName} makes ${industry} fun, approachable, and joyful. Perfect for ${targetAudience} who believe business should be engaging, friendly, and authentically ${tone}.`,
    'professional': `${businessName} is your trusted partner in ${industry}. We deliver professional excellence and reliable solutions tailored to the unique needs of ${targetAudience}.`
  };

  const selectedDescription = descriptions[tone.toLowerCase()] || descriptions['professional'];

  // Enhanced captions with better copy
  const captionSets: { [key: string]: string[] } = {
    'luxury': [
      `Crafted for those who know the difference. ${businessName} brings uncompromising quality to ${industry}. Every detail matters. ✨ #LuxuryRedefined #${businessName.replace(/\s/g, '')}`,
      `Premium doesn't just mean expensive—it means intentional. Experience the difference curated excellence makes. Discover what sets us apart. 🌟`,
      `Your excellence awaits. Join our community of discerning ${targetAudience.toLowerCase()} who demand the finest in ${industry.toLowerCase()}. Link in bio. 👑`
    ],
    'modern': [
      `The future of ${industry} is here. ${businessName} combines innovation, design, and purpose. Welcome to what's next. 🚀 #Innovation #${businessName.replace(/\s/g, '')}`,
      `Modern, intuitive, unstoppably forward-thinking. Experience ${industry} reimagined for today and tomorrow. See what's possible.`,
      `Ready to level up? Join the ${businessName} community. Tap the link in bio to transform your ${industry.toLowerCase()} experience. 🎯`
    ],
    'bold': [
      `Conventional is boring. ${businessName} disrupts ${industry} with bold ideas and fearless execution for ${targetAudience} like you. Break the mold with us. 💥 #BoldMoves`,
      `We don't follow trends—we create them. Experience a ${industry} brand that matches your audacity and ambition.`,
      `Ready to stand out? Join leaders and innovators choosing ${businessName}. Transform your approach today. Link in bio. 🔥`
    ],
    'elegant': [
      `Grace meets purpose. ${businessName} brings refined sophistication to ${industry} for those who appreciate the finer details. Discover elegance. ✨ #RefinedLife #${businessName.replace(/\s/g, '')}`,
      `Beauty and substance intertwined. Experience ${industry} elevated to an art form, thoughtfully designed for ${targetAudience} like you.`,
      `Sophistication is a feeling. Explore how ${businessName} redefines elegance in ${industry.toLowerCase()}. Your journey starts here. 💎`
    ],
    'minimal': [
      `Less is more. ${businessName} strips away the unnecessary to reveal pure, elegant ${industry} designed for clarity and purpose. #MinimalDesign #${businessName.replace(/\s/g, '')}`,
      `Simplicity doesn't mean simple. Just beautifully essential. That's ${businessName}'s philosophy in ${industry.toLowerCase()}.`,
      `Tired of complexity? Discover how ${businessName} makes ${industry.toLowerCase()} effortlessly simple. Start today. Link in bio. ✓`
    ],
    'vibrant': [
      `Energy. Innovation. Pure ${tone} vibes. ${businessName} brings electric creativity to ${industry}. Join the movement! 🌈 #VibrantLife #${businessName.replace(/\s/g, '')}`,
      `Bored with ordinary? ${businessName} brings bold colors and infectious energy to every aspect of ${industry.toLowerCase()}. Feel the difference.`,
      `Your ${industry.toLowerCase()} doesn't have to be boring. Experience vibrant, engaging, unexpectedly fun. Link in bio to transform! 🎉`
    ],
    'playful': [
      `Who says ${industry} has to be serious? ${businessName} brings joy, humor, and genuine fun to your experience. Let's play! 🎮 #PlayfulBrand #${businessName.replace(/\s/g, '')}`,
      `${industry} just got more fun. ${businessName} is the brand that makes you smile while getting what you need. Join us! 😄`,
      `Serious about having fun? Discover ${businessName}—where ${industry.toLowerCase()} meets personality. Tap the link! 🚀`
    ],
    'professional': [
      `Trusted expertise. Reliable solutions. ${businessName} leads ${industry} with professional excellence and proven results for ${targetAudience}. Partner with us. #Excellence #${businessName.replace(/\s/g, '')}`,
      `Your success is our mission. ${businessName} delivers professional-grade ${industry} solutions trusted by industry leaders.`,
      `Ready to elevate your ${industry.toLowerCase()}? Join hundreds of satisfied partners. Discover difference experience makes. Learn more. 🎯`
    ]
  };

  const selectedCaptions = captionSets[tone.toLowerCase()] || captionSets['professional'];

  return {
    tagline: selectedTagline,
    description: selectedDescription,
    colors: {
      primary: primaryHex,
      secondary: `hsl(${(hue + 45) % 360}, 65%, 45%)`,
      accent: `hsl(${(hue + 120) % 360}, 75%, 55%)`,
      background: '#FAFBFC',
      text: '#0F172A'
    },
    captions: selectedCaptions
  };
}

// ─── MARKETING KIT FALLBACK ───
function generateFallbackMarketingKit(businessName: string, industry: string, targetAudience: string, tone: string): MarketingKit {
  return {
    instagramPosts: [
      {
        caption: `🚀 Introducing ${businessName} - Your ${industry} solution designed for ${targetAudience}. We combine innovation with results. Ready to transform your ${industry.toLowerCase()} experience? Learn what makes us different. #${businessName.replace(/\s/g, '')} #Innovation #${industry.replace(/\s/g, '')}`,
        hashtags: [`#${businessName.replace(/\s/g, '')}`, `#${industry.replace(/\s/g, '')}`, '#Innovation', '#Growth', `#${targetAudience.replace(/\s/g, '')}`],
        imagePrompt: `Modern, clean, aesthetic Instagram post visual for ${businessName} - a ${tone} ${industry} brand. Minimalist design with brand colors, professional yet engaging, suitable for ${targetAudience}.`,
        simulatedComments: [
          `This is exactly what I've been looking for in ${industry.toLowerCase()}!`,
          `Love how you're approaching this. When can we chat?`
        ],
        aiReplies: [
          `Thanks! We're excited to help. DM us to learn more! 🙌`,
          `Would love to connect! Let's schedule a quick call. 💬`
        ]
      },
      {
        caption: `${businessName} delivers premium quality and trusted expertise in ${industry}. Our ${targetAudience} community is growing daily. Join the movement and discover the difference. Every detail matters. #Quality #Trusted #${industry.replace(/\s/g, '')}`,
        hashtags: [`#${businessName.replace(/\s/g, '')}`, '#Quality', '#Premium', '#Community', '#Growth'],
        imagePrompt: `Elegant, professional, minimalist visual showing ${businessName} value proposition. Suitable for ${tone} brand aesthetic, featuring clean typography and modern design elements.`,
        simulatedComments: [
          `Finally someone who gets it! This is the standard we need.`,
          `Already a fan. Recommend you to everyone in my circle.`
        ],
        aiReplies: [
          `That means everything to us! Spread the word. 🙏`,
          `We appreciate you! Let us return the favor. 💪`
        ]
      },
      {
        caption: `Behind every ${businessName} decision is commitment to your success. We're not just a ${industry} provider - we're your growth partner. Let's build something amazing together. #Partnership #Growth #Success`,
        hashtags: [`#${businessName.replace(/\s/g, '')}`, '#Partnership', '#Growth', '#Success', '#Community'],
        imagePrompt: `Authentic, relatable visual showing ${businessName} brand story. Featuring people, energy, and connection. Minimalist style with ${tone} aesthetic.`,
        simulatedComments: [
          `This is the kind of partner every business needs.`,
          `Would love to learn more about your approach.`
        ],
        aiReplies: [
          `Let's chat! Excited to explore how we can help. 💡`,
          `DM us - let's find your perfect solution! 🎯`
        ]
      }
    ],
    linkedinPosts: [
      {
        caption: `Industry Insight: The Future of ${industry}\\n\\nWe're witnessing a shift in how ${targetAudience} approach ${industry.toLowerCase()}. What's changing? Three critical factors:\\n\\n1. **Personalization** - One-size-fits-all is dead. Success means understanding unique needs.\\n\\n2. **Value-First** - Moving beyond features to real outcomes and impact measurement.\\n\\n3. **Partnership** - Leading ${industry.toLowerCase()} providers now act as consultants, not vendors.\\n\\nAt ${businessName}, we've built our entire approach around these principles. The future belongs to ${industry.toLowerCase()} solutions that put your success first.\\n\\nWhat changes do you see coming to ${industry.toLowerCase()}? I'd love to hear your perspective.`,
        imagePrompt: `Professional, data-driven LinkedIn visual for ${businessName}. Modern, minimalist design with industry-relevant graphics or subtle charts. Corporate yet approachable.`,
        cta: `Share your thoughts in the comments - what's changing in your ${industry.toLowerCase()}?`,
        simulatedComments: [
          `This resonates deeply. The industry is definitely shifting toward partnership models.`,
          `Great insights. Would love to discuss how you're implementing this at ${businessName}.`
        ],
        aiReplies: [
          `Exactly! The best partnerships are built on mutual understanding and shared goals. What challenges are you seeing?`,
          `We're seeing this play out every day with our clients. Happy to dive deeper if you want to connect.`
        ]
      },
      {
        caption: `Why ${businessName} Exists\\n\\nWe started because we saw a gap in the ${industry.toLowerCase()} space:\\n\\n❌ Most solutions focus only on today's problems\\n✅ We build for your future success\\n\\n❌ Generic approaches fail unique businesses\\n✅ We customize everything around YOUR needs\\n\\n❌ Vendors disappear after the sale\\n✅ We're your ongoing growth partner\\n\\nIf you're tired of ${industry.toLowerCase()} providers that don't truly understand your business, let's talk. We're different by design.\\n\\nCurious about our approach? Let's start a conversation.`,
        imagePrompt: `Clean, professional LinkedIn post visual. Minimalist design with bold text. Shows ${businessName} positioning and values. Modern, corporate aesthetic.`,
        cta: `Interested in a different approach? Connect with us and let's explore.`,
        simulatedComments: [
          `This is refreshing. Finally an honest conversation about what's broken.`,
          `Love the transparency. How do you ensure this at scale?`
        ],
        aiReplies: [
          `Great question! We've built our team and processes specifically around this commitment.`,
          `Let's jump on a call - I can walk you through exactly how we do this. Would be valuable context for your decision.`
        ]
      }
    ],
    leadGeneration: {
      coldDM: `Hi ${targetAudience}! I noticed your work in ${industry.toLowerCase()} and thought of you. We've built ${businessName} specifically to help forward-thinking ${targetAudience} like you scale impact without the usual trade-offs. Curious if it's worth a quick conversation? No pressure - just exploring.`,
      followUpDM: `Still thinking about that ${industry.toLowerCase()} challenge we discussed? Sent you a resource that might be helpful. Happy to connect if you'd like to explore solutions.`,
      leadReply: `That's fantastic to hear! I'm genuinely excited about what we might build together. How about we spend 20 mins next week to explore your specific needs? I can show you exactly how ${businessName} could help.`,
      closingMessage: `Based on everything we discussed, I genuinely believe ${businessName} can drive real results for you. Why don't we start with a small project to prove value? Let's chat about next steps when you're ready.`
    }
  };
}

// ─── IMAGE GENERATION & FALLBACK LOGIC ───
async function generateLogoImages(
  businessName: string,
  industry: string,
  tone: string,
  primaryColor: string
): Promise<string[]> {
  const logoPrompts = [
    `Create a DISTINCTIVE professional brand mark SVG for "${businessName}" company in ${industry}.

DESIGN BRIEF - VARIANT 1: GEOMETRIC PROFESSIONAL MARK
Requirements:
- Industry: ${industry}
- Tone: ${tone} (NOT generic, specifically reflect ${industry} industry characteristics)
- Primary color: ${primaryColor}
- Style: Bold geometric shapes forming an UNIQUE symbol/icon specific to ${industry} (NOT just letters)
- Examples for context: Tech = circuit patterns, Fashion = elegant silhouettes, Finance = ascending lines, Health = plus/heartbeat, Food = distinctive shape
- SVG viewBox: "0 0 200 200"
- Design should be:
  ✓ Memorable and distinctive (NOT boring or generic)
  ✓ Professional and premium
  ✓ Work at any size (scalable)
  ✓ Modern with personality
  ✓ Reflect ${industry} industry visually
  ✓ Incorporate 2-3 accent colors derived from ${primaryColor}
  ✓ NO text/letters inside - pure symbol

Return ONLY valid SVG code wrapped in <svg> tags, no markdown or explanation.`,
    
    `Create an ICONIC abstract symbol SVG for "${businessName}" in ${industry}.

DESIGN BRIEF - VARIANT 2: ABSTRACT INDUSTRY ICON
Requirements:
- Business: ${businessName} in ${industry}
- Brand personality: ${tone}
- Primary color: ${primaryColor}
- Style: ABSTRACT icon that captures the ESSENCE of ${industry} and ${tone} values
- Examples for context: 
  • Tech company = connected nodes, forward motion, innovation lines
  • Fashion = flowing curves, elegance, movement
  • Finance = upward trajectory, stability, trust
  • Food = organic shapes, warmth, community
- SVG viewBox: "0 0 200 200"
- Design must be:
  ✓ UNIQUE and creative (NOT just lines or generic shapes)
  ✓ Visually striking and memorable
  ✓ Conveys motion, energy, or core brand value
  ✓ Layered with depth (overlapping shapes)
  ✓ Uses color gradients or shading for sophistication
  ✓ Different from VARIANT 1 - more artistic, less geometric

Return ONLY valid SVG code with no markdown or explanation.`,
    
    `Create a PREMIUM monogram/badge SVG for "${businessName}" brand.

DESIGN BRIEF - VARIANT 3: LUXURY MONOGRAM MARK
Requirements:
- Business: ${businessName} in ${industry} (TARGET AUDIENCE PREMIUM)
- Aesthetic: ${tone} with luxury feel
- Color scheme: ${primaryColor} with gold/metallic accents
- Initials: "${businessName.substring(0, 1).toUpperCase()}" or "${businessName.substring(0, 2).toUpperCase()}"
- SVG viewBox: "0 0 200 200"
- Style inspiration:
  • Luxury fashion brands = ornamental frames, elegant typography, badge shape
  • Executive brands = prestigious seals, shields, crown elements
  • Premium services = minimalist monogram, refined borders
- Design requirements:
  ✓ Premium, high-end feel (suitable for luxury positioning)
  ✓ Sophisticated typography or script lettering
  ✓ Ornamental frame or badge structure
  ✓ Uses 2-3 metallic/accent colors
  ✓ Completely DIFFERENT from VARIANT 1 and 2
  ✓ Could be embossed or engraved appearance
  ✓ Memorable and instantly recognizable

Return ONLY valid SVG code, no markdown or extra text.`
  ];

  const logoPromises = logoPrompts.map(async (svgPrompt, i) => {
    // Single unified logo generation with aggressive timeout
    return await Promise.race([
      generateSingleLogo(svgPrompt, i, businessName, tone, primaryColor),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error(`Logo ${i + 1} timeout`)), 12000)
      )
    ]).catch((error) => {
      console.warn(`⚠️ [Fallback Triggered] Logo prompt ${i + 1} failed:`, error instanceof Error ? error.message : String(error));
      const fallbackSvg = generateFallbackLogoSvg(businessName, primaryColor, i);
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;
    });
  });

  return await Promise.all(logoPromises);
}

// ─── SINGLE LOGO GENERATION HELPER ───
async function generateSingleLogo(
  svgPrompt: string,
  index: number,
  businessName: string,
  tone: string,
  primaryColor: string
): Promise<string> {
  // Only use models that work with current Gemini API (free tier)
  const modelNames = [
    'gemini-2.0-flash',        // Primary model
    'gemini-1.5-flash',        // Fallback for image requests
    'gemini-1.5-pro',          // Pro fallback
  ];
  
  // Try each model with timeout
  if (process.env.GEMINI_API_KEY) {
    for (const modelName of modelNames) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        
        // Single timeout for entire model attempt
        const generatePromise = model.generateContent({
          contents: [{ role: 'user', parts: [{ text: svgPrompt }] }]
        });
        
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${modelName} timeout`)), 7000)
        );
        
        const response = await Promise.race([generatePromise, timeout]) as any;
        let svgCode = response.response.text().trim();
        
        if (svgCode.includes('```')) {
          const match = svgCode.match(/<svg[\s\S]*<\/svg>/i);
          if (match) svgCode = match[0];
        }
        
        if (svgCode.includes('<svg') && svgCode.includes('</svg>')) {
          console.log(`✓ Logo ${index + 1} SVG with ${modelName}`);
          return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        
        // Handle quota errors - don't retry, go straight to fallback
        if (message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')) {
          console.warn(`✗ ${modelName}: Quota exceeded - using fallback`);
          throw new Error('Quota exhausted');
        }
        
        // Handle not found errors - skip this model
        if (message.includes('404') || message.includes('not found')) {
          console.warn(`✗ ${modelName}: Not available - trying next`);
          continue;
        }
        
        console.warn(`✗ ${modelName}: ${message}`);
        continue;
      }
    }
  }

  // Quota exhausted or all models failed
  throw new Error('All logo generation methods exhausted');
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

// ─── SVG MOCK GENERATION (LAST RESORT) - CREATIVE & VARIED ───
function generateFallbackLogoSvg(businessName: string, primaryColor: string, variant: number): string {
  const initials = businessName.substring(0, 2).toUpperCase() || 'AI';
  
  let mainColor = primaryColor;
  if (!mainColor || mainColor.startsWith('hsl(')) {
    mainColor = '#4F46E5';
  }
  
  const accentColor = lightenColor(mainColor, 30);
  const darkColor = darkenColor(mainColor, 20);
  
  // VARIANT 1: GRADIENT GEOMETRIC WITH LAYERED SHAPES (Professional Mark)
  if (variant === 0) {
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${mainColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkColor};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.2"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#f8fafc"/>
      <!-- Outer ring -->
      <circle cx="100" cy="100" r="85" fill="none" stroke="${mainColor}" stroke-width="2" opacity="0.3"/>
      <!-- Main gradient circle -->
      <circle cx="100" cy="100" r="70" fill="url(#grad1)" filter="url(#shadow)"/>
      <!-- Inner accent -->
      <circle cx="100" cy="100" r="55" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.4"/>
      <!-- Geometric accent elements -->
      <polygon points="100,45 145,70 130,120 70,120 55,70" fill="${accentColor}" opacity="0.15"/>
      <!-- Text -->
      <text x="100" y="115" font-size="48" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" letter-spacing="2">
        ${initials}
      </text>
    </svg>`;
  }
  
  // VARIANT 2: ABSTRACT SWOOSH/WAVE ICON (Artistic, Dynamic)
  if (variant === 1) {
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accentColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${mainColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#f8fafc"/>
      <!-- Organic flowing shapes -->
      <path d="M 40 120 Q 70 60, 100 80 T 160 100" stroke="${mainColor}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 50 150 Q 80 100, 110 120 T 170 130" stroke="${accentColor}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/>
      <!-- Abstract accent circles -->
      <circle cx="100" cy="100" r="30" fill="${mainColor}" opacity="0.1"/>
      <circle cx="130" cy="75" r="12" fill="${accentColor}" opacity="0.4"/>
      <circle cx="70" cy="145" r="10" fill="${mainColor}" opacity="0.3"/>
      <!-- Icon center -->
      <g opacity="0.9">
        <path d="M 95 90 L 105 90 L 105 110 L 95 110 Z" fill="${mainColor}"/>
        <path d="M 85 100 L 115 100 M 100 85 L 100 115" stroke="${mainColor}" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>`;
  }
  
  // VARIANT 3: LUXURY MONOGRAM BADGE (Premium, Ornamental)
  if (variant === 2) {
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="luxury-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#f8fafc"/>
      <!-- Outer decorative hexagon -->
      <polygon points="100,20 155,50 155,150 100,180 45,150 45,50" fill="none" stroke="${mainColor}" stroke-width="2" opacity="0.3"/>
      <!-- Main badge circle -->
      <circle cx="100" cy="100" r="75" fill="${mainColor}" filter="url(#luxury-shadow)"/>
      <!-- Inner circle outline -->
      <circle cx="100" cy="100" r="70" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.6"/>
      <!-- Decorative corners -->
      <circle cx="65" cy="65" r="6" fill="${accentColor}" opacity="0.8"/>
      <circle cx="135" cy="65" r="6" fill="${accentColor}" opacity="0.8"/>
      <circle cx="65" cy="135" r="6" fill="${accentColor}" opacity="0.8"/>
      <circle cx="135" cy="135" r="6" fill="${accentColor}" opacity="0.8"/>
      <!-- Premium monogram -->
      <text x="100" y="120" font-size="56" font-weight="bold" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" letter-spacing="3">
        ${initials[0]}
      </text>
      <!-- Decorative line -->
      <line x1="75" y1="145" x2="125" y2="145" stroke="${accentColor}" stroke-width="1.5" opacity="0.6"/>
    </svg>`;
  }
  
  // FALLBACK: Return variant 0 if beyond 3
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#f8fafc"/>
    <circle cx="100" cy="100" r="70" fill="${mainColor}"/>
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
