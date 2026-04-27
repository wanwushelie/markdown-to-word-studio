import fs from 'fs/promises';
import { buildDocument } from './document-builder.js';
import { Packer } from 'docx';
import type { DocumentIR } from '../core/types.js';
import { DocxGenerationError } from '../core/errors.js';

export async function generate(ir: DocumentIR, outputPath: string): Promise<void> {
  try {
    const doc = await buildDocument(ir);
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
  } catch (error) {
    throw new DocxGenerationError(
      `Failed to generate document at ${outputPath}`,
      error
    );
  }
}

export { buildDocument } from './document-builder.js';
