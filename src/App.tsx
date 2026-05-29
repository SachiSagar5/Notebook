import { useCallback, useEffect, useRef, useState } from 'react';
import type { Notebook } from './types';
import { loadNotebooks, saveNotebooks, newNotebook } from './lib/storage';
import {
  connect, disconnect, getAccount, getLastSync,
  pushToDrive, pullFromDrive, type DriveAccount, type SyncStatus,
} from './lib/drive';
import { exportNotebookPdf } from './lib/pdf';
import { Shelf } from './components/Shelf';
import { Editor } from './components/Editor';
import { SyncBar } from './components/SyncBar';
import { ExportRenderer } from './components/ExportRenderer';

export default function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => loadNotebooks());
  const [activeId, setActiveId] = useState<string | null>(null);

  // Drive sync state
  const [account, setAccount] = useState<DriveAccount | null>(() => getAccount());
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSync, setLastSync] = useState<number | null>(() => getLastSync());
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const autoSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // persist locally on every change
  useEffect(() => {
    saveNotebooks(notebooks);
  }, [notebooks]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // debounced auto-sync to Drive when connected
  useEffect(() => {
    if (!account) return;
    if (autoSyncRef.current) clearTimeout(autoSyncRef.current);
    autoSyncRef.current = setTimeout(async () => {
      setStatus('syncing');
      try {
        const ts = await pushToDrive(notebooks);
        setLastSync(ts);
        setStatus('synced');
      } catch {
        setStatus('error');
      }
    }, 1800);
    return () => {
      if (autoSyncRef.current) clearTimeout(autoSyncRef.current);
    };
  }, [notebooks, account]);

  const active = notebooks.find((n) => n.id === activeId) || null;

  function updateNotebook(nb: Notebook) {
    setNotebooks((prev) => prev.map((n) => (n.id === nb.id ? nb : n)));
  }
  function createNotebook() {
    const nb = newNotebook();
    setNotebooks((prev) => [nb, ...prev]);
    setActiveId(nb.id);
  }
  function deleteNotebook(id: string) {
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) setActiveId(null);
  }

  // --- Drive handlers ---
  async function handleConnect() {
    setStatus('syncing');
    try {
      const acc = await connect();
      setAccount(acc);
      const ts = await pushToDrive(notebooks);
      setLastSync(ts);
      setStatus('synced');
      showToast('Connected to Google Drive');
    } catch {
      setStatus('error');
    }
  }
  function handleDisconnect() {
    disconnect();
    setAccount(null);
    setStatus('idle');
    showToast('Disconnected from Drive');
  }
  async function handleSync() {
    setStatus('syncing');
    try {
      const ts = await pushToDrive(notebooks);
      setLastSync(ts);
      setStatus('synced');
      showToast('Synced to Drive ✓');
    } catch {
      setStatus('error');
    }
  }
  async function handlePull() {
    setStatus('syncing');
    try {
      const data = await pullFromDrive();
      if (data) {
        setNotebooks(data.notebooks);
        setLastSync(data.syncedAt);
        showToast('Pulled latest from Drive');
      } else {
        showToast('Nothing to pull yet');
      }
      setStatus('synced');
    } catch {
      setStatus('error');
    }
  }

  async function handleExport() {
    if (!active) return;
    setExporting(true);
    try {
      // Wait until the off-screen ExportRenderer has actually mounted in the DOM.
      const expectedCount = active.pages.length + 1; // +1 for cover
      let tries = 0;
      let nodeCount = 0;
      while (tries < 60) {
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        const nodes = document.querySelectorAll('[data-export-page]');
        nodeCount = nodes.length;
        if (nodeCount >= expectedCount) break;
        tries++;
      }
      if (nodeCount < expectedCount) {
        throw new Error(`DOM readiness timeout. Found ${nodeCount}/${expectedCount} pages.`);
      }
      // give images/layout one more frame to settle
      await new Promise((r) => setTimeout(r, 200));
      await exportNotebookPdf(active.title, active.pageSize);
      showToast('PDF exported ✓');
    } catch (err: any) {
      console.error('PDF export failed:', err);
      showToast(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  }

  const syncBar = (
    <SyncBar
      account={account}
      status={status}
      lastSync={lastSync}
      onConnect={handleConnect}
      onSync={handleSync}
      onPull={handlePull}
      onDisconnect={handleDisconnect}
    />
  );

  return (
    <div className="h-full w-full">
      {active ? (
        <Editor
          notebook={active}
          onChange={updateNotebook}
          onBack={() => setActiveId(null)}
          onExport={handleExport}
          exporting={exporting}
          syncSlot={syncBar}
        />
      ) : (
        <Shelf
          notebooks={notebooks}
          onOpen={setActiveId}
          onCreate={createNotebook}
          onDelete={deleteNotebook}
          syncBar={syncBar}
        />
      )}

      {/* off-screen renderer used only during export */}
      {exporting && active && <ExportRenderer notebook={active} />}

      {/* toast */}
      {toast && (
        <div className="fade-up fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
