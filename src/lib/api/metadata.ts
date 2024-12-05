import { load, CheerioAPI } from 'cheerio';
import { z } from 'zod';
import { ContentType } from '../types/content';

const metadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  publishedDate: z.string().optional(),
  image: z.string().url().optional(),
  type: z.enum(['article', 'video', 'blog']),
});

export async function extractMetadata(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    const metadata = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      author: $('meta[name="author"]').attr('content'),
      publishedDate: $('meta[property="article:published_time"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      type: detectContentType(url, $),
    };

    return metadataSchema.parse(metadata);
  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw new Error('Failed to extract metadata');
  }
}

function detectContentType(url: string, $: CheerioAPI): ContentType {
  if (url.includes('youtube.com') || url.includes('vimeo.com')) {
    return 'video';
  }

  if (
    url.includes('medium.com') ||
    url.includes('wordpress.com') ||
    url.includes('blogger.com') ||
    $('meta[property="og:type"]').attr('content') === 'blog'
  ) {
    return 'blog';
  }

  return 'article';
} 