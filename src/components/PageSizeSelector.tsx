import type { PageSize } from '../types';
import { PAGE_SIZES } from '../types';

interface Props {
  value: PageSize;
  onChange: (size: PageSize) => void;
}

export function PageSizeSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 text-xs">
      {(Object.keys(PAGE_SIZES) as PageSize[]).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`rounded-md px-2.5 py-1 font-medium transition ${
            value === s
              ? 'bg-white font-semibold text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {PAGE_SIZES[s].label}
        </button>
      ))}
    </div>
  );
}
