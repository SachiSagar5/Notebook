import { useRef, useState } from 'react';
import { CLIPART_KINDS } from './Clipart';
import { Clipart } from './Clipart';
import type { ClipartKind, PaperStyle } from '../types';

interface Props {
  onAddText: () => void;
  onAddSticky: () => void;
  onAddTable: () => void;
  onAddImage: (src: string) => void;
  onAddClipart: (kind: ClipartKind) => void;
  paper: PaperStyle;
  onPaperChange: (p: PaperStyle) => void;
}

const TOOL_COLOR = '#475569';

function ToolBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:text-slate-400 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-400"
    >
      <span className="text-slate-500 dark:text-slate-500">{children}</span>
      <span className="hidden sm:block">{label}</span>
    </button>
  );
}

export function Toolbar(props: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showClip, setShowClip] = useState(false);
  const [showPaper, setShowPaper] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => props.onAddImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const papers: { id: PaperStyle; label: string }[] = [
    { id: 'lined', label: 'Lined' },
    { id: 'grid', label: 'Grid' },
    { id: 'dotted', label: 'Dotted' },
    { id: 'plain', label: 'Plain' },
  ];

  return (
    <div className="relative">
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <ToolBtn label="Text" onClick={props.onAddText}>
          <Icon path="M4 7V4h16v3M9 20h6M12 4v16" />
        </ToolBtn>
        <ToolBtn label="Sticker" onClick={props.onAddSticky}>
          <Icon path="M14.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9l7-7V5a2 2 0 0 0-2-2zM14 21v-5a2 2 0 0 1 2-2h5" />
        </ToolBtn>
        <ToolBtn label="Table" onClick={props.onAddTable}>
          <Icon path="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />
        </ToolBtn>
        <ToolBtn label="Image" onClick={() => fileRef.current?.click()}>
          <Icon path="M3 3h18v18H3zM3 15l5-5 4 4 3-3 6 6" />
        </ToolBtn>
        <ToolBtn label="Clip Art" onClick={() => setShowClip((s) => !s)}>
          <Icon path="M5 12h14M12 5v14M5 5l14 14" />
        </ToolBtn>
        <div className="mx-1 h-8 w-px bg-slate-200 dark:bg-slate-700" />
        <ToolBtn label="Paper" onClick={() => setShowPaper((s) => !s)}>
          <Icon path="M4 4h16v16H4zM4 9h16M4 14h16" />
        </ToolBtn>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>

      {showClip && (
        <div className="fade-up absolute right-0 top-full z-30 mt-2 grid w-64 grid-cols-5 gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {CLIPART_KINDS.map((k) => (
            <button
              key={k}
              onClick={() => {
                props.onAddClipart(k);
                setShowClip(false);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-lg p-1.5 transition hover:bg-indigo-50 dark:hover:bg-indigo-900/40"
            >
              <Clipart kind={k} color={TOOL_COLOR} />
            </button>
          ))}
        </div>
      )}

      {showPaper && (
        <div className="fade-up absolute right-0 top-full z-30 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {papers.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                props.onPaperChange(p.id);
                setShowPaper(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-indigo-50 dark:hover:bg-indigo-900/40 ${
                props.paper === p.id ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {p.label}
              {props.paper === p.id && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}
