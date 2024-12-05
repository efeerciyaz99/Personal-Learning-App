export interface Insight {
  insight: string;
  confidence: number;
  supporting_evidence: string;
}

export interface Summary {
  id: string;
  title: string;
  key_points: string[];
  themes: string[];
  insights: Insight[];
  metadata: {
    word_count: number;
    processing_time: number;
    content_type: 'text' | 'video' | 'audio';
  };
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 