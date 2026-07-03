import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { AbstractControl, FormArray, ReactiveFormsModule, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Step, Stepper } from '@ngstarter-ui/components/stepper';
import {
  asyncValidatorsFromRules,
  DEFAULT_FORM_BUILDER_ITEMS,
  FORM_BUILDER_CALCULATION_ENGINE,
  FORM_BUILDER_FIELDS,
  FORM_BUILDER_ITEMS,
  FORM_BUILDER_LOGIC_ENGINE,
  FORM_BUILDER_VALIDATORS,
  mergeFormBuilderValidatorDefinitions,
  validatorsFromRules
} from '../config';
import { FormBuilderCalculationEngine, FormBuilderField, FormBuilderFieldDefinition, FormBuilderFlow, FormBuilderItemDefinition, FormBuilderLayoutItem, FormBuilderLogicEvaluation, FormBuilderLogicFieldState, FormBuilderSchema, FormBuilderSection, FormBuilderStep, FormBuilderUploadCallback } from '../types';
import { FormBuilderFieldHost } from '../field-host/field-host';
import { DEFAULT_FORM_BUILDER_CALCULATION_ENGINE } from '../calculation-engine';
import { DEFAULT_FORM_BUILDER_LOGIC_ENGINE } from '../logic-engine';

interface FormRendererCanvasItem extends FormBuilderLayoutItem {
  field?: FormBuilderField;
  section?: FormBuilderSection;
}

interface FormRendererStep extends FormBuilderStep {
  items: FormRendererCanvasItem[];
}

interface PlainTextExpression {
  id: string;
  expression: string;
}

@Component({
  selector: 'ngs-form-renderer',
  exportAs: 'ngsFormRenderer',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    Button,
    Step,
    Stepper,
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
  private readonly providedValidators = inject(FORM_BUILDER_VALIDATORS, { optional: true }) ?? [];
  private readonly calculationEngine = inject(FORM_BUILDER_CALCULATION_ENGINE, { optional: true }) ??
    DEFAULT_FORM_BUILDER_CALCULATION_ENGINE;
  private readonly logicEngine = inject(FORM_BUILDER_LOGIC_ENGINE, { optional: true }) ??
    DEFAULT_FORM_BUILDER_LOGIC_ENGINE;
  private readonly orphanControls = new WeakMap<AbstractControl, Map<string, FormControl>>();
  private readonly logicEvaluations = new WeakMap<AbstractControl, FormBuilderLogicEvaluation>();
  private readonly logicVersion = signal(0);

  readonly schema = input.required<FormBuilderSchema>();
  readonly flow = input<FormBuilderFlow | null | undefined>(undefined);
  readonly items = input<FormBuilderLayoutItem[] | null | undefined>(undefined);
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
  protected readonly visibleCanvasItems = computed<FormRendererCanvasItem[]>(() => {
    const items = this.items();

    return this.resolveCanvasItems(this.schema(), items ?? undefined)
      .filter(item => !!item.field || !!item.section?.fields.length);
  });
  protected readonly activeFlow = computed(() => this.flow() ?? this.schema().flow);
  protected readonly stepsMode = computed(() => this.items() == null && this.isStepsMode(this.activeFlow()));
  protected readonly visibleSteps = computed<FormRendererStep[]>(() =>
    this.resolveSteps(this.schema(), this.activeFlow()).map(step => ({
      ...step,
      items: step.items.filter(item => !!item.field || !!item.section?.fields.length)
    })).filter(step => step.items.length || step.optional !== true)
  );
  protected readonly validatorDefinitions = computed(() =>
    mergeFormBuilderValidatorDefinitions(this.providedValidators)
  );
  protected readonly formGroup = computed(() => this.createFormGroup());

  constructor() {
    effect(onCleanup => {
      const form = this.formGroup();

      this.applyRuntime(form);
      this.formReady.emit(form);
      const subscription = form.valueChanges.subscribe(() => {
        this.applyRuntime(form);
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

    return this.getOrCreateOrphanControl(field, formGroup);
  }

  protected isContainerField(field: FormBuilderField): boolean {
    const definition = this.definitions().find(item => item.type === field.type);

    return definition?.acceptsChildren === true ||
      definition?.kind === 'layout' ||
      field.kind === 'layout' ||
      field.type === 'group' ||
      field.type === 'grid';
  }

  protected visibleChildren(field: FormBuilderField, formGroup = this.formGroup()): FormBuilderField[] {
    return (field.children ?? []).filter(child => this.fieldVisible(child, formGroup));
  }

  protected fieldVisible(field: FormBuilderField, formGroup = this.formGroup()): boolean {
    return this.logicState(field, formGroup).hidden !== true;
  }

  protected sectionVisible(section: FormBuilderSection, formGroup = this.formGroup()): boolean {
    return this.sectionLogicState(section, formGroup).hidden !== true &&
      section.fields.some(field => this.fieldVisible(field, formGroup));
  }

  protected effectiveField(field: FormBuilderField, formGroup = this.formGroup()): FormBuilderField {
    const state = this.logicState(field, formGroup);

    if (
      state.readonly === undefined &&
      state.disabled === undefined &&
      state.required === undefined
    ) {
      return field;
    }

    const required = state.required ?? field.required;
    const validation = state.required === false
      ? field.validation?.filter(rule => rule.type !== 'required')
      : field.validation;

    return {
      ...field,
      readonly: state.readonly ?? field.readonly,
      disabled: state.disabled ?? field.disabled,
      required,
      validation
    };
  }

  protected fieldReadonly(field: FormBuilderField, formGroup = this.formGroup()): boolean {
    return this.logicState(field, formGroup).readonly ?? false;
  }

  private logicState(field: FormBuilderField, formGroup: AbstractControl): FormBuilderLogicFieldState {
    this.logicVersion();

    return this.logicEvaluations.get(formGroup)?.fields[field.id] ?? {};
  }

  private sectionLogicState(section: FormBuilderSection, formGroup: AbstractControl): FormBuilderLogicFieldState {
    this.logicVersion();

    return this.logicEvaluations.get(formGroup)?.sections[section.id] ?? {};
  }

  private effectiveFieldFromState(
    field: FormBuilderField,
    state: FormBuilderLogicFieldState
  ): FormBuilderField {
    if (
      state.readonly === undefined &&
      state.disabled === undefined &&
      state.required === undefined
    ) {
      return field;
    }

    const validation = state.required === false
      ? field.validation?.filter(rule => rule.type !== 'required')
      : field.validation;

    return {
      ...field,
      readonly: state.readonly ?? field.readonly,
      disabled: state.disabled ?? field.disabled,
      required: state.required ?? field.required,
      validation
    };
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

  submit(): void {
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

      const validators = this.resolveValidators(field, definition);
      const asyncValidators = this.resolveAsyncValidators(field);
      const control = new FormControl(
        {
          value: value[field.name] ?? this.fieldInitialValue(field),
          disabled: field.disabled || this.readonly()
        },
        validators,
        asyncValidators
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

      const validators = this.resolveValidators(child, definition);
      const asyncValidators = this.resolveAsyncValidators(child);
      controls[child.name] = new FormControl(
        {
          value: rowValue[child.name] ?? this.fieldInitialValue(child),
          disabled: child.disabled || this.readonly()
        },
        validators,
        asyncValidators
      );
    }

    return new FormGroup(controls);
  }

  private applyRuntime(formGroup: FormGroup): void {
    const fields = [
      ...(this.schema().fields ?? []),
      ...this.schema().sections.flatMap(section => section.fields)
    ];
    const scopeFields = this.scopeFields(fields);

    this.applyCalculatedFields(formGroup, scopeFields);
    this.applyRepeaterCalculations(formGroup, fields);
    this.applyLogic(formGroup, fields);
    this.applyCalculatedFields(formGroup, scopeFields);
    this.applyPlainTextFields(formGroup, scopeFields);
    this.logicVersion.update(version => version + 1);
  }

  private applyRepeaterCalculations(formGroup: FormGroup, fields: FormBuilderField[]): void {
    for (const field of fields) {
      if (this.isRepeaterField(field)) {
        const control = formGroup.controls[field.name];

        if (control instanceof FormArray) {
          const scopeFields = this.scopeFields(field.children ?? []);

          control.controls.forEach(group => {
            if (!(group instanceof FormGroup)) {
              return;
            }

            this.applyCalculatedFields(group, scopeFields);
            this.applyRepeaterCalculations(group, field.children ?? []);
            this.applyLogic(group, field.children ?? []);
            this.applyCalculatedFields(group, scopeFields);
            this.applyPlainTextFields(group, scopeFields);
          });
        }

        continue;
      }

      if (this.isContainerField(field)) {
        this.applyRepeaterCalculations(formGroup, field.children ?? []);
      }
    }
  }

  private applyLogic(formGroup: FormGroup, fields: FormBuilderField[]): void {
    const rules = this.schema().logic ?? [];

    if (!rules.length) {
      this.logicEvaluations.set(formGroup, { fields: {}, sections: {}, errors: [] });
      this.applyLogicControlEffects(formGroup, this.scopeFields(fields), {});
      return;
    }

    const scopeFields = this.scopeFields(fields);
    const evaluation = this.logicEngine.evaluate(rules, {
      fields: scopeFields,
      sections: this.schema().sections,
      values: formGroup.getRawValue(),
      calculationEngine: this.calculationEngine
    });

    this.logicEvaluations.set(formGroup, evaluation);
    this.applyLogicControlEffects(formGroup, scopeFields, evaluation.fields);
  }

  private applyLogicControlEffects(
    formGroup: FormGroup,
    fields: FormBuilderField[],
    states: Record<string, FormBuilderLogicFieldState>
  ): void {
    for (const field of fields) {
      const control = formGroup.controls[field.name];

      if (!(control instanceof FormControl)) {
        continue;
      }

      const state = states[field.id] ?? {};

      if (state.hasValue && control.value !== state.value) {
        control.setValue(state.value, { emitEvent: false });
      }

      const effectiveField = this.effectiveFieldFromState(field, state);
      const definition = this.definitions().find(item => item.type === field.type);
      control.setValidators(this.resolveValidators(effectiveField, definition));
      control.setAsyncValidators(this.resolveAsyncValidators(effectiveField));

      const disabled = this.readonly() || effectiveField.disabled === true || state.hidden === true;

      if (disabled && control.enabled) {
        control.disable({ emitEvent: false });
      } else if (!disabled && control.disabled) {
        control.enable({ emitEvent: false });
      }

      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private applyCalculatedFields(formGroup: FormGroup, fields: FormBuilderField[]): void {
    const calculatedFields = fields.filter(field =>
      field.type === 'calculated' && formGroup.controls[field.name] instanceof FormControl
    );

    if (!calculatedFields.length) {
      return;
    }

    const orderedFields = this.orderCalculatedFields(calculatedFields, fields, this.calculationEngine);
    const cyclicFields = new Set(calculatedFields.filter(field => !orderedFields.includes(field)).map(field => field.name));

    cyclicFields.forEach(fieldName => {
      const control = formGroup.controls[fieldName];

      if (control instanceof FormControl) {
        this.setCalculationError(control, 'Circular calculation dependency.');
      }
    });

    for (const field of orderedFields) {
      const control = formGroup.controls[field.name];

      if (!(control instanceof FormControl)) {
        continue;
      }

      const expression = normalizedString(field.settings?.['expression']);

      if (!expression) {
        this.writeCalculatedValue(control, this.emptyCalculatedValue(field));
        this.clearCalculationError(control);
        continue;
      }

      const result = this.calculationEngine.evaluate(expression, {
        field,
        fields,
        values: formGroup.getRawValue()
      });

      if (result.error) {
        this.writeCalculatedValue(control, this.emptyCalculatedValue(field));
        this.setCalculationError(control, result.error);
        continue;
      }

      this.writeCalculatedValue(control, this.coerceCalculatedValue(result.value, field));
      this.clearCalculationError(control);
    }
  }

  private applyPlainTextFields(formGroup: FormGroup, fields: FormBuilderField[]): void {
    const plainTextFields = fields.filter(field => field.type === 'plain-text');

    for (const field of plainTextFields) {
      const control = this.getOrCreateOrphanControl(field, formGroup);
      const text = stringValue(field.settings?.['text']);
      const expressions = plainTextExpressions(field.settings?.['expressions']);

      if (field.settings?.['expression'] !== true) {
        this.writeDisplayValue(control, text);
        this.clearCalculationError(control);
        continue;
      }

      if (expressions.length) {
        const result = this.renderPlainTextTemplate(text, expressions, field, fields, formGroup);

        this.writeDisplayValue(control, result.value);

        if (result.error) {
          this.setCalculationError(control, result.error);
        } else {
          this.clearCalculationError(control);
        }

        continue;
      }

      const expression = normalizedString(text);

      if (!expression) {
        this.writeDisplayValue(control, '');
        this.clearCalculationError(control);
        continue;
      }

      const result = this.calculationEngine.evaluate(expression, {
        field,
        fields,
        values: formGroup.getRawValue()
      });

      if (result.error) {
        this.writeDisplayValue(control, '');
        this.setCalculationError(control, result.error);
        continue;
      }

      this.writeDisplayValue(control, result.value === null || result.value === undefined ? '' : String(result.value));
      this.clearCalculationError(control);
    }
  }

  private renderPlainTextTemplate(
    text: string,
    expressions: PlainTextExpression[],
    field: FormBuilderField,
    fields: FormBuilderField[],
    formGroup: FormGroup
  ): { value: string; error?: string } {
    const values = new Map<string, string>();
    let error = '';

    for (const item of expressions) {
      const id = normalizedString(item.id);
      const expression = normalizedString(item.expression);

      if (!id || !expression) {
        continue;
      }

      const result = this.calculationEngine.evaluate(expression, {
        field,
        fields,
        values: formGroup.getRawValue()
      });

      if (result.error) {
        error = error || `${id}: ${result.error}`;
        values.set(id, '');
        continue;
      }

      values.set(id, result.value === null || result.value === undefined ? '' : String(result.value));
    }

    return {
      value: text.replace(/\{([A-Za-z_][A-Za-z0-9_-]*)\}/g, (token, id: string) =>
        values.has(id) ? values.get(id) ?? '' : token
      ),
      error: error || undefined
    };
  }

  private orderCalculatedFields(
    calculatedFields: FormBuilderField[],
    fields: FormBuilderField[],
    calculationEngine: FormBuilderCalculationEngine
  ): FormBuilderField[] {
    const fieldByName = new Map(calculatedFields.map(field => [field.name, field]));
    const dependenciesByName = new Map(calculatedFields.map(field => {
      const expression = normalizedString(field.settings?.['expression']);
      const dependencies = calculationEngine.dependencies?.(expression, fields) ?? [];

      return [
        field.name,
        dependencies.filter(dependency => fieldByName.has(dependency))
      ] as const;
    }));
    const ordered: FormBuilderField[] = [];
    const temporary = new Set<string>();
    const permanent = new Set<string>();

    const visit = (field: FormBuilderField): boolean => {
      if (permanent.has(field.name)) {
        return true;
      }

      if (temporary.has(field.name)) {
        return false;
      }

      temporary.add(field.name);

      for (const dependencyName of dependenciesByName.get(field.name) ?? []) {
        const dependency = fieldByName.get(dependencyName);

        if (dependency && !visit(dependency)) {
          return false;
        }
      }

      temporary.delete(field.name);
      permanent.add(field.name);
      ordered.push(field);
      return true;
    };

    calculatedFields.forEach(field => visit(field));
    return ordered;
  }

  private scopeFields(fields: FormBuilderField[]): FormBuilderField[] {
    const scoped: FormBuilderField[] = [];

    for (const field of fields) {
      if (this.isRepeaterField(field)) {
        scoped.push(field);
        continue;
      }

      if (this.isContainerField(field)) {
        scoped.push(...this.scopeFields(field.children ?? []));
        continue;
      }

      scoped.push(field);
    }

    return scoped;
  }

  private writeCalculatedValue(control: FormControl, value: any): void {
    if (control.value !== value) {
      control.setValue(value, { emitEvent: false });
    }
  }

  private writeDisplayValue(control: FormControl, value: any): void {
    if (control.value !== value) {
      control.setValue(value);
    }
  }

  private getOrCreateOrphanControl(field: FormBuilderField, formGroup: AbstractControl): FormControl {
    let controls = this.orphanControls.get(formGroup);

    if (!controls) {
      controls = new Map<string, FormControl>();
      this.orphanControls.set(formGroup, controls);
    }

    const existing = controls.get(field.id);

    if (existing) {
      return existing;
    }

    const control = new FormControl({
      value: this.fieldInitialValue(field),
      disabled: true
    });
    controls.set(field.id, control);
    return control;
  }

  private coerceCalculatedValue(value: any, field: FormBuilderField): any {
    const valueType = field.settings?.['valueType'];

    if (valueType === 'number') {
      const numeric = Number(value);
      const precision = field.settings?.['precision'];
      const decimalPlaces: number | undefined = precision === null || precision === undefined || precision === ''
        ? undefined
        : Number(precision);

      if (!Number.isFinite(numeric)) {
        return this.emptyCalculatedValue(field);
      }

      return decimalPlaces !== undefined && Number.isInteger(decimalPlaces) && decimalPlaces >= 0
        ? Number(numeric.toFixed(decimalPlaces))
        : numeric;
    }

    if (valueType === 'text') {
      return value === null || value === undefined ? '' : String(value);
    }

    if (valueType === 'boolean') {
      return !!value;
    }

    return value;
  }

  private emptyCalculatedValue(field: FormBuilderField): any {
    return field.settings?.['emptyValue'] ?? null;
  }

  private setCalculationError(control: FormControl, message: string): void {
    control.setErrors({
      ...(control.errors ?? {}),
      formBuilderCalculation: { message }
    });
  }

  private clearCalculationError(control: FormControl): void {
    const errors = control.errors;

    if (!errors?.['formBuilderCalculation']) {
      return;
    }

    const nextErrors = { ...errors };
    delete nextErrors['formBuilderCalculation'];
    control.setErrors(Object.keys(nextErrors).length ? nextErrors : null);
  }

  private resolveValidators(
    field: FormBuilderField,
    definition: FormBuilderFieldDefinition | undefined
  ) {
    return [
      ...(definition?.validators?.(field) ?? []),
      ...validatorsFromRules(field.validation, field, this.validatorDefinitions())
    ];
  }

  private resolveAsyncValidators(field: FormBuilderField) {
    return asyncValidatorsFromRules(field.validation, field, this.validatorDefinitions());
  }

  private fieldInitialValue(field: FormBuilderField): any {
    if (field.type === 'plain-text') {
      return stringValue(field.settings?.['text']);
    }

    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    if (field.type === 'upload' || field.type === 'logo-upload') {
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

  private resolveCanvasItems(
    schema: FormBuilderSchema,
    layout: FormBuilderLayoutItem[] = normalizedLayout(schema)
  ): FormRendererCanvasItem[] {
    return this.resolveLayoutItems(schema, layout);
  }

  private resolveSteps(schema: FormBuilderSchema, flow: FormBuilderFlow | null | undefined): FormRendererStep[] {
    return this.normalizedSteps(schema, flow).map(step => ({
      ...step,
      items: this.resolveLayoutItems(schema, step.items)
    }));
  }

  private resolveLayoutItems(schema: FormBuilderSchema, layout: FormBuilderLayoutItem[]): FormRendererCanvasItem[] {
    const fieldsById = new Map((schema.fields ?? []).map(field => [field.id, field]));
    const sectionsById = new Map(schema.sections.map(section => [section.id, section]));
    const items: FormRendererCanvasItem[] = [];

    for (const item of layout) {
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

  private isStepsMode(flow: FormBuilderFlow | null | undefined): boolean {
    return flow?.mode === 'steps' && !!flow.steps?.length;
  }

  private normalizedSteps(schema: FormBuilderSchema, flow: FormBuilderFlow | null | undefined): FormBuilderStep[] {
    if (flow?.mode !== 'steps' || !flow.steps?.length) {
      return [];
    }

    const validItems = new Set([
      ...(schema.fields ?? []).map(field => `field:${field.id}`),
      ...schema.sections.map(section => `section:${section.id}`)
    ]);
    const used = new Set<string>();
    const steps = flow.steps.map((step, index) => {
      const items: FormBuilderLayoutItem[] = [];

      for (const item of step.items ?? []) {
        const key = `${item.kind}:${item.id}`;

        if (used.has(key) || !validItems.has(key)) {
          continue;
        }

        used.add(key);
        items.push({ ...item });
      }

      return {
        ...step,
        title: step.title || `Step ${index + 1}`,
        items
      };
    });

    const lastStep = steps[steps.length - 1];

    for (const item of normalizedLayout(schema)) {
      const key = `${item.kind}:${item.id}`;

      if (!used.has(key)) {
        used.add(key);
        lastStep.items.push({ ...item });
      }
    }

    return steps;
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

function normalizedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function plainTextExpressions(value: unknown): PlainTextExpression[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map(item => ({
      id: stringValue(item['id']).trim(),
      expression: stringValue(item['expression']).trim()
    }))
    .filter(item => item.id || item.expression);
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
