import { resolveBindings } from './whiteboard-bindings';
import type { WhiteboardBinding, WhiteboardDocument, WhiteboardElement, WhiteboardViewport } from './whiteboard.models';

const elementTypes = new Set(['pencil', 'rectangle', 'diamond', 'ellipse', 'arrow', 'line', 'text', 'note']);

function parseBinding(value: unknown): WhiteboardBinding | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object' || !('elementId' in value) || typeof value.elementId !== 'string' || !value.elementId ||
      !('anchor' in value) || !Array.isArray(value.anchor) || value.anchor.length !== 2 ||
      !value.anchor.every(point => typeof point === 'number' && Number.isFinite(point) && point >= 0 && point <= 1)) {
    throw new Error('Invalid whiteboard connector binding.');
  }
  return { elementId: value.elementId, anchor: [value.anchor[0], value.anchor[1]] };
}

/** Parses the portable data format, never Konva's executable scene graph. */
export function parseWhiteboardDocument(json: string): WhiteboardDocument {
  const value: unknown = JSON.parse(json);
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 ||
      !('elements' in value) || !Array.isArray(value.elements) || value.elements.length > 10000) {
    throw new Error('Invalid whiteboard document.');
  }
  const ids = new Set<string>();
  const elements = value.elements.map((item: unknown): WhiteboardElement => {
    if (!item || typeof item !== 'object') throw new Error('Invalid whiteboard element.');
    const e = item as Record<string, unknown>;
    const finite = (key: string) => typeof e[key] === 'number' && Number.isFinite(e[key]);
    if (typeof e['id'] !== 'string' || !e['id'] || ids.has(e['id']) ||
        typeof e['type'] !== 'string' || !elementTypes.has(e['type']) ||
        !['x', 'y', 'width', 'height', 'strokeWidth', 'opacity', 'fontSize'].every(finite) ||
        (e['width'] as number) < 0 || (e['height'] as number) < 0 ||
        (e['strokeWidth'] as number) <= 0 || (e['fontSize'] as number) <= 0 ||
        (e['opacity'] as number) < 0 || (e['opacity'] as number) > 1 ||
        typeof e['stroke'] !== 'string' || typeof e['fill'] !== 'string' ||
        !['solid', 'dashed', 'dotted'].includes(e['lineStyle'] as string) ||
        ['rotation', 'scaleX', 'scaleY'].some(key => e[key] !== undefined && !finite(key)) ||
        ['scaleX', 'scaleY'].some(key => e[key] !== undefined && (e[key] as number) <= 0) ||
        (e['text'] !== undefined && typeof e['text'] !== 'string') ||
        (e['fontFamily'] !== undefined && typeof e['fontFamily'] !== 'string') ||
        (e['textAlign'] !== undefined && !['left', 'center', 'right'].includes(e['textAlign'] as string))) {
      throw new Error('Invalid whiteboard element.');
    }
    const path = ['pencil', 'line', 'arrow'].includes(e['type']);
    if (path && (!Array.isArray(e['points']) || e['points'].length < 4 ||
        e['points'].length % 2 !== 0 || e['points'].length > 200000 ||
        !e['points'].every((n: unknown) => typeof n === 'number' && Number.isFinite(n)))) {
      throw new Error('Invalid whiteboard path.');
    }
    if (e['pressures'] !== undefined && (e['type'] !== 'pencil' || !Array.isArray(e['pressures']) ||
        !Array.isArray(e['points']) || e['pressures'].length !== e['points'].length / 2 ||
        !e['pressures'].every((p: unknown) => typeof p === 'number' && Number.isFinite(p) && p >= 0 && p <= 1))) {
      throw new Error('Invalid whiteboard pen pressure.');
    }
    const connector = e['type'] === 'line' || e['type'] === 'arrow';
    const bend = e['bend'];
    if (bend !== undefined && (!connector || (e['points'] as number[]).length !== 4 ||
        !Array.isArray(bend) || bend.length !== 2 ||
        !bend.every(point => typeof point === 'number' && Number.isFinite(point)))) {
      throw new Error('Invalid whiteboard connector bend.');
    }
    const startBinding = connector ? parseBinding(e['startBinding']) : undefined;
    const endBinding = connector ? parseBinding(e['endBinding']) : undefined;
    ids.add(e['id']);
    // Pick known fields so imported metadata cannot become Konva attributes or event handlers.
    return {
      id: e['id'], type: e['type'] as WhiteboardElement['type'],
      x: e['x'] as number, y: e['y'] as number,
      width: e['width'] as number, height: e['height'] as number,
      stroke: e['stroke'], fill: e['fill'], strokeWidth: e['strokeWidth'] as number,
      opacity: e['opacity'] as number, lineStyle: e['lineStyle'] as WhiteboardElement['lineStyle'],
      fontSize: e['fontSize'] as number,
      rotation: e['rotation'] as number | undefined,
      scaleX: e['scaleX'] as number | undefined, scaleY: e['scaleY'] as number | undefined,
      ...(path ? { points: [...e['points'] as number[]] } : {}),
      ...(Array.isArray(bend) ? { bend: [bend[0], bend[1]] as const } : {}),
      ...(startBinding ? { startBinding } : {}),
      ...(endBinding ? { endBinding } : {}),
      ...(e['text'] === undefined ? {} : { text: e['text'] as string }),
      ...(e['pressures'] === undefined ? {} : { pressures: [...e['pressures'] as number[]] }),
      ...(e['fontFamily'] === undefined ? {} : { fontFamily: e['fontFamily'] as string }),
      ...(e['textAlign'] === undefined ? {} : { textAlign: e['textAlign'] as WhiteboardElement['textAlign'] }),
    };
  });
  return { version: 1, elements: resolveBindings(elements) };
}

/** Keep the canvas point under the pointer stationary while changing scale. */
export function zoomWhiteboardAt(view: WhiteboardViewport, point: { x: number; y: number }, zoom: number): WhiteboardViewport {
  const next = Math.max(0.1, Math.min(5, zoom));
  return {
    x: point.x - (point.x - view.x) / view.zoom * next,
    y: point.y - (point.y - view.y) / view.zoom * next,
    zoom: next,
  };
}

/** Bounded document history; viewport changes deliberately do not create undo entries. */
export class WhiteboardHistory {
  private past: WhiteboardDocument[] = [];
  private future: WhiteboardDocument[] = [];
  constructor(public current: WhiteboardDocument, private readonly limit = 100) {}
  get canUndo(): boolean { return this.past.length > 0; }
  get canRedo(): boolean { return this.future.length > 0; }
  reset(document: WhiteboardDocument): void {
    this.current = document;
    this.past = [];
    this.future = [];
  }
  commit(elements: readonly WhiteboardElement[]): void {
    this.past.push(this.current);
    if (this.past.length > this.limit) this.past.shift();
    this.current = { version: 1, elements };
    this.future = [];
  }
  undo(): void {
    const previous = this.past.pop();
    if (!previous) return;
    this.future.push(this.current);
    this.current = previous;
  }
  redo(): void {
    const next = this.future.pop();
    if (!next) return;
    this.past.push(this.current);
    this.current = next;
  }
}
