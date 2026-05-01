import { Component } from '@angular/core';
import { NativeTable } from '@ngstarter/components/table';

@Component({
  selector: 'app-static-table-example',
  standalone: true,
  imports: [
    NativeTable
  ],
  templateUrl: './static-table-example.html',
  styleUrl: './static-table-example.scss'
})
export class StaticTableExample { }
