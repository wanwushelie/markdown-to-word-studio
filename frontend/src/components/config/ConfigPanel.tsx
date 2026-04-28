import React from 'react';
import { useStore } from '../../store/useStore';
import { SmartImport } from './SmartImport';
import { RuntimeSettingsModal } from './RuntimeSettingsModal';
import { useI18n } from '../../i18n';
import type { Config } from '../../store/useStore';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-4 px-3">
    <h3 className="text-xs text-gray-500 mt-2 mb-2 pb-1 border-b border-gray-100 font-medium">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const FormGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] text-gray-500 mb-1">{label}</label>
    {children}
  </div>
);

const FONT_OPTIONS = [
  'Microsoft YaHei',
  'SimSun',
  'SimHei',
  'KaiTi',
  'FangSong',
  'DengXian',
  'STZhongsong',
  'Arial',
  'Times New Roman',
  'Consolas',
  'Calibri',
  'Courier New',
];

interface ConfigInputProps {
  config: Config;
  section: keyof Config;
  field: string;
  handleUpdate: (section: keyof Config, field: string, value: any) => void;
  type?: string;
  className?: string;
  [key: string]: any;
}

function ConfigInput({ config, section, field, handleUpdate, type = 'text', className, ...props }: ConfigInputProps) {
  const val = (config[section] as any)?.[field] ?? '';
  return (
    <input
      type={type}
      value={type === 'checkbox' ? undefined : val}
      checked={type === 'checkbox' ? Boolean(val) : undefined}
      onChange={e => {
        let value: any = e.target.value;
        if (type === 'number') value = parseFloat(value);
        if (type === 'checkbox') value = e.target.checked;
        handleUpdate(section, field, value);
      }}
      className={`w-full p-1.5 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none ${className || ''}`}
      {...props}
    />
  );
}

export function ConfigPanel() {
  const { config, meta, updateConfig, updateMeta, widths } = useStore();
  const { t } = useI18n();
  const [runtimeOpen, setRuntimeOpen] = React.useState(false);

  const handleUpdate = (section: keyof typeof config, field: string, value: any) => {
    updateConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const renderFontSelect = (field: 'body' | 'heading' | 'english' | 'code') => {
    const current = config.font[field];
    const hasCurrent = FONT_OPTIONS.includes(current);
    return (
      <select
        value={current}
        onChange={e => handleUpdate('font', field, e.target.value)}
        className="w-full p-1.5 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none"
      >
        {!hasCurrent && <option value={current}>{current}</option>}
        {FONT_OPTIONS.map(font => (
          <option key={font} value={font}>{font}</option>
        ))}
      </select>
    );
  };

  return (
    <div className="flex flex-col bg-white overflow-y-auto shrink-0 min-w-[200px]" style={{ width: `${widths.config}px` }}>
      <div className="px-3 py-2 border-b border-gray-100 flex justify-end">
        <button
          onClick={() => setRuntimeOpen(true)}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
          title="Runtime Settings / 运行时设置"
        >
          Runtime
        </button>
      </div>
      <SmartImport />
      <RuntimeSettingsModal open={runtimeOpen} onClose={() => setRuntimeOpen(false)} />

      <Section title={t('documentInfo')}>
        <FormGroup label={t('title')}>
          <input type="text" value={meta.title} onChange={e => updateMeta({ title: e.target.value })} className="w-full p-1.5 border border-gray-300 rounded text-xs" />
        </FormGroup>
        <FormGroup label={t('author')}>
          <input type="text" value={meta.author} onChange={e => updateMeta({ author: e.target.value })} className="w-full p-1.5 border border-gray-300 rounded text-xs" />
        </FormGroup>
      </Section>

      <Section title={t('typography')}>
        <FormGroup label={t('bodyFont')}>{renderFontSelect('body')}</FormGroup>
        <FormGroup label={t('headingFont')}>{renderFontSelect('heading')}</FormGroup>
        <FormGroup label={t('englishFont')}>{renderFontSelect('english')}</FormGroup>
        <FormGroup label={t('codeFont')}>{renderFontSelect('code')}</FormGroup>
        <FormGroup label={t('bodySize')}><ConfigInput config={config} section="size" field="body" handleUpdate={handleUpdate} type="number" min={8} max={72} /></FormGroup>
        <div className="grid grid-cols-3 gap-1">
          <FormGroup label="H1"><ConfigInput config={config} section="size" field="heading1" handleUpdate={handleUpdate} type="number" /></FormGroup>
          <FormGroup label="H2"><ConfigInput config={config} section="size" field="heading2" handleUpdate={handleUpdate} type="number" /></FormGroup>
          <FormGroup label="H3"><ConfigInput config={config} section="size" field="heading3" handleUpdate={handleUpdate} type="number" /></FormGroup>
          <FormGroup label="H4"><ConfigInput config={config} section="size" field="heading4" handleUpdate={handleUpdate} type="number" /></FormGroup>
          <FormGroup label="H5"><ConfigInput config={config} section="size" field="heading5" handleUpdate={handleUpdate} type="number" /></FormGroup>
          <FormGroup label="H6"><ConfigInput config={config} section="size" field="heading6" handleUpdate={handleUpdate} type="number" /></FormGroup>
          <FormGroup label="Code"><ConfigInput config={config} section="size" field="code" handleUpdate={handleUpdate} type="number" /></FormGroup>
        </div>
        <FormGroup label={t('lineSpacing')}><ConfigInput config={config} section="spacing" field="lineSpacing" handleUpdate={handleUpdate} type="number" step={0.1} /></FormGroup>
        <div className="grid grid-cols-2 gap-1">
          <FormGroup label={t('paraSpace')}><ConfigInput config={config} section="spacing" field="paragraphSpacing" handleUpdate={handleUpdate} type="number" /></FormGroup>
          <FormGroup label={t('headSpace')}><ConfigInput config={config} section="spacing" field="headingSpacing" handleUpdate={handleUpdate} type="number" /></FormGroup>
        </div>
      </Section>

      <Section title={t('colors')}>
        {[
          { label: t('heading'), field: 'heading' },
          { label: t('text'), field: 'text' },
          { label: t('link'), field: 'link' },
          { label: t('codeBg'), field: 'codeBackground' },
          { label: t('quoteBorder'), field: 'blockquoteBorder' },
        ].map(({ label, field }) => (
          <div key={field} className="flex items-center gap-2">
            <label className="text-[11px] text-gray-500 flex-1">{label}</label>
            <ConfigInput config={config} section="color" field={field} handleUpdate={handleUpdate} type="color" className="!w-8 !h-6 !p-0 cursor-pointer" />
          </div>
        ))}
      </Section>

      <Section title={t('pageLayout')}>
        <FormGroup label={t('pageSize')}>
          <select value={config.pageSize} onChange={e => updateConfig({ pageSize: e.target.value })} className="w-full p-1.5 border border-gray-300 rounded text-xs">
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
          </select>
        </FormGroup>
        <FormGroup label={t('orientation')}>
          <select value={config.orientation} onChange={e => updateConfig({ orientation: e.target.value })} className="w-full p-1.5 border border-gray-300 rounded text-xs">
            <option value="portrait">{t('portrait')}</option>
            <option value="landscape">{t('landscape')}</option>
          </select>
        </FormGroup>
        <div className="grid grid-cols-2 gap-1 mt-2">
          <FormGroup label={t('top')}><ConfigInput config={config} section="margin" field="top" handleUpdate={handleUpdate} type="number" step={100} /></FormGroup>
          <FormGroup label={t('bottom')}><ConfigInput config={config} section="margin" field="bottom" handleUpdate={handleUpdate} type="number" step={100} /></FormGroup>
          <FormGroup label={t('left')}><ConfigInput config={config} section="margin" field="left" handleUpdate={handleUpdate} type="number" step={100} /></FormGroup>
          <FormGroup label={t('right')}><ConfigInput config={config} section="margin" field="right" handleUpdate={handleUpdate} type="number" step={100} /></FormGroup>
        </div>
      </Section>

      <Section title={t('headerFooter')}>
        <FormGroup label={t('headerText')}><ConfigInput config={config} section="headerFooter" field="header" handleUpdate={handleUpdate} placeholder={t('title')} /></FormGroup>
        <FormGroup label={t('footerText')}><ConfigInput config={config} section="headerFooter" field="footer" handleUpdate={handleUpdate} placeholder="Confidential" /></FormGroup>
        <div className="flex items-center gap-2 mt-2">
          <ConfigInput config={config} section="headerFooter" field="pageNumbers" handleUpdate={handleUpdate} type="checkbox" className="!w-auto" />
          <label className="text-xs text-gray-600">{t('showPageNumbers')}</label>
        </div>
      </Section>

      <Section title={t('images')}>
        <FormGroup label={t('maxWidth')}><ConfigInput config={config} section="image" field="maxWidthPercent" handleUpdate={handleUpdate} type="number" min={10} max={100} /></FormGroup>
        <FormGroup label={t('defaultAlign')}>
          <select value={config.image.defaultAlign} onChange={e => handleUpdate('image', 'defaultAlign', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded text-xs">
            <option value="center">{t('center')}</option>
            <option value="left">{t('left')}</option>
            <option value="right">{t('right')}</option>
          </select>
        </FormGroup>
      </Section>
    </div>
  );
}
