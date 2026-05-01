import { SplitPane } from './split-pane';

export interface SplitPoint {
  x: number;
  y: number;
}

export interface SplitArea {
  component: SplitPane;
  order: number;
  size: number | null;
  minSize: number | null;
  maxSize: number | null;
}

// CREATED ON DRAG START

export interface SplitSnapshot {
  gutterNum: number;
  allAreasSizePixel: number;
  allInvolvedAreasSizePercent: number;
  lastSteppedOffset: number;
  areasBeforeGutter: SplitAreaSnapshot[];
  areasAfterGutter: SplitAreaSnapshot[];
}

export interface SplitAreaSnapshot {
  area: SplitArea;
  sizePixelAtStart: number;
  sizePercentAtStart: number;
}

// CREATED ON DRAG PROGRESS

export interface SplitSideAbsorptionCapacity {
  remain: number;
  list: SplitAreaAbsorptionCapacity[];
}

export interface SplitAreaAbsorptionCapacity {
  areaSnapshot: SplitAreaSnapshot;
  pixelAbsorb: number;
  percentAfterAbsorption: number;
  pixelRemain: number;
}

// CREATED TO SEND OUTSIDE

export interface SplitOutputData {
  gutterNum: number;
  sizes: SplitOutputAreaSizes;
}

export type SplitOutputAreaSizes = (number | '*')[];

export interface SplitDefaultOptions {
  dir?: 'ltr' | 'rtl';
  direction?: 'horizontal' | 'vertical';
  unit?: 'percent' | 'pixel';
  gutterDblClickDuration?: number;
  gutterSize?: number;
  gutterStep?: number;
  restrictMove?: boolean;
  useTransition?: boolean;
}
