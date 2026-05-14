import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, IconButtonSuffix } from '@ngstarter-ui/components/form-field';
import { Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-clear-button-example',
  imports: [
    FormsModule,
    Icon,
    Button,
    Input,
    Label,
    FormField,
    IconButtonSuffix
  ],
  templateUrl: './clear-button-example.html',
  styleUrl: './clear-button-example.scss'
})
export class ClearButtonExample {
  value = 'Clear me';
}
