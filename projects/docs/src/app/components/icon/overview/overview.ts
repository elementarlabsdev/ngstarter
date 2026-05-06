import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { CircleFlagsExample } from '../_examples/circle-flags-example/circle-flags-example';
import {
  SymbolsIconsExample
} from '../_examples/material-symbols-icons-example/material-symbols-icons-example';
import { PhosphorIconsExample } from '../_examples/phosphor-icons-example/phosphor-icons-example';

@Component({
  imports: [
    Playground,
    CircleFlagsExample,
    SymbolsIconsExample,
    PhosphorIconsExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
