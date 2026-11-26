import { ClinicalCase } from '../types/pharma';
import { SYSTEM_EXPANSION_CASES } from './systemCases';

export const CLINICAL_CASES: ClinicalCase[] = [
  // ================= CARDIORENAL (6 CASES) =================
  {
    id: 'cr_01_bradykinin_cough',
    specialty: 'cardiorenal',
    mechanic: 'prescribe_screen',
    difficulty: 'Foundational',
    title: 'Dry Cough on Diabetic Nephropathy Therapy',
    patientLine: '58M · Type 2 Diabetes, HTN, Albuminuria',
    presentation:
      'Presents with a persistent, nonproductive hacking cough for 6 weeks after starting lisinopril. Urine ACR remains elevated (180 mg/g).',
    labs: [
      { label: 'BP', value: '144/86 mmHg', flag: 'high' },
      { label: 'K+', value: '4.3 mEq/L', flag: 'normal' },
      { label: 'eGFR', value: '64 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Lisinopril 20 mg daily (to discontinue)', 'Metformin 1000 mg BID'],
    targetCue: 'Preserve Renal Protection · Eliminate Bradykinin Accumulation',
    promptQuestion: 'Which switch maintains efferent arteriolar protection while resolving the cough?',
    cardIds: ['losartan', 'amlodipine', 'hydrochlorothiazide', 'spironolactone'],
    correctDrugId: 'losartan',
    distractorRationales: {
      amlodipine:
        'Amlodipine lowers blood pressure but dilates the afferent arteriole without lowering intraglomerular pressure or albuminuria like a RAAS blocker.',
      hydrochlorothiazide:
        'Thiazide diuretics do not provide direct RAAS-mediated antiproteinuric protection in diabetic nephropathy.',
      spironolactone:
        'MRAs are not first-line replacement for ACEi cough in uncomplicated diabetic HTN and carry higher hyperkalemia/gynecomastia burden.',
    },
    clinicalPearl:
      'ARBs (losartan) block the AT1 receptor directly without inhibiting ACE (kininase II), preserving bradykinin breakdown and resolving ACEi-induced dry cough while keeping nephroprotection.',
    hints: [
      'Target the renin-angiotensin-aldosterone system downstream of ACE.',
      'Angiotensin II receptor blockade spares kininase II, preventing bradykinin buildup in the airways.',
      'Eliminating non-RAAS vasodilators and mineralocorticoids narrows the choice.',
    ],
  },
  {
    id: 'cr_02_nkcc2_overload',
    specialty: 'cardiorenal',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Acute Decompensated Volume Overload in CKD',
    patientLine: '71F · HFrEF (EF 30%), Stage 4 CKD',
    presentation:
      'Admitted with orthopnea, bibasilar crackles, and 3+ pitting edema. Needs rapid diuresis despite severely reduced glomerular filtration.',
    labs: [
      { label: 'eGFR', value: '22 mL/min', flag: 'low' },
      { label: 'K+', value: '4.6 mEq/L', flag: 'normal' },
      { label: 'BNP', value: '1,420 pg/mL', flag: 'high' },
    ],
    activeMeds: ['Carvedilol 12.5 mg BID', 'Sacubitril-Valsartan 24/26 mg BID'],
    targetCue: 'Target Transporter: NKCC2 · Thick Ascending Limb of Henle',
    promptQuestion: 'Play the agent that locks onto NKCC2 and remains effective at eGFR 22 mL/min.',
    cardIds: ['furosemide', 'hydrochlorothiazide', 'spironolactone', 'empagliflozin'],
    correctDrugId: 'furosemide',
    distractorRationales: {
      hydrochlorothiazide:
        'Thiazides inhibit NCC in the distal tubule and lose monotherapeutic efficacy when eGFR falls below 30 mL/min.',
      spironolactone:
        'Spironolactone acts weakly on collecting-duct aldosterone receptors and is contraindicated for initiation at eGFR < 30 mL/min due to hyperkalemia.',
      empagliflozin:
        'SGLT2 inhibitors offer chronic cardiorenal protection but do not provide rapid loop-level decongestion in acute pulmonary edema.',
    },
    clinicalPearl:
      'Loop diuretics (furosemide) inhibit the Na+-K+-2Cl- cotransporter (NKCC2) in the thick ascending limb—delivering up to 20–25% filtered Na+ excretion and retaining efficacy even in Stage 4 CKD.',
    hints: [
      'Look for the diuretic active in the thick ascending limb of the loop of Henle.',
      'Thiazides fail below eGFR 30 mL/min; only one drug class here drives vigorous acute decongestion.',
      'Focus on the two classic diuretics remaining—one acts at NKCC2, the other at NCC.',
    ],
  },
  {
    id: 'cr_03_hfref_beta',
    specialty: 'cardiorenal',
    mechanic: 'prescribe_screen',
    difficulty: 'Foundational',
    title: 'Guideline-Directed Beta-Blockade in HFrEF',
    patientLine: '63M · Newly Diagnosed HFrEF (EF 28%), Sinus Rhythm',
    presentation:
      'Euvolemic after initial diuresis and stabilized on losartan. Ready to initiate a beta-blocker proven to reduce HFrEF mortality.',
    labs: [
      { label: 'HR', value: '82 bpm', flag: 'normal' },
      { label: 'BP', value: '126/78 mmHg', flag: 'normal' },
      { label: 'LVEF', value: '28%', flag: 'low' },
    ],
    activeMeds: ['Losartan 50 mg daily', 'Furosemide 20 mg daily', 'Empagliflozin 10 mg daily'],
    targetCue: 'Proven HFrEF Mortality Reduction · Cardioselective Beta-1 Blockade',
    promptQuestion: 'Which agent is guideline-recommended for chronic HFrEF mortality reduction?',
    cardIds: ['metoprolol_succinate', 'amiodarone', 'amlodipine', 'digoxin'],
    correctDrugId: 'metoprolol_succinate',
    distractorRationales: {
      amiodarone:
        'Amiodarone is a Class III antiarrhythmic reserved for refractory arrhythmias, not routine HFrEF mortality reduction, and carries multi-organ toxicity.',
      amlodipine:
        'Amlodipine is safe for comorbid angina/HTN in HFrEF but confers zero mortality benefit.',
      digoxin:
        'Digoxin reduces HFrEF hospitalizations but does NOT reduce all-cause mortality and is not first-line over GDMT.',
    },
    clinicalPearl:
      'Only three beta-blockers have proven survival benefit in HFrEF: metoprolol succinate (XL), carvedilol, and bisoprolol. Short-acting metoprolol tartrate does NOT carry the same survival evidence.',
    hints: [
      'Select an evidence-based Guideline-Directed Medical Therapy (GDMT) beta-blocker.',
      'Only three beta-blockers—bisoprolol, carvedilol, and one extended-release cardioselective agent—reduce HFrEF mortality.',
      'Narrows down between neurohormonal blockade and symptomatic inotropy/vasodilation.',
    ],
  },
  {
    id: 'cr_04_doac_abc',
    specialty: 'cardiorenal',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Nonvalvular AFib Anticoagulation in CKD',
    patientLine: '76F · Nonvalvular Atrial Fibrillation, Stage 3b CKD',
    presentation:
      'CHA2DS2-VASc score is 4. Needs oral stroke prophylaxis with minimal renal clearance and no routine dietary vitamin K restrictions.',
    labs: [
      { label: 'eGFR', value: '36 mL/min', flag: 'low' },
      { label: 'SCr', value: '1.6 mg/dL', flag: 'high' },
      { label: 'Weight', value: '68 kg', flag: 'normal' },
    ],
    activeMeds: ['Metoprolol Succinate 50 mg daily', 'Atorvastatin 20 mg daily'],
    targetCue: 'Direct Factor Xa Inhibition · Minimal Renal Excretion (27%)',
    promptQuestion: 'Choose the optimal oral anticoagulant for this patient profile.',
    cardIds: ['apixaban', 'warfarin', 'spironolactone', 'atorvastatin'],
    correctDrugId: 'apixaban',
    distractorRationales: {
      warfarin:
        'Warfarin requires frequent INR monitoring and carries high bleeding variability with diet/CYP2C9 interactions; DOACs are preferred over warfarin in nonvalvular AFib.',
      spironolactone:
        'Spironolactone is a diuretic/MRA with no anticoagulant activity for thromboembolic stroke prevention.',
      atorvastatin:
        'The patient is already on atorvastatin; statins reduce atherosclerotic risk, not cardioembolic AFib stroke.',
    },
    clinicalPearl:
      'Apixaban has the lowest renal elimination (~27%) among DOACs. Watch the ABC dose-reduction rule: she only meets 1 criterion (SCr >= 1.5), not >= 2 (Age >= 80, Weight <= 60 kg, SCr >= 1.5), so she receives full-dose 5 mg BID.',
    hints: [
      'Direct oral anticoagulants (DOACs) are first-line over VKAs in nonvalvular atrial fibrillation.',
      'Look for the direct Factor Xa inhibitor favored in CKD due to 27% renal clearance.',
      'Compare the two anticoagulants on the table.',
    ],
  },
  {
    id: 'cr_05_vkor_lock',
    specialty: 'cardiorenal',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Mechanical Mitral Valve Thromboprophylaxis',
    patientLine: '52M · Mechanical Mitral Valve Replacement',
    presentation:
      'Post-operative day 3 after mechanical mitral valve surgery. Direct oral anticoagulants are strictly contraindicated due to valve thrombosis risk.',
    labs: [
      { label: 'Target INR', value: '2.5–3.5', flag: 'normal' },
      { label: 'Platelets', value: '240 K/uL', flag: 'normal' },
      { label: 'eGFR', value: '82 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Heparin IV bridge', 'Aspirin 81 mg daily'],
    targetCue: 'Target Enzyme: Vitamin K Epoxide Reductase (VKOR)',
    promptQuestion: 'Play the anticoagulant that inhibits VKOR and is mandatory for mechanical valves.',
    cardIds: ['warfarin', 'apixaban', 'protamine', 'losartan'],
    correctDrugId: 'warfarin',
    distractorRationales: {
      apixaban:
        'DOACs (apixaban, rivaroxaban, dabigatran) are contraindicated in mechanical heart valves due to higher rates of valve thrombosis and stroke.',
      protamine:
        'Protamine reverses unfractionated heparin—it does not provide chronic oral anticoagulation.',
      losartan:
        'Losartan is an ARB with no effect on the coagulation cascade.',
    },
    clinicalPearl:
      'Warfarin remains the sole oral anticoagulant approved for mechanical heart valves, inhibiting VKOR to block gamma-carboxylation of Factors II, VII, IX, and X (and Proteins C & S).',
    hints: [
      'Mechanical valves require vitamin K antagonism rather than direct Factor Xa inhibition.',
      'This oral agent requires bridging with heparin until INR reaches target (2.5–3.5 for mechanical mitral valves).',
      'Choose between the two oral anticoagulants.',
    ],
  },
  {
    id: 'cr_06_digoxin_hypok',
    specialty: 'cardiorenal',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Visual Halos & Nausea on Chronic Rate Control',
    patientLine: '79F · HFrEF & AFib · Acute Dehydration',
    presentation:
      'Presents with anorexia, nausea, yellow-green visual halos, and frequent PVCs after starting high-dose furosemide without potassium supplementation.',
    labs: [
      { label: 'K+', value: '2.9 mEq/L', flag: 'low' },
      { label: 'Digoxin', value: '2.8 ng/mL', flag: 'high' },
      { label: 'SCr', value: '1.9 mg/dL', flag: 'high' },
    ],
    activeMeds: ['Digoxin 0.25 mg daily', 'Furosemide 80 mg BID'],
    targetCue: 'Identify the Offending Cardiac Glycoside · Na+/K+-ATPase Toxicity',
    promptQuestion: 'Which medication in her regimen directly caused this xanthopsia and arrhythmia?',
    cardIds: ['digoxin', 'amiodarone', 'spironolactone', 'metoprolol_succinate'],
    correctDrugId: 'digoxin',
    distractorRationales: {
      amiodarone:
        'Amiodarone causes corneal microdeposits and blue-gray skin, not acute yellow-green xanthopsia triggered by hypokalemia (though it raises digoxin levels if co-prescribed).',
      spironolactone:
        'Spironolactone retains potassium rather than depleting it, and does not cause xanthopsia.',
      metoprolol_succinate:
        'Beta-blockers cause bradycardia or fatigue, not yellow-green visual halos or Na+/K+-ATPase toxicity.',
    },
    clinicalPearl:
      'Hypokalemia (K+ 2.9) from loop diuretics accelerates digoxin toxicity because K+ and digoxin compete for the extracellular binding site on myocardial Na+/K+-ATPase. Replete K+/Mg2+ and use Digoxin Immune Fab for severe arrhythmia.',
    hints: [
      'Xanthopsia (yellow-green halos) is a classic toxidrome clue.',
      'Hypokalemia removes competitive inhibition at the Na+/K+-ATPase pump.',
      'Focus on the agents directly affecting cardiac ion pumps.',
    ],
  },

  // ================= INFECTIOUS DISEASE (6 CASES) =================
  {
    id: 'id_01_mrsa_cellwall',
    specialty: 'infectious',
    mechanic: 'receptor_lock',
    difficulty: 'Foundational',
    title: 'MRSA Bacteremia Empiric Wall Blockade',
    patientLine: '54M · Febrile Line-Associated Bacteremia',
    presentation:
      'Blood cultures grow Gram-positive cocci in clusters (MRSA suspected). Requires IV bactericidal therapy targeting cell-wall precursors.',
    labs: [
      { label: 'WBC', value: '18.4 K/uL', flag: 'high' },
      { label: 'SCr', value: '1.0 mg/dL', flag: 'normal' },
      { label: 'Temp', value: '39.1 °C', flag: 'high' },
    ],
    activeMeds: ['Normal saline IV'],
    targetCue: 'Target Structure: D-Ala-D-Ala Peptidoglycan Terminus',
    promptQuestion: 'Play the IV glycopeptide that binds D-Ala-D-Ala to defeat MRSA.',
    cardIds: ['vancomycin', 'ceftriaxone', 'amox_clav', 'azithromycin'],
    correctDrugId: 'vancomycin',
    distractorRationales: {
      ceftriaxone:
        'Ceftriaxone (3rd-gen cephalosporin) lacks affinity for PBP2a and has NO activity against MRSA.',
      amox_clav:
        'Amoxicillin-clavulanate covers MSSA, not MRSA, because MRSA resistance is mediated by altered PBP2a rather than beta-lactamase.',
      azithromycin:
        'Azithromycin is bacteriostatic against atypicals and has high MRSA resistance; it is never appropriate for MRSA bacteremia.',
    },
    clinicalPearl:
      'IV vancomycin targets AUC/MIC 400–600 mg·h/L for invasive MRSA. Remember: oral vancomycin is NEVER absorbed systemically—it stays in the gut lumen solely for Clostridioides difficile infection.',
    hints: [
      'MRSA carries the mecA gene (altered PBP2a), rendering standard beta-lactams ineffective.',
      'Look for the IV glycopeptide that binds D-alanyl-D-alanine rather than PBPs.',
      'Narrowed to the two IV bactericidal antibiotics.',
    ],
  },
  {
    id: 'id_02_warfarin_tmp',
    specialty: 'infectious',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Sudden INR Spike During UTI Treatment',
    patientLine: '69F · Warfarin for Mechanical Valve + New Cystitis',
    presentation:
      'Stable INR (2.7) for 2 years until starting a 3-day UTI antibiotic. Returns with epistaxis and ecchymoses; INR is dangerously elevated.',
    labs: [
      { label: 'INR', value: '6.4', flag: 'high' },
      { label: 'K+', value: '5.3 mEq/L', flag: 'high' },
      { label: 'eGFR', value: '58 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Warfarin 5 mg daily', 'Recent 3-day UTI antibiotic'],
    targetCue: 'Identify the CYP2C9 Inhibitor & ENaC-Blocking Offender',
    promptQuestion: 'Which antimicrobial triggered BOTH the INR spike and mild hyperkalemia?',
    cardIds: ['tmp_smx', 'nitrofurantoin', 'amox_clav', 'doxycycline'],
    correctDrugId: 'tmp_smx',
    distractorRationales: {
      nitrofurantoin:
        'Nitrofurantoin has minimal CYP2C9 interaction with warfarin and does not block collecting-duct ENaC to elevate serum potassium.',
      amox_clav:
        'Amoxicillin-clavulanate can mildly nudge INR via gut flora shifts but does not potently inhibit CYP2C9 or elevate K+.',
      doxycycline:
        'Doxycycline is not first-line for uncomplicated cystitis and does not cause ENaC-mediated hyperkalemia.',
    },
    clinicalPearl:
      'Sulfamethoxazole potently inhibits CYP2C9 (blocking clearance of active S-warfarin) AND displaces warfarin from albumin, while trimethoprim blocks renal ENaC (raising K+). Nitrofurantoin is much safer with warfarin!',
    hints: [
      'Look for a sequential folate pathway inhibitor with a sulfa component.',
      'One component inhibits CYP2C9 (spiking S-warfarin); the other acts like amiloride in the collecting duct.',
      'Compare the two standard uncomplicated cystitis drugs.',
    ],
  },
  {
    id: 'id_03_pseudomonas_po',
    specialty: 'infectious',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'Oral Step-Down for Pseudomonas UTI',
    patientLine: '62M · Complicated Catheter-Associated UTI',
    presentation:
      'Urine culture grows Pseudomonas aeruginosa susceptible to fluoroquinolones. Ready for oral outpatient completion.',
    labs: [
      { label: 'CrCl', value: '70 mL/min', flag: 'normal' },
      { label: 'Culture', value: 'P. aeruginosa', flag: 'high' },
      { label: 'Temp', value: '36.9 °C', flag: 'normal' },
    ],
    activeMeds: ['Calcium carbonate 500 mg TID (counsel to separate!)'],
    targetCue: 'Oral Antipseudomonal Coverage · DNA Gyrase Inhibition',
    promptQuestion: 'Which oral agent reliably covers Pseudomonas aeruginosa in the urinary tract?',
    cardIds: ['ciprofloxacin', 'ceftriaxone', 'nitrofurantoin', 'doxycycline'],
    correctDrugId: 'ciprofloxacin',
    distractorRationales: {
      ceftriaxone:
        'Ceftriaxone is IV/IM only and—unlike ceftazidime or cefepime—has NO activity against Pseudomonas aeruginosa.',
      nitrofurantoin:
        'Pseudomonas is intrinsically resistant to nitrofurantoin, and nitrofurantoin cannot treat complicated/upper urinary infections.',
      doxycycline:
        'Doxycycline lacks antipseudomonal activity and achieves poor urinary tract concentrations.',
    },
    clinicalPearl:
      'Ciprofloxacin (and levofloxacin) are the ONLY oral antibiotics with reliable Pseudomonas coverage. Always counsel patients to separate oral fluoroquinolones from Ca2+, Mg2+, Al3+, Fe2+, or Zn2+ supplements by 2–6 hours to prevent chelation failure.',
    hints: [
      'Only one oral antibiotic class covers Pseudomonas aeruginosa.',
      'This agent inhibits bacterial DNA gyrase and requires spacing from polyvalent cations like calcium.',
      'Choose between the urinary agents—only one is a fluoroquinolone.',
    ],
  },
  {
    id: 'id_04_pregnancy_uti',
    specialty: 'infectious',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Asymptomatic Bacteriuria in Second Trimester',
    patientLine: '28F · 22 Weeks Gestation · E. coli Bacteriuria',
    presentation:
      'Routine prenatal screening reveals > 100,000 CFU/mL pansensitive E. coli. Needs safe oral therapy avoiding fetal tooth/cartilage/folate harm.',
    labs: [
      { label: 'Gestation', value: '22 weeks', flag: 'normal' },
      { label: 'eGFR', value: '115 mL/min', flag: 'normal' },
      { label: 'Allergies', value: 'NKDA', flag: 'normal' },
    ],
    activeMeds: ['Prenatal multivitamin with iron'],
    targetCue: 'Pregnancy-Safe Oral Beta-Lactam · Normal Renal Function',
    promptQuestion: 'Which antibiotic is safest and most appropriate at 22 weeks gestation?',
    cardIds: ['amox_clav', 'doxycycline', 'ciprofloxacin', 'tmp_smx'],
    correctDrugId: 'amox_clav',
    distractorRationales: {
      doxycycline:
        'Tetracyclines cross the placenta, chelate fetal calcium, and cause permanent tooth discoloration and skeletal growth inhibition.',
      ciprofloxacin:
        'Fluoroquinolones are generally avoided in pregnancy due to arthropathy/cartilage toxicity observed in juvenile animal models.',
      tmp_smx:
        'TMP-SMX is a folate antagonist (teratogenic risk) and sulfonamides risk neonatal kernicterus near term—aminopenicillins are preferred.',
    },
    clinicalPearl:
      'Beta-lactams (amoxicillin, amoxicillin-clavulanate, cephalexin) are the cornerstone of safe UTI therapy in pregnancy. Remember to avoid nitrofurantoin at term (38–42 weeks) due to neonatal hemolytic anemia risk.',
    hints: [
      'Screen out classes with teratogenic, cartilage, or fetal tooth-staining warnings.',
      'Aminopenicillins are Pregnancy Category B historically and widely preferred across trimesters.',
      'Compare the beta-lactam against the tetracycline and folate antagonist.',
    ],
  },
  {
    id: 'id_05_fungal_cyp51',
    specialty: 'infectious',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Cryptococcal Meningitis Consolidation Therapy',
    patientLine: '41M · Post-Induction Cryptococcal Meningitis',
    presentation:
      'Completed 2 weeks of liposomal amphotericin B + flucytosine. Needs an oral azole with high CSF penetration for consolidation.',
    labs: [
      { label: 'CSF CrAg', value: 'Positive', flag: 'high' },
      { label: 'CrCl', value: '68 mL/min', flag: 'normal' },
      { label: 'AST/ALT', value: '28/31 U/L', flag: 'normal' },
    ],
    activeMeds: ['Antiretroviral therapy'],
    targetCue: 'Target Enzyme: Fungal Lanosterol 14-alpha-Demethylase (CYP51)',
    promptQuestion: 'Play the triazole antifungal with superior CSF and urinary penetration.',
    cardIds: ['fluconazole', 'acyclovir', 'azithromycin', 'vancomycin'],
    correctDrugId: 'fluconazole',
    distractorRationales: {
      acyclovir:
        'Acyclovir targets viral DNA polymerase for HSV/VZV encephalitis, not fungal Cryptococcus neoformans.',
      azithromycin:
        'Azithromycin inhibits bacterial 50S ribosomes and has no antifungal activity.',
      vancomycin:
        'Vancomycin targets Gram-positive bacterial peptidoglycan and has poor CSF penetration without inflammation and zero fungal activity.',
    },
    clinicalPearl:
      'Fluconazole achieves ~70–80% CSF-to-serum concentrations and > 90% oral bioavailability. Remember its human CYP profile: strong CYP2C9/2C19 inhibitor and moderate CYP3A4 inhibitor.',
    hints: [
      'Only one agent on the table inhibits ergosterol synthesis.',
      'Triazoles block fungal CYP51 (14-alpha-demethylase), depleting membrane ergosterol.',
      'Distinguish the antifungal from antiviral and antibacterial options.',
    ],
  },
  {
    id: 'id_06_acyclovir_crystal',
    specialty: 'infectious',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Acute Oliguria During HSV Encephalitis Therapy',
    patientLine: '47F · HSV-1 Encephalitis · Day 3 High-Dose IV Antiviral',
    presentation:
      'Serum creatinine doubled overnight with needle-shaped birefringent crystals seen on urine microscopy after missed IV fluid boluses.',
    labs: [
      { label: 'SCr', value: '2.5 mg/dL', flag: 'high' },
      { label: 'Urine', value: 'Needle crystals', flag: 'high' },
      { label: 'Temp', value: '37.4 °C', flag: 'normal' },
    ],
    activeMeds: ['High-dose IV antiviral q8h', 'Acetaminophen PRN'],
    targetCue: 'Identify the Tubule-Precipitating Antiviral · Crystalline Nephropathy',
    promptQuestion: 'Which drug precipitated in the renal tubules due to inadequate IV hydration?',
    cardIds: ['acyclovir', 'ceftriaxone', 'doxycycline', 'fluconazole'],
    correctDrugId: 'acyclovir',
    distractorRationales: {
      ceftriaxone:
        'Ceftriaxone can form biliary gallbladder sludge or precipitate with IV calcium in neonates, not needle-shaped urinary crystals in adults.',
      doxycycline:
        'Doxycycline is fecally eliminated and is notably safe in renal impairment.',
      fluconazole:
        'Fluconazole requires renal dose adjustment but does not cause obstructive intratubular crystal nephropathy.',
    },
    clinicalPearl:
      'IV acyclovir (10 mg/kg q8h for HSV encephalitis) has poor solubility in renal tubular fluid. Prevent crystalline nephropathy by infusing slowly over >= 1 hour and maintaining brisk IV hydration.',
    hints: [
      'Identify the antiviral that depends on viral thymidine kinase for activation.',
      'Rapid infusion without hydration causes intratubular needle-shaped crystal precipitation.',
      'Compare the antiviral with the hepatically/biliary cleared options.',
    ],
  },

  // ================= CNS, PAIN & PSYCHIATRY (6 CASES) =================
  {
    id: 'cns_01_lithium_nsaid',
    specialty: 'cns',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Coarse Tremor & Ataxia After Knee Pain OTC Use',
    patientLine: '49M · Bipolar I Disorder · Stable on Maintenance Therapy',
    presentation:
      'Presents with worsening coarse hand tremor, ataxia, dysarthria, and polyuria 5 days after starting daily OTC ibuprofen and HCTZ.',
    labs: [
      { label: 'Trough Level', value: '2.1 mEq/L', flag: 'high' },
      { label: 'TSH', value: '6.8 mIU/L', flag: 'high' },
      { label: 'SCr', value: '1.5 mg/dL', flag: 'high' },
    ],
    activeMeds: ['Maintenance mood stabilizer', 'Ibuprofen 600 mg TID', 'HCTZ 25 mg daily'],
    targetCue: 'Narrow Therapeutic Index Cation · Proximal Na+ Reabsorption Trap',
    promptQuestion: 'Which narrow-therapeutic-index drug accumulated due to NSAID + thiazide use?',
    cardIds: ['lithium', 'valproate', 'sertraline', 'carbamazepine'],
    correctDrugId: 'lithium',
    distractorRationales: {
      valproate:
        'Valproate is hepatically metabolized (therapeutic range 50–100 mcg/mL), not cleared renally like a monovalent cation, and does not cause nephrogenic DI.',
      sertraline:
        'Sertraline is hepatically cleared and has no serum mEq/L trough monitoring or thiazide-induced renal retention.',
      carbamazepine:
        'Carbamazepine induces CYP3A4 and causes SIADH (hyponatremia), not thiazide/NSAID-driven renal cation toxicity.',
    },
    clinicalPearl:
      'Thiazides and NSAIDs decrease renal lithium clearance by 25–60% because the proximal tubule reabsorbs Li+ alongside Na+ during volume contraction. Maintain hydration and avoid NSAIDs/thiazides.',
    hints: [
      'Look at the units: 2.1 mEq/L (normal trough 0.6–1.2 mEq/L) and elevated TSH.',
      'This agent is 0% protein-bound, 95% renally excreted unchanged, and handled like sodium.',
      'Compare the two mood stabilizers.',
    ],
  },
  {
    id: 'cns_02_clozapine_smoking',
    specialty: 'cns',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Treatment-Resistant Schizophrenia & Smoking Cessation',
    patientLine: '36M · Refractory Schizophrenia · Recently Quit 2-Pack/Day Smoking',
    presentation:
      'Previously stabilized after failing 3 antipsychotics. Two weeks after abruptly quitting cigarettes, develops marked sedation, hypersalivation, and tachycardia.',
    labs: [
      { label: 'ANC', value: '2,400 /uL', flag: 'normal' },
      { label: 'HR', value: '116 bpm', flag: 'high' },
      { label: 'Temp', value: '37.1 °C', flag: 'normal' },
    ],
    activeMeds: ['Nicotine patch 21 mg daily', 'Atypical antipsychotic (CYP1A2 substrate)'],
    targetCue: 'CYP1A2 Substrate · REMS ANC Monitoring · Sialorrhea',
    promptQuestion: 'Which antipsychotic surged in serum concentration after tobacco CYP1A2 induction wore off?',
    cardIds: ['clozapine', 'haloperidol', 'sertraline', 'diazepam'],
    correctDrugId: 'clozapine',
    distractorRationales: {
      haloperidol:
        'Haloperidol is a 1st-gen D2 antagonist cleared mainly via CYP3A4/2D6 and UGT; it does not require ANC REMS or cause classic nocturnal sialorrhea.',
      sertraline:
        'Sertraline is an SSRI metabolized by CYP2C19/3A4 and is not an antipsychotic for refractory schizophrenia.',
      diazepam:
        'Diazepam is metabolized via CYP2C19/3A4, not primarily CYP1A2, and does not carry ANC REMS monitoring.',
    },
    clinicalPearl:
      'Polycyclic aromatic hydrocarbons in tobacco smoke—NOT nicotine—potently induce CYP1A2. When a patient on clozapine (or olanzapine) quits smoking, CYP1A2 activity drops and clozapine levels can jump 50–70%!',
    hints: [
      'Think of the sole antipsychotic requiring mandatory ANC REMS monitoring.',
      'Tobacco smoke induces CYP1A2; stopping smoking de-induces CYP1A2 and spikes this drug.',
      'Distinguish the two antipsychotics on the table.',
    ],
  },
  {
    id: 'cns_03_opioid_rescue',
    specialty: 'cns',
    mechanic: 'antidote_triage',
    difficulty: 'Foundational',
    title: 'Acute Post-Op Respiratory Depression',
    patientLine: '64M · Pinpoint Pupils, Bradypnea After Morphine PCA',
    presentation:
      'Found somnolent with pinpoint miosis, cyanosis, and respiratory rate 5 breaths/min following accidental PCA bolus stacking.',
    labs: [
      { label: 'RR', value: '5 /min', flag: 'low' },
      { label: 'SpO2', value: '82%', flag: 'low' },
      { label: 'Pupils', value: '1 mm pinpoint', flag: 'low' },
    ],
    activeMeds: ['Morphine IV PCA'],
    targetCue: 'Deploy Competitive Mu-Opioid Antagonist Immediately',
    promptQuestion: 'Which rescue agent rapidly restores respiratory drive?',
    cardIds: ['naloxone', 'flumazenil', 'atropine', 'nac'],
    correctDrugId: 'naloxone',
    distractorRationales: {
      flumazenil:
        'Flumazenil antagonizes GABA-A benzodiazepine sites, NOT opioid receptors, and will not reverse morphine-induced apnea.',
      atropine:
        'Atropine blocks muscarinic acetylcholine receptors for bradycardia/organophosphates, not opioid respiratory depression.',
      nac:
        'N-acetylcysteine replenishes glutathione for acetaminophen toxicity, not acute mu-opioid arrest.',
    },
    clinicalPearl:
      'Naloxone reverses opioid respiratory depression within 2 minutes, but its 30–90 minute half-life is shorter than most opioids—monitor closely for recurrent respiratory depression (resedation)!',
    hints: [
      'Pinpoint pupils + bradypnea + somnolence = classic opioid toxidrome.',
      'Select the competitive mu-opioid receptor antagonist.',
      'Do not confuse the opioid antagonist with the benzodiazepine antagonist.',
    ],
  },
  {
    id: 'cns_04_gaba_frequency',
    specialty: 'cns',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Status Epilepticus Chloride Channel Modulation',
    patientLine: '29M · Generalized Tonic-Clonic Seizure > 6 Minutes',
    presentation:
      'Active generalized convulsive seizure in the emergency bay. Requires fast-acting lipophilic IV agent enhancing GABA-A chloride influx frequency.',
    labs: [
      { label: 'Glucose', value: '104 mg/dL', flag: 'normal' },
      { label: 'Na+', value: '139 mEq/L', flag: 'normal' },
      { label: 'LFTs', value: 'Normal', flag: 'normal' },
    ],
    activeMeds: ['None'],
    targetCue: 'Target Site: GABA-A Allosteric Site (Increases Cl- Channel Opening Frequency)',
    promptQuestion: 'Play the benzodiazepine that locks onto the GABA-A alpha-gamma site.',
    cardIds: ['diazepam', 'carbamazepine', 'levodopa_carbidopa', 'haloperidol'],
    correctDrugId: 'diazepam',
    distractorRationales: {
      carbamazepine:
        'Carbamazepine is a chronic oral Na+ channel blocker for focal seizures and cannot abort acute status epilepticus.',
      levodopa_carbidopa:
        'Levodopa-carbidopa replenishes CNS dopamine in Parkinson disease and has no role in status epilepticus.',
      haloperidol:
        'Haloperidol blocks D2 receptors and actually LOWERS the seizure threshold.',
    },
    clinicalPearl:
      'Benzodiazepines (diazepam, lorazepam, midazolam) increase the FREQUENCY of GABA-A chloride channel opening (mnemonic: "Frenzied frequency"), whereas barbiturates prolong opening DURATION.',
    hints: [
      'First-line emergency treatment for status epilepticus is an IV/IM benzodiazepine.',
      'Look for the lipophilic agent binding the GABA-A allosteric site.',
      'Eliminate oral maintenance and dopamine agents.',
    ],
  },
  {
    id: 'cns_05_morphine_ckd',
    specialty: 'cns',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'Post-MI Depression & Safe SSRI Selection',
    patientLine: '61F · Major Depressive Disorder · 4 Weeks Post-MI',
    presentation:
      'Experiencing persistent depressed mood and anhedonia after myocardial infarction. Needs an SSRI with minimal QTc prolongation and strong cardiac safety data.',
    labs: [
      { label: 'QTc', value: '448 ms', flag: 'normal' },
      { label: 'LVEF', value: '46%', flag: 'normal' },
      { label: 'Na+', value: '138 mEq/L', flag: 'normal' },
    ],
    activeMeds: ['Aspirin 81 mg daily', 'Metoprolol Succinate 50 mg daily', 'Atorvastatin 80 mg daily'],
    targetCue: 'Cardiovascular-Safe SSRI · Presynaptic SERT Blockade',
    promptQuestion: 'Which agent is the preferred first-line antidepressant post-MI?',
    cardIds: ['sertraline', 'haloperidol', 'valproate', 'clozapine'],
    correctDrugId: 'sertraline',
    distractorRationales: {
      haloperidol:
        'Haloperidol is a typical antipsychotic that prolongs QTc and does not treat major depression.',
      valproate:
        'Valproate is a mood stabilizer/antiepileptic used in bipolar mania, not unipolar post-MI depression.',
      clozapine:
        'Clozapine causes myocarditis, orthostasis, and tachycardia—strictly inappropriate here.',
    },
    clinicalPearl:
      'Validated by the SADHART trial, sertraline is the gold-standard SSRI in patients with coronary artery disease and post-MI, avoiding the dose-dependent QTc prolongation seen with citalopram.',
    hints: [
      'First-line pharmacotherapy for unipolar depression is an SSRI.',
      'Blockade of presynaptic SERT with minimal QTc effect is preferred after MI.',
      'Only one antidepressant appears in your hand.',
    ],
  },
  {
    id: 'cns_06_parkinson_ddc',
    specialty: 'cns',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Parkinsonian Bradykinesia & Peripheral DDC Blockade',
    patientLine: '67M · Idiopathic Parkinson Disease · Resting Pill-Rolling Tremor',
    presentation:
      'Cogwheel rigidity and bradykinesia now impair daily dressing. Needs the most effective dopamine-restoring regimen paired with a peripheral decarboxylase inhibitor.',
    labs: [
      { label: 'BP', value: '124/76 mmHg', flag: 'normal' },
      { label: 'eGFR', value: '74 mL/min', flag: 'normal' },
      { label: 'LFTs', value: 'Normal', flag: 'normal' },
    ],
    activeMeds: ['None'],
    targetCue: 'Crosses BBB via LAT1 · Peripheral Aromatic L-Amino Acid Decarboxylase Inhibition',
    promptQuestion: 'Play the gold-standard Parkinson regimen that pairs CNS precursor with peripheral DDC protection.',
    cardIds: ['levodopa_carbidopa', 'haloperidol', 'morphine', 'lithium'],
    correctDrugId: 'levodopa_carbidopa',
    distractorRationales: {
      haloperidol:
        'Haloperidol blocks striatal D2 receptors and severely worsens Parkinsonian rigidity and bradykinesia!',
      morphine:
        'Morphine is a mu-opioid analgesic with no dopaminergic restorative effect.',
      lithium:
        'Lithium treats bipolar disorder and can induce postural tremor rather than treating Parkinson bradykinesia.',
    },
    clinicalPearl:
      'Carbidopa cannot cross the blood-brain barrier, so it blocks peripheral conversion of levodopa to dopamine—preventing peripheral nausea/hypotension and ensuring more levodopa reaches the substantia nigra.',
    hints: [
      'Dopamine itself cannot cross the blood-brain barrier; its amino acid precursor can.',
      'Pairing with carbidopa inhibits peripheral DOPA decarboxylase.',
      'Never give a D2 blocker like haloperidol to a Parkinson patient.',
    ],
  },

  // ================= ENDOCRINE, GI & ANTIDOTES (6 CASES) =================
  {
    id: 'eg_01_sglt2_cardiorenal',
    specialty: 'endocrine_gi',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Tubuloglomerular Feedback & Dual Cardiorenal Protection',
    patientLine: '60M · T2DM, HFrEF (EF 35%), Stage 3a CKD',
    presentation:
      'Already on metformin, lisinopril, and metoprolol succinate. Needs an add-on agent proven to reduce HF hospitalization and slow CKD progression.',
    labs: [
      { label: 'HbA1c', value: '7.6%', flag: 'high' },
      { label: 'eGFR', value: '48 mL/min', flag: 'low' },
      { label: 'UACR', value: '240 mg/g', flag: 'high' },
    ],
    activeMeds: ['Metformin 1000 mg BID', 'Lisinopril 20 mg daily', 'Metoprolol Succinate 100 mg daily'],
    targetCue: 'Target Transporter: SGLT2 (S1 Segment, Proximal Convoluted Tubule)',
    promptQuestion: 'Play the agent blocking proximal glucose/Na+ reabsorption to lower intraglomerular pressure.',
    cardIds: ['empagliflozin', 'semaglutide', 'levothyroxine', 'omeprazole'],
    correctDrugId: 'empagliflozin',
    distractorRationales: {
      semaglutide:
        'GLP-1 RAs reduce ASCVD MACE and HbA1c potently, but SGLT2 inhibitors carry the strongest primary guideline mandate for HFrEF and albuminuric CKD progression.',
      levothyroxine:
        'Levothyroxine treats hypothyroidism and has no role in glycemic or cardiorenal management.',
      omeprazole:
        'Omeprazole suppresses gastric acid and offers no cardiorenal or glycemic benefit.',
    },
    clinicalPearl:
      'SGLT2 inhibitors deliver more Na+ to the macula densa, restoring tubuloglomerular feedback and constricting the hyperfiltrating afferent arteriole—protecting nephrons even in non-diabetic HFrEF and CKD!',
    hints: [
      'Look for the proximal tubular cotransporter blocker that induces glucosuria.',
      'This class causes an expected mild initial eGFR dip due to beneficial afferent arteriolar constriction.',
      'Compare the two antidiabetic classes on the table.',
    ],
  },
  {
    id: 'eg_02_nac_napqi',
    specialty: 'endocrine_gi',
    mechanic: 'antidote_triage',
    difficulty: 'Foundational',
    title: 'Acute Acetaminophen Ingestion (6 Hours Post-Dose)',
    patientLine: '24F · Intentional 22 g Acetaminophen Ingestion',
    presentation:
      'Arrives 6 hours post-ingestion with mild RUQ tenderness. Acetaminophen level plots well above the Rumack-Matthew treatment line due to toxic NAPQI accumulation.',
    labs: [
      { label: 'APAP (6h)', value: '195 mcg/mL', flag: 'high' },
      { label: 'AST/ALT', value: '88/94 U/L', flag: 'high' },
      { label: 'INR', value: '1.2', flag: 'normal' },
    ],
    activeMeds: ['Acetaminophen overdose (6 h ago)'],
    targetCue: 'Replenish Hepatic Glutathione · Detoxify NAPQI',
    promptQuestion: 'Which antidote must be started immediately to prevent fulminant hepatic necrosis?',
    cardIds: ['nac', 'naloxone', 'protamine', 'atropine'],
    correctDrugId: 'nac',
    distractorRationales: {
      naloxone:
        'Naloxone reverses opioids; it provides zero protection against CYP2E1-generated NAPQI hepatotoxicity.',
      protamine:
        'Protamine neutralizes unfractionated heparin, not acetaminophen metabolites.',
      atropine:
        'Atropine treats muscarinic/cholinergic toxicity, not hepatic glutathione depletion.',
    },
    clinicalPearl:
      'When glucuronidation and sulfation saturate in acetaminophen overdose, CYP2E1 forms toxic NAPQI. N-acetylcysteine (NAC) supplies cysteine to restore glutathione and detoxify NAPQI—ideally within 8 hours!',
    hints: [
      'Hepatotoxicity comes from depletion of hepatic glutathione stores.',
      'Select the cysteine/glutathione precursor antidote.',
      'Rule out opioid, heparin, and cholinergic antidotes.',
    ],
  },
  {
    id: 'eg_03_ppi_clopidogrel',
    specialty: 'endocrine_gi',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Stent Thrombosis Risk via CYP2C19 Inhibition',
    patientLine: '66M · Recent Drug-Eluting Coronary Stent on DAPT',
    presentation:
      'Discharged on aspirin + clopidogrel after PCI. Started an OTC heartburn capsule that inhibits CYP2C19 bioactivation of clopidogrel.',
    labs: [
      { label: 'Platelets', value: '215 K/uL', flag: 'normal' },
      { label: 'CrCl', value: '72 mL/min', flag: 'normal' },
      { label: 'Troponin', value: 'Negative', flag: 'normal' },
    ],
    activeMeds: ['Clopidogrel 75 mg daily', 'Aspirin 81 mg daily', 'OTC acid suppressor'],
    targetCue: 'Identify the Potent CYP2C19 Inhibitor · Impaired Prodrug Activation',
    promptQuestion: 'Which GI medication in this lineup significantly inhibits CYP2C19 bioactivation of clopidogrel?',
    cardIds: ['omeprazole', 'metformin', 'albuterol', 'semaglutide'],
    correctDrugId: 'omeprazole',
    distractorRationales: {
      metformin:
        'Metformin is not hepatically metabolized and has zero CYP2C19 inhibition.',
      albuterol:
        'Albuterol is a beta-2 agonist bronchodilator metabolized by sulfation, not a CYP2C19 inhibitor.',
      semaglutide:
        'Semaglutide undergoes proteolytic cleavage and does not inhibit CYP2C19.',
    },
    clinicalPearl:
      'Clopidogrel is a prodrug requiring two-step hepatic CYP2C19 activation. Omeprazole (and esomeprazole) inhibit CYP2C19—FDA labeling recommends switching to pantoprazole when GI prophylaxis is needed with clopidogrel.',
    hints: [
      'Identify the OTC proton pump inhibitor in the hand.',
      'Irreversible H+/K+-ATPase inhibitors vary in CYP2C19 inhibition; omeprazole is the classic offender.',
      'Only one GI acid-suppressing medication is listed.',
    ],
  },
  {
    id: 'eg_04_thyroid_spacing',
    specialty: 'endocrine_gi',
    mechanic: 'prescribe_screen',
    difficulty: 'Foundational',
    title: 'Subclinical-to-Overt Hypothyroidism & Cation Chelation',
    patientLine: '51F · Primary Hypothyroidism + Osteopenia',
    presentation:
      'Fatigue, cold intolerance, and weight gain persist despite "taking thyroid pills with breakfast and calcium." Needs exact replacement & counseling.',
    labs: [
      { label: 'TSH', value: '14.2 mIU/L', flag: 'high' },
      { label: 'Free T4', value: '0.6 ng/dL', flag: 'low' },
      { label: 'Ca2+', value: '9.4 mg/dL', flag: 'normal' },
    ],
    activeMeds: ['Calcium citrate + Vitamin D with breakfast'],
    targetCue: 'Nuclear Thyroid Receptor · Separate >= 4 Hours from Calcium/Iron',
    promptQuestion: 'Which hormone requires fasting morning dosing and >= 4 h separation from calcium?',
    cardIds: ['levothyroxine', 'metformin', 'empagliflozin', 'fluticasone_salmeterol'],
    correctDrugId: 'levothyroxine',
    distractorRationales: {
      metformin:
        'Metformin treats type 2 diabetes and should actually be taken WITH meals to minimize GI upset.',
      empagliflozin:
        'Empagliflozin is an SGLT2 inhibitor unaffected by breakfast calcium supplements.',
      fluticasone_salmeterol:
        'Fluticasone-salmeterol is an inhaled ICS/LABA unaffected by oral calcium binding.',
    },
    clinicalPearl:
      'Calcium, iron, aluminum/magnesium antacids, and sucralfate bind levothyroxine in the gut and block absorption. Take levothyroxine on an empty stomach 30–60 min before breakfast, and recheck TSH after 6–8 weeks (t½ ~7 days).',
    hints: [
      'Elevated TSH + low Free T4 confirms primary hypothyroidism.',
      'This narrow-therapeutic-index hormone has a 7-day half-life and binds polyvalent cations.',
      'Only one thyroid agent appears in your hand.',
    ],
  },
  {
    id: 'eg_05_heparin_protamine',
    specialty: 'endocrine_gi',
    mechanic: 'antidote_triage',
    difficulty: 'Clinical',
    title: 'Post-Bypass Heparin Bleeding Emergency',
    patientLine: '68M · Post-Cardiopulmonary Bypass Hemorrhage',
    presentation:
      'Diffuse surgical oozing with markedly prolonged ACT/aPTT following high-dose intraoperative unfractionated heparin.',
    labs: [
      { label: 'ACT', value: '410 sec', flag: 'high' },
      { label: 'aPTT', value: '> 150 sec', flag: 'high' },
      { label: 'Hgb', value: '8.4 g/dL', flag: 'low' },
    ],
    activeMeds: ['Unfractionated Heparin IV (intraoperative)'],
    targetCue: 'Electrostatic Neutralization of Acidic Heparin (1 mg per 100 Units)',
    promptQuestion: 'Which basic peptide antidote immediately neutralizes unfractionated heparin?',
    cardIds: ['protamine', 'nac', 'flumazenil', 'atropine'],
    correctDrugId: 'protamine',
    distractorRationales: {
      nac:
        'N-acetylcysteine detoxifies acetaminophen NAPQI, not heparin anticoagulation.',
      flumazenil:
        'Flumazenil reverses benzodiazepines at GABA-A receptors.',
      atropine:
        'Atropine blocks muscarinic receptors and has no effect on clotting factors or heparin.',
    },
    clinicalPearl:
      'Protamine sulfate is positively charged and forms an inactive ionic salt with negatively charged heparin within 5 minutes (1 mg neutralizes ~100 U UFH). Infuse slowly to avoid hypotension and watch for fish/NPH-insulin cross-allergy.',
    hints: [
      'Unfractionated heparin is a strongly acidic polymer requiring a positively charged peptide.',
      'Dose ratio is roughly 1 mg per 100 units of remaining heparin.',
      'Eliminate acetaminophen, benzodiazepine, and cholinergic antidotes.',
    ],
  },
  {
    id: 'eg_06_cholinergic_crisis',
    specialty: 'endocrine_gi',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Agricultural Organophosphate Exposure',
    patientLine: '39M · Greenhouse Worker · Bronchorrhea & Severe Bradycardia',
    presentation:
      'Brought in diaphoretic with profuse frothy airway secretions, pinpoint pupils, wheezing, diarrhea, and heart rate 38 bpm after pesticide spill.',
    labs: [
      { label: 'HR', value: '38 bpm', flag: 'low' },
      { label: 'SpO2', value: '84%', flag: 'low' },
      { label: 'Rhythm', value: 'Sinus bradycardia', flag: 'low' },
    ],
    activeMeds: ['None (acetylcholinesterase inhibition toxidrome)'],
    targetCue: 'Competitive Muscarinic Blockade · Dry Killer B’s (Bronchorrhea/Bradycardia)',
    promptQuestion: 'Which immediate antidote reverses life-threatening muscarinic bronchorrhea and bradycardia?',
    cardIds: ['atropine', 'albuterol', 'naloxone', 'flumazenil'],
    correctDrugId: 'atropine',
    distractorRationales: {
      albuterol:
        'Albuterol relaxes bronchial smooth muscle via beta-2 agonism, but it cannot dry muscarinic M3 bronchorrhea or correct vagal bradycardia.',
      naloxone:
        'Pinpoint pupils also appear in cholinergic crisis, but profuse SLUDGE secretions and bronchorrhea point to acetylcholine excess, not opioids.',
      flumazenil:
        'Flumazenil blocks GABA-A benzodiazepine sites and does not reverse organophosphate cholinergic toxicity.',
    },
    clinicalPearl:
      'Remember SLUDGE + the 3 Killer B’s (Bradycardia, Bronchospasm, Bronchorrhea) in organophosphate poisoning. Titrate IV atropine until pulmonary secretions clear (not by pupil size!), and co-administer pralidoxime (2-PAM) to restore nicotinic neuromuscular strength.',
    hints: [
      'Massive acetylcholine accumulation stimulates both muscarinic and nicotinic receptors.',
      'Patients die from drowning in muscarinic bronchorrhea—block M1–M5 receptors first.',
      'Do not be fooled by miosis into picking an opioid antagonist.',
    ],
  },

  // ================= CARDIORENAL EXPANSION (6 MORE -> 12 TOTAL) =================
  {
    id: 'cr_07_entresto_washout',
    specialty: 'cardiorenal',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Upgrading HFrEF Therapy & The 36-Hour Washout Rule',
    patientLine: '65M · Persistent NYHA Class III HFrEF (EF 26%)',
    presentation:
      'Symptomatic on lisinopril, metoprolol succinate, and empagliflozin. Cardiology plans to upgrade RAAS blockade after a mandatory 36-hour ACEi washout.',
    labs: [
      { label: 'BP', value: '122/74 mmHg', flag: 'normal' },
      { label: 'K+', value: '4.4 mEq/L', flag: 'normal' },
      { label: 'eGFR', value: '52 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Lisinopril 20 mg daily (held 36 h ago)', 'Metoprolol Succinate 100 mg daily', 'Empagliflozin 10 mg daily'],
    targetCue: 'Dual Neprilysin + AT1 Blockade · Track NT-proBNP (Not BNP)',
    promptQuestion: 'Which ARNI requires a strict 36-hour ACEi washout to prevent fatal angioedema?',
    cardIds: ['sacubitril_valsartan', 'losartan', 'hydralazine_isdn', 'spironolactone'],
    correctDrugId: 'sacubitril_valsartan',
    distractorRationales: {
      losartan:
        'Losartan is an ARB alone; it does not inhibit neprilysin to boost natriuretic peptides or require a strict 36-hour ACEi washout.',
      hydralazine_isdn:
        'Hydralazine-ISDN is added for persistent symptoms in Black patients or when RAAS blockers are contraindicated, not as an ARNI replacement.',
      spironolactone:
        'Spironolactone is an MRA add-on, not a replacement requiring a 36-hour ACEi washout.',
    },
    clinicalPearl:
      'Both ACE and neprilysin degrade bradykinin—overlapping an ACEi with sacubitril-valsartan within 36 hours triggers severe bradykinin-mediated angioedema. Also monitor NT-proBNP rather than BNP, because neprilysin inhibition artificially elevates BNP!',
    hints: [
      'Combine AT1 receptor blockade with neutral endopeptidase (neprilysin) inhibition.',
      'Only one medication in your hand elevates endogenous ANP/BNP and mandates a 36-hour ACEi washout.',
      'Distinguish the ARNI combination from the standalone ARB.',
    ],
  },
  {
    id: 'cr_08_nitro_sildenafil',
    specialty: 'cardiorenal',
    mechanic: 'antidote_triage',
    difficulty: 'Clinical',
    title: 'Refractory Hypotension After Chest Pain Rescue',
    patientLine: '61M · Stable Angina · Taken Sildenafil 4 Hours Ago',
    presentation:
      'Develops exertional substernal chest pressure and receives a fast-acting vasodilator in urgent care; blood pressure crashes to 68/40 mmHg with reflex tachycardia.',
    labs: [
      { label: 'BP', value: '68/40 mmHg', flag: 'low' },
      { label: 'HR', value: '114 bpm', flag: 'high' },
      { label: 'Lactate', value: '3.1 mmol/L', flag: 'high' },
    ],
    activeMeds: ['Sildenafil 100 mg PRN (4 h ago)', 'Atorvastatin 40 mg daily'],
    targetCue: 'Identify the Synergistic cGMP Vasodilator Contraindicated with PDE-5i',
    promptQuestion: 'Which acute antianginal agent precipitated this catastrophic cGMP-mediated hypotension?',
    cardIds: ['nitroglycerin', 'amlodipine', 'metoprolol_succinate', 'clopidogrel'],
    correctDrugId: 'nitroglycerin',
    distractorRationales: {
      amlodipine:
        'Amlodipine acts on L-type Ca2+ channels with slow oral onset, not rapid sublingual NO/cGMP surge.',
      metoprolol_succinate:
        'Beta-blockers lower heart rate and do not synergize directly with PDE-5 inhibition via cGMP.',
      clopidogrel:
        'Clopidogrel is an antiplatelet P2Y12 inhibitor with zero direct vasodilatory effect.',
    },
    clinicalPearl:
      'Organic nitrates donate nitric oxide to stimulate guanylyl cyclase (raising cGMP), while PDE-5 inhibitors (sildenafil, tadalafil) block cGMP breakdown. Separate nitrates by >= 24 h from sildenafil/vardenafil and >= 48 h from tadalafil!',
    hints: [
      'Both the offending drug and sildenafil converge on vascular smooth muscle cGMP.',
      'Look for the sublingual/IV nitric oxide donor used for acute angina.',
      'Eliminate oral antiplatelet and slow-onset oral antihypertensives.',
    ],
  },
  {
    id: 'cr_09_clopidogrel_2c19',
    specialty: 'cardiorenal',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Post-PCI Platelet P2Y12 Prodrug Activation',
    patientLine: '59F · NSTEMI Status-Post Drug-Eluting Stent',
    presentation:
      'Initiated on dual antiplatelet therapy. Pharmacogenomic panel shows normal CYP2C19 (*1/*1) metabolizer status, and GERD is managed safely with pantoprazole.',
    labs: [
      { label: 'CYP2C19', value: '*1/*1 Normal', flag: 'normal' },
      { label: 'Platelets', value: '255 K/uL', flag: 'normal' },
      { label: 'eGFR', value: '76 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Aspirin 81 mg daily', 'Pantoprazole 40 mg daily', 'Atorvastatin 80 mg daily'],
    targetCue: 'Target Receptor: Platelet P2Y12 ADP Receptor (Irreversible CYP2C19 Prodrug)',
    promptQuestion: 'Play the irreversible P2Y12 thienopyridine prodrug activated by CYP2C19.',
    cardIds: ['clopidogrel', 'apixaban', 'warfarin', 'enoxaparin'],
    correctDrugId: 'clopidogrel',
    distractorRationales: {
      apixaban:
        'Apixaban inhibits Factor Xa in the coagulation cascade, not platelet ADP aggregation.',
      warfarin:
        'Warfarin inhibits hepatic VKOR and does not prevent coronary stent thrombosis via P2Y12 blockade.',
      enoxaparin:
        'Enoxaparin is an injectable LMWH acting via antithrombin III, not an oral antiplatelet agent.',
    },
    clinicalPearl:
      'Clopidogrel requires two-step hepatic CYP2C19 bioactivation to form its irreversible thiol metabolite (active for the platelet’s 7–10 day lifespan). Avoid omeprazole/esomeprazole and switch to prasugrel or ticagrelor in CYP2C19 poor metabolizers (*2/*3).',
    hints: [
      'Coronary stents require dual ANTIPLATELET therapy (aspirin + a P2Y12 blocker), not systemic anticoagulation.',
      'Only one card targets platelet ADP receptors via CYP2C19 bioactivation.',
      'Rule out Factor Xa, VKOR, and antithrombin III agents.',
    ],
  },
  {
    id: 'cr_10_enoxaparin_ckd',
    specialty: 'cardiorenal',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Acute DVT Anticoagulation Trap in Severe CKD',
    patientLine: '74M · Acute Proximal DVT · Stage 4 CKD',
    presentation:
      'Ordered therapeutic parenteral anticoagulation on admission. Standard 1 mg/kg q12h dosing risks retroperitoneal hemorrhage unless renally adjusted to once daily (or switched to UFH).',
    labs: [
      { label: 'CrCl', value: '21 mL/min', flag: 'low' },
      { label: 'Weight', value: '78 kg', flag: 'normal' },
      { label: 'Hgb', value: '12.1 g/dL', flag: 'normal' },
    ],
    activeMeds: ['Lisinopril 10 mg daily'],
    targetCue: 'Antithrombin III -> Preferential Factor Xa Blockade · Mandatory CrCl < 30 Reduction',
    promptQuestion: 'Which injectable LMWH accumulates at CrCl 21 mL/min and requires reducing treatment dosing to q24h?',
    cardIds: ['enoxaparin', 'apixaban', 'warfarin', 'protamine'],
    correctDrugId: 'enoxaparin',
    distractorRationales: {
      apixaban:
        'Apixaban is an oral direct Factor Xa inhibitor (only 27% renal clearance) and is not a parenteral LMWH requiring 1 mg/kg q24h adjustment.',
      warfarin:
        'Warfarin is hepatically cleared via CYP2C9 and requires no renal dose adjustment (plus takes days to achieve therapeutic INR).',
      protamine:
        'Protamine is the partial reversal antidote for heparins, not an anticoagulant.',
    },
    clinicalPearl:
      'Unlike unfractionated heparin (which is cleared by reticuloendothelial/hepatic uptake), low-molecular-weight heparins (enoxaparin) rely on renal clearance—CrCl < 30 mL/min mandates reducing therapeutic enoxaparin from 1 mg/kg q12h to 1 mg/kg q24h (and protamine reverses only ~60%).',
    hints: [
      'Look for the subcutaneous low-molecular-weight heparin.',
      'LMWHs bind antithrombin III preferentially against Factor Xa (~4:1 Xa:IIa) and accumulate in CKD.',
      'Distinguish the injectable LMWH pen from oral anticoagulants.',
    ],
  },
  {
    id: 'cr_11_hydralazine_lupus',
    specialty: 'cardiorenal',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Symmetric Arthralgias & Anti-Histone Antibodies in HFrEF',
    patientLine: '64M · Self-Identified Black Patient with HFrEF on Triple GDMT',
    presentation:
      'Added a fixed-dose arterial/venous vasodilator 5 months ago for persistent NYHA III dyspnea. Now presents with fever, malar rash, pleuritic chest pain, and positive anti-histone antibodies.',
    labs: [
      { label: 'Anti-Histone', value: 'Positive', flag: 'high' },
      { label: 'dsDNA Ab', value: 'Negative', flag: 'normal' },
      { label: 'K+', value: '4.5 mEq/L', flag: 'normal' },
    ],
    activeMeds: ['Sacubitril-Valsartan', 'Carvedilol', 'Spironolactone', 'Added vasodilator combo'],
    targetCue: 'NAT2 Slow-Acetylator Drug-Induced Lupus · A-HeFT Vasodilator',
    promptQuestion: 'Which vasodilator regimen caused this drug-induced lupus syndrome?',
    cardIds: ['hydralazine_isdn', 'amlodipine', 'furosemide', 'losartan'],
    correctDrugId: 'hydralazine_isdn',
    distractorRationales: {
      amlodipine:
        'Amlodipine causes peripheral edema and gingival hyperplasia, not anti-histone-positive drug-induced lupus.',
      furosemide:
        'Furosemide is a sulfa loop diuretic that causes electrolyte depletion and photosensitivity, not NAT2 slow-acetylator lupus.',
      losartan:
        'Losartan is an ARB and is not a classic cause of anti-histone drug-induced lupus.',
    },
    clinicalPearl:
      'Hydralazine-isosorbide dinitrate reduces HFrEF mortality in Black patients on GDMT (A-HeFT) and provides RAAS-free afterload reduction in hyperkalemia. However, hydralazine (especially in NAT2 slow acetylators at >= 200 mg/day) can trigger reversible drug-induced lupus (anti-histone +, dsDNA -).',
    hints: [
      'Classic triad for drug-induced lupus: hydralazine, procainamide, isoniazid (plus anti-TNF/minocycline).',
      'Metabolism via hepatic N-acetyltransferase 2 (NAT2) creates slow-acetylator risk.',
      'Select the A-HeFT arterial + venous vasodilator combination.',
    ],
  },
  {
    id: 'cr_12_amiodarone_thyroid',
    specialty: 'cardiorenal',
    mechanic: 'antidote_triage',
    difficulty: 'Clinical',
    title: 'Bibasilar Fibrosis & Elevated TSH in Recurrent VT',
    patientLine: '72M · Refractory Ventricular Tachycardia · 18 Months on Rhythm Control',
    presentation:
      'Develops progressive dyspnea on exertion, dry cough, blue-gray facial skin hue, corneal microdeposits, and marked hypothyroidism.',
    labs: [
      { label: 'TSH', value: '21.4 mIU/L', flag: 'high' },
      { label: 'DLCO', value: '52% pred', flag: 'low' },
      { label: 'QTc', value: '492 ms', flag: 'high' },
    ],
    activeMeds: ['Apixaban 5 mg BID', 'Atorvastatin 40 mg daily', 'Class III antiarrhythmic'],
    targetCue: '37% Iodine Content · Massive 66 L/kg Vd · Multi-Organ Toxicity',
    promptQuestion: 'Which antiarrhythmic explains BOTH the pulmonary fibrosis and thyroid dysfunction?',
    cardIds: ['amiodarone', 'digoxin', 'metoprolol_succinate', 'lisinopril'],
    correctDrugId: 'amiodarone',
    distractorRationales: {
      digoxin:
        'Digoxin causes xanthopsia and GI/arrhythmic toxicity, not pulmonary fibrosis, blue-gray skin, or iodine-induced hypothyroidism.',
      metoprolol_succinate:
        'Metoprolol causes bradycardia and fatigue, not interstitial pneumonitis or thyroid abnormalities.',
      lisinopril:
        'Lisinopril causes a dry bradykinin cough, not parenchymal pulmonary fibrosis, corneal deposits, or TSH elevation.',
    },
    clinicalPearl:
      'Amiodarone contains 37% iodine by weight and sequesters deeply in adipose/lung tissue (Vd 66 L/kg, t½ 40–58 days). Monitor PFTs/CXR (pulmonary fibrosis is its most fatal toxicity), TSH, and LFTs every 6 months!',
    hints: [
      'Think of the iodine-rich Class III antiarrhythmic with a 40–58 day half-life.',
      'Corneal whorl deposits + slate-gray skin + restrictive lung disease + thyroiditis are hallmark clues.',
      'Rule out ACEi cough and cardiac glycoside toxicity.',
    ],
  },

  // ================= INFECTIOUS DISEASE EXPANSION (6 MORE -> 12 TOTAL) =================
  {
    id: 'id_07_linezolid_serotonin',
    specialty: 'infectious',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Clonus & Diaphoresis After Oral VRE Step-Down',
    patientLine: '55F · VRE UTI/Bacteremia Step-Down · Chronic Depression',
    presentation:
      'Switched to an oral 100%-bioavailable oxazolidinone 4 days ago. Develops fever 38.9 °C, agitation, diaphoresis, and inducible ankle clonus.',
    labs: [
      { label: 'Platelets', value: '128 K/uL', flag: 'low' },
      { label: 'Temp', value: '38.9 °C', flag: 'high' },
      { label: 'eGFR', value: '68 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Sertraline 100 mg daily', 'Recent oral VRE antibiotic'],
    targetCue: '50S Initiation Inhibitor · Reversible MAOI -> Serotonin Toxicity',
    promptQuestion: 'Which oral VRE/MRSA antibiotic precipitated serotonin syndrome with sertraline?',
    cardIds: ['linezolid', 'vancomycin', 'doxycycline', 'nitrofurantoin'],
    correctDrugId: 'linezolid',
    distractorRationales: {
      vancomycin:
        'Oral vancomycin is < 5% absorbed and treats only C. difficile; neither IV nor oral vancomycin has MAOI activity.',
      doxycycline:
        'Doxycycline does not cover VRE reliably and has zero monoamine oxidase inhibition.',
      nitrofurantoin:
        'Nitrofurantoin has no systemic MAOI activity and is ineffective for systemic VRE bacteremia.',
    },
    clinicalPearl:
      'Linezolid boasts 100% oral bioavailability (exact 1:1 IV-to-PO conversion), but it is a reversible non-selective MAO inhibitor! Watch for serotonin syndrome with SSRIs/SNRIs and bone marrow suppression (thrombocytopenia) after > 14 days.',
    hints: [
      'Clonus + diaphoresis + hyperthermia + SSRI = serotonin syndrome.',
      'Identify the oxazolidinone with 100% oral bioavailability and weak MAOI properties.',
      'Compare the two anti-MRSA/VRE agents.',
    ],
  },
  {
    id: 'id_08_meropenem_valproate',
    specialty: 'infectious',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Breakthrough Seizures on ESBL Pyelonephritis Therapy',
    patientLine: '44M · Bipolar/Epilepsy · Hospitalized for ESBL E. coli Sepsis',
    presentation:
      'Seizure-free for 4 years until starting broad-spectrum IV therapy for ESBL E. coli. Has two generalized seizures; serum antiepileptic level plunged from 82 to 14 mcg/mL in 36 hours.',
    labs: [
      { label: 'Valproate', value: '14 mcg/mL', flag: 'low' },
      { label: 'ESBL Culture', value: 'E. coli', flag: 'high' },
      { label: 'CrCl', value: '84 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Divalproex ER 1000 mg daily', 'New ESBL-active IV antibiotic'],
    targetCue: 'Carbapenem-Induced Acylpeptide Hydrolase Blockade · Crashes Valproate',
    promptQuestion: 'Which ESBL-active antibiotic caused the rapid collapse in serum valproate concentration?',
    cardIds: ['meropenem', 'ceftriaxone', 'pip_tazo', 'ciprofloxacin'],
    correctDrugId: 'meropenem',
    distractorRationales: {
      ceftriaxone:
        'Ceftriaxone is inactivated by ESBL-producing E. coli and does not crash valproate levels.',
      pip_tazo:
        'Piperacillin-tazobactam is generally inferior to carbapenems for invasive ESBL bacteremia and does not cause the dramatic carbapenem-valproate interaction.',
      ciprofloxacin:
        'Ciprofloxacin is not a carbapenem and does not trigger rapid valproate clearance.',
    },
    clinicalPearl:
      'Carbapenems (meropenem, ertapenem, imipenem) inhibit acylpeptide hydrolase, blocking valproate-glucuronide deconjugation and slashing serum valproate by 60–90% within 24 h! Even extra valproate loading rarely overcomes it—switch AED or antibiotic.',
    hints: [
      'Carbapenems are the gold standard for ESBL-producing Enterobacterales.',
      'One specific beta-lactam subclass crashes serum valproate levels within 24 hours.',
      'Choose the carbapenem over cephalosporin/penicillin/quinolone options.',
    ],
  },
  {
    id: 'id_09_gentamicin_cmax',
    specialty: 'infectious',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Concentration-Dependent Killing & Post-Antibiotic Effect',
    patientLine: '53M · Severe Gram-Negative Sepsis · Extended-Interval Dosing',
    presentation:
      'Requires a hydrophilic 30S ribosomal bactericidal agent dosed once daily (7 mg/kg q24h) to maximize Peak/MIC >= 8–10 and allow renal tubular washout.',
    labs: [
      { label: 'Target Cmax/MIC', value: '>= 8–10', flag: 'normal' },
      { label: 'Trough Goal', value: '< 1 mcg/mL', flag: 'normal' },
      { label: 'CrCl', value: '88 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Cefepime 2 g IV q8h'],
    targetCue: 'Target Subunit: 30S Ribosome (16S rRNA) · Concentration-Dependent + Long PAE',
    promptQuestion: 'Play the aminoglycoside optimized by high peak Cmax/MIC extended-interval dosing.',
    cardIds: ['gentamicin', 'azithromycin', 'vancomycin', 'pip_tazo'],
    correctDrugId: 'gentamicin',
    distractorRationales: {
      azithromycin:
        'Azithromycin targets the 50S ribosome and is bacteriostatic against atypicals, not a Gram-negative sepsis aminoglycoside.',
      vancomycin:
        'Vancomycin targets D-Ala-D-Ala on Gram-positive cell walls using AUC/MIC, not 30S Cmax/MIC.',
      pip_tazo:
        'Piperacillin-tazobactam exhibits time-dependent killing (fT > MIC), not concentration-dependent Cmax/MIC.',
    },
    clinicalPearl:
      'Aminoglycosides (gentamicin, tobramycin, amikacin) exhibit concentration-dependent bactericidal killing (Cmax/MIC >= 8–10) and a prolonged Post-Antibiotic Effect (PAE). Once-daily extended-interval dosing maximizes peak killing while letting renal cortical uptake clear to lower nephrotoxicity.',
    hints: [
      'Look for the polycationic hydrophilic agent targeting the 30S ribosomal subunit.',
      'Unlike beta-lactams (fT > MIC) or vancomycin (AUC/MIC), this class tracks Cmax/MIC.',
      'Monitor for irreversible vestibular/cochlear ototoxicity and AKI.',
    ],
  },
  {
    id: 'id_10_piptazo_vanc_aki',
    specialty: 'infectious',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'Empiric MRSA + Pseudomonas Coverage & AKI Synergy',
    patientLine: '67M · Healthcare-Associated Pneumonia · Rising Serum Creatinine',
    presentation:
      'Started on empiric IV vancomycin plus an antipseudomonal penicillin/BLI 4 days ago. Serum creatinine jumped from 0.9 to 2.1 mg/dL without sepsis worsening.',
    labs: [
      { label: 'SCr', value: '2.1 mg/dL', flag: 'high' },
      { label: 'Vanc AUC', value: '520 mg·h/L', flag: 'normal' },
      { label: 'WBC', value: '11.2 K/uL', flag: 'normal' },
    ],
    activeMeds: ['Vancomycin IV', 'Antipseudomonal beta-lactam + BLI'],
    targetCue: 'Antipseudomonal Ureidopenicillin · Synergistic Nephrotoxicity with Vancomycin',
    promptQuestion: 'Which partner beta-lactam most strongly amplifies acute kidney injury when paired with vancomycin?',
    cardIds: ['pip_tazo', 'ceftriaxone', 'azithromycin', 'oseltamivir'],
    correctDrugId: 'pip_tazo',
    distractorRationales: {
      ceftriaxone:
        'Ceftriaxone lacks Pseudomonas activity and does not share the well-documented AKI synergy with vancomycin.',
      azithromycin:
        'Azithromycin is hepatically/biliary cleared and does not cover Pseudomonas or drive vancomycin AKI.',
      oseltamivir:
        'Oseltamivir is an influenza neuraminidase inhibitor without antibacterial activity.',
    },
    clinicalPearl:
      'Co-administering vancomycin + piperacillin-tazobactam ("Vanc + Zosyn") roughly triples acute kidney injury incidence compared with vancomycin + cefepime or meropenem! Consider de-escalating or swapping to cefepime when clinically appropriate.',
    hints: [
      'Identify the broad-spectrum antipseudomonal penicillin + beta-lactamase inhibitor.',
      'This agent requires renal adjustment at CrCl <= 40 and interacts synergistically with vancomycin at the kidney.',
      'Only one card covers Pseudomonas aeruginosa and anaerobes.',
    ],
  },
  {
    id: 'id_11_oseltamivir_48h',
    specialty: 'infectious',
    mechanic: 'receptor_lock',
    difficulty: 'Foundational',
    title: 'Acute Influenza A Within 24 Hours of Fever',
    patientLine: '68F · Moderate COPD · Positive Rapid Influenza A',
    presentation:
      'Abrupt onset of myalgias, dry cough, and fever 18 hours ago. Needs targeted oral antiviral therapy to block virion release from infected respiratory epithelium.',
    labs: [
      { label: 'Onset', value: '18 hours ago', flag: 'normal' },
      { label: 'Flu A Ag', value: 'Positive', flag: 'high' },
      { label: 'CrCl', value: '62 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Fluticasone-Salmeterol 250/50 BID', 'Albuterol PRN'],
    targetCue: 'Target Enzyme: Viral Neuraminidase (Optimal Initiation <= 48 Hours)',
    promptQuestion: 'Play the oral neuraminidase inhibitor prodrug indicated within 48 h of symptom onset.',
    cardIds: ['oseltamivir', 'acyclovir', 'amox_clav', 'azithromycin'],
    correctDrugId: 'oseltamivir',
    distractorRationales: {
      acyclovir:
        'Acyclovir inhibits HSV/VZV DNA polymerase and has zero activity against RNA influenza viruses.',
      amox_clav:
        'Amoxicillin-clavulanate is an antibacterial with no activity against influenza virus.',
      azithromycin:
        'Azithromycin is an antibacterial macrolide; inappropriate for confirmed uncomplicated viral influenza.',
    },
    clinicalPearl:
      'Oseltamivir inhibits viral neuraminidase cleavage of host sialic acid, trapping budding virions. Start within 48 h for outpatients (and at ANY time in hospitalized or high-risk patients). Adjust dose when CrCl <= 60 mL/min!',
    hints: [
      'Antibacterials do not treat confirmed Influenza A.',
      'Select the antiviral blocking sialic-acid cleavage by viral neuraminidase.',
      'Distinguish the anti-influenza agent from the anti-herpesvirus nucleoside analog.',
    ],
  },
  {
    id: 'id_12_azithromycin_qtc',
    specialty: 'infectious',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'Atypical Pneumonia Without CYP3A4 Statin Toxicity',
    patientLine: '66M · Community-Acquired Pneumonia (Mycoplasma) + High-Intensity Statin',
    presentation:
      'Needs oral atypical coverage alongside amoxicillin while avoiding CYP3A4 inhibition of his atorvastatin 80 mg and tamsulosin.',
    labs: [
      { label: 'QTc', value: '418 ms', flag: 'normal' },
      { label: 'eGFR', value: '71 mL/min', flag: 'normal' },
      { label: 'AST/ALT', value: '24/27 U/L', flag: 'normal' },
    ],
    activeMeds: ['Atorvastatin 80 mg daily', 'Amoxicillin 1 g TID'],
    targetCue: '50S Ribosomal Atypical Coverage · Spares CYP3A4 (Still Monitor QTc)',
    promptQuestion: 'Which macrolide/azalide covers atypicals with 68-hour tissue half-life and minimal CYP3A4 inhibition?',
    cardIds: ['azithromycin', 'fluconazole', 'ciprofloxacin', 'tmp_smx'],
    correctDrugId: 'azithromycin',
    distractorRationales: {
      fluconazole:
        'Fluconazole is a triazole antifungal that inhibits CYP2C9/2C19/3A4 and does not treat Mycoplasma pneumonia.',
      ciprofloxacin:
        'Ciprofloxacin is not a macrolide/first-line CAP beta-lactam partner for outpatient atypical coverage and carries severe tendon/aortic boxed warnings.',
      tmp_smx:
        'TMP-SMX lacks reliable Mycoplasma/Chlamydophila atypical CAP coverage.',
    },
    clinicalPearl:
      'Unlike erythromycin and clarithromycin (potent CYP3A4 inhibitors that spike atorvastatin/simvastatin and risk rhabdomyolysis), azithromycin does NOT inhibit CYP3A4. However, all macrolides can prolong QTc!',
    hints: [
      'Atypical respiratory pathogens (Mycoplasma, Chlamydophila, Legionella) lack cell walls or replicate intracellularly.',
      'This azalide concentrates in phagocytes (Vd 31 L/kg, t½ 68 h) and spares CYP3A4.',
      'Only one macrolide antibiotic is in your hand.',
    ],
  },

  // ================= CNS, PAIN & PSYCHIATRY EXPANSION (6 MORE -> 12 TOTAL) =================
  {
    id: 'cns_07_lamotrigine_valproate',
    specialty: 'cns',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Bipolar Depression & The UGT1A4 SJS Titration Trap',
    patientLine: '31F · Bipolar II Depression · Taking Valproate 500 mg BID',
    presentation:
      'Adding a mood stabilizer targeted at bipolar depression. Because valproate inhibits UGT1A4 glucuronidation, this drug’s half-life doubles from ~29 h to ~60 h, requiring the half-dose starter pack.',
    labs: [
      { label: 'Valproate', value: '74 mcg/mL', flag: 'normal' },
      { label: 'LFTs', value: 'Normal', flag: 'normal' },
      { label: 'Pregnancy', value: 'Negative', flag: 'normal' },
    ],
    activeMeds: ['Divalproex 500 mg BID'],
    targetCue: 'UGT1A4 Glucuronidation Substrate · Slow Titration to Prevent SJS/TEN',
    promptQuestion: 'Which phenyltriazine requires a halved starter titration when combined with valproate?',
    cardIds: ['lamotrigine', 'lithium', 'carbamazepine', 'gabapentin'],
    correctDrugId: 'lamotrigine',
    distractorRationales: {
      lithium:
        'Lithium is 95% renally excreted unchanged and is not metabolized by UGT1A4 or doubled by valproate.',
      carbamazepine:
        'Carbamazepine is a CYP3A4 autoinducer requiring HLA-B*1502 screening, not a UGT1A4 substrate doubled by valproate.',
      gabapentin:
        'Gabapentin is 100% renally cleared unchanged and does not treat bipolar depression.',
    },
    clinicalPearl:
      'Valproate inhibits UGT1A4, doubling lamotrigine’s half-life (~60 h) and sharply increasing Stevens-Johnson Syndrome (SJS/TEN) risk unless you use the special blue/valproate-adjusted starter titration! Conversely, carbamazepine and estrogen OCs induce UGT1A4 and cut lamotrigine levels in half.',
    hints: [
      'Look for the phenyltriazine preferred for bipolar depression.',
      'Metabolized purely via UGT1A4 glucuronidation—valproate inhibits this enzyme.',
      'Carries a boxed warning for serious rash (SJS/TEN) if titrated too rapidly.',
    ],
  },
  {
    id: 'cns_08_tca_qrs_bicarb',
    specialty: 'cns',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Wide-Complex QRS After Amitriptyline Overdose',
    patientLine: '34M · Intentional Amitriptyline Overdose · Delirious & Hypotensive',
    presentation:
      'Brought to ED with flushed dry skin, dilated pupils, BP 82/50 mmHg, and widening QRS complex (136 ms) with terminal R wave in aVR.',
    labs: [
      { label: 'QRS', value: '136 ms', flag: 'high' },
      { label: 'BP', value: '82/50 mmHg', flag: 'low' },
      { label: 'pH', value: '7.29', flag: 'low' },
    ],
    activeMeds: ['Amitriptyline overdose (~3 h ago)'],
    targetCue: 'Overcome Cardiac Fast Na+ Blockade · Target Arterial pH 7.45–7.55',
    promptQuestion: 'Which immediate IV antidote narrows the QRS and prevents ventricular fibrillation?',
    cardIds: ['sodium_bicarbonate', 'flumazenil', 'naloxone', 'atropine'],
    correctDrugId: 'sodium_bicarbonate',
    distractorRationales: {
      flumazenil:
        'Flumazenil is strictly CONTRAINDICATED in TCA overdose—it strips GABA seizure protection and triggers fatal refractory seizures!',
      naloxone:
        'Naloxone treats opioid respiratory depression, not TCA fast Na+ channel cardiotoxicity.',
      atropine:
        'TCA toxicity already causes severe anticholinergic blockade (dry, flushed, dilated pupils); atropine worsens anticholinergic delirium.',
    },
    clinicalPearl:
      'When TCA overdose widens QRS > 100 ms, give IV sodium bicarbonate bolus + infusion (target pH 7.45–7.55): the Na+ load overcomes fast Na+ channel blockade while raising blood pH increases TCA protein binding, reducing free cardiotoxic drug!',
    hints: [
      'QRS > 100 ms indicates cardiac fast sodium channel blockade.',
      'Both extracellular Na+ loading and systemic alkalinization reverse TCA cardiotoxicity.',
      'Never give flumazenil when a TCA is on board.',
    ],
  },
  {
    id: 'cns_09_amitriptyline_beers',
    specialty: 'cns',
    mechanic: 'antidote_triage',
    difficulty: 'Foundational',
    title: 'Anticholinergic Delirium & Urinary Retention in Elderly',
    patientLine: '81M · Diabetic Neuropathy · Acute Confusion & Falls',
    presentation:
      'Started a bedtime pill for burning foot pain 10 days ago. Now disoriented at night with dry mouth, urinary retention (650 mL post-void residual), and orthostasis.',
    labs: [
      { label: 'BP (Stand)', value: '94/58 mmHg', flag: 'low' },
      { label: 'Bladder Scan', value: '650 mL', flag: 'high' },
      { label: 'eGFR', value: '66 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Metformin 500 mg BID', 'New bedtime neuropathy agent'],
    targetCue: 'Beers Criteria High-Risk Agent · M1 + H1 + Alpha-1 Blockade',
    promptQuestion: 'Which neuropathic pain agent caused this classic anticholinergic/orthostatic Beers Criteria syndrome?',
    cardIds: ['amitriptyline', 'gabapentin', 'sertraline', 'levodopa_carbidopa'],
    correctDrugId: 'amitriptyline',
    distractorRationales: {
      gabapentin:
        'Gabapentin causes sedation/ataxia (especially in CKD), not potent antimuscarinic urinary retention and alpha-1 orthostasis.',
      sertraline:
        'Sertraline has negligible M1 or alpha-1 blockade and is not used first-line for diabetic neuropathy.',
      levodopa_carbidopa:
        'Levodopa-carbidopa treats Parkinson disease, not diabetic peripheral neuropathy.',
    },
    clinicalPearl:
      'Tertiary amine TCAs like amitriptyline carry heavy M1 anticholinergic, H1 sedating, and alpha-1 orthostatic blockade—avoid in adults >= 65 years per Beers Criteria (prefer duloxetine, gabapentin/pregabalin, or topical lidocaine).',
    hints: [
      '"Blind as a bat, mad as a hatter, red as a beet, hot as a hare, dry as a bone, full bladder."',
      'Look for the tertiary amine tricyclic antidepressant.',
      'Distinguish the TCA from the alpha-2-delta gabapentinoid.',
    ],
  },
  {
    id: 'cns_10_gabapentin_renal',
    specialty: 'cns',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Saturable LAT1 Absorption & CKD Myoclonus',
    patientLine: '70F · Postherpetic Neuralgia + Stage 4 CKD',
    presentation:
      'Prescribed 900 mg TID without renal adjustment. Presents with marked somnolence and multifocal myoclonic jerks; drug is 100% cleared unchanged by the kidneys.',
    labs: [
      { label: 'CrCl', value: '18 mL/min', flag: 'low' },
      { label: 'LFTs', value: 'Normal', flag: 'normal' },
      { label: 'Na+', value: '138 mEq/L', flag: 'normal' },
    ],
    activeMeds: ['Lisinopril 10 mg daily', 'High-dose neuropathic agent'],
    targetCue: 'Target Site: Alpha-2-Delta Ca2+ Channel Subunit · 100% Renal Unchanged',
    promptQuestion: 'Play the gabapentinoid exhibiting saturable LAT1 absorption and 100% renal clearance.',
    cardIds: ['gabapentin', 'lamotrigine', 'carbamazepine', 'valproate'],
    correctDrugId: 'gabapentin',
    distractorRationales: {
      lamotrigine:
        'Lamotrigine is cleared via hepatic UGT1A4 glucuronidation and targets voltage-gated Na+ channels.',
      carbamazepine:
        'Carbamazepine is hepatically metabolized (CYP3A4) and causes SIADH/hyponatremia rather than pure renal accumulation.',
      valproate:
        'Valproate is hepatically cleared by glucuronidation and beta-oxidation.',
    },
    clinicalPearl:
      'Despite its name, gabapentin does NOT bind GABA receptors—it binds presynaptic alpha-2-delta Ca2+ channel subunits! Because intestinal LAT1 transport saturates at higher doses, bioavailability falls from 60% (300 mg) to 27% (1600 mg), and CKD (CrCl < 30) mandates steep dose cuts to prevent myoclonus.',
    hints: [
      'Which anticonvulsant is NOT metabolized in humans and exits 100% unchanged in urine?',
      'Targets alpha-2-delta subunits on presynaptic voltage-gated calcium channels.',
      'Rule out the three hepatically metabolized antiepileptics.',
    ],
  },
  {
    id: 'cns_11_sumatriptan_cad',
    specialty: 'cns',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'Acute Migraine Abortive Trap in Coronary Disease',
    patientLine: '54M · Migraine with Aura + Prior NSTEMI / Prinzmetal Angina',
    presentation:
      'Requests a fast-acting abortive prescription for severe throbbing migraines. Screening reveals documented coronary artery disease and vasospastic angina.',
    labs: [
      { label: 'BP', value: '132/80 mmHg', flag: 'normal' },
      { label: 'Troponin', value: 'Normal', flag: 'normal' },
      { label: 'CrCl', value: '86 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Aspirin 81 mg daily', 'Atorvastatin 80 mg daily', 'Amlodipine 5 mg daily'],
    targetCue: 'Contraindicated 5-HT1B/1D Agonist · Coronary Vasoconstriction Risk',
    promptQuestion: 'Which migraine abortive MUST be avoided in this patient due to coronary vasospasm?',
    cardIds: ['sumatriptan', 'ondansetron', 'amitriptyline', 'gabapentin'],
    correctDrugId: 'sumatriptan',
    distractorRationales: {
      ondansetron:
        'Ondansetron is a 5-HT3 antagonist antiemetic for migraine nausea and does not cause 5-HT1B coronary vasoconstriction.',
      amitriptyline:
        'Amitriptyline is a migraine preventive agent, not a fast-acting 5-HT1B/1D abortive.',
      gabapentin:
        'Gabapentin does not stimulate vascular 5-HT1B receptors or cause coronary vasospasm.',
    },
    clinicalPearl:
      'Triptans (sumatriptan) constrict meningeal vessels via 5-HT1B receptors—which are ALSO expressed on coronary arteries! Strictly contraindicated in CAD, prior MI, Prinzmetal angina, stroke/TIA, and uncontrolled HTN (consider gepants like rimegepant/ubrogepant instead).',
    hints: [
      'Identify the selective 5-HT1B/1D agonist used to abort acute migraines.',
      '5-HT1B agonism constricts both cranial and coronary vessels.',
      'Distinguish the triptan abortive from antiemetics and preventives.',
    ],
  },
  {
    id: 'cns_12_carbamazepine_hla',
    specialty: 'cns',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Trigeminal Neuralgia, Autoinduction & HLA-B*1502',
    patientLine: '42F · Classic Trigeminal Neuralgia · Southeast Asian Ancestry',
    presentation:
      'First-line lancinating facial pain therapy is planned. Before dispensing, pharmacist requires HLA-B*1502 pharmacogenomic clearance and counsels on OC failure.',
    labs: [
      { label: 'HLA-B*1502', value: 'Pending Screen', flag: 'high' },
      { label: 'Na+', value: '137 mEq/L', flag: 'normal' },
      { label: 'CBC', value: 'Normal', flag: 'normal' },
    ],
    activeMeds: ['Ethinyl estradiol/levonorgestrel OC'],
    targetCue: 'Voltage-Gated Na+ Blocker · CYP3A4 Autoinducer · SJS Genetic Screen',
    promptQuestion: 'Which first-line trigeminal neuralgia drug mandates HLA-B*1502 screening and induces OC failure?',
    cardIds: ['carbamazepine', 'gabapentin', 'lamotrigine', 'diazepam'],
    correctDrugId: 'carbamazepine',
    distractorRationales: {
      gabapentin:
        'Gabapentin does not require HLA-B*1502 screening and does not induce hepatic CYP3A4 metabolism of oral contraceptives.',
      lamotrigine:
        'Lamotrigine carries SJS risk (especially with valproate) but does NOT mandate HLA-B*1502 testing and does not autoinduce CYP3A4.',
      diazepam:
        'Diazepam is not first-line for trigeminal neuralgia and does not induce CYP3A4.',
    },
    clinicalPearl:
      'Carbamazepine is first-line for trigeminal neuralgia, but carries two major boxed warnings: (1) HLA-B*1502-linked SJS/TEN in Asian ancestry, and (2) aplastic anemia/agranulocytosis. Its potent CYP3A4 autoinduction drops its own half-life after 2–4 weeks and invalidates hormonal contraception!',
    hints: [
      'First-line drug for trigeminal neuralgia (tic douloureux).',
      'Look for the classic CYP3A4 autoinducer requiring HLA-B*1502 genetic testing.',
      'Eliminate non-CYP and benzodiazepine options.',
    ],
  },

  // ================= ENDOCRINE, GI & ANTIDOTES EXPANSION (6 MORE -> 12 TOTAL) =================
  {
    id: 'eg_07_alendronate_counsel',
    specialty: 'endocrine_gi',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Postmenopausal Osteoporosis & The 0.6% Bioavailability Rule',
    patientLine: '67F · Lumbar Spine T-Score -2.8 · Normal Renal Function',
    presentation:
      'Needs first-line oral antiresorptive therapy that induces osteoclast apoptosis. Must be taken with 6–8 oz plain water only while remaining upright >= 30 minutes.',
    labs: [
      { label: 'T-Score', value: '-2.8 SD', flag: 'low' },
      { label: 'CrCl', value: '64 mL/min', flag: 'normal' },
      { label: 'Ca2+', value: '9.5 mg/dL', flag: 'normal' },
    ],
    activeMeds: ['Calcium 600 mg + Vitamin D3 1000 IU (take at lunch/dinner)'],
    targetCue: 'Target Enzyme: Osteoclast Farnesyl Pyrophosphate Synthase · > 10-Year Bone t½',
    promptQuestion: 'Play the nitrogen-containing bisphosphonate requiring strict upright plain-water dosing.',
    cardIds: ['alendronate', 'levothyroxine', 'omeprazole', 'empagliflozin'],
    correctDrugId: 'alendronate',
    distractorRationales: {
      levothyroxine:
        'Levothyroxine requires morning fasting dosing away from calcium, but treats hypothyroidism rather than inhibiting osteoclasts.',
      omeprazole:
        'Chronic omeprazole actually increases fracture risk rather than treating osteoporosis.',
      empagliflozin:
        'Empagliflozin has no bone-building or osteoclast-inhibiting activity.',
    },
    clinicalPearl:
      'Alendronate has ~0.6% oral bioavailability fasting—and 0% if taken with coffee, juice, mineral water, or food! Staying upright >= 30 min prevents severe pill-induced erosive esophagitis. Avoid if CrCl < 35 mL/min.',
    hints: [
      'Inhibits farnesyl pyrophosphate synthase inside bone-resorbing osteoclasts.',
      'Only one medication on the table requires staying upright >= 30 minutes to protect the esophagus.',
      'Do not confuse morning fasting thyroid dosing with bisphosphonate esophageal precautions.',
    ],
  },
  {
    id: 'eg_08_beta_blocker_glucagon',
    specialty: 'endocrine_gi',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Refractory Propranolol Overdose Bradycardia',
    patientLine: '28F · Intentional 2.4 g Propranolol Ingestion · Hypotensive Shock',
    presentation:
      'Presents 2 hours post-ingestion with HR 34 bpm, BP 66/38 mmHg, and hypoglycemia unresponsive to atropine and IV fluid resuscitation.',
    labs: [
      { label: 'HR', value: '34 bpm', flag: 'low' },
      { label: 'BP', value: '66/38 mmHg', flag: 'low' },
      { label: 'Glucose', value: '52 mg/dL', flag: 'low' },
    ],
    activeMeds: ['Propranolol overdose (beta-1/beta-2 blockade)'],
    targetCue: 'Bypass Blocked Beta-1 Receptors · Direct Myocardial Gs-GPCR -> cAMP Activation',
    promptQuestion: 'Which high-dose IV hormone bypasses beta-blockade to restore cardiac cAMP and contractility?',
    cardIds: ['glucagon', 'atropine', 'naloxone', 'protamine'],
    correctDrugId: 'glucagon',
    distractorRationales: {
      atropine:
        'Atropine blocks vagal muscarinic tone, which already failed here and cannot bypass massive competitive beta-1 blockade.',
      naloxone:
        'Naloxone blocks mu-opioid receptors and has no inotropic/chronotropic rescue effect in beta-blocker poisoning.',
      protamine:
        'Protamine neutralizes heparin, not beta-blockers.',
    },
    clinicalPearl:
      'High-dose IV glucagon (3–10 mg bolus followed by continuous infusion due to its 8–18 min half-life) binds myocardial glucagon Gs-GPCRs, directly activating adenylyl cyclase to raise intracellular cAMP despite saturated beta-1 blockade! Pre-treat nausea with ondansetron.',
    hints: [
      'Beta-1 receptors are saturated—you need a different Gs-coupled cardiac receptor to raise cAMP.',
      'This 29-amino-acid pancreatic hormone doubles as a severe hypoglycemia rescue and beta-blocker antidote.',
      'Rule out cholinergic, opioid, and heparin antidotes.',
    ],
  },
  {
    id: 'eg_09_op_pralidoxime',
    specialty: 'endocrine_gi',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Nicotinic Muscle Fasciculations After Atropine Rescue',
    patientLine: '45M · Organophosphate Pesticide Poisoning · Post-Atropine Stabilization',
    presentation:
      'High-dose IV atropine successfully dried frothy bronchorrhea and restored heart rate to 92 bpm, but the patient still has severe generalized muscle fasciculations and diaphragmatic weakness.',
    labs: [
      { label: 'HR', value: '92 bpm', flag: 'normal' },
      { label: 'Lungs', value: 'Clear (atropinized)', flag: 'normal' },
      { label: 'RBC AChE', value: '12% activity', flag: 'low' },
    ],
    activeMeds: ['Atropine IV (muscarinic secretions controlled)'],
    targetCue: 'Reactivate Phosphorylated Acetylcholinesterase Before "Aging" · Nicotinic Rescue',
    promptQuestion: 'Which oxime antidote must be co-administered to regenerate acetylcholinesterase at neuromuscular junctions?',
    cardIds: ['pralidoxime', 'flumazenil', 'sodium_bicarbonate', 'nac'],
    correctDrugId: 'pralidoxime',
    distractorRationales: {
      flumazenil:
        'Flumazenil reverses benzodiazepines and lowers seizure threshold (dangerous in organophosphate neurotoxicity).',
      sodium_bicarbonate:
        'Sodium bicarbonate reverses TCA Na+ blockade and salicylate acidosis, not phosphorylated acetylcholinesterase.',
      nac:
        'N-acetylcysteine detoxifies acetaminophen NAPQI, not organophosphate cholinesterase inhibition.',
    },
    clinicalPearl:
      'Atropine ONLY blocks muscarinic receptors—it cannot reverse nicotinic neuromuscular paralysis (Monday/Tuesday muscle weakness & respiratory arrest). Give pralidoxime (2-PAM) promptly to cleave the organophosphate off acetylcholinesterase before irreversible "aging" occurs!',
    hints: [
      'Atropine covers muscarinic Killer B’s; another antidote covers nicotinic neuromuscular junctions.',
      'Look for the quaternary pyridinium oxime (2-PAM) that reactivates acetylcholinesterase.',
      'Eliminate benzodiazepine, TCA, and acetaminophen antidotes.',
    ],
  },
  {
    id: 'eg_10_semaglutide_men2',
    specialty: 'endocrine_gi',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'ASCVD Weight & HbA1c Reduction — Screen MTC Risk',
    patientLine: '56F · T2DM, Established Coronary Disease, BMI 34 kg/m2',
    presentation:
      'Needs a once-weekly injectable agent proven to lower MACE and drive substantial weight loss. Family history confirmed negative for medullary thyroid cancer or MEN 2.',
    labs: [
      { label: 'HbA1c', value: '8.7%', flag: 'high' },
      { label: 'eGFR', value: '74 mL/min', flag: 'normal' },
      { label: 'MTC/MEN2', value: 'Negative', flag: 'normal' },
    ],
    activeMeds: ['Metformin 1000 mg BID', 'Atorvastatin 80 mg daily', 'Aspirin 81 mg daily'],
    targetCue: 'GLP-1 Receptor Agonist · Albumin-Tethered 7-Day t½ · Slows Gastric Emptying',
    promptQuestion: 'Which once-weekly agent delivers MACE reduction and ~15% weight loss via GLP-1 agonism?',
    cardIds: ['semaglutide', 'insulin_glargine', 'metformin', 'levothyroxine'],
    correctDrugId: 'semaglutide',
    distractorRationales: {
      insulin_glargine:
        'Basal insulin glargine causes weight gain and hypoglycemia risk without independent ASCVD MACE reduction.',
      metformin:
        'The patient is already on maximum metformin 1000 mg BID.',
      levothyroxine:
        'Levothyroxine is thyroid hormone replacement, never a weight-loss or glycemic agent.',
    },
    clinicalPearl:
      'Semaglutide’s C18 fatty diacid tether binds serum albumin (> 99%), extending its half-life to ~7 days! Oral semaglutide (Rybelsus) uses SNAC enhancer and MUST be taken fasting with <= 4 oz plain water 30 min before food/meds. Boxed warning: MTC / MEN 2.',
    hints: [
      'GLP-1 receptor agonists stimulate glucose-dependent insulin release and hypothalamic satiety.',
      'Screen personal/family history for medullary thyroid carcinoma (MTC) or MEN 2.',
      'Compare the once-weekly incretin pen against basal insulin.',
    ],
  },
  {
    id: 'eg_11_metformin_contrast',
    specialty: 'endocrine_gi',
    mechanic: 'prescribe_screen',
    difficulty: 'Foundational',
    title: 'Iodinated Contrast CT & Lactic Acidosis Prevention',
    patientLine: '69M · T2DM + Stage 3b CKD · Scheduled Coronary Angiogram',
    presentation:
      'Taking full-dose diabetes therapy prior to an intra-arterial iodinated contrast procedure. Pharmacist flags holding one medication at the time of contrast and for 48 hours until renal function stabilizes.',
    labs: [
      { label: 'eGFR', value: '36 mL/min', flag: 'low' },
      { label: 'HbA1c', value: '7.1%', flag: 'normal' },
      { label: 'Lactate', value: '1.1 mmol/L', flag: 'normal' },
    ],
    activeMeds: ['Metformin 1000 mg BID', 'Insulin Glargine 18 U QHS', 'Atorvastatin 40 mg daily'],
    targetCue: '90% Renal OCT2/MATE Clearance · Hold for Contrast AKI Risk (eGFR < 30 Contraindicated)',
    promptQuestion: 'Which antidiabetic must be held around iodinated contrast at eGFR 36 mL/min to prevent lactic acidosis?',
    cardIds: ['metformin', 'insulin_glargine', 'semaglutide', 'omeprazole'],
    correctDrugId: 'metformin',
    distractorRationales: {
      insulin_glargine:
        'Basal insulin does not cause lactic acidosis and should generally be continued (with modest reduction if NPO).',
      semaglutide:
        'Semaglutide does not accumulate in renal failure to cause mitochondrial Complex I lactic acidosis.',
      omeprazole:
        'Omeprazole is hepatically cleared and unrelated to contrast-associated lactic acidosis.',
    },
    clinicalPearl:
      'Metformin inhibits mitochondrial Complex I and relies 90% on renal OCT2/MATE secretion. Hold at the time of iodinated contrast if eGFR is 30–60, liver disease/HF is present, or intra-arterial contrast is used—recheck eGFR 48 hours later before restarting!',
    hints: [
      'Identify the biguanide cleared 90% unchanged by renal tubular secretion.',
      'Inhibits hepatic gluconeogenesis via mitochondrial Complex I; accumulation triggers Type B lactic acidosis.',
      'Only one drug here is contraindicated below eGFR 30 mL/min.',
    ],
  },
  {
    id: 'eg_12_ondansetron_qtc',
    specialty: 'endocrine_gi',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Chemotherapy-Induced Nausea & The 16 mg IV QTc Cap',
    patientLine: '52F · Cisplatin Chemotherapy · Mild Baseline QTc Borderline',
    presentation:
      'Needs potent antiemetic blockade at both peripheral vagal gut afferents and the central chemoreceptor trigger zone, while respecting the 16 mg maximum single IV dose.',
    labs: [
      { label: 'QTc', value: '458 ms', flag: 'high' },
      { label: 'K+', value: '4.1 mEq/L', flag: 'normal' },
      { label: 'Mg2+', value: '2.0 mg/dL', flag: 'normal' },
    ],
    activeMeds: ['Cisplatin IV', 'Dexamethasone 12 mg IV'],
    targetCue: 'Target Receptor: Peripheral Vagal & Central CTZ 5-HT3 Ion Channel',
    promptQuestion: 'Play the selective 5-HT3 antagonist antiemetic requiring QTc vigilance and a 16 mg single IV cap.',
    cardIds: ['ondansetron', 'omeprazole', 'albuterol', 'flumazenil'],
    correctDrugId: 'ondansetron',
    distractorRationales: {
      omeprazole:
        'Omeprazole suppresses gastric acid via H+/K+-ATPase and does not block CTZ 5-HT3 emesis pathways.',
      albuterol:
        'Albuterol is a beta-2 bronchodilator with no antiemetic activity.',
      flumazenil:
        'Flumazenil reverses benzodiazepines and has no antiemetic role.',
    },
    clinicalPearl:
      'Because 32 mg single IV doses caused dose-dependent QTc prolongation and Torsades de Pointes, FDA removed that dose—cap single IV ondansetron at 16 mg and replete K+/Mg2+ when pairing with other QTc-prolonging drugs (e.g., azithromycin, haloperidol)!',
    hints: [
      'Chemotherapy releases enterochromaffin serotonin onto vagal 5-HT3 channels.',
      'Select the "-setron" antiemetic (note its 16 mg single IV QTc cap).',
      'Only one antiemetic appears in your hand.',
    ],
  },

  // ================= AI, PGX & PHARMACOINFORMATICS (9 CASES) =================
  {
    id: 'ai_01_cdss_statin_cyp3a4',
    specialty: 'ai_informatics',
    mechanic: 'prescribe_screen',
    difficulty: 'Foundational',
    title: 'CDSS Alert Fatigue: CYP3A4 Macrolide & Safe Statin Swap',
    patientLine: '63M · H. pylori / Bronchitis on Clarithromycin · Hyperlipidemia',
    presentation:
      'Your EHR clinical decision support system (CDSS) pops up 12 low-priority alerts; buried inside is an unhighlighted conflict with a CYP3A4-dependent statin alongside clarithromycin. Select the hydrophilic statin that bypasses CYP3A4.',
    labs: [
      { label: 'CK', value: '142 U/L', flag: 'normal' },
      { label: 'LDL-C', value: '158 mg/dL', flag: 'high' },
      { label: 'eGFR', value: '68 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Clarithromycin 500 mg BID (CYP3A4 inhibitor)', 'Lisinopril 10 mg daily'],
    targetCue: 'CDSS Verification: Bypass CYP3A4 Inhibition During Macrolide Course',
    promptQuestion: 'Override the alert-fatigued CYP3A4 statin recommendation by selecting the non-CYP3A4 statin.',
    cardIds: ['pravastatin', 'atorvastatin', 'amiodarone', 'allopurinol'],
    correctDrugId: 'pravastatin',
    distractorRationales: {
      atorvastatin:
        'Atorvastatin is partially metabolized by CYP3A4 and its exposure rises alongside strong CYP3A4 inhibitors like clarithromycin (though less than simvastatin).',
      amiodarone:
        'Amiodarone is a Class III antiarrhythmic and CYP inhibitor, not a lipid-lowering statin.',
      allopurinol:
        'Allopurinol lowers uric acid via xanthine oxidase and does not treat hyperlipidemia.',
    },
    clinicalPearl:
      'Clinical decision support helps catch interactions, but alert fatigue leads pharmacists to miss critical CYP3A4 conflicts. Hydrophilic pravastatin (cleared via sulfation) avoids CYP3A4 drug-interaction spikes.',
    hints: [
      'Clarithromycin strongly inhibits CYP3A4, risking statin myopathy.',
      'Choose the hydrophilic statin eliminated without CYP3A4 oxidation.',
      'Look for the statin cleared mainly by sulfation.',
    ],
  },
  {
    id: 'ai_02_chatbot_cough_triage',
    specialty: 'ai_informatics',
    mechanic: 'antidote_triage',
    difficulty: 'Foundational',
    title: 'Symptom Chatbot Misses Bradykinin Cough Red Flag',
    patientLine: '56F · Automated Refill Bot Inquiry · Persistent Dry Cough',
    presentation:
      'An automated pharmacy chatbot told this patient her dry hacking cough is "likely seasonal allergies" and scheduled a routine refill. During a brief empathetic phone check-in, you recognize ACE-inhibitor cough and convert her RAAS blocker safely.',
    labs: [
      { label: 'BP', value: '134/82 mmHg', flag: 'normal' },
      { label: 'K+', value: '4.3 mEq/L', flag: 'normal' },
      { label: 'eGFR', value: '74 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Lisinopril 20 mg daily (started 4 weeks ago)', 'Metformin 1000 mg BID'],
    targetCue: 'Human Oversight: Replace Bradykinin-Triggering Agent Safely',
    promptQuestion: 'Select the AT1-selective RAAS agent that maintains blood pressure and renal protection without bradykinin cough.',
    cardIds: ['losartan', 'lisinopril', 'sacubitril_valsartan', 'amlodipine'],
    correctDrugId: 'losartan',
    distractorRationales: {
      lisinopril:
        'Continuing lisinopril perpetuates bradykinin accumulation in bronchial tissue and misses the human counseling cue.',
      sacubitril_valsartan:
        'Sacubitril-valsartan is indicated for HFrEF (not uncomplicated hypertension) and requires a 36-hour ACEi washout.',
      amlodipine:
        'Amlodipine lowers BP without RAAS nephroprotection in diabetes.',
    },
    clinicalPearl:
      'Automated chatbots often miss medication-induced symptoms because they lack longitudinal medication context. Empathetic pharmacist listening catches ACEi bradykinin cough early and preserves trust.',
    hints: [
      'The cough started 4 weeks after beginning an ACE inhibitor.',
      'Switch to an AT1 receptor blocker that does not block kininase II.',
      'Preserves renal protection in diabetes without elevating bradykinin.',
    ],
  },
  {
    id: 'ai_03_pgx_abacavir_hardstop',
    specialty: 'ai_informatics',
    mechanic: 'prescribe_screen',
    difficulty: 'Foundational',
    title: 'Pharmacogenomic Hard-Stop: Mandatory HLA-B*57:01 Verification',
    patientLine: '34M · Newly Diagnosed HIV-1 · Pre-ART Genetics Pending',
    presentation:
      'An EHR order set pre-checks a combination antiretroviral tablet containing a guanosine NRTI. Your pharmacogenomic CDSS fires a hard-stop reminder requiring HLA-B*57:01 negative documentation before dispensing which high-risk NRTI?',
    labs: [
      { label: 'HLA-B*57:01', value: 'Negative', flag: 'normal' },
      { label: 'HIV RNA', value: '42,000 copies/mL', flag: 'high' },
      { label: 'CrCl', value: '105 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Dolutegravir 50 mg + Lamivudine 300 mg (awaiting 3rd-agent clearance)'],
    targetCue: 'PGx Hard-Stop Verified: Safe-to-Dispense Guanosine NRTI',
    promptQuestion: 'After confirming HLA-B*57:01 is negative, play the NRTI governed by this mandatory PGx safety check.',
    cardIds: ['abacavir', 'acyclovir', 'allopurinol', 'oseltamivir'],
    correctDrugId: 'abacavir',
    distractorRationales: {
      acyclovir:
        'Acyclovir treats herpesviruses (HSV/VZV) and does not require HLA-B*57:01 testing.',
      allopurinol:
        'Allopurinol carries an HLA-B*58:01 (not *57:01) hypersensitivity association for gout.',
      oseltamivir:
        'Oseltamivir is an influenza neuraminidase inhibitor unrelated to HIV or HLA-B*57:01.',
    },
    clinicalPearl:
      'Abacavir hypersensitivity reaction (HSR) occurs in ~5–8% without screening and can be fatal upon rechallenge. Well-designed CDSS hard-stops requiring HLA-B*57:01 verification are a model of Augmented Healthcare.',
    hints: [
      'This Boxed Warning NRTI is paired with dolutegravir and lamivudine in Triumeq.',
      'Negative HLA-B*57:01 rules out its immune-mediated hypersensitivity syndrome.',
      'Never rechallenge this HIV NRTI once hypersensitivity is suspected.',
    ],
  },
  {
    id: 'ai_04_cyp2c19_clopidogrel_pgx',
    specialty: 'ai_informatics',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'PGx CDSS Alert: CYP2C19 *2/*2 Loss-of-Function Post-PCI',
    patientLine: '61M · Day 1 Post-Drug-Eluting Stent (ACS) · PGx Result Back',
    presentation:
      'Standard automated order sets defaulted to clopidogrel after stent placement. Overnight pharmacogenomic CDSS flags homozygous CYP2C19 *2/*2 poor metabolizer status—meaning clopidogrel cannot be bioactivated. Switch immediately.',
    labs: [
      { label: 'CYP2C19', value: '*2/*2 Poor Metab', flag: 'high' },
      { label: 'Platelets', value: '235 ×10^3/uL', flag: 'normal' },
      { label: 'eGFR', value: '72 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Aspirin 81 mg daily', 'Atorvastatin 80 mg daily', 'Metoprolol 50 mg daily'],
    targetCue: 'Override Legacy Default: Direct Active P2Y12 Inhibitor (No CYP2C19 Needed)',
    promptQuestion: 'Play the reversible P2Y12 inhibitor that retains full antiplatelet potency in CYP2C19 poor metabolizers.',
    cardIds: ['ticagrelor', 'clopidogrel', 'apixaban', 'warfarin'],
    correctDrugId: 'ticagrelor',
    distractorRationales: {
      clopidogrel:
        'Clopidogrel is an inactive prodrug requiring two-step CYP2C19 activation; CYP2C19 *2/*2 carriers face high stent-thrombosis risk.',
      apixaban:
        'Apixaban is a Factor Xa anticoagulant, not a P2Y12 platelet inhibitor for dual antiplatelet therapy.',
      warfarin:
        'Warfarin inhibits vitamin K epoxide reductase and does not replace P2Y12 blockade post-PCI.',
    },
    clinicalPearl:
      'Pharmacogenomic CDSS shines when paired with pharmacist follow-through: switching CYP2C19 poor metabolizers from clopidogrel to ticagrelor (remembering the 81 mg aspirin cap!) prevents catastrophic stent thrombosis.',
    hints: [
      'Clopidogrel fails because it needs hepatic CYP2C19 bioactivation.',
      'Pick the direct-acting reversible P2Y12 antagonist (CPTP class).',
      'Watch out for its Boxed Warning if aspirin exceeds 100 mg/day.',
    ],
  },
  {
    id: 'ai_05_opaque_doac_renal_bias',
    specialty: 'ai_informatics',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'Uncalibrated EHR Renal Algorithm & Frail Elderly AFib',
    patientLine: '83F · 51 kg · Non-Valvular AFib · SCr 1.4 mg/dL',
    presentation:
      'An automated anticoagulation calculator uses race/muscle-unadjusted eGFR (58 mL/min) and approves standard full-dose enoxaparin/dabigatran. Recalculating Cockcroft-Gault reveals CrCl 29 mL/min—select the anticoagulant with the lowest renal clearance.',
    labs: [
      { label: 'CrCl (CG)', value: '29 mL/min', flag: 'low' },
      { label: 'SCr', value: '1.4 mg/dL', flag: 'high' },
      { label: 'Weight', value: '51 kg', flag: 'low' },
    ],
    activeMeds: ['Metoprolol Succinate 50 mg daily', 'Furosemide 20 mg daily'],
    targetCue: 'Audit Algorithm Output: Choose Lowest Renal-Dependency Oral Anticoagulant',
    promptQuestion: 'Select the DOAC with only ~27% renal elimination (reduced to 2.5 mg BID by ABC criteria).',
    cardIds: ['apixaban', 'enoxaparin', 'warfarin', 'ticagrelor'],
    correctDrugId: 'apixaban',
    distractorRationales: {
      enoxaparin:
        'Enoxaparin is predominantly renally cleared and accumulates dangerously when CrCl < 30 mL/min without anti-Xa monitoring and dose reduction.',
      warfarin:
        'While warfarin is non-renally cleared, apixaban has lower intracranial hemorrhage risk and predictable dosing in CKD.',
      ticagrelor:
        'Antiplatelet therapy alone is inferior to oral anticoagulation for AFib stroke prevention.',
    },
    clinicalPearl:
      'Black-box renal calculators often overestimate kidney function in frail, low-weight older adults ("normal" SCr masks low muscle mass). Transparent pharmacist Cockcroft-Gault checks prevent major bleeds.',
    hints: [
      'Patient meets Age >= 80 and Weight <= 60 kg (2 of 3 apixaban ABC criteria!).',
      'Only ~27% of this Factor Xa inhibitor is cleared by the kidneys.',
      'Requires 2.5 mg BID dose reduction here.',
    ],
  },
  {
    id: 'ai_06_linezolid_serotonin_miss',
    specialty: 'ai_informatics',
    mechanic: 'antidote_triage',
    difficulty: 'Clinical',
    title: 'Refill Engine Misses Inpatient-Outpatient Serotonin Cascade',
    patientLine: '49M · Hospital-Acquired MRSA Pneumonia · Home SSRI Active',
    presentation:
      'An outpatient portal did not sync with inpatient microbiology: an automated antibiotic recommender suggests oral linezolid for convenience alongside home sertraline 150 mg, risking serotonin syndrome. Select the safe IV anti-MRSA agent for pneumonia.',
    labs: [
      { label: 'Sputum Cx', value: 'MRSA', flag: 'high' },
      { label: 'SCr', value: '0.9 mg/dL', flag: 'normal' },
      { label: 'Temp', value: '38.7 °C', flag: 'high' },
    ],
    activeMeds: ['Sertraline 150 mg daily (home med)', 'Albuterol PRN'],
    targetCue: 'Catch Cross-System Data Gap: Safe Anti-MRSA Pneumonia Therapy',
    promptQuestion: 'Play the first-line anti-MRSA pneumonia therapy that avoids linezolid’s MAOI serotonin toxicity.',
    cardIds: ['vancomycin', 'linezolid', 'meropenem', 'ceftriaxone'],
    correctDrugId: 'vancomycin',
    distractorRationales: {
      linezolid:
        'Linezolid is a weak reversible MAO inhibitor; combining it with high-dose sertraline precipitates serotonin syndrome (clonus, hyperthermia, agitation).',
      meropenem:
        'Meropenem covers ESBL/Pseudomonas, NOT methicillin-resistant Staphylococcus aureus (MRSA).',
      ceftriaxone:
        'Standard cephalosporins lack PBP2a binding and have zero activity against MRSA.',
    },
    clinicalPearl:
      'Fragmented EHR data leads automated tools to overlook active home SSRIs. Pharmacists reconciling across care transitions prevent linezolid-SSRI serotonin toxicity (and remember: daptomycin is inactivated by pulmonary surfactant, leaving vancomycin!).',
    hints: [
      'Linezolid inhibits MAO and conflicts with the patient’s home SSRI.',
      'Meropenem and ceftriaxone cannot bind MRSA PBP2a.',
      'Select the glycopeptide requiring AUC/MIC 400–600 monitoring.',
    ],
  },
  {
    id: 'ai_07_allopurinol_equity_pgx',
    specialty: 'ai_informatics',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Training-Data Bias: HLA-B*58:01 Positive Gout Prophylaxis',
    patientLine: '59M · Han Chinese Ancestry · Tophaceous Gout + CKD 3 · HLA-B*58:01 (+)',
    presentation:
      'A clinical algorithm trained on unrepresentative cohorts auto-recommends standard allopurinol 300 mg without ancestry-calibrated pharmacogenomic prompts. You ordered HLA-B*58:01 testing and it returned POSITIVE (high fatal SJS/TEN risk). Pick the non-purine alternative.',
    labs: [
      { label: 'HLA-B*58:01', value: 'POSITIVE', flag: 'high' },
      { label: 'Uric Acid', value: '9.6 mg/dL', flag: 'high' },
      { label: 'eGFR', value: '44 mL/min', flag: 'low' },
    ],
    activeMeds: ['Colchicine 0.6 mg daily (flare prophylaxis)', 'Amlodipine 5 mg daily'],
    targetCue: 'Mitigate Algorithmic Bias: Non-Purine Xanthine Oxidase Alternative',
    promptQuestion: 'Play the non-purine xanthine oxidase inhibitor indicated when HLA-B*58:01 precludes allopurinol.',
    cardIds: ['febuxostat', 'allopurinol', 'abacavir', 'losartan'],
    correctDrugId: 'febuxostat',
    distractorRationales: {
      allopurinol:
        'Initiating allopurinol in an HLA-B*58:01-positive patient carries severe risk of fatal Stevens-Johnson syndrome / toxic epidermal necrolysis (SJS/TEN).',
      abacavir:
        'Abacavir is an HIV NRTI (linked to HLA-B*57:01) with no effect on uric acid.',
      losartan:
        'Losartan has only mild uricosuric activity and does not replace dedicated xanthine oxidase inhibition in severe tophaceous gout.',
    },
    clinicalPearl:
      'Models trained on skewed populations miss genetic risks in underrepresented groups (Aqeel & John, 2026: Information Misuse / Algorithmic Bias). Pharmacist PGx vigilance avoids fatal allopurinol SJS/TEN while counseling on febuxostat’s CV warning.',
    hints: [
      'HLA-B*58:01 positivity strictly contraindicates allopurinol.',
      'Select the non-purine arylthiazole xanthine oxidase inhibitor.',
      'Carries a CV mortality Boxed Warning, reserved for allopurinol intolerance.',
    ],
  },
  {
    id: 'ai_08_allopurinol_thiopurine_trap',
    specialty: 'ai_informatics',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Pharmacovigilance Audit: Purine Metabolism & Xanthine Oxidase',
    patientLine: '67M · Tumor Lysis Prophylaxis Needed · Starting Low-Dose Gout/Urate Care',
    presentation:
      'A clinical decision algorithm evaluates two separate outpatient clinics: one managing acute hyperuricemia in an allopurinol-naive European patient (HLA-B*58:01 negative, no thiopurines, normal CV history with recent MI), where guideline-first xanthine oxidase inhibition is preferred over febuxostat.',
    labs: [
      { label: 'HLA-B*58:01', value: 'Negative', flag: 'normal' },
      { label: 'Uric Acid', value: '10.4 mg/dL', flag: 'high' },
      { label: 'eGFR', value: '62 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Aspirin 81 mg daily', 'Metoprolol Succinate 50 mg daily (prior MI)'],
    targetCue: 'Apply Guideline & CV Risk Context: First-Line Xanthine Oxidase Inhibitor',
    promptQuestion: 'Given negative HLA-B*58:01 and recent MI history, select the guideline-preferred first-line urate-lowering drug.',
    cardIds: ['allopurinol', 'febuxostat', 'pravastatin', 'ticagrelor'],
    correctDrugId: 'allopurinol',
    distractorRationales: {
      febuxostat:
        'Febuxostat carries an FDA Boxed Warning for increased cardiovascular death compared to allopurinol and should NOT be used first-line in a patient with prior MI when allopurinol is safe.',
      pravastatin:
        'Pravastatin treats hyperlipidemia, not hyperuricemia.',
      ticagrelor:
        'Ticagrelor is a P2Y12 antiplatelet agent with no xanthine oxidase inhibition.',
    },
    clinicalPearl:
      'Just as bias requires avoiding allopurinol in HLA-B*58:01(+) patients, clinical context forbids defaulting to febuxostat in patients with ASCVD when allopurinol is safe—always cross-check azathioprine/6-MP for fatal xanthine oxidase drug interactions!',
    hints: [
      'Patient has a history of myocardial infarction—avoid febuxostat’s CV Boxed Warning.',
      'HLA-B*58:01 is negative and no thiopurines are present.',
      'Pick the first-line purine-analog xanthine oxidase inhibitor.',
    ],
  },
  {
    id: 'ai_09_sud_algorithm_empathy',
    specialty: 'ai_informatics',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Algorithmic Risk Flag vs. Human-Centered OUD Continuity',
    patientLine: '36F · Stable in Opioid Use Disorder Care · Algorithmic Flag Triggered',
    presentation:
      'An automated PDMP risk-scoring engine flagged an old ER visit from 14 months ago and recommended abruptly stopping her opioid use disorder (OUD) maintenance therapy. After compassionate verification and privacy protection, preserve safe maintenance care.',
    labs: [
      { label: 'COWS Score', value: '0 (Stable)', flag: 'normal' },
      { label: 'Resp Rate', value: '16 /min', flag: 'normal' },
      { label: 'ALT / AST', value: '24 / 22 U/L', flag: 'normal' },
    ],
    activeMeds: ['Take-Home Naloxone Nasal Spray', 'Sertraline 50 mg daily'],
    targetCue: 'Defend Therapeutic Alliance: Safe Partial-Agonist Maintenance Therapy',
    promptQuestion: 'Reject abrupt algorithmic cutoff and select the high-affinity partial mu-agonist maintaining OUD stability.',
    cardIds: ['buprenorphine_naloxone', 'morphine', 'naloxone', 'diazepam'],
    correctDrugId: 'buprenorphine_naloxone',
    distractorRationales: {
      morphine:
        'Full mu-agonist morphine lacks buprenorphine’s respiratory ceiling effect and is inappropriate here.',
      naloxone:
        'Standalone parenteral/intranasal naloxone is for acute overdose reversal and would precipitate severe withdrawal if substituted for maintenance.',
      diazepam:
        'Benzodiazepines do not treat opioid use disorder and increase overdose risk if combined with opioids.',
    },
    clinicalPearl:
      'As highlighted in Aqeel & John (2026), uncontextualized algorithmic flags can erode patient trust and cause real harm (AI-Dehumanization & Information Misuse). Abruptly cutting off buprenorphine-naloxone triggers withdrawal and fatal relapse.',
    hints: [
      'Combines a partial mu-opioid agonist (ceiling effect) with an abuse-deterrent antagonist.',
      'Administered sublingually so the antagonist stays unabsorbed unless injected.',
      'First-line office-based OUD stabilization therapy.',
    ],
  },
  ...SYSTEM_EXPANSION_CASES,
];
