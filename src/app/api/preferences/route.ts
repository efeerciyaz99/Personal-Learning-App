import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const preferences = await db.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Preferences fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const preferences = await db.userPreferences.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Preferences creation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const preferences = await db.userPreferences.update({
      where: { userId: session.user.id },
      data: body,
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Preferences update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 