import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import {
  SuggestionBlock,
  Suggestion,
  SuggestionIconDirective, Suggestions, SuggestionThumbDirective
} from '@ngstarter/components/suggestions';
import { Avatar } from '@ngstarter/components/avatar';
import { Button } from '@ngstarter/components/button';

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
