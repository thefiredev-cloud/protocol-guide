/**
 * Extract all EMS entities with protocol URLs for scraping
 */

// High-priority protocol sources with direct PDF/protocol links
const PROTOCOL_SOURCES = [
  // State-level protocols (highest priority - cover many agencies)
  { name: "Alabama State EMS Protocols", state: "Alabama", url: "https://www.alabamapublichealth.gov/ems/assets/master.alabama.protocols.11th.edition.07012025.pdf", type: "state" },
  { name: "Wyoming State EMS Guidelines", state: "Wyoming", url: "https://health.wyo.gov/publichealth/ems/", type: "state" },
  { name: "Nebraska State EMS Protocols", state: "Nebraska", url: "https://dhhs.ne.gov/OEHS%20Program%20Documents/EMS%20Model%20Protocols%202024.pdf", type: "state" },
  { name: "Oklahoma State EMS Protocols", state: "Oklahoma", url: "https://oklahoma.gov/health/protective-health/emergency-systems/ems-division/protocols.html", type: "state" },
  { name: "Hawaii State EMS Standing Orders", state: "Hawaii", url: "https://health.hawaii.gov/ems/", type: "state" },
  { name: "New Hampshire EMS Protocols", state: "New Hampshire", url: "https://www.fstems.dos.nh.gov/ems-systems/patient-care-protocols", type: "state" },
  { name: "Vermont EMS Protocols", state: "Vermont", url: "https://www.healthvermont.gov/emergency/emergency-medical-services", type: "state" },
  { name: "Maine EMS Protocols", state: "Maine", url: "https://www.maine.gov/ems/protocols-resources/pre-hospital-care-protocols", type: "state" },
  { name: "South Carolina EMS Protocols", state: "South Carolina", url: "https://www.scemsportal.org", type: "state" },
  { name: "Kentucky State EMS Protocols", state: "Kentucky", url: "https://kbems.ky.gov", type: "state" },
  { name: "West Virginia EMS Protocols", state: "West Virginia", url: "https://www.wvoems.org", type: "state" },
  { name: "Maryland MIEMSS Protocols", state: "Maryland", url: "https://www.miemss.org", type: "state" },
  { name: "Connecticut EMS Protocols", state: "Connecticut", url: "https://portal.ct.gov/DPH/Emergency-Medical-Services/EMS/Office-of-Emergency-Medical-Services-Homepage", type: "state" },
  { name: "Massachusetts EMS Protocols", state: "Massachusetts", url: "https://www.mass.gov/dph/oems", type: "state" },
  { name: "Oregon EMS Protocols", state: "Oregon", url: "https://www.oregon.gov/oha/ph/providerpartnerresources/ems/", type: "state" },
  { name: "Idaho EMS Protocols", state: "Idaho", url: "https://healthandwelfare.idaho.gov/providers/idaho-bureau-emergency-medical-services/", type: "state" },
  { name: "Kansas EMS Protocols", state: "Kansas", url: "https://www.ksbems.org/ems", type: "state" },
  { name: "Iowa EMS Protocols", state: "Iowa", url: "https://hhs.iowa.gov/emergency-medical-services-trauma/", type: "state" },
  { name: "North Dakota EMS Protocols", state: "North Dakota", url: "https://www.hhs.nd.gov/health/EMS/emergency-medical-services-ems-system", type: "state" },
  { name: "South Dakota EMS Protocols", state: "South Dakota", url: "https://ems.sd.gov/", type: "state" },
  { name: "Arkansas EMS Protocols", state: "Arkansas", url: "https://healthy.arkansas.gov/programs-services/licensing-military-member-licensure-permits-plan-reviews/emergency-medical-services/", type: "state" },
  { name: "Mississippi EMS Protocols", state: "Mississippi", url: "https://msdh.ms.gov/page/47.html", type: "state" },
  
  // Major regional/county protocols (high population coverage)
  { name: "King County Medic One Protocols", state: "Washington", url: "https://www.emsonline.net/", type: "regional" },
  { name: "Pierce County EMS Protocols", state: "Washington", url: "https://www.piercecountywa.gov/3096/Patient-Care-Guidelines", type: "county" },
  { name: "Denver Metro EMS Protocols (DMEMSMD)", state: "Colorado", url: "https://www.dmemsmd.org/protocols", type: "regional" },
  { name: "Denver Health Paramedics Protocols", state: "Colorado", url: "https://denverems.org", type: "county" },
  { name: "Albuquerque Fire Rescue Protocols", state: "New Mexico", url: "https://portal.acidremap.com/sites/ABCEMS/", type: "municipal" },
  { name: "Multnomah County EMS Protocols", state: "Oregon", url: "https://multco.us/info/ems-protocols-resources", type: "county" },
  { name: "Teton County EMS Protocols", state: "Wyoming", url: "https://www.tetoncountywy.gov/908/Division-17---EMS-Operations", type: "county" },
  { name: "City of Laramie EMS Protocols", state: "Wyoming", url: "https://www.cityoflaramie.org/1461/EMS-Protocols", type: "municipal" },
  { name: "EMSA Oklahoma Protocols", state: "Oklahoma", url: "https://emsaok.gov/", type: "regional" },
  { name: "OKC/Tulsa Medical Control Board Protocols", state: "Oklahoma", url: "http://okctulomd.com/", type: "regional" },
  { name: "Lawrence-Douglas County Fire Medical Protocols", state: "Kansas", url: "https://lawrenceks.gov/fire-medical/ems/", type: "county" },
  { name: "Kansas City Kansas Fire EMS Protocols", state: "Kansas", url: "http://www.kckfd.org/index.php/ems-division/", type: "municipal" },
  { name: "Omaha Fire Department EMS Protocols", state: "Nebraska", url: "https://www.omaha-fire.org/", type: "municipal" },
  { name: "Sioux Falls Fire Rescue Protocols", state: "South Dakota", url: "https://www.siouxfalls.gov/health-safety/fire", type: "municipal" },
  { name: "Sanford Ambulance Fargo Protocols", state: "North Dakota", url: "https://www.sanfordhealth.org/medical-services/emergency-medicine/ambulance-service", type: "hospital" },
  { name: "MEMS Arkansas Protocols", state: "Arkansas", url: "https://www.metroems.org/", type: "regional" },
  { name: "Fort Smith EMS Protocols", state: "Arkansas", url: "https://www.fortsmithems.org/", type: "municipal" },
  { name: "Central EMS Washington County AR Protocols", state: "Arkansas", url: "https://centralems.org/", type: "county" },
  { name: "DeSoto County EMS Protocols", state: "Mississippi", url: "https://www.desotocountyms.gov/179/Emergency-Medical-Services-EMS", type: "county" },
  { name: "AMR Central Mississippi Protocols", state: "Mississippi", url: "https://www.amr.net/locations/mississippi/central-mississippi", type: "regional" },
  { name: "HEMSI Huntsville Protocols", state: "Alabama", url: "https://www.hemsi.org/", type: "municipal" },
  { name: "Mobile Fire-Rescue EMS Protocols", state: "Alabama", url: "https://www.cityofmobile.org/fire/emergency-medical-services/", type: "municipal" },
  { name: "Montgomery Fire/Rescue EMS Protocols", state: "Alabama", url: "https://www.montgomeryal.gov/government/city-government/city-departments/fire-rescue-department/", type: "municipal" },
  { name: "Birmingham Fire EMS Protocols", state: "Alabama", url: "https://www.birminghamal.gov/government/city-departments/fire-rescue-service/divisions/emergency-medical-services-division", type: "municipal" },
  { name: "Montgomery County MD Fire/Rescue Protocols", state: "Maryland", url: "https://www.montgomerycountymd.gov/mcfrs/", type: "county" },
  { name: "Prince George's County Fire/EMS Protocols", state: "Maryland", url: "https://www.princegeorgescountymd.gov/departments-offices/fire-emergency-medical-services", type: "county" },
  { name: "Baltimore County Fire Protocols", state: "Maryland", url: "https://www.baltimorecountymd.gov/departments/fire", type: "county" },
  { name: "Baltimore City Fire Protocols", state: "Maryland", url: "https://fire.baltimorecity.gov", type: "municipal" },
  { name: "Richland County EMS Protocols", state: "South Carolina", url: "https://www.richlandcountysc.gov/Courts-Safety/Emergency-Management/Emergency-Medical-Services", type: "county" },
  { name: "Greenville County EMS Protocols", state: "South Carolina", url: "https://www.greenvillecounty.org/EmergencyMedicalServices", type: "county" },
  { name: "Charleston County EMS Protocols", state: "South Carolina", url: "https://www.charlestoncounty.gov/departments/ems/", type: "county" },
  { name: "Louisville Metro EMS Protocols", state: "Kentucky", url: "https://louisvilleky.gov/government/emergency-services/emergency-medical-services", type: "municipal" },
  { name: "Lexington Fire EMS Protocols", state: "Kentucky", url: "https://www.lexingtonky.gov/browse/public-safety/fire-and-emergency-services", type: "municipal" },
  { name: "Kanawha County Ambulance Protocols", state: "West Virginia", url: "http://kceaa.org", type: "county" },
  { name: "Cabell County EMS Protocols", state: "West Virginia", url: "https://www.ccems.org", type: "county" },
  
  // Hospital-based EMS (often have detailed protocols)
  { name: "Cleveland Clinic EMS Protocols", state: "Ohio", url: "https://portal.acidremap.com/sites/CCFEMS/", type: "hospital" },
  { name: "Mayo Clinic Ambulance Protocols", state: "Minnesota", url: "https://www.mayoclinic.org/ambulance-service", type: "hospital" },
  { name: "University Hospitals EMS Protocols", state: "Ohio", url: "https://uhems.org/protocols", type: "hospital" },
  { name: "Grady EMS Protocols", state: "Georgia", url: "https://www.gradyhealth.org/grady-ems/", type: "hospital" },
  { name: "University Hospital Newark EMS Protocols", state: "New Jersey", url: "https://uh-ems.org", type: "hospital" },
  { name: "Good Samaritan Hospital EMS Protocols", state: "Indiana", url: "https://www.gshvin.org/documents/GSH-EMS-Protocols-for-Web-Page.pdf", type: "hospital" },
  
  // Regional EMS Councils
  { name: "Mile-High RETAC Protocols", state: "Colorado", url: "https://www.milehighretac.org", type: "regional" },
  { name: "Foothills RETAC Protocols", state: "Colorado", url: "https://foothillsretac.com", type: "regional" },
  { name: "Northeast Colorado RETAC Protocols", state: "Colorado", url: "https://ncretac.org", type: "regional" },
  { name: "Southern Region EMS Council Alaska Protocols", state: "Alaska", url: "https://www.sremsc.org/", type: "regional" },
  { name: "Interior Region EMS Council Alaska Protocols", state: "Alaska", url: "https://iremsc.org/", type: "regional" },
  { name: "Southeast Region EMS Council Alaska Protocols", state: "Alaska", url: "https://serems.org/", type: "regional" },
  { name: "Western MA EMS Protocols", state: "Massachusetts", url: "https://wmems.org/", type: "regional" },
  { name: "Central MA EMS Protocols", state: "Massachusetts", url: "https://cmemsc.org/", type: "regional" },
  { name: "NorthEast EMS Protocols", state: "Massachusetts", url: "https://www.neems.org/", type: "regional" },
  { name: "Cape and Islands EMS Protocols", state: "Massachusetts", url: "https://capeandislandsems.org/", type: "regional" },
  { name: "Southwest CT EMS Protocols", state: "Connecticut", url: "https://www.swctemscouncil.org/", type: "regional" },
  { name: "North Central CT EMS Protocols", state: "Connecticut", url: "https://northcentralctems.org/", type: "regional" },
  { name: "Atlantic Partners EMS Protocols", state: "Maine", url: "https://www.apems.org/regions", type: "regional" },
  { name: "Tri-County EMS Maine Protocols", state: "Maine", url: "http://www.tricountyems.org/", type: "regional" },
  { name: "Ada County Paramedics Protocols", state: "Idaho", url: "https://adacounty.id.gov/paramedics/access/", type: "county" },
  { name: "Jackson County EMS Oregon Protocols", state: "Oregon", url: "https://jcems.net/", type: "county" },
  { name: "Deschutes County ASA Protocols", state: "Oregon", url: "https://www.deschutes.org/health/page/ambulance-service-area-asa", type: "county" },
];

// Output the list
console.log("Total protocol sources to scrape:", PROTOCOL_SOURCES.length);
console.log("\nBy type:");
const byType: Record<string, number> = {};
PROTOCOL_SOURCES.forEach(s => {
  byType[s.type] = (byType[s.type] || 0) + 1;
});
Object.entries(byType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log("\nBy state:");
const byState: Record<string, number> = {};
PROTOCOL_SOURCES.forEach(s => {
  byState[s.state] = (byState[s.state] || 0) + 1;
});
Object.entries(byState).sort((a, b) => b[1] - a[1]).forEach(([state, count]) => {
  console.log(`  ${state}: ${count}`);
});

// Export for use
export { PROTOCOL_SOURCES };
