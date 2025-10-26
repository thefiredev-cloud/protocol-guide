import { RetryableErrorClassifier } from './retryable-error-classifier';
import { TransientDatabaseError } from './transient-database-error';

export class DatabaseOperationRunner {
  static async run<T>(operation: () => Promise<T>, context: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const classification = RetryableErrorClassifier.classify(error);
      if (classification.retryable && classification.category) {
        throw new TransientDatabaseError(
          `${context} failed due to transient ${classification.category} error`,
          classification.category,
          error
        );
      }

      throw error;
    }
  }
}

