# Content Editor block format and import

Import public APIs from `@ngstarter-ui/components/content-editor`. This is the native Headless Editor version-1 document, not editor view objects or HTML stored in JSON strings. Third-party systems can export this format directly.

The package includes `@ngstarter-ui/components/content-editor/document.schema.json` (JSON Schema draft 2020-12) and this reference. The schema describes built-in blocks; custom schemas may extend its block alternatives. Semantic validation also checks global block ID uniqueness, gallery/cell ID uniqueness, resource/link URLs, color values and configurable size/depth limits.

## Envelope and common fields

```typescript
type Document = { version: 1; blocks: Block[] };
type Block<T = unknown> = { id: string; type: string; content: T;
  attrs?: { settings?: Record<string, unknown>; props?: Property[];
    [key: string]: unknown } };
type Property = { name: string; value: string };
type TextRun = { type: 'text'; text: string; marks: Mark[] };
type Mark = { type: string;
  attrs?: Record<string, string | number | boolean | null> };
```

- `version` is exactly `1`; `blocks` is an ordered array, including an empty array. Only these envelope fields are part of the contract.
- `id` is a non-empty string, globally unique across root blocks, toggle descendants and grid cells' descendants. External IDs are accepted and preserved; JSON import never silently changes duplicate IDs.
- `type` is one of the 16 built-in types below. `content` is required and varies by type. `attrs` is optional except for tables, which need `attrs.rows`.
- `attrs.settings` is a JSON object of block-specific settings. `attrs.props` is an optional array of `{name,value}` strings. The supported alignment property is `{name:'text-alignment',value:'left'|'center'|'right'|'justify'}`.
- Unknown JSON fields inside block content/attrs are retained. Functions, Dates, non-finite numbers and cycles are rejected; undefined optional object properties are omitted, as in JSON serialization. Do not save component instances, input signals, runtime callbacks, isEmpty or builder cell/view objects.
- Text is `TextRun[]`, never an HTML string. Each run requires `type:'text'`, `text` and `marks:[]` (or populated marks). Empty text is `[]` or `[{type:'text',text:'',marks:[]}]`; newline characters remain literal text.
- The editor normalizes empty root documents to an editable paragraph and may normalize adjacent text runs, mark ordering and table rows. Import parsing itself returns a detached document without changing the caller's object.

## Marks

### bold / italic / strike / underline / code / superscript / subscript

No attrs required.

HTML mapping: strong/b, em/i, s/strike, u, code, sup, sub.

### link

attrs.href: non-empty URL; attrs.target?: _blank | _self.

HTML mapping: a[href]; unsafe links keep their visible text without a link mark..

### textColor / backgroundColor

attrs.color: supported CSS color string.

HTML mapping: span style color/background-color; both can be applied together..

### Custom mark

Any non-empty type and scalar attrs; register matching Headless Editor mark definitions for UI rendering.

HTML mapping: Use config.importMarks with type/tagName/parseTags/readAttributes; export customization uses config.marks..

Colors accept supported hexadecimal, named, rgb/rgba, hsl/hsla and modern CSS color expressions or safe var(--token) references. URLs allow web, mail, telephone and relative links; executable schemes are rejected. Media resources allow web/relative URLs and applicable data/blob URLs, while iframe embeds allow web/relative URLs only. Use the importer as well as the schema for semantic checks.

## Block reference

### `paragraph` — Paragraph

content: TextRun[]. attrs.props?: Property[].

Text runs; use an empty array or an empty text run for an empty paragraph. Alignment is a text-alignment property, not a setting.

HTML mapping: p and unwrapped inline text.

```json
{
  "id": "paragraph",
  "type": "paragraph",
  "content": [
    {
      "type": "text",
      "text": "Hello ",
      "marks": [
        {
          "type": "bold"
        }
      ]
    },
    {
      "type": "text",
      "text": "world",
      "marks": [
        {
          "type": "link",
          "attrs": {
            "href": "https://example.com",
            "target": "_blank"
          }
        }
      ]
    }
  ],
  "attrs": {
    "props": [
      {
        "name": "text-alignment",
        "value": "left"
      }
    ]
  }
}
```

### `heading` — Heading

content: TextRun[]. attrs.settings.level?: 1 | 2 | 3 | 4 | 5 | 6.

Level defaults to 2 when omitted. The native type is heading; the level belongs to attrs.settings.

HTML mapping: h1–h6 preserve the heading level.

```json
{
  "id": "heading",
  "type": "heading",
  "content": [
    {
      "type": "text",
      "text": "Section",
      "marks": []
    }
  ],
  "attrs": {
    "settings": {
      "level": 2
    }
  }
}
```

### `code` — Code

content: TextRun[]. attrs.settings.language?: string.

language defaults to none. Text is literal source code, including newline characters. HTML export escapes it and ignores text marks.

HTML mapping: pre > code; data-language or language-* class supplies the language.

```json
{
  "id": "code",
  "type": "code",
  "content": [
    {
      "type": "text",
      "text": "const answer = 42;\nconsole.log(answer);",
      "marks": []
    }
  ],
  "attrs": {
    "settings": {
      "language": "javascript"
    }
  }
}
```

### `divider` — Divider

content: null.

No content fields or block-specific settings.

HTML mapping: hr.

```json
{
  "id": "divider",
  "type": "divider",
  "content": null
}
```

### `bulletList` — Bullet list

content: ListItem[]. ListItem = { content: TextRun[], children: ListItem[], props?: Property[] }. attrs.settings.listStyle?: "bullet" | "ordered".

children is required, including [] for leaf items. Each nested item can have its own alignment. Item IDs are not used. The block type determines the exported list tag.

HTML mapping: ul > li; nested lists become children. Mixed nested list styles use the parent block style.

```json
{
  "id": "bullet-list",
  "type": "bulletList",
  "content": [
    {
      "content": [
        {
          "type": "text",
          "text": "Parent",
          "marks": []
        }
      ],
      "children": [
        {
          "content": [
            {
              "type": "text",
              "text": "Child",
              "marks": []
            }
          ],
          "children": []
        }
      ]
    }
  ],
  "attrs": {
    "settings": {
      "listStyle": "bullet"
    }
  }
}
```

### `orderedList` — Ordered list

content: ListItem[]. attrs.settings.listStyle?: "bullet" | "ordered".

Uses the same recursive item shape as bulletList. The editor creates listStyle: ordered. Numbering/start counters are not part of this format.

HTML mapping: ol > li, including nested items.

```json
{
  "id": "ordered-list",
  "type": "orderedList",
  "content": [
    {
      "content": [
        {
          "type": "text",
          "text": "First item",
          "marks": []
        }
      ],
      "children": []
    }
  ],
  "attrs": {
    "settings": {
      "listStyle": "ordered"
    }
  }
}
```

### `quote` — Quote

content: { cite: { content: TextRun[], props?: Property[] }, caption: { content: TextRun[], props?: Property[] } }.

Both cite and caption are required. Use caption.content: [] when no attribution is present. Alignment can differ between quote and caption.

HTML mapping: blockquote, or figure > blockquote plus figcaption.

```json
{
  "id": "quote",
  "type": "quote",
  "content": {
    "cite": {
      "content": [
        {
          "type": "text",
          "text": "A quotation",
          "marks": []
        }
      ],
      "props": []
    },
    "caption": {
      "content": [
        {
          "type": "text",
          "text": "Author",
          "marks": []
        }
      ],
      "props": []
    }
  }
}
```

### `table` — Table

content: null. attrs.rows: TextRun[][][]. attrs.header?: boolean. attrs.cellMetadata?: CellMetadata[][]. CellMetadata = { props?: Property[], options?: { colspan?: positive integer, rowspan?: positive integer, width?: positive number | "auto" | null }, styles?: object }.

Index rows[row][column] to get the text runs of one cell; metadata uses the same row/column indexes. header defaults to false. Spans default to 1. At most 500 rows and 50 columns; keep a consistent logical row width. Headless Editor pads ragged/empty rows on rendering. styles and other JSON metadata are retained, but only alignment/spans/width are used by built-in export. Never put builder UI cell objects in content.

HTML mapping: table rows, th/td, colspan/rowspan/width and text-align. A th in the first row enables the header.

```json
{
  "id": "table",
  "type": "table",
  "content": null,
  "attrs": {
    "rows": [
      [
        [
          {
            "type": "text",
            "text": "Name",
            "marks": []
          }
        ],
        [
          {
            "type": "text",
            "text": "Value",
            "marks": []
          }
        ]
      ],
      [
        [
          {
            "type": "text",
            "text": "Answer",
            "marks": []
          }
        ],
        [
          {
            "type": "text",
            "text": "42",
            "marks": []
          }
        ]
      ]
    ],
    "header": true,
    "cellMetadata": [
      [
        {
          "props": [],
          "options": {
            "colspan": 1,
            "rowspan": 1,
            "width": 180
          }
        },
        {
          "props": [],
          "options": {
            "colspan": 1,
            "rowspan": 1
          }
        }
      ],
      [
        {
          "props": [],
          "options": {
            "colspan": 1,
            "rowspan": 1
          }
        },
        {
          "props": [],
          "options": {
            "colspan": 1,
            "rowspan": 1
          }
        }
      ]
    ]
  }
}
```

### `image` — Image

content: { src: string, alt: string }. attrs.settings?: { width?, height?, actualWidth?, actualHeight? }.

Dimensions are positive pixel numbers, auto or null; actualWidth/actualHeight are optional source metadata. src and alt may be empty for an unfilled block. The built-in renderer also displays alt as its caption; there is no separate image caption field.

HTML mapping: img, optionally inside figure. src, alt, width and height are imported; arbitrary figure caption text is not a separate image field.

```json
{
  "id": "image",
  "type": "image",
  "content": {
    "src": "/assets/chairs.jpg",
    "alt": "A meeting room"
  },
  "attrs": {
    "settings": {
      "width": 640,
      "height": "auto"
    }
  }
}
```

### `video` — Video

content: { src: string, caption: string, orientation?: "portrait" | "landscape" }. attrs.settings?: { width?, height?, actualWidth?, actualHeight? }.

caption is a plain string, not text runs. src/caption may be empty. Dimensions use the same types as image.

HTML mapping: video (or its source child), optionally inside figure with figcaption. Orientation defaults to landscape because ordinary HTML has no orientation metadata.

```json
{
  "id": "video",
  "type": "video",
  "content": {
    "src": "https://example.com/movie.mp4",
    "caption": "Product demo",
    "orientation": "landscape"
  },
  "attrs": {
    "settings": {
      "width": 640
    }
  }
}
```

### `embed` — Embed

content: { url: string, type: string }. attrs.settings?: { width?, height? }.

Save the embed URL, not the share-page URL. Built-in providers include pdf, youtube, vimeo, spotify, google-maps, google-docs, google-drive, codepen, figma, loom, twitter, instagram, tiktok, soundcloud, stackblitz, gist and website. The editor resolves provider URLs when entered. width/height accept positive numbers, auto or null; HTML export uses 700 × 400 if omitted.

HTML mapping: iframe src/width/height. HTML title becomes type; provider metadata cannot be reliably recovered from arbitrary markup. A custom fromHtml handler can resolve provider-specific types.

```json
{
  "id": "embed",
  "type": "embed",
  "content": {
    "url": "https://www.youtube.com/embed/example",
    "type": "youtube"
  },
  "attrs": {
    "settings": {
      "width": 700,
      "height": 400
    }
  }
}
```

### `callout` — Callout

content: TextRun[]. attrs.settings.variant?: "note" | "tip" | "warning" | "danger".

Variant defaults to note. Block alignment uses attrs.props.

HTML mapping: aside[data-callout] or .ngs-content-editor-html-callout.

```json
{
  "id": "callout",
  "type": "callout",
  "content": [
    {
      "type": "text",
      "text": "Remember this",
      "marks": []
    }
  ],
  "attrs": {
    "settings": {
      "variant": "tip"
    }
  }
}
```

### `toggle` — Toggle

content: { title: TextRun[], blocks: Block[] }. attrs.settings.expanded?: boolean.

title and blocks are required; nested blocks follow the exact same block contract. Missing expanded means closed in the reader. New editor blocks are created expanded.

HTML mapping: details > summary and nested content; open sets expanded.

```json
{
  "id": "toggle",
  "type": "toggle",
  "content": {
    "title": [
      {
        "type": "text",
        "text": "Details",
        "marks": []
      }
    ],
    "blocks": [
      {
        "id": "toggle-paragraph",
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Nested content",
            "marks": []
          }
        ]
      }
    ]
  },
  "attrs": {
    "settings": {
      "expanded": true
    }
  }
}
```

### `attachment` — Attachment

content: { url: string, name: string, size: non-negative integer, mimeType: string }.

size is the file size in bytes, not a formatted label. URL/name/MIME may be empty for an unfilled block. Upload callbacks are runtime configuration and never part of saved JSON.

HTML mapping: a[download]. Name comes from download or link text. HTML does not contain reliable file size/MIME metadata, so size is 0 and mimeType is an empty string.

```json
{
  "id": "attachment",
  "type": "attachment",
  "content": {
    "url": "https://example.com/guide.pdf",
    "name": "guide.pdf",
    "size": 2048,
    "mimeType": "application/pdf"
  }
}
```

### `gallery` — Gallery / carousel

content: { images: { id: string, src: string, alt: string, caption: TextRun[] }[] }.

All four fields are required for each image. Image IDs must be unique inside this gallery. Order is the array order. caption supports marks in the reader/export; the editor edits it as ordinary text. No Grid/Carousel mode field is supported. Empty images: [] is valid.

HTML mapping: [data-content-editor="gallery"] or .ngs-content-editor-html-gallery, with figure/img/figcaption. HTML generates fresh image IDs.

```json
{
  "id": "gallery",
  "type": "gallery",
  "content": {
    "images": [
      {
        "id": "photo-one",
        "src": "/assets/chairs.jpg",
        "alt": "Meeting room",
        "caption": [
          {
            "type": "text",
            "text": "A bright workspace",
            "marks": []
          }
        ]
      },
      {
        "id": "photo-two",
        "src": "/assets/chairs2.jpg",
        "alt": "Another room",
        "caption": []
      }
    ]
  }
}
```

### `grid` — Grid

content: { cells: { id: string, blocks: Block[] }[] }. attrs.settings?: { columns?: 2 | 3 | 4, gap?: "small" | "medium" | "large", stackOnMobile?: boolean }.

Defaults: columns 2, gap medium (24 px), stackOnMobile true. Small/large gaps are 12/36 px. Cells have IDs unique inside their grid; all nested block IDs remain globally unique. Order is the cells array, row-major. Empty cells/collections are valid. The editor may show a normal empty paragraph for editing. There is no columns block or migration format.

HTML mapping: .ngs-content-editor-html-grid > .ngs-content-editor-html-grid-cells > .ngs-content-editor-html-grid-cell. CSS variables --ngs-html-grid-columns/--ngs-html-grid-gap and the -stack class recover exported layout settings.

```json
{
  "id": "grid",
  "type": "grid",
  "content": {
    "cells": [
      {
        "id": "cell-one",
        "blocks": [
          {
            "id": "grid-heading",
            "type": "heading",
            "content": [
              {
                "type": "text",
                "text": "Overview",
                "marks": []
              }
            ],
            "attrs": {
              "settings": {
                "level": 3
              }
            }
          }
        ]
      },
      {
        "id": "cell-two",
        "blocks": [
          {
            "id": "grid-paragraph",
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Grid content",
                "marks": []
              }
            ]
          }
        ]
      }
    ]
  },
  "attrs": {
    "settings": {
      "columns": 2,
      "gap": "medium",
      "stackOnMobile": true
    }
  }
}
```

## Import API

```typescript
import { ContentEditorImporter, contentEditorFromJson, contentEditorFromHtml,
  ContentEditorImportError } from '@ngstarter-ui/components/content-editor';

// Pure functions: only the explicitly supplied configuration is used.
const fromJson = contentEditorFromJson(jsonStringOrObject);
const fromHtml = contentEditorFromHtml('<h2>Hello</h2><p><strong>World</strong></p>');

// Injected service: environment defaults are inherited.
readonly importer = inject(ContentEditorImporter);
const parsed = this.importer.fromJson(source);

// Builder methods replace the live document as one undoable edit.
builder.importJson(jsonStringOrObject);
builder.importHtml(html);
const nativeDocument = builder.getData();
const htmlExport = builder.toHtml();

try { builder.importJson(source); }
catch (error) {
  if (error instanceof ContentEditorImportError) {
    console.log(error.path, error.message);
  }
}
```

- `contentEditorFromJson(source, config?, options?)`: accepts JSON text or an unknown native object; validates all nested structures before returning `ContentEditorDocument`.
- `contentEditorFromHtml(html, config?, options?)`: imports HTML text into a detached document. Requires a DOM implementation. For server-side use, pass `{document: domDocument}` as the third argument; the parser uses `document.implementation.createHTMLDocument()` as an inert parsing document.
- `ContentEditorImporter.fromJson/fromHtml`: same signatures, with injected environment configuration and DOCUMENT for HTML parsing. Standalone pure functions do not read Angular providers.
- `builder.importJson/importHtml`: same source/config/options arguments; replaces the live document as one undoable edit, clears stale block selection and emits contentChanged through the existing change mechanism. Failed import never changes content, selection, history or draft. The return value is the live document after editor normalization. Methods require an initialized builder.
- Import options: `maxDepth: 64`, `maxBlocks: 10000`, `allowUnknownBlocks: false` by default. Blocks include descendants; depth checks protect both the source tree and returned JSON. Positive integer limits are required. To transport an application-specific JSON block without a declared config, opt in with allowUnknownBlocks. This does not create an editor UI or Angular renderer for it.
- Configuration priority: built-in parsing, environment provider, builder instance config, per-call config. `provideContentEditorConfig` works in application/route providers and inherits parent environments. It configures both imports and exports; a route gets its own importer so overrides apply to injected calls.
- Errors: ContentEditorImportError exposes `path` and `message`, for example `$.blocks[2].content.cells[0].blocks[1].id: Duplicate block ID`. Parsing stops at the first invalid field. Callback errors also propagate; no document is applied.

## HTML fidelity and extension points

HTML import is structural conversion, not arbitrary DOM serialization. It groups inline content into paragraphs, preserves supported semantic blocks/marks/alignment, ignores scripts/styles/noscript/template/object/embed content, filters unsafe resource/link URLs, and never saves event handlers or arbitrary HTML/CSS. A hyperlink with an unsafe URL keeps its text. Unsupported layout wrappers keep their supported text and descendants; unsafe/unsupported media is omitted. Empty paragraphs, br line breaks and literal code are supported.

The default HTML exported by Content Editor is recognized for callouts, galleries and responsive grids as well as standard paragraphs, headings, lists, quotes, tables, images, videos, iframes, details and downloads. HTML cannot recover original block/cell/image IDs, upload metadata, unknown attrs, video orientation or attachment size/MIME; it generates fresh IDs/default metadata. Mixed nested list styles map to the parent list type. For a lossless transfer, use native JSON. There is no implicit old-format migration.

Per-block `fromHtml` contains `selector` and `parse(element, ctx)`. It runs before the built-in parser; return a block, an array of blocks, or null to discard that element. Use `ctx.createBlock`, `createId`, `parseText`, `parseBlocks`, `safeUrl` and `defaultFromHtml`. The latter bypasses the same override and lets you extend standard parsing without recursion. `parseBlocks` retains configured overrides for descendants. Parsed custom blocks are still JSON-validated. `validateImport(block)` returns undefined on success or an error message to reject the block. Built-in validation always runs before an additional custom validator.

```typescript
provideContentEditorConfig({
  blocks: {
    heading: {
      fromHtml: {
        selector: 'h1, h2, h3, h4, h5, h6',
        parse: (element, ctx) => ctx.defaultFromHtml(element)
      }
    },
    product: {
      fromHtml: {
        selector: '[data-product-id]',
        parse: (element, ctx) => ctx.createBlock('product', {
          productId: element.getAttribute('data-product-id')
        })
      },
      validateImport: block => typeof (block.content as { productId?: unknown })?.productId === 'string'
        ? undefined : 'productId must be a string',
      toHtml: (block, ctx) => `<div data-product-id="${ctx.escape((block.content as { productId: string }).productId)}"></div>`
    }
  }
});
```

Use `config.importMarks` for additional HTML mark definitions (type, tagName, parseTags and optional readAttributes), and `config.marks` for HTML export converters. Register matching Headless Editor plugins and Content Editor renderer components to display application-defined content; import configuration alone does not add an editable block component. Custom parser/renderer/converter code is application-owned.

## Third-party exporter checklist

1. Emit `{version:1,blocks:[...]}`, UTF-8 JSON, with non-empty globally unique block IDs.
2. Serialize text as text runs with an explicit marks array. Use actual newline characters; do not escape HTML into text fields.
3. Put block settings/properties inside attrs, nested blocks inside toggle.content.blocks or grid.content.cells[].blocks, list descendants inside item.children, and table text inside attrs.rows.
4. Include all required media fields, including empty strings/arrays if unfilled, and attachment byte count/MIME type. Use persistent URLs for production assets. Runtime uploadFn callbacks do not belong in JSON.
5. Validate against document.schema.json, then use contentEditorFromJson for semantic ID, URL and limit checks before storing/importing.
6. Use native JSON for exact re-import. Treat HTML as an interoperable display/import representation with the documented metadata limitations.

## Editing, insertion and application-defined blocks

Builder import defaults to replacement. Insert mode copies the entire imported tree with fresh
block, grid-cell and gallery-image IDs, leaving the source object untouched. A destination is a
root collection, Toggle body, or Grid cell. Capture the destination before opening an overlay:

```ts
const target = builder.getInsertionTarget();
// Root: { scope: {}, afterId: 'paragraph-id' }
// Toggle: { scope: { parentId: 'toggle-id' }, afterId: 'child-id' }
// Grid: { scope: { parentId: 'grid-id', cellId: 'cell-id' }, afterId: 'child-id' }
builder.importHtml(html, {}, { mode: 'insert', target });
builder.importJson(json, {}, { mode: 'insert', target });
// Omit afterId to append to the collection; omit target to use the active destination.
```

The destination must still exist when importing. An invalid parent, cell, or `afterId` raises
`ContentEditorImportError` without changing the document. Import remains one Undo/Redo operation.
Paste uses the same HTML importer and configuration. Paragraph/Heading fields split around the current selection when pasting structured blocks, retaining lists/tables and surrounding marked text. Other inline text fields flatten supported HTML structure to text lines while retaining supported marks; code fields retain literal text.

`builder.convertBlock(id, type, settings?)` converts `paragraph`, `heading`, `quote` and `callout`,
including nested blocks. It retains ID, rich text, custom attrs and alignment. Quote attribution
becomes a final text line when converting to another type. Unsupported source types return `false`.
Use the block action menu's **Turn into** action. The heading default is level 2; callout defaults
to `note`. Conversion is a single history operation and restores the active text range.

### A single block registration

Each `ContentEditorConfig.blocks[type]` entry may define all block behaviour:

| Field | Contract |
| --- | --- |
| `editor` | Standalone Angular component with the standard editor inputs. |
| `loadEditor` | `() => Promise<Type<unknown>>`; takes precedence over `editor`. |
| `renderer` | Standalone preview component with the standard renderer inputs. |
| `create` | `() => { content, attrs? }`; the builder supplies the new ID and type. |
| `menu` | `{ title, description?, iconName?, settings? }`; registers a global menu item. |
| `options` | Runtime editor options, including upload callbacks and maximum file size. |
| `toHtml` | HTML converter; use `ctx.escape()` and `ctx.safeUrl()` for dynamic values. |
| `fromHtml` | `{ selector, parse(element, context) }` importer. |
| `validateImport` | Return an error string to reject imported block data; otherwise return `undefined`. |

Provide the configuration globally with `provideContentEditorConfig(config)` or pass `[config]`
to a builder/renderer. Nested editing uses the root builder's definitions. Nested preview renderers
inherit instance configuration, so a custom block inside Grid/Toggle needs no additional provider.
Environment defaults are merged first, then instance overrides; block fields and options merge
individually. Legacy renderer providers remain supported; `blocks[type].renderer` takes precedence.

```ts
import { ContentEditorConfig, provideContentEditorConfig }
  from '@ngstarter-ui/components/content-editor';

const config: ContentEditorConfig = {
  blocks: {
    product: {
      editor: ProductEditor,
      renderer: ProductPreview,
      create: () => ({ content: { productId: '' } }),
      menu: { title: 'Product', description: 'A product card' },
      validateImport: block =>
        typeof (block.content as { productId?: unknown })?.productId === 'string'
          ? undefined : 'productId must be a string',
      fromHtml: {
        selector: '[data-product-id]',
        parse: (element, ctx) => ctx.createBlock('product', {
          productId: element.getAttribute('data-product-id') ?? ''
        })
      },
      toHtml: (block, ctx) =>
        `<div data-product-id="${ctx.escape((block.content as { productId: string }).productId)}"></div>`
    }
  }
};
// Application/route providers: [provideContentEditorConfig(config)]
// Or: <ngs-content-editor-builder [config]="config" ... />
// And: <ngs-content-editor-renderer [config]="config" ... />
```

`ContentEditorBlockBase<TContent, TSettings>` supplies `id`, `content`, `settings`, `props`, `index`,
`initialized`, focus and history integration. Extend it in an editor and call protected
`save(nextContent, nextSettings?)`. `latestContent()` reads the current native value for edits that
may race with another field. `ContentEditorRendererBase<TContent, TSettings>` supplies preview
inputs, including the native `block`. Import both through the public `content-editor` entry point.
The docs builder includes a working Bookmark registration using these APIs.

A custom block entry explicitly permits its type during JSON import, and its `validateImport`
checks its content. Extend the supplied built-in JSON Schema with your own block shape when external
systems also validate custom documents. Unknown types without an explicit entry are rejected by
default. Runtime components/callbacks never belong in the saved JSON.

## Media upload contract

Image, Video, Gallery and Attachment share progress, cancellation, visible errors and retry.
Configure `options.uploadFn` and optionally `options.maxFileSize` (bytes) in their block entry:

```ts
import { ContentEditorUploadFn } from '@ngstarter-ui/components/content-editor';

const uploadFn: ContentEditorUploadFn = async (file, dataUrl, context) => {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/uploads', { method: 'POST', body: form, signal: context.signal });
  if (!response.ok) throw new Error('Upload failed');
  const result = await response.json() as { url: string };
  return result.url;
};
// For a transport supporting progress, call context.onProgress(percent), from 0 to 100.
// Existing callbacks taking (file, dataUrl) continue to work.
provideContentEditorConfig({ blocks: { image: { options: { uploadFn, maxFileSize: 10 * 1024 * 1024 } } } });
```

Cancellation aborts file reading and signals the transport. Late results never update a cancelled,
removed, replaced or read-only block. Consumers must pass `context.signal` to their transport to
stop its network request. Gallery keeps successful files and retry resends only failed files.
MIME/size rejection requires choosing another file and is not automatically retried.
Without transport progress the indicator is indeterminate. A successful upload returns a supported
resource URL; callbacks must reject on failure. Default callbacks use data URLs.

## Draft persistence

Use a stable document ID for multiple editors or multiple documents on the same route:

```html
<ngs-content-editor-builder documentId="article-42" [content]="document"
  [persistDraft]="true" [draftDebounceMs]="500" />
```

`persistDraft` defaults to true. Saves are delayed by 500ms by default and flushed on component
destruction or document switch. `documentId` identifies the storage entry; when omitted, the
existing route + element-ID storage key remains in use. Provide distinct IDs for independent editors.
Drafts are validated with the same JSON importer and custom configuration before restoration.
Malformed data falls back to the supplied document and exposes the error; it is not silently removed.

The builder exposes `draftStatus` (`disabled`, `idle`, `saving`, `saved`, `error`), `draftError`,
`draftSavedAt`, `saveDraftNow()` and `clearDraft()`. Status signals can drive an `aria-live` indicator
and a retry action. `clearDraft()` removes persisted state without altering the current document.
Storage/quota failures remain visible. No draft storage runs during SSR.

Environment or instance config can set `draft.debounceMs` and `draft.storage`. A storage adapter
implements synchronous `getItem(key): string | null`, `setItem(key, value): void`, and
`removeItem(key): void`; it stores serialized native JSON. The default is browser `localStorage`.
`[draftDebounceMs]` overrides the configured delay. Use `contentChanged` for asynchronous server
persistence.
