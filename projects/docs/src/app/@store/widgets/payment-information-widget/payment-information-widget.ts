import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GRID } from '@ngstarter-ui/components/grid';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-payment-information-content',
  imports: [
    RouterLink,
    Button
  ],
  templateUrl: './payment-information-widget.html',
  styleUrl: './payment-information-widget.scss'
})
export class PaymentInformationWidget implements OnInit {
  private _grid = inject<any>(GRID, { optional: true });

  id = input.required<any>();
  content = input();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
