import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PageInfo {
  url: string;
  title: string;
  content: string;
  type: 'article' | 'video' | 'blog' | 'document';
}

export function ExtensionPopup() {
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addToReadingList, setAddToReadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      try {
        const response = await chrome.tabs.sendMessage(tab.id!, { type: 'GET_PAGE_INFO' });
        setPageInfo(response);
      } catch (err) {
        setError('Failed to get page information');
      }
    });
  }, []);

  const handleCapture = async () => {
    if (!pageInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: pageInfo.url,
          title: pageInfo.title,
          content: pageInfo.content,
          type: pageInfo.type,
          addToReadingList,
        }),
      });

      if (!response.ok) throw new Error('Failed to capture content');

      window.close(); // Close popup after successful capture
    } catch (err) {
      setError('Failed to capture content');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-80 p-4">
      <h2 className="text-lg font-semibold mb-4">Capture Content</h2>
      
      {pageInfo && (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={pageInfo.title} readOnly />
          </div>

          <div>
            <Label>Content Type</Label>
            <Input value={pageInfo.type} readOnly />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={addToReadingList}
              onCheckedChange={setAddToReadingList}
              id="reading-list"
            />
            <Label htmlFor="reading-list">Add to Reading List</Label>
          </div>

          <Button
            onClick={handleCapture}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Capturing...' : 'Capture Content'}
          </Button>
        </div>
      )}
    </div>
  );
} 