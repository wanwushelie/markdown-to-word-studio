import { Packer } from 'docx';
import { parse } from '../../../../../src/parser/index';
import { buildDocument } from '../../../../../src/generator/document-builder';
import { createConfig } from '../../../../../src/core/config';
import type { ConvertPayload, DocxProvider } from '../types';

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

export const browserDocxProvider: DocxProvider = {
  id: 'browser',
  label: 'Browser engine',
  async canExecute() {
    return typeof window !== 'undefined' && typeof Blob !== 'undefined';
  },
  async execute(payload) {
    const normalized = normalizePayload(payload);
    const config = createConfig(normalized.config as any);
    const ir = parse(normalized.markdown, { meta: normalized.meta, config });
    const doc = await buildDocument(ir);
    return Packer.toBlob(doc);
  },
};
