import {
  CDK_TREE_NODE_OUTLET_NODE, CdkNestedTreeNode,
  CdkTreeNode,
} from '@angular/cdk/tree';
import {
  ApplicationRef,
  booleanAttribute,
  ComponentRef,
  createComponent,
  Directive,
  ElementRef,
  EnvironmentInjector,
  HostAttributeToken,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  effect,
  Renderer2
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Checkbox, CheckboxChange } from '@ngstarter-ui/components/checkbox';
import { Tree } from '../tree/tree';

function isNoopTreeKeyManager(keyManager: any) {
  return !!keyManager._isNoopTreeKeyManager;
}

class TreeNodeCheckbox<T, K = T> {
  private _isReady = false;
  private _wrapperElement?: HTMLElement;
  private _componentRef?: ComponentRef<Checkbox>;
  private _unlistenClick?: () => void;
  private _unlistenKeydown?: () => void;
  private _changeSubscription?: { unsubscribe: () => void };

  constructor(
    private _node: CdkTreeNode<T, K>,
    private _tree: Tree<T, K>,
    private _elementRef: ElementRef<HTMLElement>,
    private _renderer: Renderer2,
    private _appRef: ApplicationRef,
    private _environmentInjector: EnvironmentInjector,
    private _disabled: () => boolean,
  ) {}

  enable() {
    this._isReady = true;
    this.sync();
  }

  sync() {
    if (!this._isReady) {
      return;
    }

    if (!this._tree.checkable()) {
      this.destroy();
      return;
    }

    const checkbox = this._ensureCheckbox();
    const node = this._node.data;
    const checked = this._tree._isNodeChecked(node);
    const indeterminate = this._tree._isNodeIndeterminate(node);

    checkbox.checked.set(checked);
    checkbox.indeterminate.set(indeterminate);
    checkbox.disabled.set(this._disabled());
    this._componentRef?.changeDetectorRef.detectChanges();
  }

  destroy() {
    this._unlistenClick?.();
    this._unlistenClick = undefined;
    this._unlistenKeydown?.();
    this._unlistenKeydown = undefined;
    this._changeSubscription?.unsubscribe();
    this._changeSubscription = undefined;
    if (this._componentRef) {
      this._appRef.detachView(this._componentRef.hostView);
      this._componentRef.destroy();
      this._componentRef = undefined;
    }
    this._wrapperElement?.remove();
    this._wrapperElement = undefined;
  }

  private _ensureCheckbox(): Checkbox {
    if (this._componentRef) {
      return this._componentRef.instance;
    }

    const existingWrapper = this._elementRef.nativeElement.querySelector(
      ':scope > .ngs-tree-node-checkbox',
    ) as HTMLElement | null;
    const wrapper = existingWrapper ?? this._renderer.createElement('span') as HTMLElement;
    let checkboxHost = wrapper.querySelector(':scope > ngs-checkbox') as HTMLElement | null;

    if (!existingWrapper) {
      this._renderer.addClass(wrapper, 'ngs-tree-node-checkbox');
      checkboxHost = this._renderer.createElement('ngs-checkbox') as HTMLElement;
      this._renderer.appendChild(wrapper, checkboxHost);
      this._renderer.insertBefore(
        this._elementRef.nativeElement,
        wrapper,
        this._getCheckboxInsertionReference(),
      );
    } else if (!checkboxHost) {
      checkboxHost = this._renderer.createElement('ngs-checkbox') as HTMLElement;
      this._renderer.appendChild(wrapper, checkboxHost);
    }

    while (checkboxHost.firstChild) {
      checkboxHost.firstChild.remove();
    }

    this._wrapperElement = wrapper;
    this._componentRef = createComponent(Checkbox, {
      environmentInjector: this._environmentInjector,
      hostElement: checkboxHost,
    });
    this._componentRef.setInput('aria-label', 'Select tree node');
    this._componentRef.setInput('tabIndex', -1);
    this._appRef.attachView(this._componentRef.hostView);
    this._bindCheckboxEvents(wrapper, this._componentRef);

    return this._componentRef.instance;
  }

  private _getCheckboxInsertionReference(): ChildNode | null {
    const host = this._elementRef.nativeElement;
    const firstElement = host.firstElementChild;
    if (
      firstElement?.matches(
        'button, [ngsTreeNodeToggle], [ngstreenodetoggle], [ngsIconButton], [ngsiconbutton]',
      )
    ) {
      return firstElement.nextSibling;
    }

    return host.firstChild;
  }

  private _bindCheckboxEvents(checkboxElement: HTMLElement, checkboxRef: ComponentRef<Checkbox>) {
    this._unlistenClick = this._renderer.listen(checkboxElement, 'click', (event: Event) => {
      event.stopPropagation();
    });
    this._unlistenKeydown = this._renderer.listen(checkboxElement, 'keydown', (event: Event) => {
      event.stopPropagation();
    });
    this._changeSubscription = checkboxRef.instance.change.subscribe((event: CheckboxChange) => {
      this._tree._toggleNodeChecked(this._node.data, event.checked);
    });
  }
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
  private _hostElementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);
  private _appRef = inject(ApplicationRef);
  private _environmentInjector = inject(EnvironmentInjector);
  private _platformId = inject(PLATFORM_ID);
  private _checkbox: TreeNodeCheckbox<T, K>;
  private _dataChangesSubscription?: { unsubscribe: () => void };
  private _checkboxEnableHandle?: ReturnType<typeof setTimeout>;

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
    const tree = this._tree as Tree<T, K>;
    this._checkbox = new TreeNodeCheckbox(
      this,
      tree,
      this._hostElementRef,
      this._renderer,
      this._appRef,
      this._environmentInjector,
      () => this.disabled(),
    );
    this._dataChangesSubscription = this._dataChanges.subscribe(() => this._checkbox.sync());
    if (isPlatformBrowser(this._platformId)) {
      this._checkboxEnableHandle = setTimeout(() => this._checkbox.enable());
    }
    const tabIndex = inject(new HostAttributeToken('tabindex'), { optional: true });
    (this as any)._tabIndexInputBinding = Number(tabIndex) || this.defaultTabIndex;
    effect(() => {
      this.isDisabled = this.disabled();
    });
    effect(() => {
      tree.checkable();
      tree._checkStateVersion();
      this.disabled();
      this._checkbox.sync();
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
    if (this._checkboxEnableHandle) {
      clearTimeout(this._checkboxEnableHandle);
    }
    this._dataChangesSubscription?.unsubscribe();
    this._checkbox.destroy();
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
  private _hostElementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);
  private _appRef = inject(ApplicationRef);
  private _environmentInjector = inject(EnvironmentInjector);
  private _platformId = inject(PLATFORM_ID);
  private _checkbox: TreeNodeCheckbox<T, K>;
  private _dataChangesSubscription?: { unsubscribe: () => void };
  private _checkboxEnableHandle?: ReturnType<typeof setTimeout>;

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
    const tree = this._tree as Tree<T, K>;
    this._checkbox = new TreeNodeCheckbox(
      this,
      tree,
      this._hostElementRef,
      this._renderer,
      this._appRef,
      this._environmentInjector,
      () => this.disabled(),
    );
    this._dataChangesSubscription = this._dataChanges.subscribe(() => this._checkbox.sync());
    if (isPlatformBrowser(this._platformId)) {
      this._checkboxEnableHandle = setTimeout(() => this._checkbox.enable());
    }
    effect(() => {
      this.isDisabled = this.disabled();
    });
    effect(() => {
      tree.checkable();
      tree._checkStateVersion();
      this.disabled();
      this._checkbox.sync();
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
    if (this._checkboxEnableHandle) {
      clearTimeout(this._checkboxEnableHandle);
    }
    this._dataChangesSubscription?.unsubscribe();
    this._checkbox.destroy();
    super.ngOnDestroy();
  }
}
