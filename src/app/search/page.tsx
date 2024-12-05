'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { SummaryCard } from '@/components/layout/SummaryCard';
import { Summary } from '@/lib/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  const { data: summaries, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, dateRange, selectedThemes, selectedTypes],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        ...(dateRange?.from && { from: dateRange.from.toISOString() }),
        ...(dateRange?.to && { to: dateRange.to.toISOString() }),
        ...(selectedThemes.length && { themes: selectedThemes.join(',') }),
        ...(selectedTypes.length && { types: selectedTypes.join(',') }),
      });

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json() as Promise<Summary[]>;
    },
    enabled: Boolean(debouncedQuery) || selectedThemes.length > 0 || selectedTypes.length > 0,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search summaries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <DatePickerWithRange
            value={dateRange}
            onChange={setDateRange}
          />

          <MultiSelect
            options={[
              { label: 'Article', value: 'article' },
              { label: 'Video', value: 'video' },
              { label: 'Blog', value: 'blog' },
              { label: 'Document', value: 'document' },
            ]}
            selected={selectedTypes}
            onChange={setSelectedTypes}
            placeholder="Select content types..."
          />

          <MultiSelect
            options={[
              { label: 'Technology', value: 'technology' },
              { label: 'Science', value: 'science' },
              { label: 'Business', value: 'business' },
              // Add more themes as needed
            ]}
            selected={selectedThemes}
            onChange={setSelectedThemes}
            placeholder="Select themes..."
          />

          <Button
            variant="outline"
            onClick={() => {
              setQuery('');
              setDateRange(null);
              setSelectedThemes([]);
              setSelectedTypes([]);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : summaries?.length === 0 ? (
          <div className="text-center text-gray-500">No results found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries?.map((summary) => (
              <SummaryCard key={summary.id} summary={summary} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 