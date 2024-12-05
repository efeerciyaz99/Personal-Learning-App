import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { SummaryCard } from '@/components/layout/SummaryCard';
import { db } from '@/lib/db';

async function getRecentSummaries() {
  const summaries = await db.summary.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return summaries;
}

export default async function DashboardPage() {
  const summaries = await getRecentSummaries();

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Recent Summaries</h1>
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