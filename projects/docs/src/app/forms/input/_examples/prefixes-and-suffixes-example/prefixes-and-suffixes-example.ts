import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { FormField, Label, TextPrefix, IconPrefix, IconButtonPrefix, IconSuffix, IconButtonSuffix } from '@ngstarter-ui/components/form-field';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';

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
