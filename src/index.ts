export { parse } from './parser/index.js';
export { generate, buildDocument } from './generator/index.js';
export { createConfig, mergeConfig, defaultConfig, configSchema } from './core/config.js';
export type { ConfigInput } from './core/config.js';
export type {
  DocumentIR,
  DocumentMeta,
  BlockNode,
  InlineNode,
  ResolvedConfig,
  FontConfig,
  SizeConfig,
  SpacingConfig,
  MarginConfig,
  ImageConfig,
  HeaderFooterConfig,
  ColorConfig,
} from './core/types.js';
export {
  MarkdownParseError,
  DocxGenerationError,
  ImageProcessingError,
  ConfigValidationError,
} from './core/errors.js';
