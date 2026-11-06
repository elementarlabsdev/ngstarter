import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Layout, LayoutContent } from '@ngstarter-ui/components/layout';
import { Whiteboard, WhiteboardDocument, WhiteboardElement, WhiteboardStyle } from '@ngstarter-ui/components/whiteboard';

const style: WhiteboardStyle = { stroke: '#12203b', fill: 'transparent', strokeWidth: 1.5, opacity: 1, lineStyle: 'solid', fontSize: 28 };
const element = (id: string, type: WhiteboardElement['type'], x: number, y: number, width: number, height: number,
                 extra: Partial<WhiteboardElement> = {}): WhiteboardElement => ({ id, type, x, y, width, height, ...style, ...extra });

@Component({
  imports: [Layout, LayoutContent, Whiteboard],
  templateUrl: './demo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Demo {
  readonly propertiesVisible = signal(true);
  private readonly canvas = viewChild.required(Whiteboard);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    afterNextRender(async () => {
      await this.document.fonts.load('56px Caveat', 'Idea prototype');
      if (!this.destroyRef.destroyed) {
        this.canvas().redraw();
        if ((this.document.defaultView?.innerWidth ?? 1623) < 768) {
          this.propertiesVisible.set(false);
          this.canvas().fitToContent();
        }
      }
    });
  }
  readonly drawingStyle: WhiteboardStyle = { ...style, stroke: '#245bff', strokeWidth: 2, opacity: 0.8, fontSize: 24 };
  readonly board = signal<WhiteboardDocument>({ version: 1, elements: [
    element('heading-idea', 'text', 500, 292, 125, 74, { text: 'Idea', fontFamily: 'Caveat, cursive', fontSize: 56, rotation: -2 }),
    element('heading-arrow', 'line', 620, 328, 50, 14, { points: [0, 0, 50, -4, 40, -11, 50, -4, 42, 5], strokeWidth: 2 }),
    element('heading-prototype', 'text', 685, 284, 300, 74, { text: 'prototype', fontFamily: 'Caveat, cursive', fontSize: 56, rotation: -2 }),
    element('idea', 'rectangle', 500, 419, 200, 94, { text: 'Idea' }),
    element('first-arrow', 'arrow', 700, 466, 94, 0, {
      points: [0, 0, 94, 0], startBinding: { elementId: 'idea', anchor: [1, 0.5] }, endBinding: { elementId: 'design', anchor: [0, 0.5] },
    }),
    element('design', 'rectangle', 794, 419, 200, 94, { text: 'Design', fill: '#e9efff' }),
    element('second-arrow', 'arrow', 994, 466, 106, 0, {
      points: [0, 0, 106, 0], startBinding: { elementId: 'design', anchor: [1, 0.5] }, endBinding: { elementId: 'prototype', anchor: [0, 0.5] },
    }),
    element('prototype', 'rectangle', 1100, 419, 205, 94, { text: 'Prototype' }),
    element('sketch', 'pencil', 487, 669, 694, 94, { stroke: '#245bff', strokeWidth: 2.5,
      points: [0, 0, 50, -35, 108, -60, 169, -63, 231, -42, 287, -4, 348, 20, 408, 23, 474, 9, 548, -19, 621, -46, 694, -64] }),
    element('circle', 'pencil', 1073, 546, 176, 138, { stroke: '#245bff', strokeWidth: 1.5,
      points: [101, 1, 65, 4, 26, 23, 4, 51, 0, 84, 14, 114, 43, 133, 81, 138, 122, 127, 153, 104, 173, 72, 176, 42, 162, 17, 137, 3, 101, 1] }),
  ] });
}
