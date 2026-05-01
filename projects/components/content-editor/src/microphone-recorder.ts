/**
 * MicrophoneRecorder.ts
 *
 * TypeScript library for recording audio using MediaRecorder
 * and optionally performing speech recognition using Web Speech API.
 * Accumulates the final transcript internally, allows dynamic language change,
 * and includes an optional inactivity stop timeout.
 */

// --- Базовые типы для MediaRecorder ---

/**
 * Базовые опции для MediaRecorder.
 */
interface BaseRecorderOptions {
  mimeType?: string;
  timeslice?: number;
}

/**
 * Тип для обработчика события получения данных записи.
 */
export type DataAvailableHandler = (blob: Blob) => void;

/**
 * Тип для обработчика события остановки записи.
 */
export type StopHandler = (blob: Blob, url: string) => void;

/**
 * Тип для обработчика ошибки MediaRecorder или getUserMedia.
 * Гарантированно передает объект с свойством .message.
 */
export type BaseErrorHandler = (error: Error | DOMException) => void;


// --- Типы для Speech Recognition ---

/**
 * Результат распознавания речи.
 */
export interface RecognitionResult {
  transcript: string;
  isFinal: boolean;
  alternatives?: SpeechRecognitionAlternative[];
  confidence?: number;
}

/**
 * Тип для обработчика события получения результата распознавания.
 */
export type RecognitionResultHandler = (result: RecognitionResult) => void;

/**
 * Тип для обработчика ошибок распознавания речи.
 */
export type RecognitionErrorHandler = (error: SpeechRecognitionErrorEvent | Error) => void;

/**
 * Тип для обработчика начала/окончания распознавания.
 */
export type RecognitionLifeCycleHandler = () => void;


// --- Расширенные опции ---

/**
 * Расширенные опции для конструктора MicrophoneRecorder.
 */
export interface MicrophoneRecorderOptions extends BaseRecorderOptions {
  enableRecognition?: boolean;
  recognitionLang?: string;
  recognitionContinuous?: boolean;
  recognitionInterimResults?: boolean;
  recognitionMaxAlternatives?: number;
  /** Автоматически останавливать запись и распознавание через указанное время (мс) после последнего обнаружения речи.
   * Установите в 0 или отрицательное значение для отключения. По умолчанию 10000 (10 секунд).
   */
  stopTimeout?: number;
}

// --- Объявления типов Web Speech API ---

interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI: string;

  start(): void;
  stop(): void;
  abort(): void;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
  }
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResultData;
  [index: number]: SpeechRecognitionResultData;
}
interface SpeechRecognitionResultData {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechGrammarList {
  addFromString(grammar: string, weight?: number): void;
}


/**
 * Основной класс библиотеки.
 */
export class MicrophoneRecorder {
  // === Свойства Записи ===
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordedBlob: Blob | null = null;
  private recordedUrl: string | null = null;
  private state: 'inactive' | 'recording' | 'paused' = 'inactive';

  // === Свойства Распознавания ===
  private recognition: SpeechRecognition | null = null;
  private recognitionState: 'idle' | 'listening' | 'error' = 'idle';
  private SpeechRecognitionAPI: SpeechRecognitionStatic | null = null;
  private _accumulatedTranscript: string = '';
  private manualStopRecognitionFlag: boolean = false;
  private currentRecognitionLang: string;
  private noSpeechTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // === Опции и Обработчики ===
  private options: MicrophoneRecorderOptions;

  private onDataAvailableHandler: DataAvailableHandler | null = null;
  private onStopHandler: StopHandler | null = null;
  private onErrorHandler: BaseErrorHandler | null = null;

  private onRecognitionResultHandler: RecognitionResultHandler | null = null;
  private onRecognitionInterimResultHandler: RecognitionResultHandler | null = null;
  private onRecognitionErrorHandler: RecognitionErrorHandler | null = null;
  private onRecognitionStartHandler: RecognitionLifeCycleHandler | null = null;
  private onRecognitionEndHandler: RecognitionLifeCycleHandler | null = null;

  /**
   * Создает экземпляр MicrophoneRecorder.
   */
  constructor(options: MicrophoneRecorderOptions = {}) {
    this.options = {
      enableRecognition: false,
      recognitionLang: navigator.language,
      recognitionContinuous: false,
      recognitionInterimResults: false,
      recognitionMaxAlternatives: 1,
      stopTimeout: 10000, // Default timeout
      ...options
    };

    if (this.options.stopTimeout && this.options.stopTimeout <= 0) {
      this.options.stopTimeout = undefined; // Disable timeout
      console.log("Stop timeout disabled.");
    } else if (this.options.stopTimeout) {
      console.log(`Stop timeout set to: ${this.options.stopTimeout} ms`);
    }

    if (typeof MediaRecorder === 'undefined') {
      console.error("MediaRecorder API not supported.");
    }

    this.SpeechRecognitionAPI = (window.SpeechRecognition || window.webkitSpeechRecognition) ?? null;
    if (this.options.enableRecognition && !this.SpeechRecognitionAPI) {
      console.warn("SpeechRecognition API not supported. Recognition disabled.");
      this.options.enableRecognition = false;
    }

    this.currentRecognitionLang = this.options.recognitionLang || navigator.language;
  }

  /** Starts the no-speech timer. */
  private startNoSpeechTimer(): void {
    this.clearNoSpeechTimer();
    if (this.options.enableRecognition && this.options.stopTimeout && this.options.stopTimeout > 0) {
      console.log(`Starting no-speech timer (${this.options.stopTimeout} ms)...`);
      this.noSpeechTimeoutId = setTimeout(() => {
        console.log(`No speech detected for ${this.options.stopTimeout} ms. Stopping automatically...`);
        this.stop().catch(err => {
          console.error("Error during automatic stop:", err);
          const error = (err instanceof DOMException || err instanceof Error) ? err : new Error(String(err));
          this.onErrorHandler?.(error);
        });
      }, this.options.stopTimeout);
    }
  }

  /** Clears the no-speech timer. */
  private clearNoSpeechTimer(): void {
    if (this.noSpeechTimeoutId !== null) {
      clearTimeout(this.noSpeechTimeoutId);
      this.noSpeechTimeoutId = null;
    }
  }

  /**
   * Sets a new language for speech recognition.
   */
  setRecognitionLanguage(lang: string): void {
    if (!this.options.enableRecognition) {
      console.warn("Recognition not enabled."); return; }
    if (this.currentRecognitionLang === lang) { return; }

    console.log(`Setting recognition language to: ${lang}`);
    this.currentRecognitionLang = lang;

    if (this.recognition && this.recognitionState === 'listening') {
      console.log("Restarting recognition with new language...");
      try {
        this.stopRecognitionInternal(true); // Stop current
        if (this.stream && this.stream.active) {
          this.startRecognitionInternal(this.stream); // Start again
        } else {
          console.warn("Cannot restart recognition: MediaStream not active.");
          this.recognitionState = 'idle';
        }
      } catch (error) {
        console.error("Error restarting recognition:", error);
        this.recognitionState = 'error';
        const errorToReport = error instanceof Error ? error : new Error(String(error));
        this.onRecognitionErrorHandler?.(errorToReport);
      }
    }
  }

  /**
   * Requests microphone access, starts recording and/or recognition.
   * Does NOT clear the accumulated transcript automatically. Use clearTranscript() for that.
   */
  async start(): Promise<void> {
    if (this.state !== 'inactive') {
      console.warn('Recording already active or paused.');
      return Promise.resolve();
    }

    this.manualStopRecognitionFlag = false;
    if (this.recognitionState === 'error') this.recognitionState = 'idle';
    this.audioChunks = [];
    this.recordedBlob = null;
    this.revokeUrl();
    this.clearNoSpeechTimer(); // Clear timer at the beginning

    if (typeof MediaRecorder === 'undefined') {
      return Promise.reject(new Error("MediaRecorder API not supported"));
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      let mimeType = this.options.mimeType;
      if (mimeType && !MediaRecorder.isTypeSupported(mimeType)) {
        console.warn(`MIME type ${mimeType} not supported. Using default.`);
        mimeType = undefined;
      }
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
        this.onDataAvailableHandler?.(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.recordedBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        this.recordedUrl = URL.createObjectURL(this.recordedBlob);
        const previousState = this.state;
        this.state = 'inactive';
        this.clearNoSpeechTimer(); // Clear timer on stop
        this.cleanupStream();
        console.log("MediaRecorder stopped.");
        if (previousState !== 'inactive') this.onStopHandler?.(this.recordedBlob, this.recordedUrl);
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        const error = (event instanceof ErrorEvent && event.error)
          ? (event.error instanceof DOMException ? event.error : new Error(event.error?.message || 'MediaRecorder error'))
          : new Error('MediaRecorder error');
        this.state = 'inactive';
        this.clearNoSpeechTimer(); // Clear timer on error
        this.cleanupStream();
        this.onErrorHandler?.(error);
        if (this.recognitionState !== 'idle') {
          this.stopRecognitionInternal(true);
          this.recognitionState = 'error';
          this.onRecognitionErrorHandler?.(new Error(`MediaRecorder error prevented recognition: ${error.message}`));
        }
      };

      this.mediaRecorder.start(this.options.timeslice);
      this.state = 'recording';
      console.log('Recording started:', this.mediaRecorder.mimeType);

      if (this.options.enableRecognition && this.stream) {
        try {
          this.startRecognitionInternal(this.stream);
        } catch (recError) {
          console.error("Error initializing recognition:", recError);
          this.clearNoSpeechTimer();
          this.recognitionState = 'error';
          const errorToReport = recError instanceof Error ? recError : new Error(String(recError));
          this.onRecognitionErrorHandler?.(errorToReport);
        }
      }

    } catch (err) {
      console.error('Error requesting microphone access:', err);
      this.state = 'inactive';
      this.clearNoSpeechTimer();
      this.cleanupStream();
      const error = (err instanceof DOMException || err instanceof Error) ? err : new Error(String(err));
      this.onErrorHandler?.(error);
      if(this.options.enableRecognition){
        this.recognitionState = 'error';
        this.onRecognitionErrorHandler?.(new Error(`Microphone access error: ${error.message}`));
      }
      return Promise.reject(error);
    }
  }

  /**
   * Starts speech recognition manually.
   */
  startRecognition(): void {
    if (!this.options.enableRecognition) { /*...*/ return; }
    if (!this.SpeechRecognitionAPI) { /*...*/ return; }
    if (!this.stream || !this.stream.active) { /*...*/ return; }
    if (this.recognitionState === 'listening') { /*...*/ return; }
    try {
      console.log("Starting recognition manually...");
      this.startRecognitionInternal(this.stream);
    } catch (recError) {
      console.error("Error starting recognition manually:", recError);
      this.clearNoSpeechTimer();
      this.recognitionState = 'error';
      const errorToReport = recError instanceof Error ? recError : new Error(String(recError));
      this.onRecognitionErrorHandler?.(errorToReport);
    }
  }

  /**
   * Internal method to initialize and start SpeechRecognition.
   */
  private startRecognitionInternal(stream: MediaStream): void {
    if (!this.SpeechRecognitionAPI) throw new Error("SpeechRecognition API not available");
    if (!stream || !stream.active) throw new Error("MediaStream not active");

    if (this.recognition && this.recognitionState === 'listening') {
      try { this.recognition.abort(); } catch (e) { /* ignore */ }
    }
    this.recognition = new this.SpeechRecognitionAPI();
    const recognizer = this.recognition;

    recognizer.lang = this.currentRecognitionLang;
    recognizer.continuous = this.options.recognitionContinuous ?? false;
    recognizer.interimResults = this.options.recognitionInterimResults ?? false;
    recognizer.maxAlternatives = this.options.recognitionMaxAlternatives ?? 1;
    this.manualStopRecognitionFlag = false;
    this.clearNoSpeechTimer();

    console.log(`Configuring recognition: lang=${recognizer.lang}, continuous=${recognizer.continuous}, interim=${recognizer.interimResults}, maxAlt=${recognizer.maxAlternatives}`);

    recognizer.onresult = (event: SpeechRecognitionEvent) => {
      this.clearNoSpeechTimer(); // Reset timer on any result
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const resultData = event.results[i];
        if (!resultData?.[0]) continue;
        const mainAlternative = resultData[0];
        const recognitionResult: RecognitionResult = {
          transcript: mainAlternative.transcript,
          isFinal: resultData.isFinal,
          confidence: mainAlternative.confidence,
          alternatives: recognizer.maxAlternatives > 1 ? Array.from(resultData) : undefined
        };
        if (resultData.isFinal) {
          this._accumulatedTranscript += mainAlternative.transcript.trim() + ' ';
          this.onRecognitionResultHandler?.(recognitionResult);
          // Maybe restart timer after final result if continuous? onspeechend/onend handle this better.
          // this.startNoSpeechTimer();
        } else {
          this.onRecognitionInterimResultHandler?.(recognitionResult);
        }
      }
    };

    recognizer.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Recognition error:', event.error, event.message);
      this.clearNoSpeechTimer();
      this.recognitionState = 'error';
      this.onRecognitionErrorHandler?.(event);
    };

    recognizer.onstart = () => {
      console.log('Recognition listening started.');
      this.clearNoSpeechTimer();
      this.recognitionState = 'listening';
      this.onRecognitionStartHandler?.();
      this.startNoSpeechTimer(); // Start initial timer
    };

    recognizer.onspeechstart = () => {
      console.log("Speech start detected.");
      this.clearNoSpeechTimer(); // Clear timer when speech starts
    };

    recognizer.onspeechend = () => {
      console.log("Speech end detected.");
      this.startNoSpeechTimer(); // Restart timer after speech ends
    };

    recognizer.onend = () => {
      console.log('Recognition cycle ended.');
      const currentState = this.recognitionState;
      let shouldRestart = false;

      if (currentState === 'listening' && !this.manualStopRecognitionFlag) {
        this.recognitionState = 'idle';
      }
      this.onRecognitionEndHandler?.();

      if (this.state === 'recording' && recognizer.continuous && currentState !== 'error'
        && !this.manualStopRecognitionFlag && this.recognition === recognizer ) {
        shouldRestart = true;
        console.log("Auto-restarting continuous recognition...");
        try { recognizer.start(); }
        catch(e) {
          console.error("Error on auto-restart:", e);
          this.clearNoSpeechTimer();
          this.recognitionState = 'error';
          const errorToReport = e instanceof Error ? e : new Error(String(e));
          this.onRecognitionErrorHandler?.(errorToReport);
          shouldRestart = false;
        }
      }

      if (!shouldRestart) {
        this.clearNoSpeechTimer(); // Clear timer if not restarting
        if (this.manualStopRecognitionFlag && currentState !== 'error') {
          this.recognitionState = 'idle';
        }
      }
    };

    recognizer.start();
  }

  /**
   * Stops recording and speech recognition.
   */
  async stop(): Promise<void> {
    console.log("Stop method called...");
    this.clearNoSpeechTimer();
    this.stopRecognitionInternal(true);

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.state === 'inactive') {
        console.warn('Recording inactive.');
        this.cleanupStream(); // Ensure stream is clean even if recorder was missing
        return resolve();
      }
      const recorderInstance = this.mediaRecorder;
      const originalOnStop = recorderInstance.onstop;
      const originalOnError = recorderInstance.onerror;

      recorderInstance.onstop = (...args) => {
        if (originalOnStop) originalOnStop.apply(recorderInstance, args);
        console.log("Stop promise resolved.");
        resolve();
      };
      recorderInstance.onerror = (event) => {
        const error = (event instanceof ErrorEvent && event.error)
          ? (event.error instanceof DOMException ? event.error : new Error(event.error?.message || 'MediaRecorder error on stop'))
          : new Error('MediaRecorder error on stop');
        if (originalOnError) originalOnError.call(recorderInstance, event);
        console.error("Stop promise rejected.");
        reject(error);
      };
      if (recorderInstance.state !== 'inactive') {
        try {
          console.log("Sending stop() command to MediaRecorder...");
          recorderInstance.stop();
        } catch (error) {
          console.error("Sync error calling recorderInstance.stop():", error);
          const err = (error instanceof DOMException || error instanceof Error) ? error : new Error(String(error));
          if (originalOnError) {
            const pseudoEvent = new ErrorEvent('error', { error: err });
            originalOnError.call(recorderInstance, pseudoEvent);
          } else { this.state = 'inactive'; this.cleanupStream(); }
          reject(err);
        }
      } else {
        console.log("MediaRecorder already inactive on stop().");
        recorderInstance.onstop = originalOnStop;
        recorderInstance.onerror = originalOnError;
        this.cleanupStream();
        resolve();
      }
    });
  }

  /**
   * Stops only speech recognition.
   */
  stopRecognition(): void {
    if (!this.options.enableRecognition || !this.recognition) { return; }
    if (this.recognitionState !== 'listening') { console.warn("Recognition not listening."); return; }
    console.log("Stopping recognition manually...");
    this.clearNoSpeechTimer();
    this.stopRecognitionInternal(true);
  }

  /** Internal method to stop speech recognition. */
  private stopRecognitionInternal(manualStop: boolean = false): void {
    this.clearNoSpeechTimer(); // Clear timer on any stop attempt
    if (this.recognition && this.recognitionState === 'listening') {
      console.log(`Internal stop recognition. manualStop=${manualStop}`);
      this.manualStopRecognitionFlag = manualStop;
      try {
        this.recognition.stop();
        console.log("stop() command sent to SpeechRecognition.");
      } catch (e) {
        console.error("Error calling recognition.stop():", e);
        this.recognitionState = 'idle';
        this.onRecognitionErrorHandler?.(e instanceof Error ? e : new Error(String(e)));
      }
    } else if (this.recognition && this.recognitionState !== 'idle') {
      console.log("Aborting non-listening recognition instance...");
      try { this.recognition.abort(); } catch(e) { /* ignore */ }
      this.recognitionState = 'idle';
    }
  }

  /** Pauses MediaRecorder recording. */
  pause(): void {
    if (this.mediaRecorder?.state === 'recording') {
      try { this.mediaRecorder.pause(); this.state = 'paused'; console.log('Recording paused.'); }
      catch (error) {
        console.error('Error pausing recording:', error);
        const err = (error instanceof DOMException || error instanceof Error) ? error : new Error(String(error));
        this.onErrorHandler?.(err);
      }
    } else { console.warn('Cannot pause recording.'); }
  }

  /** Resumes MediaRecorder recording. */
  resume(): void {
    if (this.mediaRecorder?.state === 'paused') {
      try { this.mediaRecorder.resume(); this.state = 'recording'; console.log('Recording resumed.'); }
      catch (error) {
        console.error('Error resuming recording:', error);
        const err = (error instanceof DOMException || error instanceof Error) ? error : new Error(String(error));
        this.onErrorHandler?.(err);
      }
    } else { console.warn('Cannot resume recording.'); }
  }

  // === Setters for handlers ===
  setOnDataAvailable(handler: DataAvailableHandler | null): void { this.onDataAvailableHandler = handler; }
  setOnStop(handler: StopHandler | null): void { this.onStopHandler = handler; }
  setOnError(handler: BaseErrorHandler | null): void { this.onErrorHandler = handler; }
  setOnRecognitionResult(handler: RecognitionResultHandler | null): void { this.onRecognitionResultHandler = handler; }
  setOnRecognitionInterimResult(handler: RecognitionResultHandler | null): void { this.onRecognitionInterimResultHandler = handler; }
  setOnRecognitionError(handler: RecognitionErrorHandler | null): void { this.onRecognitionErrorHandler = handler; }
  setOnRecognitionStart(handler: RecognitionLifeCycleHandler | null): void { this.onRecognitionStartHandler = handler; }
  setOnRecognitionEnd(handler: RecognitionLifeCycleHandler | null): void { this.onRecognitionEndHandler = handler; }

  // === Getters for state and data ===
  getState(): 'inactive' | 'recording' | 'paused' { return this.state; }
  getRecognitionState(): 'idle' | 'listening' | 'error' { return this.recognitionState; }
  getBlob(): Blob | null { return this.recordedBlob; }
  getUrl(): string | null { return this.recordedUrl; }
  getAudioElement(): HTMLAudioElement | null {
    if (!this.recordedUrl) { console.warn('No recorded URL for audio element.'); return null; }
    const audio = new Audio(this.recordedUrl); audio.controls = true; return audio; }
  getTranscript(): string { return this._accumulatedTranscript.trim(); }
  getRecognitionLanguage(): string { return this.currentRecognitionLang; }

  /** Clears the accumulated transcript history. */
  clearTranscript(): void {
    console.log("Clearing accumulated transcript.");
    this._accumulatedTranscript = '';
  }


  // === Cleanup ===
  cleanup(): void {
    console.log('Cleaning up MicrophoneRecorder resources...');
    this.clearNoSpeechTimer();
    this.stopRecognitionInternal(true);
    this.recognition = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      console.log("Forcing MediaRecorder stop during cleanup...");
      try { this.mediaRecorder.stop(); } catch(e) { console.error("Error stopping MediaRecorder in cleanup:", e); }
    }
    this.mediaRecorder = null;
    this.cleanupStream();
    this.revokeUrl();
    this.state = 'inactive';
    this.recognitionState = 'idle';
    this._accumulatedTranscript = ''; // Clear transcript on full cleanup
    this.audioChunks = [];
    this.recordedBlob = null;
    console.log("Cleanup finished.");
  }

  /** Stops MediaStream tracks. */
  private cleanupStream(): void {
    if (this.stream) {
      let tracksStopped = false;
      this.stream.getTracks().forEach(track => {
        if (track.readyState === 'live') { track.stop(); tracksStopped = true; }
      });
      if (tracksStopped) console.log('MediaStream tracks stopped.');
      this.stream = null;
    }
  }

  /** Revokes the Object URL for the recorded Blob. */
  private revokeUrl(): void {
    if (this.recordedUrl) {
      URL.revokeObjectURL(this.recordedUrl);
      this.recordedUrl = null;
      console.log('Revoked previous Object URL.');
    }
  }

  // === Static support checks ===
  static isSupported(): boolean {
    return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  }
  static isRecognitionSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

// Default export and named type exports
export default MicrophoneRecorder;
