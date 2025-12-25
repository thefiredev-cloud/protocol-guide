/**
 * LA County Medication Scope Enforcement Tests
 *
 * Verifies that unauthorized medications (ketamine, etc.) are properly
 * blocked and LA County authorized medications (fentanyl, etc.) remain functional.
 */
import { describe, it, expect } from "vitest";

import {
  isLACountyAuthorized,
  isLACountyUnauthorized,
  getUnauthorizedReplacement,
  validateMedicationScope,
  toGenericName,
  LA_COUNTY_AUTHORIZED_MEDICATIONS,
  LA_COUNTY_UNAUTHORIZED_MEDICATIONS,
} from "@/lib/formulary/la-county-formulary";
import { isInLACountyFormulary } from "@/lib/drugs/types";

describe("LA County Medication Scope Enforcement", () => {
  describe("Formulary Authorization Functions", () => {
    describe("isLACountyAuthorized", () => {
      it("should authorize fentanyl (MCG 1317.19)", () => {
        expect(isLACountyAuthorized("fentanyl")).toBe(true);
      });

      it("should authorize morphine (MCG 1317.27)", () => {
        expect(isLACountyAuthorized("morphine")).toBe(true);
      });

      it("should authorize midazolam (MCG 1317.25)", () => {
        expect(isLACountyAuthorized("midazolam")).toBe(true);
      });

      it("should authorize olanzapine (MCG 1317.32)", () => {
        expect(isLACountyAuthorized("olanzapine")).toBe(true);
      });

      it("should authorize ketorolac (MCG 1317.22)", () => {
        expect(isLACountyAuthorized("ketorolac")).toBe(true);
      });

      it("should NOT authorize ketamine", () => {
        expect(isLACountyAuthorized("ketamine")).toBe(false);
      });

      it("should NOT authorize lorazepam", () => {
        expect(isLACountyAuthorized("lorazepam")).toBe(false);
      });

      it("should handle case insensitivity", () => {
        expect(isLACountyAuthorized("FENTANYL")).toBe(true);
        expect(isLACountyAuthorized("Ketamine")).toBe(false);
      });
    });

    describe("isLACountyUnauthorized", () => {
      it("should identify ketamine as unauthorized", () => {
        expect(isLACountyUnauthorized("ketamine")).toBe(true);
      });

      it("should identify lorazepam as unauthorized", () => {
        expect(isLACountyUnauthorized("lorazepam")).toBe(true);
      });

      it("should identify diazepam as unauthorized", () => {
        expect(isLACountyUnauthorized("diazepam")).toBe(true);
      });

      it("should identify haloperidol as unauthorized", () => {
        expect(isLACountyUnauthorized("haloperidol")).toBe(true);
      });

      it("should NOT identify fentanyl as unauthorized", () => {
        expect(isLACountyUnauthorized("fentanyl")).toBe(false);
      });

      it("should NOT identify midazolam as unauthorized", () => {
        expect(isLACountyUnauthorized("midazolam")).toBe(false);
      });
    });

    describe("Brand Name Handling", () => {
      it("should recognize Ketalar as ketamine (unauthorized)", () => {
        expect(isLACountyUnauthorized("ketalar")).toBe(true);
        expect(isLACountyAuthorized("ketalar")).toBe(false);
      });

      it("should recognize Ativan as lorazepam (unauthorized)", () => {
        expect(isLACountyUnauthorized("ativan")).toBe(true);
      });

      it("should recognize Sublimaze as fentanyl (authorized)", () => {
        expect(isLACountyAuthorized("sublimaze")).toBe(true);
      });

      it("should recognize Versed as midazolam (authorized)", () => {
        expect(isLACountyAuthorized("versed")).toBe(true);
      });

      it("should recognize Toradol as ketorolac (authorized)", () => {
        expect(isLACountyAuthorized("toradol")).toBe(true);
      });
    });

    describe("toGenericName", () => {
      it("should convert brand names to generic", () => {
        expect(toGenericName("ketalar")).toBe("ketamine");
        expect(toGenericName("ativan")).toBe("lorazepam");
        expect(toGenericName("versed")).toBe("midazolam");
        expect(toGenericName("sublimaze")).toBe("fentanyl");
      });

      it("should return generic names unchanged", () => {
        expect(toGenericName("ketamine")).toBe("ketamine");
        expect(toGenericName("fentanyl")).toBe("fentanyl");
      });

      it("should handle case and whitespace", () => {
        expect(toGenericName("  KETALAR  ")).toBe("ketamine");
      });
    });
  });

  describe("Replacement Suggestions", () => {
    it("should suggest midazolam for ketamine", () => {
      const replacement = getUnauthorizedReplacement("ketamine");
      expect(replacement).toContain("midazolam");
    });

    it("should suggest midazolam for lorazepam", () => {
      const replacement = getUnauthorizedReplacement("lorazepam");
      expect(replacement).toContain("midazolam");
    });

    it("should suggest olanzapine or midazolam for haloperidol", () => {
      const replacement = getUnauthorizedReplacement("haloperidol");
      expect(replacement).toMatch(/olanzapine|midazolam/);
    });

    it("should return null for authorized medications", () => {
      const replacement = getUnauthorizedReplacement("fentanyl");
      expect(replacement).toBeNull();
    });
  });

  describe("validateMedicationScope", () => {
    it("should return authorized=true for fentanyl", () => {
      const result = validateMedicationScope("fentanyl");
      expect(result.authorized).toBe(true);
      expect(result.unauthorized).toBe(false);
      expect(result.message).toContain("authorized");
    });

    it("should return authorized=false for ketamine with replacement", () => {
      const result = validateMedicationScope("ketamine");
      expect(result.authorized).toBe(false);
      expect(result.unauthorized).toBe(true);
      expect(result.replacement).toContain("midazolam");
      expect(result.message).toContain("NOT authorized");
    });
  });

  describe("Backwards Compatibility", () => {
    it("isInLACountyFormulary should return false for ketamine", () => {
      expect(isInLACountyFormulary("ketamine")).toBe(false);
    });

    it("isInLACountyFormulary should return true for fentanyl", () => {
      expect(isInLACountyFormulary("fentanyl")).toBe(true);
    });

    it("isInLACountyFormulary should return true for midazolam", () => {
      expect(isInLACountyFormulary("midazolam")).toBe(true);
    });
  });

  describe("Formulary Lists Integrity", () => {
    it("should have no overlap between authorized and unauthorized lists", () => {
      const overlap = [...LA_COUNTY_AUTHORIZED_MEDICATIONS].filter((med) =>
        LA_COUNTY_UNAUTHORIZED_MEDICATIONS.has(med)
      );
      expect(overlap).toHaveLength(0);
    });

    it("should include all required cardiac medications", () => {
      const cardiacMeds = ["epinephrine", "amiodarone", "atropine", "adenosine"];
      for (const med of cardiacMeds) {
        expect(LA_COUNTY_AUTHORIZED_MEDICATIONS.has(med)).toBe(true);
      }
    });

    it("should include all required pain management medications", () => {
      const painMeds = ["fentanyl", "morphine", "ketorolac"];
      for (const med of painMeds) {
        expect(LA_COUNTY_AUTHORIZED_MEDICATIONS.has(med)).toBe(true);
      }
    });

    it("should NOT include ketamine in authorized list", () => {
      expect(LA_COUNTY_AUTHORIZED_MEDICATIONS.has("ketamine")).toBe(false);
    });

    it("should include ketamine in unauthorized list", () => {
      expect(LA_COUNTY_UNAUTHORIZED_MEDICATIONS.has("ketamine")).toBe(true);
    });
  });
});
