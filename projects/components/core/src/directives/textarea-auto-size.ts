import {
  Directive,
  inject,
  input,
  NgZone,
  AfterViewInit,
  OnDestroy,
  numberAttribute,
} from '@angular/core';
import { injectElement } from '../utils/dom';
import { Platform } from '@angular/cdk/platform';

@Directive({
  selector: 'textarea[ngsTextareaAutoSize]',
  exportAs: 'ngsTextareaAutoSize',
  host: {
    'rows': '1',
    '(input)': 'resize()',
    'style': 'display: block; overflow: hidden; resize: none; box-sizing: border-box;',
  },
})
export class TextareaAutoSize implements AfterViewInit, OnDestroy {
  private readonly _textarea = injectElement<HTMLTextAreaElement>();
  private readonly _ngZone = inject(NgZone);
  private readonly _platform = inject(Platform);

  minRows = input(1, { transform: numberAttribute });
  maxRows = input(Number.MAX_SAFE_INTEGER, { transform: numberAttribute });

  private _resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    if (this._platform.isBrowser) {
      this.resize();

      this._ngZone.runOutsideAngular(() => {
        this._resizeObserver = new ResizeObserver(() => this.resize());
        this._resizeObserver.observe(this._textarea);
      });
    }
  }

  ngOnDestroy() {
    this._resizeObserver?.disconnect();
  }

  resize() {
    this._textarea.style.height = 'auto';

    const style = window.getComputedStyle(this._textarea);
    let lineHeight = parseFloat(style.lineHeight);

    if (isNaN(lineHeight)) {
      lineHeight = parseFloat(style.fontSize) * 1.2;
    }

    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const borderTop = parseFloat(style.borderTopWidth) || 0;
    const borderBottom = parseFloat(style.borderBottomWidth) || 0;

    const minHeight = this.minRows() * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
    const maxHeight = this.maxRows() * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;

    this._textarea.style.height = 'auto';
    const currentScrollHeight = this._textarea.scrollHeight;

    let height = Math.max(minHeight, currentScrollHeight);
    height = Math.min(maxHeight, height);

    this._textarea.style.height = `${height}px`;

    if (currentScrollHeight > maxHeight) {
      this._textarea.style.overflowY = 'auto';
    } else {
      this._textarea.style.overflowY = 'hidden';
    }
  }
}
