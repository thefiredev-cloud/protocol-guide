import { AcetaminophenCalculator } from "@/lib/dosing/calculators/acetaminophen";
import { AdenosineCalculator } from "@/lib/dosing/calculators/adenosine";
import { AlbuterolCalculator } from "@/lib/dosing/calculators/albuterol";
import { AmiodaroneCalculator } from "@/lib/dosing/calculators/amiodarone";
import { AtropineCalculator } from "@/lib/dosing/calculators/atropine";
import { CalciumChlorideCalculator } from "@/lib/dosing/calculators/calcium-chloride";
import { EpinephrineCalculator } from "@/lib/dosing/calculators/epinephrine";
import { FentanylCalculator } from "@/lib/dosing/calculators/fentanyl";
import { KetamineCalculator } from "@/lib/dosing/calculators/ketamine";
import { KetorolacCalculator } from "@/lib/dosing/calculators/ketorolac";
import { MagnesiumSulfateCalculator } from "@/lib/dosing/calculators/magnesium-sulfate";
import { MidazolamCalculator } from "@/lib/dosing/calculators/midazolam";
import { MorphineCalculator } from "@/lib/dosing/calculators/morphine";
import { NitroglycerinCalculator } from "@/lib/dosing/calculators/nitroglycerin";
import { OndansetronCalculator } from "@/lib/dosing/calculators/ondansetron";
import { PralidoximeCalculator } from "@/lib/dosing/calculators/pralidoxime";
import { PushDoseEpiCalculator } from "@/lib/dosing/calculators/push-dose-epi";
import { SodiumBicarbonateCalculator } from "@/lib/dosing/calculators/sodium-bicarbonate";
import { MedicationDosingManager } from "@/lib/dosing/medication-dosing-manager";

export function createDefaultMedicationManager(): MedicationDosingManager {
  const manager = new MedicationDosingManager();
  manager.register(new EpinephrineCalculator());
  manager.register(new AlbuterolCalculator());
  manager.register(new PralidoximeCalculator());
  manager.register(new AmiodaroneCalculator());
  manager.register(new AdenosineCalculator());
  manager.register(new AtropineCalculator());
  manager.register(new PushDoseEpiCalculator());
  manager.register(new NitroglycerinCalculator());
  manager.register(new CalciumChlorideCalculator());
  manager.register(new SodiumBicarbonateCalculator());
  manager.register(new MagnesiumSulfateCalculator());
  manager.register(new FentanylCalculator());
  manager.register(new MorphineCalculator());
  manager.register(new KetorolacCalculator());
  manager.register(new AcetaminophenCalculator());
  manager.register(new MidazolamCalculator());
  manager.register(new OndansetronCalculator());
  manager.register(new KetamineCalculator());
  return manager;
}


