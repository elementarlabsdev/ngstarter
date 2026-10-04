import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Segmented, SegmentedButton } from '@ngstarter-ui/components/segmented';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Select, Option } from '@ngstarter-ui/components/select';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { Divider } from '@ngstarter-ui/components/divider';
import { ContentEditorGridSettings } from '../../types';

@Component({
  selector: 'ngs-content-editor-grid-settings-panel',
  imports: [Button, Icon, Segmented, SegmentedButton, FormField, Label, Select, Option, SlideToggle, Divider],
  templateUrl: './grid-settings-panel.html', styleUrl: './grid-settings-panel.scss', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorGridSettingsPanel {
  readonly settings = input.required<ContentEditorGridSettings>();
  readonly settingsChanged = output<Partial<ContentEditorGridSettings>>();
  readonly cellAdded = output<void>();
}
