import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-checkbox-group',
  imports: [],
  templateUrl: './checkbox-group.html',
  styleUrl: './checkbox-group.scss',
  host: {
    'class': 'ngs-checkbox-group',
    'role': 'group',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxGroup {

}
