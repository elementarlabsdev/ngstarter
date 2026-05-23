import { Component, signal } from '@angular/core';
import { Calendar } from '@ngstarter-ui/components/calendar';

@Component({
  selector: 'app-basic-calendar-example',
  imports: [Calendar],
  templateUrl: './basic-calendar-example.html',
  styleUrl: './basic-calendar-example.scss',
})
export class BasicCalendarExample {
  protected readonly selectedDate = signal(new Date());
}
