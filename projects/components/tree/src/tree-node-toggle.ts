import { CdkTreeNodeToggle } from '@angular/cdk/tree';
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[ngsTreeNodeToggle]',
  providers: [{ provide: CdkTreeNodeToggle, useExisting: TreeNodeToggle }],
  inputs: [{ name: 'recursive', alias: 'ngsTreeNodeToggleRecursive' }],
  standalone: true
})
export class TreeNodeToggle<T, K = T> extends CdkTreeNodeToggle<T, K> {
}
