export class DateRange<D> {
  constructor(
    /** The start date of the range. */
    readonly start: D | null,
    /** The end date of the range. */
    readonly end: D | null
  ) {}
}
