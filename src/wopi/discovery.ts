import { XMLParser } from 'fast-xml-parser';

const CODE_URL = process.env.CODE_URL || 'http://localhost:9980';

let cachedUrlSrc: string | null = null;

async function fetchDiscovery(): Promise<string> {
  const res = await fetch(`${CODE_URL}/hosting/discovery`);
  if (!res.ok) {
    throw new Error(`Discovery failed: ${res.status}`);
  }
  return res.text();
}

function parseDiscovery(xml: string): string {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
  const doc = parser.parse(xml);
  const netZone = doc['wopi-discovery']?.['net-zone'];
  const zones = Array.isArray(netZone) ? netZone : [netZone].filter(Boolean);
  for (const zone of zones) {
    const apps = zone?.app;
    const appList = Array.isArray(apps) ? apps : [apps].filter(Boolean);
    for (const app of appList) {
      if (app.name === 'WordViewer' || app.name === 'Word' || app.name === 'writer') {
        const actions = app.action;
        const actionList = Array.isArray(actions) ? actions : [actions].filter(Boolean);
        for (const action of actionList) {
          if (action.name === 'edit' && action.ext === 'docx') {
            return action.urlsrc;
          }
        }
      }
    }
  }
  throw new Error('No Word edit action found in discovery.xml');
}

export async function initDiscovery(retries = 5, delay = 3000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      const xml = await fetchDiscovery();
      cachedUrlSrc = parseDiscovery(xml);
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

export function getEditUrlSrc(): string {
  if (!cachedUrlSrc) {
    throw new Error('Discovery not initialized');
  }
  return cachedUrlSrc;
}
