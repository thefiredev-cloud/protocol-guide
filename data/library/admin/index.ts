import { ref502 } from './ref-502';
import { ref506 } from './ref-506';
import { ref510 } from './ref-510';
import { ref513 } from './ref-513';
import { ref222 } from './ref-222';
import { ref300, ref302, ref306 } from './ref-300-series';
import { remainingAdmin } from './all-admin';
import { tocAdmin } from './toc-admin';

export const adminProtocolsList = [
  ref502,
  ref506,
  ref510,
  ref513,
  ref222,
  ref300,
  ref302,
  ref306,
  ...remainingAdmin,
  ...tocAdmin
];