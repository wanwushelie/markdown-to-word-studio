import React, { useEffect, useState, useCallback } from 'react';
import MarkdownIt from 'markdown-it';
import { renderAsync } from 'docx-preview';
import { useStore, PreviewMode } from '../../store/useStore';
import { api } from '../../services/api';
import { htmlTemplates } from '../../utils/templates';
import { showToast } from '../ui/Toast';
import { useI18n } from '../../i18n';
import { HtmlStyleImport } from './HtmlStyleImport';

const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });

export function PreviewPanel() {
  const { markdown, config, meta, previewMode, setPreviewMode, htmlTemplate, setHtmlTemplate, autoPreview, setAutoPreview, htmlStyles, language, capabilities } = useStore();
  const { t } = useI18n();
  const [status, setStatus] = useState(t('ready'));
  const [localDocxUrl, setLocalDocxUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [collaboraData, setCollaboraData] = useState<{ fileId: string; accessToken: string; url: string } | null>(null);
  const [previewContainer, setPreviewContainer] = useState<HTMLDivElement | null>(null);
  const availableModes: PreviewMode[] = [
    'markdown',
    'html',
    ...(capabilities.localPreview ? ['local' as const] : []),
    ...(capabilities.pdfLocal ? ['pdf' as const] : []),
    ...(capabilities.collabora ? ['collabora' as const] : []),
  ];

  useEffect(() => {
    setStatus(t('ready'));
  }, [t]);

  const generatePreview = useCallback(async (trigger: 'auto' | 'manual' | 'mode' = 'manual') => {
    if (!markdown.trim()) return;
    setStatus(t('generating'));

    try {
      if (previewMode === 'local') {
        const blob = await api.convertToDocx({ markdown, config, meta });
        setLocalDocxUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        if (previewContainer) {
          await renderAsync(blob, previewContainer, undefined, {
            inWrapper: true, ignoreWidth: false, ignoreHeight: false, ignoreFonts: false, breakPages: true, useBase64URL: true
          });
        }
      } else if (previewMode === 'pdf') {
        const blob = await api.convertToPdf({ markdown, config, meta });
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      } else if (previewMode === 'collabora') {
        const data = await api.createPreviewSession({ markdown, config, meta });
        setCollaboraData({ fileId: data.fileId, accessToken: data.accessToken, url: data.collaboraUrl });
      }
      setStatus(t('ready'));
      if (trigger !== 'auto') {
        if (previewMode === 'local') showToast(t('localPreviewLoaded'), 'success', { dedupeMs: 1200 });
        if (previewMode === 'pdf') showToast(t('pdfPreviewLoaded'), 'success', { dedupeMs: 1200 });
        if (previewMode === 'collabora') showToast(t('collaboraLoaded'), 'success', { dedupeMs: 1200 });
      }
    } catch (error) {
      setStatus(t('error'));
      showToast((error as Error).message, 'error', { dedupeMs: 1200 });
    }
  }, [markdown, config, meta, previewMode, previewContainer, t]);

  useEffect(() => {
    if (!autoPreview) return;
    const timer = setTimeout(() => {
      if (previewMode === 'local' || previewMode === 'markdown' || previewMode === 'html') {
        generatePreview('auto');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [markdown, config, autoPreview, previewMode, generatePreview]);

  useEffect(() => {
    generatePreview('mode');
  }, [previewMode, htmlTemplate, generatePreview]);

  useEffect(() => {
    if (!availableModes.includes(previewMode)) {
      setPreviewMode('markdown');
    }
  }, [availableModes, previewMode, setPreviewMode]);

  useEffect(() => {
    if (previewMode !== 'local') {
      if (previewContainer) {
        previewContainer.innerHTML = '';
      }
      setLocalDocxUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
    if (previewMode !== 'pdf') {
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
    if (previewMode !== 'collabora') {
      setCollaboraData(null);
    }
  }, [previewMode]);

  const handleDownload = async () => {
    try {
      const blob = previewMode === 'collabora' && collaboraData
        ? await api.downloadCollaboraFile(collaboraData.fileId, collaboraData.accessToken)
        : await api.convertToDocx({ markdown, config, meta });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.title || 'document'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('downloadSuccess'));
    } catch (e) {
      showToast(t('downloadFailed'), 'error');
    }
  };

  const handleExportPdf = async () => {
    if (!capabilities.pdfLocal) {
      showToast('PDF export is unavailable in current environment.', 'error');
      return;
    }
    try {
      const blob = previewMode === 'collabora' && collaboraData
        ? await api.exportCollaboraPdf(collaboraData.fileId, collaboraData.accessToken)
        : await api.convertToPdf({ markdown, config, meta });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.title || 'document'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('pdfExported'));
    } catch (e) {
      showToast(t('pdfExportFailed'), 'error');
    }
  };

  const openCollaboraInNewWindow = () => {
    if (!collaboraData?.url) return;
    window.open(collaboraData.url, '_blank', 'noopener,noreferrer');
  };

  const renderContent = () => {
    if (previewMode === 'markdown') {
      return (
        <div key="preview-markdown" className="flex-1 overflow-auto bg-gray-200 p-5">
          <div className="bg-white p-6 rounded shadow max-w-[800px] mx-auto md-preview" dangerouslySetInnerHTML={{ __html: mdParser.render(markdown) }} />
        </div>
      );
    }
    if (previewMode === 'html') {
      const selected = htmlStyles.find((style) => style.id === htmlTemplate);
      const css = selected?.css || htmlTemplates[htmlTemplate] || htmlTemplates.modernDark;
      const isGlass = htmlTemplate === 'glassmorphism';
      return (
        <div key="preview-html" className="flex-1 overflow-auto bg-gray-200">
          <style>{css}</style>
          <div className="html-creative-preview min-h-full">
            <div className={isGlass ? 'glass-container' : ''} dangerouslySetInnerHTML={{ __html: mdParser.render(markdown) }} />
          </div>
        </div>
      );
    }
    if (previewMode === 'local') return <div key="preview-local" className="flex-1 overflow-auto bg-gray-200 p-5" ref={setPreviewContainer} />;
    if (previewMode === 'pdf') return <iframe key="preview-pdf" title="PDF preview" src={pdfUrl || ''} className="flex-1 w-full border-none bg-white" />;
    if (previewMode === 'collabora') return <iframe key="preview-collabora" title="Collabora preview" src={collaboraData?.url || ''} allow="fullscreen; clipboard-read; clipboard-write" className="flex-1 w-full border-none bg-white" />;
    return null;
  };

  const getModeTagStyle = () => {
    switch(previewMode) {
      case 'markdown': return 'bg-orange-100 text-orange-700';
      case 'html': return 'bg-pink-100 text-pink-700';
      case 'local': return 'bg-blue-100 text-blue-700';
      case 'pdf': return 'bg-green-100 text-green-700';
      case 'collabora': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const modeLabels: Record<PreviewMode, string> = {
    markdown: 'Markdown', html: 'HTML', local: 'docx-preview', pdf: 'PDF', collabora: 'Collabora'
  };

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'string') return;
      try {
        const msg = JSON.parse(e.data);
        if (msg.MessageId === 'App_LoadingStatus' && msg.Values?.Status === 'Document_Loaded') {
          setStatus(t('editorReady'));
        }
        if (msg.MessageId === 'Action_Save_Resp' && msg.Values?.success) {
          showToast(t('docSavedInEditor'));
        }
      } catch (_) {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [t]);

  return (
    <div className="flex-1 flex flex-col min-w-[380px] bg-gray-200">
      <div className="bg-white border-b border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 flex items-center shrink-0 flex-wrap gap-2">
        {t('preview')}
        <select value={previewMode} onChange={e => setPreviewMode(e.target.value as PreviewMode)} className="ml-2 text-[11px] py-0.5 px-1 rounded border border-gray-300 bg-white cursor-pointer">
          <option value="markdown">{t('modeMarkdown')}</option>
          <option value="html">{t('modeHtml')}</option>
          {capabilities.localPreview && <option value="local">{t('modeLocal')}</option>}
          {capabilities.pdfLocal && <option value="pdf">{t('modePdf')}</option>}
          {capabilities.collabora && <option value="collabora">{t('modeCollabora')}</option>}
        </select>

        {previewMode === 'html' && (
          <select value={htmlTemplate} onChange={e => setHtmlTemplate(e.target.value)} className="text-[11px] py-0.5 px-1 rounded border border-gray-300 bg-white cursor-pointer max-w-[260px]">
            {htmlStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {language === 'zh-CN'
                  ? `${style.nameZh} (${style.nameEn})`
                  : `${style.nameEn} (${style.nameZh})`}
              </option>
            ))}
          </select>
        )}

        <span className={`px-2 py-0.5 rounded text-[11px] ${getModeTagStyle()}`}>{modeLabels[previewMode]}</span>
      </div>

      <div className="bg-white border-b border-gray-200 px-2.5 py-1.5 flex gap-1.5 items-center shrink-0 flex-wrap">
        <button onClick={() => generatePreview('manual')} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100">{t('refresh')}</button>
        <button onClick={handleDownload} disabled={!localDocxUrl && !pdfUrl && !collaboraData} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100 disabled:opacity-50">
          {t('downloadDocx')}
        </button>
        <button onClick={handleExportPdf} disabled={!capabilities.pdfLocal || (!localDocxUrl && !pdfUrl && !collaboraData)} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100 disabled:opacity-50">
          {t('exportPdf')}
        </button>
        <label className="flex items-center gap-1 text-[11px] text-gray-600 ml-auto cursor-pointer">
          <input type="checkbox" checked={autoPreview} onChange={e => setAutoPreview(e.target.checked)} />
          {t('auto')}
        </label>
        {previewMode === 'collabora' && collaboraData?.url && (
          <button
            onClick={openCollaboraInNewWindow}
            className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100"
            title={language === 'zh-CN' ? '若内嵌预览异常，使用新窗口打开' : 'Open in a new window when iframe preview fails'}
          >
            {language === 'zh-CN' ? '新窗口打开' : 'Open Window'}
          </button>
        )}
        <span className="text-[11px] text-gray-500 w-20 text-right">{status}</span>
      </div>

      {previewMode === 'html' && <HtmlStyleImport />}

      {renderContent()}
    </div>
  );
}
