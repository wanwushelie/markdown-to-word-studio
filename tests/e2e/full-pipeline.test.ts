import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { parse } from '../../src/parser/index.js';
import { generateBuffer } from '../../src/generator/document-builder.js';
import { createConfig } from '../../src/core/config.js';

describe('full pipeline', () => {
  it('should generate a valid docx buffer from markdown', async () => {
    const markdown = `# Test Document

This is a **bold** paragraph.

- Item 1
- Item 2

| Col1 | Col2 |
|------|------|
| A    | B    |
`;

    const ir = parse(markdown, {
      meta: { title: 'Test', author: 'Tester' },
      config: createConfig(),
    });

    const buffer = await generateBuffer(ir);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);

    // Verify it's a valid ZIP (docx is a ZIP file)
    expect(buffer.readUInt32LE(0)).toBe(0x04034b50);
  });

  it('should handle complex markdown', async () => {
    const markdown = await fs.readFile(
      path.join(process.cwd(), 'tests/fixtures/markdown/sample.md'),
      'utf-8'
    );

    const ir = parse(markdown, {
      config: createConfig(),
    });

    const buffer = await generateBuffer(ir);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(2000);
  });
});
