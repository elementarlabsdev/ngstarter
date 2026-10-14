import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Button } from '@ngstarter-ui/components/button';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [Page, PageContentDirective, PageTitleDirective, CodeHighlighter, Button, RouterLink],
  templateUrl: './block-format.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorBlockFormat {
  readonly modelExample = "type Document = { version: 1; blocks: Block[] };\ntype Block<T = unknown> = { id: string; type: string; content: T;\n  attrs?: { settings?: Record<string, unknown>; props?: Property[];\n    [key: string]: unknown } };\ntype Property = { name: string; value: string };\ntype TextRun = { type: 'text'; text: string; marks: Mark[] };\ntype Mark = { type: string;\n  attrs?: Record<string, string | number | boolean | null> };";
  readonly importExample = "import { ContentEditorImporter, contentEditorFromJson, contentEditorFromHtml,\n  ContentEditorImportError } from '@ngstarter-ui/components/content-editor';\n\n// Pure functions: only the explicitly supplied configuration is used.\nconst fromJson = contentEditorFromJson(jsonStringOrObject);\nconst fromHtml = contentEditorFromHtml('<h2>Hello</h2><p><strong>World</strong></p>');\n\n// Injected service: environment defaults are inherited.\nreadonly importer = inject(ContentEditorImporter);\nconst parsed = this.importer.fromJson(source);\n\n// Builder methods replace the live document as one undoable edit.\nbuilder.importJson(jsonStringOrObject);\nbuilder.importHtml(html);\nconst nativeDocument = builder.getData();\nconst htmlExport = builder.toHtml();\n\ntry { builder.importJson(source); }\ncatch (error) {\n  if (error instanceof ContentEditorImportError) {\n    console.log(error.path, error.message);\n  }\n}";
  readonly customExample = "provideContentEditorConfig({\n  blocks: {\n    heading: {\n      fromHtml: {\n        selector: 'h1, h2, h3, h4, h5, h6',\n        parse: (element, ctx) => ctx.defaultFromHtml(element)\n      }\n    },\n    product: {\n      fromHtml: {\n        selector: '[data-product-id]',\n        parse: (element, ctx) => ctx.createBlock('product', {\n          productId: element.getAttribute('data-product-id')\n        })\n      },\n      validateImport: block => typeof (block.content as { productId?: unknown })?.productId === 'string'\n        ? undefined : 'productId must be a string',\n      toHtml: (block, ctx) => `<div data-product-id=\"${ctx.escape((block.content as { productId: string }).productId)}\"></div>`\n    }\n  }\n});";
  readonly blocks = [
  {
    "type": "paragraph",
    "title": "Paragraph",
    "fields": "content: TextRun[]. attrs.props?: Property[].",
    "notes": "Text runs; use an empty array or an empty text run for an empty paragraph. Alignment is a text-alignment property, not a setting.",
    "html": "p and unwrapped inline text.",
    "example": "{\n  \"id\": \"paragraph\",\n  \"type\": \"paragraph\",\n  \"content\": [\n    {\n      \"type\": \"text\",\n      \"text\": \"Hello \",\n      \"marks\": [\n        {\n          \"type\": \"bold\"\n        }\n      ]\n    },\n    {\n      \"type\": \"text\",\n      \"text\": \"world\",\n      \"marks\": [\n        {\n          \"type\": \"link\",\n          \"attrs\": {\n            \"href\": \"https://example.com\",\n            \"target\": \"_blank\"\n          }\n        }\n      ]\n    }\n  ],\n  \"attrs\": {\n    \"props\": [\n      {\n        \"name\": \"text-alignment\",\n        \"value\": \"left\"\n      }\n    ]\n  }\n}"
  },
  {
    "type": "heading",
    "title": "Heading",
    "fields": "content: TextRun[]. attrs.settings.level?: 1 | 2 | 3 | 4 | 5 | 6.",
    "notes": "Level defaults to 2 when omitted. The native type is heading; the level belongs to attrs.settings.",
    "html": "h1–h6 preserve the heading level.",
    "example": "{\n  \"id\": \"heading\",\n  \"type\": \"heading\",\n  \"content\": [\n    {\n      \"type\": \"text\",\n      \"text\": \"Section\",\n      \"marks\": []\n    }\n  ],\n  \"attrs\": {\n    \"settings\": {\n      \"level\": 2\n    }\n  }\n}"
  },
  {
    "type": "code",
    "title": "Code",
    "fields": "content: TextRun[]. attrs.settings.language?: string.",
    "notes": "language defaults to none. Text is literal source code, including newline characters. HTML export escapes it and ignores text marks.",
    "html": "pre > code; data-language or language-* class supplies the language.",
    "example": "{\n  \"id\": \"code\",\n  \"type\": \"code\",\n  \"content\": [\n    {\n      \"type\": \"text\",\n      \"text\": \"const answer = 42;\\nconsole.log(answer);\",\n      \"marks\": []\n    }\n  ],\n  \"attrs\": {\n    \"settings\": {\n      \"language\": \"javascript\"\n    }\n  }\n}"
  },
  {
    "type": "divider",
    "title": "Divider",
    "fields": "content: null.",
    "notes": "No content fields or block-specific settings.",
    "html": "hr.",
    "example": "{\n  \"id\": \"divider\",\n  \"type\": \"divider\",\n  \"content\": null\n}"
  },
  {
    "type": "bulletList",
    "title": "Bullet list",
    "fields": "content: ListItem[]. ListItem = { content: TextRun[], children: ListItem[], props?: Property[] }. attrs.settings.listStyle?: \"bullet\" | \"ordered\".",
    "notes": "children is required, including [] for leaf items. Each nested item can have its own alignment. Item IDs are not used. The block type determines the exported list tag.",
    "html": "ul > li; nested lists become children. Mixed nested list styles use the parent block style.",
    "example": "{\n  \"id\": \"bullet-list\",\n  \"type\": \"bulletList\",\n  \"content\": [\n    {\n      \"content\": [\n        {\n          \"type\": \"text\",\n          \"text\": \"Parent\",\n          \"marks\": []\n        }\n      ],\n      \"children\": [\n        {\n          \"content\": [\n            {\n              \"type\": \"text\",\n              \"text\": \"Child\",\n              \"marks\": []\n            }\n          ],\n          \"children\": []\n        }\n      ]\n    }\n  ],\n  \"attrs\": {\n    \"settings\": {\n      \"listStyle\": \"bullet\"\n    }\n  }\n}"
  },
  {
    "type": "orderedList",
    "title": "Ordered list",
    "fields": "content: ListItem[]. attrs.settings.listStyle?: \"bullet\" | \"ordered\".",
    "notes": "Uses the same recursive item shape as bulletList. The editor creates listStyle: ordered. Numbering/start counters are not part of this format.",
    "html": "ol > li, including nested items.",
    "example": "{\n  \"id\": \"ordered-list\",\n  \"type\": \"orderedList\",\n  \"content\": [\n    {\n      \"content\": [\n        {\n          \"type\": \"text\",\n          \"text\": \"First item\",\n          \"marks\": []\n        }\n      ],\n      \"children\": []\n    }\n  ],\n  \"attrs\": {\n    \"settings\": {\n      \"listStyle\": \"ordered\"\n    }\n  }\n}"
  },
  {
    "type": "quote",
    "title": "Quote",
    "fields": "content: { cite: { content: TextRun[], props?: Property[] }, caption: { content: TextRun[], props?: Property[] } }.",
    "notes": "Both cite and caption are required. Use caption.content: [] when no attribution is present. Alignment can differ between quote and caption.",
    "html": "blockquote, or figure > blockquote plus figcaption.",
    "example": "{\n  \"id\": \"quote\",\n  \"type\": \"quote\",\n  \"content\": {\n    \"cite\": {\n      \"content\": [\n        {\n          \"type\": \"text\",\n          \"text\": \"A quotation\",\n          \"marks\": []\n        }\n      ],\n      \"props\": []\n    },\n    \"caption\": {\n      \"content\": [\n        {\n          \"type\": \"text\",\n          \"text\": \"Author\",\n          \"marks\": []\n        }\n      ],\n      \"props\": []\n    }\n  }\n}"
  },
  {
    "type": "table",
    "title": "Table",
    "fields": "content: null. attrs.rows: TextRun[][][]. attrs.header?: boolean. attrs.cellMetadata?: CellMetadata[][]. CellMetadata = { props?: Property[], options?: { colspan?: positive integer, rowspan?: positive integer, width?: positive number | \"auto\" | null }, styles?: object }.",
    "notes": "Index rows[row][column] to get the text runs of one cell; metadata uses the same row/column indexes. header defaults to false. Spans default to 1. At most 500 rows and 50 columns; keep a consistent logical row width. Headless Editor pads ragged/empty rows on rendering. styles and other JSON metadata are retained, but only alignment/spans/width are used by built-in export. Never put builder UI cell objects in content.",
    "html": "table rows, th/td, colspan/rowspan/width and text-align. A th in the first row enables the header.",
    "example": "{\n  \"id\": \"table\",\n  \"type\": \"table\",\n  \"content\": null,\n  \"attrs\": {\n    \"rows\": [\n      [\n        [\n          {\n            \"type\": \"text\",\n            \"text\": \"Name\",\n            \"marks\": []\n          }\n        ],\n        [\n          {\n            \"type\": \"text\",\n            \"text\": \"Value\",\n            \"marks\": []\n          }\n        ]\n      ],\n      [\n        [\n          {\n            \"type\": \"text\",\n            \"text\": \"Answer\",\n            \"marks\": []\n          }\n        ],\n        [\n          {\n            \"type\": \"text\",\n            \"text\": \"42\",\n            \"marks\": []\n          }\n        ]\n      ]\n    ],\n    \"header\": true,\n    \"cellMetadata\": [\n      [\n        {\n          \"props\": [],\n          \"options\": {\n            \"colspan\": 1,\n            \"rowspan\": 1,\n            \"width\": 180\n          }\n        },\n        {\n          \"props\": [],\n          \"options\": {\n            \"colspan\": 1,\n            \"rowspan\": 1\n          }\n        }\n      ],\n      [\n        {\n          \"props\": [],\n          \"options\": {\n            \"colspan\": 1,\n            \"rowspan\": 1\n          }\n        },\n        {\n          \"props\": [],\n          \"options\": {\n            \"colspan\": 1,\n            \"rowspan\": 1\n          }\n        }\n      ]\n    ]\n  }\n}"
  },
  {
    "type": "image",
    "title": "Image",
    "fields": "content: { src: string, alt: string }. attrs.settings?: { width?, height?, actualWidth?, actualHeight? }.",
    "notes": "Dimensions are positive pixel numbers, auto or null; actualWidth/actualHeight are optional source metadata. src and alt may be empty for an unfilled block. The built-in renderer also displays alt as its caption; there is no separate image caption field.",
    "html": "img, optionally inside figure. src, alt, width and height are imported; arbitrary figure caption text is not a separate image field.",
    "example": "{\n  \"id\": \"image\",\n  \"type\": \"image\",\n  \"content\": {\n    \"src\": \"/assets/chairs.jpg\",\n    \"alt\": \"A meeting room\"\n  },\n  \"attrs\": {\n    \"settings\": {\n      \"width\": 640,\n      \"height\": \"auto\"\n    }\n  }\n}"
  },
  {
    "type": "video",
    "title": "Video",
    "fields": "content: { src: string, caption: string, orientation?: \"portrait\" | \"landscape\" }. attrs.settings?: { width?, height?, actualWidth?, actualHeight? }.",
    "notes": "caption is a plain string, not text runs. src/caption may be empty. Dimensions use the same types as image.",
    "html": "video (or its source child), optionally inside figure with figcaption. Orientation defaults to landscape because ordinary HTML has no orientation metadata.",
    "example": "{\n  \"id\": \"video\",\n  \"type\": \"video\",\n  \"content\": {\n    \"src\": \"https://example.com/movie.mp4\",\n    \"caption\": \"Product demo\",\n    \"orientation\": \"landscape\"\n  },\n  \"attrs\": {\n    \"settings\": {\n      \"width\": 640\n    }\n  }\n}"
  },
  {
    "type": "embed",
    "title": "Embed",
    "fields": "content: { url: string, type: string }. attrs.settings?: { width?, height? }.",
    "notes": "Save the embed URL, not the share-page URL. Built-in providers include pdf, youtube, vimeo, spotify, google-maps, google-docs, google-drive, codepen, figma, loom, twitter, instagram, tiktok, soundcloud, stackblitz, gist and website. The editor resolves provider URLs when entered. width/height accept positive numbers, auto or null; HTML export uses 700 × 400 if omitted.",
    "html": "iframe src/width/height. HTML title becomes type; provider metadata cannot be reliably recovered from arbitrary markup. A custom fromHtml handler can resolve provider-specific types.",
    "example": "{\n  \"id\": \"embed\",\n  \"type\": \"embed\",\n  \"content\": {\n    \"url\": \"https://www.youtube.com/embed/example\",\n    \"type\": \"youtube\"\n  },\n  \"attrs\": {\n    \"settings\": {\n      \"width\": 700,\n      \"height\": 400\n    }\n  }\n}"
  },
  {
    "type": "callout",
    "title": "Callout",
    "fields": "content: TextRun[]. attrs.settings.variant?: \"note\" | \"tip\" | \"warning\" | \"danger\".",
    "notes": "Variant defaults to note. Block alignment uses attrs.props.",
    "html": "aside[data-callout] or .ngs-content-editor-html-callout.",
    "example": "{\n  \"id\": \"callout\",\n  \"type\": \"callout\",\n  \"content\": [\n    {\n      \"type\": \"text\",\n      \"text\": \"Remember this\",\n      \"marks\": []\n    }\n  ],\n  \"attrs\": {\n    \"settings\": {\n      \"variant\": \"tip\"\n    }\n  }\n}"
  },
  {
    "type": "toggle",
    "title": "Toggle",
    "fields": "content: { title: TextRun[], blocks: Block[] }. attrs.settings.expanded?: boolean.",
    "notes": "title and blocks are required; nested blocks follow the exact same block contract. Missing expanded means closed in the reader. New editor blocks are created expanded.",
    "html": "details > summary and nested content; open sets expanded.",
    "example": "{\n  \"id\": \"toggle\",\n  \"type\": \"toggle\",\n  \"content\": {\n    \"title\": [\n      {\n        \"type\": \"text\",\n        \"text\": \"Details\",\n        \"marks\": []\n      }\n    ],\n    \"blocks\": [\n      {\n        \"id\": \"toggle-paragraph\",\n        \"type\": \"paragraph\",\n        \"content\": [\n          {\n            \"type\": \"text\",\n            \"text\": \"Nested content\",\n            \"marks\": []\n          }\n        ]\n      }\n    ]\n  },\n  \"attrs\": {\n    \"settings\": {\n      \"expanded\": true\n    }\n  }\n}"
  },
  {
    "type": "attachment",
    "title": "Attachment",
    "fields": "content: { url: string, name: string, size: non-negative integer, mimeType: string }.",
    "notes": "size is the file size in bytes, not a formatted label. URL/name/MIME may be empty for an unfilled block. Upload callbacks are runtime configuration and never part of saved JSON.",
    "html": "a[download]. Name comes from download or link text. HTML does not contain reliable file size/MIME metadata, so size is 0 and mimeType is an empty string.",
    "example": "{\n  \"id\": \"attachment\",\n  \"type\": \"attachment\",\n  \"content\": {\n    \"url\": \"https://example.com/guide.pdf\",\n    \"name\": \"guide.pdf\",\n    \"size\": 2048,\n    \"mimeType\": \"application/pdf\"\n  }\n}"
  },
  {
    "type": "gallery",
    "title": "Gallery / carousel",
    "fields": "content: { images: { id: string, src: string, alt: string, caption: TextRun[] }[] }.",
    "notes": "All four fields are required for each image. Image IDs must be unique inside this gallery. Order is the array order. caption supports marks in the reader/export; the editor edits it as ordinary text. No Grid/Carousel mode field is supported. Empty images: [] is valid.",
    "html": "[data-content-editor=\"gallery\"] or .ngs-content-editor-html-gallery, with figure/img/figcaption. HTML generates fresh image IDs.",
    "example": "{\n  \"id\": \"gallery\",\n  \"type\": \"gallery\",\n  \"content\": {\n    \"images\": [\n      {\n        \"id\": \"photo-one\",\n        \"src\": \"/assets/chairs.jpg\",\n        \"alt\": \"Meeting room\",\n        \"caption\": [\n          {\n            \"type\": \"text\",\n            \"text\": \"A bright workspace\",\n            \"marks\": []\n          }\n        ]\n      },\n      {\n        \"id\": \"photo-two\",\n        \"src\": \"/assets/chairs2.jpg\",\n        \"alt\": \"Another room\",\n        \"caption\": []\n      }\n    ]\n  }\n}"
  },
  {
    "type": "grid",
    "title": "Grid",
    "fields": "content: { cells: { id: string, blocks: Block[] }[] }. attrs.settings?: { columns?: 2 | 3 | 4, gap?: \"small\" | \"medium\" | \"large\", stackOnMobile?: boolean }.",
    "notes": "Defaults: columns 2, gap medium (24 px), stackOnMobile true. Small/large gaps are 12/36 px. Cells have IDs unique inside their grid; all nested block IDs remain globally unique. Order is the cells array, row-major. Empty cells/collections are valid. The editor may show a normal empty paragraph for editing. There is no columns block or migration format.",
    "html": ".ngs-content-editor-html-grid > .ngs-content-editor-html-grid-cells > .ngs-content-editor-html-grid-cell. CSS variables --ngs-html-grid-columns/--ngs-html-grid-gap and the -stack class recover exported layout settings.",
    "example": "{\n  \"id\": \"grid\",\n  \"type\": \"grid\",\n  \"content\": {\n    \"cells\": [\n      {\n        \"id\": \"cell-one\",\n        \"blocks\": [\n          {\n            \"id\": \"grid-heading\",\n            \"type\": \"heading\",\n            \"content\": [\n              {\n                \"type\": \"text\",\n                \"text\": \"Overview\",\n                \"marks\": []\n              }\n            ],\n            \"attrs\": {\n              \"settings\": {\n                \"level\": 3\n              }\n            }\n          }\n        ]\n      },\n      {\n        \"id\": \"cell-two\",\n        \"blocks\": [\n          {\n            \"id\": \"grid-paragraph\",\n            \"type\": \"paragraph\",\n            \"content\": [\n              {\n                \"type\": \"text\",\n                \"text\": \"Grid content\",\n                \"marks\": []\n              }\n            ]\n          }\n        ]\n      }\n    ]\n  },\n  \"attrs\": {\n    \"settings\": {\n      \"columns\": 2,\n      \"gap\": \"medium\",\n      \"stackOnMobile\": true\n    }\n  }\n}"
  }
];
  readonly marks = [
  {
    "type": "bold / italic / strike / underline / code / superscript / subscript",
    "fields": "No attrs required.",
    "html": "strong/b, em/i, s/strike, u, code, sup, sub"
  },
  {
    "type": "link",
    "fields": "attrs.href: non-empty URL; attrs.target?: _blank | _self.",
    "html": "a[href]; unsafe links keep their visible text without a link mark."
  },
  {
    "type": "textColor / backgroundColor",
    "fields": "attrs.color: supported CSS color string.",
    "html": "span style color/background-color; both can be applied together."
  },
  {
    "type": "Custom mark",
    "fields": "Any non-empty type and scalar attrs; register matching Headless Editor mark definitions for UI rendering.",
    "html": "Use config.importMarks with type/tagName/parseTags/readAttributes; export customization uses config.marks."
  }
];
}
