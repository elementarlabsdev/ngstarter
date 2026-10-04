import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NgsHeadlessEditorRuns } from '@ngstarter-ui/components/headless-editor';
import { ExpansionPanel, ExpansionPanelHeader, ExpansionPanelTitle } from '@ngstarter-ui/components/expansion';
import { ContentEditorRendererBase } from '../renderer-base';
import { ContentEditorToggleContent, ContentEditorToggleSettings } from '../../types';
import { ContentEditorRenderer } from '../../content-editor-renderer/content-editor-renderer';

@Component({
  selector: 'ngs-content-editor-toggle-renderer', imports: [ExpansionPanel, ExpansionPanelHeader, ExpansionPanelTitle, NgsHeadlessEditorRuns, forwardRef(() => ContentEditorRenderer)],
  templateUrl: './toggle-renderer.html', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorToggleRenderer extends ContentEditorRendererBase<ContentEditorToggleContent, ContentEditorToggleSettings> {}
