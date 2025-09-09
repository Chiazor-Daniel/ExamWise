import type { SubjectAnalysis } from '@/types/analysis-types';
import analysisCache from '@/data/analysis-cache.json';

// The cache is now a typed version of the imported JSON file.
const typedCache: Record<string, Omit<SubjectAnalysis, 'subject'>> = analysisCache;

/**
 * Retrieves the analysis for a given subject directly from the imported JSON cache.
 * This approach is compatible with serverless environments like Vercel.
 * @param subject The subject to retrieve analysis for.
 * @returns The analysis output or null if not found.
 */
export async function getAnalysisForSubject(subject: string): Promise<SubjectAnalysis | null> {
    const analysis = typedCache[subject];
    if (!analysis) return null;
    return { ...analysis, subject };
}

/**
 * Retrieves a list of all available subjects from the JSON cache.
 * @returns An array of subject names.
 */
export async function getAvailableSubjects(): Promise<string[]> {
    return Object.keys(typedCache);
}

// The saveAnalysis function has been removed as we can no longer write to the file system
// on a serverless platform. To add or update a subject, you must now edit the
// `src/data/analysis-cache.json` file directly.
