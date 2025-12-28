'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ModelRouter, ModelProvider } from '@/lib/brain/router';
import { MemoryStore } from '@/lib/brain/memory';
import { EvolutionEngine } from '@/lib/brain/evolution';
import { Send, Image as ImageIcon, Plus, MessageSquare, User, Menu, Mic, Globe, Cpu } from 'lucide-react';

interface Message {
    role: 'user' | 'omni';
    content: string;
    senderName?: string;
    timestamp: string;
    isConsensus?: boolean; // If true, shows the "Collaboration" badge
}

export default function OmniInterface() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [userLang, setUserLang] = useState<'ar' | 'en'>('ar'); // Default to Arabic as per request
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Simulated Login
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-Detect Language from first input
    const detectLanguage = (text: string) => {
        const isArabic = /[\u0600-\u06FF]/.test(text);
        setUserLang(isArabic ? 'ar' : 'en');
        return isArabic;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Detect language immediately
        const isArabic = detectLanguage(input);
        const direction = isArabic ? 'rtl' : 'ltr';

        const userMsg: Message = {
            role: 'user',
            content: input,
            senderName: 'Mahmoud',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        // ANALYZE & COLLABORATE
        // "Thinking" phase now simulates a meeting between models
        setTimeout(() => {
            const responseContent = generateConsensusResponse(input, isArabic);

            // Save to collective memory
            MemoryStore.save(`[Consensus] User asked: ${userMsg.content}`);
            EvolutionEngine.absorbUserInteraction(userMsg.content, responseContent);

            const omniMsg: Message = {
                role: 'omni',
                content: responseContent,
                senderName: 'OmniMind',
                timestamp: new Date().toLocaleTimeString(),
                isConsensus: true
            };

            setMessages(prev => [...prev, omniMsg]);
            setIsThinking(false);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, 2500);
    };

    const handleImageUpload = () => {
        alert(userLang === 'ar'
            ? "جاري تحليل الصورة بواسطة (GPT-4 Vision + Gemini Pro + Claude)..."
            : "Analyzing image via (GPT-4 Vision + Gemini Pro + Claude)..."
        );
    };

    return (
        <div className={`flex h-screen w-full bg-black text-gray-100 font-sans overflow-hidden ${userLang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`} dir={userLang === 'ar' ? 'rtl' : 'ltr'}>

            {/* SIDEBAR (Gemini/ChatGPT Hybrid) */}
            <aside className={`${showSidebar ? 'w-[280px]' : 'w-0'} bg-[#0a0a0a] transition-all duration-300 flex flex-col border-DEFAULT border-white/5`}>

                {/* New Chat Button */}
                <div className="p-4">
                    <button
                        onClick={() => setMessages([])}
                        className="flex items-center gap-3 w-full bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-white/10 rounded-full px-4 py-3 transition text-sm font-medium shadow-lg"
                    >
                        <Plus size={18} className="text-gray-400" />
                        <span>{userLang === 'ar' ? 'محادثة جديدة' : 'New Chat'}</span>
                    </button>
                </div>

                {/* Recent History */}
                <div className="flex-1 overflow-y-auto px-2 py-2">
                    <div className="text-xs font-bold text-gray-500 mb-3 px-4">{userLang === 'ar' ? 'الأخيرة' : 'Recent'}</div>
                    <div className="flex flex-col gap-1">
                        {['مشروع تطوير العقل', 'خطط المستقبل', 'تحليل صور'].map((topic, i) => (
                            <button key={i} className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-[#1e1e1e] text-sm text-gray-300 truncate transition text-right group">
                                <MessageSquare size={14} className="text-gray-500 group-hover:text-white" />
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Profile / Login */}
                <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1e1e1e] cursor-pointer transition">
                        {/* Simulated User Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                            MA
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Mahmoud Al-Smadi</span>
                            <span className="text-[10px] text-gray-500">Premium Plan</span>
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-3 text-center">
                        Developed by Mahmoud Al-Smadi
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col relative bg-black">

                {/* Top Header */}
                <header className="p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 rounded-full hover:bg-white/10 text-gray-400">
                            <Menu size={20} />
                        </button>
                        <span className="font-semibold text-gray-200 text-lg">OmniMind <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 ml-2">Beta</span></span>
                    </div>
                    {/* Model Badge */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e1e1e] border border-white/5 text-xs text-gray-400">
                        <Cpu size={14} />
                        <span>DeepSeek • GPT-4 • Gemini • Claude</span>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto w-full scrollbar-hide px-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[80%] text-center opacity-90">
                            <div className="mb-8 relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 blur-2xl opacity-20 absolute top-0 left-0"></div>
                                <div className="w-20 h-20 rounded-full bg-[#1e1e1e] flex items-center justify-center border border-white/10 relative z-10 shadow-2xl">
                                    <Globe size={40} className="text-blue-500" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-white bg-clip-text text-transparent mb-4">
                                {userLang === 'ar' ? 'أهلاً بك، محمود' : 'Hello, Mahmoud'}
                            </h1>
                            <p className="text-xl text-gray-500 mb-8 max-w-lg">
                                {userLang === 'ar'
                                    ? 'أنا العقل الشامل. كيف يمكنني مساعدتك اليوم؟'
                                    : 'I am the Unified OmniUI. How can I help you today?'}
                            </p>

                            {/* Suggestions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                {[
                                    { emoji: '🎨', txt: userLang === 'ar' ? 'حلل هذه الصورة' : 'Analyze this image' },
                                    { emoji: '💻', txt: userLang === 'ar' ? 'اكتب كود معقد' : 'Write complex code' },
                                    { emoji: '🧠', txt: userLang === 'ar' ? 'علمني شيئاً جديداً' : 'Teach me something new' },
                                    { emoji: '📝', txt: userLang === 'ar' ? 'لخص المستندات' : 'Summarize documents' }
                                ].map((item, i) => (
                                    <button key={i} onClick={() => setInput(item.txt)} className="p-4 rounded-xl bg-[#131313] hover:bg-[#1e1e1e] border border-white/5 text-start transition">
                                        <span className="mr-2">{item.emoji}</span> {item.txt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 py-6 max-w-3xl mx-auto pb-40">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex gap-4 ${m.role === 'user' ? 'opacity-90' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 font-bold text-xs
                                ${m.role === 'user' ? 'bg-gray-700 text-white' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
                                        {m.role === 'user' ? 'MA' : '✨'}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-2">
                                        <div className="font-semibold text-sm text-gray-300">{m.senderName}</div>
                                        <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">{m.content}</div>
                                        {m.isConsensus && (
                                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                                {/* Consensus Chips */}
                                                {['DeepSeek v2', 'GPT-4o', 'Gemini Pro 1.5'].map((model, i) => (
                                                    <div key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] text-green-400">
                                                        <span>✓</span> {model} Agreed
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Thinking Indicator */}
                            {isThinking && (
                                <div className="flex gap-4 animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-blue-600/50 shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                                        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </div>

                {/* Bottom Input */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black to-transparent">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="relative bg-[#1e1e1e] rounded-2xl flex items-end p-2 border border-white/10 focus-within:border-blue-500/50 transition-colors shadow-2xl">

                            {/* Attachments */}
                            <button type="button" onClick={handleImageUpload} className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
                                <ImageIcon size={20} />
                            </button>

                            {/* Text Input */}
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                                placeholder={userLang === 'ar' ? "اسأل العقل الشامل..." : "Ask OmniMind..."}
                                className="flex-1 bg-transparent border-none outline-none text-white px-3 py-3 max-h-48 min-h-[50px] resize-none scrollbar-hide text-lg"
                                rows={1}
                                dir="auto"
                            />

                            {/* Mic / Send */}
                            {input.trim() ? (
                                <button type="submit" className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg m-1">
                                    <Send size={18} />
                                </button>
                            ) : (
                                <button type="button" className="p-3 text-gray-500 hover:text-white transition m-1">
                                    <Mic size={20} />
                                </button>
                            )}
                        </form>
                        <div className="text-center mt-3 text-xs text-gray-600 font-medium tracking-wide">
                            OmniMind V3 • Unified Collective Intelligence
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

// ------------------------------------------------------------------
// CONSENSUS ENGINE: Simulates the "Meeting of Minds"
// ------------------------------------------------------------------
function generateConsensusResponse(input: string, isArabic: boolean): string {

    // ARABIC RESPONSE
    if (isArabic) {
        return `[تقرير الإجماع الجماعي]
تم عقد اجتماع فوري بين النماذج التالية:
1. ✅ **DeepSeek**: قام بتحليل الطلب تقنياً.
2. ✅ **ChatGPT**: قام بصياغة السياق العام.
3. ✅ **Claude**: أضاف لمسة إبداعية وإنسانية.
4. ✅ **Gemini**: قام بمراجعة الحقائق من الإنترنت.

---
**الرد الموحد:**
بناءً على طلبك ("${input}"), اجتمعت العقول واتفقنا على التالي:

هذا هو الرد الأمثل الذي يجمع دقة DeepSeek وبلاغة Claude. نحن نعمل ككيان واحد لخدمتك. هل تحتاج تفاصيل أكثر حول نقطة محددة؟`;
    }

    // ENGLISH RESPONSE
    return `[Collective Consensus Report]
Instant collaboration triggered between:
1. ✅ **DeepSeek**: Analyzed technical feasibility.
2. ✅ **ChatGPT**: Structured the logical flow.
3. ✅ **Claude**: Refined tone and nuance.
4. ✅ **Gemini**: Verified facts via live search.

---
**Unified Response:**
Based on your input ("${input}"), the collective mind has converged on this answer:

This response represents the optimal synthesis of all available intelligence. We are operating as a single unit to assist you. Would you like to explore a specific angle further?`;
}
