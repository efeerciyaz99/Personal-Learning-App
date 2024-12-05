export interface UserPreferences {
  style: 'academic' | 'casual' | 'business';
  detailLevel: 1 | 2 | 3 | 4 | 5;
  focusAreas: ('main_points' | 'examples' | 'implications' | 'citations')[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
} 