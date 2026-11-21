import { NextRequest, NextResponse } from 'next/server';
import { generateMarketingKit } from '@/lib/gemini';

export const maxDuration = 60;

const GENERATION_TIMEOUT_MS = 40_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, industry, targetAudience, tone } = body;

    if (!businessName || !industry || !targetAudience) {
      return NextResponse.json(
        { message: 'Missing required fields: businessName, industry, targetAudience' },
        { status: 400 }
      );
    }

    if (businessName.trim().length === 0 || targetAudience.trim().length === 0) {
      return NextResponse.json(
        { message: 'Business name and target audience cannot be empty' },
        { status: 400 }
      );
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), GENERATION_TIMEOUT_MS)
    );

    const marketingKit = await Promise.race([
      generateMarketingKit({
        businessName: businessName.trim(),
        industry,
        targetAudience: targetAudience.trim(),
        tone: tone || 'modern',
      }),
      timeoutPromise
    ]);

    return NextResponse.json(marketingKit);
  } catch (error) {
    console.warn('⚠️ [API Route] Marketing kit generation failed:', error);
    
    try {
      const body = await request.clone().json().catch(() => ({}));
      const name = body.businessName || 'Your Brand';
      
      const fallbackKit = {
        instagramPosts: [],
        linkedinPosts: [],
        leadGeneration: {
          coldDM: `Hi! I noticed your interest in ${body.industry || 'business'}. Thought of you. Let's chat!`,
          followUpDM: `Still interested in exploring?`,
          leadReply: `Great to hear! Let's schedule a time to connect.`,
          closingMessage: `Let's move forward. What works best for you?`
        }
      };
      
      return NextResponse.json(fallbackKit);
    } catch (e) {
      return NextResponse.json({
        instagramPosts: [],
        linkedinPosts: [],
        leadGeneration: {
          coldDM: "Hi! Interested in collaborating?",
          followUpDM: "Following up on our conversation.",
          leadReply: "Great! Let's schedule a call.",
          closingMessage: "Let's make this happen!"
        }
      });
    }
  }
}
