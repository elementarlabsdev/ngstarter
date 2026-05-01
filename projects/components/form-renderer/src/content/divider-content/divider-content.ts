import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Divider } from '@ngstarter/components/divider';

@Component({
  selector: 'ngs-divider-content',
  exportAs: 'ngsDividerContent',
  imports: [
    Divider
  ],
  templateUrl: './divider-content.html',
  styleUrl: './divider-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerContent {

}
