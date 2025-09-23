import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatMessage } from '../../types.ts';
import { startChat, sendMessageStream, generateSuggestedQuestions } from '../../services/geminiService.ts';
import Spinner from '../shared/Spinner.tsx';
import { Chat } from '@google/genai';
import { useSettings } from '../../SettingsContext.tsx';
import PageHeader from '../shared/PageHeader.tsx';
import { HEADER_IMAGES } from '../../constants.ts';

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const BotIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3.375a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75z" clipRule="evenodd" />
    </svg>
);

const XiaoqianChatPage: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const { aiPersonality, aiVerbosity } = useSettings();
    const chatEndRef = useRef<HTMLDivElement>(null);

    const headerImage = useMemo(() => HEADER_IMAGES[Math.floor(Math.random() * HEADER_IMAGES.length)], []);

    useEffect(() => {
        const initChat = async () => {
            const initialMessage: ChatMessage = { role: 'model', content: '您好！我是智能小倩，您的专属AI医美伙伴。今天想聊些什么呢？', id: 'init' };
            setChatHistory([initialMessage]);
            const newChat = startChat(null, aiPersonality, aiVerbosity);
            setChat(newChat);
            setIsSuggesting(true);
            const questions = await generateSuggestedQuestions([initialMessage]);
            setSuggestedQuestions(questions);
            setIsSuggesting(false);
        };
        initChat();
    }, [aiPersonality, aiVerbosity]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [chatHistory]);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: messageText, id: Date.now().toString() };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setUserInput('');
        setIsLoading(true);
        setSuggestedQuestions([]);

        const modelResponseId = (Date.now() + 1).toString();
        const modelResponse: ChatMessage = { role: 'model', content: '', id: modelResponseId };
        setChatHistory(prev => [...prev, modelResponse]);

        try {
            const stream = await sendMessageStream(chat, messageText);
            let text = '';
            for await (const chunk of stream) {
                text += chunk.text;
                setChatHistory(prev => prev.map(m => m.id === modelResponseId ? { ...m, content: text } : m));
            }

            setIsSuggesting(true);
            const finalModelMessage: ChatMessage = { role: 'model', content: text, id: modelResponseId };
            const finalHistory = [...newHistory, finalModelMessage];
            const newQuestions = await generateSuggestedQuestions(finalHistory);
            setSuggestedQuestions(newQuestions);

        } catch (error) {
            console.error('Error during chat:', error);
            const errorMessage: ChatMessage = { role: 'model', content: "抱歉，我遇到了一个错误。请重试。", id: 'error' };
            setChatHistory(prev => [...prev.filter(m => m.id !== modelResponseId), errorMessage]);
        } finally {
            setIsLoading(false);
            setIsSuggesting(false);
        }
    };
    
    const exportChat = () => {
        const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `小倩聊天记录-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <PageHeader 
                image={headerImage}
                title="智能小倩"
                subtitle="您的专属 AI 医美伙伴"
            />
            <div className="flex flex-col h-[65vh] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-lg">
                <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
                    <div className="text-center flex-1">
                        <h2 className="text-xl font-bold text-[var(--color-text-base)]">智能小倩</h2>
                        <p className="text-sm text-[var(--color-text-muted)]">AI 自由问答</p>
                    </div>
                    <button onClick={exportChat} className="text-xs px-3 py-1 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-background)]">导出记录</button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    {chatHistory.map((msg, index) => (
                        <div key={msg.id || index} className={`flex items-start gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role !== 'user' && <div className="p-2 bg-[var(--color-background)] rounded-full"><BotIcon /></div>}
                            <div className={`max-w-xl p-4 rounded-xl ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text-base)]'} whitespace-pre-wrap`}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && <div className="p-2 bg-[var(--color-background)] rounded-full"><UserIcon /></div>}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 my-4">
                            <div className="p-2 bg-[var(--color-background)] rounded-full"><BotIcon /></div>
                            <div className="flex items-center space-x-2 p-4 bg-[var(--color-background)] rounded-xl">
                                <Spinner size="sm" />
                                <span className="text-[var(--color-text-muted)]">思考中...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                
                 { (suggestedQuestions.length > 0 || isSuggesting) &&
                    <div className="p-4 border-t border-[var(--color-border)]">
                        <p className="text-sm font-semibold mb-2 text-[var(--color-text-muted)]">你可能想问：</p>
                         {isSuggesting ? <Spinner size="sm" /> : 
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((q, i) => (
                                    <button key={i} onClick={() => handleSendMessage(q)} className="px-3 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-colors">
                                        {q}
                                    </button>
                                ))}
                            </div>
                         }
                    </div>
                 }
                
                <div className="p-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                        <input
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(userInput); } }}
                            placeholder="在此输入您的问题..."
                            className="flex-1 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-base)]"
                            disabled={isLoading}
                        />
                        <button onClick={() => handleSendMessage(userInput)} disabled={isLoading || !userInput.trim()} className="px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
                            发送
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                <h3 className="text-lg font-semibold text-[var(--color-text-base)]">想进行一对一深入沟通？</h3>
                <p className="text-[var(--color-text-muted)] my-2">扫描下方二维码，添加我的企业微信，获取更个性化的专业咨询服务。</p>
                <a href="https://work.weixin.qq.com/kfid/kfc3a2d96f7b2aa8473" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 group">
                    <img 
                        src="https://docs.bccsw.cn/images/const-yeqian/yeqian-barcode.png" 
                        alt="企业微信二维码" 
                        className="w-40 h-40 rounded-lg border border-[var(--color-border)] object-contain group-hover:opacity-80 transition-opacity" 
                    />
                </a>
            </div>
        </div>
    );
};

export default XiaoqianChatPage;