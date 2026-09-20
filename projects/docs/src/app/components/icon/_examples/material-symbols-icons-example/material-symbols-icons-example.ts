import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-material-symbols-icons-example',
  imports: [
    Icon
  ],
  templateUrl: './material-symbols-icons-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './material-symbols-icons-example.scss'
})
export class SymbolsIconsExample {

}
