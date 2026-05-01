import { Injectable, Injector, Type, TemplateRef, inject, StaticProvider } from '@angular/core';
import { Dialog as CdkDialog, DialogConfig as CdkDialogConfig, DialogRef as CdkDialogRef } from '@angular/cdk/dialog';
import { filter, take } from 'rxjs/operators';
import { DialogConfig, DIALOG_DATA, DIALOG_DEFAULT_OPTIONS } from './dialog-config';
import { DialogRef } from './dialog-ref';
import { DialogContainer } from './dialog-container/dialog-container';
import { ComponentType } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root'
})
export class Dialog {
  private readonly _cdkDialog = inject(CdkDialog);
  private readonly _injector = inject(Injector);
  private readonly _defaultOptions = inject(DIALOG_DEFAULT_OPTIONS, { optional: true });

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: DialogConfig<D>
  ): DialogRef<T, R> {
    const dialogRef = new DialogRef<T, R>();
    const mergedConfig = { ...new DialogConfig(), ...this._defaultOptions, ...config };

    // Set default maxWidth if not specified and no width is set
    if (!mergedConfig.maxWidth && !mergedConfig.width) {
      mergedConfig.maxWidth = 560;
    }

    // Set default minWidth if not specified
    if (!mergedConfig.minWidth) {
      mergedConfig.minWidth = 280;
    }

    let container: DialogContainer | undefined;
    const cdkConfig: CdkDialogConfig<D, any, DialogContainer> = {
      ...mergedConfig,
      container: DialogContainer,
      panelClass: this._buildPanelClass(mergedConfig?.panelClass),
      backdropClass: this._buildBackdropClass(mergedConfig?.backdropClass),
      providers: (ref: any, config: any, _container: DialogContainer) => {
        container = _container;
        dialogRef._container = _container;
        return [
          { provide: DialogRef, useValue: dialogRef },
          { provide: DIALOG_DATA, useValue: config?.data }
        ];
      }
    };

    const cdkRef = this._cdkDialog.open(componentOrTemplateRef, cdkConfig as any);

    dialogRef.disableClose = mergedConfig?.disableClose;
    dialogRef._cdkRef = cdkRef;

    if (container) {
      container._animationStateChanged
        .pipe(
          filter((event: any) => event.phaseName === 'done' && event.toState === 'enter'),
          take(1)
        )
        .subscribe(() => {
          dialogRef.__fireAfterOpened();
        });

      // Use double rAF to ensure the browser has rendered the initial state (opacity: 0)
      // before we trigger the transition to opacity: 1.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (container) {
            container._startEnterAnimation();
          }

          const overlayRef = cdkRef.overlayRef;
          if (overlayRef.backdropElement) {
            overlayRef.backdropElement.classList.add('ngs-dialog-backdrop-showing');
          }
        });
      });
    }

    cdkRef.closed.subscribe(result => {
      if (dialogRef._cdkRef) {
        dialogRef._cdkRef = null;
        dialogRef.close(result as R);
      }
    });

    cdkRef.backdropClick.subscribe(event => {
      dialogRef.__fireBackdropClick(event);
      if (!dialogRef.disableClose) {
        dialogRef.close();
      }
    });

    cdkRef.keydownEvents.subscribe(event => {
      dialogRef.__fireKeydownEvent(event);
      if (event.key === 'Escape' && !dialogRef.disableClose) {
        dialogRef.close();
      }
    });

    return dialogRef;
  }

  close<T, R>(dialogRef: DialogRef<T, R>, result?: R): void {
    dialogRef.close(result);
  }

  closeAll(): void {
    this._cdkDialog.closeAll();
  }

  private _buildPanelClass(panelClass: string | string[] | undefined): string[] {
    const classes = ['ngs-dialog-panel', 'overflow-hidden', 'flex', 'flex-col'];

    if (Array.isArray(panelClass)) {
      classes.push(...panelClass);
    } else if (panelClass) {
      classes.push(panelClass);
    }

    return classes;
  }

  private _buildBackdropClass(backdropClass: string | string[] | undefined): string[] {
    const classes: string[] = ['ngs-dialog-backdrop'];

    if (Array.isArray(backdropClass)) {
      classes.push(...backdropClass);
    } else if (backdropClass) {
      classes.push(backdropClass);
    }

    return classes;
  }
}
