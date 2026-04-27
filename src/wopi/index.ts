import { Router, raw } from 'express';
import * as token from './token.js';
import * as storage from './storage.js';

const router = Router();

function validateToken(req: any, res: any, next: any) {
  const accessToken = req.query.access_token as string;
  const { fileId } = req.params;
  if (!accessToken || !token.validate(accessToken, fileId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use('/files/:fileId', validateToken);

router.get('/files/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const meta = storage.getMeta(fileId);
  if (!meta) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.json({
    BaseFileName: 'document.docx',
    Size: meta.size,
    OwnerId: 'anonymous',
    UserId: 'anonymous',
    UserFriendlyName: 'Anonymous',
    UserCanWrite: true,
    UserCanNotWriteRelative: true,
    PostMessageOrigin: process.env.PUBLIC_APP_URL || 'http://localhost:3000',
    LastModifiedTime: new Date(meta.modifiedAt).toISOString(),
  });
});

router.get('/files/:fileId/contents', async (req, res) => {
  const { fileId } = req.params;
  try {
    const buffer = await storage.read(fileId);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch (err: any) {
    if (err.message === 'Invalid fileId') return res.status(400).end();
    return res.status(404).end();
  }
});

router.post('/files/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const override = req.headers['x-wopi-override'] as string;
  const lockHeader = req.headers['x-wopi-lock'] as string;

  if (override === 'LOCK') {
    const existing = storage.getLock(fileId);
    if (existing && existing !== lockHeader) {
      res.setHeader('X-WOPI-Lock', existing);
      return res.status(409).end();
    }
    storage.setLock(fileId, lockHeader || 'default');
    return res.status(200).end();
  }

  if (override === 'GET_LOCK') {
    const existing = storage.getLock(fileId);
    if (existing) {
      res.setHeader('X-WOPI-Lock', existing);
    }
    return res.status(200).end();
  }

  if (override === 'REFRESH_LOCK') {
    const existing = storage.getLock(fileId);
    if (existing && existing !== lockHeader) {
      res.setHeader('X-WOPI-Lock', existing);
      return res.status(409).end();
    }
    storage.setLock(fileId, lockHeader || 'default');
    return res.status(200).end();
  }

  if (override === 'UNLOCK') {
    storage.deleteLock(fileId);
    return res.status(200).end();
  }

  return res.status(501).end();
});

router.post('/files/:fileId/contents', raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
  const { fileId } = req.params;
  const lockHeader = req.headers['x-wopi-lock'] as string;
  const existing = storage.getLock(fileId);
  if (existing && existing !== lockHeader) {
    res.setHeader('X-WOPI-Lock', existing);
    return res.status(409).end();
  }

  try {
    const buffer = Buffer.from(req.body);
    await storage.save(fileId, buffer);
    await storage.updateModified(fileId);
    res.setHeader('X-WOPI-ItemVersion', Date.now().toString());
    return res.status(200).end();
  } catch (err: any) {
    if (err.message === 'Invalid fileId') return res.status(400).end();
    return res.status(500).end();
  }
});

export default router;
