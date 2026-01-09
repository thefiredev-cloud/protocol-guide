
import { procAirway } from './proc-airway';
import { procIO } from './proc-io';
import { procIOVascular } from './proc-io-vascular';
import { procTCP } from './proc-tcp';
import { procCPAP } from './proc-cpap';
import { procIntubation } from './proc-intubation';
import { procDefibrillation } from './proc-defibrillation';
import { proc12Lead } from './proc-12lead';
import { tp1100 } from './tp-1100';
import { remainingProcedures } from './all-procedures';

export const procedureProtocolsList = [
  procAirway,
  procIntubation,
  procIO,
  procIOVascular,
  procTCP,
  procCPAP,
  procDefibrillation,
  proc12Lead,
  tp1100,
  ...remainingProcedures
];
