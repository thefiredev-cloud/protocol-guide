
import { procAirway } from './proc-airway';
import { procIO } from './proc-io';
import { procIOVascular } from './proc-io-vascular';
import { procTCP } from './proc-tcp';
import { procCPAP } from './proc-cpap';
import { procIntubation } from './proc-intubation';
import { procDefibrillation } from './proc-defibrillation';
import { proc12Lead } from './proc-12lead';
import { proc1335 } from './proc-1335';
import { tp1100 } from './tp-1100';
import { tp1234 } from './tp-1234';
import { mcg1315 } from './mcg-1315';
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
  proc1335,
  tp1100,
  tp1234,
  mcg1315,
  ...remainingProcedures
];
