/**
 * @fileOverview Handles API key rotation for Google AI services
 */

export class KeyRotation {
    private readonly keys: string[];
    private currentIndex: number = 0;

    constructor(keys: string[]) {
        // Filter out empty or invalid keys
        this.keys = keys.filter(key => typeof key === 'string' && key.trim().length > 0);
        
        // During build time, we'll allow empty keys array but log a warning
        if (this.keys.length === 0) {
            console.warn('Warning: No valid API keys provided. This is OK during build time but will cause errors in production.');
            // Add a placeholder key to prevent errors during build
            this.keys = ['BUILD_TIME_PLACEHOLDER'];
        }
    }

    public getCurrentKey(): string {
        // If we're using the placeholder key, check for real keys first
        if (this.keys[0] === 'BUILD_TIME_PLACEHOLDER') {
            const runtimeKeys = [
                process.env.GOOGLE_API_KEY,
                process.env.GOOGLE_API_KEY_1,
                process.env.GOOGLE_API_KEY_2,
                process.env.GOOGLE_API_KEY_3,
            ].filter(key => typeof key === 'string' && key.trim().length > 0);

            if (runtimeKeys.length === 0) {
                throw new Error('No valid API keys available at runtime');
            }
            this.keys = runtimeKeys;
        }
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
}

// Initialize with API keys, allowing empty values during build time
const apiKeys = [
    process.env.GOOGLE_API_KEY || '',
    process.env.GOOGLE_API_KEY_1 || '',
    process.env.GOOGLE_API_KEY_2 || '',
    process.env.GOOGLE_API_KEY_3 || '',
] as string[];

export const keyRotation = new KeyRotation(apiKeys);
