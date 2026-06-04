import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  ViewContainerRef,
  viewChild
} from '@angular/core';
import { CDK_TREE_NODE_OUTLET_NODE, CdkTree, CdkTreeNodeOutlet } from '@angular/cdk/tree';

@Directive({
  selector: '[ngsTreeNodeOutlet]',
  providers: [
    {
      provide: CdkTreeNodeOutlet,
      useExisting: TreeNodeOutlet,
    },
  ],
  standalone: true
})
export class TreeNodeOutlet implements CdkTreeNodeOutlet {
  viewContainer = inject(ViewContainerRef);
  _node = inject(CDK_TREE_NODE_OUTLET_NODE, { optional: true });
}

@Component({
  selector: 'ngs-tree',
  exportAs: 'ngsTree',
  imports: [
    TreeNodeOutlet
  ],
  template: `<ng-container ngsTreeNodeOutlet />`,
  styleUrl: './tree.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CdkTree, useExisting: Tree }],
  host: {
    'class': 'ngs-tree',
  },
})
export class Tree<T, K = T> extends CdkTree<T, K> {
  // Outlets within the tree's template where the dataNodes will be inserted.
  // We need an initializer here to avoid a TS error. The value will be set in `ngAfterViewInit`.
  override readonly _nodeOutlet = viewChild(TreeNodeOutlet) as any;
}
