import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicCommentEditorExample
} from '../_examples/basic-comment-editor-example/basic-comment-editor-example';
import {
  CommentEditorWithToolbarExample
} from '../_examples/comment-editor-with-toolbar-example/comment-editor-with-toolbar-example';
import {
  CommentEditorWithFullViewModeExample
} from '../_examples/comment-editor-with-full-view-mode-example/comment-editor-with-full-view-mode-example';
import {
  CommentEditorWithUploadErrorExample
} from '../_examples/comment-editor-with-upload-error-example/comment-editor-with-upload-error-example';
import {
  CommentEditorWithCustomIconsExample
} from '../_examples/comment-editor-with-custom-icons-example/comment-editor-with-custom-icons-example';
import {
  CommentEditorCancelButtonAlwaysVisibleExample
} from '../_examples/comment-editor-cancel-button-always-visible-example/comment-editor-cancel-button-always-visible-example';
import {
  CommentEditorCustomButtonLabelsExample
} from '../_examples/comment-editor-custom-button-labels-example/comment-editor-custom-button-labels-example';
import {
  CommentEditorWithMaxContentHeightExample
} from '../_examples/comment-editor-with-max-content-height-example/comment-editor-with-max-content-height-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicCommentEditorExample,
    CommentEditorWithToolbarExample,
    CommentEditorWithFullViewModeExample,
    CommentEditorWithUploadErrorExample,
    CommentEditorWithCustomIconsExample,
    CommentEditorCancelButtonAlwaysVisibleExample,
    CommentEditorCustomButtonLabelsExample,
    CommentEditorWithMaxContentHeightExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
