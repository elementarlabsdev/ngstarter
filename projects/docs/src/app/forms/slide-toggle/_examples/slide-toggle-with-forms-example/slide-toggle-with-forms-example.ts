import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-slide-toggle-with-forms-example',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SlideToggle,
    Button
  ],
  templateUrl: './slide-toggle-with-forms-example.html',
  styleUrl: './slide-toggle-with-forms-example.scss'
})
export class SlideToggleWithFormsExample {
  private _formBuilder = inject(FormBuilder);
  isChecked = true;
  formGroup = this._formBuilder.group({
    enableWifi: '',
    acceptTerms: ['', Validators.requiredTrue],
  });
}
