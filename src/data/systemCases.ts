import { ClinicalCase } from '../types/pharma';

export const SYSTEM_EXPANSION_CASES: ClinicalCase[] = [
  // ================= RESPIRATORY & PULMONARY (5) =================
  {
    id: 'resp_01_copd_lama',
    specialty: 'respiratory',
    mechanic: 'prescribe_screen',
    difficulty: 'Foundational',
    title: 'GOLD Group B COPD · Persistent Dyspnea Maintenance',
    patientLine: '66M · COPD (FEV1 58% predicted, mMRC 2) · 1 Exacerbation Past Year',
    presentation:
      'Former smoker reports daily exertional breathlessness while walking on level ground despite using rescue albuterol several times weekly. Initiate a once-daily long-acting anticholinergic maintenance bronchodilator targeting airway M3 receptors.',
    labs: [
      { label: 'FEV1 / FVC', value: '0.56 (Obstructive)', flag: 'low' },
      { label: 'Blood Eosinophils', value: '90 cells/µL', flag: 'normal' },
      { label: 'CrCl', value: '74 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Albuterol HFA PRN', 'Lisinopril 10 mg daily'],
    targetCue: 'Select Long-Acting Muscarinic Antagonist (M3 Blockade)',
    promptQuestion: 'Choose the once-daily LAMA controller that reduces COPD exacerbations without inhaled steroids.',
    cardIds: ['tiotropium', 'albuterol', 'montelukast', 'roflumilast'],
    correctDrugId: 'tiotropium',
    distractorRationales: {
      albuterol:
        'Albuterol is a short-acting beta-2 rescue reliever (4–6 h) already used PRN and does not provide 24-hour COPD maintenance control.',
      montelukast:
        'Leukotriene antagonists are not effective or guideline-recommended maintenance bronchodilators for COPD.',
      roflumilast:
        'PDE4 inhibitor roflumilast is reserved as add-on therapy for severe COPD (FEV1 < 50%) with chronic bronchitis and frequent exacerbations despite inhaled controllers.',
    },
    clinicalPearl:
      'Long-acting muscarinic antagonists (LAMAs) like tiotropium outlast short-acting SABA rescue via slow M3 dissociation and are preferred initial COPD maintenance alongside LABAs; warn patients never to swallow HandiHaler capsules.',
    hints: [
      'Targets bronchial M3 muscarinic receptors to suppress vagal bronchoconstriction for 24 hours.',
      'Delivered by HandiHaler (dry powder capsule—never swallow!) or Respimat soft mist.',
      'First-line once-daily LAMA controller in GOLD COPD.',
    ],
  },
  {
    id: 'resp_02_asthma_smart',
    specialty: 'respiratory',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'GINA Track 1 · Single Maintenance & Reliever Therapy (SMART)',
    patientLine: '29F · Mild-Moderate Persistent Asthma · Frequent SABA Reliance',
    presentation:
      'College swimmer experiences chest tightness 3–4 days/week and uses albuterol alone nearly daily, risking unopposed airway inflammation. Transition to the guideline-preferred single inhaler pairing anti-inflammatory ICS with a rapid-onset (3 min), long-acting beta-2 agonist for BOTH controller and reliever doses.',
    labs: [
      { label: 'FeNO', value: '48 ppb (Elevated)', flag: 'high' },
      { label: 'Peak Flow', value: '78% personal best', flag: 'low' },
      { label: 'Potassium', value: '4.1 mEq/L', flag: 'normal' },
    ],
    activeMeds: ['Albuterol HFA PRN (overused)'],
    targetCue: 'Select Dual Controller + Rapid Reliever (ICS + Fast LABA)',
    promptQuestion: 'Which combination inhaler uniquely supports GINA Track 1 SMART therapy as both daily controller and rescue reliever?',
    cardIds: [
      'budesonide_formoterol',
      'fluticasone_salmeterol',
      'tiotropium',
      'montelukast',
    ],
    correctDrugId: 'budesonide_formoterol',
    distractorRationales: {
      fluticasone_salmeterol:
        'Salmeterol has a slow onset (~15–30 minutes) and cannot safely serve as an acute reliever inhaler in SMART regimens.',
      tiotropium:
        'Tiotropium is a slow maintenance LAMA add-on and lacks both rapid onset and ICS anti-inflammatory suppression.',
      montelukast:
        'Montelukast is an oral tablet with no acute bronchodilator rescue effect and carries a neuropsychiatric boxed warning.',
    },
    clinicalPearl:
      'Formoterol is both rapid-acting (~1–3 min onset) and long-acting (12 h), making budesonide-formoterol uniquely suited for SMART (Single Maintenance and Reliever Therapy)—preventing SABA-only severe asthma exacerbations.',
    hints: [
      'Combines an inhaled corticosteroid with a beta-2 agonist that starts working within 1–3 minutes.',
      'Salmeterol is too slow for rescue, whereas formoterol acts as fast as albuterol.',
      'Counsel the patient to rinse and spit with water after every scheduled or rescue puff.',
    ],
  },
  {
    id: 'resp_03_montelukast_neuro',
    specialty: 'respiratory',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'Aspirin-Exacerbated Respiratory Disease (AERD) & Leukotriene Surge',
    patientLine: '37M · Asthma, Nasal Polyps & Severe Ibuprofen Bronchospasm',
    presentation:
      'Patient with adult-onset asthma and nasal polyps developed acute wheezing after taking ibuprofen (COX-1 shunting arachidonic acid toward cysteinyl leukotrienes). Add an oral CysLT1 receptor antagonist while counseling on its neuropsychiatric FDA boxed warning.',
    labs: [
      { label: 'Blood Eosinophils', value: '520 cells/µL', flag: 'high' },
      { label: 'ALT / AST', value: '24 / 20 U/L', flag: 'normal' },
      { label: 'Mood Screen', value: 'Negative (Baseline)', flag: 'normal' },
    ],
    activeMeds: ['Budesonide-Formoterol 160/4.5 mcg BID', 'Fluticasone nasal spray'],
    targetCue: 'Block Cysteinyl Leukotriene Receptor (CysLT1)',
    promptQuestion: 'Select the evening oral leukotriene receptor blocker tailored for AERD, and monitor mood/sleep closely.',
    cardIds: ['montelukast', 'roflumilast', 'omalizumab', 'tiotropium'],
    correctDrugId: 'montelukast',
    distractorRationales: {
      roflumilast:
        'Roflumilast is a PDE4 inhibitor indicated for severe COPD with chronic bronchitis, not AERD asthma.',
      omalizumab:
        'Omalizumab is an injectable anti-IgE biologic reserved for severe refractory allergic asthma guided by IgE/weight.',
      tiotropium:
        'Tiotropium targets M3 muscarinic tone rather than excess leukotriene production in NSAID-exacerbated respiratory disease.',
    },
    clinicalPearl:
      'COX-1 inhibition in AERD (Samter triad: asthma + nasal polyps + NSAID sensitivity) shunts arachidonic acid into cysteinyl leukotrienes. Always weigh montelukast’s FDA boxed warning for neuropsychiatric events (agitation, vivid dreams, suicidality).',
    hints: [
      'Oral tablet taken once daily in the evening that competitively blocks LTD4 at CysLT1.',
      'Carries a prominent FDA boxed warning for agitation, nightmares, depression, and suicidality.',
      'Avoid using for uncomplicated allergic rhinitis when nasal steroids or antihistamines suffice.',
    ],
  },
  {
    id: 'resp_04_severe_ige_asthma',
    specialty: 'respiratory',
    mechanic: 'receptor_lock',
    difficulty: 'Board Prep',
    title: 'Severe Allergic Asthma · Targeted Anti-IgE Biologic Escalation',
    patientLine: '41F · Severe Persistent Allergic Asthma · 3 Oral Steroid Courses/Yr',
    presentation:
      'Despite verified adherence to high-dose ICS-LABA plus tiotropium, patient requires repeated prednisone bursts triggered by dust-mite and cat dander sensitization. Baseline serum IgE is 340 IU/mL (weight 68 kg). Initiate the targeted subcutaneous monoclonal antibody that neutralizes circulating free IgE.',
    labs: [
      { label: 'Total Serum IgE', value: '340 IU/mL', flag: 'high' },
      { label: 'Specific Aeroallergen IgE', value: 'Positive (Dust Mite)', flag: 'high' },
      { label: 'Body Weight', value: '68 kg', flag: 'normal' },
    ],
    activeMeds: ['Fluticasone-Salmeterol 500/50 BID', 'Tiotropium Respimat daily'],
    targetCue: 'Neutralize Circulating Free IgE (FcεRI Domain Blockade)',
    promptQuestion: 'Select the subcutaneous biologic dosed strictly by baseline total serum IgE and body weight.',
    cardIds: ['omalizumab', 'dupilumab', 'budesonide_formoterol', 'roflumilast'],
    correctDrugId: 'omalizumab',
    distractorRationales: {
      dupilumab:
        'Dupilumab targets IL-4Rα/IL-13 for eosinophilic/oral-steroid-dependent phenotypes regardless of total serum IgE levels.',
      budesonide_formoterol:
        'Patient is already on high-dose ICS/LABA therapy and requires targeted biologic add-on rather than switching inhalers.',
      roflumilast:
        'Roflumilast is indicated for COPD with chronic bronchitis, not IgE-mediated severe allergic asthma.',
    },
    clinicalPearl:
      'Omalizumab binds free IgE and prevents mast cell/basophil sensitization, requiring clinic observation post-injection for delayed anaphylaxis (possible even > 1 year after initiation!). Do not re-measure IgE to adjust dose once started.',
    hints: [
      'Recombinant humanized IgG1 antibody targeting the Cε3 region of free IgE.',
      'Dosing chart uses baseline serum IgE (30–700 IU/mL) + patient weight in kg.',
      'Requires post-injection monitoring for delayed anaphylaxis.',
    ],
  },
  {
    id: 'resp_05_copd_pde4',
    specialty: 'respiratory',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Severe COPD · Chronic Bronchitis Phenotype Add-On',
    patientLine: '71M · GOLD E COPD · FEV1 38% · Productive Cough & Frequent Flares',
    presentation:
      'Patient has chronic daily sputum production for > 3 months/year and suffered 3 hospitalizations for COPD exacerbations despite maximal triple inhaled therapy (LAMA + LABA + ICS). Liver function is normal (Child-Pugh A). Add the oral anti-inflammatory PDE4 inhibitor.',
    labs: [
      { label: 'FEV1 (Post-BD)', value: '38% predicted', flag: 'low' },
      { label: 'AST / ALT / Bilirubin', value: '22 / 19 U/L · 0.6 mg/dL', flag: 'normal' },
      { label: 'BMI', value: '27.4 kg/m²', flag: 'normal' },
    ],
    activeMeds: ['Tiotropium 18 mcg daily', 'Budesonide-Formoterol 160/4.5 BID'],
    targetCue: 'Inhibit Neutrophilic Airway Phosphodiesterase-4 (Raise cAMP)',
    promptQuestion: 'Select the oral PDE4 inhibitor indicated specifically for severe COPD with chronic bronchitis exacerbations.',
    cardIds: ['roflumilast', 'montelukast', 'fluticasone_salmeterol', 'tiotropium'],
    correctDrugId: 'roflumilast',
    distractorRationales: {
      montelukast:
        'Montelukast blocks CysLT1 in asthma/AERD and lacks benefit in neutrophilic COPD chronic bronchitis.',
      fluticasone_salmeterol:
        'Patient is already receiving full ICS-LABA-LAMA triple therapy; adding a duplicate ICS-LABA risks steroid overdose and arrhythmias.',
      tiotropium:
        'Patient is already taking daily tiotropium maintenance.',
    },
    clinicalPearl:
      'Roflumilast cuts exacerbations ONLY in severe COPD (FEV1 < 50%) with chronic bronchitis phenotype; it is contraindicated in Child-Pugh B/C hepatic disease and requires weight & mood monitoring.',
    hints: [
      'Selective phosphodiesterase-4 (PDE4) inhibitor acting via intracellular cAMP elevation.',
      'Not an acute bronchodilator; converted by CYP3A4/1A2 to active N-oxide metabolite.',
      'Monitor body weight and depressive symptoms; contraindicated in moderate-severe cirrhosis.',
    ],
  },

  // ================= HEMATOLOGY & IMMUNE (5) =================
  {
    id: 'hi_01_anaphylaxis_im',
    specialty: 'hematology_immune',
    mechanic: 'antidote_triage',
    difficulty: 'Foundational',
    title: 'Acute Anaphylaxis · Airway Edema & Distributive Shock',
    patientLine: '24F · Amoxicillin Infusion Reaction · Stridor & BP 76/44 mmHg',
    presentation:
      'Minutes after oral amoxicillin, patient develops diffuse urticaria, hoarse voice, inspiratory stridor, and hypotension. Reverse mast-cell shock and laryngeal edema immediately with the ONLY first-line life-saving agent injected IM into the anterolateral thigh.',
    labs: [
      { label: 'Blood Pressure', value: '76 / 44 mmHg', flag: 'low' },
      { label: 'SpO2', value: '88% on room air', flag: 'low' },
      { label: 'Heart Rate', value: '132 bpm', flag: 'high' },
    ],
    activeMeds: ['Amoxicillin 500 mg (STOPPED)'],
    targetCue: 'Immediate Alpha-1 Vasoconstriction + Beta-2 Bronchodilation',
    promptQuestion: 'Deploy the mandatory first-line IM anterolateral thigh rescue drug for anaphylaxis.',
    cardIds: ['epinephrine', 'atropine', 'albuterol', 'dupilumab'],
    correctDrugId: 'epinephrine',
    distractorRationales: {
      atropine:
        'Atropine blocks muscarinic receptors for bradycardia/cholinergic toxicity and fails to reverse anaphylactic histamine shock or airway swelling.',
      albuterol:
        'Inhaled albuterol addresses bronchospasm only as an adjunct; it cannot reverse lethal laryngeal edema or distributive hypotension.',
      dupilumab:
        'Dupilumab is a chronic IL-4Rα biologic taking weeks to act and has zero role in acute anaphylaxis.',
    },
    clinicalPearl:
      'Delay in IM epinephrine into the vastus lateralis (anterolateral thigh) is the #1 preventable cause of anaphylaxis mortality! Antihistamines and steroids are strictly second-line adjuncts.',
    hints: [
      'Agonist at alpha-1 (reverses shock/edema), beta-1 (supports perfusion), and beta-2 (bronchodilates/stabilizes mast cells).',
      'Inject 0.3 mg IM into the mid-outer thigh immediately—repeat every 5–15 minutes if refractory.',
      'Patients on beta-blockers who fail to respond may additionally require IV glucagon.',
    ],
  },
  {
    id: 'hi_02_stroke_thrombolysis',
    specialty: 'hematology_immune',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'Acute Ischemic Stroke · Golden 4.5-Hour Fibrinolytic Window',
    patientLine: '62M · Sudden Right Hemiparesis & Aphasia · 2.5 Hours Since Last Normal',
    presentation:
      'Non-contrast head CT shows NO intracranial hemorrhage. BP is stabilized at 168/92 mmHg, platelets are 230,000/mm3, INR is 1.0, and patient takes no anticoagulants. Administer the fibrin-specific thrombolytic protease to restore cerebral perfusion.',
    labs: [
      { label: 'Non-Contrast Head CT', value: 'Negative for Bleed', flag: 'normal' },
      { label: 'BP / Platelets / INR', value: '168/92 · 230k · 1.0', flag: 'normal' },
      { label: 'Time From Onset', value: '2 hr 30 min', flag: 'normal' },
    ],
    activeMeds: ['Atorvastatin 40 mg daily', 'Amlodipine 5 mg daily'],
    targetCue: 'Cleaves Fibrin-Bound Plasminogen -> Plasmin',
    promptQuestion: 'Select the IV fibrinolytic agent dosed 0.9 mg/kg (10% bolus, 90% over 60 min) within 4.5 hours of stroke onset.',
    cardIds: ['alteplase', 'apixaban', 'enoxaparin', 'protamine'],
    correctDrugId: 'alteplase',
    distractorRationales: {
      apixaban:
        'Oral Factor Xa inhibitor apixaban prevents clot propagation/embolic recurrence but cannot acutely lyse an existing occlusive cerebral thrombus.',
      enoxaparin:
        'LMWH prevents venous thromboembolism and does not restore acute cerebral arterial flow.',
      protamine:
        'Protamine neutralizes heparin anticoagulation and would not lyse an acute ischemic stroke clot.',
    },
    clinicalPearl:
      'Before infusing alteplase (tPA) in acute ischemic stroke, confirm NO hemorrhage on head CT, onset <= 4.5 hours, BP < 185/110 mmHg, and hold antiplatelets/anticoagulants for 24 hours post-infusion.',
    hints: [
      'Recombinant tissue plasminogen activator (tPA) that preferentially activates plasminogen bound to fibrin.',
      'Total dose 0.9 mg/kg (max 90 mg): 10% IV bolus over 1 min, remaining 90% over 60 min.',
      'Reversal if symptomatic intracranial hemorrhage occurs: cryoprecipitate.',
    ],
  },
  {
    id: 'hi_03_sickle_cell_hbf',
    specialty: 'hematology_immune',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Sickle Cell Disease · Inducing Fetal Hemoglobin (HbF)',
    patientLine: '19M · HbSS Sickle Cell Disease · 4 Vaso-Occlusive Crises This Year',
    presentation:
      'Young adult hospitalized repeatedly for painful vaso-occlusive crises and prior acute chest syndrome. Baseline renal function is intact (CrCl 112 mL/min) and ANC is 4,800/mm3. Start the oral ribonucleotide reductase inhibitor that elevates protective HbF and lowers hospitalization rates.',
    labs: [
      { label: 'Hemoglobin / MCV', value: '8.1 g/dL · 86 fL', flag: 'low' },
      { label: 'ANC / Platelets', value: '4,800 / 340,000', flag: 'normal' },
      { label: 'CrCl', value: '112 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Folic acid 1 mg daily', 'Oxycodone PRN severe pain'],
    targetCue: 'Inhibit Ribonucleotide Reductase -> Increase HbF',
    promptQuestion: 'Select the disease-modifying oral therapy proven to raise HbF and reduce acute chest syndrome in HbSS.',
    cardIds: ['hydroxyurea', 'filgrastim', 'methotrexate', 'alteplase'],
    correctDrugId: 'hydroxyurea',
    distractorRationales: {
      filgrastim:
        'G-CSF filgrastim sharply elevates neutrophil counts and can precipitate catastrophic vaso-occlusive/splenic crises in sickle cell disease!',
      methotrexate:
        'Methotrexate is a DHFR inhibitor for inflammatory arthritis/psoriasis and does not induce HbF.',
      alteplase:
        'IV thrombolytic alteplase has no chronic role in preventing erythrocyte HbS polymerization.',
    },
    clinicalPearl:
      'Watch MCV rise on hydroxyurea: asymptomatic macrocytosis confirms adherence and effective HbF induction! Remember to cut starting hydroxyurea dose by 50% if CrCl < 60 mL/min.',
    hints: [
      'Inhibits ribonucleotide reductase M2 subunit, selectively inducing gamma-globin (HbF).',
      'Expected harmless lab marker confirming therapeutic adherence: elevated MCV (macrocytosis).',
      'Monitor CBC routinely for reversible dose-limiting myelosuppression.',
    ],
  },
  {
    id: 'hi_04_neutropenia_gcsf',
    specialty: 'hematology_immune',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'High-Risk Myelosuppressive Chemotherapy · Neutropenia Prophylaxis',
    patientLine: '54F · Diffuse Large B-Cell Lymphoma · 36 Hours Post-R-CHOP',
    presentation:
      'Patient completed myelosuppressive R-CHOP chemotherapy 36 hours ago (> 20% febrile neutropenia risk). Initiate recombinant G-CSF prophylaxis now—safely past the mandatory 24-hour post-chemo washout window—to accelerate myeloid neutrophil recovery.',
    labs: [
      { label: 'WBC / ANC', value: '3.2k / 1,600 /mm³', flag: 'normal' },
      { label: 'Time Post-Chemo', value: '36 hours', flag: 'normal' },
      { label: 'Temperature', value: '36.8 °C (Afebrile)', flag: 'normal' },
    ],
    activeMeds: ['Ondansetron 8 mg PRN', 'Allopurinol 300 mg daily'],
    targetCue: 'Stimulate CD114 Myeloid Progenitor Granulopoiesis',
    promptQuestion: 'Select the recombinant granulocyte colony-stimulating factor (G-CSF) started >= 24h after chemotherapy.',
    cardIds: ['filgrastim', 'hydroxyurea', 'tacrolimus', 'epinephrine'],
    correctDrugId: 'filgrastim',
    distractorRationales: {
      hydroxyurea:
        'Hydroxyurea suppresses myeloid/DNA synthesis and would worsen neutropenia and infection risk.',
      tacrolimus:
        'Calcineurin inhibitor tacrolimus suppresses T-cell IL-2 signaling for organ transplants, not neutrophil counts.',
      epinephrine:
        'Epinephrine is an adrenergic catecholamine for anaphylaxis/shock with no hematopoietic action.',
    },
    clinicalPearl:
      'NEVER give filgrastim or pegfilgrastim within 24 hours BEFORE or AFTER cytotoxic chemotherapy—stimulating dividing marrow cells while chemotherapy circulates worsens neutropenia! Loratadine helps treat G-CSF bone pain.',
    hints: [
      'Binds G-CSF (CD114) receptors to speed neutrophil maturation and marrow release.',
      'Common benign side effect in hips/sternum reflecting marrow expansion: bone pain.',
      'Always wait at least 24 hours after chemotherapy finishes before first injection.',
    ],
  },
  {
    id: 'hi_05_transplant_cni',
    specialty: 'hematology_immune',
    mechanic: 'receptor_lock',
    difficulty: 'Board Prep',
    title: 'Renal Transplant Rejection Prevention · Calcineurin & CYP3A4 Watch',
    patientLine: '49M · 6 Months Post-Kidney Transplant · Trough Monitoring',
    presentation:
      'Transplant recipient on mycophenolate and prednisone requires primary T-cell calcineurin inhibition (FKBP-12 binding -> NFAT blockade). Note: concurrent azoles or ritonavir can spike troughs dangerously, whereas St. John’s wort can trigger acute graft rejection.',
    labs: [
      { label: 'SCr (Baseline Post-Tx)', value: '1.2 mg/dL', flag: 'normal' },
      { label: 'Serum K+', value: '4.6 mEq/L', flag: 'normal' },
      { label: 'Goal 12h Trough', value: '6–8 ng/mL', flag: 'normal' },
    ],
    activeMeds: ['Mycophenolate mofetil 1,000 mg BID', 'Prednisone 5 mg daily'],
    targetCue: 'Bind FKBP-12 -> Inhibit Calcineurin & IL-2 Transcription',
    promptQuestion: 'Select the narrow-therapeutic-index calcineurin inhibitor requiring whole-blood trough tracking and strict formulation consistency.',
    cardIds: ['tacrolimus', 'methotrexate', 'adalimumab', 'filgrastim'],
    correctDrugId: 'tacrolimus',
    distractorRationales: {
      methotrexate:
        'Methotrexate is a weekly RA/oncology antifolate and is nephrotoxic/myelosuppressive rather than standard kidney transplant calcineurin maintenance.',
      adalimumab:
        'TNF-alpha blockade is not standard transplant rejection prophylaxis.',
      filgrastim:
        'G-CSF elevates neutrophils rather than suppressing T-lymphocyte graft rejection.',
    },
    clinicalPearl:
      'Tacrolimus immediate-release (Prograf) vs extended-release (Envarsus XR / Astagraf XL) are NOT 1:1 milligram interchangeable! Watch for hyperkalemia, hypertension, tremor, post-transplant diabetes, and CYP3A4 inhibitor surges (e.g., Paxlovid/voriconazole).',
    hints: [
      'Macrolide immunosuppressant sequestered inside RBCs—monitored via whole-blood 12-hour troughs.',
      'Inhibits calcineurin via FKBP-12 to block NFAT translocation and IL-2 production.',
      'CYP3A4 inhibitors (azoles, ritonavir) cause acute nephrotoxicity & neurotoxicity; inducers risk rejection.',
    ],
  },

  // ================= MUSCULOSKELETAL & DERMATOLOGY (5) =================
  {
    id: 'msd_01_ra_weekly_mtx',
    specialty: 'musculoskeletal_derm',
    mechanic: 'prescribe_screen',
    difficulty: 'Foundational',
    title: 'Newly Diagnosed Rheumatoid Arthritis · Anchor Weekly DMARD',
    patientLine: '44F · Symmetric MCP/PIP Synovitis · Anti-CCP+ · Baseline LFTs Normal',
    presentation:
      'Patient has morning joint stiffness > 90 minutes and early radiographic erosions. Initiate the gold-standard anchor conventional synthetic DMARD—strictly dosed ONCE WEEKLY alongside daily folic acid to prevent stomatitis and hepatotoxicity.',
    labs: [
      { label: 'Anti-CCP / RF', value: 'Strongly Positive', flag: 'high' },
      { label: 'AST / ALT', value: '19 / 21 U/L', flag: 'normal' },
      { label: 'Beta-hCG / CrCl', value: 'Negative · 96 mL/min', flag: 'normal' },
    ],
    activeMeds: ['Folic acid 1 mg daily (co-prescribed)', 'Naproxen PRN'],
    targetCue: 'Weekly DHFR Inhibition + Adenosine Anti-Inflammation',
    promptQuestion: 'Choose the first-line once-weekly csDMARD for Rheumatoid Arthritis requiring strict weekly-only dosing counseling.',
    cardIds: ['methotrexate', 'colchicine', 'alendronate', 'isotretinoin'],
    correctDrugId: 'methotrexate',
    distractorRationales: {
      colchicine:
        'Colchicine treats acute gout/pericarditis flares and has no disease-modifying effect against rheumatoid erosive synovitis.',
      alendronate:
        'Bisphosphonate alendronate treats osteoporosis bone loss rather than autoimmune joint synovitis.',
      isotretinoin:
        'Systemic retinoid isotretinoin is indicated for severe nodulocystic acne, not rheumatoid arthritis.',
    },
    clinicalPearl:
      'Always verify ONCE WEEKLY dosing for methotrexate in RA/psoriasis—erroneous daily dosing causes catastrophic mucositis and pancytopenia! Avoid pregnancy and concurrent TMP-SMX.',
    hints: [
      'Inhibits dihydrofolate reductase (DHFR) and AICAR transformylase to elevate anti-inflammatory adenosine.',
      'Must ALWAYS be paired with folic acid supplementation and weekly-only calendar counseling.',
      'Contraindicated in pregnancy, alcoholism, and chronic liver disease.',
    ],
  },
  {
    id: 'msd_02_acute_gout_colchicine',
    specialty: 'musculoskeletal_derm',
    mechanic: 'antidote_triage',
    difficulty: 'Clinical',
    title: 'Acute Gout Podagra · Microtubule Blockade Without NSAID Nephrotoxicity',
    patientLine: '61M · Acute Great Toe Pain (10h Onset) · Stage 3 CKD & Peptic Ulcer History',
    presentation:
      'Patient awoke with an erythematous, swollen first MTP joint after shellfish dinner. NSAIDs are contraindicated due to CKD (CrCl 48 mL/min) and prior GI bleed; he takes no CYP3A4 or P-gp inhibitors. Administer the FDA-approved low-dose acute gout loading regimen.',
    labs: [
      { label: 'Serum Uric Acid', value: '8.9 mg/dL', flag: 'high' },
      { label: 'CrCl', value: '48 mL/min', flag: 'low' },
      { label: 'Medication Screen', value: 'No CYP3A4 / P-gp Inhibitors', flag: 'normal' },
    ],
    activeMeds: ['Lisinopril 20 mg daily', 'Omeprazole 20 mg daily'],
    targetCue: 'Inhibit Neutrophil Tubulin & NLRP3 Inflammasome Early (< 36h)',
    promptQuestion: 'Select the acute gout agent dosed 1.2 mg initially followed by 0.6 mg 1 hour later (not hourly!).',
    cardIds: ['colchicine', 'allopurinol', 'methotrexate', 'adalimumab'],
    correctDrugId: 'colchicine',
    distractorRationales: {
      allopurinol:
        'Initiating or rapidly changing xanthine oxidase inhibitor allopurinol during an untreated acute gout flare worsens crystal mobilization pain; use it for chronic urate-lowering.',
      methotrexate:
        'Methotrexate is a slow-onset RA DMARD with no role in acute crystal-induced gout flares.',
      adalimumab:
        'Anti-TNF biologic adalimumab is not first-line acute podagra therapy.',
    },
    clinicalPearl:
      'Colchicine works best within 24–36 hours of gout flare onset at 1.2 mg + 0.6 mg 1h later (max 1.8 mg)—never old toxic hourly schedules! NEVER combine with clarithromycin, ritonavir, or cyclosporine in renal/hepatic dysfunction.',
    hints: [
      'Binds beta-tubulin to block microtubule polymerization and neutrophil crystal migration.',
      'Early GI warning toxicity before bone marrow suppression: abdominal cramping & diarrhea.',
      'Fatal interaction trap when paired with strong CYP3A4/P-gp inhibitors in renal/hepatic impairment.',
    ],
  },
  {
    id: 'msd_03_tnf_tb_screen',
    specialty: 'musculoskeletal_derm',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Refractory Psoriatic Arthritis · Anti-TNF Escalation & TB/HBV Screen',
    patientLine: '52M · Moderate Psoriatic Arthritis · Active Synovitis on Methotrexate',
    presentation:
      'Despite 4 months of weekly methotrexate, dactylitis and skin plaques remain active. Pre-biologic labs confirm negative QuantiFERON-TB Gold, normal chest X-ray, negative HBV serologies, and LVEF 60% (no heart failure). Add a fully human TNF-alpha monoclonal antibody.',
    labs: [
      { label: 'QuantiFERON-TB / HBV', value: 'Negative / Immune Cleared', flag: 'normal' },
      { label: 'Echocardiogram LVEF', value: '60% (Normal)', flag: 'normal' },
      { label: 'CRP', value: '28 mg/L', flag: 'high' },
    ],
    activeMeds: ['Methotrexate 15 mg weekly', 'Folic acid 1 mg daily'],
    targetCue: 'Neutralize Soluble & Membrane TNF-Alpha Cytokine',
    promptQuestion: 'Select the subcutaneous anti-TNF-alpha biologic requiring mandatory pre-treatment TB and Hepatitis B screening.',
    cardIds: ['adalimumab', 'dupilumab', 'omalizumab', 'colchicine'],
    correctDrugId: 'adalimumab',
    distractorRationales: {
      dupilumab:
        'Dupilumab targets IL-4/IL-13 for atopic dermatitis and asthma, not TNF-driven psoriatic or rheumatoid arthritis.',
      omalizumab:
        'Omalizumab neutralizes free IgE for allergic asthma and urticaria, lacking joint/psoriatic efficacy.',
      colchicine:
        'Colchicine targets gout crystal inflammation rather than TNF-alpha-mediated psoriatic arthritis.',
    },
    clinicalPearl:
      'All TNF-alpha inhibitors (adalimumab, etanercept, infliximab) carry boxed warnings for latent TB reactivation, invasive fungal infections, and HBV reactivation—and are contraindicated in NYHA Class III–IV heart failure.',
    hints: [
      'Subcutaneous IgG1 monoclonal antibody given 40 mg every other week.',
      'Requires negative latent TB (IGRA/TST) and Hepatitis B screening before first dose.',
      'Do not combine with another biologic DMARD or live vaccines.',
    ],
  },
  {
    id: 'msd_04_atopic_il4_biologic',
    specialty: 'musculoskeletal_derm',
    mechanic: 'prescribe_screen',
    difficulty: 'Clinical',
    title: 'Severe Atopic Dermatitis · Targeted IL-4Rα / IL-13 Biologic',
    patientLine: '26F · Chronic Refractory Eczema (EASI 28) · Severe Pruritus',
    presentation:
      'Lifelong atopic dermatitis covers 40% BSA and failed potent topical corticosteroids and tacrolimus ointment. Patient desires a targeted biologic without broad systemic immunosuppression or routine liver/bone-marrow lab monitoring. Watch for mild ocular conjunctivitis.',
    labs: [
      { label: 'IgE / Eosinophils', value: 'Elevated (Type 2 Profile)', flag: 'high' },
      { label: 'Liver & Renal Panel', value: 'Normal', flag: 'normal' },
      { label: 'TB / Viral Screen', value: 'Not Required', flag: 'normal' },
    ],
    activeMeds: ['Triamcinolone 0.1% ointment', 'Daily ceramide emollients'],
    targetCue: 'Dual Blockade of IL-4 and IL-13 via Shared IL-4Rα',
    promptQuestion: 'Choose the subcutaneous non-immunosuppressant biologic approved for moderate-to-severe atopic dermatitis.',
    cardIds: ['dupilumab', 'adalimumab', 'isotretinoin', 'methotrexate'],
    correctDrugId: 'dupilumab',
    distractorRationales: {
      adalimumab:
        'TNF-alpha inhibitors treat plaque psoriasis—not Type 2/Th2 atopic dermatitis (which can even paradoxically flare with TNF blockade).',
      isotretinoin:
        'Isotretinoin induces severe xerosis and treats nodulocystic acne, worsening dry atopic skin.',
      methotrexate:
        'Methotrexate suppresses bone marrow/liver and requires intensive lab monitoring; dupilumab specifically avoids systemic immunosuppression.',
    },
    clinicalPearl:
      'Dupilumab blocks the shared IL-4Rα subunit used by both IL-4 and IL-13, repairing skin barrier proteins without routine bloodwork. Conjunctivitis is its signature benign adverse effect.',
    hints: [
      'IgG4 monoclonal antibody targeting Type 2 inflammatory cytokines IL-4 and IL-13.',
      'Unlike anti-TNF or JAK inhibitors, requires NO baseline TB/HBV or serial CBC/LFT monitoring.',
      'Counsel patient to report new eye redness or watery irritation (conjunctivitis).',
    ],
  },
  {
    id: 'msd_05_retinoid_ipledge',
    specialty: 'musculoskeletal_derm',
    mechanic: 'antidote_triage',
    difficulty: 'Board Prep',
    title: 'Nodulocystic Acne · High-Alert Teratogen & REMS Safeguard',
    patientLine: '22F · Severe Scarring Nodulocystic Acne · Failed Oral Doxycycline',
    presentation:
      'Patient has scarring nodulocystic facial/truncal acne unresponsive to topical retinoids and oral antibiotics. Oral doxycycline MUST be discontinued first to prevent pseudotumor cerebri, and 2 negative pregnancy tests + dual contraception must be documented under iPLEDGE REMS.',
    labs: [
      { label: 'Serum Beta-hCG #1 & #2', value: 'Negative × 2', flag: 'normal' },
      { label: 'Fasting Triglycerides', value: '108 mg/dL', flag: 'normal' },
      { label: 'ALT / AST', value: '18 / 20 U/L', flag: 'normal' },
    ],
    activeMeds: ['Oral Doxycycline (STOPPING prior to start)', 'Combined Oral Contraceptive + Condoms'],
    targetCue: 'Induce Sebocyte Apoptosis Under Mandatory iPLEDGE REMS',
    promptQuestion: 'Select the systemic retinoid requiring iPLEDGE dual contraception, lipid/LFT monitoring, and tetracycline washout.',
    cardIds: ['isotretinoin', 'dupilumab', 'methotrexate', 'doxycycline'],
    correctDrugId: 'isotretinoin',
    distractorRationales: {
      dupilumab:
        'Dupilumab targets atopic dermatitis Type 2 inflammation rather than sebaceous gland nodulocystic acne.',
      methotrexate:
        'Methotrexate is a csDMARD for RA/psoriasis with no sebocyte-shrinking efficacy in severe acne.',
      doxycycline:
        'Doxycycline already failed and MUST be stopped before starting isotretinoin because co-administration triggers pseudotumor cerebri!',
    },
    clinicalPearl:
      'NEVER combine isotretinoin with tetracyclines (doxycycline, minocycline) due to severe idiopathic intracranial hypertension (papilledema + headache)! Standard capsules double absorption when swallowed with a high-fat meal.',
    hints: [
      '13-cis-retinoic acid stereoisomer causing sebocyte apoptosis and lasting acne remission.',
      'Strict FDA iPLEDGE REMS: 2 negative pregnancy tests + 2 contraception forms + zero blood donation.',
      'Monitor fasting triglycerides (pancreatitis risk), LFTs, mood, and cheilitis.',
    ],
  },

  // ================= REPRODUCTIVE & SENSORY (5) =================
  {
    id: 'rs_01_glaucoma_pg_analog',
    specialty: 'reproductive_sensory',
    mechanic: 'prescribe_screen',
    difficulty: 'Foundational',
    title: 'Primary Open-Angle Glaucoma · First-Line Nightly Outflow Therapy',
    patientLine: '64F · Newly Diagnosed Open-Angle Glaucoma (IOP 26 mmHg) · Moderate Asthma',
    presentation:
      'Routine optic exam revealed elevated intraocular pressure and early cup-to-disc enlargement. Because the patient has moderate asthma, ophthalmic beta-blockers could precipitate dangerous bronchospasm. Start the first-line once-nightly topical prostaglandin F2α analog.',
    labs: [
      { label: 'IOP (OD / OS)', value: '26 / 25 mmHg', flag: 'high' },
      { label: 'Airway History', value: 'Persistent Asthma', flag: 'high' },
      { label: 'Cup-to-Disc Ratio', value: '0.65 (Glaucomatous)', flag: 'high' },
    ],
    activeMeds: ['Budesonide-Formoterol 160/4.5 BID'],
    targetCue: 'Activate Prostaglandin FP Receptors -> Expand Uveoscleral Outflow',
    promptQuestion: 'Select the once-evening glaucoma eye drop safe in asthma that lowers IOP 25–35% via uveoscleral drainage.',
    cardIds: ['latanoprost', 'timolol_ophthalmic', 'atropine', 'oxytocin'],
    correctDrugId: 'latanoprost',
    distractorRationales: {
      timolol_ophthalmic:
        'DANGER! Ophthalmic timolol undergoes nasolacrimal venous absorption bypassing hepatic first-pass and causes severe bronchospasm in asthma patients!',
      atropine:
        'Anticholinergic atropine dilates the pupil and can precipitate acute angle-closure glaucoma rather than lowering IOP.',
      oxytocin:
        'Oxytocin is an IV/IM obstetrics uterotonic with no ophthalmic glaucoma role.',
    },
    clinicalPearl:
      'Prostaglandin analogs (latanoprost) are first-line for open-angle glaucoma once nightly (more frequent instillation paradoxically worsens IOP!). Counsel patients about permanent brown iris darkening and eyelash lengthening.',
    hints: [
      'Corneal esterases cleave this isopropyl ester into an active prostaglandin F2α acid.',
      'Administer 1 drop every EVENING; safe in asthma and bradycardia.',
      'Classic cosmetic side effects: iris hyperpigmentation, periorbital darkening, and thicker eyelashes.',
    ],
  },
  {
    id: 'rs_02_timolol_systemic',
    specialty: 'reproductive_sensory',
    mechanic: 'receptor_lock',
    difficulty: 'Clinical',
    title: 'Open-Angle Glaucoma · Aqueous Suppression & Punctal Occlusion',
    patientLine: '70M · Open-Angle Glaucoma (IOP 24 mmHg) · HR 78 bpm · No Lung Disease',
    presentation:
      'Patient has normal sinus rhythm (HR 78 bpm), no asthma/COPD, and declines prostaglandin analogs due to iris pigment/eyelash cosmetic effects. Prescribe the beta-blocker eye drop that suppresses ciliary aqueous humor secretion, plus teach nasolacrimal punctal occlusion.',
    labs: [
      { label: 'IOP (OD / OS)', value: '24 / 23 mmHg', flag: 'high' },
      { label: 'ECG / HR', value: 'Normal Sinus · 78 bpm', flag: 'normal' },
      { label: 'Spirometry', value: 'Normal (No Asthma/COPD)', flag: 'normal' },
    ],
    activeMeds: ['Atorvastatin 20 mg daily'],
    targetCue: 'Inhibit Ciliary Body Beta Receptors -> Reduce Aqueous Formation',
    promptQuestion: 'Select the ophthalmic beta-blocker appropriate when lung disease/bradycardia are absent, paired with punctal occlusion.',
    cardIds: [
      'timolol_ophthalmic',
      'latanoprost',
      'atropine',
      'magnesium_sulfate',
    ],
    correctDrugId: 'timolol_ophthalmic',
    distractorRationales: {
      latanoprost:
        'Latanoprost causes iris darkening and eyelash growth, which this patient specifically wishes to avoid.',
      atropine:
        'Mydriatic anticholinergic atropine worsens glaucoma pressure.',
      magnesium_sulfate:
        'IV magnesium sulfate treats preeclampsia/eclampsia seizures and has no ophthalmic indication.',
    },
    clinicalPearl:
      'Pressing the inner corner of the closed eye for 1–2 minutes after ophthalmic timolol (nasolacrimal occlusion) cuts systemic venous absorption bypassing hepatic first-pass, preventing bradycardia or airway symptoms.',
    hints: [
      'Non-selective beta-1/beta-2 antagonist formulated as ophthalmic drops or gel-forming solution.',
      'Never dispense to patients with asthma, severe COPD, heart block, or sinus bradycardia.',
      'Counsel on 1–2 minute punctal occlusion right after drop instillation.',
    ],
  },
  {
    id: 'rs_03_pph_uterotonic',
    specialty: 'reproductive_sensory',
    mechanic: 'antidote_triage',
    difficulty: 'Foundational',
    title: 'Postpartum Uterine Atony · Acute Hemorrhage Control',
    patientLine: '31F · Immediately Post-Vaginal Delivery · Boggy Uterus & 750 mL Blood Loss',
    presentation:
      'Immediately following placental delivery, uterine fundus is soft/boggy with brisk vaginal bleeding. Administer the first-line uterotonic peptide hormone via controlled IV infusion (or 10 units IM—never rapid IV push!) alongside bimanual fundal massage.',
    labs: [
      { label: 'Quantitative Blood Loss', value: '750 mL (Rising)', flag: 'high' },
      { label: 'BP / HR', value: '104/64 · 108 bpm', flag: 'high' },
      { label: 'Serum Na+', value: '139 mEq/L', flag: 'normal' },
    ],
    activeMeds: ['Prenatal vitamins', 'Lactated Ringer IV line'],
    targetCue: 'Stimulate Myometrial Oxytocin Receptors -> Spiral Artery Compression',
    promptQuestion: 'Select the first-line uterotonic hormone to restore firm uterine tone and arrest postpartum hemorrhage.',
    cardIds: ['oxytocin', 'magnesium_sulfate', 'medroxyprogesterone', 'protamine'],
    correctDrugId: 'oxytocin',
    distractorRationales: {
      magnesium_sulfate:
        'Magnesium sulfate RELAXES uterine smooth muscle and would worsen uterine atony and postpartum bleeding!',
      medroxyprogesterone:
        'Long-acting depot progestin is for contraception and does not produce acute rhythmic myometrial contraction.',
      protamine:
        'Protamine reverses heparin rather than uterine atony bleeding.',
    },
    clinicalPearl:
      'Oxytocin is ALWAYS the first-line uterotonic for PPH prevention and treatment. Never administer as an undiluted IV bolus (hypotension/collapse), and monitor serum sodium during prolonged high-dose hypotonic infusions (ADH-like water intoxication).',
    hints: [
      'Cyclic nonapeptide hormone activating Gq-coupled myometrial receptors.',
      'Given IM (10 units) or diluted IV infusion—never rapid IV push.',
      'Antagonist/trap to remember: IV magnesium relaxes the uterus, whereas this tightens it.',
    ],
  },
  {
    id: 'rs_04_eclampsia_seizure',
    specialty: 'reproductive_sensory',
    mechanic: 'antidote_triage',
    difficulty: 'Clinical',
    title: 'Preeclampsia With Severe Features · Eclamptic Seizure Prophylaxis',
    patientLine: '28F · 34 Weeks Gestation · BP 172/114 mmHg · Headache & 4+ Patellar Clonus',
    presentation:
      'Obstetric patient presents with severe preeclampsia, visual scotomata, and hyperreflexia. Alongside IV labetalol for BP control, initiate the drug of choice for preventing eclamptic seizures while monitoring urine output and deep tendon reflexes hourly (bedside antidote: IV calcium gluconate).',
    labs: [
      { label: 'Blood Pressure', value: '172 / 114 mmHg', flag: 'high' },
      { label: 'Patellar DTRs', value: '4+ with Clonus', flag: 'high' },
      { label: 'SCr / Urine Output', value: '0.8 mg/dL · 55 mL/hr', flag: 'normal' },
    ],
    activeMeds: ['Labetalol 20 mg IV (BP control)'],
    targetCue: 'Block Cerebral NMDA Receptors & Cerebral Vasospasm',
    promptQuestion: 'Select the 100%-renally cleared IV obstetric anticonvulsant of choice—tracking DTRs & respiratory rate hourly.',
    cardIds: ['magnesium_sulfate', 'oxytocin', 'diazepam', 'valproate'],
    correctDrugId: 'magnesium_sulfate',
    distractorRationales: {
      oxytocin:
        'Oxytocin stimulates labor contractions rather than preventing eclamptic cerebral seizures.',
      diazepam:
        'Benzodiazepines cause neonatal respiratory depression and are inferior to magnesium sulfate for eclamptic seizure prophylaxis.',
      valproate:
        'Valproate is a severe pregnancy teratogen and is NOT obstetric eclampsia prophylaxis.',
    },
    clinicalPearl:
      'Magnesium sulfate is 100% renally excreted! Loss of patellar deep tendon reflexes is the earliest bedside sign of magnesium toxicity (~8–10 mEq/L) before respiratory paralysis—keep IV calcium gluconate 1 g immediately at bedside!',
    hints: [
      'Loading dose 4–6 g IV over 20–30 minutes followed by 1–2 g/hr continuous infusion.',
      'Halve or hold maintenance rate immediately if urine output drops < 30 mL/hr.',
      'Specific physiological antidote for toxicity/respiratory arrest: IV calcium gluconate.',
    ],
  },
  {
    id: 'rs_05_depo_bmd',
    specialty: 'reproductive_sensory',
    mechanic: 'prescribe_screen',
    difficulty: 'Board Prep',
    title: 'Estrogen-Contraindicated Contraception & Enzyme-Inducer Safety',
    patientLine: '27F · Migraine With Aura & Epilepsy on Carbamazepine · Requests Contraception',
    presentation:
      'Patient experiences visual aura migraines (estrogen is strictly contraindicated due to ischemic stroke risk!) and takes carbamazepine, which induces CYP3A4 and causes oral contraceptive pill failure. Choose the 3-month injectable progestin whose efficacy remains intact despite CYP3A4 induction.',
    labs: [
      { label: 'Urine Beta-hCG', value: 'Negative', flag: 'normal' },
      { label: 'Blood Pressure', value: '116 / 74 mmHg', flag: 'normal' },
      { label: 'LFTs', value: 'Normal', flag: 'normal' },
    ],
    activeMeds: ['Carbamazepine 400 mg BID (CYP3A4 inducer)', 'Sumatriptan PRN'],
    targetCue: 'Select Estrogen-Free Depot Progestin Resilient to CYP Inducers',
    promptQuestion: 'Select the every-12-week injectable contraceptive unaffected by carbamazepine—remembering its Bone Mineral Density boxed warning.',
    cardIds: [
      'medroxyprogesterone',
      'latanoprost',
      'oxytocin',
      'isotretinoin',
    ],
    correctDrugId: 'medroxyprogesterone',
    distractorRationales: {
      latanoprost:
        'Latanoprost is an ophthalmic prostaglandin glaucoma medication, not systemic contraception.',
      oxytocin:
        'Oxytocin induces uterine contractions and has no contraceptive action.',
      isotretinoin:
        'Isotretinoin is a severe teratogen rather than a contraceptive agent.',
    },
    clinicalPearl:
      'Unlike oral/patch/ring hormonal contraceptives, Depot Medroxyprogesterone Acetate (DMPA) maintains contraceptive efficacy despite hepatic CYP3A4 enzyme inducers (carbamazepine, rifampin) and avoids estrogen stroke risk in migraine with aura! Counsel on reversible BMD loss (> 2 yrs warning).',
    hints: [
      'Administered IM (150 mg) or SC (104 mg) strictly every 12–13 weeks.',
      'Safe when estrogen is contraindicated (migraine with aura, VTE, hypertension) and unaffected by enzyme-inducing AEDs.',
      'FDA boxed warning advises limiting continuous use beyond 2 years due to reversible Bone Mineral Density loss.',
    ],
  },
];
