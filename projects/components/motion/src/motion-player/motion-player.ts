import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe, isPlatformBrowser, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  MotionDocument,
  MotionLayer,
  MotionLayerSnapshot,
  MotionLayout,
  MotionScene,
  MotionStyle,
  createDefaultMotionDocument,
} from '../schema/motion-document';
import {
  applyMotionTransition,
  clampMotionTime,
  coerceMotionString,
  resolveMotionLayerSnapshot,
  sortMotionLayers,
} from '../engine/motion-engine';

@Component({
  selector: 'ngs-motion-player',
  imports: [DecimalPipe, NgStyle, NgTemplateOutlet],
  templateUrl: './motion-player.html',
  styleUrl: './motion-player.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-motion-player',
    '[class.ngs-motion-player--clip]': 'clip()',
  },
})
export class MotionPlayer {
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _isBrowser = isPlatformBrowser(this._platformId);

  readonly document = input<MotionDocument | null>(createDefaultMotionDocument());
  readonly currentTime = input<number | undefined>(undefined);
  readonly playing = input(false);
  readonly loop = input(false);
  readonly controls = input(false);
  readonly clip = input(true);

  readonly currentTimeChange = output<number>();
  readonly ended = output<void>();

  protected readonly internalTime = signal(0);

  protected readonly activeDocument = computed(
    () => this.document() ?? createDefaultMotionDocument(),
  );
  protected readonly composition = computed(() => this.activeDocument().composition);
  protected readonly sortedLayers = computed(() => sortMotionLayers(this.activeDocument().layers));
  protected readonly stageVariables = computed(() => {
    const composition = this.composition();

    return {
      '--ngs-motion-width': `${composition.width}`,
      '--ngs-motion-height': `${composition.height}`,
      '--ngs-motion-background': composition.background ?? 'transparent',
    };
  });

  private readonly _syncCurrentTime = effect(() => {
    const controlledTime = this.currentTime();

    if (controlledTime !== undefined) {
      this.internalTime.set(clampMotionTime(controlledTime, this.activeDocument()));
    }
  });

  private readonly _playback = effect((onCleanup) => {
    if (!this._isBrowser || !this.playing()) {
      return;
    }

    let frameId = 0;
    let previousFrameTime = performance.now();

    const tick = (frameTime: number) => {
      const delta = frameTime - previousFrameTime;
      previousFrameTime = frameTime;
      this.advance(delta);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    onCleanup(() => cancelAnimationFrame(frameId));
  });

  constructor() {
    this._destroyRef.onDestroy(() => {
      this.internalTime.set(0);
    });
  }

  seek(time: number): void {
    const nextTime = clampMotionTime(time, this.activeDocument());
    this.internalTime.set(nextTime);
    this.currentTimeChange.emit(nextTime);
  }

  advance(delta: number): void {
    const document = this.activeDocument();
    const duration = document.composition.duration;
    const currentTime = this.internalTime();

    if (duration <= 0 || (!this.loop() && currentTime >= duration)) {
      return;
    }

    let nextTime = this.internalTime() + delta;

    if (nextTime >= duration) {
      if (this.loop()) {
        nextTime = nextTime % duration;
      } else {
        nextTime = duration;
        this.ended.emit();
      }
    }

    this.seek(nextTime);
  }

  protected layerSnapshot(layer: MotionLayer): MotionLayerSnapshot {
    return resolveMotionLayerSnapshot(layer, this.internalTime());
  }

  protected layerStyle(
    layer: MotionLayer,
    parentWidth = this.composition().width,
    parentHeight = this.composition().height,
  ): Record<string, string | number | null> {
    const snapshot = this.layerSnapshot(layer);
    const layout = snapshot.layout;
    const style = snapshot.style;
    const sceneEffect = this.sceneEffect(layer);

    return {
      left: `${(layout.x / parentWidth) * 100}%`,
      top: `${(layout.y / parentHeight) * 100}%`,
      width: `${(layout.width / parentWidth) * 100}%`,
      height: `${(layout.height / parentHeight) * 100}%`,
      opacity: snapshot.opacity * sceneEffect.opacity,
      transform: sceneEffect.transform
        ? `${sceneEffect.transform} ${snapshot.transform}`
        : snapshot.transform,
      color: style.color ?? null,
      background:
        layer.type === 'shape'
          ? (style.background ?? style.fill ?? null)
          : (style.background ?? null),
      borderRadius: style.borderRadius !== undefined ? `${style.borderRadius}px` : null,
      fontFamily: style.fontFamily ?? null,
      fontSize: style.fontSize !== undefined ? `${style.fontSize}px` : null,
      fontWeight: style.fontWeight ?? null,
      lineHeight: style.lineHeight ?? null,
      letterSpacing: style.letterSpacing !== undefined ? `${style.letterSpacing}px` : null,
      textAlign: style.textAlign ?? null,
      padding: style.padding !== undefined ? `${style.padding}px` : null,
      filter: joinStyleFilters(style.filter, sceneEffect.filter),
      clipPath: sceneEffect.clipPath ?? style.clipPath ?? null,
      zIndex: layer.zIndex ?? 0,
    };
  }

  protected imageStyle(layer: MotionLayer): Record<string, string | null> {
    const snapshot = this.layerSnapshot(layer);

    return {
      objectFit: snapshot.style.objectFit ?? 'cover',
    };
  }

  protected childLayers(layer: MotionLayer): MotionLayer[] {
    return sortMotionLayers(layer.children ?? []);
  }

  protected layerWidth(layer: MotionLayer): number {
    return this.layerSnapshot(layer).layout.width;
  }

  protected layerHeight(layer: MotionLayer): number {
    return this.layerSnapshot(layer).layout.height;
  }

  protected isLayerVisible(layer: MotionLayer): boolean {
    return this.layerSnapshot(layer).visible && this.isLayerVisibleInScene(layer);
  }

  protected layerText(layer: MotionLayer): string {
    return coerceMotionString(this.layerSnapshot(layer).props['text'], '');
  }

  protected layerImageSrc(layer: MotionLayer): string {
    const props = this.layerSnapshot(layer).props;
    const src = coerceMotionString(props['src'], '');

    if (src) {
      return src;
    }

    const assetId = coerceMotionString(props['assetId'], '');

    return this.activeDocument().assets?.find((asset) => asset.id === assetId)?.src ?? '';
  }

  protected layerShapeKind(layer: MotionLayer): string {
    return coerceMotionString(this.layerSnapshot(layer).props['kind'], 'rectangle');
  }

  private sceneEffect(layer: MotionLayer): SceneEffect {
    const scene = this.sceneForLayer(layer);

    if (!scene) {
      return EMPTY_SCENE_EFFECT;
    }

    const localTime = this.internalTime() - scene.start;
    const scratchLayout: MotionLayout = { x: 0, y: 0, width: 1, height: 1, scale: 1 };
    const scratchStyle: MotionStyle = {};
    let opacity = 1;

    if (scene.transitionIn) {
      opacity *= applyMotionTransition(
        scene.transitionIn,
        'in',
        localTime,
        scene.duration,
        scratchLayout,
        scratchStyle,
      );
    }

    if (scene.transitionOut) {
      opacity *= applyMotionTransition(
        scene.transitionOut,
        'out',
        localTime,
        scene.duration,
        scratchLayout,
        scratchStyle,
      );
    }

    const transforms: string[] = [];

    if (scratchLayout.x || scratchLayout.y) {
      transforms.push(`translate(${scratchLayout.x}px, ${scratchLayout.y}px)`);
    }

    if (scratchLayout.scale !== undefined && scratchLayout.scale !== 1) {
      transforms.push(`scale(${scratchLayout.scale})`);
    }

    return {
      opacity,
      transform: transforms.join(' '),
      filter: scratchStyle.filter ?? null,
      clipPath: scratchStyle.clipPath ?? null,
    };
  }

  private isLayerVisibleInScene(layer: MotionLayer): boolean {
    const scenes = this.activeDocument().scenes ?? [];

    if (!scenes.some((scene) => this.sceneContainsLayer(scene, layer.id))) {
      return true;
    }

    return !!this.sceneForLayer(layer);
  }

  private sceneForLayer(layer: MotionLayer): MotionScene | null {
    const time = this.internalTime();

    return (
      this.activeDocument().scenes?.find(
        (scene) =>
          this.sceneContainsLayer(scene, layer.id) &&
          time >= scene.start &&
          time <= scene.start + scene.duration,
      ) ?? null
    );
  }

  private sceneContainsLayer(scene: MotionScene, layerId: string): boolean {
    return !scene.layerIds?.length || scene.layerIds.includes(layerId);
  }
}

const joinStyleFilters = (
  layerFilter: string | undefined,
  sceneFilter: string | null,
): string | null => {
  if (layerFilter && sceneFilter) {
    return `${layerFilter} ${sceneFilter}`;
  }

  return layerFilter ?? sceneFilter ?? null;
};

interface SceneEffect {
  opacity: number;
  transform: string;
  filter: string | null;
  clipPath: string | null;
}

const EMPTY_SCENE_EFFECT: SceneEffect = {
  opacity: 1,
  transform: '',
  filter: null,
  clipPath: null,
};
