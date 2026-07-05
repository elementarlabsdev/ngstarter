import { ChangeDetectionStrategy, Component, ElementRef, computed, input, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Error as FormFieldError, FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { FormBuilderField, FormBuilderSection } from '../../types';

interface PlainTextExpression {
  id: string;
  expression: string;
}

@Component({
  selector: 'ngs-plain-text-form-builder-settings',
  exportAs: 'ngsPlainTextFormBuilderSettings',
  imports: [
    FormsModule,
    Button,
    FormField,
    FormFieldError,
    Hint,
    Icon,
    Input,
    Label,
    SlideToggle
  ],
  templateUrl: './plain-text-settings.html',
  styleUrl: './plain-text-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-plain-text-form-builder-settings'
  }
})
export class PlainTextFormBuilderSettings {
  readonly field = input.required<FormBuilderField>();
  readonly update = input.required<(changes: Partial<FormBuilderField>) => void>();
  readonly updateField = input<(changes: Partial<FormBuilderField>) => void>();
  readonly updateSection = input<(changes: Partial<FormBuilderSection>) => void>();

  protected readonly textInput = viewChild<ElementRef<HTMLTextAreaElement>>('textInput');
  protected readonly expressionEnabled = computed(() => this.field().settings?.['expression'] === true);
  protected readonly expressions = computed(() => normalizeExpressions(this.field().settings?.['expressions']));

  protected patchText(text: string): void {
    this.patchSettings({ text });
  }

  protected patchExpressionEnabled(expression: boolean): void {
    this.patchSettings({
      expression,
      expressions: expression ? this.expressions() : this.field().settings?.['expressions'] ?? []
    });
  }

  protected addExpression(): void {
    const expressions = this.expressions();
    const id = uniqueExpressionId(expressions);
    this.patchSettings({
      expressions: [
        ...expressions,
        {
          id,
          expression: ''
        }
      ]
    });
  }

  protected updateExpression(index: number, changes: Partial<PlainTextExpression>): void {
    const expressions = this.expressions();
    const current = expressions[index];

    if (!current) {
      return;
    }

    this.patchSettings({
      expressions: expressions.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...changes,
              id: changes.id !== undefined ? normalizeExpressionId(changes.id) : item.id
            }
          : item
      )
    });
  }

  protected removeExpression(index: number): void {
    this.patchSettings({
      expressions: this.expressions().filter((_, itemIndex) => itemIndex !== index)
    });
  }

  protected insertToken(id: string): void {
    const token = `{${id}}`;
    const text = stringValue(this.field().settings?.['text']);
    const input = this.textInput()?.nativeElement;

    if (!input) {
      this.patchText(`${text}${token}`);
      return;
    }

    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? start;
    const nextText = `${text.slice(0, start)}${token}${text.slice(end)}`;

    this.patchText(nextText);
    queueMicrotask(() => {
      input.focus();
      input.setSelectionRange(start + token.length, start + token.length);
    });
  }

  protected expressionIdError(id: string): string {
    if (!id) {
      return 'ID is required.';
    }

    return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(id)
      ? ''
      : 'Use letters, numbers, underscore, or dash. Start with a letter or underscore.';
  }

  protected tokenHint(id: string): string {
    return `Inserted into text as {${id || 'id'}}.`;
  }

  private patchSettings(changes: Record<string, any>): void {
    (this.updateField() ?? this.update())({
      settings: {
        ...this.field().settings,
        ...changes
      }
    });
  }
}

function normalizeExpressions(value: unknown): PlainTextExpression[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map(item => ({
      id: normalizeExpressionId(item['id']),
      expression: stringValue(item['expression'])
    }));
}

function uniqueExpressionId(expressions: PlainTextExpression[]): string {
  const existing = new Set(expressions.map(item => item.id));
  let index = expressions.length + 1;
  let id = `expression_${index}`;

  while (existing.has(id)) {
    index += 1;
    id = `expression_${index}`;
  }

  return id;
}

function normalizeExpressionId(value: unknown): string {
  return stringValue(value)
    .trim()
    .replace(/[^\w-]/g, '_')
    .replace(/^[^A-Za-z_]+/, '');
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
