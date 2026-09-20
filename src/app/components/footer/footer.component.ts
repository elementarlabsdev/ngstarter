import {Component, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './footer.component.html'
})
export class FooterComponent {
}
