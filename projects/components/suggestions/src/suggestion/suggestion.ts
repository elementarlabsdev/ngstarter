import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Ripple } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-suggestion,[ngs-suggestion]',
  exportAs: 'ngsSuggestion',
  imports: [],
  templateUrl: './suggestion.html',
  styleUrl: './suggestion.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  hostDirectives: [
    Ripple
  ]
})
export class Suggestion {

}
