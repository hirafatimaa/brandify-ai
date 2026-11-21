import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildLogos, raster } from '@/lib/brand/artwork';
import { assetArchive, faviconPng, guidelinesPdf, posterSvg } from '@/lib/brand/export';
import { filename, projectSchema } from '@/lib/brand/model';

export const runtime = 'nodejs';
export const maxDuration = 60;

const requestSchema = z.object({
  project: projectSchema,
  direction: z.number().int().min(0).max(5),
  format: z.enum(['guidelines', 'assets', 'logo-book', 'avatar', 'poster']),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: 'Open a brand guideline before exporting.' }, { status: 400 });

  const { project, direction, format } = parsed.data;
  const name = filename(project.brief.businessName);
  try {
    const logos = buildLogos(project, { revise: false });
    const selected = logos[direction];
    const asset = format === 'assets';
    const avatar = format === 'avatar';
    const poster = format === 'poster';
    const data = asset ? assetArchive(project, selected) :
      avatar ? faviconPng(selected, 1080, true) :
      poster ? raster(posterSvg(project, selected), 2400).asPng() :
      await guidelinesPdf(project, logos, direction, format === 'logo-book');
    const type = asset ? 'application/zip' : (avatar || poster) ? 'image/png' : 'application/pdf';
    const ext = asset ? 'zip' : (avatar || poster) ? 'png' : 'pdf';
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': type,
        'Content-Disposition': `attachment; filename="${name}-${format}.${ext}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Brand export failed', error);
    return NextResponse.json({ message: 'Export failed. Try downloading again.' }, { status: 500 });
  }
}
