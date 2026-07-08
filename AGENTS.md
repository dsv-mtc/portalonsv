# Reglas de edición CSS/JS — ONSV

## ❌ NUNCA editar directamente (generados por webpack)

| Archivo | Generado desde | Comando |
|---|---|---|
| `public/main.css` | `utils/webpack/css/*.css` | `npm run webpack` |
| `public/main.js` | `utils/webpack/js/*.js` | `npm run webpack` |

## ✅ Editar directamente

### Archivos fuente del bundle (editar y recompilar con `npm run webpack`)
- `utils/webpack/css/main.css` — CSS general del portal (navbar, footer, botones)
- `utils/webpack/css/all.css` — CSS general (se carga antes que main.css)
- `utils/webpack/css/main-media.css` — CSS responsive (@media queries)
- `utils/webpack/js/main.js` — JS del portal (carruseles, formularios, mapas)
- `utils/webpack/js/index.js` — Entry point del bundle

### Archivos estáticos (editar directo, sin recompilar)
- `public/css/analitica.css` — CSS exclusivo de analítica
- `public/css/comunicaciones/eventos.css` — CSS exclusivo de eventos
- `public/js/analitica.js` — JS exclusivo de analítica
- `public/features.js` — JS de features (tabs sociales)
- `public/opendata.js` — JS de datos abiertos

## Regla simple

> - Si el archivo está en `utils/webpack/` → es el fuente. Edítalo y recompila con `npm run webpack`.
> - Si el archivo está en `public/` y NO es `main.css` ni `main.js` → es estático. Edítalo directo, sin recompilar.
> - Si el archivo es `public/main.css` o `public/main.js` → NO lo toques. Se sobrescribe al recompilar.
</content>
</invoke>