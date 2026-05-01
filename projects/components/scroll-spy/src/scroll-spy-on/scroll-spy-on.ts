import { Component, ElementRef, inject, input, OnInit, Renderer2, DOCUMENT } from '@angular/core';

import { ScrollSpyNav } from '../scroll-spy-nav/scroll-spy-nav';
import { SCROLL_SPY_NAV } from '../types';

@Component({
  selector: 'ngs-scroll-spy-on,[ngs-scroll-spy-on]',
  exportAs: 'ngsScrollSpyOn',
  templateUrl: './scroll-spy-on.html',
  styleUrl: './scroll-spy-on.scss',
  host: {
    'class': 'ngs-scroll-spy-on',
    '[class.is-active]': 'isActive',
    '(click)': '_handleClick($event)'
  }
})
export class ScrollSpyOn implements OnInit {
  private _parent = inject<ScrollSpyNav>(SCROLL_SPY_NAV);
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  private _document = inject(DOCUMENT);

  targetId = input.required<string>();

  ngOnInit() {
    const fullUrl = this._document.location.origin + this._document.location.pathname;
    this._renderer.setAttribute(this._elementRef.nativeElement, 'href', fullUrl + '#' + this.targetId());
  }

  protected get isActive() {
    return this.targetId() === this._parent.activeId;
  }

  protected _handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this._parent.scrollTo(this.targetId());
  }
}
