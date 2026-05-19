import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  Card,
  CardAside,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@ngstarter-ui/components/card';
import {Chip, ChipShape} from '@ngstarter-ui/components/chips';
import { GridItemAware } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';
import { List, ListItem, ListItemIcon, ListItemLine, ListItemMeta, ListItemTitle } from '@ngstarter-ui/components/list';
import { MchartBar } from '@ngstarter-ui/components/micro-chart';
import { Button } from '@ngstarter-ui/components/button';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import {
  Timeline,
  TimelineDescription,
  TimelineItem,
  TimelineItemIndicatorDirective,
  TimelineTitle,
} from '@ngstarter-ui/components/timeline';
import { SalesPipelineChart } from './sales-pipeline-chart/sales-pipeline-chart';

@Component({
  selector: 'app-corporate-dashboard-widget',
  imports: [
    Button,
    Card,
    CardAside,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Chip,
    Icon,
    List,
    ListItem,
    ListItemIcon,
    ListItemLine,
    ListItemMeta,
    ListItemTitle,
    MchartBar,
    ProgressBar,
    SalesPipelineChart,
    Timeline,
    TimelineDescription,
    TimelineItem,
    TimelineItemIndicatorDirective,
    TimelineTitle,
    ChipShape,
  ],
  templateUrl: './corporate-dashboard-widget.html',
  styleUrl: './corporate-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateDashboardWidget implements GridItemAware {
  readonly id = input.required<string>();
  readonly content = input.required<any>();
}
