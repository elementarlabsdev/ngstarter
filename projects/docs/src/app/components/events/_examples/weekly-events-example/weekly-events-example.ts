import { Component } from '@angular/core';
import { Avatar, AvatarGroup } from '@ngstarter-ui/components/avatar';
import {
  Event,
  EventActionsDirective,
  EventDate,
  EventStatus,
  EventsList,
  EventsSection,
  EventTime,
  EventTitle
} from '@ngstarter-ui/components/events';

@Component({
  selector: 'app-weekly-events-example',
  imports: [
    Avatar,
    AvatarGroup,
    EventsList,
    EventsSection,
    Event,
    EventDate,
    EventTitle,
    EventStatus,
    EventTime,
    EventActionsDirective
  ],
  templateUrl: './weekly-events-example.html',
  styleUrl: './weekly-events-example.scss'
})
export class WeeklyEventsExample {}
