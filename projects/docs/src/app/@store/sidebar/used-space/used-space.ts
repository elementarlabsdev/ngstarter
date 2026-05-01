import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Gauge } from '@ngstarter-ui/components/gauge';

@Component({
  selector: 'ngs-used-space',
  imports: [
    Gauge,
    Icon
  ],
  templateUrl: './used-space.html',
  styleUrl: './used-space.scss'
})
export class UsedSpace {

}
