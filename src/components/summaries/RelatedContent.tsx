'use client';

import { useQuery } from '@tanstack/react-query';
import { Summary } from '@/lib/types';
import { SummaryCard } from '@/components/layout/SummaryCard';

interface RelatedContentProps {
  summaryId: string;
}

export function RelatedContent({ summaryId }: RelatedContentProps) {
  const { data: relatedSummaries, isLoading } = useQuery({
    queryKey: ['related-summaries', summaryId],
    queryFn: async () => {
      const response = await fetch(`/api/summaries/${summaryId}/related`);
      if (!response.ok) throw new Error('Failed to fetch related content');
      return response.json() as Promise<Summary[]>;
    },
  });

  if (isLoading) {
    return <div>Loading related content...</div>;
  }

  if (!relatedSummaries?.length) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Related Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedSummaries.map((summary) => (
          <SummaryCard key={summary.id} summary={summary} />
        ))}
      </div>
    </div>
  );
} 