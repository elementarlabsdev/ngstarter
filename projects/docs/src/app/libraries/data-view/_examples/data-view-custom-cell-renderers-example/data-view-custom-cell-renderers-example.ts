import { Component, inject, OnInit } from '@angular/core';
import {
  cellRenderer,
  DataViewColumnDef,
  DataView, DataViewCellRendererDef
} from '@ngstarter-ui/components/data-view';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface User {
  id: string | number;
  username: string;
  name: string;
  email: string;
  enabled: boolean | null;
  website: string;
  avatarUrl: string;
  createdAt: string;
}

@Component({
  selector: 'app-data-view-custom-cell-renderers-example',
  imports: [
    DataView,
    FormsModule
  ],
  templateUrl: './data-view-custom-cell-renderers-example.html',
  styleUrl: './data-view-custom-cell-renderers-example.scss'
})
export class DataViewCustomCellRenderersExample implements OnInit {
  private _httpClient = inject(HttpClient);

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Id',
      field: 'id',
      visible: false
    },
    {
      name: 'User',
      field: 'id',
      cellRenderer: 'user',
      visible: true,
      width: '300px',
      valueGetter: value => {
        return value.name;
      }
    },
    {
      name: 'Enabled',
      field: 'enabled',
      cellRenderer: 'enabled',
      visible: true
    },
    {
      name: 'Created At',
      field: 'createdAt',
      cellRenderer: 'date',
      visible: true
    },
    {
      name: 'Website',
      field: 'website',
      cellRenderer: 'link',
      visible: true
    }
  ];
  data: User[] = [
    {
      id: 1,
      username: 'johndoe',
      name: 'John Doe',
      email: 'john@example.com',
      enabled: true,
      website: 'johndoe.com',
      avatarUrl: '',
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      username: 'janedoe',
      name: 'Jane Doe',
      email: 'jane@example.com',
      enabled: false,
      website: 'janedoe.com',
      avatarUrl: '',
      createdAt: '2024-02-14T12:30:00Z'
    },
    {
      id: 3,
      username: 'admin',
      name: 'System Admin',
      email: 'admin@example.com',
      enabled: null,
      website: 'admin.org',
      avatarUrl: '',
      createdAt: '2023-12-25T08:00:00Z'
    }
  ]
  cellRenderers: DataViewCellRendererDef[] = [
    cellRenderer('user', () => import('../../_prebuilt-renderers/user-cell/user-cell.renderer').then(c => c.UserCellRenderer)),
    cellRenderer('date', () => import('../../_prebuilt-renderers/date-cell/date-cell.renderer').then(c => c.DateCellRenderer)),
    cellRenderer('enabled', () => import('../../_prebuilt-renderers/enabled-cell/enabled-cell.renderer').then(c => c.EnabledCellRenderer)),
    cellRenderer('link', () => import('../../_prebuilt-renderers/link-cell/link-cell.renderer').then(c => c.LinkCellRenderer)),
  ];

  ngOnInit() {
  }
}
