import { Protocol } from '../../../types';

export const ref1309: Protocol = {
  id: "1309",
  refNo: "Ref. 1309",
  title: "Color Code Drug Doses",
  category: "Pediatric",
  type: "Reference",
  lastUpdated: "Jul 1, 2025",
  icon: "palette",
  color: "pink",
  sections: [
    {
      type: "header",
      items: [{ title: "Color Code Drug Doses", subtitle: "Ref. 1309 • Reference", icon: "palette" }]
    },
    {
      type: "warning",
      content: "Correct dosing based on weight (kg) is a safety concern. Use length-based tape (Broselow) to determine weight/color for children <= 14 years. Doses are pre-calculated."
    },
    {
      type: "pediatric-dosing"
    },
    {
        type: "info",
        title: "Guidelines",
        content: "1. Use length-based tape.<br>2. Document dose in mg AND mL.<br>3. Report color and weight to Base Hospital.<br>4. Adult dosing for children longer than tape (>36kg)."
    }
  ]
};
