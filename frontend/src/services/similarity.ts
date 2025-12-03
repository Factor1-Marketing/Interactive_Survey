import { WordCloudData } from './api';

// This is a client-side helper for processing word cloud data
// The main similarity grouping happens on the backend
export function processWordCloudData(data: WordCloudData[]): WordCloudData[] {
  // Sort by value (frequency) descending
  return data.sort((a, b) => b.value - a.value);
}

