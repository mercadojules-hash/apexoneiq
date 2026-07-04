import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Command,
  Download,
  FilePenLine,
  FileText,
  Filter,
  Film,
  HeartPulse,
  Image,
  LineChart,
  Maximize2,
  Menu,
  MessageSquareText,
  Mic2,
  Moon,
  Pause,
  Pill,
  Play,
  Plus,
  Printer,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Square,
  Stethoscope,
  Sun,
  Syringe,
  Target,
  TrendingDown,
  TrendingUp,
  UserRound,
  UsersRound,
  Volume2,
  SlidersHorizontal,
  X
} from "lucide-react";
import "./styles.css";
import {
  INITIAL_ENCOUNTER,
  demoJumps,
  deriveEncounter,
  encounterReducer,
  encounterSteps
} from "./encounterEngine";
import {
  buildClinicalVoiceSummary,
  clinicalVoiceOptions,
  estimateSectionTimings,
  playbackSpeeds,
  stripSpeechMarkup
} from "./voiceAssistant";

const patient = {
  name: "Sarah Johnson",
  age: 52,
  initials: "SJ",
  sex: "Female",
  visit: "Diabetes follow-up",
  secondary: "Hypertension, chest discomfort, medication refill, recent labs",
  mrn: "MRN 104827",
  lastVisit: "Apr 18, 2026",
  next: "Cardiology consult - Jul 18",
  avatar:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=420&q=80"
};

const vitals = [
  { label: "BP", value: "148/92", unit: "mmHg", tone: "warn", trend: "+8 systolic" },
  { label: "A1c", value: "8.2", unit: "%", tone: "high", trend: "+0.5 since Jan" },
  { label: "LDL", value: "118", unit: "mg/dL", tone: "warn", trend: "-9 since Apr" },
  { label: "BMI", value: "31.4", unit: "", tone: "neutral", trend: "stable" }
];

const alerts = [
  { icon: ShieldAlert, label: "Chest discomfort", detail: "Clarify exertional pattern, radiation, dyspnea, diaphoresis.", tone: "critical" },
  { icon: Pill, label: "Interaction watch", detail: "NSAID use may worsen BP control with lisinopril.", tone: "warn" },
  { icon: Activity, label: "Diabetes control", detail: "A1c above individualized target. Discuss adherence and options.", tone: "info" }
];

const meds = [
  { name: "Metformin XR", dose: "1000 mg nightly", status: "Refill due in 6 days", adherence: 86 },
  { name: "Lisinopril", dose: "20 mg daily", status: "BP above goal", adherence: 78 },
  { name: "Atorvastatin", dose: "40 mg nightly", status: "Active", adherence: 91 },
  { name: "Albuterol HFA", dose: "2 puffs PRN", status: "Rare use", adherence: 64 }
];

const timelineItems = [
  { type: "Lab", date: "Today", title: "A1c 8.2%, LDL 118, eGFR 72", meta: "New results reviewed" },
  { type: "Note", date: "Apr 18", title: "Diabetes follow-up", meta: "Metformin titrated, nutrition referral discussed" },
  { type: "Imaging", date: "Feb 04", title: "Chest X-ray clear", meta: "Urgent care visit for cough" },
  { type: "Procedure", date: "2025", title: "Colonoscopy", meta: "Two benign polyps, repeat in 5 years" },
  { type: "Hospital", date: "2023", title: "Observation admission", meta: "Dehydration with viral gastroenteritis" }
];

const labs = [
  { label: "A1c", value: 8.2, unit: "%", range: "Goal <7.5", series: [7.1, 7.4, 7.6, 7.7, 8.2], tone: "high" },
  { label: "LDL", value: 118, unit: "mg/dL", range: "Goal <100", series: [142, 136, 127, 121, 118], tone: "warn" },
  { label: "eGFR", value: 72, unit: "mL/min", range: "Normal >60", series: [82, 78, 76, 73, 72], tone: "ok" },
  { label: "K+", value: 4.8, unit: "mmol/L", range: "3.5-5.1", series: [4.2, 4.4, 4.7, 4.5, 4.8], tone: "ok" }
];

const evidenceItems = [
  {
    id: "xray",
    type: "Chest X-ray",
    date: "Feb 04, 2026",
    indication: "Cough and chest tightness during urgent care visit.",
    findings: "Prior report text described clear lungs, normal cardiac silhouette, and no focal opacity.",
    context: "Most recent chest imaging before today's exertional chest discomfort discussion.",
    comparison: "Compared with 2023 chest radiograph; no interval report change documented.",
    visual: "xray"
  },
  {
    id: "ecg",
    type: "ECG",
    date: "Jul 04, 2026",
    indication: "Chest tightness with stairs raised during intake.",
    findings: "Mock tracing available for clinician review; rate and intervals displayed for context only.",
    context: "Pulled into the encounter because symptoms were described as exertional.",
    comparison: "No prior ECG in the mock chart.",
    visual: "ecg"
  },
  {
    id: "labs",
    type: "Laboratory Results",
    date: "Jul 03, 2026",
    indication: "Diabetes follow-up and medication monitoring.",
    findings: "A1c 8.2%, LDL 118 mg/dL, eGFR 72 mL/min, potassium 4.8 mmol/L.",
    context: "Supports today's medication adherence, BP, and prevention conversation.",
    comparison: "A1c increased from 7.7%; LDL decreased from 121 mg/dL.",
    visual: "labs"
  },
  {
    id: "consult",
    type: "Prior Consultation Note",
    date: "Apr 22, 2025",
    indication: "Cardiometabolic risk counseling and preventive planning.",
    findings: "Consult note emphasized home BP log, statin adherence, nutrition follow-up, and activity goals.",
    context: "Relevant to today's refill gap, lab trend review, and lifestyle plan.",
    comparison: "Recommendations overlap with current preventive care gaps.",
    visual: "note"
  },
  {
    id: "photos",
    type: "Clinical Photographs",
    date: "Jan 12, 2026",
    indication: "Diabetic foot exam documentation.",
    findings: "Reference photographs are available for longitudinal skin and foot care comparison.",
    context: "Foot exam is due today, so prior photographs are available without leaving the encounter.",
    comparison: "Compare with today's exam if new photographs are added.",
    visual: "photos"
  },
  {
    id: "ct",
    type: "CT Scan Preview",
    date: "Nov 18, 2023",
    indication: "Observation admission for dehydration and abdominal symptoms.",
    findings: "Preview and report excerpt are available; no current chest imaging inference is made.",
    context: "Included as prior cross-sectional imaging in the longitudinal chart.",
    comparison: "No related interval CT in the mock chart.",
    visual: "ct"
  },
  {
    id: "mri",
    type: "MRI Preview",
    date: "Aug 09, 2024",
    indication: "Prior shoulder pain evaluation.",
    findings: "Preview and report excerpt are available for historical context only.",
    context: "Not central to today's visit, but available in the evidence drawer if needed.",
    comparison: "No repeat MRI in the mock chart.",
    visual: "mri"
  }
];

const tabs = [
  { id: "command", label: "Command", icon: Command },
  { id: "visit", label: "Live Visit", icon: Mic2 },
  { id: "timeline", label: "Timeline", icon: Clock3 },
  { id: "meds", label: "Medications", icon: Pill },
  { id: "labs", label: "Labs", icon: LineChart },
  { id: "reasoning", label: "Reasoning", icon: Brain },
  { id: "docs", label: "Documentation", icon: FilePenLine },
  { id: "education", label: "Education", icon: MessageSquareText },
  { id: "executive", label: "Executive", icon: BarChart3 }
];


const patientStory = [
  { title: "Diagnosed with diabetes", detail: "Initial A1c documented at 7.8% with lifestyle counseling." },
  { title: "Started Metformin", detail: "Therapy initiated and later adjusted to extended-release dosing." },
  { title: "A1c improved", detail: "Early trend moved toward individualized target." },
  { title: "Medication adherence drifted", detail: "Recent refill gap and missed BP medication surfaced in conversation." },
  { title: "Cardiometabolic risk increased", detail: "BP remains above goal and LDL remains above target." },
  { title: "Developed chest discomfort", detail: "Patient reports tightness while walking upstairs." },
  { title: "Cardiology referral planned", detail: "Upcoming consult is already scheduled for July 18." },
  { title: "Current encounter", detail: "Clinical OS is coordinating evidence, reasoning, documentation, and education." }
];

const presentationSteps = [
  { title: "Patient Overview", screen: "command", stage: 0, prep: true },
  { title: "Voice Intake", screen: "visit", stage: 1 },
  { title: "AI Transcript", screen: "visit", stage: 2 },
  { title: "History", screen: "timeline", stage: 2 },
  { title: "Physical Exam", screen: "visit", stage: 5 },
  { title: "Laboratory Results", screen: "labs", stage: 4 },
  { title: "Imaging", screen: "timeline", stage: 4 },
  { title: "Differential Diagnosis", screen: "reasoning", stage: 5 },
  { title: "Clinical Reasoning", screen: "reasoning", stage: 6 },
  { title: "ICD-10 Suggestions", screen: "docs", stage: 7 },
  { title: "SOAP Note", screen: "docs", stage: 7 },
  { title: "Follow-up Plan", screen: "education", stage: 8 }
];

const imagingStudies = [
  {
    id: "chest-xray",
    type: "Chest X-ray",
    patient: "Sarah Johnson",
    studyDate: "Jul 04, 2026",
    accession: "CXR-884201",
    technique: "PA and lateral chest radiographs",
    impression: "No focal airspace consolidation. Cardiomediastinal silhouette is not enlarged. No pleural effusion or pneumothorax.",
    ai: ["No acute infiltrate detected", "Cardiac silhouette within expected limits", "No pneumothorax signal"],
    view: "chest"
  },
  {
    id: "knee-xray",
    type: "Knee X-ray",
    patient: "Marcus Hill",
    studyDate: "Jun 29, 2026",
    accession: "KNEE-441027",
    technique: "AP, lateral, and sunrise right knee views",
    impression: "Mild medial compartment joint space narrowing. No acute fracture or dislocation.",
    ai: ["Mild osteoarthritic pattern", "No fracture line detected", "Small suprapatellar effusion possible"],
    view: "knee"
  },
  {
    id: "lumbar-mri",
    type: "Lumbar MRI",
    patient: "Elena Park",
    studyDate: "Jun 18, 2026",
    accession: "MRI-L-203911",
    technique: "Sagittal and axial T1/T2 lumbar sequences",
    impression: "L4-L5 broad-based disc bulge with mild canal narrowing. No high-grade foraminal stenosis.",
    ai: ["Disc bulge highlighted at L4-L5", "No emergent cord compression marker", "Degenerative endplate signal present"],
    view: "lumbar"
  },
  {
    id: "brain-mri",
    type: "Brain MRI",
    patient: "Naomi Rivera",
    studyDate: "Jun 21, 2026",
    accession: "MRI-B-778145",
    technique: "Axial FLAIR, DWI, and post-contrast T1 brain sequences",
    impression: "No acute infarct. Scattered nonspecific white matter FLAIR hyperintensities, likely chronic microvascular change.",
    ai: ["No restricted diffusion pattern detected", "Mild chronic white matter burden", "No mass effect signal"],
    view: "brain"
  },
  {
    id: "ct-scan",
    type: "CT Scan",
    patient: "Owen Brooks",
    studyDate: "May 30, 2026",
    accession: "CT-550912",
    technique: "CT abdomen and pelvis with IV contrast",
    impression: "No acute intra-abdominal process. Mild hepatic steatosis. Appendix normal.",
    ai: ["No appendicitis pattern", "Mild steatosis texture", "No free air or obstruction"],
    view: "ct"
  },
  {
    id: "ultrasound",
    type: "Ultrasound",
    patient: "Sarah Johnson",
    studyDate: "Jul 04, 2026",
    accession: "US-119038",
    technique: "Focused bedside cardiac and lung ultrasound mock clip",
    impression: "Grossly preserved LV function in mock loop. No pleural effusion visualized.",
    ai: ["Gross LV squeeze appears preserved", "No B-line cluster in sampled view", "Clip quality adequate"],
    view: "ultrasound"
  }
];

const procedureStudies = [
  {
    id: "endoscopy",
    title: "Endoscopy mock video",
    time: "00:42",
    impression: "Mild antral erythema without active bleeding in simulated clip.",
    observations: ["Mucosa visualized", "No active bleeding marker", "Biopsy site annotation ready"],
    view: "endoscopy"
  },
  {
    id: "ultrasound-clip",
    title: "Ultrasound clip",
    time: "01:18",
    impression: "Focused lung window with no pleural effusion in the sampled mock view.",
    observations: ["Pleural line tracked", "No effusion pocket", "Respiratory motion preserved"],
    view: "ultrasound"
  },
  {
    id: "echo",
    title: "Cardiac Echo clip",
    time: "02:04",
    impression: "Parasternal long-axis mock loop with grossly preserved systolic motion.",
    observations: ["LV motion symmetric", "No large pericardial effusion", "Valve motion visible"],
    view: "echo"
  },
  {
    id: "wound",
    title: "Wound progression",
    time: "Day 14",
    impression: "Granulation tissue increased with reduced erythema compared with baseline.",
    observations: ["Area decreased 18%", "No expanding cellulitis marker", "Photo comparison aligned"],
    view: "wound"
  },
  {
    id: "derm",
    title: "Dermatology lesion comparison",
    time: "6 mo",
    impression: "Lesion size stable in mock comparison; border irregularity flagged for clinician review.",
    observations: ["Diameter stable", "Border irregularity annotated", "Derm follow-up suggested"],
    view: "derm"
  }
];

function App() {
  const [active, setActive] = useState("command");
  const [theme, setTheme] = useState("dark");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [encounterState, dispatchEncounter] = useReducer(encounterReducer, INITIAL_ENCOUNTER);
  const [transitioning, setTransitioning] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(evidenceItems[0].id);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const ActiveScreen = screens[active];
  const activeLabel = tabs.find((tab) => tab.id === active)?.label;
  const encounter = useMemo(
    () => ({ ...deriveEncounter(encounterState, evidenceItems.length), transitioning }),
    [encounterState, transitioning]
  );

  const openEvidenceDrawer = (id = selectedEvidenceId) => {
    setSelectedEvidenceId(id);
    setEvidenceOpen(true);
    dispatchEncounter({ type: "REVIEW_EVIDENCE", id });
  };

  const selectEvidence = (id) => {
    setSelectedEvidenceId(id);
    dispatchEncounter({ type: "REVIEW_EVIDENCE", id });
  };

  useEffect(() => {
    if (!encounterState.active || encounterState.paused || encounterState.eventCursor >= 8) return undefined;
    const delay = 10000 + (encounterState.eventCursor % 4) * 2500;
    const timer = window.setTimeout(() => dispatchEncounter({ type: "APPLY_NEXT_EVENT" }), delay);
    return () => window.clearTimeout(timer);
  }, [encounterState.active, encounterState.paused, encounterState.eventCursor]);

  useEffect(() => {
    if (!presentationMode) return undefined;

    const step = presentationSteps[presentationIndex];
    setTransitioning(true);
    setActive(step.screen);
    dispatchEncounter({ type: "JUMP_TO_STAGE", stage: step.stage, prep: step.prep });
    const settleTimer = window.setTimeout(() => setTransitioning(false), 520);
    const advanceTimer = window.setTimeout(() => {
      setPresentationIndex((index) => {
        if (index >= presentationSteps.length - 1) {
          setPresentationMode(false);
          return index;
        }
        return index + 1;
      });
    }, 5200);

    return () => {
      window.clearTimeout(settleTimer);
      window.clearTimeout(advanceTimer);
    };
  }, [presentationMode, presentationIndex]);

  const beginEncounter = () => {
    setTransitioning(true);
    dispatchEncounter({ type: "START_SIMULATION" });
    window.setTimeout(() => {
      setActive("visit");
      dispatchEncounter({ type: "APPLY_NEXT_EVENT" });
      setTransitioning(false);
    }, 900);
  };

  const replayEncounter = () => {
    setActive("command");
    dispatchEncounter({ type: "RESET" });
    setTransitioning(false);
  };

  const jumpToDemoStage = (jump) => {
    setTransitioning(false);
    dispatchEncounter({ type: "JUMP_TO_STAGE", stage: jump.stage, prep: jump.prep });
    setActive(jump.screen);
  };

  const handleClinicalAction = (text) => {
    dispatchEncounter({ type: "CLINICIAN_ACTION", text });
  };

  const handleConversationOption = (interactionId, optionId) => {
    dispatchEncounter({ type: "SELECT_CONVERSATION_OPTION", interactionId, optionId });
  };

  const togglePresentationMode = () => {
    if (presentationMode) {
      setPresentationMode(false);
      setTransitioning(false);
      return;
    }

    setPresentationIndex(0);
    setPresentationMode(true);
  };

  return (
    <main className={`app ${theme} ${encounter.active ? "encounter-mode" : ""} ${transitioning ? "transitioning" : ""} ${presentationMode ? "presentation-mode" : ""}`}>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><HeartPulse size={22} /></div>
          <div>
            <strong>Clinical OS</strong>
            <span>Prototype V1</span>
          </div>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="nav-list" aria-label="Clinical screens">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-item ${active === tab.id ? "active" : ""} ${encounter.isReady(tab.id) ? "live" : ""}`}
                onClick={() => {
                  setActive(tab.id);
                  setMobileOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {encounter.isReady(tab.id) ? <span className="live-dot" /> : active === tab.id && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-card">
          <span className="eyebrow">Current Patient</span>
          <PatientBadge compact />
          <div className="mini-row">
            <span>Visit acuity</span>
            <strong>Elevated</strong>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div>
            <span className="eyebrow">Modern Healthcare Command Center</span>
            <h1>{activeLabel}</h1>
          </div>
          <div className="top-actions">
            <ComingSoonButton className="icon-button" label="Enterprise search" icon={Search} />
            <ComingSoonButton className="icon-button" label="Notification center" icon={Bell} />
            <button className={`presentation-button ${presentationMode ? "active" : ""}`} onClick={togglePresentationMode}>
              <Film size={17} />
              <span>{presentationMode ? "Stop Presentation" : "Presentation Mode"}</span>
            </button>
            <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>
        {presentationMode && (
          <PresentationGuide
            step={presentationSteps[presentationIndex]}
            index={presentationIndex}
            total={presentationSteps.length}
            onStop={() => setPresentationMode(false)}
          />
        )}
        <MissionControlBar encounter={encounter} onOpenEvidence={() => openEvidenceDrawer()} />
        <DemoControlRail
          encounter={encounter}
          onBegin={beginEncounter}
          onPause={() => dispatchEncounter({ type: "PAUSE" })}
          onPlay={() => {
            if (!encounter.active) beginEncounter();
            else dispatchEncounter({ type: "RESUME" });
          }}
          onReplay={replayEncounter}
          onJump={jumpToDemoStage}
        />
        <ClinicalVoiceAssistant encounter={encounter} />
        <ActiveScreen
          encounter={encounter}
          encounterMode={encounter.mode}
          setEncounterMode={(mode) => dispatchEncounter({ type: "SET_MODE", mode })}
          onBeginEncounter={beginEncounter}
          onOpenEvidence={openEvidenceDrawer}
          onClinicalAction={handleClinicalAction}
          onConversationOption={handleConversationOption}
        />
      </section>
      <PersistentIntelligenceDock encounter={encounter} onOpenEvidence={() => openEvidenceDrawer("ecg")} onClinicalAction={handleClinicalAction} />
      <ClinicalEvidenceDrawer
        open={evidenceOpen}
        items={evidenceItems}
        selectedId={selectedEvidenceId}
        reviewed={new Set(encounter.reviewedEvidence)}
        onSelect={selectEvidence}
        onClose={() => setEvidenceOpen(false)}
      />
    </main>
  );
}

function ClinicalVoiceAssistant({ encounter }) {
  const [voiceId, setVoiceId] = useState(clinicalVoiceOptions[0].id);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [activeSectionId, setActiveSectionId] = useState("");
  const [source, setSource] = useState("ElevenLabs");
  const [elevenLabsConfigured, setElevenLabsConfigured] = useState(null);
  const audioRef = useRef(null);
  const cacheRef = useRef(new Map());
  const timingRef = useRef([]);
  const sectionRefs = useRef({});
  const fallbackTimerRef = useRef(null);
  const fallbackStartedAtRef = useRef(0);
  const fallbackPausedAtRef = useRef(0);
  const utteranceRef = useRef(null);

  const summary = useMemo(() => buildClinicalVoiceSummary(encounter), [encounter]);
  const summaryKey = `${summary.id}:${voiceId}:${playbackSpeed}`;
  const isCached = cacheRef.current.has(summaryKey);
  const isPlaying = status === "playing";
  const isPaused = status === "paused";
  const isGenerating = status === "generating";

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";

    return () => {
      stopPlayback();
      cacheRef.current.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/voice/elevenlabs")
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) setElevenLabsConfigured(Boolean(payload.configured));
      })
      .catch(() => {
        if (!cancelled) setElevenLabsConfigured(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeSectionId) return;
    sectionRefs.current[activeSectionId]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSectionId]);

  const clearFallbackTimer = () => {
    if (fallbackTimerRef.current) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const setActiveFromElapsed = (elapsed, duration) => {
    const timings = timingRef.current.length ? timingRef.current : estimateSectionTimings(summary.sections, duration || estimateDuration(summary.wordCount, playbackSpeed));
    const current = timings.find((timing) => elapsed >= timing.start && elapsed < timing.end) || timings.at(-1);
    if (current) setActiveSectionId(current.id);
  };

  const wireAudioEvents = (audio, durationEstimate) => {
    timingRef.current = estimateSectionTimings(summary.sections, durationEstimate);
    audio.playbackRate = playbackSpeed;
    audio.ontimeupdate = () => setActiveFromElapsed(audio.currentTime, audio.duration || durationEstimate);
    audio.onended = () => {
      setStatus("idle");
      setActiveSectionId("");
    };
    audio.onerror = () => {
      setStatus("error");
      setError("Audio playback could not start.");
    };
  };

  const getAudio = async (forceRegenerate = false) => {
    if (!forceRegenerate && cacheRef.current.has(summaryKey)) {
      return cacheRef.current.get(summaryKey);
    }

    setStatus("generating");
    setError("");
    setSource("ElevenLabs");

    if (elevenLabsConfigured === false) {
      throw new Error("Missing ELEVENLABS_API_KEY.");
    }

    const response = await fetch("/api/voice/elevenlabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: summary.fullText, voiceId })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "ElevenLabs audio generation failed.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = { url, blob, summaryId: summary.id, createdAt: Date.now() };
    cacheRef.current.set(summaryKey, audio);
    return audio;
  };

  const startPlayback = async ({ replay = false, regenerate = false } = {}) => {
    stopPlayback({ preserveStatus: true });

    try {
      const audio = await getAudio(regenerate);
      const element = audioRef.current;
      const durationEstimate = estimateDuration(summary.wordCount, playbackSpeed);
      wireAudioEvents(element, durationEstimate);
      element.src = audio.url;
      element.currentTime = replay ? 0 : 0;
      setStatus("playing");
      setActiveSectionId(summary.sections[0]?.id || "");
      await element.play();
    } catch (audioError) {
      if (/ELEVENLABS_API_KEY/i.test(audioError.message)) {
        playBrowserFallback();
        return;
      }

      setStatus("error");
      setError(audioError.message);
    }
  };

  const playBrowserFallback = () => {
    if (!("speechSynthesis" in window)) {
      setStatus("error");
      setError("Voice unavailable.");
      return;
    }

    window.speechSynthesis.cancel();
    clearFallbackTimer();

    const utterance = new SpeechSynthesisUtterance(stripSpeechMarkup(summary.fullText));
    const preferredVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => /female|samantha|victoria|karen|zira|ava|allison/i.test(`${voice.name} ${voice.voiceURI}`));
    utterance.voice = preferredVoice || null;
    utterance.rate = playbackSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      clearFallbackTimer();
      setStatus("idle");
      setActiveSectionId("");
    };
    utterance.onerror = () => {
      clearFallbackTimer();
      setStatus("error");
      setError("Voice unavailable.");
    };

    const durationEstimate = estimateDuration(summary.wordCount, playbackSpeed);
    timingRef.current = estimateSectionTimings(summary.sections, durationEstimate);
    fallbackStartedAtRef.current = performance.now();
    fallbackPausedAtRef.current = 0;
    utteranceRef.current = utterance;
    setSource("Browser fallback");
    setStatus("playing");
    setActiveSectionId(summary.sections[0]?.id || "");
    fallbackTimerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - fallbackStartedAtRef.current) / 1000;
      setActiveFromElapsed(elapsed, durationEstimate);
    }, 240);
    window.speechSynthesis.speak(utterance);
  };

  const pausePlayback = () => {
    if (source === "Browser fallback") {
      fallbackPausedAtRef.current = performance.now();
      window.speechSynthesis.pause();
    } else {
      audioRef.current?.pause();
    }
    setStatus("paused");
  };

  const resumePlayback = async () => {
    if (source === "Browser fallback") {
      if (fallbackPausedAtRef.current) {
        const pausedFor = performance.now() - fallbackPausedAtRef.current;
        fallbackStartedAtRef.current += pausedFor;
      }
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }

    setStatus("playing");
    await audioRef.current?.play();
  };

  const stopPlayback = ({ preserveStatus = false } = {}) => {
    clearFallbackTimer();
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveSectionId("");
    if (!preserveStatus) setStatus("idle");
  };

  return (
    <section className="voice-assistant-panel" aria-label="Clinical voice assistant">
      <div className="voice-assistant-head">
        <div className="voice-orb" aria-hidden="true">
          <Volume2 size={18} />
          <VoiceWave />
        </div>
        <div>
          <span className="eyebrow">ElevenLabs Clinical Voice</span>
          <h2>Encounter voice assistant</h2>
          <p>{status === "generating" ? "Preparing spoken clinical summary..." : `Ready to speak ${summary.sections.length} clinical sections from the shared encounter.`}</p>
        </div>
        <div className={`voice-status ${status}`}>
          <span>{elevenLabsConfigured === false ? "Local fallback" : isCached ? "Cached" : source}</span>
          <strong>{status === "idle" ? "Ready" : status}</strong>
        </div>
      </div>

      <div className="voice-controls">
        <button className="primary-button" onClick={() => startPlayback()} disabled={isGenerating || isPlaying}>
          <Play size={16} /> Play Summary
        </button>
        <button className="ghost-button" onClick={pausePlayback} disabled={!isPlaying}>
          <Pause size={15} /> Pause
        </button>
        <button className="ghost-button" onClick={resumePlayback} disabled={!isPaused}>
          <Play size={15} /> Resume
        </button>
        <button className="ghost-button" onClick={() => startPlayback({ replay: true })} disabled={isGenerating}>
          <RotateCcw size={15} /> Replay
        </button>
        <button className="ghost-button" onClick={() => stopPlayback()} disabled={status === "idle"}>
          <Square size={14} /> Stop
        </button>
        <button className="ghost-button" onClick={() => startPlayback({ regenerate: true })} disabled={isGenerating}>
          <Sparkles size={15} /> Regenerate Summary
        </button>
        <label>
          <span>Voice</span>
          <select value={voiceId} onChange={(event) => setVoiceId(event.target.value)}>
            {clinicalVoiceOptions.map((voice) => (
              <option key={voice.id} value={voice.id}>{voice.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Speed</span>
          <select value={playbackSpeed} onChange={(event) => setPlaybackSpeed(Number(event.target.value))}>
            {playbackSpeeds.map((speed) => (
              <option key={speed} value={speed}>{speed}x</option>
            ))}
          </select>
        </label>
      </div>

      <div className="voice-summary-layout">
        <div className="voice-script" aria-live="polite">
          {summary.sections.map((section) => (
            <article
              key={section.id}
              ref={(node) => {
                sectionRefs.current[section.id] = node;
              }}
              className={activeSectionId === section.id ? "speaking" : ""}
            >
              <span>{section.title}</span>
              <p>{section.text}</p>
            </article>
          ))}
        </div>
        <div className={`voice-inline-status ${elevenLabsConfigured === false ? "fallback" : status}`}>
          <span />
          <small>{elevenLabsConfigured === false ? "Fallback voice available" : error ? "Voice unavailable" : "ElevenLabs ready"}</small>
        </div>
      </div>
    </section>
  );
}

function estimateDuration(wordCount, speed) {
  return Math.max(14, (wordCount / 148) * 60 / Math.max(speed, 0.5));
}

function ComingSoonButton({ label, icon: Icon, className = "ghost-button" }) {
  return (
    <button className={`${className} coming-soon-control`} title={`${label} - coming soon`} aria-label={`${label} coming soon`}>
      {Icon && <Icon size={17} />}
      {className !== "icon-button" && <span>{label}</span>}
      <small>Soon</small>
    </button>
  );
}

function ComingSoonCard({ title, detail, icon: Icon = Sparkles }) {
  return (
    <div className="coming-soon-card">
      <Icon size={20} />
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function PresentationGuide({ step, index, total, onStop }) {
  return (
    <section className="presentation-guide" aria-label="Presentation Mode guide">
      <div>
        <span className="eyebrow">Presentation Mode</span>
        <strong>{step.title}</strong>
      </div>
      <div className="presentation-track">
        {presentationSteps.map((item, itemIndex) => (
          <span key={item.title} className={itemIndex <= index ? "active" : ""} />
        ))}
      </div>
      <small>{index + 1} of {total}</small>
      <button className="ghost-button" onClick={onStop}><Square size={14} /> Stop</button>
    </section>
  );
}

function MissionControlBar({ encounter, onOpenEvidence }) {
  if (!encounter.active && !encounter.transitioning) return null;

  return (
    <section className="mission-control-bar" aria-label="Clinical intelligence status">
      <div className="encounter-pulse">
        <div>
          <span className="pulse-dot" />
          <strong>{encounter.paused ? "Encounter paused" : encounter.transitioning ? "Entering encounter" : "Encounter running"}</strong>
          <small>{encounter.currentStep.label}</small>
        </div>
        <div className="pulse-track">
          {encounterSteps.map((step, index) => (
            <span key={step.label} className={index <= encounter.stage ? "done" : ""} title={step.label} />
          ))}
        </div>
      </div>
        <div className="intelligence-panel">
        <span className="eyebrow">Clinical Intelligence</span>
        <strong>{encounter.brief.title}</strong>
        <small>{encounter.paused ? "Simulation paused at current clinical state." : encounter.conductor.nextBestAction}</small>
      </div>
      <div className="readiness-chip">
        <span>Readiness</span>
        <strong>{encounter.readinessScore}%</strong>
      </div>
      <button className="evidence-indicator compact" onClick={onOpenEvidence}>
        <FileText size={17} />
        <span>Evidence</span>
        <strong>{encounter.evidence.reviewed}/{encounter.evidence.available}</strong>
        <small>{encounter.evidence.outstanding} outstanding</small>
      </button>
    </section>
  );
}

function DemoControlRail({ encounter, onBegin, onPause, onPlay, onReplay, onJump }) {
  return (
    <section className={`demo-rail ${encounter.active || encounter.stage > 0 ? "visible" : ""}`} aria-label="Simulate Encounter controls">
      <div className="rail-actions">
        <button className="icon-button" onClick={encounter.active && !encounter.paused ? onPause : onPlay} aria-label={encounter.active && !encounter.paused ? "Pause demo" : "Play demo"}>
          {encounter.active && !encounter.paused ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button className="icon-button" onClick={onReplay} aria-label="Replay demo"><RotateCcw size={17} /></button>
      </div>
      <strong className="rail-label">Simulate Encounter</strong>
      <div className="rail-jumps">
        {demoJumps.map((jump) => (
          <button key={jump.label} className={encounter.stage === jump.stage ? "active" : ""} onClick={() => onJump(jump)}>
            {jump.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function PersistentIntelligenceDock({ encounter, onOpenEvidence, onClinicalAction }) {
  const [expanded, setExpanded] = useState(false);
  const progress = encounter.readinessScore;
  const confidence = encounter.clinicalConfidence.diagnostic;
  const openQuestions = encounter.missingQuestions.length;
  const topRecommendation = encounter.conductor.recommendations[0];

  return (
    <aside className={`intelligence-dock ${expanded ? "expanded" : "collapsed"}`} aria-label="Persistent Clinical Intelligence">
      <div className="dock-head">
        <span className="pulse-dot" />
        <div>
          <strong>Clinical Intelligence</strong>
          <small>{encounter.active ? encounter.currentStep.activity : "Ready for encounter."}</small>
        </div>
        <button className="icon-button dock-toggle" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Collapse Clinical Intelligence" : "Expand Clinical Intelligence"}>
          {expanded ? <X size={16} /> : <Brain size={16} />}
        </button>
      </div>
      <div className="dock-progress compact">
        <span>Readiness {progress}%</span>
        <div><i style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="dock-body">
        <div className="dock-grid">
          <div>
            <span>Current focus</span>
            <strong>{encounter.conductor.priority}</strong>
          </div>
          <div>
            <span>Diagnostic confidence</span>
            <strong>{confidence}%</strong>
          </div>
          <div>
            <span>Outstanding questions</span>
            <strong>{openQuestions}</strong>
          </div>
          <div>
            <span>Documentation</span>
            <strong>{encounter.clinicalConfidence.documentationCompleteness}%</strong>
          </div>
        </div>
        <div className="dock-alerts">
          {[topRecommendation.action, encounter.conductor.informationNeeded[0]?.question, "ECG evidence available"].filter(Boolean).map((item) => (
            <button key={item} onClick={item.includes("ECG") ? onOpenEvidence : () => onClinicalAction(`Clinician addressed: ${item}`)}>{item}</button>
          ))}
        </div>
        <button className="dock-evidence" onClick={onOpenEvidence}>
          Evidence reviewed <strong>{encounter.evidence.reviewed}/{encounter.evidence.available}</strong>
        </button>
      </div>
    </aside>
  );
}

function ClinicalEvidenceDrawer({ open, items, selectedId, reviewed, onSelect, onClose }) {
  const selected = items.find((item) => item.id === selectedId) || items[0];

  return (
    <aside className={`evidence-drawer ${open ? "open" : ""}`} aria-label="Clinical Evidence Drawer" aria-hidden={!open}>
      <div className="drawer-head">
        <div>
          <span className="eyebrow">Clinical Evidence</span>
          <h2>Supporting context without leaving the encounter</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close Clinical Evidence"><X size={18} /></button>
      </div>

      <div className="evidence-tabs">
        {items.map((item) => (
          <button key={item.id} className={`${selected.id === item.id ? "active" : ""} ${reviewed.has(item.id) ? "reviewed" : ""}`} onClick={() => onSelect(item.id)}>
            <span>{item.type}</span>
            {reviewed.has(item.id) && <Check size={14} />}
          </button>
        ))}
      </div>

      <div className="evidence-content">
        <EvidenceVisual type={selected.visual} />
        <div className="evidence-meta">
          <div>
            <span>Date performed</span>
            <strong>{selected.date}</strong>
          </div>
          <div>
            <span>Clinical indication</span>
            <strong>{selected.indication}</strong>
          </div>
          <div>
            <span>Key findings</span>
            <strong>{selected.findings}</strong>
          </div>
          <div>
            <span>Timeline context</span>
            <strong>{selected.context}</strong>
          </div>
          <div>
            <span>Previous comparison</span>
            <strong>{selected.comparison}</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}

function EvidenceVisual({ type }) {
  if (type === "ecg") {
    return (
      <div className="evidence-visual ecg-visual">
        <div className="ecg-grid">
          <svg viewBox="0 0 420 150" preserveAspectRatio="none">
            <polyline points="0,88 28,88 38,72 48,104 60,88 92,88 102,68 112,110 126,88 162,88 172,70 184,106 198,88 240,88 250,66 262,112 276,88 318,88 328,72 338,105 352,88 420,88" />
          </svg>
        </div>
        <span>Mock ECG tracing</span>
      </div>
    );
  }

  if (type === "labs") {
    return (
      <div className="evidence-visual lab-visual">
        {labs.map((lab) => (
          <div key={lab.label}>
            <span>{lab.label}</span>
            <strong>{lab.value}{lab.unit}</strong>
            <i style={{ width: `${Math.min(96, 38 + lab.value * 6)}%` }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "note") {
    return (
      <div className="evidence-visual note-visual">
        <strong>Consult note excerpt</strong>
        <p>Home BP log requested. Continue statin therapy discussion. Reinforce nutrition follow-up and activity goals. Recheck metabolic labs at follow-up.</p>
      </div>
    );
  }

  if (type === "photos") {
    return (
      <div className="evidence-visual photo-visual">
        {[1, 2, 3].map((item) => <span key={item} />)}
      </div>
    );
  }

  return (
    <div className={`evidence-visual image-visual ${type}-visual`}>
      <div className="scan-core" />
      <span>{type === "xray" ? "Mock chest X-ray viewer" : type === "ct" ? "Mock CT preview" : "Mock MRI preview"}</span>
    </div>
  );
}

function PatientBadge({ compact = false }) {
  return (
    <div className={`patient-badge ${compact ? "compact" : ""}`}>
      <img src={patient.avatar} alt="" />
      <div>
        <strong>{patient.name}</strong>
        <span>{patient.age} - {patient.sex} - {patient.mrn}</span>
      </div>
    </div>
  );
}

function Panel({ children, className = "", title, eyebrow, action, icon: Icon }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-head">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2>{Icon && <Icon size={18} />} {title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Metric({ label, value, sub, icon: Icon, tone = "neutral" }) {
  return (
    <div className={`metric ${tone}`}>
      <div className="metric-icon">{Icon && <Icon size={19} />}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function Sparkline({ values, tone = "accent" }) {
  const points = useMemo(() => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 32 - ((value - min) / Math.max(max - min, 1)) * 28;
      return `${x},${y}`;
    }).join(" ");
  }, [values]);

  return (
    <svg className={`sparkline ${tone}`} viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} />
      <circle cx="100" cy={points.split(" ").at(-1)?.split(",")[1] || 18} r="2.5" />
    </svg>
  );
}

function ProgressRing({ value, label }) {
  const offset = 283 - (283 * value) / 100;
  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 100 100" className="ring">
        <circle cx="50" cy="50" r="45" />
        <circle cx="50" cy="50" r="45" style={{ strokeDashoffset: offset }} />
      </svg>
      <div>
        <strong>{value}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function CommandCenter({ encounter, onBeginEncounter, onOpenEvidence, onClinicalAction }) {
  return (
    <div className="screen command-grid enter">
      <Panel className={`clinical-brief ${encounter.active ? "brief-live" : ""}`}>
        <div className="brief-top">
          <div>
            <span className="eyebrow">Clinical Brief</span>
            <h2>{encounter.brief.title}</h2>
            <p>{encounter.brief.summary}</p>
          </div>
          <div className="brief-patient">
            <span className="review-time"><Clock3 size={15} /> Est. review 14 sec</span>
            <PatientBadge compact />
            <span>Last visit {patient.lastVisit}</span>
          </div>
        </div>

        <div className="mission-brief-grid">
          <div className="brief-card reason">
            <UserRound size={18} />
            <span>Why she is here</span>
            <strong>{encounter.brief.whyHere}</strong>
          </div>
          <div className="brief-card priority">
            <AlertTriangle size={18} />
            <span>What matters most</span>
            <strong>{encounter.brief.priority}</strong>
          </div>
          <div className="brief-column">
            <div className="brief-mini">
              <TrendingUp size={17} />
              <div>
                <span>Clinical trends</span>
                <strong>{encounter.brief.trends}</strong>
              </div>
            </div>
            <div className="brief-mini">
              <Syringe size={17} />
              <div>
                <span>Care gaps</span>
                <strong>{encounter.brief.careGaps}</strong>
              </div>
            </div>
          </div>
          <div className="brief-card consider">
            <Sparkles size={18} />
            <span>Things to consider</span>
            <strong>{encounter.conductor.recommendations[0].action} Why: {encounter.conductor.recommendations[0].why}</strong>
          </div>
        </div>

        <div className="brief-actions">
          <div className="brief-tags">
            {encounter.orders.slice(0, 4).map((order) => <span key={order}>{order}</span>)}
          </div>
          <button className="evidence-indicator" onClick={() => onOpenEvidence("xray")}>
            <FileText size={17} />
            <span>Clinical Evidence</span>
            <strong>{encounter.evidence.reviewed}/{encounter.evidence.available}</strong>
            <small>{encounter.evidence.outstanding} not reviewed</small>
          </button>
          <button className="primary-button begin-button" onClick={onBeginEncounter}>
            {encounter.active ? "Simulation Running" : "Simulate Encounter"} <ArrowRight size={16} />
          </button>
        </div>
      </Panel>

      <Panel title="Risk Alerts" icon={AlertTriangle} action={<ComingSoonButton label="Risk inbox" icon={AlertTriangle} />}>
        <div className="alert-stack">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div className={`alert-item ${alert.tone}`} key={alert.label}>
                <Icon size={20} />
                <div>
                  <strong>{alert.label}</strong>
                  <span>{alert.detail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="span-2" title="Vitals and Lab Highlights" icon={Activity}>
        <div className="vitals-grid">
          {encounter.vitalSigns.map((vital) => (
            <div className={`vital ${vital.tone}`} key={vital.label}>
              <span>{vital.label}</span>
              <strong>{vital.value}<small>{vital.unit}</small></strong>
              <em>{vital.trend}</em>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Medication Summary" icon={Pill}>
        <div className="med-mini-list">
          {encounter.medications.slice(0, 3).map((med) => (
            <div key={med.name}>
              <span>{med.name}</span>
              <strong>{med.status}</strong>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Outstanding Tasks" icon={ClipboardCheck}>
        <div className="task-list">
          {encounter.orders.slice(0, 4).map((task, index) => (
            <label key={task}>
              <input type="checkbox" defaultChecked={index === 0} />
              <span>{task}</span>
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="Preventive Care" icon={Syringe}>
        <div className="care-grid">
          <Metric label="Mammogram" value="Due" sub="Last 2024" tone="warn" icon={CalendarDays} />
          <Metric label="Colonoscopy" value="2025" sub="Repeat 2030" tone="ok" icon={Check} />
          <Metric label="Flu" value="Offer" sub="Seasonal" tone="neutral" icon={Syringe} />
        </div>
      </Panel>

      <Panel title="Clinical Conductor" icon={Sparkles}>
        <ConductorRecommendationList recommendations={encounter.conductor.recommendations.slice(0, 2)} compact onAct={onClinicalAction} />
      </Panel>

      <Panel className="span-2" title="Recent Timeline" icon={Clock3}>
        <TimelineList items={encounter.timeline.slice(0, 4)} />
      </Panel>

      <Panel title="Upcoming" icon={CalendarDays}>
        <div className="appointment">
          <strong>Cardiology consult</strong>
          <span>Jul 18, 2026 at 9:30 AM</span>
          <small>Reason: intermittent chest pressure</small>
        </div>
        <div className="appointment muted">
          <strong>Nutrition follow-up</strong>
          <span>Aug 02, 2026 at 2:00 PM</span>
        </div>
      </Panel>
    </div>
  );
}

function LiveVisit({ encounter, encounterMode, setEncounterMode, onOpenEvidence, onClinicalAction, onConversationOption }) {
  const transcript = encounter.transcript;
  const firstNeed = encounter.conductor.informationNeeded[0];
  const interactionGroups = Object.fromEntries(encounter.conductor.actionGroups.map((group) => [group.id, group]));

  return (
    <div className="screen encounter-workspace-grid enter">
      <Panel
        className={`span-2 live-panel encounter-workspace ${encounter.active ? "is-live" : ""}`}
        title="Encounter Workspace"
        eyebrow={encounter.active ? "Listening now" : "Recording Simulation"}
        icon={Mic2}
        action={<button className="ghost-button" onClick={() => onOpenEvidence("ecg")}>Clinical Evidence</button>}
      >
        <EncounterModeSwitch mode={encounterMode} setMode={setEncounterMode} />
        {encounterMode === "virtual" ? (
          <VirtualVisitWorkspace encounter={encounter} transcript={transcript} />
        ) : (
          <InPersonEncounterWorkspace encounter={encounter} transcript={transcript} />
        )}
      </Panel>
      <Panel className="intelligence-feed-panel" title="Live Intelligence Feed" icon={Sparkles}>
        <IntelligenceFeed events={encounter.feed} />
      </Panel>
      <Panel title="Missing Questions" icon={CircleDot}>
        <div className="suggestion-list">
          {encounter.missingQuestions.map((item) => (
            <button key={item} onClick={() => onClinicalAction(`Patient response addressed: ${item}`)}>{item}</button>
          ))}
        </div>
        {firstNeed && interactionGroups[firstNeed.interactionId] && (
          <div className="inline-options">
            <strong>{firstNeed.question}</strong>
            <OptionGroup group={interactionGroups[firstNeed.interactionId]} onSelect={(optionId) => onConversationOption(firstNeed.interactionId, optionId)} />
          </div>
        )}
      </Panel>
      <Panel title="Clinical Conductor" icon={Sparkles}>
        <ConductorRecommendationList recommendations={encounter.conductor.recommendations.slice(0, 2)} compact onAct={onClinicalAction} />
      </Panel>
      <Panel className="span-2" title="SOAP Builder" icon={FilePenLine}>
        <SoapEditor compact encounter={encounter} />
      </Panel>
    </div>
  );
}

function EncounterModeSwitch({ mode, setMode }) {
  return (
    <div className="mode-switch" aria-label="Encounter mode">
      {[
        ["in-person", "In-Person Visit"],
        ["virtual", "Virtual Visit"]
      ].map(([id, label]) => (
        <button key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}>{label}</button>
      ))}
    </div>
  );
}

function InPersonEncounterWorkspace({ encounter, transcript }) {
  return (
    <div className="in-person-workspace">
      <div className="visit-live-top">
        <div className="timer"><Clock3 size={18} /> {encounter.active ? `0${encounter.stage}:4${encounter.stage}` : "08:42"}</div>
        <VoiceWave />
      </div>
      <div className="transcript mission-transcript">
        {transcript.map(([speaker, text], index) => (
          <p className={encounter.active && index === transcript.length - 1 ? "new-line" : ""} key={text}><strong>{speaker}</strong><span>{text}</span></p>
        ))}
      </div>
    </div>
  );
}

function VirtualVisitWorkspace({ encounter, transcript }) {
  return (
    <div className="virtual-workspace">
      <div className="video-stage">
        <div className="patient-video">
          <div className="video-avatar">SJ</div>
          <div className="video-status">
            <span><Activity size={15} /> Connection excellent</span>
            <span><CircleDot size={15} /> Recording</span>
            <span><Clock3 size={15} /> {encounter.active ? `0${encounter.stage}:4${encounter.stage}` : "00:00"}</span>
          </div>
        </div>
        <div className="self-view">
          <span>Clinician</span>
          <strong>FNP</strong>
        </div>
        <div className="floating-video">
          <span>Picture-in-picture ready</span>
        </div>
      </div>
      <div className="telehealth-controls">
        {["Mute", "Camera", "Screen Share", "Chat", "Invite", "PiP"].map((control) => (
          <ComingSoonButton key={control} label={control} />
        ))}
      </div>
      <div className="virtual-bottom">
        <div className="transcript compact-transcript">
          {transcript.slice(-3).map(([speaker, text], index) => (
            <p className={index === 2 ? "new-line" : ""} key={text}><strong>{speaker}</strong><span>{text}</span></p>
          ))}
        </div>
        <div className="resizable-panel">
          <strong>Visit tools</strong>
          <span>Resizable panel mockup</span>
        </div>
      </div>
    </div>
  );
}

function IntelligenceFeed({ events }) {
  return (
    <div className="intelligence-feed">
      {events.map((event) => (
        <article key={`${event.type}-${event.text}`}>
          <span>{event.time ? `${event.time} - ${event.type}` : event.type}</span>
          <strong>{event.text}</strong>
        </article>
      ))}
    </div>
  );
}

function ConductorRecommendationList({ recommendations, compact = false, onAct }) {
  return (
    <div className={`conductor-recommendations ${compact ? "compact" : ""}`}>
      {recommendations.map((item) => (
        <article key={item.action}>
          <strong>{item.action}</strong>
          <span><b>Why</b>{item.why}</span>
          <span><b>Evidence</b>{item.evidence}</span>
          <span><b>Most changes confidence</b>{item.confidenceChanger}</span>
          {onAct && <button onClick={() => onAct(`Clinician acted on recommendation: ${item.action}`)}>Use this finding</button>}
        </article>
      ))}
    </div>
  );
}

function InformationNeedList({ items, actionGroups = [], onSelectOption }) {
  const groups = Object.fromEntries(actionGroups.map((group) => [group.id, group]));
  return (
    <div className="information-needs">
      {items.map((item) => (
        <article key={item.question}>
          <div>
            <strong>{item.action}</strong>
            <span>{item.question}</span>
          </div>
          <em>{item.impact}</em>
          <small>{item.whyItMatters}</small>
          {groups[item.interactionId] && (
            <OptionGroup
              group={groups[item.interactionId]}
              onSelect={(optionId) => onSelectOption(item.interactionId, optionId)}
            />
          )}
        </article>
      ))}
    </div>
  );
}

function OptionGroup({ group, onSelect }) {
  return (
    <div className="option-group">
      {group.options.map((option) => (
        <button key={option.id} onClick={() => onSelect(option.id)}>{option.label}</button>
      ))}
    </div>
  );
}

function ActionGroupList({ groups, onSelectOption }) {
  return (
    <div className="action-groups">
      {groups.map((group) => (
        <article key={group.id}>
          <strong>{group.prompt}</strong>
          <span>{group.kind}</span>
          <OptionGroup group={group} onSelect={(optionId) => onSelectOption(group.id, optionId)} />
        </article>
      ))}
    </div>
  );
}

function ConfidenceTimeline({ points }) {
  return (
    <div className="confidence-timeline">
      <Sparkline values={points.map((point) => point.value)} tone="ok" />
      <div className="confidence-points">
        {points.map((point) => (
          <article key={point.label}>
            <strong>{point.value}%</strong>
            <span>{point.label}</span>
            <small>{point.note}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function VoiceWave() {
  return (
    <div className="wave" aria-label="Voice waveform">
      {Array.from({ length: 42 }).map((_, index) => (
        <span key={index} style={{ "--h": `${18 + Math.sin(index * 1.7) * 14 + (index % 5) * 7}px`, "--d": `${index * 26}ms` }} />
      ))}
    </div>
  );
}

function Timeline({ encounter }) {
  const [view, setView] = useState("story");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const items = normalizedQuery
    ? encounter.timeline.filter((item) => `${item.type} ${item.date} ${item.title} ${item.meta}`.toLowerCase().includes(normalizedQuery))
    : encounter.timeline;

  return (
    <div className="screen enter">
      <div className="toolbar">
        <div className="searchbox">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search diagnoses, labs, notes, medications..." />
        </div>
        <div className="mode-switch small">
          <button className={view === "story" ? "active" : ""} onClick={() => setView("story")}>Story View</button>
          <button className={view === "chrono" ? "active" : ""} onClick={() => setView("chrono")}>Chronological</button>
        </div>
        <ComingSoonButton className="theme-toggle" label="Filters" icon={Filter} />
      </div>
      {encounter.isReady("timeline") && (
        <div className="live-banner"><Sparkles size={18} /> Timeline is re-sorting around the current encounter priority.</div>
      )}
      <Panel title={view === "story" ? "Encounter Narrative" : "Clinical Timeline"} icon={Clock3}>
        {items.length ? (
          view === "story" ? <PatientStory narrative={encounter.narrative} items={items} highlight={encounter.isReady("timeline")} /> : <TimelineList items={items} large highlight={encounter.isReady("timeline")} />
        ) : (
          <ComingSoonCard title="No matching timeline events" detail="Try a broader term such as ECG, diabetes, lab, medication, or chest." icon={Search} />
        )}
      </Panel>
      <DiagnosticImagingWorkspace />
      <ProcedureReviewWorkspace />
    </div>
  );
}

function DiagnosticImagingWorkspace() {
  const [selectedId, setSelectedId] = useState(imagingStudies[0].id);
  const selected = imagingStudies.find((study) => study.id === selectedId) || imagingStudies[0];

  return (
    <Panel className="imaging-workspace-panel" title="Diagnostic Imaging Workspace" icon={Image}>
      <div className="pacs-layout">
        <div className="pacs-sidebar">
          <span className="eyebrow">Studies</span>
          {imagingStudies.map((study) => (
            <button key={study.id} className={study.id === selected.id ? "active" : ""} onClick={() => setSelectedId(study.id)}>
              <span>{study.type}</span>
              <small>{study.studyDate}</small>
            </button>
          ))}
        </div>
        <div className="pacs-viewer">
          <div className="viewer-toolbar">
            <strong>{selected.type}</strong>
            <div>
              <button><Maximize2 size={14} /> Fit</button>
              <button><Search size={14} /> Zoom 125%</button>
              <button><SlidersHorizontal size={14} /> W/L 42/380</button>
            </div>
          </div>
          <div className={`mock-scan ${selected.view}`}>
            <div className="scan-ruler top" />
            <div className="scan-ruler left" />
            <div className="scan-anatomy" />
            <div className="scan-crosshair" />
            <span className="scan-label">{selected.type}</span>
          </div>
          <div className="thumbnail-strip">
            {[0, 1, 2, 3].map((item) => <span key={item} className={item === 1 ? "active" : ""} />)}
          </div>
        </div>
        <div className="pacs-insights">
          <div className="study-info">
            <span>Patient</span><strong>{selected.patient}</strong>
            <span>Accession</span><strong>{selected.accession}</strong>
            <span>Technique</span><strong>{selected.technique}</strong>
          </div>
          <article>
            <span className="eyebrow">Radiology Impression</span>
            <p>{selected.impression}</p>
          </article>
          <article>
            <span className="eyebrow">AI Findings</span>
            <ul>
              {selected.ai.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </div>
      </div>
    </Panel>
  );
}

function ProcedureReviewWorkspace() {
  const [selectedId, setSelectedId] = useState(procedureStudies[0].id);
  const selected = procedureStudies.find((study) => study.id === selectedId) || procedureStudies[0];

  return (
    <Panel className="procedure-workspace-panel" title="Procedure and Video Review" icon={Film}>
      <div className="procedure-layout">
        <div className="procedure-timeline">
          {procedureStudies.map((study) => (
            <button key={study.id} className={study.id === selected.id ? "active" : ""} onClick={() => setSelectedId(study.id)}>
              <strong>{study.title}</strong>
              <span>{study.time}</span>
            </button>
          ))}
        </div>
        <div className={`procedure-viewer ${selected.view}`}>
          <div className="procedure-screen">
            <div className="video-noise" />
            <div className="annotation-marker one">A1</div>
            <div className="annotation-marker two">A2</div>
            <span>{selected.title}</span>
          </div>
          <div className="playback-controls">
            <button><Play size={14} /> Play</button>
            <button><Pause size={14} /> Pause</button>
            <button><RotateCcw size={14} /> Replay</button>
            <span>00:18 / {selected.time}</span>
          </div>
        </div>
        <div className="procedure-insights">
          <span className="eyebrow">AI Observations</span>
          <p>{selected.impression}</p>
          <ul>
            {selected.observations.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <ComingSoonCard title="Structured procedure report" detail="Template-based procedure reporting will attach annotations directly to the note." icon={FileText} />
        </div>
      </div>
    </Panel>
  );
}

function PatientStory({ narrative, items, highlight }) {
  return (
    <div className="patient-story">
      <article className="narrative-card">
        <span><Sparkles size={16} /></span>
        <div>
          <strong>Clinical Narrative</strong>
          <p>{narrative}</p>
        </div>
      </article>
      {items.slice(0, 7).map((item, index) => (
        <article className={highlight && index < 3 ? "live-card" : ""} key={item.title}>
          <span>{index + 1}</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.meta}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function TimelineList({ items, large = false, highlight = false }) {
  return (
    <div className={`timeline-list ${large ? "large" : ""}`}>
      {items.map((item, index) => (
        <article className={highlight && index < 3 ? "timeline-highlight" : ""} key={`${item.date}-${item.title}`}>
          <div className="timeline-dot" />
          <div className="timeline-date">{item.date}</div>
          <div>
            <span>{item.type}</span>
            <strong>{item.title}</strong>
            <small>{item.meta}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

function MedicationIntelligence({ encounter }) {
  return (
    <div className="screen medication-grid enter">
      {encounter.medications.map((med) => (
        <Panel key={med.name} className={`med-card ${encounter.isReady("meds") && ["Lisinopril", "Metformin XR"].includes(med.name) ? "live-card" : ""}`}>
          <div className="med-head">
            <Pill size={22} />
            <div>
              <h2>{med.name}</h2>
              <span>{med.dose}</span>
            </div>
          </div>
          <ProgressRing value={med.adherence} label="adherence" />
          <div className="med-meta">
            <span>{med.status}</span>
            <strong>{med.adherence > 85 ? "Consistent" : "Needs review"}</strong>
          </div>
          <div className="live-note">{med.intelligence}</div>
        </Panel>
      ))}
      <Panel className="span-2" title="Safety Intelligence" icon={ShieldAlert}>
        <div className="safety-grid">
          <AlertMini tone="warn" title="Drug interaction" text="Ibuprofen use may reduce lisinopril effect and affect renal perfusion." />
          <AlertMini tone="ok" title="Allergy check" text="No medication allergy conflicts found in the active list." />
          <AlertMini tone="warn" title="Duplicate therapy" text="No duplicates detected; confirm outside prescriptions." />
        </div>
        {encounter.isReady("meds") && <div className="live-banner inline"><Sparkles size={18} /> Medication intelligence updated from refill conversation and chest discomfort context.</div>}
      </Panel>
    </div>
  );
}

function AlertMini({ tone, title, text }) {
  return (
    <div className={`alert-mini ${tone}`}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function LaboratoryIntelligence({ encounter, onConversationOption }) {
  return (
    <div className="screen lab-grid enter">
      {encounter.labs.map((lab) => (
        <Panel key={lab.label} className={`lab-card ${lab.tone} ${encounter.isReady("labs") && ["A1c", "LDL"].includes(lab.label) ? "live-card" : ""}`}>
          <div className="lab-top">
            <div>
              <span>{lab.label}</span>
              <strong>{lab.value}<small>{lab.unit}</small></strong>
            </div>
            {lab.series.at(-1) > lab.series[0] ? <TrendingUp size={21} /> : <TrendingDown size={21} />}
          </div>
          <Sparkline values={lab.series.length > 1 ? lab.series : [0, lab.series[0]]} tone={lab.tone} />
          <small>{lab.range}</small>
          <div className="live-note">{lab.intelligence}</div>
        </Panel>
      ))}
      <Panel className="span-2" title="Risk and Follow-up" icon={Target}>
        <div className="follow-grid">
          <Metric label="Glycemic risk" value="Rising" sub="3-result upward drift" tone="high" icon={TrendingUp} />
          <Metric label="Renal watch" value="Stable" sub="eGFR above 60" tone="ok" icon={Activity} />
          <Metric label="Suggested orders" value={encounter.orders.length} sub="Shared encounter plan" tone="neutral" icon={ClipboardCheck} />
        </div>
        <ActionGroupList groups={encounter.conductor.actionGroups.filter((group) => group.id === "troponinResult")} onSelectOption={onConversationOption} />
      </Panel>
    </div>
  );
}

function ReasoningWorkspace({ encounter, onOpenEvidence, onClinicalAction, onConversationOption }) {
  const confidence = encounter.clinicalConfidence.diagnostic;

  return (
    <div className="screen reasoning-grid enter">
      <Panel className="span-2" title="Differential Workspace" eyebrow="No diagnoses displayed" icon={Brain} action={<button className="ghost-button" onClick={() => onOpenEvidence("labs")}>Clinical Evidence</button>}>
        <div className="consider-list">
          {encounter.conductor.hypotheses.map((item, index) => (
            <div className={encounter.isReady("reasoning") && index === 0 ? "live-card" : ""} key={item.name}>
              <span>{index + 1}</span>
              <strong>{item.name}</strong>
              <em>{item.probability}% fit - {item.status}</em>
              <small>{item.why} Most useful next discriminator: {item.missing}</small>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Clinical Confidence" icon={Target}>
        <div className="confidence">
          <ProgressRing value={confidence} label="signal clarity" />
          <p>{encounter.conductor.confidenceSummary}</p>
          <ConfidenceTimeline points={encounter.conductor.confidenceTimeline} />
          <div className="confidence-changes">
            {encounter.confidenceChanges.slice(-4).map((change) => (
              <article key={change.finding}>
                <span>{change.delta}</span>
                <div>
                  <strong>{change.finding}</strong>
                  <small>{change.reason}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Panel>
      <Panel title="Supporting Findings" icon={Check}>
        <PillList items={[...encounter.ros.filter((item) => !item.startsWith("No complete")), ...encounter.clinicalEvidence].slice(0, 6)} />
      </Panel>
      <Panel title="Contradicting Findings" icon={X}>
        <PillList items={encounter.ros.filter((item) => item.startsWith("No ")).slice(0, 5)} />
      </Panel>
      <Panel title="Information Still Needed" icon={MessageSquareText}>
        <InformationNeedList items={encounter.conductor.informationNeeded.slice(0, 3)} actionGroups={encounter.conductor.actionGroups} onSelectOption={onConversationOption} />
      </Panel>
      <Panel title="Physical Exam and Diagnostics" icon={Stethoscope}>
        <ActionGroupList groups={encounter.conductor.actionGroups.filter((group) => ["cardiacExam", "ecgResult"].includes(group.id))} onSelectOption={onConversationOption} />
      </Panel>
      <Panel className="span-2" title="Conductor Recommendations" icon={Sparkles}>
        <ConductorRecommendationList recommendations={encounter.conductor.recommendations} onAct={onClinicalAction} />
      </Panel>
      <Panel className="span-2" title="Red Flags" icon={AlertTriangle}>
        <div className="red-flags">
          {["Chest pain at rest", "Syncope", "New neurologic deficit", "Severe dyspnea", "Diaphoresis with pressure"].map((flag) => (
            <span key={flag}>{flag}</span>
          ))}
        </div>
        {encounter.isReady("reasoning") && <div className="live-banner inline"><Sparkles size={18} /> Reasoning updated automatically from the visit transcript.</div>}
      </Panel>
    </div>
  );
}

function PillList({ items }) {
  return (
    <div className="pill-list">
      {items.map((item) => <span key={item}>{item}</span>)}
    </div>
  );
}

function DocumentationCenter({ encounter, onOpenEvidence }) {
  return (
    <div className="screen docs-grid enter">
      <Panel className={`span-2 ${encounter.isReady("docs") ? "live-card" : ""}`} title="Editable SOAP Note" icon={FileText} action={<button className="ghost-button" onClick={() => onOpenEvidence("consult")}>Clinical Evidence</button>}>
        <div className="live-banner inline"><Sparkles size={18} /> Documentation is always current with the shared encounter state.</div>
        <SoapEditor key={encounter.stage} encounter={encounter} />
      </Panel>
      <Panel title="ICD Suggestions" icon={ClipboardCheck}>
        <CodeList items={encounter.billing.icd} />
      </Panel>
      <Panel title="CPT Suggestions" icon={FilePenLine}>
        <CodeList items={encounter.billing.cpt} />
      </Panel>
    </div>
  );
}

function SoapEditor({ compact = false, encounter = { isReady: () => false } }) {
  const sections = compact ? ["Subjective", "Objective", "Assessment", "Plan"] : ["HPI", "ROS", "Physical Exam", "Assessment", "Plan"];
  return (
    <div className="soap-grid">
      {sections.map((section) => (
        <label key={section}>
          <span>{section}</span>
          <textarea value={encounter.documentation?.[section] || encounter.documentation?.Assessment || ""} readOnly />
        </label>
      ))}
    </div>
  );
}

function CodeList({ items }) {
  return (
    <div className="code-list">
      {items.map((item) => <span key={item}><Plus size={15} /> {item}</span>)}
    </div>
  );
}

function readinessLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function PatientEducation({ encounter }) {
  return (
    <div className="screen education-grid enter">
      <Panel className={`span-2 ${encounter.isReady("education") ? "live-card" : ""}`} title="Plain Language Summary" icon={MessageSquareText}>
        <div className="live-banner inline"><Sparkles size={18} /> Patient education is adjusting to the current assessment and disposition.</div>
        <div className="education-copy" contentEditable suppressContentEditableWarning>
          {encounter.patientEducation.summary}
        </div>
      </Panel>
      <Panel title="Medication Instructions" icon={Pill}>
        <PillList items={encounter.patientEducation.medications} />
      </Panel>
      <Panel title="Lifestyle" icon={HeartPulse}>
        <PillList items={encounter.patientEducation.lifestyle} />
      </Panel>
      <Panel title="Follow-up Reminders" icon={CalendarDays}>
        <div className="reminders">
          {encounter.patientEducation.followUp.map((item) => <span key={item}>{item}</span>)}
        </div>
      </Panel>
      <Panel title="Printable Summary" icon={Printer}>
        <ComingSoonButton className="primary-button" label="Print AVS" icon={Printer} />
        <ComingSoonButton label="Download PDF" icon={Download} />
      </Panel>
    </div>
  );
}

function ExecutiveDashboard({ encounter }) {
  return (
    <div className="screen executive-grid enter">
      <Metric label="Clinical Readiness" value={`${encounter.readinessScore}%`} sub={encounter.brief.priority} tone="neutral" icon={Target} />
      <Metric label="Documentation" value={`${encounter.clinicalConfidence.documentationCompleteness}%`} sub="SOAP, ICD, CPT, AVS live" tone="ok" icon={FileText} />
      <Metric label="Safety Review" value={`${encounter.encounterProgress.safetyReview}%`} sub="Red flags and meds" tone="warn" icon={ShieldAlert} />
      <Metric label="Conductor Bottleneck" value={`${encounter.conductor.bottleneck.value}%`} sub={encounter.conductor.bottleneck.label} tone="warn" icon={Sparkles} />
      <Panel className="span-2" title="Executive Encounter Score" icon={UsersRound}>
        <div className="population-bars">
          {Object.entries(encounter.encounterProgress).map(([key, value]) => (
            <div key={key}>
              <span>{readinessLabel(key)}</span>
              <div><i style={{ width: `${value}%` }} /></div>
              <strong>{value}%</strong>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Quality Metrics" icon={ClipboardCheck}>
        <PillList items={encounter.orders.slice(0, 6)} />
      </Panel>
      <Panel title="Practice Analytics" icon={BarChart3}>
        <div className="analytics-card">
          <strong>{encounter.conductor.primaryHypothesis}</strong>
          <span>{encounter.conductor.confidenceSummary}</span>
          <ConfidenceTimeline points={encounter.conductor.confidenceTimeline} />
        </div>
      </Panel>
    </div>
  );
}

const screens = {
  command: CommandCenter,
  visit: LiveVisit,
  timeline: Timeline,
  meds: MedicationIntelligence,
  labs: LaboratoryIntelligence,
  reasoning: ReasoningWorkspace,
  docs: DocumentationCenter,
  education: PatientEducation,
  executive: ExecutiveDashboard
};

createRoot(document.getElementById("root")).render(<App />);
