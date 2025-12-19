/* eslint-disable unicorn/filename-case */
export type SpeechRecognitionEvents = {
  onStart?: () => void;
  onStop?: () => void;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
};

// Minimal runtime-safe typings for Web Speech API to avoid depending on ambient DOM types during SSR builds
type ISpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type ISpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type ISpeechRecognitionConstructor = new () => ISpeechRecognition;

// eslint-disable-next-line unicorn/filename-case
export class SpeechRecognitionManager {
  private recognition: ISpeechRecognition | null = null;
  private isListeningInternal = false;
  private accumulator = "";
  private events: SpeechRecognitionEvents;

  constructor(events: SpeechRecognitionEvents = {}) {
    this.events = events;
    if (typeof window !== "undefined") {
      this.initializeRecognition();
    }
  }

  private initializeRecognition(): void {
    const win = window as unknown as {
      SpeechRecognition?: ISpeechRecognitionConstructor;
      webkitSpeechRecognition?: ISpeechRecognitionConstructor;
    };
    const RecognitionCtor: ISpeechRecognitionConstructor | undefined = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!RecognitionCtor) return;
    this.recognition = new RecognitionCtor();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    this.recognition.onstart = () => {
      this.isListeningInternal = true;
      this.accumulator = "";
      this.events.onStart?.();
    };

    this.recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const { accumulator, interim } = this.processResultEvent(event);
      this.accumulator = accumulator;
      if (interim) this.events.onResult?.((accumulator + interim).trim(), false);
    };

    this.recognition.onerror = (event: unknown) => {
      const errorEvent = (event as { error?: string; message?: string } | undefined) ?? {};
      const message = typeof errorEvent.error === "string" ? errorEvent.error : "unknown_error";
      console.error("[SpeechRecognition] Error event:", message, errorEvent);
      this.events.onError?.(message);
    };

    this.recognition.onend = () => {
      this.isListeningInternal = false;
      this.events.onStop?.();
    };
  }

  private processResultEvent(event: ISpeechRecognitionEvent): { accumulator: string; interim: string } {
    let interim = "";
    let accumulator = this.accumulator;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        accumulator += transcript + " ";
        this.events.onResult?.(accumulator.trim(), true);
      } else {
        interim += transcript;
      }
    }
    return { accumulator, interim };
  }

  get supported(): boolean {
    return !!this.recognition;
  }

  get isListening(): boolean {
    return this.isListeningInternal;
  }

  start() {
    if (!this.recognition) {
      console.warn("[SpeechRecognition] Not supported in this browser");
      this.events.onError?.("not-supported");
      return;
    }
    if (this.isListeningInternal) {
      console.warn("[SpeechRecognition] Already listening");
      return;
    }
    try {
      console.log("[SpeechRecognition] Starting recognition...");
      this.recognition.start();
    } catch (e) {
      console.error("[SpeechRecognition] Start error:", e);
      this.events.onError?.(e instanceof Error ? e.message : "start-failed");
    }
  }

  stop() {
    if (!this.recognition || !this.isListeningInternal) return;
    try {
      this.recognition.stop();
    } catch (e) {
      // ignore
    }
  }

  abort() {
    if (!this.recognition) return;
    try {
      this.recognition.abort();
    } catch (e) {
      // ignore
    }
  }
}


