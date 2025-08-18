
"use server";

import { analyzeExamPatterns, type AnalyzeExamPatternsInput, type AnalyzeExamPatternsOutput } from "@/ai/flows/analyze-exam-patterns";
import { generateAudioExplanation } from "@/ai/flows/generate-audio-explanation";
import { generateExamQuestions, type GenerateExamQuestionsInput } from "@/ai/flows/generate-exam-questions";
import { generateImageForQuestion } from "@/ai/flows/generate-question-image";
import { solveQuestion } from "@/ai/flows/solve-question";
import { getAnalysisForSubject as getAnalysis, getAvailableSubjects as getSubjects } from "@/lib/analysis-store";
import type { GenerateAudioInput, GenerateAudioOutput, GenerateQuestionImageInput, GenerateQuestionImageOutput, SolveQuestionInput, SolveQuestionOutput } from "@/types/exam-types";

export type GetAnalysisForSubjectOutput = AnalyzeExamPatternsOutput;

export async function handleAnalyzePatterns(input: AnalyzeExamPatternsInput) {
    try {
        // NOTE: The result is no longer saved to a file to ensure Vercel/serverless compatibility.
        // The analysis will only be available for the current session's generation requests.
        // To add a new subject permanently, you would add it to the `analysis-cache.json` file.
        const result = await analyzeExamPatterns(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error analyzing patterns:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to analyze exam patterns. ${errorMessage}` };
    }
}

export async function handleGenerateQuestions(input: Omit<GenerateExamQuestionsInput, 'patternSummary'>) {
    try {
        const analysis = await getAnalysis(input.subject);
        if (!analysis) {
            return { success: false, error: `No analysis found for subject: ${input.subject}. Please analyze it first.`};
        }

        const patternSummary = `Frequent Topics: ${analysis.frequentTopics}\n\nQuestion Patterns: ${analysis.questionPatterns}\n\nOverall Strategy: ${analysis.overallStrategy}`;
        
        const result = await generateExamQuestions({
            ...input,
            patternSummary,
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("Error generating questions:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to generate questions. ${errorMessage}` };
    }
}

export async function handleSolveQuestion(input: SolveQuestionInput): Promise<{success: true, data: SolveQuestionOutput} | {success: false, error: string}> {
    try {
        const result = await solveQuestion(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error solving question:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to get solution. ${errorMessage}` };
    }
}

export async function handleGenerateAudio(input: GenerateAudioInput): Promise<{success: true, data: GenerateAudioOutput} | {success: false, error: string}> {
    try {
        const result = await generateAudioExplanation(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error generating audio:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to generate audio. ${errorMessage}` };
    }
}

export async function handleGenerateImage(input: GenerateQuestionImageInput): Promise<{success: true, data: GenerateQuestionImageOutput} | {success: false, error: string}> {
    try {
        const result = await generateImageForQuestion(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error generating image:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to generate image. ${errorMessage}` };
    }
}


export async function getAvailableSubjects() {
    try {
        const subjects = await getSubjects();
        return { success: true, data: subjects };
    } catch (error) {
        console.error("Error getting available subjects:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to load subjects. ${errorMessage}` };
    }
}

export async function getAnalysisForSubject(subject: string) {
    try {
        const analysis = await getAnalysis(subject);
        if (!analysis) {
             return { success: false, error: `No analysis found for subject: ${subject}.`};
        }
        return { success: true, data: analysis };
    } catch (error) {
        console.error(`Error getting analysis for ${subject}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to load analysis. ${errorMessage}` };
    }
}
