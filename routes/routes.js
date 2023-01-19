const routes = require("express").Router();
const apiGhost = new (require("../api/ghost"));
const utils = require("../utils/utils");
const passport = require("passport");
const uploader = require("../controllers/multer");
const seo = require("../controllers/seo");
const feedController = new (require("../controllers/feed"));
const gcpUploaderController = require("../controllers/uploader.gcp");
const customUploader = require("../controllers/customMulter");
const youtubeApi = new (require("../api/gcp/Youtube"));
const openDataController = new (require("../controllers/opendatasearch"));


const mysql = new (require("../api/mysql"));
mysql.setQuery();
const STATICS_PATH = '/estaticos'
const IMG_PATH = `${STATICS_PATH}/img`
const PDF_PATH = `${STATICS_PATH}/pdf`
const CSV_PATH = `${STATICS_PATH}/csv`
const EXCEL_PATH = `${STATICS_PATH}/excel`


require('dotenv').config();

routes.use(async (req, res, next) => {
	res.locals.settings = await apiGhost.getSettings();
	res.locals.titlesPosts = await apiGhost.getLastFivePostsTitleAndUrl();
	res.locals.seoMetas = await seo.setMetaTags(req.originalUrl);
	const footerData = await mysql.getFooterData();
	res.locals.url_selected = req.originalUrl;
	res.locals.footerData = footerData.data;
	if (req.originalUrl.includes("/en/")) {
		res.locals.secondary_navigation = true;
		req.url = req.originalUrl.replace("en/", "")
		res.locals.lang = "en"
	}
	else {
		res.locals.lang = "es"
	}
	if (!res.locals.enabledFooter) {
		res.locals.enabledFooter = true;
	}
	if (!res.locals.enabledNavigation) {
		res.locals.enabledNavigation = true;
	}
	next();
})


routes.get("/", async (req, res) => {
	const accidents = await utils.getAccidents();
	const post2 = await apiGhost.getPosts(4, "tags", "tags: [noticias-eventos]");
	const post3 = await apiGhost.getPosts(3, "tags,authors", "tags:[publicaciones]", "published_at DESC");
	const banners = await utils.getImagesFiles('banner');
	const modalinfo = await apiGhost.getModalPosts();
	const lesionados = await mysql.getlesionado();
	const accidentados = await mysql.getAccidentado();
	const fallecidos = await mysql.getFallecido();
	const popupData = await mysql.getPopup()

	res.render("index", {
		post3,
		post2,
		accidents,
		banners,
		modalinfo,
		lesionados: lesionados.data,
		accidentados: accidentados.data,
		fallecidos: fallecidos.data,
		popup: popupData.data,
		popupStatus: JSON.stringify(popupData.data.estado)
	});
	// res.render("index",{post3,post2,accidents,banners,modalinfo, parametro: JSON.stringify(data)});
	//res.render("index",{post3,post2,accidents,banners,modalinfo});
})

routes.get("/quienes-somos", async (req, res) => {
	const { data: contenido } = await mysql.getContenidoQuienesSomos(res.locals.secondary_navigation)
	res.render("pages/quienes-somos", {
		contenido
	});
})


/**NOTICIAS Y EVENTOS */
routes.get("/noticias-eventos/:page?", async (req, res) => {
	const page = req.params.page ? req.params.page : 1;
	const post = await apiGhost.getPosts(7, "tags,authors", "tag:noticias-eventos", "published_at DESC", page);
	const pagination = post.meta.pagination;
	pagination.url_page = 'noticias-eventos';

	res.render("pages/noticias-eventos", { post, pagination });
})

/**POSTS */
/**
 * @description: Retorna el post con el contenido de noticias relacionadas en función del tag primario del post
 */
routes.get("/post/:slug", async (req, res) => {
	const post = await apiGhost.getPost(req.params.slug);
	const primary_tag = `tag:${post.primary_tag.slug}`
	const postsRelatives = await apiGhost.getPosts(4, "tags,authors", primary_tag, "published_at DESC");
	res.render("pages/post", { post, postsRelatives });
})

/**REGIONES*/
routes.get("/regiones", async (req, res) => {
	//general: tags:[noticias-eventos]
	const post = await apiGhost.getPosts(8, "tags,authors", "tags:[lima]", "published_at DESC");
	res.render("pages/regiones", { post });
})

routes.post("/services-map", async (req, res) => {
	//TODO es posible que en algunas regiones no existan noticias  y los posts sean vacío
	let regionRequest = req.body['region'];
	if (regionRequest === 'San Martín') regionRequest = 'san-martin';
	if (regionRequest === 'La Libertad') regionRequest = 'la-libertad';
	const lang = req.body['lang']
	const filter = `tags:[${regionRequest}]`;
	const post = await apiGhost.getPosts(8, "tags,authors", filter, "published_at DESC");
	const data = utils.serviceMap(regionRequest, { post, lang })
	res.send(data)
})

/**ANALÍTICA */
routes.get("/analitica", async (req, res) => {
	const result = await mysql.getSubmenu()
	res.locals.enabledNavigation = false;
	res.locals.enabledFooter = false;
	res.render("pages/analitica", { result: JSON.stringify(result.data) })
})

/**WEBINARS */
routes.get("/webinars", async (req, res) => {
	//await youtubeApi.getPlayLists();
	const playlist = await youtubeApi.getItemsFromPlayList();
	res.render("pages/webinars", { playlist });
})
/**SRAT */
routes.get("/srat", async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/srat");
})

/** PERU-WORLD */
routes.get("/peru-in-world", async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/peru-world");
})
/**PUBLICACIONES */
routes.get("/publicaciones", async (req, res) => {
	const post = await apiGhost.getPosts(6, "tags,authors", "tags:[publicaciones]", "published_at DESC")
	//const tags = await apiGhost.getTags("tags","all");
	const tags = utils.filterTags(post);
	res.render("pages/publicaciones", { post, tags });
})

/**NORMAS LEGALES */
routes.get("/normas-legales", async (req, res) => {
	const post = await apiGhost.getPosts(6, "tags,authors", "tags:[normas-legales]", "published_at DESC")
	//const tags = await apiGhost.getTags("tags","all");
	const tags = utils.filterTags(post);
	res.render("pages/normas-legales", { post, tags })
})

/**CONTACTO */
routes.get("/contacto", async (req, res) => {
	const info = req.flash('info');
	res.render("pages/contacto", { info: info });
})

routes.post("/contacto", async (req, res) => {
	const form = req.body;
	//existe validación desde el backend
	const response = await utils.sendEmail(form);
	if (response.success) {
		req.flash("info", { style: "alert alert-success alert-dismissible fade show", message: response.message })
	} else {
		req.flash('info', { style: "alert alert-danger alert-dismissible fade show", message: response.message });
	}
	if (form.lang == 'en') {
		res.redirect("/en/contacto")
	} else {
		res.redirect("/contacto")
	}

})

/** AULA VIRTUAL */
routes.get("/aulavirtual", async (req, res) => {
	res.locals.enabledNavigation = false;
	res.locals.enabledFooter = false;
	res.render("pages/aula-virtual");
})

/** BÚSQUEDA POR TAGS */
routes.get("/tag/:tag/:page?", async (req, res) => {
	const tag = req.params.tag;
	const page = req.params.page ? req.params.page : 1;
	const filter = `tags:[${tag}]`;
	const post = await apiGhost.getPosts(6, 'tags,authors', filter, 'published_at DESC', page);
	const pagination = post.meta.pagination;
	pagination.url_page = `tag/${tag}`;
	res.render('pages/tags', { tag, post, pagination })
})

/**FEED */
routes.get("/feed", async (req, res) => {
	const xmlString = await feedController._createFeedXml();
	res.set('Content-Type', 'application/xml');
	res.send(xmlString)
})

/* ZONA DE DATOS ABIERTOS */
routes.get("/datosabiertos/:page?", async (req, res) => {
	const page = req.params.page ? Number(req.params.page) : 1;
	const pageLength = 5
	const {data: pages} = await mysql.getDocumentsPages({
		pageLength
	})
	const pagination = {
		page,
		pages,
		next: (page + 1) > pages ? null : (page + 1),
		prev: (page - 1) < 1 ? null : (page - 1),
		url_page: 'datosabiertos'
	}

	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { categories } = utils.constants;
	let documentsList = [];
	if (process.env.STRATEGY_MODE === 'ON_PREMISE') {
		documentsList = await utils.getDocuments({ page, pageLength });
	}
	if (process.env.STRATEGY_MODE === 'GCP') {
		documentsList = await gcpUploaderController.getDocumentsList();
	}

	res.render("pages/datos-abiertos", { categories, documentsList, pagination });
})

routes.post("/datosabiertos", async (req, res) => {
	const form = req.body;
	const lang = req.body['lang'];
	if (process.env.STRATEGY_MODE === 'GCP') {
		let result = await openDataController.searchMetadaByGcp(form);
		res.send(result);
	}
	if (process.env.STRATEGY_MODE === 'ON_PREMISE') {

		let result = await openDataController.searchMetadataByMysql(form);
		if (result.success) {
			const searchRendered = utils.renderSearchOpenDataTemplate({ documentsList: result.posts, lang: lang })
			res.send({ success: true, posts: searchRendered });
		} else {
			res.send({ success: false });
		}
	}
})

routes.get("/datosabiertos-login", isNotAuthenticated, (req, res) => {
	const info_login = req.flash('login');
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/datos-abiertos-login", { info_login });
})

routes.get("/datosabiertos-logout", (req, res) => {
	req.logOut();
	res.redirect("/datosabiertos-login")
})

routes.post("/datosabiertos-login", passport.authenticate('local-login', {
	successRedirect: "/datosabiertos-admin",
	failureRedirect: "/datosabiertos-login",
	passReqToCallback: true
}))

routes.get("/datosabiertos-admin", isAuthenticated, (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { categories, types } = utils.constants;
	const info_document = req.flash('document');
	res.render("pages/datos-abiertos-admin", { categories, types, info_document })
})

routes.post("/datosabiertos-admin", isAuthenticated, uploader, async (req, res) => {
	let response = null;
	if (process.env.STRATEGY_MODE === 'GCP') {
		response = await gcpUploaderController.uploadFileAndRegisterMetadata(req)
	}
	if (process.env.STRATEGY_MODE === 'ON_PREMISE') {
		response = await utils.saveDocument(req);
	}

	if (response.success) {
		req.flash("document", { style: "alert alert-success alert-dismissible fade show", message: response.message })
	} else {
		req.flash('document', { style: "alert alert-danger alert-dismissible fade show", message: response.message });
	}
	res.redirect("/datosabiertos-admin")
})

routes.get("/secciones-admin/cifras", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: cifras } = await mysql.getCifras();
	const { secondary_navigation } = res.locals
	const info_document = req.flash('document');
	res.render("pages/secciones-admin/cifras", {
		...cifras,
		secondary_navigation,
		info_document
	});
})

routes.post("/datosabiertos-admin/cifras", isAuthenticated, async (req, res) => {
	const { lesionados, accidentados, fallecidos, telefono, email } = req.body;
	const { success, message } = await mysql.updateCifras({
		lesionados,
		accidentados,
		fallecidos,
		telefono,
		email
	})
	const style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message
	})
	res.redirect("/secciones-admin/cifras")
})

routes.get("/secciones-admin/mision-vision", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: enData } = await mysql.getContenidoQuienesSomos(true);
	const { data: esData } = await mysql.getContenidoQuienesSomos(false);
	const info_document = req.flash('document');

	res.render("pages/secciones-admin/mision-vision", {
		enDescripcion: enData[0].contenido,
		enMision: enData[1].contenido,
		enVision: enData[2].contenido,
		esDescripcion: esData[0].contenido,
		esMision: esData[1].contenido,
		esVision: esData[2].contenido,
		info_document
	})
})

routes.post("/datosabiertos-admin/mision-vision", isAuthenticated, async (req, res) => {
	const {
		enDescripcion,
		enMision,
		enVision,
		esDescripcion,
		esMision,
		esVision
	} = req.body;

	const { success: enSuccess, message: enMessage } = await mysql.updateMisionVision(true, {
		descripcion: enDescripcion,
		mision: enMision,
		vision: enVision
	})

	let style = `alert alert-${enSuccess ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message: enMessage
	})

	const { success: esSuccess, message: esMessage } = await mysql.updateMisionVision(false, {
		descripcion: esDescripcion,
		mision: esMision,
		vision: esVision
	})

	style = `alert alert-${esSuccess ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message: esMessage
	})

	res.redirect('/secciones-admin/mision-vision')
})

routes.get("/secciones-admin/popup", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: popup } = await mysql.getPopup();
	res.render("pages/secciones-admin/popup", {
		...popup,
		estado: popup.estado === '1'
	})
})

routes.post("/secciones-admin/popup", isAuthenticated, customUploader, async (req, res) => {
	const { estado, enlace, imageValue } = req.body;
	const encodeEstado = estado === 'on' ? '1' : '0'

	let imagen = IMG_PATH
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imagen = `${imagen}/${file.filename}`
	} else {
		imagen = imageValue
	}
	const { success, message } = await mysql.updatePopup({
		imagen,
		estado: encodeEstado,
		enlace
	})

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`

	req.flash("document", {
		style,
		message
	})

	res.json({
		style,
		message
	})

})

routes.get("/secciones-admin/analitica-submenu", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: submenu } = await mysql.getSubmenu();
	const { data: menu } = await mysql.getMenu();

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/analitica-submenu", {
		submenu,
		menu,
		info_document
	})
})

routes.post("/secciones-admin/analitica-submenu", isAuthenticated, customUploader, async (req, res) => {
	const {
		submenu,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imgFileName,
		estado
	} = req.body;

	let imagenpath = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imagenpath = `${IMG_PATH}/${file.filename}`
	} else {
		imagenpath = imgFileName
	}

	const { success, message } = await mysql.createSubmenu({
		descripcion: submenu,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imagenpath,
		estado
	})

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message
	})

	res.json({
		success,
		style,
		message
	})
})

routes.put("/secciones-admin/analitica-submenu", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		submenu,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imgFileName,
		estado
	} = req.body;

	let imagenpath = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imagenpath = `${IMG_PATH}/${file.filename}`
	} else {
		imagenpath = imgFileName
	}

	const { success, message } = await mysql.updateSubmenu({
		id,
		descripcion: submenu,
		menu_id,
		rutabi,
		linkvideo,
		linkpdf,
		imagenpath,
		estado
	})

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`

	req.flash("document", {
		style,
		message
	})

	res.json({
		success,
		style,
		message
	})
})

routes.delete("/secciones-admin/analitica-submenu", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteSubmenu(id);

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message
	})

	res.json({
		success,
		style,
		message
	})
})

routes.get("/secciones-admin/datos-abiertos", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { categories, types } = utils.constants;
	const { data: datos } = await mysql.getDatosAbiertos();

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/datos-abiertos", {
		datos: datos.map(d => ({
			...d,
			v_tipo: types.find(t => t.value === d.tipo)?.key ?? 'No existe',
			v_categoria: categories.find(c => c.value === d.categoria)?.key ?? 'No existe',
		})),
		categories,
		types,
		info_document
	})
})

routes.post("/secciones-admin/datos-abiertos", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_titulo,
		new_autor,
		new_descripcion,
		new_categoria,
		new_tipo,
		new_fecha
	} = req.body;

	let excelfilepath = 'null'
	if (req.files['excel-file']) {
		const file = req.files['excel-file'][0]
		excelfilepath = `${EXCEL_PATH}/${file.filename}`
	}

	let pdffilepath = 'null'
	if (req.files['pdf-file']) {
		const file = req.files['pdf-file'][0]
		pdffilepath = `${PDF_PATH}/${file.filename}`
	}

	let csvfilepath = 'null'
	if (req.files['csv-file']) {
		const file = req.files['csv-file'][0]
		csvfilepath = `${CSV_PATH}/${file.filename}`
	}

	const { success, message } = await mysql.createDatosAbiertos({
		titulo: new_titulo,
		autor: new_autor,
		descripcion: new_descripcion,
		categoria: new_categoria,
		tipo: new_tipo,
		excelfilepath,
		pdffilepath,
		csvfilepath,
		fecha: new_fecha
	})

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`

	req.flash("document", {
		style,
		message
	})

	res.json({
		success,
		style,
		message
	})
})

routes.put("/secciones-admin/datos-abiertos", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		titulo,
		autor,
		descripcion,
		categoria,
		tipo,
		excelFileName,
		pdfFileName,
		csvFileName,
		fecha
	} = req.body;

	let excelfilepath = 'null'
	if (req.files['excel-file']) {
		const file = req.files['excel-file'][0]
		excelfilepath = `${EXCEL_PATH}/${file.filename}`
	} else {
		excelfilepath = excelFileName || 'null'
	}

	let pdffilepath = 'null'
	if (req.files['pdf-file']) {
		const file = req.files['pdf-file'][0]
		pdffilepath = `${PDF_PATH}/${file.filename}`
	} else {
		pdffilepath = pdfFileName || 'null'
	}

	let csvfilepath = 'null'
	if (req.files['csv-file']) {
		const file = req.files['csv-file'][0]
		csvfilepath = `${CSV_PATH}/${file.filename}`
	} else {
		csvfilepath = csvFileName || 'null'
	}

	const { success, message } = await mysql.updateDatosAbiertos({
		id,
		titulo,
		autor,
		descripcion,
		categoria,
		tipo,
		excelfilepath,
		pdffilepath,
		csvfilepath,
		fecha
	})

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`

	req.flash("document", {
		style,
		message
	})

	res.json({
		success,
		style,
		message
	})
})

routes.delete("/secciones-admin/datos-abiertos", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteDatosAbiertos(id);

	let style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message
	})

	res.json({
		success,
		style,
		message
	})
})

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/datosabiertos-login');
	return;
}

function isNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('/datosabiertos-admin');
		return;
	}
	return next();
}

/* FIN DE ZONA DE DATOS ABIERTOS */

/****SEARCH **/
routes.post("/search", async (req, res) => {
	const slug = req.body["search"];
	const lang = req.body["lang"];
	const results = await apiGhost.getSearchPosts(`tags:${req.body["filter"]}`, slug);
	if (results.success && req.body['filter'] != 'noticias-eventos') {
		const searchRendered = utils.renderSearchTemplate({ posts: results.posts, lang: lang });
		const tags = utils.filterTags(results.posts);
		const tagsRendered = utils.renderTagTemplate({ tags })
		res.send({ success: true, posts: searchRendered, tags: tagsRendered });
	} else if (results.success && req.body['filter'] == 'noticias-eventos') {
		const { page, prev, next, step } = req.body;
		const searchRendered = utils.renderNoticiasEventosTemplate({ post: results.posts, lang, keyword: req.body['search'], page, prev, next, step })
		res.send({ success: true, posts: searchRendered });
	} else {
		res.send({ success: false })
	}
})

//SusCripción
routes.post("/subscribe", async (req, res) => {
	const form = req.body;
	const response = await utils.subscribeUser(form);
	if (response.success) {
		res.send('Te has suscrito con éxito');
	} else {
		res.send('No te has podido suscribir');
	}

})

//SITEMAP
routes.get('/sitemap', async (req, res) => {
	const sitemap = seo.createSiteMapV2();
	res.set('Content-Type', 'application/xhtml+xml');
	res.status(200).send(sitemap);
})

// REDIRECCIÓN DE ERRORES
routes.use((req, res) => {
	res.status(404).redirect('/');
})


module.exports = routes;
