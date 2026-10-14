import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentEditorBlockBase } from '@ngstarter-ui/components/content-editor';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

export interface BookmarkContent { title: string; url: string; }
@Component({
  selector: 'app-bookmark-block', imports: [FormField, Label, Input],
  templateUrl: './bookmark-block.html', changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookmarkBlock extends ContentEditorBlockBase<BookmarkContent> {
  change(field: keyof BookmarkContent, value: string): void { this.save({ ...this.latestContent(), [field]: value }); }
}
