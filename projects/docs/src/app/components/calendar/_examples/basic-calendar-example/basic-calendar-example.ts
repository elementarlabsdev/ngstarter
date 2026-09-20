import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { Calendar } from '@ngstarter-ui/components/calendar';

@Component({
  selector: 'app-basic-calendar-example',
  imports: [Calendar],
  templateUrl: './basic-calendar-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-calendar-example.scss',
})
export class BasicCalendarExample {
  protected readonly selectedDate = signal(new Date());
}
