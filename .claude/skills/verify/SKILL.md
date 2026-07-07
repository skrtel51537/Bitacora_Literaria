---
name: verify
description: Receta de verificación end-to-end de Bitácora Literaria (SPA React + Vite, datos en localStorage)
---

# Verificar Bitácora Literaria

App SPA sin backend: React 19 + Vite, persistencia en `localStorage`
(clave de biblioteca: `bibliotheca_books_v2`, borradores: `bibliotecha_draft_*`
→ ver prefijo real en `components/BookForm.tsx`).

## Arrancar

- `preview_start` con la config `dev` de `.claude/launch.json` (npm run dev).
- El puerto 3000 (vite.config.ts) suele estar ocupado por otro proceso local;
  launch.json pasa `--port 3010`.

## Flujos que merece la pena conducir

1. **Alta de libro**: "Añadir Lectura" → rellenar Título/Autor (usar el setter
   nativo de `HTMLInputElement.prototype.value` + evento `input` para que React
   registre el cambio) → "Siguiente" → "Siguiente" → "Guardar Lectura".
2. **Navegación de pestañas del formulario**: Ficha → Análisis → Cierre.
   OJO: el par de botones Siguiente/Guardar del pie fue fuente de un bug de
   envío accidental; probar SIEMPRE con clic confiable (`preview_click`), no
   con `element.click()` — el bug de acción por defecto del navegador NO se
   reproduce con clics sintéticos.
3. **Borrador**: escribir en el formulario, `location.reload()`, reabrir el
   formulario → debe aparecer el banner "Hay un borrador sin guardar".
4. **Cancelar con cambios**: debe pedir `confirm()`.

## Trucos

- Instrumentar diálogos nativos antes de conducir (si no, bloquean la sesión):
  `window.confirm = m => { __dialogs.push(m); return __confirmResult ?? true; }`
  e igual con `alert`.
- Los editores de texto son `div[contenteditable]` (componente RichEditor):
  fijar `innerHTML` y despachar `new InputEvent('input', {bubbles:true})`.
- Para clics confiables sobre un botón sin selector estable: asignarle un `id`
  temporal vía `preview_eval` y luego `preview_click('#id')`.
- Limpiar al terminar: `localStorage.clear()` en la preview.
