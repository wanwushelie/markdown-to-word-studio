import { create } from 'zustand';
import { builtinHtmlStyles, type HtmlStyleTemplate } from '../utils/templates';

export interface Config {
  font: {
    body: string;
    heading: string;
    english: string;
    code: string;
  };
  size: {
    body: number;
    heading1: number;
    heading2: number;
    heading3: number;
    heading4: number;
    heading5: number;
    heading6: number;
    code: number;
  };
  spacing: {
    lineSpacing: number;
    paragraphSpacing: number;
    headingSpacing: number;
  };
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  color: {
    heading: string;
    text: string;
    link: string;
    codeBackground: string;
    blockquoteBorder: string;
  };
  headerFooter: {
    header: string;
    footer: string;
    pageNumbers: boolean;
  };
  image: {
    maxWidthPercent: number;
    defaultAlign: 'left' | 'center' | 'right';
  };
  pageSize: string;
  orientation: string;
}

export interface DocumentMeta {
  title: string;
  author: string;
}

export type PreviewMode = 'markdown' | 'html' | 'local' | 'pdf' | 'collabora';
export type Language = 'zh-CN' | 'en-US';
export type DocxExecutionMode = 'auto' | 'browser' | 'server';

export interface Capabilities {
  docx: boolean;
  pdfLocal: boolean;
  collabora: boolean;
  localPreview: boolean;
}

export const defaultConfig: Config = {
  font: {
    body: 'Microsoft YaHei',
    heading: 'SimHei',
    english: 'Times New Roman',
    code: 'Consolas',
  },
  size: {
    body: 11,
    heading1: 22,
    heading2: 18,
    heading3: 16,
    heading4: 14,
    heading5: 12,
    heading6: 11,
    code: 10,
  },
  spacing: {
    lineSpacing: 1.5,
    paragraphSpacing: 6,
    headingSpacing: 12,
  },
  margin: {
    top: 1440,
    bottom: 1440,
    left: 1440,
    right: 1440,
  },
  color: {
    heading: '#000000',
    text: '#000000',
    link: '#0563C1',
    codeBackground: '#F5F5F5',
    blockquoteBorder: '#CCCCCC',
  },
  headerFooter: {
    header: '',
    footer: '',
    pageNumbers: false,
  },
  image: {
    maxWidthPercent: 80,
    defaultAlign: 'center',
  },
  pageSize: 'A4',
  orientation: 'portrait',
};

const defaultMarkdown = `# Markdown to Word

这是一个统一前端版本的 Markdown 转 Word 工作台。

## 当前能力

- 支持 H1-H6 标题
- 支持 **粗体**、*斜体*、<u>下划线</u>
- 支持列表、引用、代码块、表格
- 支持浏览器内快速 Word 预览
- 支持下载 .docx 文件

### 代码示例

\`\`\`ts
function hello(): void {
  console.log('hello, docx');
}
\`\`\`

### 表格示例

| Name | Role | Status |
| --- | --- | --- |
| Alice | PM | Ready |
| Bob | Dev | Working |

> 最终排版仍以下载后的 Word / WPS / LibreOffice 打开效果为准。
`;

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh-CN';
  const stored = window.localStorage.getItem('language');
  return stored === 'en-US' ? 'en-US' : 'zh-CN';
};

const getInitialHtmlStyles = (): HtmlStyleTemplate[] => {
  if (typeof window === 'undefined') return builtinHtmlStyles;
  try {
    const raw = window.localStorage.getItem('customHtmlStyles');
    if (!raw) return builtinHtmlStyles;
    const parsed = JSON.parse(raw) as HtmlStyleTemplate[];
    const custom = Array.isArray(parsed)
      ? parsed
          .filter((item) => item && item.id && item.nameEn && item.nameZh && item.css)
          .map((item) => ({ ...item, builtin: false }))
      : [];
    return [...builtinHtmlStyles, ...custom];
  } catch {
    return builtinHtmlStyles;
  }
};

const getInitialDocxExecutionMode = (): DocxExecutionMode => {
  if (typeof window === 'undefined') return 'auto';
  const stored = window.localStorage.getItem('docxExecutionMode');
  return stored === 'browser' || stored === 'server' ? stored : 'auto';
};

interface AppState {
  markdown: string;
  config: Config;
  meta: DocumentMeta;
  previewMode: PreviewMode;
  language: Language;
  htmlTemplate: string;
  htmlStyles: HtmlStyleTemplate[];
  autoPreview: boolean;
  docxExecutionMode: DocxExecutionMode;
  capabilities: Capabilities;
  panels: {
    editor: boolean;
    preview: boolean;
    config: boolean;
  };
  widths: {
    editor: number;
    config: number;
  };
  setMarkdown: (md: string) => void;
  updateConfig: (updates: Partial<Config> | ((prev: Config) => Config)) => void;
  updateMeta: (updates: Partial<DocumentMeta>) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setLanguage: (language: Language) => void;
  setHtmlTemplate: (template: string) => void;
  upsertHtmlStyle: (style: HtmlStyleTemplate) => void;
  removeHtmlStyle: (id: string) => void;
  setAutoPreview: (auto: boolean) => void;
  setDocxExecutionMode: (mode: DocxExecutionMode) => void;
  setCapabilities: (capabilities: Capabilities) => void;
  togglePanel: (panel: keyof AppState['panels']) => void;
  setWidths: (widths: Partial<AppState['widths']>) => void;
}

export const useStore = create<AppState>((set) => ({
  markdown: defaultMarkdown,
  config: defaultConfig,
  meta: {
    title: '我的文档',
    author: '',
  },
  previewMode: 'markdown',
  language: getInitialLanguage(),
  htmlTemplate: 'modernDark',
  htmlStyles: getInitialHtmlStyles(),
  autoPreview: true,
  docxExecutionMode: getInitialDocxExecutionMode(),
  capabilities: {
    docx: true,
    pdfLocal: false,
    collabora: false,
    localPreview: true,
  },
  panels: {
    editor: true,
    preview: true,
    config: true,
  },
  widths: {
    editor: 360,
    config: 260,
  },
  setMarkdown: (markdown) => set({ markdown }),
  updateConfig: (updates) =>
    set((state) => ({
      config: typeof updates === 'function' ? updates(state.config) : { ...state.config, ...updates },
    })),
  updateMeta: (updates) =>
    set((state) => ({
      meta: { ...state.meta, ...updates },
    })),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', language);
    }
    set({ language });
  },
  setHtmlTemplate: (htmlTemplate) => set({ htmlTemplate }),
  upsertHtmlStyle: (style) =>
    set((state) => {
      const normalizedId = style.id.trim();
      const existingIdx = state.htmlStyles.findIndex((item) => item.id === normalizedId);
      const nextStyle: HtmlStyleTemplate = {
        ...style,
        id: normalizedId,
      };
      const nextStyles =
        existingIdx >= 0
          ? state.htmlStyles.map((item, idx) =>
              idx === existingIdx ? { ...item, ...nextStyle, builtin: item.builtin ?? false } : item,
            )
          : [...state.htmlStyles, nextStyle];

      if (typeof window !== 'undefined') {
        const customOnly = nextStyles.filter((item) => !item.builtin);
        window.localStorage.setItem('customHtmlStyles', JSON.stringify(customOnly));
      }

      return { htmlStyles: nextStyles };
    }),
  removeHtmlStyle: (id) =>
    set((state) => {
      const target = state.htmlStyles.find((item) => item.id === id);
      if (!target || target.builtin) return {};

      const nextStyles = state.htmlStyles.filter((item) => item.id !== id);
      const fallback = builtinHtmlStyles[0]?.id || 'modernDark';
      const nextTemplate = state.htmlTemplate === id ? fallback : state.htmlTemplate;

      if (typeof window !== 'undefined') {
        const customOnly = nextStyles.filter((item) => !item.builtin);
        window.localStorage.setItem('customHtmlStyles', JSON.stringify(customOnly));
      }

      return {
        htmlStyles: nextStyles,
        htmlTemplate: nextTemplate,
      };
    }),
  setAutoPreview: (autoPreview) => set({ autoPreview }),
  setDocxExecutionMode: (docxExecutionMode) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('docxExecutionMode', docxExecutionMode);
    }
    set({ docxExecutionMode });
  },
  setCapabilities: (capabilities) => set({ capabilities }),
  togglePanel: (panel) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [panel]: !state.panels[panel],
      },
    })),
  setWidths: (widths) =>
    set((state) => ({
      widths: { ...state.widths, ...widths },
    })),
}));
