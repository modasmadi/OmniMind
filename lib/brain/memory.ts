export interface MemoryFragment {
    id: string;
    content: string;
    timestamp: number;
    tags: string[];
}

/**
 * The Memory Store allows Omni to "remember" facts about the user
 * and the world, persisting them across sessions.
 */
export class MemoryStore {
    private static memories: MemoryFragment[] = [];

    static save(content: string, tags: string[] = ['generic']) {
        const memory: MemoryFragment = {
            id: Math.random().toString(36).substring(7),
            content,
            timestamp: Date.now(),
            tags
        };
        this.memories.push(memory);
        console.log(`[Omni Memory] Stored: "${content}"`);
        // In a real app, this would write to a JSON file or Vector DB
    }

    static recall(query: string): MemoryFragment[] {
        // Simple keyword matching simulation for RAG
        const relevant = this.memories.filter(m =>
            m.content.toLowerCase().includes(query.toLowerCase())
        );
        return relevant;
    }

    static getAll() {
        return this.memories;
    }
}
