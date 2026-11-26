import {
  ClinicalCase,
  DeckFilter,
  DosageForm,
  DrugMonograph,
} from '../types/pharma';
import { SPECIALTY_META } from '../data/drugs';

export const QUICK_REVIEW_COUNT = 10;

const DOSAGE_FORM_LABEL: Record<DosageForm, string> = {
  tablet: 'Oral Tablet',
  capsule: 'Oral Capsule',
  iv_vial: 'IV Injection / Vial',
  inhaler: 'Inhalation / Nasal Spray',
  pen: 'Subcutaneous Pen / Auto-Injector',
};

const SAFE_BIOLOGICAL_WORDS = new Set([
  'insulin',
  'glucagon',
  'sodium',
  'sulfate',
  'potassium',
  'acid',
]);

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function redactDrugNameForMoaQuiz(
  text: string,
  drug: DrugMonograph
): string {
  const tokens = new Set<string>();
  const rawParts = drug.genericName
    .split(/[\s\-/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && !SAFE_BIOLOGICAL_WORDS.has(t.toLowerCase()));

  rawParts.forEach((p) => tokens.add(p));
  if (drug.id === 'sacubitril_valsartan') {
    tokens.add('Sacubitrilate');
  }
  if (drug.id === 'hydralazine_isdn') {
    tokens.add('isosorbide dinitrate');
  }

  let output = text;
  const sortedTokens = Array.from(tokens).sort((a, b) => b.length - a.length);
  for (const token of sortedTokens) {
    const regex = new RegExp(`\\b${escapeRegExp(token)}\\b`, 'gi');
    output = output.replace(regex, 'this agent');
  }

  // Clean awkward capitalization or doubled replacements
  output = output
    .replace(/\bthis agent’s\b/g, 'this agent’s')
    .replace(/\bthis agent's\b/g, "this agent's")
    .replace(/(?:^|[.;]\s+)this agent\b/g, (match) =>
      match.replace('this agent', 'This agent')
    );

  return output;
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shortenMetric(value: string): string {
  const idx = value.indexOf('(');
  const base = idx > 8 ? value.slice(0, idx).trim() : value;
  return base.length > 36 ? `${base.slice(0, 34).trim()}…` : base;
}

export function buildQuickReviewDeck(
  allDrugs: readonly DrugMonograph[],
  masteredDrugIds: readonly string[],
  specialtyFilter: DeckFilter = 'all'
): ClinicalCase[] {
  const masteredSet = new Set(masteredDrugIds);
  const unmasteredAll = allDrugs.filter((d) => !masteredSet.has(d.id));
  const masteredAll = allDrugs.filter((d) => masteredSet.has(d.id));

  const primaryUnmastered = shuffle(
    specialtyFilter === 'all'
      ? unmasteredAll
      : unmasteredAll.filter((d) => d.specialty === specialtyFilter)
  );
  const secondaryUnmastered = shuffle(
    specialtyFilter === 'all'
      ? []
      : unmasteredAll.filter((d) => d.specialty !== specialtyFilter)
  );
  const primaryMasteredFallback = shuffle(
    specialtyFilter === 'all'
      ? masteredAll
      : masteredAll.filter((d) => d.specialty === specialtyFilter)
  );
  const secondaryMasteredFallback = shuffle(
    specialtyFilter === 'all'
      ? []
      : masteredAll.filter((d) => d.specialty !== specialtyFilter)
  );

  const selectedDrugs = [
    ...primaryUnmastered,
    ...secondaryUnmastered,
    ...primaryMasteredFallback,
    ...secondaryMasteredFallback,
  ].slice(0, Math.min(QUICK_REVIEW_COUNT, allDrugs.length));

  return selectedDrugs.map((drug) => {
    const sameSpecialtyDistractors = shuffle(
      allDrugs.filter((d) => d.id !== drug.id && d.specialty === drug.specialty)
    );
    const otherDistractors = shuffle(
      allDrugs.filter((d) => d.id !== drug.id && d.specialty !== drug.specialty)
    );
    const distractors = [...sameSpecialtyDistractors, ...otherDistractors].slice(
      0,
      3
    );

    const cardIds = shuffle([
      drug.id,
      ...distractors.map((d) => d.id),
    ]) as [string, string, string, string];

    const distractorRationales: Record<string, string> = {};
    for (const d of distractors) {
      distractorRationales[d.id] =
        `${d.genericName} is a ${d.drugClass} acting on ${d.molecularTarget}, whereas this mechanism targets ${drug.molecularTarget}.`;
    }

    const isUnmastered = !masteredSet.has(drug.id);

    return {
      id: `qr_${drug.id}`,
      specialty: drug.specialty,
      mechanic: 'receptor_lock',
      difficulty: 'Clinical',
      title: `Mechanism Drill · ${SPECIALTY_META[drug.specialty].shortLabel}`,
      patientLine: isUnmastered
        ? 'Unmastered Formulary Card · Rapid MOA Check'
        : 'Mastery Refresh · Rapid MOA Check',
      presentation: redactDrugNameForMoaQuiz(drug.mechanism, drug),
      labs: [
        {
          label: 'Bioavailability (F)',
          value: shortenMetric(drug.pharmacokinetics.bioavailability),
          flag: 'normal',
        },
        {
          label: 'Half-Life (t½)',
          value: shortenMetric(drug.pharmacokinetics.halfLife),
          flag: 'normal',
        },
        {
          label: 'Elimination',
          value: shortenMetric(drug.pharmacokinetics.excretion),
          flag: 'normal',
        },
      ],
      activeMeds: [
        `${drug.chemicalClass}`,
        `Formulation: ${DOSAGE_FORM_LABEL[drug.dosageForm]}`,
      ],
      targetCue: `Molecular Target: ${drug.molecularTarget}`,
      promptQuestion:
        'Identify the medication whose mechanism of action matches this profile.',
      cardIds,
      correctDrugId: drug.id,
      distractorRationales,
      clinicalPearl: drug.clinicalPearls,
      hints: [
        `Pharmacologic class: ${drug.drugClass}.`,
        `Metabolism profile: ${drug.pharmacokinetics.metabolism}.`,
        `Key monitoring parameter: ${drug.monitoring}`,
      ],
      isQuickReview: true,
    };
  });
}
