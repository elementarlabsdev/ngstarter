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

export interface TreeNodeDrop<T> {
  source: T;
  target: T;
  position: TreeNodeDropPosition;
  sourceValue: unknown;
  targetValue: unknown;
  dataSource: T[];
}

export type TreeNodeDropPosition = 'before' | 'inside' | 'after';

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

  draggable = input(false, {
    transform: booleanAttribute
  });

  childrenKey = input('children');

  readonly checkedChange = output<unknown[]>();
  readonly selectedChange = output<unknown>();
  readonly nodeDrop = output<TreeNodeDrop<T>>();

  readonly _checkStateVersion = signal(0);
  readonly _selectedKey = signal<unknown>(undefined);
  readonly _dropTargetKey = signal<unknown>(undefined);
  readonly _dropTargetPosition = signal<TreeNodeDropPosition | undefined>(undefined);
  private _checkedKeys = new Set<unknown>();
  private _nodeValueByDataKey = new Map<unknown, unknown>();
  private _disabledDataKeys = new Set<unknown>();
  private _enabledDataKeys = new Set<unknown>();
  private _draggedNode?: T;

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

  _canDragNode(node: T): boolean {
    return node !== undefined && this.draggable() && !this._isNodeDisabled(node);
  }

  _isNodeDropTarget(node: T): boolean {
    return node !== undefined && Object.is(this._dropTargetKey(), this._getTreeNodeDataKey(node));
  }

  _isNodeDropTargetPosition(node: T, position: TreeNodeDropPosition): boolean {
    return this._isNodeDropTarget(node) && this._dropTargetPosition() === position;
  }

  _startNodeDrag(node: T, event: DragEvent) {
    if (!this._canDragNode(node)) {
      event.preventDefault();
      return;
    }

    this._draggedNode = node;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(this._getTreeNodeValue(node) ?? ''));
    }
  }

  _dragNodeOver(node: T, event: DragEvent) {
    const position = this._getDropPosition(event);
    if (!this._canDropNode(node, position)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this._dropTargetKey.set(this._getTreeNodeDataKey(node));
    this._dropTargetPosition.set(position);
  }

  _dragNodeLeave(node: T, event: DragEvent) {
    event.stopPropagation();
    if (Object.is(this._dropTargetKey(), this._getTreeNodeDataKey(node))) {
      this._dropTargetKey.set(undefined);
      this._dropTargetPosition.set(undefined);
    }
  }

  _dropNodeInto(node: T, event: DragEvent) {
    const position = this._dropTargetPosition() ?? this._getDropPosition(event);
    if (!this._canDropNode(node, position)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const source = this._draggedNode!;
    const moved = this._moveNode(source, node, position);
    this._clearNodeDrag();

    if (moved) {
      this.nodeDrop.emit({
        source,
        target: node,
        position,
        sourceValue: this._getTreeNodeValue(source),
        targetValue: this._getTreeNodeValue(node),
        dataSource: this._getRootNodes() ?? [],
      });
    }
  }

  _endNodeDrag() {
    this._clearNodeDrag();
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

  private _canDropNode(target: T, position: TreeNodeDropPosition): boolean {
    const source = this._draggedNode;
    return !!source
      && this.draggable()
      && !this._isNodeDisabled(target)
      && !this._isSameNode(source, target)
      && !this._isNodeDescendantOf(target, source);
  }

  private _moveNode(source: T, target: T, position: TreeNodeDropPosition): boolean {
    const rootNodes = this._getRootNodes();
    if (!rootNodes) {
      return false;
    }

    const moved = position === 'inside'
      ? this._moveNodeInto(source, target, rootNodes)
      : this._moveNodeBeside(source, target, position, rootNodes);
    if (!moved) {
      return false;
    }

    this._refreshTreeData(rootNodes);
    this._syncCheckedParentKeys();
    this._checkStateVersion.update(value => value + 1);
    return true;
  }

  private _moveNodeInto(source: T, target: T, rootNodes: T[]): boolean {
    const sourceLocation = this._removeNodeFrom(rootNodes, source);
    if (!sourceLocation) {
      return false;
    }

    const targetChildren = this._getMutableNodeChildren(target);
    if (!targetChildren) {
      sourceLocation.items.splice(sourceLocation.index, 0, source);
      return false;
    }

    targetChildren.push(source);
    (this as { expand?: (node: T) => void }).expand?.(target);
    return true;
  }

  private _moveNodeBeside(
    source: T,
    target: T,
    position: Exclude<TreeNodeDropPosition, 'inside'>,
    rootNodes: T[],
  ): boolean {
    const sourceLocation = this._removeNodeFrom(rootNodes, source);
    if (!sourceLocation) {
      return false;
    }

    const targetLocation = this._findNodeLocation(rootNodes, target);
    if (!targetLocation) {
      sourceLocation.items.splice(sourceLocation.index, 0, source);
      return false;
    }

    const insertIndex = position === 'before' ? targetLocation.index : targetLocation.index + 1;
    targetLocation.items.splice(insertIndex, 0, source);
    return true;
  }

  private _findNodeLocation(nodes: T[], target: T): { items: T[]; index: number } | undefined {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (this._isSameNode(node, target)) {
        return { items: nodes, index: i };
      }

      const children = this._getDataNodeChildren(node);
      if (Array.isArray(children)) {
        const location = this._findNodeLocation(children, target);
        if (location) {
          return location;
        }
      }
    }

    return undefined;
  }

  private _removeNodeFrom(nodes: T[], source: T): { items: T[]; index: number } | undefined {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (this._isSameNode(node, source)) {
        nodes.splice(i, 1);
        return { items: nodes, index: i };
      }

      const children = this._getDataNodeChildren(node);
      if (Array.isArray(children)) {
        const location = this._removeNodeFrom(children, source);
        if (location) {
          return location;
        }
      }
    }

    return undefined;
  }

  private _getRootNodes(): T[] | undefined {
    return Array.isArray(this.dataSource) ? this.dataSource : undefined;
  }

  private _getDataNodeChildren(node: T): T[] | undefined {
    const childrenAccessor = this.childrenAccessor as ((node: T) => T[] | undefined | null) | undefined;
    const children = childrenAccessor?.(node);
    return Array.isArray(children) ? children : undefined;
  }

  private _getMutableNodeChildren(node: T): T[] | undefined {
    const existingChildren = this._getDataNodeChildren(node);
    if (existingChildren?.length) {
      return existingChildren;
    }

    const childrenKey = this.childrenKey();
    const nodeRecord = node as Record<string, unknown> | null | undefined;
    if (!nodeRecord || typeof nodeRecord !== 'object') {
      return existingChildren;
    }

    if (!Array.isArray(nodeRecord[childrenKey])) {
      nodeRecord[childrenKey] = [];
    }

    return nodeRecord[childrenKey] as T[];
  }

  private _refreshTreeData(rootNodes: T[]) {
    if (Array.isArray(this.dataSource)) {
      this.dataSource = [];
      this.dataSource = [...rootNodes];
      return;
    }

    this.renderNodeChanges(rootNodes);
  }

  private _isNodeDescendantOf(node: T, maybeAncestor: T): boolean {
    return this._getCheckableDescendants(maybeAncestor).some(item => this._isSameNode(item, node));
  }

  private _isSameNode(first: T, second: T): boolean {
    return first === second || Object.is(this._getTreeNodeDataKey(first), this._getTreeNodeDataKey(second));
  }

  private _getDropPosition(event: DragEvent): TreeNodeDropPosition {
    const element = event.currentTarget instanceof HTMLElement
      ? event.currentTarget
      : event.target instanceof HTMLElement
        ? event.target
        : null;
    const rect = element?.getBoundingClientRect();
    if (!rect?.height) {
      return 'inside';
    }

    const relativeY = event.clientY - rect.top;
    if (relativeY < rect.height * 0.25) {
      return 'before';
    }

    if (relativeY > rect.height * 0.75) {
      return 'after';
    }

    return 'inside';
  }

  private _clearNodeDrag() {
    this._draggedNode = undefined;
    this._dropTargetKey.set(undefined);
    this._dropTargetPosition.set(undefined);
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
