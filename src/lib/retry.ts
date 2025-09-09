import { exponentialBackoff, withTimeout } from './utils';

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

export interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    timeout?: number;
    onRetry?: (error: Error, attempt: number) => void;
}

export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = MAX_RETRIES,
        initialDelay = INITIAL_DELAY,
        timeout = 30000, // 30 second default timeout
        onRetry
    } = options;

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Wrap the operation with timeout
            return await withTimeout(
                operation(),
                timeout,
                `Operation timed out after ${timeout}ms (attempt ${attempt}/${maxRetries})`
            );
        } catch (error: any) {
            lastError = error;
            
            // Check if we should retry based on the error
            if (!shouldRetry(error) || attempt === maxRetries) {
                throw enhanceError(error, attempt);
            }

            // Calculate delay with exponential backoff
            const delay = exponentialBackoff(attempt, initialDelay);
            
            if (onRetry) {
                onRetry(error, attempt);
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // This shouldn't be reached due to the throw above, but TypeScript needs it
    throw lastError;
}

function shouldRetry(error: any): boolean {
    // Retry on rate limits, temporary failures, or network issues
    const retryableStatusCodes = [429, 503, 504];
    const retryableErrorMessages = [
        'network error',
        'timeout',
        'rate limit',
        'temporarily unavailable',
        'internal server error',
        'bad gateway',
        'service unavailable',
        'gateway timeout',
        'failed to generate'
    ];

    if (error.status && retryableStatusCodes.includes(error.status)) {
        return true;
    }

    const errorMessage = error.message?.toLowerCase() || '';
    return retryableErrorMessages.some(msg => errorMessage.includes(msg));
}

function enhanceError(error: any, attempt: number): Error {
    const baseMessage = error.message || 'Unknown error occurred';
    const enhancedMessage = `AI Operation failed after ${attempt} attempt(s): ${baseMessage}`;
    
    if (error instanceof Error) {
        error.message = enhancedMessage;
        return error;
    }
    
    return new Error(enhancedMessage);
}
