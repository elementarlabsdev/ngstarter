import { Component, model } from '@angular/core';
import { TimezoneSelect } from '@ngstarter/components/timezone-select';
import { FormField, Label } from '@ngstarter/components/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-basic-timezone-select-example',
  imports: [
    TimezoneSelect,
    FormField,
    Label,
    FormsModule
  ],
  templateUrl: './basic-timezone-select-example.html',
  styleUrl: './basic-timezone-select-example.scss'
})
export class BasicTimezoneSelectExample {
  selectedTimezone = model<string | null>(null);
}
