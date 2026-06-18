import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output
} from '@angular/core';
import { AbstractControl, FormArray, ReactiveFormsModule, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { DEFAULT_FORM_BUILDER_ITEMS, FORM_BUILDER_FIELDS, FORM_BUILDER_ITEMS, validatorsFromRules } from '../config';
import { FormBuilderField, FormBuilderFieldDefinition, FormBuilderItemDefinition, FormBuilderLayoutItem, FormBuilderSchema, FormBuilderSection, FormBuilderUploadCallback } from '../types';
import { FormBuilderFieldHost } from '../field-host/field-host';

interface FormRendererCanvasItem extends FormBuilderLayoutItem {
  field?: FormBuilderField;
  section?: FormBuilderSection;
}

@Component({
  selector: 'ngs-form-renderer',
  exportAs: 'ngsFormRenderer',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    Button,
    FormBuilderFieldHost
  ],
  templateUrl: './form-renderer.html',
  styleUrl: './form-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-form-renderer'
  }
})
export class FormRenderer {
  private readonly providedItems = inject(FORM_BUILDER_ITEMS, { optional: true }) ?? [];
  private readonly providedFields = inject(FORM_BUILDER_FIELDS, { optional: true }) ?? [];
  private readonly orphanControls = new Map<string, FormControl>();

  readonly schema = input.required<FormBuilderSchema>();
  readonly readonly = input(false);
  readonly showSubmit = input(true);
  readonly submitLabel = input('Submit');
  readonly uploadCallback = input<FormBuilderUploadCallback | null | undefined>(undefined);
  readonly value = model<Record<string, any>>({});
  readonly formSubmit = output<Record<string, any>>();
  readonly formReady = output<FormGroup>();

  protected readonly definitions = computed<FormBuilderFieldDefinition[]>(() => [
    ...DEFAULT_FORM_BUILDER_ITEMS,
    ...this.providedFields,
    ...this.providedItems
  ].reduce<FormBuilderFieldDefinition[]>((definitions, definition) => {
    const normalized = normalizeFieldDefinition(definition);
    const index = definitions.findIndex(item => item.type === normalized.type);

    if (index === -1) {
      definitions.push(normalized);
    } else {
      definitions[index] = {
        ...definitions[index],
        ...normalized,
        defaults: {
          ...definitions[index].defaults,
          ...normalized.defaults
        }
      };
    }

    return definitions;
  }, []));
  protected readonly visibleCanvasItems = computed<FormRendererCanvasItem[]>(() =>
    this.resolveCanvasItems(this.schema()).filter(item => !!item.field || !!item.section?.fields.length)
  );
  protected readonly formGroup = computed(() => this.createFormGroup());

  constructor() {
    effect(onCleanup => {
      const form = this.formGroup();
      this.formReady.emit(form);
      const subscription = form.valueChanges.subscribe(() => {
        this.value.set(form.getRawValue());
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected getControl(field: FormBuilderField, formGroup = this.formGroup()): FormControl {
    const control = formGroup.controls[field.name];

    if (control instanceof FormControl) {
      return control;
    }

    const existing = this.orphanControls.get(field.id);

    if (existing) {
      return existing;
    }

    const nextControl = new FormControl({
      value: this.fieldInitialValue(field),
      disabled: true
    });
    this.orphanControls.set(field.id, nextControl);
    return nextControl;
  }

  protected isContainerField(field: FormBuilderField): boolean {
    const definition = this.definitions().find(item => item.type === field.type);

    return definition?.acceptsChildren === true ||
      definition?.kind === 'layout' ||
      field.kind === 'layout' ||
      field.type === 'group' ||
      field.type === 'grid';
  }

  protected visibleChildren(field: FormBuilderField): FormBuilderField[] {
    return field.children ?? [];
  }

  protected isRepeaterField(field: FormBuilderField): boolean {
    return field.type === 'repeater';
  }

  protected repeaterArray(field: FormBuilderField, formGroup = this.formGroup()): FormArray<FormGroup> {
    const control = formGroup.controls[field.name];

    return control instanceof FormArray
      ? control as FormArray<FormGroup>
      : new FormArray<FormGroup>([]);
  }

  protected repeaterGroups(field: FormBuilderField, formGroup = this.formGroup()): FormGroup[] {
    return this.repeaterArray(field, formGroup).controls;
  }

  protected repeaterEmptyText(field: FormBuilderField): string {
    const emptyText = field.settings?.['emptyText'];

    return typeof emptyText === 'string' ? emptyText.trim() : '';
  }

  protected addRepeaterItem(field: FormBuilderField, formGroup = this.formGroup()): void {
    if (this.readonly()) {
      return;
    }

    const array = this.repeaterArray(field, formGroup);

    array.push(this.createRepeaterGroup(field));
    array.updateValueAndValidity();
  }

  protected removeRepeaterItem(field: FormBuilderField, index: number, formGroup = this.formGroup()): void {
    if (this.readonly()) {
      return;
    }

    if (!this.canRemoveRepeaterItem(field, formGroup)) {
      return;
    }

    const array = this.repeaterArray(field, formGroup);

    array.removeAt(index);
    array.updateValueAndValidity();
  }

  protected canRemoveRepeaterItem(field: FormBuilderField, formGroup = this.formGroup()): boolean {
    return this.allowsNullValue(field) || this.repeaterArray(field, formGroup).length > 1;
  }

  protected submit(): void {
    const form = this.formGroup();

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(form.getRawValue());
  }

  private createFormGroup(): FormGroup {
    const controls: Record<string, AbstractControl> = {};
    const value = this.value();

    const fields = [
      ...(this.schema().fields ?? []),
      ...this.schema().sections.flatMap(section => section.fields)
    ];

    this.addFieldsToControls(controls, fields, value);

    return new FormGroup(controls);
  }

  private addFieldsToControls(
    controls: Record<string, AbstractControl>,
    fields: FormBuilderField[],
    value: Record<string, any>
  ): void {
    for (const field of fields) {
      const definition = this.definitions().find(item => item.type === field.type);

      if (this.isRepeaterField(field)) {
        controls[field.name] = this.createRepeaterArray(field, value[field.name]);
        continue;
      }

      if (this.isContainerField(field)) {
        this.addFieldsToControls(controls, field.children ?? [], value);
        continue;
      }

      if (definition?.kind === 'static' || field.kind === 'static') {
        continue;
      }

      const validators = definition?.validators?.(field) ?? validatorsFromRules(field.validation, field);
      const control = new FormControl(
        {
          value: value[field.name] ?? this.fieldInitialValue(field),
          disabled: field.disabled || this.readonly()
        },
        validators
      );

      controls[field.name] = control;
    }
  }

  private createRepeaterArray(field: FormBuilderField, value: unknown): FormArray<FormGroup> {
    const allowNullValue = this.allowsNullValue(field);
    const rows = Array.isArray(value) && (allowNullValue || value.length > 0)
      ? value
      : allowNullValue
        ? []
        : [{}];
    const validators = allowNullValue ? [] : [repeaterRequiredValidator];

    return new FormArray(rows.map(row => this.createRepeaterGroup(field, row)), validators);
  }

  private createRepeaterGroup(field: FormBuilderField, value: unknown = {}): FormGroup {
    const controls: Record<string, AbstractControl> = {};
    const rowValue = isRecord(value) ? value : {};

    for (const child of flattenFields(field.children ?? [])) {
      const definition = this.definitions().find(item => item.type === child.type);

      if (this.isContainerField(child) || definition?.kind === 'static' || child.kind === 'static') {
        continue;
      }

      const validators = definition?.validators?.(child) ?? validatorsFromRules(child.validation, child);
      controls[child.name] = new FormControl(
        {
          value: rowValue[child.name] ?? this.fieldInitialValue(child),
          disabled: child.disabled || this.readonly()
        },
        validators
      );
    }

    return new FormGroup(controls);
  }

  private fieldInitialValue(field: FormBuilderField): any {
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    if (field.type === 'upload') {
      return field.multiple ? [] : null;
    }

    const selectedValues = (field.options ?? [])
      .filter(option => option.selected)
      .map(option => option.value);

    if (field.type === 'checkbox-list' || field.multiple) {
      return selectedValues;
    }

    return selectedValues[0] ?? null;
  }

  private allowsNullValue(field: FormBuilderField): boolean {
    return field.settings?.['allowNullValue'] === true;
  }

  private resolveCanvasItems(schema: FormBuilderSchema): FormRendererCanvasItem[] {
    const fieldsById = new Map((schema.fields ?? []).map(field => [field.id, field]));
    const sectionsById = new Map(schema.sections.map(section => [section.id, section]));
    const items: FormRendererCanvasItem[] = [];

    for (const item of normalizedLayout(schema)) {
      if (item.kind === 'field') {
        const field = fieldsById.get(item.id);

        if (field) {
          items.push({ ...item, field });
        }

        continue;
      }

      const section = sectionsById.get(item.id);

      if (section) {
        items.push({ ...item, section });
      }
    }

    return items;
  }
}

function normalizeFieldDefinition(definition: FormBuilderItemDefinition): FormBuilderFieldDefinition {
  return {
    ...definition,
    kind: definition.kind ?? 'field'
  } as FormBuilderFieldDefinition;
}

function flattenFields(fields: FormBuilderField[]): FormBuilderField[] {
  return fields.flatMap(field => [field, ...flattenFields(field.children ?? [])]);
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function repeaterRequiredValidator(control: AbstractControl): ValidationErrors | null {
  return control instanceof FormArray && control.length === 0
    ? { repeaterRequired: true }
    : null;
}

function normalizedLayout(schema: FormBuilderSchema): FormBuilderLayoutItem[] {
  const used = new Set<string>();
  const layout: FormBuilderLayoutItem[] = [];
  const fieldsById = new Map((schema.fields ?? []).map(field => [field.id, field]));
  const sectionsById = new Map(schema.sections.map(section => [section.id, section]));

  for (const item of schema.layout ?? []) {
    const key = `${item.kind}:${item.id}`;

    if (used.has(key)) {
      continue;
    }

    if ((item.kind === 'field' && fieldsById.has(item.id)) || (item.kind === 'section' && sectionsById.has(item.id))) {
      used.add(key);
      layout.push(item);
    }
  }

  for (const field of schema.fields ?? []) {
    const key = `field:${field.id}`;

    if (!used.has(key)) {
      used.add(key);
      layout.push({ kind: 'field', id: field.id });
    }
  }

  for (const section of schema.sections) {
    const key = `section:${section.id}`;

    if (!used.has(key)) {
      used.add(key);
      layout.push({ kind: 'section', id: section.id });
    }
  }

  return layout;
}
