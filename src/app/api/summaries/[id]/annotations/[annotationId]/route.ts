import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: { id: string; annotationId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    const annotation = await db.annotation.update({
      where: {
        id: params.annotationId,
        userId: session.user.id,
      },
      data: {
        content,
      },
    });

    return NextResponse.json(annotation);
  } catch (error) {
    console.error('Annotation update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; annotationId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await db.annotation.delete({
      where: {
        id: params.annotationId,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Annotation deletion error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 