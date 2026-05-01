import { Injectable } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';

/** Provider for managing the error state of a form control. */
@Injectable({ providedIn: 'root' })
export class ErrorStateMatcher {
  /**
   * Whether a control should be in an error state.
   * @param control The form control to check.
   * @param form The parent form that contains the control.
   * @returns Whether the control should be in an error state.
   */
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.touched || (form && form.submitted)));
  }
}

/** Error state matcher that displays an error when a control is dirty and invalid. */
@Injectable()
export class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || (form && form.submitted)));
  }
}
