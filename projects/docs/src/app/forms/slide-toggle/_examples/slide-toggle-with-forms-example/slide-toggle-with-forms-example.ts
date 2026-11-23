import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-slide-toggle-with-forms-example',
  imports: [
    FormsModule,
    SignalFormField,
    SlideToggle,
    Button
  ],
  templateUrl: './slide-toggle-with-forms-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './slide-toggle-with-forms-example.scss'
})
export class SlideToggleWithFormsExample {
  isChecked = true;
  formGroup = form(signal({
    enableWifi: false,
    acceptTerms: false,
  }), (path) => {
    required(path.acceptTerms);
  });
}
