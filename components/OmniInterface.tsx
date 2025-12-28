'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ModelRouter, ModelProvider } from '@/lib/brain/router';
import { MemoryStore } from '@/lib/brain/memory';

import { EvolutionEngine } from '@/lib/brain/evolution';

interface Message {
    role: 'user' | 'omni';
    content: string;
    provider?: ModelProvider;
    timestamp: string;
}

export default function OmniInterface() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [activeOrb, setActiveOrb] = useState<ModelProvider | 'idle'>('idle');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-learner simulation: The "Selfish" Brain never sleeps
    useEffect(() => {
        const interval = setInterval(() => {
            // Occasionally "dream" or learn in background
            if (activeOrb === 'idle' && Math.random() > 0.7) {
                EvolutionEngine.runIdleCycle().then(result => {
                    console.log(`[Omni State] ${result.detail}`);
                });
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [activeOrb]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        // 1. Analyze Intent
        const analysis = ModelRouter.analyzeIntent(userMsg.content);
        setActiveOrb(analysis.provider);

        // 2. Memory Recall
        const memories = MemoryStore.recall(userMsg.content);
        const context = memories.length > 0 ? `[Recall: ${memories[0].content}] ` : '';

        // 3. Simulate Processing Delay (Thinking)
        setTimeout(() => {
            const responseContent = generateMockResponse(analysis.provider, userMsg.content, context);

            // 4. Save to Memory & Evolution
            MemoryStore.save(`User asked about: ${userMsg.content}`);
            EvolutionEngine.absorbUserInteraction(userMsg.content, responseContent);

            const omniMsg: Message = {
                role: 'omni',
                content: responseContent,
                provider: analysis.provider,
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, omniMsg]);
            setIsThinking(false);
            setActiveOrb('idle');

            // Auto-scroll
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, 2000); // 2s thinking time
    };

    return (
        <div className="flex flex-col h-screen w-full max-w-4xl mx-auto p-4">
            {/* Header / Orb */}
            <header className="flex flex-col items-center justify-center py-6">
                <div className={`w-24 h-24 rounded-full blur-xl transition-all duration-1000 
            ${activeOrb === 'idle' ? 'bg-white opacity-20 scale-100' : ''}
            ${activeOrb === 'deepseek' ? 'bg-[rgb(var(--omni-primary))] opacity-60 scale-110 animate-pulse' : ''}
            ${activeOrb === 'gpt4' ? 'bg-[rgb(var(--omni-logic))] opacity-60 scale-110 animate-pulse' : ''}
            ${activeOrb === 'claude' ? 'bg-[rgb(var(--omni-human))] opacity-60 scale-110 animate-pulse' : ''}
            ${activeOrb === 'gemini' ? 'bg-[rgb(var(--omni-creative))] opacity-60 scale-110 animate-pulse' : ''}
        `}></div>
                <h1 className="mt-[-4rem] text-3xl font-bold z-10 text-white drop-shadow-lg tracking-wider">OMNI</h1>
                <p className="text-sm text-gray-400 mt-2 z-10">
                    {isThinking ? `Routing to ${activeOrb?.toUpperCase()}...` : 'Unified Intelligence Online'}
                </p>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 scrollbar-hide">
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl glass-panel border-none ${m.role === 'user' ? 'bg-white/10 text-white' : 'bg-black/40 text-gray-200'}`}>
                            {m.provider && <span className="text-xs uppercase font-bold tracking-widest block mb-2 opacity-50 text-[rgb(var(--omni-primary))]">{m.provider} Node</span>}
                            <p>{m.content}</p>
                            <span className="text-[10px] text-gray-500 mt-2 block text-right">{m.timestamp}</span>
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] p-4 rounded-2xl bg-transparent">
                            <span className="animate-pulse text-gray-400">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="relative glass-panel rounded-full p-2 flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask Omni anything..."
                    className="flex-1 bg-transparent border-none outline-none px-6 py-3 text-white placeholder-gray-500"
                />
                <button type="submit" disabled={!input} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition disabled:opacity-30">
                    ➤
                </button>
            </form>
        </div>
    );
}

// Mock Response Generator (Placeholder until real APIs are hooked up)
function generateMockResponse(provider: ModelProvider, input: string, context: string): string {
    const prefixes = {
        deepseek: "Analyzing code structure... Here is the optimized solution:",
        gpt4: "Based on my analysis of the data...",
        gemini: "Here is a breakdown of the information:",
        claude: "Here is a draft that captures the tone you requested:",
        internet: "Searching live sources... According to the latest reports:",
    };

    return `${context} ${prefixes[provider]} \n\n(Simulated Output for: "${input}")\n\n[Omni has stored this interaction in memory]`;
}
