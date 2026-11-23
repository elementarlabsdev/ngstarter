import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  Injector,
  linkedSignal,
  resource,
  model,
  output,
  signal,
  untracked
} from '@angular/core';
import { FormControl, ValidationErrors } from '@angular/forms';
import {
  applyEach,
  disabled,
  FieldTree,
  form,
  hidden,
  readonly as fieldReadonly,
  required,
  SchemaPathTree,
  PathKind,
  validate,
  validateAsync,
  ValidationError
} from '@angular/forms/signals';
import { firstValueFrom, isObservable } from 'rxjs';
import { normalizeFieldValue, runtimeFieldState, setRuntimeFieldError } from '../form-builder-field-state';
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

type FormValues = Record<string, any>;
type RenderForm = FieldTree<FormValues>;
type RenderField = FieldTree<unknown>;
type Repeater = FieldTree<FormValues[]>;

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
  private readonly orphanControls = new WeakMap<RenderForm, Map<string, RenderField>>();
  private readonly logicEvaluations = new WeakMap<RenderForm, FormBuilderLogicEvaluation>();
  private readonly logicVersion = signal(0);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private formInjector?: ReturnType<typeof Injector.create>;

  readonly schema = input.required<FormBuilderSchema>();
  readonly flow = input<FormBuilderFlow | null | undefined>(undefined);
  readonly items = input<FormBuilderLayoutItem[] | null | undefined>(undefined);
  readonly readonly = input(false);
  readonly showSubmit = input(true);
  readonly submitLabel = input('Submit');
  readonly uploadCallback = input<FormBuilderUploadCallback | null | undefined>(undefined);
  readonly value = model<Record<string, any>>({});
  readonly formSubmit = output<Record<string, any>>();
  readonly formReady = output<RenderForm>();

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
  private readonly fields = computed(() => [
    ...(this.schema().fields ?? []),
    ...this.schema().sections.flatMap(section => section.fields),
  ]);
  private publishedValue?: FormValues;
  private evaluatedForm?: RenderForm;
  private readonly formValues = linkedSignal<{ fields: FormBuilderField[]; value: FormValues }, FormValues>({
    source: () => ({ fields: this.fields(), value: this.value() }),
    computation: ({ fields, value }, previous) =>
      previous && previous.source.fields === fields && value === this.publishedValue
        ? previous.value
        : this.initialValues(fields, value),
  });
  protected readonly formGroup = computed(() => {
    const schema = this.schema();
    return untracked(() => {
      this.formInjector?.destroy();
      this.formInjector = Injector.create({ parent: this.injector, providers: [] });
      return form<FormValues>(this.formValues, path => {
        this.configureFields(path, schema.fields ?? []);
        for (const section of schema.sections) {
          this.configureFields(path, section.fields, section);
        }
      }, { injector: this.formInjector });
    });
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.formInjector?.destroy());
    effect(() => {
      const current = this.formGroup();
      untracked(() => this.formReady.emit(current));
    });
    effect(() => {
      const current = this.formGroup();
      this.syncRuntime(current);
    });
  }

  protected getControl(field: FormBuilderField, formGroup = this.formGroup()): RenderField {
    return this.fieldControl(formGroup, field.name) ?? this.getOrCreateOrphanControl(field, formGroup);
  }

  private fieldControl(group: RenderForm, name: string): RenderField | undefined {
    return group[name] as RenderField | undefined;
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

  private logicState(field: FormBuilderField, formGroup: RenderForm): FormBuilderLogicFieldState {
    this.logicVersion();

    return this.logicEvaluations.get(formGroup)?.fields[field.id] ?? {};
  }

  private sectionLogicState(section: FormBuilderSection, formGroup: RenderForm): FormBuilderLogicFieldState {
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

  private repeaterArray(field: FormBuilderField, group: RenderForm): Repeater | undefined {
    return group[field.name] as Repeater | undefined;
  }

  protected repeaterGroups(field: FormBuilderField, group = this.formGroup()): RenderForm[] {
    const array = this.repeaterArray(field, group);
    return array ? Array.from(array).filter(row => row !== undefined) : [];
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

    array?.().value.update(rows => [...rows, this.initialValues(field.children ?? [], {})]);
  }

  protected removeRepeaterItem(field: FormBuilderField, index: number, formGroup = this.formGroup()): void {
    if (this.readonly()) {
      return;
    }

    if (!this.canRemoveRepeaterItem(field, formGroup)) {
      return;
    }

    const array = this.repeaterArray(field, formGroup);

    array?.().value.update(rows => rows.filter((_, row) => index !== row));
  }

  protected canRemoveRepeaterItem(field: FormBuilderField, formGroup = this.formGroup()): boolean {
    return this.allowsNullValue(field) || (this.repeaterArray(field, formGroup)?.length ?? 0) > 1;
  }

  submit(event?: Event): void {
    event?.preventDefault();
    if (this.readonly()) return;
    const tree = this.formGroup();
    this.syncRuntime(tree);
    if (this.isUploading(tree, this.fields())) return;
    const state = tree();
    state.markAsTouched();
    if (state.valid()) this.formSubmit.emit(state.value());
  }

  private isUploading(group: RenderForm, fields: FormBuilderField[]): boolean {
    return this.scopeFields(fields).some(field => {
      const control = this.fieldControl(group, field.name);
      if (!control || control().hidden() || control().disabled()) return false;
      if (this.isRepeaterField(field)) {
        return this.repeaterGroups(field, group).some(row => this.isUploading(row, field.children ?? []));
      }
      return runtimeFieldState(control).uploading();
    });
  }

  private initialValues(fields: FormBuilderField[], previous: FormValues): FormValues {
    const values: FormValues = {};
    for (const field of this.scopeFields(fields)) {
      const definition = this.definitions().find(item => item.type === field.type);
      if (definition?.kind === 'static' || field.kind === 'static') continue;
      const current = previous[field.name];
      if (this.isRepeaterField(field)) {
        const canBeEmpty = this.allowsNullValue(field);
        const rows = Array.isArray(current) && (current.length || canBeEmpty)
          ? current
          : canBeEmpty ? [] : [{}];
        values[field.name] = rows.map(row => this.initialValues(field.children ?? [], isRecord(row) ? row : {}));
      } else {
        values[field.name] = normalizeFieldValue(field.type, current === undefined ? this.fieldInitialValue(field) : current);
      }
    }
    return values;
  }

  private configureFields<K extends PathKind>(
    path: SchemaPathTree<FormValues, K>, fields: FormBuilderField[], section?: FormBuilderSection
  ): void {
    const groupAt = (keys: readonly string[]) => keys.slice(0, -1).reduce<RenderForm>(
      (parent, key) => parent[key] as RenderForm, this.formGroup()
    );
    for (const field of this.scopeFields(fields)) {
      const definition = this.definitions().find(item => item.type === field.type);
      if (definition?.kind === 'static' || field.kind === 'static') continue;
      const logic = (keys: readonly string[]) => this.logicState(field, groupAt(keys));
      const isHidden = (keys: readonly string[]) => {
        const group = groupAt(keys);
        return !!this.logicState(field, group).hidden || !!(section && this.sectionLogicState(section, group).hidden);
      };

      if (this.isRepeaterField(field)) {
        const arrayPath = path[field.name] as SchemaPathTree<FormValues[], PathKind.Child>;
        hidden(arrayPath, ({ pathKeys }) => isHidden(pathKeys()));
        applyEach(arrayPath, row => this.configureFields(row, field.children ?? []));
        if (!this.allowsNullValue(field)) {
          validate(arrayPath, ({ value }) => value().length ? null : { kind: 'repeaterRequired' });
        }
        continue;
      }

      const fieldPath = path[field.name] as SchemaPathTree<unknown, PathKind.Child>;
      const effective = (keys: readonly string[]) => this.effectiveFieldFromState(field, logic(keys));

      hidden(fieldPath, ({ pathKeys }) => isHidden(pathKeys()));
      disabled(fieldPath, ({ pathKeys }) => this.readonly() || !!effective(pathKeys()).disabled);
      fieldReadonly(fieldPath, ({ pathKeys }) => field.type === 'calculated' || !!effective(pathKeys()).readonly);
      if (field.type === 'calculated') {
        // Signal Forms skips validation on readonly controls, so report formula errors on the group.
        validate(path, ({ fieldTree }) => {
          const control = fieldTree[field.name];
          if (!control || control().disabled() || control().hidden()) return null;
          return runtimeFieldState(control).errors().filter(error => error.kind === 'formBuilderCalculation');
        });
      }
      required(fieldPath, { when: ({ pathKeys }) => {
        const config = effective(pathKeys());
        return !!config.required || !!config.validation?.some(rule => rule.type === 'required' || rule.type === 'requiredTrue');
      } });
      validate(fieldPath, ({ value, fieldTree, pathKeys }) => {
        const currentValue = value();
        const validators = this.resolveValidators(effective(pathKeys()), definition);
        const errors = untracked(() => {
          const control = new FormControl(currentValue);
          return validators.flatMap(validator => signalErrors(validator(control)));
        });
        return [...errors, ...runtimeFieldState(fieldTree).errors()];
      });

      if (this.resolveAsyncValidators(field).length) {
        validateAsync(fieldPath, {
          params: ({ value }) => ({ value: value() }),
          factory: params => resource({
            params,
            loader: async ({ params }) => {
              const control = new FormControl(params.value);
              const errors = await Promise.all(this.resolveAsyncValidators(field).map(validator => {
                const result = validator(control);
                return isObservable(result) ? firstValueFrom(result) : result;
              }));
              return errors.flatMap(signalErrors);
            },
          }),
          onSuccess: errors => errors ?? [],
          onError: () => ({ kind: 'validationUnavailable' }),
        });
      }
    }
  }

  private syncRuntime(formGroup: RenderForm): void {
    if (formGroup().value() === this.publishedValue && this.evaluatedForm === formGroup) return;

    untracked(() => {
      this.applyRuntime(formGroup);
      this.evaluatedForm = formGroup;
      const value = formGroup().value();
      this.publishedValue = value;
      this.value.set(value);
    });
  }

  private applyRuntime(formGroup: RenderForm): void {
    const fields = this.fields();
    const scopeFields = this.scopeFields(fields);

    this.applyCalculatedFields(formGroup, scopeFields);
    this.applyRepeaterCalculations(formGroup, fields);
    this.applyLogic(formGroup, fields);
    this.applyCalculatedFields(formGroup, scopeFields);
    this.applyPlainTextFields(formGroup, scopeFields);
    this.logicVersion.update(version => version + 1);
  }

  private applyRepeaterCalculations(formGroup: RenderForm, fields: FormBuilderField[]): void {
    for (const field of fields) {
      if (this.isRepeaterField(field)) {
        const scopeFields = this.scopeFields(field.children ?? []);
        for (const group of this.repeaterGroups(field, formGroup)) {
          this.applyCalculatedFields(group, scopeFields);
          this.applyRepeaterCalculations(group, field.children ?? []);
          this.applyLogic(group, field.children ?? []);
          this.applyCalculatedFields(group, scopeFields);
          this.applyPlainTextFields(group, scopeFields);
        }

        continue;
      }

      if (this.isContainerField(field)) {
        this.applyRepeaterCalculations(formGroup, field.children ?? []);
      }
    }
  }

  private applyLogic(formGroup: RenderForm, fields: FormBuilderField[]): void {
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
      values: formGroup().value(),
      calculationEngine: this.calculationEngine
    });

    this.logicEvaluations.set(formGroup, evaluation);
    this.applyLogicControlEffects(formGroup, scopeFields, evaluation.fields);
  }

  private applyLogicControlEffects(
    formGroup: RenderForm,
    fields: FormBuilderField[],
    states: Record<string, FormBuilderLogicFieldState>
  ): void {
    for (const field of fields) {
      const control = this.fieldControl(formGroup, field.name);

      if (!control) {
        continue;
      }

      const state = states[field.id] ?? {};

      if (state.hasValue) {
        const value = normalizeFieldValue(field.type, state.value);
        if (!Object.is(control().value(), value)) control().value.set(value);
      }
    }
  }

  private applyCalculatedFields(formGroup: RenderForm, fields: FormBuilderField[]): void {
    const calculatedFields = fields.filter(field =>
      field.type === 'calculated' && this.fieldControl(formGroup, field.name)
    );

    if (!calculatedFields.length) {
      return;
    }

    const orderedFields = this.orderCalculatedFields(calculatedFields, fields, this.calculationEngine);
    const cyclicFields = new Set(calculatedFields.filter(field => !orderedFields.includes(field)).map(field => field.name));

    cyclicFields.forEach(fieldName => {
      const control = this.fieldControl(formGroup, fieldName);

      if (control) {
        this.setCalculationError(control, 'Circular calculation dependency.');
      }
    });

    for (const field of orderedFields) {
      const control = this.fieldControl(formGroup, field.name);

      if (!control) {
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
        values: formGroup().value()
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

  private applyPlainTextFields(formGroup: RenderForm, fields: FormBuilderField[]): void {
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
        values: formGroup().value()
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
    formGroup: RenderForm
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
        values: formGroup().value()
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

  private writeCalculatedValue(control: RenderField, value: any): void {
    if (!Object.is(control().value(), value)) {
      control().value.set(value ?? null);
    }
  }

  private writeDisplayValue(control: RenderField, value: any): void {
    if (!Object.is(control().value(), value)) {
      control().value.set(value ?? null);
    }
  }

  private getOrCreateOrphanControl(field: FormBuilderField, formGroup: RenderForm): RenderField {
    let controls = this.orphanControls.get(formGroup);

    if (!controls) {
      controls = new Map<string, RenderField>();
      this.orphanControls.set(formGroup, controls);
    }

    const existing = controls.get(field.id);

    if (existing) {
      return existing;
    }

    const control = untracked(() => form(signal<unknown>(this.fieldInitialValue(field)), path => {
      disabled(path);
      validate(path, ({ fieldTree }) => runtimeFieldState(fieldTree).errors());
    }, { injector: this.formInjector }));
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

      return decimalPlaces !== undefined && Number.isInteger(decimalPlaces) && decimalPlaces >= 0 && decimalPlaces <= 100
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

  private setCalculationError(control: RenderField, message: string): void {
    setRuntimeFieldError(control, 'formBuilderCalculation', message);
  }

  private clearCalculationError(control: RenderField): void {
    setRuntimeFieldError(control, 'formBuilderCalculation');
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

function signalErrors(errors: ValidationErrors | null): ValidationError.WithoutFieldTree[] {
  return Object.entries(errors ?? {}).map(([kind, error]) => ({ kind, message: error?.message }));
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
