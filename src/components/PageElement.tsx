import { useRef } from 'react';
import type { NoteElement, TextElement, StickyElement, ImageElement, TableElement, ClipartElement } from '../types';
import { Clipart } from './Clipart';

interface Props {
  el: NoteElement;
  selected: boolean;
  readOnly?: boolean;
  pageWidth: number;
  onSelect: (id: string) => void;
  onChange: (el: NoteElement) => void;
}

export function PageElement({ el, selected, readOnly, pageWidth, onSelect, onChange }: Props) {
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; ow: number; oh: number } | null>(null);

  const leftPx = (el.x / 100) * pageWidth;

  function pointer(e: React.PointerEvent) {
    return { x: e.clientX, y: e.clientY };
  }

  function onDragStart(e: React.PointerEvent) {
    if (readOnly) return;
    if ((e.target as HTMLElement).dataset.handle) return;
    onSelect(el.id);
    const p = pointer(e);
    dragRef.current = { startX: p.x, startY: p.y, ox: leftPx, oy: el.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onDragMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const p = pointer(e);
    const dx = p.x - dragRef.current.startX;
    const dy = p.y - dragRef.current.startY;
    const newLeft = Math.max(0, Math.min(pageWidth - el.w, dragRef.current.ox + dx));
    const newTop = Math.max(0, dragRef.current.oy + dy);
    onChange({ ...el, x: (newLeft / pageWidth) * 100, y: newTop });
  }

  function onDragEnd() {
    dragRef.current = null;
  }

  function onResizeStart(e: React.PointerEvent) {
    e.stopPropagation();
    const p = pointer(e);
    resizeRef.current = { startX: p.x, startY: p.y, ow: el.w, oh: el.h };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onResizeMove(e: React.PointerEvent) {
    if (!resizeRef.current) return;
    const p = pointer(e);
    const dx = p.x - resizeRef.current.startX;
    const dy = p.y - resizeRef.current.startY;
    const w = Math.max(40, resizeRef.current.ow + dx);
    const h = Math.max(28, resizeRef.current.oh + dy);
    onChange({ ...el, w, h });
  }
  function onResizeEnd() {
    resizeRef.current = null;
  }

  return (
    <div
      onPointerDown={onDragStart}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      style={{
        position: 'absolute',
        left: leftPx,
        top: el.y,
        width: el.w,
        height: el.h,
        transform: `rotate(${el.rotation || 0}deg)`,
        zIndex: el.z,
        touchAction: 'none',
      }}
      className={`${readOnly ? '' : 'cursor-move'} ${
        selected && !readOnly ? 'ring-2 ring-indigo-400 ring-offset-1' : ''
      } rounded-md`}
    >
      <ElementInner el={el} readOnly={readOnly} onChange={onChange} />

      {selected && !readOnly && (
        <div
          data-handle="resize"
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          className="absolute -bottom-2 -right-2 h-5 w-5 cursor-se-resize rounded-full border-2 border-white bg-indigo-500 shadow"
          style={{ touchAction: 'none' }}
        />
      )}
    </div>
  );
}

function ElementInner({
  el,
  readOnly,
  onChange,
}: {
  el: NoteElement;
  readOnly?: boolean;
  onChange: (el: NoteElement) => void;
}) {
  switch (el.type) {
    case 'text': {
      const t = el as TextElement;
      return (
        <div
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onBlur={(e) => onChange({ ...t, content: e.currentTarget.innerText })}
          data-handle="edit"
          style={{
            color: t.color,
            fontSize: t.fontSize,
            fontWeight: t.bold ? 700 : 400,
            fontStyle: t.italic ? 'italic' : 'normal',
            textAlign: t.align || 'left',
            width: '100%',
            height: '100%',
            outline: 'none',
            overflow: 'hidden',
            lineHeight: 1.3,
            cursor: readOnly ? 'default' : 'text',
          }}
        >
          {t.content}
        </div>
      );
    }
    case 'sticky': {
      const s = el as StickyElement;
      return (
        <div
          className="flex h-full w-full flex-col rounded-sm p-2 shadow-md"
          style={{ background: s.color, boxShadow: '2px 4px 10px rgba(0,0,0,0.18)' }}
        >
          <div className="mx-auto mb-1 h-2 w-10 rounded-full bg-black/10" />
          <div
            contentEditable={!readOnly}
            suppressContentEditableWarning
            data-handle="edit"
            onBlur={(e) => onChange({ ...s, content: e.currentTarget.innerText })}
            className="flex-1 text-[13px] leading-snug text-slate-800 outline-none"
            style={{ cursor: readOnly ? 'default' : 'text', overflow: 'hidden' }}
          >
            {s.content}
          </div>
        </div>
      );
    }
    case 'image': {
      const im = el as ImageElement;
      return (
        <img
          src={im.src}
          alt=""
          draggable={false}
          className="h-full w-full rounded-md object-cover shadow-sm"
        />
      );
    }
    case 'clipart': {
      const c = el as ClipartElement;
      return (
        <div className="h-full w-full">
          <Clipart kind={c.kind} color={c.color} />
        </div>
      );
    }
    case 'table': {
      const tb = el as TableElement;
      return (
        <table className="h-full w-full border-collapse text-[12px]" style={{ tableLayout: 'fixed' }}>
          <tbody>
            {Array.from({ length: tb.rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: tb.cols }).map((_, cIdx) => (
                  <td
                    key={cIdx}
                    contentEditable={!readOnly}
                    suppressContentEditableWarning
                    data-handle="edit"
                    onBlur={(e) => {
                      const cells = tb.cells.map((row) => [...row]);
                      cells[r][cIdx] = e.currentTarget.innerText;
                      onChange({ ...tb, cells });
                    }}
                    className="border p-1 align-top outline-none"
                    style={{
                      borderColor: tb.color,
                      background: r === 0 ? tb.color + '22' : 'transparent',
                      fontWeight: r === 0 ? 600 : 400,
                      cursor: readOnly ? 'default' : 'text',
                    }}
                  >
                    {tb.cells[r]?.[cIdx] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    default:
      return null;
  }
}
