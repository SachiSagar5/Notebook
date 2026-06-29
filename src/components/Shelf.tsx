import type { Notebook } from '../types';

import { useRef } from 'react';

interface Props {
  notebooks: Notebook[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onImportPdf: (file: File) => void;
}

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = Math.max(0, Math.min(255, (num >> 16) + percent));
  let g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  let b = Math.max(0, Math.min(255, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function Shelf({ notebooks, onOpen, onCreate, onDelete, onImportPdf }: Props) {
  const pdfRef = useRef<HTMLInputElement>(null);

  function handlePdfFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onImportPdf(file);
    e.target.value = '';
  }
  return (
    <div className="min-h-full bg-gradient-to-b from-indigo-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg shadow-md">
              📓
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-slate-800 dark:text-slate-100">DraftBook</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Notes • Sketch • Sync</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">My Notebooks</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pdfRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6" />
                <path d="M9 15l3-3 3 3" />
              </svg>
              Import PDF
            </button>
            <button
              onClick={onCreate}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95 dark:shadow-indigo-950"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New
            </button>
          </div>
          <input ref={pdfRef} type="file" accept=".pdf,application/pdf" hidden onChange={handlePdfFile} />
        </div>

        {notebooks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-20 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <div className="mb-3 text-5xl">📚</div>
            <p className="font-medium text-slate-600 dark:text-slate-300">No notebooks yet</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Create your first draft notebook to start taking notes.</p>
            <button
              onClick={onCreate}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
            >
              Create Notebook
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {notebooks.map((nb) => (
              <div key={nb.id} className="fade-up group">
                <button
                  onClick={() => onOpen(nb.id)}
                  className="relative block aspect-[3/4] w-full overflow-hidden rounded-lg rounded-l-sm text-left shadow-lg transition group-hover:-translate-y-1 group-hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${nb.coverColor}, ${shade(nb.coverColor, -28)})`,
                  }}
                >
                  <div className="absolute left-0 top-0 h-full w-3" style={{ background: shade(nb.coverColor, -45) }} />
                  <div className="pointer-events-none absolute inset-3 rounded-md border border-dashed border-white/25" />
                  <div className="flex h-full flex-col items-center justify-center px-3 text-center">
                    <span className="mb-2 text-4xl drop-shadow">{nb.coverEmoji}</span>
                    <span className="line-clamp-2 text-sm font-bold text-white drop-shadow">{nb.title}</span>
                    <span className="mt-2 text-[10px] uppercase tracking-widest text-white/60">
                      {nb.pages.length} {nb.pages.length === 1 ? 'page' : 'pages'}
                    </span>
                  </div>
                </button>
                <div className="mt-1.5 flex items-center justify-between px-0.5">
                  <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {new Date(nb.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${nb.title}"?`)) onDelete(nb.id);
                    }}
                    className="rounded p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
