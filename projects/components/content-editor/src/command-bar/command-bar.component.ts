import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Dialog } from '@ngstarter-ui/components/dialog';
import {
  NgsHeadlessEditor, NgsHeadlessEditorSelection, NGS_HEADLESS_EDITOR_TOGGLE_BOLD, NGS_HEADLESS_EDITOR_TOGGLE_ITALIC,
  NGS_HEADLESS_EDITOR_TOGGLE_CODE, NGS_HEADLESS_EDITOR_TOGGLE_STRIKE,
  NGS_HEADLESS_EDITOR_TOGGLE_UNDERLINE, NGS_HEADLESS_EDITOR_TOGGLE_SUPERSCRIPT,
  NGS_HEADLESS_EDITOR_TOGGLE_SUBSCRIPT, NGS_HEADLESS_EDITOR_SET_LINK, NGS_HEADLESS_EDITOR_UNSET_LINK,
  NGS_HEADLESS_EDITOR_SET_TEXT_COLOR, NGS_HEADLESS_EDITOR_UNSET_TEXT_COLOR,
  NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR, NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR
} from '@ngstarter-ui/components/headless-editor';
import { ContentEditorContentEditableDirective } from '../content-editor-content-editable.directive';
import { AddLinkDialog } from '../_dialogs/add-link/add-link.dialog';
import { EditLinkDialog } from '../_dialogs/edit-link/edit-link.dialog';
import { TextColorComponent } from '../text-color/text-color.component';

@Component({
  selector: 'ngs-command-bar',
  imports: [Button, Icon, Menu, MenuItem, MenuTrigger, TextColorComponent],
  templateUrl: './command-bar.component.html',
  styleUrl: './command-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-command-bar',
    '(mousedown)': 'preserveSelection($event)'
  }
})
export class CommandBarComponent {
  readonly editor = inject(NgsHeadlessEditor);
  private readonly dialog = inject(Dialog);
  readonly observedElement = input<HTMLElement | null>(null);
  readonly alignment = computed(() => this.region()?.alignment() ?? 'left');
  private savedSelection: { region: ContentEditorContentEditableDirective; selection: NgsHeadlessEditorSelection } | null = null;

  private region() { return ContentEditorContentEditableDirective.forElement(this.observedElement()); }
  toggleBold() { this.editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD); }
  toggleItalic() { this.editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_ITALIC); }
  toggleCode() { this.editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_CODE); }
  toggleStrike() { this.editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_STRIKE); }
  toggleUnderline() { this.editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_UNDERLINE); }
  toggleSuperscript() { this.editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_SUPERSCRIPT); }
  toggleSubscript() { this.editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_SUBSCRIPT); }
  isLinkActive() { return this.editor.isMarkActive('link'); }
  isActive(tag: string) {
    return this.editor.isMarkActive(({ strong: 'bold', em: 'italic', s: 'strike', u: 'underline', sup: 'superscript', sub: 'subscript' } as Record<string, string>)[tag] ?? tag);
  }
  setTextAlignment(value: string) { this.restoreSelection()?.setAlignment(value); }
  isTextAlignment(value: string) { return this.alignment() === value; }
  addLink() { this.openLinkDialog(false); }
  editLink() { this.openLinkDialog(true); }

  private openLinkDialog(edit: boolean) {
    this.retainSelection();
    const saved = this.savedSelection;
    if (!saved) return;
    const target = saved.region.region.editor;
    const mark = target.getActiveMark('link');
    const ref = edit
      ? this.dialog.open(EditLinkDialog, { data: { href: mark?.attrs?.['href'], openInNewTab: mark?.attrs?.['target'] === '_blank' }, width: '500px', restoreFocus: false })
      : this.dialog.open(AddLinkDialog, { width: '500px', restoreFocus: false });
    ref.afterClosed().subscribe((value: { href: string; openInNewTab: boolean } | undefined) => {
      if (!this.restoreSelection()) return;
      if (value) {
        if (value.href) this.editor.execute(NGS_HEADLESS_EDITOR_SET_LINK, { href: value.href, target: value.openInNewTab ? '_blank' : '_self' });
        else this.editor.execute(NGS_HEADLESS_EDITOR_UNSET_LINK);
      }
      this.restoreSelectionAfterOverlay();
    });
  }
  protected preserveSelection(event: MouseEvent) {
    event.preventDefault();
    this.region()?.activate();
    this.retainSelection();
  }
  protected retainSelection(): void {
    if (this.savedSelection) return;
    const region = this.region();
    const selection = region?.region.editor.selection();
    if (region && selection) this.savedSelection = { region, selection };
  }
  private restoreSelection(): ContentEditorContentEditableDirective | undefined {
    const saved = this.savedSelection;
    if (!saved) return this.region();
    if (!this.observedElement()?.isConnected || saved.region.region.editor !== this.editor.inlineTarget()) return;
    saved.region.region.editor.setSelection(saved.selection);
    return saved.region;
  }
  protected restoreSelectionAfterOverlay(): void {
    // MenuTrigger restores its own focus after emitting menuClosed.
    // Restore the editor afterwards, using model points rather than old DOM nodes.
    Promise.resolve().then(() => {
      const region = this.restoreSelection();
      this.savedSelection = null;
      if (region && this.observedElement()?.isConnected) region.focus();
    });
  }
  protected preventMenuClose(event: MouseEvent) { event.stopPropagation(); event.preventDefault(); }
  protected onTextColorChanged(color: string) {
    const region = this.restoreSelection();
    if (!region) return;
    if (color) this.editor.execute(NGS_HEADLESS_EDITOR_SET_TEXT_COLOR, color);
    else this.editor.execute(NGS_HEADLESS_EDITOR_UNSET_TEXT_COLOR);
    region.focus();
  }
  protected onBackgroundColorChanged(color: string) {
    const region = this.restoreSelection();
    if (!region) return;
    if (color) this.editor.execute(NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR, color);
    else this.editor.execute(NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR);
    region.focus();
  }
}
