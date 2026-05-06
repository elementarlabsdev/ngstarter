import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef, HeaderRow,
  HeaderRowDef, Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-api',
  imports: [
    Table,
    HeaderCellDef,
    HeaderCell,
    Cell,
    CellDef,
    ColumnDef,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row
  ],
  templateUrl: './api.html',
})
export class Api {
  directives = [
    {
      name: 'ngsImageViewer',
      description: 'Directive that tracks clicks on images inside and opens a modal window for viewing.'
    },
    {
      name: 'ngsImageViewerPicture',
      description: 'Directive that adds an image and customizes the source image that will be displayed in the modal window.'
    },
    {
      name: 'ngsImageViewerPictureTitle',
      description: 'Directive that adds a title to an image modal.'
    },
    {
      name: 'ngsImageViewerPictureCaption',
      description: 'Directive that adds a caption to an image modal.'
    },
    {
      name: 'ngsImageViewerPictureDescription',
      description: 'Directive that adds a description to an image modal.'
    }
  ];

  properties = [
    {
      name: 'sourceUrl',
      type: 'string',
      description: 'URL of the image to display',
      required: true
    },
    {
      name: 'title',
      type: 'string',
      description: 'Title of the image'
    },
    {
      name: 'caption',
      type: 'string',
      description: 'Caption of the image'
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description of the image'
    },
    {
      name: 'titleTplRef',
      type: 'TemplateRef<any>',
      description: 'Custom template for the title'
    },
    {
      name: 'captionTplRef',
      type: 'TemplateRef<any>',
      description: 'Custom template for the caption'
    },
    {
      name: 'descriptionTplRef',
      type: 'TemplateRef<any>',
      description: 'Custom template for the description'
    }
  ];
}
