import type { ConvertPayload, DocxProvider } from '../types';
import { isServerRuntime } from '../runtime';
import { normalizeApiFailure, parseErrorPayload } from '../errors';

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

export const serverDocxProvider: DocxProvider = {
  id: 'server',
  label: 'Server engine',
  async canExecute() {
    return isServerRuntime;
  },
  async execute(payload: ConvertPayload) {
    const response = await fetch(`${API_BASE}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preparePayload(payload)),
    });

    if (!response.ok) {
      throw normalizeApiFailure('docxExport', 'Conversion failed', response, await parseErrorPayload(response));
    }

    return response.blob();
  },
};
