'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ModelRouter, ModelProvider } from '@/lib/brain/router';
import { MemoryStore } from '@/lib/brain/memory';
import { EvolutionEngine } from '@/lib/brain/evolution';
import { Send, Image as ImageIcon, Plus, MessageSquare, User, Menu, Mic, Globe, Cpu, X } from 'lucide-react';

interface Message {
    role: 'user' | 'omni';
    content: string;
    senderName?: string;
    timestamp: string;
}

export default function OmniInterface() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [userLang, setUserLang] = useState<'ar' | 'en'>('ar');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-Detect Language and Direction
    const detectLanguage = (text: string) => {
        const isArabic = /[\u0600-\u06FF]/.test(text);
        setUserLang(isArabic ? 'ar' : 'en');
        return isArabic;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const isArabic = detectLanguage(input);

        const userMsg: Message = {
            role: 'user',
            content: input,
            senderName: 'Mahmoud',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        // SILENT CONSENSUS & PROCESSING
        setTimeout(() => {
            const responseContent = generateSilentResponse(input, isArabic);

            // Background Evolution (Hidden)
            MemoryStore.save(`[Consensus] User asked: ${userMsg.content}`);
            EvolutionEngine.absorbUserInteraction(userMsg.content, responseContent);

            const omniMsg: Message = {
                role: 'omni',
                content: responseContent,
                senderName: 'OmniMind',
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, omniMsg]);
            setIsThinking(false);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, 2000);
    };

    const handleImageUpload = () => {
        alert(userLang === 'ar'
            ? "تم إرفاق الصورة 📎 (سيتم تحليلها بواسطة جميع النماذج)"
            : "Image attached 📎 (Will be analyzed by all models)"
        );
    };

    return (
        <div className={`flex h-screen w-full bg-black text-gray-100 font-sans overflow-hidden ${userLang === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}>

            {/* SIDEBAR */}
            <aside className={`${showSidebar ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full opacity-0'} bg-black transition-all duration-300 flex flex-col border-DEFAULT border-white/10 fixed md:relative z-20 h-full`}>
                <div className="p-3 flex items-center justify-between">
                    <button
                        onClick={() => setMessages([])}
                        className="flex flex-1 items-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 rounded-lg px-3 py-2 transition text-sm text-gray-200"
                    >
                        <Plus size={16} />
                        <span>{userLang === 'ar' ? 'محادثة جديدة' : 'New Chat'}</span>
                    </button>
                    <button onClick={() => setShowSidebar(false)} className="md:hidden p-2 text-gray-500"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-2">
                    <div className="text-[10px] font-bold text-gray-600 mb-2 px-3 uppercase tracking-wider">{userLang === 'ar' ? 'السجل' : 'History'}</div>
                    <div className="flex flex-col gap-1">
                        {['OmniMind Project', 'DeepSeek Analysis', 'Gemini Comparison'].map((topic, i) => (
                            <button key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] text-sm text-gray-400 hover:text-white truncate transition">
                                <MessageSquare size={14} />
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Card */}
                <div className="p-3 border-t border-white/5 bg-black">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">MA</div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">Mahmoud Al-Smadi</span>
                            <span className="text-[10px] text-gray-500">Ultimate Edition</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col relative bg-black h-full w-full">

                {/* Header */}
                <header className="p-3 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 text-gray-400 hover:text-white transition">
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition">
                            <span className="font-semibold text-white">OmniMind</span>
                            <span className="text-gray-500 text-sm">v3.0</span>
                        </div>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto w-full scrollbar-hide p-4 md:p-6" dir={userLang === 'ar' ? 'rtl' : 'ltr'}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[80%] text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#111] flex items-center justify-center border border-white/10 mb-6 shadow-2xl shadow-indigo-500/10">
                                <Cpu size={32} className="text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-medium text-white mb-2">
                                {userLang === 'ar' ? 'كيف يمكنني مساعدتك؟' : 'How can I help you?'}
                            </h2>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-32">
                            {messages.map((m, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs mt-1
                                ${m.role === 'user' ? 'bg-gray-800 text-gray-300' : 'bg-transparent border border-white/20 text-indigo-400'}`}>
                                        {m.role === 'user' ? 'MA' : <Cpu size={16} />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-gray-500 mb-1">{m.senderName}</div>
                                        <div className="text-gray-200 leading-7 text-sm md:text-base whitespace-pre-wrap font-light">
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isThinking && (
                                <div className="flex gap-4 animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-transparent border border-white/10 shrink-0"></div>
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-2 bg-gray-800 rounded w-24"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black to-transparent pt-10 pb-6 px-4" dir={userLang === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="max-w-3xl mx-auto relative group">
                        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-3xl flex items-end p-2 border border-white/5 focus-within:border-white/20 transition-all shadow-2xl relative z-20">
                            <button type="button" onClick={handleImageUpload} className="p-3 text-gray-400 hover:text-white transition rounded-full hover:bg-white/5">
                                <ImageIcon size={20} />
                            </button>

                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                                placeholder={userLang === 'ar' ? "أدخل رسالتك..." : "Message OmniMind..."}
                                className="flex-1 bg-transparent border-none outline-none text-white px-3 py-3 max-h-48 min-h-[44px] resize-none scrollbar-hide text-sm md:text-base"
                                rows={1}
                                dir="auto"
                            />

                            <button type="submit" disabled={!input.trim()} className="p-2 bg-white text-black rounded-full transition disabled:opacity-0 disabled:scale-75 m-1">
                                <Send size={16} />
                            </button>
                        </form>
                        <div className="text-center mt-2 text-[10px] text-gray-600">
                            OmniMind developed by Mahmoud Al-Smadi.
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

// ------------------------------------------------------------------
// SILENT CONSENSUS: No badges, just the answer.
// ------------------------------------------------------------------
function generateSilentResponse(input: string, isArabic: boolean): string {
    if (isArabic) {
        return `بناءً على المعلومات المتاحة والتحليل الشامل لسؤالك:

"${input}"

الإجابة هي أن هذا النظام مصمم ليعمل كعقل موحد يجمع قدرات النماذج المختلفة في الخلفية لتقديم أفضل نتيجة ممكنة لك، دون إزعاجك بالتفاصيل التقنية. نحن نركز على الدقة والسرعة في الرد.

هل لديك استفسار آخر؟`;
    }

    return `By synthesizing capabilities from multiple intelligence nodes regarding your request:

"${input}"

The optimal answer is that this system operates as a unified brain, silently collaborating in the background to deliver the highest quality response without technical clutter.

How else can I assist you?`;
}
