'use server';

/**
 * @fileOverview An AI agent that analyzes past exam papers to identify frequently asked topics and question patterns.
 *
 * - analyzeExamPatterns - A function that handles the exam paper analysis process.
 * - AnalyzeExamPatternsInput - The input type for the analyzeExamPatterns function.
 */

import { analyzePatternAI as ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SubjectAnalysis } from '@/types/analysis-types';

// Dynamically import pdf-parse to avoid test file loading issues
const getPdfParser = async () => {
    const pdfParse = await import('pdf-parse/lib/pdf-parse.js');
    return pdfParse.default;
};

const AnalyzeExamPatternsInputSchema = z.object({
  examPaperUris: z
    .array(z.string())
    .describe(
      "An array of past exam papers, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  subject: z.string().describe('The subject of the exam papers being analyzed.'),
});
export type AnalyzeExamPatternsInput = z.infer<typeof AnalyzeExamPatternsInputSchema>;

// Use the SubjectAnalysis type defined in analysis-types.ts
import { SubjectAnalysisSchema } from '@/types/analysis-types';

async function extractTextFromPdfs(dataUris: string[]): Promise<string> {
    let combinedText = '';
    try {
        const pdfParser = await getPdfParser();
        for (const dataUri of dataUris) {
            const base64Data = dataUri.split(',')[1];
            if (base64Data) {
                const pdfBuffer = Buffer.from(base64Data, 'base64');
                const data = await pdfParser(pdfBuffer, {
                    // Disable page operations that might cause issues
                    pagerender: null,
                    // Maximum content length to process (100MB)
                    max: 100 * 1024 * 1024
                });
                combinedText += data.text + '\n\n--- End of Document ---\n\n';
            }
        }
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF content. Please ensure the file is a valid PDF.');
    }
    return combinedText;
}

export async function analyzeExamPatterns(input: AnalyzeExamPatternsInput): Promise<SubjectAnalysis> {
  const examPapersText = await extractTextFromPdfs(input.examPaperUris);
  const flowInput = {
    subject: input.subject,
    examPapers: examPapersText,
  };
  return analyzeExamPatternsFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'analyzeExamPatternsPrompt',
  input: {schema: z.object({
      examPapers: z.string(),
      subject: z.string(),
  })},
  output: {schema: SubjectAnalysisSchema},
  prompt: `You are an expert exam paper analyst.

You will analyze past exam papers to identify frequently asked topics, question patterns, and the years the papers are from.

Subject: {{{subject}}}
Exam Papers Content:
{{{examPapers}}}

Analyze the exam papers and identify the following:

*   The start and end years of the provided exam papers.
*   Frequently asked topics.
*   Common question patterns.
*   An overall strategy for how to study for the exam based on your analysis.`,
});

const analyzeExamPatternsFlow = ai.defineFlow(
  {
    name: 'analyzeExamPatternsFlow',
    inputSchema: z.object({
        examPapers: z.string(),
        subject: z.string(),
    }),
    outputSchema: SubjectAnalysisSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
