import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgsHeadlessEditorRuns } from '../../headless-editor-runs.directive';
import { NgsHeadlessEditorBlock } from '../../model';
import { NgsHeadlessEditorBlockComponent } from '../../plugin';
import { getNgsHeadlessEditorTableData } from '../table.model';

/** Read-only rendering of table blocks, used while the surface is disabled or read-only. */
@Component({
  selector: 'ngs-headless-editor-table-view',
  imports: [NgsHeadlessEditorRuns],
  templateUrl: './table-view.html',
  styleUrl: './table-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgsHeadlessEditorTableView implements NgsHeadlessEditorBlockComponent<null> {
  readonly block = input.required<NgsHeadlessEditorBlock<null>>();
  readonly data = computed(() => getNgsHeadlessEditorTableData(this.block()));
}
