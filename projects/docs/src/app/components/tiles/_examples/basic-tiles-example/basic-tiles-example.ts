import { Component, signal } from '@angular/core';

import { Tiles, Tile, TileHandleDirective } from '@ngstarter/components/tiles';

@Component({
  selector: 'app-basic-tiles-example',
  standalone: true,
  imports: [Tiles, Tile, TileHandleDirective],
  templateUrl: './basic-tiles-example.html',
  styleUrl: './basic-tiles-example.scss',
})
export class BasicTilesExample {
  items = signal([
    {id: 1, w: 4, h: 3, wMd: 12, wLg: 6, content: 'Item 1'},
    {id: 2, w: 4, h: 3, wMd: 12, wLg: 6, content: 'Item 2'},
    {id: 3, w: 8, h: 3, wMd: 6, wLg: 12, content: 'Item 3'},
    {id: 4, w: 4, h: 3, wMd: 6, wLg: 6, content: 'Item 4'},
    {id: 5, w: 12, h: 3, wMd: 6, wLg: 8, content: 'Item 5'},
    {id: 6, w: 4, h: 3, wMd: 6, wLg: 6, content: 'Item 6'},
    {id: 7, w: 8, h: 5, wMd: 6, wLg: 8, content: 'rick'},
    {id: 8, w: 4, h: 3, wMd: 6, wLg: 6, content: 'Item 8'},
    {id: 9, w: 4, h: 3, wMd: 6, wLg: 6, content: 'Item 9'},
  ]);

  onOrderChange(newOrder: Map<number, number>) {
    console.log('order change', newOrder);
  }

  onOrderChanged(newItems: any[]) {
    console.log('order changed', newItems);
    this.items.set(newItems);
  }

  onLayoutChanged(newItems: any[]) {
    console.log('layout changed', newItems);
  }

  removeItem(id: number) {
    this.items.update(items => items.filter(item => item.id !== id));
  }

  trackById(index: number, item: {id: number}): number {
    return item.id;
  }
}
