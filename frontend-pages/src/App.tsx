import React, { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Header } from './components/layout/Header';
import { Resizer } from './components/layout/Resizer';
import { MarkdownEditor } from './components/editor/MarkdownEditor';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { ConfigPanel } from './components/config/ConfigPanel';
import { ToastContainer } from './components/ui/Toast';
import { useStore } from './store/useStore';
import { api } from './services/api';

function App() {
  const { panels, togglePanel, widths, setWidths, setCapabilities } = useStore();

  // Restore widths from localStorage on mount
  useEffect(() => {
    const ew = localStorage.getItem('editorWidth');
    const cw = localStorage.getItem('configWidth');
    if (ew || cw) {
      setWidths({
        ...(ew ? { editor: parseInt(ew) } : {}),
        ...(cw ? { config: parseInt(cw) } : {}),
      });
    }
  }, []);

  // Save widths to localStorage when they change
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

  // Responsive: auto-hide panels on very small windows
  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth;
      if (w < 800 && panels.config) togglePanel('config');
      if (w < 550 && panels.editor) togglePanel('editor');
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [panels.config, panels.editor]);

  return (
    <>
      <AppLayout
        header={<Header />}
        editor={
          <>
            {panels.editor && <MarkdownEditor />}
            {panels.editor && (panels.preview || panels.config) && <Resizer target="editor" minWidth={220} maxWidth={600} />}
          </>
        }
        preview={
          <>
            {panels.preview && <PreviewPanel />}
            {panels.preview && panels.config && <Resizer target="config" minWidth={200} maxWidth={450} />}
          </>
        }
        config={panels.config && <ConfigPanel />}
      />
      <ToastContainer />
    </>
  );
}

export default App;
