export interface Question {
  question: string;
  answers: string[];
  correct: string;
}

export interface Session {
  id: string;
  timestamp: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  score: number;
  isTest: boolean;
  questionIds: number[]; // Store indices of questions for this session
  answeredQuestions: number[];
  completed: boolean;
}
