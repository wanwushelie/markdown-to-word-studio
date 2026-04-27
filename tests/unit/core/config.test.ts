import { describe, it, expect } from 'vitest';
import { createConfig, defaultConfig, mergeConfig } from '../../../src/core/config.js';

describe('config', () => {
  it('should create default config', () => {
    const config = createConfig();
    expect(config.font.body).toBe('Microsoft YaHei');
    expect(config.font.heading).toBe('SimHei');
    expect(config.size.body).toBe(11);
    expect(config.spacing.lineSpacing).toBe(1.5);
    expect(config.pageSize).toBe('A4');
  });

  it('should merge custom font config', () => {
    const config = createConfig({
      font: { body: 'Songti' },
    });
    expect(config.font.body).toBe('Songti');
    expect(config.font.heading).toBe('SimHei'); // unchanged
  });

  it('should reject invalid pageSize', () => {
    expect(() => createConfig({ pageSize: 'A3' as any })).toThrow();
  });

  it('should mergeConfig override values', () => {
    const merged = mergeConfig(defaultConfig, { size: { body: 12 } });
    expect(merged.size.body).toBe(12);
    expect(merged.size.heading1).toBe(22); // unchanged
  });
});
