import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BottomSheetExample } from '../bottom-sheet-example/bottom-sheet-example';
import { BottomSheet } from '@ngstarter-ui/components/bottom-sheet';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-bottom-sheet-example',
  imports: [
    Button
  ],
  templateUrl: './basic-bottom-sheet-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-bottom-sheet-example.scss'
})
export class BasicBottomSheetExample {
  private bottomSheet = inject(BottomSheet);

  openBottomSheet(): void {
    this.bottomSheet.open(BottomSheetExample);
  }
}
