import { tokenize } from './tokenize.js';
import { transformTokens } from './transformer.js';
import type { DocumentIR, DocumentMeta, ResolvedConfig } from '../core/types.js';
import { defaultConfig } from '../core/config.js';

export interface ParseOptions {
  meta?: DocumentMeta;
  config?: ResolvedConfig;
}

export function parse(markdown: string, options?: ParseOptions): DocumentIR {
  const tokens = tokenize(markdown);
  const children = transformTokens(tokens);

  return {
    type: 'document',
    meta: options?.meta ?? {},
    config: options?.config ?? defaultConfig,
    children,
  };
}

export { tokenize, transformTokens };
