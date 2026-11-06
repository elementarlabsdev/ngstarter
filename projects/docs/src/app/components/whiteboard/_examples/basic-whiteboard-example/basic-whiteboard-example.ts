import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Whiteboard, WhiteboardDocument, WhiteboardElement, WhiteboardStyle } from '@ngstarter-ui/components/whiteboard';

const style: WhiteboardStyle = {
  stroke: '#12203b', fill: 'transparent', strokeWidth: 2, opacity: 1, lineStyle: 'solid', fontSize: 20,
};
const element = (id: string, type: WhiteboardElement['type'], x: number, y: number,
                 width: number, height: number, extra: Partial<WhiteboardElement> = {}): WhiteboardElement =>
  ({ id, type, x, y, width, height, ...style, ...extra });

@Component({
  selector: 'app-basic-whiteboard-example',
  imports: [Whiteboard],
  host: { class: 'block group-[.playground-expanded]/playground:h-full' },
  templateUrl: './basic-whiteboard-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicWhiteboardExample {
  readonly board = signal<WhiteboardDocument>({
    version: 1,
    elements: [
      element('heading', 'text', 300, 190, 470, 44, { text: 'From idea to prototype', fontSize: 28 }),
      element('idea', 'rectangle', 300, 290, 120, 80, { text: 'Idea' }),
      element('first-arrow', 'arrow', 420, 330, 70, 0, {
        points: [0, 0, 70, 0], stroke: '#60718e',
        startBinding: { elementId: 'idea', anchor: [1, 0.5] }, endBinding: { elementId: 'design', anchor: [0, 0.5] },
      }),
      element('design', 'rectangle', 490, 290, 120, 80, { text: 'Design', fill: '#e9efff' }),
      element('second-arrow', 'arrow', 610, 330, 70, 0, {
        points: [0, 0, 70, 0], stroke: '#60718e',
        startBinding: { elementId: 'design', anchor: [1, 0.5] }, endBinding: { elementId: 'prototype', anchor: [0, 0.5] },
      }),
      element('prototype', 'rectangle', 680, 290, 140, 80, { text: 'Prototype' }),
      element('sketch', 'pencil', 300, 450, 490, 45, {
        stroke: '#245bff', points: [0, 20, 60, -10, 130, -18, 190, 10, 255, 24, 320, 12, 400, -10, 490, -25],
      }),
    ],
  });
}
