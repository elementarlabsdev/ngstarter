import {
  FormBuilderField,
  FormBuilderLogicAction,
  FormBuilderLogicCondition,
  FormBuilderLogicContext,
  FormBuilderLogicEngine,
  FormBuilderLogicError,
  FormBuilderLogicEvaluation,
  FormBuilderLogicFieldState,
  FormBuilderLogicRule,
  FormBuilderLogicTargetKind,
  FormBuilderSection
} from './types';

export const DEFAULT_FORM_BUILDER_LOGIC_ENGINE: FormBuilderLogicEngine = {
  evaluate(rules, context) {
    const fieldsByTarget = createFieldTargetMap(context.fields);
    const sectionsByTarget = createSectionTargetMap(context.sections ?? []);
    const evaluation: FormBuilderLogicEvaluation = {
      fields: {},
      sections: {},
      errors: []
    };

    const enabledRules = rules
      .filter(rule => rule.enabled !== false)
      .slice()
      .sort((first, second) => (first.priority ?? 0) - (second.priority ?? 0));

    for (const rule of enabledRules) {
      const condition = evaluateCondition(rule.when, rule, context, evaluation.errors);
      const actions = condition ? rule.actions : rule.elseActions ?? [];

      for (const action of actions) {
        applyAction(action, rule, fieldsByTarget, sectionsByTarget, context, evaluation);
      }
    }

    return evaluation;
  }
};

function evaluateCondition(
  condition: FormBuilderLogicCondition | null | undefined,
  rule: FormBuilderLogicRule,
  context: FormBuilderLogicContext,
  errors: FormBuilderLogicError[]
): boolean {
  if (!condition) {
    return true;
  }

  if (condition.type === 'all') {
    return (condition.conditions ?? []).every(item => evaluateCondition(item, rule, context, errors));
  }

  if (condition.type === 'any') {
    return (condition.conditions ?? []).some(item => evaluateCondition(item, rule, context, errors));
  }

  const expression = typeof condition.expression === 'string' ? condition.expression.trim() : '';

  if (!expression) {
    return false;
  }

  const result = context.calculationEngine.evaluate(expression, {
    field: createLogicFieldFallback(),
    fields: context.fields,
    values: context.values
  });

  if (result.error) {
    errors.push({
      ruleId: rule.id,
      message: result.error
    });
    return false;
  }

  return !!result.value;
}

function applyAction(
  action: FormBuilderLogicAction,
  rule: FormBuilderLogicRule,
  fieldsByTarget: Map<string, FormBuilderField>,
  sectionsByTarget: Map<string, FormBuilderSection>,
  context: FormBuilderLogicContext,
  evaluation: FormBuilderLogicEvaluation
): void {
  if (!action.targetId || !action.type) {
    return;
  }

  const targetKind = resolveTargetKind(action.targetKind, action.targetId, fieldsByTarget, sectionsByTarget);

  if (targetKind === 'section') {
    applySectionAction(action, rule, sectionsByTarget, evaluation);
    return;
  }

  const field = fieldsByTarget.get(action.targetId);

  if (!field) {
    evaluation.errors.push({
      ruleId: rule.id,
      targetId: action.targetId,
      message: `Unknown logic target "${action.targetId}".`
    });
    return;
  }

  const state = stateForField(evaluation.fields, field.id);

  switch (action.type) {
    case 'show':
      state.hidden = false;
      return;

    case 'hide':
      state.hidden = true;
      return;

    case 'enable':
      state.disabled = false;
      return;

    case 'disable':
      state.disabled = true;
      return;

    case 'readonly':
      state.readonly = true;
      return;

    case 'editable':
      state.readonly = false;
      return;

    case 'require':
      state.required = true;
      return;

    case 'optional':
      state.required = false;
      return;

    case 'clearValue':
      state.value = null;
      state.hasValue = true;
      return;

    case 'setValue':
      applySetValueAction(action, rule, field, context, state, evaluation.errors);
      return;
  }
}

function applySectionAction(
  action: FormBuilderLogicAction,
  rule: FormBuilderLogicRule,
  sectionsByTarget: Map<string, FormBuilderSection>,
  evaluation: FormBuilderLogicEvaluation
): void {
  const section = sectionsByTarget.get(action.targetId);

  if (!section) {
    evaluation.errors.push({
      ruleId: rule.id,
      targetId: action.targetId,
      message: `Unknown logic target "${action.targetId}".`
    });
    return;
  }

  const state = stateForField(evaluation.sections, section.id);

  if (action.type === 'show') {
    state.hidden = false;
    return;
  }

  if (action.type === 'hide') {
    state.hidden = true;
    return;
  }

  evaluation.errors.push({
    ruleId: rule.id,
    targetId: action.targetId,
    message: `Action "${action.type}" can only target fields.`
  });
}

function applySetValueAction(
  action: Extract<FormBuilderLogicAction, { type: 'setValue' }>,
  rule: FormBuilderLogicRule,
  field: FormBuilderField,
  context: FormBuilderLogicContext,
  state: FormBuilderLogicFieldState,
  errors: FormBuilderLogicError[]
): void {
  const expression = typeof action.expression === 'string' ? action.expression.trim() : '';

  if (!expression) {
    state.value = null;
    state.hasValue = true;
    return;
  }

  const result = context.calculationEngine.evaluate(expression, {
    field,
    fields: context.fields,
    values: context.values
  });

  if (result.error) {
    errors.push({
      ruleId: rule.id,
      targetId: action.targetId,
      message: result.error
    });
    return;
  }

  state.value = result.value;
  state.hasValue = true;
}

function createFieldTargetMap(fields: FormBuilderField[]): Map<string, FormBuilderField> {
  const map = new Map<string, FormBuilderField>();

  for (const field of flattenFields(fields)) {
    if (field.id) {
      map.set(field.id, field);
    }

    if (field.name) {
      map.set(field.name, field);
    }
  }

  return map;
}

function createSectionTargetMap(sections: FormBuilderSection[]): Map<string, FormBuilderSection> {
  const map = new Map<string, FormBuilderSection>();

  for (const section of sections) {
    if (section.id) {
      map.set(section.id, section);
    }

    if (section.title) {
      map.set(section.title, section);
    }
  }

  return map;
}

function resolveTargetKind(
  targetKind: FormBuilderLogicTargetKind | undefined,
  targetId: string,
  fieldsByTarget: Map<string, FormBuilderField>,
  sectionsByTarget: Map<string, FormBuilderSection>
): FormBuilderLogicTargetKind {
  if (targetKind) {
    return targetKind;
  }

  return fieldsByTarget.has(targetId) || !sectionsByTarget.has(targetId) ? 'field' : 'section';
}

function flattenFields(fields: FormBuilderField[]): FormBuilderField[] {
  return fields.flatMap(field => [field, ...flattenFields(field.children ?? [])]);
}

function stateForField(
  fields: Record<string, FormBuilderLogicFieldState>,
  fieldId: string
): FormBuilderLogicFieldState {
  fields[fieldId] ??= {};
  return fields[fieldId];
}

function createLogicFieldFallback(): FormBuilderField {
  return {
    id: '__logic__',
    name: '__logic__',
    type: 'logic',
    label: 'Logic'
  };
}
