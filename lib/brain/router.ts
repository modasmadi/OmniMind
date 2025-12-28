export type ModelProvider = 'deepseek' | 'gpt4' | 'gemini' | 'claude' | 'internet';

interface IntentAnalysis {
    provider: ModelProvider;
    reason: string;
    confidence: number;
}

/**
 * The Router is the core of Omni. It analyzes the user's prompt
 * and routes it to the most capable sub-mind.
 */
export class ModelRouter {

    static analyzeIntent(prompt: string): IntentAnalysis {
        const p = prompt.toLowerCase();

        // Coding & Technical Logic -> DeepSeek (Known for strong coding)
        if (p.includes('code') || p.includes('function') || p.includes('bug') || p.includes('python') || p.includes('script')) {
            return { provider: 'deepseek', reason: 'High-complexity coding task detected', confidence: 0.95 };
        }

        // Creative Writing & Human Nuance -> Claude (Known for natural writing)
        if (p.includes('story') || p.includes('poem') || p.includes('write a email') || p.includes('creative')) {
            return { provider: 'claude', reason: 'Creative/Natural language task detected', confidence: 0.9 };
        }

        // Multimodal or General Logic -> GPT-4 / Gemini
        if (p.includes('analyze') || p.includes('image') || p.includes('summary')) {
            return { provider: 'gpt4', reason: 'General reasoning task detected', confidence: 0.85 };
        }

        // Real-time info -> Internet Search
        if (p.includes('news') || p.includes('price') || p.includes('today') || p.includes('weather')) {
            return { provider: 'internet', reason: 'Real-time information required', confidence: 0.99 };
        }

        // Default to Gemini for speed/balance
        return { provider: 'gemini', reason: 'General conversation', confidence: 0.8 };
    }
}
