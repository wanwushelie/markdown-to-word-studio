import React from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';
import { showToast } from '../ui/Toast';
import { useI18n } from '../../i18n';

interface EditorToolbarProps {
  onInsertText: (before: string, after: string) => void;
}

export function EditorToolbar({ onInsertText }: EditorToolbarProps) {
  const { markdown, config, meta } = useStore();
  const { t, language } = useI18n();
  const [showGuide, setShowGuide] = React.useState(false);

  const handleDownload = async () => {
    try {
      const blob = await api.convertToDocx({ markdown, config, meta });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.title || 'document'}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(t('downloadSuccess'));
    } catch (err) {
      showToast(`${t('downloadFailed')}: ${(err as Error).message}`, 'error');
    }
  };

  const openGuide = () => setShowGuide(true);
  const closeGuide = () => setShowGuide(false);

  const toolbarBtns = [
    { label: 'B', title: t('bold'), action: () => onInsertText('**', '**'), className: 'font-bold' },
    { label: 'I', title: t('italic'), action: () => onInsertText('*', '*'), className: 'italic' },
    { label: 'U', title: t('underline'), action: () => onInsertText('<u>', '</u>'), className: 'underline' },
    { label: 'H1', title: t('heading1'), action: () => onInsertText('# ', '') },
    { label: 'H2', title: t('heading2'), action: () => onInsertText('## ', '') },
    { label: 'H3', title: t('heading3'), action: () => onInsertText('### ', '') },
    { label: t('list'), title: t('list'), action: () => onInsertText('- ', '') },
    { label: '1.', title: t('orderedList'), action: () => onInsertText('1. ', '') },
    { label: t('quote'), title: t('quote'), action: () => onInsertText('> ', '') },
    { label: t('codeBlock'), title: t('codeBlock'), action: () => onInsertText('```\\n', '\\n```') },
    { label: t('table'), title: t('table'), action: () => onInsertText('| A | B |\\n|---|---|\\n| 1 | 2 |', '') },
  ];

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-2.5 py-1.5 flex gap-1 flex-wrap shrink-0">
        {toolbarBtns.map(btn => (
          <button
            key={btn.title}
            onClick={btn.action}
            title={btn.title}
            className={`px-2 py-1 border border-gray-200 bg-white rounded text-xs hover:bg-gray-100 ${btn.className || ''}`}
          >
            {btn.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={openGuide}
          className="px-2 py-1 border border-gray-200 bg-white rounded text-xs hover:bg-gray-100"
          title={language === 'zh-CN' ? '查看 Markdown 说明' : 'Open Markdown guide'}
        >
          {language === 'zh-CN' ? '说明' : 'Guide'}
        </button>
        <button
          onClick={handleDownload}
          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 rounded text-xs transition-colors"
        >
          {t('downloadDocx')}
        </button>
      </div>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={closeGuide}
        >
          <div
            className="w-[min(960px,96vw)] h-[min(760px,92vh)] bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-11 px-3 border-b border-gray-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-700">
                {language === 'zh-CN' ? 'Markdown 使用说明' : 'Markdown Guide'}
              </div>
              <button
                onClick={closeGuide}
                className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100"
              >
                {language === 'zh-CN' ? '关闭' : 'Close'}
              </button>
            </div>
            <iframe
              title="Markdown Guide"
              src="/markdown-guide.html"
              className="w-full h-[calc(100%-44px)] border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
