import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  input,
  signal,
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
  checkable = input(false, {
    transform: booleanAttribute
  });

  readonly _checkStateVersion = signal(0);
  private _checkedKeys = new Set<unknown>();

  // Outlets within the tree's template where the dataNodes will be inserted.
  // We need an initializer here to avoid a TS error. The value will be set in `ngAfterViewInit`.
  override readonly _nodeOutlet = viewChild(TreeNodeOutlet) as any;

  _toggleNodeChecked(node: T, checked: boolean) {
    const nodes = [node, ...this._getCheckableDescendants(node)];
    for (const item of nodes) {
      const key = this._getCheckableNodeKey(item);
      if (checked) {
        this._checkedKeys.add(key);
      } else {
        this._checkedKeys.delete(key);
      }
    }
    this._checkStateVersion.update(value => value + 1);
  }

  _isNodeChecked(node: T): boolean {
    const descendants = this._getCheckableDescendants(node);
    if (!descendants.length) {
      return this._checkedKeys.has(this._getCheckableNodeKey(node));
    }

    return descendants.every(item => this._checkedKeys.has(this._getCheckableNodeKey(item)));
  }

  _isNodeIndeterminate(node: T): boolean {
    const descendants = this._getCheckableDescendants(node);
    if (!descendants.length) {
      return false;
    }

    const selectedCount = descendants.filter(item => this._checkedKeys.has(this._getCheckableNodeKey(item))).length;
    return selectedCount > 0 && selectedCount < descendants.length;
  }

  private _getCheckableDescendants(node: T): T[] {
    const treeControl = this.treeControl as {
      dataNodes?: T[];
      getDescendants?: (node: T) => T[];
      getLevel?: (node: T) => number;
    } | undefined;
    const flatNodes = treeControl?.dataNodes?.length
      ? treeControl.dataNodes
      : ((this as any)._keyManagerNodes?.value ?? (this as any)._flattenedNodes?.value ?? []) as T[];

    if (flatNodes.length && treeControl?.getLevel) {
      const nodeKey = this._getCheckableNodeKey(node);
      const startIndex = flatNodes.findIndex(item => (
        item === node || this._getCheckableNodeKey(item) === nodeKey
      ));

      if (startIndex > -1) {
        const descendants: T[] = [];
        const level = treeControl.getLevel(flatNodes[startIndex]);
        for (
          let i = startIndex + 1;
          i < flatNodes.length && treeControl.getLevel(flatNodes[i]) > level;
          i++
        ) {
          descendants.push(flatNodes[i]);
        }
        return descendants;
      }
    }

    if (treeControl?.getDescendants) {
      return treeControl.getDescendants(node);
    }

    const childrenAccessor = this.childrenAccessor as ((node: T) => T[] | undefined | null) | undefined;
    if (!childrenAccessor) {
      return [];
    }

    const descendants: T[] = [];
    const collect = (current: T) => {
      const children = childrenAccessor(current);
      if (!Array.isArray(children)) {
        return;
      }

      for (const child of children) {
        descendants.push(child);
        collect(child);
      }
    };

    collect(node);
    return descendants;
  }

  private _getCheckableNodeKey(node: T): unknown {
    const treeControl = this.treeControl as { trackBy?: (node: T) => K } | undefined;
    if (treeControl?.trackBy) {
      return treeControl.trackBy(node);
    }

    if (this.expansionKey) {
      return this.expansionKey(node);
    }

    if (this.trackBy) {
      return this.trackBy(-1, node);
    }

    return node;
  }
}
