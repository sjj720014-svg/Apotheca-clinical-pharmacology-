import { PaipDilemmaCase, PaipFactor } from '../types/pharma';

export interface StudyBenchmarkStat {
  id: string;
  metric: string;
  label: string;
  detail: string;
}

export const PAIP_STUDY_STATS: StudyBenchmarkStat[] = [
  {
    id: 'info_access',
    metric: '89.8%',
    label: 'Information Access',
    detail: 'Agreed AI enhances clinicians’ access to relevant drug & clinical data',
  },
  {
    id: 'error_reduction',
    metric: '69.8%',
    label: 'Error Reduction',
    detail: 'Agreed AI decision support helps minimize dispensing & prescribing errors',
  },
  {
    id: 'humanistic_concern',
    metric: '60.5%',
    label: 'Humanistic Concern',
    detail: 'Worried unguarded automation could diminish human-centered pharmacy care',
  },
  {
    id: 'curriculum_demand',
    metric: '80.0%',
    label: 'Curriculum Reform',
    detail: 'Supported adding AI literacy & ethics, while only 17.5% had formal training',
  },
];

export interface PaipFactorMeta {
  id: PaipFactor;
  code: string;
  title: string;
  summary: string;
  surveyHighlight: string;
  pharmacistSafeguard: string;
}

export const PAIP_FACTORS: PaipFactorMeta[] = [
  {
    id: 'augmented_healthcare',
    code: 'Factor 1 · AH',
    title: 'Augmented Healthcare',
    summary:
      'Reflects AI’s constructive role as an assistive tool that accelerates pharmacovigilance, flags drug-drug interactions, expands patient service access, and empowers informed clinical judgment.',
    surveyHighlight:
      '78.0% saw improved access to care and 70.2% saw stronger clinical decision support; 54.7% viewed AI as an assistant rather than a replacement.',
    pharmacistSafeguard:
      'Use clinical decision support (CDSS) and automated dispensing to clear repetitive checks so more time goes to direct patient counseling.',
  },
  {
    id: 'ai_dehumanization',
    code: 'Factor 2 · AD',
    title: 'AI-Dehumanization',
    summary:
      'Captures concerns that over-relying on chatbots, automated refills, or algorithmic triage can turn pharmaceutical care transactional and erode the empathy and trust anchoring the patient-pharmacist bond.',
    surveyHighlight:
      '60.5% felt AI risks diminishing human-centered care, and 34.3% warned unmediated algorithms could erode patient-provider trust.',
    pharmacistSafeguard:
      'Never outsource motivational interviewing, sensitive behavioral counseling, or emotionally nuanced medication decisions to automated scripts.',
  },
  {
    id: 'information_misuse',
    code: 'Factor 3 · IM',
    title: 'Information Misuse',
    summary:
      'Highlights ethical risks from sensitive health data breaches, biased training cohorts that skew dosing in underrepresented patients, and opaque "black-box" recommendations lacking clinical explainability.',
    surveyHighlight:
      '37.2% flagged confidentiality breach risks (with 47.4% uncertain) and 77.1% called for mandatory training on AI ethics and governance.',
    pharmacistSafeguard:
      'Audit algorithmic recommendations for missing patient context (renal mass, pharmacogenomics, ancestry) and enforce strict patient data privacy.',
  },
];

export interface CurriculumRoadmapStage {
  year: string;
  title: string;
  focus: string;
  competencies: string[];
}

export const PHARMACY_AI_ROADMAP: CurriculumRoadmapStage[] = [
  {
    year: 'Year 1',
    title: 'Foundational AI & Digital Literacy',
    focus: 'Basic terminology, assistive vs. substitutive scope, and professional identity.',
    competencies: [
      'Distinguish supportive clinical tools from autonomous substitution',
      'Recognize limitations of general chatbots in medication safety',
      'Establish ethical foundations in patient autonomy and empathy',
    ],
  },
  {
    year: 'Year 2',
    title: 'Applied Pharmacoinformatics',
    focus: 'Digital prescribing simulations, automated dispensing verification, and drug discovery concepts.',
    competencies: [
      'Verify barcode & automated dispensing queues against LASA errors',
      'Interpret pharmacokinetic & drug-design predictions critically',
      'Practice risk-free virtual patient prescribing cases',
    ],
  },
  {
    year: 'Year 3',
    title: 'CDSS, Bias & Data Ethics',
    focus: 'Real-world clinical decision support interpretation, algorithmic bias, and privacy governance.',
    competencies: [
      'Diagnose alert fatigue and catch unflagged renal or QTc contraindications',
      'Identify cohort bias in pharmacogenomic and eGFR algorithms',
      'Apply health data confidentiality regulations in digital workflows',
    ],
  },
  {
    year: 'Year 4',
    title: 'Human-Centered Capstone',
    focus: 'Interdisciplinary practice balancing algorithmic efficiency with compassionate counseling.',
    competencies: [
      'Integrate wearable CGM/BP telemetry into shared patient care plans',
      'Communicate algorithmic risk scores transparently with patients',
      'Lead interdisciplinary medication-safety audits with clinicians & data teams',
    ],
  },
];

export const PAIP_DILEMMA_CASES: PaipDilemmaCase[] = [
  {
    id: 'dilemma_assistive_boundary',
    yearTier: 'Year 1 · Literacy',
    paipFactor: 'augmented_healthcare',
    title: 'Robotic Dispensing Queue & Counseling Reallocation',
    scenario:
      'A hospital outpatient pharmacy deploys an AI-assisted robotic counting and barcode-verification system that cuts routine refill verification time by 40%.',
    aiSystemNote:
      'System Log: 99.6% barcode concordance across standard maintenance refills; flags 3 high-alert warfarin INR discrepancies for pharmacist review.',
    question:
      'Which workflow best reflects the Augmented Healthcare model emphasized in pharmacy education?',
    options: [
      {
        label: 'Use automated verification as an assistive check while reallocating freed pharmacist time to targeted warfarin and adherence counseling.',
        isOptimal: true,
        feedback:
          'Optimal. Treating automation as intelligence augmentation reduces routine dispensing strain while strengthening human-centered patient counseling.',
      },
      {
        label: 'Eliminate face-to-face pharmacist counseling for all flagged refills since the robotic system reports 99.6% accuracy.',
        isOptimal: false,
        feedback:
          'Unsafe & dehumanizing. Even 0.4% error across high-volume dispensing is clinically significant, and patients still need tailored counseling.',
      },
      {
        label: 'Disable barcode verification completely because automated tools undermine professional autonomy.',
        isOptimal: false,
        feedback:
          'Suboptimal. Rejecting validated safety automation forfeits proven medication-error reductions.',
      },
    ],
    humanisticTakeaway:
      'AI excels as a supportive safety net; its greatest clinical dividend is returning time to the pharmacist for empathetic patient care.',
  },
  {
    id: 'dilemma_chatbot_empathy',
    yearTier: 'Year 1 · Literacy',
    paipFactor: 'ai_dehumanization',
    title: 'Automated Depression Refill Chatbot vs. Suicidality Cue',
    scenario:
      'A 21-year-old patient initiating an SSRI messages the pharmacy’s 24/7 patient-support chatbot asking whether stopping the medication early is safe because they feel "worse and hopeless this week."',
    aiSystemNote:
      'Chatbot Draft Response: "Common side effects of sertraline include nausea and insomnia. Please continue taking your medication as prescribed and consult your doctor at your next visit."',
    question:
      'What primary PAIP risk does relying solely on the chatbot reply illustrate, and what is the pharmacist’s duty?',
    options: [
      {
        label: 'AI-Dehumanization: escalate immediately to direct empathetic pharmacist outreach and urgent crisis/prescriber triage.',
        isOptimal: true,
        feedback:
          'Optimal. Algorithms lack emotional intelligence to recognize emerging suicidality or distress; immediate human clinical engagement is essential.',
      },
      {
        label: 'Augmented Healthcare: allow the chatbot to send its drafted FAQ reply to reduce pharmacist workload.',
        isOptimal: false,
        feedback:
          'Dangerous. A generic FAQ response misses an acute safety signal ("hopeless") during early SSRI therapy.',
      },
      {
        label: 'Information Misuse: delete the chat transcript immediately without contacting the patient.',
        isOptimal: false,
        feedback:
          'Unsafe. Deleting the transcript abandons a distressed patient who needs prompt clinical follow-up.',
      },
    ],
    humanisticTakeaway:
      'AI lacks nuanced emotional judgment and therapeutic alliance—empathetic human communication remains irreplaceable in pharmacy.',
  },
  {
    id: 'dilemma_privacy_upload',
    yearTier: 'Year 2 · Informatics',
    paipFactor: 'information_misuse',
    title: 'Unvetted Cloud AI Summary of Patient Medication Histories',
    scenario:
      'To speed up discharge medication reconciliation, a pharmacy intern considers pasting unredacted patient names, HIV antiretroviral regimens, and psychiatric notes into a public consumer LLM tool.',
    aiSystemNote:
      'Prompt Warning: Public web interface logs user prompts for external model evaluation and lacks institutional health-data governance.',
    question:
      'What ethical domain is violated, and what is the appropriate informatics safeguard?',
    options: [
      {
        label: 'Information Misuse: halt immediately—never enter identifiable PHI into unapproved external tools; use vetted, encrypted institutional systems only.',
        isOptimal: true,
        feedback:
          'Optimal. Uploading identifiable medication histories breaches patient confidentiality and informed consent principles.',
      },
      {
        label: 'Augmented Healthcare: proceed because faster discharge reconciliation justifies using consumer web tools.',
        isOptimal: false,
        feedback:
          'Unethical. Clinical efficiency never overrides health-data confidentiality and regulatory safeguards.',
      },
      {
        label: 'AI-Dehumanization: proceed as long as the patient’s first name is abbreviated to initials.',
        isOptimal: false,
        feedback:
          'Insufficient. Partial abbreviations combined with dates and rare regimens still risk re-identification and breach institutional policy.',
      },
    ],
    humanisticTakeaway:
      'Protecting sensitive health records against unauthorized sharing or breaches is a foundational legal and ethical duty.',
  },
  {
    id: 'dilemma_algorithmic_bias',
    yearTier: 'Year 3 · CDSS & Ethics',
    paipFactor: 'information_misuse',
    title: 'Algorithmic Bias in Pharmacogenomic Toxicity Screening',
    scenario:
      'An EHR prescribing model trained predominantly on European ancestry cohorts outputs "Low Hypersensitivity Risk — Standard Allopurinol Initiation" for a 58-year-old patient of Han Chinese descent with CKD Stage 3.',
    aiSystemNote:
      'CDSS Output: "Gout prophylaxis score 0.14 (Low Risk). Auto-order allopurinol 300 mg daily." HLA-B*58:01 status was never queried.',
    question:
      'How should the pharmacist intervene against this opaque algorithmic output?',
    options: [
      {
        label: 'Override the auto-order: recognize training-data bias, require HLA-B*58:01 testing (or alternative), and start low-dose titration if negative.',
        isOptimal: true,
        feedback:
          'Optimal. HLA-B*58:01 carriage strongly predicts fatal SJS/TEN with allopurinol in Han Chinese, Thai, and Korean populations—blindly trusting biased scores endangers the patient.',
      },
      {
        label: 'Accept the CDSS auto-order since the model is validated in the hospital EHR.',
        isOptimal: false,
        feedback:
          'Hazardous. Models trained on skewed populations systematically underpredict risk in underrepresented groups, and 300 mg in CKD Stage 3 further elevates oxypurinol toxicity.',
      },
      {
        label: 'Report the patient as non-adherent rather than questioning the model’s ancestry calibration.',
        isOptimal: false,
        feedback:
          'Incorrect. The flaw lies in uncalibrated model generalization and missing pharmacogenomic context.',
      },
    ],
    humanisticTakeaway:
      'Algorithmic fairness requires pharmacists to verify whether training cohorts reflect the patient in front of them.',
  },
  {
    id: 'dilemma_alert_fatigue',
    yearTier: 'Year 3 · CDSS & Ethics',
    paipFactor: 'augmented_healthcare',
    title: 'CDSS Alert Fatigue & Opacity in Anticoagulation',
    scenario:
      'During evening verification, the EHR fires 18 low-priority duplicate-therapy alerts alongside one poorly explained warning: "Review anticoagulation dose — composite score 82."',
    aiSystemNote:
      'Black-Box Score: Composite risk flagged without showing whether weight (54 kg), age (83 yrs), or SCr (1.6 mg/dL) triggered the alert.',
    question:
      'What is the safest clinical response to an opaque CDSS risk alert?',
    options: [
      {
        label: 'Never auto-override or blindly obey: manually recalculate Cockcroft-Gault CrCl and verify age/weight criteria against clinical guidelines.',
        isOptimal: true,
        feedback:
          'Optimal. Lack of explainability requires transparent human verification—here age >= 80 and weight <= 60 kg + SCr >= 1.5 meet apixaban 2.5 mg BID reduction criteria.',
      },
      {
        label: 'Batch-override all alerts on the screen to prevent alert fatigue from slowing verification.',
        isOptimal: false,
        feedback:
          'Dangerous. Alert fatigue causes true life-threatening dosing errors (like full-dose DOAC in frail elderly CKD) to be missed.',
      },
      {
        label: 'Hold all anticoagulation indefinitely because the risk score is above 80.',
        isOptimal: false,
        feedback:
          'Harmful. Uncalibrated risk scores are triggers for clinical review, not automatic cessation of essential stroke prevention.',
      },
    ],
    humanisticTakeaway:
      'Pharmacists must bridge algorithmic opacity with transparent clinical calculations and guideline verification.',
  },
  {
    id: 'dilemma_transactional_trust',
    yearTier: 'Year 4 · Capstone',
    paipFactor: 'ai_dehumanization',
    title: 'Wearable Telemetry & Shared Decision-Making',
    scenario:
      'An automated diabetes portal uses continuous glucose monitor (CGM) trends to send an elderly patient a blunt push alert: "Basal insulin failure detected. Escalate dose tonight or risk complication." The patient calls the pharmacy frightened and confused.',
    aiSystemNote:
      'Telemetry Flag: Nocturnal hyperglycemia excursion over 3 nights; patient actually had delayed evening meals and skipped doses out of fear of hypoglycemia.',
    question:
      'How does the capstone pharmacist harmonize digital telemetry with patient-centered care?',
    options: [
      {
        label: 'Listen empathetically, uncover the root meal-timing/fear barrier, validate CGM patterns collaboratively with the prescriber, and co-create a safe plan.',
        isOptimal: true,
        feedback:
          'Optimal. Blending wearable insights with empathetic dialogue prevents dangerous dose escalation and restores patient trust.',
      },
      {
        label: 'Tell the patient to follow the portal push notification without asking about meals or adherence.',
        isOptimal: false,
        feedback:
          'Unsafe & transactional. Escalating insulin when doses were skipped risks severe nocturnal hypoglycemia.',
      },
      {
        label: 'Advise the patient to stop wearing the CGM completely because digital telemetry causes anxiety.',
        isOptimal: false,
        feedback:
          'Suboptimal. CGM data is clinically valuable when interpreted and communicated compassionately by a human clinician.',
      },
    ],
    humanisticTakeaway:
      'Technology should inform the conversation—never replace the empathetic clinical relationship that uncovers why patients struggle.',
  },
];

export interface CohortReflectionItem {
  id: string;
  statement: string;
  cohortSplit: string;
  interpretation: string;
}

export const COHORT_REFLECTION_ITEMS: CohortReflectionItem[] = [
  {
    id: 'tool_vs_replace',
    statement: 'AI in pharmacy should function strictly as an assistive tool for clinicians rather than replacing human pharmacists.',
    cohortSplit: 'BPharm Cohort (n=245): 54.7% Tool/Assistant · 33.8% Won’t Replace · 11.4% Might Replace',
    interpretation:
      'Most students view AI as intelligence augmentation—supporting verification while preserving human accountability and care.',
  },
  {
    id: 'minimize_mistakes',
    statement: 'AI-driven clinical decision support can meaningfully reduce prescribing and dispensing errors.',
    cohortSplit: 'BPharm Cohort: 69.8% Agree/Strongly Agree · 22.9% Neutral · 7.3% Disagree',
    interpretation:
      'Strong optimism for safety tools, provided pharmacists remain trained to spot alert fatigue and biased edge cases.',
  },
  {
    id: 'human_centered_care',
    statement: 'Unchecked automation risks diminishing the empathetic, human-centered nature of pharmacy practice.',
    cohortSplit: 'BPharm Cohort: 60.5% Agree/Strongly Agree · 22.5% Neutral · 17.1% Disagree',
    interpretation:
      'A clear majority flagged dehumanization as a top concern—underscoring why communication training must grow alongside informatics.',
  },
  {
    id: 'ethics_curriculum',
    statement: 'Pharmacy curricula must include structured training on AI ethics, confidentiality, and algorithmic bias.',
    cohortSplit: 'BPharm Cohort: 77.1% Should Be Included (80.0% overall AI skills; only 17.5% had formal training)',
    interpretation:
      'Bridging the gap between student enthusiasm (80%) and formal training (17.5%) requires scaffolded technical + ethical modules.',
  },
];
