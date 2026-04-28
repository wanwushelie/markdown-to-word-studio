import fs from 'fs';
import path from 'path';

export interface RuntimeSettings {
  libreOfficePath: string;
}

const settingsPath = path.join(process.cwd(), 'tmp', 'runtime-settings.json');

let cachedSettings: RuntimeSettings = {
  libreOfficePath: '',
};

export function loadRuntimeSettings(): RuntimeSettings {
  try {
    if (!fs.existsSync(settingsPath)) return cachedSettings;
    const raw = fs.readFileSync(settingsPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<RuntimeSettings>;
    cachedSettings = {
      libreOfficePath: typeof parsed.libreOfficePath === 'string' ? parsed.libreOfficePath.trim() : '',
    };
  } catch {
    // Ignore malformed file and keep defaults.
  }
  return cachedSettings;
}

export function getRuntimeSettings(): RuntimeSettings {
  return cachedSettings;
}

export function updateRuntimeSettings(input: Partial<RuntimeSettings>): RuntimeSettings {
  cachedSettings = {
    ...cachedSettings,
    libreOfficePath: typeof input.libreOfficePath === 'string' ? input.libreOfficePath.trim() : cachedSettings.libreOfficePath,
  };

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(cachedSettings, null, 2), 'utf-8');
  return cachedSettings;
}
