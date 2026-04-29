import express from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = {
  capabilities: {
    docx: true,
    pdfLocal: false,
    collabora: false,
    localPreview: true,
  },
};

vi.mock('../../../src/core/capabilities.js', () => ({
  getRuntimeCapabilities: vi.fn(() => mockState.capabilities),
  getRuntimeDiagnostics: vi.fn(() => ({
    libreOffice: { detected: false, source: 'auto', configuredCommand: 'soffice', resolvedPath: '' },
    collabora: { detected: false, source: 'auto', url: 'http://localhost:9980' },
    localPreview: { detected: true, source: 'builtin' },
  })),
  refreshRuntimeCapabilities: vi.fn(),
}));

vi.mock('../../../src/core/runtime-settings.js', () => ({
  getRuntimeSettings: vi.fn(() => ({ libreOfficePath: '' })),
  updateRuntimeSettings: vi.fn((input: { libreOfficePath?: string }) => ({ libreOfficePath: input.libreOfficePath || '' })),
}));

const { default: apiRouter } = await import('../../../src/routes/api.js');
const { getRuntimeCapabilities } = await import('../../../src/core/capabilities.js');

async function withServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  app.get('/capabilities', (_req, res) => {
    res.json(getRuntimeCapabilities());
  });

  const server = await new Promise<import('http').Server>((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  try {
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to resolve test server address');
    }
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

describe('capabilities and gated API endpoints', () => {
  beforeEach(() => {
    mockState.capabilities = {
      docx: true,
      pdfLocal: false,
      collabora: false,
      localPreview: true,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the runtime capability matrix from /capabilities', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/capabilities`);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual(mockState.capabilities);
    });
  });

  it('returns 503 from /api/preview when collabora is disabled', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: '# test' }),
      });
      const payload = await response.json();

      expect(response.status).toBe(503);
      expect(payload.error).toBe('Collabora unavailable');
      expect(payload.message).toContain('Collabora preview');
    });
  });

  it('returns 503 from /api/convert/pdf when local PDF is disabled', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/convert/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: '# test' }),
      });
      const payload = await response.json();

      expect(response.status).toBe(503);
      expect(payload.error).toBe('Local PDF unavailable');
      expect(payload.message).toContain('Local PDF export');
    });
  });
});
