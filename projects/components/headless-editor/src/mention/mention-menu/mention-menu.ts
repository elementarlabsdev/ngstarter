import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, Signal, Type, viewChild } from '@angular/core';
import { Menu, MenuItem } from '@ngstarter-ui/components/menu';
import { NgsHeadlessEditorMentionOptionComponent } from '../mention.options';
import { NgsHeadlessEditorMentionOption } from '../mention.plugin';

export interface NgsHeadlessEditorMentionMenuState {
  readonly suggestions: Signal<readonly NgsHeadlessEditorMentionOption[]>;
  readonly activeIndex: Signal<number>;
  readonly optionComponent: Signal<Type<NgsHeadlessEditorMentionOptionComponent> | undefined>;
  optionId(index: number): string;
  select(option: NgsHeadlessEditorMentionOption): boolean;
}

/** Default menu; the active plugin registration supplies the option component. */
@Component({
  selector: 'ngs-headless-editor-mention-menu',
  imports: [Menu, MenuItem, NgComponentOutlet],
  templateUrl: './mention-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgsHeadlessEditorMentionMenu {
  readonly mentions = input.required<NgsHeadlessEditorMentionMenuState>();
  readonly menu = viewChild.required(Menu);
}
