#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, resolve } from 'node:path';

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.document) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const documentPath = resolve(String(args.document));
const outputDir = resolve(String(args.out ?? 'motion-render'));
const url = String(args.url ?? 'http://localhost:4200/libraries/motion/render-target');
const documentKey = String(args.documentKey ?? `ngs-motion-render-document-${Date.now()}`);
const scale = readNumber(args.scale, 1);
const videoPath = args.video ? resolve(String(args.video)) : null;
const requestedFormat = readString(args.format, 'png');
const format = videoPath ? 'png' : requestedFormat;
const fpsOverride = args.fps === undefined ? null : readNumber(args.fps, 30);
const frameStep = Math.max(1, Math.round(readNumber(args.frameStep ?? args['frame-step'], 1)));

if (!existsSync(documentPath)) {
  throw new Error(`Motion document was not found: ${documentPath}`);
}

mkdirSync(outputDir, { recursive: true });

const rawMotionDocument = JSON.parse(readFileSync(documentPath, 'utf8'));
const audioTracks = collectAudioTracks(rawMotionDocument, documentPath, outputDir);
const motionDocument = normalizeMotionDocumentAssets(rawMotionDocument, documentPath);
const fps = Math.max(1, fpsOverride ?? motionDocument.composition?.fps ?? 30);
const duration = Math.max(0, motionDocument.composition?.duration ?? 0);
const frameCount = Math.max(1, Math.ceil((duration / 1000) * fps));
const fromFrame = Math.min(
  frameCount - 1,
  Math.max(0, Math.round(readNumber(args.fromFrame ?? args['from-frame'] ?? args.from, 0))),
);
const toFrame = Math.min(
  frameCount - 1,
  Math.max(
    fromFrame,
    Math.round(readNumber(args.toFrame ?? args['to-frame'] ?? args.to, frameCount - 1)),
  ),
);
const frames = createFrameList(fromFrame, toFrame, frameStep);

const { chromium } = await import('playwright');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  deviceScaleFactor: readNumber(args.deviceScaleFactor, 1),
  viewport: {
    width: Math.ceil((motionDocument.composition.width ?? 1920) * scale),
    height: Math.ceil((motionDocument.composition.height ?? 1080) * scale),
  },
});

await context.addInitScript(
  ({ key, payload }) => {
    window.localStorage.setItem(key, payload);
  },
  { key: documentKey, payload: JSON.stringify(motionDocument) },
);

const page = await context.newPage();

for (let index = 0; index < frames.length; index += 1) {
  const frame = frames[index];
  const targetUrl = new URL(url);
  targetUrl.searchParams.set('documentKey', documentKey);
  targetUrl.searchParams.set('frame', String(frame));
  targetUrl.searchParams.set('scale', String(scale));

  await page.goto(targetUrl.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-motion-render-target]');
  await page.waitForFunction(() => document.documentElement.dataset['motionRenderReady'] === 'true');
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await Promise.all(
      Array.from(document.images).map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        });
      }),
    );
    await Promise.all(
      Array.from(document.querySelectorAll('video[data-motion-video-time]')).map((video) => {
        const targetTime = Number(video.getAttribute('data-motion-video-time') ?? 0);

        if (!Number.isFinite(targetTime)) {
          return Promise.resolve();
        }

        if (Math.abs(video.currentTime - targetTime) < 0.02) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          const done = () => resolve();

          video.addEventListener('seeked', done, { once: true });
          video.addEventListener('error', done, { once: true });
          video.currentTime = targetTime;
          window.setTimeout(done, 1000);
        });
      }),
    );
  });

  const fileName = `frame-${String(index).padStart(6, '0')}.${format}`;
  const filePath = join(outputDir, fileName);

  await page.locator('[data-motion-render-target]').screenshot({
    path: filePath,
    omitBackground: args.transparent === true,
    type: format === 'jpeg' ? 'jpeg' : 'png',
  });

  process.stdout.write(`Rendered ${fileName} (${frame}/${toFrame})\n`);
}

await browser.close();

if (videoPath) {
  await encodeVideo({
    inputDir: outputDir,
    fps: fps / frameStep,
    videoPath,
    audioTracks,
  });
}

function parseArgs(values) {
  const result = {};

  for (let index = 0; index < values.length; index += 1) {
    const arg = values[index];

    if (!arg.startsWith('--')) {
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split('=');
    const nextValue = values[index + 1];

    if (inlineValue !== undefined) {
      result[rawKey] = coerceArgValue(inlineValue);
    } else if (!nextValue || nextValue.startsWith('--')) {
      result[rawKey] = true;
    } else {
      result[rawKey] = coerceArgValue(nextValue);
      index += 1;
    }
  }

  return result;
}

function coerceArgValue(value) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
}

function readNumber(value, fallback) {
  const numeric = Number(value);

  return Number.isFinite(numeric) ? numeric : fallback;
}

function readString(value, fallback) {
  return typeof value === 'string' && value ? value : fallback;
}

function createFrameList(fromFrame, toFrame, step) {
  const frames = [];

  for (let frame = fromFrame; frame <= toFrame; frame += step) {
    frames.push(frame);
  }

  if (frames.at(-1) !== toFrame) {
    frames.push(toFrame);
  }

  return frames;
}

function normalizeMotionDocumentAssets(documentValue, sourcePath) {
  const baseDir = dirname(sourcePath);
  const documentCopy = structuredCloneJson(documentValue);
  const assets = new Map(
    (documentCopy.assets ?? []).map((asset) => [
      asset.id,
      {
        ...asset,
        src: normalizeAssetSource(asset.src, baseDir),
      },
    ]),
  );

  documentCopy.assets = Array.from(assets.values());
  documentCopy.fonts = (documentCopy.fonts ?? []).map((font) => ({
    ...font,
    src: font.src ? normalizeAssetSource(font.src, baseDir) : font.src,
  }));
  documentCopy.layers = normalizeLayerSources(documentCopy.layers ?? [], baseDir);

  return documentCopy;
}

function normalizeLayerSources(layers, baseDir) {
  return layers.map((layer) => ({
    ...layer,
    props: normalizeLayerProps(layer.props, baseDir),
    children: layer.children ? normalizeLayerSources(layer.children, baseDir) : layer.children,
  }));
}

function normalizeLayerProps(props, baseDir) {
  if (!props?.src || typeof props.src !== 'string') {
    return props;
  }

  return {
    ...props,
    src: normalizeAssetSource(props.src, baseDir),
  };
}

function collectAudioTracks(documentValue, sourcePath, outputDir) {
  const baseDir = dirname(sourcePath);
  const assets = new Map((documentValue.assets ?? []).map((asset) => [asset.id, asset]));
  const audioLayers = flattenLayers(documentValue.layers ?? [])
    .filter((layer) => layer.type === 'audio' && !layer.hidden);
  const hasSoloAudioLayer = audioLayers.some((layer) => layer.props?.solo === true);

  return audioLayers
    .filter((layer) => layer.props?.muted !== true)
    .filter((layer) => !hasSoloAudioLayer || layer.props?.solo === true)
    .map((layer, index) => {
      const assetId = typeof layer.props?.assetId === 'string' ? layer.props.assetId : '';
      const asset = assetId ? assets.get(assetId) : null;
      const rawSrc = asset?.src ?? layer.props?.src;

      if (typeof rawSrc !== 'string' || !rawSrc) {
        return null;
      }

      return {
        source: normalizeAudioInputSource(rawSrc, baseDir, outputDir, index),
        start: Math.max(0, Number(layer.start ?? 0)),
        duration: Math.max(0, Number(layer.duration ?? 0)),
        offset: Math.max(0, Number(layer.props?.offset ?? 0)),
        volume: Math.max(0, Number(layer.props?.volume ?? 1)),
        fadeIn: Math.max(0, Number(layer.props?.fadeIn ?? 0)),
        fadeOut: Math.max(0, Number(layer.props?.fadeOut ?? 0)),
      };
    })
    .filter(Boolean);
}

function flattenLayers(layers) {
  return layers.flatMap((layer) => [layer, ...flattenLayers(layer.children ?? [])]);
}

function normalizeAudioInputSource(src, baseDir, outputDir, index) {
  if (src.startsWith('data:')) {
    const match = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(src);

    if (!match) {
      return src;
    }

    const mimeType = match[1] || 'audio/mpeg';
    const extension = extensionForMimeType(mimeType);
    const filePath = join(outputDir, `audio-${String(index).padStart(2, '0')}.${extension}`);
    const payload = match[2]
      ? Buffer.from(match[3], 'base64')
      : Buffer.from(decodeURIComponent(match[3]));

    writeFileSync(filePath, payload);

    return filePath;
  }

  if (/^(https?:|file:)/.test(src)) {
    return src;
  }

  const assetPath = isAbsolute(src) ? src : resolve(baseDir, src);

  return existsSync(assetPath) ? assetPath : src;
}

function normalizeAssetSource(src, baseDir) {
  if (!src || /^(https?:|data:|blob:|file:)/.test(src)) {
    return src;
  }

  const assetPath = isAbsolute(src) ? src : resolve(baseDir, src);

  if (!existsSync(assetPath)) {
    return src;
  }

  const bytes = readFileSync(assetPath);

  return `data:${mimeTypeForPath(assetPath)};base64,${bytes.toString('base64')}`;
}

function mimeTypeForPath(path) {
  switch (extname(path).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.mov':
      return 'video/quicktime';
    default:
      return 'image/png';
  }
}

function encodeVideo({ inputDir, fps, videoPath, audioTracks }) {
  return new Promise((resolveEncode, rejectEncode) => {
    const args = [
      '-y',
      '-framerate',
      String(fps),
      '-i',
      join(inputDir, 'frame-%06d.png'),
    ];
    const audioFilter = createAudioFilter(audioTracks);

    for (const track of audioTracks) {
      args.push('-i', track.source);
    }

    args.push(
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
    );

    if (audioFilter) {
      args.push('-filter_complex', audioFilter, '-map', '0:v', '-map', '[a]', '-shortest');
    }

    args.push(videoPath);

    const ffmpeg = spawn('ffmpeg', args, {
      stdio: 'inherit',
    });

    ffmpeg.on('exit', (code) => {
      if (code === 0) {
        resolveEncode();
      } else {
        rejectEncode(new Error(`ffmpeg exited with code ${code}.`));
      }
    });
  });
}

function createAudioFilter(audioTracks) {
  if (!audioTracks.length) {
    return '';
  }

  const filters = audioTracks.map((track, index) => {
    const inputIndex = index + 1;
    const delay = Math.round(track.start);
    const duration = track.duration > 0 ? `:duration=${track.duration / 1000}` : '';
    const fadeIn = track.fadeIn > 0 ? `,afade=t=in:st=0:d=${track.fadeIn / 1000}` : '';
    const fadeOutStart = Math.max(0, (track.duration - track.fadeOut) / 1000);
    const fadeOut =
      track.fadeOut > 0 ? `,afade=t=out:st=${fadeOutStart}:d=${track.fadeOut / 1000}` : '';

    return `[${inputIndex}:a]atrim=start=${track.offset / 1000}${duration},asetpts=PTS-STARTPTS,volume=${track.volume}${fadeIn}${fadeOut},adelay=${delay}|${delay}[a${index}]`;
  });

  if (audioTracks.length === 1) {
    filters.push('[a0]anull[a]');
  } else {
    filters.push(
      `${audioTracks.map((_, index) => `[a${index}]`).join('')}amix=inputs=${
        audioTracks.length
      }:duration=longest:dropout_transition=0[a]`,
    );
  }

  return filters.join(';');
}

function extensionForMimeType(mimeType) {
  switch (mimeType) {
    case 'audio/wav':
    case 'audio/x-wav':
      return 'wav';
    case 'audio/ogg':
      return 'ogg';
    case 'audio/mp4':
    case 'audio/aac':
      return 'm4a';
    default:
      return 'mp3';
  }
}

function structuredCloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function printHelp() {
  process.stdout.write(`Usage:
  npm run render:motion -- --document ./motion.json --out ./frames
  npm run render:motion -- --document ./motion.json --out ./frames --video ./motion.mp4

Options:
  --document <path>       Motion JSON document.
  --url <url>             Render target URL. Default: http://localhost:4200/libraries/motion/render-target
  --out <path>            Output frames directory. Default: motion-render
  --video <path>          Optional mp4 output path. Requires ffmpeg.
  --from-frame <number>   First frame.
  --to-frame <number>     Last frame.
  --frame-step <number>   Frame sampling step.
  --fps <number>          Override document fps.
  --scale <number>        Render scale. Default: 1
  --format <png|jpeg>     Screenshot format. Default: png
  --transparent           Omit browser screenshot background.
`);
}
