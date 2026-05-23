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
  MotionBackgroundEffect,
  MotionDocument,
  MotionLayer,
  MotionLayerSnapshot,
  MotionLayout,
  MotionScene,
  MotionStyle,
  MotionValue,
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
  readonly renderTime = input<number | null>(null);
  readonly playing = input(false);
  readonly loop = input(false);
  readonly controls = input(false);
  readonly clip = input(true);
  readonly animateBackground = input(false);
  readonly scale = input<number | undefined>(undefined);
  readonly minScale = input(0.5);
  readonly maxScale = input(2);
  readonly scaleStep = input(0.1);

  readonly currentTimeChange = output<number>();
  readonly ended = output<void>();
  readonly scaleChange = output<number>();

  protected readonly internalTime = signal(0);
  protected readonly internalScale = signal(1);
  protected readonly ambientBackgroundTime = signal(0);

  protected readonly activeDocument = computed(
    () => this.document() ?? createDefaultMotionDocument(),
  );
  protected readonly composition = computed(() => this.activeDocument().composition);
  protected readonly backgroundEffect = computed(() => this.composition().backgroundEffect ?? null);
  protected readonly backgroundEffectType = computed(() =>
    normalizeMotionBackgroundEffectType(this.backgroundEffect()),
  );
  protected readonly safeScaleBounds = computed(() => readMotionScaleBounds(this.minScale(), this.maxScale()));
  protected readonly sortedLayers = computed(() => sortMotionLayers(this.activeDocument().layers));
  protected readonly stageVariables = computed(() => {
    const composition = this.composition();

    return {
      '--ngs-motion-width': `${composition.width}`,
      '--ngs-motion-height': `${composition.height}`,
      '--ngs-motion-background': composition.background ?? 'transparent',
    };
  });
  protected readonly playerScale = computed(() => {
    const bounds = this.safeScaleBounds();

    return clampMotionScale(this.internalScale(), bounds.min, bounds.max);
  });
  protected readonly playerTransform = computed(() => `scale(${this.playerScale()})`);
  protected readonly displayTime = computed(() => {
    const renderTime = this.renderTime();

    return renderTime === null ? this.internalTime() : clampMotionTime(renderTime, this.activeDocument());
  });
  protected readonly backgroundDisplayTime = computed(() => {
    if (this.renderTime() !== null || this.playing() || !this.animateBackground()) {
      return this.displayTime();
    }

    return this.ambientBackgroundTime();
  });
  protected readonly backgroundEffectStyle = computed(() =>
    createMotionBackgroundEffectStyle(this.backgroundEffect(), this.backgroundDisplayTime()),
  );

  private readonly _syncCurrentTime = effect(() => {
    const controlledTime = this.currentTime();

    if (controlledTime !== undefined) {
      this.internalTime.set(clampMotionTime(controlledTime, this.activeDocument()));
    }
  });

  private readonly _syncScale = effect(() => {
    const controlledScale = this.scale();

    if (controlledScale !== undefined) {
      const bounds = this.safeScaleBounds();
      this.internalScale.set(clampMotionScale(controlledScale, bounds.min, bounds.max));
    }
  });

  private readonly _playback = effect((onCleanup) => {
    if (!this._isBrowser || !this.playing() || this.renderTime() !== null) {
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

  private readonly _ambientBackgroundPlayback = effect((onCleanup) => {
    if (
      !this._isBrowser ||
      !this.animateBackground() ||
      this.playing() ||
      this.renderTime() !== null ||
      !this.backgroundEffect()
    ) {
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();
    const baseTime = this.displayTime();

    const tick = (frameTime: number) => {
      this.ambientBackgroundTime.set(baseTime + frameTime - startedAt);
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
    return resolveMotionLayerSnapshot(layer, this.displayTime());
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

  protected isLayerRenderable(layer: MotionLayer): boolean {
    return layer.type !== 'audio';
  }

  protected layerText(layer: MotionLayer): string {
    return coerceMotionString(this.layerSnapshot(layer).props['text'], '');
  }

  protected layerCaptionText(layer: MotionLayer): string {
    const snapshot = this.layerSnapshot(layer);
    const cues = snapshot.props['cues'];

    if (Array.isArray(cues)) {
      const cue = cues.find((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return false;
        }

        const cueValue = item as Record<string, unknown>;
        const start = readMotionNumber(cueValue['start'], 0);
        const end = readMotionNumber(cueValue['end'], Number.POSITIVE_INFINITY);

        return snapshot.localTime >= start && snapshot.localTime <= end;
      }) as Record<string, unknown> | undefined;

      if (cue) {
        return coerceMotionString(cue['text'] as MotionValue | undefined, '');
      }
    }

    return coerceMotionString(snapshot.props['text'], '');
  }

  protected isUnbrokenTextLayer(layer: MotionLayer): boolean {
    if (layer.type !== 'text' && layer.type !== 'caption') {
      return false;
    }

    const text = layer.type === 'caption' ? this.layerCaptionText(layer) : this.layerText(layer);

    return text.length > 0 && !/\s/.test(text);
  }

  protected isSingleLineTextLayer(layer: MotionLayer): boolean {
    return this.isUnbrokenTextLayer(layer);
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

  protected isLayerMediaPlaceholder(layer: MotionLayer): boolean {
    if (layer.type !== 'image' && layer.type !== 'video') {
      return false;
    }

    const props = this.layerSnapshot(layer).props;
    const hasAsset = !!coerceMotionString(props['assetId'], '');
    const hasSource = !!coerceMotionString(props['src'], '');

    return props['placeholder'] === true || (!hasAsset && !hasSource);
  }

  protected layerShapeKind(layer: MotionLayer): string {
    return coerceMotionString(this.layerSnapshot(layer).props['kind'], 'rectangle');
  }

  protected layerPathData(layer: MotionLayer): string {
    return coerceMotionString(
      this.layerSnapshot(layer).props['d'],
      'M 8 50 C 24 8, 76 8, 92 50 C 76 92, 24 92, 8 50 Z',
    );
  }

  protected layerSvgMarkup(layer: MotionLayer): string {
    return coerceMotionString(this.layerSnapshot(layer).props['svg'], '');
  }

  protected layerSvgViewBox(layer: MotionLayer): string {
    return coerceMotionString(this.layerSnapshot(layer).props['viewBox'], '0 0 100 100');
  }

  protected layerFill(layer: MotionLayer): string {
    const snapshot = this.layerSnapshot(layer);

    return snapshot.style.fill ?? snapshot.style.background ?? 'currentColor';
  }

  protected layerStroke(layer: MotionLayer): string {
    const snapshot = this.layerSnapshot(layer);

    return snapshot.style.stroke ?? 'none';
  }

  protected layerStrokeWidth(layer: MotionLayer): number {
    const value = this.layerSnapshot(layer).style.strokeWidth;

    return Number.isFinite(value) ? Math.max(0, value ?? 0) : 0;
  }

  protected layerStrokeLinecap(layer: MotionLayer): string {
    return coerceMotionString(this.layerSnapshot(layer).props['strokeLinecap'], 'round');
  }

  protected layerStrokeLinejoin(layer: MotionLayer): string {
    return coerceMotionString(this.layerSnapshot(layer).props['strokeLinejoin'], 'round');
  }

  protected waveformBars(layer: MotionLayer): MotionWaveformBar[] {
    const snapshot = this.layerSnapshot(layer);
    const samples = readMotionNumberArray(snapshot.props['samples']);
    const values = samples.length ? samples : createFallbackWaveformSamples(layer.id);
    const count = Math.max(1, values.length);
    const gap = Math.min(1.8, 22 / count);
    const width = Math.max(0.8, (100 - gap * (count - 1)) / count);
    const progress = Math.max(0, Math.min(1, snapshot.localTime / Math.max(1, layer.duration)));

    return values.map((sample, index) => {
      const active = index / Math.max(1, count - 1) <= progress;
      const height = Math.max(4, Math.min(96, Math.abs(sample) * 92));

      return {
        index,
        x: index * (width + gap),
        y: 50 - height / 2,
        width,
        height: active ? height : Math.max(4, height * 0.42),
      };
    });
  }

  protected layerMediaTime(layer: MotionLayer): number {
    return Math.max(0, (this.displayTime() - layer.start) / 1000);
  }

  protected handleScaleWheel(event: WheelEvent): void {
    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

    event.preventDefault();

    const bounds = this.safeScaleBounds();
    const direction = event.deltaY < 0 ? 1 : -1;
    const step = Math.max(0.01, Math.abs(this.scaleStep()));
    const nextScale = clampMotionScale(this.playerScale() + direction * step, bounds.min, bounds.max);

    this.internalScale.set(nextScale);
    this.scaleChange.emit(nextScale);
  }

  private sceneEffect(layer: MotionLayer): SceneEffect {
    const scene = this.sceneForLayer(layer);

    if (!scene) {
      return EMPTY_SCENE_EFFECT;
    }

    const localTime = this.displayTime() - scene.start;
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
    const time = this.displayTime();

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
    return !scene.layerIds || scene.layerIds.includes(layerId);
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

const readMotionScaleBounds = (minScale: number, maxScale: number): MotionScaleBounds => {
  const min = Number.isFinite(minScale) ? Math.max(0.01, minScale) : 0.5;
  const max = Number.isFinite(maxScale) ? Math.max(min, maxScale) : 2;

  return { min, max };
};

const clampMotionScale = (scale: number, minScale: number, maxScale: number): number => {
  const nextScale = Number.isFinite(scale) ? scale : 1;

  return Math.min(maxScale, Math.max(minScale, Math.round(nextScale * 100) / 100));
};

const normalizeMotionBackgroundEffectType = (
  effect: MotionBackgroundEffect | null,
): 'aurora' | 'spotlight' | 'mesh' | null => {
  if (effect?.type === 'aurora' || effect?.type === 'spotlight' || effect?.type === 'mesh') {
    return effect.type;
  }

  return null;
};

const createMotionBackgroundEffectStyle = (
  effect: MotionBackgroundEffect | null,
  time: number,
): Record<string, string> => {
  const speed = Math.max(0.1, Number(effect?.speed ?? 1));
  const intensity = Math.max(0, Math.min(1, Number(effect?.intensity ?? 1)));
  const phase = (time / 1000) * speed;

  return {
    '--ngs-motion-background-opacity': `${0.7 + intensity * 0.3}`,
    '--ngs-motion-background-x-a': `${Math.sin(phase * 0.72) * 7}%`,
    '--ngs-motion-background-y-a': `${Math.cos(phase * 0.54) * 6}%`,
    '--ngs-motion-background-x-b': `${Math.cos(phase * 0.46) * 9}%`,
    '--ngs-motion-background-y-b': `${Math.sin(phase * 0.62) * 7}%`,
    '--ngs-motion-background-rotate': `${Math.sin(phase * 0.32) * 12}deg`,
    '--ngs-motion-background-scale': `${1.05 + Math.sin(phase * 0.38) * 0.035}`,
    '--ngs-motion-background-position': `${50 + Math.sin(phase * 0.5) * 14}% ${
      50 + Math.cos(phase * 0.4) * 12
    }%`,
  };
};

const readMotionNumber = (value: unknown, fallback: number): number => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const readMotionNumberArray = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item))
      .map((item) => Math.max(0, Math.min(1, Math.abs(item))));
  }

  if (typeof value === 'string') {
    return value
      .split(/[\s,]+/)
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item))
      .map((item) => Math.max(0, Math.min(1, Math.abs(item))));
  }

  return [];
};

const createFallbackWaveformSamples = (seed: string): number[] => {
  const seedValue = seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

  return Array.from({ length: 36 }, (_, index) => {
    const value =
      Math.sin(index * 0.72 + seedValue * 0.03) * 0.36 +
      Math.cos(index * 0.31 + seedValue * 0.02) * 0.22 +
      0.56;

    return Math.max(0.08, Math.min(1, value));
  });
};

interface MotionScaleBounds {
  min: number;
  max: number;
}

interface SceneEffect {
  opacity: number;
  transform: string;
  filter: string | null;
  clipPath: string | null;
}

interface MotionWaveformBar {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const EMPTY_SCENE_EFFECT: SceneEffect = {
  opacity: 1,
  transform: '',
  filter: null,
  clipPath: null,
};
