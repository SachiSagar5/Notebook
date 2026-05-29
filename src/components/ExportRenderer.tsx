import type { Notebook } from '../types';
import { PAGE_SIZES } from '../types';
import { PageElement } from './PageElement';
import { Cover } from './Cover';

/**
 * Renders every page off-screen so the PDF exporter can capture all of them.
 */
export function ExportRenderer({ notebook }: { notebook: Notebook }) {
  const def = PAGE_SIZES[notebook.pageSize];

  return (
    <div
      style={{
        position: 'absolute',
        left: -9999,
        top: 0,
        zIndex: -9999,
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      {/* Cover */}
      <div
        data-export-page
        style={{ width: def.w, height: def.h }}
      >
        <Cover notebook={notebook} readOnly />
      </div>

      {notebook.pages.map((p) => (
        <div
          key={p.id}
          data-export-page
          className={`paper-${p.paper}`}
          style={{
            position: 'relative',
            width: def.w,
            height: def.h,
            overflow: 'hidden',
            borderRadius: '0 6px 6px 0',
            border: '1px solid #e7e5e4',
            boxShadow: '4px 4px 24px rgba(0,0,0,0.10)',
          }}
        >
          {p.paper === 'lined' && <div className="margin-line" />}
          {p.elements.map((el) => (
            <PageElement
              key={el.id}
              el={el}
              selected={false}
              readOnly
              pageWidth={def.w}
              onSelect={() => {}}
              onChange={() => {}}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
