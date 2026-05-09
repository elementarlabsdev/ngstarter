import {Component} from '@angular/core';
import {RouterLink} from "@angular/router";
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
    Icon,
  ],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
}
