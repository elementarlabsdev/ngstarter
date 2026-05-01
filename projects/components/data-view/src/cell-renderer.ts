import { DataViewCellRendererDef } from './types';

export function cellRenderer<T>(cellRenderer: string, component: any): DataViewCellRendererDef {
  return {
    cellRenderer,
    component
  }
}
