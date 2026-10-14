import { ContentEditorConfig, contentEditorResourceUrl } from '@ngstarter-ui/components/content-editor';
import { BookmarkBlock, BookmarkContent } from './bookmark-block/bookmark-block';
import { BookmarkRenderer } from './bookmark-renderer/bookmark-renderer';

/** One entry registers editor, preview, insertion, validation and both HTML directions. */
export const bookmarkConfig: ContentEditorConfig = { blocks: { bookmark: {
  editor: BookmarkBlock, renderer: BookmarkRenderer,
  create: () => ({ content: { title: '', url: '' } }),
  menu: { title: 'Bookmark', description: 'Example application-defined block', iconName: 'fluent:bookmark-24-regular' },
  validateImport: block => {
    const content = block.content as BookmarkContent;
    return typeof content?.title === 'string' && typeof content.url === 'string' && (!content.url || contentEditorResourceUrl(content.url)) ? undefined : 'Bookmark needs a title and supported URL';
  },
  toHtml: (block, ctx) => {
    const { title, url } = block.content as BookmarkContent;
    const href = ctx.safeUrl(url);
    return href ? `<a data-bookmark href="${ctx.escape(href)}">${ctx.escape(title)}</a>` : '';
  },
  fromHtml: { selector: 'a[data-bookmark]', parse: (element, ctx) => {
    const url = ctx.safeUrl(element.getAttribute('href'));
    return url ? ctx.createBlock('bookmark', { title: element.textContent ?? '', url }) : null;
  } }
} } };
