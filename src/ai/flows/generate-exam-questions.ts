
'use server';

/**
 * @fileOverview A flow for generating realistic exam questions based on identified patterns and recurring topics.
 *
 * - generateExamQuestions - A function that handles the exam question generation process.
 * - GenerateExamQuestionsInput - The input type for the generateExamQuestions function.
 * - GenerateExamQuestionsOutput - The return type for the generateExamQuestions function.
 */

import {questionGenAI as ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateExamQuestionsInputSchema, type GenerateExamQuestionsInput, GenerateExamQuestionsOutputSchema, type GenerateExamQuestionsOutput, type GeneratedQuestion } from '@/types/exam-types';
import { generateImageForQuestion } from './generate-question-image';


const QUESTIONS_PER_BATCH = 10;

export async function generateExamQuestions(
  input: GenerateExamQuestionsInput & { batchSize?: number; batchNumber?: number; }
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
  prompt: `You are an expert examiner on a national examination board. Your task is to create a challenging, high-quality mock exam paper for a future year based on an analysis of past papers.

Subject: {{{subject}}}
Target Year: {{{year}}}
Difficulty Level: {{{difficulty}}}
Past Paper Analysis Summary:
{{{patternSummary}}}

Instructions:
1.  Generate exactly 40 unique multiple-choice exam questions that mimic the structure, style, and rigor of official examinations.
2.  The difficulty of the questions must strictly match the requested level: '{{{difficulty}}}'.
    - For 'Easy' difficulty, focus on foundational concepts and direct recall.
    - For 'Medium' difficulty, include a mix of conceptual questions and multi-step calculation problems.
    - For 'Hard' difficulty, create complex problems that require deep conceptual understanding and sophisticated calculations.
3.  **Crucially, for science subjects like Physics and Chemistry, ensure a significant number of questions are calculation-based, especially for Medium and Hard levels.** These should be challenging, multi-step problems.
4.  For each question, provide exactly 4 multiple-choice options. The incorrect options (distractors) must be plausible and based on common student errors. Indicate the single correct answer.
5.  If a question requires a diagram or image (e.g., circuits, organic compounds, diagrams), create a concise, clear description for an AI image generator in the 'imageDescription' field. For example: "A diagram of the human heart with labels for the four chambers". Also, include a placeholder in the question text, like "[Image of the human heart]". Do NOT generate the image itself.
6.  For each question, indicate if it's purely AI-generated or based on a past paper style.
7.  Provide a 'highlightedQuestion' version where AI-generated parts are in bold markdown.
8.  **The 'question' and 'highlightedQuestion' fields must NOT contain the multiple-choice options.** The options must only be in the 'options' array.

Output exactly 40 questions in the specified JSON format.`,
});

async function generateImagesInBatches(questions: GeneratedQuestion[]): Promise<GeneratedQuestion[]> {
    const questionsNeedingImages = questions.filter(q => q.imageDescription);
    const batchSize = 3; // Process 3 images at a time
    const results = [...questions];

    for (let i = 0; i < questionsNeedingImages.length; i += batchSize) {
        const batch = questionsNeedingImages.slice(i, i + batchSize);
        const imagePromises = batch.map(async (question) => {
            try {
                const imageResult = await generateImageForQuestion({ imageDescription: question.imageDescription! });
                const index = results.findIndex(q => q.question === question.question);
                if (index !== -1) {
                    results[index] = { ...results[index], imageDataUri: imageResult.imageDataUri };
                }
            } catch (error) {
                console.error(`Failed to generate image for question. Error: ${error}`);
                // Question remains without image if generation fails
            }
        });
        await Promise.all(imagePromises);
    }

    return results;
}


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

    const questionsWithImages = await generateImagesInBatches(validQuestions);

    return {questions: questionsWithImages};
  }
);
