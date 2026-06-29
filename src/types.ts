export type ElementType =
  | 'text'
  | 'sticky'
  | 'image'
  | 'table'
  | 'clipart';

export type ClipartKind =
  | 'arrow'
  | 'arrow-curve'
  | 'cloud'
  | 'star'
  | 'heart'
  | 'circle'
  | 'check'
  | 'lightbulb'
  | 'flag'
  | 'bookmark';

export type PageSize = 'a3' | 'a4' | 'a5' | 'letter';

export interface PageSizeDef {
  label: string;
  w: number;  // px at 96dpi
  h: number;
}

export const PAGE_SIZES: Record<PageSize, PageSizeDef> = {
  a5:     { label: 'A5',     w: 420, h: 595 },
  a4:     { label: 'A4',     w: 595, h: 842 },
  letter: { label: 'Letter', w: 612, h: 792 },
  a3:     { label: 'A3',     w: 842, h: 1191 },
};

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number; // percentage 0-100 of page width
  y: number; // px from top
  w: number; // px
  h: number; // px
  rotation?: number;
  z: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  color: string;
  fontSize: number;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface StickyElement extends BaseElement {
  type: 'sticky';
  content: string;
  color: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  cells: string[][];
  color: string;
}

export interface ClipartElement extends BaseElement {
  type: 'clipart';
  kind: ClipartKind;
  color: string;
}

export type NoteElement =
  | TextElement
  | StickyElement
  | ImageElement
  | TableElement
  | ClipartElement;

export type PaperStyle = 'lined' | 'grid' | 'dotted' | 'plain';

export interface Page {
  id: string;
  elements: NoteElement[];
  paper: PaperStyle;
}

export interface Notebook {
  id: string;
  title: string;
  subtitle: string;
  coverColor: string;
  coverEmoji: string;
  coverImage?: string | null;
  pageSize: PageSize;
  pages: Page[];
  createdAt: number;
  updatedAt: number;
}

export interface User {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}
