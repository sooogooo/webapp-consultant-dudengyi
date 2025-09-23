import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 transition-opacity" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-2xl shadow-xl p-6 border border-[var(--color-border)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">关于「叶倩倩的美学小屋」</h2>
          <button onClick={onClose} className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-background)]">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4 text-[var(--color-text-base)] max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex items-center gap-4">
                <img src="https://docs.bccsw.cn/images/const-yeqian/headlogo.png" alt="Ye Qianqian" className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-primary)]"/>
                <div>
                    <h3 className="text-xl font-bold">美学设计师：叶倩倩</h3>
                    <p className="text-[var(--color-text-muted)]">美学理念：美无模板，千人千面</p>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-lg mb-2 text-[var(--color-info)]">这是什么？</h4>
                <p className="text-[var(--color-text-muted)]">
                    这是一款由 AI 驱动的创新性医美初步咨询工具。它旨在为您提供一个私密、便捷的平台，帮助您整理自己的变美诉求，并获得由 AI 提供的初步信息参考。
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-lg mb-2 text-[var(--color-info)]">技术驱动</h4>
                <p className="text-[var(--color-text-muted)]">
                    本应用的核心 AI 能力由 Google 最先进的 Gemini 模型驱动，能够理解您的需求、分析照片、进行多轮对话，并为您生成一份个性化的咨询摘要。
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-lg mb-2 text-[var(--color-warning)]">重要声明</h4>
                <p className="text-[var(--color-text-muted)]">
                    请牢记，AI 的所有分析和建议均基于公开信息和模型算法，**不能替代** 执业医师的专业面诊。本工具的目的是帮助您更好地准备与医生的沟通，而非提供医疗诊断。任何最终的治疗方案都必须由合格的医疗专业人员在面诊后确定。
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
