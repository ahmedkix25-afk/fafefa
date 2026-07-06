export interface ImageSettings {
  upscaleFactor: 2 | 4;
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  sharpness: number; // 0 to 100
  denoise: number; // 0 to 100
  faceEnhance: boolean;
  autoBalance: boolean;
}

export interface AdConfiguration {
  publisherId: string;
  topBannerSlot: string;
  sidebarSlot: string;
  nativeSlot: string;
  stickySlot: string;
  showCustomAds: boolean;
  customAdUrl: string;
  customAdImage: string;
  adFrequencyMultiplier: number;
}

export interface AdStats {
  pageViews: number;
  impressions: number;
  clicks: number;
  estimatedEarnings: number; // in USD
}

export interface ProcessedHistoryItem {
  id: string;
  name: string;
  originalSize: string;
  processedSize: string;
  originalResolution: string;
  processedResolution: string;
  timestamp: string;
}
