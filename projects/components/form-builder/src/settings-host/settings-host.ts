import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  effect,
  input,
  signal,
  viewChild
} from '@angular/core';
import { FormBuilderField, FormBuilderFieldDefinition, FormBuilderSchema, FormBuilderSettingsDefinition } from '../types';

@Component({
  selector: 'ngs-form-builder-settings-host',
  exportAs: 'ngsFormBuilderSettingsHost',
  templateUrl: './settings-host.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-form-builder-settings-host',
    '[class.is-empty]': '!customLoaded()'
  }
})
export class FormBuilderSettingsHost {
  readonly field = input.required<FormBuilderField>();
  readonly schema = input.required<FormBuilderSchema>();
  readonly definitions = input<FormBuilderFieldDefinition[]>([]);
  readonly settingsDefinitions = input<FormBuilderSettingsDefinition[]>([]);
  readonly update = input.required<(changes: Partial<FormBuilderField>) => void>();

  protected readonly customLoaded = signal(false);
  private readonly anchor = viewChild.required('anchor', { read: ViewContainerRef });

  constructor() {
    effect(async () => {
      const field = this.field();
      const definitions = this.definitions();
      const settingDefinitions = this.settingsDefinitions();
      const viewContainer = this.anchor();
      const fieldDefinition = definitions.find(definition => definition.type === field.type);
      const customSettings =
        fieldDefinition?.settings ??
        settingDefinitions.find(definition => definition.fieldType === field.type)?.component;

      viewContainer.clear();
      this.customLoaded.set(false);

      if (!customSettings) {
        return;
      }

      const componentType = await customSettings();
      const componentRef = viewContainer.createComponent(componentType);
      componentRef.setInput('field', field);
      componentRef.setInput('schema', this.schema());
      componentRef.setInput('update', this.update());
      this.customLoaded.set(true);
    });
  }
}
