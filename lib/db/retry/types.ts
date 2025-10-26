export type TransientErrorCategory = 'network' | 'timeout' | 'connection';

export interface RetryableClassification {
  retryable: boolean;
  category?: TransientErrorCategory;
}

