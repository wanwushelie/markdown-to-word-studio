import React, { useState, useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import { useStore } from '../../store/useStore';
import { PRESETS } from '../../utils/templates';
import { parseSmartInput } from '../../utils/smartParser';

const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });

export function SmartImport() {
  const { updateConfig, updateMeta } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [specContent, setSpecContent] = useState<string | null>(null);
  const [showSpec, setShowSpec] = useState(false);

  const fetchSpec = async () => {
    if (specContent && !specContent.startsWith('Failed')) return; // already loaded successfully
    try {
      const res = await fetch('/CONFIG_SPEC.md');
      const text = await res.text();
      // Guard against HTML error pages
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        setSpecContent('Failed to load CONFIG_SPEC.md — the server returned an error page.');
      } else {
        setSpecContent(text);
      }
    } catch {
      setSpecContent('Failed to load CONFIG_SPEC.md');
    }
  };

  const handleApply = () => {
    if (!input.trim()) {
      setStatus({ message: 'Please paste config text first.', type: 'error' });
      return;
    }
    try {
      const parsed = parseSmartInput(input);
      
      const configUpdates: any = { font: {}, size: {}, spacing: {}, margin: {}, color: {}, headerFooter: {}, image: {} };
      let applied = 0;

      if (parsed['body-font']) { configUpdates.font.body = parsed['body-font']; applied++; }
      if (parsed['heading-font']) { configUpdates.font.heading = parsed['heading-font']; applied++; }
      if (parsed['english-font']) { configUpdates.font.english = parsed['english-font']; applied++; }
      if (parsed['code-font']) { configUpdates.font.code = parsed['code-font']; applied++; }
      
      if (parsed['body-size']) { configUpdates.size.body = parsed['body-size']; applied++; }
      if (parsed['h1-size']) { configUpdates.size.heading1 = parsed['h1-size']; applied++; }
      if (parsed['h2-size']) { configUpdates.size.heading2 = parsed['h2-size']; applied++; }
      if (parsed['h3-size']) { configUpdates.size.heading3 = parsed['h3-size']; applied++; }
      if (parsed['h4-size']) { configUpdates.size.heading4 = parsed['h4-size']; applied++; }
      if (parsed['h5-size']) { configUpdates.size.heading5 = parsed['h5-size']; applied++; }
      if (parsed['h6-size']) { configUpdates.size.heading6 = parsed['h6-size']; applied++; }
      if (parsed['code-size']) { configUpdates.size.code = parsed['code-size']; applied++; }

      if (parsed['line-spacing']) { configUpdates.spacing.lineSpacing = parsed['line-spacing']; applied++; }
      if (parsed['paragraph-spacing']) { configUpdates.spacing.paragraphSpacing = parsed['paragraph-spacing']; applied++; }
      if (parsed['heading-spacing']) { configUpdates.spacing.headingSpacing = parsed['heading-spacing']; applied++; }

      if (parsed['margin-top']) { configUpdates.margin.top = parsed['margin-top']; applied++; }
      if (parsed['margin-bottom']) { configUpdates.margin.bottom = parsed['margin-bottom']; applied++; }
      if (parsed['margin-left']) { configUpdates.margin.left = parsed['margin-left']; applied++; }
      if (parsed['margin-right']) { configUpdates.margin.right = parsed['margin-right']; applied++; }

      if (parsed['heading-color']) { configUpdates.color.heading = parsed['heading-color']; applied++; }
      if (parsed['text-color']) { configUpdates.color.text = parsed['text-color']; applied++; }
      if (parsed['link-color']) { configUpdates.color.link = parsed['link-color']; applied++; }
      if (parsed['code-bg-color']) { configUpdates.color.codeBackground = parsed['code-bg-color']; applied++; }
      if (parsed['quote-border-color']) { configUpdates.color.blockquoteBorder = parsed['quote-border-color']; applied++; }

      if (parsed['header-text']) { configUpdates.headerFooter.header = parsed['header-text']; applied++; }
      if (parsed['footer-text']) { configUpdates.headerFooter.footer = parsed['footer-text']; applied++; }
      if (parsed['page-numbers'] !== undefined) { configUpdates.headerFooter.pageNumbers = parsed['page-numbers']; applied++; }

      if (parsed['image-max-width']) { configUpdates.image.maxWidthPercent = parsed['image-max-width']; applied++; }
      if (parsed['image-align']) { configUpdates.image.defaultAlign = parsed['image-align']; applied++; }

      if (parsed['page-size']) { configUpdates.pageSize = parsed['page-size']; applied++; }
      if (parsed['orientation']) { configUpdates.orientation = parsed['orientation']; applied++; }

      updateConfig(prev => ({
        ...prev,
        font: { ...prev.font, ...configUpdates.font },
        size: { ...prev.size, ...configUpdates.size },
        spacing: { ...prev.spacing, ...configUpdates.spacing },
        margin: { ...prev.margin, ...configUpdates.margin },
        color: { ...prev.color, ...configUpdates.color },
        headerFooter: { ...prev.headerFooter, ...configUpdates.headerFooter },
        image: { ...prev.image, ...configUpdates.image },
        pageSize: configUpdates.pageSize || prev.pageSize,
        orientation: configUpdates.orientation || prev.orientation,
      }));

      if (parsed['doc-title'] || parsed['doc-author']) {
        updateMeta({ title: parsed['doc-title'], author: parsed['doc-author'] });
        applied++;
      }

      setStatus({ message: `Success: applied ${applied} settings.`, type: 'success' });
    } catch (e) {
      setStatus({ message: 'Error parsing config: ' + (e as Error).message, type: 'error' });
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && PRESETS[val]) {
      setInput(PRESETS[val]);
    }
  };

  const handleExport = () => {
    const { config, meta } = useStore.getState();
    const lines = [
      `body-font: ${config.font.body}`,
      `heading-font: ${config.font.heading}`,
      `english-font: ${config.font.english}`,
      `code-font: ${config.font.code}`,
      `body-size: ${config.size.body}`,
      `h1-size: ${config.size.heading1}`,
      `h2-size: ${config.size.heading2}`,
      `h3-size: ${config.size.heading3}`,
      `h4-size: ${config.size.heading4}`,
      `h5-size: ${config.size.heading5}`,
      `h6-size: ${config.size.heading6}`,
      `code-size: ${config.size.code}`,
      `line-spacing: ${config.spacing.lineSpacing}`,
      `paragraph-spacing: ${config.spacing.paragraphSpacing}`,
      `heading-spacing: ${config.spacing.headingSpacing}`,
      `margin-top: ${config.margin.top}`,
      `margin-bottom: ${config.margin.bottom}`,
      `margin-left: ${config.margin.left}`,
      `margin-right: ${config.margin.right}`,
      `heading-color: ${config.color.heading}`,
      `text-color: ${config.color.text}`,
      `link-color: ${config.color.link}`,
      `code-bg-color: ${config.color.codeBackground}`,
      `quote-border-color: ${config.color.blockquoteBorder}`,
      `page-size: ${config.pageSize}`,
      `orientation: ${config.orientation}`,
      `header-text: ${config.headerFooter.header}`,
      `footer-text: ${config.headerFooter.footer}`,
      `page-numbers: ${config.headerFooter.pageNumbers}`,
      `image-max-width: ${config.image.maxWidthPercent}`,
      `image-align: ${config.image.defaultAlign}`,
      `doc-title: ${meta.title}`,
      `doc-author: ${meta.author}`,
    ];
    setInput(lines.join('\n'));
    setStatus({ message: 'Config exported. You can copy this text.', type: 'success' });
  };

  const copySpec = () => {
    if (specContent) {
      navigator.clipboard.writeText(specContent);
      setStatus({ message: 'Spec copied to clipboard!', type: 'success' });
      setTimeout(() => setStatus({ message: '', type: '' }), 3000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-md mx-3 my-2 p-2.5">
      <div className="flex justify-between items-center">
        <h3 
          className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer select-none m-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`transition-transform duration-200 inline-block text-[10px] ${isOpen ? 'rotate-90' : ''}`}>▶</span>
          Smart Config Import
        </h3>
        <button 
          onClick={() => { fetchSpec(); setShowSpec(true); }}
          className="text-[10px] text-indigo-600 hover:text-indigo-800 underline"
        >
          View Spec
        </button>
      </div>
      
      {isOpen && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste config text from AI here..."
            className="w-full h-24 border border-gray-300 rounded p-1.5 text-[11px] font-mono resize-y bg-white/80 focus:border-indigo-400 focus:outline-none"
          />
          <div className="flex gap-1 mt-1.5 flex-wrap">
            <select onChange={handlePresetChange} className="flex-1 min-w-0 p-1 border border-gray-300 rounded text-[11px] bg-white">
              <option value="">-- Load Preset --</option>
              <option value="academic">Academic Paper</option>
              <option value="business">Business Report</option>
              <option value="resume">Resume</option>
            </select>
            <button onClick={handleApply} className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-600 rounded text-[11px] transition-colors">
              Apply
            </button>
            <button onClick={handleExport} className="px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 rounded text-[11px] transition-colors">
              Export
            </button>
          </div>
          {status.message && (
            <div className={`mt-1 text-[10px] min-h-[14px] ${status.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
              {status.message}
            </div>
          )}
        </div>
      )}

      {showSpec && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSpec(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 shrink-0">
              <h2 className="text-sm font-semibold">📋 Config Specification (For AI)</h2>
              <button onClick={() => setShowSpec(false)} className="text-gray-400 hover:text-black text-lg leading-none">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 bg-white">
              {specContent ? (
                <div 
                  className="md-preview"
                  dangerouslySetInnerHTML={{ __html: mdParser.render(specContent) }}
                />
              ) : (
                <p className="text-gray-400 text-center py-8">Loading...</p>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-b-lg">
              <span className="text-[11px] text-gray-500">💡 Copy the raw Markdown and send it to your AI assistant.</span>
              <button 
                onClick={copySpec}
                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
              >
                📋 Copy Raw Markdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
