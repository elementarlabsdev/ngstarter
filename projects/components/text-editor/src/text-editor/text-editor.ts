import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input, output,
  viewChild,
  DOCUMENT,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { TEXT_EDITOR, TextEditorAPI } from '../types';

import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import { Blockquote } from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Code from '@tiptap/extension-code';
import History from '@tiptap/extension-history';
import Dropcursor from '@tiptap/extension-dropcursor';
import Youtube from '@tiptap/extension-youtube';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { FloatingMenu } from '@tiptap/extension-floating-menu';
import ImageUploadingPlaceholderExtension
  from '../extensions/image-uploading-placeholder';
import Heading from '@tiptap/extension-heading';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';

@Component({
  selector: 'ngs-text-editor',
  exportAs: 'ngsTextEditor',
  imports: [
  ],
  providers: [
    {
      provide: TEXT_EDITOR,
      useExisting: forwardRef(() => TextEditor)
    }
  ],
  templateUrl: './text-editor.html',
  styleUrl: './text-editor.scss',
  host: {
    'class': 'ngs-text-editor'
  }
})
export class TextEditor {
  private _platformId = inject(PLATFORM_ID);
  private _document = inject(DOCUMENT);
  private _cdr = inject(ChangeDetectorRef);
  private _injector = inject(Injector);
  private _content = viewChild.required<ElementRef>('content');
  private _bubbleMenu = viewChild.required<ElementRef>('bubbleMenu');
  private _imageBubbleMenu = viewChild.required<ElementRef>('imageBubbleMenu');
  private _floatingMenu = viewChild.required<ElementRef>('floatingMenu');
  protected _value = '';
  protected editor: Editor;

  content = input('');
  extensions = input([]);
  contentMaxHeight = input<number>();
  placeholder = input('Write something …');
  imageUploadFn = input<(file: Blob) => Promise<string>>();

  readonly contentChange = output<string>();

  get api(): TextEditorAPI {
    return {
      isCommandDisabled: (command: string, options?: any) => this.isCommandDisabled(command, options),
      isActive: (command: string, options?: any) => this.editor?.isActive(command, options),
      runCommand: (command: string, options?: any) => this._runCommand(command, options),
      editor: () => this.editor
    }
  }

  ngOnInit() {
    if (isPlatformServer(this._platformId)) {
      return;
    }
    this._init();
  }

  isCommandDisabled(command: string, options?: any): boolean | null {
    if (!this.editor) {
      return true;
    }

    try {
      const canFocus = this.editor.can().chain().focus() as any;
      return !canFocus[command](options).run() || null;
    } catch (e) {
      return true;
    }
  }

  ngOnDestroy() {
    this.editor?.destroy();
  }

  private _runCommand(command: string, options?: any): void {
    if (!this.editor) {
      return;
    }

    const chainFocus = this.editor.chain().focus() as any;
    chainFocus[command](options).run();
  }

  private _init(): void {
    const extensions = [
      ...this.extensions(),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      HorizontalRule,
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Blockquote,
      CodeBlock,
      BulletList,
      OrderedList,
      ListItem,
      Code,
      History,
      Dropcursor,
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      ImageUploadingPlaceholderExtension(this._injector, {
        uploadFn: this.imageUploadFn(),
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      Link.configure({
        openOnClick: false,
        defaultProtocol: 'https',
      }),
      Placeholder.configure({
        placeholder: this.placeholder()
      }),
      // BubbleMenu.configure({
      //   element: this._imageBubbleMenu().nativeElement,
      //   shouldShow: ({ editor, view, state, oldState, from, to }) => {
      //     // return editor.isActive('image');
      //     return false;
      //   },
      // }),
      BubbleMenu.configure({
        element: this._bubbleMenu().nativeElement,
        tippyOptions: {
          appendTo: this._document.body,
          zIndex: 999
        },
        shouldShow: ({ editor, view, state, oldState, from, to }) => {
          return !editor.isActive('image') &&
            !editor.isActive('youtube') &&
            !editor.isActive('imageUploadingPlaceholder') &&
            !editor.view.state.selection.empty;
        },
      })
    ];

    if (this._floatingMenu()) {
      extensions.push(
        FloatingMenu.configure({
          element: this._floatingMenu().nativeElement
        })
      );
    }

    this.editor = new Editor({
      element: this._content().nativeElement,
      extensions,
      content: this.content(),
      onUpdate: ({ editor }) => {
        this._value = !editor.isEmpty ? editor.getHTML() : '';
        this.contentChange.emit(this._value);
      }
    });
    this._cdr.detectChanges();
  }
}
