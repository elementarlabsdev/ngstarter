import { booleanAttribute, Component, ElementRef, forwardRef, inject, input, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { LAYOUT_CONTENT, LayoutContentInterface } from '../types';

@Component({
  selector: 'ngs-layout-content',
  exportAs: 'ngsLayoutContent',
  templateUrl: './layout-content.html',
  styleUrl: './layout-content.scss',
  hostDirectives: [
    CdkScrollable
  ],
  providers: [
    {
      provide: LAYOUT_CONTENT,
      useExisting: forwardRef(() => LayoutContent)
    }
  ],
  host: {
    'class': 'ngs-layout-content ngs-scroll-lg'
  }
})
export class LayoutContent implements OnInit, LayoutContentInterface {
  private _router = inject(Router);
  private _elementRef = inject(ElementRef);
  private _platformId = inject(PLATFORM_ID);
  readonly scrollable = inject(CdkScrollable);

  autoscrollToTop = input(true, {
    transform: booleanAttribute
  });

  scrollContainer(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  ngOnInit() {
    // Scroll a page to top if url changed
    this._router.events
      .pipe(
        filter(event=> event instanceof NavigationStart)
      )
      .subscribe(() => {
        if (!this.autoscrollToTop()) {
          return;
        }

        if (isPlatformServer(this._platformId)) {
          return;
        }

        this._elementRef.nativeElement.scrollTo({
          top: 0,
          left: 0
        });
      })
    ;
  }
}
