import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-select-api',
  standalone: true,
  imports: [NativeTable],
  templateUrl: './api.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './api.scss',
})
export class Api {

}
