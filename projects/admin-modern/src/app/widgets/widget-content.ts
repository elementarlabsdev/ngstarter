export interface DashboardWidgetContent {
  readonly title: string;
  readonly subtitle: string;
  readonly value?: number;
}

export interface CalendarDay {
  readonly day: string;
  readonly state?: 'active' | 'muted';
  readonly marker?: 'green' | 'rose' | 'blue';
}

export interface EventRow {
  readonly type: string;
  readonly id: string;
  readonly date: string;
  readonly time: string;
  readonly tone: 'warm' | 'green' | 'blue';
}
