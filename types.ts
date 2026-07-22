export type Gender = 'el' | 'la';

export type Language = 'hy' | 'ru';

export interface SpanishWord {
  id: string;
  word: string;
  gender: Gender;
  translationHy: string;
  translationRu: string;
  category: 'regular' | 'exception' | 'suffix_rule' | 'dual_gender' | 'special_phonetic';
  ruleExplanationHy: string;
  ruleExplanationRu: string;
  exampleSentence: string;
  sentenceTranslationHy: string;
  sentenceTranslationRu: string;
}

export interface WordPair {
  id: string;
  masculine: string;
  masculineMeaningHy: string;
  masculineMeaningRu: string;
  feminine: string;
  feminineMeaningHy: string;
  feminineMeaningRu: string;
}

export interface SentenceQuestion {
  id: string;
  sentenceWithBlank: string; // e.g. "___ problema es muy difícil."
  correctArticle: string; // e.g. "El"
  options: string[]; // e.g. ["El", "La", "Los", "Las"]
  adjectiveQuestion?: {
    sentenceWithBlank: string; // e.g. "El agua está ___ (fresco/fresca)."
    correctAdjective: string; // "fresca"
    options: string[];
  };
  explanationHy: string;
  explanationRu: string;
  fullSpanishSentence: string;
  sentenceHy: string;
  sentenceRu: string;
}

export interface BossQuestion {
  id: string;
  questionSpanish: string;
  questionHy: string;
  questionRu: string;
  options: string[];
  correctIndex: number;
  explanationHy: string;
  explanationRu: string;
  category: string;
}

export interface UserStats {
  sortingScore: number;
  detectiveScore: number;
  transformerScore: number;
  sentenceScore: number;
  bossLevel: number;
  totalXP: number;
  streakDays: number;
  unlockedBadges: string[];
}
