import { Config, DocumentMeta } from '../store/useStore';

const API_BASE = '/api';

export interface ConvertPayload {
  markdown: string;
  config: Config;
  meta: DocumentMeta;
}

export const api = {
  async convertToDocx(payload: ConvertPayload): Promise<Blob> {
    const response = await fetch(`${API_BASE}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
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
