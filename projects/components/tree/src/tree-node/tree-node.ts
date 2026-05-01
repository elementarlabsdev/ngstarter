import {
  CDK_TREE_NODE_OUTLET_NODE, CdkNestedTreeNode,
  CdkTreeNode,
} from '@angular/cdk/tree';
import {
  booleanAttribute,
  Directive,
  HostAttributeToken,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
  effect
} from '@angular/core';

function isNoopTreeKeyManager(keyManager: any) {
  return !!keyManager._isNoopTreeKeyManager;
}

@Directive({
  selector: 'ngs-tree-node',
  exportAs: 'ngsTreeNode',
  outputs: ['activation', 'expandedChange'],
  providers: [{ provide: CdkTreeNode, useExisting: TreeNode }],
  host: {
    'class': 'ngs-tree-node',
    '[attr.aria-expanded]': '_getAriaExpanded()',
    '[attr.aria-level]': 'level + 1',
    '[attr.aria-posinset]': '_getPositionInSet()',
    '[attr.aria-setsize]': '_getSetSize()',
    '(click)': '_focusItem()',
    '[tabindex]': '_getTabindexAttribute()',
  },
  standalone: true
})
export class TreeNode<T, K = T> extends CdkTreeNode<T, K> implements OnInit, OnDestroy {
  tabIndexInputBinding = input<number, any>(0, {
    transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)),
    alias: 'tabIndex',
  });

  disabled = input(false, {
    transform: booleanAttribute
  });

  defaultTabIndex = 0;

  constructor() {
    super();
    const tabIndex = inject(new HostAttributeToken('tabindex'), { optional: true });
    (this as any)._tabIndexInputBinding = Number(tabIndex) || this.defaultTabIndex;
    effect(() => {
      this.isDisabled = this.disabled();
    });
  }

  _getTabindexAttribute() {
    if (isNoopTreeKeyManager((this._tree as any)._keyManager)) {
      return this.tabIndexInputBinding();
    }
    return (this as any)._tabindex;
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}

@Directive({
  selector: 'ngs-nested-tree-node',
  exportAs: 'ngsNestedTreeNode',
  outputs: ['activation', 'expandedChange'],
  providers: [
    { provide: CdkNestedTreeNode, useExisting: NestedTreeNode },
    { provide: CdkTreeNode, useExisting: NestedTreeNode },
    { provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: NestedTreeNode },
  ],
  host: {
    'class': 'ngs-nested-tree-node',
  },
  standalone: true
})
export class NestedTreeNode<T, K = T> extends CdkNestedTreeNode<T, K> implements OnInit, OnDestroy {
  node = input<T>(undefined!, {
    alias: 'ngsNestedTreeNode'
  });

  disabled = input(false, {
    transform: booleanAttribute
  });

  tabIndexInput = input<number, any>(0, {
    alias: 'tabIndex',
    transform: (value: any) => (value == null ? 0 : numberAttribute(value))
  });

  constructor() {
    super();
    effect(() => {
      this.isDisabled = this.disabled();
    });
  }

  get tabIndex(): number {
    return this.isDisabled ? -1 : this.tabIndexInput();
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
