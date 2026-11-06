import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Cell, CellDef, ColumnDef, HeaderCell, HeaderCellDef, HeaderRow, HeaderRowDef, Row, RowDef, Table } from '@ngstarter-ui/components/table';

@Component({
  imports: [Table, ColumnDef, HeaderCell, HeaderCellDef, Cell, CellDef, HeaderRow, HeaderRowDef, Row, RowDef],
  templateUrl: './api.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Api {
  readonly columns = ['name', 'description'];
  readonly properties = [
    { name: 'value / valueChange', description: 'model<WhiteboardDocument>. Version 1 document with an elements array. Defaults to an empty board. Assigning a new document resets undo/redo.' },
    { name: 'tool / toolChange', description: 'model<WhiteboardTool>. select, hand, pencil, rectangle, diamond, ellipse, arrow, line, text, note or eraser. Default: pencil.' },
    { name: 'title', description: 'string. Board title and accessible canvas label. Default: Whiteboard.' },
    { name: 'subtitle', description: 'string. Optional board name below the Whiteboard title.' },
    { name: 'locale', description: "'en' | 'ru'. Language for the built-in controls, menus and dialogs. Default: en." },
    { name: 'drawingStyle / drawingStyleChange', description: 'model<WhiteboardStyle>. Stroke, fill, strokeWidth, opacity and lineStyle used for new objects. Text and notes use fontSize, optional fontFamily and optional textAlign. The style also updates on selection.' },
    { name: 'toolLocked / toolLockedChange', description: 'model<boolean>. Keep the active tool after creating a shape, line, arrow, text or note. Default: true. New objects are always selected. When unlocked, the board switches to Select. Pencil stays active for continuous drawing.' },
    { name: 'pressureSensitive / pressureSensitiveChange', description: 'model<boolean>. Record pen pressure for variable-width pencil strokes. Mouse and touch keep a uniform width. Default: false.' },
    { name: 'readonly', description: 'boolean. Disables edits, history changes and import; keeps pan, zoom and export available. Default: false.' },
    { name: 'showToolbar', description: 'boolean. Shows built-in controls. Default: true.' },
    { name: 'showGrid / showGridChange', description: 'model<boolean>. Shows the decorative dot grid. Default: true.' },
    { name: 'showProperties / showPropertiesChange', description: 'model<boolean>. Shows the floating style panel. Default: true.' },
    { name: 'colors', description: 'string[]. Stroke color presets for ColorSwitcher.' },
    { name: 'selectionChange', description: 'readonly WhiteboardElement[]. Emitted when selected objects change.' },
    { name: 'viewportChange', description: 'WhiteboardViewport { x, y, zoom }. Emitted on pan or zoom.' },
    { name: 'exported', description: 'string. PNG data URL emitted by exportPng() or the Export button.' },
    { name: 'importError', description: 'Error. Emitted when the file picker cannot read a valid document. importJson() throws validation errors to its caller.' },
  ];
  readonly methods = [
    { name: 'undo() / redo()', description: 'Undo or redo one edit; canUndo() and canRedo() expose readonly signals. History keeps up to 100 edits.' },
    { name: 'clear()', description: 'Remove all objects in one undoable operation. The built-in menu asks for confirmation.' },
    { name: 'deleteSelection() / duplicateSelection()', description: 'Remove or duplicate the current selection in one undoable operation.' },
    { name: 'zoomIn() / zoomOut() / resetView()', description: 'Zoom in/out or return to 100% at the origin. Zoom range: 10–500%.' },
    { name: 'fitToContent()', description: 'Center the document and fit its bounds in the current viewport.' },
    { name: 'redraw()', description: 'Repaint after loading a custom font used by canvas elements. Text objects support fontFamily and textAlign; consuming applications load the font.' },
    { name: 'exportPng(options?)', description: 'Returns a PNG data URL, or null before browser initialization. Exports all content without selection controls. Options: pixelRatio (default 2), backgroundColor (default white), padding (default 32).' },
    { name: 'exportJson()', description: 'Returns the portable versioned document as JSON, without viewport or undo history.' },
    { name: 'importJson(json)', description: 'Validates and loads JSON, resets history and fits the content. Throws on invalid input. No-op in readonly mode.' },
    { name: 'parseWhiteboardDocument(json)', description: 'Standalone exported parser for validating saved documents before assigning value.' },
  ];
  readonly tokens = [
    { name: '--ngs-whiteboard-height', description: 'Component height. Default: 40rem. Also supports normal CSS height on the host.' },
    { name: '--ngs-whiteboard-bg', description: 'Canvas surface. Default: --ngs-color-surface.' },
    { name: '--ngs-whiteboard-grid-color', description: 'Dot grid color. Default: --ngs-color-border.' },
    { name: '--ngs-whiteboard-panel-bg', description: 'Floating controls surface. Default: --ngs-color-surface.' },
    { name: '--ngs-whiteboard-panel-shadow', description: 'Floating controls shadow. Default: --ngs-shadow-sm.' },
  ];
}
