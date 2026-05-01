import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef, forwardRef,
  inject,
  input, OnDestroy,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import {
  CONTENT_BUILDER,
  CONTENT_EDITOR_BLOCK,
  ContentEditorDataBlock
} from '../../types';
import { ContentBuilderStore } from '../../content-builder.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { Compartment } from '@codemirror/state';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Button } from '@ngstarter-ui/components/button';
import { githubLight } from '@uiw/codemirror-theme-github';
import { indentWithTab } from "@codemirror/commands"
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';
import { DOCUMENT } from '@angular/common';

export interface ContentEditorCodeBlockSettings {
  language: string;
}

export interface ContentEditorCodeLanguage {
  language: string;
  name: string;
  library: () => Promise<any>;
}

@Component({
  selector: 'ngs-code-block',
  imports: [
    Menu,
    MenuItem,
    MenuTrigger,
    Button
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.scss',
  providers: [
    {
      provide: CONTENT_EDITOR_BLOCK,
      useExisting: forwardRef(() => CodeBlockComponent),
      multi: true
    }
  ],
  host: {
    'class': 'ngs-code-block',
  }
})
export class CodeBlockComponent implements OnInit, OnDestroy, ContentEditorDataBlock {
  private _store = inject(ContentBuilderStore);
  private _contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);
  private _destroyRef = inject(DestroyRef);
  private document = inject(DOCUMENT);

  private _contentRef = viewChild.required<ElementRef<HTMLParagraphElement>>('contentRef');

  id = input.required<string>();
  content = input.required<string>();
  settings = input.required<ContentEditorCodeBlockSettings>();
  index = input.required<number>();
  placeholder = input('Write your code here');

  protected _languageList = signal<ContentEditorCodeLanguage[]>([
    {
      language: 'none',
      name: 'None',
      library: () => new Promise(() => {})
    },
    {
      language: 'angular',
      name: 'Angular',
      library: () => import('@codemirror/lang-angular').then(lang => lang.angular())
    },
    {
      language: 'javascript',
      name: 'JavaScript',
      library: () => import('@codemirror/lang-javascript').then(lang => lang.javascript())
    },
    {
      language: 'typescript',
      name: 'TypeScript',
      library: () => import('@codemirror/lang-javascript').then(lang => lang.javascript({ typescript: true }))
    },
    {
      language: 'html',
      name: 'HTML',
      library: () => import('@codemirror/lang-html').then(lang => lang.html())
    },
    {
      language: 'css',
      name: 'CSS',
      library: () => import('@codemirror/lang-css').then(lang => lang.css())
    },
    {
      language: 'sass',
      name: 'Sass',
      library: () => import('@codemirror/lang-sass').then(lang => lang.sass())
    },
    {
      language: 'json',
      name: 'JSON',
      library: () => import('@codemirror/lang-json').then(lang => lang.json())
    }
  ]);
  protected _code = signal<string>('');
  protected _language = signal<ContentEditorCodeLanguage>(this._languageList()[0]);
  protected _isEmpty = signal<boolean>(true);

  private _editorView!: EditorView;
  private _editorLanguage = new Compartment();
  readonly initialized = signal(false);

  async ngOnInit() {
    const codeLanguage = this._languageList().find(
      codeLanguage => codeLanguage.language === this.settings().language
    );

    if (codeLanguage) {
      this._language.set(codeLanguage);
    }

    this._code.set(this.content() || '');
    this._isEmpty.set(this._code().trim().length === 0);
    this._contentBuilder
      .focusChanged
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        if (this._store.focusedBlockId() === this.id()) {
          this.focus();
        }
      });
    this._editorView = new EditorView({
      doc: this._code(),
      parent: this._contentRef().nativeElement,
      extensions: [
        basicSetup,
        githubLight,
        keymap.of([indentWithTab]),
        this._editorLanguage.of([]),
        EditorView.updateListener.of((v: ViewUpdate) => {
          if (v.docChanged) {
            this.update();
          }
        })
      ],
    });
    await this.selectLanguage(this._language());
    this._editorView.contentDOM.style.width = '0';
    this._editorView.focus();
    this.initialized.set(true);
  }

  ngOnDestroy() {
    this._editorView.destroy();
  }

  focus() {
    this._editorView.focus();
  }

  getData(): any {
    return {
      content: this._editorView.state.doc.toString(),
      settings: {
        ...this.settings(),
        language: this._language().language
      }
    };
  }

  isEmpty(): boolean {
    return this._editorView.state.doc.toString().trim().length === 0;
  }

  protected async selectLanguage(codeLanguage: ContentEditorCodeLanguage) {
    this._language.set(codeLanguage);

    if (codeLanguage.language === 'none') {
      this._editorView.dispatch({
        effects: this._editorLanguage.reconfigure([])
      });
    } else {
      const language = await this._language().library();
      this._editorView.dispatch({
        effects: this._editorLanguage.reconfigure(language)
      });
    }

    this.update();
  }

  private update() {
    this._store.updateBlock(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this._contentBuilder.emitContentChangeEvent();
  }
}
