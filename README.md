# ONSV Express — Portal Observatorio Nacional de Seguridad Vial

Versión **1.0.0** — Proyecto en producción desde 2023.

---

## 📋 Visión General

**ONSV Express** es la aplicación backend + frontend server-side que impulsa el portal web del Observatorio Nacional de Seguridad Vial (ONSV) del Ministerio de Transportes y Comunicaciones (MTC) del Perú.

- **Arquitectura**: Express 4 (Node.js) + Handlebars (SSR) + MySQL 8 + Ghost CMS (Headless) + Webpack 5 (assets).
- **Panel de administración**: React 18 + TypeScript + Vite (carpeta `/admin`).
- **Despliegue**: PM2 + Nginx (reverse proxy + SSL) en Ubuntu / GCloud / VM Multipass.
- **Internacionalización**: Español (por defecto) + Inglés vía `{{t lang "key"}}`.
- **Seguridad**: Helmet, rate-limit, sesiones MySQL, bcryptjs, claves RSA 4096 para ofuscación de IDs.

---

## 🛠 Stack Técnico (versiones exactas)

| Capa | Tecnología | Versión |
|------|------------|---------|
| Runtime | Node.js | **≥ 20** (probado en 22.17 y 24.14) |
| Framework | Express | 4.22.x |
| Motor de vistas | express-handlebars | 5.3.x |
| Base de datos | MySQL2 / mysql | 3.23.x / 2.18.x |
| CMS Headless | @tryghost/content-api | 1.12.x |
| Autenticación | passport / passport-local | 0.7.x / 1.0.x |
| Sesiones | express-session + express-mysql-session | 1.19.x / 3.0.x |
| Seguridad | helmet, express-rate-limit, bcryptjs, crypto-js | 4.6.x, 8.6.x, 3.0.x, 4.2.x |
| Crypto propio | node:crypto (RSA 4096 PKCS#1 PEM) | nativo |
| Assets | Webpack 5, Sass, PostCSS, Autoprefixer | 5.47.x, 1.36.x, 8.3.x, 10.3.x |
| CSS Framework | Bootstrap | 4.6.x |
| Utilidades | dotenv, axios, moment, winston, morgan, multer, node-cron | últimas |
| Admin Panel | React 18, TypeScript, Vite, Oxlint | (ver `/admin/package.json`) |
| Proceso | PM2 | global |
| Proxy/SSL | Nginx | sistema |

---

## ✅ Requisitos Previos

| Requisito | Versión mínima | Notas |
|-----------|----------------|-------|
| Node.js | **≥ 20** | `node -v` → `v20.x.x` o superior. Probado en 22.17 y 24.14. |
| npm / pnpm | 9.x / 8.x | Proyecto usa `pnpm` en `/admin`; raíz usa `npm`. |
| MySQL | 8.0+ | Usuario `onsv` con privileges (ver sección DB). |
| Ghost CMS | 5.x | Content API Key + URL. Ver sección Ghost. |
| Nginx | 1.18+ | Para reverse proxy + SSL (Let's Encrypt). |
| PM2 | latest global | `npm i -g pm2`. |
| Git | 2.x | Para clonar y deploy. |

---

## ⚙️ Variables de Entorno (`.env`)

Crea `.env` en la raíz (no versionado). Ejemplo completo:

```bash
# ──────────────────────────────────────────────
# APP
# ──────────────────────────────────────────────
PORT=3000
NODE_ENV=production
URL_PATH=https://onsv.gob.pe          # Base URL según entorno (ver tabla entornos)
SESSION_SECRET=super-secret-64-chars  # openssl rand -hex 32

# ──────────────────────────────────────────────
# MYSQL (pool config en index.js)
# ──────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=onsv
DB_PASSWORD=user_onsv2021#HMR
DB_NAME=onsv
DB_CONNECTION_LIMIT=10

# ──────────────────────────────────────────────
# GHOST CMS (Content API)
# ──────────────────────────────────────────────
GHOST_API_URL=https://onsv.gob.pe       # URL pública de Ghost
GHOST_CONTENT_API_KEY=xxx               # Content API Key (Admin → Integrations)
GHOST_API_VERSION=v5.0                  # Formato v{major}.{minor} (evita warning)

# ──────────────────────────────────────────────
# MAILCHIMP (Newsletter RSS)
# ──────────────────────────────────────────────
MAILCHIMP_API_KEY=xxx
MAILCHIMP_SERVER_PREFIX=usxx
MAILCHIMP_AUDIENCE_ID=xxx

# ──────────────────────────────────────────────
# GOOGLE CLOUD (Storage / Firestore / Auth)
# ──────────────────────────────────────────────
GOOGLE_CLOUD_PROJECT_ID=xxx
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json

# ──────────────────────────────────────────────
# CRYPTO UTILS (firma/encriptación IDs)
# ──────────────────────────────────────────────
DATA_TO_CRYPT={"propiedad":"ONSV","autor":"Henry Medina Rodríguez","contacto":"hmedinar@uni.pe"}
# Se usa en utils/criptoUtils.js → encryptUserId / decryptUserId
```

> **Nota**: `DATA_TO_CRYPT` debe ser JSON válido en una línea. Se usa como "sal" para firmar y ofuscar `userId` en URLs públicas.

---

## 🚀 Instalación Paso a Paso

```bash
# 1. Clonar
git clone https://gitlab.com/onsvgroup/onsv-express.git
cd onsv-express

# 2. Credenciales GitLab (si pide)
# user: onsvdev@gmail.com
# pass: onsvdeveloper

# 3. Dependencias raíz
npm install

# 4. Variables de entorno
cp .env.example .env   # si existe, sino crea desde cero
# Edita .env con tus valores reales

# 5. Base de datos (ver sección MySQL)
#    - Crear usuario 'onsv', schema 'onsv', tablas 'files' y 'users'

# 6. Ghost CMS
#    - Crear integración "ONSV Express" en Ghost Admin
#    - Copiar Content API Key a GHOST_CONTENT_API_KEY
#    - Ajustar GHOST_API_VERSION a v{major}.{minor} (ej. v5.0)

# 7. Generar claves RSA (auto al primer start, o manual)
mkdir -p utils/keys
# Si falla ENOENT al arrancar, crear la carpeta y reiniciar.

# 8. Build assets (CSS/JS bundle)
npm run webpack

# 9. Build panel admin (React + Vite)
cd admin && pnpm install && pnpm run build && cd ..

# 10. Iniciar con PM2
pm2 start index.js --name onsv-express

# 11. Verificar
pm2 logs onsv-express
# Debe mostrar:
#   - "La aplicación se inició con éxito y a la escucha en el puerto 3000"
#   - "La base de datos está conectada"
#   - Sin error ENOENT en utils/keys
```

---

## 🗄 Base de Datos (MySQL)

### Usuario y permisos
```sql
CREATE USER 'onsv'@'localhost' IDENTIFIED BY 'user_onsv2021#HMR';
GRANT ALL PRIVILEGES ON *.* TO 'onsv'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'onsv'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### Esquema `onsv`
```sql
CREATE SCHEMA `onsv` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE onsv;

-- Tabla files (normas, publicaciones, datos abiertos, etc.)
CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT NOT NULL,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category1 VARCHAR(100) NOT NULL,
  category2 VARCHAR(100),
  category3 VARCHAR(100),
  type VARCHAR(100) NOT NULL,
  excelfile VARCHAR(500),
  pdffile VARCHAR(500),
  csvfile VARCHAR(500),
  PRIMARY KEY (id)
);

-- Tabla users (admin panel)
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  user VARCHAR(500) NOT NULL,
  password VARCHAR(500) NOT NULL,
  PRIMARY KEY (id)
);
```

> **MySQL 8.0.22+**: Si el script falla por `caching_sha2_password`, usa `mysql_native_password` o actualiza el cliente.

---

## 👻 Integración Ghost CMS

- **Content API**: Se usa `@tryghost/content-api` para leer posts, páginas, tags, authors.
- **Versión API**: **Obligatorio** `v{major}.{minor}` (ej. `v5.0`). El formato `v{major}` lanza warning deprecado.
- **Endpoints usados**: `/posts/`, `/pages/`, `/tags/`, `/authors/` con `filter`, `limit`, `fields`.
- **Sincronización**: Las normas legales, publicaciones, noticias y eventos se gestionan en Ghost y se consumen vía API.
- **Webhooks** (opcional): Configurar en Ghost Admin → Integrations → Webhooks para revalidar caché al publicar.

---

## 🌐 Internacionalización (i18n)

- **Archivos**: `utils/locales/es.json` (default) + `utils/locales/en.json`.
- **Helper en vistas**: `{{t lang "clave"}}` — `lang` viene del middleware (`req.lang` = `es` | `en`).
- **Fallback**: Si la clave no existe en el idioma actual, cae a español.
- **Añadir traducciones**: Edita ambos JSON manteniendo la misma estructura de claves anidadas.

---

## 🔐 Seguridad & Crypto

| Medida | Implementación |
|--------|----------------|
| Headers HTTP | `helmet()` en `index.js` |
| Rate limiting | `express-rate-limit` (100 req/15min global) |
| Sesiones | `express-session` + `express-mysql-session` (tabla `sessions` auto) |
| Hash passwords | `bcryptjs` (10 rounds) |
| Autenticación | `passport-local` (estrategia `local`) |
| Ofuscación IDs | `utils/criptoUtils.js` → RSA 4096 PKCS#1 PEM |
| • Generación claves | `genKeyPair()` → crea `utils/keys/id_rsa_{pub,priv}.pm` al arranque |
| • Firmar/verificar | `signMessage()` / `verifyIdentity()` (no usados en prod actual) |
| • Encriptar userId | `encryptUserId(userId)` → base64url (usado en URLs públicas) |
| • Desencriptar | `decryptUserId(token)` → recover original `userId` |

> **Claves RSA**: Se auto-generan en `utils/keys/` si no existen. Carpeta debe tener permisos de escritura para el usuario Node.

---

## 📦 Estructura del Proyecto (carpetas clave)

```
onsv-express/
├── index.js                    # Entry point (Express + middlewares + rutas)
├── package.json                # Dependencias raíz + scripts
├── .env                        # Variables de entorno (NO versionar)
├── .gitignore
├── README.md                   # Este archivo
├── rutas.md                    # Checklist de archivos para deploy manual
├── AGENTS.md                   # Reglas para agentes IA (opencode)
│
├── admin/                      # Panel Admin: React + TS + Vite
│   ├── package.json
│   ├── src/
│   └── dist/                   # Build output (servido por Express estático)
│
├── api/                        # Config Ghost + MySQL clientes
│   ├── ghost.js
│   └── mysql.js
│
├── controllers/                # Lógica de negocio
│   ├── logger.js               # Winston logger
│   ├── hbs.js                  # Helpers Handlebars (t, parseDate, etc.)
│   └── ...
│
├── routes/                     # Rutas Express
│   ├── routes.js               # Rutas públicas principales
│   └── admin/
│       ├── routes.js           # Rutas admin (protegidas)
│       └── api.js              # API admin (CRUD regiones, analítica, etc.)
│
├── utils/                      # Utilidades compartidas
│   ├── utils.js                # Funciones comunes (regiones, parse, etc.)
│   ├── criptoUtils.js          # RSA keys, encrypt/decrypt userId
│   ├── ftpService.js           # Subida archivos FTP
│   ├── locales/
│   │   ├── es.json
│   │   └── en.json
│   ├── webpack/                # SOURCE assets (editar aquí, NO en public/)
│   │   ├── js/
│   │   │   ├── index.js        # Entry point JS
│   │   │   └── main.js         # Carruseles, formularios, mapas
│   │   ├── css/
│   │   │   ├── all.css         # Base (carga primero)
│   │   │   ├── main.css        # Portal (navbar, footer, botones)
│   │   │   └── main-media.css  # @media queries responsive
│   │   └── webpack.config.js
│   └── keys/                   # AUTO-GENERADO (id_rsa_pub.pem, id_rsa_priv.pem)
│
├── public/                     # STATIC OUTPUT (generado por webpack + archivos directos)
│   ├── main.css                # ← GENERADO (npm run webpack) — NO EDITAR
│   ├── main.js                 # ← GENERADO (npm run webpack) — NO EDITAR
│   ├── css/
│   │   ├── analitica.css
│   │   ├── normas-legales.css
│   │   ├── publicaciones.css
│   │   └── comunicaciones/
│   ├── js/
│   │   ├── analitica.js
│   │   ├── normas-legales.js
│   │   ├── publicaciones.js
│   │   └── comunicaciones/
│   ├── features.js             # Tabs sociales (editar directo)
│   ├── opendata.js             # Datos abiertos (editar directo)
│   └── img/                    # Assets estáticos
│
└── views/                      # Handlebars templates (SSR)
    ├── index.hbs               # Layout principal
    ├── layouts/
    │   └── default.hbs
    ├── pages/
    │   ├── normas-legales.hbs
    │   ├── publicaciones.hbs
    │   ├── analitica.hbs
    │   ├── datos-abiertos.hbs
    │   ├── regiones.hbs
    │   ├── peru-world.hbs
    │   ├── post.hbs
    │   ├── administrador-login.hbs
    │   └── comunicaciones/
    ├── partials/
    │   ├── normas-legales/
    │   │   └── normas-legales-card-body.hbs   # Solo fecha (sin regionName)
    │   ├── publicaciones/
    │   │   ├── publicaciones-card-body.hbs    # Fecha + regionName
    │   │   └── publicaciones-searched.hbs     # Fecha + regionName
    │   ├── default/
    │   │   ├── footer.hbs
    │   │   └── navigation.hbs
    │   └── ...
    └── ...
```

> **Regla de oro CSS/JS** (ver `AGENTS.md`):
> - Edita en `utils/webpack/` → `npm run webpack` → genera `public/main.css|js`
> - `public/main.css|js` son **solo lectura** (se sobrescriben)
> - `public/css/*.css`, `public/js/*.js`, `public/features.js`, `public/opendata.js` se editan directo

---

## ⚡ Scripts & Comandos (resumen)

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | `nodemon index.js` (watch + restart) |
| `npm start` | `node index.js` (producción) |
| `npm run webpack` | Build production assets (`utils/webpack` → `public/main.css|js`) |
| `npm run build:admin` | Build panel admin React (`admin/` → `admin/dist/`) |
| `pm2 start index.js --name onsv-express` | Iniciar con PM2 |
| `pm2 logs onsv-express` | Ver logs en tiempo real |
| `pm2 restart onsv-express` | Reiniciar tras cambios código |
| `pm2 stop onsv-express` | Detener |
| `pm2 delete onsv-express` | Eliminar proceso PM2 |
| `sudo nginx -t` | Test config Nginx |
| `sudo nginx -s reload` | Recargar Nginx sin downtime |

---

## 🏗 Build & Deploy

### Webpack (assets públicos)
```bash
# Tras CUALQUIER cambio en utils/webpack/**/*
npm run webpack
# Genera: public/main.css, public/main.js (minificados, production mode)
```

### Panel Admin (React)
```bash
cd admin
pnpm install       # solo primera vez o si cambian deps
pnpm run build     # genera admin/dist/
cd ..
# Express sirve admin/dist en /admin (ver index.js static middleware)
```

### PM2 (producción)
```bash
pm2 start index.js --name onsv-express
pm2 save           # Persistir tras reboot
pm2 startup        # Generar script systemd (ejecutar lo que diga)
```

### Nginx (reverse proxy + SSL)
```nginx
# /etc/nginx/sites-available/onsv.express
server {
    listen 80;
    server_name onsv.gob.pe;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Assets estáticos (cache largo)
    location /public/ {
        alias /ruta/absoluta/onsv-express/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Admin panel
    location /admin/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/onsv.express /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload
# SSL con Certbot: sudo certbot --nginx -d onsv.gob.pe
```

---

## 🌍 Entornos & `URL_PATH`

| Entorno | `URL_PATH` | Uso |
|---------|------------|-----|
| Localhost (Windows) | `http://localhost:3000` | Desarrollo local |
| Ubuntu Multipass (VM) | `http://172.26.80.163` | Testing interno |
| GCloud (App Engine) | `https://onsv-dot-pruebasfiisuni.ue.r.appspot.com` | Staging cloud |
| Desarrollo MTC | `http://dvonsv.mtc.gob.pe` | Pre-prod MTC |
| **Producción MTC** | `https://onsv.gob.pe` | **Producción real** |

> `URL_PATH` se usa en `utils/utils.js` para parsear URLs absolutas/relativas y en `controllers/hbs.js` helpers. **Debe coincidir con el host real** (incluyendo protocolo).

---

## 🧩 Módulos Funcionales

| Módulo | Ruta | Template principal | Partial tarjeta | Detalle |
|--------|------|-------------------|-----------------|---------|
| **Normas Legales** | `/normas-legales` | `pages/normas-legales.hbs` | `partials/normas-legales/normas-legales-card-body.hbs` | **Solo fecha** (`parseDate published_at`). Sin `regionName`. Filtros: categoría, región, año. |
| **Publicaciones** | `/publicaciones` | `pages/publicaciones.hbs` | `partials/publicaciones/publicaciones-card-body.hbs` + `publicaciones-searched.hbs` | **Fecha + región** (`regionName`). Mismos filtros. |
| **Analítica** | `/analitica` | `pages/analitica.hbs` | — | Dashboard con gráficos (Chart.js vía `public/js/analitica.js`). CSS exclusivo `analitica.css`. |
| **Datos Abiertos** | `/datos-abiertos` | `pages/datos-abiertos.hbs` | `partials/datos-abiertos/datos-abiertos-card-body.hbs` | Catálogo datasets. JS exclusivo `opendata.js`. |
| **Comunicaciones** | `/comunicaciones/*` | `pages/comunicaciones/*.hbs` | `partials/comunicaciones/evento-card.hbs` | Eventos, notas de prensa, noticias. CSS `eventos.css` / `evento.css`. |
| **Regiones** | `/regiones` | `pages/regiones.hbs` | — | Mapa interactivo (Leaflet/Mapbox), selector de departamento. |
| **Perú & World** | `/peru-world` | `pages/peru-world.hbs` | — | Comparativa internacional. |
| **Newsletter** | `/newsletter` | `pages/newsletter.hbs` | — | Suscripción Mailchimp (RSS-to-email via cron). |
| **Post individual** | `/post/:slug` | `pages/post.hbs` | `partials/posts/post-card-carousel.hbs` | Detalle de post Ghost. |

---

## 🛣 Rutas Principales (resumen)

Ver **`rutas.md`** para checklist completo de archivos a copiar en deploy manual.

### Públicas (routes/routes.js)
| Método | Ruta | Controlador | Descripción |
|--------|------|-------------|-------------|
| GET | `/` | `home` | Homepage con carrusel + últimos posts |
| GET | `/normas-legales` | `normasLegales` | Listado paginado + filtros |
| GET | `/publicaciones` | `publicaciones` | Listado paginado + filtros |
| GET | `/analitica` | `analitica` | Dashboard gráficos |
| GET | `/datos-abiertos` | `datosAbiertos` | Catálogo datasets |
| GET | `/regiones` | `regiones` | Mapa + selector |
| GET | `/peru-world` | `peruWorld` | Comparativa |
| GET | `/comunicaciones/*` | varios | Eventos, notas, noticias |
| GET | `/post/:slug` | `post` | Detalle post Ghost |
| GET | `/newsletter` | `newsletter` | Formulario suscripción |

### Admin (routes/admin/routes.js + api.js) — **protegidas por sesión**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/login` | Login (passport-local) |
| POST | `/admin/login` | Autenticar + crear sesión |
| GET | `/admin/logout` | Destruir sesión |
| GET | `/admin/*` | Panel admin (React SPA servida estático) |
| API | `/admin/api/regiones` | CRUD regiones |
| API | `/admin/api/analitica` | CRUD indicadores |
| API | `/admin/api/datos-abiertos/*` | CRUD categorías/tipos/datasets |
| API | `/admin/api/comunicaciones/eventos` | CRUD eventos |

---

## 🐛 Troubleshooting Común

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `ENOENT: no such file or directory, open '.../utils/keys/id_rsa_pub.pem'` | Carpeta `utils/keys/` no existe | `mkdir -p utils/keys` y reiniciar (`pm2 restart onsv-express`) |
| `Error: listen EADDRINUSE :::3000` | Puerto 3000 ocupado (nginx u otro proceso) | `sudo lsof -i:3000` → `sudo kill -9 <PID>` → `pm2 restart` |
| `@tryghost/content-api: The 'version' parameter has deprecated format 'v{major}'` | `GHOST_API_VERSION=v5` en vez de `v5.0` | Poner `v{major}.{minor}` en `.env` (ej. `v5.0`) |
| `ER_NOT_SUPPORTED_AUTH_MODE` (MySQL 8) | Plugin `caching_sha2_password` | `ALTER USER 'onsv'@'%' IDENTIFIED WITH mysql_native_password BY 'pass'; FLUSH PRIVILEGES;` |
| Cambios en CSS/JS no se ven | Editaste `public/main.css|js` (generados) | Edita en `utils/webpack/` y ejecuta `npm run webpack` |
| Panel admin muestra 404 / página en blanco | `admin/dist/` no existe o build falló | `cd admin && pnpm run build` y verifica `admin/dist/index.html` |
| Nginx 502 Bad Gateway | Express no arranca o puerto distinto | `pm2 logs onsv-express` → ver error; asegura `proxy_pass http://127.0.0.1:3000;` |
| SSL certbot falla | Puerto 80 bloqueado / DNS no apunta | Abre puerto 80 en firewall; verifica `A` record en DNS |

---

## 📄 Licencia / Autores

- **Autor principal**: Henry Medina Rodríguez (`hmedinar@uni.pe`)
- **Organización**: ONSV Group / MTC
- **Licencia**: ISC (ver `package.json`)
- **Repositorio**: `https://gitlab.com/onsvgroup/onsv-express`

---

## 📌 Referencias Rápidas

- `AGENTS.md` — Reglas de edición CSS/JS (webpack vs estáticos)
- `rutas.md` — Checklist de archivos para deploy manual
- `admin/README.md` — Documentación panel admin (React + Vite)
- Logs PM2: `pm2 logs onsv-express --lines 200`
- Logs Nginx: `/var/log/nginx/onsv.log` (access) + `error.log`