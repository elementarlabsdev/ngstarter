import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  Card,
  CardActions, CardAside,
  CardContent,
  CardFooter,
  CardHeader,
  CardSubtitle,
  CardTitle
} from '@ngstarter-ui/components/card';
import { Divider } from '@ngstarter-ui/components/divider';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-card-footer-loading-example',
  imports: [
    Button,
    CardActions,
    CardFooter,
    CardContent,
    CardTitle,
    CardSubtitle,
    CardHeader,
    Card,
    Divider,
    ProgressBar,
    CardAside,
    Icon,
  ],
  templateUrl: './card-footer-loading-example.html',
  styleUrl: './card-footer-loading-example.scss'
})
export class CardFooterLoadingExample {
  longText = `The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog
  from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was
  originally bred for hunting.`;
}
