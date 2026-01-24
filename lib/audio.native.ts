/**
 * Native Audio API wrapper for voice recording
 * Platform: iOS and Android
 * Uses expo-av for native audio recording
 */

import { Audio as ExpoAudio } from 'expo-av';

export const RecordingOptionsPresets = {
  HIGH_QUALITY: ExpoAudio.RecordingOptionsPresets.HIGH_QUALITY,
};

// Recording interface for type annotations
export interface Recording {
  stopAndUnloadAsync(): Promise<void>;
  getURI(): string | null;
}

// Native Recording wrapper
class NativeRecording implements Recording {
  constructor(private recording: ExpoAudio.Recording) {}

  async stopAndUnloadAsync(): Promise<void> {
    await this.recording.stopAndUnloadAsync();
  }

  getURI(): string | null {
    return this.recording.getURI();
  }
}

export const Audio = {
  /**
   * Request microphone permissions
   */
  async requestPermissionsAsync(): Promise<{ granted: boolean }> {
    const { status } = await ExpoAudio.requestPermissionsAsync();
    return { granted: status === 'granted' };
  },

  /**
   * Set audio mode
   */
  async setAudioModeAsync(options: {
    allowsRecordingIOS?: boolean;
    playsInSilentModeIOS?: boolean;
  }): Promise<void> {
    await ExpoAudio.setAudioModeAsync({
      allowsRecordingIOS: options.allowsRecordingIOS ?? true,
      playsInSilentModeIOS: options.playsInSilentModeIOS ?? true,
    });
  },

  /**
   * Recording class with static createAsync method
   */
  Recording: {
    async createAsync(
      options?: typeof RecordingOptionsPresets.HIGH_QUALITY
    ): Promise<{ recording: Recording }> {
      const { recording } = await ExpoAudio.Recording.createAsync(
        options || RecordingOptionsPresets.HIGH_QUALITY
      );
      return { recording: new NativeRecording(recording) };
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
 * Hook-style audio recorder for native
 */
export function useAudioRecorder(_preset: typeof RecordingPresets.HIGH_QUALITY) {
  let recording: NativeRecording | null = null;
  let currentUri: string | null = null;

  return {
    get uri(): string | null {
      return currentUri;
    },

    async record(): Promise<void> {
      const result = await Audio.Recording.createAsync();
      recording = result.recording as NativeRecording;
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
