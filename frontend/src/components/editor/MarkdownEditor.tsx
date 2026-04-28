import React, { useRef, useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown as markdownLang } from '@codemirror/lang-markdown';
import { keymap } from '@codemirror/view';
import { EditorView } from '@codemirror/view';
import { useStore } from '../../store/useStore';
import { EditorToolbar } from './EditorToolbar';
import { api } from '../../services/api';
import { showToast } from '../ui/Toast';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';

export function MarkdownEditor() {
  const { markdown, setMarkdown, widths, config, meta } = useStore();
  const cmRef = useRef<ReactCodeMirrorRef>(null);

  const handleInsertText = useCallback((before: string, after: string) => {
    const view = cmRef.current?.view;
    if (!view) return;

    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    
    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: before + selectedText + after
      },
      selection: {
        anchor: selection.from + before.length,
        head: selection.from + before.length + selectedText.length
      }
    });
    view.focus();
  }, []);

  const customKeymap = useMemo(() => keymap.of([
    {
      key: 'Mod-b',
      run: () => { handleInsertText('**', '**'); return true; },
    },
    {
      key: 'Mod-i',
      run: () => { handleInsertText('*', '*'); return true; },
    },
    {
      key: 'Mod-s',
      run: () => {
        (async () => {
          try {
            const state = useStore.getState();
            const blob = await api.convertToDocx({ markdown: state.markdown, config: state.config, meta: state.meta });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${state.meta.title || 'document'}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('Document downloaded!');
          } catch (err) {
            showToast('Save failed: ' + (err as Error).message, 'error');
          }
        })();
        return true;
      },
    },
  ]), [handleInsertText]);

  return (
    <div 
      className="flex flex-col bg-gray-50 shrink-0 border-r border-gray-200 min-w-[220px]"
      style={{ width: `${widths.editor}px` }}
    >
      <div className="bg-white border-b border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 flex items-center gap-2 shrink-0">
        Markdown
        <span className="bg-blue-50 text-blue-500 px-2 py-0.5 rounded text-[11px]">Edit</span>
      </div>
      
      <EditorToolbar onInsertText={handleInsertText} />
      
      <div className="flex-1 overflow-auto bg-[#fafafa]">
        <CodeMirror
          ref={cmRef}
          value={markdown}
          extensions={[markdownLang(), customKeymap, EditorView.lineWrapping]}
          onChange={setMarkdown}
          theme="light"
          height="100%"
          className="h-full text-[14px]"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>
      
      <div className="bg-white border-t border-gray-200 px-3 py-1 text-[11px] text-gray-500 flex justify-between shrink-0">
        <span>{markdown.length} chars</span>
        <span>Ctrl+B Bold · Ctrl+I Italic · Ctrl+S Save</span>
      </div>
    </div>
  );
}

