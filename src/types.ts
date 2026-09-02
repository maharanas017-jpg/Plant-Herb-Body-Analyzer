export type Language = 'hindi' | 'hinglish' | 'english';
export type AnalysisMode = 'plant' | 'body';

export interface AnalysisResult {
  category: 'Plant/Herb' | 'Plant Disease' | 'Human Body Issue' | 'Other/Unknown';
  commonName: string;
  scientificName: string; // Or medical term if human body mode
  localNames: string; // Popular local names or symptom synonyms
  description: string;
  originOrCause: string; // Pathology or causes/triggers
  treatmentOrCure: string; // Treatment, natural remedies, first-aid, or precautions
  usageOrCare: string; // Detailed instructions, care routine, or when to visit a doctor
  funFact: string; // A healthy tip, interesting biological/medical fact, or wellness trivia
  confidenceScore: number;
}

export interface SavedScan {
  id: string;
  timestamp: string;
  image: string; // Base64 data URL
  result: AnalysisResult;
  language: Language;
  mode: AnalysisMode;
}
