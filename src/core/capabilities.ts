import { spawnSync } from 'child_process';
import { isDiscoveryReady } from '../wopi/discovery.js';
import { getRuntimeSettings, loadRuntimeSettings } from './runtime-settings.js';

export interface RuntimeCapabilities {
  docx: boolean;
  pdfLocal: boolean;
  collabora: boolean;
  localPreview: boolean;
}

export interface RuntimeDiagnostics {
  libreOffice: {
    detected: boolean;
    source: 'custom' | 'env' | 'auto';
    configuredCommand: string;
    resolvedPath: string;
  };
  collabora: {
    detected: boolean;
    source: 'auto';
    url: string;
  };
  localPreview: {
    detected: boolean;
    source: 'builtin';
  };
}

let localPdfAvailable = false;
let localPreviewAvailable = true;
let libreOfficeSource: 'custom' | 'env' | 'auto' = 'auto';
let libreOfficeCommand = 'soffice';
let libreOfficeResolvedPath = '';

function detectLibreOffice(command: string): boolean {
  const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
  return result.status === 0;
}

function resolveLibreOfficeCommand(): string {
  const runtimePath = getRuntimeSettings().libreOfficePath;
  if (runtimePath) {
    libreOfficeSource = 'custom';
    return runtimePath;
  }
  const envPath = process.env.LIBREOFFICE_PATH?.trim();
  if (envPath) {
    libreOfficeSource = 'env';
    return envPath;
  }
  libreOfficeSource = 'auto';
  return 'soffice';
}

function detectResolvedPath(command: string): string {
  if (command.includes('/') || command.includes('\\')) return command;
  const lookupCmd = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(lookupCmd, [command], { encoding: 'utf-8' });
  if (result.status !== 0) return '';
  const firstLine = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  return firstLine || '';
}

export function refreshRuntimeCapabilities(): void {
  const command = resolveLibreOfficeCommand();
  libreOfficeCommand = command;
  libreOfficeResolvedPath = detectResolvedPath(command);
  localPdfAvailable = detectLibreOffice(command);
  // Local preview is frontend-rendered, no external dependency.
  localPreviewAvailable = true;
}

export async function initRuntimeCapabilities(): Promise<void> {
  loadRuntimeSettings();
  refreshRuntimeCapabilities();
}

export function getRuntimeCapabilities(): RuntimeCapabilities {
  const collabora = isDiscoveryReady();
  return {
    docx: true,
    pdfLocal: localPdfAvailable,
    collabora,
    localPreview: localPreviewAvailable,
  };
}

export function getRuntimeDiagnostics(): RuntimeDiagnostics {
  return {
    libreOffice: {
      detected: localPdfAvailable,
      source: libreOfficeSource,
      configuredCommand: libreOfficeCommand,
      resolvedPath: libreOfficeResolvedPath,
    },
    collabora: {
      detected: isDiscoveryReady(),
      source: 'auto',
      url: process.env.CODE_URL || 'http://localhost:9980',
    },
    localPreview: {
      detected: localPreviewAvailable,
      source: 'builtin',
    },
  };
}
