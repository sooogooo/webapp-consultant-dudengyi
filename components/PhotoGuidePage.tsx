import React, { useState, useRef, useEffect } from 'react';
import { Photo } from '../types.ts';
import Spinner from './shared/Spinner.tsx';
import { validatePhoto } from '../services/geminiService.ts';

// Icons
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);
const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
        <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.152-.177.465-.067.87-.327 1.11-.71l.821-1.317a3.75 3.75 0 012.332-1.39zM12 16.5a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5z" clipRule="evenodd" />
    </svg>
);
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
    </svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.088 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h.064c1.603 0 2.816 1.336 2.816 2.9zM12 6.75a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75zM8.25 6a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 018.25 6zm7.5 0a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);


interface PhotoGuidePageProps {
  onComplete: (photos: Photo[]) => void;
}

const fileToBase64AndUrl = (file: File): Promise<{ base64: string; mimeType: string; url: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve({
        base64: dataUrl.split(',')[1],
        mimeType: file.type,
        url: URL.createObjectURL(file)
      });
    };
    reader.onerror = (error) => reject(error);
  });

const PhotoGuidePage: React.FC<PhotoGuidePageProps> = ({ onComplete }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

    useEffect(() => {
        // Initialize with a placeholder for the frontal photo
        setPhotos([{ id: 'frontal', pose: '正面照 (必须)', url: '', base64: '', mimeType: '', quality: null }]);
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !uploadTargetId) return;

        const currentPhotoIndex = photos.findIndex(p => p.id === uploadTargetId);
        if (currentPhotoIndex === -1) return;
        
        const oldUrl = photos[currentPhotoIndex].url;
        if(oldUrl) URL.revokeObjectURL(oldUrl);

        setIsLoading(prev => ({ ...prev, [uploadTargetId]: true }));
        
        try {
            const { base64, mimeType, url } = await fileToBase64AndUrl(file);
            
            const updatedPhotos = [...photos];
            updatedPhotos[currentPhotoIndex] = { ...updatedPhotos[currentPhotoIndex], url, base64, mimeType, quality: null };
            setPhotos(updatedPhotos);

            const qualityResult = await validatePhoto(base64, mimeType);

            setPhotos(prev => {
                const finalPhotos = [...prev];
                const idx = finalPhotos.findIndex(p => p.id === uploadTargetId);
                if (idx > -1) {
                    finalPhotos[idx] = { ...finalPhotos[idx], quality: qualityResult };
                }
                return finalPhotos;
            });

        } catch (error) {
            console.error("Error processing file:", error);
            setPhotos(prev => {
                const finalPhotos = [...prev];
                 const idx = finalPhotos.findIndex(p => p.id === uploadTargetId);
                if (idx > -1) {
                    finalPhotos[idx].quality = { passed: false, message: '文件处理失败。' };
                }
                return finalPhotos;
            });
        } finally {
            setIsLoading(prev => ({ ...prev, [uploadTargetId]: false }));
            setUploadTargetId(null);
            if(event.target) event.target.value = ''; // Allow re-uploading the same file
        }
    };
    
    const triggerUpload = (id: string) => {
        setUploadTargetId(id);
        fileInputRef.current?.click();
    };
    
    const addPhotoSlot = () => {
        const newId = `extra_${Date.now()}`;
        setPhotos(prev => [...prev, { id: newId, pose: `补充照片 #${prev.length}`, url: '', base64: '', mimeType: '', quality: null }]);
    };
    
    const removePhoto = (id: string) => {
        const photoToRemove = photos.find(p => p.id === id);
        if (photoToRemove?.url) {
            URL.revokeObjectURL(photoToRemove.url);
        }
        setPhotos(prev => prev.filter(p => p.id !== id));
    };

    const isComplete = photos.find(p => p.id === 'frontal')?.quality?.passed === true;
    const passedPhotos = photos.filter(p => p.quality?.passed);

  return (
    <div className="max-w-4xl mx-auto p-4">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="user"
            className="hidden"
        />
        <h1 className="text-3xl font-bold text-center text-[var(--color-text-base)] mb-2">上传您的照片</h1>
        <p className="text-[var(--color-text-muted)] text-center mb-8">
            请上传一张清晰的正面照。为了获得更全面的建议，我们强烈推荐您提供更多角度的照片。
        </p>

        <div className="space-y-8">
            {/* Main Photo Section */}
            <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text-base)] border-b-2 border-[var(--color-border)] pb-2 mb-4">正面照 (必须)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {photos.filter(p => p.id === 'frontal').map(photo => (
                        <div key={photo.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 flex flex-col items-center justify-between min-h-[350px]">
                            <h3 className="text-xl font-semibold text-[var(--color-text-base)]">{photo.pose}</h3>
                            <div className="w-48 h-48 bg-[var(--color-background)] rounded-md flex items-center justify-center my-2 overflow-hidden">
                                {photo.url ? <img src={photo.url} alt={photo.pose} className="w-full h-full object-cover" /> : <CameraIcon className="w-16 h-16 text-[var(--color-text-muted)]" />}
                            </div>
                            <div className="h-16 flex flex-col items-center justify-center text-center">
                                {isLoading[photo.id] && <div className="flex items-center space-x-2 text-[var(--color-warning)]"><Spinner size="sm" /><span>正在检测...</span></div>}
                                {photo.quality && !isLoading[photo.id] && (photo.quality.passed ?
                                    <div className="flex items-center space-x-2 text-[var(--color-success)]"><CheckIcon className="w-6 h-6" /><span>{photo.quality.message}</span></div> :
                                    <div className="text-center"><p className="flex items-center space-x-2 text-[var(--color-danger)]"><XCircleIcon className="w-5 h-5" /><span>检测未通过</span></p><p className="text-xs text-[var(--color-text-muted)] mt-1">{photo.quality.message}</p></div>
                                )}
                            </div>
                            <button onClick={() => triggerUpload(photo.id)} disabled={isLoading[photo.id]} className="w-full mt-2 flex justify-center items-center px-4 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50">
                                {photo.url ? '重新上传' : '上传/拍摄照片'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Supplemental Photos Section */}
            <div>
                <h2 className="text-2xl font-semibold text-[var(--color-text-base)] border-b-2 border-[var(--color-border)] pb-2 mb-4">补充照片 (可选)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {photos.filter(p => p.id !== 'frontal').map(photo => (
                        <div key={photo.id} className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 flex flex-col items-center justify-between min-h-[350px]">
                            <button onClick={() => removePhoto(photo.id)} className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-base)]"><TrashIcon className="w-6 h-6" /></button>
                            <h3 className="text-xl font-semibold text-[var(--color-text-base)]">{photo.pose}</h3>
                            <div className="w-48 h-48 bg-[var(--color-background)] rounded-md flex items-center justify-center my-2 overflow-hidden">
                                {photo.url ? <img src={photo.url} alt={photo.pose} className="w-full h-full object-cover" /> : <CameraIcon className="w-16 h-16 text-[var(--color-text-muted)]" />}
                            </div>
                            <div className="h-16 flex flex-col items-center justify-center text-center">
                                {isLoading[photo.id] && <div className="flex items-center space-x-2 text-[var(--color-warning)]"><Spinner size="sm" /><span>正在检测...</span></div>}
                                {photo.quality && !isLoading[photo.id] && (photo.quality.passed ?
                                    <div className="flex items-center space-x-2 text-[var(--color-success)]"><CheckIcon className="w-6 h-6" /><span>{photo.quality.message}</span></div> :
                                    <div className="text-center"><p className="flex items-center space-x-2 text-[var(--color-danger)]"><XCircleIcon className="w-5 h-5" /><span>检测未通过</span></p><p className="text-xs text-[var(--color-text-muted)] mt-1">{photo.quality.message}</p></div>
                                )}
                            </div>
                            <button onClick={() => triggerUpload(photo.id)} disabled={isLoading[photo.id]} className="w-full mt-2 flex justify-center items-center px-4 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50">
                                {photo.url ? '重新上传' : '上传照片'}
                            </button>
                        </div>
                    ))}
                    <button onClick={addPhotoSlot} className="min-h-[350px] flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:border-[var(--color-text-base)] transition-colors">
                        <PlusIcon className="w-12 h-12" />
                        <span>添加更多照片</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="mt-10 text-center">
            <button onClick={() => onComplete(passedPhotos)} disabled={!isComplete || Object.values(isLoading).some(s => s)} className="w-full md:w-auto px-12 py-4 bg-[var(--color-success)] text-white font-bold rounded-lg text-lg hover:opacity-90 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed">
                {isComplete ? `继续 (${passedPhotos.length} 张照片)` : `请上传一张合格的正面照`}
            </button>
        </div>
    </div>
  );
};

export default PhotoGuidePage;