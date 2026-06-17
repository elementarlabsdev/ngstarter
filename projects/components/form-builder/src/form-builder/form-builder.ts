import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, computed, inject, input, model, output, signal, viewChild } from '@angular/core';
import { FormsModule, FormControl } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardAside, CardContent, CardHeader } from '@ngstarter-ui/components/card';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { Dialog, DialogActions, DialogClose, DialogContent, DialogTitle } from '@ngstarter-ui/components/dialog';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Panel, PanelAside, PanelContent, PanelHeader, PanelSidebar } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import { Tree, TreeDragPlaceholder, TreeNode, TreeNodeDef, TreeNodeDrop, TreeNodeDropPosition, TreeNodePadding } from '@ngstarter-ui/components/tree';
import {
  DEFAULT_FORM_BUILDER_ITEMS,
  FORM_BUILDER_FIELDS,
  FORM_BUILDER_ITEMS,
  FORM_BUILDER_SETTINGS
} from '../config';
import {
  FormBuilderField,
  FormBuilderFieldChange,
  FormBuilderFieldDefinition,
  FormBuilderItemDefinition,
  FormBuilderLayoutItem,
  FormBuilderFieldWidth,
  FormBuilderSchema,
  FormBuilderSection,
  FormBuilderSettingsDefinition,
  FormBuilderUploadCallback
} from '../types';
import { FormBuilderFieldHost } from '../field-host/field-host';
import { FormBuilderRenderer } from '../form-builder-renderer/form-builder-renderer';
import { FormBuilderSettingsHost } from '../settings-host/settings-host';

interface FormBuilderPaletteGroup {
  name: string;
  fields: FormBuilderFieldDefinition[];
}

interface FormBuilderFieldTreeNode {
  id: string;
  label: string;
  name?: string;
  type: string;
  icon: string;
  kind: 'section' | 'field';
  field?: FormBuilderField;
  section?: FormBuilderSection;
  children?: FormBuilderFieldTreeNode[];
}

interface FormBuilderFieldLocation {
  field: FormBuilderField;
  section?: FormBuilderSection;
  siblings: FormBuilderField[];
  index: number;
}

interface FormBuilderTreeInsertTarget {
  fields: FormBuilderField[];
  index: number;
  section?: FormBuilderSection;
}

interface FormBuilderContainerLocation {
  id: string;
  fields: FormBuilderField[];
  section?: FormBuilderSection;
  owner?: FormBuilderField;
}

interface FormBuilderCanvasItem extends FormBuilderLayoutItem {
  field?: FormBuilderField;
  section?: FormBuilderSection;
}

type FormBuilderNativeDragItem =
  | { kind: 'field'; definition: FormBuilderFieldDefinition }
  | { kind: 'section' };

const ROOT_DROP_LIST_ID = 'ngs-form-builder-root-fields';
const PALETTE_DRAG_TYPE = 'application/x-ngstarter-form-builder-field';
const PALETTE_DRAG_ITEM = 'application/x-ngstarter-form-builder-item';
const ACTUAL_FIELDS_TAB_INDEX = 1;

@Component({
  selector: 'ngs-form-builder',
  exportAs: 'ngsFormBuilder',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    Button,
    Card,
    CardAside,
    CardContent,
    CardHeader,
    DialogActions,
    DialogClose,
    DialogContent,
    DialogTitle,
    Icon,
    Input,
    Panel,
    PanelAside,
    PanelContent,
    PanelHeader,
    PanelSidebar,
    ScrollbarArea,
    Tab,
    TabGroup,
    Tree,
    TreeDragPlaceholder,
    TreeNode,
    TreeNodeDef,
    TreeNodePadding,
    FormBuilderFieldHost,
    FormBuilderRenderer,
    FormBuilderSettingsHost
  ],
  templateUrl: './form-builder.html',
  styleUrl: './form-builder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-form-builder'
  }
})
export class FormBuilder {
  private readonly dialog = inject(Dialog);
  private readonly confirmManager = inject(ConfirmManager);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly providedItems = inject(FORM_BUILDER_ITEMS, { optional: true }) ?? [];
  private readonly providedFields = inject(FORM_BUILDER_FIELDS, { optional: true }) ?? [];
  private readonly providedSettings = inject(FORM_BUILDER_SETTINGS, { optional: true }) ?? [];
  private readonly previewControls = new Map<string, FormControl>();
  private readonly fieldTreeNodeCache = new Map<string, FormBuilderFieldTreeNode>();
  private readonly canvasAnimationTimers = new WeakMap<HTMLElement, number>();
  private readonly actualFieldsTree = viewChild<Tree<FormBuilderFieldTreeNode>>('actualFieldsTree');
  private fieldTreeRootNodes: FormBuilderFieldTreeNode[] = [];
  private fieldTreeStructureKey = '';
  private suppressPaletteClick = false;

  readonly schema = model<FormBuilderSchema>(createDefaultFormBuilderSchema());
  readonly paletteTitle = input('Fields');
  readonly inspectorTitle = input('Field properties');
  readonly uploadCallback = input<FormBuilderUploadCallback | null | undefined>(undefined);

  readonly fieldSelected = output<FormBuilderFieldChange>();
  readonly fieldAdded = output<FormBuilderFieldChange>();
  readonly fieldRemoved = output<FormBuilderFieldChange>();

  protected readonly search = signal('');
  protected readonly fieldsTabIndex = signal(0);
  protected readonly selectedFieldId = signal<string | null>(null);
  protected readonly nativeDragItem = signal<FormBuilderNativeDragItem | null>(null);
  protected readonly nativeDragFieldDefinition = computed(() => {
    const item = this.nativeDragItem();
    return item?.kind === 'field' ? item.definition : null;
  });
  protected readonly nativeDragSection = computed(() => this.nativeDragItem()?.kind === 'section');
  protected readonly nativeDropTarget = signal<{ containerId: string; index: number } | null>(null);
  protected readonly expandedFieldTreeNodeIds = signal<ReadonlySet<string>>(new Set());
  protected readonly definitions = computed<FormBuilderFieldDefinition[]>(() => [
    ...DEFAULT_FORM_BUILDER_ITEMS,
    ...this.providedFields,
    ...this.providedItems
  ].reduce<FormBuilderFieldDefinition[]>((definitions, definition) => {
    const normalized = normalizeFieldDefinition(definition);
    const index = definitions.findIndex(item => item.type === normalized.type);

    if (index === -1) {
      definitions.push(normalized);
    } else {
      definitions[index] = {
        ...definitions[index],
        ...normalized,
        defaults: {
          ...definitions[index].defaults,
          ...normalized.defaults
        }
      };
    }

    return definitions;
  }, []));
  protected readonly settingsDefinitions = computed<FormBuilderSettingsDefinition[]>(() => this.providedSettings);
  protected readonly canvasItems = computed<FormBuilderCanvasItem[]>(() => this.resolveCanvasItems(this.schema()));
  protected readonly layoutDefinitions = computed<FormBuilderFieldDefinition[]>(() => {
    const query = this.search().trim().toLowerCase();

    return this.definitions().filter(definition => {
      if (definition.type === 'section' || (definition.group || 'Other') !== 'Layout') {
        return false;
      }

      return this.matchesPaletteQuery(definition, query);
    });
  });
  protected readonly paletteGroups = computed<FormBuilderPaletteGroup[]>(() => {
    const query = this.search().trim().toLowerCase();
    const groups = new Map<string, FormBuilderFieldDefinition[]>();

    for (const definition of this.definitions()) {
      const group = definition.group || 'Other';

      if (group === 'Layout' || !this.matchesPaletteQuery(definition, query)) {
        continue;
      }

      groups.set(group, [...(groups.get(group) ?? []), definition]);
    }

    return Array.from(groups, ([name, fields]) => ({ name, fields }));
  });
  protected readonly selectedField = computed(() => {
    const selectedId = this.selectedFieldId();
    return selectedId ? this.findFieldLocation(this.schema(), selectedId)?.field ?? null : null;
  });
  protected readonly selectedSection = computed(() => {
    const selectedId = this.selectedFieldId();
    return selectedId ? this.schema().sections.find(section => section.id === selectedId) ?? null : null;
  });
  protected readonly fieldTree = computed<FormBuilderFieldTreeNode[]>(() => {
    const nodes = this.resolveCanvasItems(this.schema()).map(item => {
      return item.field
        ? this.upsertFieldTreeNode(item.field)
        : this.upsertSectionTreeNode(item.section!);
    });
    const structureKey = this.resolveFieldTreeStructureKey(nodes);

    if (structureKey !== this.fieldTreeStructureKey) {
      this.fieldTreeStructureKey = structureKey;
      this.fieldTreeRootNodes = nodes;
      return this.fieldTreeRootNodes;
    }

    replaceArrayContents(this.fieldTreeRootNodes, nodes);
    return this.fieldTreeRootNodes;
  });
  protected readonly fieldTreeChildrenAccessor = (node: FormBuilderFieldTreeNode) => node.children ?? [];
  protected readonly hasFieldTreeChildren = (_: number, node: FormBuilderFieldTreeNode) =>
    !!node.children?.length;
  protected readonly trackFieldTreeNode = (_: number, node: FormBuilderFieldTreeNode) => node.id;
  protected readonly fieldTreeDraggablePredicate = (_node: FormBuilderFieldTreeNode) => true;
  protected readonly fieldTreeDropPredicate = (
    source: FormBuilderFieldTreeNode,
    target: FormBuilderFieldTreeNode,
    position: TreeNodeDropPosition
  ) => this.canDropFieldTreeNode(source, target, position);

  protected readonly updateSelectedField = (changes: Partial<FormBuilderField>) => {
    this.patchSelectedField(changes);
  };
  protected readonly updateSelectedSection = (changes: Partial<FormBuilderSection>) => {
    const section = this.selectedSection();

    if (section) {
      this.updateSection(section, changes);
    }
  };

  protected paletteDragStarted(event: DragEvent, definition: FormBuilderFieldDefinition): void {
    this.suppressPaletteClick = true;
    this.nativeDragItem.set({ kind: 'field', definition });
    event.dataTransfer?.setData(PALETTE_DRAG_TYPE, definition.type);
    event.dataTransfer?.setData(PALETTE_DRAG_ITEM, 'field');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      this.setPaletteDragImage(event);
    }
  }

  protected sectionPaletteDragStarted(event: DragEvent): void {
    this.suppressPaletteClick = true;
    this.nativeDragItem.set({ kind: 'section' });
    event.dataTransfer?.setData(PALETTE_DRAG_ITEM, 'section');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      this.setPaletteDragImage(event);
    }
  }

  protected paletteDragEnded(): void {
    this.nativeDragItem.set(null);
    this.setNativeDropTarget(null);
    window.setTimeout(() => {
      this.suppressPaletteClick = false;
    });
  }

  protected paletteClicked(definition: FormBuilderFieldDefinition): void {
    if (this.suppressPaletteClick) {
      return;
    }

    this.addField(definition);
  }

  protected nativeCanvasDragOver(event: DragEvent): void {
    this.nativeDragOver(
      event,
      ROOT_DROP_LIST_ID,
      '.ngs-form-builder-field:not(.ngs-form-builder-native-ghost-field), .ngs-form-builder-section:not(.ngs-form-builder-native-ghost-section)'
    );
  }

  protected nativeFieldDragOver(event: DragEvent, containerId: string): void {
    if (this.nativeDragItem()?.kind === 'section') {
      return;
    }

    event.stopPropagation();
    this.nativeDragOver(event, containerId, '.ngs-form-builder-field:not(.ngs-form-builder-native-ghost-field)');
  }

  protected nativeSectionDragOver(event: DragEvent, section: FormBuilderSection): void {
    if (this.nativeDragItem()?.kind === 'section') {
      return;
    }

    event.stopPropagation();
    this.nativeDragOverAtIndex(event, this.sectionDropListId(section), section.fields.length);
  }

  protected nativeSectionDrop(event: DragEvent, section: FormBuilderSection): void {
    if (this.nativeDragItem()?.kind === 'section') {
      return;
    }

    event.stopPropagation();
    this.nativeFieldDrop(event, this.sectionDropListId(section));
  }

  protected nativeContainerFieldDragOver(event: DragEvent, field: FormBuilderField): void {
    if (!this.isContainerField(field)) {
      return;
    }

    if (this.nativeDragItem()?.kind === 'section') {
      return;
    }

    event.stopPropagation();
    this.nativeDragOverAtIndex(event, this.fieldDropListId(field), field.children?.length ?? 0);
  }

  protected nativeContainerFieldDragLeave(event: DragEvent, field: FormBuilderField): void {
    if (!this.isContainerField(field)) {
      return;
    }

    this.nativeDragLeave(event, this.fieldDropListId(field));
  }

  protected nativeContainerFieldDrop(event: DragEvent, field: FormBuilderField): void {
    if (!this.isContainerField(field)) {
      return;
    }

    if (this.nativeDragItem()?.kind === 'section') {
      return;
    }

    event.stopPropagation();
    this.nativeFieldDrop(event, this.fieldDropListId(field));
  }

  protected nativeDragLeave(event: DragEvent, containerId: string): void {
    const target = event.currentTarget;
    const relatedTarget = event.relatedTarget;

    if (
      target instanceof HTMLElement &&
      relatedTarget instanceof Node &&
      target.contains(relatedTarget)
    ) {
      return;
    }

    if (this.nativeDropTarget()?.containerId === containerId) {
      this.setNativeDropTarget(null);
    }
  }

  protected nativeFieldDrop(event: DragEvent, containerId: string): void {
    const item = this.resolveNativeDragItem(event);

    if (!item) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const target = this.nativeDropTarget();
    const index = target?.containerId === containerId ? target.index : 0;

    if (item.kind === 'section') {
      if (containerId !== ROOT_DROP_LIST_ID) {
        return;
      }

      this.insertNativeSection(index);
    } else {
      this.insertNativeField(item.definition, containerId, index);
    }

    this.nativeDragItem.set(null);
    this.setNativeDropTarget(null);
  }

  protected isNativeDropTarget(containerId: string, index: number): boolean {
    const target = this.nativeDropTarget();
    return target?.containerId === containerId && target.index === index;
  }

  protected addField(definition: FormBuilderFieldDefinition, sectionId?: string): void {
    const schema = cloneSchema(this.schema());
    const fields = sectionId
      ? schema.sections.find(item => item.id === sectionId)?.fields
      : schema.fields;

    if (!fields) {
      return;
    }

    const field = this.createField(definition, schema);
    const section = sectionId ? schema.sections.find(item => item.id === sectionId) : undefined;
    fields.push(field);
    if (!sectionId) {
      schema.layout = this.normalizedLayout(schema);
    }
    this.schema.set(schema);
    this.selectField(field, section);
    this.fieldAdded.emit({ field, section });
  }

  protected addSection(): void {
    const schema = cloneSchema(this.schema());
    schema.sections.push({
      id: uniqueId('section'),
      title: `Section ${schema.sections.length + 1}`,
      fields: []
    });
    schema.layout = this.normalizedLayout(schema);
    this.schema.set(schema);
  }

  protected openPreview(template: TemplateRef<unknown>): void {
    this.dialog.open(template, {
      width: '760px',
      maxWidth: 'calc(100vw - 48px)',
      maxHeight: 'calc(100vh - 48px)',
      ariaLabel: 'Form preview'
    });
  }

  protected removeSection(section: FormBuilderSection): void {
    const schema = cloneSchema(this.schema());
    schema.sections = schema.sections.filter(item => item.id !== section.id);
    schema.layout = this.normalizedLayout(schema).filter(item => !(item.kind === 'section' && item.id === section.id));

    if (schema.sections.length === 0) {
      const nextSection = {
        id: uniqueId('section'),
        title: 'Section',
        fields: []
      };
      schema.sections.push(nextSection);
      schema.layout = this.normalizedLayout(schema);
    }

    if (
      this.selectedFieldId() === section.id ||
      section.fields.some(field => field.id === this.selectedFieldId() || containsField(field, this.selectedFieldId()))
    ) {
      this.selectedFieldId.set(null);
    }

    this.schema.set(schema);
  }

  protected updateSection(section: FormBuilderSection, changes: Partial<FormBuilderSection>): void {
    const schema = cloneSchema(this.schema());
    const nextSection = schema.sections.find(item => item.id === section.id);

    if (!nextSection) {
      return;
    }

    Object.assign(nextSection, changes);
    this.schema.set(schema);
    this.restoreFieldTreeExpansion();
  }

  protected isSectionCollapsed(section: FormBuilderSection): boolean {
    return section.collapsed === true;
  }

  protected selectField(field: FormBuilderField, section?: FormBuilderSection): void {
    this.selectedFieldId.set(field.id);
    this.fieldSelected.emit({ field, section: section ?? undefined });
  }

  protected selectSection(section: FormBuilderSection): void {
    this.selectedFieldId.set(section.id);
  }

  protected selectCanvasField(field: FormBuilderField, section?: FormBuilderSection): void {
    this.selectField(field, section);
    this.openActualFieldsTreeForField(field.id);
  }

  protected selectFieldTreeNode(node: FormBuilderFieldTreeNode): void {
    if (node.section && !node.field) {
      this.selectSection(node.section);
      this.scrollCanvasSectionIntoView(node.section.id);
      return;
    }

    if (node.field) {
      if (node.section?.collapsed) {
        this.updateSection(node.section, { collapsed: false });
      }

      this.selectField(node.field, node.section);
      this.scrollCanvasFieldIntoView(node.field.id);
    }
  }

  protected toggleFieldTreeNode(
    tree: Tree<FormBuilderFieldTreeNode>,
    node: FormBuilderFieldTreeNode,
    event: MouseEvent
  ): void {
    event.stopPropagation();

    if (!node.children?.length) {
      return;
    }

    if (tree.isExpanded(node)) {
      tree.collapse(node);
      this.expandedFieldTreeNodeIds.update(ids => {
        const next = new Set(ids);
        next.delete(node.id);
        return next;
      });
      return;
    }

    tree.expand(node);
    this.expandedFieldTreeNodeIds.update(ids => new Set(ids).add(node.id));
  }

  protected isFieldTreeNodeExpanded(tree: Tree<FormBuilderFieldTreeNode>, node: FormBuilderFieldTreeNode): boolean {
    return tree.isExpanded(node) || this.expandedFieldTreeNodeIds().has(node.id);
  }

  protected fieldTreePlaceholderIcon(source: FormBuilderFieldTreeNode): string {
    return source.kind === 'section' ? 'fluent:folder-24-regular' : source.icon;
  }

  protected fieldTreeNodeDropped(event: TreeNodeDrop<FormBuilderFieldTreeNode>): void {
    if (event.source.kind === 'section') {
      this.dropFieldTreeSection(event);
      return;
    }

    if (
      event.source.kind !== 'field' ||
      event.source.id === event.target.id ||
      (event.target.kind === 'field' && event.position === 'inside' && !this.isContainerField(event.target.field!))
    ) {
      this.resetFieldTreeAfterRejectedDrop();
      return;
    }

    const schema = cloneSchema(this.schema());
    const sourceLocation = this.findFieldLocation(schema, event.source.id);

    if (!sourceLocation) {
      this.resetFieldTreeAfterRejectedDrop();
      return;
    }

    if (
      event.target.kind === 'field' &&
      (sourceLocation.field.id === event.target.id || containsField(sourceLocation.field, event.target.id))
    ) {
      this.resetFieldTreeAfterRejectedDrop();
      return;
    }

    const movingField = sourceLocation.field;
    this.detachFieldFromLocation(schema, sourceLocation);

    if (event.target.kind === 'section') {
      const inserted = event.position === 'inside'
        ? this.insertFieldIntoTreeSection(schema, movingField, event.target.id)
        : this.insertFieldAroundTreeSection(schema, movingField, event.target.id, event.position);

      if (inserted) {
        this.schema.set(schema);
        this.restoreFieldTreeExpansion();
        this.selectField(movingField, event.position === 'inside' ? inserted.section : undefined);
        return;
      }
    }

    if (event.target.kind === 'field') {
      const target = this.resolveTreeFieldInsertTarget(schema, event.target.id, event.position);

      if (target) {
        target.fields.splice(target.index, 0, movingField);
        if (target.fields === (schema.fields ?? [])) {
          this.insertRootFieldIntoLayout(schema, movingField, event.target.id, event.position);
        }
        this.schema.set(schema);
        this.restoreFieldTreeExpansion();
        this.selectField(movingField, target.section);
        return;
      }
    }

    this.resetFieldTreeAfterRejectedDrop();
  }

  protected confirmRemoveField(field: FormBuilderField): void {
    const confirmRef = this.confirmManager.open({
      title: 'Delete field',
      description: `Delete "${field.label}" from this form? This action cannot be undone.`
    });

    confirmRef.confirmed.subscribe(() => {
      this.removeField(field);
    });
  }

  private removeField(field: FormBuilderField): void {
    const schema = cloneSchema(this.schema());
    const location = this.findFieldLocation(schema, field.id);

    if (!location) {
      return;
    }

    location.siblings.splice(location.index, 1);
    schema.layout = this.normalizedLayout(schema).filter(item => !(item.kind === 'field' && item.id === field.id));
    this.deletePreviewControls(field);

    if (this.selectedFieldId() === field.id || containsField(field, this.selectedFieldId())) {
      this.selectedFieldId.set(null);
    }

    this.schema.set(schema);
    this.fieldRemoved.emit({ field, section: location.section });
  }

  protected sectionDropListId(section: FormBuilderSection): string {
    return `ngs-form-builder-section-${section.id}`;
  }

  protected fieldDropListId(field: FormBuilderField): string {
    return `ngs-form-builder-field-${field.id}`;
  }

  protected rootDropListId(): string {
    return ROOT_DROP_LIST_ID;
  }

  protected previewControl(field: FormBuilderField): FormControl {
    const existing = this.previewControls.get(field.id);

    if (existing) {
      return existing;
    }

    const control = new FormControl({
      value: this.fieldInitialValue(field),
      disabled: true
    });
    this.previewControls.set(field.id, control);
    return control;
  }

  protected patchSelectedField(changes: Partial<FormBuilderField>): void {
    const selectedId = this.selectedFieldId();

    if (!selectedId) {
      return;
    }

    const schema = cloneSchema(this.schema());
    const location = this.findFieldLocation(schema, selectedId);

    if (!location) {
      return;
    }

    const nextField = {
      ...location.field,
      ...changes
    };

    if (this.isContainerField(nextField) && !nextField.children) {
      nextField.children = [];
    }

    location.siblings[location.index] = nextField;
    this.schema.set(schema);
    this.syncPreviewControl(nextField);
  }

  protected isContainerField(field: FormBuilderField): boolean {
    const definition = this.definitions().find(item => item.type === field.type);

    return definition?.acceptsChildren === true ||
      definition?.kind === 'layout' ||
      field.kind === 'layout' ||
      field.type === 'group' ||
      field.type === 'grid';
  }

  protected fieldIcon(field: FormBuilderField): string {
    return this.definitions().find(definition => definition.type === field.type)?.icon || 'fluent:form-24-regular';
  }

  protected definitionWidth(definition: FormBuilderFieldDefinition): FormBuilderFieldWidth {
    return definition.defaults?.width ?? this.defaultWidth(definition.type);
  }

  private matchesPaletteQuery(definition: FormBuilderFieldDefinition, query: string): boolean {
    return !query ||
      definition.label.toLowerCase().includes(query) ||
      definition.type.toLowerCase().includes(query) ||
      (definition.description?.toLowerCase().includes(query) ?? false);
  }

  private nativeDragOver(event: DragEvent, containerId: string, itemSelector: string): void {
    const item = this.nativeDragItem();

    if (!item || (item.kind === 'section' && containerId !== ROOT_DROP_LIST_ID)) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }

    this.setNativeDropTarget({
      containerId,
      index: this.resolveNativeDropIndex(event, itemSelector)
    });
  }

  private nativeDragOverAtIndex(event: DragEvent, containerId: string, index: number): void {
    const item = this.nativeDragItem();

    if (!item || item.kind === 'section') {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }

    this.setNativeDropTarget({ containerId, index });
  }

  private setNativeDropTarget(target: { containerId: string; index: number } | null): void {
    const current = this.nativeDropTarget();

    if (current?.containerId === target?.containerId && current?.index === target?.index) {
      return;
    }

    const previousRects = this.captureCanvasItemRects();
    this.nativeDropTarget.set(target);
    this.afterNextPaint(() => this.animateCanvasItemMoves(previousRects));
  }

  private captureCanvasItemRects(): Map<string, DOMRect> {
    const rects = new Map<string, DOMRect>();

    for (const element of this.getCanvasAnimatedItems()) {
      const key = this.getCanvasAnimatedItemKey(element);

      if (key) {
        rects.set(key, element.getBoundingClientRect());
      }
    }

    return rects;
  }

  private animateCanvasItemMoves(previousRects: Map<string, DOMRect>): void {
    if (!previousRects.size) {
      return;
    }

    for (const element of this.getCanvasAnimatedItems()) {
      const key = this.getCanvasAnimatedItemKey(element);
      const previousRect = key ? previousRects.get(key) : undefined;

      if (!previousRect) {
        continue;
      }

      const nextRect = element.getBoundingClientRect();
      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        continue;
      }

      const animationTimer = this.canvasAnimationTimers.get(element);

      if (animationTimer) {
        window.clearTimeout(animationTimer);
      }

      element.style.transition = 'none';
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      element.getBoundingClientRect();
      element.style.transition = 'transform 160ms cubic-bezier(0, 0, 0.2, 1)';
      element.style.transform = '';
      this.canvasAnimationTimers.set(element, window.setTimeout(() => {
        element.style.transition = '';
        element.style.transform = '';
      }, 180));
    }
  }

  private getCanvasAnimatedItems(): HTMLElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
      '.ngs-form-builder-canvas [data-form-builder-field-id], .ngs-form-builder-canvas [data-form-builder-section-id]'
    ));
  }

  private getCanvasAnimatedItemKey(element: HTMLElement): string | null {
    const fieldId = element.dataset['formBuilderFieldId'];

    if (fieldId) {
      return `field:${fieldId}`;
    }

    const sectionId = element.dataset['formBuilderSectionId'];
    return sectionId ? `section:${sectionId}` : null;
  }

  private insertNativeField(definition: FormBuilderFieldDefinition, containerId: string, index: number): void {
    const schema = cloneSchema(this.schema());
    const field = this.createField(definition, schema);

    if (containerId === ROOT_DROP_LIST_ID) {
      const layout = this.normalizedLayout(schema);
      schema.fields ??= [];
      schema.fields.push(field);
      layout.splice(clampIndex(index, layout.length), 0, { kind: 'field', id: field.id });
      schema.layout = layout;
      this.schema.set(schema);
      this.selectField(field);
      this.fieldAdded.emit({ field });
      return;
    }

    const targetContainer = this.findContainerLocation(schema, containerId);

    if (!targetContainer) {
      return;
    }

    targetContainer.fields.splice(clampIndex(index, targetContainer.fields.length), 0, field);
    this.schema.set(schema);
    this.selectField(field, targetContainer.section);
    this.fieldAdded.emit({ field, section: targetContainer.section });
  }

  private insertNativeSection(index: number): void {
    const schema = cloneSchema(this.schema());
    const section = {
      id: uniqueId('section'),
      title: `Section ${schema.sections.length + 1}`,
      fields: []
    };
    const layout = this.normalizedLayout(schema);

    schema.sections.push(section);
    layout.splice(clampIndex(index, layout.length), 0, { kind: 'section', id: section.id });
    schema.layout = layout;
    this.schema.set(schema);
  }

  private resolveNativeDragItem(event: DragEvent): FormBuilderNativeDragItem | null {
    const currentItem = this.nativeDragItem();

    if (currentItem) {
      return currentItem;
    }

    if (event.dataTransfer?.getData(PALETTE_DRAG_ITEM) === 'section') {
      return { kind: 'section' };
    }

    const type = event.dataTransfer?.getData(PALETTE_DRAG_TYPE);
    const definition = type ? this.definitions().find(item => item.type === type) ?? null : null;
    return definition ? { kind: 'field', definition } : null;
  }

  private resolveNativeDropIndex(event: DragEvent, itemSelector: string): number {
    const container = event.currentTarget;

    if (!(container instanceof HTMLElement)) {
      return 0;
    }

    const items = Array.from(container.children).filter((child): child is HTMLElement => {
      return child instanceof HTMLElement && child.matches(itemSelector);
    });

    for (let index = 0; index < items.length; index += 1) {
      const rect = items[index].getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const centerX = rect.left + rect.width / 2;
      const sameRow = event.clientY >= rect.top && event.clientY <= rect.bottom;

      if (event.clientY < centerY || (sameRow && event.clientX < centerX)) {
        return index;
      }
    }

    return items.length;
  }

  private setPaletteDragImage(event: DragEvent): void {
    const source = event.currentTarget;

    if (!(source instanceof HTMLElement) || !event.dataTransfer) {
      return;
    }

    const clone = source.cloneNode(true);

    if (!(clone instanceof HTMLElement)) {
      return;
    }

    clone.classList.add('ngs-form-builder-native-drag-image');
    source.parentElement?.appendChild(clone);
    const rect = source.getBoundingClientRect();
    event.dataTransfer.setDragImage(clone, Math.min(event.offsetX, rect.width), Math.min(event.offsetY, rect.height));
    window.setTimeout(() => clone.remove());
  }

  private createField(definition: FormBuilderFieldDefinition, schema: FormBuilderSchema): FormBuilderField {
    const baseLabel = definition.defaults?.label || definition.label;
    const name = uniqueFieldName(toFieldName(baseLabel), schema);
    const kind = definition.defaults?.kind ?? definition.kind ?? 'field';

    const field: FormBuilderField = {
      id: uniqueId('field'),
      name,
      type: definition.type,
      kind,
      label: baseLabel,
      width: definition.defaults?.width ?? this.defaultWidth(definition.type),
      visibility: {
        form: true,
        email: true,
        pdf: true
      },
      ...definition.defaults
    };

    if (field.defaultValue === undefined) {
      field.defaultValue = this.fieldInitialValue(field);
    }

    return field;
  }

  private defaultWidth(type: string): FormBuilderFieldWidth {
    return 12;
  }

  private resolveCanvasItems(schema: FormBuilderSchema): FormBuilderCanvasItem[] {
    const fieldsById = new Map((schema.fields ?? []).map(field => [field.id, field]));
    const sectionsById = new Map(schema.sections.map(section => [section.id, section]));
    const items: FormBuilderCanvasItem[] = [];

    for (const item of this.normalizedLayout(schema)) {
      if (item.kind === 'field') {
        const field = fieldsById.get(item.id);

        if (field) {
          items.push({ ...item, field });
        }

        continue;
      }

      const section = sectionsById.get(item.id);

      if (section) {
        items.push({ ...item, section });
      }
    }

    return items;
  }

  private normalizedLayout(schema: FormBuilderSchema): FormBuilderLayoutItem[] {
    const used = new Set<string>();
    const layout: FormBuilderLayoutItem[] = [];
    const fieldsById = new Map((schema.fields ?? []).map(field => [field.id, field]));
    const sectionsById = new Map(schema.sections.map(section => [section.id, section]));

    for (const item of schema.layout ?? []) {
      const key = `${item.kind}:${item.id}`;

      if (used.has(key)) {
        continue;
      }

      if ((item.kind === 'field' && fieldsById.has(item.id)) || (item.kind === 'section' && sectionsById.has(item.id))) {
        used.add(key);
        layout.push(item);
      }
    }

    for (const field of schema.fields ?? []) {
      const key = `field:${field.id}`;

      if (!used.has(key)) {
        used.add(key);
        layout.push({ kind: 'field', id: field.id });
      }
    }

    for (const section of schema.sections) {
      const key = `section:${section.id}`;

      if (!used.has(key)) {
        used.add(key);
        layout.push({ kind: 'section', id: section.id });
      }
    }

    return layout;
  }

  private detachFieldFromLocation(schema: FormBuilderSchema, location: FormBuilderFieldLocation): void {
    location.siblings.splice(location.index, 1);

    if (location.siblings === (schema.fields ?? [])) {
      schema.layout = this.normalizedLayout(schema).filter(item => !(item.kind === 'field' && item.id === location.field.id));
    }
  }

  private insertFieldIntoTreeSection(
    schema: FormBuilderSchema,
    field: FormBuilderField,
    sectionId: string
  ): FormBuilderTreeInsertTarget | null {
    const section = schema.sections.find(item => item.id === sectionId);

    if (!section) {
      return null;
    }

    section.fields.push(field);
    return {
      fields: section.fields,
      index: section.fields.length - 1,
      section
    };
  }

  private insertFieldAroundTreeSection(
    schema: FormBuilderSchema,
    field: FormBuilderField,
    sectionId: string,
    position: 'before' | 'after' | 'inside'
  ): FormBuilderTreeInsertTarget | null {
    if (position === 'inside') {
      return this.insertFieldIntoTreeSection(schema, field, sectionId);
    }

    const section = schema.sections.find(item => item.id === sectionId);

    if (!section) {
      return null;
    }

    schema.fields ??= [];

    if (!schema.fields.some(item => item.id === field.id)) {
      schema.fields.push(field);
    }

    const layout = this.normalizedLayout(schema).filter(item => !(item.kind === 'field' && item.id === field.id));
    const sectionIndex = layout.findIndex(item => item.kind === 'section' && item.id === sectionId);
    layout.splice(sectionIndex === -1 ? layout.length : sectionIndex + (position === 'after' ? 1 : 0), 0, {
      kind: 'field',
      id: field.id
    });
    schema.layout = layout;

    return {
      fields: schema.fields,
      index: schema.fields.findIndex(item => item.id === field.id)
    };
  }

  private resolveTreeFieldInsertTarget(
    schema: FormBuilderSchema,
    targetFieldId: string,
    position: 'before' | 'inside' | 'after'
  ): FormBuilderTreeInsertTarget | null {
    const targetLocation = this.findFieldLocation(schema, targetFieldId);

    if (!targetLocation) {
      return null;
    }

    if (position === 'inside' && this.isContainerField(targetLocation.field)) {
      targetLocation.field.children ??= [];
      return {
        fields: targetLocation.field.children,
        index: targetLocation.field.children.length,
        section: targetLocation.section
      };
    }

    const insertIndex = position === 'before' ? targetLocation.index : targetLocation.index + 1;
    return {
      fields: targetLocation.siblings,
      index: insertIndex,
      section: targetLocation.section
    };
  }

  private insertRootFieldIntoLayout(
    schema: FormBuilderSchema,
    field: FormBuilderField,
    targetFieldId: string,
    position: 'before' | 'inside' | 'after'
  ): void {
    schema.fields ??= [];

    if (!schema.fields.some(item => item.id === field.id)) {
      schema.fields.push(field);
    }

    const layout = this.normalizedLayout(schema).filter(item => !(item.kind === 'field' && item.id === field.id));
    const targetIndex = layout.findIndex(item => item.kind === 'field' && item.id === targetFieldId);
    layout.splice(targetIndex === -1 ? layout.length : targetIndex + (position === 'before' ? 0 : 1), 0, {
      kind: 'field',
      id: field.id
    });
    schema.layout = layout;
  }

  private resetFieldTreeAfterRejectedDrop(): void {
    this.schema.set(cloneSchema(this.schema()));
    this.restoreFieldTreeExpansion();
  }

  private canDropFieldTreeNode(
    source: FormBuilderFieldTreeNode,
    target: FormBuilderFieldTreeNode,
    position: TreeNodeDropPosition
  ): boolean {
    if (source.id === target.id) {
      return false;
    }

    if (source.kind === 'section') {
      return position !== 'inside' && (target.kind === 'section' || this.isRootFieldTreeNode(target));
    }

    if (target.kind === 'field' && position === 'inside') {
      return !!target.field && this.isContainerField(target.field);
    }

    return true;
  }

  private dropFieldTreeSection(event: TreeNodeDrop<FormBuilderFieldTreeNode>): void {
    if (!this.canDropFieldTreeNode(event.source, event.target, event.position)) {
      this.resetFieldTreeAfterRejectedDrop();
      return;
    }

    const schema = cloneSchema(this.schema());
    const layout = this.normalizedLayout(schema);
    const sourceIndex = layout.findIndex(item => item.kind === 'section' && item.id === event.source.id);
    const targetKind = event.target.kind === 'section' ? 'section' : 'field';
    const targetIndex = layout.findIndex(item => item.kind === targetKind && item.id === event.target.id);

    if (sourceIndex < 0 || targetIndex < 0) {
      this.resetFieldTreeAfterRejectedDrop();
      return;
    }

    const [sectionItem] = layout.splice(sourceIndex, 1);
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    layout.splice(adjustedTargetIndex + (event.position === 'after' ? 1 : 0), 0, sectionItem);
    schema.layout = layout;
    this.schema.set(schema);
    this.restoreFieldTreeExpansion();
  }

  private isRootFieldTreeNode(node: FormBuilderFieldTreeNode): boolean {
    if (node.kind !== 'field') {
      return false;
    }

    return this.resolveCanvasItems(this.schema()).some(item => item.kind === 'field' && item.id === node.id);
  }

  private restoreFieldTreeExpansion(): void {
    const expandedIds = this.expandedFieldTreeNodeIds();

    if (!expandedIds.size) {
      return;
    }

    this.afterNextPaint(() => {
      this.afterNextPaint(() => {
        const tree = this.actualFieldsTree();

        if (!tree) {
          return;
        }

        for (const node of this.flattenFieldTree(this.fieldTree())) {
          if (node.children?.length && expandedIds.has(node.id)) {
            tree.expand(node);
          }
        }
      });
    });
  }

  private flattenFieldTree(nodes: FormBuilderFieldTreeNode[]): FormBuilderFieldTreeNode[] {
    return nodes.flatMap(node => [node, ...this.flattenFieldTree(node.children ?? [])]);
  }

  private openActualFieldsTreeForField(fieldId: string): void {
    const path = this.findFieldTreeNodePath(this.fieldTree(), fieldId);

    this.fieldsTabIndex.set(ACTUAL_FIELDS_TAB_INDEX);

    if (!path.length) {
      return;
    }

    const expandableIds = path
      .slice(0, -1)
      .filter(node => !!node.children?.length)
      .map(node => node.id);

    if (expandableIds.length) {
      this.expandedFieldTreeNodeIds.update(ids => {
        const next = new Set(ids);

        for (const id of expandableIds) {
          next.add(id);
        }

        return next;
      });
    }

    this.afterNextPaint(() => {
      this.afterNextPaint(() => {
        const tree = this.actualFieldsTree();

        if (tree) {
          for (const node of path.slice(0, -1)) {
            if (node.children?.length) {
              tree.expand(node);
            }
          }
        }

        this.scrollFieldTreeNodeIntoView(fieldId);
      });
    });
  }

  private findFieldTreeNodePath(
    nodes: FormBuilderFieldTreeNode[],
    fieldId: string,
    path: FormBuilderFieldTreeNode[] = []
  ): FormBuilderFieldTreeNode[] {
    for (const node of nodes) {
      const nextPath = [...path, node];

      if (node.id === fieldId) {
        return nextPath;
      }

      const childPath = this.findFieldTreeNodePath(node.children ?? [], fieldId, nextPath);

      if (childPath.length) {
        return childPath;
      }
    }

    return [];
  }

  private scrollFieldTreeNodeIntoView(fieldId: string): void {
    const target = this.findFieldTreeNodeElement(fieldId);

    if (!target) {
      return;
    }

    const scrollableContent = target
      .closest('ngs-scrollbar-area')
      ?.querySelector<HTMLElement>('.scrollable-content');

    if (!scrollableContent) {
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      return;
    }

    this.scrollElementFullyIntoView(target, scrollableContent);
  }

  private findFieldTreeNodeElement(fieldId: string): HTMLElement | null {
    const nodes = this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
      '.ngs-form-builder-palette [data-form-builder-tree-node-id]'
    );

    return Array.from(nodes).find(node => node.dataset['formBuilderTreeNodeId'] === fieldId) ?? null;
  }

  private scrollCanvasFieldIntoView(fieldId: string): void {
    this.scrollCanvasItemIntoView(() => this.findCanvasFieldElement(fieldId));
  }

  private scrollCanvasSectionIntoView(sectionId: string): void {
    this.scrollCanvasItemIntoView(() => this.findCanvasSectionElement(sectionId));
  }

  private scrollCanvasItemIntoView(resolveTarget: () => HTMLElement | null): void {
    this.afterNextPaint(() => {
      this.afterNextPaint(() => {
        const target = resolveTarget();

        if (!target) {
          return;
        }

        const scrollableContent = target
          .closest('ngs-scrollbar-area')
          ?.querySelector<HTMLElement>('.scrollable-content');

        if (!scrollableContent) {
          target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          return;
        }

        this.scrollElementFullyIntoView(target, scrollableContent);
      });
    });
  }

  private findCanvasFieldElement(fieldId: string): HTMLElement | null {
    const fields = this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
      '.ngs-form-builder-canvas [data-form-builder-field-id]'
    );

    return Array.from(fields).find(field => field.dataset['formBuilderFieldId'] === fieldId) ?? null;
  }

  private findCanvasSectionElement(sectionId: string): HTMLElement | null {
    const sections = this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
      '.ngs-form-builder-canvas [data-form-builder-section-id]'
    );

    return Array.from(sections).find(section => section.dataset['formBuilderSectionId'] === sectionId) ?? null;
  }

  private syncPreviewControl(field: FormBuilderField): void {
    const control = this.previewControls.get(field.id);

    if (!control) {
      return;
    }

    queueMicrotask(() => {
      const value = this.fieldInitialValue(field);

      if (control.value !== value) {
        control.setValue(value, { emitEvent: false });
      }

      if (control.enabled) {
        control.disable({ emitEvent: false });
      }
    });
  }

  private fieldInitialValue(field: FormBuilderField): any {
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    if (field.type === 'upload') {
      return field.multiple ? [] : null;
    }

    const selectedValues = (field.options ?? [])
      .filter(option => option.selected)
      .map(option => option.value);

    if (field.type === 'checkbox-list' || field.multiple) {
      return selectedValues;
    }

    return selectedValues[0] ?? null;
  }

  private scrollElementFullyIntoView(target: HTMLElement, scrollableContent: HTMLElement): void {
    const padding = 16;
    const containerRect = scrollableContent.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const availableHeight = Math.max(0, containerRect.height - padding * 2);
    const availableWidth = Math.max(0, containerRect.width - padding * 2);
    let top = scrollableContent.scrollTop;
    let left = scrollableContent.scrollLeft;

    if (targetRect.height > availableHeight || targetRect.top < containerRect.top + padding) {
      top += targetRect.top - containerRect.top - padding;
    } else if (targetRect.bottom > containerRect.bottom - padding) {
      top += targetRect.bottom - containerRect.bottom + padding;
    }

    if (targetRect.width > availableWidth || targetRect.left < containerRect.left + padding) {
      left += targetRect.left - containerRect.left - padding;
    } else if (targetRect.right > containerRect.right - padding) {
      left += targetRect.right - containerRect.right + padding;
    }

    scrollableContent.scrollTo({
      top: Math.max(0, top),
      left: Math.max(0, left),
      behavior: 'smooth'
    });
  }

  private afterNextPaint(callback: () => void): void {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(callback);
      return;
    }

    window.setTimeout(callback);
  }

  private upsertSectionTreeNode(section: FormBuilderSection): FormBuilderFieldTreeNode {
    const node = this.getCachedFieldTreeNode(section.id);
    const children = section.fields.map(field => this.upsertFieldTreeNode(field, section));

    node.label = section.title;
    node.name = undefined;
    node.type = 'section';
    node.icon = 'fluent:folder-24-regular';
    node.kind = 'section';
    node.field = undefined;
    node.section = section;
    node.children ??= [];
    replaceArrayContents(node.children, children);
    return node;
  }

  private upsertFieldTreeNode(field: FormBuilderField, section?: FormBuilderSection): FormBuilderFieldTreeNode {
    const definition = this.definitions().find(item => item.type === field.type);
    const node = this.getCachedFieldTreeNode(field.id);
    const children = field.children?.map(child => this.upsertFieldTreeNode(child, section));

    node.label = field.label;
    node.name = field.name;
    node.type = field.type;
    node.icon = definition?.icon || 'fluent:form-24-regular';
    node.kind = 'field';
    node.field = field;
    node.section = section;

    if (children?.length) {
      node.children ??= [];
      replaceArrayContents(node.children, children);
    } else {
      node.children = undefined;
    }

    return node;
  }

  private getCachedFieldTreeNode(id: string): FormBuilderFieldTreeNode {
    const cached = this.fieldTreeNodeCache.get(id);

    if (cached) {
      return cached;
    }

    const node: FormBuilderFieldTreeNode = {
      id,
      label: '',
      type: '',
      icon: 'fluent:form-24-regular',
      kind: 'field'
    };

    this.fieldTreeNodeCache.set(id, node);
    return node;
  }

  private resolveFieldTreeStructureKey(nodes: FormBuilderFieldTreeNode[]): string {
    return nodes
      .map(node => `${node.kind}:${node.id}[${this.resolveFieldTreeStructureKey(node.children ?? [])}]`)
      .join('|');
  }

  private findContainerLocation(schema: FormBuilderSchema, containerId: string): FormBuilderContainerLocation | null {
    if (containerId === ROOT_DROP_LIST_ID) {
      return {
        id: containerId,
        fields: schema.fields ?? []
      };
    }

    const rootNested = this.findFieldContainerLocation(schema.fields ?? [], undefined, containerId);

    if (rootNested) {
      return rootNested;
    }

    for (const section of schema.sections) {
      if (this.sectionDropListId(section) === containerId) {
        return {
          id: containerId,
          fields: section.fields,
          section
        };
      }

      const nested = this.findFieldContainerLocation(section.fields, section, containerId);

      if (nested) {
        return nested;
      }
    }

    return null;
  }

  private findFieldContainerLocation(
    fields: FormBuilderField[],
    section: FormBuilderSection | undefined,
    containerId: string
  ): FormBuilderContainerLocation | null {
    for (const field of fields) {
      if (this.isContainerField(field) && this.fieldDropListId(field) === containerId) {
        field.children ??= [];

        return {
          id: containerId,
          fields: field.children,
          section,
          owner: field
        };
      }

      const nested = this.findFieldContainerLocation(field.children ?? [], section, containerId);

      if (nested) {
        return nested;
      }
    }

    return null;
  }

  private findFieldLocation(schema: FormBuilderSchema, fieldId: string): FormBuilderFieldLocation | null {
    const rootLocation = findFieldLocationInFields(schema.fields ?? [], fieldId);

    if (rootLocation) {
      return rootLocation;
    }

    for (const section of schema.sections) {
      const location = findFieldLocationInFields(section.fields, fieldId, section);

      if (location) {
        return location;
      }
    }

    return null;
  }

  private deletePreviewControls(field: FormBuilderField): void {
    this.previewControls.delete(field.id);

    for (const child of field.children ?? []) {
      this.deletePreviewControls(child);
    }
  }
}

export function createDefaultFormBuilderSchema(): FormBuilderSchema {
  const sectionId = uniqueId('section');

  return {
    title: 'New form',
    fields: [],
    layout: [{ kind: 'section', id: sectionId }],
    sections: [
      {
        id: sectionId,
        title: 'General information',
        fields: []
      }
    ]
  };
}

function uniqueId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function cloneSchema(schema: FormBuilderSchema): FormBuilderSchema {
  return {
    ...schema,
    fields: (schema.fields ?? []).map(cloneField),
    layout: schema.layout?.map(item => ({ ...item })),
    sections: schema.sections.map(section => ({
      ...section,
      fields: section.fields.map(cloneField)
    }))
  };
}

function cloneField(field: FormBuilderField): FormBuilderField {
  return {
    ...field,
    options: field.options?.map(option => ({ ...option })),
    validation: field.validation?.map(rule => ({ ...rule })),
    visibility: field.visibility ? { ...field.visibility } : undefined,
    settings: field.settings ? { ...field.settings } : undefined,
    children: field.children?.map(cloneField)
  };
}

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, length));
}

function replaceArrayContents<T>(target: T[], source: T[]): void {
  target.splice(0, target.length, ...source);
}

function normalizeFieldDefinition(definition: FormBuilderItemDefinition): FormBuilderFieldDefinition {
  return {
    ...definition,
    kind: definition.kind ?? 'field'
  } as FormBuilderFieldDefinition;
}

function toFieldName(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'field';
}

function uniqueFieldName(baseName: string, schema: FormBuilderSchema): string {
  const usedNames = new Set(
    [
      ...(schema.fields ?? []).flatMap(field => collectFieldNames(field)),
      ...schema.sections.flatMap(section => section.fields.flatMap(field => collectFieldNames(field)))
    ]
  );

  if (!usedNames.has(baseName)) {
    return baseName;
  }

  let index = 2;
  let nextName = `${baseName}_${index}`;

  while (usedNames.has(nextName)) {
    index += 1;
    nextName = `${baseName}_${index}`;
  }

  return nextName;
}

function collectFieldNames(field: FormBuilderField): string[] {
  return [field.name, ...(field.children ?? []).flatMap(collectFieldNames)];
}

function findFieldLocationInFields(
  fields: FormBuilderField[],
  fieldId: string,
  section?: FormBuilderSection
): FormBuilderFieldLocation | null {
  const index = fields.findIndex(field => field.id === fieldId);

  if (index !== -1) {
    return {
      field: fields[index],
      section,
      siblings: fields,
      index
    };
  }

  for (const field of fields) {
    const location = findFieldLocationInFields(field.children ?? [], fieldId, section);

    if (location) {
      return location;
    }
  }

  return null;
}

function containsField(field: FormBuilderField, fieldId: string | null): boolean {
  if (!fieldId) {
    return false;
  }

  return (field.children ?? []).some(child => child.id === fieldId || containsField(child, fieldId));
}
