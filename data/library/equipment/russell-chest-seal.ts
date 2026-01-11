import type { Protocol } from '../../../types';

export const russellChestSeal: Protocol = {
  id: "EQUIP-CHEST-SEAL",
  refNo: "Ref. 1321",
  title: "Russell Chest Seal",
  category: "Equipment",
  type: "Equipment Guide",
  lastUpdated: "Apr 2015",
  tags: ["chest seal", "pneumothorax", "penetrating trauma", "thoracic", "occlusive dressing", "sucking chest wound"],
  icon: "medical_services",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Russell Chest Seal", subtitle: "Equipment Guide" }]
    },
    {
      type: "warning",
      content: "Used for open (sucking) chest wounds and penetrating thoracic trauma. Allows air to escape but prevents air entry."
    },
    {
      type: "meta",
      data: {
        "Scope": "ALS/BLS",
        "Type": "Vented occlusive dressing"
      }
    },
    {
      type: "accordion",
      title: "Indications",
      items: [
        { title: "Open pneumothorax", content: "Sucking chest wound with audible air movement through wound" },
        { title: "Penetrating chest trauma", content: "Stab wounds, gunshot wounds to thorax" },
        { title: "Impaled object removal", content: "After removal of impaled object (if clinically indicated)" }
      ]
    },
    {
      type: "step-by-step",
      title: "Application",
      steps: [
        { stepNumber: 1, title: "Expose wound", description: "Remove clothing to fully expose wound and surrounding skin" },
        { stepNumber: 2, title: "Clean wound site", description: "Quickly wipe blood and debris from around wound to ensure seal adhesion" },
        { stepNumber: 3, title: "Apply seal", description: "Center the valve directly over the wound opening, press firmly to adhere all edges" },
        { stepNumber: 4, title: "Check all edges", description: "Ensure all edges of seal are adhered to skin" }
      ]
    },
    {
      type: "warning",
      content: "Monitor closely for tension pneumothorax signs: increasing respiratory distress, tracheal deviation, JVD, hypotension. If suspected, burp or remove seal."
    },
    {
      type: "clinical-pearl",
      title: "Entry and Exit",
      content: "Remember to check for exit wounds. Penetrating trauma may have both entry and exit wounds requiring two chest seals."
    }
  ]
};
