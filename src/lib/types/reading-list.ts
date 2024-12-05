export type ReadingStatus = 'unread' | 'reading' | 'completed';

export interface ReadingListItem {
  id: string;
  userId: string;
  summaryId: string;
  status: ReadingStatus;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} 