import type { TransientErrorCategory } from './types';

export class TransientDatabaseError extends Error {
  readonly category: TransientErrorCategory;
  readonly cause?: unknown;

  constructor(message: string, category: TransientErrorCategory, cause?: unknown) {
    super(message);
    this.name = 'TransientDatabaseError';
    this.category = category;
    this.cause = cause;
  }
}

