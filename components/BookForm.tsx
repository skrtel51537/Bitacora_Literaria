import React, { useState, useRef, useEffect } from 'react';
import { Book, BookType, BookFormat, GeneralData, NovelAnalysis, EssayAnalysis } from '../types';
import { Save, ArrowLeft, BookOpen, ScrollText, Image as ImageIcon, Search, Loader2, Bold, Italic, List as ListIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { searchBookCover } from '../services/bookService';

interface BookFormProps {
  initialBook?: Book;
  onSave: (book: Book) => void;
  onCancel: () => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const emptyGeneral: GeneralData = {
  title: '',
  author: '',
  rating: 0,
  format: 'Físico',
  motivation: '',
  coverUrl: '',
};

const emptyNovel: NovelAnalysis = {
  historicalContext: '',
  protagonist: '',
  antagonist: '',
  secondaryCharacters: '',
  evolution: '',
  readingLog: '',
  themes: '',
  worldbuilding: '',
  mainQuote: '',
  otherQuotes: '',
  conclusionSatisfaction: '',
  authorMessage: '',
  personalConnection: '',
  relatedResources: '',
};

const emptyEssay: EssayAnalysis = {
  bigIdea: '',
  problemSolved: '',
  keyIdeas: '',
  vocabulary: '',
  mainQuote: '',
  otherQuotes: '',
  mindsetShift: '',
  actionPlan: '',
  relatedResources: '',
};

interface RichEditorProps {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string;
  placeholder?: string;
  minHeight?: string;
}

const RichEditor = ({ value, onChange, className, placeholder, minHeight = "80px" }: RichEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      const cleanHtml = html === '<br>' ? '' : html;
      onChange({ target: { value: cleanHtml } });
    }
  };

  const execFormat = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  return (
    <div className={`border border-stone-200 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-stone-400 focus-within:border-stone-400 transition-shadow overflow-hidden group flex flex-col ${className}`}>
      <div className="flex items-center gap-1 p-1.5 border-b border-stone-200 bg-stone-50 text-stone-600 select-none">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); execFormat('bold'); }}
          className="p-1.5 hover:bg-stone-200/50 rounded transition-colors"
          title="Negrita"
        >
          <Bold size={14} strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); execFormat('italic'); }}
          className="p-1.5 hover:bg-stone-200/50 rounded transition-colors"
          title="Cursiva"
        >
          <Italic size={14} />
        </button>
        <div className="w-px h-4 bg-stone-300 mx-1"></div>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); execFormat('insertUnorderedList'); }}
          className="p-1.5 hover:bg-stone-200/50 rounded transition-colors"
          title="Lista"
        >
          <ListIcon size={14} />
        </button>
      </div>

      <div className="relative flex-grow cursor-text bg-white">
        {!value && placeholder && (
          <div className="absolute top-3 left-4 text-stone-400 pointer-events-none truncate w-full pr-8">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full px-4 py-3 bg-white text-stone-800 focus:outline-none block break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
};

// Helper to migrate legacy data
const migrateNovelData = (data: NovelAnalysis): NovelAnalysis => {
  if (data.quotes && !data.mainQuote && !data.otherQuotes) {
    return { ...data, mainQuote: data.quotes, otherQuotes: '', relatedResources: data.relatedResources || '' };
  }
  return { ...data, mainQuote: data.mainQuote || '', otherQuotes: data.otherQuotes || '', relatedResources: data.relatedResources || '' };
};

const migrateEssayData = (data: EssayAnalysis): EssayAnalysis => {
  if (data.goldenNuggets && !data.mainQuote && !data.otherQuotes) {
    return { ...data, mainQuote: data.goldenNuggets, otherQuotes: '', relatedResources: data.relatedResources || '' };
  }
  return { ...data, mainQuote: data.mainQuote || '', otherQuotes: data.otherQuotes || '', relatedResources: data.relatedResources || '' };
};

const DRAFT_KEY_PREFIX = 'bibliotheca_draft_';

interface FormDraft {
  type: BookType;
  general: GeneralData;
  novelData: NovelAnalysis;
  essayData: EssayAnalysis;
  savedAt: number;
}

const readDraft = (key: string): FormDraft | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.general && parsed.novelData && parsed.essayData && parsed.type) {
      return parsed as FormDraft;
    }
  } catch (e) {
    console.error('Error leyendo borrador:', e);
  }
  return null;
};

export const BookForm: React.FC<BookFormProps> = ({ initialBook, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'analysis' | 'conclusion'>('general');
  const [type, setType] = useState<BookType>(initialBook?.type || 'Novela');
  const [general, setGeneral] = useState<GeneralData>(initialBook?.general || emptyGeneral);
  const [novelData, setNovelData] = useState<NovelAnalysis>(
    initialBook?.novelAnalysis ? migrateNovelData(initialBook.novelAnalysis) : emptyNovel
  );
  const [essayData, setEssayData] = useState<EssayAnalysis>(
    initialBook?.essayAnalysis ? migrateEssayData(initialBook.essayAnalysis) : emptyEssay
  );

  const [loadingCover, setLoadingCover] = useState(false);

  // Borrador: clave por libro (o 'new' para altas) y snapshot del estado inicial
  const draftKey = DRAFT_KEY_PREFIX + (initialBook?.id || 'new');
  const [pendingDraft, setPendingDraft] = useState<FormDraft | null>(() => readDraft(draftKey));

  const initialSnapshotRef = useRef<string | null>(null);
  if (initialSnapshotRef.current === null) {
    initialSnapshotRef.current = JSON.stringify({ type, general, novelData, essayData });
  }

  const isDirty = () =>
    JSON.stringify({ type, general, novelData, essayData }) !== initialSnapshotRef.current;

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch (e) {
      console.error('Error borrando borrador:', e);
    }
  };

  // Autoguardado del borrador (con pequeño debounce) mientras haya cambios sin guardar
  useEffect(() => {
    if (!isDirty()) return;
    const timer = setTimeout(() => {
      try {
        const draft: FormDraft = { type, general, novelData, essayData, savedAt: Date.now() };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch (e) {
        console.error('Error guardando borrador:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [type, general, novelData, essayData]);

  const handleRestoreDraft = () => {
    if (!pendingDraft) return;
    setType(pendingDraft.type);
    setGeneral({ ...emptyGeneral, ...pendingDraft.general });
    setNovelData(migrateNovelData({ ...emptyNovel, ...pendingDraft.novelData }));
    setEssayData(migrateEssayData({ ...emptyEssay, ...pendingDraft.essayData }));
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setPendingDraft(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!general.title.trim()) {
      alert("El título es obligatorio");
      setActiveTab('general');
      return;
    }

    const newBook: Book = {
      id: initialBook?.id || generateId(),
      type,
      general: { ...general },
      novelAnalysis: type === 'Novela' ? { ...novelData } : undefined,
      essayAnalysis: type === 'Ensayo' ? { ...essayData } : undefined,
      createdAt: initialBook?.createdAt || Date.now(),
    };

    clearDraft();
    onSave(newBook);
  };

  const handleCancel = () => {
    if (isDirty()) {
      if (!confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir y descartarlos?')) {
        return;
      }
      clearDraft();
    }
    onCancel();
  };

  // Evita que Enter en un campo de texto envíe el formulario (guardado accidental)
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
    }
  };

  const handleSearchCover = async () => {
    if (!general.title) return;
    setLoadingCover(true);
    try {
      const url = await searchBookCover(general.title, general.author);
      if (url) {
        setGeneral(prev => ({ ...prev, coverUrl: url }));
      } else {
        alert("No se encontró ninguna portada automática.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCover(false);
    }
  };

  const inputBaseClasses = "w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:outline-none bg-white text-stone-800 placeholder:text-stone-400 transition-shadow shadow-sm";
  const labelClasses = "block text-sm font-medium text-stone-700 mb-1";
  const sectionTitleClasses = "text-lg font-serif font-semibold text-stone-800 flex items-center gap-2";
  const badgeClasses = "bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded text-sm shadow-sm";

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between sticky top-0 bg-stone-100/95 backdrop-blur-md z-10 p-4 border-b border-stone-200 rounded-b-xl shadow-sm">
        <button type="button" onClick={handleCancel} className="text-stone-600 hover:text-stone-800 flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Cancelar</span>
        </button>

        {/* Tab Navigation */}
        <div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'general' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
          >
            Ficha
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'analysis' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
          >
            Análisis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('conclusion')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'conclusion' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
          >
            Cierre
          </button>
        </div>

        <button
          type="submit"
          className="bg-stone-700 text-white px-6 py-2 rounded-full hover:bg-stone-800 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
        >
          <Save size={18} /> <span className="hidden sm:inline">Guardar</span>
        </button>
      </div>

      {/* Draft recovery banner */}
      {pendingDraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <p className="text-sm text-amber-800">
            Hay un borrador sin guardar de esta ficha ({new Date(pendingDraft.savedAt).toLocaleString()}). ¿Quieres recuperarlo?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Recuperar
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="bg-white border border-amber-300 text-amber-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200 min-h-[600px] flex flex-col">

        {/* Tab 1: General Data */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-1 rounded-lg flex space-x-1 shadow-sm border border-stone-200">
                <button
                  type="button"
                  onClick={() => setType('Novela')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${type === 'Novela' ? 'bg-stone-100 text-stone-800 font-bold' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                    }`}
                >
                  <BookOpen size={16} /> Novela
                </button>
                <button
                  type="button"
                  onClick={() => setType('Ensayo')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${type === 'Ensayo' ? 'bg-stone-100 text-stone-800 font-bold' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                    }`}
                >
                  <ScrollText size={16} /> Ensayo
                </button>
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-6">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Título</label>
                  <input
                    required
                    className={inputBaseClasses}
                    value={general.title}
                    onChange={e => setGeneral({ ...general, title: e.target.value })}
                    placeholder="Ej. Cien años de soledad"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClasses}>Autor</label>
                  <input
                    required
                    className={inputBaseClasses}
                    value={general.author}
                    onChange={e => setGeneral({ ...general, author: e.target.value })}
                    placeholder="Ej. Gabriel García Márquez"
                  />
                </div>

                <div>
                  <label className={labelClasses}>Formato</label>
                  <select
                    className={inputBaseClasses}
                    value={general.format}
                    onChange={e => setGeneral({ ...general, format: e.target.value as BookFormat })}
                  >
                    <option value="Físico">Físico</option>
                    <option value="Digital">Digital</option>
                  </select>
                </div>

                <div>
                  <label className={labelClasses}>Puntuación (1-5)</label>
                  <div className="flex gap-2 h-[42px] items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setGeneral({ ...general, rating: star })}
                        className={`text-2xl transition-transform hover:scale-110 ${general.rating >= star ? 'text-amber-400' : 'text-stone-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-48 flex flex-col gap-3">
                <label className={labelClasses}>Portada</label>
                <div className="relative aspect-[2/3] w-full rounded-lg border-2 border-dashed border-stone-300 bg-stone-100 flex items-center justify-center overflow-hidden group">
                  {general.coverUrl ? (
                    <>
                      <img src={general.coverUrl} alt="Portada" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGeneral({ ...general, coverUrl: '' })}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="mx-auto text-stone-400 mb-1" size={24} />
                      <span className="text-xs text-stone-500">Sin portada</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSearchCover}
                  disabled={loadingCover || !general.title}
                  className="w-full bg-white border border-stone-300 text-stone-700 py-1.5 px-3 rounded text-sm font-medium hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingCover ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Buscar Carátula
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className={labelClasses}>¿Por qué leí este libro?</label>
              <RichEditor
                minHeight="60px"
                value={general.motivation}
                onChange={e => setGeneral({ ...general, motivation: e.target.value })}
                placeholder="Define tu intención antes de empezar..."
              />
            </div>
          </div>
        )}

        {/* Tab 2: Analysis */}
        {activeTab === 'analysis' && (
          <div className="space-y-8 animate-fade-in">
            {type === 'Novela' ? (
              <>
                <section className="space-y-4">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>A</span> Marco o Contexto Histórico
                  </h3>
                  <RichEditor
                    placeholder="Época, lugar, sucesos históricos relevantes..."
                    minHeight="80px"
                    value={novelData.historicalContext}
                    onChange={e => setNovelData({ ...novelData, historicalContext: e.target.value })}
                  />
                </section>

                <section className="space-y-4 pt-4 border-t border-stone-200">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>B</span> Análisis de Personajes
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClasses}>Protagonista</label>
                      <RichEditor
                        placeholder="Nombre, motivación, rasgos..."
                        minHeight="60px"
                        value={novelData.protagonist}
                        onChange={e => setNovelData({ ...novelData, protagonist: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Antagonista</label>
                      <RichEditor
                        placeholder="Nombre, conflicto con el protagonista..."
                        minHeight="50px"
                        value={novelData.antagonist}
                        onChange={e => setNovelData({ ...novelData, antagonist: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Personajes Secundarios</label>
                      <RichEditor
                        minHeight="60px"
                        value={novelData.secondaryCharacters}
                        onChange={e => setNovelData({ ...novelData, secondaryCharacters: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Evolución</label>
                      <RichEditor
                        placeholder="Arco de transformación..."
                        minHeight="60px"
                        value={novelData.evolution}
                        onChange={e => setNovelData({ ...novelData, evolution: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pt-4 border-t border-stone-200">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>C</span> Bitácora de Lectura
                  </h3>
                  <RichEditor
                    placeholder="Resumen, capítulos clave, giros inesperados..."
                    minHeight="140px"
                    value={novelData.readingLog}
                    onChange={e => setNovelData({ ...novelData, readingLog: e.target.value })}
                  />
                </section>

                <section className="space-y-4 pt-4 border-t border-stone-200">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>D</span> Elementos Literarios
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClasses}>Temas Principales</label>
                      <RichEditor
                        minHeight="60px"
                        value={novelData.themes}
                        onChange={e => setNovelData({ ...novelData, themes: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Ambientación</label>
                      <RichEditor
                        minHeight="60px"
                        value={novelData.worldbuilding}
                        onChange={e => setNovelData({ ...novelData, worldbuilding: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pt-4 border-t border-stone-200">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>E</span> Citas
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClasses}>La Cita (la que define el libro)</label>
                      <RichEditor
                        placeholder="La frase más representativa o impactante del libro..."
                        minHeight="60px"
                        value={novelData.mainQuote}
                        onChange={e => setNovelData({ ...novelData, mainQuote: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Otras Citas</label>
                      <RichEditor
                        placeholder="Otras frases memorables..."
                        minHeight="80px"
                        value={novelData.otherQuotes}
                        onChange={e => setNovelData({ ...novelData, otherQuotes: e.target.value })}
                      />
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-4">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>A</span> La Tesis Central
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClasses}>La Gran Idea</label>
                      <RichEditor
                        placeholder="El núcleo del ensayo..."
                        minHeight="60px"
                        value={essayData.bigIdea}
                        onChange={e => setEssayData({ ...essayData, bigIdea: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Problema que resuelve</label>
                      <RichEditor
                        minHeight="60px"
                        value={essayData.problemSolved}
                        onChange={e => setEssayData({ ...essayData, problemSolved: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pt-4 border-t border-stone-200">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>B</span> Los Argumentos Principales
                  </h3>
                  <RichEditor
                    placeholder="Listado de puntos clave..."
                    minHeight="140px"
                    value={essayData.keyIdeas}
                    onChange={e => setEssayData({ ...essayData, keyIdeas: e.target.value })}
                  />
                </section>

                <section className="space-y-4 pt-4 border-t border-stone-200">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>C</span> Conceptos y Vocabulario
                  </h3>
                  <RichEditor
                    minHeight="80px"
                    value={essayData.vocabulary}
                    onChange={e => setEssayData({ ...essayData, vocabulary: e.target.value })}
                  />
                </section>

                <section className="space-y-4 pt-4 border-t border-stone-200">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>D</span> Citas
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClasses}>La Cita (la que define el ensayo)</label>
                      <RichEditor
                        placeholder="La frase más representativa o impactante..."
                        minHeight="60px"
                        value={essayData.mainQuote}
                        onChange={e => setEssayData({ ...essayData, mainQuote: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Otras Citas y Golden Nuggets</label>
                      <RichEditor
                        placeholder="Otras frases memorables o ideas clave..."
                        minHeight="80px"
                        value={essayData.otherQuotes}
                        onChange={e => setEssayData({ ...essayData, otherQuotes: e.target.value })}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Conclusion */}
        {activeTab === 'conclusion' && (
          <div className="space-y-8 animate-fade-in">
            {type === 'Novela' ? (
              <>
                <section className="space-y-4">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>F</span> Conclusión y Reflexión
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClasses}>¿Final satisfactorio?</label>
                      <RichEditor
                        minHeight="60px"
                        value={novelData.conclusionSatisfaction}
                        onChange={e => setNovelData({ ...novelData, conclusionSatisfaction: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Mensaje o Tesis del Autor</label>
                      <RichEditor
                        minHeight="60px"
                        value={novelData.authorMessage}
                        onChange={e => setNovelData({ ...novelData, authorMessage: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Conexión Personal</label>
                      <RichEditor
                        placeholder="¿Qué te dice a ti personalmente?"
                        minHeight="80px"
                        value={novelData.personalConnection}
                        onChange={e => setNovelData({ ...novelData, personalConnection: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pt-4 border-t border-stone-200">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>G</span> Para Seguir Explorando
                  </h3>
                  <RichEditor
                    placeholder="Críticas, reseñas, películas o series basadas en el libro, otras lecturas relacionadas..."
                    minHeight="100px"
                    value={novelData.relatedResources}
                    onChange={e => setNovelData({ ...novelData, relatedResources: e.target.value })}
                  />
                </section>
              </>
            ) : (
              <>
                <section className="space-y-4">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>E</span> Plan de Acción
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClasses}>Cambio de Mentalidad</label>
                      <RichEditor
                        minHeight="60px"
                        value={essayData.mindsetShift}
                        onChange={e => setEssayData({ ...essayData, mindsetShift: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Acciones concretas</label>
                      <RichEditor
                        placeholder="¿Qué vas a aplicar?"
                        minHeight="80px"
                        value={essayData.actionPlan}
                        onChange={e => setEssayData({ ...essayData, actionPlan: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pt-4 border-t border-stone-200">
                  <h3 className={sectionTitleClasses}>
                    <span className={badgeClasses}>F</span> Para Seguir Explorando
                  </h3>
                  <RichEditor
                    placeholder="Críticas, reseñas, charlas TED, otros ensayos relacionados..."
                    minHeight="100px"
                    value={essayData.relatedResources}
                    onChange={e => setEssayData({ ...essayData, relatedResources: e.target.value })}
                  />
                </section>
              </>
            )}
          </div>
        )}

        {/* Navigation Footer */}
        <div className="mt-auto pt-8 flex justify-between">
          {activeTab !== 'general' ? (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'analysis' ? 'general' : 'analysis')}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-800"
            >
              <ChevronLeft size={20} /> Anterior
            </button>
          ) : (
            <div></div>
          )}

          {/* Las 'key' fuerzan nodos DOM distintos: si React reutilizara el mismo <button>
              y cambiara type de "button" a "submit" durante el clic, el navegador
              enviaría el formulario al pulsar "Siguiente" en la pestaña Análisis. */}
          {activeTab !== 'conclusion' ? (
            <button
              key="next-step"
              type="button"
              onClick={() => setActiveTab(activeTab === 'general' ? 'analysis' : 'conclusion')}
              className="flex items-center gap-2 text-stone-800 font-medium hover:opacity-80"
            >
              Siguiente <ChevronRight size={20} />
            </button>
          ) : (
            <button
              key="submit-book"
              type="submit"
              className="bg-stone-800 text-white px-8 py-2 rounded-full hover:bg-stone-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
            >
              <Save size={18} /> Guardar Lectura
            </button>
          )}
        </div>
      </div>
    </form>
  );
};