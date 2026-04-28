import React from 'react';
import { useStore } from '../../store/useStore';
import { SmartImport } from './SmartImport';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-4 px-3">
    <h3 className="text-xs text-gray-500 mt-2 mb-2 pb-1 border-b border-gray-100 font-medium">{title}</h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const FormGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] text-gray-500 mb-1">{label}</label>
    {children}
  </div>
);

export function ConfigPanel() {
  const { config, meta, updateConfig, updateMeta, widths } = useStore();

  const handleUpdate = (section: keyof typeof config, field: string, value: any) => {
    updateConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const Input = ({ section, field, type = "text", ...props }: any) => {
    const val = config[section as keyof typeof config]?.[field as keyof typeof config[keyof typeof config]] ?? '';
    return (
      <input
        type={type}
        value={val}
        onChange={e => {
          let value: any = e.target.value;
          if (type === 'number') value = parseFloat(value);
          if (type === 'checkbox') value = e.target.checked;
          handleUpdate(section, field, value);
        }}
        className={`w-full p-1.5 border border-gray-300 rounded text-xs focus:border-blue-500 focus:outline-none ${props.className || ''}`}
        {...props}
      />
    );
  };

  return (
    <div 
      className="flex flex-col bg-white overflow-y-auto shrink-0 min-w-[200px]"
      style={{ width: `${widths.config}px` }}
    >
      <SmartImport />

      <Section title="Document Info">
        <FormGroup label="Title">
          <input type="text" value={meta.title} onChange={e => updateMeta({ title: e.target.value })} className="w-full p-1.5 border border-gray-300 rounded text-xs" />
        </FormGroup>
        <FormGroup label="Author">
          <input type="text" value={meta.author} onChange={e => updateMeta({ author: e.target.value })} className="w-full p-1.5 border border-gray-300 rounded text-xs" />
        </FormGroup>
      </Section>

      <Section title="Typography">
        <FormGroup label="Body Font"><Input section="font" field="body" list="fonts-list" /></FormGroup>
        <FormGroup label="Heading Font"><Input section="font" field="heading" list="fonts-list" /></FormGroup>
        <FormGroup label="English Font"><Input section="font" field="english" list="fonts-list" /></FormGroup>
        <FormGroup label="Code Font"><Input section="font" field="code" list="fonts-list" /></FormGroup>
        
        <FormGroup label="Body Size (pt)"><Input section="size" field="body" type="number" min={8} max={72} /></FormGroup>
        
        <div className="grid grid-cols-3 gap-1">
          <FormGroup label="H1"><Input section="size" field="heading1" type="number" /></FormGroup>
          <FormGroup label="H2"><Input section="size" field="heading2" type="number" /></FormGroup>
          <FormGroup label="H3"><Input section="size" field="heading3" type="number" /></FormGroup>
          <FormGroup label="H4"><Input section="size" field="heading4" type="number" /></FormGroup>
          <FormGroup label="H5"><Input section="size" field="heading5" type="number" /></FormGroup>
          <FormGroup label="H6"><Input section="size" field="heading6" type="number" /></FormGroup>
          <FormGroup label="Code"><Input section="size" field="code" type="number" /></FormGroup>
        </div>

        <FormGroup label="Line Spacing"><Input section="spacing" field="lineSpacing" type="number" step={0.1} /></FormGroup>
        <div className="grid grid-cols-2 gap-1">
          <FormGroup label="Para Space(pt)"><Input section="spacing" field="paragraphSpacing" type="number" /></FormGroup>
          <FormGroup label="Head Space(pt)"><Input section="spacing" field="headingSpacing" type="number" /></FormGroup>
        </div>
      </Section>

      <Section title="Colors">
        {[
          { label: 'Heading', field: 'heading' },
          { label: 'Text', field: 'text' },
          { label: 'Link', field: 'link' },
          { label: 'Code BG', field: 'codeBackground' },
          { label: 'Quote', field: 'blockquoteBorder' },
        ].map(({ label, field }) => (
          <div key={field} className="flex items-center gap-2">
            <label className="text-[11px] text-gray-500 flex-1">{label}</label>
            <Input section="color" field={field} type="color" className="!w-8 !h-6 !p-0 cursor-pointer" />
          </div>
        ))}
      </Section>

      <Section title="Page Layout">
        <FormGroup label="Page Size">
          <select value={config.pageSize} onChange={e => updateConfig({ pageSize: e.target.value })} className="w-full p-1.5 border border-gray-300 rounded text-xs">
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
          </select>
        </FormGroup>
        <FormGroup label="Orientation">
          <select value={config.orientation} onChange={e => updateConfig({ orientation: e.target.value })} className="w-full p-1.5 border border-gray-300 rounded text-xs">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </FormGroup>
        <div className="grid grid-cols-2 gap-1 mt-2">
          <FormGroup label="Top(twips)"><Input section="margin" field="top" type="number" step={100} /></FormGroup>
          <FormGroup label="Bottom"><Input section="margin" field="bottom" type="number" step={100} /></FormGroup>
          <FormGroup label="Left"><Input section="margin" field="left" type="number" step={100} /></FormGroup>
          <FormGroup label="Right"><Input section="margin" field="right" type="number" step={100} /></FormGroup>
        </div>
      </Section>

      <Section title="Header & Footer">
        <FormGroup label="Header Text"><Input section="headerFooter" field="header" placeholder="e.g. Title" /></FormGroup>
        <FormGroup label="Footer Text"><Input section="headerFooter" field="footer" placeholder="e.g. Confidential" /></FormGroup>
        <div className="flex items-center gap-2 mt-2">
          <Input section="headerFooter" field="pageNumbers" type="checkbox" className="!w-auto" />
          <label className="text-xs text-gray-600">Show page numbers</label>
        </div>
      </Section>

      <Section title="Images">
        <FormGroup label="Max Width (%)"><Input section="image" field="maxWidthPercent" type="number" min={10} max={100} /></FormGroup>
        <FormGroup label="Default Align">
          <select value={config.image.defaultAlign} onChange={e => handleUpdate('image', 'defaultAlign', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded text-xs">
            <option value="center">Center</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </FormGroup>
      </Section>

      {/* Font datalist */}
      <datalist id="fonts-list">
        <option value="Microsoft YaHei">微软雅黑</option>
        <option value="SimSun">宋体</option>
        <option value="SimHei">黑体</option>
        <option value="KaiTi">楷体</option>
        <option value="FangSong">仿宋</option>
        <option value="DengXian">等线</option>
        <option value="STZhongsong">华文中宋</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Consolas">Consolas</option>
        <option value="Calibri">Calibri</option>
        <option value="Courier New">Courier New</option>
      </datalist>
    </div>
  );
}
