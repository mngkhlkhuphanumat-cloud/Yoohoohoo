
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface GameState {
  isLearning: boolean;
  lastAnalysis: string;
  suggestedAction: string;
  capturedFrame: string | null;
}

export interface AnalysisResponse {
  learning: string;
  action: string;
  coaching_tip: string;
}
