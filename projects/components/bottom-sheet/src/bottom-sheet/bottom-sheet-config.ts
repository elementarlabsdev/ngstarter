import { InjectionToken, ViewContainerRef } from '@angular/core';
import { ScrollStrategy } from '@angular/cdk/overlay';

/** Injection token that can be used to access the data that was passed in to a bottom sheet. */
export const BOTTOM_SHEET_DATA = new InjectionToken<any>('EmrBottomSheetData');

/**
 * Configuration used when opening a bottom sheet.
 */
export class BottomSheetConfig<D = any> {
  /** The view container to place the overlay for the bottom sheet into. */
  viewContainerRef?: ViewContainerRef;

  /** Extra CSS classes to be added to the bottom sheet container. */
  panelClass?: string | string[];

  /** Text layout direction for the bottom sheet. */
  direction?: 'ltr' | 'rtl';

  /** Data being injected into the child component. */
  data?: D | null = null;

  /** Whether the bottom sheet has a backdrop. */
  hasBackdrop?: boolean = true;

  /** Custom class for the backdrop. */
  backdropClass?: string;

  /** Whether the user can use escape or clicking outside to close the bottom sheet. */
  disableClose?: boolean = false;

  /** Aria label to assign to the bottom sheet element. */
  ariaLabel?: string | null = null;

  /**
   * Whether this is a modal dialog. Used to set the `aria-modal` attribute.
   */
  ariaModal?: boolean = false;

  /**
   * Whether the bottom sheet should close when the user goes backwards/forwards in history.
   */
  closeOnNavigation?: boolean = true;

  /**
   * Where the bottom sheet should focus on open.
   */
  autoFocus?: string | boolean = 'first-tabbable';

  /**
   * Whether the bottom sheet should restore focus to the
   * previously-focused element, after it's closed.
   */
  restoreFocus?: boolean = true;

  /** Scroll strategy to be used for the bottom sheet. */
  scrollStrategy?: ScrollStrategy;

  /** Height for the bottom sheet. */
  height?: string = '';

  /** Minimum height for the bottom sheet. If a number is provided, assumes pixel units. */
  minHeight?: string | number;

  /** Maximum height for the bottom sheet. If a number is provided, assumes pixel units. */
  maxHeight?: string | number;
}
