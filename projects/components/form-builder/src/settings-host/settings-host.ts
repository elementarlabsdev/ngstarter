import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  computed,
  effect,
  input,
  signal,
  viewChild
} from '@angular/core';
import { FormBuilderField, FormBuilderFieldDefinition, FormBuilderSchema, FormBuilderSection, FormBuilderSettingsDefinition } from '../types';
import { BasicFormBuilderFieldSettings } from '../settings/basic-field-settings/basic-field-settings';
import { BasicFormBuilderLayoutSettings } from '../settings/basic-layout-settings/basic-layout-settings';
import { BasicFormBuilderSectionSettings } from '../settings/basic-section-settings/basic-section-settings';

@Component({
  selector: 'ngs-form-builder-settings-host',
  exportAs: 'ngsFormBuilderSettingsHost',
  imports: [
    BasicFormBuilderFieldSettings,
    BasicFormBuilderLayoutSettings,
    BasicFormBuilderSectionSettings
  ],
  templateUrl: './settings-host.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-form-builder-settings-host',
    '[class.is-empty]': '!customLoaded()'
  }
})
export class FormBuilderSettingsHost {
  readonly field = input<FormBuilderField | null>(null);
  readonly section = input<FormBuilderSection | null>(null);
  readonly schema = input.required<FormBuilderSchema>();
  readonly definitions = input<FormBuilderFieldDefinition[]>([]);
  readonly settingsDefinitions = input<FormBuilderSettingsDefinition[]>([]);
  readonly update = input<(changes: Partial<FormBuilderField>) => void>();
  readonly updateSection = input<(changes: Partial<FormBuilderSection>) => void>();

  protected readonly itemDefinition = computed(() => {
    const field = this.field();
    const section = this.section();

    if (section) {
      return this.definitions().find(definition => definition.type === 'section');
    }

    return field ? this.definitions().find(definition => definition.type === field.type) : undefined;
  });
  protected readonly fieldDefinition = this.itemDefinition;
  protected readonly fieldKind = computed(() => this.itemDefinition()?.kind ?? this.field()?.kind ?? 'field');
  protected readonly isLayoutField = computed(() =>
    this.fieldKind() === 'layout' || !!this.field()?.children?.length
  );

  protected readonly customLoaded = signal(false);
  private readonly anchor = viewChild.required('anchor', { read: ViewContainerRef });

  constructor() {
    effect(async () => {
      const field = this.field();
      const section = this.section();
      const definitions = this.definitions();
      const settingDefinitions = this.settingsDefinitions();
      const viewContainer = this.anchor();
      const type = section ? 'section' : field?.type;
      const itemDefinition = type ? definitions.find(definition => definition.type === type) : undefined;
      const kind = section ? 'layout' : (itemDefinition?.kind ?? field?.kind ?? 'field');
      const customSettings = itemDefinition?.settings ?? settingDefinitions.find(definition => {
        if (type && (definition.itemType === type || definition.fieldType === type || definition.type === type)) {
          return true;
        }

        return !!definition.kind && definition.kind === kind;
      })?.component;

      viewContainer.clear();
      this.customLoaded.set(false);

      if (!customSettings) {
        return;
      }

      const componentType = await customSettings();
      const componentRef = viewContainer.createComponent(componentType);
      componentRef.setInput('item', section ?? field);
      componentRef.setInput('field', field);
      componentRef.setInput('section', section);
      componentRef.setInput('schema', this.schema());
      componentRef.setInput('definition', itemDefinition);
      componentRef.setInput('update', section ? this.updateSection() : this.update());
      componentRef.setInput('updateField', this.update());
      componentRef.setInput('updateSection', this.updateSection());
      this.customLoaded.set(true);
    });
  }
}
