export type BookFormat = 'Físico' | 'Digital';
export type BookType = 'Novela' | 'Ensayo';
export type ReadingStatus = 'Por leer' | 'Leyendo' | 'Terminado';

export interface GeneralData {
  title: string;
  author: string;
  rating: number; // 1-5
  format: BookFormat;
  motivation: string; // ¿Por qué leí este libro?
  coverUrl?: string;
  status?: ReadingStatus; // Los libros antiguos no tienen el campo: se tratan como 'Terminado'
  startDate?: string; // ISO yyyy-mm-dd
  endDate?: string; // ISO yyyy-mm-dd
}

// Plantilla Novela
export interface NovelAnalysis {
  historicalContext: string; // Marco o contexto histórico
  protagonist: string;
  antagonist: string;
  secondaryCharacters: string;
  evolution: string;
  readingLog: string; // Capítulos X-Y, Momentos impactantes
  themes: string;
  worldbuilding: string;
  mainQuote: string; // La cita principal que define el libro
  otherQuotes: string; // Otras citas memorables
  quotes?: string; // Legacy field for backwards compatibility
  conclusionSatisfaction: string; // ¿El final fue satisfactorio?
  authorMessage: string;
  personalConnection: string;
  relatedResources: string; // Críticas, películas, otras lecturas relacionadas
}

// Plantilla Ensayo
export interface EssayAnalysis {
  bigIdea: string; // La Gran Idea
  problemSolved: string; // Problema que resuelve
  keyIdeas: string; // Argumentos Principales
  vocabulary: string; // Vocabulario y Conceptos Nuevos
  mainQuote: string; // La cita principal que define el ensayo
  otherQuotes: string; // Otras citas y golden nuggets
  goldenNuggets?: string; // Legacy field for backwards compatibility
  mindsetShift: string; // ¿Cómo cambia esto mi forma de pensar?
  actionPlan: string; // Acciones concretas
  relatedResources: string; // Críticas, películas, otras lecturas relacionadas
}

export interface Book {
  id: string;
  type: BookType;
  general: GeneralData;
  novelAnalysis?: NovelAnalysis;
  essayAnalysis?: EssayAnalysis;
  createdAt: number;
}

// Los libros guardados antes de existir el campo status se consideran terminados
export const getBookStatus = (book: Book): ReadingStatus => book.general.status || 'Terminado';