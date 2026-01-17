import React from 'react';
import { Book } from '../types';
import { ArrowLeft, Edit2, Calendar, Book as BookIcon, Target, Quote, Lightbulb, Users, Heart, History, Map, Link2 } from 'lucide-react';

interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onEdit: () => void;
}

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: string;
  className?: string;
}

const HtmlContent: React.FC<{ html: string }> = ({ html }) => {
  if (!html) return null;
  return (
    <div
      className="text-stone-600 leading-relaxed break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-1 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Section component that doesn't render if children is empty
const Section: React.FC<SectionProps> = ({ title, icon: Icon, children, className = "" }) => {
  if (!children) return null;
  return (
    <section className={`bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200 ${className}`}>
      <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
        <Icon size={18} className="text-stone-500" />
        {title}
      </h3>
      <HtmlContent html={children} />
    </section>
  );
};

// Helper to get main quote (handles legacy data)
const getMainQuote = (book: Book): string => {
  if (book.type === 'Novela' && book.novelAnalysis) {
    return book.novelAnalysis.mainQuote || book.novelAnalysis.quotes || '';
  }
  if (book.type === 'Ensayo' && book.essayAnalysis) {
    return book.essayAnalysis.mainQuote || book.essayAnalysis.goldenNuggets || '';
  }
  return '';
};

// Helper to get other quotes
const getOtherQuotes = (book: Book): string => {
  if (book.type === 'Novela' && book.novelAnalysis) {
    return book.novelAnalysis.otherQuotes || '';
  }
  if (book.type === 'Ensayo' && book.essayAnalysis) {
    return book.essayAnalysis.otherQuotes || '';
  }
  return '';
};

// Helper to check if character analysis section has any content
const hasCharacterAnalysis = (novelAnalysis: Book['novelAnalysis']): boolean => {
  if (!novelAnalysis) return false;
  return !!(novelAnalysis.protagonist || novelAnalysis.antagonist || novelAnalysis.secondaryCharacters || novelAnalysis.evolution);
};

// Helper to check if reflection section has any content
const hasReflection = (novelAnalysis: Book['novelAnalysis']): boolean => {
  if (!novelAnalysis) return false;
  return !!(novelAnalysis.conclusionSatisfaction || novelAnalysis.authorMessage || novelAnalysis.personalConnection);
};

// Helper to check if essay thesis section has any content
const hasEssayThesis = (essayAnalysis: Book['essayAnalysis']): boolean => {
  if (!essayAnalysis) return false;
  return !!(essayAnalysis.bigIdea || essayAnalysis.problemSolved);
};

// Helper to check if essay action plan has any content
const hasActionPlan = (essayAnalysis: Book['essayAnalysis']): boolean => {
  if (!essayAnalysis) return false;
  return !!(essayAnalysis.mindsetShift || essayAnalysis.actionPlan);
};

export const BookDetail: React.FC<BookDetailProps> = ({ book, onBack, onEdit }) => {
  const { general, novelAnalysis, essayAnalysis, type } = book;
  const mainQuote = getMainQuote(book);
  const otherQuotes = getOtherQuotes(book);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Navigation */}
      <div className="flex items-center justify-between sticky top-0 bg-stone-100/95 backdrop-blur-md z-10 py-4 px-2 -mx-2 rounded-b-lg">
        <button onClick={onBack} className="text-stone-600 hover:text-stone-800 flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} /> <span className="font-medium">Volver</span>
        </button>
        <button onClick={onEdit} className="text-stone-700 hover:text-stone-900 flex items-center gap-2 transition-colors bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm hover:shadow">
          <Edit2 size={16} /> <span className="text-sm font-medium">Editar</span>
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white text-stone-800 rounded-3xl shadow-sm border border-stone-200 border-l-4 border-l-stone-600 overflow-hidden relative">
        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 md:w-48 shrink-0 rounded-lg shadow-xl overflow-hidden bg-stone-100">
            {general.coverUrl ? (
              <img src={general.coverUrl} alt={general.title} className="w-full h-auto object-cover" />
            ) : (
              <div className="aspect-[2/3] flex items-center justify-center bg-stone-200 text-stone-400">
                <BookIcon size={40} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 border bg-stone-100 text-stone-700 border-stone-300`}>
              {type}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 text-stone-800 leading-tight break-words">{general.title}</h1>
            <p className="text-xl text-stone-500 font-medium mb-6 border-b border-stone-200 pb-4 inline-block break-words">{general.author}</p>

            <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-stone-600">
              <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
                <Calendar size={16} className="text-stone-500" />
                <span className="text-stone-600">Añadido: {new Date(book.createdAt).toLocaleDateString()}</span>
              </div>
              {general.rating > 0 && (
                <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200 text-amber-500">
                  <span className="text-stone-500 mr-1 text-xs uppercase font-bold">Valoración:</span>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < general.rating} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* La Cita Principal - aparece al inicio */}
      {mainQuote && (
        <div className="bg-stone-50 p-6 md:p-8 rounded-2xl border border-stone-200 text-stone-700 italic font-serif text-lg text-center relative shadow-sm">
          <Quote className="absolute top-4 left-4 text-stone-300" size={40} />
          <div className="relative z-10 px-8">
            <HtmlContent html={mainQuote} />
          </div>
          <Quote className="absolute bottom-4 right-4 text-stone-300 rotate-180" size={40} />
        </div>
      )}

      {/* Motivation */}
      {general.motivation && (
        <Section title="¿Por qué leí este libro?" icon={Target} className="border-l-4 border-l-stone-500">
          {general.motivation}
        </Section>
      )}

      {/* Novel Content */}
      {type === 'Novela' && novelAnalysis && (
        <div className="space-y-6">
          <Section title="Marco o Contexto Histórico" icon={History}>
            {novelAnalysis.historicalContext}
          </Section>

          {/* Análisis de Personajes - solo si hay contenido */}
          {hasCharacterAnalysis(novelAnalysis) && (
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <Users size={18} className="text-stone-500" />
                Análisis de Personajes
              </h3>
              <div className="text-stone-600 space-y-6">
                {novelAnalysis.protagonist && (
                  <div>
                    <strong className="text-stone-800 block mb-1">Protagonista:</strong>
                    <HtmlContent html={novelAnalysis.protagonist} />
                  </div>
                )}
                {novelAnalysis.antagonist && (
                  <div>
                    <strong className="text-stone-800 block mb-1">Antagonista:</strong>
                    <HtmlContent html={novelAnalysis.antagonist} />
                  </div>
                )}
                {novelAnalysis.secondaryCharacters && (
                  <div>
                    <strong className="text-stone-800 block mb-1">Personajes Secundarios:</strong>
                    <HtmlContent html={novelAnalysis.secondaryCharacters} />
                  </div>
                )}
                {novelAnalysis.evolution && (
                  <div>
                    <strong className="text-stone-800 block mb-1">Evolución:</strong>
                    <HtmlContent html={novelAnalysis.evolution} />
                  </div>
                )}
              </div>
            </section>
          )}

          <Section title="Bitácora de Lectura" icon={BookIcon}>
            {novelAnalysis.readingLog}
          </Section>

          <Section title="Ambientación (Worldbuilding)" icon={Map}>
            {novelAnalysis.worldbuilding}
          </Section>

          <Section title="Temas Principales" icon={Lightbulb}>
            {novelAnalysis.themes}
          </Section>

          {/* Otras Citas - bloque separado */}
          {otherQuotes && (
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <Quote size={18} className="text-stone-500" />
                Otras Citas Memorables
              </h3>
              <div className="text-stone-600 italic">
                <HtmlContent html={otherQuotes} />
              </div>
            </section>
          )}

          {/* Reflexión Final - solo si hay contenido */}
          {hasReflection(novelAnalysis) && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <Heart size={18} className="text-stone-500" />
                Reflexión Final
              </h3>
              <div className="text-stone-600 space-y-4">
                {novelAnalysis.conclusionSatisfaction && (
                  <div><strong className="text-stone-800 block mb-1">Satisfacción del final:</strong> <HtmlContent html={novelAnalysis.conclusionSatisfaction} /></div>
                )}
                {novelAnalysis.authorMessage && (
                  <div><strong className="text-stone-800 block mb-1">Mensaje del autor:</strong> <HtmlContent html={novelAnalysis.authorMessage} /></div>
                )}
                {novelAnalysis.personalConnection && (
                  <div><strong className="text-stone-800 block mb-1">Conexión Personal:</strong> <HtmlContent html={novelAnalysis.personalConnection} /></div>
                )}
              </div>
            </div>
          )}

          {/* Para Seguir Explorando */}
          {novelAnalysis.relatedResources && (
            <section className="bg-stone-50 p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-lg font-serif font-bold text-stone-700 flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <Link2 size={18} className="text-stone-500" />
                Para Seguir Explorando
              </h3>
              <div className="text-stone-600">
                <HtmlContent html={novelAnalysis.relatedResources} />
              </div>
            </section>
          )}
        </div>
      )}

      {/* Essay Content */}
      {type === 'Ensayo' && essayAnalysis && (
        <div className="space-y-6">
          {/* Tesis Central - solo si hay contenido */}
          {hasEssayThesis(essayAnalysis) && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200 border-l-4 border-l-stone-600">
              <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <Target size={18} className="text-stone-500" />
                La Tesis Central
              </h3>
              <div className="text-stone-600 space-y-4">
                {essayAnalysis.bigIdea && (
                  <div><strong className="block text-stone-800 mb-1 text-lg">La Gran Idea:</strong> <HtmlContent html={essayAnalysis.bigIdea} /></div>
                )}
                {essayAnalysis.problemSolved && (
                  <div><strong className="block text-stone-800 mb-1">Problema que resuelve:</strong> <HtmlContent html={essayAnalysis.problemSolved} /></div>
                )}
              </div>
            </div>
          )}

          <Section title="Argumentos Principales" icon={Lightbulb}>
            {essayAnalysis.keyIdeas}
          </Section>

          <Section title="Vocabulario & Conceptos" icon={BookIcon}>
            {essayAnalysis.vocabulary}
          </Section>

          {/* Otras Citas - bloque separado */}
          {otherQuotes && (
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <Quote size={18} className="text-stone-500" />
                Otras Citas y Golden Nuggets
              </h3>
              <div className="text-stone-600 italic">
                <HtmlContent html={otherQuotes} />
              </div>
            </section>
          )}

          {/* Plan de Acción - solo si hay contenido */}
          {hasActionPlan(essayAnalysis) && (
            <div className="bg-stone-50 p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-lg font-serif font-bold text-stone-700 flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <Target size={18} className="text-stone-500" />
                Plan de Acción
              </h3>
              <div className="text-stone-600 space-y-4">
                {essayAnalysis.mindsetShift && (
                  <div><strong className="block text-stone-700 mb-1">Cambio de mentalidad:</strong> <HtmlContent html={essayAnalysis.mindsetShift} /></div>
                )}
                {essayAnalysis.actionPlan && (
                  <div><strong className="block text-stone-700 mb-1">Acciones concretas:</strong> <HtmlContent html={essayAnalysis.actionPlan} /></div>
                )}
              </div>
            </div>
          )}

          {/* Para Seguir Explorando */}
          {essayAnalysis.relatedResources && (
            <section className="bg-stone-50 p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-lg font-serif font-bold text-stone-700 flex items-center gap-2 mb-4 border-b border-stone-200 pb-2">
                <Link2 size={18} className="text-stone-500" />
                Para Seguir Explorando
              </h3>
              <div className="text-stone-600">
                <HtmlContent html={essayAnalysis.relatedResources} />
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);