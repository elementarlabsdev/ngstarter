import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  ViewEncapsulation,
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
  template: `<ng-container ngsTreeNodeOutlet />`,
  host: {
    'class': 'ngs-tree',
  },
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{ provide: CdkTree, useExisting: Tree }],
  imports: [TreeNodeOutlet],
  styleUrl: './tree.scss',
  standalone: true
})
export class Tree<T, K = T> extends CdkTree<T, K> {
  // Outlets within the tree's template where the dataNodes will be inserted.
  // We need an initializer here to avoid a TS error. The value will be set in `ngAfterViewInit`.
  override readonly _nodeOutlet = viewChild(TreeNodeOutlet) as any;
}
