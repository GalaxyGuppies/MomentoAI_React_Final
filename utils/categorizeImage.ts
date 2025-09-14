import taxonomy from '../merged_taxonomy.json';

// Flatten all keywords for fast lookup
function getAllKeywords() {
  const keywords: { [keyword: string]: string } = {};
  Object.entries(taxonomy).forEach(([category, subcats]) => {
    Object.entries(subcats).forEach(([subcat, values]) => {
      if (Array.isArray(values)) {
        values.forEach((kw: string) => {
          keywords[kw.toLowerCase()] = category;
        });
      }
    });
  });
  return keywords;
}

const keywordMap = getAllKeywords();

/**
 * Categorize an image based on extracted text, labels, and taxonomy keywords.
 * Returns the best matching category or 'Uncategorized'.
 */
export function categorizeImage({ labels = [], text = '' }: { labels?: string[]; text?: string }): string {
  const allText = [...labels, text].join(' ').toLowerCase();
  for (const kw in keywordMap) {
    if (allText.includes(kw)) {
      return keywordMap[kw];
    }
  }
  return 'Uncategorized';
}