import { Capabilities, Config, DocumentMeta } from '../store/useStore';

const API_BASE = '/api';

export interface ConvertPayload {
  markdown: string;
  config: Config;
  meta: DocumentMeta;
}

export interface RuntimeSettings {
  libreOfficePath: string;
}
export interface RuntimeDiagnostics {
  libreOffice: {
    detected: boolean;
    source: 'custom' | 'env' | 'auto';
    configuredCommand: string;
    resolvedPath: string;
  };
  collabora: {
    detected: boolean;
    source: 'auto';
    url: string;
  };
  localPreview: {
    detected: boolean;
    source: 'builtin';
  };
}

function hexToDocx(hex: string): string {
  return hex.replace('#', '');
}

function preparePayload(payload: ConvertPayload): ConvertPayload {
  return {
    ...payload,
    config: {
      ...payload.config,
      color: {
        heading: hexToDocx(payload.config.color.heading),
        text: hexToDocx(payload.config.color.text),
        link: hexToDocx(payload.config.color.link),
        codeBackground: hexToDocx(payload.config.color.codeBackground),
        blockquoteBorder: hexToDocx(payload.config.color.blockquoteBorder),
      }
    }
  };
}

export const api = {
  async getRuntimeSettings(): Promise<{ settings: RuntimeSettings; capabilities: Capabilities; diagnostics: RuntimeDiagnostics }> {
    const response = await fetch(`${API_BASE}/runtime/settings`);
    if (!response.ok) throw new Error('Failed to fetch runtime settings');
    return response.json();
  },

  async updateRuntimeSettings(payload: Partial<RuntimeSettings>): Promise<{ settings: RuntimeSettings; capabilities: Capabilities; diagnostics: RuntimeDiagnostics }> {
    const response = await fetch(`${API_BASE}/runtime/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update runtime settings' }));
      throw new Error(error.message || 'Failed to update runtime settings');
    }
    return response.json();
  },

  async getCapabilities(): Promise<Capabilities> {
    const response = await fetch('/capabilities');
    if (!response.ok) throw new Error('Failed to fetch capabilities');
    return response.json();
  },

  async convertToDocx(payload: ConvertPayload): Promise<Blob> {
    const response = await fetch(`${API_BASE}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preparePayload(payload)),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Conversion failed' }));
      throw new Error(error.message || 'Conversion failed');
    }
    return response.blob();
  },

  async convertToPdf(payload: ConvertPayload): Promise<Blob> {
    const response = await fetch(`${API_BASE}/convert/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preparePayload(payload)),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'PDF Export failed' }));
      throw new Error(error.message || 'PDF Export failed');
    }
    return response.blob();
  },

  async createPreviewSession(payload: ConvertPayload): Promise<{ fileId: string; accessToken: string; collaboraUrl: string }> {
    const response = await fetch(`${API_BASE}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preparePayload(payload)),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Preview generation failed' }));
      throw new Error(error.message || 'Preview generation failed');
    }
    return response.json();
  },

  async downloadCollaboraFile(fileId: string, accessToken: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/files/${fileId}/download?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) throw new Error('Download failed');
    return response.blob();
  },

  async exportCollaboraPdf(fileId: string, accessToken: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/files/${fileId}/export/pdf?access_token=${encodeURIComponent(accessToken)}`, { method: 'POST' });
    if (!response.ok) throw new Error('PDF Export failed');
    return response.blob();
  }
};
