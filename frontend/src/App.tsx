import React, { Suspense, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Header } from './components/layout/Header';
import { Resizer } from './components/layout/Resizer';
import { ToastContainer } from './components/ui/Toast';
import { useStore } from './store/useStore';
import { api } from './services/api';

const MarkdownEditor = React.lazy(async () => {
  const module = await import('./components/editor/MarkdownEditor');
  return { default: module.MarkdownEditor };
});

const PreviewPanel = React.lazy(async () => {
  const module = await import('./components/preview/PreviewPanel');
  return { default: module.PreviewPanel };
});

const ConfigPanel = React.lazy(async () => {
  const module = await import('./components/config/ConfigPanel');
  return { default: module.ConfigPanel };
});

function PanelFallback({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center bg-white text-sm text-gray-500 min-h-[240px]">
      {label}
    </div>
  );
}

function App() {
  const { panels, togglePanel, widths, setWidths, setCapabilities } = useStore();

  useEffect(() => {
    const editorWidth = localStorage.getItem('editorWidth');
    const configWidth = localStorage.getItem('configWidth');
    if (editorWidth || configWidth) {
      setWidths({
        ...(editorWidth ? { editor: parseInt(editorWidth, 10) } : {}),
        ...(configWidth ? { config: parseInt(configWidth, 10) } : {}),
      });
    }
  }, [setWidths]);

  useEffect(() => {
    localStorage.setItem('editorWidth', String(widths.editor));
    localStorage.setItem('configWidth', String(widths.config));
  }, [widths]);

  useEffect(() => {
    api.getCapabilities()
      .then((caps) => setCapabilities(caps))
      .catch(() => {
        setCapabilities({ docx: true, pdfLocal: false, collabora: false, localPreview: true });
      });
  }, [setCapabilities]);

  useEffect(() => {
    const handler = () => {
      const width = window.innerWidth;
      if (width < 800 && panels.config) togglePanel('config');
      if (width < 550 && panels.editor) togglePanel('editor');
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [panels.config, panels.editor, togglePanel]);

  return (
    <>
      <AppLayout
        header={<Header />}
        editor={
          <>
            {panels.editor && (
              <Suspense fallback={<PanelFallback label="Loading editor..." />}>
                <MarkdownEditor />
              </Suspense>
            )}
            {panels.editor && (panels.preview || panels.config) && <Resizer target="editor" minWidth={220} maxWidth={600} />}
          </>
        }
        preview={
          <>
            {panels.preview && (
              <Suspense fallback={<PanelFallback label="Loading preview..." />}>
                <PreviewPanel />
              </Suspense>
            )}
            {panels.preview && panels.config && <Resizer target="config" minWidth={200} maxWidth={450} />}
          </>
        }
        config={
          panels.config ? (
            <Suspense fallback={<PanelFallback label="Loading settings..." />}>
              <ConfigPanel />
            </Suspense>
          ) : null
        }
      />
      <ToastContainer />
    </>
  );
}

export default App;
