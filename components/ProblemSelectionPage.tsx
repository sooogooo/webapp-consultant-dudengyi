import React, { useState, useMemo, useEffect } from 'react';
import { Problem } from '../types.ts';
import { AESTHETIC_PROBLEMS } from '../constants.ts';

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
);


const ProblemSelectionPage: React.FC<{ onComplete: (problems: Problem[]) => void }> = ({ onComplete }) => {
    const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
    const [manualInput, setManualInput] = useState('');
    const [openCategory, setOpenCategory] = useState<string | null>(null);

    const problemCategories = useMemo(() => {
        return AESTHETIC_PROBLEMS.reduce((acc, problem) => {
            if (!acc[problem.category]) {
                acc[problem.category] = [];
            }
            acc[problem.category].push(problem);
            return acc;
        }, {} as Record<string, Problem[]>);
    }, []);

    useEffect(() => {
        // Open the first category by default
        const firstCategory = Object.keys(problemCategories)[0];
        if (firstCategory) {
            setOpenCategory(firstCategory);
        }
    }, [problemCategories]);

    const toggleProblem = (problem: Problem) => {
        setSelectedProblems(prev => {
            const isSelected = prev.some(p => p.id === problem.id);
            if (isSelected) {
                return prev.filter(p => p.id !== problem.id);
            } else {
                if (prev.length < 5) {
                    return [...prev, problem];
                }
                return prev;
            }
        });
    };
    
    const handleComplete = () => {
        const finalProblems = [...selectedProblems];
        if (manualInput.trim()) {
            finalProblems.push({
                id: 'manual_input',
                category: '我的其他烦恼',
                name: manualInput.trim(),
            });
        }
        onComplete(finalProblems);
    };

    const canComplete = selectedProblems.length > 0 || manualInput.trim() !== '';
    const maxSelectionsReached = selectedProblems.length >= 5;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-center text-[var(--color-text-base)] mb-2">告诉我们您关心什么？</h1>
            <p className="text-[var(--color-text-muted)] text-center mb-8">
                您可以从下方分类中选择 (最多5项)，也可以直接输入您的具体烦恼。
            </p>

            <div className="space-y-6">
                {/* Accordion for categories */}
                <div className="space-y-4">
                    {Object.entries(problemCategories).map(([category, problems]) => (
                        <div key={category} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setOpenCategory(openCategory === category ? null : category)}
                                className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                                aria-expanded={openCategory === category}
                                aria-controls={`category-content-${category}`}
                            >
                                <h2 className="text-xl font-semibold text-[var(--color-text-base)]">{category}</h2>
                                {openCategory === category 
                                    ? <ChevronUpIcon className="w-6 h-6 text-[var(--color-primary)]" /> 
                                    : <ChevronDownIcon className="w-6 h-6 text-[var(--color-text-muted)]" />
                                }
                            </button>
                            {openCategory === category && (
                                <div id={`category-content-${category}`} className="p-4 pt-0 border-t border-[var(--color-border)]">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                        {problems.map(problem => {
                                            const isSelected = selectedProblems.some(p => p.id === problem.id);
                                            return (
                                                <button
                                                    key={problem.id}
                                                    onClick={() => toggleProblem(problem)}
                                                    disabled={maxSelectionsReached && !isSelected}
                                                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-between text-left w-full
                                                        ${isSelected 
                                                            ? 'bg-[var(--color-primary)] text-white shadow-lg ring-2 ring-offset-2 ring-offset-[var(--color-surface)] ring-[var(--color-primary)]' 
                                                            : 'bg-[var(--color-background)] text-[var(--color-text-base)] hover:bg-[var(--color-primary)]/10'
                                                        }
                                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-background)]
                                                    `}
                                                >
                                                    <span className="font-medium">{problem.name}</span>
                                                    {isSelected && <CheckCircleIcon className="w-6 h-6 flex-shrink-0 ml-2" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Manual Input Section */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm p-4">
                     <h2 className="text-xl font-semibold text-[var(--color-text-base)] mb-3">或者，直接输入您的其他烦恼</h2>
                     <textarea
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="例如：我觉得自己看起来很憔悴，没有精神..."
                        className="w-full p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-base)]"
                        rows={3}
                     />
                </div>
            </div>

            <div className="mt-10 text-center">
                <button
                    onClick={handleComplete}
                    disabled={!canComplete}
                    className="w-full md:w-auto px-12 py-4 bg-[var(--color-success)] text-white font-bold rounded-lg text-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    选好了，下一步 ({selectedProblems.length + (manualInput.trim() ? 1 : 0)} 项)
                </button>
            </div>
        </div>
    );
};

export default ProblemSelectionPage;