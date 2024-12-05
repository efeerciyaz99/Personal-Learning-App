export type ContentType = 'article' | 'video' | 'blog';

export interface ContentMetadata {
  word_count: number;
  processing_time: number;
  content_type: ContentType;
} 