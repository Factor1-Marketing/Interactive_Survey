import { Answer, WordCloudData } from './types.js';

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}

// Normalize text for comparison
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

// Calculate similarity score (0-1)
function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeText(str1);
  const normalized2 = normalizeText(str2);

  // Exact match
  if (normalized1 === normalized2) {
    return 1.0;
  }

  // Check if one contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return 0.8;
  }

  // Levenshtein distance similarity
  const maxLen = Math.max(normalized1.length, normalized2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(normalized1, normalized2);
  const similarity = 1 - distance / maxLen;

  // Threshold for grouping
  return similarity;
}

// Basic semantic grouping keywords
const semanticGroups: { [key: string]: string[] } = {
  positive: ['happy', 'joy', 'glad', 'pleased', 'delighted', 'excited', 'great', 'good', 'wonderful', 'excellent', 'amazing', 'fantastic'],
  negative: ['sad', 'unhappy', 'angry', 'frustrated', 'disappointed', 'bad', 'terrible', 'awful', 'horrible'],
  neutral: ['okay', 'fine', 'alright', 'average', 'normal', 'decent']
};

function findSemanticGroup(text: string): string | null {
  const normalized = normalizeText(text);
  for (const [group, keywords] of Object.entries(semanticGroups)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return group;
    }
  }
  return null;
}

// Group similar answers
export function groupSimilarAnswers(answers: Answer[]): WordCloudData[] {
  if (answers.length === 0) return [];

  const groups: Map<string, { text: string; count: number }> = new Map();
  const processed = new Set<number>();

  // First pass: exact matches and high similarity
  for (let i = 0; i < answers.length; i++) {
    if (processed.has(i)) continue;

    const answer = answers[i];
    const normalized = normalizeText(answer.answerText);
    let foundGroup = false;

    // Check against existing groups
    for (const [key, group] of groups.entries()) {
      const similarity = calculateSimilarity(answer.answerText, group.text);
      if (similarity >= 0.7) {
        groups.set(key, { text: group.text, count: group.count + 1 });
        processed.add(i);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      // Check semantic grouping
      const semanticGroup = findSemanticGroup(answer.answerText);
      if (semanticGroup) {
        const groupKey = `semantic_${semanticGroup}`;
        if (groups.has(groupKey)) {
          const existing = groups.get(groupKey)!;
          groups.set(groupKey, { text: existing.text, count: existing.count + 1 });
        } else {
          groups.set(groupKey, { text: answer.answerText, count: 1 });
        }
        processed.add(i);
        continue;
      }

      // Create new group
      groups.set(`group_${i}`, { text: answer.answerText, count: 1 });
      processed.add(i);
    }
  }

  // Second pass: group remaining answers with lower similarity threshold
  for (let i = 0; i < answers.length; i++) {
    if (processed.has(i)) continue;

    const answer = answers[i];
    let foundGroup = false;

    for (const [key, group] of groups.entries()) {
      if (key.startsWith('semantic_')) continue; // Skip semantic groups in second pass
      
      const similarity = calculateSimilarity(answer.answerText, group.text);
      if (similarity >= 0.5) {
        groups.set(key, { text: group.text, count: group.count + 1 });
        processed.add(i);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.set(`group_${i}`, { text: answer.answerText, count: 1 });
      processed.add(i);
    }
  }

  // Convert to array and sort by count (descending)
  const result: WordCloudData[] = Array.from(groups.values())
    .map(group => ({
      text: group.text,
      value: group.count
    }))
    .sort((a, b) => b.value - a.value);

  return result;
}

