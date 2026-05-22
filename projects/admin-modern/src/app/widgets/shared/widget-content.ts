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
