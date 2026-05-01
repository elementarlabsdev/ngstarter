import { booleanAttribute, Component, input } from '@angular/core';
import { Divider } from '@ngstarter-ui/components/divider';

@Component({
  selector: 'ngs-suggestion-block',
  exportAs: 'ngsSuggestionBlock',
  imports: [
    Divider
  ],
  templateUrl: './suggestion-block.html',
  styleUrl: './suggestion-block.scss'
})
export class SuggestionBlock {
  heading = input();
  showDivider = input(false, {
    transform: booleanAttribute,
  });
  inline = input(false, {
    transform: booleanAttribute,
  });
}
