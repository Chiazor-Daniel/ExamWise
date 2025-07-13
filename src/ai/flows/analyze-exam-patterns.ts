'use server';

/**
 * @fileOverview An AI agent that analyzes past exam papers to identify frequently asked topics and question patterns.
 *
 * - analyzeExamPatterns - A function that handles the exam paper analysis process.
 * - AnalyzeExamPatternsInput - The input type for the analyzeExamPatterns function.
 * - AnalyzeExamPatternsOutput - The return type for the analyzeExamPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeExamPatternsInputSchema = z.object({
  examPapers: z
    .string()
    .describe("The content of past exam papers, separated by newlines.  Should include the subject for each exam paper."),
  subject: z.string().describe('The subject of the exam papers being analyzed.'),
});
export type AnalyzeExamPatternsInput = z.infer<typeof AnalyzeExamPatternsInputSchema>;

const AnalyzeExamPatternsOutputSchema = z.object({
  frequentTopics: z
    .string()
    .describe('A list of frequently asked topics in the exam papers.'),
  questionPatterns: z
    .string()
    .describe('A description of common question patterns observed in the exam papers.'),
  overallStrategy: z
    .string()
    .describe('An overall strategy for how to study for the exam, based on the topics and patterns.'),
});
export type AnalyzeExamPatternsOutput = z.infer<typeof AnalyzeExamPatternsOutputSchema>;

export async function analyzeExamPatterns(input: AnalyzeExamPatternsInput): Promise<AnalyzeExamPatternsOutput> {
  return analyzeExamPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeExamPatternsPrompt',
  input: {schema: AnalyzeExamPatternsInputSchema},
  output: {schema: AnalyzeExamPatternsOutputSchema},
  prompt: `You are an expert exam paper analyst.

You will analyze past exam papers to identify frequently asked topics and question patterns.

Subject: {{{subject}}}
Exam Papers:
{{#each (split examPapers "\n")}}{{{this}}}\n{{/each}}

Analyze the exam papers and identify the following:

*   Frequently asked topics: {{frequentTopics}}
*   Question patterns: {{questionPatterns}}
*   Overall strategy for how to study for the exam: {{overallStrategy}}`,
});

const analyzeExamPatternsFlow = ai.defineFlow(
  {
    name: 'analyzeExamPatternsFlow',
    inputSchema: AnalyzeExamPatternsInputSchema,
    outputSchema: AnalyzeExamPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
