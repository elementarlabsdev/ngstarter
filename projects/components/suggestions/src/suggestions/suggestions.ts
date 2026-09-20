import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-suggestions',
  exportAs: 'ngsSuggestions',
  imports: [],
  templateUrl: './suggestions.html',
  styleUrl: './suggestions.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-suggestions'
  }
})
export class Suggestions {

}
