import { config } from 'dotenv';
config();

import '@/ai/flows/generate-exam-questions.ts';
import '@/ai/flows/analyze-exam-patterns.ts';
import '@/ai/flows/solve-question.ts';
