/**
 * Audio module - Platform-agnostic exports
 *
 * This file provides TypeScript resolution for @/lib/audio imports.
 * Metro bundler will resolve to:
 * - audio.web.ts on web/PWA
 * - audio.native.ts on iOS/Android
 *
 * This base file re-exports from the web version for TypeScript type checking.
 */

import { Audio } from "./audio.web";

export {
  Audio,
  AudioModule,
  Recording,
  RecordingOptionsPresets,
  RecordingPresets,
  useAudioRecorder,
} from "./audio.web";

export default Audio;
