import { Component, model, inject, ElementRef, viewChild, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ToolbarBaseItem } from '../toolbar-base-item';

@Component({
  selector: 'ngs-toolbar-item',
  imports: [NgTemplateOutlet],
  templateUrl: './toolbar-item.html',
  styleUrl: './toolbar-item.scss',
  host: {
    '[class.ngs-toolbar-item-hidden]': 'hidden()',
  }
})
export class ToolbarItem implements ToolbarBaseItem {
  readonly elementRef = inject(ElementRef);
  readonly hidden = model(false);
  readonly template = viewChild.required<TemplateRef<any>>('itemTemplate');
}
