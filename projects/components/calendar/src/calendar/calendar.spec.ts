import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Calendar, CalendarEvent } from './calendar';

@Component({
  imports: [Calendar],
  template: `
    <ngs-calendar
      [startAt]="startAt"
      [selected]="selected()"
      [events]="events"
      [showTodayButton]="false"
      (selectedChange)="selected.set($event)"
    />
  `,
})
class CalendarHost {
  startAt = new Date(2026, 4, 1);
  selected = signal<Date | null>(new Date(2026, 4, 11));
  events: readonly CalendarEvent[] = [
    { id: 'planning', date: new Date(2026, 4, 16), title: 'Planning', color: 'blue' },
  ];
}

describe('Calendar', () => {
  let component: Calendar;
  let fixture: ComponentFixture<Calendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calendar],
    }).compileComponents();

    fixture = TestBed.createComponent(Calendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Calendar integration', () => {
  let fixture: ComponentFixture<CalendarHost>;
  let component: CalendarHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHost],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarHost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a six week month grid', () => {
    const host = fixture.nativeElement as HTMLElement;
    const days = host.querySelectorAll('.ngs-calendar-day');

    expect(days.length).toBe(42);
  });

  it('marks the selected date', () => {
    const host = fixture.nativeElement as HTMLElement;
    const selectedDay = host.querySelector('[data-date="2026-05-11"]');

    expect(selectedDay?.classList.contains('ngs-calendar-day-selected')).toBe(true);
  });

  it('updates the selected date when a day is clicked', () => {
    const host = fixture.nativeElement as HTMLElement;
    const day = host.querySelector('[data-date="2026-05-20"]') as HTMLButtonElement;

    day.click();
    fixture.detectChanges();

    expect(component.selected()?.getDate()).toBe(20);
  });

  it('renders event markers', () => {
    const host = fixture.nativeElement as HTMLElement;
    const eventDay = host.querySelector('[data-date="2026-05-16"]');

    expect(eventDay?.querySelector('.ngs-calendar-event-blue')).toBeTruthy();
  });
});
