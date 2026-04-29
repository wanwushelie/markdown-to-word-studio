import React from 'react';
import { PenLine, FileText, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';
import { useI18n } from '../../i18n';

export function Header() {
  const { panels, togglePanel } = useStore();
  const { t, language, setLanguage } = useI18n();

  return (
    <div className="bg-slate-800 text-white px-4 py-2 flex items-center gap-3 h-[46px] shrink-0">
      <h1 className="text-base font-medium whitespace-nowrap">{t('appTitle')}</h1>
      
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={() => togglePanel('editor')}
          className={clsx(
            "flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors border",
            panels.editor 
              ? "bg-white/25 border-white/40 text-white" 
              : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
          )}
          title={t('toggleEditor')}
        >
          <PenLine size={14} /> {t('editor')}
        </button>
        
        <button
          onClick={() => togglePanel('preview')}
          className={clsx(
            "flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors border",
            panels.preview 
              ? "bg-white/25 border-white/40 text-white" 
              : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
          )}
          title={t('togglePreview')}
        >
          <FileText size={14} /> {t('preview')}
        </button>
        
        <button
          onClick={() => togglePanel('config')}
          className={clsx(
            "flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors border",
            panels.config 
              ? "bg-white/25 border-white/40 text-white" 
              : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
          )}
          title={t('toggleConfig')}
        >
          <Settings size={14} /> {t('config')}
        </button>
        
        <label className="flex items-center gap-1 text-[11px] text-white/80 ml-1">
          <span>{t('language')}</span>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as typeof language)}
            className="rounded border border-white/25 bg-slate-700 px-1.5 py-0.5 text-[11px] text-white outline-none hover:bg-slate-600"
            aria-label={t('language')}
          >
            <option value="zh-CN">{t('chinese')}</option>
            <option value="en-US">{t('english')}</option>
          </select>
        </label>

        <span className="text-[11px] opacity-70 ml-1 hidden lg:inline">{t('poweredBy')}</span>
      </div>
    </div>
  );
}
