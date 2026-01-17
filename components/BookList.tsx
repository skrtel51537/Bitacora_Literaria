import React, { useState, useMemo } from 'react';
import { Book, BookType } from '../types';
import { BookOpen, ScrollText, Star, Plus, Download, Upload, Search, Filter, X } from 'lucide-react';

interface BookListProps {
  books: Book[];
  onAddBook: () => void;
  onSelectBook: (book: Book) => void;
  onImportBooks: (books: Book[]) => void;
}

export const BookList: React.FC<BookListProps> = ({ books, onAddBook, onSelectBook, onImportBooks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | BookType>('All');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.general.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.general.author.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'All' || book.type === filterType;

      const matchesRating = filterRating === null || book.general.rating === filterRating;

      return matchesSearch && matchesType && matchesRating;
    });
  }, [books, searchTerm, filterType, filterRating]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(books, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `biblioteca_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (Array.isArray(json)) {
            onImportBooks(json);
          } else {
            alert("El archivo no tiene el formato correcto (debe ser una lista de libros).");
          }
        } catch (err) {
          console.error(err);
          alert("Error al leer el archivo JSON.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-800 tracking-tight">Mi Biblioteca</h1>
          <p className="text-stone-500 mt-2 text-lg">Colección de análisis y reflexiones.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImportClick}
            className="bg-white text-stone-600 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-all flex items-center gap-2 font-medium text-sm shadow-sm"
            title="Importar Backup"
          >
            <Upload size={18} /> <span className="hidden sm:inline">Importar</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-white text-stone-600 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-all flex items-center gap-2 font-medium text-sm shadow-sm"
            title="Exportar Backup"
          >
            <Download size={18} /> <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={onAddBook}
            className="bg-stone-700 text-white px-5 py-2 rounded-lg hover:bg-stone-800 transition-all shadow-md shadow-stone-300/50 hover:shadow-lg flex items-center gap-2 font-medium"
          >
            <Plus size={20} /> Añadir Lectura
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800 placeholder:text-stone-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="w-px h-8 bg-stone-200 hidden md:block"></div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-200">
            <button
              onClick={() => setFilterType('All')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'All' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('Novela')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'Novela' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Novelas
            </button>
            <button
              onClick={() => setFilterType('Ensayo')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'Ensayo' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Ensayos
            </button>
          </div>

          <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-200 ml-auto md:ml-0">
            <button
              onClick={() => setFilterRating(null)}
              className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${filterRating === null ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              title="Cualquier puntuación"
            >
              <Filter size={14} />
            </button>
            {[5, 4, 3].map(score => (
              <button
                key={score}
                onClick={() => setFilterRating(filterRating === score ? null : score)}
                className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${filterRating === score ? 'bg-white text-amber-500 shadow-sm' : 'text-stone-400 hover:text-amber-500'}`}
                title={`Filtrar ${score} estrellas`}
              >
                {score} <Star size={12} fill="currentColor" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {
        books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
            <BookOpen className="mx-auto text-stone-300 mb-4" size={48} />
            <h3 className="text-xl font-medium text-stone-700">Tu biblioteca está vacía</h3>
            <p className="text-stone-500 mt-2">Comienza añadiendo tu primera lectura.</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
            <Search className="mx-auto text-stone-300 mb-4" size={48} />
            <h3 className="text-xl font-medium text-stone-700">No se encontraron resultados</h3>
            <p className="text-stone-500 mt-2">Prueba a cambiar los filtros o el término de búsqueda.</p>
            <button
              onClick={() => { setSearchTerm(''); setFilterType('All'); setFilterRating(null); }}
              className="mt-4 text-stone-600 underline hover:text-stone-800 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-stone-200 hover:border-stone-400 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="h-64 bg-stone-50 relative p-4 flex items-end justify-center overflow-hidden border-b border-stone-100">
                  {/* Type Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm border ${book.type === 'Novela' ? 'bg-white/90 border-stone-300 text-stone-700' : 'bg-white/90 border-stone-300 text-stone-600'
                      }`}>
                      {book.type}
                    </span>
                  </div>

                  {book.general.coverUrl ? (
                    <img
                      src={book.general.coverUrl}
                      alt={book.general.title}
                      className="h-full w-auto object-contain shadow-md rounded-sm transform group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-4/5 aspect-[2/3] bg-stone-200 rounded-sm shadow-md flex items-center justify-center text-stone-400">
                      {book.type === 'Novela' ? <BookOpen size={32} /> : <ScrollText size={32} />}
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex text-amber-500 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < book.general.rating ? "text-amber-500" : "text-stone-300"}>★</span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-serif font-bold text-stone-800 leading-tight group-hover:text-stone-600 transition-colors line-clamp-2">
                      {book.general.title}
                    </h3>
                    <p className="text-stone-500 text-sm mt-1 font-medium line-clamp-1">{book.general.author}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 font-medium bg-stone-100 text-stone-600 px-2 py-1 rounded">
                      {book.general.format}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div >
  );
};