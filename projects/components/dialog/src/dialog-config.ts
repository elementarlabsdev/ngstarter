import { InjectionToken } from '@angular/core';

export class DialogConfig<D = any> {
  data?: D | null = null;
  width?: string = '';
  height?: string = '';
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  hasBackdrop?: boolean = true;
  backdropClass?: string | string[] = 'ngs-dialog-backdrop';
  panelClass?: string | string[] = '';
  disableClose?: boolean = false;
  autoFocus?: boolean | string = 'first-tabbable';
  restoreFocus?: boolean = true;
  ariaDescribedBy?: string | null = null;
  ariaLabelledBy?: string | null = null;
  ariaLabel?: string | null = null;
  role?: 'dialog' | 'alertdialog' = 'dialog';
  closeOnNavigation?: boolean = true;
  showCloseButton?: boolean = false;
}

export const DIALOG_DATA = new InjectionToken<any>('DialogData');
export const DIALOG_DEFAULT_OPTIONS = new InjectionToken<DialogConfig>('DialogConfig');
