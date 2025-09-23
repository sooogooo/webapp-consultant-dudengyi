import React, { useState, useEffect, useRef } from 'react';
import { SessionData, ChatMessage } from '../types.ts';
import { startChat, sendMessageStream, generateFinalSummary } from '../services/geminiService.ts';
import { KNOWLEDGE_BASE } from '../constants.ts';
import Spinner from './shared/Spinner.tsx';
import { Chat } from '@google/genai';
import { useSettings } from '../SettingsContext.tsx';

interface ConsultationPageProps {
  sessionData: SessionData;
  updateSession: (data: Partial<SessionData>) => void;
  onComplete: () => void;
}

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

const ConsultationPage: React.FC<ConsultationPageProps> = ({ sessionData, updateSession, onComplete }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { aiPersonality, aiVerbosity } = useSettings();

  const initialQuestions = [
    "您对潜在治疗的预算大概是多少？",
    "您是否有已知的过敏史、是否处于孕期或哺乳期，或有无任何重大疾病？",
    "您期望在多长时间内看到效果？"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [sessionData.chatHistory]);
  
  useEffect(() => {
    if (sessionData.problems.length > 0 && !chat) {
      const newChat = startChat(sessionData.problems, aiPersonality, aiVerbosity);
      setChat(newChat);
      const firstMessage: ChatMessage = {
        role: 'system',
        content: `谢谢。为了更好地了解您的需求，请回答以下几个问题：\n1. ${initialQuestions[0]}\n2. ${initialQuestions[1]}\n3. ${initialQuestions[2]}`
      };
      updateSession({ chatHistory: [firstMessage] });
    }
    // The chat should not be re-initialized if settings change mid-conversation.
    // This effect runs once when the component mounts with the initial problems.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData.problems]);


  const handleSendMessage = async () => {
    if (!userInput.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    updateSession({ chatHistory: [...sessionData.chatHistory, userMessage] });
    setUserInput('');
    setIsLoading(true);

    const modelResponse: ChatMessage = { role: 'model', content: '' };
    updateSession({ chatHistory: [...sessionData.chatHistory, userMessage, modelResponse] });

    try {
      const stream = await sendMessageStream(chat, userInput);
      let text = '';
      for await (const chunk of stream) {
        text += chunk.text;
        updateSession({
          chatHistory: [...sessionData.chatHistory, userMessage, { role: 'model', content: text }]
        });
      }
    } catch (error) {
      console.error('Error during chat:', error);
      const errorMessage: ChatMessage = { role: 'model', content: "抱歉，我遇到了一个错误。请重试。" };
      updateSession({ chatHistory: [...sessionData.chatHistory, userMessage, errorMessage] });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCompleteConsultation = async () => {
    setIsSummarizing(true);
    const summary = await generateFinalSummary(sessionData.chatHistory);
    updateSession({ summary });
    setIsSummarizing(false);
    onComplete();
  };

  const relevantKnowledgeCards = KNOWLEDGE_BASE.filter(card => 
    sessionData.problems.some(p => card.title.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())) ||
    sessionData.problems.some(p => card.description.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()))
  ).slice(0, 3);
  
  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
          <Spinner />
          <p className="mt-4 text-[var(--color-text-muted)]">正在初始化 AI 咨询师...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
      {/* Chat Area */}
      <div className="lg:col-span-2 flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text-base)]">AI 咨询</h2>
          <p className="text-sm text-[var(--color-text-muted)]">您关心的问题: {sessionData.problems.map(p => p.name).join('、')}</p>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {sessionData.chatHistory.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role !== 'user' && <div className="p-2 bg-[var(--color-background)] rounded-full"><BotIcon /></div>}
              <div className={`max-w-xl p-4 rounded-xl ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text-base)]'} whitespace-pre-wrap`}>
                {msg.content}
              </div>
               {msg.role === 'user' && <div className="p-2 bg-[var(--color-background)] rounded-full"><UserIcon /></div>}
            </div>
          ))}
          {isLoading && (
              <div className="flex items-start gap-3 my-4">
                  <div className="p-2 bg-[var(--color-background)] rounded-full"><BotIcon/></div>
                  <div className="flex items-center space-x-2 p-4 bg-[var(--color-background)] rounded-xl">
                      <Spinner size="sm"/>
                      <span className="text-[var(--color-text-muted)]">思考中...</span>
                  </div>
              </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="请在此输入您的回答或追问..."
              className="flex-1 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-base)]"
              rows={2}
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
              发送
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="flex flex-col gap-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-base)] mb-3">相关知识</h3>
          <div className="space-y-3">
            {relevantKnowledgeCards.length > 0 ? relevantKnowledgeCards.map(card => (
              <div key={card.id} className="p-3 bg-[var(--color-background)] rounded-lg">
                <p className="font-semibold text-[var(--color-info)]">{card.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{card.description}</p>
              </div>
            )) : <p className="text-sm text-[var(--color-text-muted)]">没有与您所选问题匹配的知识卡片。</p>}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <button
              onClick={handleCompleteConsultation}
              disabled={isSummarizing || isLoading}
              className="w-full flex justify-center items-center py-3 px-4 bg-[var(--color-success)] hover:opacity-90 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {isSummarizing ? <Spinner size="sm" /> : '完成并生成摘要'}
          </button>
           <p className="text-xs text-center text-[var(--color-text-muted)] mt-2">此操作将结束对话并生成您的咨询报告。</p>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;