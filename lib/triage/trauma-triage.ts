
export interface TraumaTriageInput {
  age?: number;
  vitals?: {
    systolic?: number;
    respiratoryRate?: number;
  };
  // Physiologic criteria
  isHypotensive?: boolean;
  hasAbnormalRespiration?: boolean;
  isPenetratingTorsoTrauma?: boolean;
  isCardiacArrest?: boolean;

  // Anatomic criteria
  hasPenetrationHeadNeckTorso?: boolean;
  hasProximalExtremityPenetration?: boolean;
  hasBluntHeadInjury?: boolean;
  hasGlasgowComaScore?: number;
  hasSpinalInjury?: boolean;
  hasFlailChest?: boolean;
  hasAbdominalTenderness?: boolean;
  hasPelvicFracture?: boolean;
  hasExtremityInjury?: boolean;
  hasAmputation?: boolean;
  hasMultipleProximalFractures?: boolean;
  hasHemorrhageControl?: boolean;

  // Mechanism (Ref 506 - Revised 01-01-24)
  fallHeight?: number;
  hasPassengerIntrusion?: boolean;
  isEjection?: boolean;
  isPedestrianStrike?: boolean;
  pedestrianMechanism?: "thrown" | "runOver" | "highSpeed" | "other"; // thrown, run over, OR >20 mph
  isMotorcycleInjury?: boolean;
  isUnenclosedTransport?: boolean; // ATV, golf cart, etc.
  vehicleSpeed?: number;
  isPediatric?: boolean;
  isPregnant?: boolean;
  burnPercentage?: number;
}

export interface TraumaTriageResult {
  destination: "Trauma Center" | "Trauma Center Consideration" | "Non-Trauma Center";
  urgency: "Code 3" | "Code 2" | "Code 1";
  baseContact: "YES" | "CONSIDER" | "As needed";
  criteria: {
    physiologic: string[];
    anatomic: string[];
    mechanism: string[];
  };
  recommendations: string[];
  citations: string[];
}

export class TraumaTriageManager {
  /**
   * Comprehensive trauma triage assessment per LA County PCM Reference 506
   */
  public assess(input: TraumaTriageInput): TraumaTriageResult {
    const physiologic = this.checkPhysiologicCriteria(input);
    const anatomic = this.checkAnatomicCriteria(input);
    const mechanism = this.checkMechanismCriteria(input);
    
    const destination = this.determineDestination(physiologic, anatomic, mechanism);
    const urgency = this.determineUrgency(destination, physiologic, anatomic);
    const baseContact = this.determineBaseContact(destination);
    const recommendations = this.buildRecommendations(destination, physiologic, anatomic, mechanism, input);
    
    return {
      destination,
      urgency,
      baseContact,
      criteria: { physiologic, anatomic, mechanism },
      recommendations,
      citations: [
        "PCM Reference 506 - Trauma Triage",
        "MCG 1206 - Pediatric Considerations",
        "PCM Section II.A - Physiologic Criteria",
        "PCM Section II.B - Anatomic Criteria",
        "PCM Section II.C - Mechanism/Special Considerations"
      ],
    };
  }
  
  private checkPhysiologicCriteria(input: TraumaTriageInput): string[] {
    const criteria: string[] = [];
    
    // Hypotension
    if (input.age !== undefined && input.age < 1) {
      if (input.vitals?.systolic !== undefined && input.vitals.systolic < 70) {
        criteria.push("Systolic BP < 70 mmHg (infant)");
      }
    } else {
      if (input.vitals?.systolic !== undefined && input.vitals.systolic < 90) {
        criteria.push("Systolic BP < 90 mmHg");
      }
    }
    
    // Respiratory abnormalities
    if (input.vitals?.respiratoryRate !== undefined) {
      if (input.vitals.respiratoryRate > 29) {
        criteria.push("Respiratory rate > 29 breaths/min (sustained)");
      }
      if (input.vitals.respiratoryRate < 10) {
        criteria.push("Respiratory rate < 10 breaths/min");
      }
      if (input.age !== undefined && input.age < 1 && input.vitals.respiratoryRate < 20) {
        criteria.push("Respiratory rate < 20 breaths/min (infant)");
      }
    }
    
    // Penetrating torso trauma with cardiac arrest
    if (input.isPenetratingTorsoTrauma && input.isCardiacArrest) {
      criteria.push("Cardiac arrest with penetrating torso trauma");
    }
    
    // Ventilatory support (implied from abnormal vitals)
    if (input.hasAbnormalRespiration) {
      criteria.push("Requiring ventilatory support");
    }
    
    return criteria;
  }
  
  private checkAnatomicCriteria(input: TraumaTriageInput): string[] {
    const criteria: string[] = [];
    
    // Penetrating injuries
    if (input.hasPenetrationHeadNeckTorso) {
      criteria.push("Penetrating injury to head, neck, or torso");
    }
    if (input.hasProximalExtremityPenetration) {
      criteria.push("Penetrating injury to extremity (proximal to elbow/knee)");
    }
    
    // Head injury
    if (input.hasBluntHeadInjury) {
      criteria.push("Blunt head injury with suspected skull fracture");
    }
    if (input.hasGlasgowComaScore !== undefined && input.hasGlasgowComaScore <= 14) {
      criteria.push(`Altered LOC (Glasgow Coma Score ≤ ${input.hasGlasgowComaScore})`);
    }
    
    // Neurological deficits (implied through GCS)
    if (input.hasSpinalInjury) {
      criteria.push("Spinal injury with acute sensory/motor deficit");
    }
    
    // Chest wall
    if (input.hasFlailChest) {
      criteria.push("Unstable chest wall (flail chest)");
    }
    
    // Abdomen
    if (input.hasAbdominalTenderness) {
      criteria.push("Diffuse abdominal tenderness");
    }
    
    // Pelvis
    if (input.hasPelvicFracture) {
      criteria.push("Suspected pelvic fracture (excluding isolated hip from ground level)");
    }
    
    // Extremity injuries
    if (input.hasExtremityInjury) {
      criteria.push("Extremity with neurologic/vascular compromise");
    }
    if (input.hasAmputation) {
      criteria.push("Amputation proximal to wrist/ankle");
    }
    if (input.hasMultipleProximalFractures) {
      criteria.push("Fractures of 2+ proximal long bones (humerus/femur)");
    }
    if (input.hasHemorrhageControl) {
      criteria.push("Uncontrolled bleeding requiring tourniquet/hemostatic agent");
    }
    
    return criteria;
  }
  
  private checkMechanismCriteria(input: TraumaTriageInput): string[] {
    const criteria: string[] = [];
    
    // Fall height
    if (input.fallHeight !== undefined && input.fallHeight > 10) {
      criteria.push(`Fall from height > 10 feet (${input.fallHeight}ft)`);
    }
    
    // Vehicle intrusion
    if (input.hasPassengerIntrusion) {
      criteria.push("Passenger compartment intrusion > 12 inches");
    }
    
    // Ejection
    if (input.isEjection) {
      criteria.push("Ejection from vehicle");
    }
    
    // Pedestrian/Bicyclist/Motorcyclist (Ref 506.N)
    if (input.isPedestrianStrike) {
      const mechanism = input.pedestrianMechanism;
      const isHighEnergy = mechanism === "thrown" || mechanism === "runOver" ||
        mechanism === "highSpeed" || (input.vehicleSpeed ?? 0) > 20;
      if (isHighEnergy) {
        criteria.push("Auto vs pedestrian/bicyclist/motorcyclist: thrown, run over, OR >20 mph impact");
      } else {
        criteria.push("Pedestrian struck by vehicle (mechanism unclear - assess for high-energy criteria)");
      }
    }

    // Unenclosed transport (Ref 506.O)
    if (input.isUnenclosedTransport && (input.vehicleSpeed ?? 0) > 20) {
      criteria.push(`Unenclosed transport crash >20 mph impact (${input.vehicleSpeed} mph)`);
    }

    // Motorcycle
    if (input.isMotorcycleInjury) {
      criteria.push("Motorcycle/motorized bicycle injury");
    }

    // Pediatric considerations
    if (input.isPediatric) {
      criteria.push("Pediatric trauma (lower thresholds apply)");
    }

    // Pregnancy
    if (input.isPregnant) {
      criteria.push("Pregnant patient (direct trauma bypass considerations)");
    }

    // Burns (Ref 506.P) - Age-based TBSA thresholds
    if (input.burnPercentage !== undefined) {
      const isAdult = (input.age ?? 15) >= 15;
      const threshold = isAdult ? 20 : 10;
      if (input.burnPercentage >= threshold) {
        criteria.push(`Major burn: ${input.burnPercentage}% TBSA 2nd/3rd degree (threshold: ≥${threshold}% for ${isAdult ? "adult ≥15yrs" : "pediatric ≤14yrs"})`);
      }
    }

    return criteria;
  }
  
  private determineDestination(physiologic: string[], anatomic: string[], mechanism: string[]) {
    if (physiologic.length > 0 || anatomic.length > 0) {
      return "Trauma Center" as const;
    }
    if (mechanism.length > 0) {
      return "Trauma Center Consideration" as const;
    }
    return "Non-Trauma Center" as const;
  }
  
  private determineUrgency(
    destination: "Trauma Center" | "Trauma Center Consideration" | "Non-Trauma Center",
    physiologic: string[],
    anatomic: string[]
  ) {
    if (destination === "Trauma Center") {
      return "Code 3" as const;
    }
    if (destination === "Trauma Center Consideration" && physiologic.length > 0) {
      return "Code 2" as const;
    }
    return "Code 1" as const;
  }
  
  private determineBaseContact(destination: "Trauma Center" | "Trauma Center Consideration" | "Non-Trauma Center") {
    switch (destination) {
      case "Trauma Center":
        return "YES" as const;
      case "Trauma Center Consideration":
        return "CONSIDER" as const;
      default:
        return "As needed" as const;
    }
  }
  
  private buildRecommendations(
    destination: string,
    physiologic: string[],
    anatomic: string[],
    mechanism: string[],
    input: TraumaTriageInput
  ): string[] {
    const recs: string[] = [];
    
    if (destination === "Trauma Center") {
      recs.push("Transport to nearest designated Trauma Center");
      recs.push("Immediate base hospital notification required");
      if (input.vitals?.systolic !== undefined && input.vitals.systolic < 90) {
        recs.push("Initiate fluid resuscitation protocol for hypotension");
      }
    } else if (destination === "Trauma Center Consideration") {
      recs.push("Consider trauma center based on clinical judgment");
      recs.push("Consult with base hospital for final destination");
      recs.push("Monitor vitals closely en route");
    } else {
      recs.push("Transport to appropriate receiving facility");
      recs.push("Base hospital contact as clinically indicated");
    }
    
    // Special instructions
    if (input.hasPenetrationHeadNeckTorso) {
      recs.push("Do NOT remove penetrating objects - stabilize in place");
    }
    if (input.hasSpinalInjury) {
      recs.push("Full spinal precautions indicated");
    }
    if (input.hasFlailChest) {
      recs.push("Consider pain management and splinting techniques");
    }
    if (input.isPedestrianStrike || input.isMotorcycleInjury) {
      recs.push("High-energy mechanism - maintain trauma center alert status");
    }
    
    return recs;
  }
}
