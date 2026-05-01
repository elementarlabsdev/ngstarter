import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Gauge } from '@ngstarter/components/gauge';

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
