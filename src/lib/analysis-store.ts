import { promises as fs } from 'fs';
import path from 'path';
import type { AnalyzeExamPatternsOutput } from '@/ai/flows/analyze-exam-patterns';

const cacheFilePath = path.resolve(process.cwd(), 'src/data/analysis-cache.json');

type AnalysisCache = {
    [subject: string]: AnalyzeExamPatternsOutput;
};

async function readCache(): Promise<AnalysisCache> {
    try {
        await fs.access(cacheFilePath);
    } catch {
        // File doesn't exist, create it with an empty object
        await fs.writeFile(cacheFilePath, JSON.stringify({}), 'utf8');
        return {};
    }

    try {
        const data = await fs.readFile(cacheFilePath, 'utf8');
        if (!data) return {};
        return JSON.parse(data) as AnalysisCache;
    } catch (error) {
        console.error('Error reading or parsing analysis cache:', error);
        // If parsing fails, return an empty object to prevent app crash
        return {};
    }
}

async function writeCache(data: AnalysisCache): Promise<void> {
    try {
        await fs.writeFile(cacheFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to analysis cache:', error);
        throw new Error('Could not save analysis data.');
    }
}

export async function saveAnalysis(subject: string, analysis: AnalyzeExamPatternsOutput): Promise<void> {
    const cache = await readCache();
    cache[subject] = analysis;
    await writeCache(cache);
}

export async function getAnalysisForSubject(subject: string): Promise<AnalyzeExamPatternsOutput | null> {
    const cache = await readCache();
    return cache[subject] || null;
}

export async function getAvailableSubjects(): Promise<string[]> {
    const cache = await readCache();
    return Object.keys(cache);
}
