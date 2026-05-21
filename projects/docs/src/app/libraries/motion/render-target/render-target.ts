import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  createDefaultMotionDocument,
  MotionDocument,
  MotionRenderer,
} from '@ngstarter-ui/components/motion';

@Component({
  selector: 'app-motion-render-target',
  imports: [MotionRenderer],
  templateUrl: './render-target.html',
  styleUrl: './render-target.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenderTarget {
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private _fontStyleElement: HTMLStyleElement | null = null;

  protected readonly document = signal<MotionDocument>(createDefaultMotionDocument());
  protected readonly frame = signal(0);
  protected readonly scale = signal(1);

  constructor() {
    if (this._isBrowser) {
      this.loadRenderState();

      afterNextRender(() => {
        void this.markRenderReadyWhenStable();
      });
    }
  }

  private async markRenderReadyWhenStable(): Promise<void> {
    document.documentElement.dataset['motionRenderReady'] = 'false';
    document.documentElement.dataset['motionRenderStatus'] = 'loading';

    try {
      await document.fonts?.ready;
      await Promise.all(this.pendingImages());
      await Promise.all(this.pendingVideos());
      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      document.documentElement.dataset['motionRenderStatus'] = 'ready';
      document.documentElement.dataset['motionRenderReady'] = 'true';
    } catch (error) {
      document.documentElement.dataset['motionRenderStatus'] =
        error instanceof Error ? error.message : 'render-target-error';
      document.documentElement.dataset['motionRenderReady'] = 'true';
    }
  }

  private loadRenderState(): void {
    const params = new URLSearchParams(window.location.search);
    const documentKey = params.get('documentKey') ?? 'ngs-motion-render-document';
    const payload = window.localStorage.getItem(documentKey);

    if (payload) {
      try {
        const parsed = JSON.parse(payload) as MotionDocument;

        this.document.set(parsed);
        this.installFonts(parsed);
      } catch {
        this.document.set(createDefaultMotionDocument());
      }
    }

    this.frame.set(readNumberParam(params, 'frame', 0));
    this.scale.set(readNumberParam(params, 'scale', 1));
  }

  private pendingImages(): Promise<unknown>[] {
    return Array.from(document.images).map((image) => {
      if (image.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    });
  }

  private pendingVideos(): Promise<unknown>[] {
    return Array.from(document.querySelectorAll('video')).map((video) => {
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        video.addEventListener('loadedmetadata', resolve, { once: true });
        video.addEventListener('error', resolve, { once: true });
      });
    });
  }

  private installFonts(documentValue: MotionDocument): void {
    if (!documentValue.fonts?.length) {
      return;
    }

    this._fontStyleElement?.remove();
    this._fontStyleElement = document.createElement('style');
    this._fontStyleElement.textContent = documentValue.fonts
      .filter((font) => !!font.src)
      .map((font) => {
        const weight = font.weight ?? 'normal';
        const style = font.style ?? 'normal';

        return `@font-face{font-family:${JSON.stringify(
          font.family,
        )};src:url(${JSON.stringify(font.src)});font-weight:${weight};font-style:${style};}`;
      })
      .join('\n');
    document.head.appendChild(this._fontStyleElement);
  }
}

const readNumberParam = (
  params: URLSearchParams,
  name: string,
  fallback: number,
): number => {
  const value = Number(params.get(name));

  return Number.isFinite(value) ? value : fallback;
};
