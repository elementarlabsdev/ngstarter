import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  inject,
  input,
  NgZone,
  afterNextRender,
  signal,
  output,
  PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';
import { Sidenav } from '../sidenav/sidenav';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type AutoFocusTarget = 'dialog' | 'first-tabbable' | 'first-heading';

@Component({
  selector: 'ngs-sidenav-container',
  exportAs: 'ngsSidenavContainer',
  standalone: true,
  imports: [],
  templateUrl: './sidenav-container.html',
  styleUrl: './sidenav-container.scss',
  host: {
    'class': 'ngs-sidenav-container',
    '[class.is-settled]': '_isSettled()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavContainer {
  private _ngZone = inject(NgZone);
  private _document = inject(DOCUMENT);
  private _platformId = inject(PLATFORM_ID);
  protected _isSettled = signal(false);

  _sidenavs = contentChildren(Sidenav, {descendants: true});

  readonly backdropClick = output();

  hasBackdrop = input(true, {
    transform: booleanAttribute
  });

  autoFocus = input<AutoFocusTarget | string | boolean>(true);

  autosize = input(false, {
    transform: booleanAttribute
  });

  fixedWidth = input<number | string | null>(null);

  constructor() {
    afterNextRender(() => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this._isSettled.set(true);
        }, 100);
      });
    });
    effect(() => {
      const sidenavs = this._sidenavs();
      sidenavs.forEach(sidenav => {
        if (sidenav.opened()) {
          this._focusSidenav(sidenav);
        }
      });
    });
  }

  private _focusSidenav(sidenav: Sidenav): void {
    const autoFocus = this.autoFocus();

    if (autoFocus === false) {
      return;
    }

    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const element = sidenav._elementRef.nativeElement;

        if (autoFocus === 'dialog' || autoFocus === true) {
          element.focus();
        } else if (autoFocus === 'first-tabbable') {
          const firstTabbable = element.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          firstTabbable?.focus();
        } else if (typeof autoFocus === 'string' && autoFocus.length > 0) {
          const selectedElement = element.querySelector(autoFocus) as HTMLElement;
          selectedElement?.focus();
        }
      });
    });
  }

  _isShowingBackdrop(): boolean {
    const hasAdaptiveOver = this._sidenavs()?.some(sidenav =>
      sidenav.opened() &&
      (sidenav as any).adaptive() &&
      (sidenav as any)._isBreakpointMatched()
    );
    return (this.hasBackdrop() || hasAdaptiveOver) && this._sidenavs()?.some(sidenav => sidenav.opened() && (sidenav as any).effectiveMode() !== 'side');
  }

  _onBackdropClicked(): void {
    this.backdropClick.emit();
    this._sidenavs().forEach(sidenav => {
      if (sidenav.opened()) {
        if (!sidenav.disableClose()) {
          sidenav.close();
        }
      }
    });
  }

  _getContentMarginLeft(): string {
    if (!this.autosize()) {
      const startSidenav = this._sidenavs()?.find(
        s => s.position() === 'start' && s.opened()
      );

      if (startSidenav) {
        if (this.fixedWidth() !== null && this.fixedWidth() !== undefined) {
          return `${parseInt(this.fixedWidth() as string, 10)}px`;
        }

        if (startSidenav.collapsed()) {
          return 'var(--ngs-sidenav-collapsed-width)';
        }

        if (startSidenav.mode() === 'push' || (startSidenav as any).effectiveMode() === 'side') {
          return 'var(--ngs-sidenav-width)';
        }
      }

      return '0px';
    }
    // Logic for autosize would typically involve a MutationObserver or ResizeObserver
    // but the current implementation already uses functions in host bindings which are
    // re-evaluated on change detection.
    const startSidenav = this._sidenavs()?.find(
      s => s.position() === 'start' && s.opened()
    );

    if (startSidenav) {
      if (this.fixedWidth() !== null && this.fixedWidth() !== undefined) {
        return `${parseInt(this.fixedWidth() as string, 10)}px`;
      }

      if (startSidenav.collapsed()) {
        return 'var(--ngs-sidenav-collapsed-width)';
      }

      if (startSidenav.mode() === 'push' || (startSidenav as any).effectiveMode() === 'side') {
        return 'var(--ngs-sidenav-width)';
      }
    }

    return '0px';
  }

  _getContentMarginRight(): string {
    if (!this.autosize()) {
      const endSidenav = this._sidenavs()?.find(
        s => s.position() === 'end' && s.opened()
      );

      if (endSidenav) {
        if (this.fixedWidth() !== null && this.fixedWidth() !== undefined) {
          return `${parseInt(this.fixedWidth() as string, 10)}px`;
        }

        if (endSidenav.collapsed()) {
          return 'var(--ngs-sidenav-collapsed-width)';
        }

        if (endSidenav.mode() === 'push' || (endSidenav as any).effectiveMode() === 'side') {
          return 'var(--ngs-sidenav-width)';
        }
      }

      return '0px';
    }
    const endSidenav = this._sidenavs()?.find(
      s => s.position() === 'end' && s.opened()
    );

    if (endSidenav) {
      if (this.fixedWidth() !== null && this.fixedWidth() !== undefined) {
        return `${parseInt(this.fixedWidth() as string, 10)}px`;
      }

      if (endSidenav.collapsed()) {
        return 'var(--ngs-sidenav-collapsed-width)';
      }

      if (endSidenav.mode() === 'push' || (endSidenav as any).effectiveMode() === 'side') {
        return 'var(--ngs-sidenav-width)';
      }
    }

    return '0px';
  }
}
