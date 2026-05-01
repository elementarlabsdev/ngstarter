import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * To modify the labels and text displayed, create a new instance of PaginatorIntl and
 * include it in a custom provider
 */
@Injectable({ providedIn: 'root' })
export class PaginatorIntl {
  /**
   * Stream to emit from when labels are changed. Use this to notify components when the labels have
   * changed after initialization.
   */
  readonly changes = new Subject<void>();

  /** A label for the page size selector. */
  itemsPerPageLabel = 'Items per page:';

  /** A label for the button that increments the current page. */
  nextPageLabel = 'Next page';

  /** A label for the button that decrements the current page. */
  previousPageLabel = 'Previous page';

  /** A label for the button that moves to the first page. */
  firstPageLabel = 'First page';

  /** A label for the button that moves to the last page. */
  lastPageLabel = 'Last page';

  /** A label for the range of items within the current page and the length of the whole list. */
  getRangeLabel = (page: number, pageSize: number, length: number) => {
    length = Math.max(length || 0, 0);

    if (length === 0 || pageSize === 0) {
      return `0 ${this.ofLabel || 'of'} ${length}`;
    }

    const startIndex = (page || 0) * (pageSize || 0);

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex =
      startIndex < length ? Math.min(startIndex + (pageSize || 0), length) : startIndex + (pageSize || 0);

    return `${startIndex + 1} – ${endIndex} ${this.ofLabel || 'of'} ${length}`;
  };

  /** Label for the 'of' terminology in the range display. */
  ofLabel = 'of';
}
