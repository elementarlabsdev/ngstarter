import {
  Component,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  output,
  ElementRef,
  input,
  booleanAttribute,
  signal,
  forwardRef,
  contentChildren
} from '@angular/core';
import { Option, OPTION_PARENT, _OptionParent } from '@ngstarter-ui/components/option';
import { NgClass } from '@angular/common';

let nextId = 0;

export interface AutocompleteActivatedEvent {
  source: Autocomplete;
  option: Option | null;
}

export interface AutocompleteSelectedEvent {
  source: Autocomplete;
  option: Option;
}

@Component({
  selector: 'ngs-autocomplete',
  exportAs: 'ngsAutocomplete',
  imports: [
    NgClass
  ],
  templateUrl: './autocomplete.html',
  styleUrl: './autocomplete.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: OPTION_PARENT,
      useExisting: forwardRef(() => Autocomplete)
    }
  ],
})
export class Autocomplete implements _OptionParent {
  readonly options = contentChildren(Option, { descendants: true });

  multiple = signal(false);
  readonly template = viewChild.required(TemplateRef);
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  id = `ngs-autocomplete-${nextId++}`;

  ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  autoActiveFirstOption = input(false, { transform: booleanAttribute });
  autoSelectActiveOption = input(false, { transform: booleanAttribute });
  classList = input<string | string[] | undefined>(undefined, { alias: 'class' });
  disableRipple = input(false, { transform: booleanAttribute });
  displayWith = input<(value: any) => string | null>(() => null);
  hideSingleSelectionIndicator = input(false, { transform: booleanAttribute });
  panelWidth = input<string | number | undefined>(undefined);
  requireSelection = input(false, { transform: booleanAttribute });

  closed = output<void>();
  opened = output<void>();
  optionActivated = output<AutocompleteActivatedEvent>();
  optionSelected = output<AutocompleteSelectedEvent>();

  _emitSelectEvent(option: Option): void {
    this.optionSelected.emit({ source: this, option });
  }
}
