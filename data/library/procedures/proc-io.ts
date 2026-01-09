import { Protocol } from '../../../types';

export const procIO: Protocol = {
  id: "PROC-IO",
  refNo: "IO Access",
  title: "Intraosseous Access",
  category: "Procedures",
  type: "Procedure",
  lastUpdated: "Jan 2026",
  icon: "vaccines",
  color: "blue",
  sections: [
    {
      type: "header",
      items: [{ title: "Intraosseous Access", subtitle: "Procedure", icon: "vaccines" }]
    },
    {
      type: "text",
      title: "Indications",
      content: "Shock, Cardiac Arrest, or urgent need for fluids/meds when IV access fails. IO is <b>first line for cardiac arrest</b> and second line after failed IV attempts in other emergencies."
    },
    {
      type: "accordion",
      title: "IO Access Sites",
      items: [
        {
          title: "Proximal Tibia",
          content: "<b>Landmarks:</b><br>• 2cm (1-2 finger widths) below tibial tuberosity<br>• Medial flat surface of tibia<br>• Avoid growth plate in pediatrics<br><br><b>Preferred for:</b> Pediatric patients, cardiac arrest (closest to heart)",
          icon: "child_care"
        },
        {
          title: "Proximal Humerus (Adult Preferred)",
          content: "<b>Landmarks:</b><br>• Greater tubercle of humerus<br>• Patient's palm on umbilicus (internal rotation)<br>• Palpate anterior humeral head, identify greater tubercle (most prominent point when arm internally rotated)<br>• 1-2cm below surgical neck<br><br><b>Preferred for:</b> Adults, conscious patients (less painful), faster flow rates (up to 150 mL/min with pressure bag)",
          icon: "person"
        },
        {
          title: "Distal Tibia (Alternative)",
          content: "<b>Landmarks:</b><br>• Medial malleolus (ankle bone)<br>• 2cm proximal to most prominent point<br>• Flat surface of distal tibia<br><br><b>Use when:</b> Other sites not accessible",
          icon: "accessibility"
        }
      ]
    },
    {
      type: "step-by-step",
      title: "Humeral IO Insertion Procedure",
      steps: [
        {
          stepNumber: 1,
          title: "Position Patient",
          description: "Place patient's hand on their umbilicus or across chest to internally rotate the humerus.",
          tip: "Internal rotation exposes the greater tubercle and makes landmarks easier to identify"
        },
        {
          stepNumber: 2,
          title: "Identify Landmarks",
          description: "Palpate the humeral head anteriorly. The <b>greater tubercle</b> is the most prominent bony landmark at the top of the humerus, 1-2cm lateral to the acromion.",
          substeps: [
            "Feel for the coracoid process (anterior shoulder)",
            "Draw line laterally to greater tubercle",
            "Insertion point: 1-2cm above surgical neck"
          ]
        },
        {
          stepNumber: 3,
          title: "Prepare Site",
          description: "Clean site with antiseptic if time permits. Select appropriate needle: <b>45mm needle</b> for average adults, 25mm for thin patients.",
          duration: "10 seconds"
        },
        {
          stepNumber: 4,
          title: "Insert Needle",
          description: "Insert at <b>45-degree angle</b> directed slightly posteriorly toward the elbow. In obese patients, may use 90-degree angle.",
          warning: "Ensure needle is perpendicular to bone surface to prevent bending"
        },
        {
          stepNumber: 5,
          title: "Advance with Driver",
          description: "Activate power driver. Advance until flange reaches skin (1-2cm depth in adults). You should feel a 'pop' as cortex is penetrated.",
          duration: "2-3 seconds"
        },
        {
          stepNumber: 6,
          title: "Confirm Placement",
          description: "Remove stylet. Confirm placement by checking:",
          substeps: [
            "Needle stands firmly without support",
            "Aspiration of marrow (not always present - not required)",
            "Flush with 10mL saline without resistance or extravasation"
          ]
        },
        {
          stepNumber: 7,
          title: "Pain Management (Conscious Patients)",
          description: "<b>Lidocaine 2%</b> (preservative-free) 40mg slow IO push. Wait 60 seconds before flush or medication administration.",
          tip: "Lidocaine significantly reduces infusion pain in conscious patients"
        }
      ]
    },
    {
      type: "info",
      title: "Contraindications",
      content: "<b>Absolute:</b> Fracture at/proximal to site, previous IO in same bone within 24 hours, prosthesis/hardware at site<br><br><b>Relative:</b> Osteoporosis, infection at site, inability to locate landmarks, burns at insertion site"
    },
    {
      type: "warning",
      content: "<b>Troubleshooting:</b><br>• <b>Difficult advancement:</b> Ensure correct angle, may need to reposition slightly<br>• <b>Unable to flush:</b> Needle may be against cortex - rotate slightly<br>• <b>Extravasation:</b> Failed placement - remove needle, apply pressure, use alternate site"
    }
  ]
};
