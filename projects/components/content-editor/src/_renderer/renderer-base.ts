import { Directive, input } from '@angular/core';
import { NgsHeadlessEditorBlock } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorItemProperty } from '../types';

@Directive()
export abstract class ContentEditorRendererBase<T, S extends object = Record<string, unknown>> {
  readonly block = input<NgsHeadlessEditorBlock | null>(null);
  readonly id = input('');
  readonly type = input('');
  readonly content = input<T | null>(null);
  readonly settings = input<Partial<S>>({});
  readonly props = input<ContentEditorItemProperty[]>([]);
  readonly index = input(0);
}
