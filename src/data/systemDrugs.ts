import { DrugMonograph } from '../types/pharma';

export const SYSTEM_EXPANSION_DRUGS: DrugMonograph[] = [
  // ================= RESPIRATORY & PULMONARY (5) =================
  {
    id: 'tiotropium',
    genericName: 'Tiotropium',
    brandNames: 'Spiriva HandiHaler, Spiriva Respimat',
    drugClass: 'Long-Acting Muscarinic Antagonist (LAMA)',
    chemicalClass: 'Quaternary ammonium anticholinergic tropane derivative',
    specialty: 'respiratory',
    dosageForm: 'inhaler',
    molecularTarget: 'Bronchial Smooth Muscle M3 Muscarinic Receptors',
    mechanism:
      'Potently and slowly dissociates from M3 muscarinic receptors on airway smooth muscle and submucosal glands, blocking vagally mediated bronchoconstriction and mucus hypersecretion for 24 hours.',
    pharmacokinetics: {
      bioavailability: '19.5% inhaled (minimal GI absorption due to quaternary charge)',
      halfLife: '5–6 days (terminal elimination)',
      volumeOfDistribution: '32 L/kg',
      metabolism: 'Minimal CYP2D6 / CYP3A4 oxidation (~25%); mostly non-enzymatic ester cleavage',
      excretion: '74% unchanged in urine after IV; primarily unabsorbed swallowed fraction in feces',
      proteinBinding: '72%',
    },
    renalAndHepaticDosing:
      'Monitor closely for systemic anticholinergic toxicity (urinary retention, dry mouth) when CrCl <= 60 mL/min. No hepatic adjustment needed.',
    clinicalPearls:
      'Cornerstone daily maintenance bronchodilator for COPD (GOLD Groups B & E) reducing exacerbations. HandiHaler capsules must NEVER be swallowed—inhale via puncture device!',
    patientCounseling:
      'Use once daily at the same time every day; never swallow capsules; not for acute bronchospasm rescue (keep albuterol handy). Report eye pain/blurry vision or difficulty urinating.',
    contraindications:
      'Hypersensitivity to tiotropium, ipratropium, or milk proteins (HandiHaler lactose carrier); caution in narrow-angle glaucoma, BPH, or bladder neck obstruction.',
    majorInteractions:
      'Concurrent inhaled anticholinergics (ipratropium, umeclidinium) or systemic antimuscarinics increase urinary retention and xerostomia risk.',
    monitoring: 'FEV1, COPD exacerbation frequency, dry mouth, intraocular symptoms, urinary hesitancy.',
  },
  {
    id: 'budesonide_formoterol',
    genericName: 'Budesonide-Formoterol',
    brandNames: 'Symbicort',
    drugClass: 'ICS + Fast/Long-Acting Beta-2 Agonist (ICS-LABA)',
    chemicalClass: 'Non-halogenated glucocorticoid + phenylethanolamine beta-2 agonist',
    specialty: 'respiratory',
    dosageForm: 'inhaler',
    molecularTarget: 'Airway Glucocorticoid Receptors & Bronchial Beta-2 Adrenoceptors',
    mechanism:
      'Budesonide suppresses eosinophilic airway inflammation and upregulates beta-2 receptor expression, while formoterol combines rapid 1–3 minute bronchodilation with 12-hour duration.',
    pharmacokinetics: {
      bioavailability: 'Budesonide ~39% lung deposition (89% hepatic first-pass of swallowed portion); Formoterol ~61%',
      halfLife: 'Budesonide 2–3.6 h; Formoterol ~10 h',
      volumeOfDistribution: 'Budesonide ~3 L/kg',
      metabolism: 'Budesonide: extensive hepatic CYP3A4; Formoterol: hepatic UGT glucuronidation & O-demethylation',
      excretion: 'Budesonide 60% renal metabolites; Formoterol 62% renal',
      proteinBinding: 'Budesonide 85–90%; Formoterol 61–64%',
    },
    renalAndHepaticDosing:
      'No renal adjustment required. Monitor closely in severe hepatic impairment (CYP3A4 clearance of budesonide decreases).',
    clinicalPearls:
      'Because formoterol has rapid onset (~3 min) PLUS long duration, GINA Track 1 recommends low-dose budesonide-formoterol as both daily controller AND as-needed reliever (SMART therapy), cutting severe asthma exacerbations vs SABA monotherapy.',
    patientCounseling:
      'Rinse mouth with water and spit (do not swallow) after each inhalation to prevent oral thrush and hoarseness. Keep cap closed and track dose counter.',
    contraindications:
      'Primary treatment of status asthmaticus requiring intensive measures; severe milk protein allergy (dry powder products); never pair with a second LABA.',
    majorInteractions:
      'Strong CYP3A4 inhibitors (ritonavir, itraconazole) elevate systemic budesonide Cushingoid risk; non-selective beta-blockers antagonize formoterol.',
    monitoring: 'Asthma Control Test (ACT), oral mucosa for candidiasis, serum K+ with high doses, growth velocity in pediatrics.',
  },
  {
    id: 'montelukast',
    genericName: 'Montelukast',
    brandNames: 'Singulair',
    drugClass: 'Leukotriene Receptor Antagonist (LTRA)',
    chemicalClass: 'Quinoline-substituted cyclopropyl leukotriene antagonist',
    specialty: 'respiratory',
    dosageForm: 'tablet',
    molecularTarget: 'Cysteinyl Leukotriene Receptor Type 1 (CysLT1)',
    mechanism:
      'Selectively blocks LTC4, LTD4, and LTE4 binding at bronchial CysLT1 receptors, attenuating bronchoconstriction, microvascular permeability, and eosinophil recruitment without bronchodilator rescue activity.',
    pharmacokinetics: {
      bioavailability: '64% oral (unaffected by standard meals)',
      halfLife: '2.7–5.5 hours',
      volumeOfDistribution: '8–11 L',
      metabolism: 'Hepatic CYP2C8 (major), CYP2C9 & CYP3A4',
      excretion: '86% biliary/fecal (< 0.2% renal)',
      proteinBinding: '> 99%',
    },
    renalAndHepaticDosing:
      'No renal adjustment needed. Mild-to-moderate hepatic insufficiency: no change; severe cirrhosis not studied.',
    clinicalPearls:
      'Effective add-on for aspirin-exacerbated respiratory disease (AERD) and exercise-induced bronchoconstriction, but FDA boxed warning restricts allergic rhinitis use because of serious neuropsychiatric events.',
    patientCounseling:
      'Take once daily in the evening for asthma; not for sudden asthma attacks. Watch immediately for agitation, vivid dreams, insomnia, depression, or suicidal thoughts.',
    contraindications:
      'Hypersensitivity; avoid for mild intermittent allergic rhinitis unless inadequate response or intolerance to safer alternatives.',
    majorInteractions:
      'CYP2C8 inhibitors (gemfibrozil) increase montelukast exposure; potent CYP inducers (phenobarbital, rifampin) reduce levels.',
    monitoring: 'Neuropsychiatric symptoms (mood, behavior, sleep), asthma symptom frequency, Eosinophilic granulomatosis with polyangiitis (EGPA) vigilance during steroid taper.',
  },
  {
    id: 'omalizumab',
    genericName: 'Omalizumab',
    brandNames: 'Xolair',
    drugClass: 'Anti-IgE Recombinant Humanized Monoclonal Antibody',
    chemicalClass: 'Recombinant DNA-derived IgG1 kappa monoclonal antibody',
    specialty: 'respiratory',
    dosageForm: 'pen',
    molecularTarget: 'Circulating Free Immunoglobulin E (IgE Cε3 Domain)',
    mechanism:
      'Binds free circulating IgE at the FcεRI-binding domain, preventing IgE attachment to mast cells and basophils and gradually downregulating high-affinity FcεRI surface density.',
    pharmacokinetics: {
      bioavailability: '62% subcutaneous (peak in 7–8 days)',
      halfLife: '26 days',
      volumeOfDistribution: '78 mL/kg',
      metabolism: 'Reticuloendothelial system proteolytic catabolism + IgE-complex clearance',
      excretion: 'Hepatic sinusoidal endothelial degradation (non-renal)',
      proteinBinding: 'Binds free IgE specifically',
    },
    renalAndHepaticDosing:
      'No renal or hepatic dose adjustment needed. Dosed strictly by baseline total serum IgE (IU/mL) and body weight (kg) every 2–4 weeks.',
    clinicalPearls:
      'Targeted biologic for moderate-to-severe persistent allergic asthma (perennial aeroallergen sensitization + elevated IgE) and chronic spontaneous urticaria. Observe patients in clinic after initial injections due to delayed anaphylaxis risk.',
    patientCounseling:
      'Do not abruptly discontinue inhaled or oral corticosteroids upon starting omalizumab. Seek emergency care for wheezing, hives, throat tightness, or dizziness—anaphylaxis can occur even after the 1st year.',
    contraindications:
      'Severe hypersensitivity reaction to omalizumab or formulation components.',
    majorInteractions:
      'None CYP-mediated; total serum IgE levels remain artificially elevated for up to 1 year after stopping therapy (cannot guide re-dosing via repeat IgE during active use).',
    monitoring: 'Observation post-injection (especially first 3 doses), asthma exacerbations, eosinophil counts, helminth infection risk.',
  },
  {
    id: 'roflumilast',
    genericName: 'Roflumilast',
    brandNames: 'Daliresp',
    drugClass: 'Selective Phosphodiesterase-4 (PDE4) Inhibitor',
    chemicalClass: 'Benzamide N-oxide heterocyclic PDE4 inhibitor',
    specialty: 'respiratory',
    dosageForm: 'tablet',
    molecularTarget: 'Intracellular Cyclic AMP-Specific Phosphodiesterase-4 (PDE4)',
    mechanism:
      'Inhibits PDE4 in lung neutrophils, macrophages, and airway epithelium, raising intracellular cAMP to dampen chronic neutrophilic airway inflammation without direct acute bronchodilation.',
    pharmacokinetics: {
      bioavailability: '79% oral',
      halfLife: 'Parent ~17 hours; Active roflumilast N-oxide ~30 hours',
      volumeOfDistribution: '2.9 L/kg',
      metabolism: 'Hepatic CYP3A4 & CYP1A2 to active N-oxide (responsible for ~90% of activity)',
      excretion: '70% renal (as inactive conjugates), 20% fecal',
      proteinBinding: '99%',
    },
    renalAndHepaticDosing:
      'No renal adjustment required. CONTRAINDICATED in moderate-to-severe hepatic impairment (Child-Pugh B or C).',
    clinicalPearls:
      'Specifically indicated to cut exacerbations in severe COPD with chronic bronchitis phenotype (chronic cough/sputum) AND FEV1 < 50% despite triple/dual inhaled therapy.',
    patientCounseling:
      'Expect possible nausea, diarrhea, or modest weight loss during the first few weeks; report new depression, severe insomnia, or suicidal ideation promptly.',
    contraindications:
      'Moderate-to-severe liver impairment (Child-Pugh B/C); avoid in underweight/cachectic patients if weight loss is intolerable.',
    majorInteractions:
      'Strong CYP3A4/1A2 inducers (rifampin, carbamazepine, phenytoin) abolish efficacy; inhibitors (fluvoxamine, ciprofloxacin, erythromycin, ketoconazole) raise systemic toxicity.',
    monitoring: 'Body weight at every visit, mood/neuropsychiatric screen, COPD exacerbation frequency.',
  },

  // ================= HEMATOLOGY & IMMUNE (5) =================
  {
    id: 'epinephrine',
    genericName: 'Epinephrine',
    brandNames: 'EpiPen, Auvi-Q, Adrenalin',
    drugClass: 'Non-Selective Alpha & Beta Adrenergic Agonist',
    chemicalClass: 'Endogenous catecholamine (dihydroxy-phenylethanolamine)',
    specialty: 'hematology_immune',
    dosageForm: 'pen',
    molecularTarget: 'Alpha-1, Alpha-2, Beta-1, and Beta-2 Adrenoceptors',
    mechanism:
      'Alpha-1 vasoconstriction reverses distributive shock and upper-airway mucosal edema; beta-2 agonism rapidly dilates constricted bronchioles and stabilizes mast cell/basophil mediator release; beta-1 supports cardiac output.',
    pharmacokinetics: {
      bioavailability: 'Rapid systemic absorption via IM anterolateral thigh (vastus lateralis); poor orally due to COMT/MAO',
      halfLife: '2–5 minutes plasma half-life',
      volumeOfDistribution: 'Distributes rapidly into sympathetic target tissues',
      metabolism: 'Hepatic & tissue COMT and MAO to inactive VMA and metanephrines',
      excretion: 'Renal metabolites',
      proteinBinding: 'Negligible (< 20%)',
    },
    renalAndHepaticDosing:
      'No renal or hepatic adjustment—life-saving emergency dosing: 0.3 mg IM (>= 30 kg) or 0.15 mg IM (15–30 kg) into outer thigh; repeat q5–15 min if needed.',
    clinicalPearls:
      'ONLY first-line life-saving treatment for anaphylaxis—antihistamines and corticosteroids do NOT treat airway edema or shock! Always inject into the anterolateral thigh (not deltoid or gluteus).',
    patientCounseling:
      'Carry 2 auto-injectors at all times; inject firmly into the outer mid-thigh (even through clothing) and call 911 immediately after administration.',
    contraindications:
      'NO absolute contraindication in life-threatening anaphylaxis! Avoid local infiltration with anesthetics into digits/nose/ears.',
    majorInteractions:
      'Beta-blockers may blunt beta-2 bronchodilation and cause unopposed alpha-mediated hypertension (give glucagon if refractory); TCAs/MAOIs potentiate pressor surges.',
    monitoring: 'Airway patency, blood pressure, heart rate/ECG, oxygen saturation, biphasic reaction observation.',
  },
  {
    id: 'alteplase',
    genericName: 'Alteplase (tPA)',
    brandNames: 'Activase, Cathflo Activase',
    drugClass: 'Recombinant Tissue Plasminogen Activator (Fibrinolytic)',
    chemicalClass: '527-amino-acid glycosylated serine protease',
    specialty: 'hematology_immune',
    dosageForm: 'iv_vial',
    molecularTarget: 'Fibrin-Bound Plasminogen -> Plasmin',
    mechanism:
      'Preferentially binds fibrin within an existing thrombus and cleaves fibrin-bound plasminogen to plasmin, lysing occlusive arterial or venous fibrin clots.',
    pharmacokinetics: {
      bioavailability: '100% IV infusion',
      halfLife: 'Alpha phase < 5 minutes; Beta terminal ~40–70 minutes',
      volumeOfDistribution: 'Approx. plasma volume (~4–6 L)',
      metabolism: 'Rapid hepatic clearance via receptor-mediated endocytosis',
      excretion: 'Hepatic degradation (> 80% cleared within 10 min after infusion stops)',
      proteinBinding: 'Binds circulating & fibrin-bound plasminogen',
    },
    renalAndHepaticDosing:
      'No renal adjustment required. Use cautiously in severe hepatic dysfunction (impaired clearance and baseline coagulopathy). Acute ischemic stroke dosing: 0.9 mg/kg (max 90 mg) over 60 min (10% bolus, 90% infusion).',
    clinicalPearls:
      'Strict time window in acute ischemic stroke: <= 4.5 hours from last known normal AFTER non-contrast head CT rules out intracranial hemorrhage and BP is controlled < 185/110 mmHg!',
    patientCounseling:
      'Emergency inpatient infusion—avoid unnecessary venipunctures, arterial lines, or antiplatelet/anticoagulant administration for the first 24 hours post-stroke tPA.',
    contraindications:
      'Active internal bleeding, intracranial hemorrhage on CT, ischemic stroke/head trauma within 3 months, platelets < 100,000/mm3, INR > 1.7, DOAC intake within 48h (unless normal specific assays), uncontrolled BP > 185/110 mmHg.',
    majorInteractions:
      'Anticoagulants (heparin, warfarin, DOACs) and antiplatelets dramatically raise symptomatic ICH risk within 24 hours of thrombolysis.',
    monitoring: 'Neurological checks q15min during/after infusion, BP strictly < 180/105 mmHg for 24h, repeat head CT if neuro decline or severe headache.',
    antidoteOrReversal: 'Stop infusion immediately + cryoprecipitate (fibrinogen replacement) ± tranexamic acid/aminocaproic acid.',
  },
  {
    id: 'hydroxyurea',
    genericName: 'Hydroxyurea',
    brandNames: 'Droxia, Siklos, Hydrea',
    drugClass: 'Ribonucleotide Reductase Inhibitor (Antimetabolite)',
    chemicalClass: 'Simple hydroxylated carbamide (urea analog)',
    specialty: 'hematology_immune',
    dosageForm: 'capsule',
    molecularTarget: 'Ribonucleotide Reductase (M2 Tyrosyl Radical Subunit)',
    mechanism:
      'Inhibits DNA synthesis during S-phase via ribonucleotide reductase blockade, selectively suppressing inflammatory leukocytes/reticulocytes while inducing gamma-globin transcription to boost protective fetal hemoglobin (HbF), preventing HbS sickling.',
    pharmacokinetics: {
      bioavailability: '~80–100% oral',
      halfLife: '2–5 hours',
      volumeOfDistribution: 'Approx. total body water (~0.5 L/kg)',
      metabolism: 'Partial hepatic urease degradation + nitric oxide generation',
      excretion: '40–60% unchanged in urine',
      proteinBinding: 'Minimal (< 10%)',
    },
    renalAndHepaticDosing:
      'CrCl < 60 mL/min: reduce starting dose by 50% (e.g., 7.5 mg/kg/day) due to significant renal elimination.',
    clinicalPearls:
      'Disease-modifying first-line standard of care in Sickle Cell Disease to slash painful vaso-occlusive crises, acute chest syndrome, and transfusion needs. Expected therapeutic side effect: asymptomatic macrocytosis (elevated MCV)!',
    patientCounseling:
      'Take consistently every day (benefits take 3–6 months to peak); wear gloves or wash hands after handling capsules; use reliable contraception (teratogenic) and attend routine CBC lab checks.',
    contraindications:
      'Marked bone marrow suppression (WBC < 2,500, ANC < 2,000, platelets < 80,000), pregnancy, breastfeeding.',
    majorInteractions:
      'Didanosine/stavudine (fatal pancreatitis/hepatotoxicity), live vaccines (impaired immunity), concurrent myelosuppressive cytotoxics.',
    monitoring: 'CBC with differential & reticulocyte count q2–4 weeks during titration, then q1–3 months; HbF %, MCV, SCr.',
  },
  {
    id: 'filgrastim',
    genericName: 'Filgrastim',
    brandNames: 'Neupogen, Zarxio, Nivestym',
    drugClass: 'Recombinant Granulocyte Colony-Stimulating Factor (G-CSF)',
    chemicalClass: '175-amino-acid non-glycosylated recombinant human G-CSF (r-metHuG-CSF)',
    specialty: 'hematology_immune',
    dosageForm: 'iv_vial',
    molecularTarget: 'Hematopoietic G-CSF Receptor (CD114) on Myeloid Progenitors',
    mechanism:
      'Binds G-CSF receptors on bone marrow myeloid precursors to accelerate neutrophil proliferation, differentiation, maturation, and functional release into peripheral blood, shortening severe neutropenia duration.',
    pharmacokinetics: {
      bioavailability: '60–70% subcutaneous',
      halfLife: '~3.5 hours (longer with severe neutropenia due to reduced neutrophil-mediated clearance)',
      volumeOfDistribution: '150 mL/kg',
      metabolism: 'Primarily degraded via neutrophil elastase & G-CSF receptor internalization',
      excretion: 'Minimal renal clearance',
      proteinBinding: 'Binds G-CSF receptors',
    },
    renalAndHepaticDosing:
      'No renal or hepatic adjustment required. Administer starting AT LEAST 24 hours AFTER completion of myelosuppressive chemotherapy (never within 24 hours before or after chemo)!',
    clinicalPearls:
      'Primary prophylaxis indicated when chemotherapy regimen febrile neutropenia risk is >= 20%. Timing is critical: giving G-CSF simultaneously with cytotoxic chemotherapy destroys rapidly dividing myeloid progenitors!',
    patientCounseling:
      'Mild-to-moderate aching in long bones/hips/sternum is common as marrow expands—ask your clinician about acetaminophen or loratadine. Report left upper abdominal/shoulder pain (rare splenic rupture) or fever immediately.',
    contraindications:
      'Serious allergic reaction to E. coli-derived proteins, pegfilgrastim, or filgrastim; never administer within 24h before/after cytotoxic chemotherapy.',
    majorInteractions:
      'Cytotoxic chemotherapy within 24 hours (severe paradoxical neutropenia), lithium (additive neutrophil release), bleomycin/radiation (monitor pulmonary toxicity).',
    monitoring: 'CBC with differential twice weekly until ANC recovers (>= 1,000–10,000/mm3), spleen size/abdominal pain, respiratory status (rare ARDS).',
  },
  {
    id: 'tacrolimus',
    genericName: 'Tacrolimus',
    brandNames: 'Prograf, Envarsus XR, Astagraf XL',
    drugClass: 'Calcineurin Inhibitor Immunosuppressant',
    chemicalClass: '23-membered macrolide lactone derived from Streptomyces tsukubaensis',
    specialty: 'hematology_immune',
    dosageForm: 'capsule',
    molecularTarget: 'FKBP-12 Complex -> Calcineurin Phosphatase Inhibition',
    mechanism:
      'Binds FKBP-12 to inhibit calcineurin phosphatase, blocking dephosphorylation and nuclear translocation of NFAT, thereby suppressing IL-2 gene transcription and T-lymphocyte activation.',
    pharmacokinetics: {
      bioavailability: '~17–25% oral (variable; food decreases rate/extent of IR absorption)',
      halfLife: '12–19 hours (longer in hepatic impairment)',
      volumeOfDistribution: '~1–2 L/kg (heavily sequestered inside erythrocytes)',
      metabolism: 'Extensive intestinal & hepatic CYP3A4/5 metabolism + P-gp efflux',
      excretion: '> 95% biliary/fecal metabolites (< 2% unchanged renal)',
      proteinBinding: '99% (mostly alpha-1-acid glycoprotein & albumin)',
    },
    renalAndHepaticDosing:
      'No automatic renal dose cut, though nephrotoxicity requires whole-blood trough titration; reduce dose in moderate-severe hepatic impairment (Child-Pugh >= 10). IR (Prograf) vs ER (Envarsus XR / Astagraf XL) are NOT 1:1 mg-to-mg interchangeable!',
    clinicalPearls:
      'Backbone solid-organ transplant immunosuppressant with a razor-thin therapeutic index. Strong CYP3A4 inhibitors (azoles, Paxlovid/ritonavir, clarithromycin, grapefruit) spike troughs 5–10× causing acute kidney injury, hyperkalemia, and PRES neurotoxicity!',
    patientCounseling:
      'Take consistently at exact 12-hour intervals (or once daily for ER) relative to meals; NEVER switch brands/formulations without transplant team approval; avoid grapefruit and unapproved OTC supplements (St. John’s wort causes graft rejection).',
    contraindications:
      'Hypersensitivity to tacrolimus or HCO-60 castor oil (IV vehicle); avoid co-administration with cyclosporine (synergistic nephrotoxicity).',
    majorInteractions:
      'Strong CYP3A4/P-gp inhibitors (voriconazole, posaconazole, ritonavir, erythromycin, diltiazem) -> massive toxicity; inducers (rifampin, phenytoin, St. John’s wort) -> acute organ rejection.',
    monitoring: '12-hour whole-blood trough levels (typical 5–15 ng/mL by organ & time), SCr, K+, Mg2+, blood pressure, fasting glucose, tremor.',
  },

  // ================= MUSCULOSKELETAL & DERMATOLOGY (5) =================
  {
    id: 'methotrexate',
    genericName: 'Methotrexate',
    brandNames: 'Trexall, Otrexup, Rasuvo',
    drugClass: 'Conventional Synthetic DMARD (Antifolate Antimetabolite)',
    chemicalClass: '4-amino-10-methylfolic acid pteridine analog',
    specialty: 'musculoskeletal_derm',
    dosageForm: 'tablet',
    molecularTarget: 'Dihydrofolate Reductase (DHFR) & AICAR Transformylase',
    mechanism:
      'Inhibits DHFR to deplete tetrahydrofolate cofactors for purine/thymidylate synthesis and elevates extracellular anti-inflammatory adenosine via AICAR transformylase inhibition, suppressing synovial pannus and autoimmune T/B proliferation.',
    pharmacokinetics: {
      bioavailability: '60–70% low-dose oral (< 15 mg); plateaus at higher oral doses (use SC above 15–20 mg/wk)',
      halfLife: '3–10 hours (low-dose); 8–15 hours (high-dose)',
      volumeOfDistribution: '0.4–0.8 L/kg (distributes into third-space effusions)',
      metabolism: 'Hepatic/intracellular polyglutamation (long active tissue residence)',
      excretion: '80–90% renal unchanged via glomerular filtration & OAT tubular secretion',
      proteinBinding: '50%',
    },
    renalAndHepaticDosing:
      'CrCl 10–50 mL/min: reduce weekly dose by 50% (avoid at CrCl < 30 mL/min if alternatives exist). Avoid in chronic liver disease/alcoholism. ALWAYS dosed ONCE WEEKLY for RA/psoriasis—never daily!',
    clinicalPearls:
      'Anchor csDMARD in Rheumatoid Arthritis and moderate-to-severe psoriasis. Mandatory co-prescribed folic acid (1 mg daily or 5 mg/wk) slashes stomatitis, GI upset, and transaminitis without blunting efficacy.',
    patientCounseling:
      'CRITICAL SAFETY: Take ONLY ONCE PER WEEK on the same chosen day—never every day! Daily accidental dosing can cause fatal pancytopenia. Avoid alcohol and pregnancy (teratogenic; stop >= 3 months prior).',
    contraindications:
      'Pregnancy, breastfeeding, alcoholism/chronic liver disease, overt immunodeficiency syndromes, preexisting blood dyscrasias.',
    majorInteractions:
      'TMP-SMX (additive antifolate pancytopenia), high-dose NSAIDs/probenecid/PPIs (inhibit renal tubular OAT secretion at high doses), leflunomide (hepatotoxicity).',
    monitoring: 'CBC, AST/ALT, albumin, SCr every 2–4 weeks initially, then q8–12 weeks; pregnancy test prior to start.',
    antidoteOrReversal: 'Leucovorin (folinic acid) rescue within 24–36h for overdose/high-dose exposure + glucarpidase in delayed renal clearance.',
  },
  {
    id: 'colchicine',
    genericName: 'Colchicine',
    brandNames: 'Colcrys, Mitigare, Lodoco',
    drugClass: 'Anti-Gout Microtubule Inhibitor',
    chemicalClass: 'Tricyclic alkaloid derived from Colchicum autumnale',
    specialty: 'musculoskeletal_derm',
    dosageForm: 'tablet',
    molecularTarget: 'Beta-Tubulin (Microtubule Polymerization & NLRP3 Inflammasome)',
    mechanism:
      'Binds free tubulin dimers to block microtubule assembly, halting neutrophil chemotaxis, adhesion, phagocytosis of monosodium urate crystals, and NLRP3 inflammasome IL-1beta activation.',
    pharmacokinetics: {
      bioavailability: '~45% oral',
      halfLife: '26–31 hours (leukocyte half-life extends up to ~60 h)',
      volumeOfDistribution: '5–8 L/kg',
      metabolism: 'Hepatic CYP3A4 demethylation + P-glycoprotein (ABCB1) efflux',
      excretion: '40–65% biliary/fecal; 10–20% renal unchanged',
      proteinBinding: '39%',
    },
    renalAndHepaticDosing:
      'Acute gout flare: 1.2 mg at first sign, then 0.6 mg 1 hour later (max 1.8 mg total—NEVER old hourly high-dose regimen!). CrCl < 30 mL/min: repeat acute course no more than once every 2 weeks; prophylaxis 0.3 mg daily.',
    clinicalPearls:
      'Works best within 24–36 hours of gout flare onset. FATAL interaction trap: combining colchicine with strong CYP3A4 OR P-gp inhibitors (clarithromycin, cyclosporine, ritonavir) in patients with renal/hepatic impairment causes lethal multiorgan myelosuppression!',
    patientCounseling:
      'Take 2 tablets (1.2 mg) at the first twinge of gout pain followed by 1 tablet (0.6 mg) 1 hour later—stop if diarrhea, nausea, or vomiting occurs. Avoid grapefruit juice.',
    contraindications:
      'CONCURRENT strong CYP3A4 or P-gp inhibitors (clarithromycin, ketoconazole, ritonavir, cyclosporine) in any patient with renal OR hepatic impairment!',
    majorInteractions:
      'Clarithromycin, azole antifungals, ritonavir, cyclosporine, verapamil/diltiazem (P-gp/CYP3A4 toxicity); statins (additive myopathy/neuromyopathy).',
    monitoring: 'CBC, renal function (CrCl), CPK/muscle weakness, GI intolerance (diarrhea is earliest toxicity warning).',
  },
  {
    id: 'adalimumab',
    genericName: 'Adalimumab',
    brandNames: 'Humira, Hadlima, Cyltezo',
    drugClass: 'Anti-TNF-Alpha Fully Human Monoclonal Antibody (bDMARD)',
    chemicalClass: 'Recombinant human IgG1 monoclonal antibody',
    specialty: 'musculoskeletal_derm',
    dosageForm: 'pen',
    molecularTarget: 'Soluble & Transmembrane Tumor Necrosis Factor-Alpha (TNF-α)',
    mechanism:
      'Selectively neutralizes TNF-alpha and prevents p55/p75 receptor signaling, halting macrophage/synoviocyte cytokine cascades, cartilage pannus erosion, and psoriatic keratinocyte proliferation.',
    pharmacokinetics: {
      bioavailability: '64% subcutaneous',
      halfLife: '~14 days (10–20 days)',
      volumeOfDistribution: '4.7–6.0 L',
      metabolism: 'Proteolytic degradation via reticuloendothelial system',
      excretion: 'Non-renal intracellular catabolism',
      proteinBinding: 'Binds TNF-alpha specifically',
    },
    renalAndHepaticDosing:
      'No renal or hepatic dose adjustment required. Typical RA/PsA maintenance: 40 mg SC every other week.',
    clinicalPearls:
      'Mandatory screening BEFORE initiating ANY TNF inhibitor: latent Tuberculosis (IGRA/TST + CXR if positive) AND Hepatitis B (HBsAg, anti-HBc) to prevent fatal disseminated TB or fulminant HBV reactivation!',
    patientCounseling:
      'Rotate subcutaneous injection sites; store refrigerated (do not freeze); pause therapy and call clinic if fever, persistent cough, or skin infection develops. Avoid live vaccines.',
    contraindications:
      'Active serious infection (untreated TB, sepsis, invasive fungal infection), NYHA Class III–IV decompensated heart failure (worsens HF mortality!), demyelinating disease (MS).',
    majorInteractions:
      'Abatacept, anakinra, or other biologics (excessive serious infection risk without added benefit), live attenuated vaccines.',
    monitoring: 'Baseline & periodic TB/HBV screens, signs of infection, worsening heart failure symptoms, CBC/LFTs.',
  },
  {
    id: 'dupilumab',
    genericName: 'Dupilumab',
    brandNames: 'Dupixent',
    drugClass: 'IL-4 Receptor Alpha Antagonist Biologic',
    chemicalClass: 'Human IgG4 monoclonal antibody',
    specialty: 'musculoskeletal_derm',
    dosageForm: 'pen',
    molecularTarget: 'Shared IL-4Rα Subunit (Blocks IL-4 & IL-13 Signaling)',
    mechanism:
      'Inhibits both Type 2 cytokines IL-4 and IL-13 via shared IL-4Rα blockade, restoring epidermal filaggrin/ceramide skin barrier proteins and resolving eosinophilic inflammation without broad systemic immunosuppression.',
    pharmacokinetics: {
      bioavailability: '61–64% subcutaneous',
      halfLife: 'Target-mediated nonlinear elimination (~2–4 weeks post-steady state)',
      volumeOfDistribution: '~4.8 L',
      metabolism: 'Proteolytic degradation to small peptides/amino acids',
      excretion: 'Non-renal protein catabolism',
      proteinBinding: 'Targeted IgG4 binding',
    },
    renalAndHepaticDosing:
      'No renal or hepatic adjustment required. Does not require baseline TB, HBV, or routine CBC/LFT lab monitoring!',
    clinicalPearls:
      'Targeted non-immunosuppressant first-line biologic for moderate-to-severe atopic dermatitis, eosinophilic asthma, and chronic rhinosinusitis with nasal polyps. Classic unique adverse effect: non-infectious conjunctivitis (~10%).',
    patientCounseling:
      'Administer every 2 weeks subcutaneously; report new eye redness, itching, or tearing early (usually responds to lubricating/ophthalmic drops without stopping therapy); avoid live vaccines.',
    contraindications:
      'Known hypersensitivity to dupilumab; avoid live attenuated vaccines during therapy.',
    majorInteractions:
      'Minimal drug-drug interactions; treat pre-existing helminth infections before initiation; monitor asthmatic patients closely when tapering systemic steroids.',
    monitoring: 'Ocular symptoms (conjunctivitis/keratitis), eczema/EASI improvement, asthma taper safety.',
  },
  {
    id: 'isotretinoin',
    genericName: 'Isotretinoin',
    brandNames: 'Accutane, Absorica, Claravis',
    drugClass: 'Systemic Retinoid (13-cis-Retinoic Acid)',
    chemicalClass: 'Endogenous vitamin A stereoisomer retinoid',
    specialty: 'musculoskeletal_derm',
    dosageForm: 'capsule',
    molecularTarget: 'Retinoic Acid Nuclear Receptors (RAR) — Sebocyte Apoptosis',
    mechanism:
      'Isomerizes intracellularly to all-trans retinoic acid to induce sebocyte apoptosis, sharply shrinking sebaceous gland volume/sebum output, normalizing follicular keratinization, and indirectly depleting Cutibacterium acnes.',
    pharmacokinetics: {
      bioavailability: 'Doubles when taken with a high-fat meal (except specialized micronized Absorica)',
      halfLife: '21 hours (4-oxo-isotretinoin metabolite: 24 hours)',
      volumeOfDistribution: 'Highly lipophilic distribution',
      metabolism: 'Hepatic CYP2C8, CYP2C9, CYP3A4, and glucuronidation',
      excretion: '50% fecal, 50% renal metabolites',
      proteinBinding: '99.9% (primarily albumin)',
    },
    renalAndHepaticDosing:
      'Cumulative target course 120–150 mg/kg over 15–20 weeks; avoid in moderate-severe hepatic impairment or uncontrolled hypertriglyceridemia.',
    clinicalPearls:
      'Strict FDA iPLEDGE REMS program for catastrophic teratogenicity (craniofacial/CNS/cardiac malformations): patients who can become pregnant MUST have 2 negative pregnancy tests before start, monthly tests, and use 2 forms of contraception until 1 month after stopping!',
    patientCounseling:
      'Swallow whole with food (high-fat meal); NEVER donate blood during or for 1 month after therapy; never share capsules; expect dry lips/skin (use petrolatum + sunscreen); NEVER take vitamin A supplements.',
    contraindications:
      'PREGNANCY (Category X / boxed teratogen), breastfeeding, concurrent tetracyclines (pseudotumor cerebri / idiopathic intracranial hypertension!), vitamin A hypervitaminosis.',
    majorInteractions:
      'Tetracyclines / doxycycline / minocycline (severe intracranial hypertension — papilledema & headache), St. John’s wort (reduces oral contraceptive efficacy), systemic vitamin A.',
    monitoring: 'Monthly iPLEDGE pregnancy test, fasting triglycerides & LFTs (baseline, 1–2 mo, dose increases), depression/mood changes, visual night-blindness.',
  },

  // ================= REPRODUCTIVE & SENSORY (5) =================
  {
    id: 'latanoprost',
    genericName: 'Latanoprost',
    brandNames: 'Xalatan, Xelpros',
    drugClass: 'Ophthalmic Prostaglandin F2-Alpha Analog',
    chemicalClass: 'Lipophilic isopropyl ester prodrug of prostaglandin F2α',
    specialty: 'reproductive_sensory',
    dosageForm: 'iv_vial',
    molecularTarget: 'Prostaglandin FP Receptors (Ciliary Body Uveoscleral Outflow)',
    mechanism:
      'Hydrolyzed by corneal esterases to latanoprost acid, activating FP receptors in the ciliary muscle to remodel extracellular matrix and expand uveoscleral aqueous humor outflow, lowering intraocular pressure (IOP) by ~25–35%.',
    pharmacokinetics: {
      bioavailability: 'Rapid corneal penetration; negligible systemic exposure (< 1%)',
      halfLife: '17 minutes (systemic plasma half-life of active acid)',
      volumeOfDistribution: '0.16 L/kg',
      metabolism: 'Corneal esterase activation -> hepatic beta-oxidation',
      excretion: '88% renal inactive metabolites',
      proteinBinding: '90%',
    },
    renalAndHepaticDosing:
      'No systemic renal or hepatic adjustment needed. Instill 1 drop in affected eye(s) once daily in the EVENING (more frequent dosing paradoxically reduces IOP-lowering effect!).',
    clinicalPearls:
      'First-line monotherapy for Primary Open-Angle Glaucoma (POAG) due to once-nightly convenience, high efficacy, and zero systemic asthma/bradycardia risk (unlike ophthalmic beta-blockers like timolol).',
    patientCounseling:
      'Apply 1 drop once nightly; remove contact lenses before instilling and wait 15 minutes (BAK preservative); separate multiple eye drops by 5 minutes. Warn about permanent brown iris darkening & thicker/longer eyelashes.',
    contraindications:
      'Hypersensitivity to latanoprost or benzalkonium chloride; caution in active intraocular inflammation (iritis/uveitis) or aphakic/pseudophakic macular edema risk.',
    majorInteractions:
      'Thimerosal-containing ophthalmic products (precipitation); concurrent bimatoprost/travoprost (paradoxical IOP increase).',
    monitoring: 'Intraocular pressure (IOP target reduction), optic disc cup-to-disc ratio, iris/periorbital pigmentation changes.',
  },
  {
    id: 'timolol_ophthalmic',
    genericName: 'Timolol (Ophthalmic)',
    brandNames: 'Timoptic, Istalol, Betimol',
    drugClass: 'Ophthalmic Non-Selective Beta-1/Beta-2 Adrenergic Antagonist',
    chemicalClass: 'Morpholino-thiadiazole aryloxypropanolamine',
    specialty: 'reproductive_sensory',
    dosageForm: 'iv_vial',
    molecularTarget: 'Ciliary Epithelium Beta-1/Beta-2 Receptors (Aqueous Production)',
    mechanism:
      'Blocks beta-adrenergic receptors on non-pigmented ciliary body epithelium to decrease cAMP-driven aqueous humor secretion, reducing intraocular pressure without affecting pupil size or accommodation.',
    pharmacokinetics: {
      bioavailability: 'Significant systemic absorption via nasolacrimal mucosa bypassing hepatic first-pass (~50–80%)',
      halfLife: '4 hours (systemic)',
      volumeOfDistribution: '1.3–3.5 L/kg',
      metabolism: 'Hepatic CYP2D6 oxidation & conjugation',
      excretion: 'Renal metabolites (~20% unchanged)',
      proteinBinding: '10–60%',
    },
    renalAndHepaticDosing:
      'No specific renal drop cut, though systemic beta-blockade increases in CYP2D6 poor metabolizers or hepatic failure. Administer 1 drop once or twice daily (morning preferred for gel-forming solution).',
    clinicalPearls:
      'HIGH-YIELD BOARD TRAP: Eye drops drain into the nasal mucosa and go straight into systemic veins bypassing liver first-pass! Therefore, ophthalmic timolol can trigger fatal status asthmaticus, severe bradycardia, or AV block!',
    patientCounseling:
      'Press gently on the inner corner of the closed eye next to the nose (nasolacrimal/punctal occlusion) for 1–2 minutes after each drop to minimize systemic absorption into your bloodstream.',
    contraindications:
      'Bronchial asthma or history of asthma, severe COPD, sinus bradycardia, 2nd/3rd-degree AV block, overt heart failure, cardiogenic shock.',
    majorInteractions:
      'Systemic beta-blockers (additive bradycardia/hypotension), verapamil/diltiazem (AV nodal block), CYP2D6 inhibitors (fluoxetine/quinidine raise systemic timolol).',
    monitoring: 'IOP, baseline & periodic heart rate, blood pressure, respiratory wheezing.',
  },
  {
    id: 'oxytocin',
    genericName: 'Oxytocin',
    brandNames: 'Pitocin',
    drugClass: 'Uterotonic Neurohypophyseal Peptide Hormone',
    chemicalClass: 'Cyclic nonapeptide (disulfide-bridged hormone)',
    specialty: 'reproductive_sensory',
    dosageForm: 'iv_vial',
    molecularTarget: 'Myometrial Oxytocin Receptors (Gq -> IP3 / Ca2+ Release)',
    mechanism:
      'Stimulates Gq-coupled oxytocin receptors on uterine smooth muscle (which surge in late gestation), elevating intracellular Ca2+ to produce rhythmic fundal contractions and compress spiral uterine arteries post-delivery.',
    pharmacokinetics: {
      bioavailability: '100% IV (immediate onset); IM onset 3–5 minutes; inactive orally',
      halfLife: '1–6 minutes (ultra-short IV clearance)',
      volumeOfDistribution: 'Extracellular fluid (~12–15 L)',
      metabolism: 'Rapidly cleaved by placental/plasma oxytocinase and hepatic/renal peptidases',
      excretion: 'Minimal renal (< 1% intact)',
      proteinBinding: '30%',
    },
    renalAndHepaticDosing:
      'High-alert titrated IV infusion via dedicated smart pump (e.g., 1–2 mU/min up to 20 mU/min for labor; 10–40 units in 1 L crystalloid or 10 units IM immediately post-delivery for PPH).',
    clinicalPearls:
      'First-line uterotonic both to PREVENT and TREAT Postpartum Hemorrhage (PPH) from uterine atony! Never give as a rapid undiluted IV push (causes sudden severe hypotension and tachycardia).',
    patientCounseling:
      'Hospital obstetrics monitoring—notify care team immediately if intense, non-relaxing contractions or severe headache occur.',
    contraindications:
      'Labor induction: cephalopelvic disproportion, fetal malpresentation, placenta previa, non-reassuring fetal distress, prior classical cesarean scar.',
    majorInteractions:
      'Vasopressors (severe postpartum hypertension), prolonged high-dose infusion in hypotonic D5W (ADH cross-reactivity -> acute hyponatremia / water intoxication!).',
    monitoring: 'Continuous external fetal heart rate & tocodynamometer (tachysystole > 5 contractions/10 min), maternal BP, fundal tone, quantitative blood loss, serum Na+ if prolonged.',
  },
  {
    id: 'magnesium_sulfate',
    genericName: 'Magnesium Sulfate (Obstetric)',
    brandNames: 'MgSO4 IV',
    drugClass: 'Obstetric Anticonvulsant & Neuroprotective Electrolyte',
    chemicalClass: 'Inorganic divalent cation sulfate salt',
    specialty: 'reproductive_sensory',
    dosageForm: 'iv_vial',
    molecularTarget: 'NMDA Glutamate Receptors, Cerebral Calcium Channels & NMJ Ach Release',
    mechanism:
      'Antagonizes central NMDA receptors, blocks presynaptic calcium influx at the neuromuscular junction (reducing acetylcholine release), and relaxes cerebral vasospasm to prevent eclamptic seizures.',
    pharmacokinetics: {
      bioavailability: '100% IV (immediate onset)',
      halfLife: '3–4 hours (prolongs sharply in oliguria/renal impairment)',
      volumeOfDistribution: '0.2–0.5 L/kg (crosses placenta freely)',
      metabolism: 'Not metabolized',
      excretion: '100% renal glomerular filtration',
      proteinBinding: '30% albumin-bound',
    },
    renalAndHepaticDosing:
      '100% renally cleared! Loading 4–6 g IV over 20–30 min, then maintenance 1–2 g/hr IV; HALVE or HOLD maintenance infusion if SCr > 1.2 mg/dL or urine output < 30 mL/hr!',
    clinicalPearls:
      'DRUG OF CHOICE for seizure prophylaxis in preeclampsia with severe features and acute eclamptic seizures (superior to phenytoin/diazepam). Track deep tendon reflexes (DTRs): loss of patellar reflex (~8–10 mEq/L) precedes respiratory paralysis (~12–15 mEq/L)!',
    patientCounseling:
      'Expect temporary warm flushing, mild nausea, or lethargy during the initial IV loading infusion.',
    contraindications:
      'Myasthenia gravis (precipitates myasthenic crisis), severe heart block / myocardial damage, untreated anuria.',
    majorInteractions:
      'Nifedipine/CCBs (additive hypotension & neuromuscular blockade), neuromuscular blockers (profound prolonged paralysis), aminoglycosides.',
    monitoring: 'Patellar DTRs hourly, respiratory rate (>= 12–16/min), urine output (>= 30 mL/hr), serum Mg2+ (target 4–7 mEq/L or 4.8–8.4 mg/dL).',
    antidoteOrReversal: 'Calcium gluconate 1 g (10 mL of 10%) IV push slowly over 3 minutes at bedside!',
  },
  {
    id: 'medroxyprogesterone',
    genericName: 'Medroxyprogesterone Acetate (DMPA)',
    brandNames: 'Depo-Provera, Depo-SubQ Provera 104',
    drugClass: 'Long-Acting Injectable Progestin Contraceptive',
    chemicalClass: '17-alpha-acetoxyprogesterone pregnane derivative',
    specialty: 'reproductive_sensory',
    dosageForm: 'iv_vial',
    molecularTarget: 'Hypothalamic/Pituitary Progesterone Receptors (GnRH/LH Surge Suppression)',
    mechanism:
      'Suppresses mid-cycle LH surge to prevent ovulation, thickens cervical mucus to block sperm entry, and thins the endometrium while lowering circulating endogenous estradiol.',
    pharmacokinetics: {
      bioavailability: 'Depot IM/SC slow microcrystalline release maintaining contraceptive levels >= 13 weeks',
      halfLife: '~50 days (IM depot); ~40 days (SC depot)',
      volumeOfDistribution: '20 L',
      metabolism: 'Hepatic CYP3A4 hydroxylation & conjugation',
      excretion: 'Primarily fecal/biliary & renal conjugates',
      proteinBinding: '90% albumin',
    },
    renalAndHepaticDosing:
      'No renal adjustment needed; contraindicated in severe active liver disease. Dose strictly every 12–13 weeks (150 mg IM or 104 mg SC); repeat pregnancy test if > 15 weeks since last injection.',
    clinicalPearls:
      'Safe progestin-only contraceptive option for patients with estrogen contraindications (migraine with aura, VTE history, hypertension, smoker >= 35 yrs)—and unlike oral contraceptives, DMPA is NOT diminished by enzyme-inducing AEDs! Boxed warning: reversible loss of Bone Mineral Density (limit > 2 years unless alternatives inadequate).',
    patientCounseling:
      'Expect irregular spotting early transitioning to amenorrhea; ensure adequate calcium + vitamin D and weight-bearing exercise; return to fertility may lag 9–18 months after stopping.',
    contraindications:
      'Known or suspected pregnancy, unexplained vaginal bleeding, current/history of breast cancer, severe liver disease, active thromboembolic disease.',
    majorInteractions:
      'Aminoglutethimide (reduces DMPA levels); notably maintains contraceptive efficacy even with rifampin or carbamazepine unlike combined pills.',
    monitoring: 'Injection window calendar (q3 months), weight/mood, menstrual bleeding pattern, bone health counseling if >= 2 years.',
  },
];
