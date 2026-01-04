import { tp1302 } from './tp-1302';
import { tp1303 } from './tp-1303';
import { tp1234p } from './tp-1304';
import { tp1305 } from './tp-1305';
import { tp1309 } from './tp-1309';
import { tp1310 } from './tp-1310';
import { tp1311 } from './tp-1311';
import { tp1322 } from './tp-1322';
import { tp1337 } from './tp-1337';
import { tp1341 } from './tp-1341';
import { tp1350 } from './tp-1350';
import { tp1360 } from './tp-1360';
import { tp1370 } from './tp-1370';
import { tp1380 } from './tp-1380';
import { tp1244p } from './tp-1244-p';
import { tp1220p } from './tp-1220-p';
import { tp1243p } from './tp-1243-p';
import { tp1203p } from './tp-1203-p';
import { ref1309 } from './ref-1309';
import { tocPediatric } from './toc-pediatric';

export const pediatricProtocols = [
  tp1302, tp1303, tp1234p, tp1305, tp1309, tp1310, 
  tp1311, tp1322, tp1337, tp1341,
  tp1244p, tp1220p, tp1243p, tp1203p,
  tp1350, tp1360, tp1370, tp1380,
  ref1309,
  ...tocPediatric
];