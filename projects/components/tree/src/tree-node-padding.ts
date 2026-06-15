import { CdkTreeNodePadding } from '@angular/cdk/tree';
import { Directive, effect, inject, input, numberAttribute } from '@angular/core';
import { Tree } from './tree/tree';

@Directive({
  selector: '[ngsTreeNodePadding]',
  providers: [{ provide: CdkTreeNodePadding, useExisting: TreeNodePadding }],
  standalone: true
})
export class TreeNodePadding<T, K = T> extends CdkTreeNodePadding<T, K> {
  private readonly tree = inject<Tree<T, K>>(Tree, { optional: true });

  levelInput = input<number, any>(0, {
    alias: 'ngsTreeNodePadding',
    transform: numberAttribute
  });

  indentInput = input<number | string | undefined>(undefined, {
    alias: 'ngsTreeNodePaddingIndent'
  });

  constructor() {
    super();
    effect(() => {
      this.level = this.levelInput();
    });
    effect(() => {
      this._setIndentInput(this.indentInput() ?? this.tree?.nodePaddingIndent() ?? 48);
    });
  }
}
