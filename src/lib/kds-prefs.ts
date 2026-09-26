export const KDS_SOUND_KEY = 'brewflow.kitchen.sound';
export const KDS_CONTRAST_KEY = 'brewflow.kitchen.contrast';

export function readKdsPref(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function writeKdsPref(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // stockage indisponible
  }
}
