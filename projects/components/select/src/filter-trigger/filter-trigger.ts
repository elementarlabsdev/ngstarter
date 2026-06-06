import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SELECT } from '../select/select-token';
import { FilterTriggerValueDirective } from './filter-trigger-value.directive';

@Component({
  selector: 'ngs-filter-trigger',
  standalone: true,
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './filter-trigger.html',
  styleUrl: './filter-trigger.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-filter-trigger',
  },
})
export class FilterTrigger {
  private readonly _select = inject(SELECT);

  readonly maxCount = input(99, { transform: numberAttribute });
  readonly showZero = input(false, { transform: booleanAttribute });
  protected readonly customValue = contentChild(FilterTriggerValueDirective, { descendants: true });

  protected readonly isMultiple = computed(() => this._select.multiple());
  protected readonly selectedText = computed(() => this._select.triggerValue?.() ?? '');
  protected readonly selectedCount = computed(() => this._select.selectedCount?.() ?? 0);
  protected readonly selectedData = computed(() => this._select.selectedData?.());
  protected readonly hasSelectedData = computed(() => {
    const data = this.selectedData();

    return this.isMultiple()
      ? Array.isArray(data) && data.length > 0
      : data !== null && data !== undefined;
  });
  protected readonly valueContext = computed(() => {
    const data = this.selectedData();

    return {
      $implicit: data,
      data,
      text: this.selectedText(),
      count: this.selectedCount(),
      multiple: this.isMultiple()
    };
  });
  protected readonly displayCount = computed(() => {
    if (!this.isMultiple()) {
      return null;
    }

    const count = this.selectedCount();

    if (count === 0 && !this.showZero()) {
      return null;
    }

    const maxCount = this.maxCount();

    if (Number.isFinite(maxCount) && count > maxCount) {
      return `${maxCount}+`;
    }

    return count;
  });
}
