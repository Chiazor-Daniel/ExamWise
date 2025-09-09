import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { keyRotation, type OperationType } from './key-rotation';

function createAIInstance(operation: OperationType) {
    return genkit({
        plugins: [googleAI({ apiKey: keyRotation.getKeyForOperation(operation) })],
        model: 'googleai/gemini-2.0-flash',
    });
}

// Create instances for different operations
export const questionGenAI = createAIInstance('GENERATE_QUESTIONS');
export const solveQuestionAI = createAIInstance('SOLVE_QUESTION');
export const audioGenAI = createAIInstance('GENERATE_AUDIO');
export const analyzePatternAI = createAIInstance('ANALYZE_PATTERNS');
export const imageGenAI = createAIInstance('GENERATE_IMAGE');
