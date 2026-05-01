import { Component, inject, input, OnInit } from '@angular/core';
import { GRID } from '@ngstarter/components/grid';

@Component({
  selector: 'ngs-bank-account-card',
  imports: [],
  templateUrl: './bank-account-card.html',
  styleUrl: './bank-account-card.scss'
})
export class BankAccountCard implements OnInit {
  private _grid = inject<any>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
