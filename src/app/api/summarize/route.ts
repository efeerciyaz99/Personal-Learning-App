import { NextResponse } from 'next/server';
import { SummaryGenerator } from '@/lib/utils/summarize';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { content, sourceType, sourceUrl } = body;

    // Get user preferences from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { preferences: true }
    });

    if (!user || !user.preferences) {
      return new NextResponse('User preferences not found', { status: 400 });
    }

    // Generate summary
    const generator = new SummaryGenerator(user.preferences);
    const summary = await generator.generateSummary(content, sourceType, sourceUrl);

    // Save to database
    const savedSummary = await db.summary.create({
      data: {
        ...summary,
        userId: session.user.id,
        sourceUrl,
        isPublic: false
      }
    });

    return NextResponse.json(savedSummary);
  } catch (error) {
    console.error('Summary generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 