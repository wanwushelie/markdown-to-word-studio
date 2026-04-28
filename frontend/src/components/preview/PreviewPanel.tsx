import React, { useEffect, useState, useCallback } from 'react';
import MarkdownIt from 'markdown-it';
import { renderAsync } from 'docx-preview';
import { useStore, PreviewMode } from '../../store/useStore';
import { api } from '../../services/api';
import { htmlTemplates } from '../../utils/templates';
import { showToast } from '../ui/Toast';

const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });

export function PreviewPanel() {
  const { markdown, config, meta, previewMode, setPreviewMode, htmlTemplate, setHtmlTemplate, autoPreview, setAutoPreview } = useStore();
  const [status, setStatus] = useState('Ready');
  const [localDocxUrl, setLocalDocxUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [collaboraData, setCollaboraData] = useState<{ fileId: string; accessToken: string; url: string } | null>(null);
  const [previewContainer, setPreviewContainer] = useState<HTMLDivElement | null>(null);

  const generatePreview = useCallback(async () => {
    if (!markdown.trim()) return;
    setStatus('Generating...');

    try {
      if (previewMode === 'local') {
        const blob = await api.convertToDocx({ markdown, config, meta });
        if (localDocxUrl) URL.revokeObjectURL(localDocxUrl);
        setLocalDocxUrl(URL.createObjectURL(blob));
        if (previewContainer) {
          await renderAsync(blob, previewContainer, undefined, {
            inWrapper: true, ignoreWidth: false, ignoreHeight: false, ignoreFonts: false, breakPages: true, useBase64URL: true
          });
        }
      } else if (previewMode === 'pdf') {
        const blob = await api.convertToPdf({ markdown, config, meta });
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(URL.createObjectURL(blob));
      } else if (previewMode === 'collabora') {
        const data = await api.createPreviewSession({ markdown, config, meta });
        setCollaboraData({ fileId: data.fileId, accessToken: data.accessToken, url: data.collaboraUrl });
      }
      setStatus('Ready');
      if (previewMode === 'local') showToast('Local preview loaded');
      if (previewMode === 'pdf') showToast('PDF preview loaded');
      if (previewMode === 'collabora') showToast('Collabora loaded');
    } catch (error) {
      setStatus('Error');
      showToast((error as Error).message, 'error');
    }
  }, [markdown, config, meta, previewMode, previewContainer]);

  useEffect(() => {
    if (!autoPreview) return;
    const timer = setTimeout(() => {
      if (previewMode === 'local' || previewMode === 'markdown' || previewMode === 'html') {
        generatePreview();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [markdown, config, autoPreview, previewMode, generatePreview]);

  // Load preview on mode change
  useEffect(() => {
    generatePreview();
  }, [previewMode, htmlTemplate]);

  const handleDownload = async () => {
    try {
      let blob;
      if (previewMode === 'collabora' && collaboraData) {
        blob = await api.downloadCollaboraFile(collaboraData.fileId, collaboraData.accessToken);
      } else if (previewMode === 'pdf') {
        blob = await api.convertToDocx({ markdown, config, meta });
      } else {
        blob = await api.convertToDocx({ markdown, config, meta });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.title || 'document'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Document downloaded');
    } catch (e) {
      showToast('Download failed', 'error');
    }
  };

  const handleExportPdf = async () => {
    try {
      let blob;
      if (previewMode === 'collabora' && collaboraData) {
        blob = await api.exportCollaboraPdf(collaboraData.fileId, collaboraData.accessToken);
      } else {
        blob = await api.convertToPdf({ markdown, config, meta });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.title || 'document'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('PDF exported');
    } catch (e) {
      showToast('PDF Export failed', 'error');
    }
  };

  const renderContent = () => {
    if (previewMode === 'markdown') {
      return (
        <div className="flex-1 overflow-auto bg-gray-200 p-5">
          <div className="bg-white p-6 rounded shadow max-w-[800px] mx-auto md-preview"
               dangerouslySetInnerHTML={{ __html: mdParser.render(markdown) }} />
        </div>
      );
    }
    if (previewMode === 'html') {
      const css = htmlTemplates[htmlTemplate] || htmlTemplates.modernDark;
      const isGlass = htmlTemplate === 'glassmorphism';
      return (
        <div className="flex-1 overflow-auto bg-gray-200">
          <style>{css}</style>
          <div className="html-creative-preview min-h-full">
            <div className={isGlass ? 'glass-container' : ''} dangerouslySetInnerHTML={{ __html: mdParser.render(markdown) }} />
          </div>
        </div>
      );
    }
    if (previewMode === 'local') {
      return <div className="flex-1 overflow-auto bg-gray-200 p-5" ref={setPreviewContainer} />;
    }
    if (previewMode === 'pdf') {
      return <iframe src={pdfUrl || ''} className="flex-1 w-full border-none bg-white" />;
    }
    if (previewMode === 'collabora') {
      return <iframe src={collaboraData?.url || ''} allow="fullscreen; clipboard-read; clipboard-write" className="flex-1 w-full border-none bg-white" />;
    }
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
    markdown: 'Markdown', html: 'HTML ✨', local: 'docx-preview', pdf: 'PDF', collabora: 'Collabora'
  };

  // Collabora PostMessage listener
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'string') return;
      try {
        const msg = JSON.parse(e.data);
        if (msg.MessageId === 'App_LoadingStatus' && msg.Values?.Status === 'Document_Loaded') {
          setStatus('Editor ready');
        }
        if (msg.MessageId === 'Action_Save_Resp' && msg.Values?.success) {
          showToast('Document saved in editor');
        }
      } catch (_) {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-[380px] bg-gray-200">
      <div className="bg-white border-b border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 flex items-center shrink-0 flex-wrap gap-2">
        Preview
        <select 
          value={previewMode} 
          onChange={e => setPreviewMode(e.target.value as PreviewMode)}
          className="ml-2 text-[11px] py-0.5 px-1 rounded border border-gray-300 bg-white cursor-pointer"
        >
          <option value="markdown">Markdown (Instant)</option>
          <option value="html">HTML Creative ✨</option>
          <option value="local">Docx Preview (Fast)</option>
          <option value="pdf">PDF Preview (Hi-Fi)</option>
          <option value="collabora">Collabora (Edit)</option>
        </select>

        {previewMode === 'html' && (
          <select 
            value={htmlTemplate} 
            onChange={e => setHtmlTemplate(e.target.value)}
            className="text-[11px] py-0.5 px-1 rounded border border-gray-300 bg-white cursor-pointer"
          >
            <option value="modernDark">🌙 Modern Dark</option>
            <option value="glassmorphism">🔮 Glassmorphism</option>
            <option value="magazine">📰 Editorial</option>
            <option value="neonCyber">⚡ Neon Cyber</option>
          </select>
        )}

        <span className={`px-2 py-0.5 rounded text-[11px] ${getModeTagStyle()}`}>
          {modeLabels[previewMode]}
        </span>
      </div>

      <div className="bg-white border-b border-gray-200 px-2.5 py-1.5 flex gap-1.5 items-center shrink-0 flex-wrap">
        <button onClick={generatePreview} className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100">
          Refresh
        </button>
        <button 
          onClick={handleDownload} 
          disabled={!localDocxUrl && !pdfUrl && !collaboraData}
          className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100 disabled:opacity-50"
        >
          Download .docx
        </button>
        <button 
          onClick={handleExportPdf} 
          disabled={!localDocxUrl && !pdfUrl && !collaboraData}
          className="px-2 py-1 border border-gray-200 rounded text-xs hover:bg-gray-100 disabled:opacity-50"
        >
          Export PDF
        </button>
        <label className="flex items-center gap-1 text-[11px] text-gray-600 ml-auto cursor-pointer">
          <input type="checkbox" checked={autoPreview} onChange={e => setAutoPreview(e.target.checked)} />
          Auto
        </label>
        <span className="text-[11px] text-gray-500 w-16 text-right">{status}</span>
      </div>

      {renderContent()}
    </div>
  );
}
