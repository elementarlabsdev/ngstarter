import { Component, signal } from '@angular/core';
import { Calendar } from '@ngstarter-ui/components/calendar';

@Component({
  selector: 'app-calendar-min-max-example',
  imports: [Calendar],
  templateUrl: './calendar-min-max-example.html',
  styleUrl: './calendar-min-max-example.scss',
})
export class CalendarMinMaxExample {
  protected readonly selectedDate = signal(this.dateForDay(14));
  protected readonly minDate = this.dateForDay(8);
  protected readonly maxDate = this.dateForDay(24);

  private dateForDay(day: number): Date {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), day);
  }
}
