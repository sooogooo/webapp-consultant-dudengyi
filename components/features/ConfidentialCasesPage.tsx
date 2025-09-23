

import React, { useState, useMemo } from 'react';
import { CONFIDENTIAL_CASES, HEADER_IMAGES } from '../../constants.ts';
import PageHeader from '../shared/PageHeader.tsx';
import ImageModal from '../shared/ImageModal.tsx';
import { CaseImage } from '../../types.ts';

const ConfidentialCasesPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<CaseImage | null>(null);

    const headerImage = useMemo(() => HEADER_IMAGES[Math.floor(Math.random() * HEADER_IMAGES.length)], []);

    const handleUnlock = () => {
        if (password === '888888') {
            setIsUnlocked(true);
            setError('');
        } else {
            setError('密码错误，请重试。');
        }
    };

    const lockScreen = (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center text-[var(--color-text-base)] mb-4">保密案例</h1>
                <p className="text-center text-[var(--color-text-muted)] mb-6">此区域包含保密信息，请输入密码以继续访问。</p>
                <div className="flex flex-col gap-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                        placeholder="请输入密码"
                        className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-base)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <button
                        onClick={handleUnlock}
                        className="w-full px-4 py-3 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                    >
                        解锁
                    </button>
                </div>
                {error && <p className="text-center text-[var(--color-danger)] mt-4">{error}</p>}
                
                <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                    <h3 className="text-lg font-semibold text-[var(--color-text-base)]">没有密码？</h3>
                    <p className="text-[var(--color-text-muted)] my-2">请添加下方企业微信，联系美学设计师获取访问密码。</p>
                    <a href="https://work.weixin.qq.com/kfid/kfc3a2d96f7b2aa8473" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 group">
                        <img 
                            src="https://docs.bccsw.cn/images/const-yeqian/yeqian-barcode.png" 
                            alt="企业微信二维码" 
                            className="w-40 h-40 rounded-lg border border-[var(--color-border)] object-contain group-hover:opacity-80 transition-opacity" 
                        />
                    </a>
                </div>
            </div>
        </div>
    );

    const caseGallery = (
        <div className="max-w-4xl mx-auto">
             <div className="mb-8 p-4 bg-[var(--color-surface)] border-l-4 border-[var(--color-warning)] rounded-r-lg text-left shadow">
                <h2 className="text-lg font-bold text-[var(--color-warning)]">保密提醒</h2>
                <p className="text-[var(--color-text-muted)] mt-2">
                    请注意：以下案例均为真实客户，已获得展示授权。案例照片仅供您私人参考，严禁下载、截图、转发或用于任何商业用途。尊重隐私，从你我做起。
                </p>
            </div>
            <h1 className="text-3xl font-bold text-center text-[var(--color-text-base)] mb-8">保密案例展示</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {CONFIDENTIAL_CASES.map(caseItem => (
                    <button
                        key={caseItem.id}
                        onClick={() => setSelectedImage(caseItem)}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-background)] focus:ring-[var(--color-primary)]"
                    >
                        <img src={caseItem.url} alt={caseItem.description} className="w-full h-80 object-cover" loading="lazy" decoding="async" />
                        <div className="p-4">
                            <p className="text-center text-[var(--color-text-muted)] font-medium">{caseItem.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <PageHeader 
                image={headerImage}
                title="保密案例"
                subtitle="见证真实的美丽蜕变"
            />
            <div className="p-4">
                {!isUnlocked ? lockScreen : caseGallery}
            </div>
            {selectedImage && (
                <ImageModal
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    imageUrl={selectedImage.url}
                    description={selectedImage.description}
                />
            )}
        </div>
    );
};

export default ConfidentialCasesPage;
