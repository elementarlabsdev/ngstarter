import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip } from '@ngstarter/components/tooltip';
import { Divider } from '@ngstarter/components/divider';
import { Dicebear } from '@ngstarter/components/avatar';
import { Button } from '@ngstarter/components/button';
import { Badge } from '@ngstarter/components/badge';

@Component({
  selector: 'ngs-sidebar-toolbar',
  imports: [
    Icon,
    Tooltip,
    Dicebear,
    Divider,
    Button,
    Badge
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar {
  subscription = 'Free';
  email = 'elementarlabs@gmail.com';
  name = 'Pavel Salauyou';
}
