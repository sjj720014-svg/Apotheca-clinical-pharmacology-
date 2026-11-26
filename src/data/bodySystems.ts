import { BodySystemId, HumanBodySystem } from '../types/pharma';

export const HUMAN_BODY_SYSTEMS: HumanBodySystem[] = [
  {
    id: 'cardiovascular',
    name: 'Cardiovascular System',
    shortName: 'Cardiovascular',
    anatomicalScope:
      'Heart chambers, SA/AV conduction system, coronary arteries, systemic vasculature, and endothelium',
    physiologySummary:
      'Regulates cardiac output (HR × SV), systemic vascular resistance, coronary perfusion, and arterial baroreceptor tone via beta-1 adrenergic, alpha-1, RAAS, and nitric oxide/cGMP signaling.',
    keyReceptorsAndTargets: [
      'Beta-1 & Beta-2 Adrenoceptors',
      'HMG-CoA Reductase & PCSK9',
      'L-Type Vascular Calcium Channels',
      'K+ / Na+ / Ca2+ Cardiac Ion Channels (Vaughan-Williams I–IV)',
      'Angiotensin-Converting Enzyme (ACE) & AT1 Receptors',
    ],
    diagnosticBiomarkers: [
      'Troponin I/T',
      'BNP / NT-proBNP',
      'LDL-C / ApoB',
      'ECG QTc & PR Intervals',
      'LVEF (%) & MAP',
    ],
    flagshipTherapies: [
      'GDMT for HFrEF: ARNI (sacubitril-valsartan), evidence-based beta-blocker, MRA, SGLT2i',
      'High-intensity statins & ezetimibe / PCSK9 inhibitors for ASCVD',
      'Dihydropyridine CCBs, nitrates, and class III antiarrhythmics',
    ],
    linkedDrugIds: [
      'lisinopril',
      'sacubitril_valsartan',
      'metoprolol_succinate',
      'atorvastatin',
      'amiodarone',
      'digoxin',
      'amlodipine',
      'nitroglycerin',
    ],
    clinicalPearl:
      'Initiating all four HFrEF GDMT pillars early yields additive mortality reduction; avoid dihydropyridine reflex tachycardia without rate control in ischemic heart disease.',
    redFlagToxicities:
      'Digoxin toxicity (visual halos + hypokalemia-precipitated arrhythmias), amiodarone pulmonary/thyroid/hepatic toxicity, and severe hypotension from nitrates + PDE-5 inhibitors.',
    relatedSpecialty: 'cardiorenal',
  },
  {
    id: 'respiratory',
    name: 'Respiratory System',
    shortName: 'Respiratory',
    anatomicalScope:
      'Upper airways, trachea, bronchi/bronchioles, alveolar capillary membrane, and pulmonary vasculature',
    physiologySummary:
      'Maintains alveolar ventilation and O2/CO2 gas exchange; bronchial smooth muscle caliber is governed by opposing beta-2 adrenergic (Gs/cAMP bronchodilation) and M3 muscarinic (Gq/IP3 bronchoconstriction) tone.',
    keyReceptorsAndTargets: [
      'Beta-2 Adrenergic Receptors (Bronchial Smooth Muscle)',
      'M3 Muscarinic Receptors (Submucosal Glands & Airway Tone)',
      'Glucocorticoid Receptors (NF-kB Inflammatory Suppression)',
      'CysLT1 Leukotriene Receptors & PDE-4',
      'Pulmonary Endothelin & Prostacyclin Pathways',
    ],
    diagnosticBiomarkers: [
      'FEV1 / FVC Spirometry Ratio',
      'SpO2 & ABG (PaO2 / PaCO2)',
      'Blood Eosinophil Count',
      'Peak Expiratory Flow (PEF)',
      'FeNO (Exhaled Nitric Oxide)',
    ],
    flagshipTherapies: [
      'ICS-formoterol (MART) as preferred reliever/controller in GINA asthma steps',
      'LAMA + LABA dual bronchodilation (± ICS if eosinophils >= 300) in GOLD COPD',
      'Short-acting beta-2 agonists (albuterol) for acute bronchospasm rescue',
    ],
    linkedDrugIds: ['tiotropium', 'budesonide_formoterol', 'montelukast', 'omalizumab', 'roflumilast', 'albuterol', 'fluticasone_salmeterol'],
    clinicalPearl:
      'Long-acting beta-agonists (LABAs) must never be used as monotherapy in asthma due to severe exacerbation/mortality risk; always pair with an inhaled corticosteroid.',
    redFlagToxicities:
      'Oral candidiasis & dysphonia from ICS (prevented by spacer + rinsing), paradoxical bronchospasm, beta-agonist hypokalemia/tachycardia, and non-selective beta-blocker bronchospasm.',
    relatedSpecialty: 'respiratory',
  },
  {
    id: 'nervous',
    name: 'Nervous System (CNS & Autonomic)',
    shortName: 'Nervous System',
    anatomicalScope:
      'Cerebral cortex, basal ganglia, limbic circuits, brainstem, spinal cord, blood-brain barrier, and autonomic ganglia',
    physiologySummary:
      'Coordinates cognition, mood, motor control, nociception, and autonomic outflow through synaptic balance of GABA, glutamate, dopamine, serotonin (5-HT), norepinephrine, and acetylcholine.',
    keyReceptorsAndTargets: [
      'SERT / NET Monoamine Transporters',
      'D2 Dopamine & 5-HT2A Receptors',
      'GABA-A Chloride Channels & Voltage-Gated Na+/Ca2+ Channels',
      'Mu-Opioid GPCRs (Gi/o Analgesia & Respiratory Drive)',
      'Synaptic Vesicle Protein 2A (SV2A) & MAO-B / COMT',
    ],
    diagnosticBiomarkers: [
      'Serum Drug Levels (Lithium, Valproate, Carbamazepine)',
      'HLA-B*1502 (Carbamazepine SJS/TEN Screen)',
      'ANC (Clozapine REMS)',
      'AIMS Tardive Dyskinesia Screen',
      'Respiratory Rate & RASS/CIWA Scores',
    ],
    flagshipTherapies: [
      'SSRIs/SNRIs for first-line major depression and anxiety (4–6 week onset)',
      'Narrow-spectrum & broad-spectrum AEDs (lamotrigine, valproate, carbamazepine)',
      'Levodopa-carbidopa (peripheral DDC inhibition) and opioid overdose reversal (naloxone)',
    ],
    linkedDrugIds: [
      'sertraline',
      'lithium',
      'valproate',
      'lamotrigine',
      'carbamazepine',
      'clozapine',
      'haloperidol',
      'levodopa_carbidopa',
      'naloxone',
    ],
    clinicalPearl:
      'Carbamazepine induces its own CYP3A4 metabolism (autoinduction) over 2–4 weeks; always screen HLA-B*1502 in at-risk ancestry prior to starting carbamazepine.',
    redFlagToxicities:
      'Serotonin syndrome (clonus, hyperreflexia, autonomic instability), neuroleptic malignant syndrome, lithium toxicity triggered by NSAIDs/ACEi/thiazides, and lamotrigine rapid-titration SJS.',
    relatedSpecialty: 'cns',
  },
  {
    id: 'renal',
    name: 'Renal & Urinary System',
    shortName: 'Renal & Urinary',
    anatomicalScope:
      'Glomerular filtration barrier, PCT, loop of Henle, DCT, collecting duct, juxtaglomerular apparatus, and lower urinary tract',
    physiologySummary:
      'Clears nitrogenous wastes and hydrophilic drugs while defending ECF volume, acid-base balance, and electrolytes via SGLT2, NKCC2, NCC, ENaC, and aquaporin transporters.',
    keyReceptorsAndTargets: [
      'SGLT2 (Proximal Convoluted Tubule)',
      'NKCC2 Cotransporter (Thick Ascending Limb)',
      'NCC Cotransporter (Distal Convoluted Tubule)',
      'Mineralocorticoid Receptor / ENaC (Collecting Duct)',
      'Efferent vs. Afferent Glomerular Arterioles',
    ],
    diagnosticBiomarkers: [
      'Cockcroft-Gault CrCl & CKD-EPI eGFR',
      'Urine Albumin-to-Creatinine Ratio (uACR)',
      'Serum K+, Mg2+, Na+, HCO3-, BUN/SCr',
      'Vancomycin AUC24/MIC (400–600)',
    ],
    flagshipTherapies: [
      'SGLT2 inhibitors (empagliflozin) + ACEi/ARB to lower intraglomerular pressure in CKD',
      'Loop diuretics (furosemide) for refractory edema at eGFR < 30 mL/min',
      'Renal dose adjustment for narrow-window antimicrobials & DOACs',
    ],
    linkedDrugIds: [
      'furosemide',
      'hydrochlorothiazide',
      'spironolactone',
      'empagliflozin',
      'losartan',
      'vancomycin',
      'gentamicin',
      'nitrofurantoin',
    ],
    clinicalPearl:
      'SGLT2 inhibitors cause an initial hemodynamic eGFR dip (up to ~15–30%) via afferent arteriolar tubuloglomerular feedback that signals long-term nephron preservation rather than injury.',
    redFlagToxicities:
      'Triple-whammy AKI (ACEi/ARB + diuretic + NSAID), vancomycin + piperacillin-tazobactam nephrotoxicity, aminoglycoside ATN, and nitrofurantoin failure/neuropathy at CrCl < 30 mL/min.',
    relatedSpecialty: 'cardiorenal',
  },
  {
    id: 'digestive',
    name: 'Digestive & Hepatobiliary System',
    shortName: 'Digestive & Liver',
    anatomicalScope:
      'Esophagus, gastric parietal cells, small/large intestine, enteric nervous system, portal circulation, liver CYP450/UGT enzymes, and biliary tree',
    physiologySummary:
      'Digests/absorbs oral drugs across variable pH surfaces and executes first-pass hepatic Phase I (CYP450) and Phase II (glucuronidation/sulfation/glutathione) biotransformation.',
    keyReceptorsAndTargets: [
      'Gastric H+/K+-ATPase Proton Pump',
      '5-HT3 Chemoreceptor Trigger Zone & Enteric Receptors',
      'CYP3A4 / CYP2C19 / CYP2D6 Hepatic Monooxygenases',
      'Hepatic Glutathione Conjugation & Bile Salt Transporters',
    ],
    diagnosticBiomarkers: [
      'AST / ALT & Alkaline Phosphatase',
      'Total Bilirubin, Albumin & INR (Child-Pugh)',
      'Ammonia (Hepatic Encephalopathy)',
      'Rumack-Matthew Acetaminophen Nomogram',
    ],
    flagshipTherapies: [
      'Proton pump inhibitors (omeprazole) taken 30–60 minutes before breakfast',
      '5-HT3 antagonists (ondansetron) for CINV/PONV',
      'N-Acetylcysteine (NAC) replenishment of hepatic glutathione for APAP overdose',
    ],
    linkedDrugIds: ['omeprazole', 'ondansetron', 'nac', 'fluconazole', 'amox_clav'],
    clinicalPearl:
      'PPIs require active parietal proton pumps to bind covalently; dosing 30–60 minutes prior to the first meal maximizes acid suppression, while long-term use warrants de-escalation checks.',
    redFlagToxicities:
      'CYP2C19 inhibition of clopidogrel activation by omeprazole, ondansetron QTc prolongation, C. difficile risk with chronic acid suppression, and NAPQI centrilobular hepatic necrosis.',
    relatedSpecialty: 'endocrine_gi',
  },
  {
    id: 'endocrine',
    name: 'Endocrine System',
    shortName: 'Endocrine',
    anatomicalScope:
      'Hypothalamic-pituitary axis, thyroid/parathyroid glands, pancreatic islets (alpha/beta cells), adrenal cortex/medulla, and adipose-incretin signaling',
    physiologySummary:
      'Orchestrates basal metabolic rate, hepatic gluconeogenesis, peripheral glucose uptake, incretin insulinotropism, and stress cortisol feedback loops.',
    keyReceptorsAndTargets: [
      'AMPK / Mitochondrial Complex I (Hepatic Gluconeogenesis Suppression)',
      'GLP-1 & GIP Incretin Receptors',
      'Nuclear Thyroid Hormone Receptors (TR-alpha / TR-beta)',
      'Tyrosine Kinase Insulin Receptors (GLUT4 Translocation)',
    ],
    diagnosticBiomarkers: [
      'HbA1c (%) & Fasting/Postprandial Glucose',
      'TSH & Free T4',
      'Serum Cortisol / ACTH',
      'Vitamin B12 & Lactate (Chronic Metformin)',
    ],
    flagshipTherapies: [
      'Metformin + organ-protective GLP-1 RA (semaglutide) or SGLT2i in Type 2 Diabetes',
      'Basal-bolus insulin analogs (glargine) and emergency glucagon rescue',
      'Morning fasting levothyroxine titrated every 6–8 weeks by TSH',
    ],
    linkedDrugIds: [
      'metformin',
      'semaglutide',
      'empagliflozin',
      'insulin_glargine',
      'levothyroxine',
      'glucagon',
    ],
    clinicalPearl:
      'Divalent/trivalent cations (iron, calcium), sucralfate, and PPIs sharply impair oral levothyroxine absorption—separate by at least 4 hours on an empty stomach.',
    redFlagToxicities:
      'Metformin-associated lactic acidosis if eGFR < 30 mL/min, euglycemic DKA on SGLT2 inhibitors during acute illness/surgery, severe hypoglycemia, and thyroid storm from abrupt LT4 omission.',
    relatedSpecialty: 'endocrine_gi',
  },
  {
    id: 'immune',
    name: 'Immune & Lymphatic System',
    shortName: 'Immune & Lymphatic',
    anatomicalScope:
      'Bone marrow lymphoid progenitors, thymus, lymph nodes, spleen, MALT, complement cascade, B/T lymphocytes, and host-pathogen defense',
    physiologySummary:
      'Balances pathogen eradication and vaccine memory against autoimmune hypersensitivity, cytokine storms, and graft rejection via MHC presentation, TNF-alpha/IL pathways, and calcineurin signaling.',
    keyReceptorsAndTargets: [
      'Bacterial Cell Wall PBPs & D-Ala-D-Ala Peptidoglycan',
      '50S / 30S Bacterial Ribosomes & DNA Gyrase',
      'HLA / MHC Antigen Presentation (Abacavir HLA-B*5701)',
      'Cytokine (TNF-alpha, IL-6, IL-17) & Calcineurin-NFAT Pathways',
    ],
    diagnosticBiomarkers: [
      'WBC / ANC & Lymphocyte Subsets',
      'Procalcitonin & CRP / ESR',
      'HLA-B*5701 Screening',
      'Blood Cultures & Antibiogram MICs',
    ],
    flagshipTherapies: [
      'Targeted antimicrobial stewardship (MRSA vs. ESBL vs. Pseudomonas coverage)',
      'Monoclonal antibodies, calcineurin inhibitors, and corticosteroids (with PJP prophylaxis if prolonged)',
      'Pharmacogenomic screening prior to abacavir and thiopurines (TPMT/NUDT15)',
    ],
    linkedDrugIds: [
      'epinephrine',
      'tacrolimus',
      'filgrastim',
      'vancomycin',
      'pip_tazo',
      'meropenem',
      'abacavir',
      'ceftriaxone',
    ],
    clinicalPearl:
      'Screening HLA-B*5701 before abacavir virtually eliminates fatal T-cell mediated hypersensitivity reactions; never re-challenge a suspected abacavir HSR.',
    redFlagToxicities:
      'Anaphylaxis/Type I IgE cross-reactivity nuances, opportunistic reactivation (TB/HBV) on anti-TNF biologics, linezolid myelosuppression (>14 days), and DRESS syndrome.',
    relatedSpecialty: 'hematology_immune',
  },
  {
    id: 'hematologic',
    name: 'Hematologic System',
    shortName: 'Hematologic',
    anatomicalScope:
      'Hematopoietic bone marrow, erythrocytes (hemoglobin), platelets, extrinsic/intrinsic coagulation factors, and fibrinolytic plasminogen pathways',
    physiologySummary:
      'Preserves oxygen carriage and hemostatic balance between fibrin clot formation (Factors IIa/Xa, vWF, GPIIb/IIIa, P2Y12) and endogenous anticoagulation (antithrombin III, proteins C/S).',
    keyReceptorsAndTargets: [
      'Factor Xa & Thrombin (Factor IIa)',
      'VKORC1 (Vitamin K Epoxide Reductase)',
      'Platelet P2Y12 ADP Receptor & COX-1 (TXA2)',
      'Antithrombin III Potentiation',
    ],
    diagnosticBiomarkers: [
      'INR / PT & aPTT',
      'Anti-Factor Xa Activity',
      'Platelet Count & Hemoglobin / Ferritin',
      'CYP2C19 / CYP2C9 / VKORC1 Genotypes',
    ],
    flagshipTherapies: [
      'DOACs (apixaban) for non-valvular AF/VTE; warfarin for mechanical valves',
      'LMWH (enoxaparin) with protamine partial reversal and anti-Xa monitoring in obesity/renal CKD',
      'DAPT (aspirin + clopidogrel or ticagrelor) post-ACS/PCI',
    ],
    linkedDrugIds: [
      'alteplase',
      'hydroxyurea',
      'filgrastim',
      'apixaban',
      'warfarin',
      'enoxaparin',
      'clopidogrel',
      'ticagrelor',
    ],
    clinicalPearl:
      'Ticagrelor binds the platelet P2Y12 receptor reversibly without CYP2C19 bioactivation, avoiding clopidogrel loss-of-function resistance—but aspirin > 100 mg/day reduces ticagrelor efficacy.',
    redFlagToxicities:
      'Heparin-induced thrombocytopenia (HIT with 4Ts score -> immediate non-heparin anticoagulant), warfarin skin necrosis without bridging, and major GI/intracranial hemorrhage.',
    relatedSpecialty: 'hematology_immune',
  },
  {
    id: 'musculoskeletal',
    name: 'Musculoskeletal System',
    shortName: 'Musculoskeletal',
    anatomicalScope:
      'Cortical & trabecular bone, osteoclasts/osteoblasts, articular synovium, skeletal muscle neuromuscular junctions, and purine urate joints',
    physiologySummary:
      'Governs bone mineral turnover (RANKL/osteoprotegerin & hydroxyapatite remodeling), synovial inflammation, purine uric acid homeostasis, and nicotinic neuromuscular transmission.',
    keyReceptorsAndTargets: [
      'Farnesyl Pyrophosphate Synthase in Osteoclasts (Bisphosphonates)',
      'Xanthine Oxidase (Uric Acid Synthesis)',
      'COX-1 / COX-2 Synovial Prostaglandin Synthesis',
      'Nicotinic AchR (NMJ) & RANKL / Dihydrofolate Reductase (DMARDs)',
    ],
    diagnosticBiomarkers: [
      'DEXA T-Score (<= -2.5 Osteoporosis)',
      'Serum Uric Acid (< 6 mg/dL Target)',
      'CK (Creatine Kinase / Rhabdomyolysis)',
      'HLA-B*5801 (Allopurinol Screen) & Serum Ca2+/25-OH-Vit D',
    ],
    flagshipTherapies: [
      'Oral bisphosphonates (alendronate) upright with plain water >= 30 min pre-meal',
      'Xanthine oxidase inhibitors (allopurinol, febuxostat) for chronic gout urate-lowering',
      'Statins monitored for myalgia/CK; fluoroquinolones avoided if high tendon-rupture risk',
    ],
    linkedDrugIds: ['methotrexate', 'colchicine', 'adalimumab', 'alendronate', 'allopurinol', 'febuxostat'],
    clinicalPearl:
      'Always screen HLA-B*5801 in high-risk populations before starting allopurinol, and never co-administer xanthine oxidase inhibitors with azathioprine without drastic 6-MP dose reduction.',
    redFlagToxicities:
      'Bisphosphonate pill esophagitis & osteonecrosis of the jaw (ONJ), fluoroquinolone Achilles tendon rupture, statin rhabdomyolysis, and colchicine toxicity with strong CYP3A4/P-gp inhibitors.',
    relatedSpecialty: 'musculoskeletal_derm',
  },
  {
    id: 'integumentary',
    name: 'Integumentary System',
    shortName: 'Integumentary',
    anatomicalScope:
      'Stratum corneum barrier, epidermis, dermis, sebaceous/sweat appendages, and mucocutaneous junctions',
    physiologySummary:
      'Serves as both a physicochemical permeation barrier (dependent on vehicle occlusion, lipophilicity, and skin thickness) and an immunologic target of severe T-cell drug eruptions.',
    keyReceptorsAndTargets: [
      'Cutaneous Glucocorticoid Receptors (Classes I–VII Potency)',
      'RAR / RXR Retinoid Nuclear Receptors',
      'Ergosterol / Squalene Epoxidase (Topical/Systemic Antifungals)',
      'CD8+ Granulysin Cytotoxic Pathways (SJS/TEN)',
    ],
    diagnosticBiomarkers: [
      'Fingertip Units (FTU) Dosing Metric',
      'Nikolsky Sign & Mucosal Involvement (SJS/TEN)',
      'SCORTEN Prognostic Score',
      'iPLEDGE Pregnancy Negative Tests (Isotretinoin)',
    ],
    flagshipTherapies: [
      'Low-potency hydrocortisone for face/intertriginous folds vs. high-potency clobetasol on palms/soles',
      'Doxycycline and topical retinoids/benzoyl peroxide for acne vulgaris',
      'Immediate culprit cessation + supportive burn-unit care for SJS/TEN/DRESS',
    ],
    linkedDrugIds: ['dupilumab', 'isotretinoin', 'adalimumab', 'doxycycline', 'lamotrigine', 'carbamazepine'],
    clinicalPearl:
      'Aromatic anticonvulsants (carbamazepine, lamotrigine), allopurinol, and sulfonamides (TMP-SMX) are the classic triggers of SJS/TEN—stop immediately at the first sign of mucosal ulceration or blistering rash.',
    redFlagToxicities:
      'Stevens-Johnson Syndrome / Toxic Epidermal Necrolysis (SJS/TEN), HPA-axis suppression & skin atrophy from superpotent topical steroids on thin skin, and doxycycline phototoxicity.',
    relatedSpecialty: 'musculoskeletal_derm',
  },
  {
    id: 'reproductive',
    name: 'Reproductive System',
    shortName: 'Reproductive',
    anatomicalScope:
      'Hypothalamic GnRH pulse generator, pituitary LH/FSH, ovaries/uterus, testes, prostate smooth muscle, and placental drug transfer barrier',
    physiologySummary:
      'Controls ovulatory/spermatogenic feedback, prostatic stromal tone, erectile cGMP vasodilation, and fetal organogenesis vulnerability across pregnancy trimesters.',
    keyReceptorsAndTargets: [
      'Estrogen (ER-alpha/beta) & Progesterone Receptors',
      'Alpha-1A Adrenergic Receptors (Prostatic Smooth Muscle)',
      '5-Alpha Reductase (Testosterone -> DHT)',
      'PDE-5 (Corpus Cavernosum cGMP Preservation)',
    ],
    diagnosticBiomarkers: [
      'Beta-hCG (Mandatory Pre-Teratogen Check)',
      'PSA & IPSS Symptom Score (BPH)',
      'FSH / LH / Estradiol / Total Testosterone',
      'Trimester-Specific Teratogen Risk Window',
    ],
    flagshipTherapies: [
      'Alpha-1A selective blockers (tamsulosin) for rapid BPH LUTS; 5-ARIs (finasteride) to shrink prostate volume',
      'Progestin-only or low-estrogen contraception selected for VTE/migraine-with-aura safety',
      'Strict avoidance of teratogens (valproate, warfarin, ACEi/ARBs, isotretinoin) in pregnancy',
    ],
    linkedDrugIds: ['oxytocin', 'magnesium_sulfate', 'medroxyprogesterone', 'valproate', 'lisinopril', 'warfarin'],
    clinicalPearl:
      'Strong CYP3A4 enzyme inducers (carbamazepine, phenytoin, rifampin) accelerate estrogen/progestin clearance and cause oral contraceptive failure—counsel on non-hormonal backup contraception.',
    redFlagToxicities:
      'Valproate neural tube defects/cognitive impairment, ACEi/ARB fetal renal dysplasia in 2nd/3rd trimesters, intraoperative floppy iris syndrome with tamsulosin, and VTE with estrogen in smokers >= 35 yrs.',
    relatedSpecialty: 'reproductive_sensory',
  },
  {
    id: 'sensory',
    name: 'Sensory System (Ophthalmic, Otic & Vestibular)',
    shortName: 'Sensory & ENT',
    anatomicalScope:
      'Cornea, ciliary body, trabecular meshwork, retina, cochlea (organ of Corti), semicircular canals, and cranial nerves II & VIII',
    physiologySummary:
      'Regulates aqueous humor inflow/uveoscleral outflow to protect the optic nerve, while delicate cochlear hair cells and vestibular nuclei remain susceptible to aminoglycoside, loop, and anticholinergic toxicity.',
    keyReceptorsAndTargets: [
      'Prostaglandin FP Receptors (Uveoscleral Outflow — Latanoprost)',
      'Ciliary Beta-Adrenergic & Carbonic Anhydrase II (Aqueous Secretion)',
      'Cochlear Outer Hair Cell & Stria Vascularis Transport',
      'Muscarinic M1 / Histamine H1 (Vestibular Motion Sickness)',
    ],
    diagnosticBiomarkers: [
      'Intraocular Pressure (IOP, Normal 10–21 mmHg)',
      'Visual Field & Optic Disc Cup-to-Disc Ratio',
      'Baseline & Serial Audiometry (High-Frequency Hearing)',
      'Color Vision / Fundus Exam (Ethambutol, Hydroxychloroquine)',
    ],
    flagshipTherapies: [
      'Ophthalmic prostaglandin analogs (first-line once-nightly) & topical beta-blockers (timolol) for open-angle glaucoma',
      'Avoidance of systemic anticholinergics/topiramate in narrow-angle glaucoma suspects',
      'High-dose/peak monitoring of gentamicin and slow IV administration of furosemide to protect CN VIII',
    ],
    linkedDrugIds: ['latanoprost', 'timolol_ophthalmic', 'gentamicin', 'furosemide', 'amiodarone', 'atropine'],
    clinicalPearl:
      'Even ophthalmic beta-blocker drops (timolol) undergo nasolacrimal mucosal absorption bypassing hepatic first-pass—apply punctal occlusion to prevent systemic bradycardia or bronchospasm.',
    redFlagToxicities:
      'Irreversible bilateral vestibulo-cochlear ototoxicity (gentamicin + loop diuretics), acute angle-closure glaucoma from anticholinergics (atropine/TCAs), and amiodarone corneal microdeposits/optic neuropathy.',
    relatedSpecialty: 'reproductive_sensory',
  },
];

export const BODY_SYSTEM_MAP: Record<BodySystemId, HumanBodySystem> =
  Object.fromEntries(HUMAN_BODY_SYSTEMS.map((s) => [s.id, s])) as Record<
    BodySystemId,
    HumanBodySystem
  >;
