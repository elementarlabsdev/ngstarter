import { Component } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Chip, ChipSet } from '@ngstarter/components/chips';

export interface Vegetable {
  name: string;
}

@Component({
  selector: 'app-chips-drag-and-drop-example',
  imports: [
    CdkDropList,
    CdkDrag,
    Chip,
    ChipSet
  ],
  templateUrl: './chips-drag-and-drop-example.html',
  styleUrl: './chips-drag-and-drop-example.scss'
})
export class ChipsDragAndDropExample {
  vegetables: Vegetable[] = [
    { name: 'apple' },
    { name: 'banana' },
    { name: 'strawberry' },
    { name: 'orange' },
    { name: 'kiwi' },
    { name: 'cherry' },
  ];

  drop(event: CdkDragDrop<Vegetable[]>) {
    moveItemInArray(this.vegetables, event.previousIndex, event.currentIndex);
  }
}
