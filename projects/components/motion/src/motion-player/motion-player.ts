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
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

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
      '--ngs-motion-player-font-size':
        style.fontSize !== undefined ? `${style.fontSize}px` : '16px',
      '--ngs-motion-player-line-height':
        style.lineHeight !== undefined ? `${style.lineHeight}` : '1.05',
      '--ngs-motion-player-letter-spacing':
        style.letterSpacing !== undefined ? `${style.letterSpacing}px` : '0px',
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

  protected hasTextEffect(layer: MotionLayer): boolean {
    return !!this.readLayerTextEffect(layer);
  }

  protected textEffectSegments(layer: MotionLayer): MotionTextEffectSegment[] {
    const snapshot = this.layerSnapshot(layer);
    const text =
      layer.type === 'caption'
        ? this.layerCaptionText(layer)
        : coerceMotionString(snapshot.props['text'], '');
    const effect = this.readLayerTextEffect(layer);

    if (!effect) {
      return [];
    }

    return createMotionTextEffectSegments(text, effect, snapshot.localTime);
  }

  protected hasMaskedLettersEffect(layer: MotionLayer): boolean {
    return this.readLayerTextEffect(layer)?.type === 'split-text-masked-letters';
  }

  protected textEffectWords(layer: MotionLayer): MotionTextEffectWord[] {
    const snapshot = this.layerSnapshot(layer);
    const text =
      layer.type === 'caption'
        ? this.layerCaptionText(layer)
        : coerceMotionString(snapshot.props['text'], '');
    const effect = this.readLayerTextEffect(layer);

    if (!effect) {
      return [];
    }

    return createSplitTextMaskedLetterWords(text, effect, snapshot.localTime);
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

  private readLayerTextEffect(layer: MotionLayer): MotionTextEffectConfig | null {
    if (layer.type !== 'text' && layer.type !== 'caption') {
      return null;
    }

    return normalizeMotionTextEffect(this.layerSnapshot(layer).props['textEffect']);
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

const normalizeMotionTextEffect = (value: MotionValue | undefined): MotionTextEffectConfig | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const type = normalizeMotionTextEffectType(record['type']);

  if (!type) {
    return null;
  }

  const preset = MOTION_TEXT_EFFECT_PRESETS[type];

  return {
    ...preset,
    duration: Math.max(100, readMotionNumber(record['duration'], preset.duration)),
    delay: Math.max(0, readMotionNumber(record['delay'], preset.delay)),
    stagger: Math.max(0, readMotionNumber(record['stagger'], preset.stagger)),
    distance: Math.max(0, readMotionNumber(record['distance'], preset.distance)),
    ease: coerceMotionString(record['ease'] as MotionValue | undefined, preset.ease),
    startTime: Math.max(0, readMotionNumber(record['startTime'], 0)),
    prepareText: record['prepareText'] === true || preset.prepareText === true,
    useSplitText: record['useSplitText'] === true || preset.useSplitText === true,
    mask: normalizeMotionTextEffectMask(record['mask']) ?? preset.mask,
  };
};

const normalizeMotionTextEffectType = (value: unknown): MotionTextEffectType | null => {
  return typeof value === 'string' && value in MOTION_TEXT_EFFECT_PRESETS
    ? (value as MotionTextEffectType)
    : null;
};

const normalizeMotionTextEffectMask = (value: unknown): MotionTextEffectMask | undefined =>
  value === 'chars' || value === 'words' || value === 'lines' ? value : undefined;

const createMotionTextEffectSegments = (
  text: string,
  effect: MotionTextEffectConfig,
  localTime: number,
): MotionTextEffectSegment[] => {
  const tokens = splitMotionTextEffectTokens(text || ' ', effect);

  return tokens.map((token, index) => ({
    id: `${effect.type}-${index}-${token.text}`,
    text: token.text,
    line: token.line,
    masked: effect.mask === 'chars',
    style: createMotionTextEffectStyle(effect, localTime, index),
  }));
};

const splitMotionTextEffectTokens = (
  text: string,
  effect: MotionTextEffectConfig,
): MotionTextEffectToken[] => {
  if (effect.useSplitText) {
    return splitMotionTextWithGsapSplitText(text, effect);
  }

  if (effect.split === 'lines') {
    return text.split('\n').map((line, index) => ({
      text: line || ' ',
      line: true,
      index,
    }));
  }

  if (effect.split === 'words') {
    if (effect.prepareText) {
      return splitPreparedMotionTextWords(text);
    }

    return text.split(/(\s+)/).map((word, index) => ({
      text: word,
      line: false,
      index,
    }));
  }

  return Array.from(text).map((char, index) => ({
    text: char,
    line: false,
    index,
  }));
};

const splitMotionTextWithGsapSplitText = (
  text: string,
  effect: MotionTextEffectConfig,
): MotionTextEffectToken[] => {
  const cacheKey = `${effect.split}:${effect.mask ?? 'none'}:${effect.prepareText ? 'prepared' : 'raw'}:${text}`;
  const cached = splitTextTokenCache.get(cacheKey);

  if (cached) {
    return cached.map((token) => ({ ...token }));
  }

  const tokens = createSplitTextTokens(text, effect);
  splitTextTokenCache.set(cacheKey, tokens);

  if (splitTextTokenCache.size > 120) {
    const firstKey = splitTextTokenCache.keys().next().value;

    if (firstKey) {
      splitTextTokenCache.delete(firstKey);
    }
  }

  return tokens.map((token) => ({ ...token }));
};

const createSplitTextTokens = (
  text: string,
  effect: MotionTextEffectConfig,
): MotionTextEffectToken[] => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    if (effect.split === 'words') {
      return splitFallbackMotionTextWords(text).map((word, index) => ({
        text: `${word.text}${word.suffix}`,
        line: false,
        index,
      }));
    }

    return Array.from(text).map((char, index) => ({
      text: char,
      line: false,
      index,
    }));
  }

  gsap.registerPlugin(SplitText);

  const host = document.createElement('span');
  host.textContent = text;

  const split = SplitText.create(host, {
    type: effect.type === 'split-text-masked-letters' ? 'chars, words' : effect.split,
    mask: effect.mask,
    tag: 'span',
    aria: 'none',
    reduceWhiteSpace: false,
    charsClass: 'ngs-motion-player__split-char',
    wordsClass: 'ngs-motion-player__split-word',
    wordDelimiter:
      effect.type === 'prepare-text-words'
        ? { delimiter: /\u200c/, replaceWith: ' ' }
        : undefined,
    prepareText:
      effect.type === 'prepare-text-words'
        ? (value: string) => prepareSplitTextWords(value)
        : effect.prepareText
          ? (value: string) => prepareMotionText(value)
          : undefined,
  });
  const source = effect.split === 'chars' ? split.chars : split.words;
  const words =
    effect.type === 'prepare-text-words'
      ? source.map((element) => element.textContent || '').filter((word) => word.trim().length)
      : [];
  const tokens =
    effect.type === 'prepare-text-words'
      ? words.map((word, index) => ({
          text: index < words.length - 1 ? `${word} ` : word || ' ',
          line: false,
          index,
        }))
      : source.map((element, index) => ({
          text: element.textContent || ' ',
          line: false,
          index,
        }));

  split.revert();

  return tokens.length
    ? tokens
    : [
        {
          text: ' ',
          line: false,
          index: 0,
        },
      ];
};

const createSplitTextMaskedLetterWords = (
  text: string,
  effect: MotionTextEffectConfig,
  localTime: number,
): MotionTextEffectWord[] => {
  const words = splitMotionTextWordsWithGsapSplitText(text || ' ', effect);
  let charIndex = 0;

  return words.map((word, wordIndex) => ({
    id: `masked-word-${wordIndex}-${word.text}`,
    suffix: word.suffix,
    chars: word.chars.map((char) => {
      const index = charIndex++;

      return {
        id: `masked-char-${wordIndex}-${index}-${char}`,
        text: char,
        style: createMotionTextEffectStyle(effect, localTime, index),
      };
    }),
  }));
};

const splitMotionTextWordsWithGsapSplitText = (
  text: string,
  effect: MotionTextEffectConfig,
): MotionTextEffectWordToken[] => {
  const cacheKey = `words:${effect.mask ?? 'none'}:${effect.prepareText ? 'prepared' : 'raw'}:${text}`;
  const cached = splitTextWordCache.get(cacheKey);

  if (cached) {
    return cached.map((word) => ({ ...word, chars: [...word.chars] }));
  }

  const words = createSplitTextWordTokens(text, effect);
  splitTextWordCache.set(cacheKey, words);

  if (splitTextWordCache.size > 80) {
    const firstKey = splitTextWordCache.keys().next().value;

    if (firstKey) {
      splitTextWordCache.delete(firstKey);
    }
  }

  return words.map((word) => ({ ...word, chars: [...word.chars] }));
};

const createSplitTextWordTokens = (
  text: string,
  effect: MotionTextEffectConfig,
): MotionTextEffectWordToken[] => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return splitFallbackMotionTextWords(text);
  }

  gsap.registerPlugin(SplitText);

  const sourceWords = splitFallbackMotionTextWords(text);
  const host = document.createElement('span');
  host.textContent = text;

  const split = SplitText.create(host, {
    type: 'chars, words',
    mask: effect.mask,
    tag: 'span',
    aria: 'none',
    charsClass: 'char++',
    wordsClass: 'word++',
    prepareText: effect.prepareText ? (value: string) => prepareMotionText(value) : undefined,
  });
  const words = split.words.map((word, index) => ({
    text: word.textContent || sourceWords[index]?.text || ' ',
    chars: Array.from(word.querySelectorAll<HTMLElement>('span'))
      .map((char) => char.textContent || '')
      .filter(Boolean),
    suffix: sourceWords[index]?.suffix ?? (index < split.words.length - 1 ? ' ' : ''),
  }));

  split.revert();

  return words.length
    ? words.map((word) => ({
        ...word,
        chars: word.chars.length ? word.chars : Array.from(word.text || ' '),
      }))
    : splitFallbackMotionTextWords(text);
};

const splitFallbackMotionTextWords = (text: string): MotionTextEffectWordToken[] => {
  const matches = text.match(/\S+\s*/g) ?? [text || ' '];

  return matches.map((match) => {
    const suffix = match.match(/\s+$/)?.[0] ?? '';
    const word = suffix ? match.slice(0, -suffix.length) : match;

    return {
      text: word || ' ',
      chars: Array.from(word || ' '),
      suffix,
    };
  });
};

const splitPreparedMotionTextWords = (text: string): MotionTextEffectToken[] => {
  const prepared = prepareMotionText(text);
  const matches = prepared.match(/\S+\s*/g);
  const words = matches?.length ? matches : [prepared || ' '];

  return words.map((word, index) => ({
    text: word,
    line: false,
    index,
  }));
};

const prepareMotionText = (text: string): string =>
  text.replace(/\r\n?/g, '\n').replace(/[^\S\n]+/g, ' ');

const prepareSplitTextWords = (text: string): string => {
  const prepared = prepareMotionText(text);

  if (!MOTION_WORD_SEGMENTER) {
    return prepared;
  }

  return Array.from(MOTION_WORD_SEGMENTER.segment(prepared))
    .map((segment) => segment.segment)
    .join(SPLIT_TEXT_WORD_DELIMITER);
};

const createMotionTextEffectStyle = (
  effect: MotionTextEffectConfig,
  localTime: number,
  index: number,
): Record<string, string | number | null> => {
  const state = createMotionTextEffectInitialState(effect, index);
  const staggerDelay =
    effect.type === 'split-text-masked-letters'
      ? seededMotionRandom(`masked-order-${index}`) * effect.stagger
      : index * effect.stagger;
  const progress = clampUnit(
    (localTime - (effect.startTime ?? 0) - effect.delay - staggerDelay) / effect.duration,
  );
  const timeline = gsap.timeline({ paused: true });

  timeline.to(state, {
    opacity: 1,
    x: 0,
    y: 0,
    xPercent: 0,
    yPercent: 0,
    scale: 1,
    rotate: 0,
    skewY: 0,
    blur: 0,
    duration: 1,
    ease: effect.ease,
  });
  timeline.progress(progress);
  timeline.kill();

  return {
    opacity: roundMotionPlayerNumber(state.opacity, 4),
    transform: [
      `translate(${roundMotionPlayerNumber(state.xPercent, 3)}%, ${roundMotionPlayerNumber(state.yPercent, 3)}%)`,
      `translate3d(${roundMotionPlayerNumber(state.x, 3)}px, ${roundMotionPlayerNumber(state.y, 3)}px, 0)`,
      `rotate(${roundMotionPlayerNumber(state.rotate, 3)}deg)`,
      `skewY(${roundMotionPlayerNumber(state.skewY, 3)}deg)`,
      `scale(${roundMotionPlayerNumber(state.scale, 4)})`,
    ].join(' '),
    filter: state.blur > 0.01 ? `blur(${roundMotionPlayerNumber(state.blur, 3)}px)` : null,
  };
};

const createMotionTextEffectInitialState = (
  effect: MotionTextEffectConfig,
  index = 0,
): MotionTextEffectState => {
  switch (effect.type) {
    case 'split-text-masked-letters':
      const spread = Math.max(0, effect.distance);

      return {
        opacity: 1,
        x: 0,
        y: 0,
        xPercent: readSeededMotionRange(`masked-x-${index}`, -spread, spread),
        yPercent: readSeededMotionRange(`masked-y-${index}`, -spread, spread),
        scale: 1,
        rotate: 0,
        skewY: 0,
        blur: 0,
      };
    case 'prepare-text-words':
      return {
        opacity: 0,
        x: 0,
        y: effect.distance,
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        rotate: 0,
        skewY: 0,
        blur: 0,
      };
    case 'words-fade-up':
      return {
        opacity: 0,
        x: 0,
        y: effect.distance * 0.55,
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        rotate: 0,
        skewY: 0,
        blur: 0,
      };
    case 'chars-blur-in':
      return {
        opacity: 0,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        rotate: 0,
        skewY: 0,
        blur: 14,
      };
    case 'lines-mask-up':
      return {
        opacity: 0,
        x: 0,
        y: effect.distance,
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        rotate: 0,
        skewY: 0,
        blur: 0,
      };
    case 'chars-scale-pop':
      return {
        opacity: 0,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: 0.42,
        rotate: -7,
        skewY: 0,
        blur: 0,
      };
    case 'chars-slide-up':
    default:
      return {
        opacity: 0,
        x: 0,
        y: effect.distance,
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        rotate: 0,
        skewY: -4,
        blur: 0,
      };
  }
};

const clampUnit = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
};

const roundMotionPlayerNumber = (value: number, precision: number): number => {
  const factor = 10 ** precision;

  return Math.round(value * factor) / factor;
};

const readSeededMotionRange = (seed: string, min: number, max: number): number =>
  min + (max - min) * seededMotionRandom(seed);

const seededMotionRandom = (seed: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index++) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
};

function createMotionWordSegmenter(): MotionWordSegmenter | null {
  if (typeof Intl === 'undefined') {
    return null;
  }

  const IntlWithSegmenter = Intl as typeof Intl & {
    Segmenter?: new (
      locale: string,
      options: { granularity: 'word' },
    ) => MotionWordSegmenter;
  };

  return typeof IntlWithSegmenter.Segmenter === 'function'
    ? new IntlWithSegmenter.Segmenter('zh', { granularity: 'word' })
    : null;
}

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

type MotionTextEffectType =
  | 'chars-slide-up'
  | 'words-fade-up'
  | 'chars-blur-in'
  | 'lines-mask-up'
  | 'chars-scale-pop'
  | 'prepare-text-words'
  | 'split-text-masked-letters';

type MotionTextEffectSplit = 'chars' | 'words' | 'lines';
type MotionTextEffectMask = 'chars' | 'words' | 'lines';

interface MotionTextEffectConfig {
  type: MotionTextEffectType;
  split: MotionTextEffectSplit;
  duration: number;
  delay: number;
  stagger: number;
  distance: number;
  ease: string;
  startTime?: number;
  prepareText?: boolean;
  useSplitText?: boolean;
  mask?: MotionTextEffectMask;
}

interface MotionTextEffectToken {
  text: string;
  line: boolean;
  index: number;
}

interface MotionTextEffectSegment {
  id: string;
  text: string;
  line: boolean;
  masked: boolean;
  style: Record<string, string | number | null>;
}

interface MotionTextEffectChar {
  id: string;
  text: string;
  style: Record<string, string | number | null>;
}

interface MotionTextEffectWord {
  id: string;
  chars: MotionTextEffectChar[];
  suffix: string;
}

interface MotionTextEffectWordToken {
  text: string;
  chars: string[];
  suffix: string;
}

interface MotionWordSegment {
  segment: string;
}

interface MotionWordSegmenter {
  segment(text: string): Iterable<MotionWordSegment>;
}

interface MotionTextEffectState {
  opacity: number;
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
  scale: number;
  rotate: number;
  skewY: number;
  blur: number;
}

const SPLIT_TEXT_WORD_DELIMITER = String.fromCharCode(8204);
const MOTION_WORD_SEGMENTER = createMotionWordSegmenter();

const MOTION_TEXT_EFFECT_PRESETS: Record<MotionTextEffectType, MotionTextEffectConfig> = {
  'chars-slide-up': {
    type: 'chars-slide-up',
    split: 'chars',
    duration: 620,
    delay: 0,
    stagger: 24,
    distance: 44,
    ease: 'power3.out',
  },
  'words-fade-up': {
    type: 'words-fade-up',
    split: 'words',
    duration: 560,
    delay: 0,
    stagger: 70,
    distance: 42,
    ease: 'power2.out',
  },
  'prepare-text-words': {
    type: 'prepare-text-words',
    split: 'words',
    duration: 600,
    delay: 0,
    stagger: 100,
    distance: 50,
    ease: 'back.out(1.7)',
    prepareText: true,
    useSplitText: true,
  },
  'split-text-masked-letters': {
    type: 'split-text-masked-letters',
    split: 'chars',
    duration: 600,
    delay: 0,
    stagger: 600,
    distance: 150,
    ease: 'power3.out',
    useSplitText: true,
    mask: 'words',
  },
  'chars-blur-in': {
    type: 'chars-blur-in',
    split: 'chars',
    duration: 520,
    delay: 0,
    stagger: 18,
    distance: 0,
    ease: 'power2.out',
  },
  'lines-mask-up': {
    type: 'lines-mask-up',
    split: 'lines',
    duration: 720,
    delay: 0,
    stagger: 110,
    distance: 58,
    ease: 'power4.out',
  },
  'chars-scale-pop': {
    type: 'chars-scale-pop',
    split: 'chars',
    duration: 540,
    delay: 0,
    stagger: 22,
    distance: 0,
    ease: 'back.out(1.7)',
  },
};

const splitTextTokenCache = new Map<string, MotionTextEffectToken[]>();
const splitTextWordCache = new Map<string, MotionTextEffectWordToken[]>();

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
