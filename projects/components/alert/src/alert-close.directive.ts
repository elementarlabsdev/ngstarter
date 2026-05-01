import { Directive, inject } from '@angular/core';
import { ALERT } from './alert.properties';
import { Alert } from './alert/alert';

@Directive({
    selector: '[ngsAlertClose]',
    exportAs: 'ngsAlertClose',
    host: {
      'class': 'ngs-alert-close',
      '(click)': '_handleClick()'
    }
})
export class AlertCloseDirective {
  private _alert = inject<Alert>(ALERT);

  protected _handleClick() {
    this._alert.api.close();
  }
}
