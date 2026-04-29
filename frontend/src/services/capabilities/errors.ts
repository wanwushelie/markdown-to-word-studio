import type { Capabilities, Language } from '../../store/useStore';

export type CapabilityFeature =
  | 'docxExport'
  | 'serverDocxExport'
  | 'pdfExport'
  | 'collaboraPreview'
  | 'collaboraDownload'
  | 'collaboraPdfExport'
  | 'runtimeSettings'
  | 'capabilities';

export type CapabilityErrorCode =
  | 'capability_unavailable'
  | 'request_failed'
  | 'invalid_request';

export class CapabilityError extends Error {
  code: CapabilityErrorCode;
  feature: CapabilityFeature;
  status?: number;

  constructor(feature: CapabilityFeature, code: CapabilityErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'CapabilityError';
    this.feature = feature;
    this.code = code;
    this.status = status;
  }
}

const SERVER_REQUIRED_LABELS: Record<CapabilityFeature, { zh: string; en: string }> = {
  docxExport: {
    zh: '当前环境没有可用的 DOCX 导出能力。',
    en: 'DOCX export is unavailable in the current environment.',
  },
  serverDocxExport: {
    zh: '服务器 DOCX 引擎在当前构建中不可用，请切换到自动或浏览器引擎。',
    en: 'The server DOCX engine is unavailable in this build. Switch to Auto or Browser.',
  },
  pdfExport: {
    zh: 'PDF 导出需要服务端版或完整本地版。',
    en: 'PDF export requires the server edition or full local edition.',
  },
  collaboraPreview: {
    zh: 'Collabora 预览需要服务端版。',
    en: 'Collabora preview requires the server edition.',
  },
  collaboraDownload: {
    zh: 'Collabora 下载需要服务端版。',
    en: 'Collabora download requires the server edition.',
  },
  collaboraPdfExport: {
    zh: 'Collabora PDF 导出需要服务端版。',
    en: 'Collabora PDF export requires the server edition.',
  },
  runtimeSettings: {
    zh: 'Runtime 设置需要服务端版或完整本地版。',
    en: 'Runtime settings require the server edition or full local edition.',
  },
  capabilities: {
    zh: '无法读取服务端能力信息。',
    en: 'Failed to read server capabilities.',
  },
};

function getCapabilityUnavailableLabel(feature: CapabilityFeature, language: Language): string {
  const label = SERVER_REQUIRED_LABELS[feature];
  return language === 'zh-CN' ? label.zh : label.en;
}

export function createCapabilityUnavailableError(feature: CapabilityFeature, language: Language = 'en-US'): CapabilityError {
  return new CapabilityError(feature, 'capability_unavailable', getCapabilityUnavailableLabel(feature, language), 503);
}

export function isCapabilityError(error: unknown): error is CapabilityError {
  return error instanceof CapabilityError;
}

export function normalizeApiFailure(
  feature: CapabilityFeature,
  fallbackMessage: string,
  response: Response,
  payload?: { error?: string; message?: string },
): CapabilityError {
  const message = payload?.message || payload?.error || fallbackMessage;
  if (response.status === 400) {
    return new CapabilityError(feature, 'invalid_request', message, response.status);
  }
  if (response.status === 503) {
    return new CapabilityError(feature, 'capability_unavailable', message, response.status);
  }
  return new CapabilityError(feature, 'request_failed', message, response.status);
}

export async function parseErrorPayload(response: Response): Promise<{ error?: string; message?: string }> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function getUserFacingErrorMessage(error: unknown, language: Language): string {
  if (isCapabilityError(error)) {
    if (error.code === 'capability_unavailable' && error.status === 503) {
      return getCapabilityUnavailableLabel(error.feature, language);
    }
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return language === 'zh-CN' ? '发生了未知错误。' : 'An unknown error occurred.';
}

export function getCoreOnlyModeMessage(capabilities: Capabilities, language: Language): string | null {
  if (capabilities.pdfLocal && capabilities.collabora) {
    return null;
  }

  if (language === 'zh-CN') {
    return '当前是基础能力模式：DOCX 导出、HTML 预览和快速 Word 预览可用；PDF、Collabora 和 Runtime 需要服务端版或完整本地版。';
  }

  return 'Core-only mode: DOCX export, HTML preview, and fast Word preview are available. PDF, Collabora, and Runtime require the server edition or full local edition.';
}
