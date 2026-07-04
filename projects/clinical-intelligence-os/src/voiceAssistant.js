export const clinicalVoiceOptions = [
  { id: import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM", label: "Preferred Clinical Female", tone: "Configured by VITE_ELEVENLABS_VOICE_ID" },
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
  const keyLabs = encounter.labs
    .slice(0, 8)
    .map((lab) => `${lab.label} ${lab.value}${lab.unit}, ${lab.range}`);
  const imagingFindings = encounter.imaging
    .slice(-4)
    .map((study) => `${study.type}: ${study.result}`);
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
      id: "physical-exam",
      title: "Pertinent Physical Exam",
      text: `Pertinent physical exam information includes ${suggestedExam.slice(0, 5).join(", ")}.`
    },
    {
      id: "key-labs",
      title: "Key Laboratory Findings",
      text: keyLabs.length
        ? `Key laboratory findings include ${keyLabs.join("; ")}.`
        : "Key laboratory findings are not yet available in the current encounter state."
    },
    {
      id: "imaging-findings",
      title: "Imaging Findings",
      text: imagingFindings.length
        ? `Current imaging findings include ${imagingFindings.join("; ")}.`
        : "Imaging findings should be reviewed if the clinician determines they are indicated."
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
      title: "Suggested Workup",
      text: suggestedLabs.length
        ? `Suggested workup may include ${suggestedLabs.join(", ")}${suggestedImaging.length ? `, and ${suggestedImaging.slice(0, 3).join(", ")}` : ""}.`
        : "Suggested laboratory considerations should be guided by the clinician's assessment and current symptom pattern."
    },
    {
      id: "assessment",
      title: "Assessment",
      text: encounter.documentation.Assessment
    },
    {
      id: "plan",
      title: "Plan",
      text: encounter.documentation.Plan
    },
    {
      id: "medications",
      title: "Medication Considerations",
      text: medicationConsiderations.length
        ? `Medication considerations include ${medicationConsiderations.join("; ")}.`
        : "Medication review should focus on adherence, contraindications, and patient access barriers."
    },
    {
      id: "icd",
      title: "ICD-10 Suggestions",
      text: `ICD-10 suggestions for clinician review include ${encounter.billing.icd.join(", ")}.`
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
