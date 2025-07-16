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
import { GenerateExamQuestionsInputSchema, type GenerateExamQuestionsInput, GenerateExamQuestionsOutputSchema, type GenerateExamQuestionsOutput } from '@/types/exam-types';


export async function generateExamQuestions(
  input: GenerateExamQuestionsInput
): Promise<GenerateExamQuestionsOutput> {
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
  prompt: `You are an expert exam question generator. Your task is to create a full mock exam paper for a future year based on an analysis of past papers.

Subject: {{{subject}}}
Target Year: {{{year}}}
Past Paper Analysis Summary:
{{{patternSummary}}}

Instructions:
1.  Generate exactly 40 unique multiple-choice exam questions that mimic the structure, style, and difficulty typically found in the past papers.
2.  For each question, provide exactly 4 multiple-choice options and indicate the correct answer. The options must be distinct and plausible.
3.  If a question requires a diagram or image, create a concise description for an AI image generator in the 'imageDescription' field. For example: "A diagram of the human heart with labels for the four chambers". Also, include a placeholder in the question text, like "[Image of the human heart]".
4.  For each question, indicate if it's purely AI-generated or based on a past paper style.
5.  Provide a 'highlightedQuestion' version where AI-generated parts are in bold markdown.
6.  Crucially, the 'question' and 'highlightedQuestion' fields must NOT contain the multiple-choice options. The options should only be in the 'options' array.

Output exactly 40 questions in the specified JSON format.`,
});

const generateExamQuestionsFlow = ai.defineFlow(
  {
    name: 'generateExamQuestionsFlow',
    inputSchema: GenerateExamQuestionsInputSchema,
    outputSchema: GenerateExamQuestionsOutputSchema,
  },
  async (input) => {
    const {output: generated} = await generateExamQuestionsPrompt(input);
    if (!generated) {
      throw new Error('Failed to generate questions');
    }

    // Filter out malformed questions
    const validQuestions = generated.questions.filter(q => {
        const hasFourOptions = q.options && q.options.length === 4 && q.options.every(opt => typeof opt === 'string' && opt.trim() !== '');
        const isCorrectAnswerValid = hasFourOptions && q.options.includes(q.correctAnswer);
        return hasFourOptions && isCorrectAnswerValid;
    });

    const imageGenerationPromises = validQuestions.map(async (question) => {
      if (question.imageDescription) {
        try {
          const {media} = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate a clear, simple, educational diagram for an exam question. Description: ${question.imageDescription}`,
            config: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          });
          return {
            ...question,
            imageDataUri: media.url,
          };
        } catch (e) {
          console.error('Image generation failed for:', question.imageDescription, e);
          // Return the question without an image if generation fails
          return question;
        }
      }
      return question;
    });

    const questionsWithImages = await Promise.all(imageGenerationPromises);

    return {questions: questionsWithImages};
  }
);
