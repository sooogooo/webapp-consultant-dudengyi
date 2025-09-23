import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppFeature, TourStep } from './types.ts';
import { SettingsProvider } from './SettingsContext.tsx';
import Header from './components/Header.tsx';
import Footer from './components/footer/Footer.tsx';
import TrueFooter from './components/footer/TrueFooter.tsx';
import OnboardingGuide from './components/OnboardingGuide.tsx';
import Spinner from './components/shared/Spinner.tsx';

// Lazy load components for code splitting
const AestheticDesignFlow = lazy(() => import('./components/AestheticDesignFlow.tsx'));
const XiaoqianChatPage = lazy(() => import('./components/features/XiaoqianChatPage.tsx'));
const KnowledgeBasePage = lazy(() => import('./components/features/KnowledgeBasePage.tsx'));
const ConfidentialCasesPage = lazy(() => import('./components/features/ConfidentialCasesPage.tsx'));

const tourSteps: TourStep[] = [
  {
    title: '欢迎来到美学小屋！',
    content: '很高兴见到你！让我花几秒钟带你快速了解这里，开启你的专属美丽之旅吧。',
    position: 'center',
  },
  {
    selector: '[data-tour-id="nav-design"]',
    title: 'AI 美学设计',
    content: '这是我们的核心功能。在这里，你可以上传照片，选择你关心的问题，AI会为你提供一份个性化的初步咨询报告。',
    position: 'top',
  },
  {
    selector: '[data-tour-id="nav-xiaoqian"]',
    title: '与“智能小倩”对话',
    content: '有任何关于医美的问题吗？随时可以来这里和 AI 自由聊天，获取即时解答。',
    position: 'top',
  },
  {
    selector: '[data-tour-id="nav-knowledge"]',
    title: '美学智库',
    content: '这里有由我们的专家撰写的深度文章，帮助你更科学、更全面地了解医美知识。',
    position: 'top',
  },
  {
    selector: '[data-tour-id="nav-cases"]',
    title: '保密案例',
    content: '想看看真实的变美效果吗？输入密码后，可以查看我们严格保密的客户案例，给你更多信心。',
    position: 'top',
  },
  {
    selector: '[data-tour-id="settings-button"]',
    title: '个性化设置',
    content: '点击这里，你可以随时更换应用的主题配色、调整字体大小，选择你喜欢的 AI 对话风格。',
    position: 'bottom',
  },
  {
    title: '你已准备就绪！',
    content: '所有功能都已介绍完毕，现在开始你的探索吧！祝你在这里玩得开心，收获美丽！',
    position: 'center',
  }
];

const LoadingFallback: React.FC = () => (
    <div className="flex-grow flex items-center justify-center h-full min-h-[50vh]">
        <Spinner size="lg" />
    </div>
);


const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<AppFeature>('design');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      // Delay to ensure the UI is rendered
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOnboardingClose = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };
  
  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'design':
        return <AestheticDesignFlow />;
      case 'xiaoqian':
        return <XiaoqianChatPage />;
      case 'knowledge':
        return <KnowledgeBasePage />;
      case 'cases':
        return <ConfidentialCasesPage />;
      default:
        return <AestheticDesignFlow />;
    }
  };

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-base)] font-sans flex flex-col">
        <Header />
        <main className="w-full max-w-5xl mx-auto p-4 flex-grow flex flex-col">
          <Suspense fallback={<LoadingFallback />}>
            {renderActiveFeature()}
          </Suspense>
        </main>
        <TrueFooter />
        <Footer activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
        <OnboardingGuide
            isOpen={showOnboarding}
            onClose={handleOnboardingClose}
            steps={tourSteps}
        />
      </div>
    </SettingsProvider>
  );
};

export default App;
