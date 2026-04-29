import { Packer } from 'docx';
import { parse } from '../../../src/parser/index';
import { buildDocument } from '../../../src/generator/document-builder';
import { createConfig } from '../../../src/core/config';
import { Capabilities, Config, DocumentMeta } from '../store/useStore';

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

function ensureUnavailable(feature: string): never {
  throw new Error(`${feature} requires the server edition and is unavailable on GitHub Pages.`);
}

function hexToDocx(hex: string): string {
  return hex.replace('#', '');
}

function normalizePayload(payload: ConvertPayload): ConvertPayload {
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

async function buildDocxBlob(payload: ConvertPayload): Promise<Blob> {
  const normalized = normalizePayload(payload);
  const config = createConfig(normalized.config as any);
  const ir = parse(normalized.markdown, { meta: normalized.meta, config });
  const doc = await buildDocument(ir);
  return Packer.toBlob(doc);
}

export const api = {
  async getRuntimeSettings(): Promise<any> {
    ensureUnavailable('Runtime settings');
  },

  async updateRuntimeSettings(_payload: Partial<RuntimeSettings>): Promise<any> {
    ensureUnavailable('Runtime settings');
  },

  async getCapabilities(): Promise<Capabilities> {
    return { docx: true, pdfLocal: false, collabora: false, localPreview: true };
  },

  async convertToDocx(payload: ConvertPayload): Promise<Blob> {
    return buildDocxBlob(payload);
  },

  async convertToPdf(_payload: ConvertPayload): Promise<Blob> {
    ensureUnavailable('PDF export');
  },

  async createPreviewSession(_payload: ConvertPayload): Promise<{ fileId: string; accessToken: string; collaboraUrl: string }> {
    ensureUnavailable('Collabora preview');
  },

  async downloadCollaboraFile(_fileId: string, _accessToken: string): Promise<Blob> {
    ensureUnavailable('Collabora download');
  },

  async exportCollaboraPdf(_fileId: string, _accessToken: string): Promise<Blob> {
    ensureUnavailable('Collabora PDF export');
  },
};
