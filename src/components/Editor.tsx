import { useCallback, useEffect, useState } from 'react';
import type { Notebook, NoteElement, ClipartKind, PaperStyle, PageSize } from '../types';
import { uid, emptyPage } from '../lib/storage';
import { PAGE_SIZES } from '../types';
import { Toolbar } from './Toolbar';
import { PropertyPanel } from './PropertyPanel';
import { PageElement } from './PageElement';
import { Cover } from './Cover';
import { PageSizeSelector } from './PageSizeSelector';

interface Props {
  notebook: Notebook;
  onChange: (nb: Notebook) => void;
  onBack: () => void;
  onExport: () => void;
  exporting: boolean;
}

export function Editor({ notebook, onChange, onBack, onExport, exporting }: Props) {
  const [index, setIndex] = useState(-1);
  const [selected, setSelected] = useState<string | null>(null);
  const [flipDir, setFlipDir] = useState<'next' | 'prev' | null>(null);

  const page = index >= 0 ? notebook.pages[index] : null;
  const def = PAGE_SIZES[notebook.pageSize];

  function update(patch: Partial<Notebook>) {
    onChange({ ...notebook, ...patch, updatedAt: Date.now() });
  }

  function updatePage(els: NoteElement[]) {
    if (index < 0) return;
    const pages = notebook.pages.map((p, i) => (i === index ? { ...p, elements: els } : p));
    update({ pages });
  }

  function setPaper(paper: PaperStyle) {
    if (index < 0) return;
    const pages = notebook.pages.map((p, i) => (i === index ? { ...p, paper } : p));
    update({ pages });
  }

  const maxZ = (page?.elements.reduce((m, e) => Math.max(m, e.z), 0) || 0) + 1;

  function addElement(el: NoteElement) {
    if (index < 0) {
      setIndex(0);
      requestAnimationFrame(() => {
        const pages = notebook.pages.map((p, i) =>
          i === 0 ? { ...p, elements: [...p.elements, el] } : p
        );
        onChange({ ...notebook, pages, updatedAt: Date.now() });
        setSelected(el.id);
      });
      return;
    }
    updatePage([...(page?.elements || []), el]);
    setSelected(el.id);
  }

  const addText = useCallback(() => addElement({
    id: uid(), type: 'text', x: 12, y: 80, w: 220, h: 40, z: maxZ,
    content: 'Type here...', color: '#1e293b', fontSize: 18,
  }), [index, page, maxZ, notebook]);

  const addSticky = useCallback(() => addElement({
    id: uid(), type: 'sticky', x: 55, y: 80, w: 160, h: 150, z: maxZ,
    content: 'Note...', color: '#fef08a',
  }), [index, page, maxZ, notebook]);

  const addTable = useCallback(() => addElement({
    id: uid(), type: 'table', x: 15, y: 200, w: 300, h: 120, z: maxZ,
    rows: 3, cols: 3, color: '#6366f1',
    cells: [['Header', 'Header', 'Header'], ['', '', ''], ['', '', '']],
  }), [index, page, maxZ, notebook]);

  const addImage = useCallback((src: string) => addElement({
    id: uid(), type: 'image', x: 25, y: 120, w: 220, h: 160, z: maxZ, src,
  }), [index, page, maxZ, notebook]);

  const addClipart = useCallback((kind: ClipartKind) => addElement({
    id: uid(), type: 'clipart', x: 35, y: 150, w: 90, h: 90, z: maxZ,
    kind, color: '#6366f1',
  }), [index, page, maxZ, notebook]);

  function changeElement(updated: NoteElement) {
    if (!page) return;
    updatePage(page.elements.map((e) => (e.id === updated.id ? updated : e)));
  }

  function deleteElement(id: string) {
    if (!page) return;
    updatePage(page.elements.filter((e) => e.id !== id));
    setSelected(null);
  }

  function goNext() {
    if (flipDir || index >= notebook.pages.length - 1) return;
    setSelected(null);
    setFlipDir('next');
    setTimeout(() => { setIndex((i) => i + 1); setFlipDir(null); }, 750);
  }

  function goPrev() {
    if (flipDir || index <= -1) return;
    setSelected(null);
    setFlipDir('prev');
    setTimeout(() => { setIndex((i) => i - 1); setFlipDir(null); }, 750);
  }

  function addPage() {
    const pages = [...notebook.pages, emptyPage(page?.paper || 'lined')];
    update({ pages });
    requestAnimationFrame(() => goNext());
  }

  function deletePage() {
    if (notebook.pages.length <= 1) return;
    if (!confirm('Delete this page?')) return;
    const pages = notebook.pages.filter((_, i) => i !== index);
    update({ pages });
    setIndex(Math.max(-1, index - 1));
    setSelected(null);
  }

  const selEl = page?.elements.find((e) => e.id === selected) || null;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement ||
          (e.target instanceof HTMLElement && e.target.isContentEditable)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipDir, index, notebook.pages.length]);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* ─── Top bar ─── */}
      <header className="flex shrink-0 items-center gap-2 border-b border-stone-200 bg-white/80 px-3 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:px-5">
        <button onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Shelf</span>
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-stone-800 dark:text-slate-200">{notebook.title}</h2>
        </div>
        <PageSizeSelector value={notebook.pageSize} onChange={(s) => update({ pageSize: s })} />
        <button onClick={onExport} disabled={exporting}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-50">
          {exporting ? <Spinner /> : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
          )}
          <span className="hidden sm:inline">PDF</span>
        </button>
      </header>

      {/* ─── Toolbar ─── */}
      <div className="shrink-0 z-20 flex justify-center px-3 py-2 sm:px-5">
        <div className="w-full max-w-2xl">
          <Toolbar
            onAddText={addText} onAddSticky={addSticky} onAddTable={addTable}
            onAddImage={addImage} onAddClipart={addClipart}
            paper={page?.paper || 'lined'} onPaperChange={setPaper}
          />
        </div>
      </div>

      {/* ─── Property panel ─── */}
      {selEl && (
        <div className="shrink-0 z-20 flex justify-center px-3 sm:px-5">
          <div className="w-full max-w-2xl">
            <PropertyPanel el={selEl} onChange={changeElement} onDelete={() => deleteElement(selEl.id)} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}

      {/* ─── Book viewport ─── */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 py-3 sm:px-12 sm:py-5"
      >
        {/* Nav arrows */}
        <button onClick={goPrev} disabled={index <= -1 || !!flipDir}
          className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-md transition hover:bg-white hover:text-indigo-600 disabled:opacity-0 sm:flex dark:bg-slate-800/90 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        {/* 
          Responsive Scale Container
          We use CSS min() to calculate a scale factor based on container constraints.
          This ensures the book always fits perfectly without breaking absolute positioning inside.
        */}
        <div className="relative flex items-center justify-center w-full h-full" style={{ perspective: '2800px' }}>
          <div
            style={{
              width: def.w,
              height: def.h,
              transform: `scale(min(1, calc(100vw / ${def.w + 40}), calc((100vh - 200px) / ${def.h})))`,
              transformOrigin: 'center center',
            }}
          >
            <BookView
              index={index}
              flipDir={flipDir}
              notebook={notebook}
              selected={selected}
              onSelect={setSelected}
              onChange={changeElement}
              onUpdateNotebook={update}
            />
          </div>
        </div>

        <button onClick={goNext} disabled={index >= notebook.pages.length - 1 || !!flipDir}
          className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-md transition hover:bg-white hover:text-indigo-600 disabled:opacity-0 sm:flex dark:bg-slate-800/90 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* ─── Footer ─── */}
      <footer className="shrink-0 flex items-center justify-center gap-2 border-t border-stone-200 bg-white/80 px-4 py-2.5 text-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <button onClick={goPrev} disabled={index <= -1 || !!flipDir}
          className="rounded-lg px-3 py-1.5 font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800">
          ‹ Prev
        </button>
        <span className="min-w-[120px] text-center font-semibold text-stone-700 dark:text-slate-300">
          {index === -1 ? 'Cover' : `Page ${index + 1} of ${notebook.pages.length}`}
        </span>
        <button
          onClick={index >= notebook.pages.length - 1 ? addPage : goNext}
          disabled={!!flipDir}
          className="rounded-lg px-3 py-1.5 font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800">
          {index >= notebook.pages.length - 1 ? '+ Add Page' : 'Next ›'}
        </button>
        {index >= 0 && notebook.pages.length > 1 && (
          <button onClick={deletePage} className="ml-1 rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30" title="Delete page">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        )}
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════
   BookView — realistic three‑layer page flip
   Layer 0 (bottom) : behind page – always visible
   Layer 1 (middle) : fold shadow overlay during flip
   Layer 2 (top)    : current page with front/back faces
   ═══════════════════════════════════════ */

function BookView({
  index, flipDir, notebook, selected, onSelect, onChange, onUpdateNotebook,
}: {
  index: number;
  flipDir: 'next' | 'prev' | null;
  notebook: Notebook;
  selected: string | null;
  onSelect: (id: string) => void;
  onChange: (el: NoteElement) => void;
  onUpdateNotebook: (patch: Partial<Notebook>) => void;
}) {
  let behindIndex = index;
  if (flipDir === 'next') behindIndex = index + 1;
  if (flipDir === 'prev') behindIndex = index - 1;

  const behindPage = behindIndex >= 0 ? notebook.pages[behindIndex] : null;
  const currentPage = index >= 0 ? notebook.pages[index] : null;

  return (
    <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
      {/* ── Layer 0: Behind page — always visible underneath ── */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {behindIndex === -1 ? (
          <Cover notebook={notebook} readOnly />
        ) : behindPage ? (
          <PageSurface paper={behindPage.paper} elements={behindPage.elements}
            selected={null} pageSize={notebook.pageSize}
            onSelect={() => {}} onChange={() => {}} readOnly />
        ) : (
          <EmptyPage paper={notebook.pages[notebook.pages.length - 1]?.paper || 'lined'} />
        )}
      </div>

      {/* ── Layer 1: Fold shadow cast by the turning page ── */}
      {flipDir && <div className={`absolute inset-0 fold-shadow-${flipDir}`} />}

      {/* ── Layer 2: Current page (front/back faces) ── */}
      <div className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          zIndex: flipDir ? 20 : 10,
        }}
      >
        <div className={`h-full w-full ${
          flipDir === 'next' ? 'animate-book-forward'
            : flipDir === 'prev' ? 'animate-book-back' : ''
        }`}
          style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
        >
          {/* Front face */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            {index === -1 ? (
              <Cover notebook={notebook} onChange={onUpdateNotebook} />
            ) : currentPage ? (
              <PageSurface
                key={currentPage.id}
                paper={currentPage.paper}
                elements={currentPage.elements}
                selected={selected}
                pageSize={notebook.pageSize}
                onSelect={onSelect}
                onChange={onChange}
              />
            ) : (
              <EmptyPage paper={notebook.pages[notebook.pages.length - 1]?.paper || 'lined'} />
            )}
          </div>
          {/* Back face (reverse side of paper) */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="h-full w-full rounded-r-md border border-stone-200 bg-white/95 dark:border-slate-700 dark:bg-slate-900/95"
              style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.06)' }}>
              <div className="margin-line" style={{ opacity: 0.2 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page surface ── */
function PageSurface({
  paper, elements, selected, pageSize, onSelect, onChange, readOnly,
}: {
  paper: PaperStyle;
  elements: NoteElement[];
  selected: string | null;
  pageSize: PageSize;
  onSelect: (id: string) => void;
  onChange: (el: NoteElement) => void;
  readOnly?: boolean;
}) {
  const def = PAGE_SIZES[pageSize];
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-r-md border border-stone-200 paper-${paper} page-corner-hint dark:border-slate-700`}
      style={{
        boxShadow: '4px 4px 24px rgba(0,0,0,0.12), inset 10px 0 24px -16px rgba(0,0,0,0.22)',
      }}
    >
      {paper === 'lined' && <div className="margin-line" />}
      {elements.map((el) => (
        <PageElement
          key={el.id} el={el} selected={selected === el.id} readOnly={readOnly}
          pageWidth={def.w} onSelect={onSelect} onChange={onChange}
        />
      ))}
      {elements.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-stone-300 dark:text-slate-500">Use the toolbar to add notes ✏️</p>
        </div>
      )}
    </div>
  );
}

function EmptyPage({ paper }: { paper: PaperStyle }) {
  return (
    <div className={`relative h-full w-full rounded-r-md border border-stone-200 paper-${paper} dark:border-slate-700`}
      style={{ boxShadow: '4px 4px 24px rgba(0,0,0,0.08)' }}
    />
  );
}

function Spinner() {
  return <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}
