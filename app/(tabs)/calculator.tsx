/**
 * Calculator Tab Screen
 *
 * Provides access to the dose/weight calculator for medication dosing.
 * Essential tool for EMS professionals, especially for pediatric patients.
 */

import { ScreenContainer } from "@/components/screen-container";
import { DoseWeightCalculator } from "@/components/dose-weight-calculator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function CalculatorScreen() {
  return (
    <ScreenContainer>
      <ErrorBoundary
        section="general"
        errorTitle="Calculator Error"
        errorMessage="The medication calculator encountered an issue. Please try again or restart the app."
      >
        <DoseWeightCalculator />
      </ErrorBoundary>
    </ScreenContainer>
  );
}
