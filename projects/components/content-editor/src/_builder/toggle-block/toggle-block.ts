import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExpansionPanel, ExpansionPanelHeader, ExpansionPanelTitle } from '@ngstarter-ui/components/expansion';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { ContentEditorBlockBase } from '../block-base';
import { ContentEditorNestedBlocks } from '../nested-blocks/nested-blocks';
import { ContentEditorContentEditableDirective } from '../../content-editor-content-editable.directive';
import { ContentEditorText, ContentEditorToggleContent, ContentEditorToggleSettings } from '../../types';

@Component({
  selector: 'ngs-content-editor-toggle-block',
  imports: [ExpansionPanel, ExpansionPanelHeader, ExpansionPanelTitle, SlideToggle, ContentEditorNestedBlocks, ContentEditorContentEditableDirective],
  templateUrl: './toggle-block.html', styleUrl: './toggle-block.scss', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorToggleBlock extends ContentEditorBlockBase<ContentEditorToggleContent, ContentEditorToggleSettings> {
  changeTitle(title: ContentEditorText): void { this.save({ ...this.latestContent(), title }); }
  changeExpanded(expanded: boolean): void { this.save(this.latestContent(), { ...this.settings(), expanded }); }
}
