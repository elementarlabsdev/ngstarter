import { Component, computed, inject, input } from '@angular/core';
import {
  RadioCardGroup
} from '../radio-card-group/radio-card-group';
import { RadioButton } from '@ngstarter-ui/components/radio';

@Component({
  selector: 'ngs-radio-card',
  exportAs: 'ngsRadioCard',
  imports: [
    RadioButton
  ],
  templateUrl: './radio-card.html',
  styleUrl: './radio-card.scss',
  host: {
    'class': 'ngs-radio-card',
    '[class.is-selected]': 'isSelected()',
    '[class.is-disabled]': 'parentGroup.disabled()',
    '(click)': 'selectCard()',
    'role': 'radio',
    '[attr.aria-checked]': 'isSelected()',
    '[attr.tabindex]': 'parentGroup.disabled() ? -1 : 0',
  },
})
export class RadioCard {
  value = input.required<any>();
  protected parentGroup = inject(RadioCardGroup);
  readonly isSelected = computed(() => this.parentGroup.value() === this.value());

  selectCard(): void {
    this.parentGroup.selectValue(this.value());
  }
}
