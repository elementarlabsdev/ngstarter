import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import {
  FORM_BUILDER_FIELD_BASE_SETTINGS_SCHEMA,
  FORM_BUILDER_INPUT_FIELD_BASE_SETTINGS_SCHEMA,
  FORM_BUILDER_LAYOUT_BASE_SETTINGS_SCHEMA,
  FORM_BUILDER_LAYOUT_CONTAINER_BASE_SETTINGS_SCHEMA,
  FORM_BUILDER_SELECT_DATA_SOURCES,
  FORM_BUILDER_SECTION_BASE_SETTINGS_SCHEMA,
  FORM_BUILDER_STATIC_BASE_SETTINGS_SCHEMA
} from '../config';
import {
  FormBuilderComponentImporter,
  FormBuilderField,
  FormBuilderFieldDefinition,
  FormBuilderItemDefinition,
  FormBuilderOption,
  FormBuilderSchema,
  FormBuilderSection,
  FormBuilderSettingsConfig,
  FormBuilderSettingsDefinition,
  FormBuilderSettingsInheritance
} from '../types';
import { FormRenderer } from '../form-renderer/form-renderer';

@Component({
  selector: 'ngs-form-builder-settings-host',
  exportAs: 'ngsFormBuilderSettingsHost',
  imports: [
    FormRenderer
  ],
  templateUrl: './settings-host.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-form-builder-settings-host',
    '[class.is-empty]': '!settingsSchema() && !legacyLoaded()'
  }
})
export class FormBuilderSettingsHost {
  private readonly selectDataSources = inject(FORM_BUILDER_SELECT_DATA_SOURCES, { optional: true }) ?? [];

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
  protected readonly settingsSchema = computed(() => {
    const definition = this.itemDefinition();
    const config = this.settingsConfig(definition);
    const inheritance = config?.extends ?? this.inferSettingsInheritance(definition);
    const schemas = [
      this.baseSettingsSchema(inheritance),
      this.resolveOwnSettingsSchema(config, definition)
    ].filter((schema): schema is FormBuilderSchema => !!schema);

    return this.withRegisteredSelectDataSources(mergeSettingsSchemas(schemas));
  });
  protected readonly settingsValue = computed(() => {
    const item = this.section() ?? this.field();
    const schema = this.settingsSchema();
    const value: Record<string, any> = {};

    if (!item || !schema) {
      return value;
    }

    for (const settingField of flattenSettingsFields(schema)) {
      value[settingField.name] = this.readSettingValue(item, settingField);
    }

    return value;
  });
  protected readonly legacyLoaded = signal(false);
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
      const legacySettings = this.legacySettingsImporter(itemDefinition) ?? settingDefinitions.find(definition => {
        if (type && (definition.itemType === type || definition.fieldType === type || definition.type === type)) {
          return true;
        }

        return !!definition.kind && definition.kind === kind;
      })?.component;

      viewContainer.clear();
      this.legacyLoaded.set(false);

      if (!legacySettings) {
        return;
      }

      const componentType = await legacySettings();
      const componentRef = viewContainer.createComponent(componentType);
      componentRef.setInput('item', section ?? field);
      componentRef.setInput('field', field);
      componentRef.setInput('section', section);
      componentRef.setInput('schema', this.schema());
      componentRef.setInput('definition', itemDefinition);
      componentRef.setInput('update', section ? this.updateSection() : this.update());
      componentRef.setInput('updateField', this.update());
      componentRef.setInput('updateSection', this.updateSection());
      this.legacyLoaded.set(true);
    });
  }

  protected applySettingsValue(value: Record<string, any>): void {
    const schema = this.settingsSchema();
    const section = this.section();
    const field = this.field();

    if (!schema) {
      return;
    }

    if (section) {
      const patch = this.createSettingsPatch(section, schema, value);

      if (Object.keys(patch).length) {
        this.updateSection()?.(patch);
      }

      return;
    }

    if (field) {
      const patch = this.createSettingsPatch(field, schema, value);

      if (Object.keys(patch).length) {
        this.update()?.(patch);
      }
    }
  }

  private createSettingsPatch<T extends FormBuilderField | FormBuilderSection>(
    item: T,
    schema: FormBuilderSchema,
    value: Record<string, any>
  ): Partial<T> {
    const patch: Record<string, any> = {};

    for (const settingField of flattenSettingsFields(schema)) {
      if (settingField.settings?.['valueAdapter'] === 'selectOptionsSource' && isFormBuilderField(item)) {
        const nextSource = value[settingField.name] === 'dataSource' ? 'dataSource' : 'static';

        if (nextSource === this.readSettingValue(item, settingField)) {
          continue;
        }

        patch['optionsSource'] = nextSource;
        patch['defaultValue'] = nextSource === 'dataSource'
          ? item.multiple ? [] : null
          : resolveSelectedDefaultValue(item.options ?? [], item);

        continue;
      }

      if (settingField.settings?.['valueAdapter'] === 'optionsText' && isFormBuilderField(item)) {
        if (value[settingField.name] === this.readSettingValue(item, settingField)) {
          continue;
        }

        const nextOptions = parseOptionsText(String(value[settingField.name] ?? ''), item);

        patch['options'] = nextOptions;
        patch['defaultValue'] = resolveSelectedDefaultValue(nextOptions, item);
        continue;
      }

      if (settingField.settings?.['valueAdapter'] === 'selectMultiple' && isFormBuilderField(item)) {
        const multiple = value[settingField.name] === true;

        if (multiple === (item.multiple === true)) {
          continue;
        }

        const options = multiple ? item.options ?? [] : normalizeSelectedOptions(item.options ?? [], { ...item, multiple });

        patch['multiple'] = multiple;
        patch['options'] = options;
        patch['defaultValue'] = resolveMultipleDefaultValue(item, options, multiple);
        continue;
      }

      if (settingField.settings?.['valueAdapter'] === 'multipleDefaultValue' && isFormBuilderField(item)) {
        const multiple = value[settingField.name] === true;

        if (multiple === (item.multiple === true)) {
          continue;
        }

        patch['multiple'] = multiple;
        patch['defaultValue'] = multiple ? [] : null;
        continue;
      }

      const nextValue = value[settingField.name];

      if (nextValue === this.readSettingValue(item, settingField)) {
        continue;
      }

      seedPathPatch(patch, item, settingField.name);
      setPathValue(patch, settingField.name, nextValue);
    }

    return patch as Partial<T>;
  }

  private readSettingValue(item: FormBuilderField | FormBuilderSection, settingField: FormBuilderField): any {
    if (settingField.settings?.['valueAdapter'] === 'selectOptionsSource' && isFormBuilderField(item)) {
      return item.optionsSource ?? (item.dataSource ? 'dataSource' : 'static');
    }

    if (settingField.settings?.['valueAdapter'] === 'optionsText' && isFormBuilderField(item)) {
      return optionsToText(item.options ?? [], item.defaultValue);
    }

    const value = getPathValue(item, settingField.name);

    return value === undefined ? settingField.defaultValue ?? null : value;
  }

  private settingsConfig(definition: FormBuilderItemDefinition | undefined): FormBuilderSettingsConfig | undefined {
    return definition?.settings && typeof definition.settings !== 'function'
      ? definition.settings
      : undefined;
  }

  private legacySettingsImporter(definition: FormBuilderItemDefinition | undefined): FormBuilderComponentImporter | undefined {
    return typeof definition?.settings === 'function'
      ? definition.settings
      : undefined;
  }

  private resolveOwnSettingsSchema(
    config: FormBuilderSettingsConfig | undefined,
    definition: FormBuilderItemDefinition | undefined
  ): FormBuilderSchema | null {
    const schema = config?.schema;

    if (!schema) {
      return null;
    }

    if (typeof schema !== 'function') {
      return schema;
    }

    const section = this.section();

    if (section) {
      return schema({
        item: section,
        section,
        schema: this.schema(),
        definition,
        update: this.updateSection()!,
        updateSection: this.updateSection()!
      });
    }

    const field = this.field()!;

    return schema({
      item: field,
      field,
      schema: this.schema(),
      definition,
      update: this.update()!,
      updateField: this.update()!
    });
  }

  private inferSettingsInheritance(definition: FormBuilderItemDefinition | undefined): FormBuilderSettingsInheritance {
    const field = this.field();

    if (this.section()) {
      return 'none';
    }

    const kind = definition?.kind ?? field?.kind ?? 'field';

    if (kind === 'static') {
      return 'static';
    }

    if (kind === 'layout' || definition?.acceptsChildren || field?.children?.length) {
      return 'layout';
    }

    return 'field';
  }

  private baseSettingsSchema(inheritance: FormBuilderSettingsInheritance): FormBuilderSchema | null {
    if (this.section()) {
      return inheritance === 'none' ? null : FORM_BUILDER_SECTION_BASE_SETTINGS_SCHEMA;
    }

    switch (inheritance) {
      case 'field':
        return FORM_BUILDER_FIELD_BASE_SETTINGS_SCHEMA;
      case 'input-field':
        return FORM_BUILDER_INPUT_FIELD_BASE_SETTINGS_SCHEMA;
      case 'layout':
        return FORM_BUILDER_LAYOUT_BASE_SETTINGS_SCHEMA;
      case 'layout-container':
        return FORM_BUILDER_LAYOUT_CONTAINER_BASE_SETTINGS_SCHEMA;
      case 'static':
        return FORM_BUILDER_STATIC_BASE_SETTINGS_SCHEMA;
      default:
        return null;
    }
  }

  private withRegisteredSelectDataSources(schema: FormBuilderSchema | null): FormBuilderSchema | null {
    if (!schema) {
      return null;
    }

    const dataSourceOptions = this.selectDataSources.map(dataSource => ({
      label: dataSource.name,
      value: dataSource.id
    }));

    return {
      ...schema,
      fields: schema.fields?.map(field => this.withSelectDataSourceOptions(field, dataSourceOptions)),
      sections: schema.sections.map(section => ({
        ...section,
        fields: section.fields.map(field => this.withSelectDataSourceOptions(field, dataSourceOptions))
      }))
    };
  }

  private withSelectDataSourceOptions(field: FormBuilderField, options: FormBuilderOption[]): FormBuilderField {
    const children = field.children?.map(child => this.withSelectDataSourceOptions(child, options));

    if (field.settings?.['valueAdapter'] !== 'selectDataSource') {
      return children ? { ...field, children } : field;
    }

    return {
      ...field,
      children,
      options
    };
  }
}

function mergeSettingsSchemas(schemas: FormBuilderSchema[]): FormBuilderSchema | null {
  if (!schemas.length) {
    return null;
  }

  return {
    sections: schemas.flatMap(schema => schema.sections.map(section => ({
      ...section,
      fields: section.fields.map(field => ({ ...field }))
    })))
  };
}

function flattenSettingsFields(schema: FormBuilderSchema): FormBuilderField[] {
  return [
    ...(schema.fields ?? []),
    ...schema.sections.flatMap(section => section.fields)
  ].flatMap(field => [field, ...flattenSettingsFields({ sections: [], fields: field.children ?? [] })]);
}

function getPathValue(source: Record<string, any>, path: string): any {
  return path.split('.').reduce<any>((value, key) => value?.[key], source);
}

function setPathValue(target: Record<string, any>, path: string, value: any): void {
  const keys = path.split('.');
  let cursor = target;

  keys.slice(0, -1).forEach(key => {
    cursor[key] = cursor[key] ?? {};
    cursor = cursor[key];
  });

  cursor[keys[keys.length - 1]] = value;
}

function seedPathPatch(target: Record<string, any>, source: Record<string, any>, path: string): void {
  const [rootKey] = path.split('.');
  const sourceValue = source[rootKey];

  if (!path.includes('.') || target[rootKey] !== undefined || !isPlainObject(sourceValue)) {
    return;
  }

  target[rootKey] = { ...sourceValue };
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFormBuilderField(item: FormBuilderField | FormBuilderSection): item is FormBuilderField {
  return 'type' in item;
}

function optionsToText(options: FormBuilderOption[], defaultValue: any): string {
  return options
    .map(option => `${option.label}:${option.value}${isOptionSelected(option, defaultValue) ? ':selected' : ''}`)
    .join('\n');
}

function parseOptionsText(value: string, field: FormBuilderField): FormBuilderOption[] {
  return normalizeSelectedOptions(value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parsed = parseOptionLine(line);

      return {
        label: parsed?.label || `Option ${index + 1}`,
        value: parsed?.value || `option_${index + 1}`,
        selected: parsed?.selected || undefined
      };
    }), field);
}

function parseOptionLine(line: string): FormBuilderOption | null {
  const parts = line.split(':').map(part => part.trim());

  if (parts.length < 2 || !parts[0] || !parts[1]) {
    return null;
  }

  return {
    label: parts[0],
    value: parts[1],
    selected: parts[2] === 'selected'
  };
}

function normalizeSelectedOptions(options: FormBuilderOption[], field: FormBuilderField): FormBuilderOption[] {
  if (field.type === 'checkbox-list' || field.multiple) {
    return options;
  }

  let selectedSeen = false;

  return options.map(option => {
    if (!option.selected) {
      return option;
    }

    if (selectedSeen) {
      return {
        ...option,
        selected: undefined
      };
    }

    selectedSeen = true;
    return option;
  });
}

function resolveSelectedDefaultValue(options: FormBuilderOption[], field: FormBuilderField): any {
  const selectedValues = options
    .filter(option => option.selected)
    .map(option => option.value);

  if (field.type === 'checkbox-list' || field.multiple) {
    return selectedValues;
  }

  return selectedValues[0] ?? null;
}

function resolveMultipleDefaultValue(field: FormBuilderField, options: FormBuilderOption[], multiple: boolean): any {
  const selectedValues = options
    .filter(option => option.selected)
    .map(option => option.value);

  if (multiple) {
    return Array.isArray(field.defaultValue)
      ? field.defaultValue
      : field.defaultValue == null
        ? selectedValues
        : [field.defaultValue];
  }

  return Array.isArray(field.defaultValue)
    ? field.defaultValue[0] ?? selectedValues[0] ?? null
    : field.defaultValue ?? selectedValues[0] ?? null;
}

function isOptionSelected(option: FormBuilderOption, defaultValue: any): boolean {
  if (option.selected) {
    return true;
  }

  return Array.isArray(defaultValue)
    ? defaultValue.includes(option.value)
    : defaultValue === option.value;
}
