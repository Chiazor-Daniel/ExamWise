
'use server';
/**
 * @fileOverview A flow for solving an exam question and providing a text explanation.
 *
 * - solveQuestion - A function that provides a detailed solution to a question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SolveQuestionInputSchema, type SolveQuestionInput, SolveQuestionOutputSchema, type SolveQuestionOutput } from '@/types/exam-types';


// Define the main exported function
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  return solveQuestionFlow(input);
}

// Define the text explanation prompt
const explanationPrompt = ai.definePrompt({
    name: 'solveQuestionExplanationPrompt',
    input: { schema: SolveQuestionInputSchema },
    output: { schema: SolveQuestionOutputSchema },
    prompt: `You are an expert tutor. Your task is to provide a clear, step-by-step explanation for the following multiple-choice question.

Question: {{{question}}}

Options:
{{#each options}}
- {{{this}}}
{{/each}}

The correct answer is: {{{correctAnswer}}}

Instructions:
1.  Start by restating the correct answer.
2.  Provide a detailed, logical, step-by-step explanation for why that answer is correct.
3.  If the question involves calculations, show each step clearly.
4.  If it's a conceptual question, explain the underlying principles.
5.  Keep the tone helpful and educational.
6.  Format your explanation using Markdown. Use bold for important keywords.
`
});

// Define the main flow
const solveQuestionFlow = ai.defineFlow(
  {
    name: 'solveQuestionFlow',
    inputSchema: SolveQuestionInputSchema,
    outputSchema: SolveQuestionOutputSchema,
  },
  async (input) => {
    // Generate the text explanation first
    const { output } = await explanationPrompt(input);
    if (!output) {
        throw new Error("Failed to generate a text explanation.");
    }
    return output;
  }
);
