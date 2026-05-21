import {
  MotionDocument,
  MotionDocumentValidationIssue,
  MotionLayer,
  MotionScene,
  validateMotionDocument,
} from '../schema/motion-document';
import { flattenMotionLayers, coerceMotionString } from '../engine/motion-engine';

export type MotionAssetResolver = (asset: MotionRenderAssetReference) => string | null | undefined;

export interface MotionRenderAssetReference {
  id: string;
  type: string;
  name?: string;
  src: string;
  usedByLayerIds: string[];
}

export interface MotionRenderManifest {
  version: string;
  composition: {
    width: number;
    height: number;
    fps: number;
    duration: number;
    frameCount: number;
    background?: string;
  };
  scenes: MotionRenderManifestScene[];
  assets: MotionRenderManifestAsset[];
  fonts: MotionRenderManifestFont[];
  audioTracks: MotionRenderAudioTrack[];
  layers: {
    count: number;
    ids: string[];
  };
  validation: MotionExportValidationIssue[];
}

export interface MotionRenderManifestScene {
  id: string;
  name?: string;
  start: number;
  duration: number;
  startFrame: number;
  frameCount: number;
  layerIds: string[];
}

export interface MotionRenderManifestAsset {
  id: string;
  type: string;
  name?: string;
  src: string;
  usedByLayerIds: string[];
}

export interface MotionRenderManifestFont {
  id: string;
  family: string;
  src?: string;
  weight?: number | string;
  style?: string;
}

export interface MotionExportValidationIssue extends MotionDocumentValidationIssue {
  severity: 'info' | 'warning' | 'error';
}

export interface MotionRenderOptions {
  fps?: number;
  fromFrame?: number;
  toFrame?: number;
  frameStep?: number;
  output?: 'frames' | 'video';
  format?: 'png' | 'jpeg' | 'webp' | 'mp4';
  scale?: number;
  background?: string | null;
  assetResolver?: MotionAssetResolver;
  validate?: boolean;
}

export interface MotionRenderResolvedOptions {
  fps: number;
  fromFrame: number;
  toFrame: number;
  frameStep: number;
  output: 'frames' | 'video';
  format: 'png' | 'jpeg' | 'webp' | 'mp4';
  scale: number;
  background: string | null;
  validate: boolean;
}

export interface MotionRenderFrame {
  frame: number;
  time: number;
  fileName: string;
}

export interface MotionRenderAudioTrack {
  layerId: string;
  assetId?: string;
  src: string;
  start: number;
  duration: number;
  offset: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  solo: boolean;
}

export interface MotionRenderPlan {
  document: MotionDocument;
  manifest: MotionRenderManifest;
  options: MotionRenderResolvedOptions;
  frames: MotionRenderFrame[];
  audioTracks: MotionRenderAudioTrack[];
  validation: MotionExportValidationIssue[];
}

export interface MotionRenderDocumentOptions {
  fps?: number;
  background?: string | null;
  assetResolver?: MotionAssetResolver;
  stripEditor?: boolean;
}

export type MotionRenderRangeMode = 'document' | 'scene' | 'custom';

export interface MotionRenderRangeOptions {
  mode?: MotionRenderRangeMode;
  sceneId?: string | null;
  fps?: number;
  fromFrame?: number;
  toFrame?: number | null;
}

export interface MotionRenderRange {
  mode: MotionRenderRangeMode;
  sceneId?: string;
  fromFrame: number;
  toFrame: number;
  fromTime: number;
  toTime: number;
}

export type MotionRenderJobStatus =
  | 'idle'
  | 'queued'
  | 'rendering'
  | 'encoding'
  | 'done'
  | 'error'
  | 'cancelled';

export interface MotionRenderRequest {
  id: string;
  createdAt: string;
  document: MotionDocument;
  manifest: MotionRenderManifest;
  options: MotionRenderResolvedOptions;
  range: MotionRenderRange;
  frames: MotionRenderFrame[];
  audioTracks: MotionRenderAudioTrack[];
  targetUrl: string;
  outputDir: string;
  videoPath?: string;
}

export interface MotionRenderProgress {
  requestId: string;
  status: MotionRenderJobStatus;
  currentFrame: number;
  totalFrames: number;
  percent: number;
  message: string;
}

export interface MotionRenderResult {
  requestId: string;
  status: Extract<MotionRenderJobStatus, 'done' | 'error' | 'cancelled'>;
  manifest: MotionRenderManifest;
  frames: MotionRenderFrame[];
  outputDir: string;
  videoPath?: string;
  completedAt: string;
  error?: string;
}

export interface MotionRenderRequestOptions extends MotionRenderOptions {
  id?: string;
  targetUrl?: string;
  outputDir?: string;
  videoPath?: string;
  rangeMode?: MotionRenderRangeMode;
  sceneId?: string | null;
}

export const createMotionRenderManifest = (document: MotionDocument): MotionRenderManifest => {
  const fps = Math.max(1, document.composition.fps);
  const duration = Math.max(0, document.composition.duration);
  const frameCount = Math.ceil((duration / 1000) * fps);
  const flatLayers = flattenMotionLayers(document.layers);
  const assetReferences = createAssetReferences(document);

  return {
    version: document.version,
    composition: {
      width: document.composition.width,
      height: document.composition.height,
      fps,
      duration,
      frameCount,
      background: document.composition.background,
    },
    scenes: (document.scenes ?? []).map((scene) => createSceneManifest(scene, fps)),
    assets: assetReferences,
    fonts: (document.fonts ?? []).map((font) => ({
      id: font.id,
      family: font.family,
      src: font.src,
      weight: font.weight,
      style: font.style,
    })),
    audioTracks: createAudioTracks(document),
    layers: {
      count: flatLayers.length,
      ids: flatLayers.map(({ layer }) => layer.id),
    },
    validation: validateMotionExport(document),
  };
};

export const createMotionRenderDocument = (
  document: MotionDocument,
  options: MotionRenderDocumentOptions = {},
): MotionDocument => {
  const next = cloneMotionDocument(document);
  const fps = Math.max(1, options.fps ?? next.composition.fps);

  next.composition = {
    ...next.composition,
    fps,
    background:
      options.background === undefined
        ? next.composition.background
        : (options.background ?? 'transparent'),
  };

  if (options.background !== undefined) {
    delete next.composition.backgroundEffect;
  }

  if (options.stripEditor ?? true) {
    delete next.editor;
    next.metadata = {
      ...(next.metadata ?? {}),
      renderMode: true,
    };
  }

  if (options.assetResolver) {
    next.assets = resolveMotionRenderAssets(next, options.assetResolver);
  }

  return next;
};

export const resolveMotionRenderAssets = (
  document: MotionDocument,
  resolver: MotionAssetResolver,
): NonNullable<MotionDocument['assets']> => {
  const references = createAssetReferences(document);

  return (document.assets ?? []).map((asset) => {
    const reference = references.find((item) => item.id === asset.id);
    const resolvedSrc = reference ? resolver(reference) : undefined;

    return {
      ...asset,
      src: resolvedSrc ?? asset.src,
    };
  });
};

export const validateMotionExport = (document: MotionDocument): MotionExportValidationIssue[] => {
  const issues: MotionExportValidationIssue[] = validateMotionDocument(document).map((issue) => ({
    ...issue,
    severity:
      issue.code.includes('missing') || issue.code.includes('required') ? 'error' : 'warning',
  }));
  const flatLayers = flattenMotionLayers(document.layers);
  const layerIds = new Set(flatLayers.map(({ layer }) => layer.id));
  const assets = new Map((document.assets ?? []).map((asset) => [asset.id, asset]));

  for (const font of document.fonts ?? []) {
    if (!font.src) {
      issues.push({
        path: `fonts.${font.id}.src`,
        code: 'font.source.missing',
        message: `Font "${font.family}" has no source and may render differently during export.`,
        severity: 'warning',
      });
    }
  }

  for (const { layer } of flatLayers) {
    if (isMediaLayer(layer)) {
      const assetId = coerceMotionString(layer.props?.['assetId'], '');
      const src = coerceMotionString(layer.props?.['src'], '');

      if (isMediaPlaceholder(layer)) {
        issues.push({
          path: `layers.${layer.id}.props`,
          code: 'layer.media.placeholder',
          message: `Layer "${layer.name || layer.id}" is a media placeholder.`,
          severity: 'warning',
        });
      }

      if (assetId && !assets.has(assetId)) {
        issues.push({
          path: `layers.${layer.id}.props.assetId`,
          code: 'layer.asset.missing',
          message: `Layer "${layer.name || layer.id}" references missing asset "${assetId}".`,
          severity: 'error',
        });
      }

      if (!assetId && !src) {
        issues.push({
          path: `layers.${layer.id}.props.src`,
          code: 'layer.source.missing',
          message: `Layer "${layer.name || layer.id}" has no media source.`,
          severity: 'error',
        });
      }
    }

    if (layer.type === 'audio') {
      const assetId = coerceMotionString(layer.props?.['assetId'], '');
      const src = coerceMotionString(layer.props?.['src'], '');

      if (assetId && !assets.has(assetId)) {
        issues.push({
          path: `layers.${layer.id}.props.assetId`,
          code: 'layer.audio.asset.missing',
          message: `Audio layer "${layer.name || layer.id}" references missing asset "${assetId}".`,
          severity: 'error',
        });
      }

      if (!assetId && !src) {
        issues.push({
          path: `layers.${layer.id}.props.src`,
          code: 'layer.audio.source.missing',
          message: `Audio layer "${layer.name || layer.id}" has no source.`,
          severity: 'error',
        });
      }
    }
  }

  for (const scene of document.scenes ?? []) {
    if (scene.layerIds?.length === 0) {
      issues.push({
        path: `scenes.${scene.id}.layerIds`,
        code: 'scene.empty',
        message: `Scene "${scene.name || scene.id}" has no layers.`,
        severity: 'warning',
      });
    }

    for (const layerId of scene.layerIds ?? []) {
      if (!layerIds.has(layerId)) {
        issues.push({
          path: `scenes.${scene.id}.layerIds`,
          code: 'scene.layer.missing',
          message: `Scene "${scene.name || scene.id}" references missing layer "${layerId}".`,
          severity: 'error',
        });
      }
    }

    for (const [edge, transition] of [
      ['in', scene.transitionIn],
      ['out', scene.transitionOut],
    ] as const) {
      if (transition && transition.duration > scene.duration) {
        issues.push({
          path: `scenes.${scene.id}.transition${edge === 'in' ? 'In' : 'Out'}`,
          code: 'scene.transition.overflow',
          message: `Scene "${scene.name || scene.id}" has ${edge} transition longer than its duration.`,
          severity: 'warning',
        });
      }
    }
  }

  return issues;
};

export const resolveMotionRenderRange = (
  document: MotionDocument,
  options: MotionRenderRangeOptions = {},
): MotionRenderRange => {
  const fps = Math.max(1, options.fps ?? document.composition.fps);
  const frameCount = Math.max(1, Math.ceil((document.composition.duration / 1000) * fps));
  const lastFrame = Math.max(0, frameCount - 1);
  const mode = options.mode ?? 'document';

  if (mode === 'scene' && options.sceneId) {
    const scene = document.scenes?.find((item) => item.id === options.sceneId);

    if (scene) {
      const fromFrame = Math.min(lastFrame, Math.max(0, Math.round((scene.start / 1000) * fps)));
      const toFrame = Math.min(
        lastFrame,
        Math.max(fromFrame, Math.ceil(((scene.start + scene.duration) / 1000) * fps) - 1),
      );

      return {
        mode,
        sceneId: scene.id,
        fromFrame,
        toFrame,
        fromTime: (fromFrame / fps) * 1000,
        toTime: (toFrame / fps) * 1000,
      };
    }
  }

  if (mode === 'custom') {
    const fromFrame = Math.min(lastFrame, Math.max(0, Math.round(options.fromFrame ?? 0)));
    const toFrame = Math.min(
      lastFrame,
      Math.max(fromFrame, Math.round(options.toFrame ?? lastFrame)),
    );

    return {
      mode,
      fromFrame,
      toFrame,
      fromTime: (fromFrame / fps) * 1000,
      toTime: (toFrame / fps) * 1000,
    };
  }

  return {
    mode: 'document',
    fromFrame: 0,
    toFrame: lastFrame,
    fromTime: 0,
    toTime: (lastFrame / fps) * 1000,
  };
};

export const renderMotion = (
  document: MotionDocument,
  options: MotionRenderOptions = {},
): MotionRenderPlan => {
  const fps = Math.max(1, options.fps ?? document.composition.fps);
  const renderDocument = createMotionRenderDocument(document, {
    fps,
    background: options.background,
    assetResolver: options.assetResolver,
  });
  const manifest = createMotionRenderManifest(renderDocument);
  const range = resolveMotionRenderRange(renderDocument, {
    mode: 'custom',
    fps,
    fromFrame: options.fromFrame,
    toFrame: options.toFrame,
  });
  const fromFrame = range.fromFrame;
  const toFrame = range.toFrame;
  const frameStep = Math.max(1, Math.round(options.frameStep ?? 1));
  const output = options.output ?? 'frames';
  const format = options.format ?? (output === 'video' ? 'mp4' : 'png');
  const scale = Math.max(0.01, options.scale ?? 1);
  const validation = options.validate === false ? [] : manifest.validation;
  const frames = createRenderFrames(
    fromFrame,
    toFrame,
    frameStep,
    fps,
    output === 'video' ? 'png' : format,
  );

  return {
    document: renderDocument,
    manifest,
    options: {
      fps,
      fromFrame,
      toFrame,
      frameStep,
      output,
      format,
      scale,
      background: renderDocument.composition.background ?? null,
      validate: options.validate ?? true,
    },
    frames,
    audioTracks: manifest.audioTracks,
    validation,
  };
};

export const createMotionRenderRequest = (
  document: MotionDocument,
  options: MotionRenderRequestOptions = {},
): MotionRenderRequest => {
  const fps = Math.max(1, options.fps ?? document.composition.fps);
  const range = resolveMotionRenderRange(document, {
    mode: options.rangeMode ?? 'document',
    sceneId: options.sceneId,
    fps,
    fromFrame: options.fromFrame,
    toFrame: options.toFrame,
  });
  const output = options.output ?? 'video';
  const plan = renderMotion(document, {
    ...options,
    fps,
    fromFrame: range.fromFrame,
    toFrame: range.toFrame,
    output,
    format: options.format ?? (output === 'video' ? 'mp4' : 'png'),
  });
  const id = options.id ?? createMotionRenderRequestId();

  return {
    id,
    createdAt: new Date().toISOString(),
    document: plan.document,
    manifest: plan.manifest,
    options: plan.options,
    range,
    frames: plan.frames,
    audioTracks: plan.audioTracks,
    targetUrl: options.targetUrl ?? 'http://localhost:4200/libraries/motion/render-target',
    outputDir: options.outputDir ?? './motion-render',
    videoPath:
      options.videoPath ?? (plan.options.output === 'video' ? './motion-render/output.mp4' : undefined),
  };
};

export const createMotionRenderProgress = (
  request: MotionRenderRequest,
  status: MotionRenderJobStatus,
  currentFrame = 0,
  message = '',
): MotionRenderProgress => {
  const totalFrames = request.frames.length;

  return {
    requestId: request.id,
    status,
    currentFrame,
    totalFrames,
    percent: totalFrames ? Math.round((currentFrame / totalFrames) * 100) : 0,
    message,
  };
};

export const createMotionRenderCliCommand = (
  request: MotionRenderRequest,
  documentPath = './motion.json',
): string => {
  const command = [
    'npm run render:motion --',
    `--document ${documentPath}`,
    `--url ${request.targetUrl}`,
    `--out ${request.outputDir}`,
    `--fps ${request.options.fps}`,
    `--from-frame ${request.options.fromFrame}`,
    `--to-frame ${request.options.toFrame}`,
    `--frame-step ${request.options.frameStep}`,
    `--scale ${request.options.scale}`,
  ];

  if (request.options.output === 'video' && request.videoPath) {
    command.push(`--video ${request.videoPath}`);
  }

  return command.join(' ');
};

const createSceneManifest = (
  scene: MotionScene,
  fps: number,
): MotionRenderManifestScene => ({
  id: scene.id,
  name: scene.name,
  start: scene.start,
  duration: scene.duration,
  startFrame: Math.round((scene.start / 1000) * fps),
  frameCount: Math.ceil((scene.duration / 1000) * fps),
  layerIds: scene.layerIds ?? [],
});

const createAssetReferences = (document: MotionDocument): MotionRenderAssetReference[] => {
  const flatLayers = flattenMotionLayers(document.layers);

  return (document.assets ?? []).map((asset) => ({
    id: asset.id,
    type: asset.type,
    name: asset.name,
    src: asset.src,
    usedByLayerIds: flatLayers
      .filter(({ layer }) => coerceMotionString(layer.props?.['assetId'], '') === asset.id)
      .map(({ layer }) => layer.id),
  }));
};

const createAudioTracks = (document: MotionDocument): MotionRenderAudioTrack[] => {
  const assets = new Map((document.assets ?? []).map((asset) => [asset.id, asset]));
  const audioLayers = flattenMotionLayers(document.layers)
    .map(({ layer }) => layer)
    .filter((layer) => layer.type === 'audio' && !layer.hidden);
  const hasSoloAudioLayer = audioLayers.some((layer) => layer.props?.['solo'] === true);

  return audioLayers
    .filter((layer) => layer.props?.['muted'] !== true)
    .filter((layer) => !hasSoloAudioLayer || layer.props?.['solo'] === true)
    .map((layer) => {
      const assetId = coerceMotionString(layer.props?.['assetId'], '');
      const asset = assetId ? assets.get(assetId) : undefined;
      const src = asset?.src ?? coerceMotionString(layer.props?.['src'], '');
      const offset = coerceMotionNumber(layer.props?.['offset'], 0);
      const volume = coerceMotionNumber(layer.props?.['volume'], 1);
      const fadeIn = coerceMotionNumber(layer.props?.['fadeIn'], 0);
      const fadeOut = coerceMotionNumber(layer.props?.['fadeOut'], 0);

      return {
        layerId: layer.id,
        assetId: asset?.id,
        src,
        start: layer.start,
        duration: layer.duration,
        offset,
        volume,
        fadeIn,
        fadeOut,
        solo: layer.props?.['solo'] === true,
      };
    })
    .filter((track) => !!track.src);
};

const isMediaLayer = (layer: MotionLayer): boolean => layer.type === 'image' || layer.type === 'video';

const createRenderFrames = (
  fromFrame: number,
  toFrame: number,
  frameStep: number,
  fps: number,
  format: string,
): MotionRenderFrame[] => {
  const frames: MotionRenderFrame[] = [];
  const digits = Math.max(4, String(toFrame).length);

  for (let frame = fromFrame; frame <= toFrame; frame += frameStep) {
    frames.push({
      frame,
      time: (frame / fps) * 1000,
      fileName: `frame-${String(frame).padStart(digits, '0')}.${format}`,
    });
  }

  if (!frames.some((item) => item.frame === toFrame)) {
    frames.push({
      frame: toFrame,
      time: (toFrame / fps) * 1000,
      fileName: `frame-${String(toFrame).padStart(digits, '0')}.${format}`,
    });
  }

  return frames;
};

const cloneMotionDocument = (document: MotionDocument): MotionDocument => {
  if (typeof structuredClone === 'function') {
    return structuredClone(document);
  }

  return JSON.parse(JSON.stringify(document)) as MotionDocument;
};

const createMotionRenderRequestId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `motion-render-${Date.now().toString(36)}`;
};

const coerceMotionNumber = (value: unknown, fallback: number): number => {
  const numeric = Number(value);

  return Number.isFinite(numeric) ? numeric : fallback;
};

const isMediaPlaceholder = (layer: MotionLayer): boolean => {
  const hasAsset = !!coerceMotionString(layer.props?.['assetId'], '');
  const hasSource = !!coerceMotionString(layer.props?.['src'], '');

  return layer.props?.['placeholder'] === true || (!hasAsset && !hasSource);
};
