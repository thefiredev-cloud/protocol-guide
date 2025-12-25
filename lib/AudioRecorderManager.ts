/**
 * AudioRecorderManager - Records audio and transcribes via OpenAI Whisper API
 * 
 * State machine: idle → recording → transcribing → idle
 * Designed to be robust against rapid clicks and async race conditions.
 */

export type RecorderState = "idle" | "recording" | "transcribing";

export type AudioRecorderEvents = {
  onStateChange?: (state: RecorderState) => void;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
};

export class AudioRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private state: RecorderState = "idle";
  private events: AudioRecorderEvents;
  private pendingStop = false;

  constructor(events: AudioRecorderEvents = {}) {
    this.events = events;
  }

  get supported(): boolean {
    return typeof window !== "undefined" && 
           typeof navigator !== "undefined" && 
           !!navigator.mediaDevices?.getUserMedia;
  }

  get currentState(): RecorderState {
    return this.state;
  }

  get isListening(): boolean {
    return this.state === "recording";
  }

  private setState(newState: RecorderState): void {
    if (this.state !== newState) {
      console.log(`[AudioRecorder] State: ${this.state} → ${newState}`);
      this.state = newState;
      this.events.onStateChange?.(newState);
    }
  }

  async toggle(): Promise<void> {
    console.log(`[AudioRecorder] toggle() called, state: ${this.state}`);
    
    if (this.state === "idle") {
      await this.start();
    } else if (this.state === "recording") {
      this.stop();
    }
    // Ignore toggle during "transcribing" state
  }

  private async start(): Promise<void> {
    if (this.state !== "idle") {
      console.warn("[AudioRecorder] Cannot start - not idle");
      return;
    }

    // Set pending state before async operation
    this.pendingStop = false;

    try {
      console.log("[AudioRecorder] Requesting microphone...");
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Check if stop was requested during mic permission wait
      if (this.pendingStop) {
        console.log("[AudioRecorder] Stop was requested during permission, cleaning up");
        this.cleanup();
        return;
      }

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      // Only set state to recording AFTER permission granted and recorder created
      this.setState("recording");
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log("[AudioRecorder] Chunk received, size:", event.data.size);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log("[AudioRecorder] MediaRecorder onstop fired");
        this.handleRecordingComplete();
      };

      this.mediaRecorder.onerror = () => {
        console.error("[AudioRecorder] MediaRecorder error");
        this.events.onError?.("recording-failed");
        this.cleanup();
      };

      // Request data every 500ms for more responsive stopping
      this.mediaRecorder.start(500);
      console.log("[AudioRecorder] Recording started");

    } catch (error) {
      const domError = error as DOMException;
      console.error("[AudioRecorder] Start failed:", domError.name, domError.message);
      
      this.cleanup();
      
      if (domError.name === "NotAllowedError" || domError.name === "PermissionDeniedError") {
        this.events.onError?.("not-allowed");
      } else if (domError.name === "NotFoundError") {
        this.events.onError?.("no-microphone");
      } else {
        this.events.onError?.(domError.message || "start-failed");
      }
    }
  }

  private stop(): void {
    console.log("[AudioRecorder] stop() called");
    
    if (this.state !== "recording") {
      console.warn("[AudioRecorder] Cannot stop - not recording");
      return;
    }

    this.pendingStop = true;

    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      // Request final data before stopping
      this.mediaRecorder.requestData();
      this.mediaRecorder.stop();
    } else {
      // MediaRecorder not ready yet, cleanup will handle it
      this.cleanup();
    }
  }

  private async handleRecordingComplete(): Promise<void> {
    console.log("[AudioRecorder] Recording complete, chunks:", this.audioChunks.length);
    
    // Stop media stream tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;

    if (this.audioChunks.length === 0) {
      console.warn("[AudioRecorder] No audio data");
      this.cleanup();
      return;
    }

    const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
    console.log("[AudioRecorder] Audio size:", audioBlob.size, "bytes");

    if (audioBlob.size < 1000) {
      console.warn("[AudioRecorder] Audio too short");
      this.cleanup();
      return;
    }

    // Transcribe
    this.setState("transcribing");
    await this.transcribe(audioBlob);
    this.cleanup();
  }

  private async transcribe(audioBlob: Blob): Promise<void> {
    const TRANSCRIPTION_TIMEOUT_MS = 30000; // 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, TRANSCRIPTION_TIMEOUT_MS);

    try {
      console.log("[AudioRecorder] Sending to Whisper API...");

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const text = result.text?.trim();

      if (text) {
        console.log("[AudioRecorder] Transcription:", text);
        this.events.onResult?.(text);
      } else {
        console.log("[AudioRecorder] No speech detected");
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Check if aborted due to timeout
      if (error instanceof Error && error.name === "AbortError") {
        console.error("[AudioRecorder] Transcription timed out after 30s");
        this.events.onError?.("transcription-timeout");
        return;
      }

      console.error("[AudioRecorder] Transcription failed:", error);
      this.events.onError?.(error instanceof Error ? error.message : "transcription-failed");
    }
  }

  private cleanup(): void {
    console.log("[AudioRecorder] Cleanup");
    this.pendingStop = false;
    this.audioChunks = [];
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state !== "inactive") {
        try { this.mediaRecorder.stop(); } catch { /* ignore */ }
      }
      this.mediaRecorder = null;
    }
    
    this.setState("idle");
  }

  dispose(): void {
    console.log("[AudioRecorder] Disposing");
    this.cleanup();
  }
}
