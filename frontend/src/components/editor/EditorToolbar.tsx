import React from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';
import { showToast } from '../ui/Toast';

interface EditorToolbarProps {
  onInsertText: (before: string, after: string) => void;
}

export function EditorToolbar({ onInsertText }: EditorToolbarProps) {
  const { markdown, config, meta } = useStore();

  const handleDownload = async () => {
    try {
      const blob = await api.convertToDocx({ markdown, config, meta });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.title || 'document'}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Document downloaded successfully!');
    } catch (err) {
      showToast('Download failed: ' + (err as Error).message, 'error');
    }
  };

  const toolbarBtns = [
    { label: 'B', title: 'Bold', action: () => onInsertText('**', '**'), className: 'font-bold' },
    { label: 'I', title: 'Italic', action: () => onInsertText('*', '*'), className: 'italic' },
    { label: 'U', title: 'Underline', action: () => onInsertText('<u>', '</u>'), className: 'underline' },
    { label: 'H1', title: 'Heading 1', action: () => onInsertText('# ', '') },
    { label: 'H2', title: 'Heading 2', action: () => onInsertText('## ', '') },
    { label: 'H3', title: 'Heading 3', action: () => onInsertText('### ', '') },
    { label: 'List', title: 'List', action: () => onInsertText('- ', '') },
    { label: 'Num', title: 'Ordered List', action: () => onInsertText('1. ', '') },
    { label: 'Quote', title: 'Quote', action: () => onInsertText('> ', '') },
    { label: 'Code', title: 'Code Block', action: () => onInsertText('```\\n', '\\n```') },
    { label: 'Table', title: 'Table', action: () => onInsertText('| A | B |\\n|---|---|\\n| 1 | 2 |', '') },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-2.5 py-1.5 flex gap-1 flex-wrap shrink-0">
      {toolbarBtns.map(btn => (
        <button
          key={btn.title}
          onClick={btn.action}
          title={btn.title}
          className={`px-2 py-1 border border-gray-200 bg-white rounded text-xs hover:bg-gray-100 ${btn.className || ''}`}
        >
          {btn.label}
        </button>
      ))}
      <div className="flex-1" />
      <button
        onClick={handleDownload}
        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 rounded text-xs transition-colors"
      >
        Download .docx
      </button>
    </div>
  );
}
