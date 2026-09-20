import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Input } from '@ngstarter-ui/components/input';
import { FormField, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-disabled-example',
  imports: [
    FormField,
    Input,
    Label
  ],
  templateUrl: './disabled-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './disabled-example.scss'
})
export class DisabledExample {

}
