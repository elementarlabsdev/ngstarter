import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  SuggestionBlock,
  Suggestion,
  SuggestionIconDirective, Suggestions, SuggestionThumbDirective
} from '@ngstarter-ui/components/suggestions';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-suggestions-example',
  imports: [
    Icon,
    SuggestionBlock,
    Suggestion,
    SuggestionIconDirective,
    SuggestionThumbDirective,
    Suggestions,
    Avatar,
    Button
  ],
  templateUrl: './basic-suggestions-example.html',
  styleUrl: './basic-suggestions-example.scss'
})
export class BasicSuggestionsExample {
}
