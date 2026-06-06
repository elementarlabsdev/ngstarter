import { Component, input } from '@angular/core';
import type { NodeViewProps } from '@tiptap/core';

@Component({
  standalone: true,
  template: ''
})
export class AngularNodeView {
  editor = input.required<NodeViewProps['editor']>();
  node = input.required<NodeViewProps['node']>();
  decorations = input.required<NodeViewProps['decorations']>();
  selected = input.required<NodeViewProps['selected']>();
  extension = input.required<NodeViewProps['extension']>();
  getPos = input.required<NodeViewProps['getPos']>();
  updateAttributes = input.required<NodeViewProps['updateAttributes']>();
  deleteNode = input.required<NodeViewProps['deleteNode']>();
  HTMLAttributes = input<Record<string, any>>({});
  innerDecorations = input<any>(undefined);
  view = input<any>(undefined);
}
