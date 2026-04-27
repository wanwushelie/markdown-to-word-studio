import { create } from 'zustand';

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

This is a **bold** and *italic* text example. You can also use <u>underline</u>.

## Features

- Headings H1-H6
- **Bold**, *Italic*, <u>Underline</u>
- Ordered and unordered lists
- Code blocks and inline \`code\`
- Tables
- Images (local or URL)

### Code Example

\`\`\`typescript
function hello(): void {
  console.log("Hello, World!");
}
\`\`\`

### Table

| Name | Age | City |
|------|-----|------|
| Alice | 28 | Beijing |
| Bob | 32 | Shanghai |

> This is a blockquote. It shows how quoted text will appear.

---

Visit [OpenAI](https://openai.com) for more info.

### Ordered List

1. First step
2. Second step
3. Third step`;

interface AppState {
  markdown: string;
  config: Config;
  meta: DocumentMeta;
  previewMode: PreviewMode;
  htmlTemplate: string;
  autoPreview: boolean;
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
  setHtmlTemplate: (template: string) => void;
  setAutoPreview: (auto: boolean) => void;
  togglePanel: (panel: keyof AppState['panels']) => void;
  setWidths: (widths: Partial<AppState['widths']>) => void;
}

export const useStore = create<AppState>((set) => ({
  markdown: defaultMarkdown,
  config: defaultConfig,
  meta: {
    title: 'My Document',
    author: '',
  },
  previewMode: 'markdown',
  htmlTemplate: 'modernDark',
  autoPreview: true,
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
  setHtmlTemplate: (template) => set({ htmlTemplate: template }),
  setAutoPreview: (auto) => set({ autoPreview: auto }),
  togglePanel: (panel) =>
    set((state) => ({
      panels: { ...state.panels, [panel]: !state.panels[panel] },
    })),
  setWidths: (widths) =>
    set((state) => ({
      widths: { ...state.widths, ...widths },
    })),
}));
