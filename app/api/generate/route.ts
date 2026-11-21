import { NextRequest, NextResponse } from 'next/server';
import { buildLogos } from '@/lib/brand/artwork';
import { localDraft } from '@/lib/brand/fallback';
import { researchReferences } from '@/lib/brand/research';
import { requestBrand } from '@/lib/brand/gemini';
import { briefSchema, projectSchema, type BrandProject, type Shape } from '@/lib/brand/model';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Review the brand brief.' }, { status: 400 });
  }

  const brief = parsed.data;
  const research = process.env.GEMINI_API_KEY?.trim() ? researchReferences(brief.industry) : Promise.resolve([]);
  const publicReferences = await research;
  let project: BrandProject;
  let alternateMarks: Shape[][] = [];
  try {
    const generated = await requestBrand(brief, publicReferences);
    alternateMarks = generated.alternateMarks;
    project = { brief, draft: generated.draft, source: 'gemini' };
  } catch (error) {
    project = {
      brief,
      draft: localDraft(brief),
      source: 'local',
      note: error instanceof Error ? error.message.slice(0, 240) : 'Gemini is temporarily unavailable.',
    };
  }

  try {
    const logos = buildLogos(project, { research: publicReferences, alternateMarks });
    project.draft.directions = logos.map(({ markSvg, wordmarkSvg, lockupSvg, stackedSvg, checks, ...recipe }) => recipe);
    return NextResponse.json({ ...projectSchema.parse(project), logos });
  } catch (error) {
    console.error('Could not build brand artwork', error);
    return NextResponse.json({ message: 'The artwork could not be built. Please try again.' }, { status: 500 });
  }
}
