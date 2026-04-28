import React, { useMemo, useState } from 'react';
import MarkdownIt from 'markdown-it';
import { useStore } from '../../store/useStore';
import { useI18n } from '../../i18n';
import type { HtmlStyleTemplate } from '../../utils/templates';

const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true });
const SPEC_STORAGE_KEY = 'htmlStyleSpecMarkdown';

function parseStylePayload(input: string): HtmlStyleTemplate {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('empty');

  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed) as Partial<HtmlStyleTemplate>;
    if (!parsed.id || !parsed.nameEn || !parsed.nameZh || !parsed.css) throw new Error('invalid-json');
    return {
      id: parsed.id,
      nameEn: parsed.nameEn,
      nameZh: parsed.nameZh,
      css: parsed.css,
      builtin: false,
    };
  }

  const lines = trimmed.split(/\r?\n/);
  const getValue = (key: string) => {
    const row = lines.find((line) => line.toLowerCase().startsWith(`${key.toLowerCase()}:`));
    return row ? row.slice(row.indexOf(':') + 1).trim() : '';
  };

  const id = getValue('id');
  const nameEn = getValue('name-en');
  const nameZh = getValue('name-zh');
  const cssStart = lines.findIndex((line) => line.trim().toLowerCase() === 'css:');
  if (!id || !nameEn || !nameZh || cssStart < 0) throw new Error('invalid-text');
  const css = lines.slice(cssStart + 1).join('\n').trim();
  if (!css) throw new Error('empty-css');

  return { id, nameEn, nameZh, css, builtin: false };
}

export function HtmlStyleImport() {
  const { t } = useI18n();
  const { upsertHtmlStyle, setHtmlTemplate, removeHtmlStyle, language, htmlTemplate, htmlStyles } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showSpec, setShowSpec] = useState(false);
  const [specContent, setSpecContent] = useState<string | null>(null);
  const [editableSpec, setEditableSpec] = useState('');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<{ type: '' | 'error' | 'success'; message: string }>({ type: '', message: '' });

  const isZh = language === 'zh-CN';

  const statusClass = useMemo(
    () => (status.type === 'error' ? 'text-red-500' : status.type === 'success' ? 'text-green-600' : 'text-gray-500'),
    [status.type],
  );

  const fetchSpec = async () => {
    if (specContent) return;

    const local = typeof window !== 'undefined' ? window.localStorage.getItem(SPEC_STORAGE_KEY) : null;
    if (local && local.trim()) {
      setSpecContent(local);
      setEditableSpec(local);
      return;
    }

    try {
      const res = await fetch('/HTML_STYLE_SPEC.md');
      const text = await res.text();
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        setSpecContent(t('htmlSpecLoadFailed'));
        setEditableSpec('');
      } else {
        setSpecContent(text);
        setEditableSpec(text);
      }
    } catch {
      setSpecContent(t('htmlSpecLoadFailed'));
      setEditableSpec('');
    }
  };

  const applyImport = () => {
    try {
      const parsed = parseStylePayload(input);
      upsertHtmlStyle(parsed);
      setHtmlTemplate(parsed.id);
      setStatus({ type: 'success', message: t('htmlImportApplied', { id: parsed.id }) });
    } catch {
      setStatus({ type: 'error', message: t('htmlImportParseError') });
    }
  };

  const selectedStyle = htmlStyles.find((s) => s.id === htmlTemplate);

  const buildTextPayload = (style: HtmlStyleTemplate) =>
    `id: ${style.id}\nname-en: ${style.nameEn}\nname-zh: ${style.nameZh}\ncss:\n${style.css}`;

  const copyCurrentStyle = async () => {
    if (!selectedStyle) return;
    await navigator.clipboard.writeText(buildTextPayload(selectedStyle));
    setStatus({ type: 'success', message: isZh ? '当前样式已复制' : 'Current style copied' });
  };

  const loadCurrentStyle = () => {
    if (!selectedStyle) return;
    setInput(buildTextPayload(selectedStyle));
    setIsOpen(true);
    setStatus({ type: 'success', message: isZh ? '已加载到编辑区' : 'Loaded into editor' });
  };

  const deleteCurrentStyle = () => {
    if (!selectedStyle || selectedStyle.builtin) {
      setStatus({ type: 'error', message: isZh ? '内置预设不可删除' : 'Built-in styles cannot be deleted' });
      return;
    }
    removeHtmlStyle(selectedStyle.id);
    setStatus({ type: 'success', message: isZh ? `已删除样式：${selectedStyle.id}` : `Style deleted: ${selectedStyle.id}` });
  };

  const copySpec = async () => {
    const content = editableSpec || specContent || '';
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setStatus({ type: 'success', message: isZh ? '规范已复制到剪贴板' : 'Spec copied to clipboard' });
  };

  const saveSpec = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SPEC_STORAGE_KEY, editableSpec);
    setSpecContent(editableSpec);
    setStatus({ type: 'success', message: isZh ? '规范已保存（本浏览器）' : 'Spec saved (local browser)' });
  };

  const resetSpec = async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SPEC_STORAGE_KEY);
    }
    setSpecContent(null);
    setEditableSpec('');
    await fetchSpec();
    setStatus({ type: 'success', message: isZh ? '已恢复默认规范' : 'Spec reset to default' });
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 rounded-md mx-3 my-2 p-2.5">
      <div className="flex justify-between items-center">
        <h3 className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer select-none m-0" onClick={() => setIsOpen(!isOpen)}>
          <span className={`transition-transform duration-200 inline-block text-[10px] ${isOpen ? 'rotate-90' : ''}`}>›</span>
          {t('htmlStyleImport')}
        </h3>
        <button onClick={() => { fetchSpec(); setShowSpec(true); }} className="text-[10px] text-emerald-700 hover:text-emerald-900 underline">
          {t('viewSpec')}
        </button>
      </div>

      {isOpen && (
        <div className="mt-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('htmlStylePaste')}
            className="w-full h-24 border border-gray-300 rounded p-1.5 text-[11px] font-mono resize-y bg-white/80 focus:border-emerald-400 focus:outline-none"
          />
          <div className="flex items-center gap-1 mt-1.5">
            <button onClick={applyImport} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 rounded text-[11px] transition-colors">
              {t('apply')}
            </button>
            <button onClick={copyCurrentStyle} className="px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 rounded text-[11px]">
              {isZh ? '复制当前样式' : 'Copy Current'}
            </button>
            <button onClick={loadCurrentStyle} className="px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 rounded text-[11px]">
              {isZh ? '加载当前样式' : 'Load Current'}
            </button>
            <button onClick={deleteCurrentStyle} className="px-2 py-1 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded text-[11px]">
              {isZh ? '删除当前样式' : 'Delete Current'}
            </button>
          </div>
          {status.message && <div className={`mt-1 text-[10px] min-h-[14px] ${statusClass}`}>{status.message}</div>}
        </div>
      )}

      {showSpec && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSpec(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 shrink-0">
              <h2 className="text-sm font-semibold">{t('htmlSpecTitle')}</h2>
              <button onClick={() => setShowSpec(false)} className="text-gray-400 hover:text-black text-lg leading-none" aria-label={t('close')}>×</button>
            </div>

            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <button onClick={copySpec} className="px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 rounded text-[11px]">
                {isZh ? '复制规范' : 'Copy Spec'}
              </button>
              <button onClick={saveSpec} className="px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 rounded text-[11px]">
                {isZh ? '保存编辑' : 'Save Edits'}
              </button>
              <button onClick={resetSpec} className="px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 rounded text-[11px]">
                {isZh ? '恢复默认' : 'Reset Default'}
              </button>
              <span className="text-[11px] text-gray-500 ml-auto">{isZh ? '可直接编辑后保存（仅当前浏览器）' : 'Editable and saved in this browser'}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0 flex-1">
              <div className="overflow-y-auto p-4 border-r border-gray-200 min-h-0">
                {specContent ? (
                  <div className="md-preview" dangerouslySetInnerHTML={{ __html: mdParser.render(editableSpec || specContent) }} />
                ) : (
                  <p className="text-gray-400 text-center py-8">{t('loading')}</p>
                )}
              </div>
              <div className="overflow-y-auto p-4 min-h-0">
                <textarea
                  value={editableSpec}
                  onChange={(e) => setEditableSpec(e.target.value)}
                  className="w-full h-full min-h-[340px] border border-gray-300 rounded p-2 text-[12px] font-mono resize-none focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
