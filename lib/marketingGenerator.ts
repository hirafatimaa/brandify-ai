/**
 * Advanced Marketing Content Generator
 * Generates premium, detailed logo prompts, professional captions, 
 * and complete marketing material templates
 */

interface MarketingContentInput {
  businessName: string;
  industry: string;
  targetAudience: string;
  tone: string;
  logoStylePreference?: string;
  mainProduct?: string;
  colors?: {
    primary: string;
    accent: string;
  };
}

interface MarketingMaterial {
  emailSubjectLines: string[];
  landingPageHeadlines: string[];
  instagramStories: string[];
  linkedinArticle: string;
}

interface MarketingContent {
  logoPrompts: string[];
  captions: string[];
  comments: string[][];
  marketingMaterials: MarketingMaterial;
}

/**
 * PREMIUM LOGO PROMPTS - Highly detailed for AI generation
 * Optimized for Gemini 2.0, DALL-E 3, Midjourney
 */
function generateLogoPrompts(input: MarketingContentInput): string[] {
  const {
    businessName,
    industry,
    tone,
    logoStylePreference = 'modern',
    mainProduct = '',
    targetAudience = '',
    colors,
  } = input;

  // Ultra-detailed style specifications
  const advancedStyles: { [key: string]: string } = {
    minimal: `Minimalist icon design: single continuous line or minimal geometric form. Negative space is design element. Maximum whitespace, zero clutter. Single solid color (${colors?.primary || 'brand color'}) on white background. Crisp, sharp edges. Professional, timeless aesthetic. Scalable from favicon to billboard.`,
    abstract: `Abstract conceptual design: flowing organic shapes meets modern geometry. Smooth curves, balanced composition, sophisticated movement. Layered depth through opacity and overlapping forms. Contemporary art gallery aesthetic. Memorable at any scale. Pure symbol, no literal representation.`,
    playful: `Friendly, approachable icon: rounded elements, dynamic energy, subtle personality. Modern yet approachable curves. Vibrant yet professional color use. Whimsical but sophisticated. Memorable character without being cartoonish. Appeals to both younger and mature audiences.`,
    geometric: `Geometric precision design: perfect symmetry, structural harmony, mathematical beauty. Polygons, circles, precise angles. Corporate yet creative. Built from modular elements. Conveyed trust and stability through perfect proportions. Architectural elegance.`,
    luxury: `Premium luxury symbol: ornate elegance meets modern minimalism. Refined serif-inspired geometry. Gold-trimmed or accent highlight potential. Art deco influences mixed with contemporary sophistication. Conveys exclusivity, heritage, prestige. White space used strategically for luxury breathing room.`,
    bold: `High-impact statement mark: commanding presence, strong contrast, striking silhouette. Thick powerful strokes, dynamic angles, confident energy. Demands attention without aggression. Modern disruptor aesthetic. Memorable from distance. Strong brand personality.`,
    organic: `Natural, flowing design: organic curves inspired by nature, biological forms, flowing water. Smooth transitions, harmonic proportions. Eco-conscious aesthetic without being heavy-handed. Modern natural beauty. Sustainability conveyed through design language.`,
  };

  // Industry-specific context additions
  const industryContext: { [key: string]: string } = {
    tech: 'Tech-forward aesthetic: circuit patterns optional, connectivity themes, future-ready',
    finance: 'Trust-conveying design: stability, growth trajectory, structured confidence',
    fashion: 'Style-forward: elegant proportions, visual fashion sense, trendsetter energy',
    'food & beverage': 'Appetite-invoking: organic appeal, warmth, premium craftsmanship vibes',
    health: 'Wellness-focused: healing geometry, care-conveying forms, safety assurance',
    education: 'Knowledge-communicating: growth symbolism, learning journey visual, inspiration',
    entertainment: 'Engaging energy: dynamic movement, entertainment appeal, audience connection',
    'real estate': 'Stability-conveying: architectural elegance, community, growth symbolism',
  };

  const style = advancedStyles[logoStylePreference?.toLowerCase()] || advancedStyles.modern;
  const context = industryContext[industry?.toLowerCase()] || '';

  // Two premium, highly detailed prompts
  const prompts = [
    `PREMIUM LOGO: ${businessName} (${industry})

DESIGN SPECIFICATIONS:
${style}

INDUSTRY CONTEXT: ${context}

PRODUCT FOCUS: ${mainProduct ? `Core visual element subtly references "${mainProduct}" without being literal or obvious` : 'Timeless, industry-relevant symbolism'}

BRAND PERSONALITY: ${tone} (${
      tone === 'modern' ? 'contemporary, innovative, forward-thinking'
      : tone === 'luxury' ? 'premium, sophisticated, exclusive'
      : tone === 'fun' ? 'playful, energetic, approachable'
      : tone === 'minimal' ? 'clean, purposeful, refined'
      : tone === 'bold' ? 'confident, disruptive, powerful'
      : 'professional, trustworthy'
    })

TECHNICAL REQUIREMENTS:
- SVG-ready or vector-capable design
- Works as both mark AND in commercial applications
- Recognizable at all sizes (favicon to billboard)
- Monochrome version should work equally well
- Color version uses ${colors?.primary || 'sophisticated primary'} as primary, ${colors?.accent || 'complementary accent'} as highlight

STANDALONE SYMBOL - No text, letters, or company name initials
Perfect symmetry OR intentional dynamic asymmetry (not random)
Professional, premium, memorable. Industry leader aesthetic.`,

    `SOPHISTICATED BRAND MARK: ${businessName}

Create a distinctive visual identity that immediately communicates:
- Industry: ${industry}
- Target market: ${targetAudience}
- Brand personality: ${tone}
${mainProduct ? `- Core value: ${mainProduct}` : ''}

DESIGN APPROACH:
Strategic use of ${logoStylePreference} principles. Sophisticated composition. Professional polish.
The mark should evoke premium quality and industry expertise immediately upon viewing.
No clichés, no generic shapes, no overused industry symbols.
UNIQUE, MEMORABLE, PROFESSIONAL.

EXECUTION:
Studio-quality design, perfect proportions, intentional every detail.
Should look like it took $10,000 to create, not $100.
Future-proof (doesn't look trendy, looks timeless).
Horizontal and vertical applications both work.`,
  ];

  return prompts;
}

/**
 * PROFESSIONAL CAPTIONS - Detailed, engaging, specific
 * Written as if by brand founder, includes storytelling
 */
function generateCaptions(input: MarketingContentInput): string[] {
  const { businessName, industry, targetAudience, tone, mainProduct } = input;

  // More detailed, personality-filled captions
  const captionSets: { [key: string]: string[] } = {
    luxury: [
      `We didn't just enter ${industry}—we redefined it. 

${businessName} exists for ${targetAudience} who refuse to compromise. Every detail, from concept to execution, reflects our unwavering commitment to excellence.

${mainProduct ? `Our ${mainProduct} isn't just premium—it's a statement.` : `Premium doesn't mean expensive. It means intentional.`}

The discerning few recognize true quality. We create for them.

#${businessName.replace(/\s+/g, '')} #LuxuryRedefined`,

      `In a world of mass production, we craft with intention.

${businessName} represents the pinnacle of ${industry}—where heritage meets innovation, where quality is non-negotiable.

For ${targetAudience} who understand: the best isn't always the loudest, it's the most thoughtful.

Experience the difference premium craftsmanship makes.`,

      `Luxury is relative. Excellence is absolute.

At ${businessName}, we've spent countless hours perfecting every element of the ${mainProduct || industry} experience. The result? A brand that speaks quietly but commands attention.

Crafted for those who know the difference.`,
    ],

    playful: [
      `🎨 Real talk: ${industry} was getting boring.

So we created ${businessName}—the ${tone} ${mainProduct || 'experience'} for people like you. 

Who says you can't have fun AND quality? We combined both. Now watch the magic happen.

Ready to shake things up? Let's do this! 🚀`,

      `Life's too short for boring ${mainProduct || industry}. 

Meet ${businessName}: we're here to make ${targetAudience} smile, think differently, and genuinely enjoy the experience.

Because premium should be FUN. Boring is for competitors.

Join the movement. ✨`,

      `Plot twist: ${industry} just got a personality transplant. 💫

${businessName} isn't your typical ${mainProduct || 'brand'}. We're the brand that makes you want to share, engage, and come back for more.

If you're ${targetAudience} and you're tired of the status quo—this is for you.

Let's create magic together. 🎪`,
    ],

    modern: [
      `The future of ${industry} is here. And it's ${businessName}.

We've reimagined ${mainProduct || 'the entire experience'} for ${targetAudience}—combining cutting-edge innovation with what consumers actually want.

Welcome to the next generation of ${industry}. 

Ready to experience the future?`,

      `Meet ${businessName}: built for tomorrow's ${targetAudience}.

We started with a simple question: "What if ${industry} could be better?" The answer transformed everything.

Leveraging modern thinking, design excellence, and genuine customer obsession—we've created something truly different.

This is the future of ${mainProduct || industry}.`,

      `Innovation isn't about complexity. It's about solving real problems, beautifully.

${businessName} does exactly that for the ${tone} ${targetAudience} market. 

No unnecessary features. No boring design. Just premium ${mainProduct || industry} that actually works.

Welcome to what's next.`,
    ],

    minimal: [
      `Less. Better.

${businessName} distills ${industry} to its essential truth. Perfect for ${targetAudience} who value clarity over clutter.

${mainProduct ? `Pure, essential ${mainProduct}.` : 'Everything you need. Nothing you don\'t.'}

Minimalist by design. Maximum by impact.`,

      `We removed everything unnecessary and kept what matters most.

${businessName}: the ${tone} answer for ${targetAudience}.

Simplicity. Elegance. Purpose.`,

      `In design and life: clarity wins.

${businessName} for those who appreciate the beauty of restraint.

Experience what ${mainProduct || industry} should be.`,
    ],

    bold: [
      `Stop settling for mediocre. ${businessName} doesn't accept it either.

We're rewriting the rules of ${industry} for ${targetAudience} who demand excellence, not excuses.

${mainProduct ? `Our ${mainProduct} sets the new standard.` : 'This is the new standard.'}

Join the disruption. 🔥`,

      `Mediocrity has competition. Finally.

${businessName}: built for leaders, not followers. We deliver ${mainProduct || 'excellence in ' + industry}} that disrupts, inspires, and converts.

For ${targetAudience}: your new benchmark has arrived.`,

      `Small talk is over. Time for real impact.

${businessName} brings bold ideas, premium execution, and unwavering commitment to victory.

Are you ready for what's next? Let's build it together.`,
    ],
  };

  const captions = captionSets[tone?.toLowerCase()] || captionSets.modern;
  return captions.slice(0, 3);
}

/**
 * PREMIUM COMMENTS - Realistic social proof
 */
function generateComments(input: MarketingContentInput): string[][] {
  const { businessName, targetAudience, tone } = input;

  const commentTemplates: { [key: string]: string[][] } = {
    luxury: [
      [
        `This is the level of sophistication we need more of.`,
        `Finally, someone who gets it. Bravo.`,
        `Premium doesn't come cheap, but this is worth every penny.`,
      ],
      [
        `The attention to detail is absolutely unmatched.`,
        `This is what the ${targetAudience} market has been waiting for.`,
        `Standards have been reset.`,
      ],
      [
        `I've been looking for something exactly like this. Perfect.`,
        `Not just a brand, it's a lifestyle choice.`,
        `Instantly became my go-to recommendation.`,
      ],
    ],
    playful: [
      [
        `This just made my entire day 😍`,
        `YES to everything about this!!`,
        `Why isn't everyone talking about this yet??`,
      ],
      [
        `This is the energy we need in ${targetAudience} spaces 🎉`,
        `Can't stop smiling at how good this is`,
        `Best discovery this week, easily`,
      ],
      [
        `Okay this just became my new obsession`,
        `Who else is getting major positive vibes from this?`,
        `Officially recommending to everyone I know ✨`,
      ],
    ],
    modern: [
      [
        `This is genuinely innovative. Impressed.`,
        `Finally a brand that understands the modern ${targetAudience}.`,
        `The execution here is flawless.`,
      ],
      [
        `This solves actual problems without the bloat. Excellent.`,
        `Setting the new standard for the industry.`,
        `Can't wait to see what comes next from these folks.`,
      ],
      [
        `This is how you do innovation right.`,
        `The future of the industry is here, and I'm here for it.`,
        `Genuinely excited about this. Rare find.`,
      ],
    ],
    minimal: [
      [
        `Simple, elegant, effective. Exactly what we needed.`,
        `Less really is more. This proves it.`,
        `Perfect execution of minimalist principles.`,
      ],
      [
        `No unnecessary noise, just pure value. Love it.`,
        `This respects my time and intelligence. Rare.`,
        `Exactly this. Nothing more, nothing less.`,
      ],
      [
        `The restraint here shows real maturity in design.`,
        `Quality through simplicity. Beautiful approach.`,
        `Bookmarking this as an example of done right.`,
      ],
    ],
    bold: [
      [
        `NOW this is confidence. 🔥 Finally.`,
        `Someone not afraid to take a stand. Respect.`,
        `This is what leadership looks like.`,
      ],
      [
        `Bold without being obnoxious. Well played.`,
        `The conviction here is unmatched.`,
        `Disruption done right.`,
      ],
      [
        `This doesn't whisper, it commands. Perfect.`,
        `The energy is exactly what we needed.`,
        `Setting a new standard for bravery in branding.`,
      ],
    ],
  };

  const comments = commentTemplates[tone?.toLowerCase()] || commentTemplates.modern;
  return comments;
}

/**
 * ALTERNATIVE MARKETING MATERIALS - Professional, multi-channel
 */
function generateMarketingMaterials(input: MarketingContentInput): MarketingMaterial {
  const { businessName, industry, targetAudience, tone, mainProduct } = input;

  // Email subject lines (multiple options)
  const emailSubjectLines = [
    `Introducing ${businessName}: ${tone} ${mainProduct || industry} Redefined`,
    `${targetAudience}, Meet Your New Favorite ${mainProduct || 'Brand'}`,
    `The ${industry} Just Changed. Here's Why Everyone's Talking About ${businessName}`,
    `${tone[0].toUpperCase() + tone.slice(1)} Design Meets Premium ${mainProduct || industry}`,
    `Exclusive Access: ${businessName}'s Limited Launch`,
  ];

  // Landing page headlines (conversion-focused)
  const landingPageHeadlines = [
    `${businessName}: Premium ${mainProduct || industry} for Discerning ${targetAudience}`,
    `Finally, a ${mainProduct || industry} Brand That Gets It`,
    `The ${tone} Standard in ${industry}—Built for You`,
    `Experience What ${mainProduct || industry} Should Be`,
    `Redefining ${industry} for the Modern ${targetAudience}`,
  ];

  // Instagram story starters (urgency + curiosity)
  const instagramStories = [
    `🚀 We just launched something that changes everything about ${mainProduct || industry}...`,
    `✨ For ${targetAudience} who refuse to compromise on quality...`,
    `🎯 What if we told you ${mainProduct || industry} could be completely different?`,
    `💡 This is what ${tone} ${mainProduct || industry} actually looks like...`,
    `🔥 The ${industry} world isn't ready for what we just did...`,
  ];

  // LinkedIn article opener (thought leadership)
  const linkedinArticle = `How We Transformed ${industry} for ${tone} ${targetAudience}

When we started ${businessName}, we saw one clear problem: ${industry} was stuck.

The same approaches. The same thinking. The same mediocre results.

So we asked ourselves a different question: "What if we built ${mainProduct || industry} from first principles? What if we designed for the actual needs of ${targetAudience}?"

The answer surprised us. And is now disrupting the entire industry.

Here's what we learned—and why it matters for your business:

[Full Article Content]`;

  return {
    emailSubjectLines,
    landingPageHeadlines,
    instagramStories,
    linkedinArticle,
  };
}

/**
 * Main export: Generate all marketing content
 */
export function generateMarketingContent(
  input: MarketingContentInput
): MarketingContent {
  const logoPrompts = generateLogoPrompts(input);
  const captions = generateCaptions(input);
  const comments = generateComments(input);
  const marketingMaterials = generateMarketingMaterials(input);

  return {
    logoPrompts,
    captions,
    comments,
    marketingMaterials,
  };
}
