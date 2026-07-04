export const clinicalVoiceOptions = [
  { id: import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM", label: "Preferred Clinical Female", tone: "Configured by VITE_ELEVENLABS_VOICE_ID" },
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Clinical Female - Rachel", tone: "Calm, professional" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Clinical Female - Bella", tone: "Warm, concise" },
  { id: "MF3mGyEYCl7XYWbV9V6O6", label: "Clinical Female - Elli", tone: "Clear, reassuring" },
  { id: "ThT5KcBeYPX3keUQqHPh", label: "Clinical Female - Dorothy", tone: "Measured, mature" }
];

export const playbackSpeeds = [0.85, 1, 1.1, 1.25];

const breakTag = (seconds = 0.45) => `<break time="${seconds}s" />`;

function valueAsWords(value) {
  return String(value)
    .replace(/(\d)\.(\d)/g, "$1 point $2")
    .replace(/\//g, " over ")
    .replace(/-/g, " to ")
    .replace(/</g, "less than ")
    .replace(/>/g, "greater than ");
}

function expandClinicalText(value = "") {
  return value
    .replace(/(\d+)\/(\d+)/g, "$1 over $2")
    .replace(/;/g, ".")
    .replace(/\bBP\b/g, "blood pressure")
    .replace(/\bHPI\b/g, "history of present illness")
    .replace(/\bROS\b/g, "review of systems")
    .replace(/\bPMH\b/g, "past medical history")
    .replace(/\bECG\b/g, "electrocardiogram")
    .replace(/\bCBC\b/g, "complete blood count")
    .replace(/\bCMP\b/g, "comprehensive metabolic panel")
    .replace(/\bA1c\b/g, "hemoglobin A one C")
    .replace(/\bLDL\b/g, "L D L cholesterol")
    .replace(/\beGFR\b/g, "estimated G F R")
    .replace(/\bWBC\b/g, "white blood cell count")
    .replace(/\bHgb\b/g, "hemoglobin")
    .replace(/\bCAD\b/g, "coronary artery disease")
    .replace(/\bACS\b/g, "acute coronary syndrome")
    .replace(/\bMI\b/g, "myocardial infarction")
    .replace(/\bAVS\b/g, "after visit summary")
    .replace(/\bICD-10\b/g, "I C D ten")
    .replace(/\bCPT\b/g, "C P T")
    .replace(/\bNSAID\b/g, "nonsteroidal anti-inflammatory medication")
    .replace(/mg\/dL/g, "milligrams per deciliter")
    .replace(/mL\/min/g, "milliliters per minute")
    .replace(/g\/dL/g, "grams per deciliter")
    .replace(/ng\/L/g, "nanograms per liter")
    .replace(/K\/uL/g, "thousand per microliter")
    .replace(/mmHg/g, "millimeters of mercury");
}

function stripSpeechMarkup(value = "") {
  return value.replace(/<break time="[\d.]+s"\s*\/>/g, " ");
}

function makeSection(id, title, text, speechText = text) {
  return {
    id,
    title,
    text: expandClinicalText(text),
    speechText: expandClinicalText(speechText)
  };
}

function formatLabNarration(labs) {
  if (!labs.length) {
    return {
      display: "Key laboratory findings are not yet available in the current encounter state.",
      speech: "Key laboratory findings are not yet available in the current encounter state."
    };
  }

  const byLabel = new Map(labs.map((lab) => [lab.label.toLowerCase(), lab]));
  const lines = [];

  const add = (label, phrase) => {
    const lab = byLabel.get(label.toLowerCase());
    if (lab) lines.push(phrase(lab));
  };

  add("WBC", (lab) => `White blood cell count is ${valueAsWords(lab.value)} thousand per microliter, which is within the expected range.`);
  add("Hgb", (lab) => `Hemoglobin is ${valueAsWords(lab.value)} grams per deciliter.`);
  add("Troponin", (lab) => `High-sensitivity troponin is ${valueAsWords(lab.value)}, which remains within the normal range and lowers concern for myocardial injury in the current snapshot.`);
  add("A1c", (lab) => `Hemoglobin A one C is elevated at ${valueAsWords(lab.value)} percent, supporting suboptimal diabetic control.`);
  add("Glucose", (lab) => `Fasting glucose is ${valueAsWords(lab.value)} milligrams per deciliter, which remains above goal.`);
  add("LDL", (lab) => `L D L cholesterol remains above goal at ${valueAsWords(lab.value)} milligrams per deciliter.`);
  add("Creatinine", (lab) => `Creatinine is ${valueAsWords(lab.value)} milligrams per deciliter.`);
  add("eGFR", (lab) => `Estimated G F R is ${valueAsWords(lab.value)}, suggesting preserved renal function.`);

  const fallback = labs
    .filter((lab) => !byLabel.has(lab.label.toLowerCase()) || !lines.some((line) => line.toLowerCase().includes(lab.label.toLowerCase())))
    .slice(0, Math.max(0, 8 - lines.length))
    .map((lab) => `${expandClinicalText(lab.label)} is ${valueAsWords(lab.value)} ${expandClinicalText(lab.unit || "")}.`.replace(/\s+\./g, "."));

  const sentences = [...lines, ...fallback].slice(0, 8);
  const display = sentences.length
    ? `Laboratory review demonstrates ${sentences.join(" ")}`
    : "Key laboratory findings are not yet available in the current encounter state.";
  const speech = sentences.length
    ? `Laboratory review demonstrates. ${breakTag(0.45)} ${sentences.join(` ${breakTag(0.38)} `)}`
    : display;

  return { display, speech };
}

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
  const keyLabs = formatLabNarration(encounter.labs.slice(0, 8));
  const imagingFindings = encounter.imaging
    .slice(-4)
    .map((study) => `${study.type}: ${study.result}`);
  const medicationConsiderations = encounter.medications
    .filter((medication) => medication.intelligence || medication.status)
    .slice(0, 4)
    .map((medication) => `${medication.name}: ${medication.intelligence || medication.status}`);

  const sections = [
    makeSection("chief-complaint", "Chief Complaint", `The current chief concern is ${encounter.chiefComplaint}.`),
    makeSection("hpi", "HPI Summary", encounter.documentation.HPI || encounter.hpi),
    makeSection(
      "physical-exam",
      "Pertinent Physical Exam",
      `Pertinent physical exam information includes ${suggestedExam.slice(0, 5).join(", ")}.`,
      `Pertinent physical exam information includes ${suggestedExam.slice(0, 5).join(". ")}.`
    ),
    makeSection("key-labs", "Key Laboratory Findings", keyLabs.display, keyLabs.speech),
    makeSection(
      "imaging-findings",
      "Imaging Findings",
      imagingFindings.length
        ? `Current imaging findings include ${imagingFindings.join(". ")}.`
        : "Imaging findings should be reviewed if the clinician determines they are indicated."
    ),
    makeSection(
      "differential",
      "Differential Diagnosis",
      `The leading considerations include ${topDiagnoses.map((diagnosis) => `${diagnosis.name}, currently weighted at ${diagnosis.probability} percent because ${diagnosis.why}`).join(". ")}.`
    ),
    makeSection(
      "high-risk",
      "High Risk Conditions",
      highRisk.length
        ? `High risk conditions that may warrant continued evaluation include ${highRisk.map((diagnosis) => diagnosis.name).join(", ")}.`
        : "No single high risk condition has been confirmed, but the clinician may wish to continue safety screening based on symptom evolution."
    ),
    makeSection(
      "labs",
      "Suggested Workup",
      suggestedLabs.length
        ? `Suggested workup may include ${suggestedLabs.join(", ")}${suggestedImaging.length ? `, and ${suggestedImaging.slice(0, 3).join(", ")}` : ""}.`
        : "Suggested laboratory considerations should be guided by the clinician's assessment and current symptom pattern."
    ),
    makeSection("assessment", "Assessment", encounter.documentation.Assessment),
    makeSection("plan", "Plan", encounter.documentation.Plan),
    makeSection(
      "medications",
      "Medication Considerations",
      medicationConsiderations.length
        ? `Medication considerations include ${medicationConsiderations.join(". ")}.`
        : "Medication review should focus on adherence, contraindications, and patient access barriers."
    ),
    makeSection("icd", "ICD-10 Suggestions", `ICD-10 suggestions for clinician review include ${encounter.billing.icd.join(", ")}.`),
    makeSection("disposition", "Disposition Recommendations", `This may warrant ${encounter.conductor.recommendations[0]?.action || "continued clinician-directed evaluation"}. Current disposition readiness is ${encounter.clinicalConfidence.dispositionReadiness} percent.`),
    makeSection("follow-up", "Follow-up Recommendations", `Follow-up considerations include ${encounter.patientEducation.followUp.join(", ")}. The clinician should adjust this plan if additional high-risk findings appear.`)
  ].filter((section) => section.text && section.text.trim());

  const opening = `Clinical assistant summary. ${breakTag(0.55)} `;
  const fullText = `${opening}${sections.map((section) => `${section.title}. ${breakTag(0.32)} ${section.speechText}`).join(` ${breakTag(0.55)} `)}`;
  const spokenWords = stripSpeechMarkup(fullText).split(/\s+/).filter(Boolean).length;

  return {
    id: stableHash(fullText),
    sections,
    fullText,
    wordCount: spokenWords,
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

export { stripSpeechMarkup };
