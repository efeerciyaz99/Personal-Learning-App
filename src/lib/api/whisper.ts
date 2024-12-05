import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { openai } from './openai';

const ffmpeg = createFFmpeg({ log: true });

export class AudioProcessor {
  private initialized = false;

  async init() {
    if (!this.initialized) {
      await ffmpeg.load();
      this.initialized = true;
    }
  }

  async transcribeAudio(audioFile: File): Promise<string> {
    await this.init();

    try {
      // Convert audio to required format if needed
      const buffer = await audioFile.arrayBuffer();
      ffmpeg.FS('writeFile', 'input.mp3', new Uint8Array(buffer));
      
      await ffmpeg.run(
        '-i', 'input.mp3',
        '-ar', '16000',
        '-ac', '1',
        '-c:a', 'pcm_s16le',
        'output.wav'
      );

      const transcription = await openai.audio.transcriptions.create({
        file: new File([ffmpeg.FS('readFile', 'output.wav')], 'audio.wav'),
        model: 'whisper-1',
        language: 'en',
      });

      // Cleanup
      ffmpeg.FS('unlink', 'input.mp3');
      ffmpeg.FS('unlink', 'output.wav');

      return transcription.text;
    } catch (error) {
      console.error('Audio processing error:', error);
      throw new Error('Failed to process audio');
    }
  }
} 