type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number }
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const MIN_VIEWPORT_WIDTH = 768;
const MIN_DEVICE_MEMORY = 4;
const MIN_HARDWARE_CONCURRENCY = 4;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasCoarsePointer(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(pointer: coarse)').matches;
}

export function shouldEnableBackground(): boolean {
  if (typeof window === 'undefined') return false;
  if (prefersReducedMotion()) return false;
  if (window.innerWidth < MIN_VIEWPORT_WIDTH) return false;

  const navigatorWithHints = window.navigator as NavigatorWithHints;

  if (navigatorWithHints.connection?.saveData) return false;

  const deviceMemory = navigatorWithHints.deviceMemory;
  if (typeof deviceMemory === 'number' && deviceMemory <= MIN_DEVICE_MEMORY) {
    return false;
  }

  const cores = navigatorWithHints.hardwareConcurrency;
  if (typeof cores === 'number' && cores <= MIN_HARDWARE_CONCURRENCY) {
    return false;
  }

  return true;
}

export function whenIdle(callback: () => void, timeout = 2000): () => void {
  if (typeof window === 'undefined') return () => {};

  const idleWindow = window as IdleWindow;

  if (typeof idleWindow.requestIdleCallback === 'function') {
    const handle = idleWindow.requestIdleCallback(callback, { timeout });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, 200);
  return () => window.clearTimeout(handle);
}
