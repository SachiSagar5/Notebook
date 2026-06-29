import type { NoteElement, TextElement, StickyElement, TableElement, ClipartElement } from '../types';

interface Props {
  el: NoteElement;
  onChange: (el: NoteElement) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TEXT_COLORS = ['#1e293b', '#dc2626', '#ea580c', '#d97706', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777'];
const STICKY_COLORS = ['#fef08a', '#fecaca', '#bbf7d0', '#bae6fd', '#ddd6fe', '#fed7aa', '#f5d0fe'];

export function PropertyPanel({ el, onChange, onDelete, onClose }: Props) {
  return (
    <div className="fade-up flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {el.type}
      </span>

      {el.type === 'text' && (
        <TextControls t={el as TextElement} onChange={onChange} />
      )}
      {el.type === 'sticky' && (
        <ColorRow
          colors={STICKY_COLORS}
          value={(el as StickyElement).color}
          onPick={(c) => onChange({ ...(el as StickyElement), color: c })}
        />
      )}
      {el.type === 'clipart' && (
        <ColorRow
          colors={TEXT_COLORS}
          value={(el as ClipartElement).color}
          onPick={(c) => onChange({ ...(el as ClipartElement), color: c })}
        />
      )}
      {el.type === 'table' && <TableControls t={el as TableElement} onChange={onChange} />}

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => onChange({ ...el, rotation: ((el.rotation || 0) + 15) % 360 })}
          title="Rotate"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-900/30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"
          title="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function TextControls({ t, onChange }: { t: TextElement; onChange: (e: NoteElement) => void }) {
  return (
    <>
      <ColorRow colors={TEXT_COLORS} value={t.color} onPick={(c) => onChange({ ...t, color: c })} />
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange({ ...t, fontSize: Math.max(10, t.fontSize - 2) })}
          className="rounded-md bg-slate-100 px-2 py-1 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          −
        </button>
        <span className="w-8 text-center text-xs text-slate-500 dark:text-slate-400">{t.fontSize}</span>
        <button
          onClick={() => onChange({ ...t, fontSize: Math.min(72, t.fontSize + 2) })}
          className="rounded-md bg-slate-100 px-2 py-1 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          +
        </button>
      </div>
      <button
        onClick={() => onChange({ ...t, bold: !t.bold })}
        className={`rounded-md px-2 py-1 text-sm font-bold ${t.bold ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
      >
        B
      </button>
      <button
        onClick={() => onChange({ ...t, italic: !t.italic })}
        className={`rounded-md px-2 py-1 text-sm italic ${t.italic ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
      >
        I
      </button>
    </>
  );
}

function TableControls({ t, onChange }: { t: TableElement; onChange: (e: NoteElement) => void }) {
  function resize(rows: number, cols: number) {
    rows = Math.max(1, Math.min(12, rows));
    cols = Math.max(1, Math.min(8, cols));
    const cells = Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: cols }).map((_, c) => t.cells[r]?.[c] ?? '')
    );
    onChange({ ...t, rows, cols, cells });
  }
  return (
    <>
      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <span>Rows</span>
        <button onClick={() => resize(t.rows - 1, t.cols)} className="rounded bg-slate-100 px-2 py-0.5 font-bold dark:bg-slate-800">−</button>
        <span className="w-4 text-center">{t.rows}</span>
        <button onClick={() => resize(t.rows + 1, t.cols)} className="rounded bg-slate-100 px-2 py-0.5 font-bold dark:bg-slate-800">+</button>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <span>Cols</span>
        <button onClick={() => resize(t.rows, t.cols - 1)} className="rounded bg-slate-100 px-2 py-0.5 font-bold dark:bg-slate-800">−</button>
        <span className="w-4 text-center">{t.cols}</span>
        <button onClick={() => resize(t.rows, t.cols + 1)} className="rounded bg-slate-100 px-2 py-0.5 font-bold dark:bg-slate-800">+</button>
      </div>
      <ColorRow colors={TEXT_COLORS} value={t.color} onPick={(c) => onChange({ ...t, color: c })} />
    </>
  );
}

function ColorRow({
  colors,
  value,
  onPick,
}: {
  colors: string[];
  value: string;
  onPick: (c: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          className={`h-5 w-5 rounded-full border transition ${
            value === c ? 'ring-2 ring-indigo-400 ring-offset-1' : 'border-black/10'
          }`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}
