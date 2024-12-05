export interface Theme {
  id: string;
  name: string;
  color: string;
  summaryIds: string[];
  userId: string;
}

export type ContentType = 'text' | 'video' | 'audio';
export type SummaryStyle = 'academic' | 'casual' | 'business';
export type DetailLevel = 1 | 2 | 3 | 4 | 5;
export type FocusArea = 'main_points' | 'examples' | 'implications' | 'citations'; 