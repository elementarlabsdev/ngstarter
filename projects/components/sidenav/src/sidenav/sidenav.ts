import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  afterNextRender,
  signal,
  input,
  model,
  output,
  PLATFORM_ID,
  forwardRef,
  effect,
  DestroyRef,
  computed,
  NgZone,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SIDENAV } from '../types';
import { combineLatest, switchMap, of, distinctUntilChanged } from 'rxjs';

export type SidenavMode = 'over' | 'push' | 'side';
export type SidenavPosition = 'start' | 'end';

@Component({
  selector: 'ngs-sidenav',
  exportAs: 'ngsSidenav',
  standalone: true,
  imports: [],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
  providers: [
    {
      provide: SIDENAV,
      useExisting: forwardRef(() => Sidenav),
    }
  ],
  host: {
    'class': 'ngs-sidenav',
    '[class.ngs-sidenav-closed]': '!opened()',
    '[class.ngs-sidenav-opened]': 'opened()',
    '[class.ngs-sidenav-push]': 'effectiveMode() === "push"',
    '[class.ngs-sidenav-side]': 'effectiveMode() === "side"',
    '[class.ngs-sidenav-over]': 'effectiveMode() === "over"',
    '[class.ngs-sidenav-end]': 'position() === "end"',
    '[class.is-settled]': '_isSettled()',
    '[class.is-collapsed]': 'collapsed()',
    '[attr.tabindex]': '-1',
    '(mouseenter)': 'isHovered.set(true)',
    '(mouseleave)': 'isHovered.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidenav {
  private _platformId = inject(PLATFORM_ID);
  private _breakpointObserver = inject(BreakpointObserver);
  private _destroyRef = inject(DestroyRef);
  private _ngZone = inject(NgZone);
  _elementRef = inject(ElementRef);
  readonly isHovered = signal(false);
  protected _isSettled = signal(false);

  private _isBreakpointMatched = signal(false);
  private _previousOpened: boolean | null = null;

  /** Indicates whether the sidenav is in mobile (adaptive) mode. */
  isMobile = computed(() => this.adaptive() && this._isBreakpointMatched());

  effectiveMode = computed<SidenavMode>(() => {
    if (this.isMobile()) {
      return 'over';
    }
    return this.mode();
  });

  constructor() {
    afterNextRender(() => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this._isSettled.set(true);
        }, 100);
      });
    });
    combineLatest([
      toObservable(this.adaptive),
      toObservable(this.adaptiveBreakpoint)
    ]).pipe(
      switchMap(([adaptive, breakpoint]) => {
        if (!adaptive) {
          return of(false);
        }
        return this._breakpointObserver.observe(breakpoint).pipe(
          switchMap(result => of(result.matches))
        );
      }),
      distinctUntilChanged(),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe((matches) => {
      this._isBreakpointMatched.set(matches);
      if (matches) {
        this._previousOpened = this.opened();
        this.opened.set(false);
      } else {
        if (this._previousOpened !== null) {
          this.opened.set(this._previousOpened);
          this._previousOpened = null;
        }
      }
    });

    effect(() => {
      const isOpened = this.opened();
      const isMatched = this._isBreakpointMatched();
      if (!isMatched) {
        this._previousOpened = isOpened;
      }
    });
  }

  adaptive = input(true, {
    transform: booleanAttribute
  });
  adaptiveBreakpoint = input('(max-width: 991.98px)');

  opened = model(false);
  fixedWidth = input<number | string | null>(null);

  mode = input<SidenavMode>('over');
  position = input<SidenavPosition>('start');
  collapsed = input(false, {
    transform: booleanAttribute
  });
  disableClose = input(false, {
    transform: booleanAttribute
  });


  open(): Promise<void> {
    return this.toggle(true);
  }

  close(): Promise<void> {
    return this.toggle(false);
  }

  toggle(isOpen: boolean = !this.opened()): Promise<void> {
    this.opened.set(isOpen);
    return Promise.resolve();
  }

  _getWidth(): number {
    if (this.fixedWidth() !== null && this.fixedWidth() !== undefined) {
      return typeof this.fixedWidth() === 'number' ? this.fixedWidth() as number : parseInt(this.fixedWidth() as string, 10);
    }

    if (this._elementRef.nativeElement && this._elementRef.nativeElement.offsetWidth > 0) {
      return this._elementRef.nativeElement.offsetWidth;
    }

    return 280;
  }
}
