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
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'sourceUrl',
      description: 'The URL of the video source',
      type: 'string',
      default: '–'
    },
    {
      name: 'title',
      description: 'The title of the video',
      type: 'string',
      default: '–'
    },
    {
      name: 'caption',
      description: 'The caption of the video',
      type: 'string',
      default: '–'
    },
    {
      name: 'description',
      description: 'The description of the video',
      type: 'string',
      default: '–'
    },
    {
      name: 'orientation',
      description: 'The orientation of the video player',
      type: 'VideoViewerOrientation',
      default: 'undefined'
    },
    {
      name: 'autoPlay',
      description: 'Whether the video should start playing automatically',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showPlayButton',
      description: 'Whether to show the play/pause button',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'showSpeaker',
      description: 'Whether to show the volume/mute button',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'showFullscreen',
      description: 'Whether to show the fullscreen button',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'showDurationSlider',
      description: 'Whether to show the video progress slider',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'muted',
      description: 'Whether the video is initially muted',
      type: 'boolean',
      default: 'false'
    }
  ];
}
