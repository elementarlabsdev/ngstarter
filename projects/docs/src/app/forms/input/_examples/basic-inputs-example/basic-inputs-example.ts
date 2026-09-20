import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Input } from '@ngstarter-ui/components/input';
import { FormField, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-basic-inputs-example',
  imports: [
    FormField,
    Input,
    Label
  ],
  templateUrl: './basic-inputs-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-inputs-example.scss'
})
export class BasicInputsExample {

}
