import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { findRelatedSummaries } from '@/lib/utils/similarity';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the current summary
    const currentSummary = await db.summary.findUnique({
      where: { id: params.id },
    });

    if (!currentSummary) {
      return new NextResponse('Summary not found', { status: 404 });
    }

    // Get all summaries for comparison
    const allSummaries = await db.summary.findMany({
      where: {
        userId: session.user.id,
        id: { not: params.id }, // Exclude current summary
      },
    });

    // Find related summaries
    const relatedSummaries = await findRelatedSummaries(currentSummary, allSummaries);

    // Update the relationships in the database
    await db.summaryRelationship.createMany({
      data: relatedSummaries.map(related => ({
        summaryId: currentSummary.id,
        relatedSummaryId: related.id,
        strength: 1, // You could store the similarity score here
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(relatedSummaries);
  } catch (error) {
    console.error('Related summaries error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 