/**
 * Web Audio API wrapper for voice recording
 * Platform: Web/PWA only
 */

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingUri: string | null = null;
let mediaStream: MediaStream | null = null;

export const RecordingOptionsPresets = {
  HIGH_QUALITY: {
    mimeType: "audio/webm;codecs=opus",
  },
};

// Recording interface for type annotations
export interface Recording {
  stopAndUnloadAsync(): Promise<void>;
  getURI(): string | null;
}

// Singleton Recording class for web
class WebRecording implements Recording {
  private uri: string | null = null;

  async stopAndUnloadAsync(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: "audio/webm" });
          this.uri = URL.createObjectURL(blob);
          recordingUri = this.uri;

          // Stop all tracks
          if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            mediaStream = null;
          }

          resolve();
        };
        mediaRecorder.stop();
      } else {
        resolve();
      }
    });
  }

  getURI(): string | null {
    return this.uri || recordingUri;
  }
}

export const Audio = {
  /**
   * Request microphone permissions
   */
  async requestPermissionsAsync(): Promise<{ granted: boolean }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return { granted: true };
    } catch {
      return { granted: false };
    }
  },

  /**
   * Set audio mode (no-op on web)
   */
  async setAudioModeAsync(_options: {
    allowsRecordingIOS?: boolean;
    playsInSilentModeIOS?: boolean;
  }): Promise<void> {
    // No-op on web
  },

  /**
   * Recording class with static createAsync method
   */
  Recording: {
    async createAsync(
      _options?: typeof RecordingOptionsPresets.HIGH_QUALITY
    ): Promise<{ recording: WebRecording }> {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      mediaStream = stream;
      audioChunks = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms

      return { recording: new WebRecording() };
    },
  },

  /**
   * Recording presets
   */
  RecordingOptionsPresets,
};

/**
 * AudioModule for permissions
 */
export const AudioModule = {
  async requestRecordingPermissionsAsync(): Promise<{ granted: boolean }> {
    return Audio.requestPermissionsAsync();
  },
};

/**
 * Recording presets for hook API
 */
export const RecordingPresets = {
  HIGH_QUALITY: RecordingOptionsPresets.HIGH_QUALITY,
};

/**
 * Hook-style audio recorder for web
 */
export function useAudioRecorder(_preset: typeof RecordingPresets.HIGH_QUALITY) {
  let recording: WebRecording | null = null;
  let currentUri: string | null = null;

  return {
    get uri(): string | null {
      return currentUri;
    },

    async record(): Promise<void> {
      const result = await Audio.Recording.createAsync();
      recording = result.recording;
    },

    async stop(): Promise<void> {
      if (recording) {
        await recording.stopAndUnloadAsync();
        currentUri = recording.getURI();
        recording = null;
      }
    },
  };
}

export default Audio;
