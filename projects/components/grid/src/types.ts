import { InjectionToken, InputSignal } from '@angular/core';

export interface GridItemAware {
  id: InputSignal<any>;
  content?: InputSignal<any>;
}

export interface GridItemConfig {
  type: string;
  skeleton?: any;
  plain?: boolean;
  component: () => Promise<any>;
}

export interface GridItem {
  id: any;
  type?: string;
  columns: number;
  children?: GridItem[];
  skeletonHeight?: string;
  height?: string;
  content?: any; // content data or nothing
}

export const GRID = new InjectionToken('GRID');
