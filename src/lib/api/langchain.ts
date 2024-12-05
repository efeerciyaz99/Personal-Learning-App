import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const outputSchema = z.object({
  key_points: z.array(z.string()),
  themes: z.array(z.string()),
  insights: z.array(z.object({
    insight: z.string(),
    confidence: z.number(),
    supporting_evidence: z.string(),
  })),
});

export class ContentProcessor {
  private model: ChatOpenAI;
  private parser: StructuredOutputParser<typeof outputSchema>;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      maxRetries: 3,
    });

    this.parser = StructuredOutputParser.fromZodSchema<typeof outputSchema>(outputSchema);
  }

  async processContent(content: string, style: string) {
    const prompt = new PromptTemplate({
      template: `
        Analyze the following content in a {style} style and provide:
        1. Key points
        2. Main themes
        3. Critical insights with confidence levels

        Content: {content}

        {format_instructions}
      `,
      inputVariables: ['content', 'style'],
      partialVariables: {
        format_instructions: this.parser.getFormatInstructions(),
      },
    });

    const chain = new LLMChain({
      llm: this.model,
      prompt,
      outputParser: this.parser,
    });

    try {
      const result = await chain.call({
        content,
        style,
      });

      return result.text;
    } catch (error) {
      console.error('LangChain processing error:', error);
      throw new Error('Failed to process content');
    }
  }
} 