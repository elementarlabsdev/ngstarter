import { Component, inject } from '@angular/core';
import { INCIDENTS } from '../properties';
import { Incidents } from '../incidents/incidents';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-incidents-bar',
  exportAs: 'ngsIncidentsBar',
  imports: [

    Button
  ],
  templateUrl: './incidents-bar.html',
  styleUrl: './incidents-bar.scss',
  host: {
    'class': 'ngs-incidents-bar',
    '(click)': '_handleClick($event)'
  }
})
export class IncidentsBar {
  private _parent = inject<Incidents>(INCIDENTS, { optional: true });

  _handleClick(_event?: Event) {
    this._parent?.toggleVisibility();
  }
}
