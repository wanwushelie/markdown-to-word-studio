import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import MarkdownIt from 'markdown-it';
import { useStore, PreviewMode } from '../../store/useStore';
import { api } from '../../services/api';
import { getCoreOnlyModeMessage, getUserFacingErrorMessage } from '../../services/capabilities/errors';
import { htmlTemplates } from '../../utils/templates';
import { showToast } from '../ui/Toast';
import { useI18n } from '../../i18n';

const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });
const HtmlStyleImport = React.lazy(async () => {
  const module = await import('./HtmlStyleImport');
  return { default: module.HtmlStyleImport };
});

export function PreviewPanel() {
  const {
    markdown,
    config,
    meta,
    previewMode,
    setPreviewMode,
    htmlTemplate,
    setHtmlTemplate,
    autoPreview,
    setAutoPreview,
    htmlStyles,
    language,
    capabilities,
    docxExecutionMode,
  } = useStore();
  const { t } = useI18n();
  const [status, setStatus] = useState(t('ready'));
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [collaboraData, setCollaboraData] = useState<{ fileId: string; accessToken: string; url: string } | null>(null);
  const [previewContainer, setPreviewContainer] = useState<HTMLDivElement | null>(null);
  const [wordZoom, setWordZoom] = useState(1);
  const [docxProviderHint, setDocxProviderHint] = useState('');
  const coreOnlyMessage = useMemo(() => getCoreOnlyModeMessage(capabilities, language), [capabilities, language]);

  useEffect(() => {
    setStatus(t('ready'));
  }, [t]);

  const fitWordPreview = useCallback(() => {
    if (!previewContainer) return;
    const page = previewContainer.querySelector<HTMLElement>('.docx');
    if (!page) return;
    const availableWidth = Math.max(previewContainer.parentElement?.clientWidth || 320, 320) - 36;
    const pageWidth = page.offsetWidth || 794;
    const nextZoom = Math.min(1.3, Math.max(0.35, availableWidth / pageWidth));
    setWordZoom(Number(nextZoom.toFixed(2)));
  }, [previewContainer]);

  const renderDocxBlob = useCallback(
    async (blob: Blob) => {
      if (!previewContainer) return;
      const { renderAsync } = await import('docx-preview');
      previewContainer.innerHTML = '';
      await renderAsync(blob, previewContainer, undefined, {
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        useBase64URL: true,
      });
      requestAnimationFrame(() => fitWordPreview());
    },
    [fitWordPreview, previewContainer],
  );

  const generatePreview = useCallback(
    async (trigger: 'auto' | 'manual' | 'mode' = 'manual') => {
      if (!markdown.trim()) return;
      setStatus(t('generating'));

      try {
        if (previewMode === 'local') {
          const executionInfo = await api.getDocxExecutionInfo(docxExecutionMode);
          const blob = await api.convertToDocx({ markdown, config, meta }, { mode: docxExecutionMode });
          setDocxProviderHint(
            executionInfo.activeProviderId === 'server'
              ? language === 'zh-CN'
                ? '当前使用：服务器引擎'
                : 'Using: server engine'
              : executionInfo.activeProviderId === 'browser'
                ? language === 'zh-CN'
                  ? '当前使用：浏览器引擎'
                  : 'Using: browser engine'
                : '',
          );
          await renderDocxBlob(blob);
        } else if (previewMode === 'pdf') {
          const blob = await api.convertToPdf({ markdown, config, meta });
          setPdfUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        } else if (previewMode === 'collabora') {
          const data = await api.createPreviewSession({ markdown, config, meta });
          setCollaboraData({ fileId: data.fileId, accessToken: data.accessToken, url: data.collaboraUrl });
        } else {
          setDocxProviderHint('');
        }

        setStatus(t('ready'));
        if (trigger !== 'auto') {
          if (previewMode === 'local') showToast(t('localPreviewLoaded'), 'success', { dedupeMs: 1200 });
          if (previewMode === 'pdf') showToast(t('pdfPreviewLoaded'), 'success', { dedupeMs: 1200 });
          if (previewMode === 'collabora') showToast(t('collaboraLoaded'), 'success', { dedupeMs: 1200 });
        }
      } catch (error) {
        setStatus(t('error'));
        if (previewMode === 'local') {
          setDocxProviderHint('');
        }
        showToast(getUserFacingErrorMessage(error, language), 'error', { dedupeMs: 1200 });
      }
    },
    [config, docxExecutionMode, language, markdown, meta, previewMode, renderDocxBlob, t],
  );

  useEffect(() => {
    if (previewMode !== 'local') return;
    const handler = () => fitWordPreview();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [fitWordPreview, previewMode]);

  useEffect(() => {
    if (!autoPreview) return;
    const timer = setTimeout(() => {
      if (previewMode === 'local' || previewMode === 'markdown' || previewMode === 'html') {
        void generatePreview('auto');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [autoPreview, config, generatePreview, markdown, previewMode]);

  useEffect(() => {
    void generatePreview('mode');
  }, [generatePreview, htmlTemplate, previewMode]);

  useEffect(() => {
    if (previewMode === 'pdf' && !capabilities.pdfLocal) {
      setPreviewMode('local');
      return;
    }
    if (previewMode === 'collabora' && !capabilities.collabora) {
      setPreviewMode('local');
    }
  }, [capabilities.collabora, capabilities.pdfLocal, previewMode, setPreviewMode]);

  useEffect(() => {
    if (previewMode !== 'local') {
      if (previewContainer) {
        previewContainer.innerHTML = '';
      }
      setDocxProviderHint('');
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
  }, [previewContainer, previewMode]);

  const handleDownload = async () => {
    try {
      const blob =
        previewMode === 'collabora' && collaboraData
          ? await api.downloadCollaboraFile(collaboraData.fileId, collaboraData.accessToken)
          : await api.convertToDocx({ markdown, config, meta }, { mode: docxExecutionMode });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.title || 'document'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('downloadSuccess'));
    } catch (error) {
      showToast(getUserFacingErrorMessage(error, language), 'error');
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob =
        previewMode === 'collabora' && collaboraData
          ? await api.exportCollaboraPdf(collaboraData.fileId, collaboraData.accessToken)
          : await api.convertToPdf({ markdown, config, meta });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.title || 'document'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('pdfExported'));
    } catch (error) {
      showToast(getUserFacingErrorMessage(error, language), 'error');
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
          <div
            className="bg-white p-6 rounded shadow max-w-[800px] mx-auto md-preview"
            dangerouslySetInnerHTML={{ __html: mdParser.render(markdown) }}
          />
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
            <div
              className={isGlass ? 'glass-container' : ''}
              dangerouslySetInnerHTML={{ __html: mdParser.render(markdown) }}
            />
          </div>
        </div>
      );
    }

    if (previewMode === 'local') {
      return (
        <div key="preview-local" className="flex-1 overflow-auto bg-gray-200 p-5">
          <div ref={setPreviewContainer} style={{ zoom: wordZoom as never, width: 'max-content', minWidth: '100%', margin: '0 auto' }} />
        </div>
      );
    }

    if (previewMode === 'pdf') {
      return <iframe key="preview-pdf" title="PDF preview" src={pdfUrl || ''} className="flex-1 w-full border-none bg-white" />;
    }

    if (previewMode === 'collabora') {
      return (
        <iframe
          key="preview-collabora"
          title="Collabora preview"
          src={collaboraData?.url || ''}
          allow="fullscreen; clipboard-read; clipboard-write"
          className="flex-1 w-full border-none bg-white"
        />
      );
    }

    return null;
  };

  const modeLabels: Record<PreviewMode, string> = {
    markdown: 'Markdown',
    html: 'HTML',
    local: 'docx-preview',
    pdf: 'PDF',
    collabora: 'Collabora',
  };

  const getModeTagStyle = () => {
    switch (previewMode) {
      case 'markdown':
        return 'bg-orange-100 text-orange-700';
      case 'html':
        return 'bg-pink-100 text-pink-700';
      case 'local':
        return 'bg-blue-100 text-blue-700';
      case 'pdf':
        return 'bg-green-100 text-green-700';
      case 'collabora':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'string') return;
      try {
        const message = JSON.parse(event.data);
        if (message.MessageId === 'App_LoadingStatus' && message.Values?.Status === 'Document_Loaded') {
          setStatus(t('editorReady'));
        }
        if (message.MessageId === 'Action_Save_Resp' && message.Values?.success) {
          showToast(t('docSavedInEditor'));
        }
      } catch {
        // Ignore invalid postMessage payloads from other frames.
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [t]);

  return (
    <div className="flex-1 flex flex-col min-w-[380px] bg-gray-200">
      <div className="bg-white border-b border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 flex items-center shrink-0 flex-wrap gap-2">
        {t('preview')}
        <select
          value={previewMode}
          onChange={(event) => setPreviewMode(event.target.value as PreviewMode)}
          className="ml-2 text-[11px] py-0.5 px-1 rounded border border-gray-300 bg-white cursor-pointer"
        >
          <option value="markdown">{t('modeMarkdown')}</option>
          <option value="html">{t('modeHtml')}</option>
          <option value="local">{t('modeLocal')}</option>
          <option value="pdf" disabled={!capabilities.pdfLocal}>
            {t('modePdf')}
          </option>
          <option value="collabora" disabled={!capabilities.collabora}>
            {t('modeCollabora')}
          </option>
        </select>

        {previewMode === 'html' && (
          <select
            value={htmlTemplate}
            onChange={(event) => setHtmlTemplate(event.target.value)}
            className="text-[11px] py-0.5 px-1 rounded border border-gray-300 bg-white cursor-pointer max-w-[260px]"
          >
            {htmlStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {language === 'zh-CN' ? `${style.nameZh} (${style.nameEn})` : `${style.nameEn} (${style.nameZh})`}
              </option>
            ))}
          </select>
        )}

        <span className={`px-2 py-0.5 rounded text-[11px] ${getModeTagStyle()}`}>{modeLabels[previewMode]}</span>
      </div>

      <div className="bg-white border-b border-gray-200 px-2.5 py-1.5 flex gap-1.5 items-center shrink-0 flex-wrap">
        {(previewMode === 'local' || previewMode === 'pdf' || previewMode === 'collabora') && (
          <button onClick={() => void generatePreview('manual')} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100">
            {language === 'zh-CN' ? '重新生成' : 'Regenerate'}
          </button>
        )}

        {previewMode === 'local' && (
          <>
            <button onClick={() => setWordZoom((value) => Math.max(0.35, Number((value - 0.1).toFixed(2))))} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100">
              -
            </button>
            <span className="text-[11px] text-gray-600 w-12 text-center">{Math.round(wordZoom * 100)}%</span>
            <button onClick={() => setWordZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(2))))} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100">
              +
            </button>
            <button onClick={() => setWordZoom(1)} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100">
              100%
            </button>
            <button onClick={fitWordPreview} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100">
              {language === 'zh-CN' ? '适配宽度' : 'Fit Width'}
            </button>
            {docxProviderHint ? <span className="text-[11px] text-gray-500 px-1">{docxProviderHint}</span> : null}
          </>
        )}

        <button onClick={handleDownload} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100 disabled:opacity-50">
          {t('downloadDocx')}
        </button>
        <button
          onClick={handleExportPdf}
          disabled={!capabilities.pdfLocal}
          className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100 disabled:opacity-50"
          title={!capabilities.pdfLocal ? (language === 'zh-CN' ? 'PDF 导出需要服务端版或完整本地版。' : 'PDF export requires the server edition or full local edition.') : ''}
        >
          {t('exportPdf')}
        </button>

        <label className="flex items-center gap-1 text-[11px] text-gray-600 ml-auto cursor-pointer">
          <input type="checkbox" checked={autoPreview} onChange={(event) => setAutoPreview(event.target.checked)} />
          {t('auto')}
        </label>

        {previewMode === 'collabora' && collaboraData?.url && (
          <button onClick={openCollaboraInNewWindow} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100">
            {language === 'zh-CN' ? '打开新窗口' : 'Open Window'}
          </button>
        )}

        {coreOnlyMessage ? <span className="text-[11px] text-amber-600">{coreOnlyMessage}</span> : null}
        <span className="text-[11px] text-gray-500 w-24 text-right">{status}</span>
      </div>

      {previewMode === 'html' && (
        <Suspense fallback={<div className="bg-white border-b border-gray-200 px-3 py-2 text-[11px] text-gray-500">{language === 'zh-CN' ? '正在加载样式导入工具…' : 'Loading style import…'}</div>}>
          <HtmlStyleImport />
        </Suspense>
      )}
      {renderContent()}
    </div>
  );
}
