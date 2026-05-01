import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  FilterBuilder,
  FilterBuilderFieldDef,
  FilterBuilderGroup
} from '@ngstarter/components/filter-builder';

@Component({
  selector: 'app-basic-filter-builder-example',
  imports: [
    JsonPipe,
    FilterBuilder
  ],
  templateUrl: './basic-filter-builder-example.html',
  styleUrl: './basic-filter-builder-example.scss'
})
export class BasicFilterBuilderExample {
  value: FilterBuilderGroup[] = [
    {
      logicalOperator: 'or',
      value: [
        {
          logicalOperator: 'and',
          value: [
            // {
            //   value: ['category', 'equals', 'televisions']
            // },
            {
              value: ['price', 'isBetween', [2000, 4000]]
            }
          ]
        }
      ]
    }
  ];
  fieldDefs: FilterBuilderFieldDef[] = [
    {
      name: 'Name',
      dataType: 'string',
      dataField: 'name'
    },
    {
      name: 'Price',
      format: 'currency',
      dataType: 'number',
      dataField: 'price'
    },
    {
      dataType: 'array',
      dataField: 'category',
      name: 'Category',
      lookup: {
        dataSource: [
          {
            id: 'video-players',
            name: 'Video Players'
          },
          {
            id: 'televisions',
            name: 'Televisions'
          },
          {
            id: 'monitors',
            name: 'Monitors'
          },
          {
            id: 'projectors',
            name: 'Projectors'
          },
          {
            id: 'automation',
            name: 'Automation'
          },
        ],
      },
    },
  ];
}
