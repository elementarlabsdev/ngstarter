import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
  ChangeDetectionStrategy, untracked, booleanAttribute, output, PLATFORM_ID
} from '@angular/core';
import videojs from 'video.js';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Slider, SliderThumb } from '@ngstarter/components/slider';
import { ProgressSpinner } from '@ngstarter/components/spinner';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VideoPlayerService } from '../video-player.service';

export type VideoPlayerOrientation = 'landscape' | 'portrait' | 'square' | string;

@Component({
  selector: 'ngs-video-player',
  exportAs: 'ngsVideoPlayer',
  standalone: true,
  imports: [
    Icon,
    Button,
    Slider,
    SliderThumb,
    ProgressSpinner
  ],
  templateUrl: './video-player.html',
  styleUrl: './video-player.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-video-player not-prose',
    '[class.aspect-video]': 'finalOrientation() === "landscape"',
    '[class.aspect-square]': 'finalOrientation() === "square"',
    '[class.aspect-portrait]': 'finalOrientation() === "portrait"',
    '[class.is-loaded]': 'loaded()'
  }
})
export class VideoPlayer implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly videoPlayerService = inject(VideoPlayerService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  src = input<string | null>(null);
  thumbnailUrl = input<string | null | undefined>(null);
  payload = input<any | null>(null);
  orientation = input<VideoPlayerOrientation | undefined>(undefined);
  autoPlay = input(false, {
    transform: booleanAttribute
  });
  showPlayButton = input(true, {
    transform: booleanAttribute
  });
  showSpeaker = input(true, {
    transform: booleanAttribute
  });
  showFullscreen = input(true, {
    transform: booleanAttribute
  });
  showDurationSlider = input(true, {
    transform: booleanAttribute
  });
  disableClickToPlay = input(false, {
    transform: booleanAttribute
  });
  muted = input(false, {
    transform: booleanAttribute
  });
  withCredentials = input(false, {
    transform: booleanAttribute
  });

  videoContainer = viewChild.required<ElementRef<HTMLDivElement>>('videoContainer');
  private videoElement: HTMLVideoElement | null = null;
  loaded = signal(false);
  isLoading = computed(() => !this.loaded() && !this.error());
  isPlaying = signal(false);
  isPaused = computed(() => !this.isPlaying());
  hasStarted = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(1);
  isMuted = signal(false);
  isFullscreen = signal(false);
  error = signal<any>(null);

  onPlay = output<void>({ alias: 'play' });
  onPause = output<void>({ alias: 'pause' });
  onEnded = output<void>({ alias: 'ended' });
  onLoaded = output<void>({ alias: 'loaded' });
  onError = output<any>({ alias: 'error' });

  finalOrientation = computed(() => {
    return this.orientation() || this.payload()?.orientation;
  });

  private player: any | null = null;
  private readonly elementEventsCleanup$ = new Subject<void>();

  private isViewInitialized = false;

  constructor() {
    effect(() => {
      this.isMuted.set(this.muted());
    });

    effect(() => {
      const src = this.src();

      if (this.isViewInitialized) {
        untracked(() => {
          // Only reset loaded state if the source actually changed
          // This prevents "appearing then disappearing" if src is set to the same value
          // video.js might have changed the src, or it might be different format
          const currentSrc = this.player ? this.player.currentSrc() : this.videoElement?.src;

          // Basic comparison, might need improvement for relative URLs
          if (src && currentSrc !== src && !currentSrc?.endsWith(src)) {
            this.loaded.set(false);
            this.isPlaying.set(false);
            this.hasStarted.set(false);
            this.error.set(null);
            this.updateSrc(src);
          } else if (!src) {
            this.loaded.set(false);
            this.isPlaying.set(false);
            this.hasStarted.set(false);
            this.error.set(null);
            this.initPlayer();
          }
        });
      }
    });

    effect(() => {
      const isMuted = this.isMuted();

      if (this.videoElement) {
        this.videoElement.muted = isMuted;
      }
    });

    effect(() => {
      const isPlaying = this.isPlaying();

      if (isPlaying) {
        untracked(() => {
          this.videoPlayerService.setActivePlayer(this);
        });
      }
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.isViewInitialized = true;
      this.initPlayer();
    }
  }

  private onLoadedData = () => {
    this.loaded.set(true);
    if (this.videoElement && this.duration() === 0) {
      const nativeDuration = this.videoElement.duration;
      if (nativeDuration && !isNaN(nativeDuration)) {
        this.duration.set(nativeDuration);
      }
    }
    this.onLoaded.emit();
  };

  private onTimeUpdate = () => {
    if (this.player) {
      const time = this.player.currentTime();
      this.currentTime.set(time);
      if (time > 0.1 && !this.hasStarted()) {
        this.hasStarted.set(true);
      }
      return;
    }
    if (this.videoElement) {
      const time = this.videoElement.currentTime;
      this.currentTime.set(time);
      if (time > 0.1 && !this.hasStarted()) {
        this.hasStarted.set(true);
      }
    }
  };

  private onLoadedMetadata = () => {
    if (this.player) {
      this.duration.set(this.player.duration());
      return;
    }
    if (this.videoElement) {
      this.duration.set(this.videoElement.duration);
    }
  };

  private onPlayInternal = () => {
    this.isPlaying.set(true);
    // Explicitly set hasStarted to true when playback actually begins
    if (!this.hasStarted()) {
      this.hasStarted.set(true);
    }
  };

  private onPauseInternal = () => {
    this.isPlaying.set(false);
    this.videoPlayerService.clearActivePlayer(this);
    // Note: we don't reset hasStarted on pause
  };

  private setupEvents() {
    if (!this.videoElement) {
      return;
    }

    this.elementEventsCleanup$.next();
    const nativeElement = this.videoElement;

    // If the video is already loaded or in a state where it can be played, trigger onLoadedData
    if (nativeElement.readyState >= 2) {
      setTimeout(() => {
        this.onLoadedData();
        this.onLoadedMetadata();
      });
    }

    fromEvent(nativeElement, 'loadeddata')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.onLoadedData();
      });

    fromEvent(nativeElement, 'canplay')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.onLoadedData();
      });

    fromEvent(nativeElement, 'error')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        // If Video.js is active, ignore native element errors as they might be redundant or misleading
        if (this.player) {
          return;
        }
        const error = (nativeElement).error;
        console.error('VideoPlayer: element error', error);
        this.error.set(error);
        this.onError.emit(error);
      });

    fromEvent(nativeElement, 'timeupdate')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.onTimeUpdate());

    fromEvent(nativeElement, 'loadedmetadata')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.onLoadedMetadata());

    fromEvent(nativeElement, 'play')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.onPlayInternal();
        this.onPlay.emit();
      });

    fromEvent(nativeElement, 'playing')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.onPlayInternal();
      });

    fromEvent(nativeElement, 'pause')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.onPauseInternal();
        this.onPause.emit();
      });

    fromEvent(nativeElement, 'ended')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.onPauseInternal();
        this.onEnded.emit();
      });

    fromEvent(this.document, 'fullscreenchange')
      .pipe(
        takeUntil(this.elementEventsCleanup$),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.onFullscreenChange());
  }

  private onFullscreenChange = () => {
    this.isFullscreen.set(!!this.document.fullscreenElement);
  };

  toggleFullscreen() {
    const container = this.videoContainer().nativeElement;
    if (!container) return;

    if (!this.document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      this.document.exitFullscreen();
    }
  }

  pause() {
    if (this.player) {
      this.player.pause();
    } else if (this.videoElement) {
      this.videoElement.pause();
    }
  }

  togglePlay() {
    if (this.error()) {
      return;
    }

    if (this.player) {
      if (this.player.paused()) {
        const playPromise = this.player.play();
        if (playPromise !== undefined && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            this.hasStarted.set(true);
            this.videoPlayerService.setActivePlayer(this);
          }).catch((err: any) => {
            console.error('VideoPlayer: error attempting to play video via player:', err);
          });
        } else {
          this.hasStarted.set(true);
          this.videoPlayerService.setActivePlayer(this);
        }
      } else {
        this.player.pause();
      }
      return;
    }

    if (this.videoElement) {
      if (this.videoElement.paused) {
        // If it's the first play, we might need to initialize video.js
        // but if the user wants it "like this" with [src], let's try native play first
        const playPromise = this.videoElement.play();
        if (playPromise !== undefined && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            this.hasStarted.set(true);
            this.videoPlayerService.setActivePlayer(this);
          }).catch(err => {
            console.error('VideoPlayer: error attempting to play video via native element:', err);
            // Fallback to initPlayer if native play fails (e.g. needs video.js)
            this.initPlayer().then(() => {
              if (this.player) {
                this.player.play().catch((e: any) => console.error('VideoPlayer: retry play failed', e));
              }
            });
          });
        } else {
          this.hasStarted.set(true);
          this.videoPlayerService.setActivePlayer(this);
        }
      } else {
        this.videoElement.pause();
      }
    }
  }

  seek(event: any) {
    if (this.error()) {
      return;
    }

    if (this.player) {
      this.player.currentTime(event.target.value);
    } else if (this.videoElement) {
      this.videoElement.currentTime = event.target.value;
    }
  }

  toggleMute() {
    if (this.player) {
      const isMuted = !this.player.muted();
      this.player.muted(isMuted);
      this.isMuted.set(isMuted);
    } else if (this.videoElement) {
      this.videoElement.muted = !this.videoElement.muted;
      this.isMuted.set(this.videoElement.muted);
    }

    if (!this.hasStarted()) {
      this.togglePlay();
    }
  }

  private async initPlayer() {
    if (!this.isViewInitialized || !this.isBrowser) {
      return;
    }

    if (!this.videoElement) {
      this.videoElement = this.document.createElement('video');
      this.videoElement.className = 'video-js not-prose w-full h-full object-contain relative z-[1] block';
      this.videoContainer().nativeElement.prepend(this.videoElement);
      this.setupEvents();
    }

    const src = this.src();
    if (!src) {
      if (this.player) {
        this.player.dispose();
        this.player = null;
        this.videoElement = null;
      } else if (this.videoElement) {
        this.videoElement.src = '';
      }
      return;
    }

    const finalSrc = src as string;
    const autoPlay = this.autoPlay();

    if (this.player) {
      const el = this.videoElement;
      this.player.dispose();
      this.player = null;

      // After dispose(), video.js removes the element from DOM.
      // We also need to make sure we don't have any dangling references or pending browser actions
      if (el) {
        try {
          el.removeAttribute('src');
          el.load();
        } catch (e) {}
      }

      this.videoElement = this.document.createElement('video');
      this.videoElement.className = 'video-js not-prose w-full h-full object-contain relative z-[1] block';
      this.videoContainer().nativeElement.prepend(this.videoElement);
      this.setupEvents();
    }

    this.error.set(null);

    const type = finalSrc.split('?')[0].toLowerCase().endsWith('.m3u8') ? 'application/x-mpegURL' : undefined;

    const options = {
      autoplay: autoPlay,
      muted: this.muted(),
      controls: false,
      controlBar: false,
      bigPlayButton: false,
      errorDisplay: false,
      textTrackSettings: false,
      fluid: false,
      responsive: false,
      html5: {
        vhs: {
          withCredentials: this.withCredentials()
        }
      },
      sources: [{
        src: finalSrc,
        type: type
      }]
    };

    this.player = videojs(this.videoElement, options, () => {
      if (autoPlay) {
        this.videoPlayerService.setActivePlayer(this);
      }
      // Re-trigger events after videojs takes over
      this.onLoadedMetadata();
      this.onLoadedData();

      // Ensure the video element inside is actually visible
      const tech = this.videoElement?.querySelector('.vjs-tech');
      if (tech) {
        (tech as HTMLElement).style.display = 'block';
      }
    });

    // Make sure we have a way to see the video if it's already there
    this.videoElement.style.display = 'block';

    this.player.on('loadeddata', () => {
      this.onLoadedData();
      this.onLoadedMetadata();
      // If it was supposed to autoplay but hadn't yet, try again
      if (this.autoPlay() && this.player.paused()) {
        this.player.play().catch(() => {});
      }
    });
    this.player.on('canplay', () => this.onLoadedData());
    this.player.on('timeupdate', () => this.onTimeUpdate());
    this.player.on('loadedmetadata', () => this.onLoadedMetadata());
    this.player.on('play', () => {
      this.onPlayInternal();
      this.onPlay.emit();
    });
    this.player.on('playing', () => {
      this.onPlayInternal();
    });
    this.player.on('pause', () => {
      this.onPauseInternal();
      this.onPause.emit();
    });
    this.player.on('ended', () => {
      this.isPlaying.set(false);
      this.onEnded.emit();
    });
    this.player.on('error', (e: any) => {
      const error = this.player.error();
      console.error('VideoPlayer: player error', error);
      this.error.set(error);
      this.onError.emit(error);
    });
  }

  private async updateSrc(src: string) {
    if (this.player) {
      const type = src.split('?')[0].toLowerCase().endsWith('.m3u8') ? 'application/x-mpegURL' : undefined;

      this.player.src({ src, type });
      if (this.autoPlay()) {
        this.player.play().catch(() => {});
        this.videoPlayerService.setActivePlayer(this);
      }
    } else {
      this.initPlayer();
    }
  }

  ngOnDestroy() {
    this.videoPlayerService.clearActivePlayer(this);
    this.elementEventsCleanup$.next();
    this.elementEventsCleanup$.complete();

    if (this.player) {
      const el = this.videoElement;
      this.player.dispose();
      this.player = null;

      if (el) {
        try {
          el.removeAttribute('src');
          el.load();
        } catch (e) {}
      }
    }
  }
}
