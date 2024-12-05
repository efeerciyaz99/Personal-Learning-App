import { Suspense } from 'react';
import { RelatedContent } from '@/components/summaries/RelatedContent';
import { SummaryView } from '@/components/summaries/SummaryView';

interface Props {
  params: {
    id: string;
  };
}

export default function SummaryPage({ params }: Props) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading summary...</div>}>
        <SummaryView summaryId={params.id} />
      </Suspense>

      <Suspense fallback={<div>Loading related content...</div>}>
        <RelatedContent summaryId={params.id} />
      </Suspense>
    </div>
  );
} 