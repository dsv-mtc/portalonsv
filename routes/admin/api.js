const router = require('express').Router();
const passport = require("passport");
const criptoUtils = require("../../utils/criptoUtils");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const mysql = new (require("../../api/mysql"));
mysql.setQuery();

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

// --- Auth ---
router.get("/auth/me", isAuthenticated, (req, res) => {
  res.json({ success: true, data: { email: req.adminUser.user, role: req.adminUser.role } });
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
  res.json(result);
});

// --- Cifras ---
router.get("/cifras", isAuthenticated, async (req, res) => {
  const { data: cifras } = await mysql.getCifras();
  res.json({ success: true, data: cifras });
});

router.put("/cifras", isAuthenticated, async (req, res) => {
  const { lesionados, accidentados, fallecidos, mensaje1, mensaje2 } = req.body;
  const result = await mysql.updateCifras({ lesionados, accidentados, fallecidos, mensaje1, mensaje2 });
  res.json(result);
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
        comp1_titulo: enData[5].contenido,
        comp1_desc: enData[6].contenido,
        comp2_titulo: enData[7].contenido,
        comp2_desc: enData[8].contenido,
        comp3_titulo: enData[9].contenido,
        comp3_desc: enData[10].contenido,
        comp4_titulo: enData[11].contenido,
        comp4_desc: enData[12].contenido,
        comp5_titulo: enData[25].contenido,
        comp5_desc: enData[26].contenido,
        comp6_titulo: enData[27].contenido,
        comp6_desc: enData[28].contenido,
        comp7_titulo: enData[29].contenido,
        comp7_desc: enData[30].contenido,
        comp8_titulo: enData[31].contenido,
        comp8_desc: enData[32].contenido,
        comp9_titulo: enData[33].contenido,
        comp9_desc: enData[34].contenido,
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
        comp1_titulo: esData[5].contenido,
        comp1_desc: esData[6].contenido,
        comp2_titulo: esData[7].contenido,
        comp2_desc: esData[8].contenido,
        comp3_titulo: esData[9].contenido,
        comp3_desc: esData[10].contenido,
        comp4_titulo: esData[11].contenido,
        comp4_desc: esData[12].contenido,
        comp5_titulo: esData[25].contenido,
        comp5_desc: esData[26].contenido,
        comp6_titulo: esData[27].contenido,
        comp6_desc: esData[28].contenido,
        comp7_titulo: esData[29].contenido,
        comp7_desc: esData[30].contenido,
        comp8_titulo: esData[31].contenido,
        comp8_desc: esData[32].contenido,
        comp9_titulo: esData[33].contenido,
        comp9_desc: esData[34].contenido,
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
  res.json({ success: r1.success && r2.success, message: "Actualizado" });
});

// --- Popup ---
router.get("/popup", isAuthenticated, async (req, res) => {
  const { data: popup } = await mysql.getPopup();
  res.json({ success: true, data: { ...popup, estado: popup.estado === '1' } });
});

router.put("/popup", isAuthenticated, async (req, res) => {
  const { imagen, estado, enlace } = req.body;
  const result = await mysql.updatePopup({ imagen, estado: estado ? '1' : '0', enlace });
  res.json(result);
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
  const { nombreEncargado, celularEncargado, correoEncargado, pageLink } = req.body;
  const result = await mysql.updateRegiones({
    id: req.params.id,
    nombreEncargado,
    celularEncargado,
    correoEncargado,
    imageUrl: '',
    pageLink
  });
  res.json(result);
});

router.post("/regiones/:id/upload", isAuthenticated, async (req, res) => {
  try {
    const { data: all } = await mysql.getRegiones({ paginate: false });
    const region = all.find(r => r.id === Number(req.params.id));
    if (!region) return res.status(404).json({ success: false, message: "Región no encontrada" });
    req.regionName = region.value;
    uploadMw(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message || "Error al subir" });
      res.json({ success: true, message: "Imagen actualizada" });
    });
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
  res.json(result);
});

router.put("/analitica-menu/:id", isAuthenticated, async (req, res) => {
  const { descripcion, urlImagen, observacion, estaActivo } = req.body;
  const result = await mysql.updateMenu({ id: req.params.id, descripcion, urlImagen, observacion, estaActivo });
  res.json(result);
});

router.delete("/analitica-menu/:id", isAuthenticated, async (req, res) => {
  const result = await mysql.deleteMenu(req.params.id);
  res.json(result);
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
  res.json(result);
});

router.put("/analitica-submenu/:id", isAuthenticated, async (req, res) => {
  const { descripcion, menu_id, rutabi, linkvideo, linkpdf, imagenpath, estado } = req.body;
  const result = await mysql.updateSubmenu({ id: req.params.id, descripcion, menu_id, rutabi, linkvideo, linkpdf, imagenpath, estado });
  res.json(result);
});

router.delete("/analitica-submenu/:id", isAuthenticated, async (req, res) => {
  const result = await mysql.deleteSubmenu(req.params.id);
  res.json(result);
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
  res.json(result);
});

router.put("/comunicaciones-eventos/:id", isAuthenticated, async (req, res) => {
  const { idTipoEvento, title, organizedBy, place, shortDescription, description, startDay, startTime, endDay, endTime, price, imageUrl, direccion, reunionLink, facebookLink, youtubeLink, twitterLink, isActive } = req.body;
  const result = await mysql.updateComunication({ id: req.params.id, idTipoEvento, title, organizedBy, place, shortDescription, description, startDay, startTime, endDay, endTime, price, imageUrl, direccion, reunionLink, facebookLink, youtubeLink, twitterLink, isActive });
  res.json(result);
});

router.delete("/comunicaciones-eventos/:id", isAuthenticated, async (req, res) => {
  const result = await mysql.deleteComunication(req.params.id);
  res.json(result);
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

// --- Datos Abiertos ---
router.get("/datos-abiertos", isAuthenticated, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = 6;
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
  const { titulo, autor, descripcion, idCategoria, idTipo, excelfilepath, pdffilepath, csvfilepath, fecha } = req.body;
  const result = await mysql.createDatosAbiertos({ titulo, autor, descripcion, idCategoria, idTipo, excelfilepath: excelfilepath || 'null', pdffilepath: pdffilepath || 'null', csvfilepath: csvfilepath || 'null', fecha });
  res.json(result);
});

router.put("/datos-abiertos/:id", isAuthenticated, async (req, res) => {
  const { titulo, autor, descripcion, idCategoria, idTipo, excelfilepath, pdffilepath, csvfilepath, fecha } = req.body;
  const result = await mysql.updateDatosAbiertos({ id: req.params.id, titulo, autor, descripcion, idCategoria, idTipo, excelfilepath: excelfilepath || 'null', pdffilepath: pdffilepath || 'null', csvfilepath: csvfilepath || 'null', fecha });
  res.json(result);
});

router.delete("/datos-abiertos/:id", isAuthenticated, async (req, res) => {
  const result = await mysql.deleteDatosAbiertos(req.params.id);
  res.json(result);
});

// --- Datos Abiertos - Categorías ---
router.get("/datos-abiertos-categorias", isAuthenticated, async (req, res) => {
  const { data: categorias } = await mysql.getCategorias();
  res.json({ success: true, data: categorias });
});

router.post("/datos-abiertos-categorias", isAuthenticated, async (req, res) => {
  const { value, icon, estaActivo } = req.body;
  const result = await mysql.createCategoria({ value, icon, estaActivo });
  res.json(result);
});

router.put("/datos-abiertos-categorias/:id", isAuthenticated, async (req, res) => {
  const { value, icon, estaActivo } = req.body;
  const result = await mysql.updateCategoria({ id: req.params.id, value, icon, estaActivo });
  res.json(result);
});

router.delete("/datos-abiertos-categorias/:id", isAuthenticated, async (req, res) => {
  const result = await mysql.deleteCategoria(req.params.id);
  res.json(result);
});

// --- Datos Abiertos - Tipos ---
router.get("/datos-abiertos-tipos", isAuthenticated, async (req, res) => {
  const { data: tipos } = await mysql.getTipos();
  res.json({ success: true, data: tipos });
});

router.post("/datos-abiertos-tipos", isAuthenticated, async (req, res) => {
  const { value, estaActivo } = req.body;
  const result = await mysql.createTipo({ value, estaActivo });
  res.json(result);
});

router.put("/datos-abiertos-tipos/:id", isAuthenticated, async (req, res) => {
  const { value, estaActivo } = req.body;
  const result = await mysql.updateTipo({ id: req.params.id, value, estaActivo });
  res.json(result);
});

router.delete("/datos-abiertos-tipos/:id", isAuthenticated, async (req, res) => {
  const result = await mysql.deleteTipo(req.params.id);
  res.json(result);
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
  const result = await mysql.createUser({ email: user, password, roleId });
  res.json(result);
});

router.put("/usuarios/:id", isAuthenticated, async (req, res) => {
  const { user, password, roleId } = req.body;
  const result = await mysql.updateUser({ id: req.params.id, email: user, password, roleId });
  res.json(result);
});

router.delete("/usuarios/:id", isAuthenticated, async (req, res) => {
  const result = await mysql.deleteUser(req.params.id);
  res.json(result);
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
  res.json(result);
});

router.put("/roles/:id", isAuthenticated, async (req, res) => {
  const { value, permissionIds } = req.body;
  const result = await mysql.updateRole({ id: req.params.id, value, permissionIds });
  res.json(result);
});

router.delete("/roles/:id", isAuthenticated, async (req, res) => {
  const result = await mysql.deleteRole(req.params.id);
  res.json(result);
});

module.exports = router;
