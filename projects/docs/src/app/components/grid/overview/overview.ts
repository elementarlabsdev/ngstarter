import { Component, signal } from '@angular/core';
import { Grid, GridItemConfig, GridItem } from '@ngstarter/components/grid';
import { Page } from '@meta/page/page';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Grid,
    Page,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
  configs = signal<GridItemConfig[]>([
    {
      type: 'example-content',
      component: () =>
        import('../_widgets/example-widget/example-widget')
          .then(c => c.ExampleWidget)
    },
  ]);
  items = signal<GridItem[]>([
    {
      id: crypto.randomUUID(),
      type: 'example-content',
      columns: 4,
      height: '200px',
      content: {
        name: 'Example GridItemAware',
      }
    },
    {
      id: crypto.randomUUID(),
      type: 'example-content',
      columns: 4,
      height: '200px',
      content: {
        name: 'Example GridItemAware 2',
      }
    },
    {
      id: crypto.randomUUID(),
      type: 'example-content',
      columns: 4,
      height: '200px',
      content: {
        name: 'Example GridItemAware 3',
      }
    },
    {
      id: crypto.randomUUID(),
      columns: 8,
      children: [
        {
          id: crypto.randomUUID(),
          type: 'example-content',
          columns: 12,
          height: '300px',
          content: {
            name: 'Example GridItemAware 6',
          }
        },
        {
          id: crypto.randomUUID(),
          type: 'example-content',
          columns: 6,
          height: '178px',
          content: {
            name: 'Example GridItemAware 5',
          }
        },
        {
          id: crypto.randomUUID(),
          type: 'example-content',
          columns: 6,
          height: '178px',
          content: {
            name: 'Example GridItemAware 6',
          }
        },
        {
          id: crypto.randomUUID(),
          type: 'example-content',
          columns: 6,
          height: '100px',
          content: {
            name: 'Example GridItemAware 6',
          }
        },
        {
          id: crypto.randomUUID(),
          type: 'example-content',
          columns: 6,
          height: '100px',
          content: {
            name: 'Example GridItemAware 6',
          }
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      columns: 4,
      children: [
        {
          id: crypto.randomUUID(),
          type: 'example-content',
          columns: 12,
          height: '300px',
          content: {
            name: 'Example GridItemAware 2',
          }
        },
        {
          id: crypto.randomUUID(),
          type: 'example-content',
          columns: 12,
          height: '300px',
          content: {
            name: 'Example GridItemAware 3',
          }
        },
      ],
      content: {
        name: 'Example GridItemAware 4',
      }
    },
  ]);
}
