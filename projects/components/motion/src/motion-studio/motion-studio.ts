import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Checkbox, CheckboxChange } from '@ngstarter-ui/components/checkbox';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import {
  ColorPicker,
  ColorPickerThumbnail,
  ColorPickerTriggerForDirective,
} from '@ngstarter-ui/components/color-picker';
import { FormField, Label, Suffix } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import {
  Panel,
  PanelAside,
  PanelContent,
  PanelFooter,
  PanelHeader,
  PanelSidebar,
} from '@ngstarter-ui/components/panel';
import { Drawer } from '@ngstarter-ui/components/drawer';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Segmented, SegmentedButton } from '@ngstarter-ui/components/segmented';
import { Option, Select, SelectChange } from '@ngstarter-ui/components/select';
import { Slider, SliderThumb } from '@ngstarter-ui/components/slider';
import {
  TabPanel,
  TabPanelAside,
  TabPanelAsideContentDirective,
  TabPanelContent,
  TabPanelItem,
  TabPanelItemIconDirective,
  TabPanelItemText,
  TabPanelNav,
} from '@ngstarter-ui/components/tab-panel';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';
import {
  MotionDocument,
  MotionEditorSettings,
  MotionEasingName,
  MotionAnimation,
  MotionAsset,
  MotionKeyframe,
  MotionLayer,
  MotionLayerType,
  MotionLayout,
  MotionScene,
  MotionStyle,
  MotionTransition,
  MotionValue,
  createDefaultMotionDocument,
  validateMotionDocument,
} from '../schema/motion-document';
import {
  applyMotionTransition,
  coerceMotionString,
  flattenMotionLayers,
  resolveMotionLayerSnapshot,
} from '../engine/motion-engine';
import { MOTION_PRESETS, MotionPreset } from '../presets/motion-presets';
import { MotionPlayer } from '../motion-player/motion-player';

@Component({
  selector: 'ngs-motion-studio',
  imports: [
    Button,
    Checkbox,
    Chip,
    ChipSet,
    ColorPicker,
    ColorPickerThumbnail,
    ColorPickerTriggerForDirective,
    Drawer,
    FormField,
    FormsModule,
    Icon,
    Input,
    Label,
    MotionPlayer,
    NgStyle,
    Panel,
    PanelAside,
    PanelContent,
    PanelFooter,
    PanelHeader,
    PanelSidebar,
    Option,
    ScrollbarArea,
    Segmented,
    SegmentedButton,
    Select,
    Slider,
    SliderThumb,
    Suffix,
    TabPanel,
    TabPanelAside,
    TabPanelAsideContentDirective,
    TabPanelContent,
    TabPanelItem,
    TabPanelItemIconDirective,
    TabPanelItemText,
    TabPanelNav,
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle,
  ],
  templateUrl: './motion-studio.html',
  styleUrl: './motion-studio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-motion-studio',
  },
})
export class MotionStudio {
  readonly document = input<MotionDocument | null>(createDefaultMotionDocument());
  readonly documentChange = output<MotionDocument>();

  protected readonly draft = signal<MotionDocument>(createDefaultMotionDocument());
  protected readonly currentTime = signal(0);
  protected readonly playing = signal(false);
  protected readonly selectedLayerId = signal<string | null>(null);
  protected readonly selectedLayerIds = signal<string[]>([]);
  protected readonly selectedKeyframe = signal<SelectedKeyframeRef | null>(null);
  protected readonly selectedKeyframes = signal<SelectedKeyframeRef[]>([]);
  protected readonly keyframeSnapGuide = signal<KeyframeSnapGuide | null>(null);
  protected readonly timelineSelectionBox = signal<TimelineSelectionBox | null>(null);
  protected readonly selectedSceneId = signal<string | null>(null);
  protected readonly expandedAnimationLayerIds = signal<string[]>([]);
  protected readonly presets = signal<MotionPreset[]>(MOTION_PRESETS);
  protected readonly presetCategoryGroups: Array<{
    label: string;
    category: MotionPreset['category'];
  }> = [
    { label: 'Scenes', category: 'scene' },
    { label: 'Lower thirds', category: 'lower-third' },
    { label: 'Metrics', category: 'metric' },
    { label: 'Backgrounds', category: 'background' },
  ];
  protected readonly gridVisible = signal(true);
  protected readonly snapToGrid = signal(false);
  protected readonly gridSize = signal(80);
  protected readonly canvasInteractionType = signal<CanvasInteraction['type'] | null>(null);
  protected readonly draggedPresetId = signal<string | null>(null);
  protected readonly editingTextLayerId = signal<string | null>(null);
  protected readonly fontFamilies = [
    { label: 'DM Sans', value: 'DM Sans, Segoe UI, Roboto, Helvetica, Arial, sans-serif' },
    { label: 'Inter', value: 'Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif' },
    { label: 'Segoe UI', value: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif' },
    { label: 'Roboto', value: 'Roboto, Helvetica, Arial, sans-serif' },
    { label: 'Helvetica Neue', value: 'Helvetica Neue, Helvetica, Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, Times New Roman, serif' },
    { label: 'Times New Roman', value: 'Times New Roman, Times, serif' },
    { label: 'Courier New', value: 'Courier New, Courier, monospace' },
  ];
  protected readonly fontWeights = [
    { label: 'Light', value: 300 },
    { label: 'Regular', value: 400 },
    { label: 'Medium', value: 500 },
    { label: 'Semi', value: 600 },
    { label: 'Bold', value: 700 },
    { label: 'Extra', value: 800 },
    { label: 'Black', value: 900 },
  ];
  protected readonly objectFitOptions: Array<{
    label: string;
    value: NonNullable<MotionStyle['objectFit']>;
  }> = [
    { label: 'Cover', value: 'cover' },
    { label: 'Contain', value: 'contain' },
    { label: 'Fill', value: 'fill' },
    { label: 'None', value: 'none' },
    { label: 'Scale down', value: 'scale-down' },
  ];
  protected readonly animationProperties = [
    { label: 'Opacity', value: 'opacity' },
    { label: 'X', value: 'x' },
    { label: 'Y', value: 'y' },
    { label: 'Scale', value: 'scale' },
    { label: 'Rotate', value: 'rotation' },
    { label: 'Width', value: 'width' },
    { label: 'Height', value: 'height' },
    { label: 'Font size', value: 'fontSize' },
    { label: 'Color', value: 'color' },
    { label: 'Background', value: 'background' },
  ];
  protected readonly animationPresets: Array<{
    label: string;
    value: MotionAnimationPresetType;
  }> = [
    { label: 'Fade', value: 'fade' },
    { label: 'Slide up', value: 'slideUp' },
    { label: 'Pop', value: 'pop' },
    { label: 'Pulse', value: 'pulse' },
    { label: 'Count up', value: 'countUp' },
  ];
  protected readonly selectedAnimationPreset = signal<MotionAnimationPresetType>('fade');
  protected readonly animationPresetApplyMode = signal<MotionAnimationApplyMode>('append');
  protected readonly animationPresetApplyModes: Array<{
    label: string;
    value: MotionAnimationApplyMode;
  }> = [
    { label: 'Append', value: 'append' },
    { label: 'Replace', value: 'replace' },
    { label: 'Merge', value: 'merge' },
  ];
  protected readonly animationPresetSettings = signal<MotionAnimationPresetSettings>({
    duration: 700,
    delay: 0,
    easing: 'easeOutCubic',
    direction: 'up',
    distance: 80,
  });
  protected readonly easingOptions: Array<{ label: string; value: MotionEasingName }> = [
    { label: 'Linear', value: 'linear' },
    { label: 'Ease in', value: 'easeInCubic' },
    { label: 'Ease out', value: 'easeOutCubic' },
    { label: 'Ease in out', value: 'easeInOutCubic' },
    { label: 'Smooth', value: 'smooth' },
    { label: 'Overshoot', value: 'easeOutBack' },
    { label: 'Bounce', value: 'easeOutBounce' },
    { label: 'Quad in', value: 'easeInQuad' },
    { label: 'Quad out', value: 'easeOutQuad' },
    { label: 'Quad in out', value: 'easeInOutQuad' },
  ];
  protected readonly easingPresets: Array<{ label: string; value: MotionEasingName }> = [
    { label: 'Linear', value: 'linear' },
    { label: 'Ease in', value: 'easeInCubic' },
    { label: 'Ease out', value: 'easeOutCubic' },
    { label: 'Ease in out', value: 'easeInOutCubic' },
    { label: 'Smooth', value: 'smooth' },
    { label: 'Overshoot', value: 'easeOutBack' },
    { label: 'Bounce', value: 'easeOutBounce' },
  ];
  protected readonly transitionTypes: Array<{ label: string; value: MotionTransitionType }> = [
    { label: 'None', value: 'none' },
    { label: 'Fade', value: 'fade' },
    { label: 'Slide', value: 'slide' },
    { label: 'Wipe', value: 'wipe' },
    { label: 'Scale', value: 'scale' },
    { label: 'Blur', value: 'blur' },
  ];
  protected readonly transitionDirections: Array<{
    label: string;
    value: MotionTransitionDirection;
  }> = [
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
    { label: 'Up', value: 'up' },
    { label: 'Down', value: 'down' },
  ];
  protected readonly transitionPresetTypes: Array<{
    label: string;
    value: Exclude<MotionTransitionType, 'none'>;
  }> = [
    { label: 'Fade', value: 'fade' },
    { label: 'Slide', value: 'slide' },
    { label: 'Wipe', value: 'wipe' },
    { label: 'Scale', value: 'scale' },
    { label: 'Blur', value: 'blur' },
  ];
  protected readonly transitionEdges: MotionTransitionEdge[] = ['in', 'out'];
  protected readonly timelineZoomOptions: Array<{ label: string; value: TimelineZoomMode }> = [
    { label: 'Fit', value: 'fit' },
    { label: '1x', value: '1' },
    { label: '2x', value: '2' },
    { label: '4x', value: '4' },
  ];

  protected readonly duration = computed(() => this.draft().composition.duration);
  protected readonly timelineZoomMode = signal<TimelineZoomMode>('fit');
  protected readonly timelineZoomScale = computed(() =>
    this.timelineZoomMode() === 'fit' ? 1 : Number(this.timelineZoomMode()),
  );
  protected readonly timelineZoomLabel = computed(() =>
    this.timelineZoomMode() === 'fit' ? 'Fit' : `${this.timelineZoomMode()}x`,
  );
  protected readonly layers = computed(() => flattenMotionLayers(this.draft().layers));
  protected readonly scenes = computed(() =>
    [...(this.draft().scenes ?? [])].sort((a, b) => a.start - b.start),
  );
  protected readonly timelineRows = computed(() =>
    [...this.layers()].sort((a, b) => (b.layer.zIndex ?? 0) - (a.layer.zIndex ?? 0)),
  );
  protected readonly canvasLayers = computed(() =>
    sortLayersForCanvas(this.draft().layers).filter((layer) => this.isCanvasLayerVisible(layer)),
  );
  protected readonly validationIssues = computed(() => validateMotionDocument(this.draft()));
  protected readonly timelineTicks = computed(() => {
    const duration = Math.max(1, this.duration());
    const tickCount = Math.min(
      64,
      Math.max(4, Math.ceil(duration / (1000 / this.timelineZoomScale())) + 1),
    );

    return Array.from({ length: tickCount }, (_, index) => {
      const time = (duration / Math.max(1, tickCount - 1)) * index;

      return {
        time,
        label: this.formatTime(time),
        left: (time / duration) * 100,
      };
    });
  });
  protected readonly playheadPercent = computed(() => {
    const duration = Math.max(1, this.duration());

    return (this.currentTime() / duration) * 100;
  });
  protected readonly timelineGridWidth = computed(() => {
    const mode = this.timelineZoomMode();

    if (mode === 'fit') {
      return '100%';
    }

    const width = TIMELINE_LABEL_WIDTH + TIMELINE_BODY_MIN_WIDTH * Number(mode);

    return `max(100%, ${width}px)`;
  });
  protected readonly keyframeSnapGuideLeft = computed(() => {
    const guide = this.keyframeSnapGuide();
    const duration = Math.max(1, this.duration());

    if (!guide) {
      return '0';
    }

    const percent = Math.max(0, Math.min(100, (guide.absoluteTime / duration) * 100));

    return `calc(${TIMELINE_LABEL_WIDTH}px + (${percent} * (100% - ${TIMELINE_LABEL_WIDTH}px) / 100))`;
  });
  protected readonly canvasGridSize = computed(() => {
    const composition = this.draft().composition;
    const gridSize = Math.max(4, this.gridSize());

    return `${(gridSize / composition.width) * 100}% ${(gridSize / composition.height) * 100}%`;
  });
  protected readonly selectedLayer = computed(() => {
    const id = this.selectedLayerId();

    if (!id) {
      return null;
    }

    return findMotionLayer(this.draft().layers, id);
  });
  protected readonly selectedLayerCount = computed(() => this.selectedLayerIds().length);
  protected readonly canGroupSelection = computed(() => this.selectedLayerIds().length > 1);
  protected readonly canUngroupSelection = computed(() => this.selectedLayer()?.type === 'group');
  protected readonly selectedScene = computed(() => {
    const sceneId = this.selectedSceneId();

    if (!sceneId) {
      return null;
    }

    return this.draft().scenes?.find((scene) => scene.id === sceneId) ?? null;
  });
  protected readonly selectedKeyframeDetails = computed(() => {
    const ref = this.selectedKeyframe();

    if (!ref) {
      return null;
    }

    return this.readSelectedKeyframeDetails(ref);
  });
  protected readonly selectedKeyframeDetailsList = computed(() =>
    this.selectedKeyframes()
      .map((ref) => this.readSelectedKeyframeDetails(ref))
      .filter((details): details is SelectedKeyframeDetails => !!details),
  );
  protected readonly selectedKeyframeCount = computed(
    () => this.selectedKeyframeDetailsList().length,
  );
  protected readonly selectedKeyframeBulkTitle = computed(
    () => `${this.selectedKeyframeCount()} keyframes selected`,
  );
  protected readonly selectedKeyframeBulkSubtitle = computed(() => {
    const details = this.selectedKeyframeDetailsList();
    const layerCount = new Set(details.map((item) => item.layer.id)).size;
    const trackCount = new Set(details.map((item) => `${item.layer.id}:${item.animationIndex}`))
      .size;

    return `${layerCount} layer${layerCount === 1 ? '' : 's'} · ${trackCount} track${
      trackCount === 1 ? '' : 's'
    }`;
  });
  protected readonly selectedKeyframeMeta = computed(() => {
    const details = this.selectedKeyframeDetails();

    if (!details) {
      return null;
    }

    const trackIndex = details.animation.keyframes.indexOf(details.keyframe) + 1;
    const trackTotal = details.animation.keyframes.length;

    return {
      localTime: this.formatTime(details.keyframe.time),
      absoluteTime: this.formatTime(details.absoluteTime),
      layerName: details.layer.name || details.layer.id,
      trackLabel: `${trackIndex} of ${trackTotal}`,
    };
  });
  protected readonly selectedKeyframeEasingName = computed<MotionEasingName>(() => {
    const details = this.selectedKeyframeDetails();

    return details?.keyframe.easing ?? details?.animation.easing ?? 'linear';
  });
  protected readonly selectedKeyframesEasingName = computed<MotionEasingName>(() => {
    return this.selectedKeyframeEasingName();
  });
  protected readonly selectedKeyframesEasingLabel = computed(() =>
    this.easingLabel(this.selectedKeyframesEasingName()),
  );
  protected readonly selectedKeyframesCurvePath = computed(() =>
    createEasingCurvePath(this.selectedKeyframesEasingName()),
  );
  protected readonly selectedKeyframeEasingLabel = computed(() =>
    this.easingLabel(this.selectedKeyframeEasingName()),
  );
  protected readonly selectedEasingCurvePath = computed(() =>
    createEasingCurvePath(this.selectedKeyframeEasingName()),
  );
  protected readonly selectedEasingPreviewDots = computed(() =>
    createEasingPreviewDots(this.selectedKeyframeEasingName()),
  );
  protected readonly undoStack = signal<MotionDocument[]>([]);
  protected readonly redoStack = signal<MotionDocument[]>([]);
  protected readonly canUndo = computed(() => this.undoStack().length > 0);
  protected readonly canRedo = computed(() => this.redoStack().length > 0);
  protected readonly layerClipboard = signal<MotionLayer[]>([]);
  protected readonly keyframeClipboard = signal<MotionKeyframeClipboardItem[]>([]);
  protected readonly canPasteLayer = computed(() => this.layerClipboard().length > 0);
  protected readonly canPasteKeyframes = computed(() => this.keyframeClipboard().length > 0);
  protected readonly assets = computed(() => this.draft().assets ?? []);
  protected readonly imageAssets = computed(() =>
    this.assets().filter((asset) => asset.type === 'image'),
  );
  protected readonly jsonPanelMode = signal<JsonPanelMode>('export');
  protected readonly jsonDraft = signal('');
  protected readonly jsonIssues = signal<string[]>([]);
  protected readonly jsonStatus = signal('');
  protected readonly assetStatus = signal('');
  protected readonly jsonPanelTitle = computed(() =>
    this.jsonPanelMode() === 'export' ? 'Export JSON' : 'Import JSON',
  );

  private _interaction:
    | CanvasInteraction
    | TimelineInteraction
    | TimelineBoxSelectionInteraction
    | PlayheadInteraction
    | null = null;
  private _removeInteractionListeners: (() => void) | null = null;
  private _interactionHistorySnapshot: MotionDocument | null = null;
  private _lastEmittedDocumentSignature: string | null = null;
  private _hasSyncedExternalDocument = false;
  private _skipNextKeyframeClick = false;
  private _suppressNextTimelineClick = false;

  private readonly _syncDocument = effect(() => {
    const document = this.document() ?? createDefaultMotionDocument();
    const next = cloneMotionDocument(document);
    const nextSignature = serializeMotionDocument(next);
    const isLocalEcho = this._lastEmittedDocumentSignature === nextSignature;

    if (!isLocalEcho && this._hasSyncedExternalDocument) {
      this.undoStack.set([]);
      this.redoStack.set([]);
    }

    this._hasSyncedExternalDocument = true;
    this.syncDraftDocument(next);
  });

  private readonly _syncSelectedKeyframeCollection = effect(() => {
    const primary = this.selectedKeyframe();
    const refs = this.selectedKeyframes();

    if (!primary) {
      if (refs.length) {
        this.selectedKeyframes.set([]);
      }

      return;
    }

    if (!refs.some((ref) => isSameSelectedKeyframe(ref, primary))) {
      this.selectedKeyframes.set([primary]);
    }
  });

  @HostListener('window:keydown', ['$event'])
  protected handleEditorKeydown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const isModifierShortcut = event.metaKey || event.ctrlKey;
    const isUndo = key === 'z' && (event.metaKey || event.ctrlKey) && !event.shiftKey;
    const isRedo =
      (key === 'z' && (event.metaKey || event.ctrlKey) && event.shiftKey) ||
      (key === 'y' && event.ctrlKey);

    if (this.editingTextLayerId() || isEditableShortcutTarget(event.target)) {
      return;
    }

    if (isUndo || isRedo) {
      event.preventDefault();

      if (isRedo) {
        this.redo();
        return;
      }

      this.undo();
      return;
    }

    if (isModifierShortcut && key === 'd' && this.selectedLayerIds().length) {
      event.preventDefault();
      this.duplicateSelectedLayers();
      return;
    }

    if (isModifierShortcut && key === 'c' && this.selectedKeyframeCount()) {
      event.preventDefault();
      this.copySelectedKeyframes();
      return;
    }

    if (isModifierShortcut && key === 'c' && this.selectedLayerIds().length) {
      event.preventDefault();
      this.copySelectedLayers();
      return;
    }

    if (isModifierShortcut && key === 'v' && this.canPasteKeyframes()) {
      event.preventDefault();
      this.pasteKeyframes();
      return;
    }

    if (isModifierShortcut && key === 'v' && this.canPasteLayer()) {
      event.preventDefault();
      this.pasteLayers();
      return;
    }

    if ((key === 'delete' || key === 'backspace') && this.selectedKeyframeCount()) {
      event.preventDefault();
      this.removeSelectedKeyframes();
      return;
    }

    if ((key === 'delete' || key === 'backspace') && this.selectedLayerIds().length) {
      event.preventDefault();
      this.removeSelectedLayer();
      return;
    }

    if (key === 'arrowleft' || key === 'arrowright') {
      event.preventDefault();

      if (this.selectedKeyframeCount()) {
        this.nudgeSelectedKeyframes(key === 'arrowleft' ? -1 : 1, event.shiftKey ? 10 : 1);
        return;
      }

      this.seekByFrames(key === 'arrowleft' ? -1 : 1, event.shiftKey ? 10 : 1);
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  protected handleDocumentPointerdown(event: PointerEvent): void {
    if (!this.editingTextLayerId()) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest('.ngs-motion-studio__canvas-layer, .ngs-motion-studio__resize-handle')) {
      return;
    }

    this.finishTextEditAndClearSelection();
  }

  protected togglePlayback(): void {
    this.playing.update((value) => !value);
  }

  protected stopPlayback(): void {
    this.playing.set(false);
  }

  protected seek(time: number): void {
    this.currentTime.set(this.snapTimeToFrame(time));
  }

  protected seekByFrames(direction: -1 | 1, frameCount = 1): void {
    const frameDuration = this.frameDuration();

    this.seek(this.currentTime() + direction * frameDuration * frameCount);
  }

  protected seekFromTimeline(event: MouseEvent): void {
    if (this._suppressNextTimelineClick) {
      this._suppressNextTimelineClick = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const target = event.target as HTMLElement | null;

    if (!target?.closest('.ngs-motion-studio__ruler, .ngs-motion-studio__track')) {
      return;
    }

    const ratio = this.timelineRatioFromEvent(event);

    this.seek(ratio * this.duration());
  }

  protected selectLayer(layer: MotionLayer, event?: MouseEvent | PointerEvent): void {
    if (event?.shiftKey || event?.metaKey || event?.ctrlKey) {
      this.toggleLayerSelection(layer);
      return;
    }

    this.selectedLayerId.set(layer.id);
    this.selectedLayerIds.set([layer.id]);
    this.selectedKeyframe.set(null);
    this.selectedSceneId.set(null);
  }

  protected isLayerSelected(layer: MotionLayer): boolean {
    return this.selectedLayerIds().includes(layer.id);
  }

  protected selectScene(scene: MotionScene, event?: Event): void {
    event?.stopPropagation();
    this.selectedSceneId.set(scene.id);
    this.selectedLayerId.set(null);
    this.selectedLayerIds.set([]);
    this.selectedKeyframe.set(null);
    this.seek(scene.start);
  }

  protected isSceneSelected(scene: MotionScene): boolean {
    return this.selectedSceneId() === scene.id;
  }

  protected copySelectedLayers(): void {
    const selectedIds = this.selectedLayerIds();

    if (!selectedIds.length) {
      return;
    }

    const copiedLayers = selectedIds
      .map((id) => findMotionLayer(this.draft().layers, id))
      .filter((layer): layer is MotionLayer => !!layer)
      .map(cloneMotionLayer);

    this.keyframeClipboard.set([]);
    this.layerClipboard.set(copiedLayers);
  }

  protected pasteLayers(): void {
    const layers = this.layerClipboard();

    if (!layers.length) {
      return;
    }

    this.insertLayerCopies(layers, 'paste');
  }

  protected duplicateSelectedLayers(): void {
    const selectedIds = this.selectedLayerIds();

    if (!selectedIds.length) {
      return;
    }

    const layers = selectedIds
      .map((id) => findMotionLayer(this.draft().layers, id))
      .filter((layer): layer is MotionLayer => !!layer);

    this.insertLayerCopies(layers, 'duplicate');
  }

  protected duplicateLayer(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.insertLayerCopies([layer], 'duplicate');
  }

  protected undo(): void {
    const undoStack = this.undoStack();
    const previous = undoStack[undoStack.length - 1];

    if (!previous) {
      return;
    }

    const current = cloneMotionDocument(this.draft());
    this.undoStack.set(undoStack.slice(0, -1));
    this.redoStack.update((stack) => [...stack, current]);
    this.restoreHistoryDocument(previous);
  }

  protected redo(): void {
    const redoStack = this.redoStack();
    const next = redoStack[redoStack.length - 1];

    if (!next) {
      return;
    }

    const current = cloneMotionDocument(this.draft());
    this.redoStack.set(redoStack.slice(0, -1));
    this.undoStack.update((stack) => [...stack, current].slice(-MOTION_HISTORY_LIMIT));
    this.restoreHistoryDocument(next);
  }

  protected groupSelectedLayers(): void {
    const selectedIds = this.selectedLayerIds();

    if (selectedIds.length < 2) {
      return;
    }

    this.selectedKeyframe.set(null);
    this.updateDocument((document) => {
      const extracted = extractMotionLayers(document.layers, selectedIds);

      if (extracted.layers.length < 2) {
        return;
      }

      const bounds = getLayerBounds(extracted.layers);
      const groupId = createMotionLayerId('group');
      const group: MotionLayer = {
        id: groupId,
        type: 'group',
        name: 'Group',
        start: Math.min(...extracted.layers.map((layer) => layer.start)),
        duration: Math.max(...extracted.layers.map((layer) => layer.start + layer.duration)),
        zIndex: Math.max(...extracted.layers.map((layer) => layer.zIndex ?? 0)) + 1,
        layout: bounds,
        children: extracted.layers.map((layer) => ({
          ...cloneMotionLayer(layer),
          layout: {
            ...layer.layout,
            x: layer.layout.x - bounds.x,
            y: layer.layout.y - bounds.y,
          },
        })),
      };

      group.duration = Math.max(100, group.duration - group.start);
      document.layers = [...extracted.remaining, group];
      document.tracks = document.tracks?.map((track) => ({
        ...track,
        layerIds: replaceTrackLayerIds(track.layerIds, selectedIds, [groupId]),
      }));
      this.selectedLayerId.set(groupId);
      this.selectedLayerIds.set([groupId]);
    });
  }

  protected ungroupSelectedLayer(): void {
    const selectedId = this.selectedLayerId();

    if (!selectedId) {
      return;
    }

    this.selectedKeyframe.set(null);
    this.updateDocument((document) => {
      const result = ungroupMotionLayer(document.layers, selectedId);

      if (!result.ungrouped.length) {
        return;
      }

      document.layers = result.layers;
      document.tracks = document.tracks?.map((track) => ({
        ...track,
        layerIds: replaceTrackLayerIds(
          track.layerIds,
          [selectedId],
          result.ungrouped.map((layer) => layer.id),
        ),
      }));
      this.selectedLayerId.set(result.ungrouped[0]?.id ?? null);
      this.selectedLayerIds.set(result.ungrouped.map((layer) => layer.id));
    });
  }

  protected addTextLayer(): void {
    this.addLayer('text');
  }

  protected addShapeLayer(): void {
    this.addLayer('shape');
  }

  protected textPresets(): MotionPreset[] {
    return this.presetsByCategory('text');
  }

  protected shapePresets(): MotionPreset[] {
    return this.presetsByCategory('shape');
  }

  protected presetsByCategory(category: MotionPreset['category']): MotionPreset[] {
    return this.presets().filter((preset) => preset.category === category);
  }

  protected async uploadAssetFiles(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement | null;
    const files = Array.from(inputElement?.files ?? []);

    if (!files.length) {
      return;
    }

    this.assetStatus.set(`Loading ${files.length} asset${files.length === 1 ? '' : 's'}...`);

    try {
      const assets = await Promise.all(files.map((file) => readMotionAssetFile(file)));

      this.updateDocument((document) => {
        document.assets = [...(document.assets ?? []), ...assets];
      });
      this.assetStatus.set(`Added ${assets.length} asset${assets.length === 1 ? '' : 's'}.`);
    } catch (error) {
      this.assetStatus.set(error instanceof Error ? error.message : 'Could not load assets.');
    } finally {
      if (inputElement) {
        inputElement.value = '';
      }
    }
  }

  protected addImageLayerFromAsset(asset: MotionAsset, event?: Event): void {
    event?.stopPropagation();

    if (asset.type !== 'image') {
      return;
    }

    const layer = this.createImageLayer(asset);

    this.updateDocument((document) => {
      document.layers.push(layer);
      document.tracks = ensureLayerInTrack(document.tracks, layer.id);
      this.selectedLayerId.set(layer.id);
      this.selectedLayerIds.set([layer.id]);
      this.selectedKeyframe.set(null);
    });
  }

  protected removeAsset(asset: MotionAsset, event?: Event): void {
    event?.stopPropagation();

    this.updateDocument((document) => {
      document.assets = (document.assets ?? []).filter((item) => item.id !== asset.id);
    });
    this.assetStatus.set(`Removed ${asset.name || asset.id}.`);
  }

  protected applyPreset(preset: MotionPreset): void {
    this.insertPreset(preset);
  }

  protected startPresetDrag(preset: MotionPreset, event: DragEvent): void {
    this.draggedPresetId.set(preset.id);
    event.dataTransfer?.setData('application/x-ngs-motion-preset', preset.id);
    event.dataTransfer?.setData('text/plain', preset.id);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  protected finishPresetDrag(): void {
    this.draggedPresetId.set(null);
  }

  protected handleCanvasPresetDragOver(event: DragEvent): void {
    if (!this.readDraggedPreset(event)) {
      return;
    }

    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  protected handleCanvasPresetDragLeave(event: DragEvent): void {
    const currentTarget = event.currentTarget as HTMLElement | null;
    const relatedTarget = event.relatedTarget as Node | null;

    if (!currentTarget || (relatedTarget && currentTarget.contains(relatedTarget))) {
      return;
    }
  }

  protected handleTimelinePresetDragOver(event: DragEvent): void {
    if (!this.readDraggedPreset(event)) {
      return;
    }

    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  protected handleTimelinePresetDragLeave(event: DragEvent): void {
    const currentTarget = event.currentTarget as HTMLElement | null;
    const relatedTarget = event.relatedTarget as Node | null;

    if (!currentTarget || (relatedTarget && currentTarget.contains(relatedTarget))) {
      return;
    }
  }

  protected dropPresetOnCanvas(event: DragEvent): void {
    const preset = this.readDraggedPreset(event);

    if (!preset) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement | null;
    const rect = target?.getBoundingClientRect();

    if (!rect) {
      this.finishPresetDrag();
      return;
    }

    const composition = this.draft().composition;
    const placement: MotionPresetPlacement = {
      x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * composition.width,
      y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * composition.height,
    };

    this.insertPreset(preset, { placement });
    this.finishPresetDrag();
  }

  protected dropPresetOnTimeline(event: DragEvent): void {
    const preset = this.readDraggedPreset(event);

    if (!preset) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const timeline = event.currentTarget as HTMLElement | null;

    if (!timeline) {
      this.finishPresetDrag();
      return;
    }

    const startTime = this.snapTimeToFrame(
      this.timelineRatioFromElement(event.clientX, timeline) * this.duration(),
    );

    this.insertPreset(preset, { startTime });
    this.seek(startTime);
    this.finishPresetDrag();
  }

  protected setLayerName(value: string): void {
    this.updateSelectedLayer((layer) => {
      layer.name = value;
    });
  }

  protected setLayerText(value: string): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        text: value,
      };
    });
  }

  protected setLayerTextById(layerId: string, value: string): void {
    this.updateLayer(layerId, (layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        text: value,
      };
    });
  }

  protected setLayerImageAsset(event: SelectChange): void {
    const asset = this.imageAssets().find((item) => item.id === event.value);

    if (!asset) {
      return;
    }

    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        assetId: asset.id,
        src: asset.src,
      };
      layer.name = layer.name || asset.name || 'Image layer';
    });
  }

  protected setLayerImageSrc(value: string): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        src: value,
      };
    });
  }

  protected setLayerObjectFit(event: SelectChange): void {
    this.updateSelectedLayer((layer) => {
      layer.style = {
        ...(layer.style ?? {}),
        objectFit: event.value,
      };
    });
  }

  protected setLayerNumber(property: 'start' | 'duration', value: unknown): void {
    const nextValue = coerceNumber(value);

    this.updateSelectedLayer((layer) => {
      layer[property] = Math.max(0, nextValue);
    });
  }

  protected transitionCount(layer: MotionLayer): number {
    return Number(!!layer.transitions?.in) + Number(!!layer.transitions?.out);
  }

  protected hasLayerTransition(layer: MotionLayer, edge: MotionTransitionEdge): boolean {
    return !!layer.transitions?.[edge];
  }

  protected transitionTypeValue(
    layer: MotionLayer,
    edge: MotionTransitionEdge,
  ): MotionTransitionType {
    return normalizeMotionTransitionType(layer.transitions?.[edge]?.type);
  }

  protected transitionDurationValue(layer: MotionLayer, edge: MotionTransitionEdge): number {
    return layer.transitions?.[edge]?.duration ?? DEFAULT_TRANSITION_DURATION;
  }

  protected transitionEasingValue(
    layer: MotionLayer,
    edge: MotionTransitionEdge,
  ): MotionEasingName {
    return layer.transitions?.[edge]?.easing ?? 'easeOutCubic';
  }

  protected transitionDirectionValue(
    layer: MotionLayer,
    edge: MotionTransitionEdge,
  ): MotionTransitionDirection {
    return readMotionTransitionDirection(layer.transitions?.[edge], edge);
  }

  protected transitionDistanceValue(layer: MotionLayer, edge: MotionTransitionEdge): number {
    return readMotionTransitionDistance(layer.transitions?.[edge]);
  }

  protected setLayerTransitionType(edge: MotionTransitionEdge, event: SelectChange): void {
    const type = normalizeMotionTransitionType(event.value);

    this.updateSelectedLayer((layer) => {
      if (type === 'none') {
        setMotionLayerTransition(layer, edge, undefined);
        return;
      }

      setMotionLayerTransition(layer, edge, {
        ...createDefaultTransition(type, edge),
        ...(layer.transitions?.[edge] ?? {}),
        type,
      });
    });
  }

  protected setLayerTransitionDuration(edge: MotionTransitionEdge, value: unknown): void {
    const duration = Math.max(100, coerceNumber(value));

    this.updateSelectedLayer((layer) => {
      const transition = layer.transitions?.[edge] ?? createDefaultTransition('fade', edge);

      setMotionLayerTransition(layer, edge, {
        ...transition,
        duration: Math.min(layer.duration, duration),
      });
    });
  }

  protected setLayerTransitionEasing(edge: MotionTransitionEdge, event: SelectChange): void {
    this.updateSelectedLayer((layer) => {
      const transition = layer.transitions?.[edge] ?? createDefaultTransition('fade', edge);

      setMotionLayerTransition(layer, edge, {
        ...transition,
        easing: event.value,
      });
    });
  }

  protected setLayerTransitionDirection(edge: MotionTransitionEdge, event: SelectChange): void {
    const direction = normalizeMotionTransitionDirection(event.value, edge);

    this.updateSelectedLayer((layer) => {
      const transition = layer.transitions?.[edge] ?? createDefaultTransition('slide', edge);

      setMotionLayerTransition(layer, edge, {
        ...transition,
        props: {
          ...(transition.props ?? {}),
          direction,
        },
      });
    });
  }

  protected setLayerTransitionDistance(edge: MotionTransitionEdge, value: unknown): void {
    const distance = Math.max(0, coerceNumber(value));

    this.updateSelectedLayer((layer) => {
      const transition = layer.transitions?.[edge] ?? createDefaultTransition('slide', edge);

      setMotionLayerTransition(layer, edge, {
        ...transition,
        props: {
          ...(transition.props ?? {}),
          distance,
        },
      });
    });
  }

  protected applyTransitionPreset(
    edge: MotionTransitionEdge,
    type: Exclude<MotionTransitionType, 'none'>,
  ): void {
    this.updateSelectedLayer((layer) => {
      setMotionLayerTransition(layer, edge, createDefaultTransition(type, edge));
    });
  }

  protected removeLayerTransition(edge: MotionTransitionEdge): void {
    this.updateSelectedLayer((layer) => {
      setMotionLayerTransition(layer, edge, undefined);
    });
  }

  protected addScene(): void {
    const start = this.currentTime();
    const duration = Math.min(3000, Math.max(1000, this.duration() - start));
    const layerIds = this.selectedLayerIds().length
      ? this.selectedLayerIds()
      : this.timelineRows()
          .slice(0, 3)
          .map((item) => item.layer.id);
    const scene: MotionScene = {
      id: createMotionLayerId('scene'),
      name: `Scene ${(this.draft().scenes?.length ?? 0) + 1}`,
      start,
      duration,
      layerIds,
      transitionIn: createDefaultTransition('fade', 'in'),
      transitionOut: createDefaultTransition('fade', 'out'),
    };

    this.updateDocument((document) => {
      document.scenes = [...(document.scenes ?? []), scene];
      this.selectedSceneId.set(scene.id);
      this.selectedLayerId.set(null);
      this.selectedLayerIds.set([]);
      this.selectedKeyframe.set(null);
    });
  }

  protected removeSelectedScene(): void {
    const sceneId = this.selectedSceneId();

    if (!sceneId) {
      return;
    }

    this.updateDocument((document) => {
      document.scenes = (document.scenes ?? []).filter((scene) => scene.id !== sceneId);
    });
    this.selectedSceneId.set(null);
  }

  protected setSceneName(value: string): void {
    this.updateSelectedScene((scene) => {
      scene.name = value;
    });
  }

  protected setSceneNumber(property: 'start' | 'duration', value: unknown): void {
    const nextValue = coerceNumber(value);

    this.updateSelectedScene((scene) => {
      scene[property] = Math.max(property === 'duration' ? 100 : 0, nextValue);
    });
  }

  protected toggleSceneLayer(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.updateSelectedScene((scene) => {
      const layerIds = scene.layerIds ?? [];

      scene.layerIds = layerIds.includes(layer.id)
        ? layerIds.filter((layerId) => layerId !== layer.id)
        : [...layerIds, layer.id];
    });
  }

  protected isLayerInScene(scene: MotionScene, layer: MotionLayer): boolean {
    return scene.layerIds?.includes(layer.id) ?? false;
  }

  protected sceneLayerCount(scene: MotionScene): number {
    return scene.layerIds?.length ?? 0;
  }

  protected sceneTransitionCount(scene: MotionScene): number {
    return Number(!!scene.transitionIn) + Number(!!scene.transitionOut);
  }

  protected hasSceneTransition(scene: MotionScene, edge: MotionTransitionEdge): boolean {
    return !!readMotionSceneTransition(scene, edge);
  }

  protected sceneTransitionTypeValue(
    scene: MotionScene,
    edge: MotionTransitionEdge,
  ): MotionTransitionType {
    return normalizeMotionTransitionType(readMotionSceneTransition(scene, edge)?.type);
  }

  protected sceneTransitionDurationValue(scene: MotionScene, edge: MotionTransitionEdge): number {
    return readMotionSceneTransition(scene, edge)?.duration ?? DEFAULT_TRANSITION_DURATION;
  }

  protected sceneTransitionEasingValue(
    scene: MotionScene,
    edge: MotionTransitionEdge,
  ): MotionEasingName {
    return readMotionSceneTransition(scene, edge)?.easing ?? 'easeOutCubic';
  }

  protected sceneTransitionDirectionValue(
    scene: MotionScene,
    edge: MotionTransitionEdge,
  ): MotionTransitionDirection {
    return readMotionTransitionDirection(readMotionSceneTransition(scene, edge), edge);
  }

  protected sceneTransitionDistanceValue(scene: MotionScene, edge: MotionTransitionEdge): number {
    return readMotionTransitionDistance(readMotionSceneTransition(scene, edge));
  }

  protected setSceneTransitionType(edge: MotionTransitionEdge, event: SelectChange): void {
    const type = normalizeMotionTransitionType(event.value);

    this.updateSelectedScene((scene) => {
      if (type === 'none') {
        setMotionSceneTransition(scene, edge, undefined);
        return;
      }

      setMotionSceneTransition(scene, edge, {
        ...createDefaultTransition(type, edge),
        ...(readMotionSceneTransition(scene, edge) ?? {}),
        type,
      });
    });
  }

  protected setSceneTransitionDuration(edge: MotionTransitionEdge, value: unknown): void {
    const duration = Math.max(100, coerceNumber(value));

    this.updateSelectedScene((scene) => {
      const transition =
        readMotionSceneTransition(scene, edge) ?? createDefaultTransition('fade', edge);

      setMotionSceneTransition(scene, edge, {
        ...transition,
        duration: Math.min(scene.duration, duration),
      });
    });
  }

  protected setSceneTransitionEasing(edge: MotionTransitionEdge, event: SelectChange): void {
    this.updateSelectedScene((scene) => {
      const transition =
        readMotionSceneTransition(scene, edge) ?? createDefaultTransition('fade', edge);

      setMotionSceneTransition(scene, edge, {
        ...transition,
        easing: event.value,
      });
    });
  }

  protected setSceneTransitionDirection(edge: MotionTransitionEdge, event: SelectChange): void {
    const direction = normalizeMotionTransitionDirection(event.value, edge);

    this.updateSelectedScene((scene) => {
      const transition =
        readMotionSceneTransition(scene, edge) ?? createDefaultTransition('slide', edge);

      setMotionSceneTransition(scene, edge, {
        ...transition,
        props: {
          ...(transition.props ?? {}),
          direction,
        },
      });
    });
  }

  protected setSceneTransitionDistance(edge: MotionTransitionEdge, value: unknown): void {
    const distance = Math.max(0, coerceNumber(value));

    this.updateSelectedScene((scene) => {
      const transition =
        readMotionSceneTransition(scene, edge) ?? createDefaultTransition('slide', edge);

      setMotionSceneTransition(scene, edge, {
        ...transition,
        props: {
          ...(transition.props ?? {}),
          distance,
        },
      });
    });
  }

  protected applySceneTransitionPreset(
    edge: MotionTransitionEdge,
    type: Exclude<MotionTransitionType, 'none'>,
  ): void {
    this.updateSelectedScene((scene) => {
      setMotionSceneTransition(scene, edge, createDefaultTransition(type, edge));
    });
  }

  protected removeSceneTransition(edge: MotionTransitionEdge): void {
    this.updateSelectedScene((scene) => {
      setMotionSceneTransition(scene, edge, undefined);
    });
  }

  protected setLayerLayoutNumber(
    property: 'x' | 'y' | 'width' | 'height' | 'rotation' | 'scale',
    value: unknown,
  ): void {
    const nextValue = coerceNumber(value);

    this.updateSelectedLayer((layer) => {
      layer.layout = {
        ...layer.layout,
        [property]: property === 'scale' ? Math.max(0.05, nextValue) : nextValue,
      };
    });
  }

  protected formatTransformValue(value: number | undefined): string {
    return roundMotionNumber(value ?? 0, 2).toString();
  }

  protected setLayerStyleNumber(property: keyof MotionStyle, value: unknown): void {
    const nextValue = coerceNumber(value);

    this.updateSelectedLayer((layer) => {
      layer.style = {
        ...(layer.style ?? {}),
        [property]: nextValue,
      };
    });
  }

  protected setLayerStyleString(property: keyof MotionStyle, value: string): void {
    this.updateSelectedLayer((layer) => {
      layer.style = {
        ...(layer.style ?? {}),
        [property]: value,
      };
    });
  }

  protected setLayerFontFamily(event: SelectChange): void {
    this.setLayerStyleString('fontFamily', event.value);
  }

  protected setLayerFontWeight(event: SelectChange): void {
    this.updateSelectedLayer((layer) => {
      layer.style = {
        ...(layer.style ?? {}),
        fontWeight: event.value,
      };
    });
  }

  protected setLayerFontSize(value: unknown): void {
    const nextValue = Math.max(1, coerceNumber(value));

    this.updateSelectedLayer((layer) => {
      layer.style = {
        ...(layer.style ?? {}),
        fontSize: nextValue,
      };
    });
  }

  protected setLayerLineHeight(value: unknown): void {
    const nextValue = Math.max(0.1, coerceNumber(value));

    this.updateSelectedLayer((layer) => {
      layer.style = {
        ...(layer.style ?? {}),
        lineHeight: nextValue,
      };
    });
  }

  protected setLayerLetterSpacing(value: unknown): void {
    const nextValue = coerceNumber(value);

    this.updateSelectedLayer((layer) => {
      layer.style = {
        ...(layer.style ?? {}),
        letterSpacing: nextValue,
      };
    });
  }

  protected setLayerTextAlign(value: MotionStyle['textAlign']): void {
    this.updateSelectedLayer((layer) => {
      layer.style = {
        ...(layer.style ?? {}),
        textAlign: value,
      };
    });
  }

  protected addLayerAnimation(property: string): void {
    this.updateSelectedLayer((layer) => {
      const keyframes = createDefaultKeyframes(layer, property);

      layer.animations = [
        ...(layer.animations ?? []),
        {
          id: createMotionLayerId('animation'),
          property,
          easing: 'easeOutCubic',
          keyframes,
        },
      ];
    });
  }

  protected applyAnimationPreset(type: MotionAnimationPresetType): void {
    this.selectedAnimationPreset.set(type);
    this.applyAnimationPresetToLayers(type, 'active');
  }

  protected applySelectedAnimationPresetToLayer(): void {
    this.applyAnimationPresetToLayers(this.selectedAnimationPreset(), 'active');
  }

  protected applySelectedAnimationPresetToSelection(): void {
    this.applyAnimationPresetToLayers(this.selectedAnimationPreset(), 'selection');
  }

  protected setSelectedAnimationPreset(event: SelectChange): void {
    this.selectedAnimationPreset.set(normalizeAnimationPresetType(event.value));
  }

  protected setAnimationPresetApplyMode(value: string): void {
    this.animationPresetApplyMode.set(normalizeAnimationApplyMode(value));
  }

  protected setAnimationPresetNumber(
    property: 'duration' | 'delay' | 'distance',
    value: unknown,
  ): void {
    const nextValue = coerceNumber(value);

    this.animationPresetSettings.update((settings) => ({
      ...settings,
      [property]:
        property === 'duration'
          ? Math.max(100, nextValue)
          : property === 'distance'
            ? Math.max(0, nextValue)
            : nextValue,
    }));
  }

  protected setAnimationPresetEasing(event: SelectChange): void {
    this.animationPresetSettings.update((settings) => ({
      ...settings,
      easing: event.value,
    }));
  }

  protected setAnimationPresetDirection(event: SelectChange): void {
    this.animationPresetSettings.update((settings) => ({
      ...settings,
      direction: normalizeMotionTransitionDirection(event.value, 'in'),
    }));
  }

  protected recordCurrentTransformKeyframes(): void {
    const time = this.currentTime();

    this.updateSelectedLayer((layer) => {
      const localTime = Math.max(0, Math.min(layer.duration, time - layer.start));
      const properties: Array<keyof MotionLayout> = [
        'x',
        'y',
        'width',
        'height',
        'rotation',
        'scale',
      ];

      for (const property of properties) {
        const value = layer.layout[property] ?? (property === 'scale' ? 1 : 0);
        const animation =
          layer.animations?.find((item) => item.property === property) ??
          createEmptyAnimation(property, value);

        animation.keyframes = upsertKeyframe(animation.keyframes, {
          time: snapTimelineTime(localTime),
          value,
          easing: animation.easing ?? 'easeOutCubic',
        });

        if (!layer.animations?.includes(animation)) {
          layer.animations = [...(layer.animations ?? []), animation];
        }
      }
    });
  }

  protected removeLayerAnimation(animationIndex: number): void {
    this.updateSelectedLayer((layer) => {
      const animations = (layer.animations ?? []).filter((_, index) => index !== animationIndex);

      layer.animations = animations.length ? animations : undefined;
    });
    this.clearSelectedKeyframes();
  }

  protected moveLayerAnimation(
    animationIndex: number,
    direction: -1 | 1,
    event?: Event,
  ): void {
    event?.stopPropagation();

    this.updateSelectedLayer((layer) => {
      const animations = [...(layer.animations ?? [])];
      const nextIndex = animationIndex + direction;

      if (
        animationIndex < 0 ||
        animationIndex >= animations.length ||
        nextIndex < 0 ||
        nextIndex >= animations.length
      ) {
        return;
      }

      [animations[animationIndex], animations[nextIndex]] = [
        animations[nextIndex],
        animations[animationIndex],
      ];
      layer.animations = animations;
    });
    this.clearSelectedKeyframes();
  }

  protected clearAnimationTracks(scope: MotionAnimationScope = 'active'): void {
    const layerIds = this.animationScopeLayerIds(scope);

    if (!layerIds.length) {
      return;
    }

    this.updateDocument((document) => {
      for (const layerId of layerIds) {
        const layer = findMotionLayer(document.layers, layerId);

        if (layer) {
          layer.animations = undefined;
        }
      }
    });
    this.clearSelectedKeyframes();
  }

  protected clearLayerEffects(scope: MotionAnimationScope = 'active'): void {
    const layerIds = this.animationScopeLayerIds(scope);

    if (!layerIds.length) {
      return;
    }

    this.updateDocument((document) => {
      for (const layerId of layerIds) {
        const layer = findMotionLayer(document.layers, layerId);

        if (layer) {
          layer.animations = undefined;
          layer.transitions = undefined;
        }
      }
    });
    this.clearSelectedKeyframes();
  }

  protected clearLayerTransitions(scope: MotionAnimationScope = 'active'): void {
    const layerIds = this.animationScopeLayerIds(scope);

    if (!layerIds.length) {
      return;
    }

    this.updateDocument((document) => {
      for (const layerId of layerIds) {
        const layer = findMotionLayer(document.layers, layerId);

        if (layer) {
          layer.transitions = undefined;
        }
      }
    });
  }

  protected setLayerAnimationProperty(animationIndex: number, event: SelectChange): void {
    this.updateSelectedLayer((layer) => {
      const animation = layer.animations?.[animationIndex];

      if (!animation) {
        return;
      }

      animation.property = event.value;
      animation.keyframes = animation.keyframes.map((keyframe) => ({
        ...keyframe,
        value: coerceKeyframeValue(event.value, keyframe.value),
      }));
    });
  }

  protected setSelectedKeyframeProperty(event: SelectChange): void {
    const details = this.selectedKeyframeDetails();

    if (!details) {
      return;
    }

    this.setLayerAnimationProperty(details.animationIndex, event);
  }

  protected setLayerAnimationEasing(animationIndex: number, event: SelectChange): void {
    this.updateSelectedLayer((layer) => {
      const animation = layer.animations?.[animationIndex];

      if (animation) {
        animation.easing = event.value;
      }
    });
  }

  protected setSelectedAnimationEasing(event: SelectChange): void {
    const details = this.selectedKeyframeDetails();

    if (!details) {
      return;
    }

    this.setLayerAnimationEasing(details.animationIndex, event);
  }

  protected copySelectedKeyframes(): void {
    const details = this.selectedKeyframeDetailsList().sort(
      (a, b) => a.absoluteTime - b.absoluteTime,
    );

    if (!details.length) {
      return;
    }

    const baseTime = details[0].absoluteTime;

    this.layerClipboard.set([]);
    this.keyframeClipboard.set(
      details.map((item) => ({
        layerId: item.layer.id,
        ...(item.animation.id ? { animationId: item.animation.id } : {}),
        property: item.animation.property,
        ...(item.animation.easing ? { animationEasing: item.animation.easing } : {}),
        offset: item.absoluteTime - baseTime,
        keyframe: cloneMotionKeyframe(item.keyframe),
      })),
    );
  }

  protected pasteKeyframes(): void {
    const clipboard = this.keyframeClipboard();

    if (!clipboard.length) {
      return;
    }

    const pasteStart = this.currentTime();
    const pastedKeyframes: Array<{
      layer: MotionLayer;
      animation: MotionAnimation;
      keyframe: MotionKeyframe;
    }> = [];

    this.updateDocument((document) => {
      for (const item of clipboard) {
        const layer = findMotionLayer(document.layers, item.layerId);

        if (!layer) {
          continue;
        }

        const targetAbsoluteTime = pasteStart + item.offset;
        const targetLocalTime = Math.max(
          0,
          Math.min(layer.duration, targetAbsoluteTime - layer.start),
        );
        const snappedLocalTime = Math.max(
          0,
          Math.min(layer.duration, snapTimelineTime(targetLocalTime)),
        );
        const animation = findOrCreateMotionAnimation(layer, item);
        const keyframe = {
          ...cloneMotionKeyframe(item.keyframe),
          time: snappedLocalTime,
        };

        animation.keyframes = upsertKeyframe(animation.keyframes, keyframe);
        pastedKeyframes.push({ layer, animation, keyframe });
      }
    });

    const nextRefs = pastedKeyframes
      .map(({ layer, animation, keyframe }) => ({
        layerId: layer.id,
        animationIndex: layer.animations?.indexOf(animation) ?? -1,
        keyframeIndex: animation.keyframes.indexOf(keyframe),
      }))
      .filter(
        (ref): ref is SelectedKeyframeRef => ref.animationIndex >= 0 && ref.keyframeIndex >= 0,
      );

    if (!nextRefs.length) {
      return;
    }

    this.setSelectedKeyframeRefs(nextRefs);
    this.selectedSceneId.set(null);
    this.selectedLayerIds.set(uniqueStrings(nextRefs.map((ref) => ref.layerId)));
    this.selectedLayerId.set(nextRefs[nextRefs.length - 1].layerId);
  }

  protected addLayerKeyframe(animationIndex: number): void {
    const time = Math.min(this.selectedLayer()?.duration ?? this.duration(), this.currentTime());

    this.updateSelectedLayer((layer) => {
      const animation = layer.animations?.[animationIndex];

      if (!animation) {
        return;
      }

      const localTime = Math.max(0, Math.min(layer.duration, time - layer.start));
      const value = readLayerAnimationValue(layer, animation.property);
      animation.keyframes = sortKeyframes([
        ...animation.keyframes,
        {
          time: snapTimelineTime(localTime),
          value,
          easing: animation.easing ?? 'easeOutCubic',
        },
      ]);
    });
  }

  protected removeLayerKeyframe(animationIndex: number, keyframeIndex: number): void {
    this.updateSelectedLayer((layer) => {
      const animation = layer.animations?.[animationIndex];

      if (!animation || animation.keyframes.length <= 1) {
        return;
      }

      animation.keyframes = animation.keyframes.filter((_, index) => index !== keyframeIndex);
    });
    this.clearSelectedKeyframes();
  }

  protected duplicateLayerKeyframe(
    animationIndex: number,
    keyframeIndex: number,
    event?: Event,
  ): void {
    event?.stopPropagation();

    let nextRef: SelectedKeyframeRef | null = null;
    let nextAbsoluteTime: number | null = null;

    this.updateSelectedLayer((layer) => {
      const animation = layer.animations?.[animationIndex];
      const keyframe = animation?.keyframes[keyframeIndex];

      if (!animation || !keyframe) {
        return;
      }

      const duplicatedKeyframe = {
        ...cloneMotionKeyframe(keyframe),
        time: Math.max(
          0,
          Math.min(layer.duration, keyframe.time + Math.max(this.frameDuration(), 100)),
        ),
      };

      animation.keyframes = sortKeyframes([...animation.keyframes, duplicatedKeyframe]);
      nextRef = {
        layerId: layer.id,
        animationIndex,
        keyframeIndex: animation.keyframes.indexOf(duplicatedKeyframe),
      };
      nextAbsoluteTime = layer.start + duplicatedKeyframe.time;
    });

    if (nextRef) {
      this.setSelectedKeyframeRefs([nextRef]);
    }

    if (nextAbsoluteTime !== null) {
      this.seek(nextAbsoluteTime);
    }
  }

  protected removeSelectedKeyframe(): void {
    const ref = this.selectedKeyframe();

    if (!ref) {
      return;
    }

    this.updateLayer(ref.layerId, (layer) => {
      const animation = layer.animations?.[ref.animationIndex];

      if (!animation || animation.keyframes.length <= 1) {
        return;
      }

      animation.keyframes = animation.keyframes.filter((_, index) => index !== ref.keyframeIndex);
    });
    this.clearSelectedKeyframes();
  }

  protected removeSelectedKeyframes(): void {
    const refs = this.selectedKeyframes();

    if (!refs.length) {
      return;
    }

    this.updateDocument((document) => {
      const grouped = groupSelectedKeyframes(refs);

      for (const [layerId, animationGroups] of grouped) {
        const layer = findMotionLayer(document.layers, layerId);

        if (!layer?.animations) {
          continue;
        }

        for (const [animationIndex, keyframeIndexes] of animationGroups) {
          const animation = layer.animations[animationIndex];

          if (!animation) {
            continue;
          }

          const removableIndexes = [...keyframeIndexes].sort((a, b) => b - a);
          const remainingCount = animation.keyframes.length - removableIndexes.length;

          if (remainingCount < 1) {
            continue;
          }

          animation.keyframes = animation.keyframes.filter(
            (_, index) => !keyframeIndexes.has(index),
          );
        }
      }
    });
    this.clearSelectedKeyframes();
  }

  protected duplicateSelectedKeyframe(): void {
    const ref = this.selectedKeyframe();

    if (!ref) {
      return;
    }

    this.updateLayer(ref.layerId, (layer) => {
      const animation = layer.animations?.[ref.animationIndex];
      const keyframe = animation?.keyframes[ref.keyframeIndex];

      if (!animation || !keyframe) {
        return;
      }

      const frameDuration = this.frameDuration();
      const duplicatedKeyframe = {
        ...keyframe,
        time: Math.max(0, Math.min(layer.duration, keyframe.time + Math.max(frameDuration, 100))),
      };

      animation.keyframes = sortKeyframes([...animation.keyframes, duplicatedKeyframe]);
      this.setSelectedKeyframeRefs([
        {
          layerId: layer.id,
          animationIndex: ref.animationIndex,
          keyframeIndex: animation.keyframes.indexOf(duplicatedKeyframe),
        },
      ]);
      this.seek(layer.start + duplicatedKeyframe.time);
    });
  }

  protected setLayerKeyframeTime(
    animationIndex: number,
    keyframeIndex: number,
    value: unknown,
  ): void {
    const nextTime = snapTimelineTime(Math.max(0, coerceNumber(value)));

    this.updateSelectedLayer((layer) => {
      const keyframe = layer.animations?.[animationIndex]?.keyframes[keyframeIndex];

      if (!keyframe) {
        return;
      }

      keyframe.time = Math.min(layer.duration, nextTime);
      layer.animations![animationIndex].keyframes = sortKeyframes(
        layer.animations![animationIndex].keyframes,
      );

      if (
        this.selectedKeyframe()?.layerId === layer.id &&
        this.selectedKeyframe()?.animationIndex === animationIndex &&
        this.selectedKeyframe()?.keyframeIndex === keyframeIndex
      ) {
        this.setSelectedKeyframeRefs([
          {
            layerId: layer.id,
            animationIndex,
            keyframeIndex: layer.animations![animationIndex].keyframes.indexOf(keyframe),
          },
        ]);
      }
    });
  }

  protected setSelectedKeyframeTime(value: unknown): void {
    const details = this.selectedKeyframeDetails();

    if (!details) {
      return;
    }

    this.setLayerKeyframeTime(details.animationIndex, details.keyframeIndex, value);
  }

  protected nudgeSelectedKeyframe(direction: -1 | 1, frameCount = 1): void {
    this.nudgeSelectedKeyframes(direction, frameCount);
  }

  protected nudgeSelectedKeyframes(direction: -1 | 1, frameCount = 1): void {
    const refs = this.selectedKeyframes();

    if (!refs.length) {
      return;
    }

    const frameDuration = this.frameDuration();
    const delta = frameDuration * frameCount * direction;
    let nextAbsoluteTime: number | null = null;
    let nextRefs: SelectedKeyframeRef[] = [];

    this.updateDocument((document) => {
      const grouped = groupSelectedKeyframes(refs);

      for (const [layerId, animationGroups] of grouped) {
        const layer = findMotionLayer(document.layers, layerId);

        if (!layer?.animations) {
          continue;
        }

        for (const [animationIndex, keyframeIndexes] of animationGroups) {
          const animation = layer.animations[animationIndex];

          if (!animation) {
            continue;
          }

          const keyframes = [...keyframeIndexes]
            .map((keyframeIndex) => animation.keyframes[keyframeIndex])
            .filter((keyframe): keyframe is MotionKeyframe => !!keyframe);

          for (const keyframe of keyframes) {
            const nextTime = keyframe.time + delta;

            keyframe.time = Math.max(
              0,
              Math.min(
                layer.duration,
                this.snapToGrid() ? Math.round(nextTime / frameDuration) * frameDuration : nextTime,
              ),
            );
          }

          animation.keyframes = sortKeyframes(animation.keyframes);

          for (const keyframe of keyframes) {
            const keyframeIndex = animation.keyframes.indexOf(keyframe);

            if (keyframeIndex === -1) {
              continue;
            }

            const ref = {
              layerId: layer.id,
              animationIndex,
              keyframeIndex,
            };

            nextRefs.push(ref);
            nextAbsoluteTime = layer.start + keyframe.time;
          }
        }
      }
    });

    if (nextRefs.length) {
      this.setSelectedKeyframeRefs(nextRefs);
    }

    if (nextAbsoluteTime !== null) {
      this.seek(nextAbsoluteTime);
    }
  }

  protected setLayerKeyframeValue(
    animationIndex: number,
    keyframeIndex: number,
    value: unknown,
  ): void {
    this.updateSelectedLayer((layer) => {
      const animation = layer.animations?.[animationIndex];
      const keyframe = animation?.keyframes[keyframeIndex];

      if (!animation || !keyframe) {
        return;
      }

      keyframe.value = coerceKeyframeValue(animation.property, value);
    });
  }

  protected setSelectedKeyframeValue(value: unknown): void {
    const details = this.selectedKeyframeDetails();

    if (!details) {
      return;
    }

    this.setLayerKeyframeValue(details.animationIndex, details.keyframeIndex, value);
  }

  protected setLayerKeyframeEasing(
    animationIndex: number,
    keyframeIndex: number,
    event: SelectChange,
  ): void {
    this.setLayerKeyframeEasingValue(
      animationIndex,
      keyframeIndex,
      coerceMotionEasing(event.value),
    );
  }

  protected setSelectedKeyframeEasing(event: SelectChange): void {
    this.setSelectedKeyframeEasingPreset(coerceMotionEasing(event.value));
  }

  protected setSelectedKeyframeEasingPreset(easing: MotionEasingName): void {
    const details = this.selectedKeyframeDetails();

    if (!details) {
      return;
    }

    this.setLayerKeyframeEasingValue(details.animationIndex, details.keyframeIndex, easing);
  }

  protected setSelectedKeyframesEasingPreset(easing: MotionEasingName): void {
    const refs = this.selectedKeyframes();

    if (!refs.length) {
      return;
    }

    this.updateDocument((document) => {
      for (const ref of refs) {
        const layer = findMotionLayer(document.layers, ref.layerId);
        const keyframe = layer?.animations?.[ref.animationIndex]?.keyframes[ref.keyframeIndex];

        if (keyframe) {
          keyframe.easing = easing;
        }
      }
    });
  }

  protected applySelectedKeyframeEasingToTrack(): void {
    const details = this.selectedKeyframeDetails();

    if (!details) {
      return;
    }

    const easing = this.selectedKeyframeEasingName();

    this.updateLayer(details.layer.id, (layer) => {
      const animation = layer.animations?.[details.animationIndex];

      if (!animation) {
        return;
      }

      animation.easing = easing;
      animation.keyframes = animation.keyframes.map((keyframe) => ({
        ...keyframe,
        easing,
      }));
    });
  }

  protected applySelectedKeyframesEasingToTracks(): void {
    const refs = this.selectedKeyframes();

    if (!refs.length) {
      return;
    }

    const easing = this.selectedKeyframesEasingName();

    this.updateDocument((document) => {
      const grouped = groupSelectedKeyframes(refs);

      for (const [layerId, animationGroups] of grouped) {
        const layer = findMotionLayer(document.layers, layerId);

        if (!layer?.animations) {
          continue;
        }

        for (const animationIndex of animationGroups.keys()) {
          const animation = layer.animations[animationIndex];

          if (!animation) {
            continue;
          }

          animation.easing = easing;
          animation.keyframes = animation.keyframes.map((keyframe) => ({
            ...keyframe,
            easing,
          }));
        }
      }
    });
  }

  protected clearSelectedKeyframeEasing(): void {
    const details = this.selectedKeyframeDetails();

    if (!details) {
      return;
    }

    this.updateLayer(details.layer.id, (layer) => {
      const keyframe = layer.animations?.[details.animationIndex]?.keyframes[details.keyframeIndex];

      if (keyframe) {
        keyframe.easing = undefined;
      }
    });
  }

  protected clearSelectedKeyframesEasing(): void {
    const refs = this.selectedKeyframes();

    if (!refs.length) {
      return;
    }

    this.updateDocument((document) => {
      for (const ref of refs) {
        const layer = findMotionLayer(document.layers, ref.layerId);
        const keyframe = layer?.animations?.[ref.animationIndex]?.keyframes[ref.keyframeIndex];

        if (keyframe) {
          keyframe.easing = undefined;
        }
      }
    });
  }

  protected isSelectedKeyframeEasing(easing: MotionEasingName): boolean {
    return this.selectedKeyframeEasingName() === easing;
  }

  protected isSelectedKeyframesEasing(easing: MotionEasingName): boolean {
    const details = this.selectedKeyframeDetailsList();

    return (
      details.length > 0 &&
      details.every(
        (item) => (item.keyframe.easing ?? item.animation.easing ?? 'linear') === easing,
      )
    );
  }

  protected easingLabel(easing: MotionEasingName): string {
    return this.easingOptions.find((option) => option.value === easing)?.label ?? easing;
  }

  private setLayerKeyframeEasingValue(
    animationIndex: number,
    keyframeIndex: number,
    easing: MotionEasingName,
  ): void {
    this.updateSelectedLayer((layer) => {
      const keyframe = layer.animations?.[animationIndex]?.keyframes[keyframeIndex];

      if (keyframe) {
        keyframe.easing = easing;
      }
    });
  }

  protected animationTrackId(animation: MotionAnimation, index: number): string {
    return animation.id ?? `${animation.property}-${index}`;
  }

  protected toggleLayerAnimationTracks(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();

    if (!layer.animations?.length) {
      return;
    }

    this.expandedAnimationLayerIds.update((ids) =>
      ids.includes(layer.id) ? ids.filter((id) => id !== layer.id) : [...ids, layer.id],
    );
  }

  protected isLayerAnimationExpanded(layer: MotionLayer): boolean {
    return this.expandedAnimationLayerIds().includes(layer.id);
  }

  protected layerAnimationTrackRows(layer: MotionLayer): TimelineAnimationTrackRow[] {
    if (!this.isLayerAnimationExpanded(layer)) {
      return [];
    }

    return (layer.animations ?? []).map((animation, animationIndex) => ({
      id: `${layer.id}-${this.animationTrackId(animation, animationIndex)}`,
      animation,
      animationIndex,
      markers: animation.keyframes.map((keyframe, keyframeIndex) => {
        const absoluteTime = layer.start + keyframe.time;

        return {
          id: `${animation.id ?? animation.property}-${animationIndex}-${keyframeIndex}`,
          animationIndex,
          keyframeIndex,
          property: animation.property,
          time: absoluteTime,
          localTime: keyframe.time,
          left: (absoluteTime / Math.max(1, this.duration())) * 100,
        };
      }),
    }));
  }

  protected formatKeyframeValue(value: MotionValue): string {
    if (typeof value === 'number') {
      return roundMotionNumber(value, 2).toString();
    }

    if (typeof value === 'string' || typeof value === 'boolean') {
      return `${value}`;
    }

    return JSON.stringify(value);
  }

  protected layerKeyframeMarkers(layer: MotionLayer): TimelineKeyframeMarker[] {
    const duration = Math.max(1, this.duration());

    return (layer.animations ?? []).flatMap((animation, animationIndex) =>
      animation.keyframes.map((keyframe, keyframeIndex) => {
        const absoluteTime = layer.start + keyframe.time;

        return {
          id: `${animation.id ?? animation.property}-${animationIndex}-${keyframeIndex}`,
          animationIndex,
          keyframeIndex,
          property: animation.property,
          time: absoluteTime,
          localTime: keyframe.time,
          left: (absoluteTime / duration) * 100,
        };
      }),
    );
  }

  protected isKeyframeSelected(
    layer: MotionLayer,
    animationIndex: number,
    keyframeIndex: number,
  ): boolean {
    return this.selectedKeyframes().some(
      (selectedKeyframe) =>
        selectedKeyframe.layerId === layer.id &&
        selectedKeyframe.animationIndex === animationIndex &&
        selectedKeyframe.keyframeIndex === keyframeIndex,
    );
  }

  protected selectTimelineKeyframe(
    layer: MotionLayer,
    animationIndex: number,
    keyframeIndex: number,
    event?: MouseEvent | PointerEvent,
  ): void {
    event?.stopPropagation();

    if (event?.type === 'click' && this._skipNextKeyframeClick) {
      this._skipNextKeyframeClick = false;
      return;
    }

    const ref: SelectedKeyframeRef = {
      layerId: layer.id,
      animationIndex,
      keyframeIndex,
    };

    this.selectedLayerId.set(layer.id);
    this.selectedLayerIds.set([layer.id]);

    if (event?.shiftKey || event?.metaKey || event?.ctrlKey) {
      const refs = this.selectedKeyframes();
      const isSelected = refs.some((item) => isSameSelectedKeyframe(item, ref));

      this.setSelectedKeyframeRefs(
        isSelected ? refs.filter((item) => !isSameSelectedKeyframe(item, ref)) : [...refs, ref],
      );
    } else {
      this.setSelectedKeyframeRefs([ref]);
    }

    this.selectedSceneId.set(null);

    const keyframe = layer.animations?.[animationIndex]?.keyframes[keyframeIndex];

    if (keyframe) {
      this.seek(layer.start + keyframe.time);
    }
  }

  protected startTimelineKeyframeMove(
    layer: MotionLayer,
    animationIndex: number,
    keyframeIndex: number,
    event: PointerEvent,
  ): void {
    event.stopPropagation();
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      this.selectTimelineKeyframe(layer, animationIndex, keyframeIndex, event);
      this._skipNextKeyframeClick = true;
      event.preventDefault();
      return;
    }

    const isSelectedGroupKeyframe =
      this.selectedKeyframeCount() > 1 &&
      this.isKeyframeSelected(layer, animationIndex, keyframeIndex);

    if (isSelectedGroupKeyframe) {
      const ref: SelectedKeyframeRef = {
        layerId: layer.id,
        animationIndex,
        keyframeIndex,
      };
      const refs = this.selectedKeyframes().filter((item) => !isSameSelectedKeyframe(item, ref));

      this.setSelectedKeyframeRefs([...refs, ref]);
      this.selectedLayerId.set(layer.id);
      this.selectedLayerIds.set([layer.id]);
      this.selectedSceneId.set(null);
      this._skipNextKeyframeClick = true;
    } else {
      this.selectTimelineKeyframe(layer, animationIndex, keyframeIndex, event);
    }

    if (layer.locked) {
      return;
    }

    this.startTimelineInteraction(layer, event, 'keyframe', animationIndex, keyframeIndex);
  }

  protected startPlayheadDrag(event: PointerEvent): void {
    const timeline = (event.currentTarget as HTMLElement).closest(
      '.ngs-motion-studio__timeline-grid',
    ) as HTMLElement | null;
    const scrollContainer = timeline?.closest(
      '.ngs-motion-studio__timeline-scroll',
    ) as HTMLElement | null;

    if (!timeline || !scrollContainer) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.playing.set(false);
    this._interaction = {
      type: 'playhead',
      timelineElement: timeline,
      scrollElement: scrollContainer,
    };
    this.seekFromTimelineElement(event.clientX, timeline);
    this.bindPointerListeners();
  }

  protected startTimelineBoxSelect(event: PointerEvent): void {
    if (event.button !== 0 || isTimelineBoxSelectionBlockedTarget(event.target)) {
      return;
    }

    const timeline = event.currentTarget as HTMLElement;
    const scrollContainer = timeline.closest(
      '.ngs-motion-studio__timeline-scroll',
    ) as HTMLElement | null;

    if (!scrollContainer) {
      return;
    }

    this.playing.set(false);
    this.keyframeSnapGuide.set(null);
    this._interaction = {
      type: 'timeline-box-select',
      timelineElement: timeline,
      scrollElement: scrollContainer,
      startClientX: event.clientX,
      startClientY: event.clientY,
      additive: event.shiftKey || event.metaKey || event.ctrlKey,
      startRefs: this.selectedKeyframes(),
      hasMoved: false,
    };
    this.bindPointerListeners();
    event.preventDefault();
  }

  protected toggleLayerHidden(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.updateLayer(layer.id, (nextLayer) => {
      nextLayer.hidden = !nextLayer.hidden;
    });
  }

  protected toggleLayerLocked(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.updateLayer(layer.id, (nextLayer) => {
      nextLayer.locked = !nextLayer.locked;
    });
  }

  protected toggleGridVisible(event: CheckboxChange): void {
    this.setEditorSettings({ gridVisible: event.checked });
  }

  protected toggleSnapToGrid(event: CheckboxChange): void {
    this.setEditorSettings({ snapToGrid: event.checked });
  }

  protected setGridSize(value: unknown): void {
    this.setEditorSettings({ gridSize: Math.max(4, coerceNumber(value)) });
  }

  protected setTimelineZoom(value: string): void {
    const mode = normalizeTimelineZoomMode(value);

    this.setEditorSettings({ zoom: mode === 'fit' ? 0 : Number(mode) });
  }

  protected moveLayerForward(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.updateLayer(layer.id, (nextLayer) => {
      nextLayer.zIndex = (nextLayer.zIndex ?? 0) + 1;
    });
  }

  protected moveLayerBackward(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.updateLayer(layer.id, (nextLayer) => {
      nextLayer.zIndex = (nextLayer.zIndex ?? 0) - 1;
    });
  }

  protected removeLayer(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.removeLayers([layer.id]);
  }

  protected clipLeft(layer: MotionLayer): number {
    return (layer.start / Math.max(1, this.duration())) * 100;
  }

  protected clipWidth(layer: MotionLayer): number {
    return (layer.duration / Math.max(1, this.duration())) * 100;
  }

  protected transitionWidth(layer: MotionLayer, edge: MotionTransitionEdge): number {
    const transition = layer.transitions?.[edge];

    if (!transition) {
      return 0;
    }

    return Math.min(100, (transition.duration / Math.max(1, layer.duration)) * 100);
  }

  protected sceneLeft(scene: MotionScene): number {
    return (scene.start / Math.max(1, this.duration())) * 100;
  }

  protected sceneWidth(scene: MotionScene): number {
    return (scene.duration / Math.max(1, this.duration())) * 100;
  }

  protected sceneTransitionWidth(scene: MotionScene, edge: MotionTransitionEdge): number {
    const transition = readMotionSceneTransition(scene, edge);

    if (!transition) {
      return 0;
    }

    return Math.min(100, (transition.duration / Math.max(1, scene.duration)) * 100);
  }

  protected layerLeft(layer: MotionLayer): number {
    return (this.layerOverlayLayout(layer).x / this.draft().composition.width) * 100;
  }

  protected layerTop(layer: MotionLayer): number {
    return (this.layerOverlayLayout(layer).y / this.draft().composition.height) * 100;
  }

  protected layerWidth(layer: MotionLayer): number {
    return (this.layerOverlayLayout(layer).width / this.draft().composition.width) * 100;
  }

  protected layerHeight(layer: MotionLayer): number | null {
    if (layer.type === 'text') {
      return null;
    }

    return (this.layerOverlayLayout(layer).height / this.draft().composition.height) * 100;
  }

  protected layerOverlayTransform(layer: MotionLayer): string {
    const snapshot = resolveMotionLayerSnapshot(layer, this.currentTime());
    const sceneEffect = this.layerSceneEffect(layer);

    return sceneEffect.transform
      ? `${sceneEffect.transform} ${snapshot.transform}`
      : snapshot.transform;
  }

  protected layerZIndex(layer: MotionLayer): number {
    return layer.zIndex ?? 0;
  }

  protected layerText(layer: MotionLayer): string {
    return coerceMotionString(
      resolveMotionLayerSnapshot(layer, this.currentTime()).props['text'],
      '',
    );
  }

  protected isEditingTextLayer(layer: MotionLayer): boolean {
    return this.editingTextLayerId() === layer.id;
  }

  protected startTextEdit(layer: MotionLayer, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (layer.type !== 'text' || layer.locked) {
      return;
    }

    this.playing.set(false);
    this.selectLayer(layer);
    this.editingTextLayerId.set(layer.id);
    setTimeout(() => this.focusInlineTextEditor(layer.id));
  }

  protected finishTextEdit(): void {
    this.editingTextLayerId.set(null);
  }

  protected handleInlineTextKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.finishTextEdit();
      return;
    }

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.finishTextEdit();
    }
  }

  protected isUnbrokenTextLayer(layer: MotionLayer): boolean {
    if (layer.type !== 'text') {
      return false;
    }

    return !/[ \t]/.test(this.layerText(layer));
  }

  protected layerTextMeasureStyle(layer: MotionLayer): Record<string, string | number | null> {
    const snapshot = resolveMotionLayerSnapshot(layer, this.currentTime());
    const style = snapshot.style;

    return {
      fontFamily: style.fontFamily ?? null,
      fontSize: style.fontSize !== undefined ? `${style.fontSize}px` : null,
      fontWeight: style.fontWeight ?? null,
      lineHeight: style.lineHeight ?? null,
      letterSpacing: style.letterSpacing !== undefined ? `${style.letterSpacing}px` : null,
      textAlign: style.textAlign ?? null,
      padding: style.padding !== undefined ? `${style.padding}px` : null,
    };
  }

  protected layerTextJustifyContent(layer: MotionLayer): string | null {
    if (layer.type !== 'text') {
      return null;
    }

    if (this.isUnbrokenTextLayer(layer)) {
      return 'flex-start';
    }

    const textAlign = resolveMotionLayerSnapshot(layer, this.currentTime()).style.textAlign;

    if (textAlign === 'center') {
      return 'center';
    }

    if (textAlign === 'right') {
      return 'flex-end';
    }

    return 'flex-start';
  }

  protected startCanvasMove(layer: MotionLayer, event: PointerEvent): void {
    event.stopPropagation();

    if (this.editingTextLayerId() && this.editingTextLayerId() !== layer.id) {
      this.finishTextEdit();
    }

    this.selectLayer(layer, event);

    if (layer.locked) {
      return;
    }

    this.startCanvasInteraction('canvas-move', layer, event);
  }

  protected clearCanvasSelection(event: PointerEvent): void {
    const target = event.target as HTMLElement | null;

    if (target?.closest('.ngs-motion-studio__canvas-layer, .ngs-motion-studio__resize-handle')) {
      return;
    }

    this.finishTextEditAndClearSelection();
  }

  protected startCanvasResize(
    layer: MotionLayer,
    handle: CanvasResizeHandle,
    event: PointerEvent,
  ): void {
    event.stopPropagation();

    if (layer.locked) {
      return;
    }

    this.selectLayer(layer);
    this.startCanvasInteraction('canvas-resize', layer, event, handle);
  }

  protected startTimelineMove(layer: MotionLayer, event: PointerEvent): void {
    event.stopPropagation();
    this.selectLayer(layer);

    if (layer.locked) {
      return;
    }

    this.startTimelineInteraction(layer, event, 'move');
  }

  protected startTimelineTrim(
    layer: MotionLayer,
    edge: TimelineTrimEdge,
    event: PointerEvent,
  ): void {
    event.stopPropagation();
    this.selectLayer(layer);

    if (layer.locked) {
      return;
    }

    this.startTimelineInteraction(layer, event, edge);
  }

  protected layerIcon(layer: MotionLayer): string {
    switch (layer.type) {
      case 'text':
        return 'fluent:text-font-24-regular';
      case 'shape':
        return 'fluent:shapes-24-regular';
      case 'image':
        return 'fluent:image-24-regular';
      case 'group':
        return 'fluent:group-24-regular';
      default:
        return 'fluent:component-2-double-tap-swipe-down-24-regular';
    }
  }

  protected assetIcon(asset: MotionAsset): string {
    switch (asset.type) {
      case 'image':
        return 'fluent:image-24-regular';
      case 'video':
        return 'fluent:video-24-regular';
      case 'audio':
        return 'fluent:music-note-2-24-regular';
      case 'json':
        return 'fluent:document-data-24-regular';
      default:
        return 'fluent:document-24-regular';
    }
  }

  protected assetTypeLabel(asset: MotionAsset): string {
    return asset.type.charAt(0).toUpperCase() + asset.type.slice(1);
  }

  protected assetSizeLabel(asset: MotionAsset): string {
    const size = Number(asset.metadata?.['size'] ?? 0);

    if (!Number.isFinite(size) || size <= 0) {
      return '';
    }

    if (size >= 1024 * 1024) {
      return `${roundMotionNumber(size / 1024 / 1024, 1)} MB`;
    }

    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  protected assetDimensionsLabel(asset: MotionAsset): string {
    const width = Number(asset.metadata?.['width'] ?? 0);
    const height = Number(asset.metadata?.['height'] ?? 0);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return '';
    }

    return `${Math.round(width)}x${Math.round(height)}`;
  }

  protected layerAssetId(layer: MotionLayer): string {
    return coerceMotionString(layer.props?.['assetId'], '');
  }

  protected layerImageSrcValue(layer: MotionLayer): string {
    const src = coerceMotionString(layer.props?.['src'], '');

    if (src) {
      return src;
    }

    const assetId = this.layerAssetId(layer);
    return this.imageAssets().find((asset) => asset.id === assetId)?.src ?? '';
  }

  protected formatTime(time: number): string {
    const totalSeconds = Math.max(0, Math.floor(time / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const frames = Math.floor(((time % 1000) / 1000) * this.draft().composition.fps);

    return `${minutes}:${seconds.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
  }

  protected removeSelectedLayer(): void {
    this.removeLayers(this.selectedLayerIds());
  }

  private removeLayers(layerIds: string[]): void {
    const ids = [...new Set(layerIds)];

    if (!ids.length) {
      return;
    }

    this.updateDocument((document) => {
      document.layers = removeMotionLayers(document.layers, ids);
      document.tracks = document.tracks?.map((track) => ({
        ...track,
        layerIds: track.layerIds?.filter((layerId) => !ids.includes(layerId)),
      }));
      this.selectedLayerId.set(null);
      this.selectedLayerIds.set([]);
    });
  }

  protected exportJson(): string {
    return JSON.stringify(this.draft(), null, 2);
  }

  protected openExportJson(): void {
    this.jsonPanelMode.set('export');
    this.jsonDraft.set(this.exportJson());
    this.jsonIssues.set([]);
    this.jsonStatus.set('');
  }

  protected openImportJson(): void {
    this.jsonPanelMode.set('import');
    this.jsonDraft.set(this.exportJson());
    this.jsonIssues.set([]);
    this.jsonStatus.set('');
  }

  protected setJsonDraft(value: string): void {
    this.jsonDraft.set(value);
    this.jsonIssues.set([]);
    this.jsonStatus.set('');
  }

  protected async copyJson(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      this.jsonStatus.set('Clipboard is not available in this environment.');
      return;
    }

    await navigator.clipboard.writeText(this.jsonDraft());
    this.jsonStatus.set('JSON copied.');
  }

  protected downloadJson(): void {
    if (
      typeof document === 'undefined' ||
      typeof URL === 'undefined' ||
      typeof Blob === 'undefined'
    ) {
      this.jsonStatus.set('Download is not available in this environment.');
      return;
    }

    const blob = new Blob([this.jsonDraft()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `motion-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.jsonStatus.set('JSON download started.');
  }

  protected loadJsonFile(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    const file = inputElement?.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.setJsonDraft(`${reader.result ?? ''}`);
      this.jsonStatus.set(`Loaded ${file.name}.`);
    };
    reader.onerror = () => {
      this.jsonIssues.set([`Could not read ${file.name}.`]);
    };
    reader.readAsText(file);
    inputElement.value = '';
  }

  protected importJson(): boolean {
    const parsed = this.parseJsonDraft();

    if (!parsed) {
      return false;
    }

    this.undoStack.set([]);
    this.redoStack.set([]);
    this.selectedLayerId.set(null);
    this.selectedLayerIds.set([]);
    this.selectedKeyframe.set(null);
    this.editingTextLayerId.set(null);
    this.playing.set(false);
    this.currentTime.set(0);
    this.applyDocument(parsed);
    this.jsonStatus.set('JSON imported.');

    return true;
  }

  private addLayer(type: MotionLayerType): void {
    const layer: MotionLayer = {
      id: createMotionLayerId(type),
      type,
      name: type === 'text' ? 'Text layer' : 'Shape layer',
      start: this.currentTime(),
      duration: 3000,
      zIndex: this.draft().layers.length + 1,
      layout: {
        x: type === 'text' ? 160 : 220,
        y: type === 'text' ? 160 : 360,
        width: type === 'text' ? 720 : 420,
        height: type === 'text' ? 120 : 220,
      },
      style:
        type === 'text'
          ? { color: '#ffffff', fontSize: 72, fontWeight: 700, lineHeight: 1.05 }
          : { background: '#38bdf8', borderRadius: 24 },
      props: type === 'text' ? { text: 'Text layer' } : { kind: 'rectangle' },
    };

    this.updateDocument((document) => {
      document.layers.push(layer);
      document.tracks = ensureLayerInTrack(document.tracks, layer.id);
      this.selectedLayerId.set(layer.id);
      this.selectedLayerIds.set([layer.id]);
      this.selectedKeyframe.set(null);
    });
  }

  private readDraggedPreset(event: DragEvent): MotionPreset | null {
    const presetId =
      event.dataTransfer?.getData('application/x-ngs-motion-preset') ||
      event.dataTransfer?.getData('text/plain') ||
      this.draggedPresetId();

    if (!presetId) {
      return null;
    }

    return this.presets().find((preset) => preset.id === presetId) ?? null;
  }

  private insertPreset(preset: MotionPreset, options: MotionPresetInsertOptions = {}): void {
    this.updateDocument((document) => {
      const topZIndex = Math.max(
        0,
        ...flattenMotionLayers(document.layers).map((item) => item.layer.zIndex ?? 0),
      );
      const stampedLayers = this.createPresetLayers(preset, topZIndex, options);

      document.layers.push(...stampedLayers);
      for (const layer of stampedLayers) {
        document.tracks = ensureLayerInTrack(document.tracks, layer.id);
      }
      this.selectedLayerId.set(
        stampedLayers[stampedLayers.length - 1]?.id ?? this.selectedLayerId(),
      );
      this.selectedLayerIds.set(
        stampedLayers.length ? stampedLayers.map((layer) => layer.id) : this.selectedLayerIds(),
      );
      this.selectedKeyframe.set(null);
    });
  }

  private createPresetLayers(
    preset: MotionPreset,
    topZIndex: number,
    options: MotionPresetInsertOptions = {},
  ): MotionLayer[] {
    const startOffset = preset.layers.length
      ? Math.min(...preset.layers.map((layer) => layer.start))
      : 0;
    const startTime = options.startTime ?? this.currentTime();
    const stampedLayers = preset.layers.map((layer, index) => ({
      ...cloneMotionLayer(layer),
      id: createMotionLayerId(layer.id),
      name: layer.name,
      start: startTime + layer.start - startOffset,
      zIndex: topZIndex + index + 1,
    }));

    if (options.placement) {
      translateMotionLayersToPoint(stampedLayers, options.placement);
    }

    return stampedLayers;
  }

  private insertLayerCopies(layers: MotionLayer[], mode: 'duplicate' | 'paste'): void {
    if (!layers.length) {
      return;
    }

    this.updateDocument((document) => {
      const topZIndex = Math.max(0, ...this.layers().map((item) => item.layer.zIndex ?? 0));
      const copiedLayers = layers.map((layer, index) =>
        createCopiedMotionLayer(layer, {
          mode,
          index,
          zIndex: topZIndex + index + 1,
        }),
      );

      document.layers.push(...copiedLayers);
      for (const layer of copiedLayers) {
        document.tracks = ensureLayerInTrack(document.tracks, layer.id);
      }
      this.selectedLayerId.set(copiedLayers[copiedLayers.length - 1]?.id ?? null);
      this.selectedLayerIds.set(copiedLayers.map((layer) => layer.id));
      this.selectedKeyframe.set(null);
    });
  }

  private createImageLayer(asset: MotionAsset): MotionLayer {
    const composition = this.draft().composition;
    const naturalWidth = readMotionAssetNumber(asset, 'width', 960);
    const naturalHeight = readMotionAssetNumber(asset, 'height', 540);
    const maxWidth = composition.width * 0.52;
    const maxHeight = composition.height * 0.52;
    const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
    const width = Math.max(MIN_LAYER_SIZE, naturalWidth * scale);
    const height = Math.max(MIN_LAYER_SIZE, naturalHeight * scale);

    return {
      id: createMotionLayerId('image'),
      type: 'image',
      name: asset.name || 'Image layer',
      start: this.currentTime(),
      duration: Math.min(4000, this.duration()),
      zIndex: this.draft().layers.length + 1,
      layout: {
        x: roundMotionNumber((composition.width - width) / 2, 2),
        y: roundMotionNumber((composition.height - height) / 2, 2),
        width: roundMotionNumber(width, 2),
        height: roundMotionNumber(height, 2),
      },
      style: {
        objectFit: 'cover',
      },
      props: {
        assetId: asset.id,
        src: asset.src,
      },
    };
  }

  private toggleLayerSelection(layer: MotionLayer): void {
    const selectedIds = this.selectedLayerIds();
    this.selectedKeyframe.set(null);

    if (selectedIds.includes(layer.id)) {
      const nextSelectedIds = selectedIds.filter((id) => id !== layer.id);
      this.selectedLayerIds.set(nextSelectedIds);
      this.selectedLayerId.set(nextSelectedIds[nextSelectedIds.length - 1] ?? null);
      return;
    }

    this.selectedLayerIds.set([...selectedIds, layer.id]);
    this.selectedLayerId.set(layer.id);
  }

  private startCanvasInteraction(
    type: CanvasInteraction['type'],
    layer: MotionLayer,
    event: PointerEvent,
    handle?: CanvasResizeHandle,
  ): void {
    const stage = (event.currentTarget as HTMLElement).closest(
      '.ngs-motion-studio__stage-canvas',
    ) as HTMLElement | null;

    if (!stage) {
      return;
    }

    this.playing.set(false);
    this.canvasInteractionType.set(type);
    this._interactionHistorySnapshot = cloneMotionDocument(this.draft());
    this._interaction = {
      type,
      layerId: layer.id,
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLayout: { ...layer.layout },
      startAnimations: cloneMotionAnimations(layer.animations),
      stageRect: stage.getBoundingClientRect(),
    };
    this.bindPointerListeners();
    event.preventDefault();
  }

  private startTimelineInteraction(
    layer: MotionLayer,
    event: PointerEvent,
    mode: TimelineInteraction['mode'],
    animationIndex?: number,
    keyframeIndex?: number,
  ): void {
    const timeline = (event.currentTarget as HTMLElement).closest(
      '.ngs-motion-studio__timeline-grid',
    ) as HTMLElement | null;

    if (!timeline) {
      return;
    }

    this.playing.set(false);
    this.keyframeSnapGuide.set(null);
    this._interactionHistorySnapshot = cloneMotionDocument(this.draft());
    this._interaction = {
      type: 'timeline',
      layerId: layer.id,
      mode,
      animationIndex,
      keyframeIndex,
      keyframeTime:
        animationIndex !== undefined && keyframeIndex !== undefined
          ? (layer.animations?.[animationIndex]?.keyframes[keyframeIndex]?.time ?? 0)
          : undefined,
      keyframeGroup:
        mode === 'keyframe' && animationIndex !== undefined && keyframeIndex !== undefined
          ? this.createTimelineKeyframeDragEntries(layer, animationIndex, keyframeIndex)
          : undefined,
      startClientX: event.clientX,
      start: layer.start,
      duration: layer.duration,
      timelineRect: timeline.getBoundingClientRect(),
    };
    this.bindPointerListeners();
    event.preventDefault();
  }

  private createTimelineKeyframeDragEntries(
    layer: MotionLayer,
    animationIndex: number,
    keyframeIndex: number,
  ): TimelineKeyframeDragEntry[] {
    const leadRef: SelectedKeyframeRef = {
      layerId: layer.id,
      animationIndex,
      keyframeIndex,
    };
    const refs = this.selectedKeyframes().some((ref) => isSameSelectedKeyframe(ref, leadRef))
      ? this.selectedKeyframes()
      : [leadRef];

    return refs
      .map((ref) => {
        const itemLayer = findMotionLayer(this.draft().layers, ref.layerId);
        const keyframe = itemLayer?.animations?.[ref.animationIndex]?.keyframes[ref.keyframeIndex];

        if (!keyframe) {
          return null;
        }

        return {
          ...ref,
          startTime: keyframe.time,
          lead: isSameSelectedKeyframe(ref, leadRef),
        };
      })
      .filter((entry): entry is TimelineKeyframeDragEntry => !!entry);
  }

  private continueInteraction(event: PointerEvent): void {
    const interaction = this._interaction;

    if (!interaction) {
      return;
    }

    if (interaction.type === 'playhead') {
      this.continuePlayheadInteraction(interaction, event);
    } else if (interaction.type === 'timeline-box-select') {
      this.continueTimelineBoxSelection(interaction, event);
    } else if (interaction.type === 'timeline') {
      this.continueTimelineInteraction(interaction, event);
    } else {
      this.continueCanvasInteraction(interaction, event);
    }
  }

  private continueCanvasInteraction(interaction: CanvasInteraction, event: PointerEvent): void {
    const composition = this.draft().composition;
    const dx =
      ((event.clientX - interaction.startClientX) / interaction.stageRect.width) *
      composition.width;
    const dy =
      ((event.clientY - interaction.startClientY) / interaction.stageRect.height) *
      composition.height;
    const next = { ...interaction.startLayout };

    if (interaction.type === 'canvas-move') {
      next.x = this.snapCanvasValue(interaction.startLayout.x + dx);
      next.y = this.snapCanvasValue(interaction.startLayout.y + dy);
    } else {
      resizeMotionLayout(
        next,
        interaction.startLayout,
        dx,
        dy,
        interaction.handle ?? 'se',
        event.shiftKey,
      );
      next.x = this.snapCanvasValue(next.x);
      next.y = this.snapCanvasValue(next.y);
      next.width = this.snapCanvasValue(next.width);
      next.height = this.snapCanvasValue(next.height);
    }

    const normalized = normalizeMotionLayout(next);
    const layoutDelta = getLayoutDelta(interaction.startLayout, normalized);

    this.updateLayer(
      interaction.layerId,
      (layer) => {
        layer.layout = normalized;
        layer.animations = shiftMotionLayoutAnimations(interaction.startAnimations, layoutDelta);
      },
      { recordHistory: false },
    );
  }

  private layerOverlayLayout(layer: MotionLayer): MotionLayout {
    return resolveMotionLayerSnapshot(layer, this.currentTime()).layout;
  }

  private isCanvasLayerVisible(layer: MotionLayer): boolean {
    return (
      resolveMotionLayerSnapshot(layer, this.currentTime()).visible &&
      this.isLayerVisibleInActiveScene(layer)
    );
  }

  private isLayerVisibleInActiveScene(layer: MotionLayer): boolean {
    const scenes = this.draft().scenes ?? [];

    if (!scenes.some((scene) => sceneContainsLayer(scene, layer.id))) {
      return true;
    }

    return !!this.activeSceneForLayer(layer);
  }

  private activeSceneForLayer(layer: MotionLayer): MotionScene | null {
    const time = this.currentTime();

    return (
      this.draft().scenes?.find(
        (scene) =>
          sceneContainsLayer(scene, layer.id) &&
          time >= scene.start &&
          time <= scene.start + scene.duration,
      ) ?? null
    );
  }

  private layerSceneEffect(layer: MotionLayer): MotionStudioSceneEffect {
    const scene = this.activeSceneForLayer(layer);

    if (!scene) {
      return EMPTY_MOTION_STUDIO_SCENE_EFFECT;
    }

    const localTime = this.currentTime() - scene.start;
    const scratchLayout: MotionLayout = { x: 0, y: 0, width: 1, height: 1, scale: 1 };
    const scratchStyle: MotionStyle = {};
    let opacity = 1;

    if (scene.transitionIn) {
      opacity *= applyMotionTransition(
        scene.transitionIn,
        'in',
        localTime,
        scene.duration,
        scratchLayout,
        scratchStyle,
      );
    }

    if (scene.transitionOut) {
      opacity *= applyMotionTransition(
        scene.transitionOut,
        'out',
        localTime,
        scene.duration,
        scratchLayout,
        scratchStyle,
      );
    }

    const transforms: string[] = [];

    if (scratchLayout.x || scratchLayout.y) {
      transforms.push(`translate(${scratchLayout.x}px, ${scratchLayout.y}px)`);
    }

    if (scratchLayout.scale !== undefined && scratchLayout.scale !== 1) {
      transforms.push(`scale(${scratchLayout.scale})`);
    }

    return {
      opacity,
      transform: transforms.join(' '),
    };
  }

  private continuePlayheadInteraction(interaction: PlayheadInteraction, event: PointerEvent): void {
    this.autoScrollTimeline(interaction.scrollElement, event.clientX);
    this.seekFromTimelineElement(event.clientX, interaction.timelineElement);
  }

  private continueTimelineBoxSelection(
    interaction: TimelineBoxSelectionInteraction,
    event: PointerEvent,
  ): void {
    this.autoScrollTimeline(interaction.scrollElement, event.clientX);

    const distance = Math.hypot(
      event.clientX - interaction.startClientX,
      event.clientY - interaction.startClientY,
    );

    if (!interaction.hasMoved && distance < TIMELINE_BOX_SELECT_THRESHOLD) {
      return;
    }

    interaction.hasMoved = true;

    const box = createTimelineSelectionBox(
      interaction.timelineElement,
      interaction.startClientX,
      interaction.startClientY,
      event.clientX,
      event.clientY,
    );
    const selectedRefs = this.findKeyframesInTimelineSelectionBox(interaction.timelineElement, box);
    const nextRefs = interaction.additive
      ? uniqueSelectedKeyframes([...interaction.startRefs, ...selectedRefs])
      : selectedRefs;

    this.timelineSelectionBox.set(box);
    this.applyTimelineBoxSelection(nextRefs);
  }

  private continueTimelineInteraction(interaction: TimelineInteraction, event: PointerEvent): void {
    const trackWidth = Math.max(1, interaction.timelineRect.width - TIMELINE_LABEL_WIDTH);
    const delta = ((event.clientX - interaction.startClientX) / trackWidth) * this.duration();
    const snappedDelta = snapTimelineTime(delta);
    const minDuration = 100;

    if (interaction.mode === 'keyframe') {
      this.continueTimelineKeyframeInteraction(interaction, delta);
      return;
    }

    this.updateLayer(
      interaction.layerId,
      (layer) => {
        if (interaction.mode === 'move') {
          layer.start = Math.max(
            0,
            Math.min(
              this.duration() - layer.duration,
              snapTimelineTime(interaction.start + snappedDelta),
            ),
          );
          return;
        }

        if (interaction.mode === 'start') {
          const nextStart = Math.max(
            0,
            Math.min(
              interaction.start + interaction.duration - minDuration,
              interaction.start + snappedDelta,
            ),
          );
          layer.start = snapTimelineTime(nextStart);
          layer.duration = snapTimelineTime(interaction.start + interaction.duration - layer.start);
          return;
        }

        layer.duration = Math.max(
          minDuration,
          Math.min(
            this.duration() - interaction.start,
            snapTimelineTime(interaction.duration + snappedDelta),
          ),
        );
      },
      { recordHistory: false },
    );

    this.keyframeSnapGuide.set(null);
  }

  private continueTimelineKeyframeInteraction(
    interaction: TimelineInteraction,
    delta: number,
  ): void {
    const entries = interaction.keyframeGroup;
    const leadEntry = entries?.find((entry) => entry.lead);

    if (!entries?.length || !leadEntry) {
      return;
    }

    let desiredDelta = delta;
    let nextSnapGuide: KeyframeSnapGuide | null = null;

    this.updateDocument(
      (document) => {
        const leadLayer = findMotionLayer(document.layers, leadEntry.layerId);
        const leadAnimation = leadLayer?.animations?.[leadEntry.animationIndex];
        const leadKeyframe = leadAnimation?.keyframes[leadEntry.keyframeIndex];

        if (!leadLayer || !leadAnimation || !leadKeyframe) {
          return;
        }

        const snap = this.resolveKeyframeSnap(
          leadLayer,
          leadAnimation,
          leadKeyframe,
          leadEntry.startTime + delta,
        );
        desiredDelta = snap.time - leadEntry.startTime;
        desiredDelta = clampTimelineKeyframeGroupDelta(entries, document.layers, desiredDelta);

        const grouped = groupTimelineKeyframeDragEntries(entries);
        const nextRefs: SelectedKeyframeRef[] = [];

        nextSnapGuide = snap.target
          ? {
              absoluteTime: leadLayer.start + leadEntry.startTime + desiredDelta,
              label: this.formatKeyframeSnapTarget(snap.target),
              type: snap.target.type,
            }
          : null;

        for (const [layerId, animationGroups] of grouped) {
          const layer = findMotionLayer(document.layers, layerId);

          if (!layer?.animations) {
            continue;
          }

          for (const [animationIndex, groupEntries] of animationGroups) {
            const animation = layer.animations[animationIndex];

            if (!animation) {
              continue;
            }

            const movedKeyframes = groupEntries
              .map((entry) => ({
                entry,
                keyframe: animation.keyframes[entry.keyframeIndex],
              }))
              .filter(
                (item): item is { entry: TimelineKeyframeDragEntry; keyframe: MotionKeyframe } =>
                  !!item.keyframe,
              );

            for (const item of movedKeyframes) {
              item.keyframe.time = Math.max(
                0,
                Math.min(layer.duration, item.entry.startTime + desiredDelta),
              );
            }

            animation.keyframes = sortKeyframes(animation.keyframes);

            for (const item of movedKeyframes) {
              const keyframeIndex = animation.keyframes.indexOf(item.keyframe);

              if (keyframeIndex === -1) {
                continue;
              }

              item.entry.keyframeIndex = keyframeIndex;
              nextRefs.push({
                layerId: layer.id,
                animationIndex,
                keyframeIndex,
              });
            }
          }
        }

        this.setSelectedKeyframeRefs(nextRefs);
      },
      { recordHistory: false },
    );

    this.keyframeSnapGuide.set(nextSnapGuide);
  }

  private endInteraction(): void {
    const interaction = this._interaction;

    if (interaction?.type === 'timeline-box-select') {
      this.timelineSelectionBox.set(null);
      this._suppressNextTimelineClick = interaction.hasMoved;
    }

    this.commitInteractionHistory();
    this._interaction = null;
    this.canvasInteractionType.set(null);
    this.keyframeSnapGuide.set(null);
    this._removeInteractionListeners?.();
    this._removeInteractionListeners = null;
  }

  private bindPointerListeners(): void {
    if (this._removeInteractionListeners || typeof window === 'undefined') {
      return;
    }

    const move = (event: PointerEvent) => this.continueInteraction(event);
    const up = () => this.endInteraction();

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    this._removeInteractionListeners = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }

  private focusInlineTextEditor(layerId: string): void {
    if (typeof document === 'undefined') {
      return;
    }

    const editors = Array.from(
      document.querySelectorAll<HTMLTextAreaElement>('.ngs-motion-studio__inline-text-editor'),
    );
    const editor = editors.find((item) => item.dataset['motionLayerId'] === layerId);

    editor?.focus();
    editor?.select();
  }

  private finishTextEditAndClearSelection(): void {
    this.finishTextEdit();
    this.selectedLayerId.set(null);
    this.selectedLayerIds.set([]);
  }

  private timelineRatioFromEvent(event: MouseEvent | PointerEvent): number {
    return this.timelineRatioFromElement(event.clientX, event.currentTarget as HTMLElement);
  }

  private timelineRatioFromElement(clientX: number, timeline: HTMLElement): number {
    const rect = timeline.getBoundingClientRect();
    const trackWidth = Math.max(1, rect.width - TIMELINE_LABEL_WIDTH);
    const x = Math.max(0, Math.min(trackWidth, clientX - rect.left - TIMELINE_LABEL_WIDTH));

    return x / trackWidth;
  }

  private seekFromTimelineElement(clientX: number, timeline: HTMLElement): void {
    this.seek(this.timelineRatioFromElement(clientX, timeline) * this.duration());
  }

  private snapKeyframeTime(
    layer: MotionLayer,
    animation: MotionAnimation,
    keyframe: MotionKeyframe,
    time: number,
    options: KeyframeSnapOptions = {},
  ): number {
    return this.resolveKeyframeSnap(layer, animation, keyframe, time, options).time;
  }

  private resolveKeyframeSnap(
    layer: MotionLayer,
    animation: MotionAnimation,
    keyframe: MotionKeyframe,
    time: number,
    options: KeyframeSnapOptions = {},
  ): KeyframeSnapResult {
    const frameDuration = this.frameDuration();
    const baseTime = this.snapToGrid() ? Math.round(time / frameDuration) * frameDuration : time;
    const clampedTime = Math.max(0, Math.min(layer.duration, baseTime));
    const targets = this.keyframeSnapTargets(layer, animation, keyframe, options);
    const threshold = Math.max(frameDuration * 1.5, KEYFRAME_SNAP_THRESHOLD);
    const nearest = targets.reduce<KeyframeSnapTarget | null>((closest, target) => {
      const distance = Math.abs(target.time - clampedTime);

      if (distance > threshold) {
        return closest;
      }

      if (!closest || distance < Math.abs(closest.time - clampedTime)) {
        return target;
      }

      return closest;
    }, null);

    if (nearest) {
      return { time: nearest.time, target: nearest };
    }

    return {
      time: clampedTime,
      target:
        this.snapToGrid() && Math.abs(baseTime - time) > 0.001
          ? { time: clampedTime, type: 'frame-grid' }
          : null,
    };
  }

  private formatKeyframeSnapTarget(target: KeyframeSnapTarget): string {
    switch (target.type) {
      case 'playhead':
        return 'Playhead';
      case 'layer-start':
        return 'Layer start';
      case 'layer-end':
        return 'Layer end';
      case 'scene-start':
        return 'Scene start';
      case 'scene-end':
        return 'Scene end';
      case 'keyframe':
        return 'Keyframe';
      case 'frame-grid':
        return 'Frame grid';
      default:
        return 'Snap';
    }
  }

  private keyframeSnapTargets(
    layer: MotionLayer,
    animation: MotionAnimation,
    keyframe: MotionKeyframe,
    options: KeyframeSnapOptions,
  ): KeyframeSnapTarget[] {
    const targets: KeyframeSnapTarget[] = [
      { time: 0, type: 'layer-start' },
      { time: layer.duration, type: 'layer-end' },
    ];
    const playheadLocalTime = this.currentTime() - layer.start;

    if (
      options.includePlayhead !== false &&
      playheadLocalTime >= 0 &&
      playheadLocalTime <= layer.duration
    ) {
      targets.push({
        time: snapTimelineTime(playheadLocalTime),
        type: 'playhead',
      });
    }

    for (const scene of this.draft().scenes ?? []) {
      if (!sceneContainsLayer(scene, layer.id)) {
        continue;
      }

      const sceneStart = scene.start - layer.start;
      const sceneEnd = scene.start + scene.duration - layer.start;

      if (sceneStart >= 0 && sceneStart <= layer.duration) {
        targets.push({ time: snapTimelineTime(sceneStart), type: 'scene-start' });
      }

      if (sceneEnd >= 0 && sceneEnd <= layer.duration) {
        targets.push({ time: snapTimelineTime(sceneEnd), type: 'scene-end' });
      }
    }

    for (const track of layer.animations ?? [animation]) {
      for (const item of track.keyframes) {
        if (item === keyframe) {
          continue;
        }

        targets.push({ time: item.time, type: 'keyframe' });
      }
    }

    return targets;
  }

  private autoScrollTimeline(scrollElement: HTMLElement, clientX: number): void {
    const rect = scrollElement.getBoundingClientRect();
    const leftDistance = clientX - rect.left;
    const rightDistance = rect.right - clientX;
    const maxStep = 28;
    let delta = 0;

    if (leftDistance < TIMELINE_AUTOSCROLL_EDGE) {
      delta = -Math.ceil(
        ((TIMELINE_AUTOSCROLL_EDGE - leftDistance) / TIMELINE_AUTOSCROLL_EDGE) * maxStep,
      );
    } else if (rightDistance < TIMELINE_AUTOSCROLL_EDGE) {
      delta = Math.ceil(
        ((TIMELINE_AUTOSCROLL_EDGE - rightDistance) / TIMELINE_AUTOSCROLL_EDGE) * maxStep,
      );
    }

    if (delta !== 0) {
      scrollElement.scrollLeft += delta;
    }
  }

  private snapCanvasValue(value: number): number {
    if (!this.snapToGrid()) {
      return value;
    }

    const gridSize = Math.max(1, this.gridSize());

    return Math.round(value / gridSize) * gridSize;
  }

  private frameDuration(): number {
    return 1000 / Math.max(1, this.draft().composition.fps);
  }

  private snapTimeToFrame(time: number): number {
    const frameDuration = this.frameDuration();
    const snappedTime = Math.round(time / frameDuration) * frameDuration;

    return Math.max(0, Math.min(this.duration(), snappedTime));
  }

  private setEditorSettings(settings: MotionEditorSettings): void {
    const nextSettings = {
      ...(this.draft().editor ?? {}),
      ...settings,
    };

    this.syncEditorSettings(nextSettings);
    this.updateDocument((document) => {
      document.editor = nextSettings;
    });
  }

  private syncEditorSettings(settings: MotionEditorSettings | undefined): void {
    this.gridVisible.set(settings?.gridVisible ?? true);
    this.snapToGrid.set(settings?.snapToGrid ?? false);
    this.gridSize.set(Math.max(4, settings?.gridSize ?? 80));
    this.timelineZoomMode.set(readTimelineZoomMode(settings?.zoom));
  }

  private parseJsonDraft(): MotionDocument | null {
    let parsed: unknown;

    try {
      parsed = JSON.parse(this.jsonDraft());
    } catch (error) {
      this.jsonIssues.set([error instanceof Error ? error.message : 'JSON could not be parsed.']);
      return null;
    }

    if (!isMotionDocumentShape(parsed)) {
      this.jsonIssues.set(['Document must include composition and layers array.']);
      return null;
    }

    const issues = validateMotionDocument(parsed as MotionDocument);

    if (issues.length) {
      this.jsonIssues.set(issues.map((issue) => `${issue.path}: ${issue.message}`));
      return null;
    }

    this.jsonIssues.set([]);

    return cloneMotionDocument(parsed as MotionDocument);
  }

  private updateSelectedLayer(
    mutator: (layer: MotionLayer) => void,
    options: MotionDocumentUpdateOptions = {},
  ): void {
    const selectedId = this.selectedLayerId();

    if (!selectedId) {
      return;
    }

    this.updateDocument((document) => {
      const layer = findMotionLayer(document.layers, selectedId);

      if (layer) {
        mutator(layer);
      }
    }, options);
  }

  private updateSelectedScene(
    mutator: (scene: MotionScene) => void,
    options: MotionDocumentUpdateOptions = {},
  ): void {
    const selectedId = this.selectedSceneId();

    if (!selectedId) {
      return;
    }

    this.updateDocument((document) => {
      const scene = document.scenes?.find((item) => item.id === selectedId);

      if (scene) {
        mutator(scene);
      }
    }, options);
  }

  private updateLayer(
    id: string,
    mutator: (layer: MotionLayer) => void,
    options: MotionDocumentUpdateOptions = {},
  ): void {
    this.updateDocument((document) => {
      const layer = findMotionLayer(document.layers, id);

      if (layer) {
        mutator(layer);
      }
    }, options);
  }

  private readSelectedKeyframeDetails(ref: SelectedKeyframeRef): SelectedKeyframeDetails | null {
    const layer = findMotionLayer(this.draft().layers, ref.layerId);
    const animation = layer?.animations?.[ref.animationIndex];
    const keyframe = animation?.keyframes[ref.keyframeIndex];

    if (!layer || !animation || !keyframe) {
      return null;
    }

    return {
      ...ref,
      layer,
      animation,
      keyframe,
      absoluteTime: layer.start + keyframe.time,
    };
  }

  private setSelectedKeyframeRefs(refs: SelectedKeyframeRef[]): void {
    const normalized = uniqueSelectedKeyframes(refs);
    const primary = normalized[normalized.length - 1] ?? null;

    this.selectedKeyframes.set(normalized);
    this.selectedKeyframe.set(primary);
  }

  private applyTimelineBoxSelection(refs: SelectedKeyframeRef[]): void {
    this.setSelectedKeyframeRefs(refs);
    this.selectedSceneId.set(null);

    if (!refs.length) {
      this.selectedLayerId.set(null);
      this.selectedLayerIds.set([]);
      return;
    }

    const layerIds = uniqueStrings(refs.map((ref) => ref.layerId));

    this.selectedLayerIds.set(layerIds);
    this.selectedLayerId.set(refs[refs.length - 1].layerId);
  }

  private findKeyframesInTimelineSelectionBox(
    timeline: HTMLElement,
    box: TimelineSelectionBox,
  ): SelectedKeyframeRef[] {
    const timelineRect = timeline.getBoundingClientRect();
    const selectionRect = {
      left: timelineRect.left + box.left,
      right: timelineRect.left + box.left + box.width,
      top: timelineRect.top + box.top,
      bottom: timelineRect.top + box.top + box.height,
    };
    const markers = Array.from(
      timeline.querySelectorAll<HTMLElement>('.ngs-motion-studio__keyframe-marker'),
    );

    return uniqueSelectedKeyframes(
      markers
        .filter((marker) => isTimelineMarkerInsideRect(marker, selectionRect))
        .map((marker) => ({
          layerId: marker.dataset['motionLayerId'] ?? '',
          animationIndex: Number(marker.dataset['motionAnimationIndex']),
          keyframeIndex: Number(marker.dataset['motionKeyframeIndex']),
        }))
        .filter(
          (ref) =>
            !!ref.layerId &&
            Number.isInteger(ref.animationIndex) &&
            Number.isInteger(ref.keyframeIndex),
        ),
    );
  }

  private clearSelectedKeyframes(): void {
    this.selectedKeyframes.set([]);
    this.selectedKeyframe.set(null);
  }

  private updateDocument(
    mutator: (document: MotionDocument) => void,
    options: MotionDocumentUpdateOptions = {},
  ): void {
    const previous = cloneMotionDocument(this.draft());
    const next = cloneMotionDocument(this.draft());
    mutator(next);

    if (serializeMotionDocument(previous) === serializeMotionDocument(next)) {
      return;
    }

    if (options.recordHistory !== false) {
      this.pushUndoSnapshot(previous);
      this.redoStack.set([]);
    }

    this.applyDocument(next);
  }

  private applyAnimationPresetToLayers(
    type: MotionAnimationPresetType,
    scope: MotionAnimationScope,
  ): void {
    const layerIds = this.animationScopeLayerIds(scope);

    if (!layerIds.length) {
      return;
    }

    const currentTime = this.currentTime();
    const settings = this.animationPresetSettings();
    const applyMode = this.animationPresetApplyMode();

    this.updateDocument((document) => {
      for (const layerId of layerIds) {
        const layer = findMotionLayer(document.layers, layerId);

        if (!layer) {
          continue;
        }

        const presetTracks = createAnimationPresetTracks(layer, type, currentTime, settings);

        layer.animations = applyAnimationTracks(layer.animations ?? [], presetTracks, applyMode);
      }
    });
    this.clearSelectedKeyframes();
  }

  private animationScopeLayerIds(scope: MotionAnimationScope): string[] {
    return scope === 'selection'
      ? this.selectedLayerIds()
      : this.selectedLayerId()
        ? [this.selectedLayerId()!]
        : [];
  }

  private syncDraftDocument(document: MotionDocument): void {
    this.draft.set(document);
    this.syncEditorSettings(document.editor);

    const validSelectedIds = this.selectedLayerIds().filter((id) =>
      findMotionLayer(document.layers, id),
    );
    const selectedId = this.selectedLayerId();

    if (validSelectedIds.length !== this.selectedLayerIds().length) {
      this.selectedLayerIds.set(validSelectedIds);
    }

    const validExpandedIds = this.expandedAnimationLayerIds().filter((id) =>
      findMotionLayer(document.layers, id),
    );

    if (validExpandedIds.length !== this.expandedAnimationLayerIds().length) {
      this.expandedAnimationLayerIds.set(validExpandedIds);
    }

    if (selectedId && !findMotionLayer(document.layers, selectedId)) {
      this.selectedLayerId.set(validSelectedIds[validSelectedIds.length - 1] ?? null);
    }

    const selectedSceneId = this.selectedSceneId();

    if (selectedSceneId && !document.scenes?.some((scene) => scene.id === selectedSceneId)) {
      this.selectedSceneId.set(null);
    }

    const selectedKeyframe = this.selectedKeyframe();
    const validSelectedKeyframes = this.selectedKeyframes().filter((ref) =>
      findMotionKeyframe(document.layers, ref),
    );

    if (validSelectedKeyframes.length !== this.selectedKeyframes().length) {
      this.setSelectedKeyframeRefs(validSelectedKeyframes);
    }

    if (selectedKeyframe && !findMotionKeyframe(document.layers, selectedKeyframe)) {
      this.selectedKeyframe.set(validSelectedKeyframes[validSelectedKeyframes.length - 1] ?? null);
    }

    if (this.currentTime() > document.composition.duration) {
      this.currentTime.set(document.composition.duration);
    }
  }

  private applyDocument(document: MotionDocument): void {
    const next = cloneMotionDocument(document);
    this.syncDraftDocument(next);
    this._lastEmittedDocumentSignature = serializeMotionDocument(next);
    this.documentChange.emit(next);
  }

  private restoreHistoryDocument(document: MotionDocument): void {
    this.applyDocument(document);
  }

  private pushUndoSnapshot(document: MotionDocument): void {
    this.undoStack.update((stack) => {
      const previous = stack[stack.length - 1];

      if (previous && serializeMotionDocument(previous) === serializeMotionDocument(document)) {
        return stack;
      }

      return [...stack, cloneMotionDocument(document)].slice(-MOTION_HISTORY_LIMIT);
    });
  }

  private commitInteractionHistory(): void {
    const snapshot = this._interactionHistorySnapshot;

    if (!snapshot) {
      return;
    }

    this._interactionHistorySnapshot = null;

    if (serializeMotionDocument(snapshot) === serializeMotionDocument(this.draft())) {
      return;
    }

    this.pushUndoSnapshot(snapshot);
    this.redoStack.set([]);
  }
}

const findMotionLayer = (layers: MotionLayer[], id: string): MotionLayer | null => {
  for (const layer of layers) {
    if (layer.id === id) {
      return layer;
    }

    const child = findMotionLayer(layer.children ?? [], id);

    if (child) {
      return child;
    }
  }

  return null;
};

const findMotionKeyframe = (
  layers: MotionLayer[],
  ref: SelectedKeyframeRef,
): MotionKeyframe | null => {
  const layer = findMotionLayer(layers, ref.layerId);

  return layer?.animations?.[ref.animationIndex]?.keyframes[ref.keyframeIndex] ?? null;
};

const selectedKeyframeKey = (ref: SelectedKeyframeRef): string =>
  `${ref.layerId}:${ref.animationIndex}:${ref.keyframeIndex}`;

const isSameSelectedKeyframe = (a: SelectedKeyframeRef, b: SelectedKeyframeRef): boolean =>
  selectedKeyframeKey(a) === selectedKeyframeKey(b);

const uniqueSelectedKeyframes = (refs: SelectedKeyframeRef[]): SelectedKeyframeRef[] => {
  const seen = new Set<string>();
  const next: SelectedKeyframeRef[] = [];

  for (const ref of refs) {
    const key = selectedKeyframeKey(ref);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    next.push(ref);
  }

  return next;
};

const uniqueStrings = (values: string[]): string[] => Array.from(new Set(values));

const createTimelineSelectionBox = (
  timeline: HTMLElement,
  startClientX: number,
  startClientY: number,
  endClientX: number,
  endClientY: number,
): TimelineSelectionBox => {
  const rect = timeline.getBoundingClientRect();
  const startX = Math.max(TIMELINE_LABEL_WIDTH, Math.min(rect.width, startClientX - rect.left));
  const endX = Math.max(TIMELINE_LABEL_WIDTH, Math.min(rect.width, endClientX - rect.left));
  const startY = Math.max(0, Math.min(rect.height, startClientY - rect.top));
  const endY = Math.max(0, Math.min(rect.height, endClientY - rect.top));

  return {
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  };
};

const isTimelineMarkerInsideRect = (marker: HTMLElement, rect: TimelineViewportRect): boolean => {
  const markerRect = marker.getBoundingClientRect();
  const centerX = markerRect.left + markerRect.width / 2;
  const centerY = markerRect.top + markerRect.height / 2;

  return (
    centerX >= rect.left && centerX <= rect.right && centerY >= rect.top && centerY <= rect.bottom
  );
};

const isTimelineBoxSelectionBlockedTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return true;
  }

  return !!target.closest(
    [
      '.ngs-motion-studio__track-label',
      '.ngs-motion-studio__ruler',
      '.ngs-motion-studio__clip',
      '.ngs-motion-studio__scene-clip',
      '.ngs-motion-studio__keyframe-marker',
      'button',
      'input',
      'textarea',
      'select',
      '[contenteditable="true"]',
    ].join(', '),
  );
};

const groupSelectedKeyframes = (
  refs: SelectedKeyframeRef[],
): Map<string, Map<number, Set<number>>> => {
  const grouped = new Map<string, Map<number, Set<number>>>();

  for (const ref of uniqueSelectedKeyframes(refs)) {
    let layerGroup = grouped.get(ref.layerId);

    if (!layerGroup) {
      layerGroup = new Map<number, Set<number>>();
      grouped.set(ref.layerId, layerGroup);
    }

    let keyframeIndexes = layerGroup.get(ref.animationIndex);

    if (!keyframeIndexes) {
      keyframeIndexes = new Set<number>();
      layerGroup.set(ref.animationIndex, keyframeIndexes);
    }

    keyframeIndexes.add(ref.keyframeIndex);
  }

  return grouped;
};

const groupTimelineKeyframeDragEntries = (
  entries: TimelineKeyframeDragEntry[],
): Map<string, Map<number, TimelineKeyframeDragEntry[]>> => {
  const grouped = new Map<string, Map<number, TimelineKeyframeDragEntry[]>>();

  for (const entry of entries) {
    let layerGroup = grouped.get(entry.layerId);

    if (!layerGroup) {
      layerGroup = new Map<number, TimelineKeyframeDragEntry[]>();
      grouped.set(entry.layerId, layerGroup);
    }

    const keyframes = layerGroup.get(entry.animationIndex) ?? [];
    keyframes.push(entry);
    layerGroup.set(entry.animationIndex, keyframes);
  }

  return grouped;
};

const clampTimelineKeyframeGroupDelta = (
  entries: TimelineKeyframeDragEntry[],
  layers: MotionLayer[],
  delta: number,
): number => {
  let minDelta = Number.NEGATIVE_INFINITY;
  let maxDelta = Number.POSITIVE_INFINITY;

  for (const entry of entries) {
    const layer = findMotionLayer(layers, entry.layerId);

    if (!layer) {
      continue;
    }

    minDelta = Math.max(minDelta, -entry.startTime);
    maxDelta = Math.min(maxDelta, layer.duration - entry.startTime);
  }

  return Math.max(minDelta, Math.min(maxDelta, delta));
};

const removeMotionLayer = (layers: MotionLayer[], id: string): MotionLayer[] => {
  return layers
    .filter((layer) => layer.id !== id)
    .map((layer) => ({
      ...layer,
      children: layer.children ? removeMotionLayer(layer.children, id) : undefined,
    }));
};

const removeMotionLayers = (layers: MotionLayer[], ids: string[]): MotionLayer[] => {
  return layers
    .filter((layer) => !ids.includes(layer.id))
    .map((layer) => ({
      ...layer,
      children: layer.children ? removeMotionLayers(layer.children, ids) : undefined,
    }));
};

const sortLayersForCanvas = (layers: MotionLayer[]): MotionLayer[] => {
  return [...layers].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));
};

const extractMotionLayers = (
  layers: MotionLayer[],
  selectedIds: string[],
): { remaining: MotionLayer[]; layers: MotionLayer[] } => {
  const remaining: MotionLayer[] = [];
  const extracted: MotionLayer[] = [];

  for (const layer of layers) {
    if (selectedIds.includes(layer.id)) {
      extracted.push(cloneMotionLayer(layer));
      continue;
    }

    const childResult = extractMotionLayers(layer.children ?? [], selectedIds);
    extracted.push(...childResult.layers);
    remaining.push({
      ...cloneMotionLayer(layer),
      children: childResult.remaining.length ? childResult.remaining : undefined,
    });
  }

  return { remaining, layers: extracted };
};

const ungroupMotionLayer = (
  layers: MotionLayer[],
  groupId: string,
): { layers: MotionLayer[]; ungrouped: MotionLayer[] } => {
  const nextLayers: MotionLayer[] = [];
  const ungrouped: MotionLayer[] = [];

  for (const layer of layers) {
    if (layer.id === groupId && layer.type === 'group') {
      const children = (layer.children ?? []).map((child) =>
        offsetMotionLayer(cloneMotionLayer(child), layer.layout.x, layer.layout.y),
      );

      nextLayers.push(...children);
      ungrouped.push(...children);
      continue;
    }

    const childResult = ungroupMotionLayer(layer.children ?? [], groupId);
    nextLayers.push({
      ...cloneMotionLayer(layer),
      children: childResult.layers.length ? childResult.layers : undefined,
    });
    ungrouped.push(...childResult.ungrouped);
  }

  return { layers: nextLayers, ungrouped };
};

const offsetMotionLayer = (layer: MotionLayer, x: number, y: number): MotionLayer => ({
  ...layer,
  layout: {
    ...layer.layout,
    x: layer.layout.x + x,
    y: layer.layout.y + y,
  },
  children: layer.children?.map((child) => offsetMotionLayer(child, x, y)),
});

const getLayerBounds = (layers: MotionLayer[]): MotionLayout => {
  const left = Math.min(...layers.map((layer) => layer.layout.x));
  const top = Math.min(...layers.map((layer) => layer.layout.y));
  const right = Math.max(...layers.map((layer) => layer.layout.x + layer.layout.width));
  const bottom = Math.max(...layers.map((layer) => layer.layout.y + layer.layout.height));

  return {
    x: left,
    y: top,
    width: Math.max(MIN_LAYER_SIZE, right - left),
    height: Math.max(MIN_LAYER_SIZE, bottom - top),
  };
};

const replaceTrackLayerIds = (
  layerIds: string[] | undefined,
  selectedIds: string[],
  replacementIds: string[],
): string[] | undefined => {
  if (!layerIds) {
    return layerIds;
  }

  let inserted = false;
  const nextIds: string[] = [];

  for (const layerId of layerIds) {
    if (!selectedIds.includes(layerId)) {
      nextIds.push(layerId);
      continue;
    }

    if (!inserted) {
      nextIds.push(...replacementIds);
      inserted = true;
    }
  }

  return inserted ? nextIds : [...layerIds, ...replacementIds];
};

const ensureLayerInTrack = (
  tracks: MotionDocument['tracks'] | undefined,
  layerId: string,
): MotionDocument['tracks'] => {
  if (!tracks?.length) {
    return [
      {
        id: 'scene',
        type: 'overlay',
        name: 'Scene',
        layerIds: [layerId],
      },
    ];
  }

  const [firstTrack, ...restTracks] = tracks;

  if (tracks.some((track) => track.layerIds?.includes(layerId))) {
    return tracks;
  }

  return [
    {
      ...firstTrack,
      layerIds: [...(firstTrack.layerIds ?? []), layerId],
    },
    ...restTracks,
  ];
};

const cloneMotionDocument = (document: MotionDocument): MotionDocument => {
  return {
    ...document,
    composition: { ...document.composition },
    assets: document.assets?.map((asset) => ({
      ...asset,
      metadata: asset.metadata ? { ...asset.metadata } : undefined,
    })),
    fonts: document.fonts?.map((font) => ({ ...font })),
    tracks: document.tracks?.map((track) => ({
      ...track,
      layerIds: track.layerIds ? [...track.layerIds] : undefined,
    })),
    scenes: document.scenes?.map(cloneMotionScene),
    editor: document.editor ? { ...document.editor } : undefined,
    layers: document.layers.map(cloneMotionLayer),
    metadata: document.metadata ? { ...document.metadata } : undefined,
  };
};

const cloneMotionScene = (scene: MotionScene): MotionScene => ({
  ...scene,
  layerIds: scene.layerIds ? [...scene.layerIds] : undefined,
  transitionIn: cloneMotionTransition(scene.transitionIn),
  transitionOut: cloneMotionTransition(scene.transitionOut),
});

const cloneMotionLayer = (layer: MotionLayer): MotionLayer => ({
  ...layer,
  layout: { ...layer.layout },
  style: layer.style ? { ...layer.style } : undefined,
  props: layer.props ? { ...layer.props } : undefined,
  animations: cloneMotionAnimations(layer.animations),
  transitions: layer.transitions
    ? {
        in: cloneMotionTransition(layer.transitions.in),
        out: cloneMotionTransition(layer.transitions.out),
      }
    : undefined,
  children: layer.children?.map(cloneMotionLayer),
});

const cloneMotionAnimations = (
  animations: MotionAnimation[] | undefined,
): MotionAnimation[] | undefined =>
  animations?.map((animation) => ({
    ...animation,
    keyframes: animation.keyframes.map(cloneMotionKeyframe),
  }));

const cloneMotionKeyframe = (keyframe: MotionKeyframe): MotionKeyframe => ({
  ...keyframe,
  value: cloneMotionValue(keyframe.value),
});

const cloneMotionValue = (value: MotionValue): MotionValue => {
  if (Array.isArray(value)) {
    return value.map(cloneMotionValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneMotionValue(item)]),
    );
  }

  return value;
};

const cloneMotionTransition = (
  transition: MotionTransition | undefined,
): MotionTransition | undefined =>
  transition
    ? {
        ...transition,
        props: transition.props ? { ...transition.props } : undefined,
      }
    : undefined;

const createMotionLayerId = (prefix: string): string => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
};

const createCopiedMotionLayer = (
  layer: MotionLayer,
  options: { mode: 'duplicate' | 'paste'; index: number; zIndex: number },
): MotionLayer => {
  const copiedLayer = cloneMotionLayer(layer);
  const suffix = options.mode === 'duplicate' ? 'copy' : 'paste';
  const offset = LAYER_COPY_OFFSET * (options.index + 1);

  return reidentifyMotionLayer(
    {
      ...copiedLayer,
      name: `${copiedLayer.name || copiedLayer.id} ${suffix}`,
      zIndex: options.zIndex,
      layout: {
        ...copiedLayer.layout,
        x: copiedLayer.layout.x + offset,
        y: copiedLayer.layout.y + offset,
      },
    },
    suffix,
  );
};

const translateMotionLayersToPoint = (
  layers: MotionLayer[],
  point: MotionPresetPlacement,
): void => {
  const bounds = readMotionLayerBounds(layers);

  if (!bounds) {
    return;
  }

  const dx = point.x - (bounds.x + bounds.width / 2);
  const dy = point.y - (bounds.y + bounds.height / 2);

  for (const layer of layers) {
    translateMotionLayer(layer, dx, dy);
  }
};

const readMotionLayerBounds = (
  layers: MotionLayer[],
): { x: number; y: number; width: number; height: number } | null => {
  if (!layers.length) {
    return null;
  }

  const minX = Math.min(...layers.map((layer) => layer.layout.x));
  const minY = Math.min(...layers.map((layer) => layer.layout.y));
  const maxX = Math.max(...layers.map((layer) => layer.layout.x + layer.layout.width));
  const maxY = Math.max(...layers.map((layer) => layer.layout.y + layer.layout.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const translateMotionLayer = (layer: MotionLayer, dx: number, dy: number): void => {
  layer.layout = {
    ...layer.layout,
    x: roundMotionNumber(layer.layout.x + dx, 2),
    y: roundMotionNumber(layer.layout.y + dy, 2),
  };
};

const reidentifyMotionLayer = (layer: MotionLayer, prefix: string): MotionLayer => ({
  ...layer,
  id: createMotionLayerId(prefix),
  animations: layer.animations?.map((animation) => ({
    ...animation,
    id: animation.id ? createMotionLayerId('animation') : undefined,
    keyframes: animation.keyframes.map((keyframe) => ({ ...keyframe })),
  })),
  children: layer.children?.map((child) => reidentifyMotionLayer(child, prefix)),
});

const isEditableShortcutTarget = (target: EventTarget | null): boolean => {
  if (typeof HTMLElement === 'undefined') {
    return false;
  }

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    !!target.closest('input, textarea, select, [contenteditable="true"]')
  );
};

const createMotionAssetId = (fileName: string): string => {
  const prefix = fileName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);

  return createMotionLayerId(prefix || 'asset');
};

const readMotionAssetFile = async (file: File): Promise<MotionAsset> => {
  const src = await readFileAsDataUrl(file);
  const type = getMotionAssetType(file);
  const metadata: Record<string, MotionValue> = {
    mimeType: file.type,
    size: file.size,
    lastModified: file.lastModified,
  };

  if (type === 'image') {
    const dimensions = await readImageDimensions(src).catch(() => null);

    if (dimensions) {
      metadata['width'] = dimensions.width;
      metadata['height'] = dimensions.height;
    }
  }

  return {
    id: createMotionAssetId(file.name),
    type,
    src,
    name: file.name,
    metadata,
  };
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      reject(new Error('File loading is not available in this environment.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(`${reader.result ?? ''}`);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
};

const readImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    if (typeof Image === 'undefined') {
      reject(new Error('Image metadata is not available in this environment.'));
      return;
    }

    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('Image metadata could not be read.'));
    image.src = src;
  });
};

const getMotionAssetType = (file: File): MotionAsset['type'] => {
  if (file.type.startsWith('image/')) {
    return 'image';
  }

  if (file.type.startsWith('video/')) {
    return 'video';
  }

  if (file.type.startsWith('audio/')) {
    return 'audio';
  }

  if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
    return 'json';
  }

  return 'file';
};

const readMotionAssetNumber = (asset: MotionAsset, property: string, fallback: number): number => {
  const value = Number(asset.metadata?.[property] ?? fallback);

  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const coerceNumber = (value: unknown): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const serializeMotionDocument = (document: MotionDocument): string => JSON.stringify(document);

const createDefaultTransition = (
  type: Exclude<MotionTransitionType, 'none'>,
  edge: MotionTransitionEdge,
): MotionTransition => ({
  type,
  duration: DEFAULT_TRANSITION_DURATION,
  easing: type === 'fade' ? 'easeInOutCubic' : 'easeOutCubic',
  props: {
    direction: edge === 'in' ? 'left' : 'right',
    distance: 140,
  },
});

const setMotionLayerTransition = (
  layer: MotionLayer,
  edge: MotionTransitionEdge,
  transition: MotionTransition | undefined,
): void => {
  const transitions = {
    ...(layer.transitions ?? {}),
  };

  if (transition) {
    transitions[edge] = transition;
  } else {
    delete transitions[edge];
  }

  if (!transitions.in && !transitions.out) {
    layer.transitions = undefined;
    return;
  }

  layer.transitions = transitions;
};

const normalizeMotionTransitionType = (value: unknown): MotionTransitionType => {
  if (
    value === 'fade' ||
    value === 'slide' ||
    value === 'wipe' ||
    value === 'scale' ||
    value === 'blur'
  ) {
    return value;
  }

  if (value === 'zoom') {
    return 'scale';
  }

  return 'none';
};

const normalizeMotionTransitionDirection = (
  value: unknown,
  edge: MotionTransitionEdge,
): MotionTransitionDirection => {
  if (value === 'left' || value === 'right' || value === 'up' || value === 'down') {
    return value;
  }

  return edge === 'in' ? 'left' : 'right';
};

const normalizeAnimationPresetType = (value: unknown): MotionAnimationPresetType => {
  if (
    value === 'fade' ||
    value === 'slideUp' ||
    value === 'pop' ||
    value === 'pulse' ||
    value === 'countUp'
  ) {
    return value;
  }

  return 'fade';
};

const normalizeAnimationApplyMode = (value: unknown): MotionAnimationApplyMode => {
  if (value === 'replace' || value === 'merge') {
    return value;
  }

  return 'append';
};

const applyAnimationTracks = (
  currentTracks: MotionAnimation[],
  presetTracks: MotionAnimation[],
  mode: MotionAnimationApplyMode,
): MotionAnimation[] => {
  if (mode === 'replace') {
    return presetTracks;
  }

  if (mode === 'merge') {
    const nextTracks = [...currentTracks];

    for (const presetTrack of presetTracks) {
      const existingIndex = nextTracks.findIndex(
        (track) => track.property === presetTrack.property,
      );

      if (existingIndex === -1) {
        nextTracks.push(presetTrack);
      } else {
        nextTracks[existingIndex] = presetTrack;
      }
    }

    return nextTracks;
  }

  return [...currentTracks, ...presetTracks];
};

const readMotionTransitionDirection = (
  transition: MotionTransition | undefined,
  edge: MotionTransitionEdge,
): MotionTransitionDirection =>
  normalizeMotionTransitionDirection(transition?.props?.['direction'], edge);

const readMotionTransitionDistance = (transition: MotionTransition | undefined): number => {
  const value = Number(transition?.props?.['distance'] ?? 140);

  return Number.isFinite(value) ? value : 140;
};

const readMotionSceneTransition = (
  scene: MotionScene,
  edge: MotionTransitionEdge,
): MotionTransition | undefined => (edge === 'in' ? scene.transitionIn : scene.transitionOut);

const setMotionSceneTransition = (
  scene: MotionScene,
  edge: MotionTransitionEdge,
  transition: MotionTransition | undefined,
): void => {
  if (edge === 'in') {
    if (transition) {
      scene.transitionIn = transition;
    } else {
      delete scene.transitionIn;
    }
    return;
  }

  if (transition) {
    scene.transitionOut = transition;
  } else {
    delete scene.transitionOut;
  }
};

const sceneContainsLayer = (scene: MotionScene, layerId: string): boolean =>
  !scene.layerIds?.length || scene.layerIds.includes(layerId);

interface MotionDocumentUpdateOptions {
  recordHistory?: boolean;
}

interface SelectedKeyframeRef {
  layerId: string;
  animationIndex: number;
  keyframeIndex: number;
}

interface SelectedKeyframeDetails extends SelectedKeyframeRef {
  layer: MotionLayer;
  animation: MotionAnimation;
  keyframe: MotionKeyframe;
  absoluteTime: number;
}

interface MotionKeyframeClipboardItem {
  layerId: string;
  animationId?: string;
  property: string;
  animationEasing?: MotionEasingName;
  offset: number;
  keyframe: MotionKeyframe;
}

interface MotionPresetPlacement {
  x: number;
  y: number;
}

interface MotionPresetInsertOptions {
  placement?: MotionPresetPlacement;
  startTime?: number;
}

interface MotionStudioSceneEffect {
  opacity: number;
  transform: string;
}

type MotionTransitionEdge = 'in' | 'out';

type MotionTransitionType = 'none' | 'fade' | 'slide' | 'wipe' | 'scale' | 'blur';

type MotionTransitionDirection = 'left' | 'right' | 'up' | 'down';

type MotionAnimationPresetType = 'fade' | 'slideUp' | 'pop' | 'pulse' | 'countUp';

type MotionAnimationApplyMode = 'append' | 'replace' | 'merge';

type MotionAnimationScope = 'active' | 'selection';

interface MotionAnimationPresetSettings {
  duration: number;
  delay: number;
  easing: MotionEasingName;
  direction: MotionTransitionDirection;
  distance: number;
}

type TimelineZoomMode = 'fit' | '1' | '2' | '4';

type JsonPanelMode = 'export' | 'import';

const EMPTY_MOTION_STUDIO_SCENE_EFFECT: MotionStudioSceneEffect = {
  opacity: 1,
  transform: '',
};

const readTimelineZoomMode = (zoom: number | undefined): TimelineZoomMode => {
  if (zoom === 4) {
    return '4';
  }

  if (zoom === 2) {
    return '2';
  }

  if (zoom === 1) {
    return '1';
  }

  return 'fit';
};

const normalizeTimelineZoomMode = (value: string): TimelineZoomMode => {
  if (value === '1' || value === '2' || value === '4') {
    return value;
  }

  return 'fit';
};

const isMotionDocumentShape = (value: unknown): value is MotionDocument => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<MotionDocument>;

  return (
    !!candidate.composition &&
    typeof candidate.composition === 'object' &&
    Array.isArray(candidate.layers)
  );
};

const createDefaultKeyframes = (layer: MotionLayer, property: string): MotionKeyframe[] => {
  const startValue = readLayerAnimationValue(layer, property);
  const endTime = Math.min(layer.duration, 800);
  const endValue = createDefaultEndValue(layer, property, startValue);

  return sortKeyframes([
    { time: 0, value: startValue },
    { time: endTime, value: endValue, easing: 'easeOutCubic' },
  ]);
};

const createAnimationPresetTracks = (
  layer: MotionLayer,
  type: MotionAnimationPresetType,
  currentTime: number,
  options: MotionAnimationPresetSettings,
): MotionAnimation[] => {
  const start = Math.max(
    0,
    Math.min(layer.duration, snapTimelineTime(currentTime - layer.start + options.delay)),
  );
  const duration = Math.max(100, options.duration);
  const end = Math.max(start, Math.min(layer.duration, start + duration));
  const easing = options.easing;
  const createTrack = (
    property: string,
    keyframes: MotionKeyframe[],
    trackEasing: MotionEasingName = easing,
  ): MotionAnimation => ({
    id: createMotionLayerId('animation'),
    property,
    easing: trackEasing,
    keyframes: sortKeyframes(keyframes),
  });

  switch (type) {
    case 'fade':
      return [
        createTrack('opacity', [
          { time: start, value: 0 },
          { time: end, value: readLayerAnimationValue(layer, 'opacity'), easing },
        ]),
      ];
    case 'slideUp': {
      const slide = readPresetSlideStart(layer, options.direction, options.distance);

      return [
        createTrack('opacity', [
          { time: start, value: 0 },
          { time: end, value: readLayerAnimationValue(layer, 'opacity'), easing },
        ]),
        createTrack(slide.property, [
          { time: start, value: slide.start },
          { time: end, value: slide.end, easing },
        ]),
      ];
    }
    case 'pop':
      return [
        createTrack('opacity', [
          { time: start, value: 0 },
          { time: end, value: readLayerAnimationValue(layer, 'opacity'), easing },
        ]),
        createTrack('scale', [
          { time: start, value: roundMotionNumber((layer.layout.scale ?? 1) * 0.82, 2) },
          { time: end, value: layer.layout.scale ?? 1, easing },
        ]),
      ];
    case 'pulse': {
      const scale = layer.layout.scale ?? 1;
      const middle = start + (end - start) / 2;

      return [
        createTrack(
          'scale',
          [
            { time: start, value: scale },
            { time: middle, value: roundMotionNumber(scale * 1.08, 2), easing },
            { time: end, value: scale, easing },
          ],
          easing,
        ),
      ];
    }
    case 'countUp': {
      const text = `${layer.props?.['text'] ?? ''}`;
      const target = readNumericTextTarget(text);

      return [
        createTrack(
          'text',
          [
            { time: start, value: target ? `${target.prefix}0${target.suffix}` : '0' },
            { time: end, value: text || '100', easing },
          ],
          easing,
        ),
      ];
    }
    default:
      return [];
  }
};

const readPresetSlideStart = (
  layer: MotionLayer,
  direction: MotionTransitionDirection,
  distance: number,
): { property: 'x' | 'y'; start: number; end: number } => {
  switch (direction) {
    case 'left':
      return { property: 'x', start: layer.layout.x + distance, end: layer.layout.x };
    case 'right':
      return { property: 'x', start: layer.layout.x - distance, end: layer.layout.x };
    case 'down':
      return { property: 'y', start: layer.layout.y - distance, end: layer.layout.y };
    case 'up':
    default:
      return { property: 'y', start: layer.layout.y + distance, end: layer.layout.y };
  }
};

const createEmptyAnimation = (property: string, value: MotionValue): MotionAnimation => ({
  id: createMotionLayerId('animation'),
  property,
  easing: 'easeOutCubic',
  keyframes: [{ time: 0, value }],
});

const createClipboardAnimation = (item: MotionKeyframeClipboardItem): MotionAnimation => ({
  id: item.animationId ?? createMotionLayerId('animation'),
  property: item.property,
  easing: item.animationEasing ?? item.keyframe.easing ?? 'easeOutCubic',
  keyframes: [],
});

const findOrCreateMotionAnimation = (
  layer: MotionLayer,
  item: MotionKeyframeClipboardItem,
): MotionAnimation => {
  const existing =
    layer.animations?.find((animation) => item.animationId && animation.id === item.animationId) ??
    layer.animations?.find((animation) => animation.property === item.property);

  if (existing) {
    return existing;
  }

  const animation = createClipboardAnimation(item);
  layer.animations = [...(layer.animations ?? []), animation];

  return animation;
};

const upsertKeyframe = (
  keyframes: MotionKeyframe[],
  keyframe: MotionKeyframe,
): MotionKeyframe[] => {
  const next = keyframes.filter((item) => item.time !== keyframe.time);

  return sortKeyframes([...next, keyframe]);
};

const readNumericTextTarget = (value: string): { prefix: string; suffix: string } | null => {
  const match = value.trim().match(/^([+-]?)(\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return null;
  }

  const [, prefix, , suffix] = match;

  return { prefix, suffix };
};

const readLayerAnimationValue = (layer: MotionLayer, property: string): MotionValue => {
  if (isLayoutAnimationProperty(property)) {
    return layer.layout[property] ?? (property === 'scale' ? 1 : 0);
  }

  if (property === 'opacity') {
    return layer.style?.opacity ?? layer.opacity ?? 1;
  }

  if (isStyleAnimationProperty(property)) {
    return (
      (layer.style?.[property] as MotionValue | undefined) ?? defaultStyleAnimationValue(property)
    );
  }

  return layer.props?.[property] ?? '';
};

const createDefaultEndValue = (
  layer: MotionLayer,
  property: string,
  startValue: MotionValue,
): MotionValue => {
  if (typeof startValue !== 'number') {
    return startValue;
  }

  switch (property) {
    case 'opacity':
      return startValue >= 1 ? 0 : 1;
    case 'x':
      return layer.layout.x + 160;
    case 'y':
      return layer.layout.y + 80;
    case 'scale':
      return roundMotionNumber((layer.layout.scale ?? 1) + 0.12, 2);
    case 'rotation':
      return (layer.layout.rotation ?? 0) + 8;
    case 'width':
      return layer.layout.width + 120;
    case 'height':
      return layer.layout.height + 80;
    case 'fontSize':
      return startValue + 12;
    default:
      return startValue;
  }
};

const coerceKeyframeValue = (property: string, value: unknown): MotionValue => {
  if (isNumericAnimationProperty(property)) {
    return coerceNumber(value);
  }

  if (typeof value === 'boolean' || value === null) {
    return value;
  }

  return `${value ?? ''}`;
};

const sortKeyframes = (keyframes: MotionKeyframe[]): MotionKeyframe[] => {
  return [...keyframes].sort((a, b) => a.time - b.time);
};

const defaultStyleAnimationValue = (property: string): MotionValue => {
  switch (property) {
    case 'color':
      return '#ffffff';
    case 'background':
    case 'fill':
      return '#38bdf8';
    case 'stroke':
      return '#0f172a';
    case 'fontFamily':
      return 'DM Sans, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
    case 'fontSize':
      return 72;
    case 'fontWeight':
      return 700;
    case 'lineHeight':
      return 1.05;
    case 'letterSpacing':
    case 'strokeWidth':
    case 'borderRadius':
    case 'padding':
      return 0;
    case 'textAlign':
      return 'left';
    case 'objectFit':
      return 'cover';
    default:
      return '';
  }
};

const isLayoutAnimationProperty = (property: string): property is keyof MotionLayout => {
  return ['x', 'y', 'width', 'height', 'rotation', 'scale', 'anchorX', 'anchorY'].includes(
    property,
  );
};

const isStyleAnimationProperty = (property: string): property is keyof MotionStyle => {
  return [
    'opacity',
    'color',
    'background',
    'fill',
    'stroke',
    'strokeWidth',
    'borderRadius',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'textAlign',
    'objectFit',
    'padding',
  ].includes(property);
};

const isNumericAnimationProperty = (property: string): boolean => {
  return [
    'opacity',
    'x',
    'y',
    'width',
    'height',
    'rotation',
    'scale',
    'anchorX',
    'anchorY',
    'strokeWidth',
    'borderRadius',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'padding',
  ].includes(property);
};

const roundMotionNumber = (value: number, precision: number): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const MOTION_EASING_NAMES: MotionEasingName[] = [
  'linear',
  'easeInQuad',
  'easeOutQuad',
  'easeInOutQuad',
  'easeInCubic',
  'easeOutCubic',
  'easeInOutCubic',
  'smooth',
  'easeOutBack',
  'easeOutBounce',
];

const coerceMotionEasing = (value: unknown): MotionEasingName => {
  return MOTION_EASING_NAMES.includes(value as MotionEasingName)
    ? (value as MotionEasingName)
    : 'linear';
};

const createEasingCurvePath = (easing: MotionEasingName): string => {
  const points = Array.from({ length: 33 }, (_, index) => {
    const progress = index / 32;
    const x = 12 + progress * 96;
    const y = 62 - sampleMotionEasing(easing, progress) * 52;

    return `${index === 0 ? 'M' : 'L'}${roundMotionNumber(x, 2)} ${roundMotionNumber(y, 2)}`;
  });

  return points.join('');
};

const createEasingPreviewDots = (easing: MotionEasingName): MotionEasingPreviewDot[] => {
  const currentIndex = 3;

  return Array.from({ length: 6 }, (_, index) => {
    const progress = index / 5;

    return {
      index,
      x: roundMotionNumber(12 + progress * 96, 2),
      y: roundMotionNumber(62 - sampleMotionEasing(easing, progress) * 52, 2),
      radius: index === currentIndex ? 3.9 : 2.6,
      current: index === currentIndex,
    };
  });
};

const sampleMotionEasing = (easing: MotionEasingName, progress: number): number => {
  const value = Math.max(0, Math.min(1, progress));

  switch (easing) {
    case 'easeInQuad':
      return value * value;
    case 'easeOutQuad':
      return value * (2 - value);
    case 'easeInOutQuad':
      return value < 0.5 ? 2 * value * value : -1 + (4 - 2 * value) * value;
    case 'easeInCubic':
      return value * value * value;
    case 'easeOutCubic': {
      const next = value - 1;

      return next * next * next + 1;
    }
    case 'easeInOutCubic':
      return value < 0.5
        ? 4 * value * value * value
        : (value - 1) * (2 * value - 2) * (2 * value - 2) + 1;
    case 'smooth':
      return value * value * value * (value * (value * 6 - 15) + 10);
    case 'easeOutBack': {
      const c1 = 1.70158;
      const c3 = c1 + 1;

      return 1 + c3 * (value - 1) ** 3 + c1 * (value - 1) ** 2;
    }
    case 'easeOutBounce':
      return sampleEaseOutBounce(value);
    case 'linear':
    default:
      return value;
  }
};

const sampleEaseOutBounce = (value: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (value < 1 / d1) {
    return n1 * value * value;
  }

  if (value < 2 / d1) {
    const next = value - 1.5 / d1;

    return n1 * next * next + 0.75;
  }

  if (value < 2.5 / d1) {
    const next = value - 2.25 / d1;

    return n1 * next * next + 0.9375;
  }

  const next = value - 2.625 / d1;

  return n1 * next * next + 0.984375;
};

interface TimelineKeyframeMarker {
  id: string;
  animationIndex: number;
  keyframeIndex: number;
  property: string;
  time: number;
  localTime: number;
  left: number;
}

interface TimelineAnimationTrackRow {
  id: string;
  animation: MotionAnimation;
  animationIndex: number;
  markers: TimelineKeyframeMarker[];
}

interface MotionEasingPreviewDot {
  index: number;
  x: number;
  y: number;
  radius: number;
  current: boolean;
}

interface KeyframeSnapTarget {
  time: number;
  type:
    | 'playhead'
    | 'layer-start'
    | 'layer-end'
    | 'scene-start'
    | 'scene-end'
    | 'keyframe'
    | 'frame-grid';
}

interface KeyframeSnapResult {
  time: number;
  target: KeyframeSnapTarget | null;
}

interface KeyframeSnapGuide {
  absoluteTime: number;
  label: string;
  type: KeyframeSnapTarget['type'];
}

interface KeyframeSnapOptions {
  includePlayhead?: boolean;
}

type CanvasResizeHandle = 'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw';

interface CanvasInteraction {
  type: 'canvas-move' | 'canvas-resize';
  layerId: string;
  handle?: CanvasResizeHandle;
  startClientX: number;
  startClientY: number;
  startLayout: MotionLayout;
  startAnimations: MotionAnimation[] | undefined;
  stageRect: DOMRect;
}

type TimelineTrimEdge = 'start' | 'end';

interface TimelineInteraction {
  type: 'timeline';
  layerId: string;
  mode: 'move' | 'keyframe' | TimelineTrimEdge;
  animationIndex?: number;
  keyframeIndex?: number;
  keyframeTime?: number;
  keyframeGroup?: TimelineKeyframeDragEntry[];
  startClientX: number;
  start: number;
  duration: number;
  timelineRect: DOMRect;
}

interface TimelineKeyframeDragEntry extends SelectedKeyframeRef {
  startTime: number;
  lead: boolean;
}

interface TimelineBoxSelectionInteraction {
  type: 'timeline-box-select';
  timelineElement: HTMLElement;
  scrollElement: HTMLElement;
  startClientX: number;
  startClientY: number;
  additive: boolean;
  startRefs: SelectedKeyframeRef[];
  hasMoved: boolean;
}

interface TimelineSelectionBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TimelineViewportRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface PlayheadInteraction {
  type: 'playhead';
  timelineElement: HTMLElement;
  scrollElement: HTMLElement;
}

const TIMELINE_LABEL_WIDTH = 176;
const TIMELINE_BODY_MIN_WIDTH = 720;
const TIMELINE_AUTOSCROLL_EDGE = 56;
const TIMELINE_BOX_SELECT_THRESHOLD = 4;
const KEYFRAME_SNAP_THRESHOLD = 48;
const MIN_LAYER_SIZE = 24;
const MOTION_HISTORY_LIMIT = 80;
const LAYER_COPY_OFFSET = 40;
const DEFAULT_TRANSITION_DURATION = 600;

const resizeMotionLayout = (
  next: MotionLayout,
  start: MotionLayout,
  dx: number,
  dy: number,
  handle: CanvasResizeHandle,
  proportional: boolean,
): void => {
  if (proportional) {
    resizeMotionLayoutProportionally(next, start, dx, dy, handle);
    return;
  }

  if (handle.includes('e')) {
    next.width = start.width + dx;
  }

  if (handle.includes('s')) {
    next.height = start.height + dy;
  }

  if (handle.includes('w')) {
    next.x = start.x + dx;
    next.width = start.width - dx;
  }

  if (handle.includes('n')) {
    next.y = start.y + dy;
    next.height = start.height - dy;
  }
};

const resizeMotionLayoutProportionally = (
  next: MotionLayout,
  start: MotionLayout,
  dx: number,
  dy: number,
  handle: CanvasResizeHandle,
): void => {
  const aspectRatio = start.width / Math.max(1, start.height);
  const widthDelta = handle.includes('w') ? -dx : dx;
  const heightDelta = handle.includes('n') ? -dy : dy;
  const dominantDelta =
    Math.abs(widthDelta) >= Math.abs(heightDelta * aspectRatio)
      ? widthDelta
      : heightDelta * aspectRatio;
  const width = Math.max(MIN_LAYER_SIZE, start.width + dominantDelta);
  const height = Math.max(MIN_LAYER_SIZE, width / Math.max(0.0001, aspectRatio));

  next.width = width;
  next.height = height;

  if (handle.includes('w')) {
    next.x = start.x + start.width - width;
  }

  if (handle.includes('n')) {
    next.y = start.y + start.height - height;
  }
};

const normalizeMotionLayout = (layout: MotionLayout): MotionLayout => {
  const width = Math.max(MIN_LAYER_SIZE, layout.width);
  const height = Math.max(MIN_LAYER_SIZE, layout.height);

  return {
    ...layout,
    width,
    height,
  };
};

const getLayoutDelta = (
  start: MotionLayout,
  next: MotionLayout,
): Partial<Record<keyof MotionLayout, number>> => ({
  x: next.x - start.x,
  y: next.y - start.y,
  width: next.width - start.width,
  height: next.height - start.height,
  rotation: (next.rotation ?? 0) - (start.rotation ?? 0),
  scale: (next.scale ?? 1) - (start.scale ?? 1),
});

const shiftMotionLayoutAnimations = (
  animations: MotionAnimation[] | undefined,
  delta: Partial<Record<keyof MotionLayout, number>>,
): MotionAnimation[] | undefined => {
  if (!animations) {
    return undefined;
  }

  return animations.map((animation) => {
    const property = animation.property as keyof MotionLayout;
    const offset = delta[property];

    if (offset === undefined || offset === 0 || !isMotionLayoutAnimationProperty(property)) {
      return {
        ...animation,
        keyframes: animation.keyframes.map((keyframe) => ({ ...keyframe })),
      };
    }

    return {
      ...animation,
      keyframes: animation.keyframes.map((keyframe) => ({
        ...keyframe,
        value: typeof keyframe.value === 'number' ? keyframe.value + offset : keyframe.value,
      })),
    };
  });
};

const isMotionLayoutAnimationProperty = (property: keyof MotionLayout): boolean => {
  return ['x', 'y', 'width', 'height', 'rotation', 'scale'].includes(property);
};

const snapTimelineTime = (time: number): number => Math.round(time / 100) * 100;
