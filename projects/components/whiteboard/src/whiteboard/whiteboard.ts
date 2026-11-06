import {
  afterEveryRender, afterRenderEffect, booleanAttribute, ChangeDetectionStrategy, Component, computed, DestroyRef,
  effect, ElementRef, inject, input, model, NgZone, output, signal, viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '@ngstarter-ui/components/alert';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from '@ngstarter-ui/components/button';
import { ButtonToggle, ButtonToggleGroup } from '@ngstarter-ui/components/button-toggle';
import { Card, CardAside, CardContent, CardHeader } from '@ngstarter-ui/components/card';
import { ColorPicker, ColorPickerThumbnail, ColorPickerTriggerForDirective } from '@ngstarter-ui/components/color-picker';
import { ColorSwitcher } from '@ngstarter-ui/components/color-switcher';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { Divider } from '@ngstarter-ui/components/divider';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Menu, MenuDivider, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Segmented, SegmentedButton, SegmentedIconDirective } from '@ngstarter-ui/components/segmented';
import { Slider, SliderThumb } from '@ngstarter-ui/components/slider';
import { Toolbar } from '@ngstarter-ui/components/toolbar';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { hasWhiteboardText, whiteboardFontFamily, WhiteboardEngine, WhiteboardTextRequest, WhiteboardTypography } from '../whiteboard-engine';
import { parseWhiteboardDocument } from '../whiteboard-document';
import { WHITEBOARD_LABELS } from '../whiteboard-labels';
import type { WhiteboardDocument, WhiteboardElement, WhiteboardExportOptions, WhiteboardLocale, WhiteboardStyle, WhiteboardTool, WhiteboardViewport } from '../whiteboard.models';

@Component({
  selector: 'ngs-whiteboard',
  exportAs: 'ngsWhiteboard',
  imports: [FormsModule, Alert, Button, ButtonToggle, ButtonToggleGroup, Card, CardAside, CardContent, CardHeader,
    ColorPicker, ColorPickerThumbnail, ColorPickerTriggerForDirective, ColorSwitcher, Divider,
    Icon, Input, Menu, MenuDivider,
    MenuItem, MenuTrigger, ScrollbarArea, Segmented, SegmentedButton, SegmentedIconDirective, Slider, SliderThumb, Toolbar, Tooltip],
  templateUrl: './whiteboard.html',
  styleUrl: './whiteboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-whiteboard @container/whiteboard',
    '[class.ngs-whiteboard-grid]': 'showGrid()',
    '[class.ngs-whiteboard-readonly]': 'readOnly()',
    '(keydown)': 'onKeydown($event)',
    '(window:keyup)': 'onKeyup($event)',
    '(window:blur)': 'releasePan()',
  },
})
export class Whiteboard {
  /** Portable canvas data. Replace this value to load a document and reset undo history. */
  readonly value = model<WhiteboardDocument>({ version: 1, elements: [] });
  readonly tool = model<WhiteboardTool>('pencil');
  readonly title = input('Whiteboard');
  readonly subtitle = input('');
  readonly locale = input<WhiteboardLocale>('en');
  readonly toolLocked = model(true);
  readonly pressureSensitive = model(false);
  readonly drawingStyle = model<WhiteboardStyle>({ stroke: '#245bff', fill: 'transparent', strokeWidth: 2, opacity: 1, lineStyle: 'solid', fontSize: 24 });
  readonly readOnly = input(false, { alias: 'readonly', transform: booleanAttribute });
  readonly showToolbar = input(true, { transform: booleanAttribute });
  readonly showGrid = model(true);
  readonly showProperties = model(true);
  readonly colors = input<string[]>(['#12203b', '#e7333f', '#29a34a', '#245bff', '#e9aa16']);
  readonly selectionChange = output<readonly WhiteboardElement[]>();
  readonly viewportChange = output<WhiteboardViewport>();
  readonly exported = output<string>();
  readonly importError = output<Error>();

  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  readonly selectedElements = signal<readonly WhiteboardElement[]>([]);
  readonly viewport = signal<WhiteboardViewport>({ x: 0, y: 0, zoom: 1 });
  protected readonly zoomLabel = computed(() => `${Math.round(this.viewport().zoom * 100)}%`);
  protected readonly style = this.drawingStyle;
  protected readonly labels = computed(() => WHITEBOARD_LABELS[this.locale()]);
  protected readonly fills = ['#ffccd2', '#b4efc3', '#bde3ff', '#ffedaa'];
  protected readonly textDraft = signal('');
  protected readonly textEdit = signal<WhiteboardElement | undefined>(undefined);
  protected readonly textEditorLayout = computed(() => {
    const element = this.textEdit();
    return element && this.engine?.textEditorLayout(element, this.textDraft());
  });
  protected readonly textEditorTransform = computed(() => {
    const element = this.textEdit();
    if (!element) return undefined;
    const { x, y, zoom } = this.viewport();
    const left = x + element.x * zoom, top = y + element.y * zoom;
    return `translate(${left}px, ${top}px) rotate(${element.rotation ?? 0}deg) scale(${zoom * (element.scaleX ?? 1)}, ${zoom * (element.scaleY ?? 1)})`;
  });
  protected readonly selectedText = computed(() => this.selectedElements().find(hasWhiteboardText));
  protected readonly propertyControls = computed(() => {
    const tool = this.tool();
    const editing = this.textEdit();
    const targets = editing ? [editing] : this.selectedElements();
    if (tool === 'hand' || tool === 'eraser' || (tool === 'select' && !targets.length)) return undefined;

    const types = targets.length ? targets.map(element => element.type) : [tool];
    const hasOutline = (type: WhiteboardTool) => type !== 'text' && type !== 'note';
    const strokeWidth = types.every(hasOutline);
    const fill = types.every(type => type === 'rectangle' || type === 'diamond' || type === 'ellipse' || type === 'note');
    const arrowhead = types.every(type => type === 'arrow');
    const labels = this.labels();
    return {
      colorLabel: strokeWidth ? labels.stroke : types.some(hasOutline) ? labels.color : labels.textColor,
      fillLabel: arrowhead ? labels.arrowheadColor : fill ? labels.fill : undefined,
      arrowhead,
      strokeWidth,
      lineStyle: strokeWidth && targets.every(element => element.type !== 'pencil' || !element.pressures),
      typography: !!editing || (targets.length ? targets.every(hasWhiteboardText) : tool === 'text' || tool === 'note'),
    };
  });
  protected readonly typography = computed(() => {
    const element = this.textEdit() ?? this.selectedText();
    const { fontFamily, fontSize, textAlign } = element ?? this.style();
    return {
      fontFamily: fontFamily ?? whiteboardFontFamily,
      fontSize,
      textAlign: textAlign ?? (element?.type === 'rectangle' ? 'center' : 'left'),
    };
  });
  protected readonly fontOptions = [
    { key: 'handwritten', value: 'Caveat, cursive', icon: 'fluent:edit-24-regular' },
    { key: 'sans', value: whiteboardFontFamily, icon: 'fluent:text-font-24-regular' },
    { key: 'mono', value: 'monospace', icon: 'fluent:code-24-regular' },
    { key: 'serif', value: 'Georgia, serif' },
  ] as const;
  protected readonly fontSizes = [
    { label: 'S', value: 16 }, { label: 'M', value: 24 },
    { label: 'L', value: 32 }, { label: 'XL', value: 48 },
  ] as const;
  protected readonly textAlignments = ['left', 'center', 'right'] as const;
  protected readonly errorMessage = signal('');
  protected readonly toolLabel = computed(() => {
    const selected = this.selectedElements();
    return selected.length > 1 ? `${selected.length} ${this.labels().objects}` : this.labels().tools[selected[0]?.type ?? this.tool()];
  });
  protected readonly tools: { value: WhiteboardTool; label: string; icon: string; shortcut: string }[] = [
    { value: 'hand', label: 'Hand', icon: 'fluent:hand-left-24-regular', shortcut: 'H' },
    { value: 'select', label: 'Select', icon: 'fluent:cursor-24-regular', shortcut: 'V' },
    { value: 'rectangle', label: 'Rectangle', icon: 'fluent:square-24-regular', shortcut: 'R' },
    { value: 'diamond', label: 'Diamond', icon: 'fluent:diamond-24-regular', shortcut: 'D' },
    { value: 'ellipse', label: 'Ellipse', icon: 'fluent:circle-24-regular', shortcut: 'O' },
    { value: 'arrow', label: 'Arrow', icon: 'fluent:arrow-right-24-regular', shortcut: 'A' },
    { value: 'line', label: 'Line', icon: 'fluent:line-horizontal-1-24-regular', shortcut: 'L' },
    { value: 'pencil', label: 'Pencil', icon: 'fluent:edit-24-regular', shortcut: 'P' },
    { value: 'text', label: 'Text', icon: 'fluent:text-t-24-regular', shortcut: 'T' },
    { value: 'note', label: 'Note', icon: 'fluent:note-24-regular', shortcut: 'N' },
    { value: 'eraser', label: 'Eraser', icon: 'fluent:eraser-24-regular', shortcut: 'E' },
  ];
  private readonly canvas = viewChild.required<ElementRef<HTMLDivElement>>('canvas');
  private readonly textEditor = viewChild<ElementRef<HTMLTextAreaElement>>('textEditor');
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirm = inject(ConfirmManager);
  private engine?: WhiteboardEngine;
  private resizeObserver?: ResizeObserver;
  private lastDocument?: WhiteboardDocument;
  private previousTool: WhiteboardTool = 'select';
  private focusedTextEditor?: HTMLTextAreaElement;

  constructor() {
    effect(() => {
      const document = this.value();
      if (this.engine && document !== this.lastDocument) {
        this.textEdit.set(undefined);
        this.engine.setDocument(document);
        this.lastDocument = document;
        this.canUndo.set(false); this.canRedo.set(false);
      }
    });
    effect(() => { const tool = this.tool(); this.engine?.setTool(tool); });
    effect(() => {
      const readonly = this.readOnly();
      if (readonly) this.textEdit.set(undefined);
      this.engine?.setReadonly(readonly);
    });
    effect(() => { const locked = this.toolLocked(); if (this.engine) this.engine.toolLocked = locked; });
    effect(() => { const pressure = this.pressureSensitive(); if (this.engine) this.engine.pressureSensitive = pressure; });
    effect(() => { const style = this.style(); if (this.engine) this.engine.style = style; });
    afterRenderEffect(() => {
      const editor = this.textEditor()?.nativeElement;
      if (!editor || this.textEdit()?.type !== 'text') return;
      const layout = this.textEditorLayout();
      if (!layout) return;
      // Native wrapping can differ from canvas metrics, especially at a word boundary.
      editor.style.height = `${Math.ceil(layout.height)}px`;
      editor.style.height = `${editor.scrollHeight}px`;
      editor.scrollTop = 0;
    });
    afterEveryRender(() => {
      const container = this.canvas().nativeElement;
      const editor = this.textEditor()?.nativeElement;
      if (editor !== this.focusedTextEditor) {
        this.focusedTextEditor = editor;
        if (editor) {
          editor.focus({ preventScroll: true });
          editor.setSelectionRange(editor.value.length, editor.value.length);
        }
      }
      if (this.engine) {
        // Angular can replace the reserved host during template hot reload. Keep the
        // existing stage and history, and restore its imperative canvas DOM afterwards.
        if (!container.contains(this.engine.stage.content)) {
          this.resizeObserver?.unobserve(this.engine.stage.container());
          this.engine.stage.container(container);
          this.resizeObserver?.observe(container);
          this.engine.resize(container.clientWidth, container.clientHeight);
        }
        return;
      }
      this.zone.runOutsideAngular(() => {
        this.lastDocument = this.value();
        this.engine = new WhiteboardEngine(this.canvas().nativeElement, this.value(), {
          change: (value, undo, redo) => this.zone.run(() => {
            this.lastDocument = value;
            this.value.set(value); this.canUndo.set(undo); this.canRedo.set(redo);
          }),
          selection: elements => this.zone.run(() => {
            this.selectedElements.set(elements);
            if (elements[0]) {
              const { stroke, fill, strokeWidth, opacity, lineStyle } = elements[0];
              const { fontSize, fontFamily, textAlign } = this.selectedText() ?? this.style();
              const style = { stroke, fill, strokeWidth, opacity, lineStyle, fontSize, fontFamily, textAlign };
              this.style.set(style);
              if (this.engine) this.engine.style = style;
            }
            this.selectionChange.emit(elements);
          }),
          viewport: view => this.zone.run(() => { this.viewport.set(view); this.viewportChange.emit(view); }),
          editText: request => this.zone.run(() => this.editText(request)),
          drawComplete: () => this.zone.run(() => this.tool.set('select')),
        });
        this.engine.style = this.style();
        this.engine.toolLocked = this.toolLocked();
        this.engine.pressureSensitive = this.pressureSensitive();
        this.engine.setTool(this.tool());
        this.engine.setReadonly(this.readOnly());
        this.resizeObserver = new ResizeObserver(entries => {
          const size = entries[0]?.contentRect;
          if (size) this.engine?.resize(size.width, size.height);
        });
        this.resizeObserver.observe(container);
        this.destroyRef.onDestroy(() => { this.resizeObserver?.disconnect(); this.engine?.destroy(); });
      });
    });
  }

  undo(): void { this.engine?.undo(); }
  redo(): void { this.engine?.redo(); }
  clear(): void { this.engine?.clear(); }
  deleteSelection(): void { this.engine?.deleteSelection(); }
  duplicateSelection(): void { this.engine?.duplicateSelection(); }
  zoomIn(): void { this.engine?.zoom(1.2); }
  zoomOut(): void { this.engine?.zoom(1 / 1.2); }
  resetView(): void { this.engine?.setViewport({ x: 0, y: 0, zoom: 1 }); }
  fitToContent(): void { this.engine?.fitToContent(); }
  /** Repaint after the consuming application finishes loading a custom canvas font. */
  redraw(): void { this.engine?.redraw(); }
  exportJson(): string { return JSON.stringify(this.value(), null, 2); }
  exportPng(options?: WhiteboardExportOptions): string | null {
    const result = this.engine?.exportPng(options) ?? null;
    if (result) this.exported.emit(result);
    return result;
  }
  importJson(json: string): void {
    if (this.readOnly()) return;
    const value = parseWhiteboardDocument(json);
    this.textEdit.set(undefined);
    this.value.set(value);
    this.engine?.setDocument(value);
    this.lastDocument = value;
    this.canUndo.set(false); this.canRedo.set(false);
    this.errorMessage.set('');
    this.fitToContent();
  }

  protected updateStyle(style: Partial<WhiteboardStyle>): void {
    if (this.readOnly()) return;
    this.style.update(current => ({ ...current, ...style }));
    this.engine?.applyStyle(style);
  }
  protected updateTypography(style: Partial<WhiteboardTypography>): void {
    if (this.readOnly()) return;
    this.style.update(current => ({ ...current, ...style }));
    const element = this.engine?.applyTypography(style);
    if (element) this.textEdit.set(element);
  }
  protected keepTextFocus(event: MouseEvent): void {
    if (this.textEdit()) event.preventDefault();
  }
  protected confirmClear(): void {
    this.confirm.open({ title: this.labels().clearTitle, description: this.labels().clearDescription })
      .confirmed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.clear());
  }
  protected async importFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose a whiteboard JSON file smaller than 10 MB.');
      this.importJson(await file.text());
    } catch (error) {
      const message = error instanceof Error ? error : new Error('Unable to import whiteboard.');
      this.errorMessage.set(message.message); this.importError.emit(message);
    } finally { input.value = ''; }
  }
  protected downloadPng(): void {
    const data = this.exportPng();
    if (data) this.download(data, 'whiteboard.png');
  }
  protected downloadJson(): void {
    const url = URL.createObjectURL(new Blob([this.exportJson()], { type: 'application/json' }));
    this.download(url, 'whiteboard.json');
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  private download(url: string, filename: string): void {
    const link = this.document.createElement('a');
    link.href = url; link.download = filename; link.click();
  }
  private editText(request: WhiteboardTextRequest): void {
    if (this.textEdit()) return;
    this.releasePan();
    const element = this.engine?.beginTextEdit(request);
    if (!element) return;
    this.textDraft.set(element.text ?? '');
    this.textEdit.set(element);
  }
  protected finishTextEditing(text?: string): void {
    if (!this.textEdit() || this.destroyRef.destroyed) return;
    this.textEdit.set(undefined);
    this.engine?.finishTextEdit(this.readOnly() ? undefined : text);
  }
  protected onTextKeydown(event: KeyboardEvent, text: string): void {
    if (event.isComposing) return;
    const cancel = event.key === 'Escape';
    const save = event.key === 'Enter' && (event.ctrlKey || event.metaKey);
    if (!cancel && !save) return;
    event.preventDefault();
    this.finishTextEditing(save ? text : undefined);
    this.canvas().nativeElement.focus({ preventScroll: true });
  }
  protected focusCanvasFromPointer(event: MouseEvent): void {
    if (event.detail > 0) this.canvas().nativeElement.focus({ preventScroll: true });
  }
  protected selectTool(tool: WhiteboardTool, toggle = false): void {
    const active = this.tool();
    if (tool === 'hand' || tool === 'eraser') {
      if (tool === active && toggle) tool = this.previousTool;
      else if (active !== 'hand' && active !== 'eraser') this.previousTool = active;
    }
    this.tool.set(tool);
    this.engine?.setTool(tool);
  }
  protected releasePan(): void { this.engine?.setSpace(false); }
  protected onKeyup(event: KeyboardEvent): void { if (event.code === 'Space') this.releasePan(); }
  protected onKeydown(event: KeyboardEvent): void {
    // The tool strip stays keyboard-accessible without sending shortcuts from editors or other boards.
    const onCanvas = event.target === this.canvas().nativeElement;
    const onToolStrip = event.target instanceof HTMLElement && !!event.target.closest('.drawing-tools');
    if ((!onCanvas && !onToolStrip) || this.textEdit() || event.defaultPrevented || event.isComposing) return;
    const key = event.key.toLowerCase(), modifier = event.ctrlKey || event.metaKey;
    if (onCanvas && event.code === 'Space' && !modifier && !event.altKey) {
      event.preventDefault(); this.engine?.setSpace(true); return;
    }
    if (key === 'escape') {
      const active = this.tool();
      this.engine?.deselect();
      this.selectTool(active === 'hand' || active === 'eraser' ? this.previousTool : 'select');
      return;
    }
    if (key === '+' || key === '=') { event.preventDefault(); this.zoomIn(); return; }
    if (key === '-') { event.preventDefault(); this.zoomOut(); return; }
    if (key === '0') { event.preventDefault(); this.fitToContent(); return; }
    if (this.readOnly()) return;
    if (modifier && key === 'a') {
      event.preventDefault(); this.selectTool('select'); this.engine?.selectAll(); return;
    }
    if (modifier && key === 'z') { event.preventDefault(); event.shiftKey ? this.redo() : this.undo(); return; }
    if (modifier && key === 'y') { event.preventDefault(); this.redo(); return; }
    if (modifier && key === 'd') { event.preventDefault(); this.duplicateSelection(); return; }
    if (key === 'delete' || key === 'backspace') { event.preventDefault(); this.deleteSelection(); return; }
    if (onCanvas && !modifier && !event.altKey) {
      const step = event.shiftKey ? 10 : 1;
      const x = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0;
      const y = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0;
      if ((x || y) && this.engine?.nudgeSelection(x, y)) { event.preventDefault(); return; }
    }
    if (!modifier && !event.altKey && !event.shiftKey && !event.repeat) {
      if (key === 'q') { event.preventDefault(); this.toolLocked.update(locked => !locked); return; }
      const tool = this.tools.find(tool => tool.shortcut.toLowerCase() === key);
      if (tool) { event.preventDefault(); this.selectTool(tool.value, true); }
    }
  }
}
