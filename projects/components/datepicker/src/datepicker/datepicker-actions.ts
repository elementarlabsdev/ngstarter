import { Component } from '@angular/core';

@Component({
  selector: 'ngs-datepicker-actions',
  standalone: true,
  template: `
    <div class="ngs-datepicker-actions">
      <ng-content />
    </div>
  `,
  styles: `
    .ngs-datepicker-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px;
      border-top: 1px solid var(--ngs-datepicker-divider-color, rgba(0, 0, 0, 0.12));
    }
  `
})
export class DatepickerActions {}
