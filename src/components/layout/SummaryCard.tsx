import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Summary } from '@/lib/types';

interface SummaryCardProps {
  summary: Summary;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <Link href={`/summary/${summary.id}`}>
        <h3 className="font-semibold text-lg mb-2">{summary.title}</h3>
        
        <div className="flex gap-2 mb-3">
          {summary.themes.map((theme) => (
            <span
              key={theme}
              className="text-xs px-2 py-1 bg-gray-100 rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {summary.key_points.slice(0, 2).map((point) => (
            <p key={point} className="mb-1">• {point}</p>
          ))}
          {summary.key_points.length > 2 && (
            <p className="text-blue-600">+ {summary.key_points.length - 2} more points</p>
          )}
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>{summary.metadata.content_type}</span>
          <span>{formatDistanceToNow(new Date(summary.createdAt))} ago</span>
        </div>
      </Link>
    </div>
  );
} 