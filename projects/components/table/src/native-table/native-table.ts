import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'table[ngs-native-table]',
  exportAs: 'ngsNativeTable',
  imports: [],
  templateUrl: './native-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './native-table.scss',
})
export class NativeTable {

}
