import { InjectionToken } from '@angular/core';

/**
 * Change event object that is emitted when the user selects a
 * different page size or navigates to another page.
 */
export class PageEvent {
  /** The current page index. */
  pageIndex: number;

  /**
   * Index of the page that was selected previously.
   */
  previousPageIndex?: number;

  /** The current page size. */
  pageSize: number;

  /** The current total number of items being paged. */
  length: number;
}

/** Injection token that can be used to provide the default options for the paginator module. */
export const PAGINATOR_DEFAULT_OPTIONS = new InjectionToken<PaginatorDefaultOptions>(
  'PAGINATOR_DEFAULT_OPTIONS',
);

/**
 * Object that can be used to configure the default options for the paginator module.
 */
export interface PaginatorDefaultOptions {
  /** Number of items to display on a page. By default set to 50. */
  pageSize?: number;

  /** The set of provided page size options to display to the user. */
  pageSizeOptions?: number[];

  /** Whether to hide the page size selection UI from the user. */
  hidePageSize?: boolean;

  /** Whether to show the first/last buttons UI to the user. */
  showFirstLastButtons?: boolean;
}

/** The default page size if there is no page size and there are no provided page size options. */
export const DEFAULT_PAGE_SIZE = 50;
