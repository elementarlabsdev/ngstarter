import {
  createNgsEditorId,
  createNgsEditorText,
  defineNgsEditorPlugin,
  NgsEditorBlock,
  NgsEditorCommand,
  NgsEditorPlugin
} from '@ngstarter-ui/components/editor';

export interface CommentEditorMediaAttributes {
  readonly src: string;
  readonly alt?: string;
  readonly status?: 'uploading' | 'error';
  readonly error?: string;
}

export const NGS_COMMENT_EDITOR_TOGGLE_BLOCKQUOTE: NgsEditorCommand<void> = toggleBlockCommand(
  'toggle-blockquote',
  'blockquote'
);
export const NGS_COMMENT_EDITOR_TOGGLE_CODE_BLOCK: NgsEditorCommand<void> = toggleBlockCommand(
  'toggle-code-block',
  'codeBlock'
);
export const NGS_COMMENT_EDITOR_TOGGLE_BULLET_LIST: NgsEditorCommand<void> = toggleBlockCommand(
  'toggle-bullet-list',
  'bulletList'
);
export const NGS_COMMENT_EDITOR_TOGGLE_ORDERED_LIST: NgsEditorCommand<void> = toggleBlockCommand(
  'toggle-ordered-list',
  'orderedList'
);
export const NGS_COMMENT_EDITOR_SET_LINK: NgsEditorCommand<string> = {
  id: 'set-link',
  execute: (editor, href) => editor.setMark('link', { href: normalizeLinkUrl(href) }),
  enabled: (_editor, href) => !!href?.trim(),
  active: editor => editor.isMarkActive('link')
};
export const NGS_COMMENT_EDITOR_UNSET_LINK: NgsEditorCommand<void> = {
  id: 'unset-link',
  execute: editor => editor.unsetMark('link'),
  enabled: editor => editor.isMarkActive('link'),
  active: editor => editor.isMarkActive('link')
};

export function commentEditorPlugin(): NgsEditorPlugin {
  return defineNgsEditorPlugin({
    id: 'comment-editor-features',
    blocks: [
      textBlock('blockquote', 'blockquote'),
      textBlock('codeBlock', 'pre', 'code'),
      textBlock('bulletList', 'ul', 'li'),
      textBlock('orderedList', 'ol', 'li'),
      mediaBlock('image', 'figure', renderImage),
      mediaBlock('imageUpload', 'figure', renderImageUpload),
      mediaBlock('youtube', 'figure', renderYoutube)
    ],
    marks: [
      {
        type: 'link',
        tagName: 'a',
        parseTags: ['a'],
        applyAttributes: (element, mark) => {
          const href = normalizeLinkUrl(String(mark.attrs?.['href'] ?? ''));
          element.setAttribute('href', href);
          element.setAttribute('target', '_blank');
          element.setAttribute('rel', 'noopener noreferrer');
        },
        readAttributes: element => ({ href: element.getAttribute('href') ?? '' })
      },
      {
        type: 'singleEmoji',
        tagName: 'span',
        applyAttributes: element => element.classList.add('single-emoji')
      }
    ],
    commands: [
      NGS_COMMENT_EDITOR_TOGGLE_BLOCKQUOTE,
      NGS_COMMENT_EDITOR_TOGGLE_CODE_BLOCK,
      NGS_COMMENT_EDITOR_TOGGLE_BULLET_LIST,
      NGS_COMMENT_EDITOR_TOGGLE_ORDERED_LIST,
      NGS_COMMENT_EDITOR_SET_LINK,
      NGS_COMMENT_EDITOR_UNSET_LINK
    ],
    keymap: [
      { key: 'Mod-Shift-7', command: NGS_COMMENT_EDITOR_TOGGLE_ORDERED_LIST },
      { key: 'Mod-Shift-8', command: NGS_COMMENT_EDITOR_TOGGLE_BULLET_LIST },
      { key: 'Mod-Shift-b', command: NGS_COMMENT_EDITOR_TOGGLE_BLOCKQUOTE },
      { key: 'Mod-Alt-c', command: NGS_COMMENT_EDITOR_TOGGLE_CODE_BLOCK }
    ]
  });
}

export function createCommentEditorMediaBlock(
  type: 'image' | 'imageUpload' | 'youtube',
  attrs: CommentEditorMediaAttributes
): NgsEditorBlock<null> {
  return {
    id: createNgsEditorId(type),
    type,
    content: null,
    attrs: { ...attrs }
  };
}

export function normalizeLinkUrl(value: string): string {
  const url = value.trim();
  if (!url) {
    return '';
  }
  if (/^(https?:|mailto:|tel:)/i.test(url)) {
    return url;
  }
  return `https://${url}`;
}

export function normalizeYoutubeUrl(value: string): string | null {
  const url = normalizeLinkUrl(value);
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    let videoId = '';
    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1).split('/')[0];
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/')[2] ?? '';
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2] ?? '';
      } else {
        videoId = parsed.searchParams.get('v') ?? '';
      }
    }
    return /^[\w-]{6,}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

function toggleBlockCommand(id: string, type: string): NgsEditorCommand<void> {
  return {
    id,
    execute: editor => editor.toggleBlock(type),
    active: editor => editor.isBlockActive(type)
  };
}

function textBlock(type: string, tagName: string, contentTagName?: string) {
  return {
    type,
    tagName,
    contentTagName,
    create: (): NgsEditorBlock => ({
      id: createNgsEditorId(type),
      type,
      content: [createNgsEditorText()]
    })
  };
}

function mediaBlock(
  type: string,
  tagName: string,
  render: (element: HTMLElement, block: NgsEditorBlock<null>) => void
) {
  return {
    type,
    tagName,
    editable: false,
    create: (): NgsEditorBlock<null> => ({
      id: createNgsEditorId(type),
      type,
      content: null
    }),
    render,
    isEmpty: () => false
  };
}

function renderImage(element: HTMLElement, block: NgsEditorBlock<null>): void {
  element.classList.add('ngs-comment-editor-media', 'ngs-comment-editor-image');
  const image = element.ownerDocument.createElement('img');
  image.src = String(block.attrs?.['src'] ?? '');
  image.alt = String(block.attrs?.['alt'] ?? '');
  image.loading = 'lazy';
  element.append(image);
}

function renderImageUpload(element: HTMLElement, block: NgsEditorBlock<null>): void {
  element.classList.add('ngs-comment-editor-media', 'ngs-comment-editor-image-upload');
  const image = element.ownerDocument.createElement('img');
  image.src = String(block.attrs?.['src'] ?? '');
  image.alt = '';
  element.append(image);

  const status = element.ownerDocument.createElement('span');
  status.className = 'ngs-comment-editor-upload-status';
  const error = String(block.attrs?.['error'] ?? '');
  status.textContent = error || 'Uploading image…';
  status.setAttribute('role', error ? 'alert' : 'status');
  element.append(status);
}

function renderYoutube(element: HTMLElement, block: NgsEditorBlock<null>): void {
  element.classList.add('ngs-comment-editor-media', 'ngs-comment-editor-youtube');
  const iframe = element.ownerDocument.createElement('iframe');
  iframe.src = String(block.attrs?.['src'] ?? '');
  iframe.title = 'YouTube video';
  iframe.loading = 'lazy';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.setAttribute('allowfullscreen', '');
  element.append(iframe);
}
