import DOMPurify from 'dompurify';

// Sanea HTML antes de inyectarlo en el DOM (dangerouslySetInnerHTML).
// El contenido propio viene del RichEditor, pero los backups importados
// pueden traer HTML arbitrario, incluido código malicioso.
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
};
