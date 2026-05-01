import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SNACK_BAR_DATA } from '../snack-bar-config';
import { SnackBarRef } from '../snack-bar-ref';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-simple-snack-bar',
  exportAs: 'ngsSimpleSnackBar',
  templateUrl: './simple-snack-bar.html',
  styleUrl: './simple-snack-bar.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button
  ]
})
export class SimpleSnackBar {
  readonly snackBarRef = inject(SnackBarRef);
  readonly data = inject(SNACK_BAR_DATA);

  /** Performs the action on the snack bar. */
  action(): void {
    this.snackBarRef.dismiss();
  }
}
