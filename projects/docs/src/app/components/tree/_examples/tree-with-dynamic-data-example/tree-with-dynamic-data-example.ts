import { Component, Injectable, signal } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, map, merge, Observable } from 'rxjs';
import { Tree, TreeNode, TreeNodeDef, TreeNodePadding, TreeNodeToggle } from '@ngstarter-ui/components/tree';
import { Button } from '@ngstarter-ui/components/button';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';

/** Flat node with expandable and level information */
class DynamicFlatNode {
  constructor(
    public item: string,
    public level = 1,
    public expandable = false,
    public isLoading = signal(false),
  ) {}
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({providedIn: 'root'})
export class DynamicDatabase {
  dataMap = new Map<string, string[]>([
    ['Fruits', ['Apple', 'Orange', 'Banana']],
    ['Vegetables', ['Tomato', 'Potato', 'Onion']],
    ['Apple', ['Fuji', 'Macintosh']],
    ['Onion', ['Yellow', 'White', 'Purple']],
  ]);

  rootLevelNodes: string[] = ['Fruits', 'Vegetables'];

  /** Initial data from database */
  initialData(): DynamicFlatNode[] {
    return this.rootLevelNodes.map(name => new DynamicFlatNode(name, 0, true));
  }

  getChildren(node: string): string[] | undefined {
    return this.dataMap.get(node);
  }

  isExpandable(node: string): boolean {
    return this.dataMap.has(node);
  }
}

export class DynamicDataSource implements DataSource<DynamicFlatNode> {
  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);
  private _loadSequence = new WeakMap<DynamicFlatNode, number>();

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }
  set data(value: DynamicFlatNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<DynamicFlatNode>,
    private _database: DynamicDatabase,
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: DynamicFlatNode, expand: boolean) {
    const children = this._database.getChildren(node.item);
    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      // If no children, or cannot find the node, no op
      return;
    }

    if (!expand) {
      this._loadSequence.set(node, (this._loadSequence.get(node) ?? 0) + 1);
      node.isLoading.set(false);
      let count = 0;
      for (
        let i = index + 1;
        i < this.data.length && this.data[i].level > node.level;
        i++, count++
      ) {}
      this.data.splice(index + 1, count);
      this.dataChange.next(this.data);
      return;
    }

    const loadId = (this._loadSequence.get(node) ?? 0) + 1;
    this._loadSequence.set(node, loadId);
    node.isLoading.set(true);

    setTimeout(() => {
      if (this._loadSequence.get(node) !== loadId) {
        return;
      }

      if (!this._treeControl.isExpanded(node)) {
        node.isLoading.set(false);
        return;
      }

      const currentIndex = this.data.indexOf(node);
      if (currentIndex < 0) {
        node.isLoading.set(false);
        return;
      }

      const nodes = children.map(
        name => new DynamicFlatNode(name, node.level + 1, this._database.isExpandable(name)),
      );
      this.data.splice(currentIndex + 1, 0, ...nodes);

      // notify the change
      this.dataChange.next(this.data);
      node.isLoading.set(false);
    }, 1000);
  }
}

@Component({
  selector: 'app-tree-with-dynamic-data-example',
  imports: [
    Icon,
    TreeNode,
    Button,
    TreeNodeDef,
    TreeNodePadding,
    TreeNodeToggle,
    Tree,
    ProgressBar
  ],
  templateUrl: './tree-with-dynamic-data-example.html',
  styleUrl: './tree-with-dynamic-data-example.scss'
})
export class TreeWithDynamicDataExample {
  constructor(database: DynamicDatabase) {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);

    this.dataSource.data = database.initialData();
  }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;
}
