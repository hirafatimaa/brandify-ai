import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || 'dummy_key';
const client = new GoogleGenerativeAI(apiKey);

interface BrandKitInput {
  businessName: string;
  industry: string;
  targetAudience: string;
  tone: string;
  logoStylePreference?: string;
  mainProduct?: string;
  regenerationId?: string;
  previousColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
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

function hashStringToNumber(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash;
}

function normalizeIndustry(industry: string): string {
  const value = industry.toLowerCase().trim();

  if (value.includes('tech') || value.includes('technology')) return 'tech';
  if (value.includes('finance') || value.includes('fintech') || value.includes('bank')) return 'finance';
  if (value.includes('fashion')) return 'fashion';
  if (value.includes('food') || value.includes('beverage')) return 'food';
  if (value.includes('health') || value.includes('wellness') || value.includes('medical')) return 'health';
  if (value.includes('education') || value.includes('edtech') || value.includes('learning')) return 'education';
  if (value.includes('entertainment') || value.includes('media')) return 'entertainment';
  if (value.includes('real') || value.includes('property') || value.includes('estate')) return 'real-estate';
  if (value.includes('e-commerce') || value.includes('ecommerce') || value.includes('retail')) return 'ecommerce';
  if (value.includes('travel') || value.includes('hospitality')) return 'travel';
  if (value.includes('auto') || value.includes('automotive') || value.includes('mobility')) return 'automotive';

  return 'other';
}

function inferNameMeaning(businessName: string, industryKey: string): string {
  const tokens = businessName.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const oneWord = tokens.length === 1;

  const industryEssence: { [key: string]: string[] } = {
    tech: ['innovation', 'precision', 'connectivity'],
    finance: ['trust', 'growth', 'security'],
    fashion: ['elegance', 'style', 'expression'],
    food: ['warmth', 'craft', 'freshness'],
    health: ['care', 'healing', 'wellness'],
    education: ['growth', 'learning', 'inspiration'],
    entertainment: ['energy', 'creativity', 'experience'],
    'real-estate': ['stability', 'foundation', 'community'],
    ecommerce: ['convenience', 'selection', 'speed'],
    travel: ['discovery', 'journey', 'comfort'],
    automotive: ['performance', 'reliability', 'motion'],
    other: ['quality', 'confidence', 'clarity']
  };

  const essence = industryEssence[industryKey] || industryEssence.other;

  if (oneWord) {
    return `One-word name interpreted as ${essence.join(', ')} within ${industryKey} context.`;
  }

  return `Multi-word name; emphasize the first word as the primary visual anchor, refined and minimal.`;
}

function buildLogoContext(
  businessName: string,
  industry: string,
  industryKey: string,
  tone: string,
  primaryColor: string,
  accentColor: string,
  regenerationId?: string,
  previousColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  },
  targetAudience?: string,
  mainProduct?: string,
  logoStylePreference?: string
): string {
  const offeringByIndustry: { [key: string]: string } = {
    tech: 'software, platforms, or digital services',
    finance: 'financial services, investing, or advisory',
    fashion: 'apparel, accessories, or lifestyle design',
    food: 'food, beverage, or culinary products',
    health: 'healthcare, wellness, or fitness services',
    education: 'education, training, or learning products',
    entertainment: 'media, events, or creative experiences',
    'real-estate': 'property, development, or real estate services',
    ecommerce: 'online retail or direct-to-consumer commerce',
    travel: 'travel, hospitality, or experiences',
    automotive: 'vehicles, mobility, or automotive services',
    other: 'professional services or products'
  };

  const keywordsByIndustry: { [key: string]: string[] } = {
    tech: ['clean', 'modern', 'future-ready', 'precise'],
    finance: ['trustworthy', 'stable', 'confident', 'premium'],
    fashion: ['elegant', 'stylish', 'refined', 'trend-aware'],
    food: ['warm', 'fresh', 'inviting', 'crafted'],
    health: ['caring', 'balanced', 'reassuring', 'clean'],
    education: ['inspiring', 'progressive', 'clear', 'credible'],
    entertainment: ['energetic', 'dynamic', 'memorable', 'playful'],
    'real-estate': ['solid', 'architectural', 'trustworthy', 'timeless'],
    ecommerce: ['clear', 'efficient', 'modern', 'friendly'],
    travel: ['open', 'adventurous', 'welcoming', 'uplifting'],
    automotive: ['precision', 'performance', 'motion', 'reliable'],
    other: ['professional', 'clean', 'memorable', 'premium']
  };

  const avoidByIndustry: { [key: string]: string[] } = {
    tech: ['messy wires', 'random blobs', 'busy detail'],
    finance: ['cartoon money', 'cheap charts', 'clutter'],
    fashion: ['stiff shapes', 'awkward silhouettes', 'over-detail'],
    food: ['unappetizing forms', 'literal photos', 'messy lines'],
    health: ['scary medical imagery', 'aggressive angles', 'clutter'],
    education: ['childish icons', 'messy symbols', 'crowded details'],
    entertainment: ['dull symbols', 'static poses', 'generic stars'],
    'real-estate': ['house clipart', 'awkward rooflines', 'heavy clutter'],
    ecommerce: ['shopping cart cliches', 'cheap badges', 'overly busy'],
    travel: ['literal airplanes', 'tourist clipart', 'crowded scenes'],
    automotive: ['tire clipart', 'busy engines', 'overly complex'],
    other: ['generic icons', 'random shapes', 'overcomplication']
  };

  const keywords = keywordsByIndustry[industryKey] || keywordsByIndustry.other;
  const avoid = avoidByIndustry[industryKey] || avoidByIndustry.other;
  const nameMeaning = inferNameMeaning(businessName, industryKey);
  const coreOffering = mainProduct && mainProduct.trim().length > 0
    ? mainProduct.trim()
    : offeringByIndustry[industryKey] || offeringByIndustry.other;

  const regenHint = regenerationId
    ? `Regeneration seed: ${regenerationId}. Create a fresh alternative; avoid repeating previous palette or shapes.`
    : 'Initial generation; focus on best-in-class originality.';

  const previousPalette = previousColors
    ? `Previous palette to avoid: ${previousColors.primary}, ${previousColors.secondary}, ${previousColors.accent}`
    : 'No previous palette constraints.';

  return `BRAND CONTEXT:
- Name: ${businessName}
- Name meaning: ${nameMeaning}
- Industry: ${industry}
- Core offering: ${coreOffering}
- Target audience: ${targetAudience && targetAudience.trim().length > 0 ? targetAudience : 'general market'}
- Tone: ${tone}
- Style preference: ${logoStylePreference || 'modern'}
- Primary color: ${primaryColor}
- Accent color: ${accentColor}
- ${regenHint}
- ${previousPalette}
- Keywords to express: ${keywords.join(', ')}
- Avoid: ${avoid.join(', ')}`;
}

function generateIndustrySpecificLogos(
  businessName: string,
  industry: string,
  primaryColor: string,
  accentColor: string
): string[] {
  const industryKey = normalizeIndustry(industry);
  const logos = [
    // Logo 1: Industry-Specific Symbol (Pure icon, no text)
    generateIndustrySymbol(industryKey, primaryColor, accentColor),
    
    // Logo 2: Modern Geometric Design
    generateModernGeometric(industryKey, primaryColor, accentColor),
    
    // Logo 3: Abstract Premium Mark
    generateAbstractPremium(industryKey, primaryColor, accentColor)
  ];
  
  return logos.map(svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
}

// Industry-Specific Symbol - Premium professional logos
function generateIndustrySymbol(industry: string, primary: string, accent: string): string {
  const symbols: { [key: string]: string } = {
    'tech': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tech-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
        </linearGradient>
        <filter id="tech-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#ffffff" rx="20"/>
      <circle cx="100" cy="100" r="75" fill="url(#tech-grad-1)" opacity="0.12"/>
      <g filter="url(#tech-shadow)">
        <circle cx="100" cy="100" r="60" fill="url(#tech-grad-1)"/>
        <circle cx="100" cy="100" r="50" fill="none" stroke="white" stroke-width="3" opacity="0.3"/>
        <circle cx="100" cy="100" r="35" fill="none" stroke="${primary}" stroke-width="2"/>
        <circle cx="100" cy="100" r="22" fill="${accent}" opacity="0.9"/>
        <circle cx="100" cy="100" r="12" fill="white" opacity="0.4"/>
      </g>
    </svg>`,
    
    'finance': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fin-grad-1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
        </linearGradient>
        <filter id="fin-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#ffffff" rx="20"/>
      <g filter="url(#fin-shadow)">
        <polygon points="100,35 155,75 155,165 45,165 45,75" fill="url(#fin-grad-1)"/>
        <polygon points="100,35 155,75 155,165 45,165 45,75" fill="white" opacity="0.08"/>
        <polyline points="65,130 85,110 100,120 115,90 145,120" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
      </g>
    </svg>`,
    
    'health': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="health-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:1" />
        </linearGradient>
        <filter id="health-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#ffffff" rx="20"/>
      <g filter="url(#health-shadow)">
        <circle cx="100" cy="100" r="65" fill="url(#health-grad-1)"/>
        <circle cx="100" cy="100" r="65" fill="white" opacity="0.08"/>
        <path d="M 100 60 L 100 140 M 60 100 L 140 100" stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
        <circle cx="100" cy="100" r="40" fill="none" stroke="white" stroke-width="1.5" opacity="0.3"/>
      </g>
    </svg>`,
    
    'fashion': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fashion-grad-1" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
        </linearGradient>
        <filter id="fashion-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#ffffff" rx="20"/>
      <g filter="url(#fashion-shadow)">
        <path d="M 60 45 L 75 70 L 90 60 L 100 50 L 110 60 L 125 70 L 140 45 L 135 75 L 145 165 L 55 165 L 65 75 Z" fill="url(#fashion-grad-1)"/>
        <path d="M 100 50 L 95 90 M 100 50 L 105 90" stroke="white" stroke-width="1.5" opacity="0.4"/>
        <circle cx="70" cy="95" r="4" fill="white" opacity="0.5"/>
        <circle cx="130" cy="95" r="4" fill="white" opacity="0.5"/>
      </g>
    </svg>`,
    
    'food': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="food-grad-1" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:1" />
        </radialGradient>
        <filter id="food-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#ffffff" rx="20"/>
      <g filter="url(#food-shadow)">
        <circle cx="100" cy="100" r="65" fill="url(#food-grad-1)"/>
        <circle cx="100" cy="100" r="65" fill="white" opacity="0.08"/>
        <circle cx="80" cy="80" r="12" fill="white" opacity="0.6"/>
        <circle cx="120" cy="85" r="12" fill="white" opacity="0.6"/>
        <circle cx="100" cy="115" r="12" fill="white" opacity="0.6"/>
        <path d="M 90 55 Q 100 40 110 55" stroke="white" stroke-width="2" fill="none" opacity="0.5" stroke-linecap="round"/>
      </g>
    </svg>`,
    
    'real-estate': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="estate-grad-1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
        </linearGradient>
        <filter id="estate-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#ffffff" rx="20"/>
      <g filter="url(#estate-shadow)">
        <path d="M 100 35 L 160 85 L 150 85 L 150 165 L 50 165 L 50 85 L 40 85 Z" fill="url(#estate-grad-1)"/>
        <path d="M 100 35 L 100 75" stroke="white" stroke-width="2" opacity="0.3"/>
        <rect x="60" y="100" width="18" height="28" fill="white" opacity="0.25"/>
        <rect x="91" y="100" width="18" height="28" fill="white" opacity="0.25"/>
        <rect x="122" y="100" width="18" height="28" fill="white" opacity="0.25"/>
      </g>
    </svg>`,
    
    'education': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="edu-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:1" />
        </linearGradient>
        <filter id="edu-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#ffffff" rx="20"/>
      <g filter="url(#edu-shadow)">
        <path d="M 100 40 L 160 80 L 160 160 L 40 160 L 40 80 Z" fill="url(#edu-grad-1)"/>
        <path d="M 100 40 L 40 80 L 160 80" fill="white" opacity="0.15"/>
        <circle cx="100" cy="110" r="18" fill="white" opacity="0.25"/>
        <path d="M 100 105 L 100 115" stroke="white" stroke-width="1.5" opacity="0.4"/>
      </g>
    </svg>`,
    
    'entertainment': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ent-grad-1" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
        </linearGradient>
        <filter id="ent-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#ffffff" rx="20"/>
      <g filter="url(#ent-shadow)">
        <circle cx="100" cy="100" r="70" fill="url(#ent-grad-1)"/>
        <polygon points="90,70 90,130 130,100" fill="white" opacity="0.4"/>
        <circle cx="100" cy="100" r="55" fill="none" stroke="white" stroke-width="1.5" opacity="0.2"/>
      </g>
    </svg>`,
    
    'default': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="default-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#f5f7fa" rx="15"/>
      <circle cx="100" cy="100" r="65" fill="url(#default-grad)" opacity="0.9"/>
      <circle cx="100" cy="100" r="50" fill="none" stroke="${primary}" stroke-width="2" opacity="0.3"/>
      <path d="M 100 50 L 110 100 L 100 150 L 90 100 Z" fill="${primary}" opacity="0.5"/>
    </svg>`
  };

  return symbols[industry.toLowerCase()] || symbols['default'];
}

// Modern Geometric Design - Completely different from Logo 1
function generateModernGeometric(industry: string, primary: string, accent: string): string {
  // Each industry gets a completely unique geometric approach
  const geometricLogos: { [key: string]: string } = {
    tech: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geom-tech" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <polygon points="100,25 175,75 147,175 53,175 25,75" fill="url(#geom-tech)" opacity="0.9"/>
      <g stroke="${primary}" stroke-width="2" fill="none">
        <line x1="100" y1="25" x2="100" y2="100"/><line x1="75" y1="75" x2="125" y2="75"/>
        <line x1="60" y1="110" x2="140" y2="110"/><line x1="50" y1="145" x2="150" y2="145"/>
      </g>
    </svg>`,
    finance: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geom-fin" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <rect x="50" y="40" width="100" height="120" fill="url(#geom-fin)" opacity="0.85"/>
      <polyline points="60,130 80,90 100,110 120,60 140,80" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="50" y="40" width="100" height="120" fill="none" stroke="${accent}" stroke-width="2"/>
    </svg>`,
    fashion: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geom-fash" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <path d="M 100 30 L 130 60 L 140 150 L 60 150 L 70 60 Z" fill="url(#geom-fash)" opacity="0.85"/>
      <g stroke="${primary}" stroke-width="1.5" fill="none">
        <circle cx="110" cy="85" r="6"/><circle cx="90" cy="85" r="6"/>
        <path d="M 100 110 L 95 150" stroke="${accent}" stroke-width="2"/>
        <path d="M 100 110 L 105 150" stroke="${accent}" stroke-width="2"/>
      </g>
    </svg>`,
    food: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geom-food" x1="30%" y1="30%" x2="70%" y2="70%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <polygon points="100,40 165,100 150,170 50,170 35,100" fill="url(#geom-food)" opacity="0.85"/>
      <circle cx="75" cy="110" r="10" fill="white" opacity="0.4"/>
      <circle cx="125" cy="110" r="10" fill="white" opacity="0.4"/>
      <circle cx="100" cy="145" r="8" fill="white" opacity="0.4"/>
    </svg>`,
    health: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geom-health" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <polygon points="100,30 155,65 155,160 45,160 45,65" fill="url(#geom-health)" opacity="0.85"/>
      <circle cx="100" cy="100" r="25" fill="white" opacity="0.2"/>
      <path d="M 100 75 L 100 125 M 75 100 L 125 100" stroke="white" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    'real-estate': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geom-est" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <g fill="url(#geom-est)" opacity="0.85">
        <rect x="50" y="80" width="40" height="60"/>
        <rect x="105" y="80" width="40" height="60"/>
        <polygon points="100,30 75,70 125,70"/>
        <rect x="65" y="55" width="70" height="20"/>
      </g>
    </svg>`,
    education: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geom-edu" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <polygon points="100,25 160,70 160,165 40,165 40,70" fill="url(#geom-edu)" opacity="0.85"/>
      <circle cx="100" cy="95" r="15" fill="white" opacity="0.25"/>
      <circle cx="85" cy="135" r="8" fill="white" opacity="0.4"/>
      <circle cx="115" cy="135" r="8" fill="white" opacity="0.4"/>
    </svg>`,
    entertainment: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="geom-ent" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <polygon points="100,50 165,85 165,165 35,165 35,85" fill="url(#geom-ent)" opacity="0.85"/>
      <polygon points="90,100 110,100 100,125" fill="white" opacity="0.35"/>
      <circle cx="80" cy="130" r="5" fill="white" opacity="0.3"/>
      <circle cx="120" cy="130" r="5" fill="white" opacity="0.3"/>
    </svg>`,
  };

  return geometricLogos[industry.toLowerCase()] || geometricLogos.tech;
}

// Abstract Premium Mark - Flowing, completely different aesthetic
function generateAbstractPremium(industry: string, primary: string, accent: string): string {
  // Organic, flowing designs - NOT geometric circles
  const abstractLogos: { [key: string]: string } = {
    tech: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abs-tech" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <path d="M 60 80 Q 80 40 120 50 Q 150 60 160 100 Q 150 140 120 150 Q 80 160 60 120 Z" fill="url(#abs-tech)" opacity="0.85"/>
      <path d="M 75 90 Q 100 60 120 85 Q 110 120 85 125 Q 70 110 75 90" fill="white" opacity="0.2"/>
      <circle cx="100" cy="105" r="8" fill="${accent}"/>
    </svg>`,
    finance: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abs-fin" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <path d="M 50 150 Q 70 120 100 80 Q 130 50 160 70 Q 170 100 150 135 Q 120 160 70 165 Z" fill="url(#abs-fin)" opacity="0.85"/>
      <polyline points="70,140 90,110 110,130 130,90" stroke="white" stroke-width="2" fill="none" opacity="0.5" stroke-linecap="round"/>
    </svg>`,
    fashion: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abs-fash" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <path d="M 75 40 Q 100 30 125 50 Q 155 75 150 120 Q 140 160 100 170 Q 60 160 55 115 Q 50 70 75 40" fill="url(#abs-fash)" opacity="0.85"/>
      <circle cx="100" cy="90" r="12" fill="white" opacity="0.3"/>
      <path d="M 100 110 L 95 160 M 100 110 L 105 160" stroke="white" stroke-width="1.5" opacity="0.3"/>
    </svg>`,
    food: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="abs-food" cx="40%" cy="40%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:0.8" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <circle cx="100" cy="100" r="70" fill="url(#abs-food)" opacity="0.85"/>
      <ellipse cx="85" cy="75" rx="14" ry="18" fill="white" opacity="0.35"/>
      <ellipse cx="115" cy="75" rx="14" ry="18" fill="white" opacity="0.35"/>
      <path d="M 60 120 Q 100 150 140 120" stroke="white" stroke-width="2" fill="none" opacity="0.3" stroke-linecap="round"/>
    </svg>`,
    health: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abs-health" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <path d="M 70 60 Q 100 40 130 60 Q 160 90 150 130 Q 120 170 80 165 Q 50 145 70 100 Z" fill="url(#abs-health)" opacity="0.85"/>
      <circle cx="100" cy="100" r="20" fill="white" opacity="0.2"/>
      <path d="M 100 85 L 100 115 M 85 100 L 115 100" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
    </svg>`,
    'real-estate': `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abs-est" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <path d="M 100 50 Q 150 60 160 110 Q 150 160 100 170 Q 50 160 40 110 Q 50 60 100 50" fill="url(#abs-est)" opacity="0.85"/>
      <path d="M 100 50 L 100 140" stroke="white" stroke-width="1.5" opacity="0.3"/>
      <circle cx="75" cy="110" r="8" fill="white" opacity="0.3"/>
      <circle cx="125" cy="110" r="8" fill="white" opacity="0.3"/>
    </svg>`,
    education: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abs-edu" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${primary};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <path d="M 100 45 Q 150 65 155 115 Q 140 165 100 175 Q 60 165 45 115 Q 50 65 100 45" fill="url(#abs-edu)" opacity="0.85"/>
      <circle cx="100" cy="105" r="18" fill="white" opacity="0.25"/>
      <path d="M 100 105 L 100 130" stroke="white" stroke-width="2" opacity="0.3"/>
    </svg>`,
    entertainment: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abs-ent" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#fff"/>
      <path d="M 60 80 Q 80 50 120 55 Q 160 65 165 110 Q 155 155 110 165 Q 70 160 55 120 Q 45 95 60 80" fill="url(#abs-ent)" opacity="0.85"/>
      <polygon points="95,95 95,125 125,110" fill="white" opacity="0.4"/>
    </svg>`,
  };

  return abstractLogos[industry.toLowerCase()] || abstractLogos.tech;
}

export async function generateBrandKit(input: BrandKitInput): Promise<BrandKit> {
  const { businessName, industry, targetAudience, tone, logoStylePreference, mainProduct, regenerationId, previousColors } = input;
  const regenerationSeed = regenerationId ? hashStringToNumber(regenerationId) : 0;
  const previousPaletteHint = previousColors
    ? `Avoid reusing this palette: ${previousColors.primary}, ${previousColors.secondary}, ${previousColors.accent}.`
    : 'No previous palette to avoid.';

  const prompt = `You are an elite brand strategy consultant with decades of experience creating premium brands. Your task is to craft a sophisticated, market-ready brand identity.

BUSINESS PROFILE:
- Name: ${businessName}
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Brand Personality: ${tone}
- Core Offering: ${mainProduct && mainProduct.trim().length > 0 ? mainProduct : 'inferred from industry'}
- Logo Style Preference: ${logoStylePreference || 'modern'}
- Regeneration Seed: ${regenerationId || 'none'}
- Palette Guidance: ${previousPaletteHint}
- Regeneration Directive: Create a fresh, distinct brand kit; avoid repeating prior colors or logo directions.

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
    textContent = generateMockBrandText(businessName, industry, targetAudience, tone, regenerationSeed);
  }

  // AI logo generation with SVG fallback for reliability
  let logoImages: string[] = [];

  try {
    console.log('🎨 Generating logos with detailed industry prompts (AI + SVG fallback)...');
    logoImages = await generateLogoImages(
      businessName,
      industry,
      tone,
      textContent.colors.primary,
      textContent.colors.accent,
      targetAudience,
      mainProduct,
      logoStylePreference,
      regenerationId,
      previousColors
    );
    console.log('✓ 3 premium logos generated');
  } catch (error) {
    console.warn('⚠️ Logo generation failed, using SVG fallback:', error instanceof Error ? error.message : String(error));
    logoImages = generateIndustrySpecificLogos(
      businessName,
      industry,
      textContent.colors.primary,
      textContent.colors.accent
    );
  }

  if (logoImages.length === 0 || logoImages.some((value) => !value || !value.startsWith('data:image'))) {
    logoImages = generateIndustrySpecificLogos(
      businessName,
      industry,
      textContent.colors.primary,
      textContent.colors.accent
    );
  }

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
function generateMockBrandText(
  businessName: string,
  industry: string,
  targetAudience: string,
  tone: string,
  regenerationSeed = 0
) {
  // Generate a primary color deterministically based on business name length to make mock feel somewhat unique
  const hue = (businessName.length * 25 + regenerationSeed) % 360;
  
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

async function generateLogoImages(
  businessName: string,
  industry: string,
  tone: string,
  primaryColor: string,
  accentColor: string,
  targetAudience?: string,
  mainProduct?: string,
  logoStylePreference?: string,
  regenerationId?: string,
  previousColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  }
): Promise<string[]> {
  const industryKey = normalizeIndustry(industry);

  if (!process.env.GEMINI_API_KEY) {
    return generateIndustrySpecificLogos(businessName, industryKey, primaryColor, accentColor);
  }

  const contextBlock = buildLogoContext(
    businessName,
    industry,
    industryKey,
    tone,
    primaryColor,
    accentColor,
    regenerationId,
    previousColors,
    targetAudience,
    mainProduct,
    logoStylePreference
  );

  // Industry-specific detailed prompts - EACH category gets unique, detailed instructions
  const industryPrompts: { [key: string]: string[] } = {
    tech: [
      `Create a BEAUTIFUL professional tech logo SVG for "${businessName}" - DO NOT make weird or awkward shapes.

${contextBlock}

TECH LOGOS SHOULD HAVE: Clean lines, forward motion, digital confidence, modern polish.

VARIANT 1 - GEOMETRIC TECH MARK:
Inspiration: Upward arrow, circuit node network, or digital connectivity symbol
DO: Use perfect circles, clean lines, professional angles. Create smooth curves. Think Apple, Google, Tesla simplicity.
DON'T: Avoid random sharp angles, overlapping mess, too many colors, strange blob shapes
Colors: ${primaryColor} as primary, one accent color for contrast
Style: Minimalist, mathematical precision, scalable to any size
Example: Concentric circles descending/ascending for growth, connected nodes showing connectivity, or an elegant upward chevron

SVG viewBox="0 0 200 200", professional clean code

Return ONLY SVG code.`,
      
  `Create a STUNNING abstract tech symbol SVG for "${businessName}" - Make it elegant, NOT weird.

${contextBlock}

VARIANT 2 - FLOWING TECH MARK:
Inspiration: Smooth tech flow, digital evolution, innovation arc
DO: Use flowing curves that suggest forward motion. Layer elements for depth. Think sophisticated and premium.
Make it look like a $10,000 design, not a $100 design.
DON'T: Avoid jagged edges, random shapes, confusion, strange proportions
Colors: ${primaryColor} with subtle gradient or layering
Style: Modern, artistic, suggests technology and innovation through flow not clumsy blocks
Example: Smooth ascending curves, organic digital flow, elegant wave patterns, or flowing connectivity

SVG viewBox="0 0 200 200", beautiful implementation

Return ONLY SVG.`,
      
  `Create a DISTINCTIVE modern tech icon SVG for "${businessName}" - Professional and polished.

${contextBlock}

VARIANT 3 - TECH INNOVATION MARK:
Inspiration: Bold statement tech symbol, leadership in industry
DO: Create a memorable focal point. Use strong but elegant shapes. Professional tech aesthetic.
Think IBM, Microsoft, Intel - powerful but refined.
DON'T: Avoid weird letter combinations, awkward rotations, ugly proportions
Colors: ${primaryColor} dominant with accent highlight
Style: Confident, clear, instantly recognizable at small size
Example: Geometric pattern suggesting advancement, clean horizontal/vertical balance, or iconic tech shape

SVG viewBox="0 0 200 200"

Return ONLY SVG code.`
    ],
    finance: [
  `Create a PROFESSIONAL financial services logo SVG for "${businessName}" - Make it trustworthy and elegant.

${contextBlock}

FINANCE LOGOS SHOULD HAVE: Stability, trust, growth trajectory, refined professionalism.

VARIANT 1 - GROWTH & STABILITY MARK:
Inspiration: Ascending bar chart, upward arrow, protective shield, wealth symbol
DO: Use clean lines suggesting upward movement. Create balanced composition. Professional finance aesthetic.
Think financial strength and stability through design.
DON'T: Avoid confusing arrow mess, random colors, cluttered charts, amateurish feel
Colors: ${primaryColor} (typically blue/gold in finance), one professional accent
Style: Corporate professional, trustworthy, clean
Example: Ascending bars getting progressively larger, smooth upward curve, or shield with growth symbol

SVG viewBox="0 0 200 200", professional quality

Return ONLY SVG.`,
      
  `Create an ELEGANT financial mark SVG for "${businessName}" - Premium and sophisticated.

${contextBlock}

VARIANT 2 - WEALTH & TRUST SYMBOL:
Inspiration: Flowing prosperity, refined finance, premium positioning
DO: Use flowing lines suggesting wealth movement. Elegant composition. Sophisticated premium feel.
Make it look suitable for high-end financial services.
DON'T: Avoid chart mess, confusing symbols, cheap appearance, random shapes
Colors: ${primaryColor} with elegant accent, possibly metallic/gold suggestion
Style: Premium, trustworthy, refined
Example: Flowing upward curves with sophistication, layered wealth visualization, or elegant financial shield

SVG viewBox="0 0 200 200"

Return ONLY SVG code.`,
      
  `Create a DISTINGUISHED banking/finance logo SVG for "${businessName}" - Convey trust and leadership.

${contextBlock}

VARIANT 3 - FINANCIAL AUTHORITY MARK:
Inspiration: Leadership in finance, trusted institution, growth positioned
DO: Create a strong focal point suggesting financial authority. Clear, confident design.
Professional banking aesthetic appropriate for serious financial institutions.
DON'T: Avoid messy arrows, overlapping confusion, questionable proportions, unprofessional feel
Colors: ${primaryColor} for prestige
Style: Authoritative, clear, memorable
Example: Geometric architectural form, proud upward positioning, or iconic financial mark

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    fashion: [
  `Create a BEAUTIFUL fashion/style logo SVG for "${businessName}" - Make it elegant and trendsetting.

${contextBlock}

FASHION LOGOS SHOULD HAVE: Elegance, style expression, movement, sophistication, modern aesthetic.

VARIANT 1 - ELEGANT SILHOUETTE MARK:
Inspiration: Clothing silhouette, fabric movement, elegant curve, fashion sense
DO: Create flowing, elegant lines. Suggest movement and grace. Fashion-forward aesthetic.
Think elegant luxury brand simplicity - clean and stylish.
DON'T: Avoid ugly proportions, awkward clothing shapes, stiff forms, amateurish design
Colors: ${primaryColor} for style
Style: Elegant, contemporary fashion, refined
Example: Flowing fabric line suggesting dress movement, elegant garment silhouette, or sophisticated curve

SVG viewBox="0 0 200 200", beautiful implementation

Return ONLY SVG.`,
      
  `Create a STUNNING fashion aesthetic logo SVG for "${businessName}" - Convey style and trend.

${contextBlock}

VARIANT 2 - STYLE & MOVEMENT MARK:
Inspiration: Fashion forward thinking, trendsetter energy, style expression
DO: Use flowing curves suggesting movement and grace. Contemporary aesthetic.
Make it look like a luxury fashion brand logo - timeless elegance.
DON'T: Avoid stiff shapes, clothing disasters, ugly proportions, design mess
Colors: ${primaryColor} with elegant accent
Style: Contemporary fashion, artistic, memorable
Example: Flowing pattern suggesting fabric/style, elegant abstract fashion representation, or grace-inspired curves

SVG viewBox="0 0 200 200"

Return ONLY SVG code.`,
      
  `Create a DISTINGUISHED fashion brand logo SVG for "${businessName}" - Premium and iconic.

${contextBlock}

VARIANT 3 - LUXURY FASHION MARK:
Inspiration: High fashion brand, style icon, prestige positioning
DO: Create an iconic fashion symbol. Sophisticated and memorable.
Luxury fashion brand aesthetics - suitable for high-end fashion houses.
DON'T: Avoid clothing disasters, disproportionate elements, unprofessional appearance, confusion
Colors: ${primaryColor} for luxury brand presence
Style: Premium fashion, iconic, instantly recognizable
Example: Minimalist fashion icon, refined brand mark, or elegant prestige symbol

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    food: [
  `Create a DELICIOUS food/beverage logo SVG for "${businessName}" - Make it appetizing and warm.

${contextBlock}

FOOD LOGOS SHOULD HAVE: Organic appeal, warmth, appetite-inducing, craft quality, community feeling.

VARIANT 1 - INGREDIENT/PRODUCT MARK:
Inspiration: Key ingredient visual, food item representation, organic shape, culinary element
DO: Create an appetizing visual. Use warm, organic shapes. Professional food brand aesthetic.
Think gourmet food company simplicity - refined and delicious-looking.
DON'T: Avoid ugly food shapes, unappetizing appearance, cheap design, cluttered elements
Colors: ${primaryColor} (warm tones like orange, brown), complementary accent
Style: Culinary professional, organic, appetizing
Example: Stylized fruit/vegetable/ingredient shape, elegant food form, or warm culinary icon

SVG viewBox="0 0 200 200", professional quality

Return ONLY SVG.`,
      
  `Create a BEAUTIFUL culinary/food mark SVG for "${businessName}" - Convey craft and quality.

${contextBlock}

VARIANT 2 - CRAFT & WARMTH SYMBOL:
Inspiration: Handcrafted quality, delicious appeal, food artistry, warmth
DO: Use organic curves suggesting natural quality. Warm, inviting aesthetic.
Make it feel like premium artisan food brand - quality through design.
DON'T: Avoid revolting food depictions, disproportionate shapes, cheap appearance, confusion
Colors: ${primaryColor} with warm accent suggesting culinary craft
Style: Artisan food, warm, inviting
Example: Organic flowing food representation, elegant culinary mark, or warmly-appealing food symbol

SVG viewBox="0 0 200 200"

Return ONLY SVG code.`,
      
  `Create a DISTINGUISHED food brand logo SVG for "${businessName}" - Premium and memorable.

${contextBlock}

VARIANT 3 - GOURMET FOOD MARK:
Inspiration: Premium food positioning, gourmet quality, gastronomy prestige
DO: Create an elevated food brand symbol. Sophisticated culinary presence.
Premium food brand aesthetic - suitable for high-end restaurants, specialty foods.
DON'T: Avoid ugly food depictions, unprofessional appearance, cheap feel, disproportionate design
Colors: ${primaryColor} for premium food presence
Style: Gourmet, prestigious, refined
Example: Elegant food presentation, refined culinary mark, or premium ingredient symbol

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    health: [
  `Create a PROFESSIONAL healthcare/wellness logo SVG for "${businessName}" - Make it trustworthy and caring.

${contextBlock}

HEALTH LOGOS SHOULD HAVE: Healing symbolism, medical trust, wellness focus, care expression, professional confidence.

VARIANT 1 - MEDICAL/WELLNESS MARK:
Inspiration: Medical cross, heartbeat, health symbol, wellness curve, protective form
DO: Create a trustworthy health symbol. Use clean, professional medical aesthetic.
Think healthcare authority - professional, caring, trustworthy.
DON'T: Avoid scary medical imagery, confusing health symbols, cheap appearance, amateurish design
Colors: ${primaryColor} (typically red/blue/green), professional accent
Style: Medical professional, trustworthy, caring
Example: Elegant medical cross, flowing heartbeat line, wellness curve, or protective health symbol

SVG viewBox="0 0 200 200", professional quality

Return ONLY SVG.`,
      
  `Create a BEAUTIFUL wellness/healthcare mark SVG for "${businessName}" - Convey care and healing.

${contextBlock}

VARIANT 2 - HEALING & CARE SYMBOL:
Inspiration: Wellness focus, caring service, healing journey, health consciousness
DO: Use flowing curves suggesting wellness and care. Compassionate design aesthetic.
Make it feel like a trusted healthcare provider - professional yet warm.
DON'T: Avoid medical nightmares, confusing symbols, unprofessional appearance, scary imagery
Colors: ${primaryColor} with caring accent suggesting wellness
Style: Wellness-focused, compassionate, professional
Example: Flowing wellness curve, elegant health representation, or caring health symbol

SVG viewBox="0 0 200 200"

Return ONLY SVG code.`,
      
  `Create a DISTINGUISHED health/medical brand logo SVG for "${businessName}" - Authority and trust.

${contextBlock}

VARIANT 3 - HEALTHCARE AUTHORITY MARK:
Inspiration: Medical leadership, healthcare prestige, professional excellence, health authority
DO: Create a medical authority symbol. Confident professional presence.
Premium healthcare brand aesthetic - suitable for hospitals, medical practices, wellness leaders.
DON'T: Avoid medical disasters, unprofessional imagery, cheap feel, confusing symbols
Colors: ${primaryColor} for medical authority
Style: Healthcare authority, professional, trustworthy
Example: Elegant medical symbol, refined healthcare mark, or professional health authority icon

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    education: [
  `Create a BEAUTIFUL education/learning logo SVG for "${businessName}" - Make it inspiring and aspirational.

${contextBlock}

EDUCATION LOGOS SHOULD HAVE: Knowledge representation, growth symbolism, inspiration, learning journey, achievement.

VARIANT 1 - KNOWLEDGE & GROWTH MARK:
Inspiration: Book symbol, upward growth, light of knowledge, learning beacon, achievement step
DO: Create an inspiring education symbol. Suggest growth and learning. Professional education aesthetic.
Think leading educational institution - inspiring and authoritative.
DON'T: Avoid ugly book depictions, confusing symbols, cheap appearance, amateurish design
Colors: ${primaryColor} (often blue/gold for education), professional accent
Style: Educational authority, inspiring, growth-oriented
Example: Elegant book form, ascending learning curve, illuminated knowledge symbol, or inspirational growth mark

SVG viewBox="0 0 200 200", professional quality

Return ONLY SVG.`,
      
  `Create a STUNNING learning/knowledge mark SVG for "${businessName}" - Convey inspiration and growth.

${contextBlock}

VARIANT 2 - LEARNING JOURNEY SYMBOL:
Inspiration: Educational progression, knowledge expansion, inspiring pathway, student growth
DO: Use flowing lines suggesting learning journey and growth. Inspirational aesthetic.
Make it feel like an inspiring educational brand - professional yet engaging.
DON'T: Avoid ugly educational symbols, confusing learning depictions, unprofessional appearance, mess
Colors: ${primaryColor} with inspirational accent
Style: Learning-focused, inspirational, progressive
Example: Flowing learning path, elegant knowledge expansion, or inspirational education beacon

SVG viewBox="0 0 200 200"

Return ONLY SVG code.`,
      
  `Create a DISTINGUISHED education brand logo SVG for "${businessName}" - Leadership and excellence.

${contextBlock}

VARIANT 3 - EDUCATIONAL EXCELLENCE MARK:
Inspiration: Educational leadership, learning prestige, academic excellence, institutional authority
DO: Create an educational excellence symbol. Leadership through learning presence.
Premium educational institution aesthetic - suitable for universities, academies, learning centers.
DON'T: Avoid educational disasters, unprofessional symbols, cheap feel, confusing imagery
Colors: ${primaryColor} for educational prestige
Style: Educational excellence, authoritative, professional
Example: Elegant academic symbol, refined learning mark, or professional education authority icon

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    entertainment: [
  `Create a FUN & ENERGETIC entertainment logo SVG for "${businessName}" - Make it exciting and engaging.

${contextBlock}

ENTERTAINMENT LOGOS SHOULD HAVE: Dynamic energy, audience engagement, performance presence, excitement, creative spark.

VARIANT 1 - ENTERTAINMENT SYMBOL MARK:
Inspiration: Play button, spotlight, stage, performance energy, creative spark, audience connection
DO: Create engaging entertainment symbol. Suggest excitement and energy. Professional entertainment aesthetic.
Think entertainment industry - dynamic, engaging, professional.
DON'T: Avoid ugly entertainment depictions, confusing symbols, cheap appearance, amateurish design
Colors: ${primaryColor} (often bright/vibrant), energetic accent
Style: Entertainment professional, dynamic, engaging
Example: Elegant play symbol, spotlight beam, stage representation, or creative spark mark

SVG viewBox="0 0 200 200", professional quality

Return ONLY SVG.`,
      
  `Create a DYNAMIC entertainment/performance mark SVG for "${businessName}" - Convey excitement and energy.

${contextBlock}

VARIANT 2 - PERFORMANCE & ENERGY SYMBOL:
Inspiration: Performance energy, audience connection, entertainment prestige, creative expression
DO: Use flowing curves suggesting performance and energy. Dynamic aesthetic.
Make it feel like an exciting entertainment brand - professional yet captivating.
DON'T: Avoid entertainment nightmares, confusing symbols, unprofessional appearance, boring imagery
Colors: ${primaryColor} with dynamic accent
Style: Performance-focused, energetic, captivating
Example: Flowing performance curve, dynamic entertainment mark, or creative energy representation

SVG viewBox="0 0 200 200"

Return ONLY SVG code.`,
      
  `Create a DISTINGUISHED entertainment brand logo SVG for "${businessName}" - Prestige and presence.

${contextBlock}

VARIANT 3 - ENTERTAINMENT PRESTIGE MARK:
Inspiration: Entertainment leadership, industry prestige, creative authority, performance excellence
DO: Create an entertainment prestige symbol. Bold performance presence.
Premium entertainment brand aesthetic - suitable for studios, venues, creative companies.
DON'T: Avoid entertainment disasters, unprofessional symbols, cheap feel, confusing imagery
Colors: ${primaryColor} for entertainment prestige
Style: Entertainment prestige, bold, memorable
Example: Elegant entertainment symbol, refined performance mark, or professional creative authority icon

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    'real-estate': [
  `Create a PROFESSIONAL real estate/property logo SVG for "${businessName}" - Make it trustworthy and solid.

${contextBlock}

REAL ESTATE LOGOS SHOULD HAVE: Stability symbolism, architectural elegance, property representation, growth, trust.

VARIANT 1 - PROPERTY SYMBOL MARK:
Inspiration: House form, architectural element, building, property growth, community foundation
DO: Create a trustworthy property symbol. Suggest solid foundation and growth. Professional real estate aesthetic.
Think real estate leader - professional, trustworthy, architectural.
DON'T: Avoid ugly house depictions, confusing property symbols, cheap appearance, amateurish design
Colors: ${primaryColor} (often blue/brown for real estate), professional accent
Style: Real estate professional, trustworthy, solid
Example: Elegant house form, architectural structure, property symbol, or growth-suggesting building mark

SVG viewBox="0 0 200 200", professional quality

Return ONLY SVG.`,
      
  `Create a BEAUTIFUL property/real estate mark SVG for "${businessName}" - Convey foundation and growth.

${contextBlock}

VARIANT 2 - PROPERTY GROWTH SYMBOL:
Inspiration: Community building, property advancement, foundation strength, real estate growth
DO: Use flowing architectural lines suggesting growth and stability. Professional aesthetic.
Make it feel like a trusted real estate brand - solid yet aspirational.
DON'T: Avoid property disasters, confusing building symbols, unprofessional appearance, ugly imagery
Colors: ${primaryColor} with professional accent
Style: Property-focused, stable, growth-oriented
Example: Flowing architectural form, elegant property growth, or community foundation symbol

SVG viewBox="0 0 200 200"

Return ONLY SVG code.`,
      
  `Create a DISTINGUISHED real estate brand logo SVG for "${businessName}" - Authority and excellence.

${contextBlock}

VARIANT 3 - REAL ESTATE PRESTIGE MARK:
Inspiration: Property leadership, real estate prestige, architectural excellence, industry authority
DO: Create a real estate authority symbol. Professional market leadership presence.
Premium real estate brand aesthetic - suitable for luxury properties, leading agencies, developers.
DON'T: Avoid real estate disasters, unprofessional symbols, cheap feel, confusing imagery
Colors: ${primaryColor} for real estate prestige
Style: Real estate excellence, authoritative, professional
Example: Elegant architectural symbol, refined property mark, or professional real estate authority icon

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    ecommerce: [
  `Create a MODERN e-commerce logo SVG for "${businessName}" - Clear, trustworthy, and conversion-ready.

${contextBlock}

E-COMMERCE LOGOS SHOULD HAVE: Clarity, efficiency, trust, modern retail confidence.

VARIANT 1 - RETAIL CONFIDENCE MARK:
Inspiration: Seamless flow, simplified package icon, clean commerce symbol
DO: Use clean geometry, balanced spacing, and strong legibility at small sizes
DON'T: Avoid shopping cart cliches, messy badges, overly literal icons
Colors: ${primaryColor} with a single accent

SVG viewBox="0 0 200 200"

Return ONLY SVG.`,

  `Create a REFINED digital commerce symbol SVG for "${businessName}" - Premium and friendly.

${contextBlock}

VARIANT 2 - DIGITAL EXPERIENCE MARK:
Inspiration: Smooth checkout flow, frictionless journey, modern retail interface
DO: Use flowing curves or interlocking shapes to imply ease and speed
DON'T: Avoid clutter and cheap gradients

SVG viewBox="0 0 200 200"

Return ONLY SVG.`,

  `Create a DISTINCTIVE e-commerce brand mark SVG for "${businessName}" - Memorable and scalable.

${contextBlock}

VARIANT 3 - TRUST & SCALE MARK:
Inspiration: Reliability, secure transactions, global reach
DO: Create a strong central symbol with balanced proportions
DON'T: Avoid generic shields or locks

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    travel: [
  `Create a BEAUTIFUL travel brand logo SVG for "${businessName}" - Evoke discovery and comfort.

${contextBlock}

TRAVEL LOGOS SHOULD HAVE: Openness, movement, exploration, welcoming feel.

VARIANT 1 - JOURNEY MARK:
Inspiration: Horizon line, path, compass hint, rising sun
DO: Use smooth curves and open space to signal freedom
DON'T: Avoid airplane clipart or crowded landscapes

SVG viewBox="0 0 200 200"

Return ONLY SVG.`,

  `Create a PREMIUM travel symbol SVG for "${businessName}" - Calm, uplifting, and modern.

${contextBlock}

VARIANT 2 - DISCOVERY MARK:
Inspiration: Abstract wave, path of travel, serene motion
DO: Use layered curves for depth and calm energy
DON'T: Avoid literal maps or busy icons

SVG viewBox="0 0 200 200"

Return ONLY SVG.`,

  `Create a DISTINCTIVE travel brand mark SVG for "${businessName}" - Memorable and timeless.

${contextBlock}

VARIANT 3 - EXPERIENCE MARK:
Inspiration: Premium hospitality, curated experiences
DO: Use a strong, clean emblem that feels welcoming
DON'T: Avoid generic stars or cheap badges

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    automotive: [
  `Create a PROFESSIONAL automotive logo SVG for "${businessName}" - Precision and performance.

${contextBlock}

AUTOMOTIVE LOGOS SHOULD HAVE: Motion, reliability, precision, power.

VARIANT 1 - PERFORMANCE MARK:
Inspiration: Forward motion, sleek profile, engineered precision
DO: Use aerodynamic lines and confident geometry
DON'T: Avoid tire clipart or overly literal cars

SVG viewBox="0 0 200 200"

Return ONLY SVG.`,

  `Create a PREMIUM mobility symbol SVG for "${businessName}" - Modern and refined.

${contextBlock}

VARIANT 2 - MOTION MARK:
Inspiration: Speed line, flow, advanced engineering
DO: Use layered curves suggesting movement and stability
DON'T: Avoid clutter and harsh angles

SVG viewBox="0 0 200 200"

Return ONLY SVG.`,

  `Create a DISTINCTIVE automotive brand mark SVG for "${businessName}" - Iconic and scalable.

${contextBlock}

VARIANT 3 - ENGINEERING AUTHORITY MARK:
Inspiration: Reliability, build quality, premium performance
DO: Create a solid, balanced symbol with strong visual center
DON'T: Avoid generic badges or wings

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
    other: [
  `Create a PREMIUM professional logo SVG for "${businessName}" - Elegant, clean, and memorable.

${contextBlock}

VARIANT 1 - MINIMAL PROFESSIONAL MARK:
DO: Use balanced geometry, refined proportions, and clear visual hierarchy
DON'T: Avoid awkward shapes or random design choices

SVG viewBox="0 0 200 200"

Return ONLY SVG.`,

  `Create a SOPHISTICATED abstract symbol SVG for "${businessName}" - Distinct and premium.

${contextBlock}

VARIANT 2 - ABSTRACT PREMIUM MARK:
DO: Use smooth curves, elegant overlaps, and subtle depth
DON'T: Avoid clutter or harsh edges

SVG viewBox="0 0 200 200"

Return ONLY SVG.`,

  `Create a DISTINCTIVE brand icon SVG for "${businessName}" - Timeless and professional.

${contextBlock}

VARIANT 3 - SIGNATURE MARK:
DO: Create a strong central symbol with premium presence
DON'T: Avoid generic icons or busy details

SVG viewBox="0 0 200 200"

Return ONLY SVG.`
    ],
  };

  // Get industry-specific prompts or use tech as default
  const selectedPrompts = industryPrompts[industryKey] || industryPrompts.other;

  let quotaExhausted = false;

  const logoPromises = selectedPrompts.map(async (svgPrompt, i) => {
    // Single unified logo generation with aggressive timeout
    return await Promise.race([
      generateSingleLogo(svgPrompt, i, businessName, tone, primaryColor),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error(`Logo ${i + 1} timeout`)), 12000)
      )
    ]).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Quota exhausted')) {
        quotaExhausted = true;
      }
      console.warn(`⚠️ [Fallback Triggered] Logo prompt ${i + 1} failed:`, message);
      const fallbackSvg = generateFallbackLogoSvg(businessName, primaryColor, i);
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;
    });
  });

  const results = await Promise.all(logoPromises);
  if (quotaExhausted || results.some((value) => !value || !value.startsWith('data:image'))) {
    return generateIndustrySpecificLogos(businessName, industryKey, primaryColor, accentColor);
  }

  return results;
}

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
