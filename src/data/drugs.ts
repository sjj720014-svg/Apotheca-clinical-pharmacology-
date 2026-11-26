import { DrugMonograph, Specialty } from '../types/pharma';
import { SYSTEM_EXPANSION_DRUGS } from './systemDrugs';

export const SPECIALTY_META: Record<
  Specialty,
  { label: string; shortLabel: string; focus: string }
> = {
  cardiorenal: {
    label: 'Cardiovascular & Renal',
    shortLabel: 'Cardiorenal',
    focus: 'RAAS, anticoagulation, arrhythmias, and nephron pharmacology',
  },
  infectious: {
    label: 'Infectious Disease',
    shortLabel: 'Infectious Disease',
    focus: 'Antimicrobial spectra, PK/PD targets, and stewardship',
  },
  cns: {
    label: 'CNS, Pain & Psychiatry',
    shortLabel: 'CNS & Psych',
    focus: 'Monoamines, antiepileptics, opioids, and neurotoxicity',
  },
  endocrine_gi: {
    label: 'Endocrine, GI & Antidotes',
    shortLabel: 'Endocrine & GI',
    focus: 'Glycemic pathways, acid suppression, airways, and toxicology',
  },
  respiratory: {
    label: 'Respiratory & Pulmonary',
    shortLabel: 'Respiratory',
    focus: 'LAMA/LABA bronchodilation, SMART ICS, leukotrienes & biologics',
  },
  hematology_immune: {
    label: 'Hematology & Immune',
    shortLabel: 'Heme & Immune',
    focus: 'Thrombolysis, anaphylaxis, sickle cell, neutropenia & transplant',
  },
  musculoskeletal_derm: {
    label: 'Musculoskeletal & Derm',
    shortLabel: 'MSK & Derm',
    focus: 'DMARDs, acute gout, biologics, atopic dermatitis & REMS teratogens',
  },
  reproductive_sensory: {
    label: 'Reproductive & Sensory',
    shortLabel: 'Repro & Sensory',
    focus: 'Glaucoma IOP, obstetrics, eclampsia prophylaxis & contraception',
  },
  ai_informatics: {
    label: 'AI, PGx & Pharmacoinformatics',
    shortLabel: 'AI & Ethics',
    focus: 'CDSS verification, pharmacogenomics, bias detection & safe automation',
  },
};

export const DRUG_MONOGRAPHS: DrugMonograph[] = [
  // ================= CARDIORENAL (17) =================
  {
    id: 'lisinopril',
    genericName: 'Lisinopril',
    brandNames: 'Prinivil, Zestril',
    drugClass: 'ACE Inhibitor',
    chemicalClass: 'Lysine-proline dicarboxylate dipeptide analog (non-prodrug, sulfhydryl-free)',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Angiotensin-Converting Enzyme (ACE / Kininase II)',
    mechanism:
      'Inhibits conversion of angiotensin I to angiotensin II and blocks bradykinin degradation, dilating efferent glomerular arterioles and reducing aldosterone.',
    pharmacokinetics: {
      bioavailability: '25% (unaffected by food)',
      halfLife: '12 hours',
      volumeOfDistribution: '124 L (~1.7 L/kg)',
      metabolism: 'Not hepatically metabolized (active parent drug)',
      excretion: '100% renal unchanged',
      proteinBinding: '< 5%',
    },
    renalAndHepaticDosing:
      'CrCl 10–30 mL/min: start 2.5–5 mg/day; CrCl < 10 or dialysis: start 2.5 mg/day. No hepatic adjustment needed.',
    clinicalPearls:
      'Reduces proteinuria and slows diabetic nephropathy progression. Unlike most ACE inhibitors (prodrugs), lisinopril and captopril are active as administered.',
    patientCounseling:
      'Report any persistent dry cough, lip/tongue swelling (angioedema), or dizziness when standing; avoid salt substitutes containing potassium.',
    contraindications:
      'History of ACEi-induced angioedema, pregnancy (2nd/3rd trimester fetal renal dysplasia), bilateral renal artery stenosis, concurrent sacubitril/valsartan within 36 hours.',
    majorInteractions:
      'K+-sparing diuretics / potassium supplements (hyperkalemia), NSAIDs (triple whammy AKI with diuretics), lithium (reduced clearance).',
    monitoring: 'Serum creatinine (up to 30% rise acceptable), eGFR, serum potassium within 1–2 weeks.',
  },
  {
    id: 'losartan',
    genericName: 'Losartan',
    brandNames: 'Cozaar',
    drugClass: 'Angiotensin II Receptor Blocker (ARB)',
    chemicalClass: 'Biphenyltetrazole imidazole derivative (prodrug via 5-hydroxymethyl oxidation)',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'AT1 Receptor (Competitive Antagonist)',
    mechanism:
      'Selectively blocks angiotensin II binding at vascular and adrenal AT1 receptors without inhibiting ACE-mediated bradykinin breakdown.',
    pharmacokinetics: {
      bioavailability: '33%',
      halfLife: '2 hours (active E-3174 metabolite: 6–9 h)',
      volumeOfDistribution: '34 L (parent); 12 L (E-3174)',
      metabolism: 'Hepatic via CYP2C9 & CYP3A4 to active carboxylic acid E-3174 (10–40× more potent)',
      excretion: '35% renal, 60% fecal',
      proteinBinding: '98.7%',
    },
    renalAndHepaticDosing:
      'No renal adjustment required (dialysis does not clear). Hepatic impairment: reduce starting dose to 25 mg daily.',
    clinicalPearls:
      'Preferred RAAS alternative when an ACEi causes bradykinin cough. Uniquely inhibits URAT1 to promote modest uric acid excretion.',
    patientCounseling:
      'Do not take if pregnant or planning pregnancy; rise slowly from seated position; avoid OTC NSAIDs and potassium salt substitutes.',
    contraindications:
      'Pregnancy (boxed warning for fetal toxicity), concurrent aliskiren in diabetes.',
    majorInteractions:
      'Strong CYP2C9 inhibitors (fluconazole reduces active E-3174 formation), potassium-sparing agents, NSAIDs, lithium.',
    monitoring: 'Blood pressure, serum potassium, SCr/eGFR.',
  },
  {
    id: 'sacubitril_valsartan',
    genericName: 'Sacubitril-Valsartan',
    brandNames: 'Entresto',
    drugClass: 'Angiotensin Receptor-Neprilysin Inhibitor (ARNI)',
    chemicalClass: 'Co-crystal of neprilysin inhibitor prodrug (AHU377 -> LBQ657) + biphenyltetrazole ARB',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Neprilysin (Neutral Endopeptidase) & AT1 Receptor',
    mechanism:
      'Sacubitrilate (LBQ657) inhibits neprilysin to boost natriuretic peptides (ANP/BNP), promoting natriuresis and vasodilation, while valsartan blocks AT1 to prevent reflex RAAS activation.',
    pharmacokinetics: {
      bioavailability: 'Sacubitril >= 60%; Valsartan ~23% higher exposure than standalone',
      halfLife: 'Sacubitrilate 11.5 h; Valsartan 9.9 h',
      volumeOfDistribution: 'Sacubitrilate 75 L; Valsartan 103 L',
      metabolism: 'Sacubitril hydrolyzed by esterases to LBQ657; minimal CYP',
      excretion: 'Sacubitrilate 52–68% renal; Valsartan 86% fecal',
      proteinBinding: '94–97%',
    },
    renalAndHepaticDosing:
      'eGFR < 30 mL/min or Child-Pugh B: start 24/26 mg BID. Avoid in Child-Pugh C.',
    clinicalPearls:
      'First-line ARNI over ACEi/ARB in HFrEF (PARADIGM-HF: 20% CV mortality reduction). Because neprilysin degrades BNP (not NT-proBNP), track NT-proBNP—not BNP—during ARNI therapy!',
    patientCounseling:
      'Wait a full 36 hours after stopping an ACE inhibitor before taking your first dose to prevent severe facial/airway swelling.',
    contraindications:
      'Concurrent ACEi or within 36 hours of ACEi washout (severe angioedema risk), history of angioedema, pregnancy.',
    majorInteractions:
      'ACE inhibitors (36-hour washout mandatory), potassium-sparing diuretics, NSAIDs, lithium, statins (OATP1B1 inhibition).',
    monitoring: 'Blood pressure, K+, SCr/eGFR, NT-proBNP (not BNP).',
  },
  {
    id: 'metoprolol_succinate',
    genericName: 'Metoprolol Succinate',
    brandNames: 'Toprol XL',
    drugClass: 'Cardioselective Beta-1 Blocker',
    chemicalClass: 'Aryloxypropanolamine beta-1 antagonist (succinate ER matrix)',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Beta-1 Adrenergic Receptor (Gs-GPCR)',
    mechanism:
      'Competitively antagonizes beta-1 receptors on cardiac myocytes and juxtaglomerular cells, lowering heart rate, contractility, and renin release.',
    pharmacokinetics: {
      bioavailability: '40–50% (extended-release)',
      halfLife: '3–7 hours (controlled release over 20 h)',
      volumeOfDistribution: '3.2–5.6 L/kg (lipophilic, crosses BBB)',
      metabolism: 'Hepatic primarily via CYP2D6 (polymorphic)',
      excretion: 'Renal (~95% as metabolites)',
      proteinBinding: '12%',
    },
    renalAndHepaticDosing:
      'No renal adjustment required. Hepatic impairment: start low (12.5–25 mg daily) and titrate slowly.',
    clinicalPearls:
      'Only three beta-blockers have proven mortality benefit in HFrEF: metoprolol succinate, carvedilol, and bisoprolol. Tartrate salt is NOT interchangeable for chronic HFrEF mortality reduction.',
    patientCounseling:
      'Take once daily with or immediately after a meal; scored ER tablets may be split in half but never crush or chew; never stop abruptly (rebound angina/tachycardia).',
    contraindications:
      'Severe sinus bradycardia, 2nd/3rd-degree AV block without pacemaker, decompensated cardiogenic shock.',
    majorInteractions:
      'Non-DHP CCBs (verapamil/diltiazem cause additive AV nodal block), strong CYP2D6 inhibitors (paroxetine, fluoxetine, bupropion).',
    monitoring: 'Resting heart rate, blood pressure, signs of fluid retention during titration.',
  },
  {
    id: 'furosemide',
    genericName: 'Furosemide',
    brandNames: 'Lasix',
    drugClass: 'Loop Diuretic',
    chemicalClass: 'Anthranilic acid sulfonamide derivative',
    specialty: 'cardiorenal',
    dosageForm: 'iv_vial',
    molecularTarget: 'Na+-K+-2Cl- Cotransporter (NKCC2, Thick Ascending Limb)',
    mechanism:
      'Reversibly inhibits luminal NKCC2 in the thick ascending limb of Henle, abolishing the corticomedullary osmotic gradient and driving potent natriuresis.',
    pharmacokinetics: {
      bioavailability: '10–90% erratic (mean ~50% oral; 2:1 IV-to-PO conversion)',
      halfLife: '1.5–2 hours (prolonged in renal impairment)',
      volumeOfDistribution: '0.1–0.2 L/kg',
      metabolism: 'Renal glucuronidation (~35%)',
      excretion: '65% renal unchanged via organic anion transporter (OAT)',
      proteinBinding: '91–99% (albumin)',
    },
    renalAndHepaticDosing:
      'Higher ceiling doses required in severe CKD/nephrotic syndrome to achieve luminal tubular secretion. Hypoalbuminemia blunts delivery to OAT.',
    clinicalPearls:
      'Remains effective even when eGFR < 30 mL/min (unlike thiazides). Increases urinary Ca2+ excretion ("Loops Lose Calcium").',
    patientCounseling:
      'Take in the morning (and early afternoon if BID) to avoid nocturia; weigh yourself daily at the same time; rise slowly and use sunscreen (photosensitivity).',
    contraindications:
      'Anuria, severe electrolyte depletion, hepatic coma.',
    majorInteractions:
      'Aminoglycosides & cisplatin (additive ototoxicity), digoxin (loop-induced hypokalemia precipitates digoxin toxicity), NSAIDs (blunt diuretic response).',
    monitoring: 'Daily weight, I&Os, serum K+, Mg2+, Na+, SCr, and blood pressure.',
  },
  {
    id: 'hydrochlorothiazide',
    genericName: 'Hydrochlorothiazide',
    brandNames: 'Microzide',
    drugClass: 'Thiazide Diuretic',
    chemicalClass: 'Benzothiadiazine sulfonamide derivative',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Na+/Cl- Cotransporter (NCC, Early Distal Convoluted Tubule)',
    mechanism:
      'Inhibits luminal NCC in the early distal convoluted tubule, increasing NaCl excretion while enhancing basolateral Ca2+ reabsorption.',
    pharmacokinetics: {
      bioavailability: '65–75%',
      halfLife: '6–15 hours',
      volumeOfDistribution: '0.8–3 L/kg',
      metabolism: 'Not metabolized',
      excretion: '> 95% renal unchanged',
      proteinBinding: '68%',
    },
    renalAndHepaticDosing:
      'Ineffective as monotherapy when CrCl < 30 mL/min (switch to loop diuretic or chlorthalidone/metolazone adjunct).',
    clinicalPearls:
      'Thiazides conserve calcium ("Thiazides Take Calcium In") and carry the 4-hyper metabolic profile: hypercalcemia, hyperuricemia (gout), hyperglycemia, hyperlipidemia.',
    patientCounseling:
      'Take in the morning with food; report muscle cramps or dizziness; apply broad-spectrum sunscreen (increases non-melanoma skin cancer/photosensitivity risk).',
    contraindications:
      'Anuria, severe hyponatremia, refractory hypokalemia.',
    majorInteractions:
      'Lithium (markedly increases lithium levels via compensatory proximal reabsorption), digoxin (hypokalemia), NSAIDs.',
    monitoring: 'Serum Na+, K+, Mg2+, Ca2+, uric acid, blood pressure.',
  },
  {
    id: 'spironolactone',
    genericName: 'Spironolactone',
    brandNames: 'Aldactone',
    drugClass: 'Mineralocorticoid Receptor Antagonist (MRA)',
    chemicalClass: '17-spirolactone steroid analog',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Intracellular Aldosterone Receptor (Collecting Duct)',
    mechanism:
      'Competitively blocks aldosterone binding at the late distal tubule and collecting duct, reducing ENaC sodium reabsorption and K+/H+ excretion.',
    pharmacokinetics: {
      bioavailability: '> 90% (increased with food)',
      halfLife: '1.4 hours (active canrenone metabolite: 16.5 h)',
      volumeOfDistribution: '0.05 L/kg (parent)',
      metabolism: 'Extensive hepatic metabolism to active canrenone & 7-alpha-thiomethylspironolactone',
      excretion: 'Renal and biliary',
      proteinBinding: '> 90%',
    },
    renalAndHepaticDosing:
      'HFrEF: avoid if eGFR < 30 mL/min or K+ > 5.0 mEq/L; eGFR 30–49: start 12.5 mg daily or every other day.',
    clinicalPearls:
      'Proven mortality benefit in NYHA Class II–IV HFrEF (RALES) and first-line diuretic for cirrhotic ascites. Non-selective androgen/progesterone binding causes gynecomastia (switch to eplerenone).',
    patientCounseling:
      'Take consistently with food; avoid high-potassium salt substitutes and NSAIDs; report breast tenderness or muscle weakness.',
    contraindications:
      'Hyperkalemia (K+ > 5.0–5.5 mEq/L), anuria, Addison disease, eGFR < 30 mL/min in HFrEF.',
    majorInteractions:
      'ACEi/ARBs, trimethoprim, potassium supplements (severe hyperkalemia), digoxin (assay interference and reduced clearance).',
    monitoring: 'Serum potassium and renal function at baseline, day 3, week 1, and monthly.',
  },
  {
    id: 'apixaban',
    genericName: 'Apixaban',
    brandNames: 'Eliquis',
    drugClass: 'Direct Factor Xa Inhibitor (DOAC)',
    chemicalClass: 'Pyrazolo-pyridinone small-molecule reversible Factor Xa inhibitor',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Free and Clot-Bound Factor Xa',
    mechanism:
      'Directly, reversibly inhibits Factor Xa without requiring antithrombin III, blocking conversion of prothrombin to thrombin.',
    pharmacokinetics: {
      bioavailability: '50%',
      halfLife: '12 hours',
      volumeOfDistribution: '21 L (~0.3 L/kg)',
      metabolism: 'Hepatic via CYP3A4 (25%) and P-gp substrate',
      excretion: '27% renal (lowest renal reliance among DOACs), 73% fecal',
      proteinBinding: '87%',
    },
    renalAndHepaticDosing:
      'AFib 5 mg BID -> reduce to 2.5 mg BID ONLY if >= 2 ABC criteria: Age >= 80, Body weight <= 60 kg, SCr >= 1.5 mg/dL (or with strong dual CYP3A4/P-gp inhibitors). Avoid in Child-Pugh C.',
    clinicalPearls:
      'Preferred DOAC in moderate-to-severe CKD and elderly AFib patients due to lowest renal clearance (27%) and favorable GI bleeding profile.',
    patientCounseling:
      'Never miss doses (short 12-hour half-life leaves rapid coverage gaps); report unusual bruising, pink/red urine, or black tarry stools; avoid OTC NSAIDs.',
    contraindications:
      'Active pathological bleeding, mechanical heart valves (warfarin required), severe hepatic impairment (Child-Pugh C).',
    majorInteractions:
      'Strong dual CYP3A4 + P-gp inhibitors (ketoconazole, ritonavir) and strong inducers (rifampin, carbamazepine, phenytoin), antiplatelets/NSAIDs.',
    monitoring: 'CBC, SCr, LFTs annually; no routine INR monitoring needed.',
    antidoteOrReversal: 'Andexanet alfa (recombinant Factor Xa decoy) or 4-factor PCC.',
  },
  {
    id: 'warfarin',
    genericName: 'Warfarin',
    brandNames: 'Coumadin, Jantoven',
    drugClass: 'Vitamin K Antagonist (VKA)',
    chemicalClass: 'Racemic 4-hydroxycoumarin derivative (S- and R-enantiomers)',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Vitamin K Epoxide Reductase Complex 1 (VKORC1)',
    mechanism:
      'Inhibits VKORC1, preventing gamma-carboxylation of clotting factors II, VII, IX, X and endogenous anticoagulants Protein C and S.',
    pharmacokinetics: {
      bioavailability: '> 95%',
      halfLife: '20–60 hours (mean 40 h)',
      volumeOfDistribution: '0.14 L/kg (restricted to plasma/albumin)',
      metabolism: 'S-warfarin (3–5× more potent): CYP2C9; R-warfarin: CYP1A2, CYP3A4',
      excretion: 'Renal (92% as inactive metabolites)',
      proteinBinding: '99% (albumin)',
      therapeuticTargetOrIndex: 'INR 2.0–3.0 (AFib/VTE); 2.5–3.5 (mechanical mitral valve)',
    },
    renalAndHepaticDosing:
      'No renal dose adjustment; hepatic impairment increases bleeding sensitivity (start lower, monitor INR closely).',
    clinicalPearls:
      'Protein C has a shorter half-life (~8 h) than Factor II (~60 h), creating a transient hypercoagulable window at initiation; bridge with heparin/LMWH for acute VTE.',
    patientCounseling:
      'Keep dietary vitamin K intake consistent (leafy greens) rather than eliminating them; never start OTC herbs/NSAIDs or antibiotics without checking INR.',
    contraindications:
      'Pregnancy (teratogenic fetal warfarin syndrome; exception: select mechanical valves), active bleeding, severe uncontrolled HTN.',
    majorInteractions:
      'TMP-SMX, fluconazole, metronidazole, amiodarone (inhibit CYP2C9 -> spike INR); rifampin, carbamazepine (induce -> drop INR); dietary vitamin K fluctuations.',
    monitoring: 'INR (baseline, 2–3× weekly initially, then every 4 weeks once stable), Hgb/Hct.',
    antidoteOrReversal: 'Phytonadione (Vitamin K1) + 4-Factor PCC for life-threatening bleeding.',
  },
  {
    id: 'enoxaparin',
    genericName: 'Enoxaparin',
    brandNames: 'Lovenox',
    drugClass: 'Low-Molecular-Weight Heparin (LMWH)',
    chemicalClass: 'Depolymerized sulfated glycosaminoglycan (~4.5 kDa)',
    specialty: 'cardiorenal',
    dosageForm: 'pen',
    molecularTarget: 'Antithrombin III -> Preferential Factor Xa Inhibition (~4:1 Xa:IIa)',
    mechanism:
      'Binds antithrombin III via its unique pentasaccharide sequence, accelerating Factor Xa inactivation ~1000-fold while having shorter chain length than UFH for less IIa inhibition.',
    pharmacokinetics: {
      bioavailability: '~100% SC',
      halfLife: '4.5–7 hours (prolonged markedly in CKD)',
      volumeOfDistribution: '4.3 L (intravascular)',
      metabolism: 'Hepatic desulfation/depolymerization',
      excretion: 'Renal (40% unchanged + active fragments)',
      proteinBinding: 'Low non-specific binding (predictable pharmacokinetics)',
      therapeuticTargetOrIndex: 'Peak Anti-Xa 0.5–1.0 IU/mL (4 h post-dose if monitored)',
    },
    renalAndHepaticDosing:
      'CrCl < 30 mL/min: MUST reduce treatment dose from 1 mg/kg q12h to 1 mg/kg ONCE daily (or switch to UFH). Prophylaxis: 30 mg SC daily.',
    clinicalPearls:
      'Lower risk of HIT than UFH, though still contraindicated in acute HIT. Protamine only reverses ~60% of LMWH anti-Xa activity.',
    patientCounseling:
      'Inject into abdominal fat >= 2 inches from navel; do NOT expel the air bubble in prefilled syringes prior to injection; do not rub site afterwards.',
    contraindications:
      'Active major bleeding, history of heparin-induced thrombocytopenia (HIT) within 100 days or positive antibodies.',
    majorInteractions:
      'Antiplatelets, NSAIDs, DOACs, spinal/epidural anesthesia (boxed warning for spinal/epidural hematoma).',
    monitoring: 'SCr/CrCl, CBC/platelets, signs of bleeding; Anti-Xa levels in severe CKD, obesity, or pregnancy.',
    antidoteOrReversal: 'Protamine sulfate (partial ~60% reversal only).',
  },
  {
    id: 'clopidogrel',
    genericName: 'Clopidogrel',
    brandNames: 'Plavix',
    drugClass: 'Thienopyridine P2Y12 Platelet Inhibitor',
    chemicalClass: 'Thienopyridine ester prodrug (irreversible disulfide binder)',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Platelet P2Y12 ADP Receptor',
    mechanism:
      'Two-step hepatic bioactivation forms an active thiol metabolite that covalently, irreversibly blocks platelet P2Y12 receptors, preventing ADP-mediated GPIIb/IIIa activation for the platelet’s 7–10 day lifespan.',
    pharmacokinetics: {
      bioavailability: '>= 50%',
      halfLife: '6 hours (parent); irreversible platelet inhibition lasts 7–10 days',
      volumeOfDistribution: 'Extensive tissue distribution',
      metabolism: '85% inactivated by esterases; 15% two-step CYP2C19 activation (boxed warning)',
      excretion: '50% renal, 46% fecal',
      proteinBinding: '98%',
    },
    renalAndHepaticDosing:
      'No routine renal or mild-moderate hepatic adjustment; avoid in severe hepatic impairment with bleeding diathesis.',
    clinicalPearls:
      'CYP2C19 poor metabolizers (*2/*3 alleles) cannot activate clopidogrel and face high coronary stent thrombosis risk—switch to prasugrel or ticagrelor!',
    patientCounseling:
      'Do NOT stop taking after coronary stent placement without cardiologist approval (risk of fatal stent thrombosis); avoid OTC omeprazole/esomeprazole.',
    contraindications:
      'Active pathological bleeding (peptic ulcer, intracranial hemorrhage).',
    majorInteractions:
      'Omeprazole & esomeprazole (inhibit CYP2C19 bioactivation—use pantoprazole), anticoagulants, NSAIDs, SSRIs.',
    monitoring: 'Signs of bleeding, CBC, CYP2C19 pharmacogenomics in high-risk PCI.',
  },
  {
    id: 'atorvastatin',
    genericName: 'Atorvastatin',
    brandNames: 'Lipitor',
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    chemicalClass: 'Synthetic pyrrole heptanoic acid (lipophilic statin)',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'HMG-CoA Reductase (Rate-Limiting Step in Mevalonate Pathway)',
    mechanism:
      'Competitively inhibits hepatic cholesterol synthesis, triggering SREBP-2 upregulation of hepatic LDL receptors and accelerating LDL-C clearance.',
    pharmacokinetics: {
      bioavailability: '14% (high first-pass)',
      halfLife: '14 hours (active metabolites: 20–30 h)',
      volumeOfDistribution: '381 L (~5.4 L/kg)',
      metabolism: 'Hepatic via CYP3A4',
      excretion: 'Primarily biliary/fecal (< 2% renal — preferred in CKD)',
      proteinBinding: '98%',
    },
    renalAndHepaticDosing:
      'Zero renal dose adjustment needed across all stages of CKD (including dialysis). Contraindicated in active decompensated liver disease.',
    clinicalPearls:
      'Long active half-life permits flexible morning or evening dosing (unlike simvastatin). High-intensity (40–80 mg) lowers LDL-C >= 50%.',
    patientCounseling:
      'May take any time of day with or without food; report unexplained muscle pain, tenderness, or dark tea-colored urine; avoid large quantities of grapefruit juice.',
    contraindications:
      'Active liver disease or unexplained persistent transaminase elevation, pregnancy, lactation.',
    majorInteractions:
      'Strong CYP3A4 inhibitors (clarithromycin, itraconazole, ritonavir), cyclosporine, gemfibrozil (myopathy/rhabdomyolysis risk).',
    monitoring: 'Fasting lipid panel at 4–12 weeks, baseline LFTs, muscle symptoms (CK if myalgia).',
  },
  {
    id: 'amiodarone',
    genericName: 'Amiodarone',
    brandNames: 'Pacerone, Cordarone',
    drugClass: 'Class III Antiarrhythmic',
    chemicalClass: 'Diiodinated benzofuran derivative (37% iodine by weight)',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Delayed Rectifier K+ Channels (IKr) & Na+/Ca2+/Beta Receptors',
    mechanism:
      'Prolongs action potential duration and effective refractory period across cardiac tissue via K+ channel blockade, plus beta, Ca2+, and Na+ inhibition.',
    pharmacokinetics: {
      bioavailability: '35–65% (variable)',
      halfLife: '15–100 days (mean 40–58 days)',
      volumeOfDistribution: '66 L/kg (massive adipose/tissue sequestration)',
      metabolism: 'Hepatic via CYP3A4 & CYP2C8 to active desethylamiodarone',
      excretion: 'Biliary/fecal (virtually zero renal clearance)',
      proteinBinding: '96%',
    },
    renalAndHepaticDosing:
      'No renal dose adjustment required (not dialyzable). Reduce dose in severe hepatic dysfunction if transaminases > 3× ULN.',
    clinicalPearls:
      'High iodine load causes BOTH hypothyroidism (Wolff-Chaikoff) and hyperthyroidism (Jod-Basedow), plus pulmonary fibrosis (most fatal toxicity), corneal microdeposits, and blue-gray skin.',
    patientCounseling:
      'Report new cough or shortness of breath immediately; wear broad-spectrum sunscreen and sunglasses; avoid grapefruit juice.',
    contraindications:
      'Cardiogenic shock, severe sinus-node dysfunction, 2nd/3rd-degree AV block without pacemaker.',
    majorInteractions:
      'Potent inhibitor of CYP2C9, CYP2D6, CYP3A4, and P-gp: cut warfarin dose 30–50% and digoxin dose 50%; cap simvastatin at 20 mg.',
    monitoring: 'Baseline & periodic PFTs/CXR, LFTs & TSH every 6 months, ECG (QTc), eye exams.',
  },
  {
    id: 'digoxin',
    genericName: 'Digoxin',
    brandNames: 'Lanoxin',
    drugClass: 'Cardiac Glycoside',
    chemicalClass: 'Digitalis lanata steroid lactone glycoside',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Sarcolemmal Na+/K+-ATPase Pump',
    mechanism:
      'Inhibits myocardial Na+/K+-ATPase, increasing intracellular Na+, reducing Ca2+ extrusion via NCX to boost inotropy while enhancing vagal tone at the AV node.',
    pharmacokinetics: {
      bioavailability: '70–80% (tablets)',
      halfLife: '36–48 hours (3.5–5 days in anuria)',
      volumeOfDistribution: '4–7 L/kg (binds skeletal muscle, NOT adipose — dose by IBW)',
      metabolism: 'Minimal (~16%)',
      excretion: '70–80% renal unchanged (P-gp substrate)',
      proteinBinding: '25%',
      therapeuticTargetOrIndex: '0.5–0.9 ng/mL (HFrEF); 0.8–2.0 ng/mL (AFib)',
    },
    renalAndHepaticDosing:
      'Reduce maintenance dose (e.g. 0.0625 mg or every other day) when CrCl < 50 mL/min; dose based on ideal body weight.',
    clinicalPearls:
      'Hypokalemia, hypomagnesemia, and hypercalcemia accelerate digoxin toxicity because K+ competes at the Na+/K+-ATPase site. Classic signs: nausea, confusion, yellow-green halos (xanthopsia).',
    patientCounseling:
      'Check pulse daily; report nausea, loss of appetite, blurred/yellow-green vision, or unusual fatigue immediately.',
    contraindications:
      'Ventricular fibrillation, uncontrolled hypercalcemia, Wolff-Parkinson-White with AFib.',
    majorInteractions:
      'Amiodarone, verapamil, quinidine, clarithromycin (P-gp inhibition), loop/thiazide diuretics (K+ depletion).',
    monitoring: 'Serum digoxin trough (>= 6–12 h post-dose), K+, Mg2+, SCr.',
    antidoteOrReversal: 'Digoxin Immune Fab (DigiFab) for life-threatening arrhythmia or K+ > 5.5 mEq/L.',
  },
  {
    id: 'amlodipine',
    genericName: 'Amlodipine',
    brandNames: 'Norvasc',
    drugClass: 'Dihydropyridine Calcium Channel Blocker',
    chemicalClass: 'Charged 1,4-dihydropyridine derivative',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'L-Type Vascular Smooth Muscle Ca2+ Channels',
    mechanism:
      'Selectively blocks voltage-gated L-type calcium channels on peripheral arterial smooth muscle, reducing systemic vascular resistance without depressing AV nodal conduction.',
    pharmacokinetics: {
      bioavailability: '64–90%',
      halfLife: '30–50 hours',
      volumeOfDistribution: '21 L/kg',
      metabolism: 'Extensive hepatic metabolism via CYP3A4',
      excretion: 'Renal (60% inactive metabolites)',
      proteinBinding: '93%',
    },
    renalAndHepaticDosing:
      'No renal adjustment required. Hepatic impairment or frail elderly: start at 2.5 mg once daily.',
    clinicalPearls:
      'Precapillary arteriolar dilation without matching venodilation causes dose-dependent pedal edema—adding an ACEi or ARB relieves this by dilating postcapillary venules.',
    patientCounseling:
      'Take once daily; ankle swelling is a benign vasodilatory effect (notify prescriber rather than adding a loop diuretic unnecessarily).',
    contraindications:
      'Severe hypotension, cardiogenic shock, severe aortic stenosis (use cautiously).',
    majorInteractions:
      'Limits simvastatin maximum dose to 20 mg/day due to CYP3A4 competition and myopathy risk.',
    monitoring: 'Blood pressure, heart rate, ankle/pedal edema.',
  },
  {
    id: 'nitroglycerin',
    genericName: 'Nitroglycerin',
    brandNames: 'Nitrostat, Nitro-Dur',
    drugClass: 'Organic Nitrate Vasodilator',
    chemicalClass: 'Polyol nitric acid ester (NO donor)',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Soluble Guanylyl Cyclase (via Nitric Oxide Release -> cGMP)',
    mechanism:
      'Denitrated by mitochondrial ALDH2 into nitric oxide, elevating vascular cGMP to cause predominantly venous capacitance dilation (reducing preload and myocardial O2 demand).',
    pharmacokinetics: {
      bioavailability: '< 1% swallowed (massive first-pass); ~40% sublingual (onset 1–3 min)',
      halfLife: '1–4 minutes',
      volumeOfDistribution: '3 L/kg',
      metabolism: 'Rapid hepatic/vascular nitrate reductase (ALDH2)',
      excretion: 'Renal (inactive dinitrate/mononitrate metabolites)',
      proteinBinding: '60%',
    },
    renalAndHepaticDosing:
      'No formal adjustment; avoid in severe hypotension or preload-dependent states (RV infarction, hypertrophic cardiomyopathy).',
    clinicalPearls:
      'Continuous nitrate exposure depletes sulfhydryl/ALDH2 capacity causing nitrate tolerance—scheduled patches/oral nitrates REQUIRE a 10–12 hour nitrate-free interval overnight.',
    patientCounseling:
      'Sit down before placing 1 SL tablet under tongue; repeat q5min up to 3 doses, calling 911 if pain persists after 1st dose. Store in original amber glass bottle (absorbs into plastic).',
    contraindications:
      'PDE-5 inhibitors (sildenafil/vardenafil within 24 h; tadalafil within 48 h -> catastrophic hypotension!), riociguat, severe anemia/RV MI.',
    majorInteractions:
      'Sildenafil, tadalafil, vardenafil, riociguat (profound synergistic cGMP vasodilation), alcohol.',
    monitoring: 'Blood pressure, heart rate, angina relief, throbbing headache.',
  },
  {
    id: 'hydralazine_isdn',
    genericName: 'Hydralazine-Isosorbide Dinitrate',
    brandNames: 'BiDil',
    drugClass: 'Arterial + Venous Vasodilator Combination',
    chemicalClass: 'Phthalazine hydrazine derivative + organic nitrate',
    specialty: 'cardiorenal',
    dosageForm: 'tablet',
    molecularTarget: 'Arteriolar Smooth Muscle Relaxation + Venous NO/cGMP Activation',
    mechanism:
      'Hydralazine reduces arterial afterload while isosorbide dinitrate reduces venous preload; hydralazine’s antioxidant effect also prevents nitrate tolerance.',
    pharmacokinetics: {
      bioavailability: 'Hydralazine 30–50% (NAT2 acetylator dependent); ISDN 25%',
      halfLife: 'Hydralazine 2–8 h; ISDN 1 h (active IS-5-MN: 5 h)',
      volumeOfDistribution: 'Hydralazine 1.5 L/kg; ISDN 2–4 L/kg',
      metabolism: 'Hydralazine: hepatic N-acetyltransferase 2 (NAT2 slow vs fast acetylators)',
      excretion: 'Renal (metabolites)',
      proteinBinding: '87% (hydralazine)',
    },
    renalAndHepaticDosing:
      'Space hydralazine dosing in severe CKD (q8–12h); use cautiously in hepatic impairment.',
    clinicalPearls:
      'A-HeFT trial proved significant survival benefit in self-identified Black patients with HFrEF (NYHA III–IV) on standard GDMT, and serves as the RAAS-free alternative in hyperkalemia/AKI.',
    patientCounseling:
      'Requires TID dosing adherence; report new joint pain, facial rash, or fever (drug-induced lupus).',
    contraindications:
      'Concurrent PDE-5 inhibitors or riociguat, coronary artery disease with reflex tachycardia if unblocked.',
    majorInteractions:
      'PDE-5 inhibitors (hypotension), MAOIs, NSAIDs.',
    monitoring: 'Blood pressure, heart rate, ANA / anti-histone antibodies if lupus-like arthralgia appears.',
  },

  // ================= INFECTIOUS DISEASE (15) =================
  {
    id: 'vancomycin',
    genericName: 'Vancomycin',
    brandNames: 'Vancocin',
    drugClass: 'Glycopeptide Antibiotic',
    chemicalClass: 'Tricyclic heptapeptide glycopeptide (~1,450 Da)',
    specialty: 'infectious',
    dosageForm: 'iv_vial',
    molecularTarget: 'D-Ala-D-Ala Terminus of Cell Wall Peptidoglycan',
    mechanism:
      'Binds with high affinity to D-alanyl-D-alanine pentapeptide precursors, sterically blocking transglycosylation and cross-linking of Gram-positive cell walls.',
    pharmacokinetics: {
      bioavailability: '< 5% oral (stays in GI lumen for C. diff)',
      halfLife: '4–6 hours (normal renal function; days in ESRD)',
      volumeOfDistribution: '0.4–1 L/kg (use actual body weight for loading, up to 3 g cap)',
      metabolism: 'Minimal (< 5%)',
      excretion: '> 80–90% glomerular filtration unchanged',
      proteinBinding: '50–55%',
      therapeuticTargetOrIndex: 'AUC24/MIC 400–600 mg·h/L (avoid > 600 due to AKI)',
    },
    renalAndHepaticDosing:
      'Adjust dosing interval strictly by CrCl/AUC modeling (q12h -> q24–48h -> pulse by levels in ESRD).',
    clinicalPearls:
      'IV vancomycin treats systemic MRSA; oral vancomycin treats ONLY C. difficile colitis. Rapid infusion (< 60 min/g) triggers IgE-independent mast cell histamine release (vancomycin flushing syndrome).',
    patientCounseling:
      'Report itching/flushing during IV infusion (slow infusion rate), ringing in ears, or decreased urination.',
    contraindications:
      'Hypersensitivity to vancomycin.',
    majorInteractions:
      'Piperacillin-tazobactam, aminoglycosides, loop diuretics, amphotericin B (additive acute kidney injury).',
    monitoring: 'AUC24/MIC Bayesian levels, SCr/BUN daily, infusion rate (>= 60 min per 1 g).',
  },
  {
    id: 'ceftriaxone',
    genericName: 'Ceftriaxone',
    brandNames: 'Rocephin',
    drugClass: '3rd-Generation Cephalosporin',
    chemicalClass: 'Oximino-aminothiazolyl beta-lactam with acidic triazine ring',
    specialty: 'infectious',
    dosageForm: 'iv_vial',
    molecularTarget: 'Penicillin-Binding Proteins (PBPs)',
    mechanism:
      'Acylates bacterial transpeptidases (PBPs), halting peptidoglycan cross-linking and triggering autolysin-mediated cell lysis.',
    pharmacokinetics: {
      bioavailability: '100% IV/IM',
      halfLife: '6–9 hours (once-daily dosing)',
      volumeOfDistribution: '0.12–0.18 L/kg (high CSF penetration when meninges inflamed)',
      metabolism: 'Minimal',
      excretion: 'Dual renal (~50–60%) & biliary (~40–50%)',
      proteinBinding: '85–95% (saturable)',
    },
    renalAndHepaticDosing:
      'NO renal dose adjustment required due to dual biliary/renal elimination! Cap at 2 g/day only if combined severe renal + hepatic failure.',
    clinicalPearls:
      'First-line for bacterial meningitis (with vancomycin), CAP, pyelonephritis, and gonorrhea. Lacks Pseudomonas and Enterococcus coverage.',
    patientCounseling:
      'IM injections may be reconstituted with 1% lidocaine to reduce pain; report watery diarrhea or right upper quadrant pain.',
    contraindications:
      'Hyperbilirubinemic neonates (displaces bilirubin -> kernicterus), concurrent IV calcium-containing solutions in neonates (Y-site/separate lines).',
    majorInteractions:
      'IV calcium solutions (ceftriaxone-calcium precipitation in lungs/kidneys of neonates), warfarin (enhanced hypoprothrombinemia).',
    monitoring: 'Clinical signs of infection, CBC, LFTs/gallbladder biliary pseudolithiasis on prolonged therapy.',
  },
  {
    id: 'pip_tazo',
    genericName: 'Piperacillin-Tazobactam',
    brandNames: 'Zosyn',
    drugClass: 'Extended-Spectrum Antipseudomonal Penicillin + BLI',
    chemicalClass: 'Ureidopenicillin + penicillanic acid sulfone beta-lactamase inhibitor',
    specialty: 'infectious',
    dosageForm: 'iv_vial',
    molecularTarget: 'Bacterial PBPs (Including P. aeruginosa) + Class A Beta-Lactamases',
    mechanism:
      'Time-dependent bactericidal beta-lactam blocking cell wall cross-linking across Gram-positives, Gram-negatives (Pseudomonas), and anaerobes (Bacteroides), protected by tazobactam.',
    pharmacokinetics: {
      bioavailability: '100% IV',
      halfLife: '0.7–1.2 hours',
      volumeOfDistribution: '0.2–0.3 L/kg',
      metabolism: 'Minimal',
      excretion: 'Renal (~68% piperacillin, 80% tazobactam via glomerular + tubular secretion)',
      proteinBinding: '30%',
      therapeuticTargetOrIndex: 'fT > MIC >= 50% (extended 4-h infusion improves PK/PD)',
    },
    renalAndHepaticDosing:
      'Reduce frequency when CrCl <= 40 mL/min (e.g. 2.25 g q6h for non-nosocomial, 3.375 g q6h for nosocomial/Pseudomonas).',
    clinicalPearls:
      'Watch out for the "Vanc + Zosyn" acute kidney injury interaction—combining pip-tazo with vancomycin triples AKI risk compared with vancomycin + cefepime!',
    patientCounseling:
      'Infuse extended doses over 4 hours when ordered to maximize time above MIC; report rash or C. diff diarrhea.',
    contraindications:
      'Severe anaphylactic beta-lactam hypersensitivity.',
    majorInteractions:
      'Vancomycin (synergistic nephrotoxicity), aminoglycosides (inactivate if mixed in same IV bag), methotrexate (reduced clearance).',
    monitoring: 'SCr/BUN daily (especially with vancomycin), CBC, electrolytes (contains ~2.8 mEq Na+/g).',
  },
  {
    id: 'meropenem',
    genericName: 'Meropenem',
    brandNames: 'Merrem',
    drugClass: 'Carbapenem Antibiotic',
    chemicalClass: '1-beta-methyl carbapenem (resistant to renal DHP-1)',
    specialty: 'infectious',
    dosageForm: 'iv_vial',
    molecularTarget: 'PBP1a, PBP1b, PBP2, PBP3 (Broad Beta-Lactamase Stable)',
    mechanism:
      'Binds PBPs with extraordinary stability against ESBL and AmpC beta-lactamases, killing Gram-positives, Gram-negatives (including Pseudomonas), and anaerobes.',
    pharmacokinetics: {
      bioavailability: '100% IV',
      halfLife: '1 hour',
      volumeOfDistribution: '0.2–0.3 L/kg (good CSF penetration at 2 g q8h)',
      metabolism: 'Minimal hydrolysis (resistant to renal dehydropeptidase-I without cilastatin)',
      excretion: '70% renal unchanged',
      proteinBinding: '2%',
      therapeuticTargetOrIndex: 'fT > MIC >= 40%',
    },
    renalAndHepaticDosing:
      'CrCl 26–50: q12h; CrCl 10–25: half dose q12h; CrCl < 10: half dose q24h.',
    clinicalPearls:
      'Carbapenems rapidly inhibit acylpeptide hydrolase in the gut/liver, causing serum VALPROATE concentrations to plummet by 60–90% within 24 hours—switch AED or antibiotic immediately!',
    patientCounseling:
      'Report rash or diarrhea; low (< 1%) true IgE cross-reactivity with penicillin allergy.',
    contraindications:
      'Severe carbapenem hypersensitivity; concurrent valproic acid/divalproex (avoid combination).',
    majorInteractions:
      'Valproic acid/divalproex (precipitates breakthrough seizures), probenecid (blocks renal excretion).',
    monitoring: 'Renal function, seizure precautions, valproate avoidance.',
  },
  {
    id: 'azithromycin',
    genericName: 'Azithromycin',
    brandNames: 'Zithromax',
    drugClass: 'Macrolide (Azalide) Antibiotic',
    chemicalClass: '15-membered semi-synthetic azalide lactone ring',
    specialty: 'infectious',
    dosageForm: 'tablet',
    molecularTarget: '50S Bacterial Ribosomal Subunit (23S rRNA)',
    mechanism:
      'Reversibly binds the 23S rRNA of the 50S ribosomal subunit, blocking peptide exit tunnel and inhibiting bacterial protein translocation.',
    pharmacokinetics: {
      bioavailability: '37%',
      halfLife: '68 hours (massive intracellular/tissue accumulation)',
      volumeOfDistribution: '31 L/kg (concentrates 100× in phagocytes/tissues vs serum)',
      metabolism: 'Minimal hepatic (NOT a CYP3A4 inhibitor, unlike clarithromycin)',
      excretion: 'Primarily biliary/fecal unchanged',
      proteinBinding: '7–51% (concentration-dependent)',
    },
    renalAndHepaticDosing:
      'No renal dose adjustment required; use cautiously in severe hepatic/cholestatic disease.',
    clinicalPearls:
      'Covers atypical respiratory pathogens (Mycoplasma, Chlamydophila, Legionella). Spares CYP3A4 (safe with statins/tamsulosin unlike clarithromycin), yet still prolongs QTc.',
    patientCounseling:
      'May take with or without food (food reduces GI upset); complete full 3–5 day course despite long tissue half-life.',
    contraindications:
      'Prior cholestatic jaundice from azithromycin, marked baseline QTc prolongation.',
    majorInteractions:
      'QT-prolonging agents (amiodarone, sotalol, haloperidol, ondansetron -> Torsades de Pointes risk).',
    monitoring: 'ECG (QTc in high-risk cardiac patients), LFTs, GI tolerability.',
  },
  {
    id: 'ciprofloxacin',
    genericName: 'Ciprofloxacin',
    brandNames: 'Cipro',
    drugClass: 'Fluoroquinolone Antibiotic',
    chemicalClass: 'Fluorinated 4-quinolone carboxylic acid (zwitterion)',
    specialty: 'infectious',
    dosageForm: 'tablet',
    molecularTarget: 'DNA Gyrase (Topoisomerase II) & Topoisomerase IV',
    mechanism:
      'Inhibits bacterial DNA gyrase and topoisomerase IV, stabilizing cleaved DNA-enzyme complexes and causing lethal double-strand DNA breaks.',
    pharmacokinetics: {
      bioavailability: '70–80%',
      halfLife: '4 hours',
      volumeOfDistribution: '2–3 L/kg (high prostate/bone/urine penetration)',
      metabolism: 'Hepatic (15%) — potent CYP1A2 inhibitor',
      excretion: 'Renal (~40–50% unchanged) and transintestinal',
      proteinBinding: '20–40%',
      therapeuticTargetOrIndex: 'AUC24/MIC >= 125 (Gram-negatives)',
    },
    renalAndHepaticDosing:
      'CrCl 30–50: 250–500 mg q12h; CrCl 5–29: 250–500 mg q18h.',
    clinicalPearls:
      'Only oral antibiotic class reliably covering Pseudomonas aeruginosa (along with levofloxacin). Boxed warnings: tendinitis/tendon rupture, peripheral neuropathy, CNS effects, aortic aneurysm.',
    patientCounseling:
      'Separate by 2 h before or 6 h after calcium, iron, zinc, dairy-fortified juices, or antacids; stop immediately if Achilles tendon pain occurs.',
    contraindications:
      'Concurrent tizanidine (massive CYP1A2 inhibition), myasthenia gravis exacerbation.',
    majorInteractions:
      'Polyvalent cations (chelate drug), tizanidine/theophylline/clozapine (CYP1A2), warfarin.',
    monitoring: 'Tendon pain, blood glucose (dysglycemia), QTc, renal function.',
  },
  {
    id: 'gentamicin',
    genericName: 'Gentamicin',
    brandNames: 'Garamycin',
    drugClass: 'Aminoglycoside Antibiotic',
    chemicalClass: 'Polycationic aminocyclitol glycoside (highly polar)',
    specialty: 'infectious',
    dosageForm: 'iv_vial',
    molecularTarget: '30S Ribosomal Subunit (16S rRNA, Initiation Complex)',
    mechanism:
      'Requires oxygen-dependent active transport across Gram-negative inner membrane, then irreversibly binds 30S ribosomes to cause mRNA misreading and bactericidal membrane disruption.',
    pharmacokinetics: {
      bioavailability: '< 1% oral; 100% IV/IM',
      halfLife: '2–3 hours (30–60 h in anuria)',
      volumeOfDistribution: '0.25 L/kg (hydrophilic; use adjusted BW in obesity)',
      metabolism: 'Not metabolized',
      excretion: '> 95% glomerular filtration unchanged',
      proteinBinding: '< 10%',
      therapeuticTargetOrIndex: 'Cmax/MIC >= 8–10 (Extended-interval peak 20–30, trough < 1 mcg/mL)',
    },
    renalAndHepaticDosing:
      'Extended-interval (5–7 mg/kg q24h) extends to q36–48h as CrCl drops; avoid extended-interval if CrCl < 20–30 mL/min, pregnancy, burns, or endocarditis.',
    clinicalPearls:
      'Classic concentration-dependent bactericidal killing + long Post-Antibiotic Effect (PAE): high once-daily peaks maximize efficacy while allowing renal tubular washout to cut nephrotoxicity.',
    patientCounseling:
      'Report ringing in ears (tinnitus), vertigo/balance changes (vestibular ototoxicity can be irreversible!), or reduced urine output.',
    contraindications:
      'Myasthenia gravis (neuromuscular blockade), prior aminoglycoside ototoxicity.',
    majorInteractions:
      'Loop diuretics (additive ototoxicity), vancomycin/amphotericin/NSAIDs (nephrotoxicity), neuromuscular blockers.',
    monitoring: 'Peak/trough or 6–14 h Hartford nomogram levels, SCr/BUN daily, auditory/vestibular signs.',
  },
  {
    id: 'linezolid',
    genericName: 'Linezolid',
    brandNames: 'Zyvox',
    drugClass: 'Oxazolidinone Antibiotic',
    chemicalClass: 'Synthetic morpholino-fluorophenyl oxazolidinone',
    specialty: 'infectious',
    dosageForm: 'tablet',
    molecularTarget: '50S Ribosomal Subunit (23S rRNA, Prevents 70S Initiation Complex)',
    mechanism:
      'Inhibits bacterial protein synthesis at the earliest initiation step (no cross-resistance with macrolides/clindamycin); covers MRSA and VRE.',
    pharmacokinetics: {
      bioavailability: '100% oral (exact 1:1 IV-to-PO switch!)',
      halfLife: '4.5–5.5 hours',
      volumeOfDistribution: '0.6–0.7 L/kg (excellent lung ELF & CSF penetration)',
      metabolism: 'Non-enzymatic oxidation to inactive metabolites',
      excretion: '30% renal unchanged, 50% renal metabolites',
      proteinBinding: '31%',
    },
    renalAndHepaticDosing:
      'Zero renal or mild-moderate hepatic dose adjustment needed (no CYP metabolism).',
    clinicalPearls:
      '100% oral bioavailability allows immediate oral step-down for MRSA/VRE pneumonia or osteomyelitis. Weak reversible non-selective MAO inhibitor: risk of serotonin syndrome with SSRIs and thrombocytopenia after > 14 days!',
    patientCounseling:
      'Avoid tyramine-rich aged cheeses/cured meats/tap beer; report fever, agitation, shivering (serotonin toxicity), or vision changes (optic neuropathy > 28 days).',
    contraindications:
      'Concurrent MAOIs (within 14 days), uncontrolled hypertension/pheochromocytoma.',
    majorInteractions:
      'SSRIs, SNRIs, TCAs, tramadol, triptans (serotonin syndrome), pseudoephedrine/sympathomimetics.',
    monitoring: 'Weekly CBC (thrombocytopenia/anemia if > 2 weeks), visual acuity on prolonged use.',
  },
  {
    id: 'doxycycline',
    genericName: 'Doxycycline',
    brandNames: 'Vibramycin, Doryx',
    drugClass: 'Tetracycline Antibiotic',
    chemicalClass: 'Semi-synthetic lipophilic naphthacene carboxamide',
    specialty: 'infectious',
    dosageForm: 'capsule',
    molecularTarget: '30S Bacterial Ribosomal Subunit (Aminoacyl-tRNA Blockade)',
    mechanism:
      'Binds reversibly to the 30S ribosomal subunit, preventing aminoacyl-tRNA attachment to the acceptor site and halting bacterial protein synthesis.',
    pharmacokinetics: {
      bioavailability: '90–100%',
      halfLife: '18–22 hours',
      volumeOfDistribution: '0.7–1.5 L/kg',
      metabolism: 'Hepatic / intestinal chelation',
      excretion: 'Primarily fecal/non-renal (safe in renal impairment)',
      proteinBinding: '80–90%',
    },
    renalAndHepaticDosing:
      'Zero renal dose adjustment required (unlike tetracycline/minocycline).',
    clinicalPearls:
      'Drug of choice for tick-borne infections (Lyme, Rocky Mountain spotted fever even in children < 8 for short courses), Chlamydia, and community MRSA skin infections.',
    patientCounseling:
      'Swallow with a full glass of water and stay upright for >= 30 minutes to prevent esophageal ulceration; wear sunscreen; separate 2 h from iron/calcium/antacids.',
    contraindications:
      'Pregnancy (permanent fetal tooth discoloration & bone growth inhibition), children < 8 years (except RMSF/anthrax).',
    majorInteractions:
      'Polyvalent cations (antacids, iron, Ca2+), oral retinoids (pseudotumor cerebri), barbiturates/phenytoin.',
    monitoring: 'Photosensitivity, esophageal irritation, clinical cure.',
  },
  {
    id: 'nitrofurantoin',
    genericName: 'Nitrofurantoin',
    brandNames: 'Macrobid, Macrodantin',
    drugClass: 'Urinary Tract Anti-Infective',
    chemicalClass: 'Nitrofuran heterocyclic prodrug',
    specialty: 'infectious',
    dosageForm: 'capsule',
    molecularTarget: 'Bacterial Nitroreductases (Reactive Multi-Target Intermediates)',
    mechanism:
      'Reduced inside bacteria to reactive intermediates that nonspecifically damage ribosomal proteins, DNA, and metabolic enzymes inside urinary pathogens.',
    pharmacokinetics: {
      bioavailability: '80% (improved with food)',
      halfLife: '20–60 minutes (concentrates solely in urine)',
      volumeOfDistribution: '0.8 L/kg (negligible tissue levels)',
      metabolism: 'Hepatic (~60%)',
      excretion: '30–40% renal unchanged into urine',
      proteinBinding: '60%',
    },
    renalAndHepaticDosing:
      'Contraindicated if CrCl < 30 mL/min (insufficient urinary concentration + systemic neuropathy/toxicity).',
    clinicalPearls:
      'First-line for uncomplicated lower UTI (cystitis), NEVER for pyelonephritis or bacteremia! Safe with warfarin compared with TMP-SMX.',
    patientCounseling:
      'Take with food or milk to improve absorption and lessen nausea; harmless brownish urine discoloration is normal.',
    contraindications:
      'CrCl < 30 mL/min, pregnancy at term (38–42 weeks: neonatal hemolytic anemia), G6PD deficiency.',
    majorInteractions:
      'Magnesium trisilicate antacids (decrease absorption), probenecid (blocks tubular secretion into urine).',
    monitoring: 'Renal function (CrCl), pulmonary fibrosis symptoms on chronic prophylaxis.',
  },
  {
    id: 'tmp_smx',
    genericName: 'Sulfamethoxazole-Trimethoprim',
    brandNames: 'Bactrim, Septra',
    drugClass: 'Folate Pathway Inhibitor',
    chemicalClass: 'Sulfonamide + diaminopyrimidine DHFR inhibitor (5:1 fixed ratio)',
    specialty: 'infectious',
    dosageForm: 'tablet',
    molecularTarget: 'Dihydropteroate Synthase & Dihydrofolate Reductase (Sequential Blockade)',
    mechanism:
      'Sulfamethoxazole blocks PABA incorporation into dihydropteroate; trimethoprim inhibits bacterial DHFR, achieving synergistic bactericidal blockade of tetrahydrofolate.',
    pharmacokinetics: {
      bioavailability: '85–90% (oral matches IV exposure)',
      halfLife: '8–12 hours',
      volumeOfDistribution: 'TMP 1.8 L/kg; SMX 0.3 L/kg (good CSF/prostate penetration)',
      metabolism: 'Hepatic acetylation & CYP2C9 inhibition (SMX)',
      excretion: 'Renal (active tubular secretion)',
      proteinBinding: 'SMX 70% / TMP 44%',
    },
    renalAndHepaticDosing:
      'CrCl 15–30 mL/min: reduce dose by 50%; CrCl < 15 mL/min: avoid unless high-dose PCP with monitoring.',
    clinicalPearls:
      'Trimethoprim blocks collecting-duct ENaC (hyperkalemia) and tubular creatinine secretion (pseudo-SCr rise without true GFR drop). Drug of choice for Pneumocystis pneumonia (PCP) and Stenotrophomonas.',
    patientCounseling:
      'Drink plenty of fluids to prevent sulfa crystalluria; stop immediately and seek care if skin rash, mucosal sores, or fever develops (SJS/TEN).',
    contraindications:
      'Pregnancy (1st trimester neural tube defects / term kernicterus), megaloblastic folate anemia, severe sulfa allergy.',
    majorInteractions:
      'Warfarin (dramatically spikes INR via CYP2C9 inhibition), ACEi/ARBs/spironolactone (hyperkalemia), methotrexate (pancytopenia).',
    monitoring: 'Serum K+, SCr, CBC, skin rash.',
  },
  {
    id: 'fluconazole',
    genericName: 'Fluconazole',
    brandNames: 'Diflucan',
    drugClass: 'Triazole Antifungal',
    chemicalClass: 'Hydrophilic bis-triazole propanol derivative',
    specialty: 'infectious',
    dosageForm: 'tablet',
    molecularTarget: 'Fungal Lanosterol 14-alpha-Demethylase (CYP51)',
    mechanism:
      'Inhibits ergosterol biosynthesis in fungal cell membranes by blocking fungal CYP450 14-alpha-demethylase, causing toxic sterol accumulation.',
    pharmacokinetics: {
      bioavailability: '> 90% (1:1 IV to PO)',
      halfLife: '30 hours',
      volumeOfDistribution: '0.6–0.7 L/kg (high CSF & urine penetration)',
      metabolism: 'Minimal hepatic; potent inhibitor of human CYP2C9, CYP2C19, moderate CYP3A4',
      excretion: '80% renal unchanged',
      proteinBinding: '11–12%',
    },
    renalAndHepaticDosing:
      'CrCl <= 50 mL/min (not on HD): give full loading dose, then reduce maintenance dose by 50%.',
    clinicalPearls:
      'Excellent CSF and urine penetration (unlike echinocandins or itraconazole). Covers Candida albicans & Cryptococcus; intrinsically inactive against C. krusei and Aspergillus.',
    patientCounseling:
      'Check all chronic medications before starting due to strong CYP interactions; report yellowing of skin/eyes or dark urine.',
    contraindications:
      'Coadministration with QTc-prolonging CYP3A4 substrates (pimozide, quinidine).',
    majorInteractions:
      'Warfarin (CYP2C9), phenytoin (CYP2C9/2C19), tacrolimus/statins (CYP3A4), QT-prolonging drugs.',
    monitoring: 'LFTs, renal function, QTc, serum levels of interacting drugs.',
  },
  {
    id: 'amox_clav',
    genericName: 'Amoxicillin-Clavulanate',
    brandNames: 'Augmentin',
    drugClass: 'Aminopenicillin + Beta-Lactamase Inhibitor',
    chemicalClass: 'Hydroxy-ampicillin + oxapenam suicide beta-lactamase inhibitor',
    specialty: 'infectious',
    dosageForm: 'tablet',
    molecularTarget: 'Penicillin-Binding Proteins + Class A Beta-Lactamases',
    mechanism:
      'Amoxicillin halts peptidoglycan cross-linking while clavulanate irreversibly binds plasmid-mediated beta-lactamases, restoring activity against H. influenzae, M. catarrhalis, MSSA, and bite anaerobes.',
    pharmacokinetics: {
      bioavailability: '75–90%',
      halfLife: '1–1.3 hours',
      volumeOfDistribution: '0.3 L/kg',
      metabolism: 'Clavulanate partially hepatic; amoxicillin minimal',
      excretion: 'Renal (60–75% unchanged)',
      proteinBinding: '18–25%',
    },
    renalAndHepaticDosing:
      'CrCl 10–30: 250–500 mg q12h; CrCl < 10: 250–500 mg q24h (never use 875 mg tablet when CrCl < 30 mL/min!).',
    clinicalPearls:
      'Clavulanate stays fixed at 125 mg across 250/500/875 mg tablets—never substitute two 250/125 mg tablets for one 500/125 mg tablet or you double clavulanate and trigger severe diarrhea.',
    patientCounseling:
      'Take at the start of a meal to minimize stomach upset and diarrhea; finish the entire prescribed course.',
    contraindications:
      'History of cholestatic jaundice/hepatic dysfunction from Augmentin, severe IgE-mediated penicillin allergy.',
    majorInteractions:
      'Allopurinol (increased rash incidence), warfarin (monitor INR), probenecid (elevates amoxicillin levels).',
    monitoring: 'GI tolerance, hepatic enzymes if prolonged use, allergic reactions.',
  },
  {
    id: 'acyclovir',
    genericName: 'Acyclovir',
    brandNames: 'Zovirax',
    drugClass: 'Nucleoside Analog Antiviral',
    chemicalClass: 'Acyclic guanosine nucleoside analog',
    specialty: 'infectious',
    dosageForm: 'iv_vial',
    molecularTarget: 'Viral Thymidine Kinase & HSV/VZV DNA Polymerase',
    mechanism:
      'Monophosphorylated selectively by viral thymidine kinase, then triphosphorylated by host kinases to competitively inhibit viral DNA polymerase and cause obligate chain termination.',
    pharmacokinetics: {
      bioavailability: '15–30% oral (valacyclovir prodrug achieves ~55%)',
      halfLife: '2.5–3.3 hours',
      volumeOfDistribution: '0.6–0.8 L/kg (dose IV by IBW in obesity!)',
      metabolism: 'Minimal',
      excretion: '62–91% renal unchanged (glomerular + tubular secretion)',
      proteinBinding: '9–33%',
    },
    renalAndHepaticDosing:
      'Mandatory renal interval extension for CrCl < 50 mL/min (q8h -> q12h -> q24h); dose IV by ideal body weight to prevent nephrotoxicity.',
    clinicalPearls:
      'High-dose IV acyclovir precipitates as needle-shaped crystals in renal tubules—pre-hydrate aggressively and infuse slowly over >= 1 hour.',
    patientCounseling:
      'Stay well hydrated throughout therapy; start oral therapy at first prodromal tingling of HSV/shingles.',
    contraindications:
      'Hypersensitivity to acyclovir or valacyclovir.',
    majorInteractions:
      'Nephrotoxic drugs (aminoglycosides, vancomycin, cyclosporine), probenecid (reduces renal clearance).',
    monitoring: 'Hydration status, urine output, SCr/BUN, neurotoxicity (tremor, confusion in renal failure).',
  },
  {
    id: 'oseltamivir',
    genericName: 'Oseltamivir',
    brandNames: 'Tamiflu',
    drugClass: 'Neuraminidase Inhibitor Antiviral',
    chemicalClass: 'Ethyl ester prodrug converted to cyclohexene carboxylate transition-state analog',
    specialty: 'infectious',
    dosageForm: 'capsule',
    molecularTarget: 'Influenza A & B Viral Neuraminidase',
    mechanism:
      'Inhibits viral neuraminidase cleavage of host sialic acid residues, trapping newly formed influenza virions on the infected cell surface and halting cell-to-cell spread.',
    pharmacokinetics: {
      bioavailability: '~80% active oseltamivir carboxylate',
      halfLife: '6–10 hours (carboxylate)',
      volumeOfDistribution: '23–26 L',
      metabolism: 'Hepatic esterases to active carboxylate (no CYP)',
      excretion: '> 90% renal unchanged via OAT1/glomerular filtration',
      proteinBinding: '3% (carboxylate)',
    },
    renalAndHepaticDosing:
      'CrCl 31–60: 30 mg BID; CrCl 11–30: 30 mg daily (treatment).',
    clinicalPearls:
      'Greatest symptom reduction (~1–1.5 days) when started within 48 hours of symptom onset, though hospitalized/high-risk patients still benefit even after 48 hours!',
    patientCounseling:
      'Take with food to lessen nausea/vomiting; complete the full 5-day course; avoid live-attenuated intranasal flu vaccine within 48 h before or 2 weeks after.',
    contraindications:
      'Severe hypersensitivity to oseltamivir.',
    majorInteractions:
      'Live-attenuated influenza vaccine (inactivates vaccine virus), probenecid (doubles carboxylate exposure).',
    monitoring: 'Symptom improvement, renal function, rare neuropsychiatric events in pediatrics.',
  },

  // ================= CNS, PAIN & PSYCHIATRY (14) =================
  {
    id: 'sertraline',
    genericName: 'Sertraline',
    brandNames: 'Zoloft',
    drugClass: 'Selective Serotonin Reuptake Inhibitor (SSRI)',
    chemicalClass: 'Naphthylamine secondary amine',
    specialty: 'cns',
    dosageForm: 'tablet',
    molecularTarget: 'Presynaptic Serotonin Transporter (SERT)',
    mechanism:
      'Selectively blocks SERT-mediated serotonin reuptake in the synaptic cleft, enhancing serotonergic neurotransmission and downregulating inhibitory autoreceptors.',
    pharmacokinetics: {
      bioavailability: '44% (enhanced by food)',
      halfLife: '26 hours',
      volumeOfDistribution: '20 L/kg',
      metabolism: 'Hepatic via CYP2C19, CYP2B6, CYP3A4 (weak CYP2D6 inhibitor at high doses)',
      excretion: 'Equally renal & fecal (metabolites)',
      proteinBinding: '98%',
    },
    renalAndHepaticDosing:
      'No renal adjustment needed; reduce dose by 50% or avoid in moderate-to-severe hepatic impairment.',
    clinicalPearls:
      'Preferred first-line SSRI post-MI (SADHART) and in breastfeeding due to favorable cardiac safety and minimal infant transfer. Minimal QTc effect vs citalopram.',
    patientCounseling:
      'Allow 4–6 weeks for full benefit; take consistently with food if GI upset occurs; never stop abruptly (taper to avoid dizziness/electric-shock paresthesias).',
    contraindications:
      'Concurrent MAOIs (14-day washout — lethal serotonin syndrome), pimozide, oral solution with disulfiram.',
    majorInteractions:
      'Linezolid, tramadol, triptans, St. John’s wort (serotonin syndrome), NSAIDs/anticoagulants (GI bleeding via platelet serotonin depletion).',
    monitoring: 'Suicidality in youth (boxed warning), SIADH/hyponatremia in elderly, response at 4–6 weeks.',
  },
  {
    id: 'amitriptyline',
    genericName: 'Amitriptyline',
    brandNames: 'Elavil',
    drugClass: 'Tricyclic Antidepressant (Tertiary Amine TCA)',
    chemicalClass: 'Dibenzocycloheptadiene tertiary amine',
    specialty: 'cns',
    dosageForm: 'tablet',
    molecularTarget: 'SERT, NET, Plus H1 / M1 / Alpha-1 / Fast Na+ Channel Blockade',
    mechanism:
      'Inhibits serotonin and norepinephrine reuptake (useful at low doses for neuropathic pain/migraine), while off-target M1, H1, alpha-1, and cardiac Na+ blockade drive heavy toxicity.',
    pharmacokinetics: {
      bioavailability: '30–60%',
      halfLife: '10–28 hours (active nortriptyline metabolite: 18–44 h)',
      volumeOfDistribution: '12–18 L/kg (highly lipophilic)',
      metabolism: 'Hepatic CYP2C19 (to nortriptyline) & CYP2D6',
      excretion: 'Renal (metabolites)',
      proteinBinding: '95%',
    },
    renalAndHepaticDosing:
      'Start ultra-low (10 mg QHS) in elderly or hepatic impairment; avoid completely in older adults per Beers Criteria.',
    clinicalPearls:
      'Beers Criteria high-risk drug in elderly (anticholinergic delirium, orthostatic falls, urinary retention). In overdose, fast cardiac Na+ channel blockade widens QRS > 100 ms—treat with IV SODIUM BICARBONATE!',
    patientCounseling:
      'Take at bedtime due to drowsiness; expect dry mouth and constipation; rise slowly to prevent dizziness.',
    contraindications:
      'Recent MI, concurrent MAOIs, bundle branch block / QTc prolongation, narrow-angle glaucoma.',
    majorInteractions:
      'MAOIs, anticholinergics, CYP2D6 inhibitors, CNS depressants, QT-prolonging agents.',
    monitoring: 'ECG (QRS > 100 ms in toxicity, QTc), anticholinergic delirium, orthostasis.',
    antidoteOrReversal: 'IV Sodium Bicarbonate for QRS > 100 ms / ventricular arrhythmia in overdose.',
  },
  {
    id: 'lithium',
    genericName: 'Lithium Carbonate',
    brandNames: 'Lithobid',
    drugClass: 'Mood Stabilizer (Monovalent Cation)',
    chemicalClass: 'Alkali metal monovalent cation (Li+)',
    specialty: 'cns',
    dosageForm: 'capsule',
    molecularTarget: 'Inositol Monophosphatase & GSK-3beta',
    mechanism:
      'Modulates second-messenger phosphatidylinositol signaling and inhibits GSK-3beta, stabilizing manic/depressive cycling and uniquely reducing suicide risk in bipolar disorder.',
    pharmacokinetics: {
      bioavailability: '95–100%',
      halfLife: '18–36 hours',
      volumeOfDistribution: '0.7–0.9 L/kg (total body water)',
      metabolism: 'Not metabolized',
      excretion: '95% renal unchanged (handled like Na+ in proximal tubule)',
      proteinBinding: '0%',
      therapeuticTargetOrIndex: '0.6–1.2 mEq/L (12-h trough); > 1.5 mEq/L toxic',
    },
    renalAndHepaticDosing:
      'CrCl 10–50: reduce dose 25–50%; CrCl < 10: reduce 50–75% or avoid. No hepatic adjustment.',
    clinicalPearls:
      'Anything causing volume contraction or proximal Na+ reabsorption—NSAIDs, thiazides, ACEi/ARBs, dehydration—spikes lithium levels. Causes nephrogenic diabetes insipidus (polyuria) and hypothyroidism.',
    patientCounseling:
      'Maintain steady daily water and dietary salt intake; avoid OTC NSAIDs (ibuprofen/naproxen); report coarse tremor, vomiting, or slurred speech.',
    contraindications:
      'Severe renal impairment, severe cardiovascular disease, significant hyponatremia/dehydration.',
    majorInteractions:
      'Thiazide diuretics, NSAIDs, ACEi/ARBs (increase lithium concentration 25–60%); low-salt diets.',
    monitoring: '12-hour post-dose trough lithium level, SCr/eGFR, TSH, electrolytes, ECG.',
  },
  {
    id: 'valproate',
    genericName: 'Valproic Acid / Divalproex',
    brandNames: 'Depakote',
    drugClass: 'Broad-Spectrum Antiepileptic & Mood Stabilizer',
    chemicalClass: 'Branched-chain carboxylic fatty acid (2-propylpentanoic acid)',
    specialty: 'cns',
    dosageForm: 'tablet',
    molecularTarget: 'Voltage-Gated Na+/Ca2+ Channels & GABA Transaminase',
    mechanism:
      'Prolongs inactivated state of Na+ channels, blocks T-type Ca2+ channels, and inhibits GABA degradation (GABA transaminase) to elevate CNS GABA.',
    pharmacokinetics: {
      bioavailability: '90–100%',
      halfLife: '9–16 hours',
      volumeOfDistribution: '0.1–0.4 L/kg',
      metabolism: 'Hepatic glucuronidation & mitochondrial beta-oxidation (broad CYP/UGT inhibitor)',
      excretion: 'Renal (as glucuronide conjugates)',
      proteinBinding: '90% (saturable/nonlinear at > 80 mcg/mL)',
      therapeuticTargetOrIndex: '50–100 mcg/mL (seizures); 50–125 mcg/mL (bipolar mania)',
    },
    renalAndHepaticDosing:
      'Contraindicated in significant hepatic dysfunction or mitochondrial/urea cycle disorders; measure free valproate in hypoalbuminemia/CKD.',
    clinicalPearls:
      'Boxed warnings: hepatotoxicity, acute pancreatitis, and severe teratogenicity (neural tube defects). Carbapenems slash valproate levels > 60%; valproate doubles lamotrigine half-life.',
    patientCounseling:
      'Requires reliable contraception in females of childbearing potential; report severe abdominal pain, vomiting, bruising, or extreme lethargy.',
    contraindications:
      'Mitochondrial disorders (POLG mutation), urea cycle disorders, pregnancy for migraine prophylaxis.',
    majorInteractions:
      'Carbapenems (meropenem/ertapenem crash valproate levels!), lamotrigine (doubles lamotrigine half-life -> SJS risk), topiramate (hyperammonemia).',
    monitoring: 'LFTs, CBC/platelets, serum valproate, ammonia if lethargic.',
  },
  {
    id: 'lamotrigine',
    genericName: 'Lamotrigine',
    brandNames: 'Lamictal',
    drugClass: 'Phenyltriazine Antiepileptic & Bipolar Maintenance',
    chemicalClass: 'Phenyltriazine folate-antagonist derivative (non-CYP metabolized)',
    specialty: 'cns',
    dosageForm: 'tablet',
    molecularTarget: 'Voltage-Gated Sodium Channels (Presynaptic Glutamate Reduction)',
    mechanism:
      'Stabilizes inactivated voltage-gated Na+ channels, selectively curbing excessive presynaptic glutamate and aspartate release; effective for bipolar depression and broad-spectrum seizures.',
    pharmacokinetics: {
      bioavailability: '98%',
      halfLife: '25–33 h (monotherapy); ~60 h with valproate; ~14 h with carbamazepine',
      volumeOfDistribution: '0.9–1.3 L/kg',
      metabolism: 'Hepatic glucuronidation via UGT1A4 (no CYP)',
      excretion: '94% renal (glucuronide conjugates)',
      proteinBinding: '55%',
    },
    renalAndHepaticDosing:
      'Reduce maintenance dose 25–50% in Child-Pugh B/C; adjust starter titration kit strictly for concurrent valproate (slower) vs enzyme inducers (faster).',
    clinicalPearls:
      'Carries a boxed warning for life-threatening Stevens-Johnson Syndrome (SJS/TEN)—MUST follow slow multi-week titration! If missed for > 5 half-lives (~5 days), re-titrate from Day 1.',
    patientCounseling:
      'Seek immediate medical attention for ANY new skin rash, fever, swollen lymph nodes, or mouth ulcers; never skip titration steps.',
    contraindications:
      'Prior lamotrigine-associated severe cutaneous adverse reaction or HLH.',
    majorInteractions:
      'Valproate (inhibits UGT1A4 -> doubles lamotrigine levels & SJS risk), carbamazepine/phenytoin/estrogen OCs (induce UGT1A4 -> cut lamotrigine 50%).',
    monitoring: 'Skin/mucosal rash inspection at every titration step, CBC/LFTs if hypersensitivity suspected.',
  },
  {
    id: 'carbamazepine',
    genericName: 'Carbamazepine',
    brandNames: 'Tegretol',
    drugClass: 'Antiepileptic (Sodium Channel Blocker)',
    chemicalClass: 'Iminostilbene tricyclic carboxamide (structurally akin to TCAs)',
    specialty: 'cns',
    dosageForm: 'tablet',
    molecularTarget: 'Voltage-Gated Sodium Channels',
    mechanism:
      'Stabilizes inactivated voltage-gated Na+ channels, dampening high-frequency repetitive neuronal firing in focal seizures and trigeminal neuralgia.',
    pharmacokinetics: {
      bioavailability: '75–85%',
      halfLife: '25–65 h initially; drops to 12–17 h via autoinduction',
      volumeOfDistribution: '0.8–1.9 L/kg',
      metabolism: 'Hepatic CYP3A4 to active 10,11-epoxide; potent pan-CYP & UGT inducer',
      excretion: '72% renal, 28% fecal',
      proteinBinding: '76%',
      therapeuticTargetOrIndex: '4–12 mcg/mL',
    },
    renalAndHepaticDosing:
      'Avoid in severe hepatic dysfunction or bone marrow suppression; titrate gradually over 3–4 weeks as autoinduction matures.',
    clinicalPearls:
      'Classic autoinducer: induces its own CYP3A4 clearance over 2–4 weeks. Screen patients of Asian ancestry for HLA-B*1502 before starting (boxed warning for SJS/TEN).',
    patientCounseling:
      'Oral contraceptives may fail (use backup non-hormonal contraception); report sore throat, fever, easy bruising, or rash.',
    contraindications:
      'Bone marrow suppression, concurrent MAOIs, HLA-B*1502 positive patients.',
    majorInteractions:
      'Pan-CYP inducer: slashes efficacy of oral contraceptives, apixaban/rivaroxaban, warfarin, lamotrigine.',
    monitoring: 'HLA-B*1502 genetic screen, CBC (aplastic anemia/agranulocytosis), Na+ (SIADH), LFTs.',
  },
  {
    id: 'gabapentin',
    genericName: 'Gabapentin',
    brandNames: 'Neurontin',
    drugClass: 'Gabapentinoid (Anticonvulsant / Neuropathic Analgesic)',
    chemicalClass: 'Cyclic GABA structural analog (does NOT bind GABA receptors)',
    specialty: 'cns',
    dosageForm: 'capsule',
    molecularTarget: 'Alpha-2-Delta Subunit of Presynaptic Voltage-Gated Ca2+ Channels',
    mechanism:
      'Binds alpha-2-delta-1 subunits on presynaptic Ca2+ channels in the dorsal horn and brain, reducing calcium influx and excitatory glutamate/substance P release.',
    pharmacokinetics: {
      bioavailability: 'Dose-dependent saturable LAT1 absorption (60% at 300 mg -> 27% at 1600 mg!)',
      halfLife: '5–7 hours (up to 132 h in anuria)',
      volumeOfDistribution: '0.8 L/kg',
      metabolism: 'Not metabolized in humans',
      excretion: '100% renal unchanged',
      proteinBinding: '< 3%',
    },
    renalAndHepaticDosing:
      'Mandatory renal adjustment: CrCl 30–59: max 700 mg BID; CrCl 15–29: max 700 mg daily; CrCl < 15: max 300 mg daily (supplement post-HD).',
    clinicalPearls:
      'Saturable intestinal L-amino acid transporter (LAT1) causes bioavailability to drop at high single doses—split into TID dosing (unlike pregabalin, which has linear absorption). Accumulates in CKD causing myoclonus and somnolence.',
    patientCounseling:
      'Separate by >= 2 hours from aluminum/magnesium antacids; expect initial drowsiness/dizziness; do not stop abruptly.',
    contraindications:
      'Hypersensitivity to gabapentin.',
    majorInteractions:
      'Opioids, benzodiazepines, alcohol (FDA warning for additive respiratory depression), Mg/Al antacids (cut absorption 20%).',
    monitoring: 'Renal function (CrCl), sedation, myoclonic jerks in CKD, peripheral edema.',
  },
  {
    id: 'sumatriptan',
    genericName: 'Sumatriptan',
    brandNames: 'Imitrex',
    drugClass: 'Triptan (Serotonin 5-HT1B/1D Agonist)',
    chemicalClass: 'Indole sulfonamide tryptamine derivative',
    specialty: 'cns',
    dosageForm: 'tablet',
    molecularTarget: 'Vascular 5-HT1B & Trigeminal Presynaptic 5-HT1D Receptors',
    mechanism:
      'Constricts dilated meningeal blood vessels (5-HT1B) and inhibits trigeminal CGRP/substance P neurogenic inflammation (5-HT1D) to abort acute migraine.',
    pharmacokinetics: {
      bioavailability: '15% oral; 17% nasal; 97% subcutaneous (onset 10–15 min SC)',
      halfLife: '2.5 hours',
      volumeOfDistribution: '2.4 L/kg',
      metabolism: 'Hepatic via Monoamine Oxidase-A (MAO-A)',
      excretion: 'Renal (inactive indole acetic acid metabolite)',
      proteinBinding: '14–21%',
    },
    renalAndHepaticDosing:
      'Max oral single dose 50 mg (max 100 mg/day) in mild-moderate hepatic impairment; contraindicated in severe hepatic failure.',
    clinicalPearls:
      'Abortive ONLY (never preventive); avoid > 10 days/month to prevent medication-overuse headache. Strictly contraindicated in coronary artery disease or Prinzmetal vasospastic angina due to 5-HT1B coronary vasoconstriction.',
    patientCounseling:
      'Take at first onset of migraine pain (not during aura); may repeat once after 2 hours if needed (max 200 mg/day oral).',
    contraindications:
      'Ischemic heart disease (CAD, prior MI, Prinzmetal angina), uncontrolled HTN, stroke/TIA, hemiplegic/basilar migraine, MAO-A inhibitors (14 days), ergots within 24 h.',
    majorInteractions:
      'Ergotamine/DHE within 24 h (additive vasospasm), MAO-A inhibitors (inhibit sumatriptan clearance), SSRIs/SNRIs.',
    monitoring: 'Blood pressure, chest tightness/pressure ("triptan sensations"), monthly abortive frequency.',
  },
  {
    id: 'clozapine',
    genericName: 'Clozapine',
    brandNames: 'Clozaril',
    drugClass: 'Atypical (2nd-Gen) Antipsychotic',
    chemicalClass: 'Dibenzodiazepine tricyclic antipsychotic',
    specialty: 'cns',
    dosageForm: 'tablet',
    molecularTarget: 'D4/D2 Dopamine & 5-HT2A Serotonin Receptors',
    mechanism:
      'Weak D2 antagonism coupled with strong 5-HT2A, alpha-1, H1, and M1 blockade; uniquely effective in treatment-resistant schizophrenia with minimal EPS.',
    pharmacokinetics: {
      bioavailability: '50–60%',
      halfLife: '12 hours',
      volumeOfDistribution: '1.6–7 L/kg',
      metabolism: 'Hepatic primarily via CYP1A2 (also CYP3A4, CYP2C19)',
      excretion: '50% renal, 30% fecal',
      proteinBinding: '97%',
    },
    renalAndHepaticDosing:
      'Start slowly (12.5 mg) and titrate cautiously in hepatic or renal impairment; re-titrate from 12.5 mg if >= 2 days missed!',
    clinicalPearls:
      '5 Boxed Warnings: severe neutropenia (REMS ANC), myocarditis, seizures, orthostasis, dementia mortality. Tobacco smoke hydrocarbons induce CYP1A2—quitting smoking spikes clozapine levels 50–70%!',
    patientCounseling:
      'Never miss scheduled ANC blood draws; notify your team immediately if you start or stop smoking cigarettes, or develop fever/sore throat/chest pain/severe constipation.',
    contraindications:
      'History of clozapine-induced agranulocytosis, uncontrolled epilepsy, paralytic ileus.',
    majorInteractions:
      'Fluvoxamine & ciprofloxacin (potent CYP1A2 inhibitors -> massive toxicity), tobacco smoke (CYP1A2 inducer), CNS depressants.',
    monitoring: 'Absolute Neutrophil Count (ANC) via REMS, fasting glucose/lipids, bowel habits, troponin/CRP early.',
  },
  {
    id: 'haloperidol',
    genericName: 'Haloperidol',
    brandNames: 'Haldol',
    drugClass: 'Typical (1st-Gen) High-Potency Antipsychotic',
    chemicalClass: 'Butyrophenone neuroleptic',
    specialty: 'cns',
    dosageForm: 'iv_vial',
    molecularTarget: 'Mesolimbic & Nigrostriatal D2 Receptors',
    mechanism:
      'Potent postsynaptic D2 receptor antagonist in the CNS, attenuating positive psychotic symptoms and acute delirium while carrying high risk of extrapyramidal symptoms.',
    pharmacokinetics: {
      bioavailability: '60% oral (decanoate IM depot lasts 4 weeks)',
      halfLife: '14–26 hours',
      volumeOfDistribution: '18 L/kg',
      metabolism: 'Hepatic via CYP3A4, CYP2D6, glucuronidation',
      excretion: 'Renal and biliary',
      proteinBinding: '92%',
    },
    renalAndHepaticDosing:
      'No specific renal adjustment (not dialyzable); reduce starting dose in elderly or hepatic impairment.',
    clinicalPearls:
      'IV haloperidol carries strong warning for QTc prolongation and Torsades de Pointes (continuous ECG monitoring required). Watch for acute dystonia, akathisia, tardive dyskinesia, and Neuroleptic Malignant Syndrome.',
    patientCounseling:
      'Report involuntary muscle spasms (neck twisting, tongue protrusion), restlessness, or high fever/stiffness right away.',
    contraindications:
      'Parkinson disease, dementia with Lewy bodies, severe CNS depression, baseline QTc prolongation.',
    majorInteractions:
      'Other QTc-prolonging drugs, anticholinergics (worsen tardive dyskinesia), dopamine agonists (antagonism).',
    monitoring: 'ECG (QTc), AIMS score for tardive dyskinesia, temperature/CK if rigidity appears.',
    antidoteOrReversal: 'Benztropine or diphenhydramine for acute dystonia; dantrolene/bromocriptine for NMS.',
  },
  {
    id: 'naloxone',
    genericName: 'Naloxone',
    brandNames: 'Narcan, Kloxxado',
    drugClass: 'Opioid Receptor Antagonist',
    chemicalClass: 'N-allyl oxymorphone morphinan derivative',
    specialty: 'cns',
    dosageForm: 'inhaler',
    molecularTarget: 'Mu-Opioid Receptor (Competitive Antagonist)',
    mechanism:
      'Rapidly displaces opioid agonists from central mu, kappa, and delta opioid receptors without intrinsic agonist activity, reversing respiratory depression within minutes.',
    pharmacokinetics: {
      bioavailability: '< 2% oral (massive first-pass); ~50% intranasal; 100% IV',
      halfLife: '30–90 minutes (shorter than most opioids!)',
      volumeOfDistribution: '2–5 L/kg (rapidly crosses BBB)',
      metabolism: 'Hepatic glucuronidation (UGT2B7)',
      excretion: 'Renal (metabolites)',
      proteinBinding: '45%',
    },
    renalAndHepaticDosing:
      'No renal/hepatic adjustment; titrate small IV increments (0.04–0.4 mg) in opioid-dependent patients to restore breathing without full acute withdrawal.',
    clinicalPearls:
      'Because naloxone’s half-life (30–90 min) is shorter than morphine, methadone, or oxycodone, patients frequently re-sedate—continuous monitoring and repeat dosing are mandatory.',
    patientCounseling:
      'Always call 911 immediately after administering intranasal naloxone even if the person wakes up, as overdose sedation can return once naloxone wears off.',
    contraindications:
      'Hypersensitivity (no absolute contraindication in life-threatening respiratory depression).',
    majorInteractions:
      'Precipitates acute opioid withdrawal in physically dependent patients.',
    monitoring: 'Respiratory rate (>= 12/min), SpO2, consciousness for >= 2–4 hours.',
  },
  {
    id: 'morphine',
    genericName: 'Morphine Sulfate',
    brandNames: 'MS Contin',
    drugClass: 'Full Mu-Opioid Agonist',
    chemicalClass: 'Natural phenanthrene benzylisoquinoline opioid alkaloid',
    specialty: 'cns',
    dosageForm: 'iv_vial',
    molecularTarget: 'Mu-Opioid GPCR (Gi-coupled)',
    mechanism:
      'Activates Gi-coupled mu-opioid receptors in the dorsal horn and brainstem, closing presynaptic Ca2+ channels and opening postsynaptic K+ channels to inhibit nociceptive transmission.',
    pharmacokinetics: {
      bioavailability: '20–40% oral (~3:1 oral-to-IV equianalgesic ratio)',
      halfLife: '2–4 hours',
      volumeOfDistribution: '1–6 L/kg',
      metabolism: 'Hepatic glucuronidation to active M6G (analgesic) & neurotoxic M3G',
      excretion: 'Renal (90% metabolites — active M6G & M3G accumulate in AKI/CKD)',
      proteinBinding: '35%',
    },
    renalAndHepaticDosing:
      'AVOID in CrCl < 30 mL/min (switch to hydromorphone or fentanyl) due to accumulation of active M6G and neuroexcitatory M3G.',
    clinicalPearls:
      'Always co-prescribe a scheduled stimulant laxative (senna)—patients never develop tolerance to opioid-induced constipation.',
    patientCounseling:
      'Take stimulant laxative daily; avoid alcohol, benzodiazepines, or sleep aids; keep naloxone rescue kit accessible.',
    contraindications:
      'Significant respiratory depression, paralytic ileus, acute/severe bronchial asthma without monitoring.',
    majorInteractions:
      'Benzodiazepines, gabapentinoids, alcohol (boxed warning for fatal respiratory depression), MAOIs.',
    monitoring: 'Respiratory rate, sedation score, pain score, bowel movements, renal function.',
    antidoteOrReversal: 'Naloxone.',
  },
  {
    id: 'diazepam',
    genericName: 'Diazepam',
    brandNames: 'Valium',
    drugClass: 'Long-Acting Benzodiazepine',
    chemicalClass: '1,4-benzodiazepine lipophilic base',
    specialty: 'cns',
    dosageForm: 'iv_vial',
    molecularTarget: 'GABA-A Receptor (Benzodiazepine Allosteric Site)',
    mechanism:
      'Binds the alpha-gamma interface of GABA-A pentamers, increasing the FREQUENCY of chloride channel opening in the presence of endogenous GABA.',
    pharmacokinetics: {
      bioavailability: '> 90% oral; rapid CNS entry IV due to high lipophilicity',
      halfLife: '20–50 hours (active desmethyldiazepam metabolite: up to 100 h)',
      volumeOfDistribution: '0.8–1.0 L/kg',
      metabolism: 'Hepatic CYP2C19 & CYP3A4 to active nordiazepam, temazepam, oxazepam',
      excretion: 'Renal (metabolites)',
      proteinBinding: '98%',
    },
    renalAndHepaticDosing:
      'Avoid in cirrhosis/hepatic impairment and older adults—use LOT (Lorazepam, Oxazepam, Temazepam), which undergo pure glucuronidation without active metabolites.',
    clinicalPearls:
      'Benzodiazepines increase chloride channel FREQUENCY, whereas barbiturates prolong opening DURATION.',
    patientCounseling:
      'Causes marked sedation and fall risk; never combine with opioids or alcohol; taper gradually if used chronically.',
    contraindications:
      'Myasthenia gravis, severe respiratory insufficiency, sleep apnea, narrow-angle glaucoma.',
    majorInteractions:
      'Opioids, alcohol, barbiturates (synergistic respiratory depression), CYP2C19/3A4 inhibitors.',
    monitoring: 'Respiratory status, sedation, fall risk, withdrawal signs on taper.',
    antidoteOrReversal: 'Flumazenil (caution: precipitates refractory seizures in chronic BZD users or TCA co-ingestion).',
  },
  {
    id: 'levodopa_carbidopa',
    genericName: 'Levodopa-Carbidopa',
    brandNames: 'Sinemet',
    drugClass: 'Dopamine Precursor + Peripheral DDC Inhibitor',
    chemicalClass: 'L-3,4-dihydroxyphenylalanine + hydrazine carboxylase inhibitor',
    specialty: 'cns',
    dosageForm: 'tablet',
    molecularTarget: 'Aromatic L-Amino Acid Decarboxylase (Peripheral) & Central Dopamine Synthesis',
    mechanism:
      'Levodopa crosses the blood-brain barrier via LAT1 and converts to dopamine; carbidopa (cannot cross BBB) inhibits peripheral DOPA decarboxylase to prevent nausea/orthostasis and boost brain delivery.',
    pharmacokinetics: {
      bioavailability: '99% (with carbidopa)',
      halfLife: '1.5 hours',
      volumeOfDistribution: '0.9–1.6 L/kg',
      metabolism: 'Peripheral/central DDC and COMT',
      excretion: 'Renal (metabolites)',
      proteinBinding: '10–36%',
    },
    renalAndHepaticDosing:
      'No formal adjustment; monitor closely in severe hepatic or renal disease.',
    clinicalPearls:
      'Dietary amino acids compete with levodopa at the LAT1 gut and BBB transporters—separate from heavy protein meals if "off" fluctuations occur. Never abruptly stop (parkinsonism-hyperpyrexia syndrome).',
    patientCounseling:
      'Take 30–60 minutes before protein-rich meals if motor wearing-off occurs; harmless dark urine/sweat discoloration is expected.',
    contraindications:
      'Concurrent non-selective MAOIs (phenelzine/tranylcypromine -> hypertensive crisis), narrow-angle glaucoma.',
    majorInteractions:
      'Dopamine antagonists (metoclopramide, haloperidol worsen Parkinsonism), iron salts (chelation), vitamin B6 (without carbidopa).',
    monitoring: 'Motor "on/off" fluctuations, dyskinesias, orthostatic blood pressure, hallucinations.',
  },

  // ================= ENDOCRINE, GI & ANTIDOTES (14) =================
  {
    id: 'metformin',
    genericName: 'Metformin',
    brandNames: 'Glucophage',
    drugClass: 'Biguanide Antidiabetic',
    chemicalClass: 'Hydrophilic cationic dimethylbiguanide',
    specialty: 'endocrine_gi',
    dosageForm: 'tablet',
    molecularTarget: 'Hepatic Mitochondrial Complex I / AMPK Activation',
    mechanism:
      'Inhibits hepatic gluconeogenesis via mitochondrial Complex I inhibition and AMPK activation, improving peripheral insulin sensitivity without stimulating insulin secretion.',
    pharmacokinetics: {
      bioavailability: '50–60%',
      halfLife: '4–8.7 hours',
      volumeOfDistribution: '654 L (~9 L/kg)',
      metabolism: 'Not metabolized',
      excretion: '90% renal unchanged via OCT2/MATE tubular secretion',
      proteinBinding: 'Negligible',
    },
    renalAndHepaticDosing:
      'eGFR >= 45: full dose; eGFR 30–44: do not initiate (if already taking, max 1000 mg/day); eGFR < 30: CONTRAINDICATED (lactic acidosis).',
    clinicalPearls:
      'Weight-neutral with zero intrinsic hypoglycemia risk. Impairs ileal vitamin B12 absorption long-term. Hold at/for 48 h around iodinated contrast if eGFR 30–60, liver disease, or HF.',
    patientCounseling:
      'Take with meals (or switch to ER) to prevent diarrhea/cramping; hold if dehydrated, severely ill, or undergoing iodinated contrast imaging.',
    contraindications:
      'eGFR < 30 mL/min/1.73 m2, acute or chronic metabolic acidosis (DKA), severe hypoxia/sepsis.',
    majorInteractions:
      'Iodinated contrast media (AKI risk -> lactic acidosis), cimetidine/dolutegravir (inhibit OCT2/MATE renal elimination), excessive alcohol.',
    monitoring: 'eGFR/SCr at least annually, HbA1c every 3–6 months, Vitamin B12 periodically.',
  },
  {
    id: 'empagliflozin',
    genericName: 'Empagliflozin',
    brandNames: 'Jardiance',
    drugClass: 'SGLT2 Inhibitor',
    chemicalClass: 'C-glucoside aryl-ether gliflozin',
    specialty: 'endocrine_gi',
    dosageForm: 'tablet',
    molecularTarget: 'Sodium-Glucose Cotransporter 2 (SGLT2, S1 Proximal Tubule)',
    mechanism:
      'Blocks SGLT2 in the proximal convoluted tubule, promoting insulin-independent glucosuria and restoring tubuloglomerular feedback to lower intraglomerular pressure.',
    pharmacokinetics: {
      bioavailability: '78%',
      halfLife: '12.4 hours',
      volumeOfDistribution: '73.8 L',
      metabolism: 'Glucuronidation (UGT2B7, UGT1A3, UGT1A8, UGT1A9)',
      excretion: '54% renal, 41% fecal',
      proteinBinding: '86%',
    },
    renalAndHepaticDosing:
      'Glycemic effect diminishes below eGFR 30, but cardiorenal protection continues down to eGFR 20 mL/min in HFrEF/CKD! Do not initiate on dialysis.',
    clinicalPearls:
      'Pillar therapy across T2DM, HFrEF/HFpEF, and CKD. Watch for euglycemic DKA (anion-gap acidosis with glucose < 250 mg/dL)—hold at least 3 days before major surgery!',
    patientCounseling:
      'Maintain good hydration and genital hygiene (mycotic yeast infection risk); hold 3 days before scheduled surgery or during acute vomiting/fasting.',
    contraindications:
      'Type 1 diabetes (high DKA risk), dialysis.',
    majorInteractions:
      'Loop/thiazide diuretics (volume depletion), insulin/sulfonylureas (hypoglycemia).',
    monitoring: 'Volume status, SCr/eGFR (expect mild initial dip), genital hygiene, ketones if ill.',
  },
  {
    id: 'semaglutide',
    genericName: 'Semaglutide',
    brandNames: 'Ozempic, Wegovy, Rybelsus',
    drugClass: 'GLP-1 Receptor Agonist',
    chemicalClass: 'Acylated 31-amino-acid GLP-1 peptide analog (C18 fatty diacid albumin tether)',
    specialty: 'endocrine_gi',
    dosageForm: 'pen',
    molecularTarget: 'Glucagon-Like Peptide-1 (GLP-1) Gs-GPCR',
    mechanism:
      'Stimulates glucose-dependent insulin secretion, suppresses inappropriate postprandial glucagon, delays gastric emptying, and acts on hypothalamic satiety centers.',
    pharmacokinetics: {
      bioavailability: '89% SC; ~0.4–1% oral (requires SNAC permeation enhancer)',
      halfLife: '~7 days (168 hours — once-weekly SC)',
      volumeOfDistribution: '12.5 L',
      metabolism: 'Proteolytic cleavage & beta-oxidation',
      excretion: 'Renal and fecal (metabolites)',
      proteinBinding: '> 99% (albumin binding extends half-life)',
    },
    renalAndHepaticDosing:
      'No renal or hepatic dose adjustment needed (avoid dehydration from GI vomiting causing secondary AKI).',
    clinicalPearls:
      'Oral semaglutide (Rybelsus) MUST be taken first thing on an empty stomach with <= 4 oz plain water, waiting >= 30 min before food or other pills. Reduces MACE in ASCVD.',
    patientCounseling:
      'Inject SC once weekly on same day; eat smaller low-fat meals to ease initial nausea; seek urgent care for severe persistent abdominal pain radiating to back (pancreatitis).',
    contraindications:
      'Personal or family history of medullary thyroid carcinoma (MTC) or Multiple Endocrine Neoplasia syndrome type 2 (MEN 2).',
    majorInteractions:
      'Delayed gastric emptying may alter oral absorption of narrow-therapeutic-index drugs; additive hypoglycemia with insulin/sulfonylureas.',
    monitoring: 'HbA1c, weight, GI hydration, signs of pancreatitis or gallbladder disease.',
  },
  {
    id: 'insulin_glargine',
    genericName: 'Insulin Glargine',
    brandNames: 'Lantus, Basaglar, Toujeo',
    drugClass: 'Long-Acting Basal Insulin Analog',
    chemicalClass: 'Recombinant 2-Arg B-chain + A21-Gly insulin analog (pH 4.0 solution)',
    specialty: 'endocrine_gi',
    dosageForm: 'pen',
    molecularTarget: 'Insulin Receptor Tyrosine Kinase',
    mechanism:
      'Acidic pH 4.0 solution precipitates into subcutaneous microcrystals at physiological pH 7.4, releasing monomers slowly over 24 h with a flat, peakless basal profile.',
    pharmacokinetics: {
      bioavailability: '100% SC (onset 1–2 h; duration ~24 h)',
      halfLife: 'Prolonged subcutaneous depot absorption (circulating M1 metabolite t½ ~12 h)',
      volumeOfDistribution: '0.15–0.3 L/kg',
      metabolism: 'Degraded by tissue/hepatic insulinases',
      excretion: 'Renal degradation',
      proteinBinding: 'Minimal',
    },
    renalAndHepaticDosing:
      'Reduce total dose by 20–25% in advanced CKD/ESRD because renal insulin clearance falls and hypoglycemia risk rises.',
    clinicalPearls:
      'Because glargine relies on acidic pH 4.0 for subcutaneous microprecipitation, NEVER mix it in the same syringe with any other insulin (unlike NPH)!',
    patientCounseling:
      'Inject SC once daily at the same time; rotate injection sites (abdomen, thigh, upper arm) to prevent lipohypertrophy; never share pens.',
    contraindications:
      'Hypoglycemic episodes.',
    majorInteractions:
      'Sulfonylureas, beta-blockers (mask adrenergic tachycardia during hypoglycemia, though sweating remains intact!), corticosteroids (raise glucose).',
    monitoring: 'Fasting blood glucose (target 80–130 mg/dL), HbA1c, hypoglycemia symptoms.',
  },
  {
    id: 'levothyroxine',
    genericName: 'Levothyroxine',
    brandNames: 'Synthroid, Levoxyl',
    drugClass: 'Synthetic Thyroid Hormone (T4)',
    chemicalClass: 'Levorotatory iodinated diphenyl ether amino acid (L-thyroxine sodium)',
    specialty: 'endocrine_gi',
    dosageForm: 'tablet',
    molecularTarget: 'Nuclear Thyroid Hormone Receptors (via Peripheral T4 -> T3 Deiodination)',
    mechanism:
      'Exogenous L-thyroxine (T4) undergoes 5’-deiodination to active triiodothyronine (T3), binding nuclear receptors to regulate basal metabolic rate and gene transcription.',
    pharmacokinetics: {
      bioavailability: '40–80% (fasting maximizes absorption)',
      halfLife: '6–7 days',
      volumeOfDistribution: '10–12 L',
      metabolism: 'Hepatic/renal deiodination to T3 and reverse T3',
      excretion: 'Biliary/fecal (~20%) and renal',
      proteinBinding: '> 99% (TBG, transthyretin, albumin)',
      therapeuticTargetOrIndex: 'Narrow Therapeutic Index — maintain consistent brand/manufacturer',
    },
    renalAndHepaticDosing:
      'No renal adjustment. In elderly or coronary artery disease, "start low (12.5–25 mcg) and go slow" to avoid precipitating angina/AFib.',
    clinicalPearls:
      'Wait 6–8 weeks before rechecking TSH after any dose change (5 half-lives of a 7-day drug!). Treat uncorrected adrenal insufficiency with steroids BEFORE starting T4.',
    patientCounseling:
      'Take with plain water on an empty stomach 30–60 minutes before breakfast; separate >= 4 hours from calcium, iron, multivitamins, or antacids.',
    contraindications:
      'Uncorrected adrenal insufficiency (adrenal crisis risk!), acute MI, untreated thyrotoxicosis.',
    majorInteractions:
      'Calcium, iron, PPIs, bile acid sequestrants (block absorption); warfarin (raises INR); estrogen (raises TBG -> higher T4 need).',
    monitoring: 'TSH (gold standard) and free T4 every 6–8 weeks during titration, then annually.',
  },
  {
    id: 'omeprazole',
    genericName: 'Omeprazole',
    brandNames: 'Prilosec',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    chemicalClass: 'Substituted benzimidazole prodrug (acid-activated sulfenamide)',
    specialty: 'endocrine_gi',
    dosageForm: 'capsule',
    molecularTarget: 'Gastric Parietal Cell H+/K+-ATPase',
    mechanism:
      'Weak base concentrates in acidic parietal canaliculi, rearranges into a sulfenamide, and forms a covalent disulfide bond irreversibly blocking H+/K+-ATPase.',
    pharmacokinetics: {
      bioavailability: '30–40% (enteric-coated)',
      halfLife: '0.5–1 hour (acid suppression lasts 24–72 h due to irreversible binding)',
      volumeOfDistribution: '0.3 L/kg',
      metabolism: 'Hepatic via CYP2C19 (potent inhibitor) & CYP3A4',
      excretion: 'Renal (~77% metabolites)',
      proteinBinding: '95%',
    },
    renalAndHepaticDosing:
      'No renal adjustment; cap at 20 mg/day in hepatic impairment.',
    clinicalPearls:
      'Take 30–60 min before breakfast so meal-stimulated proton pumps are exposed for irreversible blockade. Long-term risks: hypomagnesemia, C. difficile, B12 deficiency, osteoporotic fractures.',
    patientCounseling:
      'Swallow delayed-release capsules whole 30–60 min before your first meal; taper off slowly if stopping after prolonged use to prevent rebound acid hypersecretion.',
    contraindications:
      'Concurrent rilpivirine (requires gastric acid for absorption).',
    majorInteractions:
      'Clopidogrel (omeprazole inhibits CYP2C19 activation—switch to pantoprazole!), methotrexate, iron/ketoconazole.',
    monitoring: 'Symptom relief, serum Mg2+ and B12 on long-term therapy; step down when no longer indicated.',
  },
  {
    id: 'ondansetron',
    genericName: 'Ondansetron',
    brandNames: 'Zofran',
    drugClass: 'Selective 5-HT3 Receptor Antagonist',
    chemicalClass: 'Carbazolone tetrahydrocarbazole derivative',
    specialty: 'endocrine_gi',
    dosageForm: 'iv_vial',
    molecularTarget: 'Central CTZ & Vagal GI 5-HT3 Ligand-Gated Ion Channels',
    mechanism:
      'Blocks serotonin 5-HT3 receptors both peripherally on vagal gut afferents and centrally in the area postrema chemoreceptor trigger zone.',
    pharmacokinetics: {
      bioavailability: '56–70% oral',
      halfLife: '3–6 hours',
      volumeOfDistribution: '1.9–2.6 L/kg',
      metabolism: 'Hepatic via CYP3A4, CYP1A2, CYP2D6',
      excretion: 'Renal (metabolites)',
      proteinBinding: '70–76%',
    },
    renalAndHepaticDosing:
      'No renal adjustment; cap total daily dose at 8 mg/day in severe hepatic impairment (Child-Pugh C). Single IV dose capped at 16 mg (QTc risk).',
    clinicalPearls:
      'Dose-dependent QTc prolongation (Torsades risk)—avoid high IV doses (> 16 mg) and check baseline K+/Mg2+ when combined with azithromycin, haloperidol, or amiodarone.',
    patientCounseling:
      'Expect possible headache or constipation; place ODT tablets on tongue with dry hands and allow to dissolve.',
    contraindications:
      'Concurrent apomorphine (profound hypotension & loss of consciousness), congenital long QT syndrome.',
    majorInteractions:
      'QT-prolonging agents (amiodarone, azithromycin, haloperidol), serotonergic drugs, apomorphine.',
    monitoring: 'ECG (QTc in high-risk patients), K+/Mg2+, bowel movements.',
  },
  {
    id: 'alendronate',
    genericName: 'Alendronate',
    brandNames: 'Fosamax',
    drugClass: 'Nitrogen-Containing Bisphosphonate',
    chemicalClass: 'Aminobutylidene geminal bisphosphonate (P-C-P pyrophosphate analog)',
    specialty: 'endocrine_gi',
    dosageForm: 'tablet',
    molecularTarget: 'Osteoclast Farnesyl Pyrophosphate Synthase (Mevalonate Pathway)',
    mechanism:
      'Binds bone hydroxyapatite and is ingested by resorbing osteoclasts, inhibiting farnesyl pyrophosphate synthase to induce osteoclast apoptosis and halt bone resorption.',
    pharmacokinetics: {
      bioavailability: '0.6–0.7% fasting (0% with food, coffee, juice, or calcium!)',
      halfLife: 'Terminal skeletal half-life > 10 years!',
      volumeOfDistribution: '28 L (excluding bone uptake)',
      metabolism: 'Not metabolized',
      excretion: '50% renal unchanged (non-bone fraction)',
      proteinBinding: '78%',
    },
    renalAndHepaticDosing:
      'Contraindicated if CrCl < 35 mL/min (switch to denosumab). No hepatic adjustment.',
    clinicalPearls:
      'Sub-1% oral bioavailability drops to ZERO if taken with anything other than plain tap/filtered water (even mineral water, coffee, or OJ blocks absorption). Reassess after 5 years ("drug holiday") to curb atypical femur fracture and ONJ risk.',
    patientCounseling:
      'Take first thing in morning with 6–8 oz PLAIN water only, stay completely upright >= 30 minutes, and wait >= 30 min before food, coffee, or calcium/other pills.',
    contraindications:
      'CrCl < 35 mL/min, inability to sit/stand upright >= 30 minutes, esophageal stricture/achalasia, uncorrected hypocalcemia.',
    majorInteractions:
      'Calcium, iron, antacids, coffee/juice (completely block absorption), NSAIDs (additive GI ulceration).',
    monitoring: 'DEXA BMD every 2 years, SCr, serum Ca2+/Vitamin D, jaw/thigh pain.',
  },
  {
    id: 'albuterol',
    genericName: 'Albuterol',
    brandNames: 'ProAir, Ventolin',
    drugClass: 'Short-Acting Beta-2 Agonist (SABA)',
    chemicalClass: 'Racemic saligenin catecholamine analog (phenylethanolamine)',
    specialty: 'endocrine_gi',
    dosageForm: 'inhaler',
    molecularTarget: 'Beta-2 Adrenergic Receptor (Gs-GPCR, Bronchial Smooth Muscle)',
    mechanism:
      'Activates Gs-coupled beta-2 receptors, elevating cAMP to relax bronchial smooth muscle and stimulate Na+/K+-ATPase-driven intracellular K+ shift.',
    pharmacokinetics: {
      bioavailability: 'Inhaled acts locally within 5 min; systemic ~50%',
      halfLife: '4–6 hours',
      volumeOfDistribution: '2.2 L/kg',
      metabolism: 'Hepatic/intestinal sulfation',
      excretion: 'Renal (65–80%)',
      proteinBinding: '10%',
    },
    renalAndHepaticDosing:
      'No routine adjustment required.',
    clinicalPearls:
      'Dual utility: rapid rescue bronchodilator AND nebulized acute adjunct for severe hyperkalemia (drives K+ into cells). Overuse (> 2 days/week) signals poorly controlled asthma.',
    patientCounseling:
      'Shake MDI well before each puff; wait 1 minute between puffs; prime inhaler if new or unused > 2 weeks.',
    contraindications:
      'Hypersensitivity to albuterol.',
    majorInteractions:
      'Non-selective beta-blockers (propranolol antagonizes bronchodilation), loop/thiazide diuretics (additive hypokalemia).',
    monitoring: 'Rescue inhaler frequency, heart rate, tremor, serum K+ with high-dose nebulization.',
  },
  {
    id: 'fluticasone_salmeterol',
    genericName: 'Fluticasone-Salmeterol',
    brandNames: 'Advair',
    drugClass: 'Inhaled Corticosteroid + LABA (ICS/LABA)',
    chemicalClass: 'Trifluorinated glucocorticoid + lipophilic long-chain saligenin LABA',
    specialty: 'endocrine_gi',
    dosageForm: 'inhaler',
    molecularTarget: 'Glucocorticoid Receptor & Beta-2 Adrenergic Receptor',
    mechanism:
      'Fluticasone suppresses airway mucosal inflammation and eosinophilic cytokine transcription; salmeterol provides 12-hour bronchodilation.',
    pharmacokinetics: {
      bioavailability: 'Fluticasone < 1% oral (99% hepatic first-pass)',
      halfLife: 'Fluticasone 7.8 h; Salmeterol 5.5 h',
      volumeOfDistribution: 'Fluticasone 4.2 L/kg',
      metabolism: 'Hepatic via CYP3A4 (both components)',
      excretion: 'Primarily fecal',
      proteinBinding: '91–99%',
    },
    renalAndHepaticDosing:
      'No renal adjustment; monitor closely in severe hepatic impairment (reduced fluticasone clearance).',
    clinicalPearls:
      'LABAs must NEVER be used as monotherapy in asthma due to asthma-related death risk—always pair with ICS. Strong CYP3A4 inhibitors (ritonavir) block fluticasone’s first-pass clearance, causing Cushing syndrome!',
    patientCounseling:
      'Rinse mouth with water and spit after every use to prevent oral thrush; NOT a rescue inhaler for sudden wheezing.',
    contraindications:
      'Primary treatment of status asthmaticus, severe milk-protein allergy (Diskus lactose carrier).',
    majorInteractions:
      'Strong CYP3A4 inhibitors (ritonavir, ketoconazole -> systemic Cushing syndrome & adrenal suppression!).',
    monitoring: 'Oral thrush inspection, symptom control, bone density/growth in chronic high-dose ICS.',
  },
  {
    id: 'nac',
    genericName: 'N-Acetylcysteine (NAC)',
    brandNames: 'Acetadote, Mucomyst',
    drugClass: 'Glutathione Precursor & Acetaminophen Antidote',
    chemicalClass: 'Acetylated L-cysteine thiol amino acid',
    specialty: 'endocrine_gi',
    dosageForm: 'iv_vial',
    molecularTarget: 'Hepatic Glutathione Synthesis / NAPQI Detoxification',
    mechanism:
      'Supplies cysteine to replenish hepatic glutathione stores, directly conjugating toxic acetaminophen metabolite NAPQI into nontoxic mercapturic acid.',
    pharmacokinetics: {
      bioavailability: '4–10% oral; 100% IV',
      halfLife: '5.6 hours (adults)',
      volumeOfDistribution: '0.47 L/kg',
      metabolism: 'Hepatic deacetylation to cysteine',
      excretion: 'Renal (30%)',
      proteinBinding: '66–87%',
    },
    renalAndHepaticDosing:
      'No renal/hepatic dose reduction; continue IV NAC beyond 21 h if AST/ALT or acetaminophen remains elevated.',
    clinicalPearls:
      'Nearly 100% protective if started within 8 hours of acute acetaminophen overdose (Rumack-Matthew nomogram at >= 4 h post-ingestion). IV loading can trigger non-IgE anaphylactoid flushing (slow infusion + diphenhydramine, do NOT abandon NAC!).',
    patientCounseling:
      'Oral solution has a strong sulfur ("rotten egg") odor—chill and mix with juice/soda if given orally.',
    contraindications:
      'None in life-threatening acetaminophen hepatotoxicity.',
    majorInteractions:
      'Activated charcoal adsorbs oral NAC if given simultaneously (space or use IV NAC).',
    monitoring: 'AST/ALT, INR, acetaminophen concentration, blood glucose, flushing during IV loading.',
  },
  {
    id: 'protamine',
    genericName: 'Protamine Sulfate',
    brandNames: 'Protamine',
    drugClass: 'Heparin Antagonist',
    chemicalClass: 'Arginine-rich basic polypeptide (~4.5 kDa, from salmon sperm)',
    specialty: 'endocrine_gi',
    dosageForm: 'iv_vial',
    molecularTarget: 'Unfractionated Heparin (Electrostatic Neutralization)',
    mechanism:
      'Strongly basic (positively charged) peptide binds electrostatically to negatively charged acidic heparin, forming an inactive stable salt complex within 5 minutes.',
    pharmacokinetics: {
      bioavailability: '100% IV (onset < 5 min)',
      halfLife: '~7 minutes (rapidly cleared)',
      volumeOfDistribution: 'Intravascular space',
      metabolism: 'Degraded by plasma fibrinolysin',
      excretion: 'Renal',
      proteinBinding: 'Forms ionic complex with heparin',
    },
    renalAndHepaticDosing:
      'Dose strictly by remaining active heparin (1 mg per ~100 units UFH; max 50 mg per dose).',
    clinicalPearls:
      'Only ~60% effective against LMWH (enoxaparin). Higher anaphylaxis risk in fish allergy, prior NPH insulin use (contains protamine), or vasectomized men.',
    patientCounseling:
      'Administer via slow IV push (<= 50 mg over 10 min) to avoid severe hypotension and pulmonary vasoconstriction.',
    contraindications:
      'Previous protamine anaphylaxis.',
    majorInteractions:
      'Excess protamine itself acts as a weak anticoagulant.',
    monitoring: 'aPTT/ACT normalization, blood pressure, anaphylaxis signs during infusion.',
  },
  {
    id: 'atropine',
    genericName: 'Atropine',
    brandNames: 'AtroPen',
    drugClass: 'Antimuscarinic Anticholinergic',
    chemicalClass: 'Racemic tropane ester alkaloid (belladonna)',
    specialty: 'endocrine_gi',
    dosageForm: 'iv_vial',
    molecularTarget: 'Muscarinic Acetylcholine Receptors (M1–M5)',
    mechanism:
      'Competitively blocks acetylcholine at muscarinic receptors, reversing vagal bradycardia and drying cholinergic bronchorrhea/secretions in organophosphate poisoning.',
    pharmacokinetics: {
      bioavailability: '100% IV/IM',
      halfLife: '2–3 hours',
      volumeOfDistribution: '1–1.7 L/kg (crosses BBB)',
      metabolism: 'Hepatic hydrolysis (~50%)',
      excretion: '30–50% renal unchanged',
      proteinBinding: '14–22%',
    },
    renalAndHepaticDosing:
      'In organophosphate poisoning, double dose every 5 min until pulmonary secretions clear (no fixed upper limit—may require tens of milligrams!).',
    clinicalPearls:
      'Reverses muscarinic SLUDGE + Killer B’s (Bradycardia, Bronchospasm, Bronchorrhea), NOT nicotinic muscle paralysis—pair with pralidoxime (2-PAM) for neuromuscular rescue.',
    patientCounseling:
      'Expect dry mouth, blurred vision, flushed dry skin, and tachycardia after emergency administration.',
    contraindications:
      'None in symptomatic bradycardia or cholinergic crisis.',
    majorInteractions:
      'Other anticholinergics (TCAs, antihistamines), potassium chloride wax-matrix tablets.',
    monitoring: 'Heart rate, cardiac rhythm, clearing of bronchial secretions (lung auscultation).',
  },
  {
    id: 'pralidoxime',
    genericName: 'Pralidoxime (2-PAM)',
    brandNames: 'Protopam',
    drugClass: 'Cholinesterase Reactivator (Oxime)',
    chemicalClass: 'Quaternary pyridinium aldoxime',
    specialty: 'endocrine_gi',
    dosageForm: 'iv_vial',
    molecularTarget: 'Phosphorylated Acetylcholinesterase (Nicotinic & Muscarinic Junctions)',
    mechanism:
      'Nucleophilic oxime cleaves the organophosphate-enzyme bond before irreversible "aging" occurs, regenerating active acetylcholinesterase to restore nicotinic neuromuscular transmission.',
    pharmacokinetics: {
      bioavailability: '100% IV/IM (does NOT cross BBB well)',
      halfLife: '1.2 hours',
      volumeOfDistribution: '0.6–0.8 L/kg',
      metabolism: 'Hepatic (~15%)',
      excretion: '80–90% renal unchanged via tubular secretion',
      proteinBinding: 'Negligible',
    },
    renalAndHepaticDosing:
      'Reduce maintenance infusion rate in renal impairment (CrCl < 50 mL/min).',
    clinicalPearls:
      'Always give ATROPINE FIRST or concurrently! Atropine rescues muscarinic airway secretions, while pralidoxime restores nicotinic diaphragm/skeletal muscle strength (must give before enzyme "aging" locks the bond).',
    patientCounseling:
      'Hospital emergency antidote; infuse slowly over 15–30 minutes to prevent transient laryngospasm or hypertension.',
    contraindications:
      'Carbaryl (carbamate) poisoning alone (generally unnecessary/historically avoided).',
    majorInteractions:
      'Succinylcholine (prolonged paralysis), aminophylline/morphine in cholinergic crisis.',
    monitoring: 'Respiratory muscle strength, fasciculations, blood pressure, renal function.',
  },
  {
    id: 'glucagon',
    genericName: 'Glucagon',
    brandNames: 'GlucaGen, Baqsimi',
    drugClass: 'Pancreatic Hormone & Beta-Blocker Overdose Antidote',
    chemicalClass: '29-amino-acid polypeptide hormone',
    specialty: 'endocrine_gi',
    dosageForm: 'iv_vial',
    molecularTarget: 'Glucagon Gs-GPCR (Direct Adenylyl Cyclase Activation)',
    mechanism:
      'Bypasses blocked beta-1 adrenergic receptors by binding myocardial glucagon Gs-GPCRs, directly activating adenylyl cyclase to raise cAMP, heart rate, and contractility; also drives hepatic glycogenolysis.',
    pharmacokinetics: {
      bioavailability: '100% IV/IM/SC (onset 1–5 min IV)',
      halfLife: '8–18 minutes (requires continuous IV infusion in beta-blocker toxicity!)',
      volumeOfDistribution: '0.25 L/kg',
      metabolism: 'Hepatic, renal, and plasma proteolysis',
      excretion: 'Renal clearance of peptide fragments',
      proteinBinding: 'Minimal',
    },
    renalAndHepaticDosing:
      'Ineffective for hypoglycemia if hepatic glycogen stores are depleted (e.g., chronic alcohol use/starvation—give IV dextrose instead!).',
    clinicalPearls:
      'High-dose IV glucagon (3–10 mg bolus + continuous infusion) is the classic non-adrenergic cAMP bypass antidote for refractory beta-blocker (or CCB) overdose bradycardia/hypotension.',
    patientCounseling:
      'For severe hypoglycemia rescue: position patient on their side (glucagon triggers vomiting/aspiration risk) and feed carbs once awake.',
    contraindications:
      'Pheochromocytoma (stimulates catecholamine release -> hypertensive crisis), insulinoma.',
    majorInteractions:
      'Warfarin (high doses potentiate anticoagulation).',
    monitoring: 'Heart rate, blood pressure, blood glucose, emesis/airway protection.',
  },
  {
    id: 'sodium_bicarbonate',
    genericName: 'Sodium Bicarbonate',
    brandNames: 'Neut',
    drugClass: 'Systemic & Urinary Alkalinizing Antidote',
    chemicalClass: 'Inorganic sodium hydrogen carbonate salt (NaHCO3)',
    specialty: 'endocrine_gi',
    dosageForm: 'iv_vial',
    molecularTarget: 'Cardiac Fast Na+ Channels & Renal Tubular Ion Trapping',
    mechanism:
      'Provides both an extracellular sodium load (overcoming Na+ channel blockade) and systemic/urinary alkalinization (raising pH to increase protein binding of TCAs and ion-trap weak acids like aspirin in urine).',
    pharmacokinetics: {
      bioavailability: '100% IV',
      halfLife: 'Immediate acid-base equilibrium (minutes)',
      volumeOfDistribution: '0.3–0.4 L/kg (extracellular fluid)',
      metabolism: 'Dissociates to CO2 (exhaled) + H2O',
      excretion: 'Renal bicarbonate excretion & pulmonary CO2 elimination',
      proteinBinding: '0%',
      therapeuticTargetOrIndex: 'Target arterial pH 7.45–7.55 (not > 7.55) in TCA toxicity',
    },
    renalAndHepaticDosing:
      'Use cautiously in severe volume overload, CHF, or anuric ESRD (1 mEq Na+ per mEq HCO3-).',
    clinicalPearls:
      'Indicated immediately when tricyclic antidepressant (amitriptyline) overdose widens QRS > 100 ms! Also drives urinary ion trapping in salicylate (aspirin) and phenobarbital toxicity.',
    patientCounseling:
      'Emergency hospital IV therapy; monitor serum potassium closely (alkalinization shifts K+ intracellularly, causing hypokalemia).',
    contraindications:
      'Severe metabolic or respiratory alkalosis, hypocalcemia (tetany risk), severe hypernatremia.',
    majorInteractions:
      'Precipitates in IV lines with calcium salts or catecholamines; alters renal clearance of weak acids/bases.',
    monitoring: 'Serial 12-lead ECG (QRS narrowing < 100 ms), arterial/venous pH, serum K+ and Na+.',
  },
  {
    id: 'flumazenil',
    genericName: 'Flumazenil',
    brandNames: 'Romazicon',
    drugClass: 'Benzodiazepine Receptor Antagonist',
    chemicalClass: 'Imidazobenzodiazepine competitive antagonist',
    specialty: 'endocrine_gi',
    dosageForm: 'iv_vial',
    molecularTarget: 'GABA-A Benzodiazepine Binding Site',
    mechanism:
      'Competitively antagonizes benzodiazepines and Z-drugs (zolpidem) at the GABA-A allosteric site, reversing sedation.',
    pharmacokinetics: {
      bioavailability: '100% IV (onset 1–2 min)',
      halfLife: '40–80 minutes (shorter than diazepam/lorazepam)',
      volumeOfDistribution: '0.9 L/kg',
      metabolism: 'Hepatic (> 95%)',
      excretion: 'Renal (inactive metabolites)',
      proteinBinding: '50%',
    },
    renalAndHepaticDosing:
      'Reduce repeat doses in hepatic impairment (prolonged half-life).',
    clinicalPearls:
      'Rarely given in undifferentiated overdose! In chronic benzodiazepine users or mixed TCA overdoses, flumazenil strips away GABAergic seizure protection and triggers intractable status epilepticus.',
    patientCounseling:
      'Observe for resedation for at least 2 hours after reversal (especially after long-acting benzodiazepines).',
    contraindications:
      'Suspected tricyclic antidepressant co-ingestion (QRS > 100 ms!), chronic benzodiazepine dependence for seizure control.',
    majorInteractions:
      'TCAs, proconvulsant drugs (bupropion, tramadol), chronic benzodiazepines.',
    monitoring: 'ECG (rule out QRS widening before giving!), seizure precautions, resedation.',
  },

  // ================= AI, PGX & PHARMACOINFORMATICS (6) =================
  {
    id: 'ticagrelor',
    genericName: 'Ticagrelor',
    brandNames: 'Brilinta',
    drugClass: 'Reversible P2Y12 Platelet Inhibitor',
    chemicalClass: 'Cyclopentyltriazolopyrimidine (CPTP) nucleoside analog (active parent)',
    specialty: 'ai_informatics',
    dosageForm: 'tablet',
    molecularTarget: 'Platelet ADP P2Y12 Receptor (Reversible Allosteric Antagonist)',
    mechanism:
      'Directly and reversibly inhibits platelet P2Y12 ADP receptors without requiring CYP2C19 hepatic prodrug bioactivation, providing consistent antiplatelet protection across CYP2C19 genotypes.',
    pharmacokinetics: {
      bioavailability: '36% (unaffected by CYP2C19 genotype)',
      halfLife: '7 hours (active AR-C124910XX metabolite: 9 h)',
      volumeOfDistribution: '88 L',
      metabolism: 'Hepatic via CYP3A4 (parent & metabolite both active)',
      excretion: '58% fecal, 26% renal',
      proteinBinding: '> 99.7%',
    },
    renalAndHepaticDosing:
      'No renal dose adjustment needed (avoid in severe hepatic impairment due to CYP3A4 clearance).',
    clinicalPearls:
      'First-line alternative when pharmacogenomic CDSS flags CYP2C19 *2/*2 loss-of-function post-PCI (where clopidogrel fails). Boxed Warning: aspirin maintenance > 100 mg/day REDUCES ticagrelor efficacy!',
    patientCounseling:
      'Take twice daily with a low-dose aspirin (81 mg/day max); report unexplained shortness of breath (benign adenosine-mediated dyspnea) or unusual bleeding.',
    contraindications:
      'Active pathological bleeding, history of intracranial hemorrhage, severe hepatic impairment, strong CYP3A4 inhibitors/inducers.',
    majorInteractions:
      'Aspirin > 100 mg/day (diminishes efficacy), strong CYP3A4 inhibitors/inducers, simvastatin > 40 mg/day.',
    monitoring: 'Signs of bleeding, dyspnea, adherence to BID dosing and 81 mg aspirin cap.',
  },
  {
    id: 'allopurinol',
    genericName: 'Allopurinol',
    brandNames: 'Zyloprim',
    drugClass: 'Xanthine Oxidase Inhibitor',
    chemicalClass: 'Purine analog hypoxanthine isomer',
    specialty: 'ai_informatics',
    dosageForm: 'tablet',
    molecularTarget: 'Xanthine Oxidase (Purine Catabolism)',
    mechanism:
      'Allopurinol and its active metabolite oxypurinol inhibit xanthine oxidase, blocking conversion of hypoxanthine and xanthine to uric acid for chronic gout prophylaxis and tumor lysis prevention.',
    pharmacokinetics: {
      bioavailability: '90%',
      halfLife: '1–2 hours (oxypurinol active metabolite: 15–24 h, prolonged in CKD)',
      volumeOfDistribution: '1.6 L/kg',
      metabolism: 'Aldehyde oxidase / xanthine oxidase to oxypurinol',
      excretion: '80% renal (oxypurinol accumulates markedly in CKD)',
      proteinBinding: 'Negligible',
    },
    renalAndHepaticDosing:
      'Start <= 50 mg/day when eGFR < 30 mL/min and titrate slowly to target uric acid < 6 mg/dL to avoid severe hypersensitivity.',
    clinicalPearls:
      'Screen for HLA-B*58:01 BEFORE initiating in high-risk ancestry groups (Han Chinese, Thai, Korean, African American with CKD) to prevent fatal SJS/TEN/DRESS—an essential equity check when legacy EHR algorithms omit ancestry-calibrated PGx alerts!',
    patientCounseling:
      'Drink plenty of water; stop immediately and seek emergency care for any rash, fever, or mouth sores; expect temporary gout flare prophylaxis (colchicine/NSAID) for the first 3–6 months.',
    contraindications:
      'HLA-B*58:01 positivity (relative/strong avoidance), prior allopurinol hypersensitivity.',
    majorInteractions:
      'Azathioprine & 6-mercaptopurine (xanthine oxidase inhibition causes 3–4× myelosuppression—reduce thiopurine dose 75% or avoid!).',
    monitoring: 'HLA-B*58:01 pre-screen in at-risk patients, serum uric acid (< 6 mg/dL), SCr, CBC, rash.',
  },
  {
    id: 'febuxostat',
    genericName: 'Febuxostat',
    brandNames: 'Uloric',
    drugClass: 'Non-Purine Selective Xanthine Oxidase Inhibitor',
    chemicalClass: '2-arylthiazole carboxylic acid derivative',
    specialty: 'ai_informatics',
    dosageForm: 'tablet',
    molecularTarget: 'Xanthine Oxidase Molybdenum-Pterin Catalytic Channel',
    mechanism:
      'Potently inhibits both oxidized and reduced forms of xanthine oxidase without purine-ring structure, lowering serum uric acid in patients unable to take allopurinol.',
    pharmacokinetics: {
      bioavailability: '49%',
      halfLife: '5–8 hours',
      volumeOfDistribution: '50 L',
      metabolism: 'Hepatic glucuronidation (UGT1A1/1A3/1A9/2B7) & CYP1A2/2C8/2C9',
      excretion: '49% renal (mostly glucuronide), 45% fecal',
      proteinBinding: '99.2%',
    },
    renalAndHepaticDosing:
      'No adjustment for CrCl >= 30 mL/min; max 40 mg/day if CrCl 15–29 mL/min. Mild-moderate hepatic impairment: no adjustment.',
    clinicalPearls:
      'Valuable urate-lowering option when HLA-B*58:01 positivity precludes allopurinol, BUT carries an FDA Boxed Warning for increased cardiovascular death vs. allopurinol (reserve for allopurinol intolerance/inefficacy).',
    patientCounseling:
      'Report chest pain, shortness of breath, sudden weakness, or dark urine; continue prescribed flare prophylaxis during early titration.',
    contraindications:
      'Concurrent azathioprine or mercaptopurine (fatal pancytopenia via xanthine oxidase blockade!).',
    majorInteractions:
      'Azathioprine, 6-mercaptopurine, theophylline (xanthine oxidase substrates accumulate severely).',
    monitoring: 'Serum uric acid (< 6 mg/dL), liver transaminases, cardiovascular symptoms.',
  },
  {
    id: 'abacavir',
    genericName: 'Abacavir',
    brandNames: 'Ziagen (in Triumeq)',
    drugClass: 'Nucleoside Reverse Transcriptase Inhibitor (NRTI)',
    chemicalClass: 'Carbocyclic guanosine nucleoside analog',
    specialty: 'ai_informatics',
    dosageForm: 'tablet',
    molecularTarget: 'HIV-1 Reverse Transcriptase (Chain Terminator)',
    mechanism:
      'Intracellularly phosphorylated to carbovir triphosphate, competing with endogenous dGTP to terminate proviral HIV DNA elongation.',
    pharmacokinetics: {
      bioavailability: '83%',
      halfLife: '1.5 hours (intracellular carbovir-TP t½ > 12–20 h)',
      volumeOfDistribution: '0.86 L/kg',
      metabolism: 'Alcohol dehydrogenase & UGT glucuronidation (non-CYP)',
      excretion: '83% renal (metabolites), 16% fecal',
      proteinBinding: '50%',
    },
    renalAndHepaticDosing:
      'No renal adjustment needed; reduce dose in Child-Pugh A cirrhosis and contraindicated in Child-Pugh B/C hepatic impairment.',
    clinicalPearls:
      'Gold-standard example of mandatory clinical decision support hard-stops: HLA-B*57:01 screening MUST be documented negative before starting abacavir to prevent life-threatening hypersensitivity reaction (HSR). NEVER rechallenge after suspected HSR!',
    patientCounseling:
      'Carry the medication warning card; seek urgent care for fever, rash, GI upset, or sore throat/cough, and never restart abacavir if stopped for hypersensitivity.',
    contraindications:
      'HLA-B*57:01 positive allele (FDA Boxed Warning), moderate-to-severe hepatic impairment, prior abacavir HSR.',
    majorInteractions:
      'Ethanol (competes for alcohol dehydrogenase, raising abacavir exposure ~41%), methadone (slight induction).',
    monitoring: 'Mandatory pre-treatment HLA-B*57:01 test, HIV-1 RNA viral load, CD4 count, HSR symptoms.',
  },
  {
    id: 'pravastatin',
    genericName: 'Pravastatin',
    brandNames: 'Pravachol',
    drugClass: 'Hydrophilic HMG-CoA Reductase Inhibitor',
    chemicalClass: 'Hydrophilic open-ring hydroxy-acid fungal mevinolin derivative',
    specialty: 'ai_informatics',
    dosageForm: 'tablet',
    molecularTarget: 'Hepatic HMG-CoA Reductase',
    mechanism:
      'Competitively inhibits hepatic cholesterol synthesis via HMG-CoA reductase, upregulating LDL receptors without relying on CYP3A4 oxidative metabolism.',
    pharmacokinetics: {
      bioavailability: '17%',
      halfLife: '1.8 hours (elimination ~77 h including metabolites)',
      volumeOfDistribution: '0.5 L/kg',
      metabolism: 'Non-CYP sulfation & gastric acid isomerization (minimal CYP3A4!)',
      excretion: '70% fecal, 20% renal',
      proteinBinding: '50%',
    },
    renalAndHepaticDosing:
      'Severe renal impairment (CrCl < 30 mL/min): start 10 mg daily. Contraindicated in active decompensated liver disease.',
    clinicalPearls:
      'Because pravastatin and rosuvastatin bypass CYP3A4, they are preferred when CDSS flags strong CYP3A4 inhibitors (clarithromycin, ritonavir, itraconazole) that spike simvastatin/lovastatin rhabdomyolysis risk!',
    patientCounseling:
      'Can be taken any time of day with or without food; report unexplained bilateral muscle aches, weakness, or dark tea-colored urine.',
    contraindications:
      'Active liver failure/acute hepatitis, hypersensitivity.',
    majorInteractions:
      'Cyclosporine & gemfibrozil (OATP1B1 inhibition raises statin exposure; prefer fenofibrate if fibrate needed).',
    monitoring: 'Fasting lipid panel (4–12 weeks), baseline ALT, muscle symptoms.',
  },
  {
    id: 'buprenorphine_naloxone',
    genericName: 'Buprenorphine-Naloxone',
    brandNames: 'Suboxone, Zubsolv',
    drugClass: 'Partial Mu-Opioid Agonist / Kappa Antagonist',
    chemicalClass: 'Semisynthetic thebaine oripavine derivative + N-allyl antagonist',
    specialty: 'ai_informatics',
    dosageForm: 'tablet',
    molecularTarget: 'Mu-Opioid Receptor (High-Affinity Partial Agonist) & Kappa Antagonist',
    mechanism:
      'Buprenorphine binds mu-opioid receptors with ultra-high affinity and partial intrinsic efficacy (ceiling effect on respiratory depression), stabilizing OUD; sublingual naloxone has negligible absorption unless injected.',
    pharmacokinetics: {
      bioavailability: 'Buprenorphine ~30–50% sublingual; Naloxone < 3% sublingual (high IV)',
      halfLife: '24–42 hours (sublingual)',
      volumeOfDistribution: '97–187 L',
      metabolism: 'Hepatic CYP3A4 N-dealkylation to active norbuprenorphine & UGT1A1/2B7',
      excretion: '70% fecal, 30% renal',
      proteinBinding: '96%',
    },
    renalAndHepaticDosing:
      'No renal dose adjustment required; avoid high-naloxone combinations in severe hepatic impairment (use buprenorphine mono-product cautiously).',
    clinicalPearls:
      'Automated risk-score algorithms should NEVER trigger abrupt discontinuation of OUD maintenance therapy without human evaluation—sudden cutoff breaks therapeutic trust and spikes fatal relapse overdose risk! Wait until mild-moderate withdrawal (COWS >= 8–12) before first induction dose to avoid precipitated withdrawal.',
    patientCounseling:
      'Dissolve film/tablet completely under the tongue—do not chew or swallow; avoid alcohol and benzodiazepines; keep take-home naloxone accessible.',
    contraindications:
      'Hypersensitivity; do not initiate while full mu-agonist is actively occupying receptors without induction protocol.',
    majorInteractions:
      'Benzodiazepines & alcohol (additive respiratory depression), strong CYP3A4 inhibitors/inducers.',
    monitoring: 'COWS withdrawal score at induction, PDMP/adherence, liver enzymes, empathetic counseling check-ins.',
    antidoteOrReversal: 'High-dose naloxone + airway support (due to ultra-high mu-receptor affinity).',
  },
  ...SYSTEM_EXPANSION_DRUGS,
];

export const DRUG_MAP: Record<string, DrugMonograph> = Object.fromEntries(
  DRUG_MONOGRAPHS.map((d) => [d.id, d])
);
