import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-phosphor-icons-example',
  imports: [
    Icon
  ],
  templateUrl: './phosphor-icons-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './phosphor-icons-example.scss'
})
export class PhosphorIconsExample {

}
