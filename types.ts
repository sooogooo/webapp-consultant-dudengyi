// Feature Navigation
export type AppFeature = 'design' | 'xiaoqian' | 'knowledge' | 'cases';

// Settings Types
export type ThemeName = 'default' | 'mint' | 'peach' | 'lavender';
export type FontSize = 'sm' | 'md' | 'lg';
export type AIPersonality = 'playful' | 'serious' | 'enthusiastic';
export type AIVerbosity = 'concise' | 'detailed' | 'medical';

export interface AppSettings {
  theme: ThemeName;
  fontSize: FontSize;
  aiPersonality: AIPersonality;
  aiVerbosity: AIVerbosity;
}

export interface PhotoQuality {
  passed: boolean;
  message: string;
}

export interface Photo {
  id: string; // Unique ID for the photo
  pose: string; // e.g., '正面照', '补充照片'
  url: string; // Object URL for preview
  base64: string; // Base64 data for API calls
  mimeType: string; // Mime type of the image
  quality: PhotoQuality | null; // null while checking, then holds the result
}

export interface Problem {
  id: string;
  category: string;
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  id?: string; // Optional unique ID for React keys
}

export interface AISummary {
  redFlags: string[];
  suggestedProjectCards: string[];
  nextSteps: string[];
}

export interface SessionData {
  photos: Photo[];
  problems: Problem[];
  chatHistory: ChatMessage[];
  summary: AISummary | null;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  keywords: string[];
}

export interface KnowledgeCard {
    id: string;
    title: string;
    description: string;
}

export interface CaseImage {
    id:string;
    url: string;
    description: string;
}

// Onboarding/Tour types
export interface TourStep {
  selector?: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}