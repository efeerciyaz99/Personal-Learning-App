import { openai } from '../api/openai';
import { getYoutubeTranscript } from '../api/youtube';
import { Summary, Insight } from '../types/summary';
import { UserPreferences } from '../types/user';

export class SummaryGenerator {
  constructor(private userPrefs: UserPreferences) {}

  async generateSummary(
    content: string, 
    sourceType: 'article' | 'video' | 'blog',
    sourceUrl: string
  ): Promise<Summary> {
    const startTime = Date.now();
    
    // Process content based on source type
    const processedContent = await this.preprocessContent(content, sourceType, sourceUrl);
    
    // Generate summary using OpenAI
    const summary = await this.createStructuredSummary(processedContent);
    
    return {
      ...summary,
      metadata: {
        ...summary.metadata,
        processing_time: Date.now() - startTime,
        content_type: sourceType
      }
    };
  }

  private async preprocessContent(
    content: string,
    sourceType: 'article' | 'video' | 'blog',
    sourceUrl: string
  ): Promise<string> {
    switch (sourceType) {
      case 'video':
        return await getYoutubeTranscript(sourceUrl);
      default:
        return content;
    }
  }

  private generatePrompt(content: string): string {
    return `
      As an expert content summarizer, analyze the following content based on these preferences:
      - Style: ${this.userPrefs.style}
      - Detail Level: ${this.userPrefs.detailLevel}
      - Focus Areas: ${this.userPrefs.focusAreas.join(', ')}

      Content:
      ${content}

      Provide a structured summary including:
      1. Key points
      2. Main themes
      3. Critical insights with confidence levels
      4. Supporting evidence for each insight
    `;
  }

  private async createStructuredSummary(content: string): Promise<Summary> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: this.generatePrompt(content)
        }
      ],
      functions: [{
        name: "create_summary",
        description: "Create a structured summary of the content",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            key_points: {
              type: "array",
              items: { type: "string" }
            },
            themes: {
              type: "array",
              items: { type: "string" }
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
                content_type: { 
                  type: "string",
                  enum: ["article", "video", "blog"]
                }
              }
            }
          },
          required: ["title", "key_points", "themes", "insights", "metadata"]
        }
      }],
      function_call: { name: "create_summary" }
    });

    const functionCall = completion.choices[0]?.message?.function_call;
    if (!functionCall?.arguments) {
      throw new Error('Failed to generate summary: No function call response');
    }

    try {
      const result = JSON.parse(functionCall.arguments);
      
      return {
        id: '', // Will be set by the database
        userId: '', // Will be set by the application
        createdAt: new Date(),
        updatedAt: new Date(),
        sourceUrl: '', // Will be set by the application
        isPublic: false,
        ...result
      };
    } catch (error) {
      throw new Error('Failed to parse summary response');
    }
  }
} 