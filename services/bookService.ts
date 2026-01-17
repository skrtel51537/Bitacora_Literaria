export const searchBookCover = async (title: string, author: string): Promise<string | null> => {
  if (!title) return null;

  try {
    // Construimos la query para Google Books API
    // intitle e inauthor hacen la búsqueda más precisa
    const query = `intitle:${encodeURIComponent(title)}${author ? `+inauthor:${encodeURIComponent(author)}` : ''}`;
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
    
    if (!response.ok) {
      throw new Error('Error connecting to book API');
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const volumeInfo = data.items[0].volumeInfo;
      // Preferimos thumbnail, asegurando HTTPS
      const imageLinks = volumeInfo.imageLinks;
      if (imageLinks) {
        // Usamos la imagen más grande disponible o el thumbnail por defecto
        const url = imageLinks.thumbnail || imageLinks.smallThumbnail;
        return url ? url.replace('http:', 'https:') : null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error searching book cover:", error);
    return null;
  }
};