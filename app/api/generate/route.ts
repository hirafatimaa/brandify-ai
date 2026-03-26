import { NextRequest, NextResponse } from 'next/server';
import { generateBrandKit } from '@/lib/gemini';

// Set timeout for the function (in seconds) - Vercel pro tier supports up to 60s
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, industry, targetAudience, tone } = body;

    // Validate required fields
    if (!businessName || !industry || !targetAudience) {
      return NextResponse.json(
        { message: 'Missing required fields: businessName, industry, targetAudience' },
        { status: 400 }
      );
    }

    // Trim and validate inputs
    if (businessName.trim().length === 0 || targetAudience.trim().length === 0) {
      return NextResponse.json(
        { message: 'Business name and target audience cannot be empty' },
        { status: 400 }
      );
    }

    // Generate brand kit with timeout wrapper
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Brand generation timed out. Please try again.')), 55000)
    );

    const brandKit = await Promise.race([
      generateBrandKit({
        businessName: businessName.trim(),
        industry,
        targetAudience: targetAudience.trim(),
        tone: tone || 'modern',
      }),
      timeoutPromise
    ]);

    return NextResponse.json(brandKit);
  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('GEMINI_API_KEY')) {
        return NextResponse.json(
          { message: 'API configuration error. Please set GEMINI_API_KEY environment variable.' },
          { status: 500 }
        );
      }
      if (error.message.includes('404') || error.message.includes('not found')) {
        return NextResponse.json(
          { message: 'API key invalid or expired. Please check your GEMINI_API_KEY in .env.local. Get a new key from: https://aistudio.google.com/app/apikeys' },
          { status: 401 }
        );
      }
      if (error.message.includes('timed out')) {
        return NextResponse.json(
          { message: 'Generation took too long. Please try again.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { message: error.message || 'Failed to generate brand kit' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred while generating your brand kit' },
      { status: 500 }
    );
  }
}
