import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  input,
  output,
  signal,
  ViewContainerRef,
  ViewChild
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

  selectable = input(false, {
    transform: booleanAttribute
  });

  readonly checkedChange = output<unknown[]>();
  readonly selectedChange = output<unknown>();

  readonly _checkStateVersion = signal(0);
  readonly _selectedKey = signal<unknown>(undefined);
  private _checkedKeys = new Set<unknown>();
  private _nodeValueByDataKey = new Map<unknown, unknown>();
  private _disabledDataKeys = new Set<unknown>();
  private _enabledDataKeys = new Set<unknown>();

  @ViewChild(TreeNodeOutlet, { static: true })
  override _nodeOutlet: TreeNodeOutlet = undefined!;

  _toggleNodeChecked(node: T, checked: boolean) {
    if (this._isNodeDisabled(node)) {
      return;
    }

    const nodes = [node, ...this._getCheckableDescendants(node)].filter(item => !this._isNodeDisabled(item));
    for (const item of nodes) {
      const key = this._getCheckableNodeKey(item);
      if (checked) {
        this._checkedKeys.add(key);
      } else {
        this._checkedKeys.delete(key);
      }
    }
    this._syncCheckedParentKeys();
    this._checkStateVersion.update(value => value + 1);
    this.checkedChange.emit(this._getCheckedValues());
  }

  _isNodeChecked(node: T): boolean {
    if (this._isNodeDisabled(node)) {
      return false;
    }

    const descendants = this._getCheckableDescendants(node).filter(item => !this._isNodeDisabled(item));
    if (!descendants.length) {
      return this._checkedKeys.has(this._getCheckableNodeKey(node));
    }

    return descendants.every(item => this._checkedKeys.has(this._getCheckableNodeKey(item)));
  }

  _isNodeIndeterminate(node: T): boolean {
    if (this._isNodeDisabled(node)) {
      return false;
    }

    const descendants = this._getCheckableDescendants(node).filter(item => !this._isNodeDisabled(item));
    if (!descendants.length) {
      return false;
    }

    const selectedCount = descendants.filter(item => this._checkedKeys.has(this._getCheckableNodeKey(item))).length;
    return selectedCount > 0 && selectedCount < descendants.length;
  }

  _selectNode(node: T) {
    if (this._isNodeDisabled(node)) {
      return;
    }

    const value = this._getTreeNodeValue(node);
    if (Object.is(this._selectedKey(), value)) {
      return;
    }

    this._selectedKey.set(value);
    this.selectedChange.emit(value);
  }

  _isNodeSelected(node: T): boolean {
    return !this._isNodeDisabled(node) && Object.is(this._selectedKey(), this._getTreeNodeValue(node));
  }

  _registerNodeValue(node: T, value: unknown) {
    const key = this._getTreeNodeDataKey(node);
    this._nodeValueByDataKey.set(key, value);
  }

  _unregisterNodeValueByDataKey(key: unknown) {
    this._nodeValueByDataKey.delete(key);
  }

  _registerNodeDisabled(node: T, disabled: boolean) {
    const key = this._getTreeNodeDataKey(node);
    if (disabled) {
      const checkedKey = this._getCheckableNodeKey(node);
      const wasChecked = this._checkedKeys.has(checkedKey);
      this._disabledDataKeys.add(key);
      this._enabledDataKeys.delete(key);
      this._checkedKeys.delete(checkedKey);
      if (Object.is(this._selectedKey(), this._getTreeNodeValue(node))) {
        this._selectedKey.set(undefined);
        this.selectedChange.emit(undefined);
      }
      if (wasChecked) {
        this._syncCheckedParentKeys();
        this._checkStateVersion.update(value => value + 1);
        this.checkedChange.emit(this._getCheckedValues());
      }
    } else {
      this._disabledDataKeys.delete(key);
      this._enabledDataKeys.add(key);
    }
  }

  _unregisterNodeDisabledByDataKey(key: unknown) {
    this._disabledDataKeys.delete(key);
    this._enabledDataKeys.delete(key);
  }

  _isNodeDisabled(node: T): boolean {
    const key = this._getTreeNodeDataKey(node);
    if (this._enabledDataKeys.has(key)) {
      return false;
    }

    return this._disabledDataKeys.has(key) || (node as { disabled?: boolean } | null | undefined)?.disabled === true;
  }

  _getTreeNodeDataKey(node: T): unknown {
    return this._getTreeNodeKey(node);
  }

  _getTreeNodeValue(node: T): unknown {
    const key = this._getTreeNodeDataKey(node);
    return this._nodeValueByDataKey.has(key) ? this._nodeValueByDataKey.get(key) : key;
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
      const nodeKey = this._getTreeNodeKey(node);
      const startIndex = flatNodes.findIndex(item => (
        item === node || this._getTreeNodeKey(item) === nodeKey
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
    return this._getTreeNodeValue(node);
  }

  private _getCheckedValues(): unknown[] {
    return Array.from(this._checkedKeys);
  }

  private _syncCheckedParentKeys() {
    const nodes = this._getCheckableNodes();
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (this._isNodeDisabled(node)) {
        this._checkedKeys.delete(this._getCheckableNodeKey(node));
        continue;
      }

      const descendants = this._getCheckableDescendants(node).filter(item => !this._isNodeDisabled(item));
      if (!descendants.length) {
        continue;
      }

      const key = this._getCheckableNodeKey(node);
      if (descendants.every(item => this._checkedKeys.has(this._getCheckableNodeKey(item)))) {
        this._checkedKeys.add(key);
      } else {
        this._checkedKeys.delete(key);
      }
    }
  }

  private _getCheckableNodes(): T[] {
    const treeControl = this.treeControl as { dataNodes?: T[] } | undefined;
    const flatNodes = treeControl?.dataNodes?.length
      ? treeControl.dataNodes
      : ((this as any)._keyManagerNodes?.value ?? (this as any)._flattenedNodes?.value ?? []) as T[];

    if (flatNodes.length) {
      return flatNodes;
    }

    const data = this.dataSource;
    if (!Array.isArray(data)) {
      return [];
    }

    const childrenAccessor = this.childrenAccessor as ((node: T) => T[] | undefined | null) | undefined;
    if (!childrenAccessor) {
      return data;
    }

    const nodes: T[] = [];
    const collect = (items: T[]) => {
      for (const item of items) {
        nodes.push(item);
        const children = childrenAccessor(item);
        if (Array.isArray(children)) {
          collect(children);
        }
      }
    };

    collect(data);
    return nodes;
  }

  private _getTreeNodeKey(node: T): unknown {
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
