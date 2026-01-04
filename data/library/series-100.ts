
import { Protocol } from '../../types';

export const series100: Protocol[] = [
  {
    id: "100", refNo: "Ref. 100", title: "State Law and Regulation", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "gavel", color: "slate",
    sections: [{ type: "header", items: [{ title: "Law & Regulation", subtitle: "Ref. 100" }] }, { type: "text", content: "References California Health & Safety Code Div 2.5 and CCR Title 22." }]
  },
  {
    id: "101", refNo: "Ref. 101", title: "California Health & Safety Code Division 2.5", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "gavel", color: "slate",
    sections: [
      { type: "header", items: [{ title: "CA H&S Code Div 2.5", subtitle: "Ref. 101" }] },
      { type: "text", title: "Overview", content: "Division 2.5 of the California Health and Safety Code establishes the Emergency Medical Services System and the Prehospital Emergency Medical Care Personnel Act." },
      { type: "list", title: "Key Sections", items: [
        { title: "§1797.1-1797.4", content: "Definitions: Emergency Medical Services, EMT, Paramedic, Base Hospital, LEMSA." },
        { title: "§1797.50-1797.107", content: "Local EMS Agency (LEMSA) authority and responsibilities." },
        { title: "§1797.150-1797.218", content: "Personnel standards, training, certification, and scope of practice." },
        { title: "§1797.220", content: "Medical control and physician supervision requirements." }
      ]},
      { type: "text", title: "Authority", content: "Provides the legal foundation for all EMS operations in California, including certification, training, medical direction, and quality assurance." }
    ]
  },
  {
    id: "102", refNo: "Ref. 102", title: "California Code of Regulations Title 22", category: "Administrative", type: "Policy", lastUpdated: "2024", icon: "gavel", color: "slate",
    sections: [
      { type: "header", items: [{ title: "CCR Title 22", subtitle: "Ref. 102" }] },
      { type: "text", title: "Overview", content: "Title 22, Division 9 of the California Code of Regulations implements the EMS System. These regulations provide detailed operational standards for EMS personnel, equipment, and systems." },
      { type: "accordion", title: "Key Chapters", items: [
        { title: "Chapter 1: Administration", content: "EMS Authority structure, LEMSA requirements, and system planning." },
        { title: "Chapter 2: Personnel", content: "Training standards for EMT-Basic, Advanced EMT, and Paramedic. Certification and recertification requirements. Scope of practice for each level." },
        { title: "Chapter 3: Training Programs", content: "Approval standards for paramedic training programs and continuing education." },
        { title: "Chapter 4: Ambulances", content: "Vehicle design, equipment requirements, and staffing standards." },
        { title: "Chapter 5: Air Ambulances", content: "Standards for fixed-wing and rotor-wing ambulances." }
      ]},
      { type: "text", title: "Local Variance", content: "LEMSAs may adopt policies that exceed minimum state standards. LA County DHS has implemented enhanced protocols, medication formularies, and quality improvement requirements." }
    ]
  }
];
