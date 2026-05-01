import { Observable } from 'rxjs';

export interface PhotosGetRowsParams {
  startRow: number;
  endRow: number;
  page: number;
  pageSize: number;
  filterModel: string;
  successCallback(rowsThisBlock: any[], lastRow?: number): void;
  failCallback(): void;
}

export interface PhotosDataSource {
  getItems(params: PhotosGetRowsParams): void;
}

export interface AssetsGetRowsParams {
  startRow: number;
  endRow: number;
  page: number;
  pageSize: number;
  filterModel: string;
  successCallback(rowsThisBlock: any[], lastRow?: number): void;
  failCallback(): void;
}

export interface AssetsDataSource {
  getItems(params: AssetsGetRowsParams): void;
}

export interface ImageDesignerPhoto {
  id: string;
  name?: string;
  width: number;
  height: number;
  url: string;
  thumbUrl?: string;
}

export interface PicsumImage {
  id: string;
  author?: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export interface ImageSize {
  width: number;
  height: number;
}

export interface ImagePreset {
  name: string;
  width: number;
  height: number;
  icon: string;
}

export interface ImagePresetCategory {
  name: string;
  icon: string;
  presets: ImagePreset[];
}

export interface GradientConfig {
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  colorStops: (string | number)[];
}

export interface LayerConfig {
  id?: string;
  type: 'text' | 'image' | 'shape' | 'pattern';
  name?: string;
  visible?: boolean;
  locked?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  text?: string;
  patternImage?: HTMLImageElement | string;
  [key: string]: any;
}

export interface ElementConfig {
  name: string;
  data: string;
}

export interface ImageDesignerSnapshot {
  version?: number;
  imageSize: ImageSize;
  layers: LayerConfig[];
  background: string | any;
  backgroundConfig?: GradientConfig;
}

export type ImageDesignerUploadFn = (
  file: File
) => string | ImageDesignerPhoto | Promise<string | ImageDesignerPhoto> | Observable<string | ImageDesignerPhoto>;
