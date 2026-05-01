import { HttpClient } from '@angular/common/http';
import { ImageDesignerPhoto, PhotosDataSource, PhotosGetRowsParams, PicsumImage } from './types';
import { map } from 'rxjs';

export function createDefaultPhotosDataSource(http: HttpClient): PhotosDataSource {
  return {
    getItems: (params: PhotosGetRowsParams) => {
      const url = `https://picsum.photos/v2/list?page=${params.page}&limit=${params.pageSize}`;
      http.get<PicsumImage[]>(url).pipe(
        map(images => images.map(img => ({
          id: img.id,
          name: img.author,
          width: img.width,
          height: img.height,
          url: img.download_url,
          thumbUrl: `https://picsum.photos/id/${img.id}/${img.width > img.height ? 400 : Math.round(400 * (img.width / img.height))}/${img.height > img.width ? 400 : Math.round(400 * (img.height / img.width))}`
        } as ImageDesignerPhoto)))
      ).subscribe({
        next: (data) => params.successCallback(data),
        error: () => params.failCallback()
      });
    }
  };
}
