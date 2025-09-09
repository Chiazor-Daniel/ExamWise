/**
 * @fileOverview Handles API key management for different AI operations
 */

export type OperationType = 'GENERATE_QUESTIONS' | 'SOLVE_QUESTION' | 'GENERATE_AUDIO' | 'ANALYZE_PATTERNS' | 'GENERATE_IMAGE';

// Define which operations use which keys
const operationKeyMap: Record<OperationType, 'PRIMARY' | 'SECONDARY'> = {
    GENERATE_QUESTIONS: 'PRIMARY',
    SOLVE_QUESTION: 'SECONDARY',
    GENERATE_AUDIO: 'SECONDARY',
    ANALYZE_PATTERNS: 'PRIMARY',
    GENERATE_IMAGE: 'PRIMARY'
};

export class KeyRotation {
    private readonly keys: string[];
    private currentIndex = 0;
    private primaryUsageCount = 0;
    private secondaryUsageCount = 0;
    private readonly usageLimit = 60; // Reset count after 60 uses

    constructor() {
        // Initialize with all available API keys
        this.keys = [
            process.env.GOOGLE_API_KEY || '',
            process.env.GOOGLE_API_KEY2 || ''
        ].filter(key => key.length > 0);
        
        // Validate keys during instantiation
        this.validateKeys();
    }

    private validateKeys(): void {
        if (this.keys.length < 2) {
            throw new Error('Both PRIMARY (GOOGLE_API_KEY) and SECONDARY (GOOGLE_API_KEY2) API keys are required.');
        }
    }

    public getKeyForOperation(operation: OperationType): string {
        const keyType = operationKeyMap[operation];
        const key = keyType === 'PRIMARY' ? this.keys[0] : this.keys[1];
        
        // Update usage count
        if (keyType === 'PRIMARY') {
            this.primaryUsageCount = (this.primaryUsageCount + 1) % this.usageLimit;
        } else {
            this.secondaryUsageCount = (this.secondaryUsageCount + 1) % this.usageLimit;
        }

        return key;
    }

    public getCurrentKey(): string {
        return this.keys[this.currentIndex];
    }

    public getKeyCount(): number {
        return this.keys.length;
    }

    public getNextKey(): string {
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return this.getCurrentKey();
    }

    public rotateOnError(): string {
        const previousKey = this.getCurrentKey();
        this.getNextKey();
        // If we've tried all keys and came back to the first one, throw an error
        if (this.getCurrentKey() === previousKey) {
            throw new Error('All API keys have been exhausted');
        }
        return this.getCurrentKey();
    }

    public getUsageStats(): { primary: number; secondary: number } {
        return {
            primary: this.primaryUsageCount,
            secondary: this.secondaryUsageCount
        };
    }
}

// Export a singleton instance
export const keyRotation = new KeyRotation();
