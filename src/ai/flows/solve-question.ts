
'use server';
/**
 * @fileOverview A flow for solving an exam question and providing a text and audio explanation.
 *
 * - solveQuestion - A function that provides a detailed solution to a question.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';
import { SolveQuestionInputSchema, type SolveQuestionInput, SolveQuestionOutputSchema, type SolveQuestionOutput } from '@/types/exam-types';


// Define the main exported function
export async function solveQuestion(input: SolveQuestionInput): Promise<SolveQuestionOutput> {
  return solveQuestionFlow(input);
}

// Define the text explanation prompt
const explanationPrompt = ai.definePrompt({
    name: 'solveQuestionExplanationPrompt',
    input: { schema: SolveQuestionInputSchema },
    output: { schema: z.object({ explanation: SolveQuestionOutputSchema.shape.explanation, correctAnswer: SolveQuestionOutputSchema.shape.correctAnswer }) },
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

// Helper function to convert PCM audio buffer to WAV base64 string
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


// Define the main flow
const solveQuestionFlow = ai.defineFlow(
  {
    name: 'solveQuestionFlow',
    inputSchema: SolveQuestionInputSchema,
    outputSchema: SolveQuestionOutputSchema,
  },
  async (input) => {
    // Generate the text explanation first
    const { output: explanationOutput } = await explanationPrompt(input);
    if (!explanationOutput) {
        throw new Error("Failed to generate a text explanation.");
    }

    const { explanation, correctAnswer } = explanationOutput;

    // Generate the audio explanation from the text explanation
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: explanation.replace(/\*\*/g, ''), // Remove markdown for cleaner speech
    });

    if (!media?.url) {
      throw new Error('Failed to generate audio explanation.');
    }
    
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      explanation,
      correctAnswer,
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
