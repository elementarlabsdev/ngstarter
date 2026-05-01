import {
  Component
} from '@angular/core';
import { INCIDENTS } from '../properties';

@Component({
  selector: 'ngs-incidents',
  exportAs: 'ngsIncidents',
  templateUrl: './incidents.html',
  styleUrl: './incidents.scss',
  providers: [
    {
      provide: INCIDENTS,
      useExisting: Incidents
    }
  ],
  host: {
    'class': 'ngs-incidents',
    '[class.is-visible]': 'isVisible',
  }
})
export class Incidents {
  isVisible = false;

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }
}
