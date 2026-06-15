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
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { DEFAULT_FORM_BUILDER_FIELDS, FORM_BUILDER_FIELDS, validatorsFromRules } from '../config';
import { FormBuilderField, FormBuilderFieldDefinition, FormBuilderLayoutItem, FormBuilderSchema, FormBuilderSection } from '../types';
import { FormBuilderFieldHost } from '../field-host/field-host';

interface FormBuilderRendererCanvasItem extends FormBuilderLayoutItem {
  field?: FormBuilderField;
  section?: FormBuilderSection;
}

@Component({
  selector: 'ngs-form-builder-renderer',
  exportAs: 'ngsFormBuilderRenderer',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    Button,
    FormBuilderFieldHost
  ],
  templateUrl: './form-builder-renderer.html',
  styleUrl: './form-builder-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-form-builder-renderer'
  }
})
export class FormBuilderRenderer {
  private readonly providedFields = inject(FORM_BUILDER_FIELDS, { optional: true }) ?? [];

  readonly schema = input.required<FormBuilderSchema>();
  readonly readonly = input(false);
  readonly showSubmit = input(true);
  readonly submitLabel = input('Submit');
  readonly value = model<Record<string, any>>({});
  readonly formSubmit = output<Record<string, any>>();
  readonly formReady = output<FormGroup>();

  protected readonly definitions = computed<FormBuilderFieldDefinition[]>(() => [
    ...DEFAULT_FORM_BUILDER_FIELDS,
    ...this.providedFields
  ]);
  protected readonly visibleCanvasItems = computed<FormBuilderRendererCanvasItem[]>(() =>
    this.resolveCanvasItems(this.schema())
      .map(item => {
        if (item.field) {
          return {
            ...item,
            field: this.visibleFields([item.field])[0]
          };
        }

        return {
          ...item,
          section: {
            ...item.section!,
            fields: this.visibleFields(item.section!.fields)
          }
        };
      })
      .filter(item => !!item.field || !!item.section?.fields.length)
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

  protected getControl(field: FormBuilderField): FormControl {
    return this.formGroup().get(field.name) as FormControl;
  }

  protected isContainerField(field: FormBuilderField): boolean {
    return field.type === 'group' || field.type === 'grid';
  }

  protected visibleChildren(field: FormBuilderField): FormBuilderField[] {
    return this.visibleFields(field.children ?? []);
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
    const controls: Record<string, FormControl> = {};
    const value = this.value();

    const fields = [
      ...flattenFields(this.schema().fields ?? []),
      ...this.schema().sections.flatMap(section => flattenFields(section.fields))
    ];

    for (const field of fields) {
      if (this.isContainerField(field)) {
        continue;
      }

      const definition = this.definitions().find(item => item.type === field.type);
      const validators = definition?.validators?.(field) ?? validatorsFromRules(field.validation, field);
      const control = new FormControl(
        {
          value: value[field.name] ?? field.defaultValue ?? null,
          disabled: field.disabled || this.readonly()
        },
        validators
      );

      controls[field.name] = control;
    }

    return new FormGroup(controls);
  }

  private visibleFields(fields: FormBuilderField[]): FormBuilderField[] {
    return fields
      .filter(field => field.visibility?.form !== false)
      .map(field => ({
        ...field,
        children: field.children ? this.visibleFields(field.children) : undefined
      }));
  }

  private resolveCanvasItems(schema: FormBuilderSchema): FormBuilderRendererCanvasItem[] {
    const fieldsById = new Map((schema.fields ?? []).map(field => [field.id, field]));
    const sectionsById = new Map(schema.sections.map(section => [section.id, section]));
    const items: FormBuilderRendererCanvasItem[] = [];

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

function flattenFields(fields: FormBuilderField[]): FormBuilderField[] {
  return fields.flatMap(field => [field, ...flattenFields(field.children ?? [])]);
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
