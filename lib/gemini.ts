import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || 'dummy_key';
const client = new GoogleGenerativeAI(apiKey);

interface MarketingKitInput {
  businessName: string;
  industry: string;
  targetAudience: string;
  tone: string;
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

export async function generateMarketingKit(input: MarketingKitInput): Promise<MarketingKit> {
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

  let marketingContent: any = {};
  
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite' });
      const response = await model.generateContent(marketingPrompt);
      const responseText = response.response.text();
      
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON response');
      }
      
      marketingContent = JSON.parse(jsonMatch[0]);
      
      if (!marketingContent.instagramPosts || !marketingContent.linkedinPosts || !marketingContent.leadGeneration) {
        throw new Error('Missing required fields in marketing kit');
      }
      
      console.log(`✓ Marketing kit generated successfully (minimal cost)`);
    } catch (error) {
      console.warn(`⚠️ [Fallback] Marketing kit generation failed:`, error instanceof Error ? error.message : String(error));
    }
  }

  if (Object.keys(marketingContent).length === 0) {
    console.warn('⚠️ [Fallback] Using dynamic marketing kit generation');
    marketingContent = generateFallbackMarketingKit(businessName, industry, targetAudience, tone);
  }

  console.log('📊 Marketing kit ready (image generation skipped to preserve budget)');

  return {
    instagramPosts: marketingContent.instagramPosts || [],
    linkedinPosts: marketingContent.linkedinPosts || [],
    leadGeneration: marketingContent.leadGeneration || { coldDM: '', followUpDM: '', leadReply: '', closingMessage: '' }
  };
}

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
