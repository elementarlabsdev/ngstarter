import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ContentChild,
  Component,
  Directive,
  effect,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  ViewContainerRef,
  ViewChild
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { CDK_TREE_NODE_OUTLET_NODE, CdkTree, CdkTreeNodeOutlet } from '@angular/cdk/tree';
import { Observable } from 'rxjs';

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

export interface TreeNodeDropContext<T> {
  source: T;
  target: T;
  position: TreeNodeDropPosition;
}

export interface TreeNodeDragPlaceholderContext<T> {
  $implicit: T;
  source: T;
  target?: T;
  position?: TreeNodeDropPosition;
}

export type TreeNodeDropPosition = 'before' | 'inside' | 'after';
export type TreeNodeDragPredicate<T> = (node: T) => boolean;
export type TreeNodeDropPredicate<T> = (source: T, target: T, position: TreeNodeDropPosition) => boolean;
export type TreeDragPreview = 'node' | 'none';
export type TreeFilterMode = 'includeAncestors' | 'includeDescendants';
export type TreeFilterPredicate<T> = (node: T, filterValue: string) => boolean;

const NGS_TREE_DEFAULT_FILTER_PREDICATE = <T,>(node: T, filterValue: string): boolean => {
  const query = filterValue.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const candidates = node && typeof node === 'object'
    ? [
        (node as Record<string, unknown>)['name'],
        (node as Record<string, unknown>)['label'],
        (node as Record<string, unknown>)['title'],
        (node as Record<string, unknown>)['value'],
      ]
    : [node];

  return candidates.some(value => value != null && String(value).toLowerCase().includes(query));
};

@Directive({
  selector: 'ng-template[ngsTreeDragPlaceholder]',
  standalone: true
})
export class TreeDragPlaceholder<T> {
  readonly templateRef = inject<TemplateRef<TreeNodeDragPlaceholderContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _directive: TreeDragPlaceholder<T>,
    _context: unknown,
  ): _context is TreeNodeDragPlaceholderContext<T> {
    return true;
  }
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
  override get dataSource(): DataSource<T> | Observable<T[]> | T[] {
    return this._sourceDataSource ?? [];
  }

  override set dataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
    if (this._sourceDataSource !== dataSource) {
      this._sourceDataSource = dataSource;
      this._applyFilteredDataSource();
    }
  }

  checkable = input(false, {
    transform: booleanAttribute
  });

  selectable = input(false, {
    transform: booleanAttribute
  });

  draggable = input(false, {
    transform: booleanAttribute
  });

  draggablePredicate = input<TreeNodeDragPredicate<T>>(() => true);

  dropPredicate = input<TreeNodeDropPredicate<T>>(() => true);

  reorderOnDrop = input(true, {
    transform: booleanAttribute
  });

  dragPreview = input<TreeDragPreview>('node');

  nodePaddingIndent = input<number | string>(48);

  childrenKey = input('children');

  filterValue = input('', {
    transform: (value: unknown) => value == null ? '' : String(value)
  });

  filterPredicate = input<TreeFilterPredicate<T>>(NGS_TREE_DEFAULT_FILTER_PREDICATE);

  filterMode = input<TreeFilterMode>('includeAncestors');

  readonly checkedChange = output<unknown[]>();
  readonly selectedChange = output<unknown>();
  readonly nodeDrop = output<TreeNodeDrop<T>>();

  readonly _checkStateVersion = signal(0);
  readonly _selectedKey = signal<unknown>(undefined);
  readonly _dropTargetKey = signal<unknown>(undefined);
  readonly _dropTargetPosition = signal<TreeNodeDropPosition | undefined>(undefined);
  readonly _draggedNodeKey = signal<unknown>(undefined);
  private _checkedKeys = new Set<unknown>();
  private _nodeValueByDataKey = new Map<unknown, unknown>();
  private _disabledDataKeys = new Set<unknown>();
  private _enabledDataKeys = new Set<unknown>();
  private _draggedNode?: T;
  private _sourceDataSource?: DataSource<T> | Observable<T[]> | T[];
  private _filteredNodeOriginals = new WeakMap<object, T>();

  @ContentChild(TreeDragPlaceholder)
  private _dragPlaceholder?: TreeDragPlaceholder<T>;

  @ViewChild(TreeNodeOutlet, { static: true })
  override _nodeOutlet: TreeNodeOutlet = undefined!;

  constructor() {
    super();
    effect(() => {
      this.filterValue();
      this.filterPredicate();
      this.filterMode();
      this._applyFilteredDataSource();
    });
  }

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
    return node !== undefined
      && this.draggable()
      && !this._isNodeDisabled(node)
      && this.draggablePredicate()(node);
  }

  _isNodeDropTarget(node: T): boolean {
    return node !== undefined && Object.is(this._dropTargetKey(), this._getTreeNodeDataKey(node));
  }

  _isNodeDropTargetPosition(node: T, position: TreeNodeDropPosition): boolean {
    return this._isNodeDropTarget(node) && this._dropTargetPosition() === position;
  }

  _isNodeDraggingSource(node: T): boolean {
    return node !== undefined && Object.is(this._draggedNodeKey(), this._getTreeNodeDataKey(node));
  }

  _startNodeDrag(node: T, event: DragEvent) {
    if (!this._canDragNode(node)) {
      event.preventDefault();
      return;
    }

    this._draggedNode = node;
    this._draggedNodeKey.set(this._getTreeNodeDataKey(node));
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
    const moved = this.reorderOnDrop() ? this._moveNode(source, node, position) : true;
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

  _getDragPreview(): TreeDragPreview {
    return this.dragPreview();
  }

  _hasDragPlaceholder(): boolean {
    return !!this._dragPlaceholder;
  }

  _setDragPlaceholderImage(node: T, event: DragEvent, host: HTMLElement): boolean {
    const template = this._dragPlaceholder?.templateRef;
    const dataTransfer = event.dataTransfer;
    const body = host.ownerDocument.body;

    if (!template || !dataTransfer || !body) {
      return false;
    }

    const viewRef = template.createEmbeddedView({
      $implicit: node,
      source: node,
    });
    viewRef.detectChanges();

    const dragImage = host.ownerDocument.createElement('div');
    dragImage.classList.add('ngs-tree-drag-placeholder-image');
    dragImage.style.position = 'fixed';
    dragImage.style.insetBlockStart = '0';
    dragImage.style.insetInlineStart = '0';
    dragImage.style.zIndex = '-1';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.transform = 'translate(-200vw, -200vh)';

    for (const rootNode of viewRef.rootNodes) {
      if (rootNode instanceof Node) {
        dragImage.appendChild(rootNode);
      }
    }

    body.appendChild(dragImage);
    dataTransfer.setDragImage(dragImage, 12, 12);
    window.setTimeout(() => {
      viewRef.destroy();
      dragImage.remove();
    });
    return true;
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
      && !this._isNodeDescendantOf(target, source)
      && this.dropPredicate()(source, target, position);
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

  private _applyFilteredDataSource() {
    const source = this._sourceDataSource;
    if (!source) {
      super.dataSource = [];
      return;
    }

    super.dataSource = this._getFilteredDataSource(source);
  }

  private _getFilteredDataSource(dataSource: DataSource<T> | Observable<T[]> | T[]): DataSource<T> | Observable<T[]> | T[] {
    this._filteredNodeOriginals = new WeakMap<object, T>();
    if (!Array.isArray(dataSource) || !this._isFilterActive()) {
      return dataSource;
    }

    const filteredData = dataSource
      .map(node => this._filterNode(node))
      .filter((node): node is T => node !== undefined);
    this._expandFilteredNodes(filteredData);
    return filteredData;
  }

  private _filterNode(node: T): T | undefined {
    const filterValue = this.filterValue().trim();
    const children = this._getDataNodeChildren(node) ?? [];
    const matches = this.filterPredicate()(node, filterValue);

    if (matches && this.filterMode() === 'includeDescendants') {
      return node;
    }

    const filteredChildren = children
      .map(child => this._filterNode(child))
      .filter((child): child is T => child !== undefined);
    if (!matches && !filteredChildren.length) {
      return undefined;
    }

    if (filteredChildren.length === children.length) {
      return node;
    }

    return this._cloneNodeWithChildren(node, filteredChildren);
  }

  private _cloneNodeWithChildren(node: T, children: T[]): T {
    const nodeRecord = node as Record<string, unknown> | null | undefined;
    if (!nodeRecord || typeof nodeRecord !== 'object') {
      return node;
    }

    const clone = {
      ...nodeRecord,
      [this.childrenKey()]: children,
    } as T;
    this._filteredNodeOriginals.set(clone as object, node);
    return clone;
  }

  private _expandFilteredNodes(nodes: T[]) {
    (this as any)._getExpansionModel?.();
    for (const node of nodes) {
      const children = this._getDataNodeChildren(node);
      if (!children?.length) {
        continue;
      }

      this.expand(node);
      this._expandFilteredNodes(children);
    }
  }

  private _isFilterActive(): boolean {
    return this.filterValue().trim().length > 0;
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
    this._draggedNodeKey.set(undefined);
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
    const originalNode = this._getOriginalFilterNode(node);
    const treeControl = this.treeControl as { trackBy?: (node: T) => K } | undefined;
    if (treeControl?.trackBy) {
      return treeControl.trackBy(originalNode);
    }

    if (this.expansionKey) {
      return this.expansionKey(originalNode);
    }

    if (this.trackBy) {
      return this.trackBy(-1, originalNode);
    }

    return originalNode;
  }

  private _getOriginalFilterNode(node: T): T {
    if (node && typeof node === 'object') {
      return this._filteredNodeOriginals.get(node as object) ?? node;
    }

    return node;
  }
}
