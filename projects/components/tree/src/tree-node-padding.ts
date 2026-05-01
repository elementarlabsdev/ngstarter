import { CdkTreeNodePadding } from '@angular/cdk/tree';
import { Directive, effect, input, numberAttribute } from '@angular/core';

@Directive({
  selector: '[ngsTreeNodePadding]',
  providers: [{ provide: CdkTreeNodePadding, useExisting: TreeNodePadding }],
  standalone: true
})
export class TreeNodePadding<T, K = T> extends CdkTreeNodePadding<T, K> {
  levelInput = input<number, any>(0, {
    alias: 'ngsTreeNodePadding',
    transform: numberAttribute
  });

  indentInput = input<number | string>(40, {
    alias: 'ngsTreeNodePaddingIndent'
  });

  constructor() {
    super();
    effect(() => {
      this.level = this.levelInput();
    });
    effect(() => {
      this._setIndentInput(this.indentInput());
    });
  }
}
