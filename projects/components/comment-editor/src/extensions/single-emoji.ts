import { Mark, mergeAttributes } from '@tiptap/core';

export const SingleEmoji = Mark.create({
  name: 'singleEmoji',

  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'single-emoji',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.single-emoji',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});
