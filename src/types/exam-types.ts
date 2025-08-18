import { z } from 'zod';

// Types for solve-question flow
export const SolveQuestionInputSchema = z.object({
  question: z.string().describe('The exam question to be solved.'),
  options: z.array(z.string()).describe('The multiple-choice options for the question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});
export type SolveQuestionInput = z.infer<typeof SolveQuestionInputSchema>;

export const SolveQuestionOutputSchema = z.object({
  explanation: z.string().describe('A detailed, step-by-step explanation of how to arrive at the correct answer. Use Markdown for formatting, like bolding key terms.'),
  correctAnswer: z.string().describe('The correct answer option.'),
});
export type SolveQuestionOutput = z.infer<typeof SolveQuestionOutputSchema>;

// Types for generate-audio-explanation flow
export const GenerateAudioInputSchema = z.object({
  explanation: z.string().describe('The text to be converted to audio.'),
});
export type GenerateAudioInput = z.infer<typeof GenerateAudioInputSchema>;

export const GenerateAudioOutputSchema = z.object({
  audioDataUri: z.string().describe("A data URI of the explanation audio. Format: 'data:audio/wav;base64,<encoded_data>'"),
});
export type GenerateAudioOutput = z.infer<typeof GenerateAudioOutputSchema>;


// Types for generate-exam-questions flow
export const GeneratedQuestionSchema = z.object({
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
  options: z.array(z.string()).describe('An array of four multiple-choice options.'),
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
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;


export const GenerateExamQuestionsInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate questions.'),
  patternSummary: z
    .string()
    .describe(
      'A summary of identified patterns and recurring topics in past papers.'
    ),
  year: z.number().int().describe('The target year for the mock exam.'),
  difficulty: z.string().describe('The difficulty level for the questions (e.g., Easy, Medium, Hard).'),
});
export type GenerateExamQuestionsInput = z.infer<
  typeof GenerateExamQuestionsInputSchema
>;

export const GenerateExamQuestionsOutputSchema = z.object({
  questions: z
    .array(GeneratedQuestionSchema)
    .describe('An array of generated exam questions.'),
});
export type GenerateExamQuestionsOutput = z.infer<
  typeof GenerateExamQuestionsOutputSchema
>;

// Types for generate-question-image flow
export const GenerateQuestionImageInputSchema = z.object({
    imageDescription: z.string().describe("A concise description of the educational diagram to generate."),
});
export type GenerateQuestionImageInput = z.infer<typeof GenerateQuestionImageInputSchema>;

export const GenerateQuestionImageOutputSchema = z.object({
    imageDataUri: z.string().describe("A data URI of the generated image. Format: 'data:image/png;base64,<encoded_data>'"),
});
export type GenerateQuestionImageOutput = z.infer<typeof GenerateQuestionImageOutputSchema>;
