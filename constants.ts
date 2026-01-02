
import { Question } from './types';

export const SCREENING_QUESTIONS: Question[] = [
  {
    id: 'memory_1',
    category: 'cognitive',
    text: 'How often do you have trouble remembering recent events or conversations?',
    options: [
      { label: 'Never', value: 0 },
      { label: 'Rarely', value: 1 },
      { label: 'Frequently', value: 2 },
      { label: 'Almost Always', value: 3 }
    ]
  },
  {
    id: 'focus_1',
    category: 'cognitive',
    text: 'Do you find it difficult to concentrate on tasks like reading a book or watching a movie?',
    options: [
      { label: 'Not at all', value: 0 },
      { label: 'A little bit', value: 1 },
      { label: 'Moderately', value: 2 },
      { label: 'Severely', value: 3 }
    ]
  },
  {
    id: 'motor_1',
    category: 'physical',
    text: 'Have you noticed any involuntary shaking or tremors in your hands or fingers?',
    options: [
      { label: 'No', value: 0 },
      { label: 'Slightly', value: 1 },
      { label: 'Noticeably', value: 2 },
      { label: 'Significantly', value: 3 }
    ]
  }
];

export const STROOP_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' }
];

export const ROUND_TITLES: Record<string, string> = {
  QUESTIONNAIRE: "1. Cognitive Self-Report",
  GAME_REACTION: "2. Motor Speed",
  GAME_MEMORY: "3. Pattern Recall",
  GAME_STROOP: "4. Cognitive Control",
  GAME_SEQUENCING: "5. Visuospatial Planning"
};
