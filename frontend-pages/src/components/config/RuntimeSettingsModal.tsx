import React, { useEffect, useState } from 'react';
import { api, RuntimeDiagnostics } from '../../services/api';
import { useStore } from '../../store/useStore';
import { showToast } from '../ui/Toast';

interface RuntimeSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function RuntimeSettingsModal({ open, onClose }: RuntimeSettingsModalProps) {
  const { capabilities, setCapabilities, language } = useStore();
  const [pathInput, setPathInput] = useState('');
  const [diagnostics, setDiagnostics] = useState<RuntimeDiagnostics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.getRuntimeSettings()
      .then((res) => {
        setPathInput(res.settings.libreOfficePath || '');
        setCapabilities(res.capabilities);
        setDiagnostics(res.diagnostics);
      })
      .catch((err) => showToast((err as Error).message, 'error'))
      .finally(() => setLoading(false));
  }, [open, setCapabilities]);

  const save = async () => {
    setLoading(true);
    try {
      const res = await api.updateRuntimeSettings({ libreOfficePath: pathInput.trim() });
      setCapabilities(res.capabilities);
      setDiagnostics(res.diagnostics);
      showToast('Runtime settings updated');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const autoDetect = async () => {
    setPathInput('');
    setLoading(true);
    try {
      const res = await api.updateRuntimeSettings({ libreOfficePath: '' });
      setCapabilities(res.capabilities);
      setDiagnostics(res.diagnostics);
      showToast('Auto-detection refreshed');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const StatusBadge = ({ ok }: { ok: boolean }) => (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded border ${ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
      {ok ? (language === 'zh-CN' ? '已检测' : 'Detected') : (language === 'zh-CN' ? '未检测' : 'Not Detected')}
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-[min(680px,96vw)] bg-white rounded-lg border border-gray-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">
            {language === 'zh-CN' ? '运行时设置' : 'Runtime Settings'}
          </div>
          <button onClick={onClose} className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100">
            {language === 'zh-CN' ? '关闭' : 'Close'}
          </button>
        </div>
        <div className="px-4 py-3 space-y-3">
          <p className="text-xs text-gray-600">
            {language === 'zh-CN'
              ? '默认自动检测。仅当已安装 LibreOffice 但无法检测时，再填写自定义路径。'
              : 'Auto-detection is default. Only set a custom path if LibreOffice is installed but not detected.'}
          </p>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {language === 'zh-CN' ? 'LibreOffice 可执行文件路径' : 'LibreOffice executable path'}
            </label>
            <input
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              placeholder="Example: C:\\Program Files\\LibreOffice\\program\\soffice.exe"
              className="w-full p-2 border border-gray-300 rounded text-xs"
            />
          </div>
          <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
            <div className="font-medium mb-2">{language === 'zh-CN' ? '环境检测结果' : 'Environment Detection'}</div>
            <div className="space-y-2">
              <div className="p-2 bg-white border border-gray-200 rounded">
                <div className="flex items-center justify-between">
                  <div className="font-medium">LibreOffice (PDF)</div>
                  <StatusBadge ok={capabilities.pdfLocal} />
                </div>
                <div className="text-[11px] text-gray-600 mt-1">
                  {language === 'zh-CN' ? '检测命令/路径：' : 'Command/Path:'} {diagnostics?.libreOffice.configuredCommand || 'soffice'}
                </div>
                <div className="text-[11px] text-gray-600">
                  {language === 'zh-CN' ? '解析到地址：' : 'Resolved path:'} {diagnostics?.libreOffice.resolvedPath || (language === 'zh-CN' ? '未解析到' : 'Not resolved')}
                </div>
                <div className="text-[11px] text-gray-500">
                  {language === 'zh-CN' ? '来源：' : 'Source:'} {diagnostics?.libreOffice.source || 'auto'}
                </div>
              </div>
              <div className="p-2 bg-white border border-gray-200 rounded">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Collabora</div>
                  <StatusBadge ok={capabilities.collabora} />
                </div>
                <div className="text-[11px] text-gray-600 mt-1">
                  URL: {diagnostics?.collabora.url || 'N/A'}
                </div>
              </div>
              <div className="p-2 bg-white border border-gray-200 rounded">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Local Word Preview</div>
                  <StatusBadge ok={capabilities.localPreview} />
                </div>
                <div className="text-[11px] text-gray-600 mt-1">
                  {language === 'zh-CN' ? '前端内置渲染，无需外部服务。' : 'Built-in frontend renderer; no external service required.'}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-gray-500 mt-2">
              {language === 'zh-CN'
                ? '命令行自检建议：在终端执行 soffice --version。若失败，请填写 soffice.exe 完整路径后保存。'
                : 'CLI self-check: run soffice --version. If it fails, provide full soffice executable path and save.'}
            </div>
          </div>

          <div className="text-xs text-gray-700 bg-blue-50 border border-blue-200 rounded p-2 space-y-2">
            <div className="font-medium">
              {language === 'zh-CN' ? 'Windows 快速排查（推荐）' : 'Windows Quick Check (Recommended)'}
            </div>
            <div className="text-[11px] text-gray-700">
              {language === 'zh-CN'
                ? '1) 在 PowerShell 执行：'
                : '1) Run in PowerShell:'}
            </div>
            <pre className="text-[11px] bg-white border border-blue-100 rounded p-2 overflow-auto">{`soffice --version`}</pre>
            <div className="text-[11px] text-gray-700">
              {language === 'zh-CN'
                ? '2) 若命令不可用，检查安装路径：'
                : '2) If command not found, check install paths:'}
            </div>
            <pre className="text-[11px] bg-white border border-blue-100 rounded p-2 overflow-auto">{`Test-Path "C:\\Program Files\\LibreOffice\\program\\soffice.exe"
Test-Path "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe"`}</pre>
            <div className="text-[11px] text-gray-700">
              {language === 'zh-CN'
                ? '3) 若返回 True，把完整路径填到上方输入框并点 Save。'
                : '3) If output is True, paste full executable path above and click Save.'}
            </div>
            <div className="text-[11px] text-gray-600">
              {language === 'zh-CN'
                ? '常见示例：C:\\Program Files\\LibreOffice\\program\\soffice.exe'
                : 'Common example: C:\\Program Files\\LibreOffice\\program\\soffice.exe'}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex gap-2 justify-end">
          <button onClick={autoDetect} disabled={loading} className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
            {language === 'zh-CN' ? '自动检测' : 'Auto Detect'}
          </button>
          <button onClick={save} disabled={loading} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {language === 'zh-CN' ? '保存' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
