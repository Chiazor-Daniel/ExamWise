'use server';

/**
 * @fileOverview A flow for generating realistic exam questions based on identified patterns and recurring topics.
 *
 * - generateExamQuestions - A function that handles the exam question generation process.
 * - GenerateExamQuestionsInput - The input type for the generateExamQuestions function.
 * - GenerateExamQuestionsOutput - The return type for the generateExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExamQuestionsInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate questions.'),
  topic: z.string().describe('The specific topic within the subject.'),
  patternSummary: z.string().describe('A summary of identified patterns and recurring topics in past papers.'),
  numQuestions: z.number().int().min(1).max(10).default(3).describe('The number of questions to generate.'),
});

export type GenerateExamQuestionsInput = z.infer<typeof GenerateExamQuestionsInputSchema>;

const GeneratedQuestionSchema = z.object({
  question: z.string().describe('The generated exam question.'),
  isAiGenerated: z.boolean().describe('Whether the question is fully AI-generated or based on a past paper.'),
  highlightedQuestion: z.string().describe('The exam question with AI-generated parts highlighted in bold markdown (`**text**`).'),
});

const GenerateExamQuestionsOutputSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).describe('An array of generated exam questions.'),
});

export type GenerateExamQuestionsOutput = z.infer<typeof GenerateExamQuestionsOutputSchema>;

export async function generateExamQuestions(input: GenerateExamQuestionsInput): Promise<GenerateExamQuestionsOutput> {
  return generateExamQuestionsFlow(input);
}

const generateExamQuestionsPrompt = ai.definePrompt({
  name: 'generateExamQuestionsPrompt',
  input: {
    schema: GenerateExamQuestionsInputSchema,
  },
  output: {
    schema: GenerateExamQuestionsOutputSchema,
  },
  prompt: `You are an expert exam question generator. Based on the subject, topic, and identified patterns in past papers, generate realistic exam questions.

Subject: {{{subject}}}
Topic: {{{topic}}}
Pattern Summary: {{{patternSummary}}}
Number of Questions: {{{numQuestions}}}

Generate exam questions that are similar in style and difficulty to those found in past papers, considering the identified patterns. 
For each question, indicate whether it is fully AI-generated or based on a past paper.
Also, provide a version of the question where the AI-generated parts are highlighted in bold markdown. For example: "What is the **capital of France** and its **primary export**?".

Output the questions in the following JSON format:
{{$responseSchema}}`,
});

const generateExamQuestionsFlow = ai.defineFlow(
  {
    name: 'generateExamQuestionsFlow',
    inputSchema: GenerateExamQuestionsInputSchema,
    outputSchema: GenerateExamQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateExamQuestionsPrompt(input);
    return output!;
  }
);
