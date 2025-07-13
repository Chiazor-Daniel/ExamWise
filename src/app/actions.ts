"use server";

import { analyzeExamPatterns, type AnalyzeExamPatternsInput } from "@/ai/flows/analyze-exam-patterns";
import { generateExamQuestions, type GenerateExamQuestionsInput } from "@/ai/flows/generate-exam-questions";

export async function handleAnalyzePatterns(input: AnalyzeExamPatternsInput) {
    try {
        const result = await analyzeExamPatterns(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error analyzing patterns:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to analyze exam patterns. ${errorMessage}` };
    }
}

export async function handleGenerateQuestions(input: GenerateExamQuestionsInput) {
    try {
        const result = await generateExamQuestions(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error generating questions:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to generate questions. ${errorMessage}` };
    }
}
