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
  styleUrl: './api.scss'
})
export class Api {
  properties = [
    {
      name: 'fade',
      description: 'Adds smooth opacity to left and right',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'snapToCenter',
      description: 'Enables or disables the automatic snapping of a card to the center of the viewport after dragging ends (if an inertial flick did not occur).',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'snapDebounceTime',
      description: 'The delay in milliseconds after the mouse button is released before starting the snapping animation (to the nearest or next card) or the "rubber band" return animation.',
      type: 'number',
      default: '50'
    },
    {
      name: 'snapDuration',
      description: 'The duration in milliseconds for all animations performed by the component: snapping to a card and the "rubber band" return.',
      type: 'number',
      default: '300'
    },
    {
      name: 'resistanceFactor',
      description: 'Adjusts the "feel" and amount of visual displacement when attempting to pull content past the edge positions.',
      type: 'number',
      default: '0.5'
    },
    {
      name: 'velocityThreshold',
      description: 'The threshold velocity (in pixels per millisecond) of the mouse movement at the moment the button is released. If the velocity exceeds this threshold, the carousel will switch to the next card in the direction of movement (inertial flick) instead of the nearest one to the center.',
      type: 'number',
      default: '0.5'
    },
    {
      name: 'visibilityDebounceTime',
      description: 'The delay in milliseconds after the last scroll event (not caused by dragging) before updating the visibility CSS classes (is-in-view, is-spanned) on the cards.',
      type: 'number',
      default: '100'
    }
  ];
  events = [
    {
      name: 'indexChange',
      description: 'An event that fires and emits the 0-based index of the card that has become active (closest to the center).',
      type: 'number'
    }
  ];
  carouselNextProperties = [
    {
      name: 'carousel',
      description: 'Сarousel instance if the control is external',
      type: 'Carousel',
      default: '–'
    }
  ];
  carouselPreviousProperties = [
    {
      name: 'carousel',
      description: 'Сarousel instance if the control is external',
      type: 'Carousel',
      default: '–'
    }
  ];
}
