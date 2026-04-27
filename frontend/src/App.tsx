import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Header } from './components/layout/Header';
import { Resizer } from './components/layout/Resizer';
import { MarkdownEditor } from './components/editor/MarkdownEditor';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { ConfigPanel } from './components/config/ConfigPanel';
import { useStore } from './store/useStore';

function App() {
  const { panels } = useStore();

  return (
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
  );
}

export default App;
