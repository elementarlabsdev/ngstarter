import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { DatePipe } from '@angular/common';
import { List, ListItem, ListItemIcon, ListItemLine, ListItemTitle, Subheader } from '@ngstarter/components/list';
import { Divider } from '@ngstarter/components/divider';

export interface Section {
  name: string;
  updated: Date;
}

@Component({
  selector: 'app-list-with-sections-example',
  imports: [
    Icon,
    DatePipe,
    ListItemIcon,
    ListItemTitle,
    ListItemLine,
    ListItem,
    Subheader,
    Divider,
    List
  ],
  templateUrl: './list-with-sections-example.html',
  styleUrl: './list-with-sections-example.scss'
})
export class ListWithSectionsExample {
  folders: Section[] = [
    {
      name: 'Photos',
      updated: new Date('1/1/16'),
    },
    {
      name: 'Recipes',
      updated: new Date('1/17/16'),
    },
    {
      name: 'Work',
      updated: new Date('1/28/16'),
    },
  ];
  notes: Section[] = [
    {
      name: 'Vacation Itinerary',
      updated: new Date('2/20/16'),
    },
    {
      name: 'Kitchen Remodel',
      updated: new Date('1/18/16'),
    },
  ];
}
