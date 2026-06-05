import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsCommentEditorCommand]',
  host: {
    '[class.button]': 'true'
  }
})
export class CommentEditorCommandDirective {
}
