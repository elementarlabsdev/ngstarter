import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
  computed,
  Signal,
  effect,
  Output,
  EventEmitter,
  input,
  NgZone,
  inject, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Icon } from '@ngstarter/components/icon';
import { FabButton } from '@ngstarter/components/button';

import MicrophoneRecorder, {
  MicrophoneRecorderOptions,
  RecognitionResultHandler,
  RecognitionErrorHandler,
  RecognitionLifeCycleHandler,
  BaseErrorHandler,
  StopHandler
} from '../microphone-recorder';

@Component({
  selector: 'ngs-audio-recorder',
  standalone: true,
  imports: [
    CommonModule,
    Icon,
    FabButton
  ],
  templateUrl: './audio-recorder.component.html',
  styleUrl: './audio-recorder.component.scss'
})
export class AudioRecorderComponent implements OnInit, OnDestroy {
  private _platformId = inject(PLATFORM_ID);

  recordingState = signal<'inactive' | 'recording' | 'paused'>('inactive');
  recognitionState = signal<'idle' | 'listening' | 'error'>('idle');
  isSupported = signal(true);
  isRecognitionSupported = signal(true);

  audioURL = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  recognitionError = signal<string | null>(null);

  finalTranscript: WritableSignal<string> = signal('');
  interimTranscript = signal<string>('');

  displayTranscript: Signal<string> = computed(() => {
    const final = this.finalTranscript().trim();
    const interim = this.interimTranscript().trim();
    return (final ? final + (interim ? ' ' : '') : '') + interim;
  });

  @Output() displayTranscriptChange = new EventEmitter<string>();

  recognitionLang = input<string>('en-US');
  stopTimeout = input<number>(10000);
  insertAtCursor = input<boolean>(true);

  private recorder: MicrophoneRecorder | null = null;

  constructor(private ngZone: NgZone) {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    effect(() => {
      const currentDisplayTranscript = this.displayTranscript();
      this.displayTranscriptChange.emit(currentDisplayTranscript);
    });

    effect(() => {
      const lang = this.recognitionLang();
      if (this.recorder && this.recorder.getRecognitionLanguage() !== lang) {
        console.log(`Input language signal changed to ${lang}. Updating recorder...`);
        this.recorder.setRecognitionLanguage(lang);
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    this.isSupported.set(MicrophoneRecorder.isSupported());
    this.isRecognitionSupported.set(MicrophoneRecorder.isRecognitionSupported());

    if (!this.isSupported()) {
      this.errorMessage.set("Audio recording is not supported by your browser.");
      return;
    }

    const enableRecognition = this.isRecognitionSupported();
    if (!enableRecognition) { console.warn("Speech recognition is not supported."); }

    const recorderOptions: MicrophoneRecorderOptions = {
      enableRecognition: enableRecognition,
      recognitionLang: this.recognitionLang(),
      recognitionContinuous: true,
      recognitionInterimResults: true,
      stopTimeout: this.stopTimeout()
    };

    this.recorder = new MicrophoneRecorder(recorderOptions);
    this.setupRecorderHandlers();
    this.recordingState.set(this.recorder.getState());
    this.recognitionState.set(this.recorder.getRecognitionState());
  }

  // ngOnChanges не используется для input() сигналов

  ngOnDestroy(): void {
    this.recorder?.cleanup();
  }

  private insertTextAtCursor(textChunk: string): void {
    if (!this.insertAtCursor()) return;

    const activeElement = document.activeElement as HTMLElement | null; // Типизируем как HTMLElement
    if (!activeElement) return;

    const trimmedText = textChunk.trim();
    if (!trimmedText) return;
    // Добавляем пробел в начале, если перед курсором не пробел, и всегда в конце
    const textToInsert = ' ' + trimmedText + ' '; // Упрощенное добавление пробелов

    // --- Обработка Input и Textarea ---
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      const inputElement = activeElement;
      const start = inputElement.selectionStart;
      const end = inputElement.selectionEnd;

      if (start === null || end === null) return;

      const originalValue = inputElement.value;
      // Умное добавление пробела в начале
      const smartPrefix = (start > 0 && originalValue[start - 1] !== ' ') ? ' ' : '';
      const textWithSmartSpace = smartPrefix + trimmedText + ' ';

      const newValue = originalValue.substring(0, start) + textWithSmartSpace + originalValue.substring(end);

      this.ngZone.run(() => {
        inputElement.value = newValue;
        const newCursorPos = start + textWithSmartSpace.length;
        inputElement.selectionStart = newCursorPos;
        inputElement.selectionEnd = newCursorPos;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`Inserted text into input/textarea: "${textWithSmartSpace}"`);
      });
      inputElement.focus(); // Важно вернуть фокус
    }
    // --- Обработка ContentEditable ---
    else if (activeElement.isContentEditable) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        // Убедимся, что выделение находится внутри активного элемента
        if (activeElement.contains(selection.anchorNode) && activeElement.contains(selection.focusNode)) {
          const range = selection.getRangeAt(0);
          range.deleteContents(); // Удаляем выделенный текст, если есть

          // Добавляем пробел в начале, если нужно
          const previousCharRange = document.createRange();
          previousCharRange.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
          previousCharRange.setEnd(range.startContainer, range.startOffset);
          const smartPrefix = (range.startOffset > 0 && !/\s$/.test(previousCharRange.toString())) ? ' ' : '';
          const textWithSmartSpace = smartPrefix + trimmedText + ' ';

          const textNode = document.createTextNode(textWithSmartSpace);
          range.insertNode(textNode);

          // Перемещаем курсор в конец вставленного текста
          range.setStartAfter(textNode);
          range.collapse(true); // Collapse(true) ставит курсор в начало диапазона (т.е. после textNode)

          // Обновляем выделение
          selection.removeAllRanges();
          selection.addRange(range);

          console.log(`Inserted text into contenteditable: "${textWithSmartSpace}"`);

          // Диспатчим событие input для contenteditable, чтобы триггерить возможные обработчики
          // (хотя стандартно они могут не реагировать как на input/textarea)
          activeElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

        } else {
          console.warn("Selection is outside the focused contenteditable element.");
        }
      } else {
        console.warn("Cannot get valid selection for contenteditable element.");
      }
      activeElement.focus(); // Важно вернуть фокус
    } else {
      console.log("No suitable input, textarea, or contenteditable element focused.");
    }
  }

  private setupRecorderHandlers(): void {
    if (!this.recorder) return;

    const handleStop: StopHandler = (blob, url) => {
      this.audioURL.set(url);
      this.recordingState.set(this.recorder?.getState() ?? 'inactive');
      this.errorMessage.set(null);
      this.finalTranscript.set(this.recorder?.getTranscript() ?? '');
      this.interimTranscript.set('');
    };
    this.recorder.setOnStop(handleStop);

    const handleError: BaseErrorHandler = (error) => {
      this.errorMessage.set(`Recording error: ${error.message}`);
      this.recordingState.set(this.recorder?.getState() ?? 'inactive');
      this.audioURL.set(null);
      this.recognitionError.set(`Recording error prevented recognition: ${error.message}`);
      this.recognitionState.set('error');
      this.finalTranscript.set('');
      this.interimTranscript.set('');
    };
    this.recorder.setOnError(handleError);

    const handleFinalResult: RecognitionResultHandler = (result) => {
      this.finalTranscript.set(this.recorder?.getTranscript() ?? '');
      this.interimTranscript.set('');
      this.recognitionError.set(null);
      this.recognitionState.set(this.recorder?.getRecognitionState() ?? 'idle');
      this.insertTextAtCursor(result.transcript); // Вставляем финальный кусок
    };
    this.recorder.setOnRecognitionResult(handleFinalResult);

    const handleInterimResult: RecognitionResultHandler = (result) => {
      this.interimTranscript.set(result.transcript);
      // Не вставляем промежуточные результаты
    };
    this.recorder.setOnRecognitionInterimResult(handleInterimResult);

    const handleRecogError: RecognitionErrorHandler = (error) => {
      let message = 'Unknown speech recognition error';
      if (error instanceof Error) { message = error.message; }
      else {
        message = `Code: ${error.error}, Message: ${error.message || 'No details'}`;
        if (error.error === 'no-speech') message = "No speech detected.";
        else if (error.error === 'audio-capture') message = "Audio capture problem.";
        else if (error.error === 'not-allowed') message = "Microphone access denied.";
        else if (error.error === 'network') message = "Network error.";
        else if (error.error === 'aborted') message = "Recognition aborted.";
      }
      this.recognitionError.set(message);
      this.recognitionState.set('error');
      this.interimTranscript.set('');
    };
    this.recorder.setOnRecognitionError(handleRecogError);

    const handleRecogStart: RecognitionLifeCycleHandler = () => {
      this.recognitionState.set('listening');
      this.recognitionError.set(null);
      this.interimTranscript.set('');
    };
    this.recorder.setOnRecognitionStart(handleRecogStart);

    const handleRecogEnd: RecognitionLifeCycleHandler = () => {
      const currentState = this.recorder?.getRecognitionState();
      if (currentState !== 'error' && currentState !== 'listening') {
        this.recognitionState.set('idle');
      }
    };
    this.recorder.setOnRecognitionEnd(handleRecogEnd);
  }

  async startRecording(): Promise<void> {
    if (!this.recorder || this.recordingState() !== 'inactive') return;
    this.errorMessage.set(null);
    this.recognitionError.set(null);
    this.audioURL.set(null);
    this.finalTranscript.set(''); // Сбрасываем при старте
    this.interimTranscript.set('');
    this.recordingState.set('recording');
    try {
      if (this.recorder.getRecognitionLanguage() !== this.recognitionLang()) {
        this.recorder.setRecognitionLanguage(this.recognitionLang());
      }
      this.recorder.clearTranscript(); // Очищаем историю в библиотеке
      await this.recorder.start();
      this.recordingState.set(this.recorder.getState());
    } catch (error) {
      this.recordingState.set('inactive');
      const message = error instanceof Error ? error.message : String(error);
      if (!this.errorMessage()) this.errorMessage.set(`Failed to start recording: ${message}`);
      if (!this.recognitionError()) this.recognitionError.set(`Start error prevented recognition: ${message}`);
      this.recognitionState.set('error');
      this.finalTranscript.set('');
      this.interimTranscript.set('');
    }
  }

  async stopRecording(): Promise<void> {
    if (!this.recorder || this.recordingState() === 'inactive') return;
    try { await this.recorder.stop(); }
    catch (error) {
      this.recordingState.set('inactive');
      this.recognitionState.set('error');
      const message = error instanceof Error ? error.message : String(error);
      if (!this.errorMessage()) this.errorMessage.set(`Error stopping recording: ${message}`);
      if (!this.recognitionError()) this.recognitionError.set(`Error stopping recognition: ${message}`);
      this.interimTranscript.set('');
      // Финальный транскрипт не сбрасываем при ошибке стопа
    }
  }

  pauseRecording(): void {
    this.recorder?.pause();
    this.recordingState.set(this.recorder?.getState() ?? 'inactive');
  }

  resumeRecording(): void {
    this.recorder?.resume();
    this.recordingState.set(this.recorder?.getState() ?? 'recording');
  }

  clearTranscription(): void {
    if (this.recorder) {
      this.recorder.clearTranscript();
      this.finalTranscript.set('');
      this.interimTranscript.set('');
    }
  }
}
