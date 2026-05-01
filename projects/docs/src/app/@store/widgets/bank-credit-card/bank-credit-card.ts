import { Component, inject, input, OnInit } from '@angular/core';
import { GRID } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'ngs-bank-credit-card',
  imports: [],
  templateUrl: './bank-credit-card.html',
  styleUrl: './bank-credit-card.scss'
})
export class BankCreditCard implements OnInit {
  private _grid = inject<any>(GRID, { optional: true });

  id = input.required<any>();
  content = input<any>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
