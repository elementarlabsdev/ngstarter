import { Component, signal } from '@angular/core';
import { Calendar, CalendarEvent } from '@ngstarter-ui/components/calendar';

@Component({
  selector: 'app-calendar-with-events-example',
  imports: [Calendar],
  templateUrl: './calendar-with-events-example.html',
  styleUrl: './calendar-with-events-example.scss',
})
export class CalendarWithEventsExample {
  protected readonly selectedDate = signal(this.dateForDay(12));

  protected readonly events: readonly CalendarEvent[] = [
    { id: 'planning', date: this.dateForDay(3), title: 'Planning', color: 'blue' },
    { id: 'launch', date: this.dateForDay(8), title: 'Launch review', color: 'green' },
    { id: 'risk', date: this.dateForDay(12), title: 'Risk check', color: 'rose' },
    { id: 'ops', date: this.dateForDay(12), title: 'Ops sync', color: 'warning' },
    { id: 'handoff', date: this.dateForDay(21), title: 'Handoff', color: 'primary' },
  ];

  private dateForDay(day: number): Date {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), day);
  }
}
