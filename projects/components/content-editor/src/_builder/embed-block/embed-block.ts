import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { ContentBuilderStore } from '../../content-builder.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Icon } from '@ngstarter-ui/components/icon';
import { Popover, PopoverTriggerForDirective } from '@ngstarter-ui/components/popover';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';
import { FormField, Suffix } from '@ngstarter-ui/components/form-field';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { EmbedService } from './embed-service';
import { SafeResourceUrlPipe } from '@ngstarter-ui/components/core';
import {
  CONTENT_BUILDER,
  ContentEditorEmbedBlockSettings,
  ContentEditorEmbedContent,
  ContentEditorItemProperty
} from '../../types';
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';

@Component({
  selector: 'app-embed-block',
  imports: [
    Icon,
    Popover,
    PopoverTriggerForDirective,
    TabGroup,
    Tab,
    Button,
    FormField,
    Input,
    Suffix,
    FormsModule,
    ReactiveFormsModule,
    SafeResourceUrlPipe
  ],
  providers: [EmbedService],
  templateUrl: './embed-block.html',
  styleUrl: './embed-block.scss',
  host: {
    'class': 'ngs-embed-block',
    '[class.is-empty]': 'isEmpty()'
  }
})
export class EmbedBlock {
  private store = inject(ContentBuilderStore);
  private contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);
  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);
  private embedService = inject(EmbedService);

  id = input.required<string>();
  content = input.required<ContentEditorEmbedContent>();
  settings = input.required<ContentEditorEmbedBlockSettings>();
  props = input<ContentEditorItemProperty[]>([]);
  index = input.required<number>();

  private readonly embedUrlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();

    if (!value.trim()) {
      return null;
    }

    const { type } = this.embedService.parse(value);

    if (!type || type === 'website') {
      return { embedUrl: true };
    }

    return null;
  };

  protected form = this.formBuilder.nonNullable.group({
    url: ['', [Validators.required, this.embedUrlValidator]],
  });

  protected _content = signal<ContentEditorEmbedContent>({
    url: '',
    type: ''
  });
  protected _settings = signal<ContentEditorEmbedBlockSettings>({
    width: null,
    height: null
  });
  protected _props = signal<ContentEditorItemProperty[]>([]);
  readonly initialized = signal(false);

  ngOnInit() {
    this._content.set(this.content());
    this._settings.set(this.settings());
    this._props.set(this.props());
    this.contentBuilder
      .focusChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.store.focusedBlockId() === this.id()) {

        }
      });
  }

  getData(): any {
    return {
      content: this._content(),
      props: this._props(),
      settings: this._settings()
    };
  }

  isEmpty() {
    return this.getData().content.url === '' && this.getData().content.type === '';
  }

  embed(trigger: PopoverTriggerForDirective) {
    this._content.set(this.embedService.parse(this.form.value.url || ''));
    trigger.api.close();
    this.store.updateBlock(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this.contentBuilder.emitContentChangeEvent();
  }
}
