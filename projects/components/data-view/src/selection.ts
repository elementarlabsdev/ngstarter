/** Selection retains IDs across immutable reloads and can represent unloaded server records. */
export class DataViewSelection<T> {
  private records = new Map<unknown, T>();
  readonly excluded = new Set<unknown>();
  allMatching = false;
  constructor(private key: (row: T) => unknown) {}
  get selected(): T[] { return [...this.records.values()]; }
  get keys(): unknown[] { return [...this.records.keys()]; }
  hasValue(): boolean { return this.allMatching || this.records.size > 0; }
  isSelected(row: T): boolean {
    const key = this.key(row);
    return this.allMatching ? !this.excluded.has(key) : this.records.has(key);
  }
  select(...rows: T[]): void {
    this.selectRows(rows);
  }
  selectRows(rows: readonly T[]): void {
    for (const row of rows) { const key = this.key(row); this.excluded.delete(key); this.records.set(key, row); }
  }
  deselect(...rows: T[]): void {
    for (const row of rows) { const key = this.key(row); this.records.delete(key); if (this.allMatching) this.excluded.add(key); }
  }
  clear(): void { this.records.clear(); this.excluded.clear(); this.allMatching = false; }
  selectMatching(rows: T[]): void { this.clear(); this.allMatching = true; this.selectRows(rows); }
  reconcile(rows: T[], dropMissing: boolean): boolean {
    const before = this.selected;
    const available = new Map(rows.map(row => [this.key(row), row]));
    if (dropMissing) for (const key of this.records.keys()) if (!available.has(key)) this.records.delete(key);
    for (const row of rows) if (this.isSelected(row)) this.records.set(this.key(row), row);
    const after = this.selected;
    return before.length !== after.length || before.some((row, index) => row !== after[index]);
  }
}
