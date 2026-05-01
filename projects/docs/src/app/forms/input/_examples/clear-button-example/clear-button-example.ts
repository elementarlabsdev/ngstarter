import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { FormField, IconSuffix } from '@ngstarter/components/form-field';
import { Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-clear-button-example',
  imports: [
    FormsModule,
    Icon,
    Button,
    IconSuffix,
    Input,
    Label,
    FormField
  ],
  templateUrl: './clear-button-example.html',
  styleUrl: './clear-button-example.scss'
})
export class ClearButtonExample {
  value = 'Clear me';
}
