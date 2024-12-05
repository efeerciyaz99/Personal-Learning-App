import { OpenAI } from 'openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { YoutubeTranscript } from 'youtube-transcript-api';
import { createWhisperInstance } from 'whisper-node';
import { UserPreferences } from '../types/user';
import { Summary } from '../types/summary';

export class ContentProcessor {
  private openai: OpenAI;
  private langChain: ChatOpenAI;
  private userPrefs: UserPreferences;

  constructor(apiKey: string, userPrefs: UserPreferences) {
    this.openai = new OpenAI({ apiKey });
    this.langChain = new ChatOpenAI({ openAIApiKey: apiKey });
    this.userPrefs = userPrefs;
  }

  private generateSystemPrompt(): string {
    return `
      You are an expert content summarizer. Please analyze the following content and create a structured summary based on these preferences:
      - Style: ${this.userPrefs.style}
      - Detail Level: ${this.userPrefs.detailLevel}
      - Focus Areas: ${this.userPrefs.focusAreas.join(', ')}
      
      Provide key points, identify themes, and generate insights with supporting evidence.
    `;
  }

  public async processContent(content: string, contentType: 'text' | 'video' | 'audio'): Promise<Summary> {
    const startTime = Date.now();
    
    let processedContent = content;
    if (contentType === 'video') {
      processedContent = await this.processVideoContent(content);
    } else if (contentType === 'audio') {
      processedContent = await this.processAudioContent(content);
    }

    const summary = await this.structuredSummarization(processedContent);
    return {
      ...summary,
      metadata: {
        ...summary.metadata,
        processing_time: Date.now() - startTime,
        content_type: contentType
      }
    };
  }

  private async processVideoContent(url: string): Promise<string> {
    // Implementation for video content processing
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    return transcript.map(item => item.text).join(' ');
  }

  private async processAudioContent(audioFile: string): Promise<string> {
    // Implementation for audio content processing
    const whisper = createWhisperInstance();
    const transcription = await whisper.transcribe(audioFile);
    return transcription.text;
  }

  private async structuredSummarization(content: string): Promise<Summary> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: this.generateSystemPrompt()
        },
        {
          role: "user",
          content
        }
      ],
      functions: [
        {
          name: "generate_summary",
          description: "Generate a structured summary of the content",
          parameters: {
            type: "object",
            properties: {
              key_points: {
                type: "array",
                items: { type: "string" },
                description: "Main points from the content"
              },
              themes: {
                type: "array",
                items: { type: "string" },
                description: "Key themes identified"
              },
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    insight: { type: "string" },
                    confidence: { 
                      type: "number",
                      minimum: 0,
                      maximum: 1
                    },
                    supporting_evidence: { type: "string" }
                  },
                  required: ["insight", "confidence", "supporting_evidence"]
                }
              },
              metadata: {
                type: "object",
                properties: {
                  word_count: { type: "number" },
                  processing_time: { type: "number" },
                  content_type: { 
                    type: "string",
                    enum: ["text", "video", "audio"]
                  }
                },
                required: ["word_count", "processing_time", "content_type"]
              }
            },
            required: ["key_points", "themes", "insights", "metadata"]
          }
        }
      ],
      function_call: { name: "generate_summary" }
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall?.arguments) {
      throw new Error('Failed to generate summary: No function call response');
    }

    try {
      return JSON.parse(functionCall.arguments) as Summary;
    } catch (error) {
      throw new Error('Failed to parse summary response');
    }
  }
} 