import type { AppBackupData } from '../types';
import { getInitialBackupData } from './mockData';

const STORAGE_KEY = 'yogurt_manager_store_v2';

export function loadAppStateFromStorage(): AppBackupData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialBackupData();
      saveAppStateToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppBackupData;
    // Basic integrity check
    if (!parsed.batches || !parsed.sales || !parsed.expenses || !parsed.productionItems) {
      const initial = getInitialBackupData();
      saveAppStateToStorage(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Error cargando estado desde localStorage:', err);
    return getInitialBackupData();
  }
}

export function saveAppStateToStorage(data: AppBackupData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
  }
}

export function clearAppStateStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error limpiando localStorage:', err);
  }
}
