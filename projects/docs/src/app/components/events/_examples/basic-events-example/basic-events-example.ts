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
  selector: 'app-basic-events-example',
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
  templateUrl: './basic-events-example.html',
  styleUrl: './basic-events-example.scss'
})
export class BasicEventsExample {}
