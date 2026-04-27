import { z } from 'zod';
import type { ResolvedConfig } from './types.js';

const fontConfigSchema = z.object({
  body: z.string().default('Microsoft YaHei'),
  heading: z.string().default('SimHei'),
  english: z.string().default('Times New Roman'),
  code: z.string().default('Consolas'),
});

const sizeConfigSchema = z.object({
  body: z.number().default(11),
  heading1: z.number().default(22),
  heading2: z.number().default(18),
  heading3: z.number().default(16),
  heading4: z.number().default(14),
  heading5: z.number().default(12),
  heading6: z.number().default(11),
  code: z.number().default(10),
});

const spacingConfigSchema = z.object({
  lineSpacing: z.number().default(1.5),
  paragraphSpacing: z.number().default(6),
  headingSpacing: z.number().default(12),
});

const marginConfigSchema = z.object({
  top: z.number().default(1440),
  bottom: z.number().default(1440),
  left: z.number().default(1440),
  right: z.number().default(1440),
});

const imageConfigSchema = z.object({
  maxWidthPercent: z.number().min(1).max(100).default(80),
  defaultAlign: z.enum(['left', 'center', 'right']).default('center'),
});

const headerFooterConfigSchema = z.object({
  header: z.string().optional(),
  footer: z.string().optional(),
  pageNumbers: z.boolean().default(false),
});

const colorConfigSchema = z.object({
  heading: z.string().default('000000'),
  text: z.string().default('000000'),
  link: z.string().default('0563C1'),
  codeBackground: z.string().default('F5F5F5'),
  blockquoteBorder: z.string().default('CCCCCC'),
});

export const configSchema = z.object({
  font: fontConfigSchema,
  size: sizeConfigSchema,
  spacing: spacingConfigSchema,
  margin: marginConfigSchema,
  image: imageConfigSchema,
  headerFooter: headerFooterConfigSchema,
  color: colorConfigSchema,
  pageSize: z.enum(['A4', 'Letter']).default('A4'),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
});

export type ConfigInput = z.input<typeof configSchema>;

export function createConfig(input?: ConfigInput): ResolvedConfig {
  return configSchema.parse({
    font: {},
    size: {},
    spacing: {},
    margin: {},
    image: {},
    headerFooter: {},
    color: {},
    pageSize: 'A4',
    orientation: 'portrait',
    ...input,
  });
}

export function mergeConfig(base: ResolvedConfig, override: ConfigInput): ResolvedConfig {
  return createConfig({
    ...base,
    ...override,
  });
}

export const defaultConfig: ResolvedConfig = createConfig();
