
'use server';
/**
 * @fileOverview A flow for generating an image for a single exam question.
 *
 * - generateImageForQuestion - A function that handles the image generation process.
 */

import { ai } from '@/ai/genkit';
import { GenerateQuestionImageInputSchema, GenerateQuestionImageOutputSchema, type GenerateQuestionImageInput, type GenerateQuestionImageOutput } from '@/types/exam-types';

export async function generateImageForQuestion(input: GenerateQuestionImageInput): Promise<GenerateQuestionImageOutput> {
  return generateQuestionImageFlow(input);
}

const generateQuestionImageFlow = ai.defineFlow(
  {
    name: 'generateQuestionImageFlow',
    inputSchema: GenerateQuestionImageInputSchema,
    outputSchema: GenerateQuestionImageOutputSchema,
  },
  async ({ imageDescription }) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a clear, simple, educational diagram for an exam question. The diagram should be minimalist and easy to understand in a test context. Description: ${imageDescription}`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media?.url) {
        throw new Error('AI model did not return an image.');
      }

      return {
        imageDataUri: media.url,
      };
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during image generation.';
        console.error('Image generation failed for:', imageDescription, e);
        throw new Error(`Failed to generate image: ${errorMessage}`);
    }
  }
);
