import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable, InjectionToken, Injector, OnDestroy, TemplateRef } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { BottomSheetConfig, BOTTOM_SHEET_DATA } from './bottom-sheet-config';
import { BottomSheetContainer } from './bottom-sheet-container';
import { BottomSheetRef } from './bottom-sheet-ref';

/** Injection token that can be used to specify default bottom sheet options. */
export const BOTTOM_SHEET_DEFAULT_OPTIONS = new InjectionToken<BottomSheetConfig>(
  'ngs-bottom-sheet-default-options'
);

@Injectable({ providedIn: 'root' })
export class BottomSheet implements OnDestroy {
  private _injector = inject(Injector);
  private _overlay = inject(Overlay);
  private _dialog = inject(Dialog);
  private _parentBottomSheet = inject(BottomSheet, { optional: true, skipSelf: true });
  private _defaultOptions = inject(BOTTOM_SHEET_DEFAULT_OPTIONS, { optional: true });
  private _bottomSheetRefAtThisLevel: BottomSheetRef<any> | null = null;

  /** Reference to the currently opened bottom sheet. */
  get _openedBottomSheetRef(): BottomSheetRef<any> | null {
    const parent = this._parentBottomSheet;
    return parent ? parent._openedBottomSheetRef : this._bottomSheetRefAtThisLevel;
  }

  set _openedBottomSheetRef(value: BottomSheetRef<any> | null) {
    if (this._parentBottomSheet) {
      this._parentBottomSheet._openedBottomSheetRef = value;
    } else {
      this._bottomSheetRefAtThisLevel = value;
    }
  }

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: BottomSheetConfig<D>
  ): BottomSheetRef<T, R> {
    const _config = { ...(this._defaultOptions || new BottomSheetConfig()), ...config };
    let ref: BottomSheetRef<T, R>;

    const cdkRef = this._dialog.open<R, D, T>(componentOrTemplateRef, {
      ...(_config as any),
      // Disable closing since we need to sync it up to the animation ourselves.
      disableClose: true,
      // Disable closing on detachments so that we can sync up the animation.
      closeOnOverlayDetachments: false,
      maxWidth: '100%',
      container: BottomSheetContainer,
      scrollStrategy: _config.scrollStrategy || this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay.position()
        .global()
        .centerHorizontally()
        .bottom('0'),
      templateContext: () => ({ bottomSheetRef: ref }),
      providers: (cdkRef: any, _cdkConfig: any, container: any) => {
        ref = new BottomSheetRef<T, R>(cdkRef, _config, container);
        return [
          { provide: BottomSheetRef, useValue: ref },
          { provide: BOTTOM_SHEET_DATA, useValue: _config.data },
        ];
      },
    });
    ref!._refInstance = (cdkRef.componentInstance ?? null) as T | null;
    ref!._refRef = (cdkRef as any).componentRef ?? null;

    ref!.afterDismissed().subscribe(() => {
      // Clear the bottom sheet ref if it hasn't already been replaced by a newer one.
      if (this._openedBottomSheetRef === ref) {
        this._openedBottomSheetRef = null;
      }
    });

    if (this._openedBottomSheetRef) {
      // If a bottom sheet is already in view, dismiss it and enter the
      // new bottom sheet after exit animation is complete.
      this._openedBottomSheetRef.afterDismissed().subscribe(() => ref!.containerInstance?.enter());
      this._openedBottomSheetRef.dismiss();
    } else {
      // If no bottom sheet is in view, enter the new bottom sheet.
      ref!.containerInstance.enter();
    }

    this._openedBottomSheetRef = ref!;
    return ref!;
  }

  /**
   * Dismisses the currently-visible bottom sheet.
   * @param result Data to pass to the bottom sheet instance.
   */
  dismiss<R = any>(result?: R): void {
    if (this._openedBottomSheetRef) {
      this._openedBottomSheetRef.dismiss(result);
    }
  }

  ngOnDestroy() {
    if (this._bottomSheetRefAtThisLevel) {
      this._bottomSheetRefAtThisLevel.dismiss();
    }
  }
}
