import { Router } from 'express';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { parse } from '../parser/index.js';
import { generateBuffer } from '../generator/document-builder.js';
import { createConfig, type ConfigInput } from '../core/config.js';
import libreoffice from 'libreoffice-convert';
import * as token from '../wopi/token.js';
import * as storage from '../wopi/storage.js';
import { getEditUrlSrc } from '../wopi/discovery.js';
import { getRuntimeCapabilities, getRuntimeDiagnostics, refreshRuntimeCapabilities } from '../core/capabilities.js';
import { getRuntimeSettings, updateRuntimeSettings } from '../core/runtime-settings.js';

const router = Router();
const convertToPdf = promisify(libreoffice.convert);

router.get('/runtime/settings', (_req, res) => {
  res.json({
    settings: getRuntimeSettings(),
    capabilities: getRuntimeCapabilities(),
    diagnostics: getRuntimeDiagnostics(),
  });
});

router.post('/runtime/settings', (req, res) => {
  try {
    const { libreOfficePath } = req.body ?? {};
    const settings = updateRuntimeSettings({
      libreOfficePath: typeof libreOfficePath === 'string' ? libreOfficePath : '',
    });
    refreshRuntimeCapabilities();
    res.json({
      settings,
      capabilities: getRuntimeCapabilities(),
      diagnostics: getRuntimeDiagnostics(),
    });
  } catch (error: any) {
    res.status(400).json({
      error: 'Failed to update runtime settings',
      message: error?.message || 'Invalid runtime settings payload',
    });
  }
});

function normalizeFileBasename(input: unknown, fallback = 'document'): string {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return fallback;
  // Remove separators/control chars that can break header values or paths.
  const cleaned = raw.replace(/[\\/\r\n\t\0]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function buildContentDisposition(filenameBase: string, ext: 'docx' | 'pdf'): string {
  const base = normalizeFileBasename(filenameBase);
  // ASCII fallback for broad compatibility.
  const asciiBase = base.replace(/[^\x20-\x7E]/g, '_').replace(/["]/g, '');
  const safeAscii = (asciiBase || 'document').trim();
  const utf8Name = `${base}.${ext}`;
  const asciiName = `${safeAscii}.${ext}`;
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(utf8Name)}`;
}

router.post('/convert', async (req, res) => {
  try {
    const { markdown, config: configInput, meta } = req.body;
    if (!markdown) {
      return res.status(400).json({ error: 'Markdown content is required' });
    }
    const config = createConfig(configInput as ConfigInput | undefined);
    const ir = parse(markdown, { meta: meta ?? {}, config });
    const buffer = await generateBuffer(ir);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', buildContentDisposition(meta?.title, 'docx'));
    res.send(buffer);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      error: 'Failed to convert markdown to docx',
      message: (error as Error).message,
    });
  }
});

router.post('/preview', async (req, res) => {
  try {
    const capabilities = getRuntimeCapabilities();
    if (!capabilities.collabora) {
      return res.status(503).json({
        error: 'Collabora unavailable',
        message: 'Collabora preview is not enabled in this environment.',
      });
    }
    const { markdown, config: configInput, meta } = req.body;
    if (!markdown) {
      return res.status(400).json({ error: 'Markdown content is required' });
    }
    const config = createConfig(configInput as ConfigInput | undefined);
    const ir = parse(markdown, { meta: meta ?? {}, config });
    const docxBuffer = await generateBuffer(ir);
    const fileId = randomUUID();
    await storage.save(fileId, docxBuffer);
    const accessToken = token.generate(fileId);
    const urlsrc = getEditUrlSrc();
    const WOPISrc = `${process.env.PUBLIC_APP_URL || 'http://localhost:3000'}/wopi/files/${fileId}`;
    const collaboraUrl = `${urlsrc}&WOPISrc=${encodeURIComponent(WOPISrc)}&access_token=${encodeURIComponent(accessToken)}&lang=zh-CN&closebutton=1`;
    res.json({ fileId, accessToken, collaboraUrl });
  } catch (error) {
    console.error('Preview session error:', error);
    res.status(500).json({
      error: 'Failed to create preview session',
      message: (error as Error).message,
    });
  }
});

router.get('/files/:fileId/download', async (req, res) => {
  try {
    const { fileId } = req.params;
    const accessToken = req.query.access_token as string;
    if (!accessToken || !token.validate(accessToken, fileId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const buffer = await storage.read(fileId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="document.docx"');
    res.send(buffer);
  } catch (error: any) {
    if (error.message === 'Invalid fileId') return res.status(400).json({ error: 'Invalid fileId' });
    res.status(404).json({ error: 'File not found' });
  }
});

router.post('/files/:fileId/export/pdf', async (req, res) => {
  try {
    const capabilities = getRuntimeCapabilities();
    if (!capabilities.pdfLocal) {
      return res.status(503).json({
        error: 'Local PDF unavailable',
        message: 'Local PDF export is not enabled in this environment.',
      });
    }
    const { fileId } = req.params;
    const accessToken = req.query.access_token as string;
    if (!accessToken || !token.validate(accessToken, fileId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const docxBuffer = await storage.read(fileId);
    const pdfBuffer = await convertToPdf(docxBuffer, 'pdf', undefined);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    res.send(pdfBuffer);
  } catch (error: any) {
    if (error.message === 'Invalid fileId') return res.status(400).json({ error: 'Invalid fileId' });
    if (error.message.includes('Could not find soffice binary')) {
      return res.status(503).json({
        error: 'LibreOffice not found',
        message: 'LibreOffice is required for PDF export.',
      });
    }
    res.status(500).json({ error: 'Failed to export PDF', message: error.message });
  }
});

router.post('/convert/pdf', async (req, res) => {
  try {
    const capabilities = getRuntimeCapabilities();
    if (!capabilities.pdfLocal) {
      return res.status(503).json({
        error: 'Local PDF unavailable',
        message: 'Local PDF export is not enabled in this environment.',
      });
    }
    const { markdown, config: configInput, meta } = req.body;
    if (!markdown) {
      return res.status(400).json({ error: 'Markdown content is required' });
    }
    const config = createConfig(configInput as ConfigInput | undefined);
    const ir = parse(markdown, { meta: meta ?? {}, config });
    const docxBuffer = await generateBuffer(ir);
    const pdfBuffer = await convertToPdf(docxBuffer, 'pdf', undefined);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', buildContentDisposition(meta?.title, 'pdf'));
    res.send(pdfBuffer);
  } catch (error: any) {
    if (error.message && error.message.includes('Could not find soffice binary')) {
      return res.status(503).json({
        error: 'LibreOffice not found',
        message: 'LibreOffice is required for PDF export.',
      });
    }
    res.status(500).json({ error: 'Failed to export PDF', message: error.message });
  }
});

export default router;
