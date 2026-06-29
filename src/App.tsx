import { useCallback, useEffect, useRef, useState } from 'react';
import type { Notebook } from './types';
import { loadNotebooks, saveNotebooks, newNotebook } from './lib/storage';
import { exportNotebookPdf } from './lib/pdf';
import { importPdf } from './lib/pdfImport';
import { getStoredUser, getMe, clearAuth, type AuthUser } from './lib/api';
import { AuthPage } from './components/AuthPage';
import { Shelf } from './components/Shelf';
import { Editor } from './components/Editor';
import { ExportRenderer } from './components/ExportRenderer';
import { ThemeToggle } from './components/ThemeToggle';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const [notebooks, setNotebooks] = useState<Notebook[]>(() => loadNotebooks());
  const [activeId, setActiveId] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // verify stored token on mount
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      getMe().then((u) => {
        setUser(u);
        setAuthLoaded(true);
      });
    } else {
      setAuthLoaded(true);
    }
  }, []);

  // persist locally on every change
  useEffect(() => {
    saveNotebooks(notebooks);
  }, [notebooks]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

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
  async function handleImportPdf(file: File) {
    try {
      const nb = await importPdf(file);
      setNotebooks((prev) => [nb, ...prev]);
      setActiveId(nb.id);
      showToast(`Imported "${nb.title}"`);
    } catch (err: any) {
      showToast(`Import failed: ${err.message}`);
    }
  }

  async function handleExport() {
    if (!active) return;
    setExporting(true);
    try {
      const expectedCount = active.pages.length + 1;
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

  function handleLogout() {
    clearAuth();
    setUser(null);
  }

  if (!authLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="text-sm text-slate-400 dark:text-slate-500">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={(u) => setUser(u)} />;
  }

  return (
    <div className="h-full w-full">
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="rounded bg-white px-3 py-1 text-sm shadow hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Sign out
        </button>
      </div>

      {active ? (
        <Editor
          notebook={active}
          onChange={updateNotebook}
          onBack={() => setActiveId(null)}
          onExport={handleExport}
          exporting={exporting}
        />
      ) : (
        <Shelf
          notebooks={notebooks}
          onOpen={setActiveId}
          onCreate={createNotebook}
          onDelete={deleteNotebook}
          onImportPdf={handleImportPdf}
        />
      )}

      {exporting && active && <ExportRenderer notebook={active} />}

      {toast && (
        <div className="fade-up fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-xl dark:bg-slate-700">
          {toast}
        </div>
      )}
    </div>
  );
}
