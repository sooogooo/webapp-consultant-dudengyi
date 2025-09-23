import React, { useRef } from 'react';
import { SessionData } from '../types.ts';
import { EXPORT_WATERMARK } from '../constants.ts';

// Since we are loading from CDN, we need to declare these global variables.
declare const jspdf: any;
declare const html2canvas: any;

interface ReportPageProps {
  sessionData: SessionData;
  onReset: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ sessionData, onReset }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { photos, problems, chatHistory, summary } = sessionData;

  const handleDownloadPdf = () => {
    if (!reportRef.current) return;
    const { jsPDF } = jspdf;
    
    // Get the computed background color from the element
    const backgroundColor = getComputedStyle(reportRef.current).backgroundColor;

    html2canvas(reportRef.current, {
      scale: 2, // Higher scale for better quality
      backgroundColor: backgroundColor,
      useCORS: true,
      onclone: (document: Document) => {
          const clonedReport = document.querySelector('[data-report-clone]');
          if(clonedReport) {
             (clonedReport as HTMLElement).style.fontFamily = "sans-serif";
          }
      }
    }).then((canvas: any) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`AI-医美咨询报告-${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text-base)]">咨询报告</h1>
        <div className="flex gap-4">
          <button
            onClick={handleDownloadPdf}
            className="px-6 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            下载 PDF
          </button>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-[var(--color-surface)] text-[var(--color-text-base)] font-semibold rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            开始新咨询
          </button>
        </div>
      </div>

      <div ref={reportRef} data-report-clone="true" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-8">
        <div className="border-b border-[var(--color-border)] pb-6 mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-base)]">AI 医美咨询摘要</h2>
          <p className="text-sm text-[var(--color-text-muted)]">生成于: {new Date().toLocaleDateString()}</p>
          <p className="text-xs text-[var(--color-danger)] mt-4 italic">{EXPORT_WATERMARK}</p>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="mb-8 p-6 bg-[var(--color-background)] rounded-lg">
            <h3 className="text-xl font-semibold text-[var(--color-text-base)] mb-4">AI 分析与后续步骤</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-[var(--color-info)]">建议的后续步骤</h4>
                <ul className="list-disc list-inside text-[var(--color-text-muted)] pl-2">
                  {summary.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[var(--color-warning)]">建议了解的主题</h4>
                <ul className="list-disc list-inside text-[var(--color-text-muted)] pl-2">
                  {summary.suggestedProjectCards.map((card, i) => <li key={i}>{card}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[var(--color-danger)]">潜在风险/注意事项</h4>
                <ul className="list-disc list-inside text-[var(--color-text-muted)] pl-2">
                  {summary.redFlags.length > 0 ? summary.redFlags.map((flag, i) => <li key={i}>{flag}</li>) : <li>从对话中未识别出特定风险点。</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* User Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-[var(--color-text-base)] mb-4">您关心的问题</h3>
            <div className="space-y-2">
              {problems.map(p => (
                <div key={p.id} className="bg-[var(--color-background)] p-3 rounded-md text-[var(--color-text-base)]">{p.name}</div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--color-text-base)] mb-4">已上传的照片</h3>
            <div className="grid grid-cols-2 gap-2">
              {photos.map(photo => (
                <div key={photo.id} className="text-center">
                    <img src={photo.url} alt={photo.pose} className="rounded-md w-full object-cover aspect-square" />
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{photo.pose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat History Section */}
        <div>
            <h3 className="text-xl font-semibold text-[var(--color-text-base)] mb-4">咨询记录</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-[var(--color-background)] rounded-lg">
                 {chatHistory.map((msg, index) => msg.role !== 'system' && (
                    <div key={index} className={`flex items-start gap-3 my-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`p-3 rounded-lg max-w-md ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-base)]'}`}>
                           {msg.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="text-center mt-8 pt-6 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-muted)]"><strong>免责声明：</strong> 此为 AI 生成的摘要，仅供参考，不构成医疗诊断。请咨询合格的医生以获取专业建议。</p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;