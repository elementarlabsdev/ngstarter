import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  NgsHeadlessEditor,
  NgsHeadlessEditorBlock,
  NgsHeadlessEditorBlockComponent
} from '@ngstarter-ui/components/headless-editor';
import { Icon } from '@ngstarter-ui/components/icon';
import { CALLOUT_ICONS, CALLOUT_TONES, CalloutTone, readCalloutAttributes } from '../callout';

/**
 * Editing UI for the callout block. The surface creates it with the block element
 * as host, passes the block through the `block` input and keeps the instance alive
 * while the block changes. Data flows back through NgsHeadlessEditor.updateBlock(),
 * which records history like any other edit.
 */
@Component({
  selector: 'app-callout-block',
  imports: [Button, Icon],
  templateUrl: './callout-block.html',
  styleUrl: './callout-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'attrs().tone'
  }
})
export class CalloutBlock implements NgsHeadlessEditorBlockComponent<null> {
  private readonly editor = inject(NgsHeadlessEditor);
  readonly block = input.required<NgsHeadlessEditorBlock<null>>();
  readonly attrs = computed(() => readCalloutAttributes(this.block()));
  readonly icons = CALLOUT_ICONS;
  readonly tones = CALLOUT_TONES;

  setTone(tone: CalloutTone): void {
    this.editor.updateBlock(this.block().id, { attrs: { ...this.attrs(), tone } });
  }

  setText(event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.editor.updateBlock(this.block().id, { attrs: { ...this.attrs(), text } });
  }

  remove(): void {
    this.editor.removeBlock(this.block().id);
  }
}
