import Konva from 'konva';
import { v7 as uuid } from 'uuid';
import {
  bindingKey, connectorBendPoint, connectorEndPoint, connectorEnds, connectorPath, findBinding,
  isConnector, isConnectorObscured, resolveBindings, resolveConnector, setConnectorBend, setConnectorEnds,
} from './whiteboard-bindings';
import type { ConnectorEnd } from './whiteboard-bindings';
import { WhiteboardHistory, zoomWhiteboardAt } from './whiteboard-document';
import type {
  WhiteboardDocument, WhiteboardElement, WhiteboardElementType, WhiteboardExportOptions,
  WhiteboardStyle, WhiteboardTool, WhiteboardViewport,
} from './whiteboard.models';

type Point = { x: number; y: number };
type ConnectorHandle = ConnectorEnd | 'bend';
const bindingSnapDistance = 14;
const selectionHandleSize = 9;
const selectionPadding = 5;
const eraserTrailDuration = 160;
const eraserTrailRadius = 5;
const noteTextPadding = 16;
const textLineHeight = 1.4;
const textCaretSpace = 2;
export const whiteboardFontFamily = 'DM Sans, sans-serif';

export type WhiteboardTypography = Pick<WhiteboardStyle, 'fontFamily' | 'fontSize' | 'textAlign'>;

export function hasWhiteboardText(element: WhiteboardElement): boolean {
  return element.type === 'text' || element.type === 'note' ||
    (element.type === 'rectangle' && !!element.text?.trim());
}

function canEditText(element: WhiteboardElement): boolean {
  return element.type === 'rectangle' || hasWhiteboardText(element);
}

function arrowHead(element: WhiteboardElement): { pointerLength: number; pointerWidth: number } {
  const points = element.points;
  const [x, y] = element.bend ?? points ?? [];
  const length = points?.length === 4 && (element.startBinding || element.endBinding)
    ? Math.min(12, Math.hypot(points[2] - x, points[3] - y))
    : 12;
  return { pointerLength: length, pointerWidth: length * 10 / 12 };
}
export interface WhiteboardTextRequest { point: Point; type: 'text' | 'note'; element?: WhiteboardElement; }
interface EngineCallbacks {
  change: (document: WhiteboardDocument, canUndo: boolean, canRedo: boolean) => void;
  selection: (elements: readonly WhiteboardElement[]) => void;
  viewport: (view: WhiteboardViewport) => void;
  editText: (request: WhiteboardTextRequest) => void;
  drawComplete?: () => void;
}

/** Browser-only canvas mechanics, kept separate from Angular controls and portable data. */
export class WhiteboardEngine {
  readonly stage: Konva.Stage;
  private readonly layer = new Konva.Layer();
  private readonly ui = new Konva.Layer();
  private readonly eraserTrail = new Konva.Line<Konva.LineConfig>({
    name: 'eraser-trail', visible: false, listening: false, closed: true, tension: 0.4, opacity: 0.24,
  });
  private readonly eraserTrailAnimation = new Konva.Animation(() => this.drawEraserTrail(), this.ui);
  private readonly transformer: Konva.Transformer;
  private readonly marquee = new Konva.Rect({ visible: false, listening: false, fill: '#245bff18', stroke: '#245bff', strokeWidth: 1 });
  private readonly connectorHandles = {
    start: new Konva.Circle({ name: 'connector-start', visible: false, fill: '#ffffff', stroke: '#245bff' }),
    end: new Konva.Circle({ name: 'connector-end', visible: false, fill: '#ffffff', stroke: '#245bff' }),
    bend: new Konva.Circle({ name: 'connector-bend', visible: false, fill: '#245bff', stroke: '#245bff' }),
  };
  private readonly bindingHints = {
    start: new Konva.Circle({ visible: false, listening: false, stroke: '#245bff', fill: '#245bff22' }),
    end: new Konva.Circle({ visible: false, listening: false, stroke: '#245bff', fill: '#245bff22' }),
  };
  private readonly history: WhiteboardHistory;
  private nodes = new Map<string, Konva.Group>();
  private elements = new Map<string, WhiteboardElement>();
  private connected: readonly WhiteboardElement[] = [];
  private selection = new Set<string>();
  private tool: WhiteboardTool = 'select';
  private readonlyMode = false;
  private space = false;
  private draft?: WhiteboardElement;
  private draftNode?: Konva.Group;
  private textEdit?: { element: WhiteboardElement; existing: boolean };
  private notePreview?: Konva.Group;
  private start?: Point;
  private pan?: { pointer: Point; position: Point };
  private erased = new Set<string>();
  private lastErasePoint?: Point;
  private eraserTrailPoints: { point: Point; time: number }[] = [];
  private move?: { start: Point; origins: Map<string, Point>; started: boolean };
  private connectorEdit?: { element: WhiteboardElement; handle: ConnectorHandle; start: Point; draft?: WhiteboardElement };
  private pointerId?: number;
  private lastMoveEnd = -Infinity;
  toolLocked = true;
  pressureSensitive = false;
  private readonly cancelPointer = (event: PointerEvent) => {
    if (event.type === 'lostpointercapture' && event.target !== this.stage.content) return;
    if (event.pointerId === this.pointerId) this.cancelGesture();
  };
  style: WhiteboardStyle = { stroke: '#245bff', fill: 'transparent', strokeWidth: 2, opacity: 1, lineStyle: 'solid', fontSize: 24 };

  constructor(container: HTMLDivElement, document: WhiteboardDocument, private readonly callbacks: EngineCallbacks) {
    this.history = new WhiteboardHistory({ ...document, elements: resolveBindings(document.elements) });
    this.stage = new Konva.Stage({ container, width: Math.max(container.clientWidth, 1), height: Math.max(container.clientHeight, 1) });
    this.stage.add(this.layer, this.ui);
    // Konva keeps Transformer controls in screen coordinates, independent of stage zoom.
    this.transformer = new Konva.Transformer({
      flipEnabled: false, rotateEnabled: true, rotateLineVisible: false, borderStroke: '#245bff', anchorStroke: '#245bff',
      anchorFill: '#ffffff', anchorSize: selectionHandleSize, anchorCornerRadius: selectionHandleSize / 2, padding: selectionPadding,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      rotateAnchorOffset: 24 + 2 * selectionPadding,
      anchorStyleFunc: anchor => anchor.hitStrokeWidth(10),
      boundBoxFunc: (oldBox, box) =>
        box.width < Math.min(8, oldBox.width) || box.height < Math.min(8, oldBox.height) ? oldBox : box,
    });
    // Draw behind the rotation handle and end at the padded selection border.
    const transformer = this.transformer;
    const rotationStem = new Konva.Shape({
      listening: false, stroke: transformer.borderStroke(), strokeWidth: transformer.borderStrokeWidth(),
      sceneFunc: (context, shape) => {
        if (!transformer.nodes().length) return;
        const [a, b, c, d, x, y] = shape.getAbsoluteTransform().copy().invert()
          .multiply(transformer.getAbsoluteTransform()).getMatrix();
        context.transform(a, b, c, d, x, y);
        const center = transformer.width() / 2;
        const padding = transformer.padding();
        context.beginPath();
        context.moveTo(center, padding - transformer.rotateAnchorOffset());
        context.lineTo(center, -padding);
        context.strokeShape(shape);
      },
    });
    this.ui.add(this.marquee, rotationStem, transformer, ...Object.values(this.bindingHints), ...Object.values(this.connectorHandles), this.eraserTrail);
    // Konva translates native pointercancel into pointerup on hit shapes. Cancel first,
    // including when the pointer is over empty canvas, so interrupted strokes are never saved.
    this.stage.content.addEventListener('pointercancel', this.cancelPointer, true);
    this.stage.content.addEventListener('lostpointercapture', this.cancelPointer);
    this.transformer.on('transform', () => this.refreshConnections());
    this.transformer.on('transformend', () => this.commitTransforms());
    this.stage.on('pointerdown', (e: Konva.KonvaEventObject<PointerEvent>) => this.pointerDown(e));
    this.stage.on('pointermove', (e: Konva.KonvaEventObject<PointerEvent>) => this.pointerMove(e.evt));
    this.stage.on('pointerup', (e: Konva.KonvaEventObject<PointerEvent>) => this.pointerUp(e.evt));
    this.stage.on('wheel', (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const p = this.stage.getPointerPosition();
      if (!p || this.pointerId !== undefined || this.transformer.isTransforming()) return;
      if (e.evt.ctrlKey || e.evt.metaKey) {
        this.setViewport(zoomWhiteboardAt(this.viewport, p, this.viewport.zoom * Math.exp(-e.evt.deltaY * 0.01)));
      } else {
        this.setViewport({ ...this.viewport, x: this.stage.x() - e.evt.deltaX, y: this.stage.y() - e.evt.deltaY });
      }
    });
    this.stage.on('pointerdblclick dblclick dbltap', e => {
      if (this.readonlyMode || this.tool !== 'select' || e.evt.timeStamp - this.lastMoveEnd < Konva.dblClickWindow) return;
      const element = this.elementFromNode(e.target);
      if (element && canEditText(element)) {
        this.callbacks.editText({ point: { x: element.x, y: element.y }, type: element.type === 'note' ? 'note' : 'text', element });
      }
    });
    this.render();
  }

  get document(): WhiteboardDocument { return this.history.current; }
  get viewport(): WhiteboardViewport { return { x: this.stage.x(), y: this.stage.y(), zoom: this.stage.scaleX() }; }

  setDocument(document: WhiteboardDocument): void {
    this.finishTextEdit();
    this.cancelGesture();
    this.history.reset({ ...document, elements: resolveBindings(document.elements) });
    this.selection.clear();
    this.render();
    this.emitSelection();
  }
  resize(width: number, height: number): void { this.stage.size({ width: Math.max(1, width), height: Math.max(1, height) }); }
  redraw(): void { this.layer.draw(); this.ui.draw(); }
  setTool(tool: WhiteboardTool): void {
    if (tool === this.tool) return;
    this.cancelGesture();
    this.tool = tool;
    if (tool !== 'select') this.selection.clear();
    this.updateInteraction();
    this.emitSelection();
  }
  setReadonly(value: boolean): void {
    if (value) this.finishTextEdit();
    this.cancelGesture();
    this.readonlyMode = value;
    this.updateInteraction();
  }
  setSpace(value: boolean): void {
    if (value === this.space) return;
    if (value && !this.pan) this.cancelGesture();
    this.space = value;
    this.updateInteraction();
  }
  setViewport(view: WhiteboardViewport): void {
    if (this.start || this.move || this.connectorEdit) this.cancelGesture();
    const current = this.viewport;
    if (view.x === current.x && view.y === current.y && view.zoom === current.zoom) return;
    this.stage.position({ x: view.x, y: view.y });
    this.stage.scale({ x: view.zoom, y: view.zoom });
    // The trail follows screen coordinates independently of the document viewport.
    this.eraserTrail.setAttrs({
      x: -view.x / view.zoom, y: -view.y / view.zoom, scaleX: 1 / view.zoom, scaleY: 1 / view.zoom,
    });
    this.marquee.strokeWidth(1 / view.zoom);
    this.updateConnectorHandles();
    this.callbacks.viewport(this.viewport);
  }
  zoom(factor: number): void {
    this.setViewport(zoomWhiteboardAt(this.viewport, { x: this.stage.width() / 2, y: this.stage.height() / 2 }, this.viewport.zoom * factor));
  }
  fitToContent(): void {
    if (!this.document.elements.length) { this.setViewport({ x: 0, y: 0, zoom: 1 }); return; }
    const bounds = this.layer.getClientRect({ relativeTo: this.stage });
    const zoom = Math.max(0.1, Math.min(2, (this.stage.width() - 96) / Math.max(bounds.width, 1), (this.stage.height() - 144) / Math.max(bounds.height, 1)));
    this.setViewport({ x: this.stage.width() / 2 - (bounds.x + bounds.width / 2) * zoom, y: this.stage.height() / 2 - (bounds.y + bounds.height / 2) * zoom, zoom });
  }
  undo(): void { if (!this.readonlyMode && this.history.canUndo) { this.cancelGesture(); this.history.undo(); this.changed(); } }
  redo(): void { if (!this.readonlyMode && this.history.canRedo) { this.cancelGesture(); this.history.redo(); this.changed(); } }
  clear(): void { if (!this.readonlyMode && this.document.elements.length) this.commit([]); }
  deleteSelection(): void {
    if (this.selection.size) this.commit(this.document.elements.filter(e => !this.selection.has(e.id)));
  }
  duplicateSelection(): void {
    if (this.readonlyMode || !this.selection.size) return;
    const originals = this.document.elements.filter(e => this.selection.has(e.id));
    const ids = new Map(originals.map(element => [element.id, uuid()]));
    const copies = originals.map(element => {
      const copy = { ...element, id: ids.get(element.id)!, x: element.x + 24, y: element.y + 24 };
      for (const end of connectorEnds) {
        const key = bindingKey[end], binding = copy[key];
        if (!binding) continue;
        const elementId = ids.get(binding.elementId);
        copy[key] = elementId ? { ...binding, elementId } : undefined;
      }
      return copy;
    });
    this.selection = new Set(copies.map(e => e.id));
    this.commit([...this.document.elements, ...copies]);
  }
  selectAll(): void { this.selection = new Set(this.document.elements.map(e => e.id)); this.updateInteraction(); this.emitSelection(); }
  deselect(): void { this.cancelGesture(); this.selection.clear(); this.updateInteraction(); this.emitSelection(); }
  nudgeSelection(x: number, y: number): boolean {
    if (this.readonlyMode || this.tool !== 'select' || !this.selection.size || this.pointerId !== undefined || this.transformer.isTransforming()) return false;
    this.commit(this.document.elements.map(element => this.selection.has(element.id)
      ? { ...element, x: element.x + x, y: element.y + y }
      : element));
    return true;
  }
  applyStyle(style: Partial<WhiteboardStyle>): void {
    this.style = { ...this.style, ...style };
    if (this.selection.size) this.commit(this.document.elements.map(e => this.selection.has(e.id) ? { ...e, ...style } : e));
  }
  applyTypography(style: Partial<WhiteboardTypography>): WhiteboardElement | undefined {
    if (this.readonlyMode) return undefined;
    this.style = { ...this.style, ...style };
    if (this.textEdit) {
      this.textEdit.element = { ...this.textEdit.element, ...style };
      return this.textEdit.element;
    }
    if (this.document.elements.some(e => this.selection.has(e.id) && hasWhiteboardText(e))) {
      this.commit(this.document.elements.map(e => this.selection.has(e.id) && hasWhiteboardText(e)
        ? this.withText({ ...e, ...style }, e.text ?? '')
        : e));
    }
    return undefined;
  }
  beginTextEdit(request: WhiteboardTextRequest): WhiteboardElement | undefined {
    if (this.readonlyMode || this.textEdit) return undefined;
    const element = request.element
      ? this.elements.get(request.element.id)
      : request.type === 'note' ? this.createNote(request.point) : this.createElement('text', request.point);
    if (!element || !canEditText(element)) return undefined;
    this.textEdit = { element, existing: !!request.element };
    this.renderTextEdit();
    this.updateInteraction();
    return element;
  }
  finishTextEdit(text?: string): void {
    const edit = this.textEdit;
    if (!edit) return;
    this.textEdit = undefined;
    this.notePreview?.destroy();
    this.notePreview = undefined;
    const { element, existing } = edit;
    this.nodes.get(element.id)?.findOne('Text')?.show();
    this.updateInteraction();
    if (text === undefined || this.readonlyMode || (!text.trim() && (!existing || element.type === 'text'))) return;
    if (element.type === 'rectangle' && !text.trim()) text = '';

    if (existing) {
      const current = this.elements.get(element.id);
      if (current && (current !== element || (current.text ?? '') !== text)) {
        this.commit(this.document.elements.map(e => e.id === current.id ? this.withText(element, text) : e));
      }
    } else {
      this.completeDrawing(this.withText(element, text));
    }
  }
  textEditorLayout(element: WhiteboardElement, text: string) {
    const { width, height, fontSize, type } = element;
    if (type === 'note') return { width, height, padding: noteTextPadding, paddingTop: noteTextPadding, lineHeight: textLineHeight };
    if (type === 'rectangle') {
      const label = this.createTextLabel({ ...element, text });
      const paddingTop = Math.max(0, (height - label.height()) / 2);
      label.destroy();
      return { width, height: Math.max(height, fontSize), padding: 0, paddingTop, lineHeight: 1 };
    }
    const layout = this.withText(element, text);
    return { width: layout.width, height: Math.max(layout.height, fontSize * textLineHeight), padding: 0, paddingTop: 0, lineHeight: textLineHeight };
  }

  exportPng(options: WhiteboardExportOptions = {}): string {
    // An independent stage exports world-space content without selection handles or viewport clipping.
    const container = this.stage.container().ownerDocument.createElement('div');
    const stage = new Konva.Stage({ container, width: 1, height: 1 });
    try {
      const layer = new Konva.Layer();
      stage.add(layer);
      for (const e of this.document.elements) layer.add(this.createNode(e));
      const bounds = this.document.elements.length ? layer.getClientRect() : { x: 0, y: 0, width: 800, height: 600 };
      const padding = Math.max(0, options.padding ?? 32);
      const x = bounds.x - padding, y = bounds.y - padding;
      const width = Math.max(1, bounds.width + padding * 2), height = Math.max(1, bounds.height + padding * 2);
      const background = new Konva.Rect({ x, y, width, height, fill: options.backgroundColor ?? '#ffffff', listening: false });
      layer.add(background);
      background.moveToBottom();
      const pixelRatio = Math.min(Math.max(0.1, options.pixelRatio ?? 2), 4,
        16384 / width, 16384 / height, Math.sqrt(16777216 / (width * height)));
      return stage.toDataURL({ x, y, width, height, pixelRatio });
    } finally { stage.destroy(); }
  }
  destroy(): void {
    this.eraserTrailAnimation.stop();
    this.releasePointer();
    this.stage.content.removeEventListener('pointercancel', this.cancelPointer, true);
    this.stage.content.removeEventListener('lostpointercapture', this.cancelPointer);
    this.stage.destroy();
  }

  private createElement(type: WhiteboardElementType, point: Point): WhiteboardElement {
    const { fontFamily, textAlign, ...style } = this.style;
    return { id: uuid(), type, ...point, width: 0, height: 0, ...style,
      ...(type === 'text' || type === 'note' ? { fontFamily, textAlign } : {}) };
  }
  private createNote(point: Point): WhiteboardElement {
    const note = this.createElement('note', point);
    return { ...note, width: 220, height: 180, fill: note.fill === 'transparent' ? '#fff1b8' : note.fill };
  }
  private createNoteText(note: WhiteboardElement): Konva.Text {
    return new Konva.Text({
      x: noteTextPadding, y: noteTextPadding, width: Math.max(1, note.width - 2 * noteTextPadding),
      text: note.text ?? '', fontSize: note.fontSize, fontFamily: note.fontFamily ?? whiteboardFontFamily,
      align: note.textAlign ?? 'left', fill: note.stroke, lineHeight: textLineHeight, wrap: 'word',
    });
  }
  private createTextLabel(element: WhiteboardElement): Konva.Text {
    const rectangle = element.type === 'rectangle';
    return new Konva.Text({
      width: element.width || undefined, text: element.text ?? '', fontSize: element.fontSize,
      fontFamily: element.fontFamily ?? whiteboardFontFamily, align: element.textAlign ?? (rectangle ? 'center' : 'left'),
      fill: element.stroke, lineHeight: rectangle ? 1 : textLineHeight,
    });
  }
  private withText(element: WhiteboardElement, text: string): WhiteboardElement {
    const updated = { ...element, text };
    if (updated.type === 'note') {
      const label = this.createNoteText(updated);
      updated.height = Math.max(updated.height, label.height() + 2 * noteTextPadding);
      label.destroy();
    } else if (updated.type === 'text') {
      const label = this.createTextLabel({ ...updated, width: 0 });
      // The native editor needs space for its caret after the last glyph.
      updated.width = Math.max(updated.width, 80, Math.min(480, Math.ceil(label.width() + textCaretSpace)));
      label.width(updated.width);
      updated.height = label.height();
      label.destroy();
    }
    return updated;
  }
  private createNode(e: WhiteboardElement): Konva.Group {
    const group = new Konva.Group({
      id: e.id, x: e.x, y: e.y, rotation: e.rotation ?? 0, scaleX: e.scaleX ?? 1, scaleY: e.scaleY ?? 1,
      opacity: e.opacity, visible: !isConnectorObscured(e, id => this.elements.get(id)),
    });
    const attrs = { stroke: e.stroke, strokeWidth: e.strokeWidth, fill: e.fill,
      dash: e.lineStyle === 'dashed' ? [e.strokeWidth * 5, e.strokeWidth * 3] : e.lineStyle === 'dotted' ? [e.strokeWidth, e.strokeWidth * 3] : [],
      lineCap: 'round' as const, lineJoin: 'round' as const, hitStrokeWidth: Math.max(12, e.strokeWidth) };
    switch (e.type) {
      case 'rectangle':
        group.add(new Konva.Rect({ ...attrs, width: e.width, height: e.height, cornerRadius: 8 }));
        if (e.text) group.add(this.createTextLabel(e).height(e.height).verticalAlign('middle'));
        break;
      case 'diamond': group.add(new Konva.Line({ ...attrs, points: [e.width / 2, 0, e.width, e.height / 2, e.width / 2, e.height, 0, e.height / 2], closed: true })); break;
      case 'ellipse': group.add(new Konva.Ellipse({ ...attrs, x: e.width / 2, y: e.height / 2, radiusX: e.width / 2, radiusY: e.height / 2 })); break;
      case 'arrow': group.add(new Konva.Arrow({ ...attrs, ...arrowHead(e), ...connectorPath(e), fill: e.fill === 'transparent' ? e.stroke : e.fill })); break;
      case 'line': group.add(new Konva.Line({ ...attrs, fill: undefined, ...connectorPath(e) })); break;
      case 'pencil':
        if (e.pressures) group.add(this.pressureStroke(e));
        else group.add(new Konva.Line({ ...attrs, fill: undefined, points: [...e.points ?? []], tension: 0.3 }));
        break;
      case 'note':
        group.add(new Konva.Rect({ fill: e.fill, width: e.width, height: e.height, cornerRadius: 4 }));
        group.add(this.createNoteText(e).height(Math.max(0, e.height - 2 * noteTextPadding)));
        break;
      case 'text': group.add(this.createTextLabel(e)); break;
    }
    return group;
  }
  private pressureStroke(element: WhiteboardElement): Konva.Shape {
    const points = element.points!, pressures = element.pressures!;
    let x = Infinity, y = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
      x = Math.min(x, points[i]); y = Math.min(y, points[i + 1]);
      maxX = Math.max(maxX, points[i]); maxY = Math.max(maxY, points[i + 1]);
    }
    return new Konva.Shape({
      x, y, width: maxX - x, height: maxY - y,
      stroke: element.stroke, strokeWidth: element.strokeWidth, hitStrokeWidth: Math.max(12, element.strokeWidth),
      sceneFunc: context => {
        context.setAttr('strokeStyle', element.stroke);
        context.setAttr('lineCap', 'round');
        for (let i = 2; i < points.length; i += 2) {
          context.beginPath();
          context.moveTo(points[i - 2] - x, points[i - 1] - y);
          context.lineTo(points[i] - x, points[i + 1] - y);
          context.setAttr('lineWidth', element.strokeWidth * (0.2 + 0.8 * (pressures[i / 2 - 1] + pressures[i / 2]) / 2));
          context.stroke();
        }
      },
      hitFunc: (context, shape) => {
        context.beginPath(); context.moveTo(points[0] - x, points[1] - y);
        for (let i = 2; i < points.length; i += 2) context.lineTo(points[i] - x, points[i + 1] - y);
        context.strokeShape(shape);
      },
    });
  }
  private render(): void {
    this.transformer.nodes([]);
    this.layer.destroyChildren();
    this.notePreview = undefined;
    this.nodes.clear();
    this.elements = new Map(this.document.elements.map(element => [element.id, element]));
    this.connected = this.document.elements.filter(element => element.startBinding || element.endBinding);
    for (const element of this.document.elements) {
      const node = this.createNode(element);
      this.nodes.set(element.id, node);
      this.layer.add(node);
    }
    this.selection = new Set([...this.selection].filter(id => this.nodes.has(id)));
    this.renderTextEdit();
    this.updateInteraction();
  }
  private renderTextEdit(): void {
    if (!this.textEdit) return;
    const { element, existing } = this.textEdit;
    if (existing) this.nodes.get(element.id)?.findOne('Text')?.hide();
    else if (element.type === 'note') {
      this.notePreview = this.createNode(element);
      this.layer.add(this.notePreview);
    }
  }
  private updateInteraction(): void {
    const showTransformer = this.canEditCanvas() && this.tool !== 'hand' && this.tool !== 'eraser' && !this.selectedConnector();
    this.transformer.nodes(showTransformer ? [...this.selection].flatMap(id => this.nodes.get(id) ?? []) : []);
    this.updateConnectorHandles();
    this.stage.container().dataset['tool'] = this.pan || this.space || this.readonlyMode ? 'hand' : this.tool;
  }
  private canEditCanvas(): boolean {
    return !this.space && !this.pan && !this.readonlyMode && !this.textEdit;
  }
  private selectedConnector(): WhiteboardElement | undefined {
    if (!this.canEditCanvas() || this.selection.size !== 1 ||
        (this.tool !== 'select' && this.tool !== 'line' && this.tool !== 'arrow')) return undefined;
    const element = this.elements.get(this.selection.values().next().value!);
    return element && isConnector(element) && element.points?.length === 4 ? element : undefined;
  }
  private updateConnectorHandles(): void {
    const element = this.connectorEdit?.draft ?? this.selectedConnector();
    const group = element && this.nodes.get(element.id);
    const line = group?.getChildren()[0];
    if (!element || !group || !(line instanceof Konva.Line)) {
      for (const handle of Object.values(this.connectorHandles)) handle.hide();
      return;
    }
    const points = line.points(), end = points.length - 2;
    const [x, y] = element.bend ?? [(points[0] + points[end]) / 2, (points[1] + points[end + 1]) / 2];
    const positions = { start: { x: points[0], y: points[1] }, end: { x: points[end], y: points[end + 1] }, bend: { x, y } };
    const zoom = this.viewport.zoom;
    this.connectorHandles.bend.fill(element.bend ? '#ffffff' : '#245bff');
    for (const handle of [...connectorEnds, 'bend'] as const) {
      const point = group.getTransform().point(positions[handle]);
      this.connectorHandles[handle].setAttrs({
        ...point, radius: selectionHandleSize / (2 * zoom), strokeWidth: 1 / zoom, hitStrokeWidth: 10 / zoom, visible: true,
      });
    }
  }
  private showBindingHint(end: ConnectorEnd, point?: Point): void {
    const hint = this.bindingHints[end];
    if (!point) { hint.hide(); return; }
    const zoom = this.viewport.zoom;
    hint.setAttrs({ ...point, radius: 9 / zoom, strokeWidth: 1.5 / zoom, visible: true });
  }
  private liveTransform(element: WhiteboardElement): WhiteboardElement {
    const node = this.nodes.get(element.id);
    return node ? { ...element, ...node.position(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY() } : element;
  }
  private readonly liveElement = (id: string): WhiteboardElement | undefined => {
    const element = this.elements.get(id);
    return element && this.liveTransform(element);
  };
  private updateConnectorPath(element: WhiteboardElement): void {
    const group = this.nodes.get(element.id);
    const line = group?.getChildren()[0];
    if (!group || !(line instanceof Konva.Line) || !element.points) return;
    group.visible(!isConnectorObscured(element, this.liveElement));
    const path = connectorPath(element);
    if (line instanceof Konva.Arrow) line.setAttrs({ ...arrowHead(element), ...path });
    else line.setAttrs(path);
  }
  private refreshConnections(): void {
    for (const element of this.connected) {
      this.updateConnectorPath(resolveConnector(this.liveTransform(element), this.liveElement));
    }
    this.updateConnectorHandles();
  }
  private elementFromNode(node: Konva.Node): WhiteboardElement | undefined {
    let current: Konva.Node | null = node;
    while (current && current !== this.stage) {
      const element = this.elements.get(current.id());
      if (element) return element;
      current = current.getParent();
    }
    return undefined;
  }
  private capturePointer(e: PointerEvent): void {
    this.pointerId = e.pointerId;
    if (e.isTrusted) this.stage.content.setPointerCapture(e.pointerId);
  }
  private releasePointer(): void {
    const pointerId = this.pointerId;
    this.pointerId = undefined;
    if (pointerId !== undefined && this.stage.content.hasPointerCapture(pointerId)) this.stage.content.releasePointerCapture(pointerId);
  }
  private pointerDown(event: Konva.KonvaEventObject<PointerEvent>): void {
    const e = event.evt;
    if ((e.button !== 0 && e.button !== 1) || this.pointerId !== undefined || this.transformer.isTransforming()) return;
    if (this.textEdit) {
      // Let the inline editor finish on blur before starting another canvas gesture.
      this.stage.container().focus({ preventScroll: true });
      return;
    }
    const screen = this.stage.getPointerPosition(), point = this.stage.getRelativePointerPosition();
    if (!screen || !point) return;
    this.stage.container().focus({ preventScroll: true });
    if (this.tool === 'hand' || this.space || e.button === 1 || this.readonlyMode) {
      e.preventDefault();
      this.pan = { pointer: screen, position: this.stage.position() };
      this.capturePointer(e);
      this.updateInteraction();
      return;
    }
    if (event.target.getParent() === this.transformer) return;
    const connector = this.selectedConnector();
    const handle = (['start', 'end', 'bend'] as const).find(key => event.target === this.connectorHandles[key]);
    if (connector && handle) {
      this.connectorEdit = { element: connector, handle, start: point };
      this.capturePointer(e);
      return;
    }
    if (this.tool === 'select') {
      const element = this.elementFromNode(event.target);
      if (element) {
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
          if (this.selection.has(element.id)) this.selection.delete(element.id); else this.selection.add(element.id);
        } else if (!this.selection.has(element.id)) this.selection = new Set([element.id]);
        this.updateInteraction(); this.emitSelection();
        if (this.selection.has(element.id)) {
          this.move = {
            start: point,
            origins: new Map([...this.selection].map(id => [id, this.nodes.get(id)!.position()])),
            started: false,
          };
          this.capturePointer(e);
        }
        return;
      }
      if (!e.shiftKey) this.selection.clear();
      this.start = point;
      this.marquee.setAttrs({ x: point.x, y: point.y, width: 0, height: 0, visible: true });
      this.updateInteraction(); this.emitSelection(); this.capturePointer(e);
      return;
    }
    if (this.selection.size) {
      this.selection.clear();
      this.updateInteraction();
      this.emitSelection();
    }
    this.start = point;
    this.capturePointer(e);
    if (this.tool === 'text' || this.tool === 'note') return;
    if (this.tool === 'eraser') {
      this.clearEraserTrail();
      this.eraserTrail.fill(getComputedStyle(this.stage.container()).color);
      this.eraseTo(screen);
      return;
    }
    this.draft = this.createElement(this.tool, point);
    if (['pencil', 'line', 'arrow'].includes(this.tool)) this.draft.points = [0, 0, 0.01, 0.01];
    if (this.tool === 'pencil' && this.pressureSensitive && e.pointerType === 'pen') this.draft.pressures = [e.pressure, e.pressure];
    this.draftNode = this.createNode(this.draft);
    this.layer.add(this.draftNode);
  }
  private pointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;
    const screen = this.stage.getPointerPosition(), point = this.stage.getRelativePointerPosition();
    if (!screen || !point) return;
    if (this.pan) {
      this.setViewport({ ...this.viewport, x: this.pan.position.x + screen.x - this.pan.pointer.x, y: this.pan.position.y + screen.y - this.pan.pointer.y });
      return;
    }
    if (this.connectorEdit) { this.moveConnectorHandle(point, event); return; }
    if (this.move) {
      const { start, origins } = this.move;
      const x = point.x - start.x, y = point.y - start.y;
      if (!this.move.started && Math.hypot(x, y) * this.viewport.zoom < 3) return;
      this.move.started = true;
      for (const [id, origin] of origins) this.nodes.get(id)?.position({ x: origin.x + x, y: origin.y + y });
      this.refreshConnections();
      return;
    }
    if (!this.start) return;
    if (this.tool === 'eraser') { this.eraseTo(screen); return; }
    const width = Math.abs(point.x - this.start.x), height = Math.abs(point.y - this.start.y);
    if (this.tool === 'select') {
      this.marquee.setAttrs({ x: Math.min(point.x, this.start.x), y: Math.min(point.y, this.start.y), width, height });
      return;
    }
    if (!this.draft) return;
    if (this.tool === 'pencil') {
      const points = this.draft.points!;
      const x = point.x - this.start.x, y = point.y - this.start.y;
      if (Math.hypot(x - points[points.length - 2], y - points[points.length - 1]) < 1 / this.viewport.zoom) return;
      this.draft.points = [...points, x, y];
      if (this.draft.pressures) {
        const pressure = event.type === 'pointerup' ? this.draft.pressures.at(-1)! : event.pressure;
        this.draft.pressures = [...this.draft.pressures, Math.max(0, Math.min(1, pressure))];
      }
    } else if (this.tool === 'line' || this.tool === 'arrow') {
      let x = point.x - this.start.x, y = point.y - this.start.y;
      if (event.shiftKey) {
        const step = Math.PI / 12;
        const angle = Math.round(Math.atan2(y, x) / step) * step;
        const length = Math.hypot(x, y);
        x = Math.cos(angle) * length;
        y = Math.sin(angle) * length;
      }
      const end = { x: this.start.x + x, y: this.start.y + y };
      const bind = !event.ctrlKey && !event.metaKey;
      const tolerance = bindingSnapDistance / this.viewport.zoom;
      const startSnap = bind ? findBinding(this.document.elements, this.start, end, tolerance) : undefined;
      const endSnap = bind ? findBinding(this.document.elements, end, startSnap?.point ?? this.start, tolerance, startSnap?.binding.elementId) : undefined;
      this.draft = resolveConnector(setConnectorEnds({
        ...this.draft, points: [0, 0, x, y], width: Math.abs(x), height: Math.abs(y),
        startBinding: startSnap?.binding, endBinding: endSnap?.binding,
      }, startSnap?.point, endSnap?.point), this.liveElement);
      this.showBindingHint('start', this.draft.startBinding ? connectorEndPoint(this.draft, 'start') : undefined);
      this.showBindingHint('end', this.draft.endBinding ? connectorEndPoint(this.draft, 'end') : undefined);
    } else {
      const size = Math.max(width, height);
      this.draft.width = event.shiftKey ? size : width;
      this.draft.height = event.shiftKey ? size : height;
      this.draft.x = point.x < this.start.x ? this.start.x - this.draft.width : this.start.x;
      this.draft.y = point.y < this.start.y ? this.start.y - this.draft.height : this.start.y;
    }
    if (this.tool === 'pencil') {
      this.draft.width = width;
      this.draft.height = height;
    }
    this.draftNode?.destroy();
    this.draftNode = this.createNode(this.draft);
    this.layer.add(this.draftNode);
  }
  private moveConnectorHandle(point: Point, event: PointerEvent): void {
    const edit = this.connectorEdit!;
    const { element, handle, start } = edit;
    const x = point.x - start.x, y = point.y - start.y;
    const zoom = this.viewport.zoom;
    if (!edit.draft && Math.hypot(x, y) * zoom < 3) return;
    const original = handle === 'bend' ? connectorBendPoint(element) : connectorEndPoint(element, handle);
    const destination = { x: original.x + x, y: original.y + y };
    if (handle === 'bend') {
      const midpoint = connectorBendPoint({ ...element, bend: undefined });
      const straight = Math.hypot(destination.x - midpoint.x, destination.y - midpoint.y) * zoom < 3;
      const bent = setConnectorBend(element, straight ? undefined : destination);
      edit.draft = bent === element ? element : resolveConnector(bent, this.liveElement);
      this.updateConnectorPath(edit.draft);
      this.updateConnectorHandles();
      return;
    }
    const end = handle;
    const opposite = end === 'start' ? 'end' : 'start';
    const other = element.bend ? connectorBendPoint(element) : connectorEndPoint(element, opposite);
    const snap = event.ctrlKey || event.metaKey ? undefined :
      findBinding(this.document.elements, destination, other, bindingSnapDistance / zoom, element[bindingKey[opposite]]?.elementId);
    const target = snap?.point ?? destination;
    edit.draft = resolveConnector(setConnectorEnds({ ...element, [bindingKey[end]]: snap?.binding },
      end === 'start' ? target : undefined, end === 'end' ? target : undefined), this.liveElement);
    this.updateConnectorPath(edit.draft);
    this.updateConnectorHandles();
    this.showBindingHint(end, edit.draft[bindingKey[end]] ? connectorEndPoint(edit.draft, end) : undefined);
  }
  private pointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;
    this.pointerMove(event);
    this.releasePointer();
    for (const end of connectorEnds) this.showBindingHint(end);
    if (this.pan) { this.pan = undefined; this.updateInteraction(); return; }
    if (this.connectorEdit) {
      const { draft, element } = this.connectorEdit;
      this.connectorEdit = undefined;
      if (draft && draft !== element) this.commit(this.document.elements.map(element => element.id === draft.id ? draft : element));
      return;
    }
    if (this.move) {
      const { started } = this.move;
      this.move = undefined;
      if (started) {
        this.lastMoveEnd = event.timeStamp;
        this.commitTransforms();
      }
      return;
    }
    if (!this.start) return;
    if (this.tool === 'select') {
      const bounds = this.marquee.getClientRect({ skipStroke: true });
      if (bounds.width > 3 && bounds.height > 3) {
        for (const [id, node] of this.nodes) {
          const rect = node.getClientRect({ skipStroke: true });
          if (rect.x >= bounds.x && rect.y >= bounds.y &&
              rect.x + rect.width <= bounds.x + bounds.width && rect.y + rect.height <= bounds.y + bounds.height) {
            this.selection.add(id);
          }
        }
      }
      this.marquee.hide(); this.start = undefined; this.updateInteraction(); this.emitSelection(); return;
    }
    const start = this.start;
    this.start = undefined;
    if (this.tool === 'text' || this.tool === 'note') {
      const point = this.stage.getRelativePointerPosition();
      if (point && Math.hypot(point.x - start.x, point.y - start.y) * this.viewport.zoom < 3) {
        this.callbacks.editText({ point: start, type: this.tool });
      }
      return;
    }
    if (this.tool === 'eraser') {
      if (this.erased.size) this.commit(this.document.elements.filter(e => !this.erased.has(e.id)));
      this.erased.clear(); this.lastErasePoint = undefined; return;
    }
    const draft = this.draft;
    this.draft = undefined; this.draftNode?.destroy(); this.draftNode = undefined;
    if (draft) {
      const { width, height, type } = draft;
      const minSize = 3 / this.viewport.zoom;
      const end = this.stage.getRelativePointerPosition();
      const largeEnough = isConnector(draft)
        ? !!end && Math.hypot(end.x - start.x, end.y - start.y) >= minSize && Math.hypot(width, height) >= minSize
        : Math.min(width, height) >= minSize;
      if (type === 'pencil' || largeEnough) this.completeDrawing(draft);
    }
  }
  private completeDrawing(element: WhiteboardElement): void {
    const returnToSelection = !this.toolLocked && element.type !== 'pencil';
    if (returnToSelection) this.tool = 'select';
    this.selection = new Set([element.id]);
    this.commit([...this.document.elements, element]);
    if (returnToSelection) this.callbacks.drawComplete?.();
  }
  private eraseTo(point: Point): void {
    const previous = this.eraserTrailPoints.at(-1)?.point;
    if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) >= 1) {
      this.eraserTrailPoints.push({ point, time: performance.now() });
      if (this.eraserTrailPoints.length > 1 && !this.eraserTrailAnimation.isRunning()) this.eraserTrailAnimation.start();
    }
    const start = this.lastErasePoint ?? point;
    this.lastErasePoint = point;
    const x = point.x - start.x, y = point.y - start.y;
    const steps = Math.max(1, Math.ceil(Math.hypot(x, y) / 2));
    for (let i = 1; i <= steps; i++) {
      const hit = this.layer.getIntersection({ x: start.x + x * i / steps, y: start.y + y * i / steps });
      const element = hit && this.elementFromNode(hit);
      if (!element || this.erased.has(element.id)) continue;
      this.erased.add(element.id);
      this.nodes.get(element.id)?.opacity(0.15);
    }
  }
  private drawEraserTrail(): void {
    const now = performance.now();
    while (this.eraserTrailPoints.length && now - this.eraserTrailPoints[0].time >= eraserTrailDuration) {
      this.eraserTrailPoints.shift();
    }
    if (this.eraserTrailPoints.length < 2) {
      this.eraserTrail.hide();
      if (!this.eraserTrailPoints.length) this.eraserTrailAnimation.stop();
      return;
    }

    // Build both sides of a smooth ribbon. Older segments narrow as they expire.
    const first = this.eraserTrailPoints[0].point;
    const last = this.eraserTrailPoints.at(-1)!.point;
    const outline = [first.x, first.y];
    const farSide: Point[] = [];
    for (let i = 1; i < this.eraserTrailPoints.length; i++) {
      const { point: a, time: start } = this.eraserTrailPoints[i - 1];
      const { point: b, time: end } = this.eraserTrailPoints[i];
      const radius = eraserTrailRadius * (1 - (now - (start + end) / 2) / eraserTrailDuration);
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const dx = (b.y - a.y) / length * radius, dy = (b.x - a.x) / length * radius;
      const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
      outline.push(x - dx, y + dy);
      farSide.push({ x: x + dx, y: y - dy });
    }
    outline.push(last.x, last.y);
    for (const { x, y } of farSide.reverse()) outline.push(x, y);
    this.eraserTrail.points(outline).show();
  }
  private clearEraserTrail(): void {
    this.eraserTrailAnimation.stop();
    this.eraserTrailPoints = [];
    this.eraserTrail.hide();
  }
  private cancelGesture(): void {
    this.clearEraserTrail();
    this.releasePointer(); this.pan = undefined; this.start = undefined;
    if (this.move) {
      for (const [id, origin] of this.move.origins) this.nodes.get(id)?.position(origin);
      this.move = undefined;
      this.refreshConnections();
    }
    if (this.connectorEdit) {
      this.updateConnectorPath(this.connectorEdit.element);
      this.connectorEdit = undefined;
    }
    for (const end of connectorEnds) this.showBindingHint(end);
    this.draft = undefined; this.draftNode?.destroy(); this.draftNode = undefined; this.marquee.hide();
    this.lastErasePoint = undefined;
    if (this.erased.size) {
      this.erased.clear();
      for (const e of this.document.elements) this.nodes.get(e.id)?.opacity(e.opacity);
    }
    this.updateInteraction();
  }
  private commitTransforms(): void {
    let changed = false;
    const elements = this.document.elements.map(element => {
      const node = this.selection.has(element.id) ? this.nodes.get(element.id) : undefined;
      if (!node) return element;
      const { x, y } = node.position();
      const rotation = node.rotation(), scaleX = node.scaleX(), scaleY = node.scaleY();
      if (x === element.x && y === element.y && rotation === (element.rotation ?? 0) &&
          scaleX === (element.scaleX ?? 1) && scaleY === (element.scaleY ?? 1)) return element;
      changed = true;
      return { ...element, x, y, rotation, scaleX, scaleY };
    });
    if (changed) this.commit(elements);
  }
  private commit(elements: readonly WhiteboardElement[]): void {
    if (this.readonlyMode) return;
    this.history.commit(resolveBindings(elements));
    this.changed();
  }
  private changed(): void {
    this.render(); this.emitSelection();
    this.callbacks.change(this.document, this.history.canUndo, this.history.canRedo);
  }
  private emitSelection(): void { this.callbacks.selection(this.document.elements.filter(e => this.selection.has(e.id))); }
}
