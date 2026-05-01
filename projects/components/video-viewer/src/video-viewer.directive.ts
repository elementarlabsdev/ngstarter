import { DestroyRef, Directive, inject, Injector } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VideoViewerRef } from './video-viewer-ref';
import { VideoViewer } from './video-viewer/video-viewer';
import { VIDEO_VIEWER_DATA, VIDEO_VIEWER_REF, VideoViewerOptions } from './types';

@Directive({
  selector: '[ngsVideoViewer]',
  exportAs: 'ngsVideoViewer',
  standalone: true,
  host: {
    'class': 'ngs-video-viewer',
  }
})
export class VideoViewerDirective {
  private _overlay = inject(Overlay);
  private _injector = inject(Injector);
  private _destroyRef = inject(DestroyRef);

  get api() {
    return {
      open: (options: VideoViewerOptions): VideoViewerRef => this._open(options)
    }
  }

  private _open(options: VideoViewerOptions): VideoViewerRef {
    const videoViewerRef = new VideoViewerRef();
    const overlayRef = this._overlay.create({
      positionStrategy: this._overlay.position().global(),
      hasBackdrop: true
    });
    const injector = Injector.create({
      providers: [
        {
          provide: VIDEO_VIEWER_REF,
          useValue: videoViewerRef
        },
        {
          provide: VIDEO_VIEWER_DATA,
          useValue: options
        }
      ],
      parent: this._injector
    });
    const portal = new ComponentPortal(VideoViewer, null, injector);
    overlayRef.attach(portal);
    videoViewerRef.closed.pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(() => {
      overlayRef.detach();
    });
    return videoViewerRef;
  }
}
