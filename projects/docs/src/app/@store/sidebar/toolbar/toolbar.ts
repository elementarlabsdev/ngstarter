import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Divider } from '@ngstarter-ui/components/divider';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';
import { Badge } from '@ngstarter-ui/components/badge';

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
