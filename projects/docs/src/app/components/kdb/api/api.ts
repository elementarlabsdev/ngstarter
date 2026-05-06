import { Component } from '@angular/core';
import { ApiPage, ApiTable, ApiTd, ApiTh, ApiTr } from '@meta/api-table';

@Component({
  imports: [
    ApiPage,
    ApiTable,
    ApiTh,
    ApiTr,
    ApiTd
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss'
})
export class Api {

}
