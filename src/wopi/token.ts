import { createHmac } from 'crypto';

const SECRET = process.env.WOPI_SECRET || 'dev-secret-not-for-production';
const TTL_MS = parseInt(process.env.WOPI_TOKEN_TTL_MS || '86400000', 10);

export function generate(fileId: string): string {
  const timestamp = Date.now();
  const hmac = createHmac('sha256', SECRET)
    .update(`${fileId}:${timestamp}`)
    .digest('hex');
  return `${fileId}:${timestamp}:${hmac}`;
}

export function validate(token: string, fileId: string): boolean {
  const parts = token.split(':');
  if (parts.length !== 3) return false;
  const [tokFileId, timestampStr, hmac] = parts;
  if (tokFileId !== fileId) return false;
  const timestamp = parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) return false;
  if (Date.now() - timestamp > TTL_MS) return false;
  const expected = createHmac('sha256', SECRET)
    .update(`${fileId}:${timestamp}`)
    .digest('hex');
  return hmac === expected;
}
