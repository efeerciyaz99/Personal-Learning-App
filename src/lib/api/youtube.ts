import { YoutubeTranscript } from 'youtube-transcript';
import { z } from 'zod';

const transcriptSchema = z.array(z.object({
  text: z.string(),
  duration: z.number(),
  offset: z.number(),
}));

export async function getYoutubeTranscript(videoUrl: string): Promise<string> {
  try {
    const videoId = extractVideoId(videoUrl);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const validatedTranscript = transcriptSchema.parse(transcript);
    
    return validatedTranscript
      .map(item => item.text)
      .join(' ');
  } catch (error) {
    console.error('YouTube transcript error:', error);
    throw new Error('Failed to fetch YouTube transcript');
  }
}

function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  if (!match) throw new Error('Invalid YouTube URL');
  return match[1];
} 