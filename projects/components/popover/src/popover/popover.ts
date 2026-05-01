import { Component, ChangeDetectionStrategy, TemplateRef, viewChild, contentChild, signal, inject } from '@angular/core';
import { NgTemplateOutlet, NgClass } from '@angular/common';
import { PopoverContent } from '../popover-content';
import { POPOVER_TRIGGER } from '../types';

@Component({
  selector: 'ngs-popover',
  exportAs: 'ngsPopover',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgClass
  ],
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-popover'
  }
})
export class Popover {
  readonly trigger = inject(POPOVER_TRIGGER, { optional: true });
  readonly templateRef = viewChild.required(TemplateRef);
  readonly content = contentChild(PopoverContent);

  readonly _context = signal<any>(undefined);
  readonly _positionClasses = signal<string[]>([]);

  _setContext(context: any): void {
    this._context.set(context);
  }

  _setPositionClasses(classes: string[]): void {
    this._positionClasses.set(classes);
  }

  open(): void {
    this.trigger?.open();
  }

  close(): void {
    this.trigger?.close();
  }

  isOpen(): boolean {
    return this.trigger?.isOpen() ?? false;
  }
}
