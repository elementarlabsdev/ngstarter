import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { FormField, Label, TextPrefix, IconPrefix, IconButtonPrefix, IconSuffix, IconButtonSuffix } from '@ngstarter/components/form-field';
import { Button } from '@ngstarter/components/button';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-prefixes-and-suffixes-example',
  imports: [
    Icon,
    Label,
    FormField,
    Button,
    TextPrefix,
    IconPrefix,
    IconButtonPrefix,
    IconSuffix,
    IconButtonSuffix,
    Input
  ],
  templateUrl: './prefixes-and-suffixes-example.html',
  styleUrl: './prefixes-and-suffixes-example.scss'
})
export class PrefixesAndSuffixesExample {

}
