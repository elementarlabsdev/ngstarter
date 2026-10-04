import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { Alert, AlertIconDirective, AlertActionDirective } from '@ngstarter-ui/components/alert';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { ContentEditorBlockBase } from '../block-base';
import { ContentEditorContentEditableDirective } from '../../content-editor-content-editable.directive';
import { ContentEditorCalloutSettings, ContentEditorCalloutVariant, ContentEditorText } from '../../types';

@Component({
  selector: 'ngs-content-editor-callout-block',
  imports: [Alert, AlertIconDirective, AlertActionDirective, Icon, Button, Menu, MenuItem, MenuTrigger, ContentEditorContentEditableDirective],
  templateUrl: './callout-block.html', styleUrl: './callout-block.scss', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorCalloutBlock extends ContentEditorBlockBase<ContentEditorText, ContentEditorCalloutSettings> {
  readonly variants: ContentEditorCalloutVariant[] = ['note', 'tip', 'warning', 'danger'];
  readonly appearance = computed(() => ({ note: 'informative', tip: 'positive', warning: 'notice', danger: 'negative' })[this.settings().variant] ?? 'informative');
  readonly icon = computed(() => ({ note: 'fluent:info-24-regular', tip: 'fluent:lightbulb-24-regular', warning: 'fluent:warning-24-regular', danger: 'fluent:error-circle-24-regular' })[this.settings().variant] ?? 'fluent:info-24-regular');
  changeVariant(variant: ContentEditorCalloutVariant): void { this.save(this.content(), { ...this.settings(), variant }); }
  changeText(content: ContentEditorText): void { this.save(content); }
}
