import React from 'react';
import { PenLine, FileText, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

export function Header() {
  const { panels, togglePanel } = useStore();

  return (
    <div className="bg-slate-800 text-white px-4 py-2 flex items-center gap-3 h-[46px] shrink-0">
      <h1 className="text-base font-medium whitespace-nowrap">Markdown to Word</h1>
      
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={() => togglePanel('editor')}
          className={clsx(
            "flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors border",
            panels.editor 
              ? "bg-white/25 border-white/40 text-white" 
              : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
          )}
          title="Toggle Markdown Editor"
        >
          <PenLine size={14} /> Editor
        </button>
        
        <button
          onClick={() => togglePanel('preview')}
          className={clsx(
            "flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors border",
            panels.preview 
              ? "bg-white/25 border-white/40 text-white" 
              : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
          )}
          title="Toggle Preview Panel"
        >
          <FileText size={14} /> Preview
        </button>
        
        <button
          onClick={() => togglePanel('config')}
          className={clsx(
            "flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors border",
            panels.config 
              ? "bg-white/25 border-white/40 text-white" 
              : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
          )}
          title="Toggle Config Panel"
        >
          <Settings size={14} /> Config
        </button>
        
        <span className="text-[11px] opacity-70 ml-1">TypeScript + docx.js + Collabora</span>
      </div>
    </div>
  );
}
