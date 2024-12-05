import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SummaryGenerator } from '@/lib/utils/summarize';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { url, title, content, type, addToReadingList } = body;

    // Get user preferences
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { preferences: true },
    });

    if (!user?.preferences) {
      return new NextResponse('User preferences not found', { status: 400 });
    }

    // Generate summary
    const generator = new SummaryGenerator(user.preferences);
    const summary = await generator.generateSummary(content, type, url);

    // Save to database
    const savedSummary = await db.summary.create({
      data: {
        ...summary,
        userId: session.user.id,
        sourceUrl: url,
        isPublic: false,
      },
    });

    // Add to reading list if requested
    if (addToReadingList) {
      await db.readingList.create({
        data: {
          userId: session.user.id,
          summaryId: savedSummary.id,
          status: 'unread',
        },
      });
    }

    return NextResponse.json(savedSummary);
  } catch (error) {
    console.error('Content capture error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 