import { Book, BookType, BookFormat, ReadingStatus, GeneralData, NovelAnalysis, EssayAnalysis } from '../types';
import { sanitizeHtml } from './sanitize';

export interface ImportResult {
  books: Book[];
  discarded: number;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const str = (v: unknown): string => (typeof v === 'string' ? sanitizeHtml(v) : '');

const plainStr = (v: unknown): string => {
  if (typeof v !== 'string') return '';
  // Campos que se muestran como texto plano: quitamos cualquier etiqueta
  const div = document.createElement('div');
  div.innerHTML = sanitizeHtml(v);
  return (div.textContent || '').trim();
};

const VALID_STATUSES: ReadingStatus[] = ['Por leer', 'Leyendo', 'Terminado'];

const isoDate = (v: unknown): string | undefined => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined;
  return isNaN(new Date(v + 'T00:00:00').getTime()) ? undefined : v;
};

const parseGeneral = (raw: any): GeneralData | null => {
  if (!raw || typeof raw !== 'object') return null;
  const title = plainStr(raw.title);
  if (!title) return null;
  const rating = typeof raw.rating === 'number' ? Math.max(0, Math.min(5, Math.round(raw.rating))) : 0;
  const format: BookFormat = raw.format === 'Digital' ? 'Digital' : 'Físico';
  // Aceptamos URLs http(s) y portadas locales embebidas como data:image
  const coverUrl = typeof raw.coverUrl === 'string' && /^(https?:\/\/|data:image\/)/.test(raw.coverUrl) ? raw.coverUrl : '';
  return {
    title,
    author: plainStr(raw.author),
    rating,
    format,
    motivation: str(raw.motivation),
    coverUrl,
    status: VALID_STATUSES.includes(raw.status) ? (raw.status as ReadingStatus) : undefined,
    startDate: isoDate(raw.startDate),
    endDate: isoDate(raw.endDate),
  };
};

const parseNovel = (raw: any): NovelAnalysis | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  return {
    historicalContext: str(raw.historicalContext),
    protagonist: str(raw.protagonist),
    antagonist: str(raw.antagonist),
    secondaryCharacters: str(raw.secondaryCharacters),
    evolution: str(raw.evolution),
    readingLog: str(raw.readingLog),
    themes: str(raw.themes),
    worldbuilding: str(raw.worldbuilding),
    mainQuote: str(raw.mainQuote),
    otherQuotes: str(raw.otherQuotes),
    quotes: raw.quotes ? str(raw.quotes) : undefined,
    conclusionSatisfaction: str(raw.conclusionSatisfaction),
    authorMessage: str(raw.authorMessage),
    personalConnection: str(raw.personalConnection),
    relatedResources: str(raw.relatedResources),
  };
};

const parseEssay = (raw: any): EssayAnalysis | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  return {
    bigIdea: str(raw.bigIdea),
    problemSolved: str(raw.problemSolved),
    keyIdeas: str(raw.keyIdeas),
    vocabulary: str(raw.vocabulary),
    mainQuote: str(raw.mainQuote),
    otherQuotes: str(raw.otherQuotes),
    goldenNuggets: raw.goldenNuggets ? str(raw.goldenNuggets) : undefined,
    mindsetShift: str(raw.mindsetShift),
    actionPlan: str(raw.actionPlan),
    relatedResources: str(raw.relatedResources),
  };
};

// Valida y sanea un backup importado. Devuelve los libros válidos y cuántas
// entradas se descartaron por no tener la estructura mínima (título y tipo).
export const parseImportedBooks = (data: unknown): ImportResult | null => {
  if (!Array.isArray(data)) return null;

  const books: Book[] = [];
  let discarded = 0;

  for (const raw of data) {
    if (!raw || typeof raw !== 'object') {
      discarded++;
      continue;
    }
    const item = raw as any;
    const type: BookType | null = item.type === 'Novela' || item.type === 'Ensayo' ? item.type : null;
    const general = parseGeneral(item.general);
    if (!type || !general) {
      discarded++;
      continue;
    }
    books.push({
      id: typeof item.id === 'string' && item.id ? item.id : generateId(),
      type,
      general,
      novelAnalysis: type === 'Novela' ? parseNovel(item.novelAnalysis) : undefined,
      essayAnalysis: type === 'Ensayo' ? parseEssay(item.essayAnalysis) : undefined,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
    });
  }

  return { books, discarded };
};
