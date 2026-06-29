import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { uid } from './storage';
import type { Notebook } from '../types';
import { PAGE_SIZES } from '../types';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const COVERS = ['#4f46e5', '#0d9488', '#db2777', '#ea580c', '#7c3aed', '#0369a1', '#b45309', '#166534'];

export async function importPdf(file: File): Promise<Notebook> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  const pageSize = 'a4' as const;
  const { w: pw, h: ph } = PAGE_SIZES[pageSize];
  const scale = 2;

  const pages: import('../types').Page[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const p = await pdf.getPage(i);
    const vp = p.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await p.render({ canvasContext: ctx, viewport: vp }).promise;
    const src = canvas.toDataURL('image/jpeg', 0.92);

    pages.push({
      id: uid(),
      paper: 'plain',
      elements: [{
        id: uid(),
        type: 'image',
        x: 0,
        y: 0,
        w: pw,
        h: ph,
        z: 0,
        src,
      }],
    });
  }

  const name = file.name.replace(/\.pdf$/i, '') || 'Imported PDF';

  return {
    id: uid(),
    title: name,
    subtitle: `Imported PDF · ${pages.length} pages`,
    coverColor: COVERS[Math.floor(Math.random() * COVERS.length)],
    coverEmoji: '📄',
    coverImage: null,
    pageSize,
    pages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
