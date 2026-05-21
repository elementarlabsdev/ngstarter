import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import {
  MotionRenderProgress,
  MotionRenderRequest,
  MotionRenderResult,
  createMotionRenderProgress,
} from './motion-render';

export interface MotionRenderRunnerObserver {
  progress?: (progress: MotionRenderProgress) => void;
  complete?: (result: MotionRenderResult) => void;
  error?: (error: unknown) => void;
}

export interface MotionRenderRunnerHandle {
  cancel: () => void;
}

export interface MotionRenderRunner {
  start: (
    request: MotionRenderRequest,
    observer?: MotionRenderRunnerObserver,
  ) => MotionRenderRunnerHandle;
}

export const MOTION_RENDER_RUNNER = new InjectionToken<MotionRenderRunner>(
  'MOTION_RENDER_RUNNER',
);

export const provideMotionRenderRunner = (
  runner: MotionRenderRunner,
): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: MOTION_RENDER_RUNNER,
      useValue: runner,
    },
  ]);

export const createMotionRenderEventRunner = (
  target: EventTarget | null = typeof window === 'undefined' ? null : window,
): MotionRenderRunner => ({
  start: (request, observer) => {
    if (!target || typeof CustomEvent === 'undefined') {
      observer?.progress?.(
        createMotionRenderProgress(request, 'queued', 0, 'Render request is ready.'),
      );

      return {
        cancel: () => undefined,
      };
    }

    const progressListener = (event: Event) => {
      const detail = (event as CustomEvent<MotionRenderProgress>).detail;

      if (detail.requestId === request.id) {
        observer?.progress?.(detail);
      }
    };
    const resultListener = (event: Event) => {
      const detail = (event as CustomEvent<MotionRenderResult>).detail;

      if (detail.requestId === request.id) {
        observer?.complete?.(detail);
        cleanup();
      }
    };
    const errorListener = (event: Event) => {
      observer?.error?.((event as CustomEvent<unknown>).detail);
      cleanup();
    };
    const cleanup = () => {
      target.removeEventListener('ngs-motion-render-progress', progressListener);
      target.removeEventListener('ngs-motion-render-result', resultListener);
      target.removeEventListener('ngs-motion-render-error', errorListener);
    };

    target.addEventListener('ngs-motion-render-progress', progressListener);
    target.addEventListener('ngs-motion-render-result', resultListener);
    target.addEventListener('ngs-motion-render-error', errorListener);
    target.dispatchEvent(
      new CustomEvent('ngs-motion-render-request', {
        detail: request,
      }),
    );
    observer?.progress?.(
      createMotionRenderProgress(request, 'queued', 0, 'Render request dispatched.'),
    );

    return {
      cancel: () => {
        target.dispatchEvent(
          new CustomEvent('ngs-motion-render-cancel', {
            detail: { requestId: request.id },
          }),
        );
        cleanup();
      },
    };
  },
});

export const provideMotionRenderEventRunner = (): EnvironmentProviders =>
  provideMotionRenderRunner(createMotionRenderEventRunner());

export interface MotionRenderMockRunnerOptions {
  frameDelay?: number;
  encodeDelay?: number;
  fail?: boolean;
}

export const createMotionRenderMockRunner = (
  options: MotionRenderMockRunnerOptions = {},
): MotionRenderRunner => ({
  start: (request, observer) => {
    const frameDelay = Math.max(0, options.frameDelay ?? 24);
    const encodeDelay = Math.max(0, options.encodeDelay ?? 420);
    const totalFrames = Math.max(1, request.frames.length);
    let cancelled = false;
    let currentFrame = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const finish = (status: MotionRenderResult['status'], error?: string) => {
      observer?.complete?.({
        requestId: request.id,
        status,
        manifest: request.manifest,
        frames: request.frames,
        outputDir: request.outputDir,
        videoPath: request.videoPath,
        completedAt: new Date().toISOString(),
        error,
      });
    };

    const schedule = (callback: () => void, delay: number) => {
      timer = setTimeout(callback, delay);
    };

    const renderNextFrame = () => {
      if (cancelled) {
        return;
      }

      currentFrame += 1;
      observer?.progress?.(
        createMotionRenderProgress(
          request,
          'rendering',
          currentFrame,
          `Rendering frame ${currentFrame} of ${totalFrames}.`,
        ),
      );

      if (currentFrame < totalFrames) {
        schedule(renderNextFrame, frameDelay);
        return;
      }

      if (options.fail) {
        observer?.progress?.(
          createMotionRenderProgress(request, 'error', currentFrame, 'Mock render failed.'),
        );
        finish('error', 'Mock render failed.');
        return;
      }

      if (request.options.output === 'video') {
        observer?.progress?.(
          createMotionRenderProgress(request, 'encoding', totalFrames, 'Encoding video.'),
        );
        schedule(() => {
          if (!cancelled) {
            finish('done');
          }
        }, encodeDelay);
        return;
      }

      finish('done');
    };

    observer?.progress?.(
      createMotionRenderProgress(request, 'queued', 0, 'Mock render queued.'),
    );
    schedule(renderNextFrame, frameDelay);

    return {
      cancel: () => {
        cancelled = true;

        if (timer) {
          clearTimeout(timer);
        }

        observer?.progress?.(
          createMotionRenderProgress(request, 'cancelled', currentFrame, 'Mock render cancelled.'),
        );
        finish('cancelled');
      },
    };
  },
});

export const provideMotionRenderMockRunner = (
  options?: MotionRenderMockRunnerOptions,
): EnvironmentProviders => provideMotionRenderRunner(createMotionRenderMockRunner(options));
