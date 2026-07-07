import React, { useMemo } from 'react';
import { Book, getBookStatus } from '../types';
import { BookOpen, ScrollText, Star, CheckCircle2 } from 'lucide-react';

interface StatsPanelProps {
  books: Book[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ books }) => {
  const stats = useMemo(() => {
    const finished = books.filter(b => getBookStatus(b) === 'Terminado');
    const reading = books.filter(b => getBookStatus(b) === 'Leyendo').length;
    const pending = books.filter(b => getBookStatus(b) === 'Por leer').length;

    const rated = books.filter(b => b.general.rating > 0);
    const avgRating = rated.length > 0
      ? rated.reduce((sum, b) => sum + b.general.rating, 0) / rated.length
      : 0;

    const novels = books.filter(b => b.type === 'Novela').length;
    const essays = books.length - novels;

    // Lecturas terminadas por año: usamos la fecha de fin si existe, si no la de alta
    const byYear = new Map<number, number>();
    for (const b of finished) {
      const year = b.general.endDate
        ? new Date(b.general.endDate + 'T00:00:00').getFullYear()
        : new Date(b.createdAt).getFullYear();
      if (!isNaN(year)) {
        byYear.set(year, (byYear.get(year) || 0) + 1);
      }
    }
    const years = [...byYear.entries()].sort((a, b) => b[0] - a[0]);
    const maxYearCount = years.reduce((max, [, count]) => Math.max(max, count), 0);

    return { finished: finished.length, reading, pending, avgRating, ratedCount: rated.length, novels, essays, years, maxYearCount };
  }, [books]);

  const tileClasses = "bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-col gap-1";
  const tileLabelClasses = "text-xs font-medium uppercase tracking-wider text-stone-500 flex items-center gap-1.5";
  const tileValueClasses = "text-2xl font-serif font-bold text-stone-800";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={tileClasses}>
          <span className={tileLabelClasses}><BookOpen size={14} /> Lecturas</span>
          <span className={tileValueClasses}>{books.length}</span>
          <span className="text-xs text-stone-500">
            {stats.novels} {stats.novels === 1 ? 'novela' : 'novelas'} · {stats.essays} {stats.essays === 1 ? 'ensayo' : 'ensayos'}
          </span>
        </div>

        <div className={tileClasses}>
          <span className={tileLabelClasses}><CheckCircle2 size={14} /> Terminados</span>
          <span className={tileValueClasses}>{stats.finished}</span>
          <span className="text-xs text-stone-500">
            {stats.reading} leyendo · {stats.pending} por leer
          </span>
        </div>

        <div className={tileClasses}>
          <span className={tileLabelClasses}><Star size={14} /> Nota media</span>
          <span className={tileValueClasses}>
            {stats.ratedCount > 0 ? stats.avgRating.toFixed(1) : '—'}
            {stats.ratedCount > 0 && <span className="text-amber-400 text-lg ml-1">★</span>}
          </span>
          <span className="text-xs text-stone-500">
            {stats.ratedCount > 0 ? `sobre ${stats.ratedCount} puntuadas` : 'sin puntuaciones'}
          </span>
        </div>

        <div className={tileClasses}>
          <span className={tileLabelClasses}><ScrollText size={14} /> Este año</span>
          <span className={tileValueClasses}>
            {stats.years.find(([y]) => y === new Date().getFullYear())?.[1] ?? 0}
          </span>
          <span className="text-xs text-stone-500">terminados en {new Date().getFullYear()}</span>
        </div>
      </div>

      {stats.years.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">Terminados por año</h3>
          <div className="space-y-2">
            {stats.years.map(([year, count]) => (
              <div key={year} className="flex items-center gap-3" title={`${year}: ${count} ${count === 1 ? 'lectura terminada' : 'lecturas terminadas'}`}>
                <span className="w-12 text-sm text-stone-600 font-medium shrink-0">{year}</span>
                <div className="flex-1 h-4 bg-stone-100 rounded-[4px] overflow-hidden">
                  <div
                    className="h-full bg-stone-600 rounded-[4px]"
                    style={{ width: `${(count / stats.maxYearCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-sm text-stone-700 text-right tabular-nums shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
