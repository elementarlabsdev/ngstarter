import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicCardExample } from '../_examples/basic-card-example/basic-card-example';
import { CardActionsExample } from '../_examples/card-actions-example/card-actions-example';
import {
  CardMultipleSectionsExample
} from '../_examples/card-multiple-sections-example/card-multiple-sections-example';
import {
  CardFooterLoadingExample
} from '../_examples/card-footer-loading-example/card-footer-loading-example';
import { CardAppearanceExample } from '../_examples/card-appearance-example/card-appearance-example';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    Playground,
    BasicCardExample,
    CardActionsExample,
    CardMultipleSectionsExample,
    CardFooterLoadingExample,
    CardAppearanceExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
