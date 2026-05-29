import { useRef, useState } from 'react';
import { COVERS, EMOJIS } from '../lib/storage';
import type { Notebook } from '../types';

interface Props {
  notebook: Notebook;
  readOnly?: boolean;
  onChange?: (patch: Partial<Notebook>) => void;
}

function shade(hex: string, pct: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  let r = Math.max(0, Math.min(255, (n >> 16) + pct));
  let g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + pct));
  let b = Math.max(0, Math.min(255, (n & 0xff) + pct));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function Cover({ notebook, readOnly, onChange }: Props) {
  const c = notebook.coverColor;
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange?.({ coverImage: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${c} 0%, ${shade(c, -22)} 100%)`,
        borderRadius: '4px 10px 10px 4px',
        boxShadow: 'inset 4px 0 14px rgba(0,0,0,0.3), 6px 8px 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Spine */}
      <div className="absolute left-0 top-0 h-full w-4 sm:w-5"
        style={{
          background: `linear-gradient(90deg, ${shade(c, -50)}, ${shade(c, -18)} 60%, transparent)`,
        }} />

      {/* Gold border frame */}
      <div className="pointer-events-none absolute inset-[10px] rounded"
        style={{ border: '1.5px solid rgba(255,255,255,0.2)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center sm:px-6">
        {/* Emoji */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl sm:h-20 sm:w-20"
          style={{
            background: 'rgba(255,255,255,0.12)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {readOnly ? (
            <span className="text-3xl sm:text-4xl">{notebook.coverEmoji}</span>
          ) : (
            <EmojiPicker value={notebook.coverEmoji} onPick={(e) => onChange?.({ coverEmoji: e })} />
          )}
        </div>

        {/* Title */}
        {readOnly ? (
          <h1 className="text-xl font-bold leading-tight tracking-tight text-white drop-shadow sm:text-2xl">
            {notebook.title}
          </h1>
        ) : (
          <input
            value={notebook.title}
            onChange={(e) => onChange?.({ title: e.target.value })}
            className="w-full bg-transparent text-center text-xl font-bold tracking-tight text-white outline-none placeholder-white/40 drop-shadow sm:text-2xl"
            placeholder="Notebook Title"
          />
        )}

        {/* Divider */}
        <div className="my-3 flex items-center gap-2 sm:my-4">
          <div className="h-px w-10 bg-white/30 sm:w-14" />
          <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <div className="h-px w-10 bg-white/30 sm:w-14" />
        </div>

        {/* Subtitle */}
        {readOnly ? (
          <p className="text-xs tracking-wide text-white/60 sm:text-sm">{notebook.subtitle}</p>
        ) : (
          <input
            value={notebook.subtitle}
            onChange={(e) => onChange?.({ subtitle: e.target.value })}
            className="w-full bg-transparent text-center text-xs tracking-wide text-white/60 outline-none placeholder-white/30 sm:text-sm"
            placeholder="Subtitle"
          />
        )}

        {/* Cover Image */}
        {(notebook.coverImage || !readOnly) && (
          <div className="mt-5 sm:mt-6">
            {notebook.coverImage ? (
              <div className="group relative mx-auto h-24 w-24 overflow-hidden rounded-xl border-2 border-white/20 shadow-lg sm:h-32 sm:w-32">
                <img src={notebook.coverImage} alt="Cover graphic" className="h-full w-full object-cover" />
                {!readOnly && (
                  <button
                    onClick={() => onChange?.({ coverImage: null })}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                    title="Remove Image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-white/30 px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white/90"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3zM3 15l5-5 4 4 3-3 6 6" />
                </svg>
                Add Image
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </div>
        )}
      </div>

      {/* Bottom label */}
      <div className="relative z-10 pb-3 text-center sm:pb-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/35 sm:text-[10px]">
          {notebook.pages.length} {notebook.pages.length === 1 ? 'Page' : 'Pages'} · DraftBook
        </p>
      </div>

      {/* Color swatches */}
      {!readOnly && (
        <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-2">
          {COVERS.map((col) => (
            <button
              key={col}
              onClick={() => onChange?.({ coverColor: col })}
              className={`h-4 w-4 rounded-full border transition-all ${
                notebook.coverColor === col
                  ? 'scale-125 border-white shadow-lg shadow-white/20'
                  : 'border-white/20 hover:scale-110 hover:border-white/40'
              }`}
              style={{ background: col }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmojiPicker({ value, onPick }: { value: string; onPick: (e: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex h-16 w-16 cursor-pointer items-center justify-center transition hover:scale-105 active:scale-95 sm:h-20 sm:w-20"
        style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '14px' }}
      >
        <span className="text-3xl sm:text-4xl">{value}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 grid grid-cols-5 gap-1 rounded-xl border border-white/20 bg-white p-2 shadow-2xl">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => { onPick(e); setOpen(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition hover:bg-stone-100">
                {e}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
