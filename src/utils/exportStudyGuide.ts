import { CLINICAL_CASES } from '../data/cases';
import { DRUG_MAP, DRUG_MONOGRAPHS } from '../data/drugs';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  CaseOutcome,
  ClinicalCase,
  CustomStudyDeck,
  DrugMonograph,
  GameMode,
  PlayerProgress,
  SolvedOutcomeRecord,
} from '../types/pharma';

export type ExportFormat = 'markdown' | 'text' | 'csv_anki';

const CASE_BY_ID: Record<string, ClinicalCase> = Object.fromEntries(
  CLINICAL_CASES.map((c) => [c.id, c])
);

const MODE_LABELS: Record<GameMode, string> = {
  shift: 'Clinical Shift',
  daily: 'Daily Challenge',
  zen: 'Study Zen',
  quick_review: 'Quick Review (MOA Drill)',
  due_review: 'Due Today (Spaced Repetition)',
  timed_exam: 'NAPLEX / OSCE Timed Exam',
  custom_study: 'AI Custom Study Cases',
};

export interface ExportStudyDataInput {
  progress: PlayerProgress;
  sessionOutcomes?: CaseOutcome[];
  sessionGameMode?: GameMode;
  customDecks?: CustomStudyDeck[];
  customDrugMap?: Record<string, DrugMonograph>;
  customCaseMap?: Record<string, ClinicalCase>;
  format: ExportFormat;
}

function formatShortDate(iso?: string): string {
  if (!iso) return 'Current Session';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function escapeCsvCell(value: string): string {
  const cleaned = value.replace(/\r?\n/g, '<br>');
  if (/[",]/.test(cleaned)) {
    return `"${cleaned.replace(/"/g, '""')}"`;
  }
  return cleaned;
}

export function buildAnkiCsvExport({
  progress,
  sessionOutcomes,
  customDecks = [],
  customDrugMap = {},
  customCaseMap = {},
}: Omit<ExportStudyDataInput, 'format'>): string {
  const allDrugMap: Record<string, DrugMonograph> = {
    ...DRUG_MAP,
    ...customDrugMap,
  };
  const allCaseMap: Record<string, ClinicalCase> = {
    ...CASE_BY_ID,
    ...customCaseMap,
  };

  const rows: [string, string, string][] = [['Front', 'Back', 'Tags']];
  const seenFronts = new Set<string>();

  const pushCard = (front: string, back: string, tags: string) => {
    const key = front.trim().toLowerCase();
    if (!key || seenFronts.has(key)) return;
    seenFronts.add(key);
    rows.push([front.trim(), back.trim(), tags.trim()]);
  };

  // 1. Bookmarked Cases
  for (const caseId of progress.bookmarkedCaseIds ?? []) {
    const c = allCaseMap[caseId];
    if (!c) continue;
    const targetDrug = allDrugMap[c.correctDrugId];
    const labsLine = c.labs.map((l) => `${l.label}: ${l.value}`).join(' | ');
    const front = `${c.title} (${c.patientLine})\n${c.presentation}\nLabs: ${labsLine}\nQuestion: ${c.promptQuestion}`;
    const back = targetDrug
      ? `Optimal Therapy: ${targetDrug.genericName} (${targetDrug.brandNames}) — ${targetDrug.drugClass}\nTarget & Mechanism: ${targetDrug.molecularTarget}. ${targetDrug.mechanism}\nClinical Pearl: ${c.clinicalPearl}`
      : `Clinical Pearl: ${c.clinicalPearl}`;
    pushCard(front, back, `apotheca::${c.specialty} bookmarked`);
  }

  // 2. Missed / Session Outcomes
  const outcomes =
    sessionOutcomes && sessionOutcomes.length > 0
      ? sessionOutcomes
      : progress.solvedOutcomes ?? [];

  for (const outcome of outcomes) {
    const c = allCaseMap[outcome.caseId];
    const targetDrug = allDrugMap[outcome.correctDrugId];
    const chosenDrug = allDrugMap[outcome.chosenDrugId];
    if (!targetDrug) continue;
    const isAi = Boolean(c?.isCustomStudy);
    const integrityTag = isAi
      ? '[AI-Generated Study Question — Verify dosing & clinical guidelines against primary references] '
      : '';
    const front = c
      ? `${integrityTag}${c.title}: ${c.promptQuestion} (${c.targetCue})`
      : `${integrityTag}${outcome.caseTitle} — Identify optimal therapy`;
    const back = `${targetDrug.genericName} (${targetDrug.drugClass})\nMOA: ${targetDrug.mechanism}\n${
      !outcome.isCorrect && chosenDrug
        ? `Previous Distractor Chosen: ${chosenDrug.genericName}\n`
        : ''
    }Pearl: ${c?.clinicalPearl ?? targetDrug.clinicalPearls}${
      isAi
        ? `\nSource Citation: ${c?.sourceDocName ?? 'Uploaded Study File'}${
            c?.citationNote ? ` (${c.citationNote})` : ''
          } — Verify against primary references.`
        : ''
    }`;
    const tagList = [
      `apotheca::${outcome.specialty}`,
      outcome.isCorrect ? 'solved' : 'missed_review',
      isAi ? 'ai_generated verify_primary_guidelines' : '',
    ]
      .filter(Boolean)
      .join(' ');
    pushCard(front, back, tagList);
  }

  // 3. AI-Generated Custom Study Cases from Uploaded Materials
  for (const deck of customDecks) {
    const deckDrugMap = Object.fromEntries(deck.drugs.map((d) => [d.id, d]));
    for (const c of deck.cases) {
      const targetDrug = deckDrugMap[c.correctDrugId] ?? allDrugMap[c.correctDrugId];
      const front = `[AI-Generated Study Question · Source: ${deck.docName}] ${c.title}\n${c.presentation}\n${c.promptQuestion}`;
      const back = `${
        targetDrug
          ? `Answer: ${targetDrug.genericName} (${targetDrug.drugClass})\nMechanism: ${targetDrug.mechanism}\n`
          : ''
      }Pearl: ${c.clinicalPearl}\n[Integrity Check: AI-generated from "${deck.docName}"${
        c.citationNote ? ` — ${c.citationNote}` : ''
      }. Verify clinical parameters against primary guidelines.]`;
      pushCard(
        front,
        back,
        `apotheca::ai_generated verify_primary_guidelines ${c.specialty}`
      );
    }
  }

  // 4. Unmastered Formulary Drug Flashcards (top 15 for immediate Anki prep)
  const masteredSet = new Set(progress.masteredDrugIds);
  const unmastered = DRUG_MONOGRAPHS.filter((d) => !masteredSet.has(d.id)).slice(
    0,
    15
  );
  for (const d of unmastered) {
    const front = `Drug Card: What is the class, target, and key pearl for ${d.genericName} (${d.brandNames})?`;
    const back = `Class: ${d.drugClass}\nTarget: ${d.molecularTarget}\nMOA: ${d.mechanism}\nRenal/Hepatic: ${d.renalAndHepaticDosing}\nPearl: ${d.clinicalPearls}`;
    pushCard(front, back, `apotheca::${d.specialty} unmastered_formulary`);
  }

  return rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\r\n');
}

export function buildStudyExportContent({
  progress,
  sessionOutcomes,
  sessionGameMode,
  customDecks = [],
  customDrugMap = {},
  customCaseMap = {},
  format,
}: ExportStudyDataInput): string {
  if (format === 'csv_anki') {
    return buildAnkiCsvExport({
      progress,
      sessionOutcomes,
      customDecks,
      customDrugMap,
      customCaseMap,
    });
  }

  const allDrugMap: Record<string, DrugMonograph> = {
    ...DRUG_MAP,
    ...customDrugMap,
  };
  const allCaseMap: Record<string, ClinicalCase> = {
    ...CASE_BY_ID,
    ...customCaseMap,
  };

  const isMd = format === 'markdown';
  const lines: string[] = [];
  const exportedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const bookmarkedCases = (progress.bookmarkedCaseIds ?? [])
    .map((id) => allCaseMap[id])
    .filter((c): c is ClinicalCase => Boolean(c));

  const outcomeRecords: SolvedOutcomeRecord[] =
    sessionOutcomes && sessionOutcomes.length > 0
      ? sessionOutcomes.map((o) => ({
          ...o,
          gameMode: sessionGameMode ?? 'shift',
          solvedAt: new Date().toISOString(),
        }))
      : progress.solvedOutcomes ?? [];

  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    progress.unlockedAchievements.includes(a.id)
  );

  if (isMd) {
    lines.push('# Apotheca — Clinical Pharmacology Study Guide');
    lines.push(`*Exported ${exportedAt}*`);
    lines.push('');
    lines.push('## Progress Overview');
    lines.push(`- **Monographs Mastered:** ${progress.masteredDrugIds.length}`);
    lines.push(`- **Total Cases Solved:** ${progress.totalCasesSolved} (${progress.totalCasesAttempted} attempted)`);
    lines.push(`- **Daily Study Streak:** ${progress.studyStreakDays ?? 0} day(s)`);
    lines.push(`- **Best Shift Score:** ${progress.bestShiftScore.toLocaleString()} pts`);
    lines.push(`- **Best Streak:** ${progress.bestStreak}x`);
    lines.push(
      `- **Achievements Unlocked:** ${
        unlockedAchievements.length > 0
          ? unlockedAchievements.map((a) => a.title).join(', ')
          : 'None yet'
      }`
    );
    lines.push('');
  } else {
    lines.push('APOTHECA — CLINICAL PHARMACOLOGY STUDY GUIDE');
    lines.push(`Exported: ${exportedAt}`);
    lines.push('='.repeat(64));
    lines.push('');
    lines.push('PROGRESS OVERVIEW');
    lines.push(`- Monographs Mastered: ${progress.masteredDrugIds.length}`);
    lines.push(`- Total Cases Solved: ${progress.totalCasesSolved} (${progress.totalCasesAttempted} attempted)`);
    lines.push(`- Daily Study Streak: ${progress.studyStreakDays ?? 0} day(s)`);
    lines.push(`- Best Shift Score: ${progress.bestShiftScore.toLocaleString()} pts`);
    lines.push(`- Best Streak: ${progress.bestStreak}x`);
    lines.push(
      `- Achievements Unlocked: ${
        unlockedAchievements.length > 0
          ? unlockedAchievements.map((a) => a.title).join(', ')
          : 'None yet'
      }`
    );
    lines.push('');
  }

  // Bookmarked Cases Section
  if (isMd) {
    lines.push(`## Bookmarked Clinical Cases (${bookmarkedCases.length})`);
    lines.push('');
  } else {
    lines.push(`BOOKMARKED CLINICAL CASES (${bookmarkedCases.length})`);
    lines.push('-'.repeat(64));
    lines.push('');
  }

  if (bookmarkedCases.length === 0) {
    lines.push(
      isMd
        ? '_No clinical cases are currently bookmarked._'
        : 'No clinical cases are currently bookmarked.'
    );
    lines.push('');
  } else {
    bookmarkedCases.forEach((c, idx) => {
      const drug = allDrugMap[c.correctDrugId];
      const labsText = c.labs.map((l) => `${l.label}: ${l.value}`).join(' | ');
      if (isMd) {
        lines.push(`### ${idx + 1}. ${c.title}`);
        lines.push(
          `**Track:** ${c.specialty} · **Tier:** ${c.difficulty} · **Patient:** ${c.patientLine}`
        );
        lines.push('');
        lines.push(`- **Presentation:** ${c.presentation}`);
        lines.push(`- **Labs & Vitals:** ${labsText}`);
        lines.push(`- **Active Regimen:** ${c.activeMeds.join(', ')}`);
        lines.push(`- **Clinical Question:** ${c.targetCue} — ${c.promptQuestion}`);
        if (drug) {
          lines.push(
            `- **Optimal Therapy:** ${drug.genericName} (${drug.brandNames}) — *${drug.drugClass}*`
          );
          lines.push(`- **Target & Mechanism:** ${drug.molecularTarget}. ${drug.mechanism}`);
          lines.push(
            `- **PK Summary:** F: ${drug.pharmacokinetics.bioavailability} | t1/2: ${drug.pharmacokinetics.halfLife} | Vd: ${drug.pharmacokinetics.volumeOfDistribution} | Metabolism: ${drug.pharmacokinetics.metabolism}`
          );
          lines.push(`- **Patient Counseling:** ${drug.patientCounseling}`);
        }
        lines.push(`- **Clinical Pearl:** ${c.clinicalPearl}`);
        lines.push('');
      } else {
        lines.push(`${idx + 1}. ${c.title}`);
        lines.push(`   Track: ${c.specialty} | Tier: ${c.difficulty} | Patient: ${c.patientLine}`);
        lines.push(`   Presentation: ${c.presentation}`);
        lines.push(`   Labs & Vitals: ${labsText}`);
        lines.push(`   Active Regimen: ${c.activeMeds.join(', ')}`);
        lines.push(`   Clinical Question: ${c.targetCue} -- ${c.promptQuestion}`);
        if (drug) {
          lines.push(
            `   Optimal Therapy: ${drug.genericName} (${drug.brandNames}) - ${drug.drugClass}`
          );
          lines.push(`   Target & Mechanism: ${drug.molecularTarget}. ${drug.mechanism}`);
          lines.push(
            `   PK Summary: F: ${drug.pharmacokinetics.bioavailability} | t1/2: ${drug.pharmacokinetics.halfLife} | Metabolism: ${drug.pharmacokinetics.metabolism}`
          );
          lines.push(`   Patient Counseling: ${drug.patientCounseling}`);
        }
        lines.push(`   Clinical Pearl: ${c.clinicalPearl}`);
        lines.push('');
      }
    });
  }

  // Solved Case Outcomes Section
  const sectionTitle =
    sessionOutcomes && sessionOutcomes.length > 0
      ? `Round Outcomes (${outcomeRecords.length})`
      : `Solved & Reviewed Case Outcomes (${outcomeRecords.length})`;

  if (isMd) {
    lines.push(`## ${sectionTitle}`);
    lines.push('');
  } else {
    lines.push(sectionTitle.toUpperCase());
    lines.push('-'.repeat(64));
    lines.push('');
  }

  if (outcomeRecords.length === 0) {
    lines.push(
      isMd
        ? '_No completed case outcomes recorded yet._'
        : 'No completed case outcomes recorded yet.'
    );
    lines.push('');
  } else {
    outcomeRecords.forEach((item, idx) => {
      const targetDrug = allDrugMap[item.correctDrugId];
      const chosenDrug = allDrugMap[item.chosenDrugId];
      const matchedCase = allCaseMap[item.caseId];
      const statusLabel = item.isCorrect ? 'OPTIMAL' : 'MISSED / REVIEW';
      const modeLabel = MODE_LABELS[item.gameMode] ?? item.gameMode;
      const pearl = matchedCase?.clinicalPearl ?? targetDrug?.clinicalPearls ?? '';
      const isAi = Boolean(matchedCase?.isCustomStudy);

      if (isMd) {
        lines.push(`### ${idx + 1}. ${item.caseTitle} [${statusLabel}]`);
        lines.push(
          `**Mode:** ${modeLabel} · **Points:** +${item.pointsEarned} · **Recorded:** ${formatShortDate(
            item.solvedAt
          )}`
        );
        if (isAi) {
          lines.push(
            `> **[AI-Generated Study Question]** Generated from *${
              matchedCase?.sourceDocName ?? 'uploaded notes'
            }*${
              matchedCase?.citationNote ? ` (${matchedCase.citationNote})` : ''
            }. Verify clinical dosing and guidelines against primary references.`
          );
        }
        lines.push('');
        lines.push(
          `- **Selected Agent:** ${chosenDrug?.genericName ?? item.chosenDrugId}`
        );
        lines.push(
          `- **Optimal Agent:** ${targetDrug?.genericName ?? item.correctDrugId}${
            targetDrug ? ` (${targetDrug.drugClass})` : ''
          }`
        );
        if (targetDrug) {
          lines.push(`- **Molecular Target:** ${targetDrug.molecularTarget}`);
        }
        if (pearl) {
          lines.push(`- **Clinical Pearl:** ${pearl}`);
        }
        lines.push('');
      } else {
        lines.push(`${idx + 1}. ${item.caseTitle} [${statusLabel}]`);
        lines.push(
          `   Mode: ${modeLabel} | Points: +${item.pointsEarned} | Recorded: ${formatShortDate(
            item.solvedAt
          )}`
        );
        if (isAi) {
          lines.push(
            `   [AI-GENERATED STUDY QUESTION — Source: ${
              matchedCase?.sourceDocName ?? 'uploaded notes'
            }. Verify clinical details against primary guidelines.]`
          );
        }
        lines.push(
          `   Selected Agent: ${chosenDrug?.genericName ?? item.chosenDrugId}`
        );
        lines.push(
          `   Optimal Agent: ${targetDrug?.genericName ?? item.correctDrugId}${
            targetDrug ? ` (${targetDrug.drugClass})` : ''
          }`
        );
        if (targetDrug) {
          lines.push(`   Molecular Target: ${targetDrug.molecularTarget}`);
        }
        if (pearl) {
          lines.push(`   Clinical Pearl: ${pearl}`);
        }
        lines.push('');
      }
    });
  }

  // AI-Generated Custom Study Cases Section (with Academic Integrity Notice)
  if (customDecks.length > 0) {
    if (isMd) {
      lines.push(`## AI-Generated Practice Cases from Uploaded Materials`);
      lines.push(
        `> **Academic Integrity & Clinical Verification Notice:** The questions below were generated by AI from your uploaded study files. Always verify drug doses, renal cutoffs, and therapeutic guidelines against primary clinical references (e.g., Lexicomp, UpToDate, FDA labeling, or course syllabi).`
      );
      lines.push('');
      customDecks.forEach((deck) => {
        const deckDrugMap = Object.fromEntries(deck.drugs.map((d) => [d.id, d]));
        lines.push(`### Source File: ${deck.docName} (${deck.mode === 'vignettes' ? 'Clinical Vignettes' : 'MOA Drills'})`);
        lines.push('');
        deck.cases.forEach((c, idx) => {
          const targetDrug = deckDrugMap[c.correctDrugId] ?? allDrugMap[c.correctDrugId];
          lines.push(`#### ${idx + 1}. [AI-Generated] ${c.title}`);
          lines.push(`- **Citation:** ${c.citationNote || `Derived from ${deck.docName}`}`);
          lines.push(`- **Vignette:** ${c.presentation}`);
          lines.push(`- **Question:** ${c.promptQuestion}`);
          if (targetDrug) {
            lines.push(`- **Answer:** ${targetDrug.genericName} — *${targetDrug.drugClass}*`);
          }
          lines.push(`- **Pearl:** ${c.clinicalPearl}`);
          lines.push('');
        });
      });
    } else {
      lines.push('AI-GENERATED PRACTICE CASES (VERIFY AGAINST PRIMARY GUIDELINES)');
      lines.push('-'.repeat(64));
      lines.push(
        'ACADEMIC INTEGRITY NOTICE: Verify all AI-generated doses and clinical claims against primary clinical references.'
      );
      lines.push('');
      customDecks.forEach((deck) => {
        const deckDrugMap = Object.fromEntries(deck.drugs.map((d) => [d.id, d]));
        lines.push(`Source File: ${deck.docName}`);
        deck.cases.forEach((c, idx) => {
          const targetDrug = deckDrugMap[c.correctDrugId] ?? allDrugMap[c.correctDrugId];
          lines.push(`  ${idx + 1}. [AI-Generated] ${c.title}`);
          lines.push(`     Citation: ${c.citationNote || `Derived from ${deck.docName}`}`);
          lines.push(`     Question: ${c.promptQuestion}`);
          if (targetDrug) {
            lines.push(`     Answer: ${targetDrug.genericName} (${targetDrug.drugClass})`);
          }
          lines.push(`     Pearl: ${c.clinicalPearl}`);
        });
        lines.push('');
      });
    }
  }

  // Mastered Drugs Reference List
  const masteredDrugs = progress.masteredDrugIds
    .map((id) => DRUG_MAP[id])
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  if (masteredDrugs.length > 0) {
    if (isMd) {
      lines.push(`## Mastered Formulary Quick-Reference (${masteredDrugs.length})`);
      lines.push('');
      masteredDrugs.forEach((d) => {
        lines.push(
          `- **${d.genericName}** (${d.brandNames}) — ${d.drugClass} · *Target:* ${d.molecularTarget}`
        );
      });
      lines.push('');
    } else {
      lines.push(`MASTERED FORMULARY QUICK-REFERENCE (${masteredDrugs.length})`);
      lines.push('-'.repeat(64));
      masteredDrugs.forEach((d) => {
        lines.push(
          `- ${d.genericName} (${d.brandNames}) -- ${d.drugClass} | Target: ${d.molecularTarget}`
        );
      });
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function triggerFileDownload(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
