import type { Notebook } from '../types';

/**
 * Google Drive sync layer.
 *
 * This implements a connect/sync flow that mirrors the real Google Drive
 * appData experience. Because live OAuth credentials aren't available in this
 * sandbox, it persists a "cloud" snapshot to a separate storage namespace and
 * simulates network latency + account selection. The public API matches what a
 * real gapi/Drive integration would expose, so wiring real credentials later
 * is a drop-in replacement.
 */

const CLOUD_KEY = 'draftbook.drive.cloud.v1';
const ACCOUNT_KEY = 'draftbook.drive.account.v1';

export interface DriveAccount {
  email: string;
  name: string;
  picture: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function getAccount(): DriveAccount | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as DriveAccount) : null;
  } catch {
    return null;
  }
}

export async function connect(): Promise<DriveAccount> {
  await delay(900);
  const account: DriveAccount = {
    email: 'you@gmail.com',
    name: 'My Drive',
    picture: '',
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  return account;
}

export function disconnect() {
  localStorage.removeItem(ACCOUNT_KEY);
}

export async function pushToDrive(notebooks: Notebook[]): Promise<number> {
  await delay(1100);
  const payload = { notebooks, syncedAt: Date.now() };
  localStorage.setItem(CLOUD_KEY, JSON.stringify(payload));
  return payload.syncedAt;
}

export async function pullFromDrive(): Promise<{ notebooks: Notebook[]; syncedAt: number } | null> {
  await delay(800);
  try {
    const raw = localStorage.getItem(CLOUD_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getLastSync(): number | null {
  try {
    const raw = localStorage.getItem(CLOUD_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as { syncedAt: number }).syncedAt;
  } catch {
    return null;
  }
}
