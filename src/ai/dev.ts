'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-exam-questions.ts';
import '@/ai/flows/analyze-exam-patterns.ts';
import '@/ai/flows/solve-question.ts';
import '@/ai/flows/generate-audio-explanation.ts';
import '@/ai/flows/generate-question-image.ts';
