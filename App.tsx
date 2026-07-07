import React, { useState, useEffect } from 'react';
import { BookList } from './components/BookList';
import { BookForm } from './components/BookForm';
import { BookDetail } from './components/BookDetail';
import { Book } from './types';
import { Library } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'bibliotheca_books_v2';

export default function App() {
  // Inicialización de estado directa y segura
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error cargando libros:", e);
    }
    return [];
  });

  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);

  // Persistencia: Guardar siempre que 'books' cambie
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error("Error guardando en localStorage:", e);
    }
  }, [books]);

  const handleAddBook = () => {
    setSelectedBook(undefined);
    setView('form');
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setView('detail');
  };

  const handleEditBook = () => {
    setView('form');
  };

  const handleSaveBook = (book: Book) => {
    setBooks(prevBooks => {
      const existsIndex = prevBooks.findIndex(b => b.id === book.id);
      if (existsIndex !== -1) {
        // Actualizar libro existente: creamos una copia nueva del array
        const updatedBooks = [...prevBooks];
        updatedBooks[existsIndex] = book;
        return updatedBooks;
      } else {
        // Añadir nuevo libro: lo ponemos al principio del array
        return [book, ...prevBooks];
      }
    });

    // Volver a la lista tras guardar
    setView('list');
    setSelectedBook(undefined);
  };

  const handleCancelForm = () => {
    if (selectedBook) {
      setView('detail');
    } else {
      setView('list');
    }
  };

  const handleImportBooks = (newBooks: Book[], mode: 'merge' | 'replace') => {
    setBooks(prevBooks => {
      if (mode === 'replace') {
        return newBooks;
      }
      // Combinar: los libros importados con el mismo ID actualizan al existente,
      // el resto se añade al final conservando el orden actual
      const merged = new Map(prevBooks.map(b => [b.id, b]));
      for (const book of newBooks) {
        merged.set(book.id, book);
      }
      return [...merged.values()];
    });
    setView('list');
  };

  const handleDeleteBook = (id: string) => {
    setBooks(prevBooks => prevBooks.filter(b => b.id !== id));
    setSelectedBook(undefined);
    setView('list');
  };

  return (
    <div className="min-h-screen font-sans bg-stone-100 text-stone-800">
      <nav className="border-b sticky top-0 z-50 bg-white/95 border-stone-200 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 font-serif font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setView('list');
              setSelectedBook(undefined);
            }}
          >
            <div className="p-2 rounded-lg bg-stone-700 text-stone-50 shadow-sm shadow-stone-300">
              <Library size={20} />
            </div>
            <span className="tracking-tight text-stone-800">Bitácora Literaria</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold px-4 py-1.5 rounded-full bg-white text-stone-600 border border-stone-200">
              {books.length} {books.length === 1 ? 'lectura' : 'lecturas'}
            </div>
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {view === 'list' && (
          <BookList
            books={books}
            onAddBook={handleAddBook}
            onSelectBook={handleSelectBook}
            onImportBooks={handleImportBooks}
          />
        )}

        {view === 'form' && (
          <BookForm
            initialBook={selectedBook}
            onSave={handleSaveBook}
            onCancel={handleCancelForm}
          />
        )}

        {view === 'detail' && selectedBook && (
          <BookDetail
            book={selectedBook}
            onBack={() => {
              setView('list');
              setSelectedBook(undefined);
            }}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
          />
        )}
      </main>
    </div>
  );
}