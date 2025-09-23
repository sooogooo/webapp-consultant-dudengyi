


import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { KnowledgeArticle } from '../../types.ts';
import { KNOWLEDGE_ARTICLES_CONTENT, HEADER_IMAGES } from '../../constants.ts';
import { extractKeywords, explainKeyword } from '../../services/geminiService.ts';
import PageHeader from '../shared/PageHeader.tsx';
import Spinner from '../shared/Spinner.tsx';
import KeywordModal from './KeywordModal.tsx';

// This component now relies on the 'marked' library, which must be loaded from the CDN in index.html
declare const marked: any;

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
    </svg>
);


const KnowledgeBasePage: React.FC = () => {
    const [articles, setArticles] = useState<KnowledgeArticle[]>(() =>
      KNOWLEDGE_ARTICLES_CONTENT.map((item, index) => {
          // Extract title from the first line of markdown
          const title = item.content.split('\n')[0].replace('#', '').trim() || `无标题文章 ${index + 1}`;
          return {
              id: item.id,
              title,
              content: item.content,
              keywords: [],
          };
      })
    );
    const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
    
    const [isKeywordsLoading, setIsKeywordsLoading] = useState(false);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        keyword: string;
        explanation: string;
        isLoading: boolean;
    }>({ isOpen: false, keyword: '', explanation: '', isLoading: false });

    const headerImage = useMemo(() => HEADER_IMAGES[Math.floor(Math.random() * HEADER_IMAGES.length)], []);
    
    const handleSelectArticle = useCallback(async (article: KnowledgeArticle) => {
        setSelectedArticle(article);
        if (article.keywords.length === 0) {
            setIsKeywordsLoading(true);
            try {
                const keywords = await extractKeywords(article.content);
                // Update the keywords in the main articles array and the selected one
                setArticles(prevArticles => prevArticles.map(a => a.id === article.id ? { ...a, keywords } : a));
                setSelectedArticle(prev => prev ? { ...prev, keywords } : null);
            } catch (err) {
                console.error("Failed to extract keywords", err);
            } finally {
                setIsKeywordsLoading(false);
            }
        }
    }, []);
    
    const handleKeywordClick = useCallback(async (keyword: string) => {
        setModalState({ isOpen: true, keyword, explanation: '', isLoading: true });
        try {
            const explanation = await explainKeyword(keyword);
            setModalState(prev => ({ ...prev, explanation, isLoading: false }));
        } catch (err) {
            console.error("Failed to explain keyword", err);
            setModalState(prev => ({ ...prev, explanation: '抱歉，无法获取解释。', isLoading: false }));
        }
    }, []);

    const renderArticleContent = (content: string, keywords: string[]) => {
        if (keywords.length === 0 || typeof marked === 'undefined') {
             // Ensure marked is available before calling it
            return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: typeof marked !== 'undefined' ? marked.parse(content) : content }} />;
        }
        
        // Escape keywords for regex and create a single regex for all keywords
        const escapedKeywords = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
        
        const parts = content.split(regex);

        const interactiveContent = parts.map((part, index) => {
            const isKeyword = keywords.some(kw => kw.toLowerCase() === part.toLowerCase());
            if (isKeyword) {
                return `<button class="keyword-button" data-keyword="${part}">${part}</button>`;
            }
            return part;
        }).join('');

        const html = marked.parse(interactiveContent);

        return (
             <>
                <div 
                    className="prose prose-lg max-w-none" 
                    dangerouslySetInnerHTML={{ __html: html }}
                    onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if(target.classList.contains('keyword-button')) {
                            const keyword = target.dataset.keyword;
                            if(keyword) handleKeywordClick(keyword);
                        }
                    }}
                />
                 <style>{`
                    .keyword-button {
                        color: var(--color-primary);
                        font-weight: bold;
                        text-decoration: underline;
                        text-decoration-style: dotted;
                        cursor: pointer;
                        background: none;
                        border: none;
                        padding: 0;
                        font-size: inherit;
                        font-family: inherit;
                    }
                    .keyword-button:hover {
                        color: var(--color-primary-hover);
                        background-color: var(--color-primary-hover-bg, rgba(59, 130, 246, 0.1));
                    }
                `}</style>
             </>
        );
    };

    return (
        <div>
            <PageHeader
                image={headerImage}
                title="美学智库"
                subtitle="探索专业、前沿的医美知识"
            />
            <div className="max-w-4xl mx-auto p-4">
                {selectedArticle ? (
                    // Article Detail View
                    <div>
                        <button
                            onClick={() => setSelectedArticle(null)}
                            className="flex items-center gap-2 mb-6 px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:bg-[var(--color-surface)] rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            返回文章列表
                        </button>

                        <article className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 md:p-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-base)] mb-4">{selectedArticle.title}</h1>
                            {isKeywordsLoading ? (
                                <div className="flex items-center gap-2 text-[var(--color-text-muted)] my-4">
                                    <Spinner size="sm" />
                                    <span>AI 正在分析关键词...</span>
                                </div>
                            ) : (
                                selectedArticle.keywords.length > 0 && 
                                <p className="text-sm text-[var(--color-info)] mb-6">
                                    💡 提示：点击文中带下划线的关键词可查看 AI 解释。
                                </p>
                            )}
                            
                            <div className="mt-4">
                                {renderArticleContent(selectedArticle.content, selectedArticle.keywords)}
                            </div>
                        </article>
                    </div>
                ) : (
                    // Article List View
                    <div className="space-y-4">
                        {articles.map((article) => (
                            <button
                                key={article.id}
                                onClick={() => handleSelectArticle(article)}
                                className="w-full text-left bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-md hover:shadow-xl hover:border-[var(--color-primary)] transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <h2 className="text-2xl font-normal text-[var(--color-text-base)]">{article.title}</h2>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            <KeywordModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                keyword={modalState.keyword}
                explanation={modalState.explanation}
                isLoading={modalState.isLoading}
            />
        </div>
    );
};

export default KnowledgeBasePage;