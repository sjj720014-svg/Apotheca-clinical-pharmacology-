import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import JSZip from 'jszip';
import multer from 'multer';
import {
  createPartFromUri,
  GoogleGenAI,
  ThinkingLevel,
  Type,
} from '@google/genai';

const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_VOICES = new Set(['Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir']);
const MAX_TTS_CHARS = 2400;
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_INLINE_TEXT_CHARS = 220_000;
const MAX_STORED_DOCS = 20;
const MAX_STORED_JOBS = 40;
const UPLOAD_DIR = path.resolve(os.tmpdir(), 'apotheca-study-uploads');

const BLOCKED_EXECUTABLE_EXTS = new Set([
  '.exe',
  '.dll',
  '.bat',
  '.cmd',
  '.sh',
  '.msi',
  '.app',
  '.dmg',
  '.so',
  '.dylib',
  '.com',
  '.scr',
  '.vbs',
  '.ps1',
  '.jar',
]);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

interface StoredTopic {
  id: string;
  title: string;
  summary: string;
  keyTerms: string[];
}

interface StoredStudyDoc {
  id: string;
  displayName: string;
  fileFormatLabel: string;
  sizeBytes: number;
  uploadedAt: string;
  geminiFileName?: string;
  geminiFileUri?: string;
  mimeType: string;
  inlineText?: string;
  overview: string;
  initialExplanation: string;
  topics: StoredTopic[];
  suggestedQuestions: string[];
}

interface PublicStudyDoc {
  id: string;
  displayName: string;
  fileFormatLabel: string;
  sizeBytes: number;
  uploadedAt: string;
  overview: string;
  initialExplanation: string;
  topics: StoredTopic[];
  suggestedQuestions: string[];
}

interface StudyUploadJob {
  jobId: string;
  status: 'preparing' | 'uploading_to_ai' | 'explaining' | 'ready' | 'error';
  stageLabel: string;
  doc?: PublicStudyDoc;
  error?: string;
  createdAt: number;
}

interface PreparedStudyAsset {
  uploadPath: string;
  mimeType: string;
  formatLabel: string;
  inlineText?: string;
  cleanupPaths: string[];
}

const studyDocStore = new Map<string, StoredStudyDoc>();
const studyJobStore = new Map<string, StudyUploadJob>();

function toPublicStudyDoc(doc: StoredStudyDoc): PublicStudyDoc {
  return {
    id: doc.id,
    displayName: doc.displayName,
    fileFormatLabel: doc.fileFormatLabel,
    sizeBytes: doc.sizeBytes,
    uploadedAt: doc.uploadedAt,
    overview: doc.overview,
    initialExplanation: doc.initialExplanation,
    topics: doc.topics,
    suggestedQuestions: doc.suggestedQuestions,
  };
}

function getConfiguredApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return key;
}

function getAiClient(apiVersion?: string): GoogleGenAI | null {
  const apiKey = getConfiguredApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractFriendlyErrorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : fallback;
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as {
        error?: { message?: string };
        message?: string;
      };
      if (parsed?.error?.message) return parsed.error.message;
      if (parsed?.message) return parsed.message;
    } catch {
      // ignore
    }
  }
  return trimmed || fallback;
}

function sanitizeDisplayName(originalName: string): string {
  const base = path.basename(originalName || 'study-material');
  const cleaned = base.replace(/[^\w.\- ()]/g, '_').trim();
  return cleaned.slice(0, 120) || 'study-material';
}

function isTempUploadPathSafe(targetPath: string): boolean {
  const resolved = path.resolve(targetPath);
  return resolved.startsWith(UPLOAD_DIR + path.sep);
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    });
}

function xmlToCleanText(xml: string): string {
  return decodeXmlEntities(
    xml
      .replace(/<\/(w:p|a:p|text:p|text:h|p|div|li|tr|h[1-6])>/gi, '\n')
      .replace(/<(w:br|br|text:line-break)[^>]*\/?>/gi, '\n')
      .replace(/<(w:tab|text:tab)[^>]*\/?>/gi, '\t')
      .replace(/<\/td>/gi, '\t')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function stripRtfToText(rtf: string): string {
  return rtf
    .replace(/\{\\\*(?:[^{}]|\{[^{}]*\})*\}/g, ' ')
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\line/g, '\n')
    .replace(/\\tab/g, '\t')
    .replace(/\\'([0-9a-fA-F]{2})/g, (_m, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/\\[a-zA-Z]+-?\d* ?/g, '')
    .replace(/[{}]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractReadableStringsFromBuffer(buf: Buffer): string {
  const chunks: string[] = [];
  const latin = buf.toString('latin1');
  const asciiRuns = latin.match(/[\x20-\x7E\t\r\n]{5,}/g) || [];
  for (const run of asciiRuns) {
    const cleaned = run.replace(/\s+/g, ' ').trim();
    if (cleaned.length >= 5 && /[a-zA-Z]{2,}/.test(cleaned)) {
      chunks.push(cleaned);
    }
  }
  const utf16 = buf.toString('utf16le');
  const wideRuns = utf16.match(/[\x20-\x7E\t\r\n]{6,}/g) || [];
  for (const run of wideRuns) {
    const cleaned = run.replace(/\s+/g, ' ').trim();
    if (cleaned.length >= 6 && /[a-zA-Z]{2,}/.test(cleaned)) {
      chunks.push(cleaned);
    }
  }
  const deduped = Array.from(new Set(chunks));
  return deduped.join('\n').slice(0, 1_500_000);
}

function isMostlyReadableText(sample: Buffer): boolean {
  if (sample.length === 0) return false;
  let controlCount = 0;
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i];
    if (b === 0) return false;
    if (b < 9 || (b > 13 && b < 32)) {
      controlCount++;
    }
  }
  return controlCount / sample.length < 0.05;
}

async function extractZipOfficeText(
  filePath: string,
  ext: string
): Promise<{ text: string; label: string }> {
  const fileBuffer = await fs.promises.readFile(filePath);
  const zip = await JSZip.loadAsync(fileBuffer);
  const names = Object.keys(zip.files);

  if (ext === '.docx' || names.includes('word/document.xml')) {
    const parts: string[] = [];
    const targets = [
      'word/document.xml',
      ...names.filter((n) => /^word\/(header|footer|footnotes)\d*\.xml$/.test(n)),
    ];
    for (const entryName of targets) {
      const file = zip.file(entryName);
      if (!file) continue;
      const xml = await file.async('string');
      const txt = xmlToCleanText(xml);
      if (txt) parts.push(txt);
    }
    return { text: parts.join('\n\n'), label: 'Word Document (.docx)' };
  }

  if (ext === '.pptx' || names.some((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const slideNames = names
      .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
      .sort((a, b) => {
        const na = Number(a.match(/slide(\d+)\.xml/)?.[1] || 0);
        const nb = Number(b.match(/slide(\d+)\.xml/)?.[1] || 0);
        return na - nb;
      });
    const parts: string[] = [];
    for (const slideName of slideNames) {
      const num = slideName.match(/slide(\d+)\.xml/)?.[1] || '';
      const slideFile = zip.file(slideName);
      if (!slideFile) continue;
      const slideText = xmlToCleanText(await slideFile.async('string'));
      const notesFile = zip.file(`ppt/notesSlides/notesSlide${num}.xml`);
      const notesText = notesFile
        ? xmlToCleanText(await notesFile.async('string'))
        : '';
      if (slideText || notesText) {
        parts.push(
          `--- Slide ${num} ---\n${slideText}${
            notesText ? `\nSpeaker Notes: ${notesText}` : ''
          }`
        );
      }
    }
    return { text: parts.join('\n\n'), label: 'PowerPoint Presentation (.pptx)' };
  }

  if (ext === '.xlsx' || names.some((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))) {
    let sharedStrings: string[] = [];
    const ssFile = zip.file('xl/sharedStrings.xml');
    if (ssFile) {
      const ssXml = await ssFile.async('string');
      const siMatches = ssXml.match(/<si\b[\s\S]*?<\/si>/g) || [];
      sharedStrings = siMatches.map((si) => xmlToCleanText(si));
    }
    const sheetNames = names
      .filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
      .sort((a, b) => {
        const na = Number(a.match(/sheet(\d+)\.xml/)?.[1] || 0);
        const nb = Number(b.match(/sheet(\d+)\.xml/)?.[1] || 0);
        return na - nb;
      });

    const parts: string[] = [];
    for (const sheetName of sheetNames) {
      const num = sheetName.match(/sheet(\d+)\.xml/)?.[1] || '';
      const sheetFile = zip.file(sheetName);
      if (!sheetFile) continue;
      const sheetXml = await sheetFile.async('string');
      const rowMatches = sheetXml.match(/<row\b[\s\S]*?<\/row>/g) || [];
      const rowLines: string[] = [];
      for (const rowXml of rowMatches.slice(0, 2000)) {
        const cellMatches = rowXml.match(/<c\b[\s\S]*?<\/c>/g) || [];
        const cells: string[] = [];
        for (const cellXml of cellMatches) {
          const isShared = /\bt="s"/.test(cellXml);
          const vMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
          const inlineMatch = cellXml.match(/<is>([\s\S]*?)<\/is>/);
          if (inlineMatch) {
            cells.push(xmlToCleanText(inlineMatch[1]));
          } else if (vMatch) {
            const rawVal = vMatch[1].trim();
            if (isShared) {
              const idx = Number(rawVal);
              cells.push(sharedStrings[idx] ?? rawVal);
            } else {
              cells.push(rawVal);
            }
          }
        }
        const line = cells.filter(Boolean).join(' | ');
        if (line) rowLines.push(line);
      }
      if (rowLines.length > 0) {
        parts.push(`--- Sheet ${num} ---\n${rowLines.join('\n')}`);
      }
    }
    return { text: parts.join('\n\n'), label: 'Excel Spreadsheet (.xlsx)' };
  }

  if (names.includes('content.xml')) {
    const xml = await zip.file('content.xml')!.async('string');
    return { text: xmlToCleanText(xml), label: `OpenDocument (${ext || '.odt'})` };
  }

  const readableNames = names
    .filter((n) => /\.(xhtml|html|htm|txt|md|xml|csv)$/i.test(n) && !n.startsWith('META-INF/'))
    .sort();
  const genericParts: string[] = [];
  for (const name of readableNames.slice(0, 60)) {
    const file = zip.file(name);
    if (!file) continue;
    const content = await file.async('string');
    const clean = xmlToCleanText(content);
    if (clean) genericParts.push(clean);
  }
  return {
    text: genericParts.join('\n\n'),
    label: ext === '.epub' ? 'EPUB Book' : 'Document Archive',
  };
}

async function prepareStudyAsset(
  tempPath: string,
  safeDisplayName: string,
  reportedMimeType: string
): Promise<PreparedStudyAsset> {
  if (!isTempUploadPathSafe(tempPath)) {
    throw new Error('Invalid upload file path.');
  }

  const ext = path.extname(safeDisplayName).toLowerCase();
  const fh = await fs.promises.open(tempPath, 'r');
  const headerBuf = Buffer.alloc(4096);
  let bytesRead = 0;
  try {
    const res = await fh.read(headerBuf, 0, headerBuf.length, 0);
    bytesRead = res.bytesRead;
  } finally {
    await fh.close();
  }

  if (bytesRead === 0) {
    throw new Error('The uploaded file is empty.');
  }

  const head = headerBuf.subarray(0, bytesRead);
  const cleanupPaths: string[] = [tempPath];

  // 1. PDF
  if (ext === '.pdf' || head.subarray(0, 5).toString('utf8') === '%PDF-') {
    return {
      uploadPath: tempPath,
      mimeType: 'application/pdf',
      formatLabel: 'PDF Document',
      cleanupPaths,
    };
  }

  // 2. ZIP-based Office / EPUB / OpenDocument
  const isZipMagic =
    head.length >= 4 &&
    head[0] === 0x50 &&
    head[1] === 0x4b &&
    head[2] === 0x03 &&
    head[3] === 0x04;
  const officeZipExts = new Set([
    '.docx',
    '.pptx',
    '.xlsx',
    '.odt',
    '.odp',
    '.ods',
    '.epub',
  ]);
  if (officeZipExts.has(ext) || isZipMagic) {
    const { text, label } = await extractZipOfficeText(tempPath, ext);
    if (!text.trim()) {
      throw new Error(
        `No readable text was found inside ${safeDisplayName}. If the slides or document only contain scanned images, export it as a PDF or upload screenshots directly.`
      );
    }
    if (text.length <= MAX_INLINE_TEXT_CHARS) {
      return {
        uploadPath: tempPath,
        mimeType: 'text/plain',
        formatLabel: label,
        inlineText: text,
        cleanupPaths,
      };
    }
    const extractedPath = path.resolve(
      UPLOAD_DIR,
      `${crypto.randomUUID()}-extracted.txt`
    );
    await fs.promises.writeFile(extractedPath, text, 'utf8');
    cleanupPaths.push(extractedPath);
    return {
      uploadPath: extractedPath,
      mimeType: 'text/plain',
      formatLabel: label,
      cleanupPaths,
    };
  }

  // 3. Images
  const imageExtMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.bmp': 'image/bmp',
  };
  const isPng =
    head.length >= 4 &&
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47;
  const isJpeg =
    head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const isGif =
    head.length >= 4 && head.subarray(0, 4).toString('ascii') === 'GIF8';
  const isWebp =
    head.length >= 12 &&
    head.subarray(0, 4).toString('ascii') === 'RIFF' &&
    head.subarray(8, 12).toString('ascii') === 'WEBP';

  if (
    imageExtMap[ext] ||
    reportedMimeType.startsWith('image/') ||
    isPng ||
    isJpeg ||
    isGif ||
    isWebp
  ) {
    const mime =
      imageExtMap[ext] ||
      (isPng
        ? 'image/png'
        : isJpeg
        ? 'image/jpeg'
        : isGif
        ? 'image/gif'
        : isWebp
        ? 'image/webp'
        : reportedMimeType || 'image/png');
    return {
      uploadPath: tempPath,
      mimeType: mime,
      formatLabel: 'Image / Slide Screenshot',
      cleanupPaths,
    };
  }

  // 4. Audio files
  const audioExtMap: Record<string, string> = {
    '.mp3': 'audio/mp3',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.weba': 'audio/webm',
    '.opus': 'audio/ogg',
  };
  if (audioExtMap[ext] || reportedMimeType.startsWith('audio/')) {
    return {
      uploadPath: tempPath,
      mimeType: audioExtMap[ext] || reportedMimeType || 'audio/mp3',
      formatLabel: 'Audio Lecture',
      cleanupPaths,
    };
  }

  // 5. Video files
  const videoExtMap: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg',
    '.avi': 'video/x-msvideo',
    '.m4v': 'video/mp4',
  };
  if (videoExtMap[ext] || reportedMimeType.startsWith('video/')) {
    return {
      uploadPath: tempPath,
      mimeType: videoExtMap[ext] || reportedMimeType || 'video/mp4',
      formatLabel: 'Video Lecture',
      cleanupPaths,
    };
  }

  // 6. RTF
  if (ext === '.rtf' || head.subarray(0, 5).toString('ascii') === '{\\rtf') {
    const rawRtf = await fs.promises.readFile(tempPath, 'utf8');
    const clean = stripRtfToText(rawRtf);
    if (!clean) {
      throw new Error(`Could not extract readable text from ${safeDisplayName}.`);
    }
    if (clean.length <= MAX_INLINE_TEXT_CHARS) {
      return {
        uploadPath: tempPath,
        mimeType: 'text/plain',
        formatLabel: 'Rich Text (.rtf)',
        inlineText: clean,
        cleanupPaths,
      };
    }
    const extractedPath = path.resolve(
      UPLOAD_DIR,
      `${crypto.randomUUID()}-rtf.txt`
    );
    await fs.promises.writeFile(extractedPath, clean, 'utf8');
    cleanupPaths.push(extractedPath);
    return {
      uploadPath: extractedPath,
      mimeType: 'text/plain',
      formatLabel: 'Rich Text (.rtf)',
      cleanupPaths,
    };
  }

  // 7. Plain text / Markdown / CSV / JSON / HTML / XML / LaTeX / Code
  const textExtMimeMap: Record<string, string> = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
    '.csv': 'text/csv',
    '.tsv': 'text/plain',
    '.json': 'text/plain',
    '.xml': 'text/plain',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.tex': 'text/plain',
    '.yaml': 'text/plain',
    '.yml': 'text/plain',
    '.log': 'text/plain',
  };

  if (
    textExtMimeMap[ext] ||
    reportedMimeType.startsWith('text/') ||
    isMostlyReadableText(head)
  ) {
    const stat = await fs.promises.stat(tempPath);
    if (stat.size <= MAX_INLINE_TEXT_CHARS) {
      const content = await fs.promises.readFile(tempPath, 'utf8');
      return {
        uploadPath: tempPath,
        mimeType: textExtMimeMap[ext] || 'text/plain',
        formatLabel: ext ? `Study Notes (${ext})` : 'Text Notes',
        inlineText: content,
        cleanupPaths,
      };
    }
    return {
      uploadPath: tempPath,
      mimeType: textExtMimeMap[ext] || 'text/plain',
      formatLabel: ext ? `Study Notes (${ext})` : 'Text Notes',
      cleanupPaths,
    };
  }

  // 8. Legacy binary Office (.doc, .ppt, .xls) or other binary fallback (bounded to 2 MB scan)
  const scanLimit = 2 * 1024 * 1024;
  const binHandle = await fs.promises.open(tempPath, 'r');
  let buf: Buffer;
  try {
    const stat = await binHandle.stat();
    const readLen = Math.min(stat.size, scanLimit);
    buf = Buffer.alloc(readLen);
    await binHandle.read(buf, 0, readLen, 0);
  } finally {
    await binHandle.close();
  }
  const extractedStrings = extractReadableStringsFromBuffer(buf);
  if (extractedStrings.length >= 40) {
    if (extractedStrings.length <= MAX_INLINE_TEXT_CHARS) {
      return {
        uploadPath: tempPath,
        mimeType: 'text/plain',
        formatLabel: ext ? `Document (${ext})` : 'Uploaded File',
        inlineText: extractedStrings,
        cleanupPaths,
      };
    }
    const extractedPath = path.resolve(
      UPLOAD_DIR,
      `${crypto.randomUUID()}-strings.txt`
    );
    await fs.promises.writeFile(extractedPath, extractedStrings, 'utf8');
    cleanupPaths.push(extractedPath);
    return {
      uploadPath: extractedPath,
      mimeType: 'text/plain',
      formatLabel: ext ? `Document (${ext})` : 'Uploaded File',
      cleanupPaths,
    };
  }

  throw new Error(
    `Could not read content from ${safeDisplayName}. Try uploading PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), text/CSV/Markdown, images, audio, or video files.`
  );
}

async function waitForGeminiFileActive(
  ai: GoogleGenAI,
  fileName: string
): Promise<{ uri: string; mimeType: string }> {
  const deadline = Date.now() + 120_000;
  let current = await ai.files.get({ name: fileName });

  while (current.state === 'PROCESSING' && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1500));
    current = await ai.files.get({ name: fileName });
  }

  if (current.state === 'FAILED') {
    throw new Error(
      current.error?.message || 'Gemini failed to process this uploaded file.'
    );
  }
  if (!current.uri) {
    throw new Error('Uploaded file URI was not returned by Gemini Files API.');
  }

  return {
    uri: current.uri,
    mimeType: current.mimeType || 'application/octet-stream',
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s.`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function generateWithTextModelFallback(
  ai: GoogleGenAI,
  options: {
    contents: Parameters<GoogleGenAI['models']['generateContent']>[0]['contents'];
    config?: Parameters<GoogleGenAI['models']['generateContent']>[0]['config'];
    preferFastLite?: boolean;
  }
) {
  const attempts: Array<{
    model: string;
    thinkingLevel: ThinkingLevel;
    timeoutMs: number;
  }> = options.preferFastLite
    ? [
        {
          model: 'gemini-3.1-flash-lite',
          thinkingLevel: ThinkingLevel.MINIMAL,
          timeoutMs: 20_000,
        },
        {
          model: 'gemini-4-hydrogen',
          thinkingLevel: ThinkingLevel.LOW,
          timeoutMs: 25_000,
        },
      ]
    : [
        {
          model: 'gemini-4-hydrogen',
          thinkingLevel: ThinkingLevel.LOW,
          timeoutMs: 25_000,
        },
        {
          model: 'gemini-3.1-flash-lite',
          thinkingLevel: ThinkingLevel.MINIMAL,
          timeoutMs: 30_000,
        },
        {
          model: 'gemini-3.1-flash-lite',
          thinkingLevel: ThinkingLevel.LOW,
          timeoutMs: 30_000,
        },
      ];

  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await withTimeout(
        ai.models.generateContent({
          model: attempt.model,
          contents: options.contents,
          config: {
            ...(options.config ?? {}),
            thinkingConfig: { thinkingLevel: attempt.thinkingLevel },
          },
        }),
        attempt.timeoutMs,
        attempt.model
      );
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  throw lastError;
}

function parseJsonResponseSafely<T>(rawText: string | undefined): T | null {
  if (!rawText) return null;
  let trimmed = rawText.trim();
  if (trimmed.startsWith('```')) {
    trimmed = trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function synthesizeGeminiSpeech(
  text: string,
  voiceName: string,
  styleInstruction: string
): Promise<{ audioBase64: string; mimeType: string }> {
  const attempts: Array<{
    apiVersion?: string;
    model: string;
    useSpeechMetadata: boolean;
    useSpeechConfig: boolean;
  }> = [
    {
      apiVersion: 'v1alpha',
      model: 'gemini-3.8-flash-lite-tts',
      useSpeechMetadata: true,
      useSpeechConfig: true,
    },
    {
      apiVersion: 'v1alpha',
      model: 'gemini-3.8-flash-lite-tts',
      useSpeechMetadata: false,
      useSpeechConfig: true,
    },
    {
      apiVersion: undefined,
      model: 'gemini-3.8-flash-lite-tts',
      useSpeechMetadata: false,
      useSpeechConfig: true,
    },
    {
      apiVersion: 'v1alpha',
      model: 'gemini-3.8-flash-tts',
      useSpeechMetadata: true,
      useSpeechConfig: true,
    },
    {
      apiVersion: undefined,
      model: 'gemini-3.8-flash-tts',
      useSpeechMetadata: false,
      useSpeechConfig: true,
    },
  ];

  let lastError: unknown;

  for (const cfg of attempts) {
    const ai = getAiClient(cfg.apiVersion);
    if (!ai) {
      throw new Error(
        'Gemini API key is not configured yet. Please set GEMINI_API_KEY in Settings > Secrets.'
      );
    }

    try {
      const part: Record<string, unknown> = cfg.useSpeechMetadata
        ? {
            text,
            speechMetadata: { style: styleInstruction },
          }
        : {
            text: `Speak in a ${styleInstruction} tone: ${text}`,
          };

      const response = await ai.models.generateContent({
        model: cfg.model,
        contents: [
          {
            role: 'user',
            parts: [part],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          ...(cfg.useSpeechConfig
            ? {
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName,
                    },
                  },
                },
              }
            : {}),
        },
      });

      const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineData?.data) {
        return {
          audioBase64: inlineData.data,
          mimeType: inlineData.mimeType || 'audio/wav',
        };
      }
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Gemini TTS returned no audio data.');
}

async function processStudyUploadJob(
  jobId: string,
  tempPath: string,
  safeDisplayName: string,
  reportedMimeType: string,
  sizeBytes: number
): Promise<void> {
  const cleanupPaths = [tempPath];

  const updateJob = (patch: Partial<StudyUploadJob>) => {
    const existing = studyJobStore.get(jobId);
    if (!existing) return;
    studyJobStore.set(jobId, { ...existing, ...patch });
  };

  try {
    const ai = getAiClient();
    if (!ai) {
      updateJob({
        status: 'error',
        error:
          'GEMINI_API_KEY is required for the AI Study Helper. Set it in Settings > Secrets.',
      });
      return;
    }

    updateJob({
      status: 'preparing',
      stageLabel: `Reading ${safeDisplayName}...`,
    });

    const prepared = await prepareStudyAsset(
      tempPath,
      safeDisplayName,
      reportedMimeType
    );
    for (const p of prepared.cleanupPaths) {
      if (!cleanupPaths.includes(p)) {
        cleanupPaths.push(p);
      }
    }

    let sourcePart: ReturnType<typeof createPartFromUri> | { text: string };
    let geminiFileName: string | undefined;
    let geminiFileUri: string | undefined;
    let activeMimeType = prepared.mimeType;

    if (prepared.inlineText) {
      sourcePart = {
        text: `=== UPLOADED STUDY FILE: ${safeDisplayName} (${prepared.formatLabel}) ===\n\n${prepared.inlineText}\n\n=== END OF FILE ===`,
      };
    } else {
      updateJob({
        status: 'uploading_to_ai',
        stageLabel: `Sending ${prepared.formatLabel} to Gemini AI workspace...`,
      });

      const remoteFile = await ai.files.upload({
        file: prepared.uploadPath,
        config: {
          mimeType: prepared.mimeType,
          displayName: safeDisplayName,
        },
      });

      if (!remoteFile.name) {
        throw new Error('Gemini Files API did not return a file handle.');
      }

      const activeFile = await waitForGeminiFileActive(ai, remoteFile.name);
      geminiFileName = remoteFile.name;
      geminiFileUri = activeFile.uri;
      activeMimeType = activeFile.mimeType;
      sourcePart = createPartFromUri(activeFile.uri, activeFile.mimeType);
    }

    updateJob({
      status: 'explaining',
      stageLabel: `Writing clear student explanation & topic breakdown...`,
    });

    const [structuredOutcome, explanationOutcome] = await Promise.allSettled([
      generateWithTextModelFallback(ai, {
        preferFastLite: true,
        contents: [
          {
            role: 'user',
            parts: [
              sourcePart,
              {
                text:
                  `Analyze the uploaded study file ("${safeDisplayName}", ${prepared.formatLabel}) and return structured JSON.\n` +
                  'Every topic MUST include a non-empty title, a non-empty 2-sentence summary, and 3-5 keyTerms.\n' +
                  'Return:\n' +
                  '1. "overview": 2-3 clear sentences summarizing what this material covers.\n' +
                  '2. "topics": 3 to 7 distinct topics from the material.\n' +
                  '3. "suggestedQuestions": 4 helpful follow-up questions a student would ask about this file.',
              },
            ],
          },
        ],
        config: {
          systemInstruction:
            'You are Apotheca AI Study Helper, a clinical pharmacology and health-science tutor. Extract accurate topics, non-empty summaries, and key terms directly from the provided file.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            required: ['overview', 'topics', 'suggestedQuestions'],
            properties: {
              overview: { type: Type.STRING },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ['title', 'summary', 'keyTerms'],
                  properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    keyTerms: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                },
              },
              suggestedQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      }),
      generateWithTextModelFallback(ai, {
        contents: [
          {
            role: 'user',
            parts: [
              sourcePart,
              {
                text:
                  `Explain the uploaded study material ("${safeDisplayName}", ${prepared.formatLabel}) directly and thoroughly for a student.\n` +
                  'Use clean Markdown headings (##) and bullet points:\n' +
                  '- What this file is about\n' +
                  '- Core concepts and mechanisms explained simply step-by-step\n' +
                  '- Key examples, formulas, or clinical takeaways\n' +
                  '- Quick memory tips or high-yield cautions\n\n' +
                  'IMPORTANT: Do NOT use LaTeX math dollar signs ($...$). Write normal Unicode symbols like β1, α, ≥, ≤, → instead.',
              },
            ],
          },
        ],
        config: {
          systemInstruction:
            'You are Apotheca AI Study Helper, a warm, crystal-clear tutor helping students understand their uploaded files regardless of format. Never claim you cannot access the file when its content or media part is provided above.',
        },
      }),
    ]);

    if (
      structuredOutcome.status === 'rejected' &&
      explanationOutcome.status === 'rejected'
    ) {
      throw explanationOutcome.reason ?? structuredOutcome.reason;
    }

    const structuredRes =
      structuredOutcome.status === 'fulfilled' ? structuredOutcome.value : null;
    const explanationRes =
      explanationOutcome.status === 'fulfilled' ? explanationOutcome.value : null;

    const parsed = parseJsonResponseSafely<{
      overview?: string;
      topics?: Array<{
        title?: string;
        summary?: string;
        keyTerms?: string[];
      }>;
      suggestedQuestions?: string[];
    }>(structuredRes?.text);

    const docId = crypto.randomUUID();
    const explanationText = explanationRes?.text?.trim() || '';
    const overviewFallbackFromExplanation = explanationText
      ? explanationText
          .replace(/^#+\s+/gm, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 280)
      : '';
    const overviewText =
      parsed?.overview?.trim() ||
      overviewFallbackFromExplanation ||
      `Uploaded ${safeDisplayName} (${prepared.formatLabel}). Your study breakdown and AI tutor are ready below.`;

    let topics: StoredTopic[] = Array.isArray(parsed?.topics)
      ? parsed.topics.slice(0, 10).map((t, idx) => ({
          id: `${docId}-topic-${idx + 1}`,
          title: String(t.title || `Topic ${idx + 1}`).trim(),
          summary:
            String(t.summary || '').trim() ||
            'Click Explain Topic to generate a step-by-step walkthrough of this section.',
          keyTerms: Array.isArray(t.keyTerms)
            ? t.keyTerms.slice(0, 6).map((k) => String(k).trim()).filter(Boolean)
            : [],
        }))
      : [];

    if (topics.length === 0) {
      topics = [
        {
          id: `${docId}-topic-1`,
          title: `Core Concepts in ${safeDisplayName}`,
          summary: overviewText,
          keyTerms: [prepared.formatLabel],
        },
      ];
    }

    const suggestedQuestions = Array.isArray(parsed?.suggestedQuestions)
      ? parsed.suggestedQuestions.slice(0, 5).map((q) => String(q).trim()).filter(Boolean)
      : [
          `Summarize the key mechanisms and main points from ${safeDisplayName}.`,
          'Explain the hardest concept in this file in simple terms.',
          'Quiz me with 3 practice questions based on this material.',
        ];

    const initialExplanation = explanationText || overviewText;

    if (studyDocStore.size >= MAX_STORED_DOCS) {
      const oldestKey = studyDocStore.keys().next().value;
      if (oldestKey) {
        const oldest = studyDocStore.get(oldestKey);
        studyDocStore.delete(oldestKey);
        if (oldest?.geminiFileName) {
          ai.files.delete({ name: oldest.geminiFileName }).catch(() => {});
        }
      }
    }

    const storedDoc: StoredStudyDoc = {
      id: docId,
      displayName: safeDisplayName,
      fileFormatLabel: prepared.formatLabel,
      sizeBytes,
      uploadedAt: new Date().toISOString(),
      geminiFileName,
      geminiFileUri,
      mimeType: activeMimeType,
      inlineText: prepared.inlineText,
      overview: overviewText,
      initialExplanation,
      topics,
      suggestedQuestions,
    };
    studyDocStore.set(docId, storedDoc);

    updateJob({
      status: 'ready',
      stageLabel: 'Ready',
      doc: toPublicStudyDoc(storedDoc),
    });
  } catch (err: unknown) {
    const message = extractFriendlyErrorMessage(
      err,
      'Failed to analyze uploaded file.'
    );
    updateJob({
      status: 'error',
      stageLabel: 'Failed',
      error: message,
    });
  } finally {
    await Promise.all(
      cleanupPaths.map((p) => fs.promises.unlink(p).catch(() => {}))
    );
  }
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : '';
    cb(null, `${crypto.randomUUID()}${safeExt}`);
  },
});

const studyUpload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (BLOCKED_EXECUTABLE_EXTS.has(ext)) {
      cb(new Error(`Executable file format (${ext}) is not allowed for safety.`));
      return;
    }
    cb(null, true);
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '128kb' }));

  app.get('/api/tts/status', (_req: Request, res: Response) => {
    const available = Boolean(getConfiguredApiKey());
    res.json({
      available,
      aiAssistantAvailable: available,
      maxUploadBytes: MAX_UPLOAD_BYTES,
      voices: Array.from(ALLOWED_VOICES),
    });
  });

  app.post('/api/tts', async (req: Request, res: Response) => {
    const body = req.body as {
      text?: unknown;
      voiceName?: unknown;
      style?: unknown;
    } | null;

    if (!body || typeof body.text !== 'string') {
      res.status(400).json({ error: 'A valid text string is required.' });
      return;
    }

    const cleanText = body.text.trim().slice(0, MAX_TTS_CHARS);
    if (!cleanText) {
      res.status(400).json({ error: 'Text cannot be empty.' });
      return;
    }

    const requestedVoice =
      typeof body.voiceName === 'string' && ALLOWED_VOICES.has(body.voiceName)
        ? body.voiceName
        : 'Kore';

    const styleInstruction =
      typeof body.style === 'string' && body.style.trim().length > 0
        ? body.style.trim().slice(0, 160)
        : 'Calm, warm, articulate clinical pharmacology educator';

    if (!getConfiguredApiKey()) {
      res.status(503).json({
        error:
          'Gemini API key is not configured yet. Please set GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    try {
      const result = await synthesizeGeminiSpeech(
        cleanText,
        requestedVoice,
        styleInstruction
      );

      res.json({
        audioBase64: result.audioBase64,
        mimeType: result.mimeType,
        voiceName: requestedVoice,
      });
    } catch (err: unknown) {
      const message = extractFriendlyErrorMessage(
        err,
        'Failed to synthesize Gemini voice.'
      );
      const status =
        typeof (err as { status?: number })?.status === 'number'
          ? (err as { status: number }).status
          : 500;
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: message,
      });
    }
  });

  app.post(
    '/api/study-docs/upload',
    (req: Request, res: Response, next: NextFunction) => {
      studyUpload.single('file')(req, res, (err: unknown) => {
        if (!err) {
          next();
          return;
        }
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(413).json({
              error: 'File exceeds the maximum allowed upload size of 100 MB.',
            });
            return;
          }
          res.status(400).json({ error: err.message });
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Invalid file upload.';
        res.status(400).json({ error: message });
      });
    },
    (req: Request, res: Response) => {
      const uploadedFile = req.file;
      if (!uploadedFile) {
        res.status(400).json({ error: 'Please select a file to upload.' });
        return;
      }

      const tempPath = uploadedFile.path;
      const safeDisplayName = sanitizeDisplayName(uploadedFile.originalname);

      if (!getConfiguredApiKey()) {
        fs.promises.unlink(tempPath).catch(() => {});
        res.status(503).json({
          error:
            'GEMINI_API_KEY is required for the AI Study Helper. Set it in Settings > Secrets.',
        });
        return;
      }

      if (uploadedFile.size === 0) {
        fs.promises.unlink(tempPath).catch(() => {});
        res.status(400).json({ error: 'The uploaded file is empty.' });
        return;
      }

      if (studyJobStore.size >= MAX_STORED_JOBS) {
        const oldestJobKey = studyJobStore.keys().next().value;
        if (oldestJobKey) studyJobStore.delete(oldestJobKey);
      }

      const jobId = crypto.randomUUID();
      studyJobStore.set(jobId, {
        jobId,
        status: 'preparing',
        stageLabel: `Reading ${safeDisplayName}...`,
        createdAt: Date.now(),
      });

      void processStudyUploadJob(
        jobId,
        tempPath,
        safeDisplayName,
        uploadedFile.mimetype || '',
        uploadedFile.size
      );

      res.status(202).json({
        jobId,
        displayName: safeDisplayName,
        sizeBytes: uploadedFile.size,
        status: 'preparing',
        stageLabel: `Reading ${safeDisplayName}...`,
      });
    }
  );

  app.get('/api/study-docs/jobs/:jobId', (req: Request, res: Response) => {
    const jobId = String(req.params.jobId || '');
    const job = studyJobStore.get(jobId);
    if (!job) {
      res.status(404).json({
        error: 'Upload processing job expired. Please upload your file again.',
      });
      return;
    }
    res.json({
      jobId: job.jobId,
      status: job.status,
      stageLabel: job.stageLabel,
      doc: job.doc,
      error: job.error,
    });
  });

  app.post('/api/study-docs/ask', async (req: Request, res: Response) => {
    const body = req.body as {
      docId?: unknown;
      question?: unknown;
      topicTitle?: unknown;
      history?: unknown;
      citationMode?: unknown;
    } | null;

    if (!body || typeof body.docId !== 'string' || typeof body.question !== 'string') {
      res.status(400).json({ error: 'docId and question are required.' });
      return;
    }

    const doc = studyDocStore.get(body.docId);
    if (!doc) {
      res.status(404).json({
        error: 'This uploaded file session has expired or was removed. Please re-upload it.',
      });
      return;
    }

    const question = body.question.trim().slice(0, 2000);
    if (!question) {
      res.status(400).json({ error: 'Question cannot be empty.' });
      return;
    }

    const citationMode = body.citationMode !== false;

    const topicFocus =
      typeof body.topicTitle === 'string' && body.topicTitle.trim()
        ? `Focused Topic: ${body.topicTitle.trim().slice(0, 200)}\n`
        : '';

    const historyLines: string[] = [];
    if (Array.isArray(body.history)) {
      for (const turn of body.history.slice(-6)) {
        if (
          turn &&
          typeof turn === 'object' &&
          ((turn as { role?: unknown }).role === 'user' ||
            (turn as { role?: unknown }).role === 'assistant') &&
          typeof (turn as { text?: unknown }).text === 'string'
        ) {
          const speaker =
            (turn as { role: string }).role === 'user' ? 'Student' : 'Tutor';
          historyLines.push(
            `${speaker}: ${(turn as { text: string }).text.trim().slice(0, 800)}`
          );
        }
      }
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured yet. Please set GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    try {
      const sourcePart = doc.inlineText
        ? {
            text: `=== UPLOADED STUDY FILE: ${doc.displayName} (${doc.fileFormatLabel}) ===\n\n${doc.inlineText}\n\n=== END OF FILE ===`,
          }
        : createPartFromUri(doc.geminiFileUri!, doc.mimeType);

      const historyContext =
        historyLines.length > 0
          ? `Recent study conversation:\n${historyLines.join('\n')}\n\n`
          : '';

      const citationRules = citationMode
        ? 'Clinical Citation & Integrity Rules:\n' +
          '- Cite the specific section heading, slide number, page/table, or topic in the uploaded file for key facts (e.g., [Source: Slide 4 / Section on Beta-Blockers]).\n' +
          '- If generating practice questions, prefix them with [AI-Generated Study Question].\n' +
          '- End with a concise 1-line Clinical Verification Note reminding the student to cross-check dosing, renal cutoffs, or drug interactions against primary clinical guidelines (e.g., Lexicomp, UpToDate, FDA labeling).\n'
        : '';

      const prompt =
        `${historyContext}${topicFocus}Student question: ${question}\n\n` +
        `Base your explanation directly on the uploaded file ("${doc.displayName}", ${doc.fileFormatLabel}). ` +
        citationRules +
        'Explain clearly step by step using clean Markdown headings and bullet points. Do NOT use LaTeX $...$ syntax; write Unicode symbols (β1, α, ≥, →) instead.';

      const response = await generateWithTextModelFallback(ai, {
        contents: [
          {
            role: 'user',
            parts: [sourcePart, { text: prompt }],
          },
        ],
        config: {
          systemInstruction:
            'You are Apotheca Study Helper, an expert pharmacy and health-science educator. Explain uploaded topics clearly, accurately, and concisely for students based on the provided file content, citing sections accurately.',
        },
      });

      let finalAnswer =
        response.text?.trim() ||
        'I could not extract an explanation for that prompt. Try phrasing a more specific question about the uploaded file.';

      if (
        citationMode &&
        finalAnswer &&
        !/clinical verification note|verify.*primary|lexicomp|uptodate/i.test(finalAnswer)
      ) {
        finalAnswer += `\n\n---\n**Clinical Verification Note:** AI-generated explanation derived from *${doc.displayName}*. Verify drug doses, renal thresholds, and clinical guidelines against primary references (Lexicomp, UpToDate, FDA labeling, or course syllabi).`;
      }

      res.json({
        docId: doc.id,
        answer: finalAnswer,
      });
    } catch (err: unknown) {
      const message = extractFriendlyErrorMessage(
        err,
        'Failed to generate topic explanation.'
      );
      const status =
        typeof (err as { status?: number })?.status === 'number'
          ? (err as { status: number }).status
          : 500;
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: message,
      });
    }
  });

  app.post('/api/study-docs/generate-cases', async (req: Request, res: Response) => {
    const body = req.body as {
      docId?: unknown;
      mode?: unknown;
    } | null;

    if (!body || typeof body.docId !== 'string') {
      res.status(400).json({ error: 'docId is required.' });
      return;
    }

    const doc = studyDocStore.get(body.docId);
    if (!doc) {
      res.status(404).json({
        error: 'This uploaded file session has expired or was removed. Please re-upload it.',
      });
      return;
    }

    const mode: 'vignettes' | 'quick_review' =
      body.mode === 'quick_review' ? 'quick_review' : 'vignettes';
    const targetCount = mode === 'quick_review' ? 5 : 4;

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured yet. Please set GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    try {
      const sourcePart = doc.inlineText
        ? {
            text: `=== UPLOADED STUDY FILE: ${doc.displayName} (${doc.fileFormatLabel}) ===\n\n${doc.inlineText}\n\n=== END OF FILE ===`,
          }
        : createPartFromUri(doc.geminiFileUri!, doc.mimeType);

      const prompt =
        mode === 'quick_review'
          ? `Generate ${targetCount} rapid-fire Mechanism-of-Action (MOA) Quick Review drills directly grounded in "${doc.displayName}".\n` +
            'For each drill:\n' +
            '- Describe the mechanism, pathway, or key concept WITHOUT naming the answer in the presentation text.\n' +
            '- Provide 4 distinct answer cards (1 optimal answer + 3 plausible distractors from the topic domain).\n' +
            '- Include concise PK/property clues, 3 progressive hints, a high-yield clinical pearl, and the exact citationNote (e.g. slide, section, or page in the uploaded file).'
          : `Generate ${targetCount} playable clinical pharmacy patient vignettes directly grounded in "${doc.displayName}".\n` +
            'For each vignette:\n' +
            '- Write a realistic patient presentation, 3 concise lab/metric values, active medications/context, target cue, and promptQuestion.\n' +
            '- Provide 4 distinct medication/therapeutic option cards (1 optimal choice + 3 clinically plausible distractors).\n' +
            '- Include 3 progressive hints, distractor rationales explaining why each distractor is suboptimal, a clinical pearl, and citationNote citing the section/slide/topic in the uploaded file.\n' +
            'IMPORTANT: Do NOT use LaTeX $...$ syntax; use normal Unicode symbols.';

      const response = await generateWithTextModelFallback(ai, {
        preferFastLite: true,
        contents: [
          {
            role: 'user',
            parts: [sourcePart, { text: prompt }],
          },
        ],
        config: {
          systemInstruction:
            'You are Apotheca Case Author, creating playable pharmacology clinical cases and mechanism drills directly from uploaded student study material. Always produce exactly 4 options per case where index 0 is the optimal answer.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            required: ['cases'],
            properties: {
              cases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: [
                    'title',
                    'specialty',
                    'difficulty',
                    'patientLine',
                    'presentation',
                    'labs',
                    'activeMeds',
                    'targetCue',
                    'promptQuestion',
                    'clinicalPearl',
                    'citationNote',
                    'hints',
                    'options',
                  ],
                  properties: {
                    title: { type: Type.STRING },
                    specialty: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    patientLine: { type: Type.STRING },
                    presentation: { type: Type.STRING },
                    labs: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ['label', 'value', 'flag'],
                        properties: {
                          label: { type: Type.STRING },
                          value: { type: Type.STRING },
                          flag: { type: Type.STRING },
                        },
                      },
                    },
                    activeMeds: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    targetCue: { type: Type.STRING },
                    promptQuestion: { type: Type.STRING },
                    clinicalPearl: { type: Type.STRING },
                    citationNote: { type: Type.STRING },
                    hints: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: [
                          'genericName',
                          'brandNames',
                          'drugClass',
                          'molecularTarget',
                          'mechanism',
                          'distractorRationale',
                          'renalAndHepaticDosing',
                          'patientCounseling',
                        ],
                        properties: {
                          genericName: { type: Type.STRING },
                          brandNames: { type: Type.STRING },
                          drugClass: { type: Type.STRING },
                          molecularTarget: { type: Type.STRING },
                          mechanism: { type: Type.STRING },
                          halfLife: { type: Type.STRING },
                          metabolism: { type: Type.STRING },
                          distractorRationale: { type: Type.STRING },
                          renalAndHepaticDosing: { type: Type.STRING },
                          patientCounseling: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      interface RawOption {
        genericName?: string;
        brandNames?: string;
        drugClass?: string;
        molecularTarget?: string;
        mechanism?: string;
        halfLife?: string;
        metabolism?: string;
        distractorRationale?: string;
        renalAndHepaticDosing?: string;
        patientCounseling?: string;
      }

      interface RawCase {
        title?: string;
        specialty?: string;
        difficulty?: string;
        patientLine?: string;
        presentation?: string;
        labs?: Array<{ label?: string; value?: string; flag?: string }>;
        activeMeds?: string[];
        targetCue?: string;
        promptQuestion?: string;
        clinicalPearl?: string;
        citationNote?: string;
        hints?: string[];
        options?: RawOption[];
      }

      const parsed = parseJsonResponseSafely<{ cases?: RawCase[] }>(response.text);
      const rawCases = Array.isArray(parsed?.cases) ? parsed.cases : [];

      if (rawCases.length === 0) {
        res.status(500).json({
          error:
            'Could not generate structured clinical cases from this file. Try uploading notes with clearer drug or clinical concepts.',
        });
        return;
      }

      const validSpecialties = new Set([
        'cardiorenal',
        'infectious',
        'cns',
        'endocrine_gi',
        'respiratory',
        'hematology_immune',
        'musculoskeletal_derm',
        'reproductive_sensory',
        'ai_informatics',
      ]);
      const validDifficulties = new Set(['Foundational', 'Clinical', 'Board Prep']);

      const batchPrefix = `custom_${doc.id.slice(0, 8)}_${Date.now().toString(36)}`;
      const generatedCases: Array<Record<string, unknown>> = [];
      const generatedDrugs: Array<Record<string, unknown>> = [];

      rawCases.slice(0, 6).forEach((rc, cIdx) => {
        const opts = Array.isArray(rc.options) ? [...rc.options] : [];
        while (opts.length < 4) {
          opts.push({
            genericName: `Alternative Option ${opts.length + 1}`,
            brandNames: 'Study Distractor',
            drugClass: 'Alternative Agent',
            molecularTarget: 'Non-target pathway',
            mechanism: 'Does not match the primary clinical target in this scenario.',
            distractorRationale:
              'This option does not align with the primary mechanism or indication described in your study material.',
            renalAndHepaticDosing: 'Verify against primary clinical guidelines.',
            patientCounseling: 'Verify counseling points with primary clinical references.',
          });
        }
        const fourOpts = opts.slice(0, 4);
        const specialty = validSpecialties.has(String(rc.specialty))
          ? String(rc.specialty)
          : 'cardiorenal';
        const difficulty = validDifficulties.has(String(rc.difficulty))
          ? String(rc.difficulty)
          : 'Clinical';

        const cardIds: string[] = [];
        const distractorRationales: Record<string, string> = {};

        fourOpts.forEach((opt, oIdx) => {
          const drugId = `${batchPrefix}_d_${cIdx}_${oIdx}`;
          cardIds.push(drugId);
          if (oIdx > 0) {
            distractorRationales[drugId] =
              opt.distractorRationale?.trim() ||
              `${opt.genericName || 'This option'} does not best address the clinical target described in ${doc.displayName}.`;
          }
          generatedDrugs.push({
            id: drugId,
            genericName: opt.genericName?.trim() || `Agent ${oIdx + 1}`,
            brandNames: opt.brandNames?.trim() || 'Study Material Card',
            drugClass: opt.drugClass?.trim() || 'Study Concept',
            chemicalClass: `Generated from ${doc.displayName}`,
            specialty,
            dosageForm: oIdx % 2 === 0 ? 'tablet' : 'iv_vial',
            molecularTarget: opt.molecularTarget?.trim() || 'See study notes',
            mechanism:
              opt.mechanism?.trim() || 'Derived from uploaded study material.',
            pharmacokinetics: {
              bioavailability: 'See primary ref',
              halfLife: opt.halfLife?.trim() || 'See primary ref',
              volumeOfDistribution: 'See primary ref',
              metabolism: opt.metabolism?.trim() || 'See primary ref',
              excretion: 'See primary ref',
              proteinBinding: 'See primary ref',
            },
            renalAndHepaticDosing:
              opt.renalAndHepaticDosing?.trim() ||
              'Verify renal and hepatic dosing against primary guidelines.',
            clinicalPearls:
              rc.clinicalPearl?.trim() ||
              'Verify clinical nuances against primary pharmacology guidelines.',
            patientCounseling:
              opt.patientCounseling?.trim() ||
              'Verify counseling points against primary references.',
            contraindications: 'Verify contraindications in primary drug references.',
            majorInteractions: 'Verify interactions in primary drug references.',
            monitoring: 'Verify clinical monitoring parameters.',
          });
        });

        const correctDrugId = cardIds[0];
        // Shuffle cardIds cleanly so the answer isn't always slot [1]
        const shuffledIds = [...cardIds];
        for (let i = shuffledIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
        }

        const labs = (Array.isArray(rc.labs) ? rc.labs : [])
          .slice(0, 3)
          .map((l) => ({
            label: String(l.label || 'Metric').trim(),
            value: String(l.value || 'Review').trim(),
            flag:
              l.flag === 'high' || l.flag === 'low' ? l.flag : 'normal',
          }));
        while (labs.length < 3) {
          labs.push({
            label: labs.length === 0 ? 'Source' : labs.length === 1 ? 'Mode' : 'Review',
            value:
              labs.length === 0
                ? doc.fileFormatLabel
                : labs.length === 1
                ? mode === 'quick_review'
                  ? 'MOA Drill'
                  : 'Clinical Vignette'
                : 'AI Study Case',
            flag: 'normal',
          });
        }

        const rawHints = Array.isArray(rc.hints) ? rc.hints : [];
        const hints: [string, string, string] = [
          String(rawHints[0] || `Focus on the pharmacologic class: ${fourOpts[0]?.drugClass || 'key concept'}.`),
          String(rawHints[1] || `Target pathway: ${fourOpts[0]?.molecularTarget || 'see presentation'}.`),
          String(rawHints[2] || 'Eliminating two distractors narrows the optimal choice.'),
        ];

        generatedCases.push({
          id: `${batchPrefix}_c_${cIdx}`,
          specialty,
          mechanic: mode === 'quick_review' ? 'receptor_lock' : 'prescribe_screen',
          difficulty,
          title: rc.title?.trim() || `Study Case ${cIdx + 1}`,
          patientLine:
            rc.patientLine?.trim() ||
            `Derived from ${doc.displayName} · AI-Generated Study Vignette`,
          presentation:
            rc.presentation?.trim() ||
            'Apply the therapeutic concepts from your uploaded study file.',
          labs,
          activeMeds:
            Array.isArray(rc.activeMeds) && rc.activeMeds.length > 0
              ? rc.activeMeds.slice(0, 4).map((m) => String(m))
              : [`Source: ${doc.displayName}`],
          targetCue:
            rc.targetCue?.trim() ||
            (mode === 'quick_review' ? 'MOA Study Drill' : 'Clinical Application'),
          promptQuestion:
            rc.promptQuestion?.trim() ||
            'Select the optimal therapy or mechanism matching this scenario.',
          cardIds: shuffledIds,
          correctDrugId,
          distractorRationales,
          clinicalPearl:
            rc.clinicalPearl?.trim() ||
            'Verify clinical details against primary pharmacology references.',
          hints,
          isQuickReview: mode === 'quick_review',
          isCustomStudy: true,
          sourceDocId: doc.id,
          sourceDocName: doc.displayName,
          citationNote:
            rc.citationNote?.trim() || `Cited from ${doc.displayName}`,
        });
      });

      res.json({
        docId: doc.id,
        docName: doc.displayName,
        mode,
        cases: generatedCases,
        drugs: generatedDrugs,
      });
    } catch (err: unknown) {
      const message = extractFriendlyErrorMessage(
        err,
        'Failed to generate clinical cases from uploaded file.'
      );
      const status =
        typeof (err as { status?: number })?.status === 'number'
          ? (err as { status: number }).status
          : 500;
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: message,
      });
    }
  });

  app.delete('/api/study-docs/:docId', async (req: Request, res: Response) => {
    const docId = String(req.params.docId || '');
    const doc = studyDocStore.get(docId);
    if (!doc) {
      res.json({ deleted: true });
      return;
    }
    studyDocStore.delete(docId);
    const ai = getAiClient();
    if (ai && doc.geminiFileName) {
      await ai.files.delete({ name: doc.geminiFileName }).catch(() => {});
    }
    res.json({ deleted: true });
  });

  // ================= 24/7 LIVE CLINICAL AUTO-UPDATER =================
  const LIVE_UPDATE_INTERVAL_HOURS = 6;
  const LIVE_UPDATE_INTERVAL_MS = LIVE_UPDATE_INTERVAL_HOURS * 60 * 60 * 1000;
  const LIVE_UPDATES_CACHE_FILE = path.resolve(
    os.tmpdir(),
    'apotheca-live-updates.json'
  );

  const BODY_SYSTEM_LABELS: Record<string, string> = {
    cardiovascular: 'Cardiovascular',
    respiratory: 'Respiratory',
    nervous: 'Nervous System',
    renal: 'Renal & Urinary',
    digestive: 'Digestive & Liver',
    endocrine: 'Endocrine',
    immune: 'Immune & Lymphatic',
    hematologic: 'Hematologic',
    musculoskeletal: 'Musculoskeletal',
    integumentary: 'Integumentary',
    reproductive: 'Reproductive',
    sensory: 'Sensory & ENT',
    general: 'Cross-System',
  };

  interface LiveUpdateSourceRecord {
    title: string;
    uri: string;
  }

  interface LiveClinicalUpdateRecord {
    id: string;
    systemId: string;
    systemLabel: string;
    category: 'Guideline Update' | 'FDA Safety Alert' | 'New Approval' | 'Dosing & PK';
    title: string;
    summary: string;
    clinicalImpact: string;
    affectedDrugs: string[];
    checkedAt: string;
    sources: LiveUpdateSourceRecord[];
  }

  interface LiveFeedPersistedState {
    autoUpdaterActive: boolean;
    isRefreshing: boolean;
    intervalHours: number;
    lastCheckedAt: string | null;
    lastSuccessAt: string | null;
    nextScheduledCheckAt: string | null;
    lastError: string | null;
    focusSystem: string;
    updates: LiveClinicalUpdateRecord[];
  }

  const dedupeLiveUpdates = (
    items: LiveClinicalUpdateRecord[]
  ): LiveClinicalUpdateRecord[] => {
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    const result: LiveClinicalUpdateRecord[] = [];
    for (const item of items) {
      if (!item || typeof item.id !== 'string' || !item.id) continue;
      const titleKey = `${item.systemId}:${String(item.title || '').toLowerCase()}`;
      if (seenIds.has(item.id) || seenTitles.has(titleKey)) continue;
      seenIds.add(item.id);
      seenTitles.add(titleKey);
      result.push(item);
    }
    return result;
  };

  const loadPersistedLiveFeed = (): LiveFeedPersistedState => {
    const fallback: LiveFeedPersistedState = {
      autoUpdaterActive: true,
      isRefreshing: false,
      intervalHours: LIVE_UPDATE_INTERVAL_HOURS,
      lastCheckedAt: null,
      lastSuccessAt: null,
      nextScheduledCheckAt: new Date(
        Date.now() + LIVE_UPDATE_INTERVAL_MS
      ).toISOString(),
      lastError: null,
      focusSystem: 'all',
      updates: [],
    };
    try {
      if (!fs.existsSync(LIVE_UPDATES_CACHE_FILE)) return fallback;
      const raw = fs.readFileSync(LIVE_UPDATES_CACHE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<LiveFeedPersistedState>;
      return {
        ...fallback,
        ...parsed,
        isRefreshing: false,
        intervalHours: LIVE_UPDATE_INTERVAL_HOURS,
        updates: Array.isArray(parsed.updates)
          ? dedupeLiveUpdates(parsed.updates)
          : [],
      };
    } catch {
      return fallback;
    }
  };

  const savePersistedLiveFeed = (state: LiveFeedPersistedState) => {
    try {
      fs.writeFileSync(
        LIVE_UPDATES_CACHE_FILE,
        JSON.stringify({ ...state, isRefreshing: false }, null, 2),
        'utf8'
      );
    } catch {
      // Ignore temp cache write failures
    }
  };

  const liveFeedState: LiveFeedPersistedState = loadPersistedLiveFeed();
  let activeRefreshPromise: Promise<LiveFeedPersistedState> | null = null;

  const parseJsonArrayFromText = (rawText: string): Record<string, unknown>[] => {
    const cleaned = rawText
      .replace(/```json/gi, '```')
      .replace(/```/g, '')
      .trim();
    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');
    if (startIdx === -1 || endIdx <= startIdx) {
      throw new Error('Model response did not include a JSON update list.');
    }
    const sliced = cleaned.slice(startIdx, endIdx + 1);
    const parsed = JSON.parse(sliced);
    if (!Array.isArray(parsed)) {
      throw new Error('Parsed live clinical update payload was not an array.');
    }
    return parsed.filter(
      (item): item is Record<string, unknown> =>
        Boolean(item && typeof item === 'object')
    );
  };

  const classifyBodySystem = (
    text: string,
    fallbackSystem = 'general'
  ): string => {
    const t = text.toLowerCase();
    if (/(heart|cardiac|atrial|ventricular|hypertension|coronary|anticoag|warfarin|apixaban|rivaroxaban|statin|cholesterol|lipid|heart failure|arrhythmia|qtc|thrombosis|blood pressure|beta-blocker)/.test(t)) {
      return 'cardiovascular';
    }
    if (/(lung|pulmonary|asthma|copd|broncho|respiratory|inhaler|pneumonia|dyspnea|oxygen|airway|cystic fibrosis)/.test(t)) {
      return 'respiratory';
    }
    if (/(brain|neuro|seizure|epilep|stroke|migraine|alzheimer|parkinson|antidepress|ssri|schizo|psych|anxiety|opioid|pain|nsaid|neuropath|cns)/.test(t)) {
      return 'nervous';
    }
    if (/(kidney|renal|nephr|egfr|creatinine|dialysis|diuretic|urolog|bladder|prostate|gout|hyperkalemia|ckd)/.test(t)) {
      return 'renal';
    }
    if (/(liver|hepat|gastro|ulcer|bowel|crohn|colitis|pancrea|nausea|gerd|proton pump|bilirubin|cirrhosis|gi )/.test(t)) {
      return 'digestive';
    }
    if (/(diabetes|insulin|glp-1|semaglutide|tirzepatide|sglt2|thyroid|adrenal|cortisol|metabolic|obesity|osteoporosis|bone|a1c|glycem)/.test(t)) {
      return 'endocrine';
    }
    if (/(immune|autoimmune|rheumat|monoclonal|biologic|vaccine|infection|antibiotic|antiviral|antifungal|sepsis|hiv|bacteria|lupus|allergy|histamine)/.test(t)) {
      return 'immune';
    }
    if (/(anemia|platelet|leukemia|lymphoma|myeloma|hematolog|hemoglobin|coagul|hemophilia|sickle cell|neutropenia)/.test(t)) {
      return 'hematologic';
    }
    if (/(muscle|joint|arthritis|skeletal|spasm|tendon|orthoped|myopathy|fibromyalgia)/.test(t)) {
      return 'musculoskeletal';
    }
    if (/(skin|dermat|psoriasis|eczema|rash|acne|melanoma|cutaneous|stevens-johnson)/.test(t)) {
      return 'integumentary';
    }
    if (/(pregnan|reproduct|contracept|estrogen|testosterone|fertility|obstetric|uterine|ovarian|teratogen)/.test(t)) {
      return 'reproductive';
    }
    if (/(eye|ocular|glaucoma|retina|macular|ophthalm|ear|ototox|hearing|vertigo|tinnitus|nasal|sinus)/.test(t)) {
      return 'sensory';
    }
    return BODY_SYSTEM_LABELS[fallbackSystem] ? fallbackSystem : 'general';
  };

  const SYSTEM_PUBMED_QUERIES: Record<string, string> = {
    all: '(clinical pharmacology[Title/Abstract] OR FDA drug approval[Title/Abstract] OR pharmacotherapy guideline[Title/Abstract])',
    cardiovascular: '(cardiovascular pharmacotherapy[Title/Abstract] OR anticoagulation guideline[Title/Abstract] OR heart failure therapy[Title/Abstract])',
    respiratory: '(asthma COPD pharmacotherapy[Title/Abstract] OR inhaled corticosteroid guideline[Title/Abstract])',
    nervous: '(neurology epilepsy migraine antidepressant pharmacotherapy[Title/Abstract])',
    renal: '(chronic kidney disease SGLT2 renal dosing pharmacology[Title/Abstract])',
    digestive: '(inflammatory bowel disease hepatology GERD pharmacotherapy[Title/Abstract])',
    endocrine: '(diabetes GLP-1 thyroid endocrine pharmacotherapy guideline[Title/Abstract])',
    immune: '(antimicrobial stewardship infectious disease biologic immunotherapy[Title/Abstract])',
    hematologic: '(hematology anemia thrombosis anticoagulation pharmacotherapy[Title/Abstract])',
    musculoskeletal: '(rheumatoid arthritis gout osteoporosis pharmacotherapy[Title/Abstract])',
    integumentary: '(dermatology psoriasis atopic dermatitis biologic therapy[Title/Abstract])',
    reproductive: '(obstetrics contraception reproductive endocrinology medication safety[Title/Abstract])',
    sensory: '(glaucoma ophthalmology macular degeneration ototoxicity pharmacotherapy[Title/Abstract])',
  };

  const fetchJsonWithTimeout = async <T>(
    url: string,
    timeoutMs = 10_000
  ): Promise<T | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'ApothecaClinicalStudyApp/1.0',
        },
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  const fetchPublicBiomedicalUpdates = async (
    focusSystem: string,
    nowIso: string
  ): Promise<LiveClinicalUpdateRecord[]> => {
    const pubmedTerm = SYSTEM_PUBMED_QUERIES[focusSystem] ?? SYSTEM_PUBMED_QUERIES.all;
    const pubmedSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
      pubmedTerm
    )}&sort=pub+date&retmode=json&retmax=5`;

    const [fdaApprovals, fdaEnforcement, pubmedSearch] = await Promise.all([
      fetchJsonWithTimeout<{
        results?: Array<{
          application_number?: string;
          sponsor_name?: string;
          openfda?: {
            generic_name?: string[];
            brand_name?: string[];
            pharm_class_epc?: string[];
          };
          products?: Array<{ brand_name?: string; dosage_form?: string; active_ingredients?: Array<{ name?: string; strength?: string }> }>;
          submissions?: Array<{ submission_type?: string; submission_status_date?: string; submission_class_code_description?: string }>;
        }>;
      }>('https://api.fda.gov/drug/drugsfda.json?sort=submissions.submission_status_date:desc&limit=15'),
      fetchJsonWithTimeout<{
        results?: Array<{
          recall_number?: string;
          classification?: string;
          product_description?: string;
          reason_for_recall?: string;
          report_date?: string;
          openfda?: { generic_name?: string[]; brand_name?: string[] };
        }>;
      }>('https://api.fda.gov/drug/enforcement.json?sort=report_date:desc&limit=12'),
      fetchJsonWithTimeout<{
        esearchresult?: { idlist?: string[] };
      }>(pubmedSearchUrl),
    ]);

    const updates: LiveClinicalUpdateRecord[] = [];
    const fallbackSys = focusSystem === 'all' ? 'general' : focusSystem;

    // 1. Live NIH PubMed clinical pharmacotherapy literature
    const pmids = pubmedSearch?.esearchresult?.idlist?.slice(0, 5) ?? [];
    if (pmids.length > 0) {
      const summaryData = await fetchJsonWithTimeout<{
        result?: Record<
          string,
          {
            uid?: string;
            title?: string;
            fulljournalname?: string;
            source?: string;
            pubdate?: string;
          }
        >;
      }>(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${encodeURIComponent(
          pmids.join(',')
        )}&retmode=json`
      );
      if (summaryData?.result) {
        for (const pmid of pmids) {
          const article = summaryData.result[pmid];
          if (!article?.title) continue;
          const cleanTitle = article.title.replace(/\.$/, '').trim().slice(0, 130);
          const journal = article.fulljournalname || article.source || 'Peer-Reviewed Journal';
          const pubDate = article.pubdate || 'Recent';
          const sysId =
            focusSystem !== 'all'
              ? focusSystem
              : classifyBodySystem(`${cleanTitle} ${journal}`, fallbackSys);
          const idHash = crypto
            .createHash('sha1')
            .update(`pubmed:${pmid}`)
            .digest('hex')
            .slice(0, 10);

          updates.push({
            id: `upd_pm_${idHash}`,
            systemId: sysId,
            systemLabel: BODY_SYSTEM_LABELS[sysId] || 'Cross-System',
            category: 'Guideline Update',
            title: cleanTitle,
            summary: `Indexed in NIH PubMed (${journal}, ${pubDate}). Highlights contemporary pharmacotherapy evidence relevant to ${
              BODY_SYSTEM_LABELS[sysId] || 'clinical therapeutics'
            }.`,
            clinicalImpact:
              'Review full study protocol and dosing parameters on PubMed before bedside application.',
            affectedDrugs: [],
            checkedAt: nowIso,
            sources: [
              {
                title: `PubMed · ${journal} (${pubDate})`,
                uri: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
              },
            ],
          });
        }
      }
    }

    // 2. Live openFDA Drug Safety / Recall Enforcement alerts
    const seenBatchIds = new Set<string>(updates.map((u) => u.id));
    for (const rec of fdaEnforcement?.results ?? []) {
      if (!rec.reason_for_recall || !rec.product_description) continue;
      const productShort = rec.product_description.split(',')[0].trim().slice(0, 75);
      const textForClass = `${rec.product_description} ${rec.reason_for_recall}`;
      const sysId = classifyBodySystem(textForClass, fallbackSys);
      if (focusSystem !== 'all' && sysId !== focusSystem && updates.length >= 4) {
        continue;
      }
      const drugNames = Array.from(
        new Set([
          ...(rec.openfda?.generic_name ?? []),
          ...(rec.openfda?.brand_name ?? []),
        ])
      )
        .map((d) => d.trim())
        .filter(Boolean)
        .slice(0, 4);
      const reportDate = rec.report_date
        ? `${rec.report_date.slice(0, 4)}-${rec.report_date.slice(4, 6)}-${rec.report_date.slice(6, 8)}`
        : 'Recent';
      const recallId = rec.recall_number || productShort;
      const idHash = crypto
        .createHash('sha1')
        .update(`fda_rec:${recallId}:${sysId}`)
        .digest('hex')
        .slice(0, 10);
      const itemId = `upd_fda_rec_${idHash}`;
      if (seenBatchIds.has(itemId)) continue;
      seenBatchIds.add(itemId);

      updates.push({
        id: itemId,
        systemId: sysId,
        systemLabel: BODY_SYSTEM_LABELS[sysId] || 'Cross-System',
        category: 'FDA Safety Alert',
        title: `FDA ${rec.classification || 'Enforcement'}: ${productShort}`,
        summary: `${rec.reason_for_recall.trim().slice(0, 260)} (FDA report date: ${reportDate}).`,
        clinicalImpact:
          'Verify lot numbers and NDC packaging in pharmacy inventory; counsel affected patients if dispensed.',
        affectedDrugs: drugNames,
        checkedAt: nowIso,
        sources: [
          {
            title: 'openFDA Drug Enforcement Database',
            uri: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
          },
        ],
      });
      if (updates.filter((u) => u.category === 'FDA Safety Alert').length >= 3) {
        break;
      }
    }

    // 3. Live openFDA NDA/BLA Regulatory Actions & Approvals
    for (const entry of fdaApprovals?.results ?? []) {
      const generic = entry.openfda?.generic_name?.[0];
      const brand =
        entry.openfda?.brand_name?.[0] || entry.products?.[0]?.brand_name;
      const pharmClass = entry.openfda?.pharm_class_epc?.[0] || '';
      const activeList =
        entry.products?.[0]?.active_ingredients
          ?.map((a) => a.name || '')
          .filter(Boolean) ?? [];
      const primaryDrug = brand || generic || activeList[0];
      if (!primaryDrug) continue;

      const latestSub = entry.submissions?.[0];
      const subDateRaw = latestSub?.submission_status_date || '';
      const subDate =
        subDateRaw.length === 8
          ? `${subDateRaw.slice(0, 4)}-${subDateRaw.slice(4, 6)}-${subDateRaw.slice(6, 8)}`
          : 'Recent';
      const textForClass = `${primaryDrug} ${generic || ''} ${pharmClass}`;
      const sysId = classifyBodySystem(textForClass, fallbackSys);
      const title = `FDA Regulatory Update: ${primaryDrug}${
        generic && brand && generic.toLowerCase() !== brand.toLowerCase()
          ? ` (${generic})`
          : ''
      }`.slice(0, 120);
      const idHash = crypto
        .createHash('sha1')
        .update(`fda_app:${entry.application_number || title}:${sysId}`)
        .digest('hex')
        .slice(0, 10);
      const itemId = `upd_fda_app_${idHash}`;
      if (seenBatchIds.has(itemId)) continue;
      seenBatchIds.add(itemId);

      updates.push({
        id: itemId,
        systemId: sysId,
        systemLabel: BODY_SYSTEM_LABELS[sysId] || 'Cross-System',
        category: 'New Approval',
        title,
        summary: `FDA application ${entry.application_number || ''} (${
          entry.sponsor_name || 'Sponsor'
        }) — ${
          latestSub?.submission_class_code_description ||
          latestSub?.submission_type ||
          'Labeling / Regulatory action'
        } recorded ${subDate}.${pharmClass ? ` Class: ${pharmClass}.` : ''}`.trim(),
        clinicalImpact:
          'Consult current Drugs@FDA labeling for updated indications, dosage modifications, and monitoring.',
        affectedDrugs: Array.from(
          new Set([primaryDrug, generic || '', ...activeList].filter(Boolean))
        ).slice(0, 4),
        checkedAt: nowIso,
        sources: [
          {
            title: `Drugs@FDA (${entry.application_number || 'FDA'})`,
            uri: entry.application_number
              ? `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${encodeURIComponent(
                  entry.application_number.replace(/^[A-Z]+/, '')
                )}`
              : 'https://www.accessdata.fda.gov/scripts/cder/daf/',
          },
        ],
      });
      if (updates.filter((u) => u.category === 'New Approval').length >= 3) {
        break;
      }
    }

    return dedupeLiveUpdates(updates).slice(0, 10);
  };

  const runLiveClinicalUpdateCycle = async (
    requestedFocus = 'all'
  ): Promise<LiveFeedPersistedState> => {
    if (activeRefreshPromise) {
      return activeRefreshPromise;
    }

    const focusSystem = BODY_SYSTEM_LABELS[requestedFocus]
      ? requestedFocus
      : 'all';

    activeRefreshPromise = (async () => {
      const ai = getAiClient();
      const nowIso = new Date().toISOString();
      const nextIso = new Date(Date.now() + LIVE_UPDATE_INTERVAL_MS).toISOString();

      liveFeedState.isRefreshing = true;
      liveFeedState.focusSystem = focusSystem;
      liveFeedState.lastError = null;

      try {
        let freshUpdates: LiveClinicalUpdateRecord[] = [];
        let geminiErrorMessage: string | null = null;

        if (ai) {
          const todayDate = nowIso.slice(0, 10);
          const focusInstruction =
            focusSystem === 'all'
              ? 'Cover high-impact updates spanning diverse human body systems (cardiovascular, respiratory, nervous, renal, digestive, endocrine, immune, hematologic, musculoskeletal, integumentary, reproductive, sensory).'
              : `Focus specifically on recent updates, guidelines, FDA safety communications, and pharmacotherapy developments affecting the ${BODY_SYSTEM_LABELS[focusSystem]} system (systemId: "${focusSystem}").`;

          const prompt = `Today's date is ${todayDate}. Perform a live medical & clinical pharmacology web search for the most up-to-date evidence-based clinical therapeutics information, FDA drug approvals, safety/boxed warning updates, and major guideline revisions (AHA/ACC, ADA, GOLD, GINA, KDIGO, IDSA, AAN, NCCN, etc.).

${focusInstruction}

Return ONLY a valid JSON array of 6 concise, factual clinical update objects (no markdown outside the JSON array). Each object MUST use this exact shape:
{
  "systemId": one of ["cardiovascular","respiratory","nervous","renal","digestive","endocrine","immune","hematologic","musculoskeletal","integumentary","reproductive","sensory","general"],
  "category": one of ["Guideline Update","FDA Safety Alert","New Approval","Dosing & PK"],
  "title": "concise clinical headline (max 90 chars)",
  "summary": "2-3 accurate sentences summarizing what changed or is currently recommended for clinical pharmacy/medical practice.",
  "clinicalImpact": "1 short actionable board-exam or bedside verification takeaway.",
  "affectedDrugs": ["Drug 1", "Drug 2"]
}`;

          const searchModels: Array<{
            model: string;
            thinkingLevel: ThinkingLevel;
          }> = [
            { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
            { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
          ];

          for (const cfg of searchModels) {
            try {
              const response = await withTimeout(
                ai.models.generateContent({
                  model: cfg.model,
                  contents: prompt,
                  config: {
                    tools: [{ googleSearch: {} }],
                    thinkingConfig: { thinkingLevel: cfg.thinkingLevel },
                  },
                }),
                28_000,
                `Live clinical search (${cfg.model})`
              );

              const rawText = (response.text ?? '').trim();
              if (!rawText) {
                throw new Error('Received empty response from live clinical search.');
              }

              const rawChunks =
                response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
              const sources: LiveUpdateSourceRecord[] = [];
              const seenUris = new Set<string>();
              for (const chunk of rawChunks) {
                const web = (chunk as { web?: { uri?: string; title?: string } })?.web;
                if (!web?.uri || typeof web.uri !== 'string') continue;
                if (
                  !web.uri.startsWith('https://') &&
                  !web.uri.startsWith('http://')
                ) {
                  continue;
                }
                if (seenUris.has(web.uri)) continue;
                seenUris.add(web.uri);
                sources.push({
                  title: String(web.title || web.uri).trim().slice(0, 100),
                  uri: web.uri,
                });
                if (sources.length >= 6) break;
              }

              const parsedItems = parseJsonArrayFromText(rawText);
              const validCategories = new Set([
                'Guideline Update',
                'FDA Safety Alert',
                'New Approval',
                'Dosing & PK',
              ]);

              freshUpdates = parsedItems
                .slice(0, 8)
                .map((item, idx) => {
                  const rawSys = String(item.systemId || '').trim().toLowerCase();
                  const sysId = BODY_SYSTEM_LABELS[rawSys]
                    ? rawSys
                    : focusSystem !== 'all'
                    ? focusSystem
                    : 'general';
                  const rawCat = String(item.category || '').trim();
                  const category = validCategories.has(rawCat)
                    ? (rawCat as LiveClinicalUpdateRecord['category'])
                    : 'Guideline Update';
                  const title = String(item.title || 'Clinical Therapeutics Update')
                    .trim()
                    .slice(0, 140);
                  const idHash = crypto
                    .createHash('sha1')
                    .update(`${sysId}:${title.toLowerCase()}`)
                    .digest('hex')
                    .slice(0, 10);

                  return {
                    id: `upd_${idHash}_${idx}`,
                    systemId: sysId,
                    systemLabel: BODY_SYSTEM_LABELS[sysId] || 'Cross-System',
                    category,
                    title,
                    summary: String(item.summary || '').trim(),
                    clinicalImpact: String(item.clinicalImpact || '').trim(),
                    affectedDrugs: Array.isArray(item.affectedDrugs)
                      ? item.affectedDrugs
                          .map((d) => String(d).trim())
                          .filter(Boolean)
                          .slice(0, 5)
                      : [],
                    checkedAt: nowIso,
                    sources,
                  };
                })
                .filter((u) => u.summary.length > 0);

              if (freshUpdates.length > 0) {
                break;
              }
            } catch (err: unknown) {
              geminiErrorMessage = extractFriendlyErrorMessage(
                err,
                'Live Gemini clinical search unavailable.'
              );
            }
          }
        }

        // Fall back to live openFDA & NIH PubMed public feeds whenever Gemini search is unavailable or over quota
        if (freshUpdates.length === 0) {
          freshUpdates = await fetchPublicBiomedicalUpdates(focusSystem, nowIso);
        }

        if (freshUpdates.length === 0) {
          throw new Error(
            geminiErrorMessage ||
              'Unable to retrieve live clinical updates from Gemini search or FDA/PubMed feeds.'
          );
        }

        // Merge with prior updates keeping newest unique items by both id and title
        liveFeedState.updates = dedupeLiveUpdates([
          ...freshUpdates,
          ...liveFeedState.updates,
        ]).slice(0, 36);
        liveFeedState.lastCheckedAt = nowIso;
        liveFeedState.lastSuccessAt = nowIso;
        liveFeedState.nextScheduledCheckAt = nextIso;
        liveFeedState.lastError = null;
        liveFeedState.isRefreshing = false;
        savePersistedLiveFeed(liveFeedState);
        return { ...liveFeedState };
      } catch (err: unknown) {
        const msg = extractFriendlyErrorMessage(
          err,
          'Unable to complete live clinical update.'
        );
        liveFeedState.isRefreshing = false;
        liveFeedState.lastCheckedAt = nowIso;
        liveFeedState.nextScheduledCheckAt = nextIso;
        liveFeedState.lastError = msg;
        savePersistedLiveFeed(liveFeedState);
        throw err;
      } finally {
        activeRefreshPromise = null;
      }
    })();

    return activeRefreshPromise;
  };

  app.get('/api/clinical-updates', (_req: Request, res: Response) => {
    res.json({
      ...liveFeedState,
      isRefreshing: Boolean(activeRefreshPromise),
    });
  });

  app.post('/api/clinical-updates/refresh', async (req: Request, res: Response) => {
    try {
      const focusSystem =
        typeof req.body?.focusSystem === 'string'
          ? req.body.focusSystem.trim()
          : 'all';
      const updated = await runLiveClinicalUpdateCycle(focusSystem);
      res.json(updated);
    } catch (err: unknown) {
      const msg = extractFriendlyErrorMessage(
        err,
        'Live clinical update check failed.'
      );
      const status =
        typeof (err as { status?: number })?.status === 'number'
          ? (err as { status: number }).status
          : 500;
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: msg,
        ...liveFeedState,
        isRefreshing: false,
      });
    }
  });

  // Ensure unknown /api/* paths always return JSON instead of SPA HTML
  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // 24/7 continuous background scheduler (every 6 hours)
  setInterval(() => {
    void runLiveClinicalUpdateCycle('all').catch(() => {
      // Errors are captured on liveFeedState.lastError for UI visibility
    });
  }, LIVE_UPDATE_INTERVAL_MS);

  // Trigger non-blocking initial live check after boot if stale (>6h) or empty
  const lastSuccessMs = liveFeedState.lastSuccessAt
    ? new Date(liveFeedState.lastSuccessAt).getTime()
    : 0;
  const isInitialStale =
    !lastSuccessMs ||
    Date.now() - lastSuccessMs >= LIVE_UPDATE_INTERVAL_MS ||
    liveFeedState.updates.length === 0;
  if (isInitialStale) {
    setTimeout(() => {
      void runLiveClinicalUpdateCycle('all').catch(() => {});
    }, 2500);
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apotheca server listening on http://0.0.0.0:${PORT}`);
  });
  server.requestTimeout = 300_000;
}

startServer();
