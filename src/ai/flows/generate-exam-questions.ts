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

const GeneratedQuestionSchema = z.object({
  question: z.string().describe('The generated exam question.'),
  isAiGenerated: z
    .boolean()
    .describe(
      'Whether the question is fully AI-generated or based on a past paper.'
    ),
  highlightedQuestion: z
    .string()
    .describe(
      'The exam question with AI-generated parts highlighted in bold markdown (`**text**`). Image placeholders should be included, e.g., `[Image of a physics diagram]`.'
    ),
  options: z.array(z.string()).describe('An array of multiple-choice options.'),
  correctAnswer: z.string().describe('The correct answer from the options.'),
  imageDescription: z
    .string()
    .optional()
    .describe(
      'A description of the image that should be generated for this question, if applicable.'
    ),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      'A data URI of the generated image for this question, if applicable.'
    ),
});

const GenerateExamQuestionsInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate questions.'),
  patternSummary: z
    .string()
    .describe(
      'A summary of identified patterns and recurring topics in past papers.'
    ),
  year: z.number().int().describe('The target year for the mock exam.'),
});

export type GenerateExamQuestionsInput = z.infer<
  typeof GenerateExamQuestionsInputSchema
>;

const GenerateExamQuestionsOutputSchema = z.object({
  questions: z
    .array(GeneratedQuestionSchema)
    .describe('An array of generated exam questions.'),
});

export type GenerateExamQuestionsOutput = z.infer<
  typeof GenerateExamQuestionsOutputSchema
>;

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
1.  Generate a full exam paper that mimics the structure, style, difficulty, and number of questions typically found in the past papers.
2.  For each question, provide 4 multiple-choice options and indicate the correct answer.
3.  If a question requires a diagram or image, create a concise description for an AI image generator in the 'imageDescription' field. For example: "A diagram of the human heart with labels for the four chambers". Also, include a placeholder in the question text, like "[Image of the human heart]".
4.  For each question, indicate if it's purely AI-generated or based on a past paper style.
5.  Provide a 'highlightedQuestion' version where AI-generated parts are in bold markdown.

Output the questions in the following JSON format:
{{$responseSchema}}`,
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

    const imageGenerationPromises = generated.questions.map(async (question) => {
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
