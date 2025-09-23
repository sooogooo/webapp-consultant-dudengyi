

import React, { useState, useCallback, useMemo } from 'react';
import { SessionData, Problem, Photo } from '../types.ts';
import { HEADER_IMAGES } from '../constants.ts';
import WelcomePage from './WelcomePage.tsx';
import PhotoGuidePage from './PhotoGuidePage.tsx';
import ProblemSelectionPage from './ProblemSelectionPage.tsx';
import ConsultationPage from './ConsultationPage.tsx';
import ReportPage from './ReportPage.tsx';
import PageHeader from './shared/PageHeader.tsx';

type DesignFlowPage = 'welcome' | 'photo_guide' | 'problem_selection' | 'consultation' | 'report';

const AestheticDesignFlow: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<DesignFlowPage>('welcome');
  const [sessionData, setSessionData] = useState<SessionData>({
    photos: [],
    problems: [],
    chatHistory: [],
    summary: null,
  });

  const headerImage = useMemo(() => HEADER_IMAGES[Math.floor(Math.random() * HEADER_IMAGES.length)], []);

  const updateSession = useCallback((data: Partial<SessionData>) => {
    setSessionData(prev => ({ ...prev, ...data }));
  }, []);

  const resetApp = useCallback(() => {
    // Revoke object URLs to prevent memory leaks
    sessionData.photos.forEach(photo => {
      if (photo.url && photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
    });

    setSessionData({
      photos: [],
      problems: [],
      chatHistory: [],
      summary: null,
    });
    setCurrentPage('welcome');
  }, [sessionData.photos]);

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage onStart={() => setCurrentPage('photo_guide')} />;
      case 'photo_guide':
        return <PhotoGuidePage onComplete={(photos: Photo[]) => {
          updateSession({ photos });
          setCurrentPage('problem_selection');
        }} />;
      case 'problem_selection':
        return <ProblemSelectionPage onComplete={(problems: Problem[]) => {
          updateSession({ problems });
          setCurrentPage('consultation');
        }} />;
      case 'consultation':
        return <ConsultationPage sessionData={sessionData} updateSession={updateSession} onComplete={() => setCurrentPage('report')} />;
      case 'report':
        return <ReportPage sessionData={sessionData} onReset={resetApp} />;
      default:
        return <WelcomePage onStart={() => setCurrentPage('photo_guide')} />;
    }
  };

  return (
    <div>
      <PageHeader
        image={headerImage}
        title="AI 美学设计"
        subtitle="开启您的个性化美丽之旅"
      />
      {renderPage()}
    </div>
  );
};

export default AestheticDesignFlow;