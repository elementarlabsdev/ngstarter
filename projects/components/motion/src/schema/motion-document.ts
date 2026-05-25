export type MotionPrimitive = string | number | boolean | null;

export type MotionValue = MotionPrimitive | MotionValue[] | { [key: string]: MotionValue };

export type MotionLayerType =
  | 'text'
  | 'caption'
  | 'shape'
  | 'path'
  | 'svg'
  | 'waveform'
  | 'image'
  | 'video'
  | 'audio'
  | 'group'
  | string;

export type MotionShapeKind = 'rectangle' | 'ellipse';

export type MotionEasingName =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'smooth'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce'
  | 'spring'
  | 'springSoft';

export interface MotionComposition {
  width: number;
  height: number;
  fps: number;
  duration: number;
  background?: string;
  backgroundEffect?: MotionBackgroundEffect;
}

export type MotionBackgroundEffectType = 'aurora' | 'spotlight' | 'mesh' | string;

export interface MotionBackgroundEffect {
  type: MotionBackgroundEffectType;
  speed?: number;
  intensity?: number;
}

export interface MotionAsset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'json' | string;
  src: string;
  name?: string;
  metadata?: Record<string, MotionValue>;
}

export interface MotionFontFace {
  id: string;
  family: string;
  src?: string;
  weight?: number | string;
  style?: 'normal' | 'italic' | string;
}

export interface MotionTimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'overlay' | string;
  name?: string;
  layerIds?: string[];
  muted?: boolean;
  locked?: boolean;
}

export interface MotionEditorSettings {
  gridVisible?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  zoom?: number;
  previewScale?: number;
}

export interface MotionLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
  anchorX?: number;
  anchorY?: number;
}

export interface MotionStyle {
  opacity?: number;
  color?: string;
  background?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  padding?: number;
  filter?: string;
  clipPath?: string;
}

export interface MotionKeyframe<T extends MotionValue = MotionValue> {
  time: number;
  value: T;
  easing?: MotionEasingName;
}

export interface MotionAnimation<T extends MotionValue = MotionValue> {
  id?: string;
  property: string;
  keyframes: MotionKeyframe<T>[];
  easing?: MotionEasingName;
  delay?: number;
  repeat?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
}

export interface MotionTransition {
  id?: string;
  type: 'fade' | 'slide' | 'wipe' | 'scale' | 'zoom' | 'blur' | string;
  duration: number;
  easing?: MotionEasingName;
  props?: Record<string, MotionValue>;
}

export interface MotionScene {
  id: string;
  name?: string;
  start: number;
  duration: number;
  layerIds?: string[];
  transitionIn?: MotionTransition;
  transitionOut?: MotionTransition;
}

export interface MotionLayer {
  id: string;
  type: MotionLayerType;
  name?: string;
  start: number;
  duration: number;
  zIndex?: number;
  locked?: boolean;
  hidden?: boolean;
  opacity?: number;
  layout: MotionLayout;
  style?: MotionStyle;
  props?: Record<string, MotionValue>;
  animations?: MotionAnimation[];
  transitions?: {
    in?: MotionTransition;
    out?: MotionTransition;
  };
  children?: MotionLayer[];
}

export interface MotionDocument {
  version: string;
  composition: MotionComposition;
  assets?: MotionAsset[];
  fonts?: MotionFontFace[];
  scenes?: MotionScene[];
  tracks?: MotionTimelineTrack[];
  editor?: MotionEditorSettings;
  layers: MotionLayer[];
  metadata?: Record<string, MotionValue>;
}

export interface MotionDocumentValidationIssue {
  path: string;
  code: string;
  message: string;
}

export interface MotionLayerSnapshot {
  visible: boolean;
  localTime: number;
  opacity: number;
  layout: MotionLayout;
  style: MotionStyle;
  props: Record<string, MotionValue>;
  transform: string;
}

export const DEFAULT_MOTION_COMPOSITION_DURATION = 5 * 60 * 1000;
export const DEFAULT_MOTION_COMPOSITION_BACKGROUND = '#111827';

export const createDefaultMotionDocument = (): MotionDocument => ({
  version: '0.1',
  composition: {
    width: 1920,
    height: 1080,
    fps: 30,
    duration: DEFAULT_MOTION_COMPOSITION_DURATION,
    background: DEFAULT_MOTION_COMPOSITION_BACKGROUND,
  },
  assets: [],
  fonts: [],
  tracks: [
    {
      id: 'scene',
      type: 'overlay',
      name: 'Scene',
      layerIds: ['title', 'accent'],
    },
  ],
  scenes: [
    {
      id: 'intro',
      name: 'Intro',
      start: 0,
      duration: 4200,
      layerIds: ['title', 'accent'],
      transitionIn: {
        type: 'fade',
        duration: 500,
        easing: 'easeOutCubic',
      },
      transitionOut: {
        type: 'wipe',
        duration: 600,
        easing: 'easeInOutCubic',
        props: { direction: 'right' },
      },
    },
  ],
  editor: {
    gridVisible: true,
    snapToGrid: false,
    gridSize: 80,
    zoom: 4,
    previewScale: 1,
  },
  layers: [
    {
      id: 'title',
      type: 'text',
      name: 'Title',
      start: 0,
      duration: 4200,
      zIndex: 2,
      layout: {
        x: 160,
        y: 172,
        width: 980,
        height: 180,
      },
      style: {
        color: '#111827',
        fontSize: 92,
        fontWeight: 700,
        lineHeight: 1.35,
        textAlign: 'left',
      },
      props: {
        text: 'Motion scene',
      },
      transitions: {
        in: {
          type: 'slide',
          duration: 600,
          easing: 'easeOutCubic',
          props: { direction: 'left', distance: 140 },
        },
        out: {
          type: 'fade',
          duration: 500,
          easing: 'easeInOutCubic',
        },
      },
      animations: [
        {
          property: 'opacity',
          keyframes: [
            { time: 0, value: 0 },
            { time: 600, value: 1, easing: 'easeOutCubic' },
            { time: 3600, value: 1 },
            { time: 4200, value: 0, easing: 'easeInCubic' },
          ],
        },
        {
          property: 'y',
          keyframes: [
            { time: 0, value: 216 },
            { time: 600, value: 172, easing: 'easeOutCubic' },
          ],
        },
      ],
    },
    {
      id: 'accent',
      type: 'shape',
      name: 'Accent bar',
      start: 180,
      duration: 3600,
      zIndex: 1,
      layout: {
        x: 160,
        y: 388,
        width: 560,
        height: 18,
      },
      style: {
        background: '#38bdf8',
        borderRadius: 999,
      },
      props: {
        kind: 'rectangle',
      },
      transitions: {
        in: {
          type: 'wipe',
          duration: 650,
          easing: 'easeOutCubic',
          props: { direction: 'left' },
        },
      },
      animations: [
        {
          property: 'width',
          keyframes: [
            { time: 0, value: 0 },
            { time: 700, value: 560, easing: 'easeOutCubic' },
          ],
        },
      ],
    },
  ],
});

export const validateMotionDocument = (
  document: MotionDocument | null | undefined,
): MotionDocumentValidationIssue[] => {
  const issues: MotionDocumentValidationIssue[] = [];

  if (!document) {
    return [
      {
        path: '$',
        code: 'document.required',
        message: 'Motion document is required.',
      },
    ];
  }

  if (!document.version) {
    issues.push({
      path: 'version',
      code: 'version.required',
      message: 'Motion document version is required.',
    });
  }

  validatePositiveNumber(issues, 'composition.width', document.composition?.width);
  validatePositiveNumber(issues, 'composition.height', document.composition?.height);
  validatePositiveNumber(issues, 'composition.fps', document.composition?.fps);
  validatePositiveNumber(issues, 'composition.duration', document.composition?.duration);

  const layerIds = new Set<string>();
  validateMotionLayers(issues, document.layers ?? [], layerIds, 'layers');

  for (const asset of document.assets ?? []) {
    if (!asset.id) {
      issues.push({
        path: 'assets',
        code: 'asset.id.required',
        message: 'Every asset must have an id.',
      });
    }

    if (!asset.src) {
      issues.push({
        path: `assets.${asset.id || 'unknown'}.src`,
        code: 'asset.src.required',
        message: 'Every asset must define a source.',
      });
    }
  }

  for (const track of document.tracks ?? []) {
    for (const layerId of track.layerIds ?? []) {
      if (!layerIds.has(layerId)) {
        issues.push({
          path: `tracks.${track.id}.layerIds`,
          code: 'track.layer.missing',
          message: `Track "${track.id}" references missing layer "${layerId}".`,
        });
      }
    }
  }

  const sceneIds = new Set<string>();

  for (const scene of document.scenes ?? []) {
    const scenePath = `scenes.${scene.id || 'unknown'}`;

    if (!scene.id) {
      issues.push({
        path: 'scenes',
        code: 'scene.id.required',
        message: 'Every scene must have an id.',
      });
    } else if (sceneIds.has(scene.id)) {
      issues.push({
        path: scenePath,
        code: 'scene.id.duplicate',
        message: `Scene id "${scene.id}" is duplicated.`,
      });
    } else {
      sceneIds.add(scene.id);
    }

    validateNonNegativeNumber(issues, `${scenePath}.start`, scene.start);
    validatePositiveNumber(issues, `${scenePath}.duration`, scene.duration);

    for (const layerId of scene.layerIds ?? []) {
      if (!layerIds.has(layerId)) {
        issues.push({
          path: `${scenePath}.layerIds`,
          code: 'scene.layer.missing',
          message: `Scene "${scene.id}" references missing layer "${layerId}".`,
        });
      }
    }
  }

  return issues;
};

const validateMotionLayers = (
  issues: MotionDocumentValidationIssue[],
  layers: MotionLayer[],
  layerIds: Set<string>,
  path: string,
): void => {
  for (const layer of layers) {
    const layerPath = `${path}.${layer.id || 'unknown'}`;

    if (!layer.id) {
      issues.push({
        path,
        code: 'layer.id.required',
        message: 'Every layer must have an id.',
      });
    } else if (layerIds.has(layer.id)) {
      issues.push({
        path: layerPath,
        code: 'layer.id.duplicate',
        message: `Layer id "${layer.id}" is duplicated.`,
      });
    } else {
      layerIds.add(layer.id);
    }

    validateNonNegativeNumber(issues, `${layerPath}.start`, layer.start);
    validatePositiveNumber(issues, `${layerPath}.duration`, layer.duration);
    validateNumber(issues, `${layerPath}.layout.x`, layer.layout?.x);
    validateNumber(issues, `${layerPath}.layout.y`, layer.layout?.y);
    validatePositiveNumber(issues, `${layerPath}.layout.width`, layer.layout?.width);
    validatePositiveNumber(issues, `${layerPath}.layout.height`, layer.layout?.height);

    validateMotionLayers(issues, layer.children ?? [], layerIds, `${layerPath}.children`);
  }
};

const validatePositiveNumber = (
  issues: MotionDocumentValidationIssue[],
  path: string,
  value: unknown,
): void => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    issues.push({
      path,
      code: 'number.positive',
      message: `${path} must be a positive number.`,
    });
  }
};

const validateNonNegativeNumber = (
  issues: MotionDocumentValidationIssue[],
  path: string,
  value: unknown,
): void => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    issues.push({
      path,
      code: 'number.nonNegative',
      message: `${path} must be a non-negative number.`,
    });
  }
};

const validateNumber = (
  issues: MotionDocumentValidationIssue[],
  path: string,
  value: unknown,
): void => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    issues.push({
      path,
      code: 'number.required',
      message: `${path} must be a finite number.`,
    });
  }
};
