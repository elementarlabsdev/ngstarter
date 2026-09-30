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
  /** Async search callback for this registration. */
  readonly options?: NgsHeadlessEditorMentionSearch<TOption>;
  /** Angular component receiving `option` and `active` inputs for every candidate. */
  readonly optionComponent?: Type<NgsHeadlessEditorMentionOptionComponent<TOption>>;
  /** Unique trigger text for this registration. Default: @. */
  readonly trigger?: string;
}

/** One normalized trigger configuration inside the mention plugin. */
export interface NgsHeadlessEditorMentionRegistration extends NgsHeadlessEditorMentionPluginOptions {
  readonly trigger: string;
}

/** Editor-scoped configurations installed together by mentionEditorPlugin(). */
export const NGS_HEADLESS_EDITOR_MENTION_OPTIONS = new InjectionToken<readonly NgsHeadlessEditorMentionRegistration[]>(
  'NGS_HEADLESS_EDITOR_MENTION_OPTIONS', { factory: () => [] }
);
