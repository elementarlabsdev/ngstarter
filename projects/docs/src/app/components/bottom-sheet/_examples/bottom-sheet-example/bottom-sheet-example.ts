import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { List, ListItem, ListItemLine, ListItemTitle } from '@ngstarter-ui/components/list';
import { BottomSheetRef } from '@ngstarter-ui/components/bottom-sheet';

@Component({
  selector: 'app-bottom-sheet-example',
  imports: [
    ListItemTitle,
    ListItem,
    ListItemLine,
    List
  ],
  templateUrl: './bottom-sheet-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './bottom-sheet-example.scss'
})
export class BottomSheetExample {
  private bottomSheetRef = inject(BottomSheetRef<BottomSheetExample>);

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
