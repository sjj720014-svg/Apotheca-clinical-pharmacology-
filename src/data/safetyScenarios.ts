import { SafetyScenario } from '../types/pharma';

export const SAFETY_SCENARIOS: SafetyScenario[] = [
  {
    id: 'saf_cyp_simvastatin_clarithro',
    category: 'cyp450',
    specialty: 'cardiorenal',
    title: 'Strong CYP3A4 Inhibitor + Statin Order',
    patientSummary: '68M · Community-acquired pneumonia · Hyperlipidemia',
    creatinineClearanceNote: 'CrCl 58 mL/min · Baseline ALT 26 U/L',
    labs: [
      { label: 'CrCl', value: '58 mL/min', flag: 'normal' },
      { label: 'AST / ALT', value: '28 / 26 U/L', flag: 'normal' },
      { label: 'CK', value: '110 U/L', flag: 'normal' },
    ],
    activeMeds: ['Simvastatin 40 mg QHS', 'Lisinopril 10 mg daily'],
    pendingOrder: 'Clarithromycin 500 mg PO BID × 7 days',
    promptQuestion:
      'Before verifying Clarithromycin, what medication safety action is required?',
    crclHint:
      'Simvastatin is heavily dependent on intestinal/hepatic CYP3A4 first-pass metabolism; strong CYP3A4 inhibitors spike AUC >10-fold.',
    options: [
      {
        id: 'hold_simvastatin',
        label: 'Hold simvastatin during therapy or switch antibiotic to azithromycin',
        actionType: 'hold_switch',
        isCorrect: true,
        rationale:
          'Correct. Clarithromycin strongly inhibits CYP3A4, sharply increasing simvastatin exposure and risk of rhabdomyolysis/AKI. Hold simvastatin or substitute a non-CYP3A4 macrolide (azithromycin) or non-3A4 statin (pravastatin/rosuvastatin).',
      },
      {
        id: 'cut_clarithro',
        label: 'Approve simvastatin and reduce clarithromycin to 250 mg daily',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'Reducing clarithromycin dose does not prevent potent CYP3A4 inhibition, and subtherapeutic macrolide dosing risks CAP treatment failure.',
      },
      {
        id: 'approve_as_is',
        label: 'Approve order as written and check CK in 3 months',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Co-administration of simvastatin with strong CYP3A4 inhibitors is contraindicated per FDA labeling due to acute myopathy and rhabdomyolysis risk.',
      },
      {
        id: 'switch_amlodipine',
        label: 'Discontinue lisinopril to prevent hyperkalemia',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'Lisinopril does not interact significantly with clarithromycin; the critical CYP3A4 interaction is with simvastatin.',
      },
    ],
    clinicalReference:
      'FDA Simvastatin Labeling & ACC/AHA Statin Safety Guidelines: Strong CYP3A4 inhibitors (clarithromycin, itraconazole, ritonavir) are contraindicated with simvastatin and lovastatin.',
  },
  {
    id: 'saf_renal_enoxaparin',
    category: 'renal_dosing',
    specialty: 'cardiorenal',
    title: 'Therapeutic LMWH in Severe Renal Impairment',
    patientSummary: '76F · New acute DVT · Weight 70 kg · SCr 2.1 mg/dL',
    creatinineClearanceNote: 'Cockcroft-Gault CrCl: 22 mL/min',
    labs: [
      { label: 'CrCl', value: '22 mL/min', flag: 'low' },
      { label: 'SCr', value: '2.1 mg/dL', flag: 'high' },
      { label: 'Hgb / Plt', value: '11.4 g/dL · 215k', flag: 'normal' },
    ],
    activeMeds: ['Metoprolol succinate 50 mg daily', 'Furosemide 40 mg daily'],
    pendingOrder: 'Enoxaparin 70 mg (1 mg/kg) SubQ q12h for acute DVT',
    promptQuestion:
      'Evaluate the pending therapeutic enoxaparin order against her CrCl of 22 mL/min.',
    crclHint:
      'Enoxaparin is cleared primarily by the kidneys; therapeutic dosing changes once CrCl falls below 30 mL/min.',
    options: [
      {
        id: 'adjust_q24h',
        label: 'Adjust frequency to Enoxaparin 70 mg (1 mg/kg) SubQ q24h (or switch to UFH)',
        actionType: 'adjust',
        isCorrect: true,
        rationale:
          'Correct. For CrCl < 30 mL/min, therapeutic enoxaparin must be reduced from 1 mg/kg q12h to 1 mg/kg q24h (or substituted with IV unfractionated heparin) to prevent major hemorrhage from drug accumulation.',
      },
      {
        id: 'approve_q12h',
        label: 'Approve 70 mg SubQ q12h because weight-based dosing accounts for renal function',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Weight-based q12h dosing leads to severe anti-Xa accumulation when CrCl is < 30 mL/min, causing life-threatening bleeding.',
      },
      {
        id: 'switch_dabigatran',
        label: 'Switch directly to oral dabigatran 150 mg BID',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'Dabigatran is 80% renally cleared and requires caution/avoidance below CrCl 30 mL/min (plus parenteral lead-in for acute VTE if used).',
      },
      {
        id: 'reduce_to_30mg',
        label: 'Verify as prophylactic enoxaparin 30 mg SubQ q24h for acute DVT',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          '30 mg SubQ q24h is DVT prophylaxis, which is subtherapeutic for treating an acute diagnosed DVT.',
      },
    ],
    clinicalReference:
      'CHEST / ASH VTE Guidelines & Enoxaparin Renal Dosing: CrCl < 30 mL/min requires 1 mg/kg once daily (q24h) for VTE treatment or UFH.',
  },
  {
    id: 'saf_washout_sacubitril_acei',
    category: 'contraindication',
    specialty: 'cardiorenal',
    title: 'ARNI Initiation After Morning ACE Inhibitor',
    patientSummary: '61M · HFrEF (EF 27%) transitioning from lisinopril to ARNI',
    creatinineClearanceNote: 'Last dose of Lisinopril 20 mg taken 8 hours ago',
    labs: [
      { label: 'BP', value: '118/72 mmHg', flag: 'normal' },
      { label: 'K+', value: '4.4 mEq/L', flag: 'normal' },
      { label: 'eGFR', value: '56 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Lisinopril 20 mg PO (last dose 08:00 today)', 'Carvedilol 12.5 mg BID'],
    pendingOrder: 'Sacubitril-Valsartan 24/26 mg PO BID — Start tonight (20:00)',
    promptQuestion:
      'What safety check must occur before initiating sacubitril-valsartan tonight?',
    crclHint:
      'Neprilysin AND ACE both degrade bradykinin. Overlapping them dramatically increases angioedema risk.',
    options: [
      {
        id: 'enforce_36h',
        label: 'Hold tonight; enforce a mandatory 36-hour washout after the last lisinopril dose',
        actionType: 'contraindicated',
        isCorrect: true,
        rationale:
          'Correct. Concurrent ACEi + neprilysin inhibition is contraindicated due to severe bradykinin-mediated angioedema. Wait at least 36 hours after the last lisinopril dose before starting sacubitril-valsartan.',
      },
      {
        id: 'approve_tonight',
        label: 'Approve tonight because BP is 118/72 mmHg and K+ is normal',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Starting within 12 hours of lisinopril violates the black-box 36-hour washout window and exposes the patient to airway angioedema.',
      },
      {
        id: 'double_valsartan',
        label: 'Add valsartan 80 mg separately tonight while tapering lisinopril',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'Dual RAAS blockade with an ACEi + ARB increases hyperkalemia, hypotension, and AKI without resolving the washout hazard.',
      },
      {
        id: 'give_diphenhydramine',
        label: 'Approve tonight and premedicate with diphenhydramine 25 mg',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'ACEi/neprilysin angioedema is bradykinin-mediated, NOT histamine-mediated; antihistamines do not prevent airway swelling.',
      },
    ],
    clinicalReference:
      'AHA/ACC/HFSA Heart Failure Guideline & Entresto Boxed Warning: Minimum 36-hour washout required when switching to or from an ACE inhibitor.',
  },
  {
    id: 'saf_qtc_ondansetron_haloperidol',
    category: 'qtc_risk',
    specialty: 'cns',
    title: 'Additive QTc Prolongation on Telemetry',
    patientSummary: '54F · ICU delirium + chemotherapy-associated nausea',
    creatinineClearanceNote: 'Baseline ECG QTc: 508 ms · Mg2+ 1.5 mg/dL · K+ 3.4 mEq/L',
    labs: [
      { label: 'QTc', value: '508 ms', flag: 'high' },
      { label: 'K+ / Mg2+', value: '3.4 / 1.5', flag: 'low' },
      { label: 'CrCl', value: '74 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Amiodarone 200 mg daily', 'Ondansetron 4 mg IV q6h PRN'],
    pendingOrder: 'Haloperidol 5 mg IV q4h PRN agitation + Ciprofloxacin 400 mg IV q12h',
    promptQuestion:
      'Review the ECG and electrolyte profile before verifying IV haloperidol and ciprofloxacin.',
    crclHint:
      'QTc > 500 ms plus hypokalemia/hypomagnesemia creates high Torsades de Pointes risk when stacking hERG K+ channel blockers.',
    options: [
      {
        id: 'hold_correct_lytes',
        label: 'Hold QTc-prolonging additions; replete K+/Mg2+ and recommend non-QT-prolonging alternatives',
        actionType: 'hold_switch',
        isCorrect: true,
        rationale:
          'Correct. Stacking haloperidol IV + ciprofloxacin on baseline QTc 508 ms, amiodarone, ondansetron, hypokalemia, and hypomagnesemia carries extreme Torsades de Pointes risk. Correct K+ (>4.0) and Mg2+ (>2.0) immediately and avoid additive QT blockers.',
      },
      {
        id: 'approve_cipro_only',
        label: 'Approve IV haloperidol and hold only ciprofloxacin',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'IV haloperidol carries a strong FDA warning for QTc prolongation and Torsades, especially when baseline QTc exceeds 500 ms with low K+/Mg2+.',
      },
      {
        id: 'approve_all',
        label: 'Approve both orders because patient is on telemetry monitoring',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Telemetry detects arrhythmias after they happen rather than preventing Torsades de Pointes; preventable triggers must be resolved first.',
      },
      {
        id: 'switch_to_azithro',
        label: 'Replace ciprofloxacin with IV azithromycin to remove QT risk',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'Azithromycin also prolongs the QTc interval and does not resolve the high Torsades risk.',
      },
    ],
    clinicalReference:
      'CredibleMeds & AHA Torsades Prevention Statement: Avoid additional QT-prolonging drugs when QTc > 500 ms; aggressively correct K+ and Mg2+.',
  },
  {
    id: 'saf_cyp_warfarin_fluconazole',
    category: 'cyp450',
    specialty: 'infectious',
    title: 'Azole Antifungal Added to Chronic Warfarin',
    patientSummary: '64F · Mechanical mitral valve + esophageal candidiasis',
    creatinineClearanceNote: 'Current INR 2.9 (Target 2.5–3.5) · CrCl 62 mL/min',
    labs: [
      { label: 'INR', value: '2.9', flag: 'normal' },
      { label: 'CrCl', value: '62 mL/min', flag: 'normal' },
      { label: 'Plt', value: '240k', flag: 'normal' },
    ],
    activeMeds: ['Warfarin 5 mg PO daily', 'Metoprolol tartrate 25 mg BID'],
    pendingOrder: 'Fluconazole 200 mg PO daily × 14 days (warfarin left unchanged)',
    promptQuestion:
      'What action is required before dispensing Fluconazole with chronic Warfarin?',
    crclHint:
      'Fluconazole inhibits CYP2C9 (the primary enzyme clearing the potent S-warfarin enantiomer) and CYP3A4.',
    options: [
      {
        id: 'reduce_warfarin_inr',
        label: 'Proactively reduce warfarin dose (~25–50%) and schedule INR recheck in 2–3 days',
        actionType: 'adjust',
        isCorrect: true,
        rationale:
          'Correct. Fluconazole potently inhibits CYP2C9 (blocking S-warfarin metabolism), routinely doubling INR within days. Proactively reduce warfarin 25–50% and monitor INR closely.',
      },
      {
        id: 'stop_warfarin_completely',
        label: 'Discontinue warfarin completely for 14 days during fluconazole',
        actionType: 'contraindicated',
        isCorrect: false,
        rationale:
          'Stopping anticoagulation completely in a patient with a mechanical mitral valve risks catastrophic valve thrombosis.',
      },
      {
        id: 'approve_unchanged',
        label: 'Dispense unchanged because INR 2.9 is within mechanical valve goal',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Leaving warfarin at 5 mg/day during fluconazole therapy reliably drives supratherapeutic INRs (>6.0) and major GI/intracranial bleeding.',
      },
      {
        id: 'switch_apixaban',
        label: 'Switch mechanical valve anticoagulation to apixaban 5 mg BID',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'DOACs (apixaban, rivaroxaban, dabigatran) are contraindicated in mechanical heart valves due to increased thrombosis and bleeding.',
      },
    ],
    clinicalReference:
      'CHEST Antithrombotic Therapy Guidelines: Fluconazole strongly inhibits CYP2C9 metabolism of S-warfarin; preemptive dose reduction + early INR follow-up is mandatory.',
  },
  {
    id: 'saf_renal_metformin_egfr',
    category: 'renal_dosing',
    specialty: 'endocrine_gi',
    title: 'Biguanide Verification in Acute-on-Chronic Kidney Decline',
    patientSummary: '72M · Type 2 Diabetes admitted with dehydration & sepsis',
    creatinineClearanceNote: 'eGFR dropped from 52 to 24 mL/min/1.73m² on admission',
    labs: [
      { label: 'eGFR', value: '24 mL/min', flag: 'low' },
      { label: 'Lactate', value: '3.1 mmol/L', flag: 'high' },
      { label: 'SCr', value: '2.6 mg/dL', flag: 'high' },
    ],
    activeMeds: ['Empagliflozin 10 mg (held on admission)', 'Atorvastatin 40 mg daily'],
    pendingOrder: 'Resume home Metformin ER 1000 mg PO BID',
    promptQuestion:
      'Should inpatient continuation of Metformin ER 1000 mg BID be verified?',
    crclHint:
      'FDA boxed thresholds distinguish eGFR 30–45 mL/min (caution/dose limit) from eGFR < 30 mL/min.',
    options: [
      {
        id: 'hold_contraindicated',
        label: 'Contraindicated — Hold metformin (eGFR < 30 mL/min & elevated lactate) and use inpatient insulin',
        actionType: 'contraindicated',
        isCorrect: true,
        rationale:
          'Correct. Metformin is contraindicated at eGFR < 30 mL/min/1.73m² and during acute sepsis/tissue hypoperfusion due to fatal metformin-associated lactic acidosis (MALA). Hold metformin and manage inpatient glycemia with insulin.',
      },
      {
        id: 'reduce_500_daily',
        label: 'Reduce metformin to 500 mg daily for eGFR 24 mL/min',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'Dose reduction applies only if already stabilized at eGFR 30–45 mL/min; below 30 mL/min (and with rising lactate), metformin must be stopped.',
      },
      {
        id: 'approve_er',
        label: 'Approve Metformin ER because extended-release avoids renal clearance',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Extended-release formulation slows GI absorption but the absorbed drug is still 100% renally excreted unchanged.',
      },
      {
        id: 'add_glyburide',
        label: 'Switch to glyburide 5 mg PO BID',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'Glyburide has active renally cleared metabolites causing severe prolonged hypoglycemia in renal impairment.',
      },
    ],
    clinicalReference:
      'FDA Metformin Labeling & ADA Hospital Glycemic Standards: Contraindicated at eGFR < 30 mL/min/1.73m² or hypoxic/septic states.',
  },
  {
    id: 'saf_safe_apixaban_abc',
    category: 'safe_verify',
    specialty: 'cardiorenal',
    title: 'DOAC Renal & ABC Dose-Reduction Check',
    patientSummary: '67F · Nonvalvular Atrial Fibrillation (CHA2DS2-VASc 4)',
    creatinineClearanceNote: 'Age 67 yr · Weight 72 kg · SCr 1.1 mg/dL · CrCl 58 mL/min',
    labs: [
      { label: 'SCr', value: '1.1 mg/dL', flag: 'normal' },
      { label: 'Weight', value: '72 kg', flag: 'normal' },
      { label: 'CrCl', value: '58 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Metoprolol succinate 50 mg daily', 'Atorvastatin 20 mg daily'],
    pendingOrder: 'Apixaban 5 mg PO BID for stroke prevention',
    promptQuestion:
      'Apply the apixaban ABC dose-reduction criteria to verify whether 5 mg BID is safe.',
    crclHint:
      'Apixaban drops to 2.5 mg BID ONLY when >= 2 of: Age >= 80, Body weight <= 60 kg, SCr >= 1.5 mg/dL.',
    options: [
      {
        id: 'approve_5mg',
        label: 'Approve Apixaban 5 mg PO BID as written (0 of 3 reduction criteria met)',
        actionType: 'approve',
        isCorrect: true,
        rationale:
          'Correct! She meets 0 of the 3 ABC criteria (Age < 80, Weight > 60 kg, SCr < 1.5 mg/dL). Unwarranted dose reduction to 2.5 mg BID significantly increases ischemic stroke risk without reducing bleeding.',
      },
      {
        id: 'reduce_2_5mg',
        label: 'Reduce to Apixaban 2.5 mg BID because CrCl is < 60 mL/min',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'CrCl 58 mL/min does not qualify for apixaban dose reduction; inappropriate underdosing leaves AFib patients underprotected from stroke.',
      },
      {
        id: 'switch_warfarin',
        label: 'Reject DOAC and switch to warfarin because CrCl < 60 mL/min',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'Apixaban is preferred over warfarin in nonvalvular AFib across moderate CKD.',
      },
      {
        id: 'give_once_daily',
        label: 'Change frequency to Apixaban 5 mg once daily',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'Apixaban requires twice-daily dosing in AFib due to its ~12-hour half-life.',
      },
    ],
    clinicalReference:
      'ARISTOTLE Trial / FDA Apixaban Labeling: Reduce to 2.5 mg BID only with >= 2 of Age >= 80, Weight <= 60 kg, or SCr >= 1.5 mg/dL.',
  },
  {
    id: 'saf_renal_cefepime_neuro',
    category: 'renal_dosing',
    specialty: 'infectious',
    title: 'Unadjusted Beta-Lactam in Acute Kidney Injury',
    patientSummary: '79M · Hospital-acquired pneumonia · New AKI',
    creatinineClearanceNote: 'Cockcroft-Gault CrCl: 19 mL/min (up from SCr 1.0 to 2.9 mg/dL)',
    labs: [
      { label: 'CrCl', value: '19 mL/min', flag: 'low' },
      { label: 'SCr', value: '2.9 mg/dL', flag: 'high' },
      { label: 'WBC', value: '14.8k', flag: 'high' },
    ],
    activeMeds: ['Vancomycin (pharmacy-to-dose)', 'Acetaminophen 650 mg PO q6h PRN'],
    pendingOrder: 'Cefepime 2 g IV q8h (Pseudomonal pneumonia dose)',
    promptQuestion:
      'What adjustment is critical before verifying Cefepime 2 g IV q8h at CrCl 19 mL/min?',
    crclHint:
      'Cefepime crosses the blood-brain barrier and causes GABA-A antagonism (myoclonus, encephalopathy, nonconvulsive status epilepticus) if unadjusted in CKD/AKI.',
    options: [
      {
        id: 'adjust_cefepime',
        label: 'Renally adjust Cefepime (e.g., 2 g q24h or 1 g q24h per CrCl 11–29 table) to prevent neurotoxicity',
        actionType: 'adjust',
        isCorrect: true,
        rationale:
          'Correct. Cefepime is >85% renally cleared. Giving 2 g q8h at CrCl 19 mL/min rapidly triggers cefepime neurotoxicity (myoclonus, confusion, seizures); extend interval to q24h per renal dosing guidelines.',
      },
      {
        id: 'approve_2g_q8h',
        label: 'Approve 2 g IV q8h because beta-lactams have zero CNS toxicity',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Cefepime is notorious for dose-dependent encephalopathy and nonconvulsive status epilepticus in elderly patients with AKI.',
      },
      {
        id: 'switch_nitrofurantoin',
        label: 'Switch to oral nitrofurantoin 100 mg BID',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'Nitrofurantoin has poor lung penetration (urinary tract only) and is ineffective/neurotoxic at CrCl < 30 mL/min.',
      },
      {
        id: 'hold_48h',
        label: 'Hold all antibiotics for 48 hours until SCr normalizes',
        actionType: 'contraindicated',
        isCorrect: false,
        rationale:
          'Withholding anti-pseudomonal coverage in hospital-acquired pneumonia risks septic shock; give full first loading dose then renally adjusted maintenance.',
      },
    ],
    clinicalReference:
      'FDA Cefepime Safety Warning & IDSA HAP/VAP Guidance: Renally adjust maintenance regimen below CrCl 60 mL/min to avoid neurotoxicity.',
  },
  {
    id: 'saf_cyp_linezolid_ssri',
    category: 'cyp450',
    specialty: 'cns',
    title: 'Weak MAOI Antibiotic + Serotonergic Antidepressant',
    patientSummary: '49F · MRSA diabetic foot infection + Major Depressive Disorder',
    creatinineClearanceNote: 'CrCl 84 mL/min · Baseline temp 37.1°C',
    labs: [
      { label: 'CrCl', value: '84 mL/min', flag: 'normal' },
      { label: 'Plt', value: '230k', flag: 'normal' },
      { label: 'Na+', value: '138 mEq/L', flag: 'normal' },
    ],
    activeMeds: ['Sertraline 100 mg PO daily', 'Metformin 500 mg BID'],
    pendingOrder: 'Linezolid 600 mg PO BID × 10 days',
    promptQuestion:
      'What safety warning must be flagged before verifying oral Linezolid with Sertraline?',
    crclHint:
      'Linezolid is a reversible, nonselective monoamine oxidase inhibitor (MAOI) that traps synaptic serotonin alongside SSRIs.',
    options: [
      {
        id: 'flag_serotonin_syndrome',
        label: 'Flag Serotonin Syndrome risk; recommend alternative anti-MRSA agent (e.g., doxycycline/TMP-SMX/vancomycin) or close monitoring if unavoidable',
        actionType: 'hold_switch',
        isCorrect: true,
        rationale:
          'Correct. Linezolid inhibits MAO-A/B and can precipitate severe serotonin syndrome (clonus, hyperreflexia, autonomic instability) when combined with SSRIs like sertraline. Prefer non-MAOI MRSA coverage when clinically feasible.',
      },
      {
        id: 'approve_no_counsel',
        label: 'Approve as written; oxazolidinones act only on bacterial ribosomes',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Linezolid carries an FDA warning for serious CNS toxicity/serotonin syndrome with SSRIs/SNRIs due to reversible MAO inhibition.',
      },
      {
        id: 'double_sertraline',
        label: 'Increase sertraline to 200 mg daily to offset antibiotic stress',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'Increasing sertraline worsens serotonergic excess and accelerates serotonin toxicity.',
      },
      {
        id: 'give_sumatriptan',
        label: 'Add sumatriptan PRN headache while on linezolid',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'Adding a triptan further stacks serotonergic stimulation on top of MAO inhibition.',
      },
    ],
    clinicalReference:
      'FDA Linezolid Drug Safety Communication: Avoid concurrent SSRIs/SNRIs unless benefits outweigh serotonin syndrome risk and daily monitoring is arranged.',
  },
  {
    id: 'saf_contraindication_pregnancy_losartan',
    category: 'contraindication',
    specialty: 'cardiorenal',
    title: 'Positive Pregnancy Test Before ARB Verification',
    patientSummary: '31F · Chronic hypertension · Just confirmed 10 weeks pregnant',
    creatinineClearanceNote: 'CrCl 105 mL/min · Urine hCG: Positive',
    labs: [
      { label: 'Urine hCG', value: 'Positive', flag: 'high' },
      { label: 'BP', value: '146/90 mmHg', flag: 'high' },
      { label: 'K+', value: '4.1 mEq/L', flag: 'normal' },
    ],
    activeMeds: ['Prenatal vitamin with folic acid daily'],
    pendingOrder: 'Losartan 50 mg PO daily for chronic hypertension',
    promptQuestion:
      'What action is required upon seeing the positive pregnancy test?',
    crclHint:
      'Fetal renal perfusion depends on angiotensin II; AT1 blockade causes fetal renal dysplasia, oligohydramnios, and demise.',
    options: [
      {
        id: 'reject_switch_labetalol',
        label: 'Contraindicated in pregnancy — Hold losartan and switch to pregnancy-safe labetalol or nifedipine ER',
        actionType: 'contraindicated',
        isCorrect: true,
        rationale:
          'Correct. ARBs and ACE inhibitors carry a Boxed Warning in pregnancy for fetal renal toxicity, oligohydramnios, and death. Switch immediately to first-line gestational antihypertensives (labetalol or nifedipine ER).',
      },
      {
        id: 'approve_trimester1',
        label: 'Approve through week 20 and discontinue later in pregnancy',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Guideline standard is to discontinue ACEi/ARBs immediately upon pregnancy confirmation and transition to safer therapy.',
      },
      {
        id: 'switch_lisinopril',
        label: 'Replace losartan with lisinopril 10 mg daily',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'ACE inhibitors carry the exact same fetal toxicity boxed warning as ARBs.',
      },
      {
        id: 'switch_spironolactone',
        label: 'Switch to spironolactone 50 mg daily',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'Spironolactone crosses the placenta and has anti-androgenic effects on male fetal development.',
      },
    ],
    clinicalReference:
      'ACOG Hypertension in Pregnancy Guidelines & FDA Boxed Warning: Discontinue RAAS blockers immediately; use labetalol or extended-release nifedipine.',
  },
  {
    id: 'saf_qtc_amiodarone_azithro',
    category: 'qtc_risk',
    specialty: 'infectious',
    title: 'Class III Antiarrhythmic + Macrolide QT Stacking',
    patientSummary: '74M · Atrial fibrillation + acute bronchitis',
    creatinineClearanceNote: 'QTc 496 ms · CrCl 52 mL/min',
    labs: [
      { label: 'QTc', value: '496 ms', flag: 'high' },
      { label: 'K+', value: '4.1 mEq/L', flag: 'normal' },
      { label: 'CrCl', value: '52 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Amiodarone 200 mg PO daily', 'Apixaban 5 mg PO BID'],
    pendingOrder: 'Azithromycin 500 mg day 1, then 250 mg daily × 4 days',
    promptQuestion:
      'Should Azithromycin be dispensed with chronic Amiodarone at QTc 496 ms?',
    crclHint:
      'Azithromycin and fluoroquinolones both add hERG QTc prolongation atop amiodarone; acute uncomplicated bronchitis is usually viral or treatable with doxycycline if bacterial.',
    options: [
      {
        id: 'hold_suggest_alt',
        label: 'Hold azithromycin due to QTc 496 ms + amiodarone stacking; recommend non-QT alternative (e.g., doxycycline) if antibiotic indicated',
        actionType: 'hold_switch',
        isCorrect: true,
        rationale:
          'Correct. Combining azithromycin with amiodarone when baseline QTc is nearly 500 ms elevates Torsades de Pointes risk. Clarify indication and switch to a non-QT agent like doxycycline if antibacterial therapy is truly needed.',
      },
      {
        id: 'approve_short_course',
        label: 'Approve because a 5-day Z-Pak is too short to affect cardiac conduction',
        actionType: 'approve',
        isCorrect: false,
        rationale:
          'Azithromycin achieves high myocardial tissue concentrations within days and carries an FDA warning for fatal ventricular arrhythmias in QTc-prolonged patients.',
      },
      {
        id: 'hold_amiodarone',
        label: 'Stop amiodarone for 5 days while taking azithromycin',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'Amiodarone has a half-life of 40–55 days, so holding it for 5 days does NOT remove drug or QTc prolongation.',
      },
      {
        id: 'switch_levofloxacin',
        label: 'Switch azithromycin to levofloxacin 750 mg daily',
        actionType: 'hold_switch',
        isCorrect: false,
        rationale:
          'Levofloxacin also prolongs QTc and fails to eliminate the arrhythmia risk.',
      },
    ],
    clinicalReference:
      'FDA Azithromycin Safety Warning: Avoid macrolides/fluoroquinolones in patients taking Class IA/III antiarrhythmics (amiodarone, sotalol, dofetilide).',
  },
  {
    id: 'saf_safe_vanco_stewardship',
    category: 'safe_verify',
    specialty: 'infectious',
    title: 'Loading Dose in Septic Shock Despite Baseline CKD',
    patientSummary: '65M · Septic shock with suspected MRSA bacteremia · Weight 80 kg',
    creatinineClearanceNote: 'CrCl 28 mL/min · Initial loading dose ordered',
    labs: [
      { label: 'CrCl', value: '28 mL/min', flag: 'low' },
      { label: 'Lactate', value: '4.2 mmol/L', flag: 'high' },
      { label: 'WBC', value: '19.4k', flag: 'high' },
    ],
    activeMeds: ['Norepinephrine infusion', 'Cefepime 2 g IV × 1 loading dose'],
    pendingOrder: 'Vancomycin 2,000 mg (25 mg/kg) IV × 1 Loading Dose now, then pharmacy renal AUC follow-up',
    promptQuestion:
      'Evaluate whether this 25 mg/kg single loading dose is appropriate despite CrCl 28 mL/min.',
    crclHint:
      'Loading doses fill volume of distribution (Vd), which is EXPANDED in septic shock; only subsequent maintenance intervals/doses are reduced for CrCl.',
    options: [
      {
        id: 'approve_load',
        label: 'Approve 2,000 mg (25 mg/kg) single loading dose now; adjust ONLY maintenance interval for CrCl 28 mL/min',
        actionType: 'approve',
        isCorrect: true,
        rationale:
          'Correct! Loading doses depend on volume of distribution (Vd), NOT renal clearance. Reducing a septic shock loading dose for CKD delays therapeutic MRSA concentrations and worsens mortality; renal adjustment applies to maintenance dosing.',
      },
      {
        id: 'halve_loading',
        label: 'Reduce loading dose by 50% to 1,000 mg because CrCl is < 30 mL/min',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'Cutting the initial loading dose leaves serum concentrations subtherapeutic for hours during septic shock.',
      },
      {
        id: 'reject_vanco',
        label: 'Reject vancomycin completely and delay therapy until nephrology clears it',
        actionType: 'contraindicated',
        isCorrect: false,
        rationale:
          'Delaying empiric MRSA coverage in septic shock rapidly increases mortality.',
      },
      {
        id: 'repeat_q8h',
        label: 'Approve 2,000 mg loading dose and auto-schedule 1,500 mg q8h maintenance',
        actionType: 'adjust',
        isCorrect: false,
        rationale:
          'Maintenance q8h dosing at CrCl 28 mL/min will accumulate rapidly and cause nephrotoxicity; maintenance must be extended/AUC-guided.',
      },
    ],
    clinicalReference:
      'ASHP/IDSA Vancomycin Therapeutic Monitoring Guideline: Administer 20–35 mg/kg loading dose regardless of renal function in critically ill patients; adjust maintenance dosing via AUC/MIC.',
  },
];
