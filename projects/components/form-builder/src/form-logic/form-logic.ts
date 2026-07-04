import { ChangeDetectionStrategy, Component, TemplateRef, ViewEncapsulation, computed, inject, input, model, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Dialog, DialogActions, DialogClose, DialogContent, DialogTitle } from '@ngstarter-ui/components/dialog';
import { EmptyState, EmptyStateActions, EmptyStateContent, EmptyStateIcon, EmptyStateTitle } from '@ngstarter-ui/components/empty-state';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { List, ListItem, ListItemIcon, ListItemMeta, ListItemTitle } from '@ngstarter-ui/components/list';
import { Option } from '@ngstarter-ui/components/option';
import { Select } from '@ngstarter-ui/components/select';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import {
  FormBuilderField,
  FormBuilderLogicAction,
  FormBuilderLogicCondition,
  FormBuilderLogicConditionOperator,
  FormBuilderLogicRule,
  FormBuilderLogicTargetKind,
  FormBuilderSchema
} from '../types';

type FormBuilderLogicActionBranch = 'actions' | 'elseActions';
type FormBuilderLogicActionType = Exclude<FormBuilderLogicAction['type'], ''>;
type FormBuilderLogicConditionMode = Exclude<FormBuilderLogicCondition['type'], 'field'>;

interface FormBuilderLogicTargetOption {
  kind: FormBuilderLogicTargetKind;
  id: string;
  name: string;
  label: string;
  type: string;
  depth: number;
}

const CONDITION_TYPE_OPTIONS: { label: string; value: FormBuilderLogicConditionMode }[] = [
  { label: 'Custom expression', value: 'expression' },
  { label: 'Match all', value: 'all' },
  { label: 'Match any', value: 'any' }
];

const CONDITION_OPERATOR_OPTIONS: { label: string; value: FormBuilderLogicConditionOperator }[] = [
  { label: 'is', value: 'equals' },
  { label: 'is not', value: 'notEquals' },
  { label: 'contains', value: 'contains' },
  { label: 'does not contain', value: 'notContains' },
  { label: 'is empty', value: 'empty' },
  { label: 'is not empty', value: 'notEmpty' },
  { label: 'greater than', value: 'greaterThan' },
  { label: 'less than', value: 'lessThan' },
  { label: 'before', value: 'before' },
  { label: 'after', value: 'after' }
];

const ACTION_TYPE_OPTIONS: { label: string; value: FormBuilderLogicActionType }[] = [
  { label: 'Show field', value: 'show' },
  { label: 'Hide field', value: 'hide' },
  { label: 'Enable field', value: 'enable' },
  { label: 'Disable field', value: 'disable' },
  { label: 'Make readonly', value: 'readonly' },
  { label: 'Make editable', value: 'editable' },
  { label: 'Require field', value: 'require' },
  { label: 'Make optional', value: 'optional' },
  { label: 'Set value', value: 'setValue' },
  { label: 'Clear value', value: 'clearValue' }
];

const SECTION_ACTION_TYPE_OPTIONS: { label: string; value: FormBuilderLogicActionType }[] = [
  { label: 'Show section', value: 'show' },
  { label: 'Hide section', value: 'hide' }
];

@Component({
  selector: 'ngs-form-logic',
  exportAs: 'ngsFormLogic',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    Button,
    DialogActions,
    DialogClose,
    DialogContent,
    DialogTitle,
    EmptyState,
    EmptyStateActions,
    EmptyStateContent,
    EmptyStateIcon,
    EmptyStateTitle,
    FormField,
    Icon,
    Input,
    Label,
    List,
    ListItem,
    ListItemIcon,
    ListItemMeta,
    ListItemTitle,
    Option,
    Select,
    SlideToggle
  ],
  templateUrl: './form-logic.html',
  styleUrl: './form-logic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ngs-form-logic'
  }
})
export class FormLogic {
  private readonly dialog = inject(Dialog);

  readonly schema = input<FormBuilderSchema | null>(null);
  readonly logic = model<FormBuilderLogicRule[]>([]);
  readonly title = input('Form logic');
  readonly description = input('Create rules that react to form values and update field visibility, state, validation, or values.');

  protected readonly conditionTypeOptions = CONDITION_TYPE_OPTIONS;
  protected readonly conditionOperatorOptions = CONDITION_OPERATOR_OPTIONS;
  protected readonly draftRule = signal<FormBuilderLogicRule | null>(null);
  protected readonly selectedRuleId = signal<string | null>(null);
  protected readonly rules = computed<FormBuilderLogicRule[]>(() => this.logic());
  protected readonly targetOptions = computed<FormBuilderLogicTargetOption[]>(() => {
    const schema = this.schema();

    if (!schema) {
      return [];
    }

    return [
      ...schema.sections.map(section => ({
        kind: 'section' as const,
        id: section.id,
        name: '',
        label: section.title,
        type: 'section',
        depth: 0
      })),
      ...flattenLogicFields(schema.fields ?? []),
      ...schema.sections.flatMap(section => flattenLogicFields(section.fields))
    ];
  });
  protected readonly selectedRule = computed<FormBuilderLogicRule | null>(() => {
    const draftRule = this.draftRule();

    if (draftRule) {
      return draftRule;
    }

    const rules = this.rules();
    const selectedId = this.selectedRuleId();

    return rules.find(rule => rule.id === selectedId) ?? rules[0] ?? null;
  });

  protected openAddRuleDialog(template: TemplateRef<unknown>): void {
    const rules = this.rules();
    const rule = createLogicRule(rules.length + 1);

    this.draftRule.set(rule);
    this.openRuleEditorDialog(rule, template, 'Add logic rule');
  }

  protected openRuleEditorDialog(rule: FormBuilderLogicRule, template: TemplateRef<unknown>, ariaLabel = 'Edit logic rule'): void {
    this.selectedRuleId.set(rule.id);
    const dialogRef = this.dialog.open(template, {
      width: '920px',
      maxWidth: 'calc(100vw - 48px)',
      maxHeight: 'calc(100vh - 48px)',
      panelClass: 'ngs-form-logic-rule-dialog',
      showCloseButton: true,
      ariaLabel
    });

    dialogRef.afterClosed().subscribe(() => {
      const draftRule = this.draftRule();

      if (draftRule?.id === rule.id) {
        this.discardDraftRule();
      }
    });
  }

  protected duplicateRule(rule: FormBuilderLogicRule): void {
    const rules = this.rules();
    const duplicate = {
      ...cloneLogicRule(rule),
      id: uniqueId('logic'),
      name: `${rule.name || rule.id} copy`,
      priority: rules.length + 1
    };

    this.logic.set([...rules, duplicate]);
    this.selectedRuleId.set(duplicate.id);
  }

  protected removeRule(rule: FormBuilderLogicRule): void {
    if (this.isDraftRule(rule)) {
      this.discardDraftRule();
      return;
    }

    const rules = this.rules().filter(item => item.id !== rule.id);

    this.logic.set(rules);
    this.selectedRuleId.set(rules[0]?.id ?? null);
  }

  protected moveRule(rule: FormBuilderLogicRule, direction: -1 | 1): void {
    const rules = this.rules().map(cloneLogicRule);
    const index = rules.findIndex(item => item.id === rule.id);
    const nextIndex = index + direction;

    if (index === -1 || nextIndex < 0 || nextIndex >= rules.length) {
      return;
    }

    const [item] = rules.splice(index, 1);
    rules.splice(nextIndex, 0, item);
    this.logic.set(rules.map((item, itemIndex) => ({
      ...item,
      priority: itemIndex + 1
    })));
    this.selectedRuleId.set(rule.id);
  }

  protected selectRule(rule: FormBuilderLogicRule): void {
    this.selectedRuleId.set(rule.id);
  }

  protected isFirstRule(rule: FormBuilderLogicRule): boolean {
    return this.rules().findIndex(item => item.id === rule.id) <= 0;
  }

  protected isLastRule(rule: FormBuilderLogicRule): boolean {
    const rules = this.rules();

    return rules.findIndex(item => item.id === rule.id) === rules.length - 1;
  }

  protected isDraftRule(rule: FormBuilderLogicRule): boolean {
    return this.draftRule()?.id === rule.id;
  }

  protected saveRuleDialog(rule: FormBuilderLogicRule): void {
    const draftRule = this.draftRule();

    if (draftRule?.id !== rule.id) {
      return;
    }

    this.logic.set([
      ...this.rules().map(cloneLogicRule),
      cloneLogicRule(draftRule)
    ]);
    this.draftRule.set(null);
    this.selectedRuleId.set(draftRule.id);
  }

  protected discardDraftRule(): void {
    const draftRule = this.draftRule();

    if (!draftRule) {
      return;
    }

    this.draftRule.set(null);
    this.selectedRuleId.set(this.rules()[0]?.id ?? null);
  }

  protected updateRule(rule: FormBuilderLogicRule, changes: Partial<FormBuilderLogicRule>): void {
    this.replaceRule(rule.id, current => ({
      ...current,
      ...changes
    }));
  }

  protected setConditionType(rule: FormBuilderLogicRule, type: FormBuilderLogicConditionMode): void {
    this.replaceRule(rule.id, current => ({
      ...current,
      when: coerceConditionType(current.when, type)
    }));
  }

  protected updateConditionExpression(rule: FormBuilderLogicRule, expression: string, index?: number): void {
    this.replaceRule(rule.id, current => ({
      ...current,
      when: updateConditionExpression(current.when, expression, index)
    }));
  }

  protected addCondition(rule: FormBuilderLogicRule): void {
    this.replaceRule(rule.id, current => ({
      ...current,
      when: addCondition(current.when)
    }));
  }

  protected removeCondition(rule: FormBuilderLogicRule, index: number): void {
    this.replaceRule(rule.id, current => ({
      ...current,
      when: removeCondition(current.when, index)
    }));
  }

  protected conditionsFor(rule: FormBuilderLogicRule): FormBuilderLogicCondition[] {
    return rule.when.type === 'all' || rule.when.type === 'any' ? rule.when.conditions : [];
  }

  protected fieldOptions(): FormBuilderLogicTargetOption[] {
    return this.targetOptions().filter(option => option.kind === 'field');
  }

  protected conditionFieldValue(condition: FormBuilderLogicCondition): string {
    return condition.type === 'field' ? condition.fieldId : '';
  }

  protected conditionOperatorValue(condition: FormBuilderLogicCondition): FormBuilderLogicConditionOperator | '' {
    return condition.type === 'field' ? condition.operator : '';
  }

  protected conditionValue(condition: FormBuilderLogicCondition): string {
    return condition.type === 'field' ? String(condition.value ?? '') : '';
  }

  protected conditionNeedsValue(condition: FormBuilderLogicCondition): boolean {
    const operator = this.conditionOperatorValue(condition);

    return !!operator && operator !== 'empty' && operator !== 'notEmpty';
  }

  protected updateConditionField(rule: FormBuilderLogicRule, index: number, fieldId: string): void {
    this.updateFieldCondition(rule, index, condition => ({
      ...condition,
      fieldId
    }));
  }

  protected updateConditionOperator(
    rule: FormBuilderLogicRule,
    index: number,
    operator: FormBuilderLogicConditionOperator
  ): void {
    this.updateFieldCondition(rule, index, condition => ({
      ...condition,
      operator,
      value: operator === 'empty' || operator === 'notEmpty' ? undefined : condition.value
    }));
  }

  protected updateConditionValue(rule: FormBuilderLogicRule, index: number, value: string): void {
    this.updateFieldCondition(rule, index, condition => ({
      ...condition,
      value
    }));
  }

  protected actionsFor(rule: FormBuilderLogicRule, branch: FormBuilderLogicActionBranch): FormBuilderLogicAction[] {
    return branch === 'actions'
      ? rule.actions
      : rule.elseActions ?? [];
  }

  protected addAction(rule: FormBuilderLogicRule, branch: FormBuilderLogicActionBranch): void {
    this.replaceRule(rule.id, current => {
      const actions = this.actionsFor(current, branch);

      return {
        ...current,
        [branch]: [
          ...actions,
          createLogicAction('', '', undefined, 'field')
        ]
      };
    });
  }

  protected updateActionType(
    rule: FormBuilderLogicRule,
    branch: FormBuilderLogicActionBranch,
    index: number,
    type: FormBuilderLogicActionType
  ): void {
    this.updateAction(rule, branch, index, action => createLogicAction(action.targetId, type, action, action.targetKind));
  }

  protected updateActionTarget(
    rule: FormBuilderLogicRule,
    branch: FormBuilderLogicActionBranch,
    index: number,
    value: string
  ): void {
    const target = parseTargetValue(value);

    this.updateAction(rule, branch, index, action => createLogicAction(
      target.id,
      coerceActionTypeForTarget(target.kind, action.type),
      action,
      target.kind
    ));
  }

  protected updateActionExpression(
    rule: FormBuilderLogicRule,
    branch: FormBuilderLogicActionBranch,
    index: number,
    expression: string
  ): void {
    this.updateAction(rule, branch, index, action => action.type === 'setValue'
      ? { ...action, expression }
      : action
    );
  }

  protected removeAction(rule: FormBuilderLogicRule, branch: FormBuilderLogicActionBranch, index: number): void {
    this.replaceRule(rule.id, current => ({
      ...current,
      [branch]: this.actionsFor(current, branch).filter((_, actionIndex) => actionIndex !== index)
    }));
  }

  protected conditionLabel(condition: FormBuilderLogicCondition): string {
    if (condition.type === 'all') {
      return `${condition.conditions.length} conditions must match`;
    }

    if (condition.type === 'any') {
      return `${condition.conditions.length} conditions can match`;
    }

    if (condition.type === 'field') {
      const field = this.fieldOptions().find(option => option.id === condition.fieldId);
      const operator = CONDITION_OPERATOR_OPTIONS.find(option => option.value === condition.operator);

      if (!field || !operator) {
        return 'Incomplete condition';
      }

      return this.conditionNeedsValue(condition)
        ? `${field.label} ${operator.label} ${condition.value ?? ''}`
        : `${field.label} ${operator.label}`;
    }

    return condition.expression || 'Empty expression';
  }

  protected actionLabel(action: FormBuilderLogicAction): string {
    if (!action.targetId || !action.type) {
      return 'Incomplete action';
    }

    const target = this.targetLabel(action.targetKind ?? 'field', action.targetId);

    switch (action.type) {
      case 'show':
        return `Show ${target}`;
      case 'hide':
        return `Hide ${target}`;
      case 'enable':
        return `Enable ${target}`;
      case 'disable':
        return `Disable ${target}`;
      case 'readonly':
        return `Make ${target} readonly`;
      case 'editable':
        return `Make ${target} editable`;
      case 'require':
        return `Require ${target}`;
      case 'optional':
        return `Make ${target} optional`;
      case 'setValue':
        return `Set ${target}`;
      case 'clearValue':
        return `Clear ${target}`;
    }
  }

  protected actionTypeOptionsForTarget(kind: FormBuilderLogicTargetKind | undefined): { label: string; value: FormBuilderLogicActionType }[] {
    return kind === 'section' ? SECTION_ACTION_TYPE_OPTIONS : ACTION_TYPE_OPTIONS;
  }

  protected actionTargetValue(action: FormBuilderLogicAction): string {
    return action.targetId ? targetValue(action.targetKind ?? 'field', action.targetId) : '';
  }

  protected targetOptionLabel(option: FormBuilderLogicTargetOption): string {
    const name = option.name ? ` (${option.name})` : '';
    const prefix = option.kind === 'section' ? 'Section' : 'Field';

    return `${prefix}: ${option.label}${name}`;
  }

  protected fieldOptionLabel(option: FormBuilderLogicTargetOption): string {
    return this.targetOptionLabel(option);
  }

  private targetLabel(kind: FormBuilderLogicTargetKind, id: string): string {
    const target = this.targetOptions().find(option => option.kind === kind && option.id === id);

    return target ? this.targetOptionLabel(target) : id;
  }

  private updateAction(
    rule: FormBuilderLogicRule,
    branch: FormBuilderLogicActionBranch,
    index: number,
    update: (action: FormBuilderLogicAction) => FormBuilderLogicAction
  ): void {
    this.replaceRule(rule.id, current => ({
      ...current,
      [branch]: this.actionsFor(current, branch).map((action, actionIndex) =>
        actionIndex === index ? update(action) : action
      )
    }));
  }

  private updateFieldCondition(
    rule: FormBuilderLogicRule,
    index: number,
    update: (condition: Extract<FormBuilderLogicCondition, { type: 'field' }>) => FormBuilderLogicCondition
  ): void {
    this.replaceRule(rule.id, current => ({
      ...current,
      when: updateFieldCondition(current.when, index, update)
    }));
  }

  private replaceRule(
    ruleId: string,
    update: (rule: FormBuilderLogicRule) => FormBuilderLogicRule
  ): void {
    const draftRule = this.draftRule();

    if (draftRule?.id === ruleId) {
      this.draftRule.set(update(cloneLogicRule(draftRule)));
      this.selectedRuleId.set(ruleId);
      return;
    }

    this.logic.set(this.rules().map(rule =>
      rule.id === ruleId ? update(cloneLogicRule(rule)) : cloneLogicRule(rule)
    ));
    this.selectedRuleId.set(ruleId);
  }

}

function createLogicRule(index: number): FormBuilderLogicRule {
  return {
    id: uniqueId('logic'),
    name: `Rule ${index}`,
    enabled: true,
    priority: index,
    when: { type: 'all', conditions: [] },
    actions: []
  };
}

function createLogicAction(
  targetId: string,
  type: FormBuilderLogicActionType | '' = 'show',
  source?: FormBuilderLogicAction,
  targetKind: FormBuilderLogicTargetKind = 'field'
): FormBuilderLogicAction {
  if (!targetId || !type) {
    return {
      type: '',
      targetId: '',
      targetKind
    };
  }

  if (type === 'setValue') {
    return {
      type,
      targetId,
      targetKind,
      expression: source?.type === 'setValue' ? source.expression : ''
    };
  }

  return { type, targetId, targetKind } as FormBuilderLogicAction;
}

function targetValue(kind: FormBuilderLogicTargetKind, id: string): string {
  return `${kind}:${id}`;
}

function parseTargetValue(value: string): { kind: FormBuilderLogicTargetKind; id: string } {
  const [kind, ...idParts] = value.split(':');

  return {
    kind: kind === 'section' ? 'section' : 'field',
    id: idParts.join(':')
  };
}

function coerceActionTypeForTarget(
  targetKind: FormBuilderLogicTargetKind,
  actionType: FormBuilderLogicActionType | ''
): FormBuilderLogicActionType | '' {
  if (!actionType) {
    return '';
  }

  return targetKind === 'section' && actionType !== 'show' && actionType !== 'hide'
    ? 'hide'
    : actionType;
}

function coerceConditionType(
  condition: FormBuilderLogicCondition,
  type: FormBuilderLogicConditionMode
): FormBuilderLogicCondition {
  if (type === 'expression') {
    return {
      type,
      expression: firstConditionExpression(condition)
    };
  }

  return {
    type,
    conditions: condition.type === 'all' || condition.type === 'any'
      ? condition.conditions.map(cloneLogicCondition)
      : condition.type === 'field'
        ? [cloneLogicCondition(condition)]
        : []
  };
}

function updateConditionExpression(
  condition: FormBuilderLogicCondition,
  expression: string,
  index?: number
): FormBuilderLogicCondition {
  if (condition.type === 'expression') {
    return { ...condition, expression };
  }

  if (condition.type !== 'all' && condition.type !== 'any') {
    return condition;
  }

  return {
    ...condition,
    conditions: condition.conditions.map((item, itemIndex) =>
      itemIndex === index ? { type: 'expression', expression } : cloneLogicCondition(item)
    )
  };
}

function addCondition(condition: FormBuilderLogicCondition): FormBuilderLogicCondition {
  if (condition.type === 'expression') {
    return {
      type: 'all',
      conditions: [createEmptyFieldCondition()]
    };
  }

  if (condition.type !== 'all' && condition.type !== 'any') {
    return condition;
  }

  return {
    ...condition,
    conditions: [
      ...condition.conditions.map(cloneLogicCondition),
      createEmptyFieldCondition()
    ]
  };
}

function removeCondition(condition: FormBuilderLogicCondition, index: number): FormBuilderLogicCondition {
  if (condition.type !== 'all' && condition.type !== 'any') {
    return condition;
  }

  const conditions = condition.conditions.filter((_, itemIndex) => itemIndex !== index);

  return {
    ...condition,
    conditions: conditions.map(cloneLogicCondition)
  };
}

function firstConditionExpression(condition: FormBuilderLogicCondition): string {
  if (condition.type === 'expression') {
    return condition.expression;
  }

  if (condition.type === 'field') {
    return '';
  }

  return condition.conditions.map(firstConditionExpression).find(Boolean) ?? '';
}

function createEmptyFieldCondition(): Extract<FormBuilderLogicCondition, { type: 'field' }> {
  return {
    type: 'field',
    fieldId: '',
    operator: '',
    value: ''
  };
}

function updateFieldCondition(
  condition: FormBuilderLogicCondition,
  index: number,
  update: (condition: Extract<FormBuilderLogicCondition, { type: 'field' }>) => FormBuilderLogicCondition
): FormBuilderLogicCondition {
  if (condition.type !== 'all' && condition.type !== 'any') {
    return condition;
  }

  return {
    ...condition,
    conditions: condition.conditions.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return cloneLogicCondition(item);
      }

      return update(item.type === 'field' ? item : createEmptyFieldCondition());
    })
  };
}

function cloneLogicRule(rule: FormBuilderLogicRule): FormBuilderLogicRule {
  return {
    ...rule,
    when: cloneLogicCondition(rule.when),
    actions: rule.actions.map(action => ({ ...action })),
    elseActions: rule.elseActions?.map(action => ({ ...action }))
  };
}

function cloneLogicCondition(condition: FormBuilderLogicCondition): FormBuilderLogicCondition {
  if (condition.type === 'all' || condition.type === 'any') {
    return {
      ...condition,
      conditions: condition.conditions.map(cloneLogicCondition)
    };
  }

  return { ...condition };
}

function flattenLogicFields(fields: FormBuilderField[], depth = 0): FormBuilderLogicTargetOption[] {
  return fields.flatMap(field => [
    {
      kind: 'field' as const,
      id: field.id,
      name: field.name,
      label: field.label,
      type: field.type,
      depth
    },
    ...flattenLogicFields(field.children ?? [], depth + 1)
  ]);
}

function uniqueId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
