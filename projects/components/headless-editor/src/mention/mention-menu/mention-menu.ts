import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, Signal, viewChild } from '@angular/core';
import { Menu, MenuItem } from '@ngstarter-ui/components/menu';
import { NGS_HEADLESS_EDITOR_MENTION_OPTIONS } from '../mention.options';
import { NgsHeadlessEditorMentionOption } from '../mention.plugin';

export interface NgsHeadlessEditorMentionMenuState {
  readonly suggestions: Signal<readonly NgsHeadlessEditorMentionOption[]>;
  readonly activeIndex: Signal<number>;
  optionId(index: number): string;
  select(option: NgsHeadlessEditorMentionOption): boolean;
}

/** Default menu; option content can be supplied globally through mentionEditorPlugin(). */
@Component({
  selector: 'ngs-headless-editor-mention-menu',
  imports: [Menu, MenuItem, NgComponentOutlet],
  templateUrl: './mention-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgsHeadlessEditorMentionMenu {
  readonly mentions = input.required<NgsHeadlessEditorMentionMenuState>();
  readonly menu = viewChild.required(Menu);
  protected readonly optionComponent = inject(NGS_HEADLESS_EDITOR_MENTION_OPTIONS).optionComponent;
}
