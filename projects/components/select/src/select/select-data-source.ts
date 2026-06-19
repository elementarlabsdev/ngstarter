export interface SelectDataSourceRequest {
  search: string;
  page: number;
  pageSize: number;
  cursor?: unknown;
  selectedValues: unknown[];
  reason: 'initial' | 'open' | 'search' | 'page';
  signal?: AbortSignal;
}

export interface SelectDataSourceOption<T = unknown> {
  label: string;
  value: unknown;
  disabled?: boolean;
  data?: T;
}

export interface SelectDataSourceResult<T = unknown> {
  items: SelectDataSourceOption<T>[];
  hasMore?: boolean;
  total?: number;
  nextCursor?: unknown;
}

export type SelectDataSource<T = unknown> =
  (request: SelectDataSourceRequest) => Promise<SelectDataSourceResult<T> | SelectDataSourceOption<T>[]>;
