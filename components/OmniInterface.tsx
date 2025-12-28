'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ModelRouter, ModelProvider } from '@/lib/brain/router';
import { MemoryStore } from '@/lib/brain/memory';
import { EvolutionEngine } from '@/lib/brain/evolution';
import { Send, Paperclip, Image as ImageIcon, Plus, MessageSquare, User, Monitor } from 'lucide-react';

interface Message {
    role: 'user' | 'omni';
    content: string;
    provider?: ModelProvider;
    timestamp: string;
    image?: string; // Support for images
}

export default function OmniInterface() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [activeOrb, setActiveOrb] = useState<ModelProvider | 'idle'>('idle');
    const [showSidebar, setShowSidebar] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-learner simulation
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeOrb === 'idle' && Math.random() > 0.8) {
                EvolutionEngine.runIdleCycle().then(result => console.log(`[Omni State] ${result.detail}`));
            }
        }, 12000);
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
        // Only show recall in debug/console, keep UI clean

        // 3. Simulate Processing & Language Detection
        setTimeout(() => {
            const isArabic = /[\u0600-\u06FF]/.test(userMsg.content);
            const responseContent = generateSmartResponse(analysis.provider, userMsg.content, isArabic);

            // 4. Save to Memory & Evolution
            MemoryStore.save(userMsg.content);
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

            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, 1500);
    };

    const handleImageUpload = () => {
        alert("Image Upload capability initialized. (Simulated: Image attached to context)");
    };

    return (
        <div className="flex h-screen w-full bg-[#343541] text-white font-sans overflow-hidden">

            {/* SIDEBAR (ChatGPT Style) */}
            <aside className={`${showSidebar ? 'w-[260px]' : 'w-0'} bg-[#202123] transition-all duration-300 flex flex-col border-r border-gray-700/50`}>
                <div className="p-3">
                    <button onClick={() => setMessages([])} className="flex items-center gap-3 w-full border border-white/20 rounded-md p-3 hover:bg-[#2A2B32] transition text-sm text-white">
                        <Plus size={16} /> New chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2">
                    <div className="text-xs font-semibold text-gray-500 mb-2 px-2">Recent (Saved)</div>
                    <div className="flex flex-col gap-2">
                        {['Project Planning', 'Arabic Poem', 'DeepSeek Code'].map((topic, i) => (
                            <button key={i} className="flex items-center gap-3 p-3 rounded-md hover:bg-[#2A2B32] text-sm text-gray-300 truncate transition">
                                <MessageSquare size={16} />
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Developer Credits */}
                <div className="p-4 border-t border-white/10 bg-[#202123]">
                    <div className="flex items-center gap-3 text-sm text-gray-300 mb-2">
                        <User size={16} />
                        <span>Mahmoud Al-Smadi</span>
                    </div>
                    <div className="text-[10px] text-gray-500">
                        Designed & Developed by Mahmoud Al-Smadi
                    </div>
                </div>
            </aside>

            {/* MAIN CHAT AREA */}
            <main className="flex-1 flex flex-col relative bg-[#343541]">

                {/* Mobile/Toggle Header */}
                <header className="p-2 flex items-center justify-between lg:hidden text-gray-300 border-b border-white/10">
                    <span className="font-bold">OmniMind</span>
                    <button onClick={() => setShowSidebar(!showSidebar)}>☰</button>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-gray-600">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                            <div className="w-20 h-20 rounded-full bg-cyan-500/20 animate-pulse mb-6 flex items-center justify-center">
                                <Monitor size={40} className="text-cyan-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">OmniMind</h2>
                            <p className="max-w-md text-sm">Unified Intelligence (DeepSeek, GPT, Gemini, Claude). Ask me anything in any language.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col pb-32">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`w-full border-b border-black/10 ${m.role === 'omni' ? 'bg-[#444654]' : ''}`}>
                                    <div className="max-w-3xl mx-auto flex gap-6 p-6">
                                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${m.role === 'omni' ? 'bg-green-500' : 'bg-indigo-600'}`}>
                                            {m.role === 'omni' ? '🤖' : '👤'}
                                        </div>
                                        <div className="prose prose-invert prose-p:leading-relaxed max-w-none w-full">
                                            {m.provider && <span className="text-[10px] uppercase tracking-widest text-cyan-400 mb-1 block font-mono">{m.provider} Model</span>}
                                            <p className="whitespace-pre-wrap">{m.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="w-full bg-[#444654] border-b border-black/10">
                                    <div className="max-w-3xl mx-auto flex gap-6 p-6">
                                        <div className="w-8 h-8 rounded-sm bg-green-500 flex items-center justify-center shrink-0 animate-spin">⚡</div>
                                        <div className="flex items-center">
                                            <span className="text-gray-400 animate-pulse">Omni is thinking... (Routing to best model)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#343541] via-[#343541] to-transparent pt-10 pb-6">
                    <div className="max-w-3xl mx-auto px-4">
                        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-[#40414F] p-3 rounded-xl shadow-xl border border-white/5 focus-within:border-white/20 transition-colors">
                            <button type="button" onClick={handleImageUpload} className="p-2 text-gray-400 hover:text-white transition" title="Upload Image">
                                <ImageIcon size={20} />
                            </button>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                                placeholder="Send a message..."
                                className="flex-1 max-h-48 min-h-[24px] bg-transparent border-none outline-none resize-none text-white placeholder-gray-400 py-2"
                                rows={1}
                                style={{ height: 'auto' }} // In real app, auto-grow logic
                            />
                            <button type="submit" disabled={!input.trim()} className="p-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-transparent disabled:text-gray-500 transition text-white">
                                <Send size={18} />
                            </button>
                        </form>
                        <div className="text-center mt-2 text-[10px] text-gray-500">
                            OmniMind developed by Mahmoud Al-Smadi. Combines DeepSeek, Gemini, GPT, & Claude.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Smart Response Generator
function generateSmartResponse(provider: ModelProvider, input: string, isArabic: boolean): string {
    const time = new Date().toLocaleTimeString();

    // ARABIC RESPONSES
    if (isArabic) {
        const arabicPrefixes = {
            deepseek: "تحليل الكود (DeepSeek) 🧠:\nبناءً على طلبك، إليك الكود الأمثل لهذه المشكلة...",
            gpt4: "تحليل المنطق (GPT-4) 💡:\nلقد قمت بتحليل المعلومات التي قدمتها...",
            gemini: "تحليل البيانات (Gemini) 📊:\nإليك ملخص شامل للمعلومات...",
            claude: "الرد الإبداعي (Claude) 🎨:\nهذه صياغة مقترحة للنص الذي طلبته...",
            internet: "بحث مباشر (Internet) 🌐:\nوجدت هذه المعلومات الحديثة لك...",
        };
        const prefix = arabicPrefixes[provider] || "تم استلام رسالتك.";
        return `${prefix}\n\n(هذا رد محاكاة بناءً على مدخلاتك: "${input}")\n\n[تم حفظ المحادثة في الذاكرة]`;
    }

    // ENGLISH RESPONSES
    const englishPrefixes = {
        deepseek: "DeepSeek Engine 🧠:\nOptimizing code structure...",
        gpt4: "GPT-4 Engine 💡:\nHere involves a complex analysis...",
        gemini: "Gemini Engine 📊:\nProcessing multimodal context...",
        claude: "Claude Engine 🎨:\nDrafting a natural response...",
        internet: "Live Search 🌐:\nFound the following real-time data...",
    };

    return `${englishPrefixes[provider]}\n\n(Simulated Output for: "${input}")\n\n[Memory Updated at ${time}]`;
}
