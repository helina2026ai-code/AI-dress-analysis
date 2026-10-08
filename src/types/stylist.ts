export interface MetricScore {
  score: number;
  critique: string;
}

export interface Metrics {
  colorHarmony: MetricScore;
  silhouetteProportions: MetricScore;
  occasionFit: MetricScore;
  trendiness: MetricScore;
  detailAccessories: MetricScore;
  versatility: MetricScore;
}

export interface ColorSwatch {
  hex: string;
  name: string;
  role: 'Dominant' | 'Secondary' | 'Accent' | 'Neutral' | string;
  seasonSeason?: string;
}

export interface ClothingItem {
  item: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessory' | 'hair_makeup' | 'outerwear' | 'bag' | string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  status: 'great' | 'good' | 'needs_tuning' | string;
  feedback: string;
  upgradeTip: string;
}

export interface StylistAnalysis {
  overallScore: number;
  gradeLetter: string;
  styleArchetype: string;
  summaryVibe: string;
  spokenCritique: string;
  metrics: Metrics;
  colorPalette: ColorSwatch[];
  clothingItems: ClothingItem[];
  highlights: string[];
  tuningAdvice: string[];
  alternativePairing: string;
  fashionQuote: string;
  processedImage?: string;
}

export interface StylistPreset {
  id: string;
  name: string;
  style: string;
  occasion: string;
  thumbnail: string;
  description: string;
}
