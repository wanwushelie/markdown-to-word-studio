import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { parse } from './parser/index.js';
import { generateBuffer } from './generator/document-builder.js';
import { createConfig, type ConfigInput } from './core/config.js';
import libreoffice from 'libreoffice-convert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const convertToPdf = promisify(libreoffice.convert);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/convert', async (req, res) => {
  try {
    const { markdown, config: configInput, meta } = req.body;

    if (!markdown) {
      return res.status(400).json({ error: 'Markdown content is required' });
    }

    const config = createConfig(configInput as ConfigInput | undefined);
    const ir = parse(markdown, {
      meta: meta ?? {},
      config,
    });

    const buffer = await generateBuffer(ir);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${meta?.title || 'document'}.docx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      error: 'Failed to convert markdown to docx',
      message: (error as Error).message,
    });
  }
});

app.post('/api/preview', async (req, res) => {
  try {
    const { markdown, config: configInput, meta } = req.body;

    if (!markdown) {
      return res.status(400).json({ error: 'Markdown content is required' });
    }

    const config = createConfig(configInput as ConfigInput | undefined);
    const ir = parse(markdown, {
      meta: meta ?? {},
      config,
    });

    const docxBuffer = await generateBuffer(ir);
    const pdfBuffer = await convertToPdf(docxBuffer, 'pdf', undefined);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Preview error:', error);
    const message = (error as Error).message;
    if (message.includes('Could not find soffice binary')) {
      return res.status(503).json({
        error: 'LibreOffice not found',
        message: 'LibreOffice is required for PDF preview. Please install it from https://www.libreoffice.org/download/download/',
      });
    }
    res.status(500).json({
      error: 'Failed to generate PDF preview',
      message,
    });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
