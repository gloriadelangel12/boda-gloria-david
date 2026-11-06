# Invitación web · Gloria & David (31 · Julio · 2027)

## Cómo ejecutarla
1. Abre la carpeta `invitacion_boda_web` en Visual Studio Code.
2. Clic derecho en `index.html` → **Open with Live Server** (o abre el archivo en el navegador).
3. Se necesita internet solo para cargar Google Fonts (Pinyon Script, Parisienne, Cormorant Garamond, Playfair Display, Montserrat). Ya no se usa GSAP.

## Qué configurar a mano (`script.js` → `CONFIG`)
- `whatsappNumber`: número real con código de país, sin `+` ni espacios (ej. `528991234567`). Hoy es el marcador `TU_NUMERO_REAL`.
- `weddingDate` / `eventEnd`: están en UTC-5 (horario de verano de la frontera de Tamaulipas). Cambia a `-06:00` si tu zona no lo observa.
- `churchMapQuery` / `venueMapQuery`: búsquedas de Google Maps con la dirección del PDF; añade la ciudad o pega el enlace exacto si quieres precisión.
- `musicPath`: coloca tu archivo en `assets/musica.mp3` (no existe en el proyecto). La música arranca al tocar el sello o el disco/botón ♫.

## Archivos modificados
`index.html`, `styles.css`, `script.js` y este README. La carpeta `assets` queda intacta.
