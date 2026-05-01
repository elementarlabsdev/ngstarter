import { Component, input, OnInit } from '@angular/core';
import { GridItemAware } from '@ngstarter-ui/components/grid';

@Component({
  selector: 'app-example-content',
  imports: [],
  templateUrl: './example-widget.html',
  styleUrl: './example-widget.scss'
})
export class ExampleWidget implements GridItemAware, OnInit {
  // private _dashboard = inject<Dashboard>(DASHBOARD, { optional: true });

  readonly id = input.required<any>();
  readonly content = input.required<any>();

  ngOnInit() {
    // if (this._dashboard) {
    //   this._dashboard.markItemAsLoaded(this.id());
    // }
  }
}
