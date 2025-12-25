import { AcetaminophenCalculator } from "../../lib/dosing/calculators/acetaminophen";
import { AdenosineCalculator } from "../../lib/dosing/calculators/adenosine";
import { AlbuterolCalculator } from "../../lib/dosing/calculators/albuterol";
import { AmiodaroneCalculator } from "../../lib/dosing/calculators/amiodarone";
import { AtropineCalculator } from "../../lib/dosing/calculators/atropine";
import { CalciumChlorideCalculator } from "../../lib/dosing/calculators/calcium-chloride";
import { DextroseCalculator } from "../../lib/dosing/calculators/dextrose";
import { DiphenhydramineCalculator } from "../../lib/dosing/calculators/diphenhydramine";
import { EpinephrineCalculator } from "../../lib/dosing/calculators/epinephrine";
import { FentanylCalculator } from "../../lib/dosing/calculators/fentanyl";
import { GlucagonCalculator } from "../../lib/dosing/calculators/glucagon";
// KetamineCalculator REMOVED - ketamine NOT authorized in LA County EMS protocols
// Use midazolam for sedation (MCG 1317.25)
import { KetorolacCalculator } from "../../lib/dosing/calculators/ketorolac";
import { MagnesiumSulfateCalculator } from "../../lib/dosing/calculators/magnesium-sulfate";
import { MidazolamCalculator } from "../../lib/dosing/calculators/midazolam";
import { MorphineCalculator } from "../../lib/dosing/calculators/morphine";
import { NaloxoneCalculator } from "../../lib/dosing/calculators/naloxone";
import { NitroglycerinCalculator } from "../../lib/dosing/calculators/nitroglycerin";
import { OndansetronCalculator } from "../../lib/dosing/calculators/ondansetron";
import { PralidoximeCalculator } from "../../lib/dosing/calculators/pralidoxime";
import { PushDoseEpiCalculator } from "../../lib/dosing/calculators/push-dose-epi";
import { SodiumBicarbonateCalculator } from "../../lib/dosing/calculators/sodium-bicarbonate";
import { MedicationDosingManager } from "../../lib/dosing/medication-dosing-manager";

export function createDefaultMedicationManager(): MedicationDosingManager {
  const manager = new MedicationDosingManager();
  // Cardiac medications
  manager.register(new EpinephrineCalculator());
  manager.register(new AmiodaroneCalculator());
  manager.register(new AdenosineCalculator());
  manager.register(new AtropineCalculator());
  manager.register(new PushDoseEpiCalculator());
  manager.register(new NitroglycerinCalculator());
  
  // Respiratory medications
  manager.register(new AlbuterolCalculator());
  
  // Electrolyte/Metabolic medications
  manager.register(new CalciumChlorideCalculator());
  manager.register(new SodiumBicarbonateCalculator());
  manager.register(new MagnesiumSulfateCalculator());
  manager.register(new DextroseCalculator()); // D50/D25/D10
  manager.register(new GlucagonCalculator());
  
  // Pain management
  manager.register(new FentanylCalculator());
  manager.register(new MorphineCalculator());
  manager.register(new KetorolacCalculator());
  manager.register(new AcetaminophenCalculator());
  manager.register(new KetamineCalculator());
  
  // Seizure/Sedation
  manager.register(new MidazolamCalculator());
  
  // Antiemetic
  manager.register(new OndansetronCalculator());
  
  // Allergy/Anaphylaxis
  manager.register(new DiphenhydramineCalculator()); // Benadryl

  // Overdose/Toxicology
  manager.register(new NaloxoneCalculator()); // Narcan
  manager.register(new PralidoximeCalculator()); // 2-PAM
  
  return manager;
}


