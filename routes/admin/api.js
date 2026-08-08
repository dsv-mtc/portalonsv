const router = require('express').Router();
const passport = require("passport");
const criptoUtils = require("../../utils/criptoUtils");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const mysql = new (require("../../api/mysql"));
mysql.setQuery();

const apiGhost = new (require("../../api/ghost"));

const assetsDir = path.join(__dirname, '../../public/assets');
const uploadMw = multer({
  storage: multer.diskStorage({
    destination: assetsDir,
    filename(req, file, cb) {
      const normalized = req.regionName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      cb(null, `${normalized}.png`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('Solo imágenes PNG, JPG, GIF o WebP'));
  }
}).single('image');

const eventosAssetsDir = path.join(__dirname, '../../public/assets/eventos');
if (!fs.existsSync(eventosAssetsDir)) fs.mkdirSync(eventosAssetsDir, { recursive: true });

const uploadEventoMw = multer({
  storage: multer.diskStorage({
    destination: eventosAssetsDir,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `evento_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('Solo imágenes PNG, JPG, GIF o WebP'));
  }
}).single('image');

const menuAssetsDir = path.join(__dirname, '../../public/assets/menu');
if (!fs.existsSync(menuAssetsDir)) fs.mkdirSync(menuAssetsDir, { recursive: true });

const uploadMenuMw = multer({
  storage: multer.diskStorage({
    destination: menuAssetsDir,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `menu_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('Solo imágenes PNG, JPG, GIF o WebP'));
  }
}).single('image');

const popupAssetsDir = path.join(__dirname, '../../public/assets/popup');
if (!fs.existsSync(popupAssetsDir)) fs.mkdirSync(popupAssetsDir, { recursive: true });

const uploadPopupMw = multer({
  storage: multer.diskStorage({
    destination: popupAssetsDir,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `popup_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('Solo imágenes PNG, JPG, GIF o WebP'));
  }
}).single('image');

const datosAssetsDir = path.join(__dirname, '../../public/assets/datos');
if (!fs.existsSync(datosAssetsDir)) fs.mkdirSync(datosAssetsDir, { recursive: true });

const uploadDatosMw = multer({
  storage: multer.diskStorage({
    destination: datosAssetsDir,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname) || '';
      cb(null, `datos_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    return cb(null, true);
  }
}).single('file');

const categoriaAssetsDir = path.join(__dirname, '../../public/assets/categoria');
if (!fs.existsSync(categoriaAssetsDir)) fs.mkdirSync(categoriaAssetsDir, { recursive: true });

const uploadCategoriaMw = multer({
  storage: multer.diskStorage({
    destination: categoriaAssetsDir,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `cat_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('Solo imágenes PNG, JPG, GIF o WebP'));
  }
}).single('image');

const revistasAssetsDir = path.join(__dirname, '../../public/assets/revistas');
if (!fs.existsSync(revistasAssetsDir)) fs.mkdirSync(revistasAssetsDir, { recursive: true });

const uploadRevistaMw = multer({
  storage: multer.diskStorage({
    destination: revistasAssetsDir,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase() || '';
      cb(null, `revista_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(ext)) return cb(null, true);
    if (ext === '.pdf') return cb(null, true);
    cb(new Error('Solo imágenes (PNG, JPG, GIF, WebP) o PDF'));
  }
}).single('file');

// --- Upload middleware para entornos viales (Programas) ---
const entornosAssetsDir = path.join(__dirname, '../../public/assets/entornos');
if (!fs.existsSync(entornosAssetsDir)) fs.mkdirSync(entornosAssetsDir, { recursive: true });

const uploadEntornoMw = multer({
  storage: multer.diskStorage({
    destination: entornosAssetsDir,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase() || '.png';
      cb(null, `entorno_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('Solo imágenes PNG, JPG, GIF o WebP'));
  }
}).single('image');

// --- Upload middleware para redes sociales ---
const redesAssetsDir = path.join(__dirname, '../../public/assets/redes');
if (!fs.existsSync(redesAssetsDir)) fs.mkdirSync(redesAssetsDir, { recursive: true });

const uploadRedMw = multer({
  storage: multer.diskStorage({
    destination: redesAssetsDir,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase() || '';
      cb(null, `red_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Solo se permiten imágenes'));
    cb(null, true);
  }
}).single('image');

function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "No autenticado" });
  }
  const userIdEncrypted = req.user;
  const userId = criptoUtils.decryptUserId(userIdEncrypted);
  mysql.getUserById(userId).then(({ data: user }) => {
    if (!user || user.role.toLowerCase() !== 'administrador') {
      req.logOut();
      return res.status(403).json({ success: false, message: "No autorizado" });
    }
    req.adminUser = user;
    next();
  }).catch(() => {
    res.status(500).json({ success: false, message: "Error de autenticación" });
  });
}

async function logAction(action, entity, entityId, description, req) {
  const { id: userId, user: userEmail } = req.adminUser || {};
  if (!userId) return null;
  const { data: logEntry } = await mysql.createLog({ action, entity, entity_id: entityId, description, user_id: userId, user_email: userEmail }).catch(() => ({ data: null }));
  return logEntry;
}

// --- Auth ---
router.get("/auth/me", isAuthenticated, (req, res) => {
  res.json({ success: true, data: { email: req.adminUser.user, role: req.adminUser.role } });
});

// --- Logs ---
router.get("/logs/recent", isAuthenticated, async (req, res) => {
  const result = await mysql.getRecentLogs(10);
  res.json(result);
});

router.post("/login", passport.authenticate('local-login', {
  successRedirect: "/administrador/api/auth/success",
  failureRedirect: "/administrador/api/auth/fail",
  passReqToCallback: true
}));

router.get("/auth/success", isAuthenticated, (req, res) => {
  res.json({ success: true, data: { email: req.adminUser.user, role: req.adminUser.role } });
});

router.get("/auth/fail", (req, res) => {
  res.status(401).json({ success: false, message: "Credenciales inválidas" });
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.json({ success: true, message: "Sesión cerrada" });
});

// --- Footer ---
router.get("/footer", isAuthenticated, async (req, res) => {
  const { data: footer } = await mysql.getFooterData();
  res.json({ success: true, data: footer });
});

router.put("/footer", isAuthenticated, async (req, res) => {
  const { telefono, email, direccion, descripcion, horario } = req.body;
  const result = await mysql.updateFooterData({ telefono, email, direccion, descripcion, horario });
  const log = await logAction('updated', 'Footer', 1, `Se actualizó el pie de página`, req);
  res.json({ ...result, log: log || undefined });
});

// --- Cifras ---
router.get("/cifras", isAuthenticated, async (req, res) => {
  const { data: cifras } = await mysql.getCifras();
  res.json({ success: true, data: cifras });
});

router.put("/cifras", isAuthenticated, async (req, res) => {
  const { lesionados, accidentados, fallecidos, mensaje1, mensaje2, fuente_siniestro, porcentaje_siniestro, fuente_lesiones, porcentaje_lesiones, fuente_muertes, porcentaje_muertes } = req.body;
  const result = await mysql.updateCifras({ lesionados, accidentados, fallecidos, mensaje1, mensaje2, fuente_siniestro, porcentaje_siniestro, fuente_lesiones, porcentaje_lesiones, fuente_muertes, porcentaje_muertes });
  const log = await logAction('updated', 'Cifras', 1, `Se actualizaron las cifras`, req);
  res.json({ ...result, log: log || undefined });
});

// --- Misión y Visión ---
router.get("/mision-vision", isAuthenticated, async (req, res) => {
  const [{ data: enData }, { data: esData }] = await Promise.all([
    mysql.getContenidoQuienesSomos(true),
    mysql.getContenidoQuienesSomos(false)
  ]);
  res.json({
    success: true,
    data: {
      en: {
        descripcion: enData[0].contenido,
        mision: enData[1].contenido,
        vision: enData[2].contenido,
        comp_titulo: enData[3].contenido,
        val_intro: enData[4].contenido,
        val1_titulo: enData[13].contenido,
        val1_desc: enData[14].contenido,
        val2_titulo: enData[15].contenido,
        val2_desc: enData[16].contenido,
        val3_titulo: enData[17].contenido,
        val3_desc: enData[18].contenido,
        val4_titulo: enData[19].contenido,
        val4_desc: enData[20].contenido,
        val5_titulo: enData[21].contenido,
        val5_desc: enData[22].contenido,
        val6_titulo: enData[23].contenido,
        val6_desc: enData[24].contenido,
      },
      es: {
        descripcion: esData[0].contenido,
        mision: esData[1].contenido,
        vision: esData[2].contenido,
        comp_titulo: esData[3].contenido,
        val_intro: esData[4].contenido,
        val1_titulo: esData[13].contenido,
        val1_desc: esData[14].contenido,
        val2_titulo: esData[15].contenido,
        val2_desc: esData[16].contenido,
        val3_titulo: esData[17].contenido,
        val3_desc: esData[18].contenido,
        val4_titulo: esData[19].contenido,
        val4_desc: esData[20].contenido,
        val5_titulo: esData[21].contenido,
        val5_desc: esData[22].contenido,
        val6_titulo: esData[23].contenido,
        val6_desc: esData[24].contenido,
      }
    }
  });
});

router.put("/mision-vision", isAuthenticated, async (req, res) => {
  const { en, es } = req.body;
  const r1 = await mysql.updateMisionVision(true, en);
  const r2 = await mysql.updateMisionVision(false, es);
  const log = await logAction('updated', 'Misión/Visión', 1, `Se actualizó Misión y Visión`, req);
  res.json({ success: r1.success && r2.success, message: "Actualizado", log: log || undefined });
});

// --- Componentes tecnológicos ---
router.get("/componentes", isAuthenticated, async (req, res) => {
  const { idioma } = req.query;
  const { data: componentes } = await mysql.getComponentesTecnologicos(idioma);
  res.json({ success: true, data: componentes });
});

router.post("/componentes", isAuthenticated, async (req, res) => {
  const { idioma, titulo, descripcion, link } = req.body;
  const result = await mysql.createComponenteTecnologico({ idioma, titulo, descripcion, link });
  const log = await logAction('created', 'Componente', result.data?.insertId, `Se creó el componente tecnológico '${titulo || ''}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/componentes/:id", isAuthenticated, async (req, res) => {
  const { titulo, descripcion, link } = req.body;
  const result = await mysql.updateComponenteTecnologico(req.params.id, { titulo, descripcion, link });
  const log = await logAction('updated', 'Componente', Number(req.params.id), `Se actualizó el componente tecnológico '${titulo || ''}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/componentes/:id", isAuthenticated, async (req, res) => {
  const { data: componentesEs } = await mysql.getComponentesTecnologicos('ES');
  const { data: componentesEn } = await mysql.getComponentesTecnologicos('EN');
  const all = [...(componentesEs || []), ...(componentesEn || [])];
  const comp = all.find(c => c.id === Number(req.params.id));
  const compName = comp?.titulo || '';
  const result = await mysql.deleteComponenteTecnologico(req.params.id);
  const log = await logAction('deleted', 'Componente', Number(req.params.id), `Se eliminó el componente tecnológico '${compName}'`, req);
  res.json({ ...result, log: log || undefined });
});

// --- Popup ---
router.get("/popup", isAuthenticated, async (req, res) => {
  const { data: popup } = await mysql.getPopup();
  res.json({ success: true, data: { ...popup, estado: popup.estado === '1' } });
});

router.put("/popup", isAuthenticated, async (req, res) => {
  const { imagen, estado, enlace } = req.body;
  const result = await mysql.updatePopup({ imagen, estado: estado ? '1' : '0', enlace });
  const log = await logAction('updated', 'Popup', 1, `Se actualizó el popup`, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/popup/upload", isAuthenticated, async (req, res) => {
  try {
    uploadPopupMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      res.json({ success: true, url: `/assets/popup/${req.file.filename}` });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// --- Regiones ---
router.get("/regiones", isAuthenticated, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = 6;
  const conditions = req.query.searchedRegionId ? { id: Number(req.query.searchedRegionId) } : {};

  const { pages, amount } = await mysql.getRegionesMeta({ pageSize, conditions });

  if (amount === 0) {
    return res.json({ success: true, data: { regiones: [], pagination: { page, pages: 0, total: 0 } } });
  }

  const [{ data: regiones }, { data: allRegiones }] = await Promise.all([
    mysql.getRegiones({ paginate: true, page, pageSize, conditions }),
    mysql.getRegiones({ paginate: false })
  ]);

  res.json({
    success: true,
    data: {
      regiones,
      allRegiones,
      pagination: { page, pages, total: amount, pageSize }
    }
  });
});

router.put("/regiones/:id", isAuthenticated, async (req, res) => {
  const rawNombre = String(req.body.nombreEncargado ?? '');
  const rawCelular = String(req.body.celularEncargado ?? '');
  const correoEncargado = req.body.correoEncargado;
  const pageLink = req.body.pageLink;

  const nombreEncargado = rawNombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]/g, "").trim();
  const celularEncargado = rawCelular.replace(/[^\d()+\s-]/g, '');

  const id = Number(req.params.id);
  const { data: regiones } = await mysql.getRegiones({ paginate: false });
  const oldRegion = regiones?.find(r => r.id === id);
  const regionName = oldRegion?.value || '';

  const result = await mysql.updateRegiones({
    id,
    nombreEncargado,
    celularEncargado,
    correoEncargado,
    imageUrl: oldRegion?.imageUrl || '',
    pageLink
  });

  const fieldLabels = {
    nombreEncargado: 'el nombre del encargado',
    celularEncargado: 'el celular del encargado',
    correoEncargado: 'el correo del encargado',
    pageLink: 'el enlace de la página'
  };
  const changed = Object.keys(fieldLabels)
    .filter(key => String(oldRegion?.[key] ?? '') !== String({ nombreEncargado, celularEncargado, correoEncargado, pageLink }[key] ?? ''))
    .map(key => fieldLabels[key]);

  const description = changed.length
    ? `Se actualizó ${changed.join(', ')} de la región de ${regionName}`
    : `Se actualizó la región de ${regionName}`;

  const log = await logAction('updated', 'Región', id, description, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/regiones/:id/upload", isAuthenticated, async (req, res) => {
  try {
    const { data: all } = await mysql.getRegiones({ paginate: false });
    const region = all.find(r => r.id === Number(req.params.id));
    if (!region) return res.status(404).json({ success: false, message: "Región no encontrada" });
    req.regionName = region.value;
    uploadMw(req, res, async (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message || "Error al subir" });
      const version = Date.now();
      const imageUrl = `/assets/${req.file.filename}?v=${version}`;
      await mysql.updateRegiones({
        id: Number(req.params.id),
        nombreEncargado: region.nombreEncargado,
        celularEncargado: region.celularEncargado,
        correoEncargado: region.correoEncargado,
        imageUrl,
        pageLink: region.pageLink
      });
      const log = await logAction('updated', 'Región', Number(req.params.id), `Se actualizó la imagen de la región de ${region.value}`, req);
      res.json({ success: true, message: "Imagen actualizada", imageUrl, log: log || undefined });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

router.delete("/regiones/:id/image", isAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { data: all } = await mysql.getRegiones({ paginate: false });
    const region = all.find(r => r.id === id);
    if (!region) return res.status(404).json({ success: false, message: "Región no encontrada" });
    const normalized = region.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filePath = path.join(assetsDir, `${normalized}.png`);
    await fs.promises.unlink(filePath).catch(() => {});
    await mysql.updateRegiones({
      id,
      nombreEncargado: region.nombreEncargado,
      celularEncargado: region.celularEncargado,
      correoEncargado: region.correoEncargado,
      imageUrl: '',
      pageLink: region.pageLink
    });
    const log = await logAction('deleted', 'Región', id, `Se eliminó la imagen de la región de ${region.value}`, req);
    res.json({ success: true, message: "Imagen eliminada", imageUrl: '', log: log || undefined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// --- Analítica - Menú ---
router.get("/analitica-menu", isAuthenticated, async (req, res) => {
  const { data: menu } = await mysql.getMenu();
  res.json({ success: true, data: menu });
});

router.post("/analitica-menu", isAuthenticated, async (req, res) => {
  const { descripcion, urlImagen, observacion, estaActivo } = req.body;
  const result = await mysql.createMenu({ descripcion, urlImagen, observacion, estaActivo });
  const log = await logAction('created', 'Menú', result.data?.insertId, `Se creó el menú '${descripcion}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/analitica-menu/:id", isAuthenticated, async (req, res) => {
  const { descripcion, urlImagen, observacion, estaActivo } = req.body;
  const result = await mysql.updateMenu({ id: req.params.id, descripcion, urlImagen, observacion, estaActivo });
  const log = await logAction('updated', 'Menú', Number(req.params.id), `Se actualizó el menú '${descripcion}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/analitica-menu/:id", isAuthenticated, async (req, res) => {
  const { data: menus } = await mysql.getMenu();
  const menuName = menus?.find(m => m.id === Number(req.params.id))?.descripcion || '';
  const result = await mysql.deleteMenu(req.params.id);
  const log = await logAction('deleted', 'Menú', Number(req.params.id), `Se eliminó el menú '${menuName}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/analitica-menu/upload", isAuthenticated, async (req, res) => {
  try {
    uploadMenuMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      res.json({ success: true, url: `/assets/menu/${req.file.filename}` });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// --- Analítica - Submenú ---
router.get("/analitica-submenu", isAuthenticated, async (req, res) => {
  const [{ data: submenu }, { data: menu }] = await Promise.all([
    mysql.getSubmenu(),
    mysql.getMenu()
  ]);
  res.json({ success: true, data: { submenu, menu } });
});

router.post("/analitica-submenu", isAuthenticated, async (req, res) => {
  const { descripcion, menu_id, rutabi, linkvideo, linkpdf, imagenpath, estado } = req.body;
  const result = await mysql.createSubmenu({ descripcion, menu_id, rutabi, linkvideo, linkpdf, imagenpath, estado: estado ?? true });
  const log = await logAction('created', 'Submenú', result.data?.insertId, `Se creó el submenú '${descripcion}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/analitica-submenu/:id", isAuthenticated, async (req, res) => {
  const { descripcion, menu_id, rutabi, linkvideo, linkpdf, imagenpath, estado } = req.body;
  const result = await mysql.updateSubmenu({ id: req.params.id, descripcion, menu_id, rutabi, linkvideo, linkpdf, imagenpath, estado });
  const log = await logAction('updated', 'Submenú', Number(req.params.id), `Se actualizó el submenú '${descripcion}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/analitica-submenu/:id", isAuthenticated, async (req, res) => {
  const { data: submenus } = await mysql.getSubmenu();
  const submenuName = submenus?.find(s => s.id === Number(req.params.id))?.descripcion || '';
  const result = await mysql.deleteSubmenu(req.params.id);
  const log = await logAction('deleted', 'Submenú', Number(req.params.id), `Se eliminó el submenú '${submenuName}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/analitica-submenu/upload", isAuthenticated, async (req, res) => {
  try {
    uploadMenuMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      res.json({ success: true, url: `/assets/menu/${req.file.filename}` });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// --- Comunicaciones - Eventos ---
router.get("/comunicaciones-eventos", isAuthenticated, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = 6;
  const conditions = {};
  if (req.query.searchedEvento) conditions.title = req.query.searchedEvento;
  if (req.query.searchedTipoEvento) conditions.idTipoEvento = req.query.searchedTipoEvento;
  if (req.query.searchedStartDate) conditions.startDate = req.query.searchedStartDate;
  if (req.query.searchedEndDate) conditions.endDate = req.query.searchedEndDate;

  const [{ pages, amount }, { data: tiposEvento }] = await Promise.all([
    mysql.getComunicationsMeta({ pageSize, conditions }),
    mysql.getTiposEvento()
  ]);

  if (amount === 0) {
    return res.json({ success: true, data: { eventos: [], tiposEvento, pagination: { page, pages: 0, total: 0 } } });
  }

  const { data: eventos } = await mysql.getComunications({ paginate: true, page, pageSize, conditions });

  res.json({
    success: true,
    data: { eventos, tiposEvento, pagination: { page, pages, total: amount, pageSize } }
  });
});

router.post("/comunicaciones-eventos", isAuthenticated, async (req, res) => {
  const { title, idTipoEvento, organizedBy, place, direccion, shortDescription, description, startDay, startTime, endDay, endTime, price, imageUrl, reunionLink, facebookLink, youtubeLink, twitterLink, isActive } = req.body;
  const result = await mysql.createComunication({ title, idTipoEvento, organizedBy, place, shortDescription, description, startDay, startTime, endDay, endTime, price, imageUrl, direccion, reunionLink, facebookLink, youtubeLink, twitterLink, isActive: isActive ? 1 : 0 });
  const log = await logAction('created', 'Evento', result.data?.insertId, `Se creó el evento '${title}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/comunicaciones-eventos/:id", isAuthenticated, async (req, res) => {
  const { idTipoEvento, title, organizedBy, place, shortDescription, description, startDay, startTime, endDay, endTime, price, imageUrl, direccion, reunionLink, facebookLink, youtubeLink, twitterLink, isActive } = req.body;
  const result = await mysql.updateComunication({ id: req.params.id, idTipoEvento, title, organizedBy, place, shortDescription, description, startDay, startTime, endDay, endTime, price, imageUrl, direccion, reunionLink, facebookLink, youtubeLink, twitterLink, isActive });
  const log = await logAction('updated', 'Evento', Number(req.params.id), `Se actualizó el evento '${title}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/comunicaciones-eventos/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: eventos } = await mysql.getComunications({ paginate: false });
  const eventTitle = eventos?.find(e => e.id === id)?.title || '';
  const result = await mysql.deleteComunication(id);
  const log = await logAction('deleted', 'Evento', id, `Se eliminó el evento '${eventTitle}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/comunicaciones-eventos/upload", isAuthenticated, async (req, res) => {
  try {
    uploadEventoMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message || "Error al subir" });
      const url = `/assets/eventos/${req.file.filename}`;
      res.json({ success: true, url });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

router.get("/tipos-evento", isAuthenticated, async (req, res) => {
  const { data: tiposEvento } = await mysql.getTiposEvento();
  res.json({ success: true, data: tiposEvento });
});

// --- Comunicaciones - Revistas ---
// CRUD de tipos de revista (catálogo de temas)
router.get("/comunicaciones-revistas/tipos", isAuthenticated, async (req, res) => {
  const { data: tipos } = await mysql.getTiposRevista();
  res.json({ success: true, data: tipos });
});

router.post("/comunicaciones-revistas/tipos", isAuthenticated, async (req, res) => {
  const { value, isActive } = req.body;
  const result = await mysql.createTipoRevista({ value, isActive });
  const log = await logAction('created', 'Tipo Revista', result.data?.insertId, `Se creó el tipo de revista '${value}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/comunicaciones-revistas/tipos/:id", isAuthenticated, async (req, res) => {
  const { value, isActive } = req.body;
  const result = await mysql.updateTipoRevista({ id: Number(req.params.id), value, isActive });
  const log = await logAction('updated', 'Tipo Revista', Number(req.params.id), `Se actualizó el tipo de revista '${value}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/comunicaciones-revistas/tipos/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: tipos } = await mysql.getTiposRevista();
  const name = tipos?.find(t => t.id === id)?.value || '';
  const { count } = await mysql.countRevistasByTipoRevista(id);
  if (count > 0) {
    return res.status(400).json({ success: false, message: `No se puede eliminar: hay ${count} revista(s) asignada(s) a este tema` });
  }
  const result = await mysql.deleteTipoRevista(id);
  const log = await logAction('deleted', 'Tipo Revista', id, `Se eliminó el tipo de revista '${name}'`, req);
  res.json({ ...result, log: log || undefined });
});

// CRUD de revistas
router.get("/comunicaciones-revistas", isAuthenticated, async (req, res) => {
  const { data: revistas } = await mysql.getRevistas();
  res.json({ success: true, data: revistas });
});

router.post("/comunicaciones-revistas", isAuthenticated, async (req, res) => {
  const { titulo, idTemaRevista, imagen_url, pdf_url, esta_activo } = req.body;
  const slug = titulo ? titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '';
  const result = await mysql.createRevista({ titulo, slug, idTemaRevista, imagen_url, pdf_url, esta_activo });
  const log = await logAction('created', 'Revista', result.data?.insertId, `Se creó la revista '${titulo}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/comunicaciones-revistas/:id", isAuthenticated, async (req, res) => {
  const { titulo, idTemaRevista, imagen_url, pdf_url, esta_activo } = req.body;
  const slug = titulo ? titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '';
  const result = await mysql.updateRevista({ id: req.params.id, titulo, slug, idTemaRevista, imagen_url, pdf_url, esta_activo });
  const log = await logAction('updated', 'Revista', Number(req.params.id), `Se actualizó la revista '${titulo}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/comunicaciones-revistas/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: revistas } = await mysql.getRevistas();
  const name = revistas?.find(r => r.id === id)?.titulo || '';
  const result = await mysql.deleteRevista(id);
  const log = await logAction('deleted', 'Revista', id, `Se eliminó la revista '${name}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/comunicaciones-revistas/upload", isAuthenticated, async (req, res) => {
  try {
    uploadRevistaMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      const url = `/assets/revistas/${req.file.filename}`;
      res.json({ success: true, url });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// --- Datos Abiertos ---
router.get("/datos-abiertos", isAuthenticated, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = 5;
  const conditions = {};
  if (req.query.searchedTitulo) conditions.title = req.query.searchedTitulo;
  if (req.query.searchedDescripcion) conditions.description = req.query.searchedDescripcion;
  if (req.query.searchedCategoria) conditions.idCategoria = req.query.searchedCategoria;
  if (req.query.searchedFecha) conditions.fecha = req.query.searchedFecha;

  const { data: pages, dataLength: total } = await mysql.getDatosAbiertosPages({ pageLength: pageSize, conditions });

  if (total === 0) {
    const [{ data: categorias }, { data: tipos }] = await Promise.all([mysql.getCategorias(), mysql.getTipos()]);
    return res.json({ success: true, data: { datos: [], categorias, tipos, pagination: { page, pages: 0, total: 0 } } });
  }

  const [{ data: categorias }, { data: tipos }, { data: datos }] = await Promise.all([
    mysql.getCategorias(),
    mysql.getTipos(),
    mysql.getDatosAbiertos({ paginate: true, page, pageLength: pageSize, conditions })
  ]);

  res.json({
    success: true,
    data: { datos, categorias, tipos, pagination: { page, pages, total, pageSize } }
  });
});

router.post("/datos-abiertos", isAuthenticated, async (req, res) => {
  const { titulo, autor, descripcion, idCategoria, idTipo, excelfilepath, pdffilepath, csvfilepath, shapefilepath, fecha } = req.body;
  const estaActivo = req.body.esta_activo ?? req.body.estaActivo;
  const result = await mysql.createDatosAbiertos({ titulo, autor, descripcion, idCategoria, idTipo, excelfilepath: excelfilepath || 'null', pdffilepath: pdffilepath || 'null', csvfilepath: csvfilepath || 'null', shapefilepath: shapefilepath || 'null', estaActivo, fecha });
  const log = await logAction('created', 'Dataset', result.data?.insertId, `Se creó el dataset '${titulo}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/datos-abiertos/:id", isAuthenticated, async (req, res) => {
  const { titulo, autor, descripcion, idCategoria, idTipo, excelfilepath, pdffilepath, csvfilepath, shapefilepath, fecha } = req.body;
  const estaActivo = req.body.esta_activo ?? req.body.estaActivo;
  const result = await mysql.updateDatosAbiertos({ id: req.params.id, titulo, autor, descripcion, idCategoria, idTipo, excelfilepath: excelfilepath || 'null', pdffilepath: pdffilepath || 'null', csvfilepath: csvfilepath || 'null', shapefilepath: shapefilepath || 'null', estaActivo, fecha });
  const log = await logAction('updated', 'Dataset', Number(req.params.id), `Se actualizó el dataset '${titulo}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/datos-abiertos/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: datasets } = await mysql.getDatosAbiertos({ paginate: false });
  const titulo = datasets?.find(d => d.id === id)?.titulo || '';
  const result = await mysql.deleteDatosAbiertos(id);
  const log = await logAction('deleted', 'Dataset', id, `Se eliminó el dataset '${titulo}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/datos-abiertos/upload", isAuthenticated, async (req, res) => {
  try {
    uploadDatosMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      res.json({ success: true, url: `/assets/datos/${req.file.filename}` });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// --- Datos Abiertos - Categorías ---
router.get("/datos-abiertos-categorias", isAuthenticated, async (req, res) => {
  const { data: categorias } = await mysql.getCategorias();
  res.json({ success: true, data: categorias });
});

router.post("/datos-abiertos-categorias", isAuthenticated, async (req, res) => {
  const { value, icon, estaActivo } = req.body;
  const result = await mysql.createCategoria({ value, icon, estaActivo });
  const log = await logAction('created', 'Categoría', result.data?.insertId, `Se creó la categoría '${value}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/datos-abiertos-categorias/:id", isAuthenticated, async (req, res) => {
  const { value, icon, estaActivo } = req.body;
  const result = await mysql.updateCategoria({ id: req.params.id, value, icon, estaActivo });
  const log = await logAction('updated', 'Categoría', Number(req.params.id), `Se actualizó la categoría '${value}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/datos-abiertos-categorias/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: categorias } = await mysql.getCategorias();
  const name = categorias?.find(c => c.id === id)?.value || '';
  const result = await mysql.deleteCategoria(id);
  const log = await logAction('deleted', 'Categoría', id, `Se eliminó la categoría '${name}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/datos-abiertos-categorias/upload", isAuthenticated, async (req, res) => {
  try {
    uploadCategoriaMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      res.json({ success: true, url: `/assets/categoria/${req.file.filename}` });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// --- Datos Abiertos - Tipos ---
router.get("/datos-abiertos-tipos", isAuthenticated, async (req, res) => {
  const { data: tipos } = await mysql.getTipos();
  res.json({ success: true, data: tipos });
});

router.post("/datos-abiertos-tipos", isAuthenticated, async (req, res) => {
  const { value, estaActivo } = req.body;
  const result = await mysql.createTipo({ value, estaActivo });
  const log = await logAction('created', 'Tipo', result.data?.insertId, `Se creó el tipo '${value}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/datos-abiertos-tipos/:id", isAuthenticated, async (req, res) => {
  const { value, estaActivo } = req.body;
  const result = await mysql.updateTipo({ id: req.params.id, value, estaActivo });
  const log = await logAction('updated', 'Tipo', Number(req.params.id), `Se actualizó el tipo '${value}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/datos-abiertos-tipos/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: tipos } = await mysql.getTipos();
  const name = tipos?.find(t => t.id === id)?.value || '';
  const result = await mysql.deleteTipo(id);
  const log = await logAction('deleted', 'Tipo', id, `Se eliminó el tipo '${name}'`, req);
  res.json({ ...result, log: log || undefined });
});

// --- Usuarios ---
router.get("/usuarios", isAuthenticated, async (req, res) => {
  const [{ data: roles }, { data: usuarios }] = await Promise.all([
    mysql.getRoles(),
    mysql.getUsers()
  ]);
  res.json({ success: true, data: { usuarios, roles } });
});

router.post("/usuarios", isAuthenticated, async (req, res) => {
  const { user, password, roleId } = req.body;
  const estaActivo = req.body.esta_activo ?? req.body.estaActivo;
  const result = await mysql.createUser({ email: user, password, roleId, estaActivo });
  const log = await logAction('created', 'Usuario', result.data?.insertId, `Se creó el usuario '${user}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/usuarios/:id", isAuthenticated, async (req, res) => {
  const { user, password, roleId } = req.body;
  const estaActivo = req.body.esta_activo ?? req.body.estaActivo;
  const result = await mysql.updateUser({ id: req.params.id, email: user, password, roleId, estaActivo });
  const log = await logAction('updated', 'Usuario', Number(req.params.id), `Se actualizó el usuario '${user}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/usuarios/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: usuarios } = await mysql.getUsers();
  const email = usuarios?.find(u => u.id === id)?.user || '';
  const result = await mysql.deleteUser(id);
  const log = await logAction('deleted', 'Usuario', id, `Se eliminó el usuario '${email}'`, req);
  res.json({ ...result, log: log || undefined });
});

// --- Roles ---
router.get("/roles", isAuthenticated, async (req, res) => {
  const { data: roles } = await mysql.getRolesWithPermissions();
  const allPermissions = Object.values(require('../../controllers/permission').Permission);

  const PERMISSION_ACTION_ALIASES = { read: 'Acceder', create: 'Crear', update: 'Actualizar', delete: 'Eliminar' };

  const mapped = roles.map(role => ({
    ...role,
    permissions: role.permissions.map(p => {
      const aliasSufix = allPermissions.find(crud => Object.values(crud).includes(p.value))?.meta?.alias || '';
      const action = p.value.split('.')[1];
      return { ...p, alias: `${PERMISSION_ACTION_ALIASES[action] || action} ${aliasSufix}` };
    }),
    permissionValuesString: JSON.stringify(role.permissions.map(p => p.value))
  }));

  res.json({ success: true, data: { roles: mapped, permisos: allPermissions } });
});

router.post("/roles", isAuthenticated, async (req, res) => {
  const { value, permissionIds } = req.body;
  const result = await mysql.createRole({ value, permissionIds });
  const log = await logAction('created', 'Rol', null, `Se creó el rol '${value}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/roles/:id", isAuthenticated, async (req, res) => {
  const { value, permissionIds } = req.body;
  const result = await mysql.updateRole({ id: req.params.id, value, permissionIds });
  const log = await logAction('updated', 'Rol', Number(req.params.id), `Se actualizó el rol '${value}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/roles/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: roles } = await mysql.getRoles();
  const name = roles?.find(r => r.id === id)?.value || '';
  const result = await mysql.deleteRole(id);
  const log = await logAction('deleted', 'Rol', id, `Se eliminó el rol '${name}'`, req);
  res.json({ ...result, log: log || undefined });
});

// --- Dashboard Stats ---
router.get("/stats/dashboard", isAuthenticated, async (req, res) => {
  try {
    const [usuarios, menus, submenus, eventosMeta, datosMeta] = await Promise.all([
      mysql.getUsers(),
      mysql.getMenu(),
      mysql.getSubmenu(),
      mysql.getComunicationsMeta({ pageSize: 1, conditions: {} }),
      mysql.getDatosAbiertosPages({ pageLength: 1, conditions: {} }),
    ]);
    res.json({
      success: true,
      data: {
        usuarios: usuarios.data?.length || 0,
        menus: menus.data?.length || 0,
        menusActivos: menus.data?.filter(m => m.estaActivo)?.length || 0,
        submenus: submenus.data?.length || 0,
        submenusActivos: submenus.data?.filter(s => s.estado)?.length || 0,
        eventos: eventosMeta?.amount || 0,
        datasets: datosMeta?.dataLength || 0,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al obtener estadísticas" });
  }
});

// --- Redes Sociales ---
router.get("/redes-sociales", isAuthenticated, async (req, res) => {
  const { data: redes } = await mysql.getRedesSociales();
  res.json({ success: true, data: redes });
});

router.post("/redes-sociales", isAuthenticated, async (req, res) => {
  const { red, url, imagen_url, isActive } = req.body;
  const result = await mysql.createRedSocial({ red, url, imagen_url, isActive });
  const log = await logAction('created', 'Red Social', result.data?.insertId, `Se creó la red social '${red}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/redes-sociales/:id", isAuthenticated, async (req, res) => {
  const { red, url, imagen_url, isActive } = req.body;
  const result = await mysql.updateRedSocial({ id: Number(req.params.id), red, url, imagen_url, isActive });
  const log = await logAction('updated', 'Red Social', Number(req.params.id), `Se actualizó la red social '${red}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/redes-sociales/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: redes } = await mysql.getRedesSociales();
  const name = redes?.find(r => r.id === id)?.red || '';
  const result = await mysql.deleteRedSocial(id);
  const log = await logAction('deleted', 'Red Social', id, `Se eliminó la red social '${name}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/redes-sociales/upload", isAuthenticated, async (req, res) => {
  try {
    uploadRedMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      const url = `/assets/redes/${req.file.filename}`;
      res.json({ success: true, url });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// --- Programas ---
router.get("/programas", isAuthenticated, async (req, res) => {
  const { data: programas } = await mysql.getProgramas();
  res.json({ success: true, data: programas });
});

router.post("/programas", isAuthenticated, async (req, res) => {
  const { codigo, nombre, enlace, estaActivo } = req.body;
  const result = await mysql.createPrograma({ codigo, nombre, enlace, estaActivo });
  const log = await logAction('created', 'Programa', result.data?.insertId, `Se creó el programa '${nombre}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.put("/programas/:id", isAuthenticated, async (req, res) => {
  const { codigo, nombre, enlace, estaActivo } = req.body;
  const result = await mysql.updatePrograma({ id: Number(req.params.id), codigo, nombre, enlace, estaActivo });
  const log = await logAction('updated', 'Programa', Number(req.params.id), `Se actualizó el programa '${nombre}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.delete("/programas/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { data: programas } = await mysql.getProgramas();
  const name = programas?.find(p => p.id === id)?.nombre || '';
  const result = await mysql.deletePrograma(id);
  const log = await logAction('deleted', 'Programa', id, `Se eliminó el programa '${name}'`, req);
  res.json({ ...result, log: log || undefined });
});

router.post("/entornos-viales/upload", isAuthenticated, async (req, res) => {
  try {
    uploadEntornoMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      const url = `/assets/entornos/${req.file.filename}`;
      res.json({ success: true, url });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// --- Publicaciones Estado (habilitar/deshabilitar) ---
const GHOST_FILTERS = {
  noticias: 'tag:noticias-eventos',
  'notas-prensa': 'tag:notas-prensa',
  publicaciones: 'tags:[publicaciones]',
  'normas-legales': 'tags:[normas-legales]',
};

router.get("/publicaciones-estado", isAuthenticated, async (req, res) => {
  const { tipo, page } = req.query;
  if (!tipo || !GHOST_FILTERS[tipo]) return res.status(400).json({ success: false, message: "Tipo inválido" });

  const pageNum = Math.max(1, parseInt(page) || 1);

  try {
    const posts = await apiGhost.getPosts(10, 'tags,authors', GHOST_FILTERS[tipo], 'published_at DESC', pageNum);
    const pagination = posts.meta?.pagination || {};
    const { data: estadoMap } = await mysql.getPublicacionesEstado(tipo);

    const data = (posts || []).map(p => ({
      id: p.id,
      title: p.title,
      published_at: p.published_at,
      habilitado: estadoMap[p.id] !== 0,
    }));

    res.json({ success: true, data, pagination: { page: pagination.page, pages: pagination.pages, total: pagination.total, next: pagination.next, prev: pagination.prev } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al obtener publicaciones" });
  }
});

router.put("/publicaciones-estado", isAuthenticated, async (req, res) => {
  const { ghost_id, tipo, habilitado } = req.body;
  if (!ghost_id || !tipo) return res.status(400).json({ success: false, message: "Faltan campos" });

  const result = await mysql.setPublicacionEstado(ghost_id, tipo, habilitado);
  const log = await logAction('updated', `Publicación ${tipo}`, 0, `Se ${habilitado ? 'habilitó' : 'deshabilitó'} la publicación '${ghost_id}'`, req);
  res.json({ ...result, log: log || undefined });
});

// --- Banners ---
const bannersAssetsDir = path.join(__dirname, '../../public/assets');
const bannersUpload = multer({ dest: bannersAssetsDir });

// Transforma <em>palabra</em> <-> *palabra* para edición bilingüe del admin.
const emToAsterisk = (s) => (s == null ? '' : String(s).replace(/<em>(.*?)<\/em>/g, '*$1*'));
const asteriskToEm = (s) => (s == null ? null : String(s).replace(/\*([^*]+?)\*/g, '<em>$1</em>'));

const BANNER_TEXT_FIELDS = [
  'kicker_es', 'kicker_en',
  'titulo_es', 'titulo_en',
  'parrafo_es', 'parrafo_en',
  'btn1_label_es', 'btn1_label_en',
  'btn2_label_es', 'btn2_label_en'
];

router.get("/banners", isAuthenticated, async (req, res) => {
  const result = await mysql.getBanners();
  if (result.success && Array.isArray(result.data)) {
    result.data = result.data.map(b => {
      const out = { ...b };
      for (const f of BANNER_TEXT_FIELDS) {
        if (out[f] != null) out[f] = emToAsterisk(out[f]);
      }
      return out;
    });
  }
  res.json(result);
});

router.put("/banners/order", isAuthenticated, async (req, res) => {
  const { orden } = req.body; // [{ id, posicion }, ...]
  if (!Array.isArray(orden) || orden.length === 0) {
    return res.status(400).json({ success: false, message: "Orden inválido" });
  }
  const result = await mysql.updateBannerOrder(orden);
  const log = await logAction('updated', 'Banners', 0, 'Se actualizó el orden de los banners', req);
  res.json({ ...result, log: log || undefined });
});

router.post("/banners/upload/:id", isAuthenticated, bannersUpload.single('file'), async (req, res) => {
  const id = Number(req.params.id);
  if (!id || !req.file) {
    return res.status(400).json({ success: false, message: "Faltan parámetros" });
  }
  const ext = path.extname(req.file.originalname) || '.png';
  const filename = `banner_${id}_${Date.now()}${ext}`;
  const destPath = path.join(bannersAssetsDir, filename);
  fs.renameSync(req.file.path, destPath);
  const archivo = `/assets/${filename}`;
  const result = await mysql.updateBannerArchivo(id, archivo);
  const log = await logAction('updated', 'Banner', id, `Se actualizó la imagen del banner`, req);
  res.json({ ...result, archivo, log: log || undefined });
});

router.put("/banners/textos/:id", isAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const { idioma, kicker, titulo, parrafo, btn1_label, btn1_href, btn2_label, btn2_href } = req.body || {};
  if (!id) {
    return res.status(400).json({ success: false, message: "ID inválido" });
  }
  if (idioma !== 'es' && idioma !== 'en') {
    return res.status(400).json({ success: false, message: "Idioma inválido" });
  }
  const datos = {
    kicker:    asteriskToEm(kicker),
    titulo:    asteriskToEm(titulo),
    parrafo:   asteriskToEm(parrafo),
    btn1_label: asteriskToEm(btn1_label),
    btn1_href:  (btn1_href == null ? null : String(btn1_href).trim() || null),
    btn2_label: asteriskToEm(btn2_label),
    btn2_href:  (btn2_href == null ? null : String(btn2_href).trim() || null),
  };
  const result = await mysql.updateBannerTextos(id, idioma, datos);
  const log = await logAction('updated', 'Banner', id, `Se actualizaron los textos del banner (${idioma})`, req);
  res.json({ ...result, log: log || undefined });
});

module.exports = router;
