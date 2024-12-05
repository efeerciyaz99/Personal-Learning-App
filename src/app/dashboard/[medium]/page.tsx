import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { SummaryCard } from '@/components/layout/SummaryCard';
import { db } from '@/lib/db';

const validMediums = ['article', 'video', 'blog', 'document'];

interface Props {
  params: {
    medium: string;
  };
}

async function getSummariesByMedium(medium: string) {
  const summaries = await db.summary.findMany({
    where: {
      sourceType: medium,
    },
    orderBy: { createdAt: 'desc' },
  });
  return summaries;
}

export default async function MediumPage({ params }: Props) {
  if (!validMediums.includes(params.medium)) {
    notFound();
  }

  const summaries = await getSummariesByMedium(params.medium);
  const mediumLabel = params.medium.charAt(0).toUpperCase() + params.medium.slice(1);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">{mediumLabel} Summaries</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Suspense fallback={<div>Loading summaries...</div>}>
            {summaries.map((summary) => (
              <SummaryCard key={summary.id} summary={summary} />
            ))}
          </Suspense>
        </div>
      </main>
    </div>
  );
} 