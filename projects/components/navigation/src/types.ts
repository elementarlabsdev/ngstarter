import { InjectionToken } from '@angular/core';

export interface NavigationItemData {
  key: any;
  type: 'heading' | 'group' | 'link' | 'item' | 'divider' | string;
  name?: string;
  icon?: string;
  children?: NavigationItemData[];
  link?: string;
  [prop: string]: any;
  badge?: string | number;
}

export const NAVIGATION = new InjectionToken('NAVIGATION');
export const NAVIGATION_GROUP = new InjectionToken('NAVIGATION_GROUP');
