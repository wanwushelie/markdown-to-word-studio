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

const defaultMarkdown = `# Markdown 转 Word

这是一个 **粗体** 和 *斜体* 文本示例，也可以使用 <u>下划线</u>。

## 功能

- H1-H6 标题
- **粗体**、*斜体*、<u>下划线</u>
- 有序列表和无序列表
- 代码块和行内 \`code\`
- 表格
- 图片（本地或 URL）

### 代码示例

\`\`\`typescript
function hello(): void {
  console.log("你好，世界！");
}
\`\`\`

### 表格

| 姓名 | 年龄 | 城市 |
|------|-----|------|
| Alice | 28 | 北京 |
| Bob | 32 | 上海 |

> 这是一段引用文字，用于展示导出后的引用样式。

---

访问 [OpenAI](https://openai.com) 了解更多信息。

### 有序列表

1. 第一步
2. 第二步
3. 第三步`;

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
      ? parsed.filter((item) => item && item.id && item.nameEn && item.nameZh && item.css).map((item) => ({ ...item, builtin: false }))
      : [];
    return [...builtinHtmlStyles, ...custom];
  } catch {
    return builtinHtmlStyles;
  }
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
  setMarkdown: (md) => set({ markdown: md }),
  updateConfig: (updates) =>
    set((state) => ({
      config: typeof updates === 'function' ? updates(state.config) : { ...state.config, ...updates },
    })),
  updateMeta: (updates) =>
    set((state) => ({ meta: { ...state.meta, ...updates } })),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', language);
    }
    set({ language });
  },
  setHtmlTemplate: (template) => set({ htmlTemplate: template }),
  upsertHtmlStyle: (style) =>
    set((state) => {
      const normalizedId = style.id.trim();
      const existingIdx = state.htmlStyles.findIndex((s) => s.id === normalizedId);
      const nextStyle: HtmlStyleTemplate = {
        ...style,
        id: normalizedId,
      };
      const next = existingIdx >= 0
        ? state.htmlStyles.map((s, idx) => (idx === existingIdx ? { ...s, ...nextStyle, builtin: s.builtin ?? false } : s))
        : [...state.htmlStyles, nextStyle];
      if (typeof window !== 'undefined') {
        const customOnly = next.filter((s) => !s.builtin);
        window.localStorage.setItem('customHtmlStyles', JSON.stringify(customOnly));
      }
      return { htmlStyles: next };
    }),
  removeHtmlStyle: (id) =>
    set((state) => {
      const target = state.htmlStyles.find((s) => s.id === id);
      if (!target || target.builtin) return {};
      const next = state.htmlStyles.filter((s) => s.id !== id);
      const fallback = builtinHtmlStyles[0]?.id || 'modernDark';
      const nextTemplate = state.htmlTemplate === id ? fallback : state.htmlTemplate;
      if (typeof window !== 'undefined') {
        const customOnly = next.filter((s) => !s.builtin);
        window.localStorage.setItem('customHtmlStyles', JSON.stringify(customOnly));
      }
      return { htmlStyles: next, htmlTemplate: nextTemplate };
    }),
  setAutoPreview: (auto) => set({ autoPreview: auto }),
  setCapabilities: (capabilities) => set({ capabilities }),
  togglePanel: (panel) =>
    set((state) => ({
      panels: { ...state.panels, [panel]: !state.panels[panel] },
    })),
  setWidths: (widths) =>
    set((state) => ({
      widths: { ...state.widths, ...widths },
    })),
}));
