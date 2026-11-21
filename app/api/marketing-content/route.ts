import { NextRequest, NextResponse } from 'next/server';
import { generateMarketingContent } from '@/lib/marketingGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessName,
      industry,
      targetAudience,
      tone = 'modern',
      mainProduct,
      colors,
    } = body;

    if (!businessName || !industry || !targetAudience) {
      return NextResponse.json(
        {
          message:
            'Missing required fields: businessName, industry, targetAudience',
        },
        { status: 400 }
      );
    }

    const marketingContent = generateMarketingContent({
      businessName,
      industry,
      targetAudience,
      tone,
      mainProduct,
      colors,
    });

    return NextResponse.json(marketingContent, { status: 200 });
  } catch (error) {
    console.error('❌ Marketing content generation failed:', error);
    return NextResponse.json(
      {
        message: 'Failed to generate marketing content',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
