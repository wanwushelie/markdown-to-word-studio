import fs from 'fs/promises';
import path from 'path';

const TEMP_DIR = process.env.TEMP_DIR || './tmp/wopi';
const TTL_MS = parseInt(process.env.TEMP_FILE_TTL_MS || '1800000', 10);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const locks = new Map<string, { lockId: string; expiresAt: number }>();
const fileMeta = new Map<string, { path: string; createdAt: number; size: number; modifiedAt: number }>();

function getFilePath(fileId: string): string {
  if (!UUID_RE.test(fileId)) {
    throw new Error('Invalid fileId');
  }
  return path.join(TEMP_DIR, `${fileId}.docx`);
}

export async function save(fileId: string, buffer: Buffer): Promise<void> {
  const p = getFilePath(fileId);
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await fs.writeFile(p, buffer);
  const stat = await fs.stat(p);
  fileMeta.set(fileId, { path: p, createdAt: Date.now(), size: stat.size, modifiedAt: Date.now() });
}

export async function read(fileId: string): Promise<Buffer> {
  const p = getFilePath(fileId);
  return fs.readFile(p);
}

export async function remove(fileId: string): Promise<void> {
  const p = getFilePath(fileId);
  try {
    await fs.unlink(p);
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err;
  }
  fileMeta.delete(fileId);
  locks.delete(fileId);
}

export function getMeta(fileId: string) {
  return fileMeta.get(fileId);
}

export async function updateModified(fileId: string): Promise<void> {
  const meta = fileMeta.get(fileId);
  if (meta) {
    meta.modifiedAt = Date.now();
    const stat = await fs.stat(meta.path).catch(() => null);
    if (stat) meta.size = stat.size;
  }
}

export function getLock(fileId: string) {
  const lock = locks.get(fileId);
  if (lock && lock.expiresAt < Date.now()) {
    locks.delete(fileId);
    return undefined;
  }
  return lock?.lockId;
}

export function setLock(fileId: string, lockId: string, ttlMs = 600000) {
  locks.set(fileId, { lockId, expiresAt: Date.now() + ttlMs });
}

export function deleteLock(fileId: string) {
  locks.delete(fileId);
}

setInterval(() => {
  const cutoff = Date.now() - TTL_MS;
  for (const [fileId, meta] of fileMeta.entries()) {
    if (meta.createdAt < cutoff) {
      remove(fileId).catch(() => {});
    }
  }
}, 5 * 60 * 1000);
