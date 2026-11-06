export type WhiteboardElementType =
  | 'pencil' | 'rectangle' | 'diamond' | 'ellipse' | 'arrow' | 'line' | 'text' | 'note';

export type WhiteboardTool = WhiteboardElementType | 'select' | 'hand' | 'eraser';
export type WhiteboardLineStyle = 'solid' | 'dashed' | 'dotted';
export type WhiteboardLocale = 'en' | 'ru';

export interface WhiteboardStyle {
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
  lineStyle: WhiteboardLineStyle;
  fontSize: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

/** A point on a block outline, in fractions of its local width and height. */
export interface WhiteboardBinding {
  elementId: string;
  anchor: readonly [x: number, y: number];
}

/** Coordinates are in canvas space, independent of viewport size, pan and zoom. */
export interface WhiteboardElement extends WhiteboardStyle {
  id: string;
  type: WhiteboardElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  /** Flat, element-local x/y pairs for pencil strokes, lines and arrows. */
  points?: readonly number[];
  /** Element-local point the curve passes through, halfway between the endpoints in curve time. */
  bend?: readonly [x: number, y: number];
  /** Optional connections for lines and arrows. Points retain their last resolved positions. */
  startBinding?: WhiteboardBinding;
  endBinding?: WhiteboardBinding;
  /** Optional pen-pressure samples, one per x/y point pair. */
  pressures?: readonly number[];
  text?: string;
}

export interface WhiteboardDocument {
  version: 1;
  elements: readonly WhiteboardElement[];
}

export interface WhiteboardViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface WhiteboardExportOptions {
  pixelRatio?: number;
  backgroundColor?: string;
  padding?: number;
}
