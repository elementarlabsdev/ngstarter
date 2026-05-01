import { Component, model, inject, ElementRef, viewChild, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ToolbarBaseItem } from '../toolbar-base-item';

@Component({
  selector: 'ngs-toolbar-nav',
  exportAs: 'ngsToolbarNav',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './toolbar-nav.html',
  styleUrl: './toolbar-nav.scss',
  host: {
    'class': 'ngs-toolbar-nav',
    '[class.ngs-toolbar-item-hidden]': 'hidden()',
  }
})
export class ToolbarNav implements ToolbarBaseItem {
  readonly elementRef = inject(ElementRef);
  readonly hidden = model(false);
  readonly template = viewChild.required<TemplateRef<any>>('itemTemplate');
}
