import { Protocol } from '../../../types';

export const dhsFrameworkAlignment: Protocol = {
  id: "LACOFD-DHS-ALIGNMENT",
  refNo: "Policy Reference",
  title: "LACoFD Alignment with DHS Framework",
  category: "Administrative",
  type: "Policy Reference",
  lastUpdated: "Sep 15, 2015",
  tags: ["DHS", "policy", "alignment", "eliminated", "committee", "LACoFD", "LEMSA", "framework"],
  icon: "policy",
  color: "slate",
  sections: [
    {
      type: "header",
      items: [{ title: "DHS Framework Alignment", subtitle: "Policy Reference • Effective 09/15/2015", icon: "policy" }]
    },
    {
      type: "text",
      title: "Policy Overview",
      content: "LA County Fire Department eliminated department-specific versions of protocols and <b>reverted to using standard DHS/LEMSA policies</b>. This ensures consistency across all LA County EMS providers."
    },
    {
      type: "accordion",
      title: "Eliminated LACoFD Policies",
      items: [
        {
          title: "Patient Care Guidelines/Expectations",
          content: "Previously: LA County Fire Department Patient Care Guidelines/Expectations<br>Now: Follow standard DHS protocols"
        },
        {
          title: "Base Hospital Contact and Transport Criteria",
          content: "Previously: LACoFD-specific Ref. 808.1<br>Now: Follow DHS <b>Ref. 808.1</b>"
        },
        {
          title: "Trauma Triage Reference Guide",
          content: "Previously: LACoFD-specific Ref. 506<br>Now: Follow DHS <b>Ref. 506/506.1</b>"
        },
        {
          title: "12-Lead Electrocardiogram Indications",
          content: "Eliminated department-specific guidance. Follow DHS protocols."
        },
        {
          title: "Blood Glucose Testing/Fluid Challenge",
          content: "Eliminated department-specific guidance. Follow DHS protocols."
        }
      ]
    },
    {
      type: "clinical-pearl",
      title: "Philosophy",
      content: "<b>Only perform tests if results will change field management.</b><br><br>• No need to repeat 12-lead EKG after one shows STEMI<br>• No blood glucose testing in alert and oriented patients<br>• Paramedics should use skill and judgment"
    },
    {
      type: "accordion",
      title: "DHS Policy Approval Committees",
      items: [
        { title: "Education Advisory Committee", content: "Training and education standards" },
        { title: "Medical Council", content: "Clinical protocol review and approval" },
        { title: "EMS Commission", content: "System-wide policy governance" },
        { title: "Provider Agency Advisory Committee", content: "Provider agency coordination" },
        { title: "Data Advisory Committee", content: "ePCR and data standards" },
        { title: "Base Hospital Advisory Committee", content: "Base hospital coordination" },
        { title: "Trauma Hospital Advisory Committee", content: "Trauma system oversight" },
        { title: "Pediatric Advisory Committee", content: "Pediatric care standards" }
      ]
    },
    {
      type: "info",
      title: "Key Reference Numbers",
      content: "<b>Ref. 808.1</b> - Base Hospital Contact and Transport Criteria<br><b>Ref. 506/506.1</b> - Trauma Triage Reference Guide<br><b>Ref. 806</b> - IV/IO Access Protocol<br><b>Ref. 845</b> - Happy Hypoxia (COVID-related)<br><b>Ref. 1320</b> - CPAP Protocol"
    }
  ]
};
