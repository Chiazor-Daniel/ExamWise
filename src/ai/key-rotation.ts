/**
 * @fileOverview Handles API key rotation for Google AI services
 */

export class KeyRotation {
    private readonly keys: string[];
    private currentIndex: number = 0;

    constructor(keys: string[]) {
        if (!keys || keys.length === 0) {
            throw new Error('At least one API key is required');
        }
        this.keys = keys;
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
}

// Initialize with your API keys
const apiKeys = [
    process.env.GOOGLE_API_KEY_1 || '',
    process.env.GOOGLE_API_KEY_2 || '',
    process.env.GOOGLE_API_KEY_3 || '',
].filter(Boolean); // Remove any empty keys

export const keyRotation = new KeyRotation(apiKeys);
