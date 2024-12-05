import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const annotations = await db.annotation.findMany({
      where: {
        summaryId: params.id,
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(annotations);
  } catch (error) {
    console.error('Annotations fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    const annotation = await db.annotation.create({
      data: {
        content,
        summaryId: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(annotation);
  } catch (error) {
    console.error('Annotation creation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 