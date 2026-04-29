import { isBrowserPublic } from './runtime';
import { createCapabilityUnavailableError, type CapabilityFeature } from './errors';
import type { Language } from '../../store/useStore';

export function ensureServerFeature(feature: CapabilityFeature, language: Language = 'en-US'): void {
  if (isBrowserPublic) {
    throw createCapabilityUnavailableError(feature, language);
  }
}
