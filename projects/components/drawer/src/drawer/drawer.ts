import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  forwardRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  Signal,
  TemplateRef,
  viewChild,
  ViewContainerRef, 
  ViewEncapsulation,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DRAWER } from '../types';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { timer } from 'rxjs';

@Component({
  selector: 'ngs-drawer',
  exportAs: 'ngsDrawer',
  templateUrl: './drawer.html',
  styleUrl: './drawer.scss',
  providers: [
    {
      provide: DRAWER,
      useExisting: forwardRef(() => Drawer),
    }
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-drawer'
  }
})
export class Drawer implements OnDestroy {
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private destroyRef = inject(DestroyRef);

  readonly initialIsOpen = input<boolean | undefined>(undefined, { alias: 'isOpen' });
  readonly showBackdrop = input(true);

  readonly closed = output<void>();
  readonly opened = output<void>();

  private internalIsOpen: WritableSignal<boolean> = signal(false);
  private overlayRef: OverlayRef | null = null;
  protected portal = viewChild.required<TemplateRef<any>>('portal');

  protected _isOpen: Signal<boolean> = computed(() => this.internalIsOpen());

  constructor() {
    effect(() => {
      const externalIsOpen = this.initialIsOpen();
      if (externalIsOpen !== undefined) {
        if (externalIsOpen) {
          this.open();
        } else {
          this.close();
        }
      }
    });
  }

  ngOnDestroy() {
    this.close();
  }

  open(): void {
    if (this.internalIsOpen()) {
      return;
    }

    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        hasBackdrop: this.showBackdrop(),
        backdropClass: 'drawer-backdrop',
        positionStrategy: this.overlay.position().global().right('0').top('0').bottom('0'),
        scrollStrategy: this.overlay.scrollStrategies.block()
      });

      this.overlayRef.backdropClick()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.close();
        });

      this.overlayRef.outsidePointerEvents()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event: MouseEvent) => {
          const target = event.target as HTMLElement;

          if (target.closest('.ngs-drawer-ignore-outside-click')) {
            return;
          }

          this.close();
        });

      this.overlayRef.keydownEvents()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(event => {
          if (event.key === 'Escape') {
            this.close();
          }
        });
    }

    const portal = new TemplatePortal(this.portal(), this.viewContainerRef);
    this.overlayRef.attach(portal);

    if (!this.showBackdrop()) {
      this.overlayRef.hostElement.classList.add('pointer-events-none');
    }

    // Delay setting internalIsOpen to true to ensure the entry animation triggers
    setTimeout(() => {
      this.internalIsOpen.set(true);
    });

    this.opened.emit();
  }

  close(): void {
    if (!this.internalIsOpen()) {
      return;
    }

    this.internalIsOpen.set(false);

    timer(150)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.overlayRef) {
          this.overlayRef.detach();
          this.overlayRef.dispose();
          this.overlayRef = null;
        }
        this.closed.emit();
      });
  }

  get isOpened(): boolean {
    return this._isOpen();
  }
}
