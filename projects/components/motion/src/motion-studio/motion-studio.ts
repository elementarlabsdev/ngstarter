import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Checkbox, CheckboxChange } from '@ngstarter-ui/components/checkbox';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import {
  ColorPicker,
  ColorPickerThumbnail,
  ColorPickerTriggerForDirective,
} from '@ngstarter-ui/components/color-picker';
import { FormField, Label, Prefix, Suffix } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemLine,
  ListItemMeta,
  ListItemTitle,
} from '@ngstarter-ui/components/list';
import { ContextMenuTrigger, Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from '@ngstarter-ui/components/panel';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { Drawer } from '@ngstarter-ui/components/drawer';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelDescription,
  ExpansionPanelHeader,
  ExpansionPanelTitle,
} from '@ngstarter-ui/components/expansion';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Segmented, SegmentedButton } from '@ngstarter-ui/components/segmented';
import { Option, Select, SelectChange } from '@ngstarter-ui/components/select';
import { Split, SplitPane } from '@ngstarter-ui/components/split';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
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
  Tree,
  TreeNode,
  TreeNodeDef,
  TreeNodePadding,
  TreeNodeToggle,
} from '@ngstarter-ui/components/tree';
import {
  UploadAllowedTypes,
  UploadArea,
  UploadAreaDropStateDirective,
  UploadAreaIconDirective,
  UploadAreaInvalidStateDirective,
  UploadAreaMainStateDirective,
  UploadContainer,
  UploadFileSelectedEvent,
  UploadTriggerDirective,
} from '@ngstarter-ui/components/upload';
import {
  MotionBackgroundEffect,
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
import { MotionRenderer } from '../motion-renderer/motion-renderer';
import {
  createMotionRenderCliCommand,
  createMotionRenderDocument,
  createMotionRenderManifest,
  createMotionRenderProgress,
  createMotionRenderRequest,
  MotionRenderJobStatus,
  MotionRenderProgress,
  MotionRenderRangeMode,
  MotionRenderRequest,
  renderMotion,
  resolveMotionRenderRange,
  validateMotionExport,
} from '../render/motion-render';
import { MOTION_RENDER_RUNNER, MotionRenderRunnerHandle } from '../render/motion-render-runner';

@Component({
  selector: 'ngs-motion-studio',
  imports: [
    Accordion,
    Button,
    Checkbox,
    Chip,
    ChipSet,
    ColorPicker,
    ColorPickerThumbnail,
    ColorPickerTriggerForDirective,
    ContextMenuTrigger,
    Drawer,
    ExpansionPanel,
    ExpansionPanelDescription,
    ExpansionPanelHeader,
    ExpansionPanelTitle,
    FormField,
    FormsModule,
    Icon,
    Input,
    Label,
    List,
    ListItem,
    ListItemIcon,
    ListItemLine,
    ListItemMeta,
    ListItemTitle,
    Menu,
    MenuItem,
    MenuTrigger,
    MotionPlayer,
    MotionRenderer,
    NgStyle,
    NgTemplateOutlet,
    Panel,
    PanelContent,
    PanelFooter,
    PanelHeader,
    Prefix,
    ProgressBar,
    Option,
    ScrollbarArea,
    Segmented,
    SegmentedButton,
    Select,
    Split,
    SplitPane,
    Suffix,
    TabPanel,
    TabPanelAside,
    TabPanelAsideContentDirective,
    TabPanelContent,
    TabPanelItem,
    TabPanelItemIconDirective,
    TabPanelItemText,
    TabPanelNav,
    Tooltip,
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle,
    Tree,
    TreeNode,
    TreeNodeDef,
    TreeNodePadding,
    TreeNodeToggle,
    UploadAllowedTypes,
    UploadArea,
    UploadAreaDropStateDirective,
    UploadAreaIconDirective,
    UploadAreaInvalidStateDirective,
    UploadAreaMainStateDirective,
    UploadContainer,
    UploadTriggerDirective,
  ],
  templateUrl: './motion-studio.html',
  styleUrl: './motion-studio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-motion-studio',
  },
})
export class MotionStudio {
  private readonly _renderRunner = inject(MOTION_RENDER_RUNNER, { optional: true });
  private _renderHandle: MotionRenderRunnerHandle | null = null;
  private _renderBatchCancelled = false;

  readonly document = input<MotionDocument | null>(createDefaultMotionDocument());
  readonly initialPreviewScale = input<number | null>(null);
  readonly previewScaleMin = input(0.25);
  readonly previewScaleMax = input(2);
  readonly previewScaleStep = input(0.1);
  readonly localStorageKey = input<string | null>(null);
  readonly documentChange = output<MotionDocument>();
  readonly renderRequest = output<MotionRenderRequest>();

  protected readonly draft = signal<MotionDocument>(createDefaultMotionDocument());
  protected readonly currentTime = signal(0);
  protected readonly playing = signal(false);
  protected readonly selectedLayerId = signal<string | null>(null);
  protected readonly selectedLayerIds = signal<string[]>([]);
  protected readonly selectedKeyframe = signal<SelectedKeyframeRef | null>(null);
  protected readonly selectedKeyframes = signal<SelectedKeyframeRef[]>([]);
  protected readonly keyframeSnapGuide = signal<KeyframeSnapGuide | null>(null);
  protected readonly alignmentGuides = signal<MotionAlignmentGuide[]>([]);
  protected readonly canvasSelectionBox = signal<MotionCanvasSelectionBox | null>(null);
  protected readonly timelineSelectionBox = signal<TimelineSelectionBox | null>(null);
  protected readonly selectedSceneId = signal<string | null>(null);
  protected readonly selectedTransition = signal<SelectedTransitionRef | null>(null);
  protected readonly layerSearch = signal('');
  protected readonly expandedAnimationLayerIds = signal<string[]>([]);
  protected readonly presets = signal<MotionPreset[]>(MOTION_PRESETS);
  protected readonly presetCategoryGroups: Array<{
    label: string;
    category: MotionPreset['category'];
  }> = [
    { label: 'Scenes', category: 'scene' },
    { label: 'Lower thirds', category: 'lower-third' },
    { label: 'Metrics', category: 'metric' },
    { label: 'Charts', category: 'chart' },
    { label: 'Quotes', category: 'quote' },
    { label: 'Products', category: 'product' },
    { label: 'CTA', category: 'cta' },
    { label: 'Backgrounds', category: 'background' },
  ];
  protected readonly gridVisible = signal(true);
  protected readonly snapToGrid = signal(false);
  protected readonly gridSize = signal(80);
  protected readonly showOnlySelectedScene = signal(false);
  protected readonly safeAreaVisible = signal(false);
  protected readonly layerStatusVisible = signal(true);
  protected readonly assetFilter = signal<MotionAssetFilter>('all');
  protected readonly assetViewMode = signal<MotionAssetViewMode>('grid');
  protected readonly previewViewportSize = signal<MotionPreviewViewportSize>({
    width: 0,
    height: 0,
  });
  protected readonly previewScale = signal(0.4);
  protected readonly canvasInteractionType = signal<
    CanvasInteraction['type'] | CanvasBoxSelectionInteraction['type'] | null
  >(null);
  protected readonly draggedPresetId = signal<string | null>(null);
  protected readonly draggedAssetId = signal<string | null>(null);
  protected readonly draggedSceneId = signal<string | null>(null);
  protected readonly sceneStoryboardDropTargetId = signal<string | null>(null);
  protected readonly draggedLayerSceneItem = signal<LayerSceneDragItem | null>(null);
  protected readonly layerSceneDropTargetId = signal<string | null>(null);
  protected readonly editingTextLayerId = signal<string | null>(null);
  protected readonly playbackRange = signal<MotionPlaybackRange | null>(null);
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
  protected readonly assetFilterOptions: Array<{ label: string; value: MotionAssetFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Images', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Audio', value: 'audio' },
    { label: 'JSON', value: 'json' },
    { label: 'Missing', value: 'missing' },
  ];
  protected readonly assetViewOptions: Array<{ label: string; value: MotionAssetViewMode }> = [
    { label: 'Grid', value: 'grid' },
    { label: 'List', value: 'list' },
  ];
  protected readonly backgroundGradientDirections = [
    { label: 'Top right', value: '135deg' },
    { label: 'Right', value: '90deg' },
    { label: 'Bottom right', value: '45deg' },
    { label: 'Bottom', value: '180deg' },
    { label: 'Radial', value: 'radial' },
  ];
  protected readonly backgroundImageFitOptions = [
    { label: 'Cover', value: 'cover' },
    { label: 'Contain', value: 'contain' },
    { label: 'Fill', value: '100% 100%' },
    { label: 'Tile', value: 'auto' },
  ];
  protected readonly backgroundGradientPresets: MotionBackgroundPreset[] = [
    {
      label: 'Revenue blue',
      value: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 42%, #bfdbfe 100%)',
    },
    {
      label: 'Product mint',
      value: 'linear-gradient(135deg, #ecfeff 0%, #d1fae5 50%, #f0fdf4 100%)',
    },
    {
      label: 'Warm launch',
      value: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 48%, #fef3c7 100%)',
    },
    {
      label: 'Editorial ink',
      value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 48%, #334155 100%)',
    },
  ];
  protected readonly backgroundDynamicPresets: MotionBackgroundPreset[] = [
    {
      label: 'Aurora',
      value:
        'radial-gradient(circle at 20% 20%, rgb(56 189 248 / 52%) 0 18%, transparent 38%), radial-gradient(circle at 80% 30%, rgb(34 197 94 / 38%) 0 16%, transparent 36%), linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
      effect: { type: 'aurora', speed: 0.9, intensity: 1 },
    },
    {
      label: 'Spotlight',
      value:
        'radial-gradient(circle at 50% 30%, rgb(255 255 255 / 78%) 0 0, transparent 42%), linear-gradient(135deg, #dbeafe 0%, #c7d2fe 46%, #f8fafc 100%)',
      effect: { type: 'spotlight', speed: 0.7, intensity: 0.92 },
    },
    {
      label: 'Mesh',
      value:
        'radial-gradient(circle at 10% 80%, rgb(251 191 36 / 42%) 0 18%, transparent 36%), radial-gradient(circle at 85% 20%, rgb(59 130 246 / 44%) 0 20%, transparent 40%), linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      effect: { type: 'mesh', speed: 0.8, intensity: 0.95 },
    },
  ];
  protected readonly backgroundGradientFrom = signal('#0f172a');
  protected readonly backgroundGradientTo = signal('#38bdf8');
  protected readonly backgroundGradientDirection = signal('135deg');
  protected readonly backgroundImageFit = signal<MotionBackgroundImageFit>('cover');
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
    category: MotionAnimationPresetCategory;
  }> = [
    { label: 'Fade', value: 'fade', category: 'entrance' },
    { label: 'Slide', value: 'slideUp', category: 'entrance' },
    { label: 'Pop', value: 'pop', category: 'entrance' },
    { label: 'Pulse', value: 'pulse', category: 'emphasis' },
    { label: 'Count up', value: 'countUp', category: 'text' },
  ];
  protected readonly animationPresetGroups: Array<{
    label: string;
    category: MotionAnimationPresetCategory;
  }> = [
    { label: 'Entrance', category: 'entrance' },
    { label: 'Emphasis', category: 'emphasis' },
    { label: 'Text', category: 'text' },
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
  protected readonly layerTimelineRows = computed(() =>
    this.timelineRows().filter((item) => item.layer.type !== 'audio'),
  );
  protected readonly audioTimelineRows = computed(() =>
    this.timelineRows().filter((item) => item.layer.type === 'audio'),
  );
  protected readonly sceneTransitionRows = computed(() =>
    this.scenes().filter((scene) => this.sceneHasTransitions(scene)),
  );
  protected readonly timelineTrackCount = computed(() => {
    const animationTracks = this.layerTimelineRows().reduce(
      (total, item) => total + this.layerAnimationTrackRows(item.layer).length,
      0,
    );
    const transitionTracks = this.layerTimelineRows().filter((item) =>
      this.layerHasTransitions(item.layer),
    ).length;
    const sceneTracks = Math.max(1, this.scenes().length) + (this.sceneTransitionRows().length ? 1 : 0);

    return (
      sceneTracks +
      this.layerTimelineRows().length +
      transitionTracks +
      animationTracks +
      this.audioTimelineRows().length
    );
  });
  protected readonly layerPanelTreeNodes = computed<LayerPanelTreeNode[]>(() => {
    const scenes = this.scenes();
    const query = this.layerSearch().trim().toLowerCase();
    const layers = this.draft().layers;

    if (!scenes.length) {
      return this.buildLayerPanelTreeNodes(layers, {
        idPrefix: 'layer',
        query,
        scene: null,
      });
    }

    const assignedLayerIds = new Set<string>();
    const nodes: LayerPanelTreeNode[] = [];

    for (const scene of scenes) {
      const allSceneRows = this.timelineRows().filter((item) =>
        sceneContainsLayer(scene, item.layer.id),
      );
      const children = this.buildLayerPanelTreeNodes(layers, {
        filterLayer: (layer) => sceneContainsLayer(scene, layer.id),
        idPrefix: `scene:${scene.id}`,
        query,
        scene,
      });
      const sceneMatches = query ? sceneMatchesQuery(scene, query) : true;

      for (const item of allSceneRows) {
        assignedLayerIds.add(item.layer.id);
      }

      if (sceneMatches || children.length) {
        nodes.push({
          kind: 'group',
          id: `scene:${scene.id}`,
          label: scene.name || scene.id,
          description: `${allSceneRows.length} layers · ${this.formatTime(scene.start)} - ${this.formatTime(scene.start + scene.duration)}`,
          icon: 'fluent:video-clip-24-regular',
          scene,
          children,
        });
      }
    }

    const unassignedChildren = this.buildLayerPanelTreeNodes(layers, {
      filterLayer: (layer) => !assignedLayerIds.has(layer.id),
      idPrefix: 'unassigned',
      query,
      scene: null,
    });

    if (unassignedChildren.length) {
      nodes.push({
        kind: 'group',
        id: 'scene:unassigned',
        label: 'No scene',
        description: `${unassignedChildren.length} layers`,
        icon: 'fluent:layers-24-regular',
        scene: null,
        children: unassignedChildren,
      });
    }

    return nodes;
  });
  protected readonly layerTreeChildrenAccessor = (
    node: LayerPanelTreeNode,
  ): LayerPanelTreeNode[] => node.children ?? [];
  protected readonly layerTreeHasChild = (_: number, node: LayerPanelTreeNode): boolean =>
    !!node.children?.length;
  private readonly layerTreeView = viewChild<Tree<LayerPanelTreeNode>>('layerTree');
  private readonly expandLayerTreeEffect = effect(() => {
    const tree = this.layerTreeView();
    const nodes = this.layerPanelTreeNodes();

    if (!tree || !nodes.length) {
      return;
    }

    queueMicrotask(() => {
      for (const node of nodes) {
        this.expandLayerTreeNode(tree, node);
      }
    });
  });
  protected readonly canvasLayers = computed(() => this.buildCanvasLayerEntries(this.draft().layers));
  protected readonly validationIssues = computed(() => validateMotionDocument(this.draft()));
  protected readonly sceneValidationIssues = computed(() =>
    createMotionSceneValidationIssues(this.draft()),
  );
  protected readonly unassignedSceneIssues = computed(() =>
    this.sceneValidationIssues().filter((issue) => !issue.sceneId),
  );
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
  protected readonly playheadGridLeftStyle = computed(
    () =>
      `calc(${TIMELINE_LABEL_WIDTH}px + (${this.playheadPercent()} * (100% - ${TIMELINE_LABEL_WIDTH}px) / 100))`,
  );
  protected readonly renderExportRangeLeft = computed(() => {
    const range = this.renderExportRange();
    const duration = Math.max(1, this.duration());

    return (range.fromTime / duration) * 100;
  });
  protected readonly renderExportRangeWidth = computed(() => {
    const range = this.renderExportRange();
    const duration = Math.max(1, this.duration());

    return ((range.toTime - range.fromTime) / duration) * 100;
  });
  protected readonly renderExportRangeLeftStyle = computed(
    () =>
      `calc(${TIMELINE_LABEL_WIDTH}px + (${this.renderExportRangeLeft()} * (100% - ${TIMELINE_LABEL_WIDTH}px) / 100))`,
  );
  protected readonly renderExportRangeWidthStyle = computed(
    () =>
      `calc(${this.renderExportRangeWidth()} * (100% - ${TIMELINE_LABEL_WIDTH}px) / 100)`,
  );
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
  protected readonly previewScaleBounds = computed(() =>
    readMotionPreviewScaleBounds(this.previewScaleMin(), this.previewScaleMax()),
  );
  protected readonly previewScalePercent = computed(() => Math.round(this.previewScale() * 100));
  protected readonly previewStageWidth = computed(
    () => this.draft().composition.width * this.previewScale(),
  );
  protected readonly previewStageHeight = computed(
    () => this.draft().composition.height * this.previewScale(),
  );
  protected readonly previewStageTransform = computed(() => `scale(${this.previewScale()})`);
  protected readonly previewInverseScale = computed(() =>
    roundMotionNumber(1 / this.previewScale(), 4),
  );
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
  protected readonly selectedTransitionDetails = computed(() => {
    const ref = this.selectedTransition();

    return ref ? this.readSelectedTransitionDetails(ref) : null;
  });
  protected readonly selectedScene = computed(() => {
    const sceneId = this.selectedSceneId();

    if (!sceneId) {
      return null;
    }

    return this.draft().scenes?.find((scene) => scene.id === sceneId) ?? null;
  });
  protected readonly activeScene = computed(() => {
    const time = this.currentTime();

    return (
      this.scenes().find((scene) => time >= scene.start && time < scene.start + scene.duration) ??
      null
    );
  });
  protected readonly previewSummaryLabel = computed(() => {
    const composition = this.draft().composition;
    const activeScene = this.activeScene();
    const activeSceneLabel = activeScene?.name || activeScene?.id || 'none';

    return `${this.draft().layers.length} layers · ${this.scenes().length} scenes · active ${activeSceneLabel} · ${this.selectedLayerCount()} selected · ${this.validationIssues().length} issues · ${composition.width}x${composition.height}`;
  });
  protected readonly selectedSceneIssues = computed(() => {
    const sceneId = this.selectedSceneId();

    return sceneId
      ? this.sceneValidationIssues().filter((issue) => issue.sceneId === sceneId)
      : [];
  });
  protected readonly previewDocument = computed(() => {
    const scene = this.selectedScene();

    if (!this.showOnlySelectedScene() || !scene) {
      return this.draft();
    }

    return filterMotionDocumentToScene(this.draft(), scene);
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
  protected readonly animationPresetCurvePath = computed(() =>
    createEasingCurvePath(this.animationPresetSettings().easing),
  );
  protected readonly animationPresetPreviewDots = computed(() =>
    createEasingPreviewDots(this.animationPresetSettings().easing),
  );
  protected readonly selectedAnimationPresetMeta = computed(
    () =>
      this.animationPresets.find((preset) => preset.value === this.selectedAnimationPreset()) ??
      {
        label: 'Fade',
        value: 'fade' as MotionAnimationPresetType,
        category: 'entrance' as MotionAnimationPresetCategory,
      },
  );
  protected readonly undoStack = signal<MotionDocument[]>([]);
  protected readonly redoStack = signal<MotionDocument[]>([]);
  protected readonly actionHistory = signal<MotionHistoryEntry[]>([]);
  protected readonly redoActionHistory = signal<MotionHistoryEntry[]>([]);
  protected readonly canUndo = computed(() => this.undoStack().length > 0);
  protected readonly canRedo = computed(() => this.redoStack().length > 0);
  protected readonly latestHistoryLabel = computed(
    () => this.actionHistory()[this.actionHistory().length - 1]?.label ?? 'No edits yet',
  );
  protected readonly layerClipboard = signal<MotionLayer[]>([]);
  protected readonly keyframeClipboard = signal<MotionKeyframeClipboardItem[]>([]);
  protected readonly canPasteLayer = computed(() => this.layerClipboard().length > 0);
  protected readonly canPasteKeyframes = computed(() => this.keyframeClipboard().length > 0);
  protected readonly assets = computed(() => this.draft().assets ?? []);
  protected readonly imageAssets = computed(() =>
    this.assets().filter((asset) => asset.type === 'image'),
  );
  protected readonly mediaAssets = computed(() =>
    this.assets().filter((asset) => asset.type === 'image' || asset.type === 'video'),
  );
  protected readonly audioAssets = computed(() =>
    this.assets().filter((asset) => asset.type === 'audio'),
  );
  protected readonly filteredAssets = computed(() => {
    const filter = this.assetFilter();

    if (filter === 'all') {
      return this.assets();
    }

    if (filter === 'missing') {
      return this.assets().filter((asset) => this.isAssetMissing(asset));
    }

    return this.assets().filter((asset) => asset.type === filter);
  });
  protected readonly jsonPanelMode = signal<JsonPanelMode>('export');
  protected readonly jsonDraft = signal('');
  protected readonly jsonIssues = signal<string[]>([]);
  protected readonly jsonStatus = signal('');
  protected readonly assetStatus = signal('');
  protected readonly renderExportOutput = signal<MotionStudioRenderOutput>('video');
  protected readonly renderExportFps = signal<number | null>(null);
  protected readonly renderExportRangeMode = signal<MotionRenderRangeMode>('document');
  protected readonly renderExportFromFrame = signal(0);
  protected readonly renderExportToFrame = signal<number | null>(null);
  protected readonly renderExportFrameStep = signal(1);
  protected readonly renderExportScale = signal(1);
  protected readonly selectedRenderExportPreset = signal<MotionExportPresetId>('mp4-1080');
  protected readonly renderExportBatchScenes = signal(false);
  protected readonly renderExportStatus = signal('');
  protected readonly renderExportJob = signal<MotionRenderProgress | null>(null);
  protected readonly renderExportQueue = signal<MotionRenderProgress[]>([]);
  protected readonly renderExportHistory = signal<MotionStudioRenderHistoryItem[]>([]);
  protected readonly renderExportPresets: MotionExportPreset[] = [
    {
      id: 'mp4-1080',
      label: 'MP4 1080p',
      description: 'Default video export.',
      output: 'video',
      fps: 30,
      scale: 1,
      frameStep: 1,
      rangeMode: 'document',
    },
    {
      id: 'mp4-4k',
      label: 'MP4 4K',
      description: 'High resolution video.',
      output: 'video',
      fps: 30,
      scale: 2,
      frameStep: 1,
      rangeMode: 'document',
    },
    {
      id: 'png-sequence',
      label: 'PNG sequence',
      description: 'Frame sequence for compositing.',
      output: 'frames',
      fps: 30,
      scale: 1,
      frameStep: 1,
      rangeMode: 'document',
    },
    {
      id: 'scene-preview',
      label: 'Scene preview',
      description: 'Selected scene at lighter sampling.',
      output: 'video',
      fps: 30,
      scale: 1,
      frameStep: 2,
      rangeMode: 'scene',
    },
    {
      id: 'social-fast',
      label: 'Social draft',
      description: 'Fast preview for review.',
      output: 'video',
      fps: 24,
      scale: 0.75,
      frameStep: 1,
      rangeMode: 'document',
    },
  ];
  protected readonly exportValidationIssues = computed(() => validateMotionExport(this.draft()));
  protected readonly renderExportRange = computed(() => {
    const document = this.draft();
    const fps = Math.max(1, this.renderExportFps() ?? document.composition.fps);

    return resolveMotionRenderRange(document, {
      mode: this.renderExportRangeMode(),
      sceneId: this.selectedSceneId(),
      fps,
      fromFrame: this.renderExportFromFrame(),
      toFrame: this.renderExportToFrame(),
    });
  });
  protected readonly renderExportRequest = computed(() =>
    createMotionRenderRequest(this.draft(), {
      fps: Math.max(1, this.renderExportFps() ?? this.draft().composition.fps),
      rangeMode: this.renderExportRangeMode(),
      sceneId: this.selectedSceneId(),
      fromFrame: this.renderExportRange().fromFrame,
      toFrame: this.renderExportRange().toFrame,
      frameStep: this.renderExportFrameStep(),
      output: this.renderExportOutput(),
      format: this.renderExportOutput() === 'video' ? 'mp4' : 'png',
      scale: this.renderExportScale(),
    }),
  );
  protected readonly renderExportPreviewFrame = computed(
    () => this.renderExportRequest().range.fromFrame,
  );
  protected readonly renderExportPlan = computed(() => {
    const fps = Math.max(1, this.renderExportFps() ?? this.draft().composition.fps);
    const range = this.renderExportRange();
    const output = this.renderExportOutput();

    return renderMotion(this.draft(), {
      fps,
      fromFrame: range.fromFrame,
      toFrame: range.toFrame,
      frameStep: this.renderExportFrameStep(),
      output,
      format: output === 'video' ? 'mp4' : 'png',
      scale: this.renderExportScale(),
    });
  });
  protected readonly renderExportProgressValue = computed(() => this.renderExportJob()?.percent ?? 0);
  protected readonly renderExportBatchFrameCount = computed(() => {
    if (!this.renderExportBatchScenes()) {
      return this.renderExportPlan().frames.length;
    }

    return this.scenes().reduce((total, scene) => {
      const fps = Math.max(1, this.renderExportFps() ?? this.draft().composition.fps);
      const range = resolveMotionRenderRange(this.draft(), {
        mode: 'scene',
        sceneId: scene.id,
        fps,
      });

      return (
        total +
        Math.max(
          0,
          Math.floor((range.toFrame - range.fromFrame) / this.renderExportFrameStep()) + 1,
        )
      );
    }, 0);
  });
  protected readonly renderExportEstimate = computed(() => {
    const plan = this.renderExportPlan();
    const pixels =
      plan.manifest.composition.width *
      plan.manifest.composition.height *
      plan.options.scale *
      plan.options.scale;
    const megapixels = pixels / 1_000_000;
    const estimatedSeconds = Math.max(1, Math.ceil(plan.frames.length * megapixels * 0.18));

    return {
      frames: plan.frames.length,
      megapixels: roundMotionNumber(megapixels, 2),
      estimatedSeconds,
    };
  });
  protected readonly renderExportCommand = computed(() => {
    return createMotionRenderCliCommand(this.renderExportRequest());
  });
  protected readonly jsonPanelTitle = computed(() => {
    if (this.jsonPanelMode() === 'import') {
      return 'Import JSON';
    }

    return this.jsonPanelMode() === 'manifest' ? 'Export manifest' : 'Export JSON';
  });

  private _interaction:
    | CanvasInteraction
    | CanvasBoxSelectionInteraction
    | TimelineInteraction
    | SceneTimelineInteraction
    | RenderRangeInteraction
    | TimelineBoxSelectionInteraction
    | PlayheadInteraction
    | null = null;
  private _interactionMoved = false;
  private _removeInteractionListeners: (() => void) | null = null;
  private _interactionHistorySnapshot: MotionDocument | null = null;
  private _lastEmittedDocumentSignature: string | null = null;
  private _hasSyncedExternalDocument = false;
  private _hasLoadedStoredDraft = false;
  private _skipNextKeyframeClick = false;
  private _suppressNextTimelineClick = false;
  private readonly _previewViewport = viewChild('previewViewport', {
    read: ElementRef<HTMLElement>,
  });

  private readonly _syncDocument = effect(() => {
    const document = this.readInitialDraftDocument(this.document() ?? createDefaultMotionDocument());
    const next = cloneMotionDocument(document);
    const nextSignature = serializeMotionDocument(next);
    const isLocalEcho = this._lastEmittedDocumentSignature === nextSignature;

    if (!isLocalEcho && this._hasSyncedExternalDocument) {
      this.undoStack.set([]);
      this.redoStack.set([]);
      this.actionHistory.set([]);
      this.redoActionHistory.set([]);
    }

    this._hasSyncedExternalDocument = true;
    this.syncDraftDocument(next);
  });

  private readonly _observePreviewViewport = effect((onCleanup) => {
    const viewport = this._previewViewport();

    if (!viewport || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updatePreviewViewportSize = () => {
      const element = viewport.nativeElement;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const horizontalPadding =
        parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
      const verticalPadding =
        parseFloat(style.paddingTop || '0') + parseFloat(style.paddingBottom || '0');
      const width = Math.max(0, rect.width - horizontalPadding);
      const height = Math.max(0, rect.height - verticalPadding);
      const current = this.previewViewportSize();

      if (Math.abs(current.width - width) > 1 || Math.abs(current.height - height) > 1) {
        this.previewViewportSize.set({ width, height });
      }
    };

    updatePreviewViewportSize();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updatePreviewViewportSize);
    });

    observer.observe(viewport.nativeElement);
    onCleanup(() => observer.disconnect());
  });

  private readonly _syncAutoPreviewScale = effect(() => {
    const settings = this.draft().editor;

    if (hasExplicitMotionPreviewScale(settings)) {
      return;
    }

    this.previewScale.set(this.resolvePreviewScale(settings));
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

  private readonly _syncSelectedTransition = effect(() => {
    const ref = this.selectedTransition();

    if (ref && !this.readSelectedTransitionDetails(ref)) {
      this.selectedTransition.set(null);
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

    if (isModifierShortcut && key === 'g' && event.shiftKey && this.canUngroupSelection()) {
      event.preventDefault();
      this.ungroupSelectedLayer();
      return;
    }

    if (isModifierShortcut && key === 'g' && this.canGroupSelection()) {
      event.preventDefault();
      this.groupSelectedLayers();
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

    if ((key === 'delete' || key === 'backspace') && this.selectedTransition()) {
      event.preventDefault();
      this.removeSelectedTransition();
      return;
    }

    if ((key === 'delete' || key === 'backspace') && this.selectedLayerIds().length) {
      event.preventDefault();
      this.removeSelectedLayer();
      return;
    }

    if (key === ' ' || key === 'spacebar') {
      event.preventDefault();
      this.togglePlayback();
      return;
    }

    if (isModifierShortcut && (key === '=' || key === '+')) {
      event.preventDefault();
      this.setPreviewScale(this.previewScale() + this.previewScaleStep());
      return;
    }

    if (isModifierShortcut && key === '-') {
      event.preventDefault();
      this.setPreviewScale(this.previewScale() - this.previewScaleStep());
      return;
    }

    if (isModifierShortcut && key === '0') {
      event.preventDefault();
      this.fitPreviewToViewport();
      return;
    }

    if (key === 'arrowleft' || key === 'arrowright' || key === 'arrowup' || key === 'arrowdown') {
      event.preventDefault();

      if (this.selectedKeyframeCount()) {
        if (key === 'arrowleft' || key === 'arrowright') {
          this.nudgeSelectedKeyframes(key === 'arrowleft' ? -1 : 1, event.shiftKey ? 10 : 1);
        }
        return;
      }

      if (this.selectedLayerIds().length) {
        this.nudgeSelectedLayers(key, event.shiftKey ? 10 : 1);
        return;
      }

      if (key === 'arrowleft' || key === 'arrowright') {
        this.seekByFrames(key === 'arrowleft' ? -1 : 1, event.shiftKey ? 10 : 1);
      }
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
    if (this.playing()) {
      this.stopPlayback();
      return;
    }

    const scene = this.selectedScene();

    if (scene) {
      this.startScenePlayback(scene);
      return;
    }

    this.playbackRange.set(null);
    this.playing.set(true);
  }

  protected stopPlayback(): void {
    this.playing.set(false);
    this.playbackRange.set(null);
  }

  protected seek(time: number): void {
    this.currentTime.set(this.snapTimeToFrame(time));
  }

  protected handlePlayerTimeChange(time: number): void {
    const range = this.playbackRange();
    const nextTime = this.snapTimeToFrame(time);

    if (range && nextTime >= range.end) {
      this.currentTime.set(this.snapTimeToFrame(range.end));
      this.stopPlayback();
      return;
    }

    this.currentTime.set(nextTime);
  }

  protected playSelectedScene(event?: Event): void {
    event?.stopPropagation();
    const scene = this.selectedScene();

    if (!scene) {
      return;
    }

    this.startScenePlayback(scene);
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
    this.selectedTransition.set(null);
  }

  protected selectLayerFromLibrary(layer: MotionLayer, event?: MouseEvent | PointerEvent): void {
    this.selectLayer(layer, event);

    if (this.selectedLayerIds().includes(layer.id)) {
      this.focusLayerInPreview(layer);
    }
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
    this.selectedTransition.set(null);
    this.seek(scene.start);
  }

  protected isSceneSelected(scene: MotionScene): boolean {
    return this.selectedSceneId() === scene.id;
  }

  protected isSceneActive(scene: MotionScene | null): boolean {
    return !!scene && this.activeScene()?.id === scene.id;
  }

  protected setLayerSearch(value: string): void {
    this.layerSearch.set(value);
  }

  protected sceneSelectedLayerCount(scene: MotionScene): number {
    const selectedIds = new Set(this.selectedLayerIds());

    return (scene.layerIds ?? []).filter((layerId) => selectedIds.has(layerId)).length;
  }

  protected assignSelectedLayersToScene(scene: MotionScene, event?: Event): void {
    event?.stopPropagation();
    const selectedIds = this.selectedLayerIds();

    if (!selectedIds.length) {
      return;
    }

    this.updateDocument(
      (document) => {
        const targetScene = document.scenes?.find((item) => item.id === scene.id);

        if (!targetScene) {
          return;
        }

        const layerIds = new Set(targetScene.layerIds ?? []);

        for (const layerId of selectedIds) {
          if (findMotionLayer(document.layers, layerId)) {
            layerIds.add(layerId);
          }
        }

        targetScene.layerIds = [...layerIds];
      },
      { historyLabel: `Assigned ${selectedIds.length} layer${selectedIds.length === 1 ? '' : 's'} to scene` },
    );
    this.selectedSceneId.set(scene.id);
  }

  protected removeSelectedLayersFromScene(scene: MotionScene, event?: Event): void {
    event?.stopPropagation();
    const selectedIds = new Set(this.selectedLayerIds());

    if (!selectedIds.size) {
      return;
    }

    this.updateDocument(
      (document) => {
        const targetScene = document.scenes?.find((item) => item.id === scene.id);

        if (targetScene) {
          targetScene.layerIds = (targetScene.layerIds ?? []).filter(
            (layerId) => !selectedIds.has(layerId),
          );
        }
      },
      { historyLabel: `Removed ${selectedIds.size} layer${selectedIds.size === 1 ? '' : 's'} from scene` },
    );
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
    const action = this.actionHistory()[this.actionHistory().length - 1] ?? null;
    this.undoStack.set(undoStack.slice(0, -1));
    this.redoStack.update((stack) => [...stack, current]);
    this.actionHistory.update((history) => history.slice(0, -1));
    this.redoActionHistory.update((history) => (action ? [...history, action] : history));
    this.restoreHistoryDocument(previous);
  }

  protected redo(): void {
    const redoStack = this.redoStack();
    const next = redoStack[redoStack.length - 1];

    if (!next) {
      return;
    }

    const current = cloneMotionDocument(this.draft());
    const action = this.redoActionHistory()[this.redoActionHistory().length - 1] ?? null;
    this.redoStack.set(redoStack.slice(0, -1));
    this.undoStack.update((stack) => [...stack, current].slice(-MOTION_HISTORY_LIMIT));
    this.redoActionHistory.update((history) => history.slice(0, -1));
    this.actionHistory.update((history) =>
      action ? [...history, action].slice(-MOTION_HISTORY_LIMIT) : history,
    );
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
        children: extracted.layers.map((layer) => rebaseMotionLayerForGroup(layer, bounds)),
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

  protected addAudioLayer(): void {
    this.addLayer('audio');
  }

  protected textPresets(): MotionPreset[] {
    return this.presetsByCategory('text');
  }

  protected shapePresets(): MotionPreset[] {
    return this.presetsByCategory('shape');
  }

  protected sceneTemplatePresets(): MotionPreset[] {
    return this.presetsByCategory('scene');
  }

  protected presetsByCategory(category: MotionPreset['category']): MotionPreset[] {
    return this.presets().filter((preset) => preset.category === category);
  }

  protected async uploadAssetFiles(event: UploadFileSelectedEvent): Promise<void> {
    const files = event.files;

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
    }
  }

  protected addImageLayerFromAsset(asset: MotionAsset, event?: Event): void {
    event?.stopPropagation();

    if (!isMotionTimelineAsset(asset)) {
      return;
    }

    if (asset.type === 'audio') {
      this.insertAudioAssetLayer(asset);
    } else {
      this.insertAssetLayer(asset);
    }
  }

  protected replaceSelectedLayerAsset(asset: MotionAsset, event?: Event): void {
    event?.stopPropagation();

    if (!isMotionTimelineAsset(asset) || !this.canReplaceSelectedLayerAsset()) {
      return;
    }

    this.applyAssetToSelectedLayer(asset);
  }

  protected canReplaceSelectedLayerAsset(): boolean {
    const layer = this.selectedLayer();

    return !!layer && (layer.type === 'image' || layer.type === 'video' || layer.type === 'audio');
  }

  protected startAssetDrag(asset: MotionAsset, event: DragEvent): void {
    if (!isMotionTimelineAsset(asset)) {
      return;
    }

    this.draggedAssetId.set(asset.id);
    event.dataTransfer?.setData('application/x-ngs-motion-asset', asset.id);
    event.dataTransfer?.setData('text/plain', asset.id);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  protected finishAssetDrag(): void {
    this.draggedAssetId.set(null);
  }

  protected handleCanvasLibraryDragOver(event: DragEvent): void {
    if (!this.readDraggedPreset(event) && !this.readDraggedAsset(event)) {
      return;
    }

    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  protected handleTimelineLibraryDragOver(event: DragEvent): void {
    if (!this.readDraggedPreset(event) && !this.readDraggedAsset(event)) {
      return;
    }

    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  protected dropLibraryItemOnCanvas(event: DragEvent): void {
    const asset = this.readDraggedAsset(event);

    if (asset) {
      event.preventDefault();
      event.stopPropagation();
      const target = event.currentTarget as HTMLElement | null;
      const rect = target?.getBoundingClientRect();

      if (!rect) {
        this.finishAssetDrag();
        return;
      }

      const composition = this.draft().composition;
      const placement: MotionPresetPlacement = {
        x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * composition.width,
        y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * composition.height,
      };

      this.insertAssetLayer(asset, { placement });
      this.finishAssetDrag();
      return;
    }

    this.dropPresetOnCanvas(event);
  }

  protected dropLibraryItemOnTimeline(event: DragEvent): void {
    const asset = this.readDraggedAsset(event);

    if (asset) {
      event.preventDefault();
      event.stopPropagation();
      const timeline = event.currentTarget as HTMLElement | null;

      if (!timeline) {
        this.finishAssetDrag();
        return;
      }

      const startTime = this.snapTimeToFrame(
        this.timelineRatioFromElement(event.clientX, timeline) * this.duration(),
      );

      this.insertAssetLayer(asset, { startTime });
      this.seek(startTime);
      this.finishAssetDrag();
      return;
    }

    this.dropPresetOnTimeline(event);
  }

  private insertAssetLayer(asset: MotionAsset, options: MotionAssetLayerInsertOptions = {}): void {
    if (asset.type === 'audio') {
      this.insertAudioAssetLayer(asset, options);
      return;
    }

    const layer = this.createMediaLayer(asset, options);

    this.updateDocument((document) => {
      document.layers.push(layer);
      document.tracks = ensureLayerInTrack(document.tracks, layer.id);
      this.assignLayerToSelectedScene(document, layer.id);
      this.selectedLayerId.set(layer.id);
      this.selectedLayerIds.set([layer.id]);
      this.selectedKeyframe.set(null);
    });
  }

  private insertAudioAssetLayer(
    asset: MotionAsset,
    options: MotionAssetLayerInsertOptions = {},
  ): void {
    const layer = this.createAudioLayer(asset, options);

    this.updateDocument((document) => {
      document.layers.push(layer);
      document.tracks = ensureLayerInTrack(document.tracks, layer.id);
      this.assignLayerToSelectedScene(document, layer.id);
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

  protected applySceneTemplateToSelected(preset: MotionPreset, event?: Event): void {
    event?.stopPropagation();
    const scene = this.selectedScene();

    if (!scene) {
      this.insertSceneTemplateAfterSelection(preset, event);
      return;
    }

    this.applySceneTemplate(scene, preset);
  }

  protected insertSceneTemplateAfterSelection(preset: MotionPreset, event?: Event): void {
    event?.stopPropagation();
    this.insertSceneTemplate(preset);
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
    const asset = this.mediaAssets().find((item) => item.id === event.value);

    if (!asset) {
      return;
    }

    this.applyAssetToSelectedLayer(asset);
  }

  protected setLayerImageSrc(value: string): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        src: value,
        placeholder: false,
      };
    });
  }

  protected setLayerAudioAsset(event: SelectChange): void {
    const asset = this.audioAssets().find((item) => item.id === event.value);

    if (!asset) {
      return;
    }

    this.applyAssetToSelectedLayer(asset);
  }

  protected setLayerAudioSrc(value: string): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        src: value,
      };
    });
  }

  protected setLayerAudioOffset(value: number): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        offset: Math.max(0, roundMotionNumber(value || 0, 2)),
      };
    });
  }

  protected setLayerAudioVolume(value: number): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        volume: Math.max(0, roundMotionNumber(value || 0, 2)),
      };
    });
  }

  protected toggleLayerAudioMuted(event: CheckboxChange): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        muted: event.checked,
      };
    });
  }

  protected toggleLayerAudioSolo(event: CheckboxChange): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        solo: event.checked,
      };
    });
  }

  protected setLayerAudioFadeIn(value: number): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        fadeIn: Math.max(0, roundMotionNumber(value || 0, 2)),
      };
    });
  }

  protected setLayerAudioFadeOut(value: number): void {
    this.updateSelectedLayer((layer) => {
      layer.props = {
        ...(layer.props ?? {}),
        fadeOut: Math.max(0, roundMotionNumber(value || 0, 2)),
      };
    });
  }

  protected audioFadeWidth(layer: MotionLayer, edge: MotionTransitionEdge): number {
    if (layer.type !== 'audio' || layer.duration <= 0) {
      return 0;
    }

    const value = edge === 'in' ? layer.props?.['fadeIn'] : layer.props?.['fadeOut'];

    return Math.max(0, Math.min(50, (coerceNumber(value) / layer.duration) * 100));
  }

  protected audioVolumeLabel(layer: MotionLayer): string {
    const volume = Math.max(0, Number(layer.props?.['volume'] ?? 1));

    return `${Math.round(volume * 100)}%`;
  }

  protected audioStatusLabel(layer: MotionLayer): string {
    if (layer.props?.['muted'] === true) {
      return 'Muted';
    }

    if (layer.props?.['solo'] === true) {
      return 'Solo';
    }

    return this.audioVolumeLabel(layer);
  }

  protected toggleAudioLayerMuted(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.selectLayer(layer);
    this.updateLayer(layer.id, (nextLayer) => {
      nextLayer.props = {
        ...(nextLayer.props ?? {}),
        muted: nextLayer.props?.['muted'] !== true,
      };
    });
  }

  protected toggleAudioLayerSolo(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.selectLayer(layer);
    this.updateLayer(layer.id, (nextLayer) => {
      nextLayer.props = {
        ...(nextLayer.props ?? {}),
        solo: nextLayer.props?.['solo'] !== true,
      };
    });
  }

  protected adjustAudioLayerVolume(layer: MotionLayer, delta: number, event?: Event): void {
    event?.stopPropagation();
    this.selectLayer(layer);
    this.updateLayer(layer.id, (nextLayer) => {
      const volume = Math.max(0, Math.min(2, coerceNumber(nextLayer.props?.['volume'] ?? 1) + delta));

      nextLayer.props = {
        ...(nextLayer.props ?? {}),
        volume: roundMotionNumber(volume, 2),
      };
    });
  }

  protected clearLayerMediaSource(): void {
    this.updateSelectedLayer((layer) => {
      const props = { ...(layer.props ?? {}) };

      delete props['assetId'];
      delete props['src'];
      props['placeholder'] = true;
      layer.props = props;
    });
  }

  protected isMediaPlaceholderLayer(layer: MotionLayer): boolean {
    return isMotionMediaLayer(layer) && isMotionLayerMediaPlaceholder(layer);
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

  protected previewLayerTransition(edge: MotionTransitionEdge): void {
    const layer = this.selectedLayer();

    if (!layer) {
      return;
    }

    const transition = layer.transitions?.[edge];
    const duration = transition?.duration ?? DEFAULT_TRANSITION_DURATION;
    const time =
      edge === 'in'
        ? layer.start
        : Math.max(layer.start, layer.start + layer.duration - Math.max(100, duration));

    this.seek(time);
    this.playbackRange.set({
      start: time,
      end: Math.min(this.duration(), time + Math.max(600, duration + 200)),
    });
    this.playing.set(true);
  }

  protected previewSceneTransition(edge: MotionTransitionEdge): void {
    const scene = this.selectedScene();

    if (!scene) {
      return;
    }

    const transition = readMotionSceneTransition(scene, edge);
    const duration = transition?.duration ?? DEFAULT_TRANSITION_DURATION;
    const time =
      edge === 'in'
        ? scene.start
        : Math.max(scene.start, scene.start + scene.duration - Math.max(100, duration));

    this.seek(time);
    this.playbackRange.set({
      start: time,
      end: Math.min(this.duration(), time + Math.max(600, duration + 200)),
    });
    this.playing.set(true);
  }

  protected addScene(): void {
    const scenes = this.scenes();
    const selectedSceneId = this.selectedSceneId();
    const selectedSceneIndex = scenes.findIndex((scene) => scene.id === selectedSceneId);
    const insertIndex = selectedSceneIndex >= 0 ? selectedSceneIndex + 1 : scenes.length;
    const start =
      selectedSceneIndex >= 0
        ? scenes[selectedSceneIndex].start + scenes[selectedSceneIndex].duration
        : scenes.length
          ? readSceneSequenceDuration(scenes)
          : this.currentTime();
    const duration = DEFAULT_SCENE_DURATION;
    const layerIds = [...this.selectedLayerIds()];
    const scene: MotionScene = {
      id: createMotionLayerId('scene'),
      name: `Scene ${(this.draft().scenes?.length ?? 0) + 1}`,
      start,
      duration,
      layerIds,
    };

    this.updateDocument((document) => {
      const orderedScenes = this.scenes();

      orderedScenes.splice(insertIndex, 0, scene);
      document.scenes = normalizeSceneSequence(orderedScenes);
      document.composition.duration = Math.max(
        document.composition.duration,
        readSceneSequenceDuration(document.scenes),
      );
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

  protected removeScene(scene: MotionScene, event?: Event): void {
    event?.stopPropagation();
    this.selectedSceneId.set(scene.id);
    this.removeSelectedScene();
  }

  protected duplicateSelectedScene(event?: Event): void {
    event?.stopPropagation();
    const scene = this.selectedScene();

    if (!scene) {
      return;
    }

    this.duplicateScene(scene);
  }

  protected duplicateScene(scene: MotionScene, event?: Event): void {
    event?.stopPropagation();
    const scenes = this.scenes();
    const sourceIndex = scenes.findIndex((item) => item.id === scene.id);
    const insertIndex = sourceIndex >= 0 ? sourceIndex + 1 : scenes.length;
    const nextScene: MotionScene = {
      ...cloneMotionScene(scene),
      id: createMotionLayerId('scene'),
      name: `${scene.name || scene.id} copy`,
    };

    this.updateDocument((document) => {
      const orderedScenes = this.scenes();
      orderedScenes.splice(insertIndex, 0, nextScene);
      document.scenes = normalizeSceneSequence(orderedScenes);
      document.composition.duration = Math.max(
        document.composition.duration,
        readSceneSequenceDuration(document.scenes),
      );
      this.selectedSceneId.set(nextScene.id);
      this.selectedLayerId.set(null);
      this.selectedLayerIds.set([]);
      this.selectedKeyframe.set(null);
    });
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

  protected sceneDurationLabel(scene: MotionScene): string {
    return this.formatTime(scene.duration);
  }

  protected sceneRangeLabel(scene: MotionScene): string {
    return `${this.formatTime(scene.start)} - ${this.formatTime(scene.start + scene.duration)}`;
  }

  protected sceneThumbnailLabel(scene: MotionScene): string {
    const firstLayer = this.timelineRows().find((item) => sceneContainsLayer(scene, item.layer.id));
    const text = firstLayer?.layer.props?.['text'];

    if (typeof text === 'string' && text.trim()) {
      return text.trim().slice(0, 2).toUpperCase();
    }

    return (scene.name || scene.id).slice(0, 2).toUpperCase();
  }

  protected sceneThumbnailTone(scene: MotionScene): string {
    const name = `${scene.id} ${scene.name ?? ''}`.toLowerCase();

    if (name.includes('metric')) {
      return 'is-metric';
    }

    if (name.includes('testimonial') || name.includes('quote')) {
      return 'is-testimonial';
    }

    if (name.includes('product')) {
      return 'is-product';
    }

    if (name.includes('outro')) {
      return 'is-outro';
    }

    return 'is-intro';
  }

  protected sceneIssueCount(scene: MotionScene): number {
    return this.sceneValidationIssues().filter((issue) => issue.sceneId === scene.id).length;
  }

  protected sceneIssueSummary(scene: MotionScene): string {
    const count = this.sceneIssueCount(scene);

    return count ? `${count} issue${count === 1 ? '' : 's'}` : 'Ready';
  }

  protected layerSceneWarningMessage(layer: MotionLayer): string {
    return (
      this.sceneValidationIssues().find(
        (issue) => issue.layerId === layer.id && issue.id.startsWith('unassigned-layer:'),
      )?.message ?? ''
    );
  }

  protected startSceneStoryboardDrag(scene: MotionScene, event: DragEvent): void {
    event.stopPropagation();
    this.draggedSceneId.set(scene.id);
    this.sceneStoryboardDropTargetId.set(null);
    event.dataTransfer?.setData('application/x-ngs-motion-scene', scene.id);
    event.dataTransfer?.setData('text/plain', scene.id);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  protected finishSceneStoryboardDrag(): void {
    this.draggedSceneId.set(null);
    this.sceneStoryboardDropTargetId.set(null);
  }

  protected handleSceneStoryboardDragOver(scene: MotionScene, event: DragEvent): void {
    const draggedId = this.draggedSceneId();

    if (!draggedId || draggedId === scene.id) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.sceneStoryboardDropTargetId.set(scene.id);

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  protected handleSceneStoryboardDragLeave(scene: MotionScene, event: DragEvent): void {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && (event.currentTarget as HTMLElement).contains(nextTarget)) {
      return;
    }

    if (this.sceneStoryboardDropTargetId() === scene.id) {
      this.sceneStoryboardDropTargetId.set(null);
    }
  }

  protected dropSceneBefore(scene: MotionScene, event: DragEvent): void {
    const draggedId = this.draggedSceneId();

    if (!draggedId || draggedId === scene.id) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.moveSceneBefore(draggedId, scene.id);
    this.finishSceneStoryboardDrag();
  }

  protected isSceneStoryboardDropTarget(scene: MotionScene): boolean {
    return this.sceneStoryboardDropTargetId() === scene.id;
  }

  protected toggleSceneLayer(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.updateSelectedScene((scene) => {
      this.toggleLayerInScene(scene, layer);
    });
  }

  protected toggleSceneLayerInScene(scene: MotionScene, layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();
    this.updateDocument((document) => {
      const nextScene = document.scenes?.find((item) => item.id === scene.id);

      if (nextScene) {
        this.toggleLayerInScene(nextScene, layer);
      }
    });
  }

  protected isLayerInScene(scene: MotionScene, layer: MotionLayer): boolean {
    return scene.layerIds?.includes(layer.id) ?? false;
  }

  protected selectedSceneContainsLayer(layer: MotionLayer): boolean {
    const scene = this.selectedScene();

    return !!scene && this.isLayerInScene(scene, layer);
  }

  protected selectedSceneLayerLabel(layer: MotionLayer): string {
    const scene = this.selectedScene();

    if (!scene || !this.isLayerInScene(scene, layer)) {
      return '';
    }

    return `in ${scene.name || scene.id}`;
  }

  protected sceneLayerCount(scene: MotionScene): number {
    return scene.layerIds?.length ?? 0;
  }

  protected sceneTransitionCount(scene: MotionScene): number {
    return Number(!!scene.transitionIn) + Number(!!scene.transitionOut);
  }

  protected layerTreeNodeLabel(node: LayerPanelTreeNode): string {
    if (node.kind === 'group') {
      return node.label;
    }

    return node.item.layer.name || node.item.layer.id;
  }

  protected isLayerTreeNodeActive(node: LayerPanelTreeNode): boolean {
    if (node.kind === 'group') {
      return !!node.scene && this.isSceneSelected(node.scene);
    }

    return this.isLayerSelected(node.item.layer);
  }

  protected isLayerTreeNodeCurrent(node: LayerPanelTreeNode): boolean {
    return node.kind === 'group' && this.isSceneActive(node.scene);
  }

  protected isLayerTreeNodeInSelectedScene(node: LayerPanelTreeNode): boolean {
    return node.kind === 'layer' && this.selectedSceneContainsLayer(node.item.layer);
  }

  protected isLayerTreeNodeMuted(node: LayerPanelTreeNode): boolean {
    return node.kind === 'layer' && !!node.item.layer.hidden;
  }

  protected layerTreeNodeWarningMessage(node: LayerPanelTreeNode): string {
    return node.kind === 'layer' ? this.layerSceneWarningMessage(node.item.layer) : '';
  }

  protected selectLayerTreeNode(node: LayerPanelTreeNode, event: MouseEvent): void {
    if (node.kind === 'group') {
      if (node.scene) {
        this.selectScene(node.scene, event);
      }

      return;
    }

    this.selectLayerFromLibrary(node.item.layer, event);
  }

  protected selectLayerTreeNodeContext(node: LayerPanelTreeNode, event: MouseEvent): void {
    if (node.kind === 'group') {
      if (node.scene) {
        this.selectSceneContext(node.scene, event);
      }

      return;
    }

    this.selectLayerContext(node.item.layer, event);
  }

  protected startLayerSceneDrag(row: LayerPanelLayerRow, event: DragEvent): void {
    event.stopPropagation();
    const item = {
      layerId: row.item.layer.id,
      sourceSceneId: row.scene?.id ?? null,
    };

    this.draggedLayerSceneItem.set(item);
    this.layerSceneDropTargetId.set(null);
    event.dataTransfer?.setData('application/x-ngs-motion-layer', item.layerId);
    event.dataTransfer?.setData('text/plain', item.layerId);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  protected startLayerTreeNodeDrag(node: LayerPanelTreeNode, event: DragEvent): void {
    if (node.kind !== 'layer') {
      return;
    }

    this.startLayerSceneDrag(node, event);
  }

  protected finishLayerSceneDrag(): void {
    this.draggedLayerSceneItem.set(null);
    this.layerSceneDropTargetId.set(null);
  }

  protected handleLayerSceneDragOver(scene: MotionScene | null, event: DragEvent): void {
    if (!this.draggedLayerSceneItem()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.layerSceneDropTargetId.set(readLayerSceneDropTargetId(scene));

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  protected handleLayerSceneDragLeave(scene: MotionScene | null, event: DragEvent): void {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && (event.currentTarget as HTMLElement).contains(nextTarget)) {
      return;
    }

    if (this.layerSceneDropTargetId() === readLayerSceneDropTargetId(scene)) {
      this.layerSceneDropTargetId.set(null);
    }
  }

  protected dropLayerOnScene(scene: MotionScene | null, event: DragEvent): void {
    const draggedItem = this.draggedLayerSceneItem();

    if (!draggedItem) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.moveLayerToScene(draggedItem.layerId, draggedItem.sourceSceneId, scene?.id ?? null);
    this.finishLayerSceneDrag();
  }

  protected isLayerSceneDropTarget(scene: MotionScene | null): boolean {
    return this.layerSceneDropTargetId() === readLayerSceneDropTargetId(scene);
  }

  private toggleLayerInScene(scene: MotionScene, layer: MotionLayer): void {
    const layerIds = scene.layerIds ?? [];

    scene.layerIds = layerIds.includes(layer.id)
      ? layerIds.filter((layerId) => layerId !== layer.id)
      : [...layerIds, layer.id];
  }

  private moveLayerToScene(
    layerId: string,
    sourceSceneId: string | null,
    targetSceneId: string | null,
  ): void {
    if (sourceSceneId === targetSceneId) {
      return;
    }

    this.updateDocument((document) => {
      if (!findMotionLayer(document.layers, layerId)) {
        return;
      }

      const allLayerIds = flattenMotionLayers(document.layers).map((item) => item.layer.id);

      for (const scene of document.scenes ?? []) {
        if (targetSceneId === null || scene.id === sourceSceneId) {
          removeLayerFromScene(scene, layerId, allLayerIds);
        }
      }

      if (targetSceneId) {
        const targetScene = document.scenes?.find((scene) => scene.id === targetSceneId);

        if (targetScene?.layerIds) {
          const layerIds = targetScene.layerIds;
          targetScene.layerIds = layerIds.includes(layerId) ? layerIds : [...layerIds, layerId];
        }
      }

      this.selectedSceneId.set(targetSceneId);
      this.selectedLayerId.set(layerId);
      this.selectedLayerIds.set([layerId]);
      this.selectedKeyframe.set(null);
    });
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

  protected canAlignSelection(): boolean {
    return this.selectedLayerIds().some((layerId) => {
      const layer = findMotionLayer(this.draft().layers, layerId);

      return !!layer && !layer.locked;
    });
  }

  protected canDistributeSelection(): boolean {
    return this.selectedLayerIds().filter((layerId) => {
      const layer = findMotionLayer(this.draft().layers, layerId);

      return !!layer && !layer.locked;
    }).length > 2;
  }

  protected alignSelectedLayers(alignment: MotionAlignment): void {
    const selectedIds = new Set(this.selectedLayerIds());

    if (!selectedIds.size) {
      return;
    }

    this.updateDocument(
      (document) => {
        const selectedLayers = flattenMotionLayers(document.layers)
          .map((entry) => entry.layer)
          .filter((layer) => selectedIds.has(layer.id) && !layer.locked);

        if (!selectedLayers.length) {
          return;
        }

        const bounds = readLayerCollectionBounds(selectedLayers);
        const composition = document.composition;
        const targetBounds =
          selectedLayers.length === 1
            ? { x: 0, y: 0, width: composition.width, height: composition.height }
            : bounds;

        for (const layer of selectedLayers) {
          const layout = { ...layer.layout };

          switch (alignment) {
            case 'left':
              layout.x = targetBounds.x;
              break;
            case 'center':
              layout.x = targetBounds.x + targetBounds.width / 2 - layout.width / 2;
              break;
            case 'right':
              layout.x = targetBounds.x + targetBounds.width - layout.width;
              break;
            case 'top':
              layout.y = targetBounds.y;
              break;
            case 'middle':
              layout.y = targetBounds.y + targetBounds.height / 2 - layout.height / 2;
              break;
            case 'bottom':
              layout.y = targetBounds.y + targetBounds.height - layout.height;
              break;
          }

          layer.layout = normalizeMotionLayout(layout);
        }
      },
      { historyLabel: `Aligned ${selectedIds.size} layer${selectedIds.size === 1 ? '' : 's'}` },
    );
  }

  protected distributeSelectedLayers(axis: MotionDistributionAxis): void {
    const selectedIds = new Set(this.selectedLayerIds());

    if (selectedIds.size < 3) {
      return;
    }

    this.updateDocument(
      (document) => {
        const selectedLayers = flattenMotionLayers(document.layers)
          .map((entry) => entry.layer)
          .filter((layer) => selectedIds.has(layer.id) && !layer.locked);

        if (selectedLayers.length < 3) {
          return;
        }

        const ordered = [...selectedLayers].sort((a, b) =>
          axis === 'horizontal'
            ? readLayerCenterX(a) - readLayerCenterX(b)
            : readLayerCenterY(a) - readLayerCenterY(b),
        );
        const first = ordered[0];
        const last = ordered[ordered.length - 1];
        const firstCenter = axis === 'horizontal' ? readLayerCenterX(first) : readLayerCenterY(first);
        const lastCenter = axis === 'horizontal' ? readLayerCenterX(last) : readLayerCenterY(last);
        const step = (lastCenter - firstCenter) / Math.max(1, ordered.length - 1);

        ordered.forEach((layer, index) => {
          const center = firstCenter + step * index;

          layer.layout = normalizeMotionLayout({
            ...layer.layout,
            ...(axis === 'horizontal'
              ? { x: center - layer.layout.width / 2 }
              : { y: center - layer.layout.height / 2 }),
          });
        });
      },
      {
        historyLabel: `Distributed ${selectedIds.size} layer${selectedIds.size === 1 ? '' : 's'}`,
      },
    );
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

  protected animationPresetsByCategory(
    category: MotionAnimationPresetCategory,
  ): Array<{ label: string; value: MotionAnimationPresetType; category: MotionAnimationPresetCategory }> {
    return this.animationPresets.filter((preset) => preset.category === category);
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

  protected resetAnimationPresetBuilder(): void {
    this.selectedAnimationPreset.set('fade');
    this.animationPresetApplyMode.set('append');
    this.animationPresetSettings.set({
      duration: 700,
      delay: 0,
      easing: 'easeOutCubic',
      direction: 'up',
      distance: 80,
    });
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

  protected nudgeSelectedLayers(key: string, amount: number): void {
    const selectedIds = this.selectedLayerIds();

    if (!selectedIds.length) {
      return;
    }

    const delta = {
      x: key === 'arrowleft' ? -amount : key === 'arrowright' ? amount : 0,
      y: key === 'arrowup' ? -amount : key === 'arrowdown' ? amount : 0,
    };

    if (!delta.x && !delta.y) {
      return;
    }

    this.updateDocument((document) => {
      for (const layerId of selectedIds) {
        const layer = findMotionLayer(document.layers, layerId);

        if (!layer || layer.locked) {
          continue;
        }

        layer.layout = {
          ...layer.layout,
          x: roundMotionNumber(layer.layout.x + delta.x, 2),
          y: roundMotionNumber(layer.layout.y + delta.y, 2),
        };
      }
    });
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

  protected layerHasTransitions(layer: MotionLayer): boolean {
    return !!(layer.transitions?.in || layer.transitions?.out);
  }

  protected sceneHasTransitions(scene: MotionScene): boolean {
    return !!(scene.transitionIn || scene.transitionOut);
  }

  protected layerTransitionTrackSegments(layer: MotionLayer): TimelineTransitionSegment[] {
    return this.transitionTrackSegments(layer.start, layer.duration, layer.transitions?.in, layer.transitions?.out);
  }

  protected sceneTransitionTrackSegments(scene: MotionScene): TimelineTransitionSegment[] {
    return this.transitionTrackSegments(scene.start, scene.duration, scene.transitionIn, scene.transitionOut);
  }

  protected transitionTrackLabel(transition: MotionTransition | undefined): string {
    return transition ? `${transition.type} · ${this.formatTime(transition.duration)}` : '';
  }

  protected isLayerTransitionSelected(layer: MotionLayer, edge: MotionTransitionEdge): boolean {
    const selected = this.selectedTransition();

    return selected?.kind === 'layer' && selected.targetId === layer.id && selected.edge === edge;
  }

  protected isSceneTransitionSelected(scene: MotionScene, edge: MotionTransitionEdge): boolean {
    const selected = this.selectedTransition();

    return selected?.kind === 'scene' && selected.targetId === scene.id && selected.edge === edge;
  }

  protected selectLayerTransition(
    layer: MotionLayer,
    edge: MotionTransitionEdge,
    event?: Event,
  ): void {
    event?.stopPropagation();
    this.selectedLayerId.set(layer.id);
    this.selectedLayerIds.set([layer.id]);
    this.selectedSceneId.set(null);
    this.clearSelectedKeyframes();
    this.selectedTransition.set({ kind: 'layer', targetId: layer.id, edge });
  }

  protected selectSceneTransition(
    scene: MotionScene,
    edge: MotionTransitionEdge,
    event?: Event,
  ): void {
    event?.stopPropagation();
    this.selectedSceneId.set(scene.id);
    this.selectedLayerId.set(null);
    this.selectedLayerIds.set([]);
    this.clearSelectedKeyframes();
    this.selectedTransition.set({ kind: 'scene', targetId: scene.id, edge });
  }

  protected previewSelectedTransition(event?: Event): void {
    event?.stopPropagation();
    const selected = this.selectedTransition();

    if (!selected) {
      return;
    }

    if (selected.kind === 'layer') {
      this.selectedLayerId.set(selected.targetId);
      this.previewLayerTransition(selected.edge);
      return;
    }

    this.selectedSceneId.set(selected.targetId);
    this.previewSceneTransition(selected.edge);
  }

  protected applySelectedTransitionPreset(
    type: Exclude<MotionTransitionType, 'none'>,
    event?: Event,
  ): void {
    event?.stopPropagation();
    const selected = this.selectedTransition();

    if (!selected) {
      return;
    }

    if (selected.kind === 'layer') {
      this.updateLayer(selected.targetId, (layer) => {
        setMotionLayerTransition(layer, selected.edge, createDefaultTransition(type, selected.edge));
      });
      return;
    }

    this.updateDocument((document) => {
      const scene = document.scenes?.find((item) => item.id === selected.targetId);

      if (scene) {
        setMotionSceneTransition(scene, selected.edge, createDefaultTransition(type, selected.edge));
      }
    });
  }

  protected removeSelectedTransition(event?: Event): void {
    event?.stopPropagation();
    const selected = this.selectedTransition();

    if (!selected) {
      return;
    }

    if (selected.kind === 'layer') {
      this.updateLayer(selected.targetId, (layer) => {
        setMotionLayerTransition(layer, selected.edge, undefined);
      });
    } else {
      this.updateDocument((document) => {
        const scene = document.scenes?.find((item) => item.id === selected.targetId);

        if (scene) {
          setMotionSceneTransition(scene, selected.edge, undefined);
        }
      });
    }

    this.selectedTransition.set(null);
  }

  protected selectedTransitionTypeValue(details: SelectedTransitionDetails): MotionTransitionType {
    return normalizeMotionTransitionType(details.transition.type);
  }

  protected selectedTransitionDirectionValue(
    details: SelectedTransitionDetails,
  ): MotionTransitionDirection {
    return readMotionTransitionDirection(details.transition, details.edge);
  }

  protected selectedTransitionDistanceValue(details: SelectedTransitionDetails): number {
    return readMotionTransitionDistance(details.transition);
  }

  protected setSelectedTransitionType(event: SelectChange): void {
    const type = normalizeMotionTransitionType(event.value);

    if (type === 'none') {
      this.removeSelectedTransition();
      return;
    }

    this.updateSelectedTransition((transition, edge) => ({
      ...createDefaultTransition(type, edge),
      ...transition,
      type,
    }));
  }

  protected setSelectedTransitionDuration(value: unknown): void {
    const duration = Math.max(100, coerceNumber(value));
    const details = this.selectedTransitionDetails();

    this.updateSelectedTransition((transition) => ({
      ...transition,
      duration: Math.min(details?.maxDuration ?? duration, duration),
    }));
  }

  protected setSelectedTransitionEasing(event: SelectChange): void {
    this.updateSelectedTransition((transition) => ({
      ...transition,
      easing: event.value,
    }));
  }

  protected setSelectedTransitionDirection(event: SelectChange): void {
    const selected = this.selectedTransition();

    if (!selected) {
      return;
    }

    const direction = normalizeMotionTransitionDirection(event.value, selected.edge);

    this.updateSelectedTransition((transition) => ({
      ...transition,
      props: {
        ...(transition.props ?? {}),
        direction,
      },
    }));
  }

  protected setSelectedTransitionDistance(value: unknown): void {
    const distance = Math.max(0, coerceNumber(value));

    this.updateSelectedTransition((transition) => ({
      ...transition,
      props: {
        ...(transition.props ?? {}),
        distance,
      },
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
    this.selectedTransition.set(null);

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
    this._interactionMoved = false;
    this._interaction = {
      type: 'playhead',
      timelineElement: timeline,
      scrollElement: scrollContainer,
      startClientX: event.clientX,
      startClientY: event.clientY,
    };
    this.seekFromTimelineElement(event.clientX, timeline);
    this.bindPointerListeners();
  }

  protected startRenderRangeDrag(edge: TimelineTrimEdge, event: PointerEvent): void {
    const timeline = (event.currentTarget as HTMLElement).closest(
      '.ngs-motion-studio__timeline-grid',
    ) as HTMLElement | null;

    if (!timeline) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.renderExportRangeMode.set('custom');
    this._interactionMoved = false;
    this._interaction = {
      type: 'render-range',
      edge,
      timelineElement: timeline,
      startClientX: event.clientX,
      startClientY: event.clientY,
    };
    this.continueRenderRangeInteraction(this._interaction, event);
    this.bindPointerListeners();
  }

  protected setRenderRangeInToPlayhead(event?: Event): void {
    event?.stopPropagation();
    const frame = this.timeToFrame(this.currentTime());

    this.renderExportRangeMode.set('custom');
    this.renderExportFromFrame.set(frame);
    this.renderExportJob.set(null);
  }

  protected setRenderRangeOutToPlayhead(event?: Event): void {
    event?.stopPropagation();
    const frame = this.timeToFrame(this.currentTime());

    this.renderExportRangeMode.set('custom');
    this.renderExportToFrame.set(frame);
    this.renderExportJob.set(null);
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
    this._interactionMoved = false;
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

  protected toggleShowOnlySelectedScene(event: CheckboxChange): void {
    this.showOnlySelectedScene.set(event.checked);

    const scene = this.selectedScene();

    if (event.checked && scene) {
      this.seek(scene.start);
    }
  }

  protected toggleSafeAreaVisible(event: CheckboxChange): void {
    this.safeAreaVisible.set(event.checked);
  }

  protected toggleLayerStatusVisible(event: CheckboxChange): void {
    this.layerStatusVisible.set(event.checked);
  }

  protected setAssetFilter(event: SelectChange): void {
    this.assetFilter.set(normalizeAssetFilter(event.value));
  }

  protected setAssetViewMode(value: string): void {
    this.assetViewMode.set(value === 'list' ? 'list' : 'grid');
  }

  protected compositionBackground(): string {
    return this.draft().composition.background ?? 'transparent';
  }

  protected compositionBackgroundEffectType(): string | null {
    return normalizeBackgroundEffectType(this.draft().composition.backgroundEffect);
  }

  protected solidBackgroundColor(): string {
    const background = this.compositionBackground().trim();

    return isSolidCssColor(background) ? background : '#111827';
  }

  protected setCompositionBackground(value: unknown): void {
    this.updateCompositionBackground(coerceBackgroundString(value), 'Changed background');
  }

  protected setBackgroundColor(value: unknown): void {
    this.updateCompositionBackground(coerceBackgroundString(value) || 'transparent', 'Changed background color');
  }

  protected setBackgroundGradientColor(edge: 'from' | 'to', value: unknown): void {
    const color = coerceBackgroundString(value);

    if (edge === 'from') {
      this.backgroundGradientFrom.set(color);
    } else {
      this.backgroundGradientTo.set(color);
    }

    this.applyCustomBackgroundGradient();
  }

  protected setBackgroundGradientDirection(event: SelectChange): void {
    const direction = coerceBackgroundString(event.value) || '135deg';
    this.backgroundGradientDirection.set(direction);
    this.applyCustomBackgroundGradient();
  }

  protected applyBackgroundPreset(preset: MotionBackgroundPreset): void {
    this.updateCompositionBackground(
      preset.value,
      `Applied ${preset.label} background`,
      preset.effect ?? null,
    );
  }

  protected generateBackground(): void {
    const palette =
      GENERATED_BACKGROUND_PALETTES[
        Math.floor(Math.random() * GENERATED_BACKGROUND_PALETTES.length)
      ];
    const direction =
      this.backgroundGradientDirections[
        Math.floor(Math.random() * this.backgroundGradientDirections.length)
      ]?.value ?? '135deg';
    const background = createGeneratedBackground(palette, direction);

    this.backgroundGradientFrom.set(palette[0]);
    this.backgroundGradientTo.set(palette[palette.length - 1]);
    this.backgroundGradientDirection.set(direction);
    this.updateCompositionBackground(background, 'Generated background');
  }

  protected setBackgroundImageAsset(event: SelectChange): void {
    const asset = this.imageAssets().find((item) => item.id === event.value);

    if (!asset?.src) {
      return;
    }

    this.updateCompositionBackground(
      createImageBackgroundValue(asset.src, this.backgroundImageFit()),
      'Changed background image',
    );
  }

  protected setBackgroundImageFit(event: SelectChange): void {
    this.backgroundImageFit.set(normalizeBackgroundImageFit(event.value));
  }

  protected clearCompositionBackground(): void {
    this.updateCompositionBackground('transparent', 'Cleared background');
  }

  protected setGridSize(value: unknown): void {
    this.setEditorSettings({ gridSize: Math.max(4, coerceNumber(value)) });
  }

  protected setPreviewScalePercent(value: unknown): void {
    this.setPreviewScale(coerceNumber(value) / 100);
  }

  protected handlePreviewWheel(event: WheelEvent): void {
    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

    event.preventDefault();

    const direction = event.deltaY < 0 ? 1 : -1;
    const step = Math.max(0.01, Math.abs(this.previewScaleStep()));

    this.setPreviewScale(this.previewScale() + direction * step);
  }

  protected setTimelineZoom(value: string): void {
    const mode = normalizeTimelineZoomMode(value);

    this.setEditorSettings({ zoom: mode === 'fit' ? 0 : Number(mode) });
  }

  protected handleTimelineWheel(event: WheelEvent): void {
    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

    event.preventDefault();
    const modes: TimelineZoomMode[] = ['fit', '1', '2', '4'];
    const currentIndex = Math.max(0, modes.indexOf(this.timelineZoomMode()));
    const direction = event.deltaY < 0 ? 1 : -1;
    const nextIndex = Math.max(0, Math.min(modes.length - 1, currentIndex + direction));

    this.setTimelineZoom(modes[nextIndex]);
  }

  protected selectLayerContext(layer: MotionLayer, event?: Event): void {
    event?.stopPropagation();

    if (!this.isLayerSelected(layer)) {
      this.selectLayer(layer);
    }
  }

  protected selectSceneContext(scene: MotionScene, event?: Event): void {
    event?.stopPropagation();

    if (!this.isSceneSelected(scene)) {
      this.selectScene(scene);
    }
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

  private transitionTrackSegments(
    start: number,
    duration: number,
    transitionIn: MotionTransition | undefined,
    transitionOut: MotionTransition | undefined,
  ): TimelineTransitionSegment[] {
    const timelineDuration = Math.max(1, this.duration());
    const segments: TimelineTransitionSegment[] = [];

    if (transitionIn) {
      segments.push({
        id: 'in',
        edge: 'in',
        left: (start / timelineDuration) * 100,
        width: (Math.min(duration, transitionIn.duration) / timelineDuration) * 100,
        label: this.transitionTrackLabel(transitionIn),
      });
    }

    if (transitionOut) {
      const transitionDuration = Math.min(duration, transitionOut.duration);

      segments.push({
        id: 'out',
        edge: 'out',
        left: ((start + duration - transitionDuration) / timelineDuration) * 100,
        width: (transitionDuration / timelineDuration) * 100,
        label: this.transitionTrackLabel(transitionOut),
      });
    }

    return segments;
  }

  protected layerLeft(entry: CanvasLayerEntry): number {
    return (entry.layout.x / this.draft().composition.width) * 100;
  }

  protected layerTop(entry: CanvasLayerEntry): number {
    return (entry.layout.y / this.draft().composition.height) * 100;
  }

  protected layerWidth(entry: CanvasLayerEntry): number {
    return (entry.layout.width / this.draft().composition.width) * 100;
  }

  protected layerHeight(entry: CanvasLayerEntry): number | null {
    if (entry.layer.type === 'text' && !this.isUnbrokenTextLayer(entry.layer)) {
      return null;
    }

    return (entry.layout.height / this.draft().composition.height) * 100;
  }

  protected layerOverlayTransform(entry: CanvasLayerEntry): string {
    const snapshot = resolveMotionLayerSnapshot(entry.layer, this.currentTime());
    const sceneEffect = this.layerSceneEffect(entry.layer);

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

    const text = this.layerText(layer);

    return text.length > 0 && !/\s/.test(text);
  }

  protected isSingleLineTextLayer(layer: MotionLayer): boolean {
    return this.isUnbrokenTextLayer(layer);
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

  protected startCanvasBoxSelect(event: PointerEvent): void {
    const target = event.target as HTMLElement | null;

    if (target?.closest('.ngs-motion-studio__canvas-layer, .ngs-motion-studio__resize-handle')) {
      return;
    }

    const currentTarget = event.currentTarget as HTMLElement;
    const stage =
      (currentTarget.closest('.ngs-motion-studio__stage-canvas') as HTMLElement | null) ??
      currentTarget.querySelector<HTMLElement>('.ngs-motion-studio__stage-canvas');

    if (!stage) {
      this.clearCanvasSelection(event);
      return;
    }

    this.finishTextEdit();
    this.playing.set(false);
    this.canvasInteractionType.set('canvas-box-select');
    this.canvasSelectionBox.set(null);
    this.clearSelectedKeyframes();
    this.selectedSceneId.set(null);
    this.selectedTransition.set(null);
    this._interactionMoved = false;
    this._interaction = {
      type: 'canvas-box-select',
      stageElement: stage,
      startClientX: event.clientX,
      startClientY: event.clientY,
      additive: event.shiftKey || event.metaKey || event.ctrlKey,
      startLayerIds: this.selectedLayerIds(),
      hasMoved: false,
    };
    this.bindPointerListeners();
    event.preventDefault();
    event.stopPropagation();
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

    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      this.selectLayer(layer, event);
      this._suppressNextTimelineClick = true;
      event.preventDefault();
      return;
    }

    if (!this.isLayerSelected(layer)) {
      this.selectLayer(layer);
    } else {
      this.selectedLayerId.set(layer.id);
      this.selectedSceneId.set(null);
      this.clearSelectedKeyframes();
    }

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

  protected startSceneTimelineMove(scene: MotionScene, event: PointerEvent): void {
    event.stopPropagation();
    this.selectScene(scene, event);
    this.startSceneTimelineInteraction(scene, event, 'move');
  }

  protected startSceneTimelineTrim(
    scene: MotionScene,
    edge: TimelineTrimEdge,
    event: PointerEvent,
  ): void {
    event.stopPropagation();
    this.selectScene(scene, event);
    this.startSceneTimelineInteraction(scene, event, edge);
  }

  protected startSceneTransitionTimelineResize(
    scene: MotionScene,
    edge: MotionTransitionEdge,
    event: PointerEvent,
  ): void {
    event.stopPropagation();
    this.selectSceneTransition(scene, edge, event);
    this.startSceneTimelineInteraction(
      scene,
      event,
      edge === 'in' ? 'transition-in' : 'transition-out',
    );
  }

  protected layerIcon(layer: MotionLayer): string {
    switch (layer.type) {
      case 'text':
        return 'fluent:text-font-24-regular';
      case 'shape':
        return 'fluent:shapes-24-regular';
      case 'image':
        return 'fluent:image-24-regular';
      case 'video':
        return 'fluent:video-24-regular';
      case 'audio':
        return 'fluent:music-note-2-24-regular';
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

  protected isAssetMissing(asset: MotionAsset): boolean {
    return (
      (asset.type === 'image' || asset.type === 'video' || asset.type === 'audio') &&
      !coerceMotionString(asset.src, '')
    );
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
    return this.mediaAssets().find((asset) => asset.id === assetId)?.src ?? '';
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

  protected exportManifestJson(): string {
    return JSON.stringify(createMotionRenderManifest(this.draft()), null, 2);
  }

  protected openExportJson(): void {
    this.jsonPanelMode.set('export');
    this.jsonDraft.set(this.exportJson());
    this.jsonIssues.set([]);
    this.jsonStatus.set('');
  }

  protected openExportJsonDrawer(drawer: Drawer): void {
    this.openExportJson();
    drawer.open();
  }

  protected openExportManifest(): void {
    this.jsonPanelMode.set('manifest');
    this.jsonDraft.set(this.exportManifestJson());
    this.jsonIssues.set(this.exportValidationIssues().map((issue) => issue.message));
    this.jsonStatus.set('');
  }

  protected openExportManifestDrawer(drawer: Drawer): void {
    this.openExportManifest();
    drawer.open();
  }

  protected openRenderExportDrawer(drawer: Drawer): void {
    this.renderExportStatus.set('');
    this.renderExportToFrame.set(this.renderExportPlan().options.toFrame);
    drawer.open();
  }

  protected setRenderExportOutput(event: SelectChange): void {
    this.renderExportOutput.set(event.value === 'frames' ? 'frames' : 'video');
    this.renderExportJob.set(null);
  }

  protected applyRenderExportPreset(event: SelectChange): void {
    const preset = this.renderExportPresets.find((item) => item.id === event.value);

    if (!preset) {
      return;
    }

    this.selectedRenderExportPreset.set(preset.id);
    this.renderExportOutput.set(preset.output);
    this.renderExportFps.set(preset.fps);
    this.renderExportScale.set(preset.scale);
    this.renderExportFrameStep.set(preset.frameStep);
    this.renderExportRangeMode.set(preset.rangeMode);
    this.renderExportBatchScenes.set(false);

    if (preset.rangeMode === 'scene' && !this.selectedSceneId() && this.scenes()[0]) {
      this.selectedSceneId.set(this.scenes()[0].id);
    }

    this.renderExportJob.set(null);
  }

  protected setRenderExportRangeMode(event: SelectChange): void {
    const value = `${event.value}`;

    this.renderExportRangeMode.set(
      value === 'scene' || value === 'custom' ? value : 'document',
    );

    if (value === 'scene' && !this.selectedSceneId() && this.scenes()[0]) {
      this.selectedSceneId.set(this.scenes()[0].id);
    }

    this.renderExportJob.set(null);
  }

  protected setRenderExportScene(event: SelectChange): void {
    const scene = this.scenes().find((item) => item.id === event.value);

    if (!scene) {
      return;
    }

    this.selectedSceneId.set(scene.id);
    this.renderExportRangeMode.set('scene');
    this.renderExportJob.set(null);
  }

  protected toggleRenderExportBatchScenes(event: CheckboxChange): void {
    this.renderExportBatchScenes.set(event.checked);

    if (event.checked) {
      this.renderExportRangeMode.set('scene');
    }

    this.renderExportJob.set(null);
  }

  protected prepareSelectedSceneExport(event?: Event): void {
    event?.stopPropagation();

    const scene = this.selectedScene();

    if (!scene) {
      return;
    }

    this.selectedSceneId.set(scene.id);
    this.renderExportRangeMode.set('scene');
    this.renderExportBatchScenes.set(false);
    this.renderExportStatus.set(`${scene.name || scene.id} is selected for export.`);
    this.renderExportJob.set(null);
  }

  protected setRenderExportFps(value: number): void {
    this.renderExportFps.set(Number.isFinite(value) && value > 0 ? value : null);
    this.renderExportJob.set(null);
  }

  protected setRenderExportFromFrame(value: number): void {
    this.renderExportFromFrame.set(Math.max(0, Math.round(value || 0)));
    this.renderExportRangeMode.set('custom');
    this.renderExportJob.set(null);
  }

  protected setRenderExportToFrame(value: number): void {
    this.renderExportToFrame.set(Number.isFinite(value) ? Math.max(0, Math.round(value)) : null);
    this.renderExportRangeMode.set('custom');
    this.renderExportJob.set(null);
  }

  protected setRenderExportFrameStep(value: number): void {
    this.renderExportFrameStep.set(Math.max(1, Math.round(value || 1)));
    this.renderExportJob.set(null);
  }

  protected setRenderExportScale(value: number): void {
    this.renderExportScale.set(Math.max(0.01, roundMotionNumber(value || 1, 2)));
    this.renderExportJob.set(null);
  }

  protected clearRenderExportHistory(): void {
    this.renderExportHistory.set([]);
  }

  protected startRenderExportJob(): void {
    if (this.renderExportBatchScenes() && this.scenes().length) {
      this.startRenderExportBatchJob();
      return;
    }

    const request = this.renderExportRequest();
    this._renderBatchCancelled = false;
    const hasBlockingIssue = request.manifest.validation.some((issue) => issue.severity === 'error');

    if (hasBlockingIssue) {
      this.setRenderExportProgress(
        createMotionRenderProgress(request, 'error', 0, 'Fix blocking validation errors first.'),
      );
      this.renderExportStatus.set('Export blocked by validation errors.');
      return;
    }

    const progress = createMotionRenderProgress(
      request,
      'queued',
      0,
      'Render request is ready for the host runner.',
    );

    this.setRenderExportProgress(progress);
    this.renderRequest.emit(request);

    if (this._renderRunner) {
      this._renderHandle?.cancel();
      this._renderHandle = this._renderRunner.start(request, {
        progress: (nextProgress) => this.setRenderExportProgress(nextProgress),
        complete: (result) => {
          const completeProgress = createMotionRenderProgress(
            request,
            result.status,
            request.frames.length,
            result.videoPath
              ? `Export completed: ${result.videoPath}`
              : `Export completed: ${result.outputDir}`,
          );

          this.setRenderExportProgress(completeProgress);
          this.finishRenderExportJob(completeProgress, result.completedAt);
          this.renderExportStatus.set('Export completed.');
          this._renderHandle = null;
        },
        error: (error) => {
          const errorProgress = createMotionRenderProgress(
            request,
            'error',
            0,
            error instanceof Error ? error.message : 'Render runner failed.',
          );

          this.setRenderExportProgress(errorProgress);
          this.finishRenderExportJob(errorProgress);
          this.renderExportStatus.set('Export failed.');
          this._renderHandle = null;
        },
      });
      this.renderExportStatus.set(`Render request ${request.id} started.`);
      return;
    }

    this.renderExportStatus.set(`Render request ${request.id} emitted.`);
  }

  private startRenderExportBatchJob(): void {
    const scenes = this.scenes();
    const requests = scenes.map((scene) => this.createRenderExportSceneRequest(scene));
    const hasBlockingIssue = requests.some((request) =>
      request.manifest.validation.some((issue) => issue.severity === 'error'),
    );

    if (hasBlockingIssue) {
      const request = requests[0] ?? this.renderExportRequest();
      this.setRenderExportProgress(
        createMotionRenderProgress(request, 'error', 0, 'Fix blocking validation errors first.'),
      );
      this.renderExportStatus.set('Batch export blocked by validation errors.');
      return;
    }

    if (!this._renderRunner) {
      for (const request of requests) {
        this.setRenderExportProgress(
          createMotionRenderProgress(request, 'queued', 0, 'Batch scene request emitted.'),
        );
        this.renderRequest.emit(request);
      }

      this.renderExportStatus.set(`${requests.length} scene render requests emitted.`);
      return;
    }

    let index = 0;
    this._renderBatchCancelled = false;
    const runNext = () => {
      if (this._renderBatchCancelled) {
        this._renderHandle = null;
        this.renderExportStatus.set('Batch export cancelled.');
        return;
      }

      const request = requests[index];

      if (!request) {
        this._renderHandle = null;
        this.renderExportStatus.set('Batch export completed.');
        return;
      }

      this.renderRequest.emit(request);
      this.setRenderExportProgress(
        createMotionRenderProgress(
          request,
          'queued',
          0,
          `Scene ${index + 1} of ${requests.length} queued.`,
        ),
      );
      this._renderHandle = this._renderRunner!.start(request, {
        progress: (nextProgress) => this.setRenderExportProgress(nextProgress),
        complete: (result) => {
          const progress = createMotionRenderProgress(
            request,
            result.status,
            request.frames.length,
            result.videoPath
              ? `Scene ${index + 1} exported: ${result.videoPath}`
              : `Scene ${index + 1} exported: ${result.outputDir}`,
          );

          this.setRenderExportProgress(progress);
          this.finishRenderExportJob(progress, result.completedAt);

          if (result.status === 'cancelled') {
            this._renderHandle = null;
            this.renderExportStatus.set('Batch export cancelled.');
            return;
          }

          index += 1;
          runNext();
        },
        error: (error) => {
          const progress = createMotionRenderProgress(
            request,
            'error',
            0,
            error instanceof Error ? error.message : 'Render runner failed.',
          );

          this.setRenderExportProgress(progress);
          this.finishRenderExportJob(progress);
          this._renderHandle = null;
          this.renderExportStatus.set('Batch export failed.');
        },
      });
    };

    this._renderHandle?.cancel();
    this.renderExportStatus.set(`${requests.length} scene export jobs started.`);
    runNext();
  }

  private createRenderExportSceneRequest(scene: MotionScene): MotionRenderRequest {
    const fps = Math.max(1, this.renderExportFps() ?? this.draft().composition.fps);
    const range = resolveMotionRenderRange(this.draft(), {
      mode: 'scene',
      sceneId: scene.id,
      fps,
    });

    return createMotionRenderRequest(this.draft(), {
      fps,
      rangeMode: 'scene',
      sceneId: scene.id,
      fromFrame: range.fromFrame,
      toFrame: range.toFrame,
      frameStep: this.renderExportFrameStep(),
      output: this.renderExportOutput(),
      format: this.renderExportOutput() === 'video' ? 'mp4' : 'png',
      scale: this.renderExportScale(),
    });
  }

  protected cancelRenderExportJob(): void {
    const job = this.renderExportJob();

    if (!job) {
      return;
    }

    const progress = {
      ...job,
      status: 'cancelled',
      message: 'Render request cancelled in Studio.',
    } satisfies MotionRenderProgress;

    this.setRenderExportProgress(progress);
    this.finishRenderExportJob(progress);
    this._renderBatchCancelled = true;
    this._renderHandle?.cancel();
    this._renderHandle = null;
    this.renderExportStatus.set('Render request cancelled.');
  }

  private setRenderExportProgress(progress: MotionRenderProgress): void {
    this.renderExportJob.set(progress);
    this.renderExportQueue.update((queue) => {
      const nextQueue = queue.filter((item) => item.requestId !== progress.requestId);

      if (!isTerminalRenderStatus(progress.status)) {
        nextQueue.unshift(progress);
      }

      return nextQueue.slice(0, 5);
    });
  }

  private finishRenderExportJob(
    progress: MotionRenderProgress,
    completedAt = new Date().toISOString(),
  ): void {
    this.renderExportHistory.update((history) => [
      {
        ...progress,
        completedAt,
        output: this.renderExportOutput(),
        frames: this.renderExportPlan().frames.length,
      },
      ...history.filter((item) => item.requestId !== progress.requestId),
    ].slice(0, 8));
  }

  protected async copyRenderExportCommand(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      this.renderExportStatus.set('Clipboard is not available in this environment.');
      return;
    }

    await navigator.clipboard.writeText(this.renderExportCommand());
    this.renderExportStatus.set('Render command copied.');
  }

  protected downloadRenderDocument(): void {
    if (
      typeof document === 'undefined' ||
      typeof URL === 'undefined' ||
      typeof Blob === 'undefined'
    ) {
      this.renderExportStatus.set('Download is not available in this environment.');
      return;
    }

    const payload = JSON.stringify(
      createMotionRenderDocument(this.draft(), {
        fps: this.renderExportPlan().options.fps,
        stripEditor: true,
      }),
      null,
      2,
    );
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `motion-render-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.renderExportStatus.set('Render document download started.');
  }

  protected openImportJson(): void {
    this.jsonPanelMode.set('import');
    this.jsonDraft.set(this.exportJson());
    this.jsonIssues.set([]);
    this.jsonStatus.set('');
  }

  protected openImportJsonDrawer(drawer: Drawer): void {
    this.openImportJson();
    drawer.open();
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

    const payload =
      this.jsonPanelMode() === 'export'
        ? this.exportJson()
        : this.jsonPanelMode() === 'manifest'
          ? this.exportManifestJson()
          : this.jsonDraft();
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const kind = this.jsonPanelMode() === 'manifest' ? 'manifest' : 'motion';
    anchor.download = `${kind}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
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

  protected clearStoredDraft(event?: Event): void {
    event?.stopPropagation();
    const key = this.localStorageKey();

    if (!key || typeof localStorage === 'undefined') {
      this.jsonStatus.set('Local draft storage is not enabled.');
      return;
    }

    localStorage.removeItem(key);
    this.jsonStatus.set('Local draft cleared.');
  }

  private addLayer(type: MotionLayerType): void {
    if (type === 'audio') {
      const layer: MotionLayer = {
        id: createMotionLayerId('audio'),
        type: 'audio',
        name: 'Audio layer',
        start: this.currentTime(),
        duration: 3000,
        zIndex: 0,
        layout: {
          x: 0,
          y: 0,
          width: 1,
          height: 1,
        },
        props: {
          offset: 0,
          volume: 1,
        },
      };

      this.updateDocument((document) => {
        document.layers.push(layer);
        document.tracks = ensureLayerInTrack(document.tracks, layer.id);
        this.selectedLayerId.set(layer.id);
        this.selectedLayerIds.set([layer.id]);
        this.selectedKeyframe.set(null);
      });
      return;
    }

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

  private insertSceneTemplate(preset: MotionPreset): void {
    const selectedSceneId = this.selectedSceneId();
    const sceneId = createMotionLayerId('scene');

    this.updateDocument((document) => {
      const scenes = [...(document.scenes ?? [])].sort((a, b) => a.start - b.start);
      const selectedIndex = scenes.findIndex((scene) => scene.id === selectedSceneId);
      const insertIndex = selectedIndex >= 0 ? selectedIndex + 1 : scenes.length;
      const scene = createMotionSceneFromPreset(preset, sceneId);

      scenes.splice(insertIndex, 0, scene);
      document.scenes = normalizeSceneSequence(scenes);

      const insertedScene = document.scenes.find((item) => item.id === sceneId);

      if (!insertedScene) {
        return;
      }

      const topZIndex = Math.max(
        0,
        ...flattenMotionLayers(document.layers).map((item) => item.layer.zIndex ?? 0),
      );
      const layers = createSceneTemplateLayers(preset, insertedScene.start, topZIndex);

      insertedScene.layerIds = layers.map((layer) => layer.id);
      document.layers.push(...layers);
      for (const layer of layers) {
        document.tracks = ensureLayerInTrack(document.tracks, layer.id);
      }
      document.composition.duration = Math.max(
        document.composition.duration,
        readSceneSequenceDuration(document.scenes),
      );
      this.selectedSceneId.set(insertedScene.id);
      this.selectedLayerId.set(null);
      this.selectedLayerIds.set([]);
      this.selectedKeyframe.set(null);
      this.seek(insertedScene.start);
    });
  }

  private applySceneTemplate(scene: MotionScene, preset: MotionPreset): void {
    this.updateDocument((document) => {
      const targetScene = document.scenes?.find((item) => item.id === scene.id);

      if (!targetScene) {
        return;
      }

      const removedLayerIds = targetScene.layerIds ?? [];
      const topZIndex = Math.max(
        0,
        ...flattenMotionLayers(document.layers).map((item) => item.layer.zIndex ?? 0),
      );
      const layers = createSceneTemplateLayers(preset, targetScene.start, topZIndex);
      const templateScene = createMotionSceneFromPreset(preset, targetScene.id);

      document.layers = removeMotionLayers(document.layers, removedLayerIds);
      document.tracks = document.tracks?.map((track) => ({
        ...track,
        layerIds: track.layerIds?.filter((layerId) => !removedLayerIds.includes(layerId)),
      }));
      document.layers.push(...layers);
      for (const layer of layers) {
        document.tracks = ensureLayerInTrack(document.tracks, layer.id);
      }

      targetScene.name = templateScene.name;
      targetScene.duration = templateScene.duration;
      targetScene.layerIds = layers.map((layer) => layer.id);
      targetScene.transitionIn = cloneMotionTransition(templateScene.transitionIn);
      targetScene.transitionOut = cloneMotionTransition(templateScene.transitionOut);
      document.scenes = normalizeSceneSequence(document.scenes ?? []);
      document.composition.duration = Math.max(
        document.composition.duration,
        readSceneSequenceDuration(document.scenes),
      );
      this.selectedSceneId.set(targetScene.id);
      this.selectedLayerId.set(null);
      this.selectedLayerIds.set([]);
      this.selectedKeyframe.set(null);
      this.seek(targetScene.start);
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

  private readDraggedAsset(event: DragEvent): MotionAsset | null {
    const assetId =
      event.dataTransfer?.getData('application/x-ngs-motion-asset') ||
      event.dataTransfer?.getData('text/plain') ||
      this.draggedAssetId();

    if (!assetId) {
      return null;
    }

    const asset = this.assets().find((item) => item.id === assetId);

    return asset && isMotionTimelineAsset(asset) ? asset : null;
  }

  private applyAssetToSelectedLayer(asset: MotionAsset): void {
    this.updateSelectedLayer((layer) => {
      if (!isMotionMediaLayer(layer) && layer.type !== 'audio') {
        return;
      }

      if (asset.type === 'audio') {
        layer.type = 'audio';
        layer.name = asset.name || layer.name || 'Audio layer';
        layer.props = {
          ...(layer.props ?? {}),
          assetId: asset.id,
          src: asset.src,
          offset: layer.props?.['offset'] ?? 0,
          volume: layer.props?.['volume'] ?? 1,
        };
        return;
      }

      layer.type = asset.type === 'video' ? 'video' : 'image';
      layer.name =
        asset.name || layer.name || (asset.type === 'video' ? 'Video layer' : 'Image layer');
      layer.style = {
        ...(layer.style ?? {}),
        objectFit: layer.style?.objectFit ?? 'cover',
      };
      layer.props = {
        ...(layer.props ?? {}),
        assetId: asset.id,
        src: asset.src,
        placeholder: false,
      };
    });
  }

  private assignLayerToSelectedScene(document: MotionDocument, layerId: string): void {
    const sceneId = this.selectedSceneId();

    if (!sceneId) {
      return;
    }

    const scene = document.scenes?.find((item) => item.id === sceneId);

    if (!scene) {
      return;
    }

    const layerIds = scene.layerIds ?? [];
    scene.layerIds = layerIds.includes(layerId) ? layerIds : [...layerIds, layerId];
  }

  private createMediaLayer(
    asset: MotionAsset,
    options: MotionAssetLayerInsertOptions = {},
  ): MotionLayer {
    const composition = this.draft().composition;
    const naturalWidth = readMotionAssetNumber(asset, 'width', 960);
    const naturalHeight = readMotionAssetNumber(asset, 'height', 540);
    const maxWidth = composition.width * 0.52;
    const maxHeight = composition.height * 0.52;
    const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
    const width = Math.max(MIN_LAYER_SIZE, naturalWidth * scale);
    const height = Math.max(MIN_LAYER_SIZE, naturalHeight * scale);

    const x = options.placement
      ? options.placement.x - width / 2
      : (composition.width - width) / 2;
    const y = options.placement
      ? options.placement.y - height / 2
      : (composition.height - height) / 2;

    return {
      id: createMotionLayerId(asset.type === 'video' ? 'video' : 'image'),
      type: asset.type === 'video' ? 'video' : 'image',
      name: asset.name || (asset.type === 'video' ? 'Video layer' : 'Image layer'),
      start: options.startTime ?? this.currentTime(),
      duration: Math.min(
        Math.max(1000, readMotionAssetNumber(asset, 'duration', 4000)),
        this.duration(),
      ),
      zIndex: this.draft().layers.length + 1,
      layout: {
        x: roundMotionNumber(x, 2),
        y: roundMotionNumber(y, 2),
        width: roundMotionNumber(width, 2),
        height: roundMotionNumber(height, 2),
      },
      style: {
        objectFit: 'cover',
      },
      props: {
        assetId: asset.id,
        src: asset.src,
        placeholder: false,
      },
    };
  }

  private createAudioLayer(
    asset: MotionAsset,
    options: MotionAssetLayerInsertOptions = {},
  ): MotionLayer {
    const duration = Math.min(
      Math.max(1000, readMotionAssetNumber(asset, 'duration', 4000)),
      this.duration(),
    );

    return {
      id: createMotionLayerId('audio'),
      type: 'audio',
      name: asset.name || 'Audio layer',
      start: options.startTime ?? this.currentTime(),
      duration,
      zIndex: 0,
      layout: {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      },
      props: {
        assetId: asset.id,
        src: asset.src,
        offset: 0,
        volume: 1,
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
      this.selectedTransition.set(null);
      return;
    }

    this.selectedLayerIds.set([...selectedIds, layer.id]);
    this.selectedLayerId.set(layer.id);
    this.selectedTransition.set(null);
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
    this._interactionMoved = false;
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
    this._interactionMoved = false;
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
      layerGroup: mode === 'move' ? this.createTimelineLayerDragEntries(layer) : undefined,
      fadeIn: coerceNumber(layer.props?.['fadeIn']),
      fadeOut: coerceNumber(layer.props?.['fadeOut']),
      transitionDuration:
        mode === 'transition-in'
          ? layer.transitions?.in?.duration
          : mode === 'transition-out'
            ? layer.transitions?.out?.duration
            : undefined,
      startClientX: event.clientX,
      start: layer.start,
      duration: layer.duration,
      timelineRect: timeline.getBoundingClientRect(),
    };
    this.bindPointerListeners();
    event.preventDefault();
  }

  protected startAudioFadeTimelineResize(
    layer: MotionLayer,
    edge: MotionTransitionEdge,
    event: PointerEvent,
  ): void {
    this.startTimelineInteraction(layer, event, edge === 'in' ? 'audio-fade-in' : 'audio-fade-out');
    event.stopPropagation();
  }

  protected startLayerTransitionTimelineResize(
    layer: MotionLayer,
    edge: MotionTransitionEdge,
    event: PointerEvent,
  ): void {
    event.stopPropagation();
    this.selectLayerTransition(layer, edge, event);

    if (layer.locked) {
      return;
    }

    this.startTimelineInteraction(layer, event, edge === 'in' ? 'transition-in' : 'transition-out');
  }

  private startSceneTimelineInteraction(
    scene: MotionScene,
    event: PointerEvent,
    mode: SceneTimelineInteraction['mode'],
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
    this._interactionMoved = false;
    this._interaction = {
      type: 'scene-timeline',
      sceneId: scene.id,
      mode,
      startClientX: event.clientX,
      start: scene.start,
      duration: scene.duration,
      transitionDuration:
        mode === 'transition-in'
          ? scene.transitionIn?.duration
          : mode === 'transition-out'
            ? scene.transitionOut?.duration
            : undefined,
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

  private createTimelineLayerDragEntries(layer: MotionLayer): TimelineLayerDragEntry[] {
    const selectedIds = this.selectedLayerIds();
    const layerIds =
      selectedIds.length > 1 && selectedIds.includes(layer.id) ? selectedIds : [layer.id];

    return layerIds
      .map((layerId) => findMotionLayer(this.draft().layers, layerId))
      .filter((item): item is MotionLayer => !!item && !item.locked)
      .map((item) => ({
        layerId: item.id,
        start: item.start,
        duration: item.duration,
        lead: item.id === layer.id,
      }));
  }

  private continueInteraction(event: PointerEvent): void {
    const interaction = this._interaction;

    if (!interaction) {
      return;
    }

    this.trackInteractionMovement(interaction, event);

    if (interaction.type === 'playhead') {
      this.continuePlayheadInteraction(interaction, event);
    } else if (interaction.type === 'canvas-box-select') {
      this.continueCanvasBoxSelection(interaction, event);
    } else if (interaction.type === 'timeline-box-select') {
      this.continueTimelineBoxSelection(interaction, event);
    } else if (interaction.type === 'timeline') {
      this.continueTimelineInteraction(interaction, event);
    } else if (interaction.type === 'scene-timeline') {
      this.continueSceneTimelineInteraction(interaction, event);
    } else if (interaction.type === 'render-range') {
      this.continueRenderRangeInteraction(interaction, event);
    } else {
      this.continueCanvasInteraction(interaction, event);
    }
  }

  private trackInteractionMovement(
    interaction:
      | CanvasInteraction
      | CanvasBoxSelectionInteraction
      | TimelineInteraction
      | SceneTimelineInteraction
      | RenderRangeInteraction
      | TimelineBoxSelectionInteraction
      | PlayheadInteraction,
    event: PointerEvent,
  ): void {
    const startClientX = 'startClientX' in interaction ? interaction.startClientX : event.clientX;
    const startClientY = 'startClientY' in interaction ? interaction.startClientY : event.clientY;
    const distance = Math.hypot(event.clientX - startClientX, event.clientY - startClientY);

    if (distance >= 3) {
      this._interactionMoved = true;
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
      this.applyCanvasAlignmentGuides(next, interaction.layerId);
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
      this.alignmentGuides.set([]);
    }

    const layer = findMotionLayer(this.draft().layers, interaction.layerId);

    if (layer?.type === 'text' && !this.isUnbrokenTextLayer(layer)) {
      constrainTextLayoutToContent(
        next,
        interaction.startLayout,
        layer,
        interaction.handle ?? 'se',
        this.currentTime(),
      );
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

  private continueCanvasBoxSelection(
    interaction: CanvasBoxSelectionInteraction,
    event: PointerEvent,
  ): void {
    const distance = Math.hypot(
      event.clientX - interaction.startClientX,
      event.clientY - interaction.startClientY,
    );

    if (!interaction.hasMoved && distance < CANVAS_BOX_SELECT_THRESHOLD) {
      return;
    }

    interaction.hasMoved = true;

    const box = createCanvasSelectionBox(
      interaction.stageElement,
      this.draft().composition,
      interaction.startClientX,
      interaction.startClientY,
      event.clientX,
      event.clientY,
    );
    const selectedLayerIds = this.findLayersInCanvasSelectionBox(interaction.stageElement, box);
    const nextLayerIds = interaction.additive
      ? uniqueStrings([...interaction.startLayerIds, ...selectedLayerIds])
      : selectedLayerIds;

    this.canvasSelectionBox.set(box);
    this.applyCanvasBoxSelection(nextLayerIds);
  }

  private applyCanvasAlignmentGuides(layout: MotionLayout, layerId: string): void {
    const threshold = Math.max(4, 8 * this.previewInverseScale());
    const composition = this.draft().composition;
    const verticalGuides: Array<{ position: number; label: 'left' | 'center' | 'right' }> = [
      { position: 0, label: 'left' },
      { position: composition.width / 2, label: 'center' },
      { position: composition.width, label: 'right' },
    ];
    const horizontalGuides: Array<{ position: number; label: 'top' | 'middle' | 'bottom' }> = [
      { position: 0, label: 'top' },
      { position: composition.height / 2, label: 'middle' },
      { position: composition.height, label: 'bottom' },
    ];

    for (const item of this.timelineRows()) {
      const layer = item.layer;

      if (layer.id === layerId || layer.hidden) {
        continue;
      }

      const layerLayout = this.layerOverlayLayout(layer);

      verticalGuides.push(
        { position: layerLayout.x, label: 'left' },
        { position: layerLayout.x + layerLayout.width / 2, label: 'center' },
        { position: layerLayout.x + layerLayout.width, label: 'right' },
      );
      horizontalGuides.push(
        { position: layerLayout.y, label: 'top' },
        { position: layerLayout.y + layerLayout.height / 2, label: 'middle' },
        { position: layerLayout.y + layerLayout.height, label: 'bottom' },
      );
    }

    const targetVertical = [
      { position: layout.x, apply: (value: number) => (layout.x = value) },
      { position: layout.x + layout.width / 2, apply: (value: number) => (layout.x = value - layout.width / 2) },
      { position: layout.x + layout.width, apply: (value: number) => (layout.x = value - layout.width) },
    ];
    const targetHorizontal = [
      { position: layout.y, apply: (value: number) => (layout.y = value) },
      { position: layout.y + layout.height / 2, apply: (value: number) => (layout.y = value - layout.height / 2) },
      { position: layout.y + layout.height, apply: (value: number) => (layout.y = value - layout.height) },
    ];
    const guides: MotionAlignmentGuide[] = [];
    const verticalSnap = findNearestCanvasGuide(targetVertical, verticalGuides, threshold);
    const horizontalSnap = findNearestCanvasGuide(targetHorizontal, horizontalGuides, threshold);

    if (verticalSnap) {
      verticalSnap.target.apply(verticalSnap.guide.position);
      guides.push({
        id: `v-${roundMotionNumber(verticalSnap.guide.position, 2)}`,
        orientation: 'vertical',
        position: verticalSnap.guide.position,
      });
    }

    if (horizontalSnap) {
      horizontalSnap.target.apply(horizontalSnap.guide.position);
      guides.push({
        id: `h-${roundMotionNumber(horizontalSnap.guide.position, 2)}`,
        orientation: 'horizontal',
        position: horizontalSnap.guide.position,
      });
    }

    this.alignmentGuides.set(guides);
  }

  private layerOverlayLayout(layer: MotionLayer): MotionLayout {
    return resolveMotionLayerSnapshot(layer, this.currentTime()).layout;
  }

  private buildLayerPanelTreeNodes(
    layers: MotionLayer[],
    options: {
      filterLayer?: (layer: MotionLayer) => boolean;
      idPrefix: string;
      query: string;
      scene: MotionScene | null;
      depth?: number;
    },
  ): LayerPanelLayerTreeNode[] {
    const depth = options.depth ?? 0;

    return sortLayersForCanvas(layers).flatMap((layer) => {
      const children = this.buildLayerPanelTreeNodes(layer.children ?? [], {
        ...options,
        idPrefix: `${options.idPrefix}:layer:${layer.id}`,
        depth: depth + 1,
      });
      const matchesFilter = options.filterLayer ? options.filterLayer(layer) : true;
      const matchesQuery = !options.query || layerMatchesQuery(layer, options.query);

      if ((!matchesFilter || !matchesQuery) && !children.length) {
        return [];
      }

      return [
        {
          kind: 'layer' as const,
          id: `${options.idPrefix}:layer:${layer.id}`,
          item: {
            layer,
            depth,
          },
          scene: options.scene,
          children,
        },
      ];
    });
  }

  private expandLayerTreeNode(tree: Tree<LayerPanelTreeNode>, node: LayerPanelTreeNode): void {
    if (!node.children?.length) {
      return;
    }

    tree.expand(node);

    for (const child of node.children) {
      this.expandLayerTreeNode(tree, child);
    }
  }

  private buildCanvasLayerEntries(
    layers: MotionLayer[],
    parentEntry: CanvasLayerEntry | null = null,
    ancestors: MotionLayer[] = [],
  ): CanvasLayerEntry[] {
    return sortLayersForCanvas(layers).flatMap((layer) => {
      if (layer.type === 'audio') {
        return [];
      }

      const snapshot = resolveMotionLayerSnapshot(layer, this.currentTime());
      const parentScale = parentEntry?.layout.scale ?? 1;
      const layout: MotionLayout = parentEntry
        ? {
            ...snapshot.layout,
            x: parentEntry.layout.x + snapshot.layout.x * parentScale,
            y: parentEntry.layout.y + snapshot.layout.y * parentScale,
            width: snapshot.layout.width * parentScale,
            height: snapshot.layout.height * parentScale,
            scale: (snapshot.layout.scale ?? 1) * parentScale,
          }
        : snapshot.layout;
      const entry: CanvasLayerEntry = {
        layer,
        layout,
        selectedSceneState: this.selectedSceneLayerState([...ancestors, layer]),
        visible:
          snapshot.visible &&
          (parentEntry?.visible ?? true) &&
          this.isLayerVisibleInActiveScene(layer, ancestors),
      };
      const children = this.buildCanvasLayerEntries(layer.children ?? [], entry, [
        ...ancestors,
        layer,
      ]);

      return entry.visible ? [entry, ...children] : children;
    });
  }

  private isLayerVisibleInActiveScene(layer: MotionLayer, ancestors: MotionLayer[]): boolean {
    const scenes = this.draft().scenes ?? [];
    const layerPath = [...ancestors, layer];
    const selectedScene = this.selectedScene();

    if (this.showOnlySelectedScene() && selectedScene) {
      return layerPath.some((item) => sceneContainsLayer(selectedScene, item.id));
    }

    if (!scenes.some((scene) => layerPath.some((item) => sceneContainsLayer(scene, item.id)))) {
      return true;
    }

    return !!this.activeSceneForLayerPath(layerPath);
  }

  private selectedSceneLayerState(layerPath: MotionLayer[]): CanvasLayerSceneState {
    const scene = this.selectedScene();

    if (!scene) {
      return null;
    }

    return layerPath.some((layer) => sceneContainsLayer(scene, layer.id)) ? 'in' : 'out';
  }

  private focusLayerInPreview(layer: MotionLayer): void {
    const path = findMotionLayerPath(this.draft().layers, layer.id) ?? [layer];
    const ancestors = path.slice(0, -1);
    const snapshot = resolveMotionLayerSnapshot(layer, this.currentTime());

    if (snapshot.visible && this.isLayerVisibleInActiveScene(layer, ancestors)) {
      return;
    }

    this.seek(this.readLayerPreviewFocusTime(layer, path));
  }

  private readLayerPreviewFocusTime(layer: MotionLayer, path: MotionLayer[]): number {
    const frameDuration = this.frameDuration();
    const layerStart = layer.start;
    const layerEnd = layer.start + layer.duration;
    const scenes = this.scenes().filter((scene) =>
      path.some((item) => sceneContainsLayer(scene, item.id)),
    );

    for (const scene of scenes) {
      const sceneStart = scene.start;
      const sceneEnd = scene.start + scene.duration;
      const start = Math.max(layerStart, sceneStart);
      const end = Math.min(layerEnd, sceneEnd);

      if (start <= end) {
        return Math.min(end, start + frameDuration);
      }
    }

    return Math.min(this.duration(), Math.max(0, layerStart + frameDuration));
  }

  private activeSceneForLayer(layer: MotionLayer): MotionScene | null {
    return this.activeSceneForLayerPath([layer]);
  }

  private activeSceneForLayerPath(layerPath: MotionLayer[]): MotionScene | null {
    const time = this.currentTime();

    return (
      this.draft().scenes?.find(
        (scene) =>
          layerPath.some((layer) => sceneContainsLayer(scene, layer.id)) &&
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

  private continueRenderRangeInteraction(
    interaction: RenderRangeInteraction,
    event: PointerEvent,
  ): void {
    const time = this.snapRenderExportRangeTime(
      this.timelineRatioFromElement(event.clientX, interaction.timelineElement) * this.duration(),
    );
    const frame = this.timeToFrame(time);
    const range = this.renderExportRange();

    if (interaction.edge === 'start') {
      this.renderExportFromFrame.set(Math.min(frame, range.toFrame));
    } else {
      this.renderExportToFrame.set(Math.max(frame, range.fromFrame));
    }

    this.renderExportJob.set(null);
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
    let snapGuide: KeyframeSnapGuide | null = null;

    if (interaction.mode === 'keyframe') {
      this.continueTimelineKeyframeInteraction(interaction, delta);
      return;
    }

    if (interaction.mode === 'transition-in' || interaction.mode === 'transition-out') {
      this.updateLayer(
        interaction.layerId,
        (layer) => {
          const edge: MotionTransitionEdge = interaction.mode === 'transition-in' ? 'in' : 'out';
          const transition = layer.transitions?.[edge] ?? createDefaultTransition('fade', edge);
          const startDuration = interaction.transitionDuration ?? transition.duration;
          const desiredDuration =
            edge === 'in' ? startDuration + snappedDelta : startDuration - snappedDelta;

          layer.transitions = {
            ...(layer.transitions ?? {}),
            [edge]: {
              ...transition,
              duration: Math.max(minDuration, Math.min(layer.duration, desiredDuration)),
            },
          };
        },
        { recordHistory: false },
      );
      this.keyframeSnapGuide.set(null);
      return;
    }

    if (interaction.mode === 'audio-fade-in' || interaction.mode === 'audio-fade-out') {
      this.updateLayer(
        interaction.layerId,
        (layer) => {
          layer.props = layer.props ?? {};

          if (interaction.mode === 'audio-fade-in') {
            layer.props['fadeIn'] = Math.max(
              0,
              Math.min(interaction.duration, snapTimelineTime((interaction.fadeIn ?? 0) + delta)),
            );
            return;
          }

          layer.props['fadeOut'] = Math.max(
            0,
            Math.min(interaction.duration, snapTimelineTime((interaction.fadeOut ?? 0) - delta)),
          );
        },
        { recordHistory: false },
      );
      this.keyframeSnapGuide.set(null);
      return;
    }

    if (interaction.mode === 'move' && (interaction.layerGroup?.length ?? 0) > 1) {
      const movedLayerIds = interaction.layerGroup?.map((entry) => entry.layerId) ?? [];
      const clampedDelta = clampTimelineLayerGroupDelta(
        interaction.layerGroup ?? [],
        this.duration(),
        delta,
      );
      const leadEntry = interaction.layerGroup?.find((entry) => entry.lead);
      let nextDelta = clampedDelta;

      if (leadEntry) {
        const snapped = this.snapTimelineEdgeTime(leadEntry.start + clampedDelta, {
          ignoredLayerIds: movedLayerIds,
        });

        nextDelta = clampTimelineLayerGroupDelta(
          interaction.layerGroup ?? [],
          this.duration(),
          snapped.time - leadEntry.start,
        );
        snapGuide = snapped.guide;
      }

      this.updateDocument(
        (document) => {
          for (const entry of interaction.layerGroup ?? []) {
            const layer = findMotionLayer(document.layers, entry.layerId);

            if (!layer || layer.locked) {
              continue;
            }

            layer.start = snapTimelineTime(entry.start + nextDelta);
          }
        },
        { recordHistory: false },
      );
      this.keyframeSnapGuide.set(snapGuide);
      return;
    }

    this.updateLayer(
      interaction.layerId,
      (layer) => {
        if (interaction.mode === 'move') {
          const desiredStart = Math.max(
            0,
            Math.min(
              this.duration() - layer.duration,
              interaction.start + delta,
            ),
          );
          const snapped = this.snapTimelineEdgeTime(desiredStart, {
            ignoredLayerId: interaction.layerId,
          });

          layer.start = snapped.time;
          snapGuide = snapped.guide;
          return;
        }

        if (interaction.mode === 'start') {
          const nextStart = Math.max(
            0,
            Math.min(
              interaction.start + interaction.duration - minDuration,
              interaction.start + delta,
            ),
          );
          const snapped = this.snapTimelineEdgeTime(nextStart, {
            ignoredLayerId: interaction.layerId,
          });

          layer.start = Math.min(interaction.start + interaction.duration - minDuration, snapped.time);
          layer.duration = snapTimelineTime(interaction.start + interaction.duration - layer.start);
          snapGuide = snapped.guide;
          return;
        }

        const desiredEnd = interaction.start + interaction.duration + delta;
        const snappedEnd = this.snapTimelineEdgeTime(desiredEnd, {
          ignoredLayerId: interaction.layerId,
        });

        layer.duration = Math.max(
          minDuration,
          Math.min(
            this.duration() - interaction.start,
            snappedEnd.time - interaction.start,
          ),
        );
        snapGuide = snappedEnd.guide;
      },
      { recordHistory: false },
    );

    this.keyframeSnapGuide.set(snapGuide);
  }

  private continueSceneTimelineInteraction(
    interaction: SceneTimelineInteraction,
    event: PointerEvent,
  ): void {
    const trackWidth = Math.max(1, interaction.timelineRect.width - TIMELINE_LABEL_WIDTH);
    const delta = ((event.clientX - interaction.startClientX) / trackWidth) * this.duration();
    const snappedDelta = snapTimelineTime(delta);
    const minDuration = 100;
    let snapGuide: KeyframeSnapGuide | null = null;

    this.updateDocument(
      (document) => {
        const scene = document.scenes?.find((item) => item.id === interaction.sceneId);

        if (!scene) {
          return;
        }

        if (interaction.mode === 'transition-in' || interaction.mode === 'transition-out') {
          const edge: MotionTransitionEdge = interaction.mode === 'transition-in' ? 'in' : 'out';
          const transition =
            readMotionSceneTransition(scene, edge) ?? createDefaultTransition('fade', edge);
          const startDuration = interaction.transitionDuration ?? transition.duration;
          const desiredDuration =
            edge === 'in' ? startDuration + snappedDelta : startDuration - snappedDelta;

          setMotionSceneTransition(scene, edge, {
            ...transition,
            duration: Math.max(minDuration, Math.min(scene.duration, desiredDuration)),
          });
          return;
        }

        if (interaction.mode === 'move') {
          const desiredStart = Math.max(
            0,
            Math.min(
              Math.max(0, document.composition.duration - scene.duration),
              interaction.start + delta,
            ),
          );
          const snapped = this.snapTimelineEdgeTime(desiredStart, {
            ignoredSceneId: interaction.sceneId,
          });

          scene.start = snapped.time;
          snapGuide = snapped.guide;
          return;
        }

        if (interaction.mode === 'start') {
          const nextStart = Math.max(
            0,
            Math.min(
              interaction.start + interaction.duration - minDuration,
              interaction.start + delta,
            ),
          );
          const snapped = this.snapTimelineEdgeTime(nextStart, {
            ignoredSceneId: interaction.sceneId,
          });

          scene.start = Math.min(interaction.start + interaction.duration - minDuration, snapped.time);
          scene.duration = snapTimelineTime(
            interaction.start + interaction.duration - scene.start,
          );
          snapGuide = snapped.guide;
          return;
        }

        const desiredEnd = interaction.start + interaction.duration + delta;
        const snappedEnd = this.snapTimelineEdgeTime(desiredEnd, {
          ignoredSceneId: interaction.sceneId,
        });

        scene.duration = Math.max(
          minDuration,
          Math.min(
            Math.max(minDuration, document.composition.duration - interaction.start),
            snappedEnd.time - interaction.start,
          ),
        );
        snapGuide = snappedEnd.guide;
      },
      { recordHistory: false },
    );

    this.keyframeSnapGuide.set(snapGuide);
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

    if (interaction?.type === 'canvas-box-select') {
      this.canvasSelectionBox.set(null);

      if (!interaction.hasMoved) {
        this.finishTextEditAndClearSelection();
      }
    }

    if (interaction?.type === 'timeline-box-select') {
      this.timelineSelectionBox.set(null);
      this._suppressNextTimelineClick = interaction.hasMoved;
    }

    if (
      this._interactionMoved &&
      interaction &&
      (interaction.type === 'timeline' ||
        interaction.type === 'scene-timeline' ||
        interaction.type === 'render-range')
    ) {
      this._suppressNextTimelineClick = true;
    }

    this.commitInteractionHistory();
    this._interaction = null;
    this._interactionMoved = false;
    this.canvasInteractionType.set(null);
    this.keyframeSnapGuide.set(null);
    this.alignmentGuides.set([]);
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

  private snapRenderExportRangeTime(time: number): number {
    const frameDuration = this.frameDuration();
    const snappedTime = this.snapTimeToFrame(time);
    const threshold = Math.max(frameDuration * 1.5, KEYFRAME_SNAP_THRESHOLD);
    const targets: KeyframeSnapTarget[] = [
      { time: 0, type: 'scene-start' },
      { time: this.duration(), type: 'scene-end' },
    ];

    for (const scene of this.draft().scenes ?? []) {
      targets.push({ time: scene.start, type: 'scene-start' });
      targets.push({ time: scene.start + scene.duration, type: 'scene-end' });
    }

    for (const { layer } of flattenMotionLayers(this.draft().layers)) {
      targets.push({ time: layer.start, type: 'layer-start' });
      targets.push({ time: layer.start + layer.duration, type: 'layer-end' });

      for (const animation of layer.animations ?? []) {
        for (const keyframe of animation.keyframes) {
          targets.push({ time: layer.start + keyframe.time, type: 'keyframe' });
        }
      }
    }

    const nearest = targets.reduce<KeyframeSnapTarget | null>((closest, target) => {
      const distance = Math.abs(target.time - snappedTime);

      if (distance > threshold) {
        return closest;
      }

      if (!closest || distance < Math.abs(closest.time - snappedTime)) {
        return target;
      }

      return closest;
    }, null);

    if (!nearest) {
      this.keyframeSnapGuide.set(null);
      return snappedTime;
    }

    const nextTime = this.snapTimeToFrame(nearest.time);

    this.keyframeSnapGuide.set({
      absoluteTime: nextTime,
      type: nearest.type,
      label: this.formatKeyframeSnapTarget(nearest),
    });

    return nextTime;
  }

  private snapTimelineEdgeTime(
    time: number,
    options: { ignoredLayerId?: string; ignoredLayerIds?: string[]; ignoredSceneId?: string } = {},
  ): { time: number; guide: KeyframeSnapGuide | null } {
    const snappedTime = this.snapTimeToFrame(time);
    const frameDuration = this.frameDuration();
    const threshold = Math.max(frameDuration * 1.5, KEYFRAME_SNAP_THRESHOLD);
    const targets: KeyframeSnapTarget[] = [
      { time: 0, type: 'scene-start' },
      { time: this.duration(), type: 'scene-end' },
      { time: this.currentTime(), type: 'playhead' },
    ];

    for (const scene of this.draft().scenes ?? []) {
      if (scene.id === options.ignoredSceneId) {
        continue;
      }

      targets.push({ time: scene.start, type: 'scene-start' });
      targets.push({ time: scene.start + scene.duration, type: 'scene-end' });
    }

    const ignoredLayerIds = new Set([
      ...(options.ignoredLayerIds ?? []),
      ...(options.ignoredLayerId ? [options.ignoredLayerId] : []),
    ]);

    for (const { layer } of flattenMotionLayers(this.draft().layers)) {
      if (ignoredLayerIds.has(layer.id)) {
        continue;
      }

      targets.push({ time: layer.start, type: 'layer-start' });
      targets.push({ time: layer.start + layer.duration, type: 'layer-end' });
    }

    const nearest = targets.reduce<KeyframeSnapTarget | null>((closest, target) => {
      const distance = Math.abs(target.time - snappedTime);

      if (distance > threshold) {
        return closest;
      }

      return !closest || distance < Math.abs(closest.time - snappedTime) ? target : closest;
    }, null);

    if (!nearest) {
      return { time: snappedTime, guide: null };
    }

    const nextTime = this.snapTimeToFrame(nearest.time);

    return {
      time: nextTime,
      guide: {
        absoluteTime: nextTime,
        label: this.formatKeyframeSnapTarget(nearest),
        type: nearest.type,
      },
    };
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

  private timeToFrame(time: number): number {
    return Math.max(0, Math.round(this.snapTimeToFrame(time) / this.frameDuration()));
  }

  private setPreviewScale(scale: number): void {
    const bounds = this.previewScaleBounds();
    const nextScale = clampMotionPreviewScale(scale, bounds.min, bounds.max);

    this.setEditorSettings({ previewScale: nextScale }, { recordHistory: false });
  }

  private fitPreviewToViewport(): void {
    const fittedScale = readMotionPreviewFitScale(this.previewViewportSize(), this.draft().composition);

    this.setPreviewScale(fittedScale);
  }

  private resolvePreviewScale(settings: MotionEditorSettings | undefined): number {
    const bounds = this.previewScaleBounds();
    const initialScale = this.initialPreviewScale();

    if (hasExplicitMotionPreviewScale(settings)) {
      return clampMotionPreviewScale(settings.previewScale, bounds.min, bounds.max);
    }

    if (hasExplicitMotionPreviewScaleInput(initialScale)) {
      return clampMotionPreviewScale(initialScale, bounds.min, bounds.max);
    }

    const viewport = this.previewViewportSize();
    const composition = this.draft().composition;
    const fittedScale = readMotionPreviewFitScale(viewport, composition);

    return clampMotionPreviewScale(fittedScale, bounds.min, bounds.max);
  }

  private setEditorSettings(
    settings: MotionEditorSettings,
    options: MotionDocumentUpdateOptions = {},
  ): void {
    const nextSettings = {
      ...(this.draft().editor ?? {}),
      ...settings,
    };

    this.syncEditorSettings(nextSettings);
    this.updateDocument((document) => {
      document.editor = nextSettings;
    }, options);
  }

  private syncEditorSettings(settings: MotionEditorSettings | undefined): void {
    this.gridVisible.set(settings?.gridVisible ?? true);
    this.snapToGrid.set(settings?.snapToGrid ?? false);
    this.gridSize.set(Math.max(4, settings?.gridSize ?? 80));
    this.timelineZoomMode.set(readTimelineZoomMode(settings?.zoom));
    this.previewScale.set(this.resolvePreviewScale(settings));
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

  private moveSceneBefore(sceneId: string, targetSceneId: string): void {
    this.updateDocument((document) => {
      const orderedScenes = this.scenes();
      const sceneIndex = orderedScenes.findIndex((scene) => scene.id === sceneId);
      const targetIndex = orderedScenes.findIndex((scene) => scene.id === targetSceneId);

      if (sceneIndex < 0 || targetIndex < 0 || sceneIndex === targetIndex) {
        return;
      }

      const [scene] = orderedScenes.splice(sceneIndex, 1);
      const nextTargetIndex = orderedScenes.findIndex((item) => item.id === targetSceneId);
      const insertIndex = sceneIndex < targetIndex ? nextTargetIndex + 1 : nextTargetIndex;

      orderedScenes.splice(Math.max(0, insertIndex), 0, scene);
      document.scenes = normalizeSceneSequence(orderedScenes);
      document.composition.duration = Math.max(
        document.composition.duration,
        readSceneSequenceDuration(document.scenes),
      );
      this.selectedSceneId.set(sceneId);
      this.selectedLayerId.set(null);
      this.selectedLayerIds.set([]);
      this.selectedKeyframe.set(null);
    });
  }

  private startScenePlayback(scene: MotionScene): void {
    const start = scene.start;
    const end = scene.start + scene.duration;
    const currentTime = this.currentTime();

    this.playbackRange.set({ start, end });

    if (currentTime < start || currentTime >= end) {
      this.seek(start);
    }

    this.playing.set(true);
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

  private readSelectedTransitionDetails(ref: SelectedTransitionRef): SelectedTransitionDetails | null {
    if (ref.kind === 'layer') {
      const layer = findMotionLayer(this.draft().layers, ref.targetId);
      const transition = layer?.transitions?.[ref.edge];

      if (!layer || !transition) {
        return null;
      }

      return {
        ...ref,
        title: `${layer.name || layer.id} ${ref.edge}`,
        targetName: layer.name || layer.id,
        transition,
        maxDuration: layer.duration,
      };
    }

    const scene = this.draft().scenes?.find((item) => item.id === ref.targetId);
    const transition = scene ? readMotionSceneTransition(scene, ref.edge) : undefined;

    if (!scene || !transition) {
      return null;
    }

    return {
      ...ref,
      title: `${scene.name || scene.id} ${ref.edge}`,
      targetName: scene.name || scene.id,
      transition,
      maxDuration: scene.duration,
    };
  }

  private updateSelectedTransition(
    mutator: (
      transition: MotionTransition,
      edge: MotionTransitionEdge,
      ref: SelectedTransitionRef,
    ) => MotionTransition,
  ): void {
    const selected = this.selectedTransition();

    if (!selected) {
      return;
    }

    if (selected.kind === 'layer') {
      this.updateLayer(selected.targetId, (layer) => {
        const transition =
          layer.transitions?.[selected.edge] ?? createDefaultTransition('fade', selected.edge);

        setMotionLayerTransition(layer, selected.edge, mutator(transition, selected.edge, selected));
      });
      return;
    }

    this.updateDocument((document) => {
      const scene = document.scenes?.find((item) => item.id === selected.targetId);

      if (!scene) {
        return;
      }

      const transition =
        readMotionSceneTransition(scene, selected.edge) ??
        createDefaultTransition('fade', selected.edge);

      setMotionSceneTransition(scene, selected.edge, mutator(transition, selected.edge, selected));
    });
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

  private applyCanvasBoxSelection(layerIds: string[]): void {
    this.clearSelectedKeyframes();
    this.selectedSceneId.set(null);
    this.selectedTransition.set(null);

    if (!layerIds.length) {
      this.selectedLayerId.set(null);
      this.selectedLayerIds.set([]);
      return;
    }

    this.selectedLayerIds.set(layerIds);
    this.selectedLayerId.set(layerIds[layerIds.length - 1]);
  }

  private findLayersInCanvasSelectionBox(
    stage: HTMLElement,
    box: MotionCanvasSelectionBox,
  ): string[] {
    const selectionRect = createCanvasSelectionViewportRect(stage, this.draft().composition, box);
    const elements = Array.from(
      stage.querySelectorAll<HTMLElement>('.ngs-motion-studio__canvas-layer'),
    );

    return uniqueStrings(
      elements
        .filter((element) => intersectsViewportRect(element.getBoundingClientRect(), selectionRect))
        .map((element) => element.dataset['motionLayerId'] ?? '')
        .filter(Boolean),
    );
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

  private applyCustomBackgroundGradient(): void {
    const from = this.backgroundGradientFrom() || '#0f172a';
    const to = this.backgroundGradientTo() || '#38bdf8';
    const direction = this.backgroundGradientDirection();
    const background =
      direction === 'radial'
        ? `radial-gradient(circle at 50% 35%, ${from} 0%, ${to} 100%)`
        : `linear-gradient(${direction}, ${from} 0%, ${to} 100%)`;

    this.updateCompositionBackground(background, 'Changed background gradient');
  }

  private updateCompositionBackground(
    value: string,
    historyLabel: string,
    effect: MotionBackgroundEffect | null = null,
  ): void {
    this.updateDocument(
      (document) => {
        document.composition = {
          ...document.composition,
          background: value || 'transparent',
        };

        if (effect) {
          document.composition.backgroundEffect = { ...effect };
        } else {
          delete document.composition.backgroundEffect;
        }
      },
      { historyLabel },
    );
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
      const pushed = this.pushUndoSnapshot(previous);

      if (pushed) {
        this.pushActionHistory(options.historyLabel ?? inferMotionHistoryLabel(previous, next));
        this.redoStack.set([]);
        this.redoActionHistory.set([]);
      }
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

    const selectedTransition = this.selectedTransition();

    if (selectedTransition && !this.readSelectedTransitionDetails(selectedTransition)) {
      this.selectedTransition.set(null);
    }

    if (this.currentTime() > document.composition.duration) {
      this.currentTime.set(document.composition.duration);
    }
  }

  private applyDocument(document: MotionDocument): void {
    const next = cloneMotionDocument(document);
    this.syncDraftDocument(next);
    this._lastEmittedDocumentSignature = serializeMotionDocument(next);
    this.persistDraftDocument(next);
    this.documentChange.emit(next);
  }

  private readInitialDraftDocument(fallback: MotionDocument): MotionDocument {
    if (this._hasLoadedStoredDraft) {
      return fallback;
    }

    this._hasLoadedStoredDraft = true;
    const key = this.localStorageKey();

    if (!key || typeof localStorage === 'undefined') {
      return fallback;
    }

    try {
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : null;

      return isMotionDocumentShape(parsed) ? cloneMotionDocument(parsed) : fallback;
    } catch {
      return fallback;
    }
  }

  private persistDraftDocument(document: MotionDocument): void {
    const key = this.localStorageKey();

    if (!key || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(key, serializeMotionDocument(document));
    } catch {
      this.jsonStatus.set('Local draft could not be saved.');
    }
  }

  private restoreHistoryDocument(document: MotionDocument): void {
    this.applyDocument(document);
  }

  private pushUndoSnapshot(document: MotionDocument): boolean {
    let pushed = false;

    this.undoStack.update((stack) => {
      const previous = stack[stack.length - 1];

      if (previous && serializeMotionDocument(previous) === serializeMotionDocument(document)) {
        return stack;
      }

      pushed = true;
      return [...stack, cloneMotionDocument(document)].slice(-MOTION_HISTORY_LIMIT);
    });

    return pushed;
  }

  private pushActionHistory(label: string): void {
    this.actionHistory.update((history) =>
      [
        ...history,
        {
          id: createMotionLayerId('history'),
          label,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
      ].slice(-MOTION_HISTORY_LIMIT),
    );
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

    if (this.pushUndoSnapshot(snapshot)) {
      this.pushActionHistory(readInteractionHistoryLabel(this._interaction));
      this.redoStack.set([]);
      this.redoActionHistory.set([]);
    }
  }
}

const inferMotionHistoryLabel = (previous: MotionDocument, next: MotionDocument): string => {
  const previousLayerCount = flattenMotionLayers(previous.layers).length;
  const nextLayerCount = flattenMotionLayers(next.layers).length;

  if (nextLayerCount > previousLayerCount) {
    return nextLayerCount - previousLayerCount === 1 ? 'Added layer' : 'Added layers';
  }

  if (nextLayerCount < previousLayerCount) {
    return previousLayerCount - nextLayerCount === 1 ? 'Removed layer' : 'Removed layers';
  }

  const previousSceneCount = previous.scenes?.length ?? 0;
  const nextSceneCount = next.scenes?.length ?? 0;

  if (nextSceneCount > previousSceneCount) {
    return 'Added scene';
  }

  if (nextSceneCount < previousSceneCount) {
    return 'Removed scene';
  }

  if (countMotionTransitions(next) !== countMotionTransitions(previous)) {
    return 'Changed transitions';
  }

  if (countMotionAnimations(next) !== countMotionAnimations(previous)) {
    return 'Changed animations';
  }

  return 'Edited motion document';
};

const countMotionAnimations = (document: MotionDocument): number =>
  flattenMotionLayers(document.layers).reduce(
    (total, entry) => total + (entry.layer.animations?.length ?? 0),
    0,
  );

const countMotionTransitions = (document: MotionDocument): number =>
  flattenMotionLayers(document.layers).reduce(
    (total, entry) =>
      total + Number(!!entry.layer.transitions?.in) + Number(!!entry.layer.transitions?.out),
    (document.scenes ?? []).reduce(
      (sceneTotal, scene) => sceneTotal + Number(!!scene.transitionIn) + Number(!!scene.transitionOut),
      0,
    ),
  );

const readInteractionHistoryLabel = (
  interaction:
    | CanvasInteraction
    | CanvasBoxSelectionInteraction
    | TimelineInteraction
    | SceneTimelineInteraction
    | RenderRangeInteraction
    | TimelineBoxSelectionInteraction
    | PlayheadInteraction
    | null,
): string => {
  switch (interaction?.type) {
    case 'canvas-move':
      return 'Moved layer';
    case 'canvas-resize':
      return 'Resized layer';
    case 'canvas-box-select':
      return 'Selected layers';
    case 'timeline':
      return 'Edited layer timing';
    case 'scene-timeline':
      return 'Edited scene timing';
    case 'render-range':
      return 'Edited render range';
    default:
      return 'Edited motion document';
  }
};

const readLayerCollectionBounds = (layers: MotionLayer[]): MotionLayout => {
  const left = Math.min(...layers.map((layer) => layer.layout.x));
  const top = Math.min(...layers.map((layer) => layer.layout.y));
  const right = Math.max(...layers.map((layer) => layer.layout.x + layer.layout.width));
  const bottom = Math.max(...layers.map((layer) => layer.layout.y + layer.layout.height));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

const readLayerCenterX = (layer: MotionLayer): number => layer.layout.x + layer.layout.width / 2;
const readLayerCenterY = (layer: MotionLayer): number => layer.layout.y + layer.layout.height / 2;

const findNearestCanvasGuide = <TTarget extends { position: number; apply: (value: number) => void }, TGuide extends { position: number }>(
  targets: TTarget[],
  guides: TGuide[],
  threshold: number,
): { target: TTarget; guide: TGuide; distance: number } | null => {
  let nearest: { target: TTarget; guide: TGuide; distance: number } | null = null;

  for (const target of targets) {
    for (const guide of guides) {
      const distance = Math.abs(target.position - guide.position);

      if (distance <= threshold && (!nearest || distance < nearest.distance)) {
        nearest = { target, guide, distance };
      }
    }
  }

  return nearest;
};

const layerMatchesQuery = (layer: MotionLayer, query: string): boolean => {
  const haystack = [
    layer.id,
    layer.name,
    layer.type,
    coerceMotionString(layer.props?.['text'], ''),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
};

const sceneMatchesQuery = (scene: MotionScene, query: string): boolean =>
  [scene.id, scene.name].filter(Boolean).join(' ').toLowerCase().includes(query);

const findMotionLayerPath = (layers: MotionLayer[], id: string): MotionLayer[] | null => {
  for (const layer of layers) {
    if (layer.id === id) {
      return [layer];
    }

    const childPath = findMotionLayerPath(layer.children ?? [], id);

    if (childPath) {
      return [layer, ...childPath];
    }
  }

  return null;
};

const findMotionLayer = (layers: MotionLayer[], id: string): MotionLayer | null =>
  findMotionLayerPath(layers, id)?.at(-1) ?? null;

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

const GENERATED_BACKGROUND_PALETTES = [
  ['#0f172a', '#2563eb', '#38bdf8'],
  ['#064e3b', '#10b981', '#ecfdf5'],
  ['#7c2d12', '#f97316', '#ffedd5'],
  ['#312e81', '#8b5cf6', '#f5f3ff'],
  ['#164e63', '#06b6d4', '#f0fdfa'],
];

const coerceBackgroundString = (value: unknown): string => String(value ?? '').trim();

const isSolidCssColor = (value: string): boolean =>
  /^(#(?:[0-9a-f]{3,8})|rgb\(|rgba\(|hsl\(|hsla\()/.test(value.trim().toLowerCase());

const createGeneratedBackground = (palette: string[], direction: string): string => {
  if (direction === 'radial') {
    return `radial-gradient(circle at 25% 20%, ${palette[1]} 0 18%, transparent 42%), radial-gradient(circle at 78% 72%, ${palette[2]} 0 16%, transparent 38%), linear-gradient(135deg, ${palette[0]} 0%, ${palette[palette.length - 1]} 100%)`;
  }

  return `linear-gradient(${direction}, ${palette
    .map((color, index) => `${color} ${Math.round((index / Math.max(1, palette.length - 1)) * 100)}%`)
    .join(', ')})`;
};

const normalizeBackgroundImageFit = (value: unknown): MotionBackgroundImageFit => {
  const fit = coerceBackgroundString(value);

  return fit === 'contain' || fit === '100% 100%' || fit === 'auto' ? fit : 'cover';
};

const normalizeBackgroundEffectType = (effect: MotionBackgroundEffect | undefined): string | null => {
  if (effect?.type === 'aurora' || effect?.type === 'spotlight' || effect?.type === 'mesh') {
    return effect.type;
  }

  return null;
};

const createImageBackgroundValue = (src: string, fit: MotionBackgroundImageFit): string => {
  const safeSrc = src.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const repeat = fit === 'auto' ? 'repeat' : 'no-repeat';

  return `url("${safeSrc}") center / ${fit} ${repeat}`;
};

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

const createCanvasSelectionBox = (
  stage: HTMLElement,
  composition: MotionDocument['composition'],
  startClientX: number,
  startClientY: number,
  endClientX: number,
  endClientY: number,
): MotionCanvasSelectionBox => {
  const rect = stage.getBoundingClientRect();
  const scaleX = composition.width / Math.max(1, rect.width);
  const scaleY = composition.height / Math.max(1, rect.height);
  const startX = (startClientX - rect.left) * scaleX;
  const endX = (endClientX - rect.left) * scaleX;
  const startY = (startClientY - rect.top) * scaleY;
  const endY = (endClientY - rect.top) * scaleY;

  return {
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  };
};

const createCanvasSelectionViewportRect = (
  stage: HTMLElement,
  composition: MotionDocument['composition'],
  box: MotionCanvasSelectionBox,
): MotionViewportRect => {
  const rect = stage.getBoundingClientRect();
  const scaleX = rect.width / Math.max(1, composition.width);
  const scaleY = rect.height / Math.max(1, composition.height);
  const left = rect.left + box.left * scaleX;
  const top = rect.top + box.top * scaleY;

  return {
    left,
    top,
    right: left + box.width * scaleX,
    bottom: top + box.height * scaleY,
  };
};

const intersectsViewportRect = (a: DOMRect, b: MotionViewportRect): boolean =>
  a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;

const isTimelineMarkerInsideRect = (marker: HTMLElement, rect: MotionViewportRect): boolean => {
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

const clampTimelineLayerGroupDelta = (
  entries: TimelineLayerDragEntry[],
  duration: number,
  delta: number,
): number => {
  let minDelta = Number.NEGATIVE_INFINITY;
  let maxDelta = Number.POSITIVE_INFINITY;

  for (const entry of entries) {
    minDelta = Math.max(minDelta, -entry.start);
    maxDelta = Math.min(maxDelta, duration - (entry.start + entry.duration));
  }

  return snapTimelineTime(Math.max(minDelta, Math.min(maxDelta, delta)));
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

const rebaseMotionLayerForGroup = (layer: MotionLayer, bounds: MotionLayout): MotionLayer => {
  const cloned = cloneMotionLayer(layer);
  const delta = { x: -bounds.x, y: -bounds.y };

  return {
    ...cloned,
    layout: {
      ...cloned.layout,
      x: cloned.layout.x + delta.x,
      y: cloned.layout.y + delta.y,
    },
    animations: shiftMotionLayoutAnimations(cloned.animations, delta),
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

const normalizeSceneSequence = (scenes: MotionScene[]): MotionScene[] => {
  let start = 0;

  return scenes.map((scene) => {
    const duration = Math.max(100, scene.duration);
    const nextScene = {
      ...cloneMotionScene(scene),
      start,
      duration,
    };

    start += duration;

    return nextScene;
  });
};

const readSceneSequenceDuration = (scenes: MotionScene[]): number =>
  scenes.reduce((duration, scene) => Math.max(duration, scene.start + scene.duration), 0);

const createMotionSceneFromPreset = (preset: MotionPreset, sceneId: string): MotionScene => ({
  id: sceneId,
  name: preset.name,
  start: 0,
  duration: readMotionPresetSceneDuration(preset),
  layerIds: [],
  transitionIn: cloneMotionTransition(preset.scene?.transitionIn),
  transitionOut: cloneMotionTransition(preset.scene?.transitionOut),
});

const readMotionPresetSceneDuration = (preset: MotionPreset): number => {
  if (preset.scene?.duration) {
    return Math.max(100, preset.scene.duration);
  }

  if (!preset.layers.length) {
    return DEFAULT_SCENE_DURATION;
  }

  const start = Math.min(...preset.layers.map((layer) => layer.start));
  const end = Math.max(...preset.layers.map((layer) => layer.start + layer.duration));

  return Math.max(100, end - start);
};

const createSceneTemplateLayers = (
  preset: MotionPreset,
  sceneStart: number,
  topZIndex: number,
): MotionLayer[] => {
  const startOffset = preset.layers.length
    ? Math.min(...preset.layers.map((layer) => layer.start))
    : 0;

  return preset.layers.map((layer, index) => ({
    ...cloneMotionLayer(layer),
    id: createMotionLayerId(layer.id),
    name: layer.name,
    start: sceneStart + layer.start - startOffset,
    zIndex: topZIndex + index + 1,
  }));
};

const filterMotionDocumentToScene = (
  document: MotionDocument,
  scene: MotionScene,
): MotionDocument => {
  const next = cloneMotionDocument(document);

  next.layers = filterMotionLayersForScene(document.layers, scene);
  next.scenes = [cloneMotionScene(scene)];
  next.tracks = next.tracks?.map((track) => ({
    ...track,
    layerIds: track.layerIds?.filter((layerId) => !!findMotionLayer(next.layers, layerId)),
  }));

  return next;
};

const filterMotionLayersForScene = (layers: MotionLayer[], scene: MotionScene): MotionLayer[] =>
  layers.flatMap((layer) => {
    if (sceneContainsLayer(scene, layer.id)) {
      return [cloneMotionLayer(layer)];
    }

    const children = filterMotionLayersForScene(layer.children ?? [], scene);

    if (!children.length) {
      return [];
    }

    return [
      {
        ...cloneMotionLayer(layer),
        children,
      },
    ];
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
  } else if (type === 'video') {
    const metadataResult = await readVideoMetadata(src).catch(() => null);

    if (metadataResult) {
      metadata['width'] = metadataResult.width;
      metadata['height'] = metadataResult.height;
      metadata['duration'] = metadataResult.duration;
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

const readVideoMetadata = (
  src: string,
): Promise<{ width: number; height: number; duration: number }> => {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Video metadata is not available in this environment.'));
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Number.isFinite(video.duration) ? video.duration * 1000 : 0,
      });
    };
    video.onerror = () => reject(new Error('Video metadata could not be read.'));
    video.src = src;
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

const normalizeAssetFilter = (value: unknown): MotionAssetFilter => {
  if (
    value === 'image' ||
    value === 'video' ||
    value === 'audio' ||
    value === 'json' ||
    value === 'missing'
  ) {
    return value;
  }

  return 'all';
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
  !scene.layerIds || scene.layerIds.includes(layerId);

const isMotionMediaAsset = (asset: MotionAsset): boolean =>
  asset.type === 'image' || asset.type === 'video';

const isMotionTimelineAsset = (asset: MotionAsset): boolean =>
  asset.type === 'image' || asset.type === 'video' || asset.type === 'audio';

const isTerminalRenderStatus = (status: MotionRenderJobStatus): boolean =>
  status === 'done' || status === 'error' || status === 'cancelled';

const isMotionMediaLayer = (layer: MotionLayer): boolean =>
  layer.type === 'image' || layer.type === 'video';

const isMotionLayerMediaPlaceholder = (layer: MotionLayer): boolean => {
  if (!isMotionMediaLayer(layer)) {
    return false;
  }

  const hasAsset = !!coerceMotionString(layer.props?.['assetId'], '');
  const hasSource = !!coerceMotionString(layer.props?.['src'], '');

  return layer.props?.['placeholder'] === true || (!hasAsset && !hasSource);
};

const createMotionSceneValidationIssues = (
  document: MotionDocument,
): MotionSceneValidationIssue[] => {
  const scenes = document.scenes ?? [];
  const layers = flattenMotionLayers(document.layers);
  const layerIds = new Set(layers.map((item) => item.layer.id));
  const issues: MotionSceneValidationIssue[] = [];

  for (const scene of scenes) {
    if (scene.duration <= 0) {
      issues.push({
        id: `${scene.id}:duration`,
        sceneId: scene.id,
        severity: 'error',
        message: 'Scene duration must be greater than 0.',
      });
    }

    if (scene.layerIds?.length === 0) {
      issues.push({
        id: `${scene.id}:empty`,
        sceneId: scene.id,
        severity: 'warning',
        message: 'Scene has no layers.',
      });
    }

    for (const layerId of scene.layerIds ?? []) {
      if (!layerIds.has(layerId)) {
        issues.push({
          id: `${scene.id}:missing-layer:${layerId}`,
          sceneId: scene.id,
          severity: 'error',
          message: `Scene references missing layer ${layerId}.`,
        });
        continue;
      }

      const layer = layers.find((item) => item.layer.id === layerId)?.layer;

      if (layer && isMotionLayerMediaPlaceholder(layer)) {
        issues.push({
          id: `${scene.id}:placeholder:${layerId}`,
          sceneId: scene.id,
          layerId,
          severity: 'warning',
          message: `${layer.name || layer.id} needs a media asset.`,
        });
      }
    }

    for (const edge of ['in', 'out'] as const) {
      const transition = readMotionSceneTransition(scene, edge);

      if (transition && transition.duration > scene.duration) {
        issues.push({
          id: `${scene.id}:transition-${edge}`,
          sceneId: scene.id,
          severity: 'warning',
          message: `${edge === 'in' ? 'In' : 'Out'} transition is longer than the scene.`,
        });
      }
    }
  }

  if (scenes.length) {
    for (const { layer } of layers) {
      if (!scenes.some((scene) => sceneContainsLayer(scene, layer.id))) {
        issues.push({
          id: `unassigned-layer:${layer.id}`,
          layerId: layer.id,
          severity: 'info',
          message: `${layer.name || layer.id} is not assigned to any scene.`,
        });
      }
    }
  }

  return issues;
};

const removeLayerFromScene = (
  scene: MotionScene,
  layerId: string,
  allLayerIds: string[],
): void => {
  scene.layerIds = (scene.layerIds ?? allLayerIds).filter((item) => item !== layerId);
};

const readLayerSceneDropTargetId = (scene: MotionScene | null): string =>
  scene?.id ?? LAYER_SCENE_DROP_UNASSIGNED_ID;

interface MotionDocumentUpdateOptions {
  recordHistory?: boolean;
  historyLabel?: string;
}

interface MotionHistoryEntry {
  id: string;
  label: string;
  timestamp: string;
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

interface SelectedTransitionRef {
  kind: 'layer' | 'scene';
  targetId: string;
  edge: MotionTransitionEdge;
}

interface SelectedTransitionDetails extends SelectedTransitionRef {
  title: string;
  targetName: string;
  transition: MotionTransition;
  maxDuration: number;
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

interface MotionAssetLayerInsertOptions {
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

type MotionAnimationPresetCategory = 'entrance' | 'emphasis' | 'text';

type MotionAnimationApplyMode = 'append' | 'replace' | 'merge';

type MotionAnimationScope = 'active' | 'selection';

type MotionAssetFilter = 'all' | 'image' | 'video' | 'audio' | 'json' | 'missing';

type MotionAssetViewMode = 'grid' | 'list';

type MotionBackgroundImageFit = 'cover' | 'contain' | '100% 100%' | 'auto';

interface MotionBackgroundPreset {
  label: string;
  value: string;
  effect?: MotionBackgroundEffect;
}

type MotionExportPresetId =
  | 'mp4-1080'
  | 'mp4-4k'
  | 'png-sequence'
  | 'scene-preview'
  | 'social-fast';

interface MotionExportPreset {
  id: MotionExportPresetId;
  label: string;
  description: string;
  output: MotionStudioRenderOutput;
  fps: number;
  scale: number;
  frameStep: number;
  rangeMode: MotionRenderRangeMode;
}

interface MotionAnimationPresetSettings {
  duration: number;
  delay: number;
  easing: MotionEasingName;
  direction: MotionTransitionDirection;
  distance: number;
}

type TimelineZoomMode = 'fit' | '1' | '2' | '4';

type JsonPanelMode = 'export' | 'manifest' | 'import';

type MotionStudioRenderOutput = 'frames' | 'video';

interface MotionStudioRenderHistoryItem extends MotionRenderProgress {
  completedAt: string;
  output: MotionStudioRenderOutput;
  frames: number;
}

interface MotionPreviewScaleBounds {
  min: number;
  max: number;
}

interface MotionPreviewViewportSize {
  width: number;
  height: number;
}

interface MotionPlaybackRange {
  start: number;
  end: number;
}

interface MotionSceneValidationIssue {
  id: string;
  sceneId?: string;
  layerId?: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

interface CanvasLayerEntry {
  layer: MotionLayer;
  layout: MotionLayout;
  selectedSceneState: CanvasLayerSceneState;
  visible: boolean;
}

type CanvasLayerSceneState = 'in' | 'out' | null;

interface TimelineLayerRow {
  layer: MotionLayer;
  depth: number;
}

type LayerPanelTreeNode = LayerPanelGroupTreeNode | LayerPanelLayerTreeNode;

interface LayerPanelGroupRow {
  kind: 'group';
  id: string;
  label: string;
  description: string;
  icon: string;
  scene: MotionScene | null;
}

interface LayerPanelLayerRow {
  kind: 'layer';
  id: string;
  item: TimelineLayerRow;
  scene: MotionScene | null;
}

interface LayerPanelGroupTreeNode extends LayerPanelGroupRow {
  children?: LayerPanelTreeNode[];
}

interface LayerPanelLayerTreeNode extends LayerPanelLayerRow {
  children?: LayerPanelTreeNode[];
}

interface LayerSceneDragItem {
  layerId: string;
  sourceSceneId: string | null;
}

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

const readMotionPreviewScaleBounds = (
  minScale: number,
  maxScale: number,
): MotionPreviewScaleBounds => {
  const min = Number.isFinite(minScale) ? Math.max(0.01, minScale) : 0.5;
  const max = Number.isFinite(maxScale) ? Math.max(min, maxScale) : 2;

  return { min, max };
};

const clampMotionPreviewScale = (scale: number, minScale: number, maxScale: number): number => {
  const nextScale = Number.isFinite(scale) ? scale : 1;

  return Math.min(maxScale, Math.max(minScale, roundMotionNumber(nextScale, 2)));
};

const hasExplicitMotionPreviewScale = (
  settings: MotionEditorSettings | undefined,
): settings is MotionEditorSettings & { previewScale: number } =>
  Number.isFinite(settings?.previewScale);

const hasExplicitMotionPreviewScaleInput = (scale: number | null): scale is number =>
  Number.isFinite(scale);

const readMotionPreviewFitScale = (
  viewport: MotionPreviewViewportSize,
  composition: MotionDocument['composition'],
): number => {
  const widthScale = viewport.width / Math.max(1, composition.width);
  const heightScale = viewport.height / Math.max(1, composition.height);
  const fittedScale = Math.min(widthScale, heightScale);

  return Number.isFinite(fittedScale) && fittedScale > 0 ? fittedScale : 1;
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

interface TimelineTransitionSegment {
  id: MotionTransitionEdge;
  edge: MotionTransitionEdge;
  left: number;
  width: number;
  label: string;
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
type MotionAlignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
type MotionDistributionAxis = 'horizontal' | 'vertical';

interface MotionAlignmentGuide {
  id: string;
  orientation: 'vertical' | 'horizontal';
  position: number;
}

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

interface CanvasBoxSelectionInteraction {
  type: 'canvas-box-select';
  stageElement: HTMLElement;
  startClientX: number;
  startClientY: number;
  additive: boolean;
  startLayerIds: string[];
  hasMoved: boolean;
}

type TimelineTrimEdge = 'start' | 'end';

interface TimelineInteraction {
  type: 'timeline';
  layerId: string;
  mode:
    | 'move'
    | 'keyframe'
    | TimelineTrimEdge
    | 'transition-in'
    | 'transition-out'
    | 'audio-fade-in'
    | 'audio-fade-out';
  animationIndex?: number;
  keyframeIndex?: number;
  keyframeTime?: number;
  keyframeGroup?: TimelineKeyframeDragEntry[];
  layerGroup?: TimelineLayerDragEntry[];
  fadeIn?: number;
  fadeOut?: number;
  transitionDuration?: number;
  startClientX: number;
  start: number;
  duration: number;
  timelineRect: DOMRect;
}

type SceneTimelineMode = 'move' | TimelineTrimEdge | 'transition-in' | 'transition-out';

interface SceneTimelineInteraction {
  type: 'scene-timeline';
  sceneId: string;
  mode: SceneTimelineMode;
  startClientX: number;
  start: number;
  duration: number;
  transitionDuration?: number;
  timelineRect: DOMRect;
}

interface TimelineKeyframeDragEntry extends SelectedKeyframeRef {
  startTime: number;
  lead: boolean;
}

interface TimelineLayerDragEntry {
  layerId: string;
  start: number;
  duration: number;
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

interface MotionCanvasSelectionBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MotionViewportRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface PlayheadInteraction {
  type: 'playhead';
  timelineElement: HTMLElement;
  scrollElement: HTMLElement;
  startClientX: number;
  startClientY: number;
}

interface RenderRangeInteraction {
  type: 'render-range';
  edge: TimelineTrimEdge;
  timelineElement: HTMLElement;
  startClientX: number;
  startClientY: number;
}

const TIMELINE_LABEL_WIDTH = 176;
const TIMELINE_BODY_MIN_WIDTH = 720;
const TIMELINE_AUTOSCROLL_EDGE = 56;
const TIMELINE_BOX_SELECT_THRESHOLD = 4;
const CANVAS_BOX_SELECT_THRESHOLD = 4;
const KEYFRAME_SNAP_THRESHOLD = 48;
const MIN_LAYER_SIZE = 24;
const MOTION_HISTORY_LIMIT = 80;
const LAYER_COPY_OFFSET = 40;
const DEFAULT_TRANSITION_DURATION = 600;
const DEFAULT_SCENE_DURATION = 3000;
const LAYER_SCENE_DROP_UNASSIGNED_ID = '__ngs_motion_unassigned_scene__';

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
  const horizontalDirection = handle.includes('w') ? -1 : handle.includes('e') ? 1 : 0;
  const verticalDirection = handle.includes('n') ? -1 : handle.includes('s') ? 1 : 0;
  const widthDelta = horizontalDirection * dx;
  const heightDeltaAsWidth = verticalDirection * dy * aspectRatio;
  let proportionalDelta = 0;

  if (horizontalDirection && verticalDirection) {
    const diagonalY = verticalDirection / Math.max(0.0001, aspectRatio);
    const denominator = horizontalDirection * horizontalDirection + diagonalY * diagonalY;

    proportionalDelta = (dx * horizontalDirection + dy * diagonalY) / denominator;
  } else if (horizontalDirection) {
    proportionalDelta = widthDelta;
  } else if (verticalDirection) {
    proportionalDelta = heightDeltaAsWidth;
  }

  const width = Math.max(MIN_LAYER_SIZE, start.width + proportionalDelta);
  const height = Math.max(MIN_LAYER_SIZE, width / Math.max(0.0001, aspectRatio));

  next.width = width;
  next.height = height;

  if (handle.includes('w')) {
    next.x = start.x + start.width - width;
  }

  if (handle.includes('n')) {
    next.y = start.y + start.height - height;
  }

  if (horizontalDirection && !verticalDirection) {
    next.y = start.y + (start.height - height) / 2;
  }

  if (verticalDirection && !horizontalDirection) {
    next.x = start.x + (start.width - width) / 2;
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

const constrainTextLayoutToContent = (
  layout: MotionLayout,
  start: MotionLayout,
  layer: MotionLayer,
  handle: CanvasResizeHandle,
  currentTime: number,
): void => {
  const minHeight = measureTextLayerContentHeight(layer, layout, currentTime);

  if (layout.height >= minHeight) {
    return;
  }

  if (handle.includes('n')) {
    layout.y = start.y + start.height - minHeight;
  }

  layout.height = minHeight;
};

const measureTextLayerContentHeight = (
  layer: MotionLayer,
  layout: MotionLayout,
  currentTime: number,
): number => {
  if (typeof document === 'undefined') {
    return MIN_LAYER_SIZE;
  }

  const snapshot = resolveMotionLayerSnapshot(layer, currentTime);
  const style = snapshot.style;
  const text = coerceMotionString(snapshot.props['text'], '') || ' ';
  const element = document.createElement('div');

  element.textContent = text;
  element.style.position = 'fixed';
  element.style.left = '-10000px';
  element.style.top = '-10000px';
  element.style.boxSizing = 'border-box';
  element.style.width = `${Math.max(MIN_LAYER_SIZE, layout.width)}px`;
  element.style.minHeight = '0';
  element.style.height = 'auto';
  element.style.padding = style.padding !== undefined ? `${style.padding}px` : '0';
  element.style.fontFamily = style.fontFamily ?? '';
  element.style.fontSize = `${style.fontSize ?? 72}px`;
  element.style.fontWeight = `${style.fontWeight ?? 400}`;
  element.style.lineHeight = `${style.lineHeight ?? 1.05}`;
  element.style.letterSpacing =
    style.letterSpacing !== undefined ? `${style.letterSpacing}px` : 'normal';
  element.style.whiteSpace = /\s/.test(text) ? 'pre-wrap' : 'pre';
  element.style.overflowWrap = 'normal';
  element.style.wordBreak = 'keep-all';
  element.style.visibility = 'hidden';
  element.style.pointerEvents = 'none';

  document.body.appendChild(element);
  const measuredHeight = Math.ceil(element.getBoundingClientRect().height + 2);

  element.remove();

  return Math.max(MIN_LAYER_SIZE, measuredHeight);
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
