import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { PAGE_SIZES, type PageSize } from '../types';

/**
 * Convert page size to PDF points (1pt = 1/72in, 96dpi screen)
 */
function pageSizeToPdf(size: PageSize) {
  const def = PAGE_SIZES[size];
  // Screen px at 96dpi → PDF pts at 72dpi: pt = px * 72/96
  const scale = 72 / 96;
  return { w: def.w * scale, h: def.h * scale };
}

/**
 * Export all rendered page DOM nodes ([data-export-page]) into a single PDF.
 * Uses html2canvas-pro which supports oklch/lab colors from Tailwind v4.
 */
export async function exportNotebookPdf(title: string, pageSize: PageSize = 'a4') {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-export-page]'));
  if (nodes.length === 0) throw new Error('No pages found to export');

  const { w: pageW, h: pageH } = pageSizeToPdf(pageSize);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [pageW, pageH] });

  const margin = 8;
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2;

  for (let i = 0; i < nodes.length; i++) {
    const canvas = await html2canvas(nodes[i], {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollY: -window.scrollY,
      windowHeight: document.documentElement.offsetHeight,
    });

    if (!canvas.width || !canvas.height) continue;

    const img = canvas.toDataURL('image/jpeg', 0.93);
    const ratio = Math.min(availW / canvas.width, availH / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;

    if (i > 0) pdf.addPage([pageW, pageH]);
    pdf.addImage(img, 'JPEG', (pageW - w) / 2, (pageH - h) / 2, w, h);
  }

  pdf.save(`${title.replace(/[^a-z0-9]+/gi, '_') || 'notebook'}.pdf`);
}
