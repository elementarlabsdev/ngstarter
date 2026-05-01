import { CdkTreeNodeDef } from '@angular/cdk/tree';
import { Directive, input } from '@angular/core';

@Directive({
  selector: '[ngsTreeNodeDef]',
  inputs: [{ name: 'when', alias: 'ngsTreeNodeDefWhen' }],
  providers: [{ provide: CdkTreeNodeDef, useExisting: TreeNodeDef }],
  standalone: true
})
export class TreeNodeDef<T> extends CdkTreeNodeDef<T> {
  data = input<T>(undefined!, {
    alias: 'ngsTreeNode'
  });
}
