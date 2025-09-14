// Handles category detection and mapping
export function getCategory(labels: string[], text: string): string {
  // Example mapping logic
  const CATEGORY_KEYWORDS: { [cat: string]: string[] } = {
    'Animals': ['dog', 'cat', 'animal', 'pet', 'wildlife'],
    'People': ['person', 'face', 'smile', 'selfie', 'portrait', 'human', 'happiness'],
    // ...add more categories
  };
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (labels.some(label => keywords.includes(label.toLowerCase())) || keywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return cat;
    }
  }
  return 'Uncategorized';
}
