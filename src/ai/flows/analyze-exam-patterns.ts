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
import pdf from 'pdf-parse/lib/pdf-parse.js';

const AnalyzeExamPatternsInputSchema = z.object({
  examPaperUris: z
    .array(z.string())
    .describe(
      "An array of past exam papers, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
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
  startYear: z.number().optional().describe('The earliest year detected from the exam papers.'),
  endYear: z.number().optional().describe('The latest year detected from the exam papers.'),
});
export type AnalyzeExamPatternsOutput = z.infer<typeof AnalyzeExamPatternsOutputSchema>;

async function extractTextFromPdfs(dataUris: string[]): Promise<string> {
    let combinedText = '';
    for (const dataUri of dataUris) {
        const base64Data = dataUri.split(',')[1];
        if (base64Data) {
            const pdfBuffer = Buffer.from(base64Data, 'base64');
            const data = await pdf(pdfBuffer);
            combinedText += data.text + '\n\n--- End of Document ---\n\n';
        }
    }
    return combinedText;
}

export async function analyzeExamPatterns(input: AnalyzeExamPatternsInput): Promise<AnalyzeExamPatternsOutput> {
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
  output: {schema: AnalyzeExamPatternsOutputSchema},
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
    outputSchema: AnalyzeExamPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
