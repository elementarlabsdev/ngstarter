import { InjectionToken, Provider, TemplateRef } from '@angular/core';

export interface TourConfig {
  /**
   * Default padding for the highlighted element.
   * @default 4
   */
  padding?: number;
  /**
   * Whether to close the tour when clicking on the backdrop.
   * @default false
   */
  closeOnBackdropClick?: boolean;
  /**
   * Whether to enable keyboard navigation (arrows and Esc).
   * @default true
   */
  keyboardNavigation?: boolean;
  /**
   * Default text for the "Next" button.
   */
  nextBtnText?: string;
  /**
   * Default text for the "Prev" button.
   */
  prevBtnText?: string;
  /**
   * Default text for the "Finish" button.
   */
  finishBtnText?: string;
  /**
   * Default text for the "Skip" button.
   */
  skipBtnText?: string;
}

export const TOUR_CONFIG = new InjectionToken<TourConfig>('TOUR_CONFIG');

export function provideTourConfig(config: TourConfig): Provider {
  return {
    provide: TOUR_CONFIG,
    useValue: config
  };
}

export type TourStepPosition = 'below-start' | 'below-center' | 'below-end' |
                              'above-start' | 'above-center' | 'above-end' |
                              'before-start' | 'before-center' | 'before-end' |
                              'after-start' | 'after-center' | 'after-end';

export interface TourStepConfig {
  /**
   * Unique identifier for the tour step anchor or a function that returns an element or selector.
   */
  anchorId: string | (() => HTMLElement | string);
  /**
   * Title of the tour step.
   */
  title?: string;
  /**
   * Content of the tour step.
   */
  content?: string;
  /**
   * HTML content of the tour step.
   */
  htmlContent?: string;
  /**
   * Template for the tour step.
   */
  template?: TemplateRef<any>;
  /**
   * Context for the template.
   */
  templateContext?: any;
  /**
   * Custom data for the tour step.
   */
  data?: any;
  /**
   * Whether to show a backdrop and highlight the anchor element.
   */
  withBackdrop?: boolean;
  /**
   * Whether to disable interaction with the highlighted element.
   */
  disableInteraction?: boolean;
  /**
   * Padding for the highlighted element.
   * If not provided, the default from TourConfig will be used.
   */
  padding?: number;
  /**
   * Route to navigate to before showing the step.
   */
  route?: string;
  /**
   * CSS selector to wait for before showing the step.
   */
  waitFor?: string;
  /**
   * Callback before showing the step.
   */
  onShow?: () => void | Promise<void>;
  /**
   * Callback before hiding the step.
   */
  onHide?: () => void | Promise<void>;
  /**
   * Callback when "Next" is clicked.
   */
  onNext?: () => void | Promise<void>;
  /**
   * Callback when "Prev" is clicked.
   */
  onPrev?: () => void | Promise<void>;
  /**
   * Whether to hide the arrow pointing to the anchor.
   */
  hideArrow?: boolean;
  /**
   * Whether to close the tour when clicking on the backdrop.
   * If not provided, the default from TourConfig will be used.
   */
  closeOnBackdropClick?: boolean;
  /**
   * Text for the "Next" button.
   */
  nextBtnText?: string;
  /**
   * Text for the "Prev" button.
   */
  prevBtnText?: string;
  /**
   * Text for the "Finish" button.
   */
  finishBtnText?: string;
  /**
   * Text for the "Skip" button.
   */
  skipBtnText?: string;
  /**
   * Explicit position for the tour step.
   * If not provided, the best position will be chosen automatically.
   */
  position?: TourStepPosition;
}

export enum TourState {
  OFF,
  ON,
  PAUSED
}

export const TOUR_STEP_COMPONENT = new InjectionToken<any>('TOUR_STEP_COMPONENT');
