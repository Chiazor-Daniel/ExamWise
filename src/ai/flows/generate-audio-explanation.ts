'use server';

/**
 * @fileOverview A flow for generating an audio explanation from text.
 * - generateAudioExplanation - A function that handles the text-to-speech process.
 */

import { audioGenAI as ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';
import {
  GenerateAudioInputSchema,
  GenerateAudioOutputSchema,
  type GenerateAudioInput,
} from '@/types/exam-types';
import { keyRotation } from '@/ai/key-rotation';

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
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

// Public function you call
export async function generateAudioExplanation(input: GenerateAudioInput) {
  return generateAudioExplanationFlow(input);
}

// Flow definition with retry + key rotation
const generateAudioExplanationFlow = ai.defineFlow(
  {
    name: 'generateAudioExplanationFlow',
    inputSchema: GenerateAudioInputSchema,
    outputSchema: GenerateAudioOutputSchema,
  },
  async ({ explanation }) => {
    const maxRetries = keyRotation.getKeyCount();
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        const currentKey = keyRotation.getCurrentKey();

        const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            apiKey: currentKey,
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Algenib' },
              },
            },
          },
          // Strip markdown to avoid speech errors
          prompt: explanation.replace(/\*\*/g, '').replace(/__/g, ''),
        });

        if (!media?.url) {
          throw new Error(
            'Failed to generate audio explanation. The AI model did not return any media.'
          );
        }

        // Convert base64 URL → buffer → WAV
        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        const wavBase64 = await toWav(audioBuffer);

        return {
          audioDataUri: 'data:audio/wav;base64,' + wavBase64,
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`Error with API key ${retryCount + 1}:`, err);

        if (
          err instanceof Error &&
          'status' in err &&
          (err as any).status === 429
        ) {
          keyRotation.rotateOnError();
          retryCount++;
          continue;
        }

        throw lastError;
      }
    }

    throw new Error(
      `Failed to generate audio after trying ${maxRetries} API keys. Last error: ${
        lastError?.message || 'Unknown error'
      }`
    );
  }
);
