import { Summary } from '@/lib/types';
import { openai } from '@/lib/api/openai';

export async function calculateSimilarity(summary1: Summary, summary2: Summary): Promise<number> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: [
      `${summary1.title} ${summary1.content}`,
      `${summary2.title} ${summary2.content}`
    ],
  });

  const [embedding1, embedding2] = response.data.map(item => item.embedding);
  return cosineSimilarity(embedding1, embedding2);
}

function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (norm1 * norm2);
}

export async function findRelatedSummaries(
  currentSummary: Summary,
  allSummaries: Summary[],
  limit: number = 3
): Promise<Summary[]> {
  const otherSummaries = allSummaries.filter(s => s.id !== currentSummary.id);
  const similarities = await Promise.all(
    otherSummaries.map(async summary => ({
      summary,
      similarity: await calculateSimilarity(currentSummary, summary)
    }))
  );

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.summary);
} 