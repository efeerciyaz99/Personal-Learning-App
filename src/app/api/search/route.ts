import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const themes = searchParams.get('themes')?.split(',') || [];
    const types = searchParams.get('types')?.split(',') || [];

    const summaries = await db.summary.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { keyPoints: { hasSome: [query] } },
          { themes: { hasSome: [query] } },
        ],
        AND: [
          // Date range filter
          from && {
            createdAt: {
              gte: new Date(from),
            },
          },
          to && {
            createdAt: {
              lte: new Date(to),
            },
          },
          // Theme filter
          themes.length > 0 && {
            themes: {
              hasSome: themes,
            },
          },
          // Content type filter
          types.length > 0 && {
            sourceType: {
              in: types,
            },
          },
        ].filter(Boolean),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Search error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 