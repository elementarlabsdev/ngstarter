import { Component, signal } from '@angular/core';
import { AssetsDataSource, ImageDesigner, ImageDesignerPhoto, ImageDesignerUploadFn, ImageDesignerSnapshot } from '@ngstarter-ui/image-designer';

@Component({
  imports: [
    ImageDesigner
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  snapshot = signal<ImageDesignerSnapshot>({
    "version": 1,
    "layers": [
      {
        "x": 0,
        "y": 0,
        "id": "o62lmn7x3",
        "data": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect x=\"15\" y=\"15\" width=\"70\" height=\"70\" fill=\"none\" stroke=\"%2364748b\" stroke-width=\"8\"/></svg>",
        "fill": "#64748b",
        "name": "square-outline",
        "type": "shape",
        "width": 100,
        "height": 100
      }
    ],
    "imageSize": {
      "width": 700,
      "height": 400
    },
    "background": "white"
  });
  assets = signal<ImageDesignerPhoto[]>([
    {
      id: '1',
      name: 'Image 1',
      url: 'https://picsum.photos/seed/1/1800/1600',
      width: 1800,
      height: 1600
    },
    {
      id: '2',
      name: 'Image 2',
      url: 'https://picsum.photos/seed/2/600/800',
      width: 600,
      height: 800
    },
    {
      id: '3',
      name: 'Image 3',
      url: 'https://picsum.photos/seed/3/800/800',
      width: 800,
      height: 800
    },
    {
      id: '4',
      name: 'Image 4',
      url: 'https://picsum.photos/seed/4/400/700',
      width: 400,
      height: 700
    }
  ]);

  assetsDataSource: AssetsDataSource = {
    getItems: (params) => {
      params.successCallback(this.assets());
    }
  };

  uploadFn: ImageDesignerUploadFn = (file: File): Promise<ImageDesignerPhoto> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const isLandscape = Math.random() > 0.5;
        const width = isLandscape ? 800 : 600;
        const height = isLandscape ? 600 : 800;

        resolve({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          url: `https://picsum.photos/seed/${Math.random()}/${width}/${height}`,
          width,
          height
        });
      }, 1000);
    });
  }
}
