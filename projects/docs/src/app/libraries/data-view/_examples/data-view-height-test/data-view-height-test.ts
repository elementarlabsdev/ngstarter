import { Component } from '@angular/core';
import { DataViewColumnDef, DataView } from '@ngstarter-ui/components/data-view';

@Component({
  selector: 'app-data-view-height-test',
  standalone: true,
  imports: [DataView],
  template: `
    <div style="height: 400px; border: 2px solid red; padding: 10px; display: flex; flex-direction: column;">
      <h3>400px container, data with 2 rows</h3>
      <ngs-data-view
        [columnDefs]="columnDefs"
        [data]="data"
        class="border border-border rounded-xl overflow-hidden"
      />
      <div style="background: #eee; padding: 10px; margin-top: 10px;">
        This block should be directly below the table if the empty space has been removed.
      </div>
    </div>
  `
})
export class DataViewHeightTest {
  columnDefs: DataViewColumnDef[] = [
    { field: 'id', name: 'ID', width: '50px', visible: true },
    { field: 'name', name: 'Name', width: '200px', visible: true }
  ];

  data = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ];
}
