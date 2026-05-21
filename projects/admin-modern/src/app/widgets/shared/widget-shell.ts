import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  Card,
  CardAside,
  CardContent,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from '@ngstarter-ui/components/card';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';

@Component({
  selector: 'app-widget-shell',
  imports: [Button, Card, CardAside, CardContent, CardHeader, CardSubtitle, CardTitle, Icon, Tooltip],
  templateUrl: './widget-shell.html',
  styleUrl: './widget-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetShell {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly calendar = input(false);
  readonly events = input(false);
}
