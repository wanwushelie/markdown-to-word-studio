export type RuntimeTarget = 'server' | 'browser-public';

export const runtimeTarget: RuntimeTarget =
  import.meta.env.VITE_RUNTIME_TARGET === 'browser-public' ? 'browser-public' : 'server';

export const isBrowserPublic = runtimeTarget === 'browser-public';
export const isServerRuntime = runtimeTarget === 'server';
