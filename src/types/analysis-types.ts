import { z } from 'zod';

export const SubjectAnalysisSchema = z.object({
    subject: z.string(),
    frequentTopics: z.string(),
    questionPatterns: z.string(),
    overallStrategy: z.string(),
    startYear: z.number().optional(),
    endYear: z.number().optional(),
});

export type SubjectAnalysis = z.infer<typeof SubjectAnalysisSchema>;
