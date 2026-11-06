import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type Konva from 'konva';
import { connectorBendPoint, connectorEndPoint } from './whiteboard-bindings';
import { WhiteboardEngine } from './whiteboard-engine';
import type { WhiteboardElement } from './whiteboard.models';

const rectangle: WhiteboardElement = {
  id: 'rect', type: 'rectangle', x: 100, y: 100, width: 120, height: 80,
  stroke: '#245bff', fill: '#e9efff', strokeWidth: 2, opacity: 1, lineStyle: 'solid', fontSize: 24,
};

// Run through Angular's browser test target: these exercise real Konva canvases and hit detection.
describe('Whiteboard Konva engine', () => {
  let engine: WhiteboardEngine;
  let container: HTMLDivElement;
  const change = vi.fn(), selection = vi.fn(), viewport = vi.fn(), editText = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    container.style.width = '800px'; container.style.height = '600px';
    container.tabIndex = 0;
    document.body.append(container);
    engine = new WhiteboardEngine(container, { version: 1, elements: [rectangle] }, { change, selection, viewport, editText });
  });
  afterEach(() => { engine.destroy(); container.remove(); });

  function pointer(type: string, x: number, y: number, options: PointerEventInit = {}): void {
    engine.stage.draw();
    const bounds = engine.stage.content.getBoundingClientRect();
    engine.stage.content.dispatchEvent(new PointerEvent(type, {
      clientX: bounds.left + x, clientY: bounds.top + y, pointerId: 1,
      button: 0, buttons: type === 'pointerup' ? 0 : 1, bubbles: true, isPrimary: true, ...options,
    }));
  }

  it('draws backwards rectangles in world coordinates after pan and zoom, as one undo step', () => {
    engine.setTool('rectangle');
    engine.setViewport({ x: 40, y: 30, zoom: 2 });
    pointer('pointerdown', 640, 430); pointer('pointermove', 440, 330); pointer('pointerup', 440, 330);
    expect(engine.document.elements).toHaveLength(2);
    const drawn = engine.document.elements[1];
    expect(drawn).toMatchObject({ x: 200, y: 150, width: 100, height: 50 });
    expect(selection).toHaveBeenLastCalledWith([drawn]);
    const transformer = engine.stage.findOne<Konva.Transformer>('Transformer')!;
    expect(transformer.nodes().map(node => node.id())).toEqual([drawn.id]);
    expect(container.dataset['tool']).toBe('rectangle');
    expect(change).toHaveBeenCalledTimes(1);
    engine.undo(); expect(engine.document.elements).toEqual([rectangle]);
    engine.redo(); expect(engine.document.elements).toHaveLength(2);
  });
  it('selects the latest pencil stroke and keeps Pencil active for the next stroke', () => {
    engine.toolLocked = false;
    engine.setTool('pencil');
    const transformer = engine.stage.findOne<Konva.Transformer>('Transformer')!;
    for (const y of [240, 340]) {
      pointer('pointerdown', 300, y); pointer('pointermove', 380, y + 20); pointer('pointerup', 420, y + 20);
      const stroke = engine.document.elements.at(-1)!;
      expect(selection).toHaveBeenLastCalledWith([stroke]);
      expect(transformer.nodes().map(node => node.id())).toEqual([stroke.id]);
      expect(container.dataset['tool']).toBe('pencil');
    }
    expect(engine.document.elements.map(element => element.type)).toEqual(['rectangle', 'pencil', 'pencil']);
  });
  it('cancels a partially drawn stroke instead of saving it', () => {
    engine.setTool('pencil');
    pointer('pointerdown', 300, 300); pointer('pointermove', 400, 340);
    pointer('pointercancel', 400, 340);
    expect(engine.document.elements).toEqual([rectangle]);
    expect(change).not.toHaveBeenCalled();
  });
  it('selects an object, applies a style, duplicates and deletes in undoable edits', () => {
    engine.setTool('select');
    pointer('pointerdown', 160, 140); pointer('pointerup', 160, 140);
    expect(selection).toHaveBeenLastCalledWith([rectangle]);
    engine.applyStyle({ stroke: '#c83d48', opacity: 0.5 });
    expect(engine.document.elements[0]).toMatchObject({ stroke: '#c83d48', opacity: 0.5 });
    engine.duplicateSelection();
    expect(engine.document.elements[1]).toMatchObject({ x: 124, y: 124 });
    engine.deleteSelection(); expect(engine.document.elements).toHaveLength(1);
    engine.undo(); expect(engine.document.elements).toHaveLength(2);
  });
  it.each([{ rotation: 0, zoom: 1 }, { rotation: 30, zoom: 1.5 }])(
    'keeps the rotation stem outside the selection frame at $rotation° and $zoom× zoom',
    ({ rotation, zoom }) => {
      engine.setDocument({ version: 1, elements: [{ ...rectangle, rotation }] });
      const node = engine.stage.findOne('#rect')!;
      const center = node.getAbsoluteTransform().point({ x: 60, y: 40 });
      pointer('pointerdown', center.x, center.y); pointer('pointerup', center.x, center.y);
      engine.setViewport({ x: 20, y: 10, zoom });
      engine.stage.draw();

      const transformer = engine.stage.findOne<Konva.Transformer>('Transformer')!;
      const layer = transformer.getLayer()!;
      const context = layer.getNativeCanvasElement().getContext('2d')!;
      const ratio = layer.getCanvas().getPixelRatio();
      const hasPaintAt = (distance: number) => {
        const point = transformer.getAbsoluteTransform().point({
          x: transformer.width() / 2, y: distance - transformer.padding(),
        });
        const { data } = context.getImageData(Math.floor(point.x * ratio) - 1, Math.floor(point.y * ratio) - 1, 3, 3);
        return data.some((value, index) => index % 4 === 3 && value > 0);
      };
      expect(hasPaintAt(-10)).toBe(true);
      expect(hasPaintAt(3.5)).toBe(false);
    },
  );
  it('moves a multi-selection once in canvas coordinates and cancels an interrupted move', () => {
    const second = { ...rectangle, id: 'second', x: 250 };
    engine.setDocument({ version: 1, elements: [rectangle, second] });
    engine.setViewport({ x: 20, y: 10, zoom: 2 });
    pointer('pointerdown', 300, 260); pointer('pointerup', 300, 260);
    pointer('pointerdown', 580, 260, { shiftKey: true }); pointer('pointerup', 580, 260, { shiftKey: true });
    pointer('pointerdown', 300, 260); pointer('pointermove', 340, 280); pointer('pointerup', 350, 290);
    expect(engine.document.elements.map(({ x, y }) => [x, y])).toEqual([[125, 115], [275, 115]]);
    expect(change).toHaveBeenCalledTimes(1);
    pointer('pointerdown', 350, 290); pointer('pointermove', 370, 300); pointer('pointercancel', 370, 300);
    expect(change).toHaveBeenCalledTimes(1);
    pointer('pointerdown', 350, 290); pointer('pointerup', 370, 300);
    expect(engine.document.elements.map(({ x, y }) => [x, y])).toEqual([[135, 120], [285, 120]]);
    engine.undo(); engine.undo();
    expect(engine.document.elements).toEqual([rectangle, second]);
  });
  it('snaps both ends of an arrow and follows a block during drag and undo', () => {
    const second = { ...rectangle, id: 'second', x: 350 };
    engine.setDocument({ version: 1, elements: [rectangle, second] });
    engine.setViewport({ x: 20, y: 10, zoom: 1.5 });
    engine.setTool('arrow');
    pointer('pointerdown', 356, 220); pointer('pointerup', 537, 220);
    const arrow = engine.document.elements[2];
    expect(arrow.startBinding).toEqual({ elementId: 'rect', anchor: [1, 0.5] });
    expect(arrow.endBinding).toEqual({ elementId: 'second', anchor: [0, 0.5] });
    expect(connectorEndPoint(arrow, 'end')).toEqual({ x: 350, y: 140 });

    engine.setTool('select');
    pointer('pointerdown', 620, 220); pointer('pointermove', 665, 250);
    const group = engine.stage.findOne<Konva.Group>((node: Konva.Node) => node.id() === arrow.id)!;
    const line = group.getChildren()[0] as Konva.Line;
    expect(group.getTransform().point({ x: line.points()[2], y: line.points()[3] })).toEqual({ x: 380, y: 160 });
    expect(engine.document.elements[1].x).toBe(350);
    pointer('pointerup', 665, 250);
    expect(connectorEndPoint(engine.document.elements[2], 'end')).toEqual({ x: 380, y: 160 });
    engine.deleteSelection();
    expect(engine.document.elements[1].endBinding).toBeUndefined();
    expect(connectorEndPoint(engine.document.elements[1], 'end')).toEqual({ x: 380, y: 160 });
    engine.undo(); engine.undo();
    expect(engine.document.elements[2]).toEqual(arrow);
  });
  it('switches to the facing edges when a connected block moves past the other block', () => {
    const first = { ...rectangle, x: 200 };
    const second = { ...rectangle, id: 'second', x: 420 };
    engine.setDocument({ version: 1, elements: [first, second] });
    engine.setTool('arrow');
    pointer('pointerdown', 320, 140); pointer('pointerup', 420, 140);
    const original = engine.document.elements[2];
    const group = engine.stage.findOne<Konva.Group>((node: Konva.Node) => node.id() === original.id)!;
    const line = group.getChildren()[0] as Konva.Arrow;
    engine.setTool('select');
    pointer('pointerdown', 480, 140);
    pointer('pointermove', 260, 140);
    expect(group.visible()).toBe(false);
    pointer('pointermove', 100, 140);
    expect(group.visible()).toBe(true);
    expect(line.points()).toEqual([-120, 0, -160, 0]);
    pointer('pointerup', 100, 140);

    const arrow = engine.document.elements[2];
    expect(arrow.startBinding?.anchor).toEqual([0, 0.5]);
    expect(arrow.endBinding?.anchor).toEqual([1, 0.5]);
    expect(connectorEndPoint(arrow, 'start')).toEqual({ x: 200, y: 140 });
    expect(connectorEndPoint(arrow, 'end')).toEqual({ x: 160, y: 140 });
    engine.undo();
    expect(engine.document.elements[2]).toEqual(original);
  });
  it('keeps the free endpoint in place when an attached block moves across it', () => {
    engine.setTool('arrow');
    pointer('pointerdown', 220, 140); pointer('pointerup', 300, 140);
    const original = engine.document.elements[1];
    const group = engine.stage.findOne<Konva.Group>((node: Konva.Node) => node.id() === original.id)!;
    engine.setTool('select');
    pointer('pointerdown', 160, 140); pointer('pointermove', 300, 140);
    expect(group.visible()).toBe(false);
    pointer('pointermove', 390, 140); pointer('pointerup', 390, 140);
    const arrow = engine.document.elements[1];
    expect(arrow.startBinding?.anchor).toEqual([0, 0.5]);
    expect(connectorEndPoint(arrow, 'start')).toEqual({ x: 330, y: 140 });
    expect(connectorEndPoint(arrow, 'end')).toEqual({ x: 300, y: 140 });
  });
  it('reconnects a selected line by its endpoint and detaches it on open canvas', () => {
    const second = { ...rectangle, id: 'second', x: 350 };
    engine.setDocument({ version: 1, elements: [rectangle, second] });
    engine.setTool('line');
    pointer('pointerdown', 220, 140); pointer('pointerup', 300, 140);
    engine.setTool('select');
    pointer('pointerdown', 260, 140); pointer('pointerup', 260, 140);
    pointer('pointerdown', 300, 140); pointer('pointerup', 347, 140);
    expect(engine.document.elements[2].endBinding).toEqual({ elementId: 'second', anchor: [0, 0.5] });
    pointer('pointerdown', 350, 140); pointer('pointerup', 320, 220);
    const line = engine.document.elements[2];
    expect(line.endBinding).toBeUndefined();
    expect(line.startBinding?.elementId).toBe('rect');
    expect(connectorEndPoint(line, 'end')).toEqual({ x: 320, y: 220 });
  });
  it('lets the middle handle bend a new line while keeping the drawing tool locked', () => {
    engine.setTool('line');
    pointer('pointerdown', 300, 300); pointer('pointerup', 540, 300);
    const straight = engine.document.elements[1];
    const handle = engine.stage.findOne<Konva.Circle>('.connector-bend')!;
    expect(handle.visible()).toBe(true);
    expect(container.dataset['tool']).toBe('line');
    expect(handle.position()).toEqual({ x: 420, y: 300 });

    pointer('pointerdown', 420, 300); pointer('pointermove', 450, 390);
    expect(handle.position()).toEqual({ x: 450, y: 390 });
    expect(engine.document.elements[1]).toBe(straight);
    pointer('pointerup', 450, 390);
    const curved = engine.document.elements[1];
    expect(curved.points).toEqual(straight.points);
    expect(curved.bend).toEqual([150, 90]);
    expect(connectorBendPoint(curved)).toEqual({ x: 450, y: 390 });

    pointer('pointerdown', 540, 300); pointer('pointerup', 560, 340);
    expect(connectorEndPoint(engine.document.elements[1], 'end')).toEqual({ x: 560, y: 340 });
    expect(connectorBendPoint(engine.document.elements[1])).toEqual({ x: 450, y: 390 });
    engine.undo(); engine.undo();
    expect(engine.document.elements[1]).toBe(straight);
    engine.redo();
    expect(engine.document.elements[1]).toBe(curved);
  });
  it('preserves arrow bindings and the bend when a connected block moves', () => {
    const second = { ...rectangle, id: 'second', x: 420 };
    engine.setDocument({ version: 1, elements: [rectangle, second] });
    engine.setTool('arrow');
    pointer('pointerdown', 220, 140); pointer('pointerup', 420, 140);
    pointer('pointerdown', 320, 140); pointer('pointerup', 320, 230);
    const curved = engine.document.elements[2];
    expect(curved.startBinding?.elementId).toBe('rect');
    expect(curved.endBinding?.elementId).toBe('second');
    expect(connectorBendPoint(curved)).toEqual({ x: 320, y: 230 });

    engine.setTool('select');
    pointer('pointerdown', 480, 140); pointer('pointerup', 500, 140);
    expect(connectorBendPoint(engine.document.elements[2])).toEqual({ x: 320, y: 230 });
    expect(connectorEndPoint(engine.document.elements[2], 'end')).toEqual({ x: 440, y: 140 });
  });
  it('finishes a constrained shape at the release position and selects it when unlocked', () => {
    engine.toolLocked = false;
    engine.setTool('rectangle');
    pointer('pointerdown', 300, 300); pointer('pointerup', 365, 330, { shiftKey: true });
    expect(engine.document.elements[1]).toMatchObject({ x: 300, y: 300, width: 65, height: 65 });
    expect(selection).toHaveBeenLastCalledWith([engine.document.elements[1]]);
    pointer('pointerdown', 330, 325); pointer('pointerup', 350, 335);
    expect(engine.document.elements).toHaveLength(2);
    expect(engine.document.elements[1]).toMatchObject({ x: 320, y: 310 });
  });
  it('keeps pan and zoom out of document history', () => {
    engine.setTool('hand');
    pointer('pointerdown', 300, 300); pointer('pointermove', 350, 370); pointer('pointerup', 350, 370);
    expect(engine.viewport).toEqual({ x: 50, y: 70, zoom: 1 });
    engine.zoom(1.5);
    expect(engine.viewport.zoom).toBe(1.5);
    expect(change).not.toHaveBeenCalled();
  });
  it('erases objects as one edit and restores them with undo', () => {
    engine.setTool('eraser');
    pointer('pointerdown', 160, 140); pointer('pointerup', 160, 140);
    expect(engine.document.elements).toEqual([]);
    engine.undo(); expect(engine.document.elements).toEqual([rectangle]);
  });
  it('erases thin objects crossed between pointer events in one undoable sweep', () => {
    const line: WhiteboardElement = { ...rectangle, id: 'line', type: 'line', x: 250, y: 90, width: 0, height: 110, points: [0, 0, 0, 110] };
    engine.setDocument({ version: 1, elements: [rectangle, line] });
    engine.setTool('eraser');
    pointer('pointerdown', 80, 130); pointer('pointerup', 290, 130);
    expect(engine.document.elements).toEqual([]);
    expect(change).toHaveBeenCalledTimes(1);
    engine.undo();
    expect(engine.document.elements).toEqual([rectangle, line]);
  });
  it('shows a temporary screen-space trail while erasing without exporting it', async () => {
    engine.setViewport({ x: 30, y: 40, zoom: 2 });
    const png = engine.exportPng({ pixelRatio: 1 });
    engine.setTool('eraser');
    const trail = engine.stage.findOne<Konva.Line>('.eraser-trail')!;

    pointer('pointermove', 560, 260, { buttons: 0 });
    expect(trail.visible()).toBe(false);
    pointer('pointerdown', 560, 260);
    pointer('pointermove', 640, 260);
    await vi.waitFor(() => expect(trail.visible()).toBe(true), { interval: 8 });
    const point = trail.getAbsoluteTransform().point({ x: trail.points()[0], y: trail.points()[1] });
    expect(point).toEqual({ x: 560, y: 260 });
    expect(trail.listening()).toBe(false);
    expect(engine.exportPng({ pixelRatio: 1 })).toBe(png);

    pointer('pointerup', 640, 260);
    await vi.waitFor(() => expect(trail.visible()).toBe(false));
    expect(change).not.toHaveBeenCalled();
  });
  it('blocks every editing command in readonly mode', () => {
    engine.selectAll(); engine.setReadonly(true);
    engine.clear(); engine.deleteSelection(); engine.duplicateSelection(); engine.applyStyle({ stroke: 'red' });
    expect(engine.beginTextEdit({ point: { x: 10, y: 10 }, type: 'text' })).toBeUndefined();
    engine.setTool('rectangle');
    pointer('pointerdown', 300, 300); pointer('pointermove', 400, 350); pointer('pointerup', 400, 350);
    expect(engine.document.elements).toEqual([rectangle]);
    expect(change).not.toHaveBeenCalled();
  });
  it('exports the entire document independently of zoom and selection controls', () => {
    const original = engine.exportPng({ pixelRatio: 1 });
    engine.setTool('select'); engine.selectAll();
    engine.setViewport({ x: -5000, y: 2300, zoom: 0.2 });
    expect(engine.exportPng({ pixelRatio: 1 })).toBe(original);
    expect(original).toMatch(/^data:image\/png;base64,/);
  });
  it('edits note text without mutating the document supplied by the consumer', () => {
    engine.beginTextEdit({ point: { x: 250, y: 50 }, type: 'note' });
    engine.finishTextEdit('First');
    const note = engine.document.elements[1];
    engine.beginTextEdit({ point: note, type: 'note', element: note });
    engine.finishTextEdit('Second');
    expect(note.text).toBe('First');
    expect(engine.document.elements[1].text).toBe('Second');
    engine.undo(); expect(engine.document.elements[1].text).toBe('First');
  });
  it('applies typography only to text in a mixed selection and restores it with undo', () => {
    const note: WhiteboardElement = { ...rectangle, id: 'note', type: 'note', text: 'First\nSecond\nThird' };
    const text: WhiteboardElement = { ...rectangle, id: 'text', type: 'text', text: 'Example' };
    engine.setDocument({ version: 1, elements: [rectangle, note, text] });
    engine.selectAll();
    const typography = { fontFamily: 'monospace', fontSize: 48, textAlign: 'right' } as const;
    engine.applyTypography(typography);
    expect(engine.document.elements[0]).toEqual(rectangle);
    expect(engine.document.elements[1]).toMatchObject(typography);
    expect(engine.document.elements[1].height).toBeGreaterThan(note.height);
    expect(engine.document.elements[2]).toMatchObject(typography);
    engine.undo();
    expect(engine.document.elements).toEqual([rectangle, note, text]);
  });
  it('previews a note without committing and saves multiline text in one undoable change', () => {
    const note = engine.beginTextEdit({ point: { x: 250, y: 50 }, type: 'note' })!;
    expect(engine.document.elements).toEqual([rectangle]);
    const group = engine.stage.findOne<Konva.Group>((node: Konva.Node) => node.id() === note.id)!;
    expect((group.getChildren()[0] as Konva.Rect).hasStroke()).toBe(false);
    const text = 'First\nSecond\nThird\nFourth\nFifth\nSixth';
    engine.finishTextEdit(text);
    expect(engine.document.elements[1].text).toBe(text);
    expect(engine.document.elements[1].height).toBeGreaterThan(note.height);
    expect(change).toHaveBeenCalledTimes(1);
    engine.undo();
    expect(engine.document.elements).toEqual([rectangle]);
  });
  it('opens the note editor on a completed click and ignores a drag', () => {
    engine.setTool('note');
    pointer('pointerdown', 300, 300);
    expect(editText).not.toHaveBeenCalled();
    pointer('pointerup', 320, 310);
    expect(editText).not.toHaveBeenCalled();
    pointer('pointerdown', 300, 300); pointer('pointerup', 300, 300);
    expect(editText).toHaveBeenCalledOnce();
    expect(editText).toHaveBeenCalledWith({ point: { x: 300, y: 300 }, type: 'note' });
  });
  it('reopens text on double-click and hides its canvas label until editing finishes', () => {
    const point = { x: 300, y: 200 };
    engine.beginTextEdit({ point, type: 'text' });
    engine.finishTextEdit('First');
    const original = engine.document.elements[1];
    pointer('pointerdown', 305, 205); pointer('pointerup', 305, 205);
    pointer('pointerdown', 305, 205); pointer('pointerup', 305, 205);
    expect(editText).toHaveBeenCalledWith({ point, type: 'text', element: original });

    engine.beginTextEdit({ point, type: 'text', element: original });
    const label = engine.stage.findOne<Konva.Group>((node: Konva.Node) => node.id() === original.id)!.findOne('Text')!;
    expect(label.isVisible()).toBe(false);
    engine.finishTextEdit();
    expect(label.isVisible()).toBe(true);
    expect(engine.document.elements[1]).toBe(original);
  });
  it('adds and clears a label inside a newly drawn empty rectangle', () => {
    engine.setTool('rectangle');
    pointer('pointerdown', 280, 180); pointer('pointermove', 480, 280); pointer('pointerup', 480, 280);
    const original = engine.document.elements[1];
    expect(original).toMatchObject({ type: 'rectangle', x: 280, y: 180, width: 200, height: 100 });
    expect(original.text).toBeUndefined();

    engine.setTool('select');
    pointer('pointerdown', 380, 230); pointer('pointerup', 380, 230);
    pointer('pointerdown', 380, 230); pointer('pointerup', 380, 230);
    const request = { point: { x: original.x, y: original.y }, type: 'text', element: original } as const;
    expect(editText).toHaveBeenCalledWith(request);
    expect(engine.beginTextEdit(request)).toBe(original);
    engine.finishTextEdit('Prototype');
    const labeled = engine.document.elements[1];
    expect(labeled).toEqual({ ...original, text: 'Prototype' });

    engine.beginTextEdit({ ...request, element: labeled });
    engine.finishTextEdit('');
    expect(engine.document.elements[1]).toEqual({ ...original, text: '' });
    engine.undo();
    expect(engine.document.elements[1]).toEqual(labeled);
  });
  it('records pen pressure and exports the resulting variable-width stroke', () => {
    engine.pressureSensitive = true;
    engine.setTool('pencil');
    pointer('pointerdown', 300, 300, { pointerType: 'pen', pressure: 0.2 });
    pointer('pointermove', 380, 340, { pointerType: 'pen', pressure: 0.9 });
    pointer('pointerup', 380, 340, { pointerType: 'pen', pressure: 0 });
    const stroke = engine.document.elements[1];
    expect(stroke.pressures?.length).toBe(stroke.points!.length / 2);
    expect(stroke.pressures?.[0]).toBeCloseTo(0.2);
    expect(stroke.pressures?.at(-1)).toBeCloseTo(0.9);
    expect(engine.exportPng()).toMatch(/^data:image\/png;base64,/);
    engine.undo(); expect(engine.document.elements).toEqual([rectangle]);
  });
});
