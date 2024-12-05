import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  runtime: 'edge',
};

export async function generateWithFunctionCalling<T>(
  prompt: string,
  functionName: string,
  parameters: Record<string, any>
): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      functions: [
        {
          name: functionName,
          description: "Generate structured response",
          parameters,
        },
      ],
      function_call: { name: functionName },
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall?.arguments) {
      throw new Error('Failed to generate content: No function call response');
    }

    try {
      return JSON.parse(functionCall.arguments) as T;
    } catch (error) {
      throw new Error('Failed to parse function response');
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate content');
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  return response.data[0].embedding;
} 