export const clinicalVoiceOptions = [
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Clinical Female - Rachel", tone: "Calm, professional" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Clinical Female - Bella", tone: "Warm, concise" },
  { id: "MF3mGyEYCl7XYWbV9V6O6", label: "Clinical Female - Elli", tone: "Clear, reassuring" },
  { id: "ThT5KcBeYPX3keUQqHPh", label: "Clinical Female - Dorothy", tone: "Measured, mature" }
];

export const playbackSpeeds = [0.85, 1, 1.1, 1.25];

export function buildClinicalVoiceSummary(encounter) {
  const topDiagnoses = encounter.differentialDiagnoses.slice(0, 4);
  const highRisk = encounter.differentialDiagnoses
    .filter((diagnosis) => /acute|aortic|pulmonary embolism|arrhythmia/i.test(diagnosis.name))
    .slice(0, 3);
  const suggestedLabs = encounter.orders.filter((order) => /troponin|cbc|cmp|acr|a1c|lab/i.test(order));
  const suggestedImaging = [
    ...encounter.orders.filter((order) => /ecg|x-ray|imaging|echo|cardiology/i.test(order)),
    ...encounter.imaging.slice(-2).map((item) => `${item.type}: ${item.result}`)
  ];
  const suggestedExam = encounter.physicalExam.length
    ? encounter.physicalExam
    : ["Focused cardiopulmonary examination", "Chest wall palpation", "Repeat vital signs"];
  const medicationConsiderations = encounter.medications
    .filter((medication) => medication.intelligence || medication.status)
    .slice(0, 4)
    .map((medication) => `${medication.name}: ${medication.intelligence || medication.status}`);

  const sections = [
    {
      id: "chief-complaint",
      title: "Chief Complaint",
      text: `The current chief concern is ${encounter.chiefComplaint}.`
    },
    {
      id: "hpi",
      title: "HPI Summary",
      text: encounter.documentation.HPI || encounter.hpi
    },
    {
      id: "clinical-impression",
      title: "Clinical Impression",
      text: `Based on the current history, the primary clinical priority is ${encounter.brief.priority}. This should guide the encounter while preserving clinician judgment.`
    },
    {
      id: "differential",
      title: "Differential Diagnosis",
      text: `The leading considerations include ${topDiagnoses.map((diagnosis) => `${diagnosis.name}, currently weighted at ${diagnosis.probability} percent because ${diagnosis.why}`).join("; ")}.`
    },
    {
      id: "high-risk",
      title: "High Risk Conditions",
      text: highRisk.length
        ? `High risk conditions that may warrant continued evaluation include ${highRisk.map((diagnosis) => diagnosis.name).join(", ")}.`
        : "No single high risk condition has been confirmed, but the clinician may wish to continue safety screening based on symptom evolution."
    },
    {
      id: "labs",
      title: "Suggested Labs",
      text: suggestedLabs.length
        ? `Suggested laboratory considerations include ${suggestedLabs.join(", ")}.`
        : "Suggested laboratory considerations should be guided by the clinician's assessment and current symptom pattern."
    },
    {
      id: "imaging",
      title: "Suggested Imaging",
      text: suggestedImaging.length
        ? `Suggested diagnostic and imaging considerations include ${suggestedImaging.slice(0, 5).join(", ")}.`
        : "Imaging should be selected based on exam findings, stability, and the clinician's risk assessment."
    },
    {
      id: "exam",
      title: "Suggested Physical Exam",
      text: `The clinician may wish to evaluate ${suggestedExam.slice(0, 5).join(", ")}.`
    },
    {
      id: "medications",
      title: "Medication Considerations",
      text: medicationConsiderations.length
        ? `Medication considerations include ${medicationConsiderations.join("; ")}.`
        : "Medication review should focus on adherence, contraindications, and patient access barriers."
    },
    {
      id: "education",
      title: "Patient Education Summary",
      text: encounter.patientEducation.summary
    },
    {
      id: "disposition",
      title: "Disposition Recommendations",
      text: `This may warrant ${encounter.conductor.recommendations[0]?.action || "continued clinician-directed evaluation"}. Current disposition readiness is ${encounter.clinicalConfidence.dispositionReadiness} percent.`
    },
    {
      id: "follow-up",
      title: "Follow-up Recommendations",
      text: `Follow-up considerations include ${encounter.patientEducation.followUp.join(", ")}. The clinician should adjust this plan if additional high-risk findings appear.`
    }
  ].filter((section) => section.text && section.text.trim());

  const opening = "Clinical assistant summary. ";
  const fullText = `${opening}${sections.map((section) => `${section.title}. ${section.text}`).join(" ")}`;

  return {
    id: stableHash(fullText),
    sections,
    fullText,
    wordCount: fullText.split(/\s+/).filter(Boolean).length,
    generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
}

export function estimateSectionTimings(sections, duration) {
  const wordCounts = sections.map((section) => section.text.split(/\s+/).filter(Boolean).length + 2);
  const totalWords = wordCounts.reduce((sum, count) => sum + count, 0) || 1;
  let cursor = 0;

  return sections.map((section, index) => {
    const share = wordCounts[index] / totalWords;
    const sectionDuration = Math.max(2.4, duration * share);
    const timing = { id: section.id, start: cursor, end: cursor + sectionDuration };
    cursor += sectionDuration;
    return timing;
  });
}

export function stableHash(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (Math.imul(31, hash) + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash).toString(36);
}
