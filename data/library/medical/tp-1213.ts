import { Protocol } from '../../../types';

export const tp1213: Protocol = {
  id: "1213",
  refNo: "TP-1213",
  title: "Cardiac Dysrhythmia - Tachycardia",
  category: "Cardiovascular",
  type: "Standing Order",
  lastUpdated: "Jul 1, 2025",
  icon: "timeline",
  color: "red",
  sections: [
    {
      type: "header",
      items: [{ title: "Tachycardia", subtitle: "Adult • Standing Order", icon: "timeline" }]
    },
    {
      type: "list",
      title: "Provider Impressions",
      items: [
        { title: "Cardiac Dysrhythmia (DYSR)", content: "Heart rate > 100 bpm (typically > 150 bpm for tachyarrhythmias)." }
      ]
    },
    {
      type: "warning",
      content: "<b>Unstable Criteria:</b> Hypotension (SBP < 90), Altered Mental Status, Signs of Shock, Ischemic Chest Pain, Acute Heart Failure."
    },
    {
      type: "accordion",
      title: "Unstable Tachycardia (Wide or Narrow)",
      items: [
        { title: "Preparation", content: "• Place pads (Anterior/Posterior preferred).<br>• Ensure IV/IO access.<br>• Pulse Oximetry & Capnography." },
        { title: "Sedation", content: "<b>Midazolam:</b> 2-5mg IV/IO/IM. May repeat x1 in 5 min if patient remains conscious." },
        { title: "Synchronized Cardioversion", content: "<b>Sync Mode:</b> Ensure 'SYNC' is active on monitor for every shock.<br><b>Energy (Biphasic):</b> Manufacturer recommendation (e.g., 120J -> 150J -> 200J).<br><b>Energy (Monophasic):</b> 100J -> 200J -> 300J -> 360J." },
        { title: "Post-Conversion", content: "Obtain 12-Lead ECG. Monitor vitals." }
      ]
    },
    {
      type: "accordion",
      title: "Stable - Narrow Complex (SVT)",
      items: [
        { title: "Vagal Maneuvers", content: "Modified Valsalva maneuver (leg lift) is most effective." },
        { title: "Adenosine", content: "<b>First Dose:</b> 6mg rapid IV push + 20mL NS flush.<br><b>Second Dose:</b> 12mg rapid IV push + 20mL NS flush (if no conversion after 2 mins)." },
        { title: "Note", content: "Warn patient of side effects (chest pressure, flushing, sense of doom). Print rhythm strip during administration." }
      ]
    },
    {
      type: "accordion",
      title: "Stable - Wide Complex (VT)",
      items: [
        { title: "Amiodarone", content: "<b>150mg</b> in 100mL NS IV PB. Infuse over 10 minutes (15mg/min)." },
        { title: "12-Lead ECG", content: "Mandatory documentation." },
        { title: "Caution", content: "Avoid Adenosine in irregular wide complex tachycardia (Polymorphic VT / WPW)." }
      ]
    },
    {
      type: "accordion",
      title: "Stable - Irregular Narrow (A-Fib/Flutter)",
      items: [
        { title: "Observation", content: "Monitor rate and rhythm. Treatment generally supportive in prehospital setting unless unstable." },
        { title: "Fluids", content: "Titrate to SBP > 90." }
      ]
    }
  ]
};