import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Types ---
export type StoredImage = {
  uri: string;
  uuid?: string;
  category?: string;
  subcategory?: string;
  categories?: string[]; // legacy or multi-category support
  analysis?: { labels?: string[]; text?: string };
  processed?: string;
  edge?: string;
  segment?: string;
  chatbotEligible?: boolean;
  analytics?: {
    date?: string;
    time?: string;
    location?: string;
  };
  originalImageUrl?: string;
  originalImgUri?: string;
  image_url?: string;
  processedImageUrl?: string;
  segmentedImageUrl?: string;
  // ...add any other fields you use
};

type FileContextType = {
  files: StoredImage[];
  addFile: (file: StoredImage) => Promise<void>;
  deleteFile: (uri: string) => Promise<void>;
  moveFile: (uri: string, categories: string[]) => Promise<void>;
  duplicateFile: (uri: string, categories: string[]) => Promise<void>;
  refreshFiles: () => Promise<void>;
  clearAllFiles: () => Promise<void>;
  autoCategorizeFiles: () => Promise<void>;
};

export const FileContext = createContext<FileContextType | undefined>(undefined);

const STORAGE_KEY = 'momento_files_v4';

// Helper: Check if image is eligible for chatbot
function isChatbotEligible(file: StoredImage): boolean {
  const forbiddenCategories = ['Financial', 'Personal', 'Nudity'];
  const forbiddenLabels = ['money', 'credit card', 'bank', 'nude', 'nudity', 'selfie', 'id', 'passport'];
  if (forbiddenCategories.includes(file.category || '')) return false;
  if (file.analysis?.labels) {
    for (const label of file.analysis.labels) {
      if (forbiddenLabels.includes(label.toLowerCase())) return false;
    }
  }
  // Check metadata.descriptive.labels if present
  if ((file as any).metadata?.descriptive?.labels) {
    for (const label of (file as any).metadata.descriptive.labels) {
      if (forbiddenLabels.includes(label.toLowerCase())) return false;
    }
  }
  return true;
}

// Expanded CATEGORY_KEYWORDS
const CATEGORY_KEYWORDS = {
  People: ['person', 'face', 'smile', 'selfie', 'portrait', 'human', 'happiness'],
  Contacts_IDs: ['contact', 'business card', 'id', 'identification', 'passport', 'license'],
  Animals: ['cat', 'dog', 'animal', 'pet', 'bird', 'fish', 'whiskers', 'fur'],
  Screenshots: ['screenshot', 'icon', 'symbol', 'graphics', 'screen', 'transaction', 'wallet'],
  Nature: ['nature', 'landscape', 'tree', 'sky', 'weather', 'outdoors', 'waterfall', 'summer'],
  Travel: ['vacation', 'travel', 'trip', 'city', 'new york', 'street', 'transportation'],
  Products: ['product', 'item', 'purchase', 'receipt', 'invoice', 'wishlist', 'shipping', 'coupon', 'cart', 'amazon', 'etsy'],
  Documents: ['document', 'pdf', 'note', 'work', 'school', 'info', 'communication', 'resume', 'meeting', 'project', 'company', 'directory', 'lecture', 'study', 'guide', 'timetable', 'textbook'],
  Education: ['timetable', 'lecture', 'notes', 'textbook', 'study guide', 'exam', 'assignment'],
  Professional: ['meeting', 'project', 'plan', 'company', 'directory', 'resume', 'business', 'report'],
  Art: ['art', 'drawing', 'sketch', 'illustration', 'creative', 'architecture', 'diy', 'craft', 'project', 'supply', 'instructions'],
  DIY_Crafts: ['diy', 'craft', 'project', 'supply', 'instructions', 'finished'],
  Food: ['food', 'meal', 'recipe', 'dinner', 'lunch', 'breakfast', 'nutrition', 'ingredient', 'cooking'],
  Health_Fitness: ['health', 'fitness', 'wellness', 'medical', 'prescription', 'appointment', 'workout', 'routine', 'progress', 'running', 'map', 'symptom', 'diagnosis', 'vitals', 'test', 'result', 'doctor', 'notes'],
  Wellness: ['medical', 'prescription', 'appointment', 'wellness'],
  Fitness: ['workout', 'routine', 'nutrition', 'progress', 'running', 'map'],
  Health_Information: ['symptom', 'diagnosis', 'vitals', 'test', 'result', 'doctor', 'notes'],
  Financial_Commerce: ['financial', 'commerce', 'transaction', 'receipt', 'invoice', 'bank', 'statement', 'investment', 'stock', 'crypto', 'wallet', 'payment', 'confirmation', 'wire', 'transfer', 'account', 'product', 'shipping', 'wishlist', 'coupon'],
  Transactions: ['receipt', 'invoice', 'payment', 'confirmation'],
  Banking: ['bank', 'statement', 'wire', 'transfer', 'account'],
  Investments: ['investment', 'stock', 'chart', 'crypto', 'wallet', 'statement'],
  Commerce: ['product', 'shipping', 'wishlist', 'coupon', 'code'],
  Memes: ['meme', 'humor', 'funny', 'joke', 'viral', 'tweet', 'instagram', 'social', 'content', 'share'],
  Credentials: ['password', 'login', 'account', 'recovery', 'question', 'credential'],
  Technical_Help: ['technical', 'help', 'troubleshooting', 'tutorial', 'ui', 'ux', 'system', 'settings', 'device', 'configuration', 'software', 'update', 'error'],
  System_Settings: ['system', 'settings', 'device', 'account', 'configuration', 'software', 'update', 'error'],
  Uncategorized: []
};

function matchCategory(text: string): string {
  const lowerText = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lowerText.includes(kw)) return cat;
    }
  }
  return 'Uncategorized';
}



/**
 * Provides file management context for images and related metadata.
 * Handles add, delete, move, duplicate, refresh, clear, and auto-categorize operations.
 * Wrap your app in this provider to access file management features via useFiles().
 * @param children - React children components.
 */
export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<StoredImage[]>([]);
  
    // Auto-categorize files using setFiles in scope
    const autoCategorizeFiles = async () => {
      setFiles((prevFiles: StoredImage[]) => {
        const updated = prevFiles.map((f: StoredImage) => {
          // Prefer explicit category from metadata if available
          let explicitCategory = (f as any).metadata?.technical?.originalImgUri?.split('/')[3] || f.category;
          let allText = '';
          if (f.analysis?.labels) allText += f.analysis.labels.join(' ');
          if (f.analysis?.text) allText += ' ' + f.analysis.text;
          if (f.subcategory) allText += ' ' + f.subcategory;
          if ((f as any).metadata?.descriptive?.labels) allText += ' ' + (f as any).metadata.descriptive.labels.join(' ');
          if ((f as any).metadata?.descriptive?.text) allText += ' ' + (f as any).metadata.descriptive.text;
          if ((f as any).metadata?.descriptive?.yoloObjects) allText += ' ' + (f as any).metadata.descriptive.yoloObjects.join(' ');
          // Try to match category
          const matchedCat = explicitCategory && explicitCategory !== 'Uncategorized'
            ? explicitCategory
            : matchCategory(allText);
          return {
            ...f,
            category: matchedCat,
            categories: [matchedCat],
            chatbotEligible: isChatbotEligible({ ...f, category: matchedCat }),
          };
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('momento_files_updated'));
        }
        return updated;
      });
    };

  // Load files from AsyncStorage
  const loadFiles = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFiles(JSON.parse(stored));
      } else {
        setFiles([]);
      }
    } catch (e) {
      setFiles([]);
    }
  };

  // Listen for custom event to refresh files
  useEffect(() => {
    loadFiles();
    const handler = () => loadFiles();
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('momento_files_updated', handler);
      return () => window.removeEventListener('momento_files_updated', handler);
    }
  }, []);

  // Add a new file (prevent duplicate URIs)
  const addFile = async (file: StoredImage) => {
    setFiles(prevFiles => {
      const filtered = prevFiles.filter(f => f.uri !== file.uri);
      const taggedFile = { ...file, chatbotEligible: isChatbotEligible(file) };
      const updated = [...filtered, taggedFile];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('momento_files_updated'));
      }
      return updated;
    });
  };

  // Delete a file by uri
  const deleteFile = async (uri: string) => {
    setFiles(prevFiles => {
      const updated = prevFiles.filter(f => f.uri !== uri);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('momento_files_updated'));
      }
      return updated;
    });
  };

  // Move a file to new categories (and update category/subcategory)
  const moveFile = async (uri: string, categories: string[]) => {
    setFiles(prevFiles => {
      const updated = prevFiles.map(f => {
        if (f.uri === uri) {
          const updatedFile = {
            ...f,
            category: categories[0],
            subcategory: categories[1] || undefined,
            categories,
          };
          return { ...updatedFile, chatbotEligible: isChatbotEligible(updatedFile) };
        } else {
          return f;
        }
      });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('momento_files_updated'));
      }
      return updated;
    });
  };

  // Duplicate a file (with new categories)
  const duplicateFile = async (uri: string, categories: string[]) => {
    setFiles(prevFiles => {
      const original = prevFiles.find(f => f.uri === uri);
      if (!original) {
        return prevFiles;
      }
      const duplicate: StoredImage = {
        ...original,
        uri: original.uri + '_copy_' + Date.now(),
        category: categories[0],
        subcategory: categories[1] || undefined,
        categories,
      };
      const taggedDuplicate = { ...duplicate, chatbotEligible: isChatbotEligible(duplicate) };
      const updated = [...prevFiles, taggedDuplicate];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('momento_files_updated'));
      }
      return updated;
    });
  };

  // Manual refresh
  const refreshFiles = async () => {
    await loadFiles();
  };

  // Clear all files and metadata
  const clearAllFiles = async () => {
    setFiles([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('momento_files_updated'));
    }
  };

  return (
    <FileContext.Provider value={{ files, addFile, deleteFile, moveFile, duplicateFile, refreshFiles, clearAllFiles, autoCategorizeFiles }}>
      {children}
    </FileContext.Provider>
  );
}

// Custom hook
/**
 * Custom hook to access file management context.
 * Must be used within a FileProvider.
 * @returns FileContextType with file management methods and state.
 */
export function useFiles() {
  const ctx = useContext(FileContext);
  if (!ctx) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return ctx;
}