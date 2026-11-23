import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form, email, required } from '@angular/forms/signals';
import { Input } from '@ngstarter-ui/components/input';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-error-messages-example',
  imports: [
    SignalFormField,
    Error,
    Input,
    Label,
    FormField,
    Error
  ],
  templateUrl: './error-messages-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './error-messages-example.scss'
})
export class ErrorMessagesExample {
  readonly emailFormControl = form(signal(''), path => {
    required(path);
    email(path);
  });

  protected hasError(kind: string): boolean {
    return this.emailFormControl().errors().some(error => error.kind === kind);
  }
}
