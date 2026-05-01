import {
  booleanAttribute,
  Component,
  forwardRef,
  input,
  OnInit,
  signal
} from '@angular/core';
import {
  GRID, GridItemConfig, GridItem
} from '../types';
import { AsyncPipe, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ngs-grid',
  exportAs: 'ngsGrid',
  imports: [
    NgComponentOutlet,
    AsyncPipe,
    NgTemplateOutlet
  ],
  providers: [
    {
      provide: GRID,
      useExisting: forwardRef(() => Grid),
    }
  ],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
  host: {
    'class': 'ngs-grid'
  }
})
export class Grid implements OnInit {
  protected _skeletonMap = new Map<string, any>();
  protected _componentsMap = new Map<string, any>();

  readonly configs = input<GridItemConfig[]>([]);
  readonly items = input<GridItem[]>([]);
  readonly plain = input(false, {
    transform: booleanAttribute
  });
  readonly waitWhenAllItemsLoaded = input(false, {
    transform: booleanAttribute
  });

  protected _allLoaded = signal(false);
  protected _loadedItemsCount = signal(0);

  ngOnInit() {
    if (this.configs().length === 0) {
      return;
    }

    if (!this.waitWhenAllItemsLoaded()) {
      this._allLoaded.set(true);
    }

    this.configs().forEach(config => {
      this._skeletonMap.set(config.type, config.skeleton);
    });
    this.configs().forEach(async (config, index: number) => {
      this._componentsMap.set(config.type, config.component());
    });
  }

  markItemAsLoaded(id: any) {
    this._loadedItemsCount.set(this._loadedItemsCount() + 1);
    this._allLoaded.set(this._loadedItemsCount() === this.items().length);
  }

  protected getItemConfig(type: string): GridItemConfig {
    return this.configs().find(config => config.type === type) as GridItemConfig;
  }

  protected getSkeletonComponent(type: string): any {
    return this._skeletonMap.get(type);
  }

  protected getItemComponent(type: string) {
    return this._componentsMap.get(type);
  }

  protected getItemInputs(gridItem: GridItem): any {
    return {
      id: gridItem.id,
      content: gridItem.content,
    };
  }
}
