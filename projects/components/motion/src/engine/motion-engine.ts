import {
  MotionAnimation,
  MotionDocument,
  MotionEasingName,
  MotionKeyframe,
  MotionLayer,
  MotionLayerSnapshot,
  MotionLayout,
  MotionPrimitive,
  MotionStyle,
  MotionTransition,
  MotionValue,
} from '../schema/motion-document';

const EASINGS: Record<MotionEasingName, (value: number) => number> = {
  linear: (value) => value,
  easeInQuad: (value) => value * value,
  easeOutQuad: (value) => value * (2 - value),
  easeInOutQuad: (value) => (value < 0.5 ? 2 * value * value : -1 + (4 - 2 * value) * value),
  easeInCubic: (value) => value * value * value,
  easeOutCubic: (value) => --value * value * value + 1,
  easeInOutCubic: (value) =>
    value < 0.5 ? 4 * value * value * value : (value - 1) * (2 * value - 2) * (2 * value - 2) + 1,
  easeInQuart: (value) => value * value * value * value,
  easeOutQuart: (value) => 1 - (1 - value) ** 4,
  easeInOutQuart: (value) =>
    value < 0.5 ? 8 * value ** 4 : 1 - (-2 * value + 2) ** 4 / 2,
  smooth: (value) => value * value * value * (value * (value * 6 - 15) + 10),
  easeInBack: (value) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return c3 * value ** 3 - c1 * value ** 2;
  },
  easeOutBack: (value) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * (value - 1) ** 3 + c1 * (value - 1) ** 2;
  },
  easeInOutBack: (value) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return value < 0.5
      ? ((2 * value) ** 2 * ((c2 + 1) * 2 * value - c2)) / 2
      : ((2 * value - 2) ** 2 * ((c2 + 1) * (value * 2 - 2) + c2) + 2) / 2;
  },
  easeInBounce: (value) => 1 - EASINGS.easeOutBounce(1 - value),
  easeOutBounce: (value) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (value < 1 / d1) {
      return n1 * value * value;
    }

    if (value < 2 / d1) {
      return n1 * (value -= 1.5 / d1) * value + 0.75;
    }

    if (value < 2.5 / d1) {
      return n1 * (value -= 2.25 / d1) * value + 0.9375;
    }

    return n1 * (value -= 2.625 / d1) * value + 0.984375;
  },
  easeInOutBounce: (value) =>
    value < 0.5
      ? (1 - EASINGS.easeOutBounce(1 - 2 * value)) / 2
      : (1 + EASINGS.easeOutBounce(2 * value - 1)) / 2,
  spring: (value) => 1 - Math.cos(value * Math.PI * 4.5) * Math.exp(-value * 6),
  springSoft: (value) => 1 - Math.cos(value * Math.PI * 3) * Math.exp(-value * 5),
};

export const clampMotionTime = (time: number, document: MotionDocument): number => {
  const duration = document.composition.duration;
  return Math.max(0, Math.min(duration, time));
};

export const sortMotionLayers = (layers: MotionLayer[]): MotionLayer[] => {
  return [...layers].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
};

export const resolveMotionLayerSnapshot = (
  layer: MotionLayer,
  time: number,
): MotionLayerSnapshot => {
  const localTime = time - layer.start;
  const visible = !layer.hidden && localTime >= 0 && localTime <= layer.duration;
  const layout: MotionLayout = { ...layer.layout };
  const style: MotionStyle = { ...(layer.style ?? {}) };
  const props: Record<string, MotionValue> = { ...(layer.props ?? {}) };

  for (const animation of layer.animations ?? []) {
    const value =
      animation.property === 'textEffect'
        ? resolveMotionTextEffectAnimation(animation, localTime)
        : resolveMotionAnimation(animation, localTime);

    applyMotionValue(animation.property, value, layout, style, props, layer);
  }

  const transitionOpacity = applyMotionTransitions(
    layer.transitions,
    localTime,
    layer.duration,
    layout,
    style,
  );
  const opacity = normalizeOpacity(
    (typeof style.opacity === 'number' ? style.opacity : (layer.opacity ?? 1)) * transitionOpacity,
  );

  return {
    visible,
    localTime,
    opacity,
    layout,
    style,
    props,
    transform: buildMotionTransform(layout),
  };
};

export const resolveMotionAnimation = (
  animation: MotionAnimation,
  localTime: number,
): MotionValue => {
  const keyframes = [...animation.keyframes].sort((a, b) => a.time - b.time);

  if (!keyframes.length) {
    return null;
  }

  const effectiveTime = resolveMotionAnimationTime(animation, keyframes, localTime);

  if (effectiveTime <= keyframes[0].time) {
    return keyframes[0].value;
  }

  const last = keyframes[keyframes.length - 1];
  if (effectiveTime >= last.time) {
    return last.value;
  }

  const nextIndex = keyframes.findIndex((keyframe) => keyframe.time >= effectiveTime);
  const previous = keyframes[Math.max(0, nextIndex - 1)];
  const next = keyframes[nextIndex];
  const span = Math.max(1, next.time - previous.time);
  const progress = (effectiveTime - previous.time) / span;
  const easingName = next.easing ?? animation.easing ?? 'linear';
  const eased = EASINGS[easingName](Math.max(0, Math.min(1, progress)));

  return interpolateMotionValue(previous.value, next.value, eased);
};

const resolveMotionAnimationTime = (
  animation: MotionAnimation,
  keyframes: MotionKeyframe[],
  localTime: number,
): number => {
  const delay = Math.max(0, animation.delay ?? 0);
  const startTime = keyframes[0].time;
  const endTime = keyframes[keyframes.length - 1].time;
  const span = Math.max(1, endTime - startTime);
  const delayedTime = localTime - delay;

  if (delayedTime <= startTime) {
    return startTime;
  }

  const repeat =
    animation.repeat === 'infinite'
      ? Number.POSITIVE_INFINITY
      : Math.max(1, Math.floor(animation.repeat ?? 1));
  const iteration = Math.floor((delayedTime - startTime) / span);

  if (Number.isFinite(repeat) && iteration >= repeat) {
    return animation.direction === 'reverse' ? startTime : endTime;
  }

  const elapsed = (delayedTime - startTime) % span;
  const reversed =
    animation.direction === 'reverse' ||
    (animation.direction === 'alternate' && iteration % 2 === 1);

  return reversed ? endTime - elapsed : startTime + elapsed;
};

const resolveMotionTextEffectAnimation = (
  animation: MotionAnimation,
  localTime: number,
): MotionValue => {
  const keyframes = [...animation.keyframes].sort((a, b) => a.time - b.time);
  const activeKeyframe = [...keyframes].reverse().find((keyframe) => keyframe.time <= localTime);

  if (!activeKeyframe || activeKeyframe.value === null) {
    return null;
  }

  if (isMotionRecord(activeKeyframe.value)) {
    return {
      ...activeKeyframe.value,
      startTime: activeKeyframe.time,
    };
  }

  return activeKeyframe.value;
};

export const interpolateMotionValue = (
  from: MotionValue,
  to: MotionValue,
  progress: number,
): MotionValue => {
  if (typeof from === 'number' && typeof to === 'number') {
    return from + (to - from) * progress;
  }

  if (Array.isArray(from) && Array.isArray(to) && from.length === to.length) {
    return from.map((value, index) => interpolateMotionValue(value, to[index], progress));
  }

  if (typeof from === 'string' && typeof to === 'string') {
    return interpolateMotionColor(from, to, progress) ?? interpolateMotionString(from, to, progress);
  }

  return progress < 1 ? from : to;
};

const isMotionRecord = (value: MotionValue): value is { [key: string]: MotionValue } =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const interpolateMotionString = (from: string, to: string, progress: number): string => {
  const fromParts = parseMotionNumberString(from);
  const toParts = parseMotionNumberString(to);

  if (!fromParts || !toParts || fromParts.suffix !== toParts.suffix) {
    return progress < 1 ? from : to;
  }

  const value = fromParts.value + (toParts.value - fromParts.value) * progress;
  const rounded = Math.round(value * 100) / 100;
  const prefix = toParts.prefix === '+' && rounded >= 0 ? '+' : '';

  return `${prefix}${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded}${toParts.suffix}`;
};

const parseMotionNumberString = (
  value: string,
): { prefix: string; value: number; suffix: string } | null => {
  const match = value.trim().match(/^([+-]?)(\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return null;
  }

  const [, prefix, numberValue, suffix] = match;

  return {
    prefix,
    value: Number(`${prefix || ''}${numberValue}`),
    suffix,
  };
};

const interpolateMotionColor = (from: string, to: string, progress: number): string | null => {
  const fromColor = parseMotionColor(from);
  const toColor = parseMotionColor(to);

  if (!fromColor || !toColor) {
    return null;
  }

  const channel = (start: number, end: number) => Math.round(start + (end - start) * progress);
  const alpha = fromColor.a + (toColor.a - fromColor.a) * progress;

  if (alpha < 1) {
    return `rgba(${channel(fromColor.r, toColor.r)}, ${channel(fromColor.g, toColor.g)}, ${channel(fromColor.b, toColor.b)}, ${roundMotionNumber(alpha, 3)})`;
  }

  return `rgb(${channel(fromColor.r, toColor.r)}, ${channel(fromColor.g, toColor.g)}, ${channel(fromColor.b, toColor.b)})`;
};

const parseMotionColor = (
  value: string,
): { r: number; g: number; b: number; a: number } | null => {
  const normalized = value.trim();
  const hex = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

  if (hex) {
    const raw = hex[1];
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((part) => `${part}${part}`)
            .join('')
        : raw;

    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16),
      a: full.length === 8 ? Number.parseInt(full.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = normalized.match(
    /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)$/i,
  );

  if (!rgb) {
    return null;
  }

  return {
    r: Number(rgb[1]),
    g: Number(rgb[2]),
    b: Number(rgb[3]),
    a: rgb[4] === undefined ? 1 : Number(rgb[4]),
  };
};

export const flattenMotionLayers = (
  layers: MotionLayer[],
  depth = 0,
): Array<{ layer: MotionLayer; depth: number }> => {
  return layers.flatMap((layer) => [
    { layer, depth },
    ...flattenMotionLayers(layer.children ?? [], depth + 1),
  ]);
};

const applyMotionValue = (
  property: string,
  value: MotionValue,
  layout: MotionLayout,
  style: MotionStyle,
  props: Record<string, MotionValue>,
  layer: MotionLayer,
): void => {
  if (value === null) {
    if (property === 'textEffect') {
      delete props[property];
    }

    return;
  }

  if (isLayoutProperty(property) && typeof value === 'number') {
    layout[property] = value;
    return;
  }

  if (property === 'opacity' && typeof value === 'number') {
    style.opacity = value;
    return;
  }

  if (isStyleProperty(property)) {
    (style as Record<string, MotionValue>)[property] = value;
    return;
  }

  props[property] = value;
};

const isLayoutProperty = (property: string): property is keyof MotionLayout => {
  return [
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'scale',
    'scaleX',
    'scaleY',
    'skewX',
    'skewY',
    'anchorX',
    'anchorY',
  ].includes(property);
};

const isStyleProperty = (property: string): property is keyof MotionStyle => {
  return [
    'opacity',
    'color',
    'background',
    'fill',
    'stroke',
    'strokeWidth',
    'borderRadius',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'textAlign',
    'objectFit',
    'padding',
  ].includes(property);
};

const buildMotionTransform = (layout: MotionLayout): string => {
  const anchorX = layout.anchorX ?? 0;
  const anchorY = layout.anchorY ?? 0;
  const rotation = layout.rotation ?? 0;
  const scale = layout.scale ?? 1;
  const scaleX = layout.scaleX ?? 1;
  const scaleY = layout.scaleY ?? 1;
  const skewX = layout.skewX ?? 0;
  const skewY = layout.skewY ?? 0;

  return `translate(${-anchorX * 100}%, ${-anchorY * 100}%) rotate(${rotation}deg) skew(${skewX}deg, ${skewY}deg) scale(${scale * scaleX}, ${scale * scaleY})`;
};

const applyMotionTransitions = (
  transitions: MotionLayer['transitions'] | undefined,
  localTime: number,
  layerDuration: number,
  layout: MotionLayout,
  style: MotionStyle,
): number => {
  let opacity = 1;

  if (transitions?.in) {
    opacity *= applyMotionTransition(transitions.in, 'in', localTime, layerDuration, layout, style);
  }

  if (transitions?.out) {
    opacity *= applyMotionTransition(
      transitions.out,
      'out',
      localTime,
      layerDuration,
      layout,
      style,
    );
  }

  return opacity;
};

export const applyMotionTransition = (
  transition: MotionTransition,
  edge: 'in' | 'out',
  localTime: number,
  layerDuration: number,
  layout: MotionLayout,
  style: MotionStyle,
): number => {
  const duration = Math.max(1, Math.min(layerDuration, transition.duration));
  const rawProgress =
    edge === 'in'
      ? 1 - Math.max(0, Math.min(1, localTime / duration))
      : Math.max(0, Math.min(1, (localTime - (layerDuration - duration)) / duration));
  const progress = EASINGS[transition.easing ?? 'easeOutCubic'](rawProgress);
  const direction = readTransitionDirection(transition, edge);

  switch (transition.type) {
    case 'fade':
      return edge === 'in' ? 1 - progress : 1 - progress;
    case 'slide':
      applySlideTransition(layout, direction, progress, readTransitionDistance(transition));
      return 1;
    case 'wipe':
      style.clipPath = buildWipeClipPath(direction, progress);
      return 1;
    case 'blur':
      style.filter = appendFilter(style.filter, `blur(${roundMotionNumber(progress * 16, 2)}px)`);
      return 1;
    case 'scale':
    case 'zoom':
      layout.scale = (layout.scale ?? 1) * (1 - progress * 0.18);
      return 1;
    default:
      return 1;
  }
};

const applySlideTransition = (
  layout: MotionLayout,
  direction: TransitionDirection,
  progress: number,
  distance: number,
): void => {
  if (direction === 'left') {
    layout.x -= distance * progress;
  } else if (direction === 'right') {
    layout.x += distance * progress;
  } else if (direction === 'up') {
    layout.y -= distance * progress;
  } else {
    layout.y += distance * progress;
  }
};

const buildWipeClipPath = (direction: TransitionDirection, progress: number): string => {
  const amount = roundMotionNumber(progress * 100, 2);

  if (direction === 'left') {
    return `inset(0 0 0 ${amount}%)`;
  }

  if (direction === 'right') {
    return `inset(0 ${amount}% 0 0)`;
  }

  if (direction === 'up') {
    return `inset(${amount}% 0 0 0)`;
  }

  return `inset(0 0 ${amount}% 0)`;
};

const appendFilter = (filter: string | undefined, nextFilter: string): string =>
  filter ? `${filter} ${nextFilter}` : nextFilter;

const readTransitionDirection = (
  transition: MotionTransition,
  edge: 'in' | 'out',
): TransitionDirection => {
  const value = transition.props?.['direction'];

  if (value === 'left' || value === 'right' || value === 'up' || value === 'down') {
    return value;
  }

  return edge === 'in' ? 'left' : 'right';
};

const readTransitionDistance = (transition: MotionTransition): number => {
  const value = Number(transition.props?.['distance'] ?? 120);

  return Number.isFinite(value) ? value : 120;
};

const normalizeOpacity = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(0, Math.min(1, value));
};

const roundMotionNumber = (value: number, precision: number): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

type TransitionDirection = 'left' | 'right' | 'up' | 'down';

export const coerceMotionNumber = (value: unknown, fallback = 0): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export const coerceMotionString = (value: MotionValue | undefined, fallback = ''): string => {
  return typeof value === 'string' || typeof value === 'number' ? `${value}` : fallback;
};

export const coerceMotionPrimitive = (
  value: MotionValue | undefined,
  fallback: MotionPrimitive,
): MotionPrimitive => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value as MotionPrimitive;
  }

  return fallback;
};
