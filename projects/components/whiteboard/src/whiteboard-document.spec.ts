import { describe, expect, it } from 'vitest';
import { connectorEndPoint } from './whiteboard-bindings';
import { parseWhiteboardDocument, WhiteboardHistory, zoomWhiteboardAt } from './whiteboard-document';
import type { WhiteboardDocument, WhiteboardElement } from './whiteboard.models';

const rectangle: WhiteboardElement = {
  id: 'rect', type: 'rectangle', x: 10, y: 20, width: 120, height: 80,
  stroke: '#245bff', fill: 'transparent', strokeWidth: 2, opacity: 1, lineStyle: 'solid', fontSize: 24,
};
const document: WhiteboardDocument = { version: 1, elements: [rectangle] };

describe('Whiteboard document format', () => {
  it('round trips shape transforms, text and negative path coordinates', () => {
    const value: WhiteboardDocument = { version: 1, elements: [
      { ...rectangle, rotation: 45, scaleX: 2, scaleY: 0.5 },
      { ...rectangle, id: 'note', type: 'note', text: 'Hello\nworld', fontFamily: 'Caveat', textAlign: 'center' },
      { ...rectangle, id: 'path', type: 'pencil', points: [0, 0, -20, 10, 25, -40], pressures: [0.1, 0.6, 1] },
      { ...rectangle, id: 'curve', type: 'line', points: [0, 0, 70, 80], bend: [-20, 50] },
    ] };
    expect(parseWhiteboardDocument(JSON.stringify(value))).toEqual(value);
  });
  it('rejects incompatible versions, duplicate IDs and incomplete paths', () => {
    for (const value of [
      { version: 2, elements: [] }, { version: 1, elements: [rectangle, rectangle] },
      { version: 1, elements: [{ ...rectangle, type: 'pencil', points: [1, 2, 3] }] },
      { version: 1, elements: [{ ...rectangle, type: 'Image' }] },
      { version: 1, elements: [{ ...rectangle, opacity: 2 }] },
      { version: 1, elements: [{ ...rectangle, scaleX: -1 }] },
      { version: 1, elements: [{ ...rectangle, type: 'pencil', points: [0, 0, 1, 2], pressures: [0.5] }] },
      { version: 1, elements: [{ ...rectangle, type: 'line', points: [0, 0, 1, 2], bend: [0, 'invalid'] }] },
    ]) expect(() => parseWhiteboardDocument(JSON.stringify(value))).toThrow();
  });
  it('discards scene attributes and executable Konva node metadata', () => {
    const parsed = parseWhiteboardDocument(JSON.stringify({ version: 1, elements: [{
      ...rectangle, sceneFunc: 'untrusted', draggable: true, children: [{ className: 'Image' }],
    }] }));
    expect(parsed.elements[0]).toEqual(rectangle);
    expect(parsed.elements[0]).not.toHaveProperty('sceneFunc');
    expect(parsed.elements[0]).not.toHaveProperty('children');
  });
  it('restores connector geometry from rotated and resized blocks on JSON import', () => {
    const block = { ...rectangle, rotation: 90, scaleX: 2, scaleY: 0.5 };
    const arrow: WhiteboardElement = {
      ...rectangle, id: 'arrow', type: 'arrow', points: [0, 0, 0, 320],
      startBinding: { elementId: 'rect', anchor: [1, 0.5] },
    };
    const result = parseWhiteboardDocument(JSON.stringify({ version: 1, elements: [block, arrow] }));
    expect(result.elements[1].startBinding).toEqual(arrow.startBinding);
    const point = connectorEndPoint(result.elements[1], 'start');
    expect(point.x).toBeCloseTo(-10);
    expect(point.y).toBeCloseTo(260);
    expect(connectorEndPoint(result.elements[1], 'end')).toEqual({ x: 10, y: 340 });
    expect(parseWhiteboardDocument(JSON.stringify(result))).toEqual(result);
    expect(() => parseWhiteboardDocument(JSON.stringify({ version: 1, elements: [block, {
      ...arrow, startBinding: { elementId: 'rect', anchor: [2, 0] },
    }] }))).toThrow('Invalid whiteboard connector binding.');
  });
});

describe('Whiteboard history', () => {
  it('restores deleted objects and invalidates redo after a new branch', () => {
    const history = new WhiteboardHistory(document);
    history.commit([]);
    history.undo();
    expect(history.current).toBe(document);
    expect(history.canRedo).toBe(true);
    history.commit([{ ...rectangle, x: 100 }]);
    expect(history.canRedo).toBe(false);
    history.undo(); history.redo();
    expect(history.current.elements[0].x).toBe(100);
  });
  it('caps history and resets it when an external document is loaded', () => {
    const history = new WhiteboardHistory(document, 2);
    for (const x of [20, 30, 40]) history.commit([{ ...rectangle, x }]);
    history.undo(); history.undo(); history.undo();
    expect(history.current.elements[0].x).toBe(20);
    expect(history.canUndo).toBe(false);
    history.reset(document);
    expect(history.canRedo).toBe(false);
    expect(history.canUndo).toBe(false);
  });
});

describe('Whiteboard zoom', () => {
  it('keeps the same world coordinate under the pointer after pan and zoom', () => {
    const view = { x: -120, y: 80, zoom: 0.4 }, point = { x: 540, y: 310 };
    const next = zoomWhiteboardAt(view, point, 1.8);
    expect((point.x - next.x) / next.zoom).toBeCloseTo((point.x - view.x) / view.zoom);
    expect((point.y - next.y) / next.zoom).toBeCloseTo((point.y - view.y) / view.zoom);
  });
  it('clamps both zoom limits without moving the anchor', () => {
    const view = { x: 0, y: 0, zoom: 1 }, point = { x: 100, y: 100 };
    expect(zoomWhiteboardAt(view, point, 50)).toEqual({ x: -400, y: -400, zoom: 5 });
    expect(zoomWhiteboardAt(view, point, 0.01)).toEqual({ x: 90, y: 90, zoom: 0.1 });
  });
});
