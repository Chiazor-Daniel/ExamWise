
'use server';

/**
 * @fileOverview A flow for generating an audio explanation from text.
 * - generateAudioExplanation - A function that handles the text-to-speech process.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';
import { GenerateAudioInputSchema, GenerateAudioOutputSchema, type GenerateAudioInput } from '@/types/exam-types';

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

export async function generateAudioExplanation(input: GenerateAudioInput) {
    return generateAudioExplanationFlow(input);
}


const generateAudioExplanationFlow = ai.defineFlow(
    {
        name: 'generateAudioExplanationFlow',
        inputSchema: GenerateAudioInputSchema,
        outputSchema: GenerateAudioOutputSchema,
    },
    async ({ explanation }) => {
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
            // Remove markdown for cleaner speech, as it can cause errors.
            prompt: explanation.replace(/\*\*/g, '').replace(/__/g, ''), 
        });

        if (!media?.url) {
            throw new Error('Failed to generate audio explanation. The AI model did not return any media.');
        }

        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );
        const wavBase64 = await toWav(audioBuffer);

        return {
            audioDataUri: 'data:audio/wav;base64,' + wavBase64,
        };
    }
);
