import { Component, ElementRef, forwardRef, inject } from '@angular/core';
import { PANEL_CONTENT, PanelContentInterface } from '../types';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  selector: 'ngs-panel-content',
  exportAs: 'ngsPanelContent',
  templateUrl: './panel-content.html',
  styleUrl: './panel-content.scss',
  hostDirectives: [
    CdkScrollable
  ],
  providers: [
    {
      provide: PANEL_CONTENT,
      useExisting: forwardRef(() => PanelContent)
    }
  ],
  host: {
    'class': 'ngs-panel-content'
  }
})
export class PanelContent implements PanelContentInterface {
  private elementRef = inject(ElementRef);
  readonly scrollable = inject(CdkScrollable);

  scrollContainer(): HTMLElement {
    return this.elementRef.nativeElement;
  }
}
