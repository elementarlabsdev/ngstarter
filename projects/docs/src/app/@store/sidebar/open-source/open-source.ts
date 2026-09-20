import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-sidebar-open-source',
  imports: [
    Button
  ],
  templateUrl: './open-source.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './open-source.scss'
})
export class OpenSource {

}
