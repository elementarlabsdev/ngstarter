import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { NgsHeadlessEditorRuns } from '@ngstarter-ui/components/headless-editor';
import { Alert, AlertIconDirective } from '@ngstarter-ui/components/alert';
import { Icon } from '@ngstarter-ui/components/icon';
import { ContentEditorRendererBase } from '../renderer-base';
import { ContentEditorCalloutSettings, ContentEditorText } from '../../types';

@Component({
  selector: 'ngs-content-editor-callout-renderer', imports: [Alert, AlertIconDirective, Icon, NgsHeadlessEditorRuns],
  templateUrl: './callout-renderer.html', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorCalloutRenderer extends ContentEditorRendererBase<ContentEditorText, ContentEditorCalloutSettings> {
  readonly appearance = computed(() => ({ note: 'informative', tip: 'positive', warning: 'notice', danger: 'negative' })[this.settings().variant ?? 'note'] ?? 'informative');
  readonly icon = computed(() => ({ note: 'fluent:info-24-regular', tip: 'fluent:lightbulb-24-regular', warning: 'fluent:warning-24-regular', danger: 'fluent:error-circle-24-regular' })[this.settings().variant ?? 'note'] ?? 'fluent:info-24-regular');
}
