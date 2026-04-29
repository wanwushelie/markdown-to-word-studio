import type { Capabilities } from '../../store/useStore';
import type { ConvertPayload, PreviewSession, RuntimeSettings, RuntimeSettingsResponse } from './types';
import { normalizeApiFailure, parseErrorPayload } from './errors';

const API_BASE = '/api';

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
      },
    },
  };
}

export async function fetchServerCapabilities(): Promise<Capabilities> {
  const response = await fetch('/capabilities');
  if (!response.ok) {
    throw normalizeApiFailure('capabilities', 'Failed to fetch capabilities', response, await parseErrorPayload(response));
  }
  return response.json();
}

export async function fetchRuntimeSettings(): Promise<RuntimeSettingsResponse> {
  const response = await fetch(`${API_BASE}/runtime/settings`);
  if (!response.ok) {
    throw normalizeApiFailure('runtimeSettings', 'Failed to fetch runtime settings', response, await parseErrorPayload(response));
  }
  return response.json();
}

export async function saveRuntimeSettings(payload: Partial<RuntimeSettings>): Promise<RuntimeSettingsResponse> {
  const response = await fetch(`${API_BASE}/runtime/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw normalizeApiFailure(
      'runtimeSettings',
      'Failed to update runtime settings',
      response,
      await parseErrorPayload(response),
    );
  }

  return response.json();
}

export async function convertToPdfOnServer(payload: ConvertPayload): Promise<Blob> {
  const response = await fetch(`${API_BASE}/convert/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preparePayload(payload)),
  });

  if (!response.ok) {
    throw normalizeApiFailure('pdfExport', 'PDF export failed', response, await parseErrorPayload(response));
  }

  return response.blob();
}

export async function createServerPreviewSession(payload: ConvertPayload): Promise<PreviewSession> {
  const response = await fetch(`${API_BASE}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preparePayload(payload)),
  });

  if (!response.ok) {
    throw normalizeApiFailure(
      'collaboraPreview',
      'Preview generation failed',
      response,
      await parseErrorPayload(response),
    );
  }

  return response.json();
}

export async function downloadServerCollaboraFile(fileId: string, accessToken: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/files/${fileId}/download?access_token=${encodeURIComponent(accessToken)}`);
  if (!response.ok) {
    throw normalizeApiFailure(
      'collaboraDownload',
      'Download failed',
      response,
      await parseErrorPayload(response),
    );
  }
  return response.blob();
}

export async function exportServerCollaboraPdf(fileId: string, accessToken: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/files/${fileId}/export/pdf?access_token=${encodeURIComponent(accessToken)}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw normalizeApiFailure(
      'collaboraPdfExport',
      'PDF export failed',
      response,
      await parseErrorPayload(response),
    );
  }
  return response.blob();
}
