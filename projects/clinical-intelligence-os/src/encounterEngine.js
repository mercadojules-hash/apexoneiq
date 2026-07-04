export const encounterSteps = [
  { label: "Clinical Brief", screen: "command", activity: "Preparing clinical brief..." },
  { label: "History Collection", screen: "visit", activity: "Listening to patient narrative..." },
  { label: "Reasoning", screen: "reasoning", activity: "Reordering the differential..." },
  { label: "Medication Check", screen: "meds", activity: "Checking medication safety..." },
  { label: "Lab Comparison", screen: "labs", activity: "Comparing laboratory trends..." },
  { label: "Timeline Review", screen: "timeline", activity: "Merging longitudinal history..." },
  { label: "Documentation", screen: "docs", activity: "Rewriting documentation..." },
  { label: "Education", screen: "education", activity: "Adjusting patient education..." }
];

export const screenStage = {
  command: 0,
  visit: 1,
  reasoning: 2,
  meds: 3,
  labs: 4,
  timeline: 5,
  docs: 6,
  education: 7,
  executive: 1
};

export const demoJumps = [
  { label: "Clinical Brief", stage: 0, screen: "command", prep: true },
  { label: "History Collection", stage: 1, screen: "visit" },
  { label: "Physical Exam", stage: 4, screen: "visit" },
  { label: "Assessment", stage: 5, screen: "reasoning" },
  { label: "Plan", stage: 7, screen: "docs" },
  { label: "Visit Complete", stage: 8, screen: "education" }
];

const baselineDocumentation = {
  Subjective: "Sarah is here for diabetes and hypertension follow-up, medication refills, and recent lab review.",
  Objective: "BP 148/92. Recent labs show A1c 8.2%, LDL 118, eGFR 72, potassium 4.8.",
  HPI: "52-year-old patient here for diabetes and hypertension follow-up, refills, and lab review.",
  ROS: "Initial review pending. No complete cardiac ROS documented yet.",
  "Physical Exam": "General well appearing. Focused exam pending.",
  Assessment: "Type 2 diabetes above individualized target, hypertension above goal, hyperlipidemia above target.",
  Plan: "Review adherence, refill chronic medications as appropriate, order follow-up A1c/CMP/urine ACR, complete preventive gaps.",
  ICD: ["E11.9 Type 2 diabetes mellitus", "I10 Essential hypertension", "E78.5 Hyperlipidemia"],
  CPT: ["99214 Established patient visit", "36415 Venipuncture"],
  AVS: "Your blood sugar average has increased and your blood pressure is above goal. We reviewed medication consistency, refills, labs, and prevention steps."
};

export const INITIAL_ENCOUNTER = {
  active: false,
  paused: false,
  simulationEnabled: false,
  mode: "in-person",
  stage: 0,
  eventCursor: 0,
  clockMinute: 8 * 60 + 12,
  reviewedEvidence: [],
  answeredInteractions: {},
  conversationAudit: [],
  patient: {
    name: "Sarah Johnson",
    age: 52,
    initials: "SJ",
    sex: "Female",
    mrn: "MRN 104827",
    lastVisit: "Apr 18, 2026",
    next: "Cardiology consult - Jul 18",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=420&q=80"
  },
  demographics: {
    age: 52,
    sex: "Female"
  },
  chiefComplaint: "Diabetes follow-up",
  hpi: "Routine diabetes and hypertension follow-up with refills and lab review.",
  ros: ["No complete ROS yet"],
  pmh: ["Type 2 diabetes mellitus", "Essential hypertension", "Hyperlipidemia"],
  surgicalHistory: ["No major surgeries documented in mock chart"],
  familyHistory: ["Father with coronary artery disease in his 60s"],
  socialHistory: ["Works as a school administrator", "Walks intermittently", "No tobacco use documented"],
  allergies: ["No known drug allergies"],
  medications: [
    { name: "Metformin XR", dose: "1000 mg nightly", status: "Refill due in 6 days", adherence: 86, intelligence: "Continue adherence review." },
    { name: "Lisinopril", dose: "20 mg daily", status: "BP above goal", adherence: 78, intelligence: "Repeat BP and refill access need review." },
    { name: "Atorvastatin", dose: "40 mg nightly", status: "Active", adherence: 91, intelligence: "LDL remains above goal despite improving trend." },
    { name: "Albuterol HFA", dose: "2 puffs PRN", status: "Rare use", adherence: 64, intelligence: "Confirm dyspnea is not wheeze-related." }
  ],
  labs: [
    { label: "A1c", value: 8.2, unit: "%", range: "Goal <7.5", series: [7.1, 7.4, 7.6, 7.7, 8.2], tone: "high", intelligence: "Rising trend supports adherence and therapy review." },
    { label: "LDL", value: 118, unit: "mg/dL", range: "Goal <100", series: [142, 136, 127, 121, 118], tone: "warn", intelligence: "Improving but above goal in chest symptom context." },
    { label: "eGFR", value: 72, unit: "mL/min", range: "Normal >60", series: [82, 78, 76, 73, 72], tone: "ok", intelligence: "Renal function adequate for current medication review." },
    { label: "K+", value: 4.8, unit: "mmol/L", range: "3.5-5.1", series: [4.2, 4.4, 4.7, 4.5, 4.8], tone: "ok", intelligence: "Monitor with ACE inhibitor and renal risk." }
  ],
  imaging: [
    { type: "Chest X-ray", date: "Feb 04, 2026", result: "Clear lungs, normal cardiac silhouette." }
  ],
  physicalExam: ["Focused cardiopulmonary exam pending", "Foot exam due"],
  vitalSigns: [
    { label: "BP", value: "148/92", unit: "mmHg", tone: "warn", trend: "+8 systolic" },
    { label: "A1c", value: "8.2", unit: "%", tone: "high", trend: "+0.5 since Jan" },
    { label: "LDL", value: "118", unit: "mg/dL", tone: "warn", trend: "-9 since Apr" },
    { label: "BMI", value: "31.4", unit: "", tone: "neutral", trend: "stable" }
  ],
  differentialDiagnoses: [
    { name: "Chronic disease management visit", probability: 78, direction: "baseline", why: "Original visit reason is diabetes, BP, refills, and lab review." },
    { name: "Stable coronary artery disease", probability: 32, direction: "watch", why: "Cardiometabolic risk exists, but no chest symptom has been characterized yet." },
    { name: "Acute coronary syndrome", probability: 18, direction: "watch", why: "No current high-risk details documented at baseline." },
    { name: "Musculoskeletal chest wall pain", probability: 14, direction: "watch", why: "No exam finding available yet." },
    { name: "GERD or esophageal source", probability: 20, direction: "watch", why: "Chest discomfort differential remains broad before symptom detail." }
  ],
  orders: ["Repeat BP", "A1c follow-up", "CMP", "Urine ACR"],
  evidence: ["Recent metabolic labs", "Prior chest X-ray", "Prior cardiometabolic consult"],
  documentation: baselineDocumentation,
  patientEducation: {
    summary: baselineDocumentation.AVS,
    medications: ["Take metformin with evening meal", "Check BP at home 4 days/week", "Call for severe side effects"],
    lifestyle: ["10-minute walk after meals", "Half plate non-starchy vegetables", "Reduce sweet drinks", "Bring glucose log next visit"],
    followUp: ["Labs: repeat A1c in 3 months", "Call for chest pain at rest"]
  },
  billing: {
    icd: baselineDocumentation.ICD,
    cpt: baselineDocumentation.CPT,
    confidence: 62
  },
  clinicalConfidence: {
    diagnostic: 48,
    evidenceCompleteness: 35,
    documentationCompleteness: 42,
    dispositionReadiness: 28,
    patientUnderstanding: 34,
    billingConfidence: 62
  },
  encounterProgress: {
    clinicalReadiness: 24,
    evidenceCompleteness: 35,
    documentationComplete: 42,
    safetyReview: 30,
    ordersComplete: 36,
    educationComplete: 28,
    dispositionReady: 22
  },
  timeline: [
    { type: "Lab", date: "Today", title: "A1c 8.2%, LDL 118, eGFR 72", meta: "New results reviewed" },
    { type: "Note", date: "Apr 18", title: "Diabetes follow-up", meta: "Metformin titrated, nutrition referral discussed" },
    { type: "Imaging", date: "Feb 04", title: "Chest X-ray clear", meta: "Urgent care visit for cough" },
    { type: "Procedure", date: "2025", title: "Colonoscopy", meta: "Two benign polyps, repeat in 5 years" },
    { type: "Diagnosis", date: "2022", title: "Type 2 diabetes mellitus", meta: "Initial A1c 7.8%" },
    { type: "Diagnosis", date: "2020", title: "Essential hypertension", meta: "Home BP monitoring recommended" }
  ],
  transcript: [
    ["Copilot", "Encounter opened as a routine diabetes and hypertension follow-up."]
  ],
  intelligenceFeed: [
    { time: "08:12", type: "Encounter Opened", text: "Clinical OS linked demographics, labs, medications, evidence, documentation, education, billing, and readiness into one encounter state." }
  ],
  confidenceChanges: [],
  missingQuestions: [
    "Any chest discomfort, shortness of breath, dizziness, or palpitations?",
    "Medication doses missed in the last two weeks?",
    "Home BP and glucose range?",
    "Any barriers to refills?"
  ],
  recommendations: [
    "Repeat BP after five minutes.",
    "Review medication adherence and refill access.",
    "Order A1c, CMP, and urine ACR follow-up.",
    "Complete foot exam and preventive care gaps."
  ]
};

const clinicalEvents = [
  {
    id: "exertional-chest-tightness",
    type: "Priority Shift",
    text: "New exertional chest tightness shifted the encounter from routine chronic care toward cardiac risk triage.",
    apply: (state) => ({
      ...state,
      chiefComplaint: "Exertional chest tightness during diabetes follow-up",
      hpi: "Routine diabetes follow-up changed when Sarah reported chest tightness while climbing stairs twice this week.",
      ros: ["Positive exertional chest tightness", "Shortness of breath once", "No arm radiation reported yet"],
      medications: state.medications.map((med) => {
        if (med.name === "Atorvastatin") return { ...med, intelligence: "Chest symptom context raises ASCVD prevention priority; confirm adherence and intensity." };
        if (med.name === "Lisinopril") return { ...med, intelligence: "BP control now matters to cardiac risk triage; confirm recent missed doses and refill access." };
        return med;
      }),
      labs: state.labs.map((lab) => {
        if (lab.label === "LDL") return { ...lab, intelligence: "LDL above goal is now weighted in the exertional chest symptom risk frame." };
        if (lab.label === "A1c") return { ...lab, intelligence: "Diabetes control increases cardiac risk context for the new exertional symptom." };
        return lab;
      }),
      differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
        "Stable coronary artery disease": [72, "up", "Exertional chest tightness in a patient with diabetes, hypertension, and LDL above goal raises ischemic concern."],
        "Acute coronary syndrome": [46, "up", "Exertional symptoms require exclusion of acute ischemia before routine management."],
        "Chronic disease management visit": [40, "down", "Chronic disease work remains important but is no longer the primary immediate objective."]
      }),
      orders: unique([...state.orders, "In-office ECG", "Focused cardiac exam", "Clarify exertional symptoms", "Aspirin and NSAID review"]),
      timeline: [{ type: "Symptom", date: "Now", title: "Exertional chest tightness revealed", meta: "Encounter priority changed during history" }, ...state.timeline],
      transcript: [...state.transcript, ["Patient", "I've had a tight feeling in my chest twice this week, mostly when walking upstairs."]],
      missingQuestions: ["Any symptoms at rest?", "Any sweating or nausea?", "What relieves it?", "Can you walk the same distance as last month?"],
      recommendations: ["Perform ECG now.", "Complete focused cardiac and lung exam.", "Clarify duration, triggers, relief, and associated symptoms.", "Review aspirin, NSAID, and contraindication history.", ...state.recommendations],
      confidenceChanges: [...state.confidenceChanges, { delta: "+24", finding: "Exertional chest tightness", reason: "Activity-triggered pressure raises CAD probability and makes ischemia exclusion the primary priority." }]
    })
  },
  {
    id: "associated-sob",
    type: "Reasoning Update",
    text: "Associated shortness of breath increased concern for cardiac ischemia while lack of radiation slightly lowered classic ACS pattern.",
    apply: (state) => ({
      ...state,
      ros: unique([...state.ros, "Shortness of breath with one episode", "No syncope", "No known radiation to arm or jaw"]),
      differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
        "Stable coronary artery disease": [78, "up", "Dyspnea with exertional pressure strengthens ischemic pattern."],
        "Acute coronary syndrome": [48, "mixed", "Dyspnea increases concern, while brief episodes and no radiation prevent overcalling MI."]
      }),
      timeline: [{ type: "History", date: "Now", title: "Shortness of breath once; no arm radiation", meta: "Associated symptoms refined the differential" }, ...state.timeline],
      transcript: [...state.transcript, ["Patient", "Usually a few minutes. It does not go down my arm, but I felt short of breath once."]],
      missingQuestions: ["Any sweating, nausea, or dizziness?", "Does rest reliably relieve the tightness?", "Any chest pain at rest?", "Any family history of early heart disease?"],
      confidenceChanges: [...state.confidenceChanges, { delta: "+8", finding: "Dyspnea with exertion", reason: "Associated shortness of breath supports additional cardiac evaluation." }, { delta: "-4", finding: "No arm radiation", reason: "One classic ACS feature is absent, narrowing but not clearing risk." }]
    })
  },
  {
    id: "ecg-normal",
    type: "Evidence Returned",
    text: "Normal ECG lowered acute MI probability but did not clear exertional angina risk.",
    apply: (state) => ({
      ...state,
      imaging: [...state.imaging, { type: "ECG", date: "Jul 04, 2026", result: "Normal sinus rhythm in mock tracing; no acute ST elevation displayed." }],
      evidence: unique([...state.evidence, "ECG normal sinus rhythm"]),
      differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
        "Acute coronary syndrome": [34, "down", "Normal ECG lowers immediate STEMI concern, but symptoms still require clinical correlation."],
        "Stable coronary artery disease": [74, "down", "Normal resting ECG does not exclude exertional ischemia."]
      }),
      orders: unique([...state.orders, "Troponin if clinically indicated", "Document ECG interpretation"]),
      timeline: [{ type: "Diagnostic", date: "Now", title: "ECG available", meta: "No acute ST elevation in mock tracing" }, ...state.timeline],
      confidenceChanges: [...state.confidenceChanges, { delta: "-12", finding: "Normal ECG", reason: "Acute ischemic probability decreases, while outpatient CAD assessment remains supported." }]
    })
  },
  {
    id: "troponin-normal",
    type: "Lab Returned",
    text: "Normal troponin lowered myocardial infarction concern and moved planning toward outpatient cardiac assessment if symptoms remain stable.",
    apply: (state) => ({
      ...state,
      labs: [{ label: "Troponin", value: 4, unit: "ng/L", range: "Normal <12", series: [4], tone: "ok", intelligence: "Lowers MI concern in the mock scenario." }, ...state.labs],
      evidence: unique([...state.evidence, "Troponin normal"]),
      differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
        "Acute coronary syndrome": [22, "down", "Negative troponin lowers MI concern in this stable mock encounter."],
        "Stable coronary artery disease": [68, "watch", "Stable angina remains possible despite lower MI probability."]
      }),
      orders: unique([...state.orders, "Outpatient cardiology follow-up", "Return precautions for rest pain or persistent symptoms"]),
      timeline: [{ type: "Lab", date: "Now", title: "Troponin normal", meta: "MI concern reduced in mock scenario" }, ...state.timeline],
      confidenceChanges: [...state.confidenceChanges, { delta: "-16", finding: "Troponin normal", reason: "Evidence lowers concern for myocardial infarction and supports disposition planning if clinically stable." }]
    })
  },
  {
    id: "chest-wall-tenderness",
    type: "Exam Finding",
    text: "Reproducible chest wall tenderness introduced musculoskeletal pain while preserving cardiac follow-up due to exertional history.",
    apply: (state) => ({
      ...state,
      physicalExam: ["Reproducible left anterior chest wall tenderness", "Normal work of breathing", "Regular rhythm in mock exam", "Foot exam due"],
      differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
        "Musculoskeletal chest wall pain": [58, "up", "Reproducible tenderness supports a chest wall contributor."],
        "Acute coronary syndrome": [18, "down", "Exam finding and negative tests lower acute probability."],
        "Stable coronary artery disease": [56, "down", "Tenderness explains some pain, but exertional pattern keeps outpatient assessment active."]
      }),
      timeline: [{ type: "Exam", date: "Now", title: "Chest wall tenderness reproducible", meta: "Musculoskeletal diagnosis introduced" }, ...state.timeline],
      recommendations: ["Treat chest wall pain conservatively if clinically appropriate.", "Keep cardiology follow-up because symptoms were exertional.", "Give clear urgent return precautions.", ...state.recommendations],
      confidenceChanges: [...state.confidenceChanges, { delta: "+26", finding: "Reproducible tenderness", reason: "Musculoskeletal pain probability rises because exam reproduces symptoms." }]
    })
  },
  {
    id: "refill-gap",
    type: "Medication Intelligence",
    text: "Refill gap explains part of BP elevation and updates medication safety, education, documentation, and billing support.",
    apply: (state) => ({
      ...state,
      medications: state.medications.map((med) => med.name === "Lisinopril" ? { ...med, status: "Refill gap confirmed", adherence: 68, intelligence: "Access barrier likely contributed to BP above goal." } : med),
      hpi: `${state.hpi} She also missed BP medication after her refill ran out.`,
      orders: unique([...state.orders, "Renew lisinopril if appropriate", "Medication reconciliation", "Home BP log"]),
      transcript: [...state.transcript, ["Patient", "I missed my blood pressure medicine a few times because the refill ran out."]],
      timeline: [{ type: "Medication", date: "Now", title: "Lisinopril refill gap confirmed", meta: "Adherence barrier surfaced during conversation" }, ...state.timeline],
      confidenceChanges: [...state.confidenceChanges, { delta: "+10", finding: "Refill gap", reason: "BP elevation now has an actionable adherence explanation." }]
    })
  },
  {
    id: "diabetes-guidance",
    type: "Predictive Guidance",
    text: "Rising A1c triggered diabetes next steps: A1c follow-up, urine ACR, retinal exam, nutrition, and medication adherence review.",
    apply: (state) => ({
      ...state,
      orders: unique([...state.orders, "Urine ACR", "Retinal exam referral", "Nutrition follow-up", "A1c in 3 months"]),
      recommendations: unique(["Order urine ACR.", "Confirm retinal exam status.", "Review metformin adherence and tolerance.", "Schedule nutrition follow-up.", ...state.recommendations]),
      timeline: [{ type: "Planning", date: "Now", title: "Diabetes guidance refreshed", meta: "A1c drift connected to adherence and prevention gaps" }, ...state.timeline]
    })
  },
  {
    id: "education-ready",
    type: "Documentation Rewritten",
    text: "SOAP, ICD, CPT, AVS, education, and disposition readiness were rewritten from the current shared encounter state.",
    apply: (state) => state
  }
];

export function encounterReducer(state, action) {
  switch (action.type) {
    case "START_SIMULATION":
      return { ...INITIAL_ENCOUNTER, active: true, simulationEnabled: true, paused: false, mode: state.mode, reviewedEvidence: state.reviewedEvidence };
    case "PAUSE":
      return { ...state, paused: true };
    case "RESUME":
      return state.active ? { ...state, paused: false } : { ...state, active: true, simulationEnabled: true, paused: false };
    case "RESET":
      return { ...INITIAL_ENCOUNTER, mode: state.mode };
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "REVIEW_EVIDENCE":
      return reviewEvidence(state, action.id);
    case "SELECT_CONVERSATION_OPTION":
      return applyConversationOption(state, action.interactionId, action.optionId);
    case "APPLY_NEXT_EVENT": {
      if (!state.active || state.paused) return state;
      return applyEventsThrough(state.eventCursor + 1, state);
    }
    case "CLINICIAN_ACTION": {
      const runningState = state.active ? state : { ...state, active: true, simulationEnabled: true };
      const advanced = applyEventsThrough(runningState.eventCursor + 1, { ...runningState, paused: true });
      return {
        ...advanced,
        intelligenceFeed: [
          ...advanced.intelligenceFeed,
          {
            type: "Clinician Action",
            text: action.text || "A clinician interaction satisfied an information gap, so confidence, hypotheses, documentation, and recommendations recalculated."
          }
        ]
      };
    }
    case "JUMP_TO_STAGE":
      return applyEventsThrough(action.stage, { ...INITIAL_ENCOUNTER, active: !action.prep, paused: true, simulationEnabled: !action.prep, mode: state.mode, reviewedEvidence: state.reviewedEvidence });
    default:
      return state;
  }
}

export function deriveEncounter(state, evidenceAvailable = 0) {
  const stage = Math.min(state.eventCursor, encounterSteps.length - 1);
  const clinicalConfidence = deriveConfidence(state);
  const encounterProgress = deriveProgress(state, clinicalConfidence);
  const documentation = deriveDocumentation(state);
  const patientEducation = deriveEducation(state);
  const billing = deriveBilling(state);
  const brief = deriveBrief(state);
  const narrative = deriveNarrative(state);
  const conductor = deriveConductor(state, clinicalConfidence, encounterProgress, brief);
  const readinessScore = Math.round(Object.values(encounterProgress).reduce((sum, value) => sum + value, 0) / Object.values(encounterProgress).length);
  const latestFeed = state.intelligenceFeed.slice(-7).reverse();

  return {
    ...state,
    stage,
    currentStep: encounterSteps[stage],
    active: state.active,
    clinicalEvidence: state.evidence,
    evidence: {
      available: evidenceAvailable,
      reviewed: state.reviewedEvidence.length,
      outstanding: Math.max(evidenceAvailable - state.reviewedEvidence.length, 0)
    },
    brief,
    narrative,
    documentation,
    patientEducation,
    billing,
    clinicalConfidence,
    encounterProgress,
    conductor,
    readinessScore,
    feed: latestFeed,
    confidenceChanges: state.confidenceChanges,
    differentialDiagnoses: [...state.differentialDiagnoses].sort((a, b) => b.probability - a.probability),
    isReady: (screen) => state.active && stage >= (screenStage[screen] ?? 99)
  };
}

function deriveConductor(state, confidence, progress, brief) {
  const diagnoses = [...state.differentialDiagnoses].sort((a, b) => b.probability - a.probability);
  const informationNeeded = deriveInformationNeeds(state);
  const confidenceTimeline = deriveConfidenceTimeline(state);
  const bottleneck = Object.entries(progress).sort((a, b) => a[1] - b[1])[0];
  const primaryHypothesis = diagnoses[0]?.name || "Clinical priority not established";

  return {
    priority: brief.priority,
    nextBestAction: informationNeeded[0]?.action || "Continue shared encounter synthesis.",
    primaryHypothesis,
    confidenceTimeline,
    informationNeeded,
    actionGroups: [
      { id: "radiation", ...conversationInteractions.radiation },
      { id: "cardiacExam", ...conversationInteractions.cardiacExam },
      { id: "ecgResult", ...conversationInteractions.ecgResult },
      { id: "troponinResult", ...conversationInteractions.troponinResult }
    ],
    hypotheses: diagnoses.map((diagnosis) => ({
      ...diagnosis,
      status: diagnosis.direction === "up" ? "Rising" : diagnosis.direction === "down" ? "Falling" : diagnosis.direction === "mixed" ? "Mixed" : "Watching",
      missing: informationNeeded.find((item) => item.relatedTo === diagnosis.name)?.question || "No single blocker identified."
    })),
    recommendations: deriveConductorRecommendations(state, diagnoses, informationNeeded),
    bottleneck: {
      label: readinessLabel(bottleneck?.[0] || "clinicalReadiness"),
      value: bottleneck?.[1] || progress.clinicalReadiness,
      reason: "This is the lowest readiness domain and should receive attention before disposition."
    },
    confidenceSummary: `${confidence.diagnostic}% diagnostic confidence, ${confidence.evidenceCompleteness}% evidence completeness, ${confidence.dispositionReadiness}% disposition readiness.`
  };
}

function deriveInformationNeeds(state) {
  const needs = [];

  if (state.eventCursor < 2) {
    if (state.eventCursor >= 1 && !state.answeredInteractions.radiation) {
      needs.push({
        action: "Ask whether pain radiates.",
        question: "Does the pain radiate?",
        whyItMatters: "Radiation to arm, jaw, or back is a high-value discriminator for cardiac risk and disposition.",
        relatedTo: "Acute coronary syndrome",
        impact: "High",
        interactionId: "radiation"
      });
    }

    needs.push({
      action: "Clarify exertional symptom pattern.",
      question: "Does rest reliably relieve the tightness, and does it ever occur at rest?",
      whyItMatters: "This separates stable exertional symptoms from a potentially unstable pattern.",
      relatedTo: "Stable coronary artery disease",
      impact: "High",
      interactionId: "radiation"
    });
  }

  if (state.eventCursor < 3) {
    needs.push({
      action: "Obtain and interpret ECG.",
      question: "Is there any acute ischemic change on ECG?",
      whyItMatters: "ECG evidence is the fastest next discriminator for acute ischemic risk in this mock encounter.",
      relatedTo: "Acute coronary syndrome",
      impact: "High",
      interactionId: "ecgResult"
    });
  }

  if (state.eventCursor < 4) {
    needs.push({
      action: "Decide whether troponin is clinically indicated.",
      question: "Is troponin normal or rising in the appropriate clinical context?",
      whyItMatters: "A negative troponin lowers myocardial infarction concern; an abnormal value would sharply change disposition.",
      relatedTo: "Acute coronary syndrome",
      impact: "High",
      interactionId: "troponinResult"
    });
  }

  if (state.eventCursor < 5) {
    needs.push({
      action: "Complete focused chest wall and cardiopulmonary exam.",
      question: "Can the pain be reproduced on exam without unstable cardiopulmonary findings?",
      whyItMatters: "Reproducibility raises musculoskeletal probability but does not erase exertional cardiac risk.",
      relatedTo: "Musculoskeletal chest wall pain",
      impact: "Medium",
      interactionId: "cardiacExam"
    });
  }

  if (state.eventCursor < 6) {
    needs.push({
      action: "Confirm medication access and adherence.",
      question: "Was BP medication missed because of a refill or cost barrier?",
      whyItMatters: "A refill gap converts elevated BP from a vague risk signal into an actionable plan item.",
      relatedTo: "Essential hypertension",
      impact: "Medium",
      interactionId: "medAdherence"
    });
  }

  needs.push({
    action: "Close diabetes prevention gaps.",
    question: "Is urine ACR and retinal screening current?",
    whyItMatters: "These do not decide chest pain disposition, but they determine whether the chronic care portion is complete.",
    relatedTo: "Type 2 diabetes mellitus",
    impact: "Medium",
    interactionId: "diabetesGaps"
  });

  return needs;
}

function deriveConductorRecommendations(state, diagnoses, informationNeeded) {
  const top = diagnoses[0]?.name || "Clinical priority";
  const firstNeed = informationNeeded[0];

  if (state.eventCursor >= 4) {
    return [
      {
        action: "Prepare stable-disposition cardiac follow-up while preserving return precautions.",
        why: "Normal ECG and troponin lower acute MI concern, but exertional symptoms still deserve cardiac assessment.",
        evidence: "Exertional tightness and dyspnea raised CAD concern; ECG/troponin lowered acute MI probability.",
        confidenceChanger: "Any rest pain, persistent symptoms, abnormal repeat vitals, or worsening troponin would most change confidence."
      },
      {
        action: "Finish chronic disease plan only after cardiac safety is documented.",
        why: "The original diabetes/BP visit remains important, but it is secondary to safe chest symptom disposition.",
        evidence: "A1c 8.2, BP 148/92, LDL 118, and refill/access questions remain active.",
        confidenceChanger: "The single most useful missing piece is whether BP medication access explains the elevated pressure."
      },
      {
        action: firstNeed.action,
        why: firstNeed.whyItMatters,
        evidence: `${top} is currently the leading hypothesis at ${diagnoses[0]?.probability || 0}% fit.`,
        confidenceChanger: firstNeed.question
      }
    ];
  }

  if (state.eventCursor >= 1) {
    return [
      {
        action: "Prioritize ischemia exclusion before routine diabetes decisions.",
        why: "A new exertional chest symptom can change disposition and safety planning.",
        evidence: "Patient reported chest tightness when climbing stairs in the setting of diabetes, hypertension, and LDL above goal.",
        confidenceChanger: "The single most confidence-changing answer is whether symptoms occur at rest or reliably resolve with rest."
      },
      {
        action: "Get ECG and focused cardiopulmonary exam.",
        why: "These are the fastest next checks that can lower or raise acute cardiac concern.",
        evidence: "Stable CAD and ACS probabilities rose after the exertional pattern entered the encounter.",
        confidenceChanger: "Acute ECG changes would most change confidence and disposition."
      },
      {
        action: "Keep medication and metabolic risk in the frame.",
        why: "The chest symptom cannot be interpreted separately from BP, LDL, diabetes, and adherence.",
        evidence: "A1c 8.2, BP 148/92, LDL 118, active lisinopril/statin/metformin profile.",
        confidenceChanger: "A confirmed BP medication refill gap would most change the BP plan."
      }
    ];
  }

  return [
    {
      action: "Start with chronic disease readiness, but actively listen for risk-changing symptoms.",
      why: "The encounter begins as diabetes and hypertension follow-up, but hidden symptoms can reorder the visit.",
      evidence: "A1c 8.2, BP 148/92, LDL 118, refills and preventive gaps are present at baseline.",
      confidenceChanger: "A new exertional symptom would most change the encounter priority."
    },
    {
      action: "Clarify adherence and refill access.",
      why: "Medication barriers often explain uncontrolled BP or glucose before therapy escalation.",
      evidence: "Lisinopril adherence is below ideal and BP is above goal.",
      confidenceChanger: "The answer to whether doses were missed in the last two weeks would most change confidence."
    },
    {
      action: "Close diabetes safety gaps.",
      why: "Renal and eye screening determine chronic care completeness.",
      evidence: "Urine ACR and retinal exam status remain open in the mock chart.",
      confidenceChanger: "Current ACR/retinal status would most change completion readiness."
    }
  ];
}

function deriveConfidenceTimeline(state) {
  const points = [
    { label: "Open", value: 48, note: "Routine chronic care confidence at baseline." },
    { label: "Chest pain", value: state.eventCursor >= 1 ? 53 : 48, note: "Confidence resets around cardiac safety after exertional symptom." },
    { label: "ROS", value: state.eventCursor >= 2 ? 58 : state.eventCursor >= 1 ? 53 : 48, note: "Associated symptoms refine CAD and ACS weighting." },
    { label: "ECG", value: state.eventCursor >= 3 ? 62 : state.eventCursor >= 2 ? 58 : 48, note: "Normal ECG lowers acute ischemic concern." },
    { label: "Troponin", value: state.eventCursor >= 4 ? 75 : state.eventCursor >= 3 ? 62 : 48, note: "Normal troponin lowers MI probability in the mock sequence." },
    { label: "Exam", value: state.eventCursor >= 5 ? 78 : state.eventCursor >= 4 ? 75 : 48, note: "Chest wall tenderness adds a non-cardiac explanation." },
    { label: "Plan", value: Math.min(88, 78 + Math.max(state.eventCursor - 5, 0) * 4), note: "Plan confidence rises as meds, diabetes gaps, and education close." }
  ];

  return points.filter((point, index) => index === 0 || index <= state.eventCursor + 1);
}

function applyEventsThrough(count, startingState) {
  const target = Math.min(count, clinicalEvents.length);
  let next = { ...startingState, active: startingState.active, eventCursor: startingState.eventCursor };

  while (next.eventCursor < target) {
    const event = clinicalEvents[next.eventCursor];
    next = event.apply(next);
    next = {
      ...next,
      eventCursor: next.eventCursor + 1,
      stage: Math.min(next.eventCursor + 1, encounterSteps.length - 1),
      ...appendFeed(next, [
        { type: event.type, text: event.text }
      ])
    };
  }

  return next;
}

const conversationInteractions = {
  radiation: {
    prompt: "Does the pain radiate?",
    kind: "Patient response",
    options: [
      {
        id: "left-arm",
        label: "Left arm",
        answer: "It goes into my left arm.",
        apply: (state) => ({
          ...state,
          ros: unique([...state.ros, "Radiation to left arm"]),
          orders: unique([...state.orders, "Urgent ECG interpretation", "Troponin pathway", "Aspirin contraindication review"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [68, "up", "Left-arm radiation increases concern for ACS and changes disposition threshold."],
            "Stable coronary artery disease": [76, "up", "Exertional pressure with arm radiation strongly supports cardiac ischemia evaluation."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+12", finding: "Left-arm radiation", reason: "Classic radiation pattern sharply raises cardiac concern." }]
        })
      },
      {
        id: "jaw",
        label: "Jaw",
        answer: "It sometimes moves toward my jaw.",
        apply: (state) => ({
          ...state,
          ros: unique([...state.ros, "Jaw radiation"]),
          orders: unique([...state.orders, "Urgent ECG interpretation", "Troponin pathway"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [64, "up", "Jaw radiation is a high-value ischemic associated feature."],
            "Stable coronary artery disease": [74, "up", "Exertional tightness with jaw radiation supports cardiac assessment."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+10", finding: "Jaw radiation", reason: "Jaw radiation increases ischemic likelihood and urgency." }]
        })
      },
      {
        id: "back",
        label: "Back",
        answer: "It goes through to my back.",
        apply: (state) => ({
          ...state,
          ros: unique([...state.ros, "Back radiation"]),
          orders: unique([...state.orders, "Assess for tearing pain", "Pulse and BP symmetry", "Urgent ECG interpretation"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [54, "up", "Back radiation keeps ACS active and broadens safety review."],
            "Aortic syndrome": [22, "up", "Back radiation introduces a low-probability but high-risk diagnosis to screen."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+7", finding: "Back radiation", reason: "Back radiation broadens high-risk differential and raises safety review priority." }]
        })
      },
      {
        id: "none",
        label: "No radiation",
        answer: "No, it does not go anywhere.",
        apply: (state) => ({
          ...state,
          ros: unique([...state.ros, "No radiation to arm, jaw, or back"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [Math.max(18, probabilityOf(state, "Acute coronary syndrome") - 10), "down", "No radiation lowers classic ACS pattern but does not clear exertional cardiac risk."],
            "Stable coronary artery disease": [Math.max(58, probabilityOf(state, "Stable coronary artery disease") - 4), "watch", "No radiation softens but does not remove exertional CAD concern."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+5", finding: "No radiation", reason: "A key red-flag associated feature is absent, making the risk estimate more precise." }]
        })
      },
      {
        id: "unsure",
        label: "Unsure",
        answer: "I'm not sure.",
        apply: (state) => ({
          ...state,
          ros: unique([...state.ros, "Radiation unclear"]),
          missingQuestions: unique(["Clarify radiation with body map", ...state.missingQuestions]),
          confidenceChanges: [...state.confidenceChanges, { delta: "-2", finding: "Radiation unclear", reason: "Uncertainty preserves the information gap and limits confidence." }]
        })
      }
    ]
  },
  cardiacExam: {
    prompt: "Cardiac exam finding",
    kind: "Physical exam",
    options: [
      {
        id: "normal",
        label: "Normal S1/S2",
        answer: "Cardiac exam normal S1/S2 without murmur.",
        apply: (state) => ({
          ...state,
          physicalExam: unique([...state.physicalExam.filter((item) => !item.includes("Focused cardiopulmonary")), "Normal S1/S2", "Regular rhythm"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [Math.max(16, probabilityOf(state, "Acute coronary syndrome") - 5), "down", "Normal cardiac exam lowers some immediate concern but does not exclude ischemia."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+4", finding: "Normal cardiac exam", reason: "No murmur or rhythm abnormality reduces competing urgent findings." }]
        })
      },
      {
        id: "murmur",
        label: "Murmur",
        answer: "New systolic murmur heard.",
        apply: (state) => ({
          ...state,
          physicalExam: unique([...state.physicalExam, "New systolic murmur"]),
          orders: unique([...state.orders, "Consider echocardiogram", "Cardiology review"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Valvular disease": [36, "up", "Murmur introduces structural heart disease as a meaningful competing hypothesis."],
            "Stable coronary artery disease": [probabilityOf(state, "Stable coronary artery disease"), "watch", "Murmur adds parallel cardiac workup need."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+6", finding: "New murmur", reason: "Structural cardiac finding changes downstream workup." }]
        })
      },
      {
        id: "irregular",
        label: "Irregular rhythm",
        answer: "Rhythm is irregular.",
        apply: (state) => ({
          ...state,
          physicalExam: unique([...state.physicalExam, "Irregular rhythm"]),
          orders: unique([...state.orders, "Rhythm strip", "ECG rhythm interpretation"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Arrhythmia": [42, "up", "Irregular rhythm introduces arrhythmia as a symptom driver and safety consideration."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+8", finding: "Irregular rhythm", reason: "Objective rhythm abnormality changes diagnostic path." }]
        })
      },
      {
        id: "tenderness",
        label: "Chest wall tenderness",
        answer: "Pain is reproducible with chest wall palpation.",
        apply: (state) => ({
          ...state,
          physicalExam: unique([...state.physicalExam, "Reproducible chest wall tenderness"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Musculoskeletal chest wall pain": [64, "up", "Reproducible tenderness supports a chest wall pain contributor."],
            "Acute coronary syndrome": [Math.max(14, probabilityOf(state, "Acute coronary syndrome") - 8), "down", "Reproducible tenderness lowers ACS probability but does not erase exertional history."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+10", finding: "Reproducible chest wall tenderness", reason: "Exam reproduces pain and raises musculoskeletal probability." }]
        })
      }
    ]
  },
  ecgResult: {
    prompt: "ECG result",
    kind: "Diagnostic result",
    options: [
      {
        id: "normal",
        label: "Normal ECG",
        answer: "ECG shows normal sinus rhythm without acute ST elevation.",
        apply: (state) => ({
          ...state,
          imaging: uniqueBy([...state.imaging, { type: "ECG", date: "Now", result: "Normal sinus rhythm without acute ST elevation." }], "type"),
          evidence: unique([...state.evidence, "ECG reviewed: no acute ST elevation"]),
          orders: unique([...state.orders, "Document ECG interpretation"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [Math.max(18, probabilityOf(state, "Acute coronary syndrome") - 14), "down", "Normal ECG lowers acute ischemic probability."],
            "Stable coronary artery disease": [probabilityOf(state, "Stable coronary artery disease"), "watch", "Normal resting ECG does not exclude exertional CAD."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+7", finding: "Normal ECG reviewed", reason: "Evidence lowers acute ECG-risk while preserving outpatient CAD assessment." }]
        })
      },
      {
        id: "ischemic",
        label: "Ischemic changes",
        answer: "ECG shows ischemic ST-T changes.",
        apply: (state) => ({
          ...state,
          imaging: uniqueBy([...state.imaging, { type: "ECG", date: "Now", result: "Ischemic ST-T changes." }], "type"),
          evidence: unique([...state.evidence, "ECG reviewed: ischemic changes"]),
          orders: unique([...state.orders, "Urgent ACS protocol", "Troponin pathway", "Aspirin contraindication review"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [82, "up", "Ischemic ECG changes sharply increase ACS probability and urgency."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+22", finding: "Ischemic ECG changes", reason: "Objective ECG evidence substantially changes probability and disposition." }]
        })
      },
      {
        id: "nonspecific",
        label: "Nonspecific changes",
        answer: "ECG shows nonspecific ST-T changes.",
        apply: (state) => ({
          ...state,
          imaging: uniqueBy([...state.imaging, { type: "ECG", date: "Now", result: "Nonspecific ST-T changes." }], "type"),
          evidence: unique([...state.evidence, "ECG reviewed: nonspecific changes"]),
          orders: unique([...state.orders, "Compare prior ECG", "Consider troponin pathway"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [Math.max(34, probabilityOf(state, "Acute coronary syndrome") + 4), "mixed", "Nonspecific ECG changes keep ACS active without confirming it."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+3", finding: "Nonspecific ECG changes", reason: "Ambiguous ECG result preserves uncertainty and need for comparison." }]
        })
      }
    ]
  },
  troponinResult: {
    prompt: "Troponin result",
    kind: "Diagnostic result",
    options: [
      {
        id: "normal",
        label: "Normal troponin",
        answer: "Troponin is normal.",
        apply: (state) => ({
          ...state,
          labs: uniqueBy([{ label: "Troponin", value: 4, unit: "ng/L", range: "Normal <12", series: [4], tone: "ok", intelligence: "Lowers MI concern in this mock interaction." }, ...state.labs], "label"),
          evidence: unique([...state.evidence, "Troponin reviewed: normal"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [Math.max(14, probabilityOf(state, "Acute coronary syndrome") - 16), "down", "Normal troponin lowers myocardial infarction concern."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+11", finding: "Normal troponin", reason: "Negative biomarker lowers MI probability and supports safer disposition planning." }]
        })
      },
      {
        id: "elevated",
        label: "Elevated troponin",
        answer: "Troponin is elevated.",
        apply: (state) => ({
          ...state,
          labs: uniqueBy([{ label: "Troponin", value: 42, unit: "ng/L", range: "Normal <12", series: [4, 42], tone: "high", intelligence: "Raises acute myocardial injury concern." }, ...state.labs], "label"),
          evidence: unique([...state.evidence, "Troponin reviewed: elevated"]),
          orders: unique([...state.orders, "Urgent ACS protocol", "Serial troponin", "Cardiology consult"]),
          differentialDiagnoses: updateDifferential(state.differentialDiagnoses, {
            "Acute coronary syndrome": [88, "up", "Elevated troponin strongly supports acute myocardial injury concern."]
          }),
          confidenceChanges: [...state.confidenceChanges, { delta: "+24", finding: "Elevated troponin", reason: "Positive biomarker changes diagnosis likelihood and disposition." }]
        })
      }
    ]
  }
};

function applyConversationOption(state, interactionId, optionId) {
  const interaction = conversationInteractions[interactionId];
  const option = interaction?.options.find((item) => item.id === optionId);
  if (!interaction || !option) return state;

  const activeState = state.active ? state : { ...state, active: true, paused: true, simulationEnabled: true };
  const beforeConfidence = deriveConfidence(activeState).diagnostic;
  const applied = option.apply({
    ...activeState,
    answeredInteractions: {
      ...activeState.answeredInteractions,
      [interactionId]: option.label
    },
    transcript: [...activeState.transcript, ["Clinician", interaction.prompt], ["Patient", option.answer]]
  });
  const afterConfidence = deriveConfidence(applied).diagnostic;
  const audit = {
    time: clockLabel((activeState.clockMinute || 8 * 60 + 12) + 1),
    prompt: interaction.prompt,
    answer: option.answer,
    confidence: `${beforeConfidence}% -> ${afterConfidence}%`
  };
  const withHistory = {
    ...applied,
    conversationAudit: [...applied.conversationAudit, audit],
    timeline: [
      { type: interaction.kind, date: audit.time, title: `${interaction.prompt}: ${option.label}`, meta: `Confidence ${audit.confidence}` },
      ...applied.timeline
    ]
  };

  return {
    ...withHistory,
    ...appendFeed(withHistory, [
      { type: "Clinician Asked", text: interaction.prompt },
      { type: "Patient Answered", text: option.answer },
      { type: "Reasoning Updated", text: `Confidence changed ${audit.confidence}; hypotheses, documentation, education, coding, and readiness recalculated.` }
    ])
  };
}

function reviewEvidence(state, id) {
  const reviewedEvidence = unique([...state.reviewedEvidence, id]);
  const alreadyReviewed = state.reviewedEvidence.includes(id);
  const evidenceLabel = evidenceLabelFor(id);
  const next = {
    ...state,
    reviewedEvidence,
    evidence: unique([...state.evidence, `${evidenceLabel} reviewed`]),
    confidenceChanges: alreadyReviewed
      ? state.confidenceChanges
      : [...state.confidenceChanges, { delta: "+3", finding: `${evidenceLabel} reviewed`, reason: "Reviewed source evidence improves evidence completeness and auditability." }],
    conversationAudit: alreadyReviewed
      ? state.conversationAudit
      : [...state.conversationAudit, { time: clockLabel((state.clockMinute || 8 * 60 + 12) + 1), prompt: `Review ${evidenceLabel}`, answer: "Evidence marked reviewed", confidence: "Evidence completeness improved" }]
  };

  if (alreadyReviewed) return next;

  return {
    ...next,
    ...appendFeed(next, [
      { type: "Evidence Reviewed", text: `${evidenceLabel} was reviewed; evidence completeness and reasoning audit trail updated.` }
    ])
  };
}

function updateDifferential(current, updates) {
  const known = new Map(current.map((item) => [item.name, item]));
  Object.entries(updates).forEach(([name, [probability, direction, why]]) => {
    known.set(name, { ...(known.get(name) || { name }), probability, direction, why });
  });
  return [...known.values()].filter((item) => item.probability >= 8);
}

function deriveBrief(state) {
  if (state.eventCursor >= 4) {
    return {
      title: "MI concern is lower; disposition depends on stability and cardiac follow-up.",
      summary: "Current evidence lowers acute myocardial infarction concern while keeping exertional CAD assessment active.",
      priority: "Confirm no rest pain or unstable features, preserve cardiology follow-up, and finish chronic disease plan.",
      whyHere: "Diabetes, hypertension, lab review, refill gap, and exertional chest symptoms now share one plan.",
      trends: "A1c 8.2, BP 148/92, LDL 118, normal ECG, normal troponin in mock sequence.",
      careGaps: "Urine ACR, retinal exam, foot exam, mammogram, and medication access remain open."
    };
  }

  if (state.eventCursor >= 1) {
    return {
      title: "Primary objective is excluding cardiac ischemia before chronic disease management.",
      summary: "The encounter began as diabetes follow-up but exertional chest tightness changed the clinical priority.",
      priority: "Clarify red flags, obtain ECG, assess cardiopulmonary findings, and review aspirin or NSAID safety.",
      whyHere: "Routine diabetes and BP follow-up now includes exertional chest tightness.",
      trends: "A1c 8.2, BP 148/92, LDL above goal, cardiometabolic risk active.",
      careGaps: "Foot exam, urine ACR, retinal exam status, and preventive care remain due after cardiac triage."
    };
  }

  return {
    title: "Routine diabetes follow-up with hypertension, refills, and lab review.",
    summary: "The visit starts with chronic disease optimization and prevention gaps.",
    priority: "Review A1c, BP, medications, refills, and preventive care.",
    whyHere: "Diabetes and BP follow-up with refills and recent lab review.",
    trends: "A1c 8.2 and BP 148/92. LDL improving but still above goal.",
    careGaps: "Mammogram due, foot exam due, flu vaccine offer, urine ACR pending."
  };
}

function deriveNarrative(state) {
  if (state.eventCursor >= 5) {
    return "This encounter began as routine diabetes management. During history-taking Sarah described exertional chest tightness, shifting the visit toward cardiac evaluation. Normal ECG and troponin lower concern for acute myocardial infarction, while reproducible chest wall tenderness supports a musculoskeletal contributor. Because the symptom began with exertion and cardiometabolic risk remains active, the plan preserves outpatient cardiac assessment while also addressing refill access, diabetes drift, and prevention gaps.";
  }

  if (state.eventCursor >= 3) {
    return "This encounter began as routine diabetes management. Sarah then described chest tightness with stairs and one episode of shortness of breath, shifting the immediate priority toward excluding cardiac ischemia. A normal ECG reduces acute ST-elevation concern but does not remove the need for symptom clarification and risk-based follow-up.";
  }

  if (state.eventCursor >= 1) {
    return "This encounter began as routine diabetes and hypertension follow-up. A new report of exertional chest tightness changed the clinical center of gravity, so Clinical OS is now organizing questions, ECG planning, differential reasoning, documentation, education, and coding around cardiac safety first.";
  }

  return "This encounter opens as chronic disease follow-up for diabetes, hypertension, refills, and lab review. Clinical OS is watching for findings that should reorder the visit priorities.";
}

function deriveDocumentation(state) {
  const chest = state.eventCursor >= 1;
  const ecg = state.eventCursor >= 3;
  const trop = state.eventCursor >= 4;
  const tender = state.eventCursor >= 5;
  const refill = state.eventCursor >= 6;
  return {
    Subjective: chest
      ? `Sarah reports exertional chest tightness when walking upstairs, brief duration, one episode of shortness of breath, and no arm radiation reported. ${refill ? "She missed lisinopril doses after a refill gap. " : ""}She is also here for diabetes, BP, and lab follow-up.`
      : baselineDocumentation.Subjective,
    Objective: `${state.vitalSigns.map((vital) => `${vital.label} ${vital.value}${vital.unit ? ` ${vital.unit}` : ""}`).join(", ")}. ${ecg ? "ECG mock tracing without acute ST elevation. " : ""}${trop ? "Troponin normal in mock sequence. " : ""}${tender ? "Exam notable for reproducible anterior chest wall tenderness. " : "Focused cardiopulmonary exam pending."}`,
    HPI: chest ? state.hpi : baselineDocumentation.HPI,
    ROS: state.ros.join("; "),
    "Physical Exam": state.physicalExam.join("; "),
    Assessment: chest
      ? `${topDiagnosis(state)} is currently highest-weighted. Acute MI concern is ${trop ? "lower after normal ECG/troponin" : ecg ? "reduced by normal ECG but not cleared" : "being evaluated"}; diabetes and hypertension optimization remain active.`
      : baselineDocumentation.Assessment,
    Plan: unique(state.orders).join("; ") + ".",
    ICD: deriveBilling(state).icd,
    CPT: deriveBilling(state).cpt,
    AVS: deriveEducation(state).summary
  };
}

function deriveEducation(state) {
  const chest = state.eventCursor >= 1;
  const trop = state.eventCursor >= 4;
  const refill = state.eventCursor >= 6;
  return {
    summary: chest
      ? `Your blood sugar average has increased and your blood pressure was higher than goal today. Because you mentioned chest tightness with activity, we checked those symptoms first. ${trop ? "The mock ECG and blood test results lowered concern for a heart attack today, but follow-up is still important because activity-related symptoms matter. " : "The team is checking for heart-related warning signs before returning to routine diabetes planning. "}Seek urgent care for chest pain at rest, severe shortness of breath, sweating, fainting, or symptoms that do not go away.`
      : baselineDocumentation.AVS,
    medications: refill
      ? ["Restart lisinopril refill plan as discussed", "Take metformin with evening meal", "Avoid routine NSAID use unless discussed", "Bring medication bottles next visit"]
      : ["Take metformin with evening meal", "Check BP at home 4 days/week", "Avoid routine NSAID use unless discussed", "Call for severe side effects"],
    lifestyle: ["10-minute walk after meals when symptoms are cleared", "Half plate non-starchy vegetables", "Reduce sweet drinks", "Bring glucose and BP log next visit"],
    followUp: chest
      ? ["Cardiology: Jul 18", "Labs: repeat A1c in 3 months", "Call same day for chest pain at rest"]
      : ["Labs: repeat A1c in 3 months", "Schedule urine kidney screen", "Call for severe side effects"]
  };
}

function deriveBilling(state) {
  const icd = ["E11.9 Type 2 diabetes mellitus", "I10 Essential hypertension", "E78.5 Hyperlipidemia"];
  const cpt = ["99214 Established patient visit", "36415 Venipuncture"];
  if (state.eventCursor >= 1) icd.splice(2, 0, "R07.89 Other chest pain");
  if (state.eventCursor >= 3) cpt.splice(1, 0, "93000 ECG with interpretation");
  if (state.eventCursor >= 7) cpt.push("99401 Preventive counseling");
  return { icd, cpt, confidence: Math.min(92, 62 + state.eventCursor * 4) };
}

function deriveConfidence(state) {
  const explainedDelta = state.confidenceChanges.reduce((sum, change) => sum + numericDelta(change.delta), 0);
  const evidenceBonus = (state.reviewedEvidence?.length || 0) * 2;
  return {
    diagnostic: clamp(Math.round(48 + state.eventCursor * 2 + explainedDelta * 0.45 + evidenceBonus), 24, 92),
    evidenceCompleteness: Math.min(94, 35 + state.eventCursor * 7 + evidenceBonus),
    documentationCompleteness: Math.min(96, 42 + state.eventCursor * 6 + (state.conversationAudit?.length || 0) * 2),
    dispositionReadiness: Math.min(90, 28 + state.eventCursor * 7 + Math.max(0, explainedDelta) * 0.2),
    patientUnderstanding: Math.min(88, 34 + state.eventCursor * 6 + (state.conversationAudit?.length || 0)),
    billingConfidence: Math.min(92, 62 + state.eventCursor * 4 + (state.conversationAudit?.length || 0))
  };
}

function deriveProgress(state, confidence) {
  return {
    clinicalReadiness: Math.min(94, 24 + state.eventCursor * 8),
    evidenceCompleteness: confidence.evidenceCompleteness,
    documentationComplete: confidence.documentationCompleteness,
    safetyReview: Math.min(92, 30 + state.eventCursor * 8),
    ordersComplete: Math.min(90, 36 + unique(state.orders).length * 4),
    educationComplete: confidence.patientUnderstanding,
    dispositionReady: confidence.dispositionReadiness
  };
}

function topDiagnosis(state) {
  return [...state.differentialDiagnoses].sort((a, b) => b.probability - a.probability)[0]?.name || "Cardiometabolic risk";
}

function readinessLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function appendFeed(state, entries) {
  const start = state.clockMinute || 8 * 60 + 12;
  const stamped = entries.map((entry, index) => ({
    time: clockLabel(start + index + 1),
    ...entry
  }));
  return {
    clockMinute: start + entries.length,
    intelligenceFeed: [...state.intelligenceFeed, ...stamped]
  };
}

function clockLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function probabilityOf(state, name) {
  return state.differentialDiagnoses.find((item) => item.name === name)?.probability || 18;
}

function numericDelta(delta) {
  const parsed = Number.parseInt(String(delta).replace("+", ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function evidenceLabelFor(id) {
  const labels = {
    xray: "Chest X-ray",
    ecg: "ECG",
    labs: "Laboratory results",
    consult: "Prior consultation",
    photos: "Clinical photographs",
    ct: "CT preview",
    mri: "MRI preview"
  };
  return labels[id] || "Clinical evidence";
}

function unique(items) {
  return [...new Set(items)];
}
