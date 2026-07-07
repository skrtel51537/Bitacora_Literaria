export interface BookSearchResult {
  coverUrl: string | null;
  author: string | null;
}

// Busca portada y autor en Google Books API.
// Devuelve null si el libro no aparece; lanza un error si la consulta falla
// (sin red, límite de peticiones...), para que la UI pueda distinguirlo.
export const searchBookData = async (title: string, author: string): Promise<BookSearchResult | null> => {
  if (!title) return null;

  // intitle e inauthor hacen la búsqueda más precisa
  const query = `intitle:${encodeURIComponent(title)}${author ? `+inauthor:${encodeURIComponent(author)}` : ''}`;
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);

  if (!response.ok) {
    throw new Error(`Google Books respondió ${response.status}`);
  }

  const data = await response.json();

  if (data.items && data.items.length > 0) {
    const volumeInfo = data.items[0].volumeInfo;
    const imageLinks = volumeInfo.imageLinks;
    // Usamos la imagen más grande disponible o el thumbnail por defecto, asegurando HTTPS
    const rawUrl = imageLinks ? (imageLinks.thumbnail || imageLinks.smallThumbnail) : null;
    return {
      coverUrl: rawUrl ? rawUrl.replace('http:', 'https:') : null,
      author: Array.isArray(volumeInfo.authors) && volumeInfo.authors.length > 0
        ? volumeInfo.authors.join(', ')
        : null,
    };
  }
  return null;
};
