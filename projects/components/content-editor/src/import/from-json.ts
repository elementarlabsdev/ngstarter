import type { ContentEditorConfig } from '../config';
import type { ContentEditorBlock, ContentEditorDocument } from '../types';
import { safeContentEditorHtmlUrl } from '../html/html-utils';
import { normalizeNgsHeadlessEditorColor } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorImportError, ContentEditorImportOptions } from './types';

/** Parses and validates the native version-1 format without changing the caller's objects. */
export function contentEditorFromJson(source: unknown, config: ContentEditorConfig = {}, options: ContentEditorImportOptions = {}): ContentEditorDocument {
  const maxDepth = options.maxDepth ?? 64;
  const maxBlocks = options.maxBlocks ?? 10000;
  if (!Number.isInteger(maxDepth) || maxDepth < 1 || !Number.isInteger(maxBlocks) || maxBlocks < 1) {
    throw new ContentEditorImportError('$options', 'maxDepth and maxBlocks must be positive integers');
  }
  let value: unknown = source;
  if (typeof source === 'string') {
    try { value = JSON.parse(source); }
    catch { throw new ContentEditorImportError('$', 'Invalid JSON'); }
  }
  const fail = (path: string, message: string): never => { throw new ContentEditorImportError(path, message); };
  const ancestors = new Set<object>();
  const copy = (input: unknown, path: string, depth: number): any => {
    if (depth > maxDepth) fail(path, `Maximum nesting depth (${maxDepth}) exceeded`);
    if (input === null || typeof input === 'string' || typeof input === 'boolean') return input;
    if (typeof input === 'number' && Number.isFinite(input)) return input;
    if (!input || typeof input !== 'object') return fail(path, 'Expected a JSON-compatible value');
    if (ancestors.has(input)) fail(path, 'Cyclic data is not supported');
    if (!Array.isArray(input) && ![Object.prototype, null].includes(Object.getPrototypeOf(input))) fail(path, 'Expected a plain JSON object');
    ancestors.add(input);
    const output = Array.isArray(input)
      ? Array.from(input, (item, i) => copy(item, `${path}[${i}]`, depth + 1))
      : Object.fromEntries(Object.entries(input).filter(([, item]) => item !== undefined).map(([key, item]) => [key, copy(item, `${path}.${key}`, depth + 1)]));
    ancestors.delete(input);
    return output;
  };
  const object = (input: any, path: string): Record<string, any> => {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) fail(path, 'Expected an object');
    return input;
  };
  const array = (input: any, path: string): any[] => { if (!Array.isArray(input)) fail(path, 'Expected an array'); return input; };
  const string = (input: any, path: string, nonempty = false): void => {
    if (typeof input !== 'string' || (nonempty && !input.trim())) fail(path, nonempty ? 'Expected a non-empty string' : 'Expected a string');
  };
  const props = (input: any, path: string): void => {
    if (input === undefined) return;
    array(input, path).forEach((prop, i) => {
      object(prop, `${path}[${i}]`); string(prop.name, `${path}[${i}].name`, true); string(prop.value, `${path}[${i}].value`);
    });
  };
  const runs = (input: any, path: string): void => {
    array(input, path).forEach((run, i) => {
      const p = `${path}[${i}]`; object(run, p);
      if (run.type !== 'text') fail(`${p}.type`, 'Expected "text"');
      string(run.text, `${p}.text`);
      array(run.marks, `${p}.marks`).forEach((mark, j) => {
        const m = `${p}.marks[${j}]`; object(mark, m); string(mark.type, `${m}.type`, true);
        if (mark.attrs !== undefined) {
          for (const [key, attr] of Object.entries(object(mark.attrs, `${m}.attrs`))) {
            if (attr !== null && !['string', 'number', 'boolean'].includes(typeof attr)) fail(`${m}.attrs.${key}`, 'Expected a scalar mark attribute');
          }
        }
        if (mark.type === 'link' && !safeContentEditorHtmlUrl(mark.attrs?.href)) fail(`${m}.attrs.href`, 'Expected a supported non-empty link URL');
        if (mark.type === 'link') enumValue(mark.attrs?.target, ['_blank', '_self'], `${m}.attrs.target`);
        if (['textColor', 'backgroundColor'].includes(mark.type) && (typeof mark.attrs?.color !== 'string' || !normalizeNgsHeadlessEditorColor(mark.attrs.color))) fail(`${m}.attrs.color`, 'Expected a supported CSS color');
      });
    });
  };
  const enumValue = (input: any, allowed: readonly any[], path: string): void => {
    if (input !== undefined && !allowed.includes(input)) fail(path, `Expected one of: ${allowed.join(', ')}`);
  };
  const dimension = (input: any, path: string): void => {
    if (input !== undefined && input !== null && input !== 'auto' && !(typeof input === 'number' && Number.isFinite(input) && input > 0)) fail(path, 'Expected a positive pixel dimension, "auto", or null');
  };
  const usedIds = new Set<string>();
  let count = 0;
  const list = (input: any, path: string): void => {
    array(input, path).forEach((item, i) => {
      const p = `${path}[${i}]`; object(item, p); runs(item.content, `${p}.content`); props(item.props, `${p}.props`); list(item.children, `${p}.children`);
    });
  };
  const blocks = (input: any, path: string): void => {
    array(input, path).forEach((block, i) => {
      const p = `${path}[${i}]`; object(block, p);
      if (++count > maxBlocks) fail(p, `Maximum block count (${maxBlocks}) exceeded`);
      string(block.id, `${p}.id`, true); string(block.type, `${p}.type`, true);
      if (usedIds.has(block.id)) fail(`${p}.id`, `Duplicate block ID "${block.id}"`);
      usedIds.add(block.id);
      if (!Object.hasOwn(block, 'content')) fail(`${p}.content`, 'Required field');
      const attrs = block.attrs === undefined ? {} : object(block.attrs, `${p}.attrs`);
      const settings = attrs['settings'] === undefined ? {} : object(attrs['settings'], `${p}.attrs.settings`);
      props(attrs['props'], `${p}.attrs.props`);
      const c = block.content;
      const cp = `${p}.content`;
      const sp = `${p}.attrs.settings`;
      switch (block.type) {
        case 'paragraph': case 'heading': case 'code': case 'callout':
          runs(c, cp);
          if (block.type === 'heading') enumValue(settings['level'], [1, 2, 3, 4, 5, 6], `${sp}.level`);
          if (block.type === 'code' && settings['language'] !== undefined) string(settings['language'], `${sp}.language`);
          if (block.type === 'callout') enumValue(settings['variant'], ['note', 'tip', 'warning', 'danger'], `${sp}.variant`);
          break;
        case 'divider': if (c !== null) fail(cp, 'Divider content must be null'); break;
        case 'bulletList': case 'orderedList':
          list(c, cp); enumValue(settings['listStyle'], ['bullet', 'ordered'], `${sp}.listStyle`); break;
        case 'quote':
          object(c, cp);
          for (const name of ['cite', 'caption']) {
            object(c[name], `${cp}.${name}`); runs(c[name].content, `${cp}.${name}.content`); props(c[name].props, `${cp}.${name}.props`);
          }
          break;
        case 'table':
          if (c !== null) fail(cp, 'Native table content must be null; use attrs.rows');
          if (array(attrs['rows'], `${p}.attrs.rows`).length > 500) fail(`${p}.attrs.rows`, 'Tables support at most 500 rows');
          attrs['rows'].forEach((row: any, r: number) => {
            if (array(row, `${p}.attrs.rows[${r}]`).length > 50) fail(`${p}.attrs.rows[${r}]`, 'Tables support at most 50 columns');
            row.forEach((cell: any, col: number) => runs(cell, `${p}.attrs.rows[${r}][${col}]`));
          });
          enumValue(attrs['header'], [true, false], `${p}.attrs.header`);
          if (attrs['cellMetadata'] !== undefined) array(attrs['cellMetadata'], `${p}.attrs.cellMetadata`).forEach((row, r) => array(row, `${p}.attrs.cellMetadata[${r}]`).forEach((cell, col) => {
            const mp = `${p}.attrs.cellMetadata[${r}][${col}]`; object(cell, mp); props(cell.props, `${mp}.props`);
            if (cell.options !== undefined) {
              const opts = object(cell.options, `${mp}.options`);
              for (const key of ['colspan', 'rowspan']) if (opts[key] !== undefined && !(Number.isInteger(opts[key]) && opts[key] > 0)) fail(`${mp}.options.${key}`, 'Expected a positive integer');
              dimension(opts['width'], `${mp}.options.width`);
            }
          }));
          break;
        case 'image': case 'video': case 'embed': case 'attachment':
          object(c, cp);
          for (const key of block.type === 'image' ? ['src', 'alt'] : block.type === 'video' ? ['src', 'caption'] : block.type === 'embed' ? ['url', 'type'] : ['url', 'name', 'mimeType']) string(c[key], `${cp}.${key}`);
          {
            const key = ['image', 'video'].includes(block.type) ? 'src' : 'url';
            const kind = block.type === 'video' ? 'media' : block.type === 'image' ? 'image' : block.type === 'embed' ? 'embed' : 'attachment';
            if (c[key] && !safeContentEditorHtmlUrl(c[key], kind)) fail(`${cp}.${key}`, 'Unsupported resource URL');
          }
          if (block.type === 'attachment' && !(Number.isInteger(c.size) && c.size >= 0)) fail(`${cp}.size`, 'Expected a non-negative integer byte count');
          if (block.type === 'video') enumValue(c.orientation, ['portrait', 'landscape'], `${cp}.orientation`);
          for (const key of ['width', 'height', 'actualWidth', 'actualHeight']) dimension(settings[key], `${sp}.${key}`);
          break;
        case 'gallery': {
          object(c, cp); const ids = new Set<string>();
          array(c.images, `${cp}.images`).forEach((image, j) => {
            const ip = `${cp}.images[${j}]`; object(image, ip); string(image.id, `${ip}.id`, true);
            if (ids.has(image.id)) fail(`${ip}.id`, 'Duplicate image ID'); ids.add(image.id);
            string(image.src, `${ip}.src`); string(image.alt, `${ip}.alt`); runs(image.caption, `${ip}.caption`);
            if (image.src && !safeContentEditorHtmlUrl(image.src, 'image')) fail(`${ip}.src`, 'Unsupported image URL');
          }); break;
        }
        case 'toggle':
          object(c, cp); runs(c.title, `${cp}.title`); blocks(c.blocks, `${cp}.blocks`); enumValue(settings['expanded'], [true, false], `${sp}.expanded`); break;
        case 'grid': {
          object(c, cp); const ids = new Set<string>();
          array(c.cells, `${cp}.cells`).forEach((cell, j) => {
            const gp = `${cp}.cells[${j}]`; object(cell, gp); string(cell.id, `${gp}.id`, true);
            if (ids.has(cell.id)) fail(`${gp}.id`, 'Duplicate grid cell ID'); ids.add(cell.id); blocks(cell.blocks, `${gp}.blocks`);
          });
          enumValue(settings['columns'], [2, 3, 4], `${sp}.columns`); enumValue(settings['gap'], ['small', 'medium', 'large'], `${sp}.gap`); enumValue(settings['stackOnMobile'], [true, false], `${sp}.stackOnMobile`); break;
        }
        default:
          if (!options.allowUnknownBlocks && !Object.hasOwn(config.blocks ?? {}, block.type)) fail(`${p}.type`, `Unknown block type "${block.type}"`);
      }
      const validation = config.blocks?.[block.type]?.validateImport?.(block as ContentEditorBlock);
      if (validation !== undefined) fail(p, validation);
    });
  };
  const document = object(copy(value, '$', 0), '$');
  if (document['version'] !== 1) fail('$.version', 'Only document version 1 is supported');
  blocks(document['blocks'], '$.blocks');
  return { version: 1, blocks: document['blocks'] };
}
