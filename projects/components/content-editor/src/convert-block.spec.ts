import { createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { contentEditorConvertBlock } from './convert-block';

describe('Text block conversion', () => {
  it('keeps quote attribution, marks, custom attrs and alignment without mutating its source', () => {
    const source = { id: 'q', type: 'quote', content: {
      cite: { content: [createNgsHeadlessEditorText('Quote', [{ type: 'bold' }])], props: [{ name: 'text-alignment', value: 'center' }] },
      caption: { content: [createNgsHeadlessEditorText('Author', [{ type: 'italic' }])] }
    }, attrs: { custom: 'retained' } };
    const result = contentEditorConvertBlock(source, 'callout');
    expect(result.content).toEqual([
      createNgsHeadlessEditorText('Quote', [{ type: 'bold' }]), createNgsHeadlessEditorText('\n'),
      createNgsHeadlessEditorText('Author', [{ type: 'italic' }])
    ]);
    expect(result.attrs).toEqual({ custom: 'retained', props: [{ name: 'text-alignment', value: 'center' }], settings: { variant: 'note' } });
    expect(source.type).toBe('quote');
    expect(() => contentEditorConvertBlock({ id: 'x', type: 'image', content: {} }, 'paragraph')).toThrow();
  });
});
