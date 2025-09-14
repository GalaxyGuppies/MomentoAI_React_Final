export interface ImageAnalytics {
  labels?: string[];
  objects?: string[];
  keywords?: string[];
  extractedText?: string;
  dates?: string[];
  times?: string[];
  expenses?: string[];
  sales?: string[];
  locations?: string[];
  [key: string]: any;
}

export interface StoredImage {
  uuid: string;
  uri: string;
  categories: string[];
  analysis?: any;
  detectedCategory?: string;
  processedImageUrl?: string | null;
  segmentedImageUrl?: string | null;
  originalImageUrl?: string | null;
  processed?: string | null;
  segment?: string | null;
  edge?: string | null;
  remoteUrl?: string | null;
  image_url?: string | null;
  subcategory?: string;
  analytics?: ImageAnalytics;
}

export interface Category {
  uuid: string;
  name: string;
  parentUuid?: string;
  children?: Category[];
  description?: string;
  color?: string;
  subcategories?: string[];
  password?: string; // Optional password for protection
  isLocked?: boolean; // UI flag for locked state
  // Add other properties as needed (e.g., color, description, etc.)
}
