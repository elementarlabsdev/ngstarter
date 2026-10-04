import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Popover, PopoverTriggerForDirective } from '@ngstarter-ui/components/popover';
import { Menu, MenuDivider, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { ContentEditorBlockBase } from '../block-base';
import { ContentEditorNestedBlocks } from '../nested-blocks/nested-blocks';
import { ContentEditorGridSettingsPanel } from '../grid-settings-panel/grid-settings-panel';
import { ContentEditorGridContent, ContentEditorGridSettings } from '../../types';
import { emptyGridCell } from '../../extra-block-defs';
import { contentEditorGridSettings } from '../../grid-settings';
import { findContentEditorBlock } from '../../document';

@Component({
  selector: 'ngs-content-editor-grid-block',
  imports: [Button, Icon, Popover, PopoverTriggerForDirective, Menu, MenuDivider, MenuItem, MenuTrigger,
    ContentEditorNestedBlocks, ContentEditorGridSettingsPanel, CdkDrag, CdkDragHandle, CdkDropList],
  templateUrl: './grid-block.html', styleUrls: ['../../grid-layout.scss', './grid-block.scss'], changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorGridBlock extends ContentEditorBlockBase<ContentEditorGridContent, ContentEditorGridSettings> {
  readonly layout = computed(() => contentEditorGridSettings(this.settings()));

  changeSettings(change: Partial<ContentEditorGridSettings>): void {
    const settings = findContentEditorBlock(this.store.editor.document().blocks, this.id())?.attrs?.['settings'] ?? this.settings();
    this.save(this.latestContent(), contentEditorGridSettings({ ...settings, ...change }));
  }
  addCell(): void {
    const cell = emptyGridCell();
    this.store.updateBlock(this.id(), { content: { cells: [...this.latestContent().cells, cell] } });
    this.store.setFocusedBlockId(cell.blocks[0].id);
  }
  removeCell(id: string): void {
    const cells = this.latestContent().cells;
    if (cells.length <= 1) return;
    this.store.updateBlock(this.id(), { content: { cells: cells.filter(cell => cell.id !== id) } });
  }
  moveCell(from: number, to: number): void {
    const cells = [...this.latestContent().cells];
    if (from === to || from < 0 || to < 0 || from >= cells.length || to >= cells.length) return;
    moveItemInArray(cells, from, to);
    this.store.updateBlock(this.id(), { content: { cells } });
  }
  dropCell(event: CdkDragDrop<ContentEditorGridContent>): void { this.moveCell(event.previousIndex, event.currentIndex); }
}
