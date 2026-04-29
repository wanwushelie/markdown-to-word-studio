import type { Capabilities } from '../store/useStore';
import { executeDocx, getDocxExecutionInfo } from './capabilities/resolvers/docxResolver';
import { isBrowserPublic } from './capabilities/runtime';
import {
  convertToPdfOnServer,
  createServerPreviewSession,
  downloadServerCollaboraFile,
  exportServerCollaboraPdf,
  fetchRuntimeSettings,
  fetchServerCapabilities,
  saveRuntimeSettings,
} from './capabilities/serverApi';
import { ensureServerFeature } from './capabilities/serverOnly';
import type {
  ConvertPayload,
  DocxExecutionMode,
  RuntimeDiagnostics,
  RuntimeSettings,
  RuntimeSettingsResponse,
} from './capabilities/types';

const staticCapabilities: Capabilities = { docx: true, pdfLocal: false, collabora: false, localPreview: true };

export type { ConvertPayload, RuntimeDiagnostics, RuntimeSettings };

export const api = {
  async getRuntimeSettings(): Promise<RuntimeSettingsResponse> {
    ensureServerFeature('runtimeSettings');
    return fetchRuntimeSettings();
  },

  async updateRuntimeSettings(payload: Partial<RuntimeSettings>): Promise<RuntimeSettingsResponse> {
    ensureServerFeature('runtimeSettings');
    return saveRuntimeSettings(payload);
  },

  async getCapabilities(): Promise<Capabilities> {
    if (isBrowserPublic) {
      return staticCapabilities;
    }
    return fetchServerCapabilities();
  },

  async getDocxExecutionInfo(mode?: DocxExecutionMode) {
    return getDocxExecutionInfo(mode);
  },

  async convertToDocx(payload: ConvertPayload, options?: { mode?: DocxExecutionMode }): Promise<Blob> {
    const result = await executeDocx(payload, options);
    return result.blob;
  },

  async convertToPdf(payload: ConvertPayload): Promise<Blob> {
    ensureServerFeature('pdfExport');
    return convertToPdfOnServer(payload);
  },

  async createPreviewSession(payload: ConvertPayload): Promise<{ fileId: string; accessToken: string; collaboraUrl: string }> {
    ensureServerFeature('collaboraPreview');
    return createServerPreviewSession(payload);
  },

  async downloadCollaboraFile(fileId: string, accessToken: string): Promise<Blob> {
    ensureServerFeature('collaboraDownload');
    return downloadServerCollaboraFile(fileId, accessToken);
  },

  async exportCollaboraPdf(fileId: string, accessToken: string): Promise<Blob> {
    ensureServerFeature('collaboraPdfExport');
    return exportServerCollaboraPdf(fileId, accessToken);
  },
};
