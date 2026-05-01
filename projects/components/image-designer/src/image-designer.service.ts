import { moveItemInArray } from '@angular/cdk/drag-drop';
import { inject, Injectable, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import Konva from 'konva';

/**
 * A custom Konva filter for color tinting.
 * It modifies existing pixel colors by a factor without completely replacing them.
 * Factors are between -1 and 1.
 */
const TintFilter = function (this: Konva.Node, imageData: ImageData) {
  const data = imageData.data;
  const n = data.length;
  const tintR = this.getAttr('tintR') || 0;
  const tintG = this.getAttr('tintG') || 0;
  const tintB = this.getAttr('tintB') || 0;

  if (tintR === 0 && tintG === 0 && tintB === 0) return;

  for (let i = 0; i < n; i += 4) {
    if (tintR > 0) data[i] += (255 - data[i]) * tintR;
    else if (tintR < 0) data[i] += data[i] * tintR;

    if (tintG > 0) data[i + 1] += (255 - data[i + 1]) * tintG;
    else if (tintG < 0) data[i + 1] += data[i + 1] * tintG;

    if (tintB > 0) data[i + 2] += (255 - data[i + 2]) * tintB;
    else if (tintB < 0) data[i + 2] += data[i + 2] * tintB;
  }
};

import { ElementConfig, GradientConfig, ImageSize, LayerConfig, ImageDesignerSnapshot } from './types';

@Injectable({
  providedIn: 'root'
})
export class ImageDesignerService implements OnDestroy {
  private stage: Konva.Stage | undefined;
  private workspaceLayer: Konva.Layer | undefined;
  private uiLayer: Konva.Layer | undefined;
  private canvasRect: Konva.Rect | undefined;
  private maskOverlay: Konva.Shape | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private minScale = 0.1;
  private maxScale = 5;
  readonly scale = signal(1);
  readonly isInitialized = signal(false);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private loadedFonts = new Set<string>();
  readonly fonts = signal<string[]>([
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Oswald',
    'Source Sans Pro',
    'Slabo 27px',
    'Raleway',
    'PT Sans',
    'Merriweather',
    'Nunito',
    'Playfair Display',
    'Poppins',
    'Ubuntu',
    'Lora',
    'Muli',
    'Arvo',
    'Rubik',
    'Courier Prime',
    'Pacifico',
    'Dancing Script',
    'Bangers',
    'Special Elite',
    'Press Start 2P',
    'Monoton',
    'Creepster',
    'Lobster',
    'Orbitron',
    'Righteous',
    'Satisfy',
    'Shadows Into Light',
    'Permanent Marker',
    'Fredoka One',
    'Amatic SC',
    'Cinzel',
    'Great Vibes',
    'Kaushan Script'
  ]);
  private readonly _layers = signal<LayerConfig[]>([]);
  readonly layers = this._layers.asReadonly();
  readonly selectedLayerId = signal<string | null>(null);

  private readonly _change$ = new Subject<void>();
  readonly change$ = this._change$.asObservable();

  private undoStack: any[] = [];
  private redoStack: any[] = [];
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  historyLimit = 50;

  private transformer: Konva.Transformer | undefined;
  private selectionRect: Konva.Rect | undefined;
  private hoverRect: Konva.Rect | undefined;
  private hoveredShape: Konva.Shape | undefined;
  private selectionBordersGroup: Konva.Group | undefined;
  private selectionStartPos: { x: number, y: number } | undefined;
  private isSelecting = false;
  private isDragging = false;
  private wasSelectedBeforeClick = false;

  private snapLines: Konva.Line[] = [];

  private snapSettings = {
    showGuidelines: true,
    snapToShapes: true,
    snapToStageCenter: true,
    snapToStageBorders: true,
    guidelineColor: 'blue',
    snapRange: 5
  };

  private defaultFont = 'Inter';

  ngOnDestroy() {
    this.destroy();
  }

  async init(
    container: HTMLDivElement,
    imageSize: ImageSize,
    defaultFont = 'Inter',
    scale = 1,
    minScale = 0.1,
    maxScale = 5
  ) {
    if (!this.isBrowser) {
      console.log('ImageDesignerService.init skipped (not a browser)');
      return;
    }
    console.log('ImageDesignerService.init starting', { container, imageSize, defaultFont, scale, minScale, maxScale });
    console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);

    this.defaultFont = defaultFont;
    this.minScale = minScale;
    this.maxScale = maxScale;
    this.setScale(scale);

    try {
      this.stage = new Konva.Stage({
        container: container,
        width: container.offsetWidth || imageSize.width + 100,
        height: container.offsetHeight || imageSize.height + 100,
      });
      console.log('Konva.Stage created');
    } catch (e) {
      console.error('Failed to create Konva.Stage:', e);
      return;
    }

    this.workspaceLayer = new Konva.Layer();
    this.stage.add(this.workspaceLayer);

    this.uiLayer = new Konva.Layer();
    this.stage.add(this.uiLayer);

    this.canvasRect = new Konva.Rect({
      x: (this.stage.width() || imageSize.width) / 2,
      y: (this.stage.height() || imageSize.height) / 2,
      width: imageSize.width,
      height: imageSize.height,
      fill: 'white',
      stroke: '#d9dcdf',
      strokeWidth: 1,
      name: 'canvasRect'
    });
    this.canvasRect.offsetX(imageSize.width / 2);
    this.canvasRect.offsetY(imageSize.height / 2);
    this.canvasRect.scaleX(this.scale());
    this.canvasRect.scaleY(this.scale());

    this.workspaceLayer.add(this.canvasRect);

    this.transformer = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right'],
      name: 'transformer',
      // Ensure transformer is always above the mask
      boundBoxFunc: (oldBox, newBox) => {
        // Limit minimum size
        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
          return oldBox;
        }
        return newBox;
      },
    });
    this.uiLayer.add(this.transformer);

    this.transformer.on('transform', () => {
      this.updateSelectionBorders();
      const nodes = this.transformer?.nodes() || [];

      nodes.forEach((node) => {
        if (node instanceof Konva.Text) {
          // If we resized vertically (scaleY changed), scale fontSize
          const scaleY = node.scaleY();
          if (Math.abs(scaleY - this.scale()) > 0.001) {
            node.fontSize(node.fontSize() * (scaleY / this.scale()));
          }

          // Scale width according to scaleX
          const scaleX = node.scaleX();
          node.width(node.width() * (scaleX / this.scale()));

          // Reset scale to current canvas scale
          node.scaleX(this.scale());
          node.scaleY(this.scale());

          // Update offset because width/fontSize changed
          node.offsetX(node.width() / 2);
          node.offsetY(node.height() / 2);
        }
      });

      if (nodes.length > 0) {
        const guides = this.getSnappingGuides(nodes);
        this.drawSnappingLines(guides);
        this.updateShapesOriginalPositions(nodes as Konva.Shape[]);
      }
      this.notifyChange();
    });

    this.transformer.on('dragmove', (e) => {
      const target = e.target;
      if (this.transformer && (target as any) === this.transformer) {
        const nodes = (this.transformer as Konva.Transformer).nodes();
        if (nodes.length > 0) {
          const targetBox = this.getNodesClientRect(nodes);
          const guides = this.getSnappingGuides(nodes);

          let dx = 0;
          let dy = 0;

          const vGuide = guides.vertical[0];
          const hGuide = guides.horizontal[0];

          if (vGuide) {
            dx = vGuide.guide - vGuide.offset - targetBox.x;
          }

          if (hGuide) {
            dy = hGuide.guide - hGuide.offset - targetBox.y;
          }

          if (dx !== 0 || dy !== 0) {
            nodes.forEach((node: Konva.Node) => {
              const p = node.getAbsolutePosition();
              node.setAbsolutePosition({
                x: p.x + dx,
                y: p.y + dy
              });
            });
          }

          const finalGuides = this.getSnappingGuides(nodes);
          this.drawSnappingLines(finalGuides);
          this.updateSelectionBorders();
        }
      }
    });

    this.transformer.on('dragend', () => {
      this.clearSnapLines();
      const nodes = this.transformer?.nodes() || [];
      if (nodes.length > 0) {
        this.updateShapesOriginalPositions(nodes as Konva.Shape[]);
      }
      this.notifyChange();
    });

    this.transformer.on('transformend', () => {
      this.clearSnapLines();
      const nodes = this.transformer?.nodes() || [];
      if (nodes.length > 0) {
        nodes.forEach(node => {
          if (!(node instanceof Konva.Text)) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.width(node.width() * (scaleX / this.scale()));
            node.height(node.height() * (scaleY / this.scale()));
            node.scaleX(this.scale());
            node.scaleY(this.scale());
          }

          // If the node has effects, we MUST re-cache it with the new size
          const id = node.id();
          const config = this._layers().find(l => l.id === id);
          if (config) {
            // Re-apply effects and re-cache
            this.applyEffectsToShape(node as Konva.Shape, config);
          }
        });
        // We update the signal AFTER applying effects to ensure consistency
        this.updateShapesOriginalPositions(nodes as Konva.Shape[]);
      }
      this.notifyChange();
    });

    this.selectionRect = new Konva.Rect({
      fill: 'rgba(0,0,255,0.1)',
      stroke: '#3b82f6',
      strokeWidth: 1,
      visible: false,
      name: 'selectionRect',
      zIndex: 1001
    });
    this.uiLayer.add(this.selectionRect);

    this.hoverRect = new Konva.Rect({
      stroke: '#3b82f6',
      strokeWidth: 1,
      listening: false,
      visible: false,
      name: 'hoverRect'
    });
    this.uiLayer.add(this.hoverRect);

    this.selectionBordersGroup = new Konva.Group({
      listening: false,
      name: 'selectionBordersGroup'
    });
    this.uiLayer.add(this.selectionBordersGroup);

    this.maskOverlay = new Konva.Shape({
      fill: 'rgba(255, 255, 255, 0.8)',
      listening: false,
      name: 'maskOverlay',
      zIndex: 1000,
      fillRule: 'evenodd',
      sceneFunc: (context, shape) => {
        const stage = shape.getStage();
        if (!stage || !this.canvasRect) return;

        const stageWidth = stage.width();
        const stageHeight = stage.height();

        const canvasX = this.canvasRect.x();
        const canvasY = this.canvasRect.y();
        const canvasWidth = this.canvasRect.width() * this.canvasRect.scaleX();
        const canvasHeight = this.canvasRect.height() * this.canvasRect.scaleY();

        context.beginPath();
        // Наружный прямоугольник (весь Stage)
        context.rect(0, 0, stageWidth, stageHeight);

        // Внутренний прямоугольник (canvasRect)
        // Since canvasRect has offset at its center, its top-left corner is at (x - width*scale/2, y - height*scale/2)
        // We draw it in counter-clockwise direction to create a hole
        context.rect(
          canvasX + canvasWidth / 2,
          canvasY - canvasHeight / 2,
          -canvasWidth,
          canvasHeight
        );

        context.closePath();
        context.fillShape(shape);
      }
    });
    this.uiLayer.add(this.maskOverlay);

    await this.loadAllFonts();

    this.updateSize(container, imageSize);

    // Add a small delay to ensure everything is settled and then center again
    setTimeout(() => {
      this.updateSize(container, imageSize);
      this.workspaceLayer?.batchDraw();
      this.uiLayer?.batchDraw();
    }, 50);

    // Final draw to ensure everything is rendered
    this.workspaceLayer?.batchDraw();
    this.uiLayer?.batchDraw();

    console.log('Konva Canvas Rect and layers added and drawn');

    this.setupResizeObserver(container, imageSize);
    this.setupSelectionListeners();
    this.isInitialized.set(true);
    this.undoStack = [this.getSnapshot()];
    this.updateHistorySignals();
  }

  private handleGlobalMouseUp = (e: MouseEvent | TouchEvent) => {
    if (!this.isSelecting) {
      return;
    }

    this.isSelecting = false;
    if (!this.selectionRect || !this.workspaceLayer || !this.transformer) return;

    if (!this.selectionRect.visible()) {
      // If no selection rect was drawn, but we were selecting,
      // it means it was a simple click that didn't move much.
      const pos = this.stage?.getPointerPosition();
      const shape = pos ? this.stage?.getIntersection(pos) as Konva.Shape : null;
      if (shape && shape.id()) {
        this.selectLayer(shape.id());
      } else {
        this.selectLayer(null);
      }
      return;
    }

    this.selectionRect.visible(false);

    const box = this.selectionRect.getClientRect();
    const shapes = this.workspaceLayer.find('.rect, .text, .image, .pattern').filter((shape) => {
      if (shape === this.canvasRect || shape === this.selectionRect || shape === this.transformer) {
        return false;
      }
      if (!shape.visible() || !shape.listening()) {
        return false;
      }
      const layer = this._layers().find(l => l.id === shape.id());
      if (layer?.locked) {
        return false;
      }
      return Konva.Util.haveIntersection(box, shape.getClientRect());
    });

    this.transformer.nodes(shapes);
    if (shapes.length === 1) {
      const shape = shapes[0] as Konva.Shape;
      const layer = this._layers().find(l => l.id === shape.id());
      this.updateTransformer(shape, !!layer?.locked);
      this.selectedLayerId.set(shape.id());
    } else if (shapes.length > 1) {
      // Multiple selection: show default anchors for all
      this.transformer.setAttrs({
        rotateEnabled: true,
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right'],
      });
      this.selectedLayerId.set(null); // Or some multi-select id
    }
    this.transformer.forceUpdate();
    this.updateSelectionBorders();

    this.workspaceLayer.batchDraw();
  };

  private handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!this.isSelecting || !this.selectionRect || !this.selectionStartPos || !this.stage) {
      return;
    }

    const container = this.stage.container();
    const rect = container.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const pos = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    const rectX = Math.min(pos.x, this.selectionStartPos.x);
    const rectY = Math.min(pos.y, this.selectionStartPos.y);
    const rectWidth = Math.abs(pos.x - this.selectionStartPos.x);
    const rectHeight = Math.abs(pos.y - this.selectionStartPos.y);

    if (!isNaN(rectX) && !isNaN(rectY) && !isNaN(rectWidth) && !isNaN(rectHeight)) {
      if (rectWidth > 5 || rectHeight > 5) {
        this.selectionRect.visible(true);
      }
      this.selectionRect.setAttrs({
        x: rectX,
        y: rectY,
        width: rectWidth,
        height: rectHeight,
        strokeWidth: 1,
      });
      this.selectionRect.moveToTop();
    }

    this.uiLayer?.moveToTop();
    this.workspaceLayer?.batchDraw();
    this.uiLayer?.batchDraw();
  };

  private makeTextEditable(textNode: Konva.Text) {
    if (!this.stage) return;

    // Save original text and settings to restore if cancelled
    textNode.setAttr('originalText', textNode.text());
    textNode.setAttr('originalWidth', textNode.width());

    // Fix width to current width during editing to enable wrapping
    const initialWidth = textNode.width();
    textNode.width(initialWidth);

    // Hide text node but keep transformer visible
    textNode.opacity(0);
    this.transformer?.forceUpdate();
    this.updateSelectionBorders();

    const stage = this.stage;
    const textPosition = textNode.getAbsolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    // Create textarea
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // Set styles
    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = (textNode.width() * textNode.getAbsoluteScale().x) + 'px';
    textarea.style.height = (textNode.height() * textNode.getAbsoluteScale().y + 10) + 'px';
    textarea.style.fontSize = (textNode.fontSize() * textNode.getAbsoluteScale().y) + 'px';
    textarea.style.border = 'none';
    textarea.style.padding = (textNode.padding() * textNode.getAbsoluteScale().x) + 'px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight().toString();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.fontWeight = (textNode.getAttr('fontWeight') || textNode.fontStyle() || 'normal').toString();
    textarea.style.fontStyle = textNode.fontStyle()?.includes('italic') ? 'italic' : 'normal';
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill() as string;
    textarea.style.boxSizing = 'border-box';
    textarea.style.zIndex = '1000';

    const rotation = textNode.getAbsoluteRotation();
    let transform = '';
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)';
    }

    // Offset based on Konva's offset (textNode is centered by default in addLayer)
    const px = 0;
    // apply configuration
    // we need to skip transform for now as it's tricky with absolute positioning and offsets
    // But since we use absolutePosition which already accounts for many things, let's see.
    // If textNode has offset (centered), we need to adjust textarea position
    const offsetX = textNode.offsetX() * textNode.getAbsoluteScale().x;
    const offsetY = textNode.offsetY() * textNode.getAbsoluteScale().y;

    textarea.style.left = (areaPosition.x - offsetX) + 'px';
    textarea.style.top = (areaPosition.y - offsetY) + 'px';
    textarea.style.transform = transform;

    textarea.focus();

    let isFinished = false;
    const removeTextarea = () => {
      if (isFinished) return;
      isFinished = true;

      const originalText = textNode.getAttr('originalText');
      const originalWidth = textNode.getAttr('originalWidth');
      if (originalText !== undefined) {
        textNode.text(originalText);
      }
      if (originalWidth !== undefined) {
        textNode.width(originalWidth);
      }

      if (textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
      window.removeEventListener('click', handleOutsideClick);
      textarea.removeEventListener('blur', handleBlur);
      textNode.opacity(1);
      this.transformer?.forceUpdate();
      this.updateSelectionBorders();
      this.workspaceLayer?.batchDraw();
    };

    const updateText = () => {
      const newText = textarea.value;
      const originalText = textNode.getAttr('originalText');
      if (newText !== originalText) {
        const id = textNode.id();
        if (id) {
          // Keep the fixed width when updating the layer
          this.updateLayer(id, { text: newText, width: textNode.width() });
        } else {
          textNode.text(newText);
          textNode.offsetX(textNode.width() / 2);
          textNode.offsetY(textNode.height() / 2);
          this.workspaceLayer?.batchDraw();
        }
        // Restore transformer nodes after update if it was selected
        if (this.selectedLayerId() === textNode.id()) {
          this.transformer?.nodes([textNode]);
        }
      }
      // Clear originalText and originalWidth after update so removeTextarea doesn't restore it
      textNode.setAttr('originalText', undefined);
      textNode.setAttr('originalWidth', undefined);
    };

    const handleBlur = () => {
      updateText();
      removeTextarea();
    };

    textarea.addEventListener('blur', handleBlur);

    textarea.addEventListener('keydown', (e) => {
      // hide on enter
      // but don't hide on shift + enter
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        textarea.blur();
      }
      // on escape do not update
      if (e.keyCode === 27) {
        removeTextarea();
      }
    });

    textarea.addEventListener('input', () => {
      // update node text to update transformer
      textNode.text(textarea.value);
      this.transformer?.forceUpdate();
      this.updateSelectionBorders();

      // re-calculate size
      // Width is fixed, only height should change
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== textarea) {
        // blur will handle the rest
        textarea.blur();
      }
    };

    // Use timeout to avoid immediate trigger from the same click that opened it
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  }

  private setupSelectionListeners() {
    if (!this.stage) return;

    if (this.isBrowser) {
      window.addEventListener('mouseup', this.handleGlobalMouseUp);
      window.addEventListener('touchend', this.handleGlobalMouseUp);
      window.addEventListener('mousemove', this.handleGlobalMouseMove);
      window.addEventListener('touchmove', this.handleGlobalMouseMove);
    }

    this.stage.on('mousedown touchstart', (e) => {
      // If right click - do nothing
      if (e.evt instanceof MouseEvent && e.evt.button === 2) {
        return;
      }

      // If click on transformer - do nothing
      const isTransformer = e.target.getParent()?.className === 'Transformer';
      if (isTransformer) {
        return;
      }

      // If click on empty area, canvasRect or a locked layer - start selection
      const shapeAtPointer = e.target as Konva.Shape;
      const layerConfig = this._layers().find(l => l.id === shapeAtPointer.id());
      const isLocked = !!layerConfig?.locked;

      if (e.target === this.stage || e.target === this.canvasRect || isLocked) {
        this.isSelecting = true;
        this.uiLayer?.moveToTop();
        const pos = this.stage?.getPointerPosition();
        if (pos) {
          this.selectionStartPos = { x: pos.x, y: pos.y };
          this.selectionRect?.visible(false);
          this.selectionRect?.width(0);
          this.selectionRect?.height(0);
          this.selectionRect?.moveToTop();
        }
        return;
      }

      // Find the clicked shape
      const shape = e.target as Konva.Shape;
      const id = shape.id();
      if (id) {
        const isShiftPressed = e.evt.shiftKey;
        const currentNodes = this.transformer?.nodes() || [];
        this.wasSelectedBeforeClick = currentNodes.includes(shape);

        if (isShiftPressed) {
          // Toggle selection
          if (currentNodes.includes(shape)) {
            const newNodes = currentNodes.filter(n => n !== shape);
            this.transformer?.nodes(newNodes);
            this.updateSelectionBorders();
            if (newNodes.length === 1 && newNodes[0].id()) {
              this.selectedLayerId.set(newNodes[0].id());
            } else if (newNodes.length === 0) {
              this.selectedLayerId.set(null);
            } else {
              this.selectedLayerId.set(null); // Multi-selection or none
            }
          } else {
            const newNodes = [...currentNodes, shape];
            this.transformer?.nodes(newNodes);
            this.updateSelectionBorders();
            if (newNodes.length === 1) {
              this.selectedLayerId.set(shape.id());
            } else {
              this.selectedLayerId.set(null); // Multi-selection
            }
          }
        } else {
          // Normal click
          // Only change selection on mousedown if the object is NOT already selected.
          // This allows moving the whole selection group.
          if (!currentNodes.includes(shape)) {
            this.selectLayer(id);
          }
        }
      } else {
        // Click on something without ID (like the canvas but not the canvasRect handler above)
        this.selectLayer(null);
      }
    });

    this.stage.on('click tap', (e) => {
      // If right click - do nothing
      if (e.evt instanceof MouseEvent && e.evt.button === 2) {
        return;
      }

      // If click on transformer - do nothing
      const isTransformer = e.target.getParent()?.className === 'Transformer';
      if (isTransformer) {
        return;
      }

      const shape = e.target as Konva.Shape;

      const currentNodesOnStage = this.transformer?.nodes() || [];
      if (this.wasSelectedBeforeClick && currentNodesOnStage.length === 1 && currentNodesOnStage[0] === shape && shape instanceof Konva.Text) {
        this.makeTextEditable(shape);
        return;
      }

      // If click on empty area or canvasRect - do nothing
      if (e.target === this.stage || e.target === this.canvasRect) {
        return;
      }

      const id = shape.id();
      if (!id) return;

      const isShiftPressed = e.evt.shiftKey;
      if (isShiftPressed) return; // Handled in mousedown

      const currentNodesOnClick = this.transformer?.nodes() || [];
      // If we clicked on an object that is part of a multi-selection,
      // and it was a simple click (not a drag), then select only this object.
      if (currentNodesOnClick.length > 1 && currentNodesOnClick.includes(shape)) {
        this.selectLayer(id);
      }
    });

    this.stage.on('mousemove touchmove', (e) => {
      // Logic moved to handleGlobalMouseMove
    });
  }

  selectLayer(id: string | null) {
    this.selectedLayerId.set(id);
    this.hideHover();

    if (!this.transformer || !this.workspaceLayer) return;

    if (!id) {
      this.transformer.nodes([]);
    } else {
      const shape = this.workspaceLayer.findOne('#' + id) as Konva.Shape;
      if (shape && shape.visible()) {
        const layer = this._layers().find(l => l.id === id);

        this.transformer.nodes([shape]);
        this.updateTransformer(shape, !!layer?.locked);
      } else {
        this.transformer.nodes([]);
      }
    }
    this.updateSelectionBorders();
    this.transformer.moveToTop();
    this.uiLayer?.moveToTop();
    this.workspaceLayer.batchDraw();
    this.uiLayer?.batchDraw();
  }

  private updateTransformer(shape: Konva.Shape, isLocked: boolean) {
    if (!this.transformer) return;

    if (isLocked) {
      this.transformer.setAttrs({
        rotateEnabled: false,
        enabledAnchors: [],
      });
    } else {
      if (shape instanceof Konva.Text) {
        this.transformer.setAttrs({
          rotateEnabled: true,
          enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right'],
        });
      } else {
        this.transformer.setAttrs({
          rotateEnabled: true,
          enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right'],
        });
      }
    }
    this.transformer.forceUpdate();
  }

  toggleLayerVisibility(id: string) {
    const layer = this._layers().find(l => l.id === id);
    if (!layer || !this.workspaceLayer) return;

    const newVisible = layer.visible === false;
    this._layers.update(layers =>
      layers.map(l => l.id === id ? { ...l, visible: newVisible } : l)
    );

    const shape = this.workspaceLayer.findOne('#' + id);
    if (shape) {
      shape.visible(newVisible);
      if (!newVisible && this.selectedLayerId() === id) {
        this.selectLayer(null);
      }
      this.workspaceLayer.batchDraw();
    }
  }

  toggleLayerLock(id: string) {
    const layer = this._layers().find(l => l.id === id);
    if (!layer || !this.workspaceLayer) return;

    const newLocked = !layer.locked;
    this._layers.update(layers =>
      layers.map(l => l.id === id ? { ...l, locked: newLocked } : l)
    );

    const shape = this.workspaceLayer.findOne('#' + id);
    if (shape) {
      shape.listening(true);
      shape.draggable(!newLocked);

      // Update transformer if the locked shape is currently selected
      if (this.selectedLayerId() === id) {
        this.updateTransformer(shape as Konva.Shape, newLocked);
      }

      this.workspaceLayer.batchDraw();
    }
  }

  async flipHorizontal(id: string) {
    const layer = this._layers().find(l => l.id === id);
    if (!layer) return;
    const currentScaleX = layer['scaleX'] ?? 1;
    await this.updateLayer(id, { scaleX: currentScaleX * -1 });
  }

  async flipVertical(id: string) {
    const layer = this._layers().find(l => l.id === id);
    if (!layer) return;
    const currentScaleY = layer['scaleY'] ?? 1;
    await this.updateLayer(id, { scaleY: currentScaleY * -1 });
  }

  async fitToPage(id: string) {
    const layer = this._layers().find(l => l.id === id);
    if (!layer || !this.canvasRect) return;

    const canvasWidth = this.canvasRect.width();
    const canvasHeight = this.canvasRect.height();
    const canvasCenterX = this.canvasRect.x();
    const canvasCenterY = this.canvasRect.y();

    const shape = this.workspaceLayer?.findOne('#' + id);
    if (!shape) return;

    // Use actual shape dimensions if available, otherwise fallback to layer config
    const layerWidth = (shape instanceof Konva.Text) ? shape.width() : (layer.width || shape.width());
    const layerHeight = (shape instanceof Konva.Text) ? shape.height() : (layer.height || shape.height());

    if (layerWidth === 0 || layerHeight === 0) return;

    const scale = Math.min(canvasWidth / layerWidth, canvasHeight / layerHeight) * this.scale();

    await this.updateLayer(id, {
      x: canvasCenterX,
      y: canvasCenterY,
      width: layerWidth,
      height: layerHeight,
      scaleX: scale,
      scaleY: scale,
      rotation: 0
    });
  }

  async fillPage(id: string) {
    const layer = this._layers().find(l => l.id === id);
    if (!layer || !this.canvasRect) return;

    const canvasWidth = this.canvasRect.width();
    const canvasHeight = this.canvasRect.height();
    const canvasCenterX = this.canvasRect.x();
    const canvasCenterY = this.canvasRect.y();

    const shape = this.workspaceLayer?.findOne('#' + id);
    if (!shape) return;

    // Use actual shape dimensions if available, otherwise fallback to layer config
    const layerWidth = (shape instanceof Konva.Text) ? shape.width() : (layer.width || shape.width());
    const layerHeight = (shape instanceof Konva.Text) ? shape.height() : (layer.height || shape.height());

    if (layerWidth === 0 || layerHeight === 0) return;

    const scale = Math.max(canvasWidth / layerWidth, canvasHeight / layerHeight) * this.scale();

    await this.updateLayer(id, {
      x: canvasCenterX,
      y: canvasCenterY,
      width: layerWidth,
      height: layerHeight,
      scaleX: scale,
      scaleY: scale,
      rotation: 0
    });
  }

  deleteLayer(id: string) {
    const layer = this._layers().find(l => l.id === id);
    if (!layer || !this.workspaceLayer || layer.locked) return;

    this.hideHover();

    // Remove from signal
    this._layers.update(layers => layers.filter(l => l.id !== id));
    this.notifyChange();

    // Remove from Konva
    const shape = this.workspaceLayer.findOne('#' + id);
    if (shape) {
      if (this.transformer) {
        const nodes = this.transformer.nodes();
        if (nodes.includes(shape as Konva.Shape)) {
          this.transformer.nodes(nodes.filter(n => n !== shape));
        }
      }
      shape.destroy();
      if (this.selectedLayerId() === id) {
        this.selectLayer(null);
      } else {
        this.updateSelectionBorders();
      }
      this.workspaceLayer.batchDraw();
    }
  }

  deleteSelectedLayers() {
    if (!this.transformer || !this.workspaceLayer) return;

    const nodes = this.transformer.nodes();
    if (nodes.length === 0) return;

    this.hideHover();

    const idsToDelete = nodes.map(node => node.id()).filter((id): id is string => {
      const layer = this._layers().find(l => l.id === id);
      return !!id && !!layer && !layer.locked;
    });

    if (idsToDelete.length === 0) return;

    // Remove from signal
    this._layers.update(layers => layers.filter(l => !l.id || !idsToDelete.includes(l.id)));
    this.notifyChange();

    // Remove from Konva
    idsToDelete.forEach(id => {
      const shape = this.workspaceLayer?.findOne('#' + id);
      if (shape) {
        shape.destroy();
      }
    });

    this.transformer.nodes([]);
    this.selectLayer(null);
    this.workspaceLayer.batchDraw();
  }

  moveSelectedLayers(dx: number, dy: number) {
    if (!this.transformer || !this.workspaceLayer) return;

    const nodes = this.transformer.nodes();
    if (nodes.length === 0) return;

    let moved = false;
    nodes.forEach(node => {
      const id = node.id();
      const layer = this._layers().find(l => l.id === id);
      if (layer && !layer.locked) {
        node.x(node.x() + dx);
        node.y(node.y() + dy);
        moved = true;
      }
    });

    if (moved) {
      this.updateSelectionBorders();
      this.workspaceLayer.batchDraw();
      this.updateShapesOriginalPositions(nodes as Konva.Shape[]);
      this.notifyChange();
    }
  }

  private showHover(shape: Konva.Shape) {
    if (!this.hoverRect || !this.workspaceLayer) return;

    this.hoveredShape = shape;
    const box = shape.getClientRect({ relativeTo: this.workspaceLayer });
    this.hoverRect.setAttrs({
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      strokeWidth: 1,
      visible: true
    });
    this.hoverRect.moveToTop();
    this.workspaceLayer.batchDraw();
  }

  private hideHover() {
    this.hoveredShape = undefined;
    if (!this.hoverRect) return;
    this.hoverRect.visible(false);
    this.workspaceLayer?.batchDraw();
  }

  private updateSelectionBorders() {
    if (!this.selectionBordersGroup || !this.transformer || !this.workspaceLayer) return;

    this.selectionBordersGroup.destroyChildren();
    const nodes = this.transformer.nodes();

    if (nodes.length > 1) {
      nodes.forEach(node => {
        const box = node.getClientRect({ relativeTo: this.workspaceLayer });
        const rect = new Konva.Rect({
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          stroke: '#3b82f6',
          strokeWidth: 1,
          listening: false,
          name: 'selectionBorder'
        });
        this.selectionBordersGroup?.add(rect);
      });
      this.selectionBordersGroup.visible(true);
    } else {
      this.selectionBordersGroup.visible(false);
    }
    this.selectionBordersGroup.moveToTop();
    this.uiLayer?.batchDraw();
  }

  async addLayer(config: LayerConfig, updateList = true): Promise<string | undefined> {
    if (!this.workspaceLayer || !this.canvasRect) return undefined;

    if (config.type === 'text' && config['fontFamily']) {
      await this.loadFont(config['fontFamily']);
    } else if (config.type === 'text' && !config['fontFamily']) {
      await this.loadFont(this.defaultFont);
    }

    if (updateList) {
      const newConfig = { ...config, id: config.id || Math.random().toString(36).substr(2, 9) };
      // New layer should be at the top of the UI list (index 0)
      this._layers.update(layers => [newConfig, ...layers]);
      config = newConfig;
      if (!this.isSnapshotLoading) {
        this.notifyChange();
      }
    }

    let shape: Konva.Shape | undefined;

    const canvasWidth = this.canvasRect?.width() || 0;
    const canvasHeight = this.canvasRect?.height() || 0;
    const canvasX = this.canvasRect?.x() || 0;
    const canvasY = this.canvasRect?.y() || 0;

    // x and y are relative to canvas center
    const x = (config.x ?? 0) * this.scale() + canvasX;
    const y = (config.y ?? 0) * this.scale() + canvasY;

    if (isNaN(x) || isNaN(y)) {
      console.warn('ImageDesignerService.addLayer: Calculated layer position is NaN', { x, y, config, canvasWidth, canvasHeight, canvasX, canvasY, scale: this.scale() });
      return undefined;
    }

    if (config.type === 'text') {
      const fontSize = config['fontSize'] || 18;
      const padding = 10;
      shape = new Konva.Text({
        id: config.id,
        name: 'text',
        x,
        y,
        text: config['text'] || 'New Text',
        fontSize,
        fontFamily: config['fontFamily'] || this.defaultFont,
        fontStyle: config['fontWeight'] ? `${config['fontWeight']}` : 'normal',
        fill: config['fill'] || '#000000',
        opacity: config['opacity'] ?? 1,
        align: config['align'] || 'left',
        scaleX: this.scale(),
        scaleY: this.scale(),
        draggable: !config.locked,
        listening: true,
        visible: config.visible !== false,
        padding: padding,
        wrap: 'word',
        width: config.width || undefined,
      });
      if (config['fontWeight']) {
        shape.setAttr('fontWeight', config['fontWeight']);
      }

      // If width is not provided, let's set a default width for headings to enable wrapping/resizing properly
      if (!config.width) {
        // Measure text width and add extra horizontal padding
        const textWidth = shape.width() + 55;
        shape.width(textWidth);
      }

      shape.offsetX(shape.width() / 2);
      shape.offsetY(shape.height() / 2);
      this.applyEffectsToShape(shape, config);
    } else if (config.type === 'image') {
      const imageObj = new Image();
      imageObj.crossOrigin = 'anonymous';
      imageObj.onload = () => {
        if (shape) {
          (shape as Konva.Image).image(imageObj);
          if (!config.width || !config.height) {
            shape.width(imageObj.width);
            shape.height(imageObj.height);
          }
          shape.offsetX(shape.width() / 2);
          shape.offsetY(shape.height() / 2);

          if (this.transformer?.nodes().includes(shape)) {
            this.transformer.forceUpdate();
          }

          this.applyEffectsToShape(shape, config);
          this.workspaceLayer?.batchDraw();
        }
      };
      imageObj.src = config['src'] || '';

      shape = new Konva.Image({
        id: config.id,
        name: 'image',
        x,
        y,
        width: config.width || 0,
        height: config.height || 0,
        image: undefined,
        opacity: config['opacity'] ?? 1,
        scaleX: this.scale(),
        scaleY: this.scale(),
        draggable: !config.locked,
        listening: true,
        visible: config.visible !== false,
      });
      shape.offsetX(shape.width() / 2);
      shape.offsetY(shape.height() / 2);
    } else if (config.type === 'shape') {
      const imageObj = new Image();
      imageObj.onload = () => {
        if (shape) {
          (shape as Konva.Image).image(imageObj);
          shape.offsetX(shape.width() / 2);
          shape.offsetY(shape.height() / 2);

          if (this.transformer?.nodes().includes(shape)) {
            this.transformer.forceUpdate();
          }

          this.applyEffectsToShape(shape, config);
          this.workspaceLayer?.batchDraw();
        }
      };
      imageObj.src = config['data'] || '';

      shape = new Konva.Image({
        id: config.id,
        name: 'rect',
        x,
        y,
        width: config.width || 100,
        height: config.height || 100,
        image: undefined,
        opacity: config['opacity'] ?? 1,
        scaleX: this.scale(),
        scaleY: this.scale(),
        draggable: !config.locked,
        listening: true,
        visible: config.visible !== false,
      });
      shape.offsetX(shape.width() / 2);
      shape.offsetY(shape.height() / 2);
    } else if (config.type === 'pattern') {
      const patternImageObj = new Image();
      patternImageObj.onload = () => {
        if (shape) {
          const rect = shape as Konva.Rect;
          rect.fillPatternImage(patternImageObj);

          // If original pattern is too big, scale it down.
          // Or just provide a default scale for better look.
          const patternScale = 0.5; // Fixed pattern scale for better look or based on config
          rect.fillPatternScale({ x: patternScale, y: patternScale });

          this.workspaceLayer?.batchDraw();
        }
      };
      patternImageObj.src = typeof config.patternImage === 'string' ? config.patternImage : (config.patternImage?.src || '');

      shape = new Konva.Rect({
        id: config.id,
        name: 'pattern',
        x,
        y,
        width: config.width || canvasWidth,
        height: config.height || canvasHeight,
        opacity: config['opacity'] ?? 1,
        scaleX: this.scale(),
        scaleY: this.scale(),
        draggable: !config.locked,
        listening: true,
        visible: config.visible !== false,
        fillPatternRepeat: 'repeat',
      });
      shape.offsetX(shape.width() / 2);
      shape.offsetY(shape.height() / 2);

      // Ensure pattern stays centered even if shape size changes
      // Konva's fillPatternOffset is in local coordinates of the shape (after scale/offset?)
      // Actually it's simpler: if we want it centered, we just need to keep it consistent.
    }

    if (shape) {
      if (config.id) {
        shape.id(config.id);
      }
      this.workspaceLayer.add(shape);

      // Select the new layer automatically
      if (updateList && config.id) {
        this.selectLayer(config.id);
      }

      // Update Konva Z-index based on the array order
      if (updateList) {
        this.reorderLayers(0, 0); // This will refresh all Z-indices based on the current _layers()
      }
      this.workspaceLayer.batchDraw();

      shape.on('mouseenter', () => {
        if (this.isDragging || this.isSelecting || !this.hoverRect) return;

        // Don't show hover for already selected shapes
        const selectedNodes = this.transformer?.nodes() || [];
        if (selectedNodes.includes(shape!)) return;

        this.showHover(shape!);
      });

      shape.on('mouseleave', () => {
        this.hideHover();
      });

      shape.dragBoundFunc((pos) => {
        const nodes = this.transformer?.nodes() || [];
        if (nodes.length > 1 && nodes.includes(shape!)) {
          return pos;
        }

        const guides = this.getSnappingGuides(shape!, pos);
        let x = pos.x;
        let y = pos.y;

        if (guides.vertical.length > 0) {
          const vGuide = guides.vertical[0];
          x = vGuide.guide - vGuide.offset + shape!.offsetX() * shape!.scaleX();
        }

        if (guides.horizontal.length > 0) {
          const hGuide = guides.horizontal[0];
          y = hGuide.guide - hGuide.offset + shape!.offsetY() * shape!.scaleY();
        }

        return { x, y };
      });

      shape.on('dragstart', () => {
        this.isDragging = true;
        this.hideHover();
      });

      shape.on('dragmove', (e) => {
        const nodes = this.transformer?.nodes() || [];
        if (nodes.length > 1 && nodes.includes(shape!)) {
          // If part of group, let transformer.on('dragmove') handle it
          return;
        }

        if (nodes.includes(shape!) && nodes.length > 1) {
          nodes.forEach(node => {
            this.updateShapeOriginalPosition(node as Konva.Shape, false);
          });
        } else {
          this.updateShapeOriginalPosition(shape!, false);
        }

        const absPos = shape!.getAbsolutePosition();
        const guides = this.getSnappingGuides(shape!, absPos);
        this.drawSnappingLines(guides);
      });

      shape.on('dragend', () => {
        this.isDragging = false;
        this.clearSnapLines();
        const nodes = this.transformer?.nodes() || [];
        if (nodes.includes(shape!) && nodes.length > 1) {
          // Batch update signal for all nodes in the group
          this.updateShapesOriginalPositions(nodes as Konva.Shape[]);
        } else {
          // Single shape drag - update signal
          this.updateShapeOriginalPosition(shape!);
        }
        this.notifyChange();
      });

      shape.on('transform', () => {
        if (shape!.name() === 'pattern') {
          const rect = shape as Konva.Rect;
          const scaleX = rect.scaleX();
          const scaleY = rect.scaleY();
          rect.width(rect.width() * (scaleX / this.scale()));
          rect.height(rect.height() * (scaleY / this.scale()));
          rect.scaleX(this.scale());
          rect.scaleY(this.scale());
          rect.offsetX(rect.width() / 2);
          rect.offsetY(rect.height() / 2);
        }

        const absPos = shape!.getAbsolutePosition();
        const guides = this.getSnappingGuides(shape!, absPos);
        this.drawSnappingLines(guides);

        this.updateShapeOriginalPosition(shape!);
      });

      shape.on('transformend', () => {
        this.clearSnapLines();
        if (!(shape instanceof Konva.Text)) {
          const scaleX = shape!.scaleX();
          const scaleY = shape!.scaleY();
          shape!.width(shape!.width() * (scaleX / this.scale()));
          shape!.height(shape!.height() * (scaleY / this.scale()));
          shape!.scaleX(this.scale());
          shape!.scaleY(this.scale());
          shape!.offsetX(shape!.width() / 2);
          shape!.offsetY(shape!.height() / 2);
        }
        this.updateShapeOriginalPosition(shape!);
        this.notifyChange();
      });

      shape.setAttr('originalX', config.x ?? 0);
      shape.setAttr('originalY', config.y ?? 0);

      // Ensure UI layer and its elements are on top
      this.uiLayer?.moveToTop();
      this.maskOverlay?.moveToTop();
      this.transformer?.moveToTop();
      this.hoverRect?.moveToTop();
    }

    return config.id;
  }

  private updateShapeOriginalPosition(shape: Konva.Shape, updateSignal = true) {
    if (!this.canvasRect) return;

    const scale = this.scale();
    const originalX = (shape.x() - this.canvasRect.x()) / scale;
    const originalY = (shape.y() - this.canvasRect.y()) / scale;
    const originalScaleX = shape.scaleX() / scale;
    const originalScaleY = shape.scaleY() / scale;

    shape.setAttr('originalX', originalX);
    shape.setAttr('originalY', originalY);
    shape.setAttr('originalScaleX', originalScaleX);
    shape.setAttr('originalScaleY', originalScaleY);

    if (updateSignal) {
      // Update the signal
      const id = shape.id();
      this._layers.update(layers =>
        layers.map(l => l.id === id ? {
          ...l,
          x: originalX,
          y: originalY,
          width: shape.width(),
          height: shape.height(),
          scaleX: originalScaleX,
          scaleY: originalScaleY,
          rotation: shape.rotation()
        } : l)
      );
    }
  }

  private updateShapesOriginalPositions(shapes: Konva.Shape[]) {
    if (!this.canvasRect) return;

    const scale = this.scale();
    const updates = new Map<string, any>();

    shapes.forEach(shape => {
      const originalX = (shape.x() - this.canvasRect!.x()) / scale;
      const originalY = (shape.y() - this.canvasRect!.y()) / scale;
      const originalScaleX = shape.scaleX() / scale;
      const originalScaleY = shape.scaleY() / scale;

      shape.setAttr('originalX', originalX);
      shape.setAttr('originalY', originalY);
      shape.setAttr('originalScaleX', originalScaleX);
      shape.setAttr('originalScaleY', originalScaleY);

      updates.set(shape.id(), {
        x: originalX,
        y: originalY,
        width: shape.width(),
        height: shape.height(),
        scaleX: originalScaleX,
        scaleY: originalScaleY,
        rotation: shape.rotation()
      });
    });

    // Update the signal once for all shapes
    this._layers.update(layers =>
      layers.map(l => {
        const update = updates.get(l.id!);
        return update ? { ...l, ...update } : l;
      })
    );
  }

  private getNodesClientRect(nodes: Konva.Node[]) {
    if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
      const box = node.getClientRect();
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private getSnappingGuides(targetNode: Konva.Node | Konva.Node[], pos?: { x: number, y: number }) {
    if (!this.canvasRect || !this.workspaceLayer) return { vertical: [], horizontal: [] };

    const nodes = Array.isArray(targetNode) ? targetNode : [targetNode];
    const isGroup = nodes.length > 1;

    const snapRange = this.snapSettings.snapRange;
    const resultV: any[] = [];
    const resultH: any[] = [];

    // Bases for snapping
    const basesV: number[] = [];
    const basesH: number[] = [];

    // 1. Stage centers and borders
    if (this.snapSettings.snapToStageCenter || this.snapSettings.snapToStageBorders) {
      const cw = this.canvasRect.width() * this.scale();
      const ch = this.canvasRect.height() * this.scale();
      const cx = this.canvasRect.x();
      const cy = this.canvasRect.y();

      if (this.snapSettings.snapToStageBorders) {
        basesV.push(cx); // Left
        basesV.push(cx + cw); // Right
        basesH.push(cy); // Top
        basesH.push(cy + ch); // Bottom
      }

      if (this.snapSettings.snapToStageCenter) {
        basesV.push(cx + cw / 2); // Center V
        basesH.push(cy + ch / 2); // Center H
      }
    }

    // 2. Other shapes
    if (this.snapSettings.snapToShapes) {
      const selectedNodes = this.transformer?.nodes() || [];
      this.workspaceLayer.getChildren().forEach((child) => {
        if (nodes.includes(child) || child === this.canvasRect || child.name() === 'selection-rect' || (selectedNodes.length > 0 && selectedNodes.includes(child))) return;

        const box = child.getClientRect();
        basesV.push(box.x);
        basesV.push(box.x + box.width / 2);
        basesV.push(box.x + box.width);
        basesH.push(box.y);
        basesH.push(box.y + box.height / 2);
        basesH.push(box.y + box.height);
      });
    }

    const targetBox = isGroup ? this.getNodesClientRect(nodes) : nodes[0].getClientRect();

    // If pos is provided (from dragBoundFunc for single node), we use it.
    // For group drag via transformer, we don't use pos here because we apply delta later.
    let targetX = targetBox.x;
    let targetY = targetBox.y;

    if (!isGroup && pos) {
      targetX = pos.x - nodes[0].offsetX() * nodes[0].scaleX();
      targetY = pos.y - nodes[0].offsetY() * nodes[0].scaleY();
    }

    const targetWidth = targetBox.width;
    const targetHeight = targetBox.height;

    basesV.forEach((base) => {
      const vSnaps = [
        { guide: base, offset: 0, diff: Math.abs(base - targetX) },
        { guide: base, offset: targetWidth / 2, diff: Math.abs(base - (targetX + targetWidth / 2)) },
        { guide: base, offset: targetWidth, diff: Math.abs(base - (targetX + targetWidth)) }
      ];

      vSnaps.forEach(s => {
        if (s.diff < snapRange) {
          resultV.push(s);
        }
      });
    });

    basesH.forEach((base) => {
      const hSnaps = [
        { guide: base, offset: 0, diff: Math.abs(base - targetY) },
        { guide: base, offset: targetHeight / 2, diff: Math.abs(base - (targetY + targetHeight / 2)) },
        { guide: base, offset: targetHeight, diff: Math.abs(base - (targetY + targetHeight)) }
      ];

      hSnaps.forEach(s => {
        if (s.diff < snapRange) {
          resultH.push(s);
        }
      });
    });

    return {
      vertical: resultV.sort((a, b) => a.diff - b.diff),
      horizontal: resultH.sort((a, b) => a.diff - b.diff)
    };
  }

  private drawSnappingLines(guides: { vertical: any[], horizontal: any[] }) {
    this.clearSnapLines();
    if (!this.uiLayer || !this.snapSettings.showGuidelines) return;

    const vGuide = guides.vertical[0];
    const hGuide = guides.horizontal[0];

    if (vGuide) {
      const line = new Konva.Line({
        points: [vGuide.guide, 0, vGuide.guide, this.stage!.height()],
        stroke: this.snapSettings.guidelineColor,
        strokeWidth: 1,
        dash: [4, 6],
        name: 'snap-line'
      });
      this.uiLayer.add(line);
      this.snapLines.push(line);
    }

    if (hGuide) {
      const line = new Konva.Line({
        points: [0, hGuide.guide, this.stage!.width(), hGuide.guide],
        stroke: this.snapSettings.guidelineColor,
        strokeWidth: 1,
        dash: [4, 6],
        name: 'snap-line'
      });
      this.uiLayer.add(line);
      this.snapLines.push(line);
    }

    this.uiLayer.batchDraw();
  }

  private clearSnapLines() {
    this.snapLines.forEach(l => l.destroy());
    this.snapLines = [];
    this.uiLayer?.batchDraw();
  }

  private consecutiveUpdatesCount = 0;
  private lastUpdateSizeTime = 0;
  private lastUpdateSizeDimensions = { width: 0, height: 0 };
  private isSnapshotLoading = false;

  private setupResizeObserver(container: HTMLDivElement, imageSize: ImageSize) {
    this.resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to avoid "ResizeObserver loop completed with undelivered notifications" error
      // This ensures that the size update happens in the next frame after the layout has settled.
      requestAnimationFrame(() => {
        if (this.stage) {
          this.updateSize(container, imageSize);
        }
      });
    });
    this.resizeObserver.observe(container);
  }

  updateSize(container: HTMLDivElement, imageSize: ImageSize, fitToContainer = false, notify = false) {
    if (!this.stage || !this.canvasRect || !this.workspaceLayer || !this.uiLayer) {
      return;
    }

    const now = Date.now();
    if (this.lastUpdateSizeTime && now - this.lastUpdateSizeTime < 50) {
      this.consecutiveUpdatesCount++;
      if (this.consecutiveUpdatesCount > 100) {
        console.warn('ImageDesignerService.updateSize: Potential infinite loop detected, aborting');
        return;
      }
    } else {
      this.consecutiveUpdatesCount = 0;
    }
    this.lastUpdateSizeTime = now;
    this.lastUpdateSizeDimensions = { width: imageSize.width, height: imageSize.height };

    const width = Math.round(container.offsetWidth || imageSize.width || 800);
    const height = Math.round(container.offsetHeight || imageSize.height || 600);

    console.log('ImageDesignerService.updateSize dimensions:', width, 'x', height);

    // Skip if size is effectively 0 to avoid incorrect centering
    if (width === 0 || height === 0) {
      console.warn('ImageDesignerService.updateSize: dimensions are 0, skipping');
      return;
    }

    if (fitToContainer) {
      const padding = 40;
      const availableWidth = width - padding * 2;
      const availableHeight = height - padding * 2;

      const scaleX = availableWidth / (imageSize.width || 1);
      const scaleY = availableHeight / (imageSize.height || 1);

      const newScale = Math.min(scaleX, scaleY);
      const clampedScale = Math.min(Math.max(newScale, this.minScale), this.maxScale);

      this.scale.set(clampedScale);
    }

    // Skip if size hasn't changed to avoid unnecessary re-draws and potential loops (unless scale is being updated)
    // Use a small epsilon to avoid loops due to sub-pixel changes
    const sizeChanged = Math.abs(this.stage.width() - width) > 0.5 || Math.abs(this.stage.height() - height) > 0.5;
    const canvasSizeChanged = Math.abs(this.canvasRect.width() - imageSize.width) > 0.5 || Math.abs(this.canvasRect.height() - imageSize.height) > 0.5;
    const scaleChanged = Math.abs(this.canvasRect.scaleX() - this.scale()) > 0.001;

    if (!sizeChanged && !scaleChanged && !canvasSizeChanged) {
      return;
    }

    if (isNaN(width) || isNaN(height)) {
      console.warn('ImageDesignerService.updateSize: width or height is NaN', { width, height, container, imageSize });
      return;
    }

    console.log('Updating stage size to:', width, 'x', height);
    this.stage.width(width);
    this.stage.height(height);

    const canvasWidth = imageSize.width || 0;
    const canvasHeight = imageSize.height || 0;

    console.log('Setting canvasRect size to:', canvasWidth, 'x', canvasHeight);
    this.canvasRect.width(canvasWidth);
    this.canvasRect.height(canvasHeight);
    this.canvasRect.offsetX(canvasWidth / 2);
    this.canvasRect.offsetY(canvasHeight / 2);

    const canvasX = width / 2;
    const canvasY = height / 2;

    if (!isNaN(canvasX) && !isNaN(canvasY)) {
      console.log('Centering canvasRect at:', canvasX, canvasY);
      this.canvasRect.x(canvasX);
      this.canvasRect.y(canvasY);
      this.canvasRect.scaleX(this.scale());
      this.canvasRect.scaleY(this.scale());

      // Update positions of all elements in workspaceLayer relative to new canvas position
      this.workspaceLayer.getChildren().forEach(child => {
        if (child !== this.canvasRect && child.name() !== 'transformer') {
          const originalX = (child.attrs['originalX'] as number) ?? 0;
          const originalY = (child.attrs['originalY'] as number) ?? 0;
          child.x(originalX * this.scale() + canvasX);
          child.y(originalY * this.scale() + canvasY);

          // Use the original scale for layers that have one (like flipped ones)
          const originalScaleX = (child.attrs['originalScaleX'] as number) ?? 1;
          const originalScaleY = (child.attrs['originalScaleY'] as number) ?? 1;
          child.scaleX(this.scale() * originalScaleX);
          child.scaleY(this.scale() * originalScaleY);
        }
      });
      this.selectionRect?.visible(false); // Hide selection rect on resize as its coordinates are now invalid
      this.uiLayer.moveToTop(); // Ensure UI layer is always on top of workspace layer
      this.maskOverlay?.moveToTop(); // Mask on top of everything for clipping effect
      this.transformer?.moveToTop();
      this.hoverRect?.moveToTop();
      this.transformer?.forceUpdate();
      this.updateSelectionBorders();

      if (this.hoveredShape && this.hoverRect?.visible()) {
        this.showHover(this.hoveredShape);
      }
    } else {
      console.warn('ImageDesignerService.updateSize: Calculated canvas positions are NaN', { canvasX, canvasY, width, height, canvasWidth, scale: this.scale() });
    }

    this.uiLayer?.batchDraw();
    this.workspaceLayer?.batchDraw();

    if (notify) {
      this.notifyChange();
    }
  }

  setScale(scale: number) {
    const clampedScale = Math.min(Math.max(scale, this.minScale), this.maxScale);

    if (!this.isBrowser) {
      this.scale.set(clampedScale);
      return;
    }

    this.scale.set(clampedScale);

    if (this.stage && this.canvasRect && this.workspaceLayer && this.uiLayer) {
      const container = this.stage.container() as HTMLDivElement;
      const imageSize = {
        width: this.canvasRect.width(),
        height: this.canvasRect.height()
      };

      // Update canvas positions and scales based on new scale
      this.updateSize(container, imageSize);

      this.transformer?.forceUpdate();
      this.uiLayer.batchDraw();
      this.workspaceLayer.batchDraw();
    }
  }

  zoomIn() {
    this.setScale(this.scale() + 0.1);
  }

  zoomOut() {
    this.setScale(this.scale() - 0.1);
  }

  setMinMaxScale(minScale: number, maxScale: number) {
    this.minScale = minScale;
    this.maxScale = maxScale;
    this.setScale(this.scale());
  }

  updateSnapSettings(settings: Partial<typeof this.snapSettings>) {
    this.snapSettings = { ...this.snapSettings, ...settings };
  }

  setCanvasBackground(config: GradientConfig | string, notify = true) {
    if (!this.canvasRect) return;

    if (typeof config === 'string') {
      this.canvasRect.fill(config);
      this.canvasRect.fillLinearGradientStartPoint(null as any);
      this.canvasRect.fillLinearGradientEndPoint(null as any);
      this.canvasRect.fillLinearGradientColorStops([]);
    } else {
      this.canvasRect.fill(null as any);
      this.canvasRect.fillLinearGradientStartPoint({ x: config.x0 || 0, y: config.y0 || 0 });
      this.canvasRect.fillLinearGradientEndPoint({ x: config.x1 || 0, y: config.y1 || 0 });
      this.canvasRect.fillLinearGradientColorStops(config.colorStops);
    }
    this.workspaceLayer?.batchDraw();
    if (notify) {
      this.notifyChange();
    }
  }

  reorderLayers(previousIndex: number, currentIndex: number) {
    if (!this.workspaceLayer || previousIndex === currentIndex) return;

    let updatedLayers: LayerConfig[] = [];
    this._layers.update(layers => {
      const newLayers = [...layers];
      moveItemInArray(newLayers, previousIndex, currentIndex);

      // Update Konva nodes Z-index based on the new array order.
      // Array: [Top, ..., Bottom]
      // Konva: [Bottom, ..., Top]
      // So we need to reverse the array when applying to Konva Z-indices.

      const reversedLayers = [...newLayers].reverse();
      reversedLayers.forEach((layer, index) => {
        const shape = this.workspaceLayer?.findOne('#' + layer.id);
        if (shape) {
          // Layers start from zIndex 1 because canvasRect is at 0
          shape.zIndex(index + 1);
        }
      });

      // Ensure canvasRect is at the bottom
      this.canvasRect?.zIndex(0);

      // Ensure transformer, selectionRect and hoverRect are always on top
      this.uiLayer?.moveToTop();
      this.maskOverlay?.moveToTop();
      this.transformer?.moveToTop();
      this.selectionRect?.moveToTop();
      this.hoverRect?.moveToTop();

      this.workspaceLayer?.batchDraw();
      this.uiLayer?.batchDraw();
      updatedLayers = newLayers;
      return newLayers;
    });

    if (updatedLayers.length > 0) {
      this.notifyChange();
    }
  }

  currentSnapshotVersion = 0;

  getSnapshot(): ImageDesignerSnapshot {
    return {
      version: this.currentSnapshotVersion,
      imageSize: {
        width: this.canvasRect?.width() || 0,
        height: this.canvasRect?.height() || 0
      },
      layers: this._layers().map(layer => {
        // Ensure that any temporary 'selected' property is not included in the snapshot
        const { selected, ...rest } = layer;
        return rest;
      }),
      background: this.canvasRect?.fill() || 'white',
      backgroundConfig: this.canvasRect?.fillLinearGradientColorStops()?.length ? {
        x0: this.canvasRect.fillLinearGradientStartPoint().x,
        y0: this.canvasRect.fillLinearGradientStartPoint().y,
        x1: this.canvasRect.fillLinearGradientEndPoint().x,
        y1: this.canvasRect.fillLinearGradientEndPoint().y,
        colorStops: this.canvasRect.fillLinearGradientColorStops()
      } : undefined
    };
  }

  async loadSnapshot(snapshot: ImageDesignerSnapshot, resetHistory = false) {
    if (!this.stage || !this.workspaceLayer || !this.canvasRect) {
      console.warn('loadSnapshot called but service is not fully initialized');
      return;
    }

    if (this.isSnapshotLoading) {
      console.log('loadSnapshot ignored - already loading');
      return;
    }

    this.isSnapshotLoading = true;
    try {
      console.log('loadSnapshot starting', snapshot);

      this.currentSnapshotVersion = snapshot.version ?? 0;
      // Clear current state
      this.selectedLayerId.set(null);
      this.transformer?.nodes([]);

      // Remove all shapes from workspace except canvasRect
      // Critical: iterate over a copy of the children array, as destroy() modifies it
      const children = [...this.workspaceLayer.getChildren()];
      children.forEach((child: any) => {
        if (child !== this.canvasRect) {
          child.destroy();
        }
      });

      const { imageSize, layers, background, backgroundConfig } = snapshot;

      // Update size BEFORE adding layers so that addLayer uses correct canvas position and scale
      this.updateSize(this.stage.container() as HTMLDivElement, imageSize);

      // Restore background
      if (backgroundConfig) {
        this.setCanvasBackground(backgroundConfig, false);
      } else if (background) {
        this.setCanvasBackground(background, false);
      }

      // Restore layers
      const reversedLayers = [...layers].reverse();
      const newLayers: LayerConfig[] = [];
      for (const layerConfig of reversedLayers) {
        const id = layerConfig.id || Math.random().toString(36).substr(2, 9);
        const configWithId = { ...layerConfig, id };
        // We add layers to Konva but don't update the signal inside addLayer
        await this.addLayer(configWithId, false);
        // We collect them in the same order as in addLayer(..., true) which is [newConfig, ...layers]
        newLayers.unshift(configWithId);
      }
      this._layers.set(newLayers);

      this.workspaceLayer.batchDraw();
      this.uiLayer?.batchDraw();
    } finally {
      this.isSnapshotLoading = false;
      if (resetHistory) {
        this.resetHistory();
      } else {
        this.notifyChange(false);
        this.updateHistorySignals();
      }
    }
  }

  async loadAllFonts(): Promise<void> {
    const fontPromises: Promise<void>[] = [];

    // Always load default font
    fontPromises.push(this.loadFont(this.defaultFont));

    this._layers().forEach(layer => {
      if (layer.type === 'text' && layer['fontFamily']) {
        fontPromises.push(this.loadFont(layer['fontFamily']));
      } else if (layer.type === 'text') {
        fontPromises.push(this.loadFont(this.defaultFont));
      }
    });
    await Promise.all(fontPromises);
  }

  loadFont(fontFamily: string): Promise<void> {
    if (!this.isBrowser || this.loadedFonts.has(fontFamily)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap`;
      link.onload = () => {
        this.loadedFonts.add(fontFamily);
        // Wait for font to be ready for rendering
        if ('fonts' in document) {
          (document as any).fonts.load(`1em "${fontFamily}"`).then(() => {
            resolve();
          }).catch(() => {
            resolve();
          });
        } else {
          // Fallback: small timeout
          setTimeout(() => resolve(), 100);
        }
      };
      link.onerror = () => {
        console.error(`Failed to load font: ${fontFamily}`);
        resolve();
      };
      document.head.appendChild(link);
    });
  }

  getLayerThumbnail(id: string, effectId?: string): string | null {
    if (!this.workspaceLayer) return null;
    const shape = this.workspaceLayer.findOne('#' + id);
    if (!shape) return null;

    try {
      if (effectId) {
        // Clone the shape to apply the effect without affecting the original
        const clone = shape.clone();
        const layer = this._layers().find(l => l.id === id);
        if (layer) {
          const tempConfig = { ...layer, effect: effectId };
          this.applyEffectsToShape(clone, tempConfig);
        }
        const dataUrl = clone.toDataURL({
          pixelRatio: 0.5,
          quality: 0.5
        });
        clone.destroy();
        return dataUrl;
      }

      // Create a small thumbnail of the shape
      return shape.toDataURL({
        pixelRatio: 0.5,
        quality: 0.5
      });
    } catch (e) {
      console.warn('Failed to generate thumbnail for layer', id, e);
      return null;
    }
  }

  async updateLayer(id: string, config: Partial<LayerConfig>) {
    const layer = this._layers().find(l => l.id === id);
    if (!layer) return;

    const shape = this.workspaceLayer?.findOne('#' + id);

    if (config['scaleX'] !== undefined && shape) {
      shape.scaleX(config['scaleX']);
    }
    if (config['scaleY'] !== undefined && shape) {
      shape.scaleY(config['scaleY']);
    }
    if (config['x'] !== undefined && shape) {
      shape.x(config['x']);
    }
    if (config['y'] !== undefined && shape) {
      shape.y(config['y']);
    }
    if (config['rotation'] !== undefined && shape) {
      shape.rotation(config['rotation']);
    }
    if (config['width'] !== undefined && shape && !(shape instanceof Konva.Text)) {
      shape.width(config['width']);
      shape.offsetX(shape.width() / 2);
    }
    if (config['height'] !== undefined && shape && !(shape instanceof Konva.Text)) {
      shape.height(config['height']);
      shape.offsetY(shape.height() / 2);
    }
    if (config['width'] !== undefined && shape instanceof Konva.Text) {
      shape.width(config['width']);
      shape.offsetX(shape.width() / 2);
    }

    if (shape) {
      this.updateShapeOriginalPosition(shape as Konva.Shape, true);
    }

    this._layers.update(layers =>
      layers.map(l => l.id === id ? { ...l, ...config } : l)
    );

    const updatedLayer = this._layers().find(l => l.id === id);

    if (shape && updatedLayer) {
      this.applyEffectsToShape(shape, updatedLayer);
    }

    // If font-related properties changed, ensure the font variant is loaded and applied
    if (this.isBrowser && shape instanceof Konva.Text && (
      config['fontFamily'] !== undefined ||
      config['fontWeight'] !== undefined ||
      config['fontStyle'] !== undefined
    )) {
      const family = config['fontFamily'] || shape.fontFamily();
      const weight = config['fontWeight'] || shape.getAttr('fontWeight') || 400;
      const isItalic = (config['fontStyle'] === 'italic') || (shape.fontStyle() || '').includes('italic');
      const fontStr = `${isItalic ? 'italic ' : ''}${weight} 12px "${family}"`;

      if (config['fontFamily']) {
        await this.loadFont(config['fontFamily']);
        this.workspaceLayer?.batchDraw();
      }

      try {
        await document.fonts.load(fontStr);
        this.workspaceLayer?.batchDraw();
      } catch (e) {
        console.warn('Failed to load font variant:', fontStr);
      }
    }

    if (shape) {
      if (config.fill !== undefined) {
        const type = config.type || layer.type;
        if (type === 'shape' || type === 'pattern') {
          // For SVG shapes and patterns, we can replace the color in the SVG data.
          const currentLayer = this._layers().find(l => l.id === id);
          const dataKey = type === 'shape' ? 'data' : 'patternImage';
          const dataUrl = currentLayer?.[dataKey];

          if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/svg+xml') &&
              config.fill && !config.fill.startsWith('data:image') && !config.fill.startsWith('http')) {
            const commaIndex = dataUrl.indexOf(',');
            if (commaIndex !== -1) {
              const header = dataUrl.substring(0, commaIndex);
              const isBase64 = header.includes('base64');
              const svgText = isBase64
                ? atob(dataUrl.substring(commaIndex + 1))
                : decodeURIComponent(dataUrl.substring(commaIndex + 1));

              const newFill = config.fill;
              // Replace both fill and stroke colors
              const newSvgText = svgText
                .replace(/fill="[#][0-9a-fA-F]{3,6}"/g, `fill="${newFill}"`)
                .replace(/fill='%23[0-9a-fA-F]{3,6}'/g, `fill='${newFill}'`)
                .replace(/stroke="[#][0-9a-fA-F]{3,6}"/g, `stroke="${newFill}"`)
                .replace(/stroke='%23[0-9a-fA-F]{3,6}'/g, `stroke='${newFill}'`);

              const newDataUrl = isBase64
                ? `${header},${btoa(newSvgText)}`
                : `${header},${encodeURIComponent(newSvgText)}`;

              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                if (type === 'shape') {
                  (shape as Konva.Image).image(img);
                } else {
                  shape.setAttr('fillPatternImage', img);
                }
                this.workspaceLayer?.batchDraw();
              };
              img.src = newDataUrl;
              // Update the data in the signal too
              this._layers.update(layers => layers.map(l => l.id === id ? { ...l, [dataKey]: newDataUrl } : l));
            }
          } else if (config.fill && (config.fill.startsWith('data:image') || config.fill.startsWith('http'))) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              shape.setAttr('fillPatternImage', img);
              this.workspaceLayer?.batchDraw();
            };
            img.src = config.fill;
            if (type === 'pattern') {
              this._layers.update(layers => layers.map(l => l.id === id ? { ...l, patternImage: config.fill } : l));
            }
          } else {
            shape.setAttr('fill', config.fill);
            if (type !== 'pattern') {
              shape.setAttr('fillPatternImage', null);
            }
          }
        } else if (config.fill && (config.fill.startsWith('data:image') || config.fill.startsWith('http'))) {
          // It's a pattern for other types
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            shape.setAttr('fillPatternImage', img);
            this.workspaceLayer?.batchDraw();
          };
          img.src = config.fill;
        } else {
          shape.setAttr('fill', config.fill);
          shape.setAttr('fillPatternImage', null);
        }
      }
      if (config['opacity'] !== undefined) {
        shape.opacity(config['opacity']);
      }
      if (config['text'] !== undefined && shape instanceof Konva.Text) {
        shape.text(config['text']);
        // Update offset because content changed
        shape.offsetX(shape.width() / 2);
        shape.offsetY(shape.height() / 2);
      }
      if (config['fontSize'] !== undefined && shape instanceof Konva.Text) {
        shape.fontSize(config['fontSize']);
        // Update offset because size changed
        shape.offsetX(shape.width() / 2);
        shape.offsetY(shape.height() / 2);
      }
      if (config['width'] !== undefined && shape instanceof Konva.Text) {
        shape.width(config['width'] * this.scale());
        // Update offset because width changed
        shape.offsetX(shape.width() / 2);
        shape.offsetY(shape.height() / 2);
      }
      if (config['fontFamily'] !== undefined && shape instanceof Konva.Text) {
        shape.fontFamily(config['fontFamily']);
      }
      if (config['fontWeight'] !== undefined && shape instanceof Konva.Text) {
        shape.setAttr('fontWeight', config['fontWeight']);
        // Konva's fontStyle property is used for weight and style.
        // If we have numeric fontWeight, we can try to use it directly in fontStyle as well.
        const currentStyle = (shape.fontStyle() || '').includes('italic') ? 'italic' : '';
        shape.fontStyle(`${config['fontWeight']} ${currentStyle}`.trim());
        // Update offset because size changed
        shape.offsetX(shape.width() / 2);
        shape.offsetY(shape.height() / 2);
        // Force text refresh to update layout before transformer update
        this.workspaceLayer?.batchDraw();
      }
      if (config['fontStyle'] !== undefined && shape instanceof Konva.Text) {
        // If fontStyle is provided, it might override fontWeight if we are not careful.
        // But usually fontStyle in this app means 'italic' or 'normal'.
        const currentWeight = shape.getAttr('fontWeight') || 400;
        if (config['fontStyle'] === 'italic') {
          shape.fontStyle(currentWeight + ' italic');
        } else {
          shape.fontStyle(currentWeight.toString());
        }
        // Update offset because size changed
        shape.offsetX(shape.width() / 2);
        shape.offsetY(shape.height() / 2);
        // Force text refresh to update layout before transformer update
        this.workspaceLayer?.batchDraw();
      }
      if (config['textDecoration'] !== undefined && shape instanceof Konva.Text) {
        shape.textDecoration(config['textDecoration']);
      }
      if (config['align'] !== undefined && shape instanceof Konva.Text) {
        shape.align(config['align']);
      }
      if (config['lineHeight'] !== undefined && shape instanceof Konva.Text) {
        shape.lineHeight(config['lineHeight']);
      }
      if (config['letterSpacing'] !== undefined && shape instanceof Konva.Text) {
        shape.letterSpacing(config['letterSpacing']);
      }
      if (config['textCase'] !== undefined && shape instanceof Konva.Text) {
        const text = layer.text || '';
        if (config['textCase'] === 'upper') {
          shape.text(text.toUpperCase());
        } else {
          shape.text(text);
        }
      }

      this.workspaceLayer?.batchDraw();
      this.uiLayer?.batchDraw();
      this.transformer?.forceUpdate();
      this.updateSelectionBorders();
      this.notifyChange();

      // If text properties changed, update again after a short delay
      // to handle cases where text layout hasn't updated yet.
      if (shape instanceof Konva.Text && (
        config['fontFamily'] !== undefined ||
        config['fontSize'] !== undefined ||
        config['text'] !== undefined ||
        config['fontWeight'] !== undefined ||
        config['fontStyle'] !== undefined
      )) {
        setTimeout(() => {
          if (shape instanceof Konva.Text) {
            // Re-calculate offsets one more time as dimensions might have changed
            // after the browser fully applied the font metrics.
            shape.offsetX(shape.width() / 2);
            shape.offsetY(shape.height() / 2);
          }

          if (this.transformer) {
            // Re-assigning nodes is the most reliable way to force Transformer
            // to re-calculate its boundaries and adapt to the new text size.
            const currentNodes = this.transformer.nodes();
            this.transformer.nodes([]);
            this.transformer.nodes(currentNodes);
          }

          this.workspaceLayer?.batchDraw();
          this.uiLayer?.batchDraw();
          this.transformer?.forceUpdate();
          this.updateSelectionBorders();
        }, 100);
      }
    }
  }

  getBase64Image(): string | undefined {
    if (!this.stage || !this.canvasRect) {
      return undefined;
    }

    // Capture original state
    const wasUiLayerVisible = this.uiLayer?.visible() || false;
    const originalStroke = this.canvasRect.stroke();
    const originalStrokeWidth = this.canvasRect.strokeWidth();

    // Hide UI layer to exclude transformers, snap lines, etc. from export
    this.uiLayer?.visible(false);

    // Temporarily hide canvas border
    this.canvasRect.stroke(null);
    this.canvasRect.strokeWidth(0);

    // Get the client rect of the canvas area relative to the stage
    const rect = this.canvasRect.getClientRect({ relativeTo: this.stage });

    // Ensure we are in a browser
    if (!this.isBrowser) {
      return undefined;
    }

    try {
      const dataUrl = this.stage.toDataURL({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        pixelRatio: 2 // High quality
      });

      return dataUrl;
    } catch (e) {
      console.error('Failed to get base64 image:', e);
      return undefined;
    } finally {
      // Restore UI layer visibility
      if (wasUiLayerVisible) {
        this.uiLayer?.visible(true);
      }
      // Restore canvas border
      this.canvasRect.stroke(originalStroke);
      this.canvasRect.strokeWidth(originalStrokeWidth);
    }
  }

  downloadImage() {
    if (!this.stage || !this.canvasRect) {
      return;
    }

    // Capture original state
    const wasUiLayerVisible = this.uiLayer?.visible() || false;
    const originalStroke = this.canvasRect.stroke();
    const originalStrokeWidth = this.canvasRect.strokeWidth();

    // Hide UI layer to exclude transformers, snap lines, etc. from export
    this.uiLayer?.visible(false);

    // Temporarily hide canvas border
    this.canvasRect.stroke(null);
    this.canvasRect.strokeWidth(0);

    // Get the client rect of the canvas area relative to the stage
    const rect = this.canvasRect.getClientRect({ relativeTo: this.stage });

    // Ensure we are in a browser
    if (!this.isBrowser) {
      return;
    }

    try {
      const dataUrl = this.stage.toDataURL({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        pixelRatio: 2 // High quality
      });

      const timestamp = new Date().getTime();
      const filename = `${timestamp}.png`;

      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error('Failed to export image:', e);
    } finally {
      // Restore UI layer visibility
      if (wasUiLayerVisible) {
        this.uiLayer?.visible(true);
      }
      // Restore canvas border
      this.canvasRect.stroke(originalStroke);
      this.canvasRect.strokeWidth(originalStrokeWidth);
    }
  }

  private notifyChange(incrementVersion = true) {
    if (this.isSnapshotLoading) return;
    if (incrementVersion) {
      this.currentSnapshotVersion++;
      this.saveHistory();
    }
    this._change$.next();
  }

  private saveHistory() {
    const snapshot = this.getSnapshot();
    // Don't save if it's the same as the last one
    if (this.undoStack.length > 0) {
      const last = this.undoStack[this.undoStack.length - 1];
      if (JSON.stringify(last.layers) === JSON.stringify(snapshot.layers) &&
          JSON.stringify(last.imageSize) === JSON.stringify(snapshot.imageSize) &&
          last.background === snapshot.background &&
          JSON.stringify(last.backgroundConfig) === JSON.stringify(snapshot.backgroundConfig)) {
        return;
      }
    }
    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.historyLimit) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.updateHistorySignals();
  }

  undo() {
    if (this.undoStack.length <= 1) return;
    const current = this.undoStack.pop();
    this.redoStack.push(current);
    const previous = this.undoStack[this.undoStack.length - 1];
    this.loadSnapshot(previous, false);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const next = this.redoStack.pop();
    this.undoStack.push(next);
    this.loadSnapshot(next, false);
  }

  private updateHistorySignals() {
    this.canUndo.set(this.undoStack.length > 1);
    this.canRedo.set(this.redoStack.length > 0);
  }

  resetHistory() {
    this.undoStack = [this.getSnapshot()];
    this.redoStack = [];
    this.updateHistorySignals();
  }

  private applyEffectsToShape(shape: Konva.Node, config: LayerConfig) {
    const filters: any[] = [];
    let tintR = 0;
    let tintG = 0;
    let tintB = 0;

    if (config['effect'] === 'grayscale') {
      filters.push(Konva.Filters.Grayscale);
    } else if (config['effect'] === 'sepia') {
      filters.push(Konva.Filters.Sepia);
    } else if (config['effect'] === 'invert') {
      filters.push(Konva.Filters.Invert);
    } else if (config['effect'] === 'cold') {
      tintR = -0.15;
      tintG = 0.05;
      tintB = 0.25;
      filters.push(TintFilter);
    } else if (config['effect'] === 'warm') {
      tintR = 0.25;
      tintG = 0.1;
      tintB = -0.15;
      filters.push(TintFilter);
    }

    if (config['temperatureEnabled']) {
      const temp = (config['temperature'] ?? 0) / 100; // -1 to 1
      if (!filters.includes(TintFilter)) filters.push(TintFilter);
      if (temp > 0) {
        tintR += (1 - tintR) * temp * 0.2;
        tintG += (1 - tintG) * temp * 0.1;
        tintB -= (1 + tintB) * temp * 0.2;
      } else {
        const absTemp = Math.abs(temp);
        tintR -= (1 + tintR) * absTemp * 0.2;
        tintG += (1 - tintG) * absTemp * 0.1;
        tintB += (1 - tintB) * absTemp * 0.2;
      }
    }

    shape.setAttr('tintR', tintR);
    shape.setAttr('tintG', tintG);
    shape.setAttr('tintB', tintB);

    if (config['blurEnabled']) {
      filters.push(Konva.Filters.Blur);
      shape.setAttr('blurRadius', config['blur'] ?? 0);
    }

    if (config['brightnessEnabled']) {
      filters.push(Konva.Filters.Brighten);
      shape.setAttr('brightness', config['brightness'] ?? 0);
    }

    if (config['contrastEnabled']) {
      filters.push(Konva.Filters.Contrast);
      shape.setAttr('contrast', config['contrast'] ?? 0);
    }

    if (config['saturationEnabled']) {
      filters.push(Konva.Filters.HSL);
      shape.setAttr('saturation', config['saturation'] ?? 0);
    }

    if (config['vibranceEnabled']) {
      // Konva doesn't have Vibrance by default, using HSL saturation as fallback
      if (!filters.includes(Konva.Filters.HSL)) {
        filters.push(Konva.Filters.HSL);
      }
      shape.setAttr('saturation', (config['saturation'] ?? 0) + (config['vibrance'] ?? 0) / 2);
    }

    if (config['borderEnabled']) {
      shape.setAttr('stroke', config['borderColor'] || config['fill'] || '#000000');
      shape.setAttr('strokeWidth', config['border'] ?? 0);
    } else {
      shape.setAttr('strokeWidth', 0);
    }

    if (config['cornerRadiusEnabled']) {
      const radius = config['cornerRadius'] ?? 0;
      if (shape instanceof Konva.Rect || shape instanceof Konva.Image) {
        shape.cornerRadius(radius);
      }
    } else {
      if (shape instanceof Konva.Rect || shape instanceof Konva.Image) {
        shape.cornerRadius(0);
      }
    }

    if (config['shadowEnabled']) {
      shape.setAttr('shadowColor', config['shadowColor'] || '#000000');
      shape.setAttr('shadowBlur', config['shadowBlur'] ?? 15);
      shape.setAttr('shadowOpacity', (config['shadowOpacity'] ?? 100) / 100);
      shape.setAttr('shadowOffset', {
        x: config['shadowOffsetX'] ?? 0,
        y: config['shadowOffsetY'] ?? 0
      });
    } else {
      shape.setAttr('shadowOpacity', 0);
    }

    shape.filters(filters);

    if (filters.length > 0 || (config['cornerRadiusEnabled'] && config['cornerRadius'] > 0)) {
      // In Konva, caching is required for filters to work, and for cornerRadius to clip Image
      shape.clearCache();
      shape.cache();
    } else {
      shape.clearCache();
    }

    this.workspaceLayer?.batchDraw();
  }

  destroy() {
    this.isInitialized.set(false);
    if (this.isBrowser) {
      window.removeEventListener('mouseup', this.handleGlobalMouseUp);
      window.removeEventListener('touchend', this.handleGlobalMouseUp);
      window.removeEventListener('mousemove', this.handleGlobalMouseMove);
      window.removeEventListener('touchmove', this.handleGlobalMouseMove);
    }
    this.resizeObserver?.disconnect();
    this.stage?.off('mousedown touchstart');
    this.stage?.off('mousemove touchmove');
    this.stage?.off('mouseup touchend');
    this.hideHover();
    this.stage?.destroy();
    this.stage = undefined;
    this.uiLayer = undefined;
    this.workspaceLayer = undefined;
    this.canvasRect = undefined;
    this.maskOverlay = undefined;
    this.transformer = undefined;
    this.selectionRect = undefined;
    this.hoverRect = undefined;
    this.selectionBordersGroup = undefined;
  }
}
