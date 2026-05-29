import type { Notebook, Page } from '../types';

const KEY = 'draftbook.notebooks.v2';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function emptyPage(paper: Page['paper'] = 'lined'): Page {
  return { id: uid(), elements: [], paper };
}

export function loadNotebooks(): Notebook[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Notebook[];
  } catch {
    return [];
  }
}

export function saveNotebooks(notebooks: Notebook[]) {
  localStorage.setItem(KEY, JSON.stringify(notebooks));
}

const COVERS = ['#4f46e5', '#0d9488', '#db2777', '#ea580c', '#7c3aed', '#0369a1', '#b45309', '#166534'];
const EMOJIS = ['📓', '📔', '📒', '📕', '📗', '📘', '✏️', '🧠', '🎓', '🚀', '💡', '📝'];

export function newNotebook(title = 'Untitled Notebook'): Notebook {
  return {
    id: uid(),
    title,
    subtitle: 'Tap to add a subtitle',
    coverColor: COVERS[Math.floor(Math.random() * COVERS.length)],
    coverEmoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    coverImage: null,
    pageSize: 'a4',
    pages: [emptyPage()],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export { COVERS, EMOJIS };
