import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsCommentEditorCommand]',
  standalone: true,
  host: {
    '[class.button]': 'true'
  }
})
export class CommentEditorCommandDirective {

}
