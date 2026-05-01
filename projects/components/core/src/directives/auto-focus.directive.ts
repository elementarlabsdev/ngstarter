import { AfterViewInit, Directive, ElementRef, inject, input, OnChanges, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { AUTOFOCUSABLE } from '../tokens/autofocusable.token';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[ngsAutoFocus]',
  exportAs: 'ngsAutoFocus',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit, OnChanges {
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);
  private autofocusable = inject(AUTOFOCUSABLE, { optional: true });

  enabled = input<boolean | string>(true, { alias: 'ngsAutoFocus' });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enabled'] && !changes['enabled'].firstChange) {
      this._focus();
    }
  }

  ngAfterViewInit(): void {
    this._focus();
  }

  private _focus(): void {
    if (this.enabled() === false || this.enabled() === 'false') {
      return;
    }

    if (this.autofocusable) {
      this.autofocusable.focus();
    } else {
      this.elementRef.nativeElement.focus();
    }

    this._moveCursorToEnd(this.elementRef.nativeElement);
  }

  private _moveCursorToEnd(el: HTMLElement) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}
