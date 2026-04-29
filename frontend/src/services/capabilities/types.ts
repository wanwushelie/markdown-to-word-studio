import type { Capabilities, Config, DocumentMeta } from '../../store/useStore';

export interface ConvertPayload {
  markdown: string;
  config: Config;
  meta: DocumentMeta;
}

export interface RuntimeSettings {
  libreOfficePath: string;
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

export type DocxExecutionMode = 'auto' | 'browser' | 'server';

export interface DocxExecutionOptions {
  mode?: DocxExecutionMode;
}

export interface DocxProvider {
  id: 'browser' | 'server';
  label: string;
  canExecute(): Promise<boolean>;
  execute(payload: ConvertPayload): Promise<Blob>;
}

export interface DocxExecutionResult {
  blob: Blob;
  providerId: DocxProvider['id'];
  providerLabel: string;
}

export interface DocxExecutionInfo {
  selectedMode: DocxExecutionMode;
  activeProviderId: DocxProvider['id'] | null;
  availableProviders: Array<DocxProvider['id']>;
}

export interface RuntimeSettingsResponse {
  settings: RuntimeSettings;
  capabilities: Capabilities;
  diagnostics: RuntimeDiagnostics;
}

export interface PreviewSession {
  fileId: string;
  accessToken: string;
  collaboraUrl: string;
}
