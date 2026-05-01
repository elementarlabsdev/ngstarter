import { Component } from '@angular/core';
import {Dicebear} from "@ngstarter-ui/components/avatar";
import {Icon} from "@ngstarter-ui/components/icon";
import {KanbanBoard, KanbanColumn, KanbanItemDefDirective} from "@ngstarter-ui/components/kanban-board";

@Component({
  selector: 'app-basic-example',
  imports: [
    Dicebear,
    Icon,
    KanbanBoard,
    KanbanItemDefDirective
  ],
  templateUrl: './basic-example.html',
  styleUrl: './basic-example.scss',
})
export class BasicExample {
  columns: KanbanColumn<any>[] = [
    {
      id: 1,
      name: 'To Do',
      color: '#06b6d4',
      items: [
        {
          name: 'HINT: Check Dark Theme',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        }
      ]
    },
    {
      id: 2,
      name: 'In Progress',
      color: '#a855f7',
      items: [
        {
          name: 'Urgent Issue',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        }
      ]
    },
    {
      id: 3,
      name: 'Under Review',
      color: '#eab308',
      items: [
        {
          name: 'References research',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        },
        {
          name: 'Fix UI bug',
          position: 1,
          reporter: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          assignee: {
            id: 1,
            name: 'Pavel Salauyou'
          },
          priority: 'none'
        }
      ]
    },
    {
      id: 4,
      name: 'Done',
      color: '#22c55e',
      items: [
      ]
    },
    {
      id: 5,
      name: 'Custom',
      color: '#2d22c5',
      items: [
      ]
    }
  ];
}
