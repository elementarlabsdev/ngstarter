import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgsHeadlessEditorBlock, NgsHeadlessEditorBlockComponent } from '@ngstarter-ui/components/headless-editor';
import { Icon } from '@ngstarter-ui/components/icon';
import { CALLOUT_ICONS, readCalloutAttributes } from '../callout';

/** Read-only presentation used while the surface is disabled or read-only. */
@Component({
  selector: 'app-callout-preview',
  imports: [Icon],
  templateUrl: './callout-preview.html',
  styleUrl: './callout-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'attrs().tone'
  }
})
export class CalloutPreview implements NgsHeadlessEditorBlockComponent<null> {
  readonly block = input.required<NgsHeadlessEditorBlock<null>>();
  readonly attrs = computed(() => readCalloutAttributes(this.block()));
  readonly icons = CALLOUT_ICONS;
}
