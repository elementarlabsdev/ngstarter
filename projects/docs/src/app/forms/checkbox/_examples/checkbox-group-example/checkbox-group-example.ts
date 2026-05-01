import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox, CheckboxGroup } from '@ngstarter-ui/components/checkbox';

@Component({
  selector: 'app-checkbox-group-example',
  imports: [
    FormsModule,
    Checkbox,
    CheckboxGroup
  ],
  templateUrl: './checkbox-group-example.html',
  styleUrl: './checkbox-group-example.scss'
})
export class CheckboxGroupExample {
}
