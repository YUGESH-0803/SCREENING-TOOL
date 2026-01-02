
export enum Screen {
  ONBOARDING = 'ONBOARDING',
  QUESTIONNAIRE = 'QUESTIONNAIRE', // Round 1
  GAME_REACTION = 'GAME_REACTION', // Round 2
  GAME_MEMORY = 'GAME_MEMORY',     // Round 3
  GAME_STROOP = 'GAME_STROOP',     // Round 4
  GAME_SEQUENCING = 'GAME_SEQUENCING', // Round 5
  ANALYSIS = 'ANALYSIS',
  RESULTS = 'RESULTS'
}

export interface Question {
  id: string;
  text: string;
  options: { label: string; value: number }[];
  category: 'cognitive' | 'physical' | 'emotional';
}

export interface GameStats {
  averageReactionTime?: number;
  accuracy: number;
  stability?: number;
  memoryScore?: number;
  stroopInterference?: number;
  sequencingTime?: number;
}

export interface AssessmentData {
  questions: Record<string, number>;
  roundStats: Record<string, any>;
}

export interface AIAnalysis {
  summary: string;
  healthScore: number; // Score out of 100
  riskIndicators: string[];
  recommendations: string[];
}
