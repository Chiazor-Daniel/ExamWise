import { SubjectAnalysis } from '@/types/analysis-types';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const analysisCache = new Map<string, { data: SubjectAnalysis; timestamp: number }>();

export function cacheAnalysis(subject: string, analysis: SubjectAnalysis) {
    analysisCache.set(subject, {
        data: analysis,
        timestamp: Date.now()
    });
}

export function getCachedAnalysis(subject: string): SubjectAnalysis | null {
    const cached = analysisCache.get(subject);
    if (!cached) return null;
    
    // Check if cache is still valid (within 24 hours)
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
        analysisCache.delete(subject);
        return null;
    }
    
    return cached.data;
}
