import { browserDocxProvider } from '../providers/browserDocxProvider';
import { serverDocxProvider } from '../providers/serverDocxProvider';
import { createCapabilityUnavailableError } from '../errors';
import type {
  ConvertPayload,
  DocxExecutionInfo,
  DocxExecutionMode,
  DocxExecutionOptions,
  DocxExecutionResult,
  DocxProvider,
} from '../types';

const providers: DocxProvider[] = [browserDocxProvider, serverDocxProvider];

async function getAvailableProviders(): Promise<DocxProvider[]> {
  const checks = await Promise.all(
    providers.map(async (provider) => ({
      provider,
      available: await provider.canExecute(),
    })),
  );
  return checks.filter((entry) => entry.available).map((entry) => entry.provider);
}

function getProviderOrder(mode: DocxExecutionMode): DocxProvider['id'][] {
  switch (mode) {
    case 'browser':
      return ['browser'];
    case 'server':
      return ['server'];
    case 'auto':
    default:
      return ['browser', 'server'];
  }
}

async function getOrderedAvailableProviders(mode: DocxExecutionMode): Promise<DocxProvider[]> {
  const available = await getAvailableProviders();
  const order = getProviderOrder(mode);
  return order
    .map((id) => available.find((provider) => provider.id === id) ?? null)
    .filter((provider): provider is DocxProvider => provider !== null);
}

export async function executeDocx(payload: ConvertPayload, options?: DocxExecutionOptions): Promise<DocxExecutionResult> {
  const selectedMode = options?.mode ?? 'auto';
  const orderedProviders = await getOrderedAvailableProviders(selectedMode);

  if (orderedProviders.length === 0) {
    if (selectedMode === 'server') {
      throw createCapabilityUnavailableError('serverDocxExport');
    }
    throw createCapabilityUnavailableError('docxExport');
  }

  const provider = orderedProviders[0];
  const blob = await provider.execute(payload);
  return {
    blob,
    providerId: provider.id,
    providerLabel: provider.label,
  };
}

export async function getDocxExecutionInfo(mode: DocxExecutionMode = 'auto'): Promise<DocxExecutionInfo> {
  const available = await getAvailableProviders();
  const ordered = await getOrderedAvailableProviders(mode);
  return {
    selectedMode: mode,
    activeProviderId: ordered[0]?.id ?? null,
    availableProviders: available.map((provider) => provider.id),
  };
}
