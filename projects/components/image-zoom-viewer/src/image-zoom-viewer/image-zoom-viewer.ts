import {
  Component,
  contentChild,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ImageZoomViewerStyle
} from '../image-zoom-viewer-style/image-zoom-viewer-style';
import { ImageZoomViewerImage } from '../image-zoom-viewer-image';

@Component({
  selector: 'ngs-image-zoom-viewer',
  exportAs: 'ngsImageZoomViewer',
  templateUrl: './image-zoom-viewer.html',
  styleUrl: './image-zoom-viewer.scss',
  imports: [
    ImageZoomViewerStyle,
  ],
  host: {
    'class': 'ngs-image-zoom-viewer'
  }
})
export class ImageZoomViewer implements OnDestroy {
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private destroyRef = inject(DestroyRef);

  readonly contentImageRef = contentChild.required(ImageZoomViewerImage, { read: ElementRef<HTMLImageElement> });
  readonly zoomedTemplate = viewChild.required<TemplateRef<any>>('zoomedTemplate');

  readonly isZoomed = signal(false);
  readonly imageSrc = signal('');
  readonly imageAlt = signal('');
  readonly imageRect = signal<DOMRect | undefined>(undefined);
  readonly zoomedTransform = signal('translate(0, 0) scale(1)');

  private overlayRef: OverlayRef | null = null;
  private resizeSubscription?: Subscription;

  constructor() {
    // Update image source when content changes or initial load
    effect(() => {
      const img = this.getImageElement();
      if (img) {
        untracked(() => {
          this.imageSrc.set(img.src);
          this.imageAlt.set(img.alt);
        });
      }
    });
  }

  ngOnDestroy() {
    this.closeZoom();
  }

  toggleZoom() {
    if (this.isZoomed()) {
      this.closeZoom();
    } else {
      this.openZoom();
    }
  }

  openZoom() {
    const img = this.getImageElement();
    const template = this.zoomedTemplate();
    this.imageSrc.set(img.src);
    this.imageAlt.set(img.alt);
    const rect = img.getBoundingClientRect();
    this.imageRect.set(rect);
    this.isZoomed.set(true);

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'ngs-image-zoom-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    });

    this.overlayRef
      .backdropClick()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeZoom());
    this.overlayRef
      .keydownEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event.key === 'Escape') {
          this.closeZoom();
        }
      });

    const portal = new TemplatePortal(template, this.viewContainerRef);
    this.overlayRef.attach(portal);

    // Use requestAnimationFrame to ensure the cloned image is rendered before animating
    requestAnimationFrame(() => {
      this.calculateZoom();
    });

    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.calculateZoom();
      });
  }

  closeZoom() {
    if (!this.overlayRef) {
      return;
    }

    const backdrop = this.overlayRef.backdropElement;
    if (backdrop) {
      backdrop.classList.add('is-closing');
      backdrop.classList.remove('cdk-overlay-backdrop-showing');
    }

    this.zoomedTransform.set('translate(0, 0) scale(1)');

    // Wait for transition to finish before hiding the overlay and cloned image
    setTimeout(() => {
      this.isZoomed.set(false);
      this.cleanupListeners();
      if (this.overlayRef) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    }, 250);
  }

  private calculateZoom() {
    const rect = this.imageRect();

    if (!rect) {
      return;
    }

    const vWidth = window.innerWidth;
    const vHeight = window.innerHeight;

    const scaleX = vWidth / rect.width;
    const scaleY = vHeight / rect.height;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% of viewport

    const translateX = (vWidth / 2) - (rect.left + rect.width / 2);
    const translateY = (vHeight / 2) - (rect.top + rect.height / 2);

    this.zoomedTransform.set(`translate(${translateX}px, ${translateY}px) scale(${scale})`);
  }

  private getImageElement(): HTMLImageElement {
    return this.contentImageRef().nativeElement;
  }

  private cleanupListeners() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
      this.resizeSubscription = undefined;
    }
  }
}
