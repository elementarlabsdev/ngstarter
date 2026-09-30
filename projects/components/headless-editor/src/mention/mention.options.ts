import { InjectionToken, Type } from '@angular/core';
import type { NgsHeadlessEditorMentionOption } from './mention.plugin';

/** Inputs expected by the Angular component used to render each menu option. */
export interface NgsHeadlessEditorMentionOptionComponent<TOption extends NgsHeadlessEditorMentionOption = NgsHeadlessEditorMentionOption> {
  readonly option: () => TOption;
  readonly active: () => boolean;
}

/** Consumer-defined local or remote search. The query excludes the trigger. */
export type NgsHeadlessEditorMentionSearch<TOption extends NgsHeadlessEditorMentionOption = NgsHeadlessEditorMentionOption> =
  (query: string) => Promise<readonly TOption[]>;

export interface NgsHeadlessEditorMentionPluginOptions<TOption extends NgsHeadlessEditorMentionOption = NgsHeadlessEditorMentionOption> {
  /** Async search callback. A surface can override it with mentionOptions. */
  readonly options?: NgsHeadlessEditorMentionSearch<TOption>;
  /** Angular component receiving `option` and `active` inputs for every candidate. */
  readonly optionComponent?: Type<NgsHeadlessEditorMentionOptionComponent<TOption>>;
  /** Trigger text. Default: @. A surface can override it with mentionTrigger. */
  readonly trigger?: string;
}

/** Scoped through provideNgsHeadlessEditor(withHeadlessEditorPlugin(mentionEditorPlugin(options))). */
export const NGS_HEADLESS_EDITOR_MENTION_OPTIONS = new InjectionToken<NgsHeadlessEditorMentionPluginOptions>(
  'NGS_HEADLESS_EDITOR_MENTION_OPTIONS', { factory: () => ({}) }
);
