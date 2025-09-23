


import React, { useState } from 'react';
import SettingsModal from './SettingsModal.tsx';
import AboutModal from './AboutModal.tsx';

const InformationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.7-4.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM12 15a.75.75 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v4.5A.75.75 0 0012 15z" clipRule="evenodd" />
    </svg>
);

const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.946 1.52l-.26 1.04a2.25 2.25 0 001.628 2.628l1.039.26a2.25 2.25 0 002.628-1.628l.26-1.04A2.253 2.253 0 0013.322 2.25h-2.244zM16.122 4.22a.75.75 0 01.97 1.34l.618-.463a2.25 2.25 0 00-1.34-3.939l-.617.463a.75.75 0 01-.353.97zM4.88 4.22a.75.75 0 01.353-.97l.617-.463a2.25 2.25 0 00-1.34 3.939l.618.463a.75.75 0 01.97-1.34zM2.25 11.078c0 .917.663 1.699 1.52 1.946l1.04.26a2.25 2.25 0 002.628-1.628l.26-1.039a2.25 2.25 0 00-1.628-2.628l-1.04-.26A2.253 2.253 0 002.25 8.834v2.244zM19.779 16.122a.75.75 0 01-1.34-.97l.463-.618a2.25 2.25 0 003.939 1.34l-.463.617a.75.75 0 01-.97.353zM4.221 16.122a.75.75 0 01.97.353l.463.617a2.25 2.25 0 003.939-1.34l-.463-.618a.75.75 0 01-1.34-.97zM21.75 11.078v2.244c0 .917-.663 1.699-1.52 1.946l-1.04.26a2.25 2.25 0 00-2.628-1.628l-.26-1.039a2.25 2.25 0 001.628-2.628l1.04-.26A2.253 2.253 0 0021.75 8.834zM11.078 19.75a2.253 2.253 0 001.946-1.52l.26-1.04a2.25 2.25 0 00-1.628-2.628l-1.039-.26a2.25 2.25 0 00-2.628 1.628l-.26 1.04A2.253 2.253 0 008.834 21.75h2.244zM16.122 19.779a.75.75 0 01.97-.353l.618.463a2.25 2.25 0 00-1.34 3.939l-.617-.463a.75.75 0 01-.353-.97zM4.88 19.779a.75.75 0 01.353.97l.617.463a2.25 2.25 0 00-1.34-3.939l.618-.463a.75.75 0 01.97.353z" clipRule="evenodd" />
      <path d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM10.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
    </svg>
);


const Header: React.FC = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    return (
        <>
            <header className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <img src="https://docs.bccsw.cn/images/const-yeqian/headlogo.png" alt="Logo" className="h-10 w-10 rounded-full object-cover" />
                            <span className="text-xl text-[var(--color-text-base)] hidden sm:block">
                                叶倩倩的美学小屋
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button
                                onClick={() => setIsAboutOpen(true)}
                                aria-label="打开关于"
                                className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] focus:ring-[var(--color-primary)] transition-colors"
                                data-tour-id="about-button"
                            >
                                <InformationCircleIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                aria-label="打开设置"
                                className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] focus:ring-[var(--color-primary)] transition-colors"
                                data-tour-id="settings-button"
                            >
                                <CogIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </>
    );
};

export default Header;