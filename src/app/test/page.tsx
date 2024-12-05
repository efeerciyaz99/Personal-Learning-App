'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSummarize = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: "OpenAI has released GPT-4, which demonstrates human-level performance on various professional and academic benchmarks. The model shows improvements in creativity, reliability, and ability to handle nuanced instructions.",
          sourceType: "article",
          sourceUrl: "https://example.com/gpt4-article"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <button
        onClick={testSummarize}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Test Summarize API'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
} 