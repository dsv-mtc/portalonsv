const routes = require("express").Router();
const apiGhost = new (require("../api/ghost"));
const utils = require("../utils/utils");
const passport = require("passport");
const moment = require("moment");
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
	res.locals.footerData = {
		...footerData.data,
		year: new Date().getFullYear()
	};
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
	const post2 = await apiGhost.getPosts(3, "tags", "tags: [noticias-eventos]");
	const post3 = await apiGhost.getPosts(3, "tags,authors", "tags:[publicaciones]", "published_at DESC");
	const banners = await utils.getImagesFiles('banner');
	const modalinfo = await apiGhost.getModalPosts();

	const { data: cifras } = await mysql.getCifras();

	const popupData = await mysql.getPopup()

	res.render("index", {
		post3,
		post2,
		accidents,
		banners,
		modalinfo,
		...cifras,
		popup: popupData.data,
		popupStatus: JSON.stringify(popupData.data.estado)
	});
})

routes.get("/quienes-somos", async (req, res) => {
	const { data: contenido } = await mysql.getContenidoQuienesSomos(res.locals.secondary_navigation)
	res.render("pages/quienes-somos", {
		contenido
	});
})


/**NOTICIAS Y EVENTOS */
routes.get("/comunicaciones/noticias/:page?", async (req, res) => {
	const page = req.params.page ? req.params.page : 1;
	const post = await apiGhost.getPosts(7, "tags,authors", "tag:noticias-eventos", "published_at DESC", page);
	const pagination = post.meta.pagination;
	pagination.url_page = 'comunicaciones/noticias';

	res.render("pages/comunicaciones/noticias", { post, pagination });
})

routes.get("/comunicaciones/nota-prensa/:page?", async (req, res) => {
	const page = req.params.page ? req.params.page : 1;
	const post = await apiGhost.getPosts(7, "tags,authors", "tag:notas-prensa", "published_at DESC", page);
	const pagination = post.meta.pagination;
	pagination.url_page = 'comunicaciones/nota-prensa';

	res.render("pages/comunicaciones/notas-prensa", { post, pagination });
})

routes.get("/comunicaciones/:slug", async (req, res) => {
	const { slug } = req.params;

	const TIPO_EVENTO = {
		"todos": 0,
		"campanias": 1,
		"eventos": 2,
		"entrevistas": 3
	}

	const idTipoEvento = TIPO_EVENTO[slug];
	const isId = Number(slug);

	if (!idTipoEvento && !isId && idTipoEvento !== 0) {
		return res.redirect("/");
	}

	if (isId) {
		const { data: evento } = await mysql.getComunication(slug);

		res.render("pages/comunicaciones/evento", {
			evento
		});
		return
	}

	let conditions = {
		isActive: true,
	}

	if (idTipoEvento) {
		conditions.idTipoEvento = idTipoEvento;
	}

	const [
		{ data: all },
		{ data: allNear },
		{ data: eventos },
		{ data: eventosProximos },
	] = await Promise.all([
		mysql.getComunications({
			conditions: {
				isActive: true
			}
		}),
		mysql.getComunications({
			conditions: {
				isActive: true,
				nearest: true
			}
		}),
		mysql.getComunications({
			conditions
		}),
		mysql.getComunications({
			conditions: {
				...conditions,
				nearest: true
			}
		})
	]);

	res.render("pages/comunicaciones/todos", {
		eventosProximos: eventosProximos.slice(0, 5).map(e => ({
			...e,
			startDay: moment(e.startTime).format("DD"),
			startMonth: moment(e.startTime).format("MMM"),
		})).sort((a, b) => a.startTime - b.startTime),
		eventos: JSON.stringify(eventos),
		all: JSON.stringify(all),
		allNear: JSON.stringify(allNear.map(e => ({
			...e,
			startDay: moment(e.startTime).format("DD"),
			startMonth: moment(e.startTime).format("MMM"),
		})).sort((a, b) => a.startTime - b.startTime)),
	});
})

/**POSTS */
/**
 * @description: Retorna el post con el contenido de noticias relacionadas en función del tag primario del post
 */
routes.get("/post/:slug", async (req, res) => {
	const post = await apiGhost.getPost(req.params.slug);
	const primary_tag = `tag:${post.primary_tag.slug}`
	const postsRelatives = await apiGhost.getPosts(4, "tags,authors", primary_tag, "published_at DESC");

	let html = post.html;

	const regExp = /<!--kg-card-begin: markdown-->([\s\S]*?)<!--kg-card-end: markdown-->/;

	const imagesContainer = html.match(regExp);

	let imageUrls

	if (imagesContainer) {
		const foundImageUrls = imagesContainer[1].match(/src="([^"]*)"/g);
		if (foundImageUrls) {
			imageUrls = foundImageUrls.map(url => url
				.replace('src="', '')
				.replace('"', '')
				.replace(
					/http:\/\/www\.onsv\.gob\.pe\/content\/images/, 
					'https://www.onsv.gob.pe:5000/content/images'
				)
			)

			html = html.replace(regExp, `
				<figure class="container image-galery mt-5 mb-5">
					<picture class="principal-image">
						<img src="${imageUrls[0]}" alt="imagen principal del post">
					</picture>

					<div class="images-list">
						${imageUrls.map((url, i) => `
							<div class="image ${i === 0 ? 'active' : ''}">
								<img src="${url}" alt="Imágenes del post">
							</div>
						`).join('')}
					</div>	
				
				</figure>
			`);

		}
	}

	res.render("pages/post", {
		post: {
			...post,
			html
		},
		postsRelatives,
	});
})

/**REGIONES*/
routes.get("/regiones", async (req, res) => {
	//general: tags:[noticias-eventos]
	const post = await apiGhost.getPosts(8, "tags,authors", "tags:[lima]", "published_at DESC");
	console.log(post)
	res.render("pages/regiones", { post });
})

routes.get("/region/:name", async (req, res) => {
	const { name } = req.params;
	const {data: region, success} = await mysql.getRegion(name);

	res.json({
		ok: success,
		region
	});
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
	const [
		{ data: menu },
		{ data: submenu }
	] = await Promise.all([
		mysql.getMenuActivos(),
		mysql.getSubmenuActivos(),
	])

	const fullMenu = menu.map((m) => {
		const sub = submenu.filter((sub) => sub.menu_id === m.id)
		return {
			...m,
			submenu: sub
		}
	})


	res.locals.enabledNavigation = false;
	res.locals.enabledFooter = false;
	res.render("pages/analitica", {
		menu: fullMenu
	})
})

/**WEBINARS */
routes.get("/webinars", async (req, res) => {
	await youtubeApi.getPlayLists();
	const playlist = await youtubeApi.getItemsFromWebinarsPlayList();
	res.render("pages/webinars", { playlist });
})

routes.get("/capacitaciones", async (req, res) => {
	const playlists = await youtubeApi.getPlayLists();
	const playlistId = playlists.find(p => p.snippet.title.toLowerCase().includes('capacitaciones')).id;
	const playlist = await youtubeApi.getItemsFromPlayList(playlistId);
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
routes.get("/publicaciones/:page?", async (req, res) => {
	const pageSize = 6;
	const {
		year,
		categoria,
		region,
		title,
	} = req.query
	const page = req.params.page ? Number(req.params.page) : 1;

	const publicacionesFilter = "tags:[publicaciones]+";
	const categoriaFilter = categoria ? `tags:[${categoria}]+` : '';
	const regionFilter = region ? `tags:[${region}]+` : '';
	const yearFilter = year ? `tags:[${year}]+` : '';

	const filter = `${publicacionesFilter}${categoriaFilter}${regionFilter}${yearFilter}`.slice(0, -1);

	let posts = []
	try {
		posts = await apiGhost.get().posts
			.browse({
				filter,
				limit: title ? 'all' : pageSize,
				include: 'tags,authors',
				order: "published_at DESC",
				page
			})
	} catch (error) {
		console.error(error)
	}

	let pagination = posts.meta?.pagination ?? {};
	pagination.url_page = 'publicaciones';

	const categoriaQuery = categoria ? `categoria=${categoria}&` : '';
	const regionQuery = region ? `region=${region}&` : '';
	const yearQuery = year ? `year=${year}&` : '';
	const titleQuery = title ? `title=${title}&` : '';

	const urlQuery = `?${titleQuery}${categoriaQuery}${regionQuery}${yearQuery}`.slice(0, -1);

	pagination.url_query = urlQuery

	if (title) {
		const splitArray = (array, size) => {
			const result = [];
			for (let i = 0; i < array.length; i += size) {
				result.push(array.slice(i, i + size));
			}
			return result;
		};
		let filteredPosts = posts.filter(post => {
			titleMatch = `${post.slug} ${post.title}`.toLowerCase().includes(title.toLowerCase())
			return titleMatch;
		})
		const paginateFilteredPosts = splitArray(filteredPosts, pageSize)
		pagination.pages = paginateFilteredPosts.length
		pagination.limit = pageSize
		pagination.page = page
		pagination.total = filteredPosts.length
		pagination.next = page < pagination.pages ? page + 1 : null
		pagination.prev = page > 1 ? page - 1 : null
		posts = paginateFilteredPosts[page - 1] ?? []
	}

	if (pagination.pages < page) {
		console.log({
			message: `Redirecting from page ${page} to page ${pagination.pages}`
		})
		res.redirect(`/publicaciones/${pagination.pages}${urlQuery}`);
		return
	}

	const [allTags, { data: regiones }] = await Promise.all([
		await apiGhost.getTags("tags", "all"),
		await mysql.getRegiones()
	])

	const isYearRegExp = /^\d{4}$/;

	const filteredTags = allTags
		.filter(tag => !(isYearRegExp.test(tag.slug) || regiones.some(r => r.slug === tag.slug)))
		.map(tag => ({
			name: utils.capitalizeNameRecursive(tag.name),
			slug: tag.slug,
			estaSeleccionado: tag.slug === categoria
		}))

	const years = allTags.filter(tag => (/^\d{4}$/.test(tag.slug))).map(tag => ({
		name: tag.name,
		slug: tag.slug,
		estaSeleccionado: tag.slug === year
	}))

	const tags = utils.filterTags(posts);

	res.render("pages/publicaciones", {
		posts,
		hasResults: posts.length !== 0,
		tags,
		allTags: filteredTags,
		years,
		regiones: regiones.map(r => ({
			value: r.value,
			slug: r.slug,
			estaSeleccionado: r.slug === region
		})),
		pagination,
		year,
		categoria,
		region,
		title,
	});
})

/**NORMAS LEGALES */
routes.get("/normas-legales/:page?", async (req, res) => {
	const pageSize = 6;
	const {
		year,
		categoria,
		region,
		title,
	} = req.query
	const page = req.params.page ? Number(req.params.page) : 1;

	const normasLegalesFilter = "tags:[normas-legales]+";
	const categoriaFilter = categoria ? `tags:[${categoria}]+` : '';
	const regionFilter = region ? `tags:[${region}]+` : '';
	const yearFilter = year ? `tags:[${year}]+` : '';

	const filter = `${normasLegalesFilter}${categoriaFilter}${regionFilter}${yearFilter}`.slice(0, -1);

	let posts = []
	try {
		posts = await apiGhost.get().posts
			.browse({
				filter,
				limit: title ? 'all' : pageSize,
				include: 'tags,authors',
				order: "published_at DESC",
				page
			})
	} catch (error) {
		console.error(error)
	}

	let pagination = posts.meta?.pagination ?? {};
	pagination.url_page = 'normas-legales';

	const categoriaQuery = categoria ? `categoria=${categoria}&` : '';
	const regionQuery = region ? `region=${region}&` : '';
	const yearQuery = year ? `year=${year}&` : '';
	const titleQuery = title ? `title=${title}&` : '';

	const urlQuery = `?${titleQuery}${categoriaQuery}${regionQuery}${yearQuery}`.slice(0, -1);

	pagination.url_query = urlQuery

	if (title) {
		const splitArray = (array, size) => {
			const result = [];
			for (let i = 0; i < array.length; i += size) {
				result.push(array.slice(i, i + size));
			}
			return result;
		};
		let filteredPosts = posts.filter(post => {
			titleMatch = `${post.slug} ${post.title}`.toLowerCase().includes(title.toLowerCase())
			return titleMatch;
		})
		const paginateFilteredPosts = splitArray(filteredPosts, pageSize)
		pagination.pages = paginateFilteredPosts.length
		pagination.limit = pageSize
		pagination.page = page
		pagination.total = filteredPosts.length
		pagination.next = page < pagination.pages ? page + 1 : null
		pagination.prev = page > 1 ? page - 1 : null
		posts = paginateFilteredPosts[page - 1] ?? []
	}

	if (pagination.pages < page) {
		console.log({
			message: `Redirecting from page ${page} to page ${pagination.pages}`
		})
		res.redirect(`/normas-legales/${pagination.pages}${urlQuery}`);
		return
	}

	const [allTags, { data: regiones }] = await Promise.all([
		await apiGhost.getTags("tags", "all"),
		await mysql.getRegiones()
	])

	const isYearRegExp = /^\d{4}$/;

	const filteredTags = allTags
		.filter(tag => !(isYearRegExp.test(tag.slug) || regiones.some(r => r.slug === tag.slug)))
		.map(tag => ({
			name: utils.capitalizeNameRecursive(tag.name),
			slug: tag.slug,
			estaSeleccionado: tag.slug === categoria
		}))

	const years = allTags.filter(tag => (/^\d{4}$/.test(tag.slug))).map(tag => ({
		name: tag.name,
		slug: tag.slug,
		estaSeleccionado: tag.slug === year
	}))

	const tags = utils.filterTags(posts);

	res.render("pages/normas-legales", {
		posts,
		hasResults: posts.length !== 0,
		tags,
		allTags: filteredTags,
		years,
		regiones: regiones.map(r => ({
			value: r.value,
			slug: r.slug,
			estaSeleccionado: r.slug === region
		})),
		pagination,
		year,
		categoria,
		region,
		title,
	});
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
	const { data: pages } = await mysql.getDatosAbiertosPages({
		pageLength,
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

	const { data: datosAbiertos, success } = await mysql.getDatosAbiertos({
		paginate: true,
		page,
		pageLength,
	})

	const message = success
		? `Mostrando ${datosAbiertos.length} de ${pages * pageLength} conjunto(s) de datos`
		: "No se pudo obtener los datos abiertos"

	const { data: categorias } = await mysql.getCategoriasActivas();
	const { data: tipos } = await mysql.getTiposActivos();

	res.render("pages/datos-abiertos", {
		pagination,
		categorias,
		tipos,
		datosAbiertos,
		success,
		message
	});
})

routes.post("/datosabiertos", async (req, res) => {
	const { idCategoria, idTipo, search } = req.body;

	const conditions = {
		idCategoria: idCategoria ? idCategoria : undefined,
		idTipo: idTipo ? idTipo : undefined,
		title: search
	}

	const { data: datosAbiertos, success } = await mysql.getDatosAbiertos({
		conditions
	})

	if (!success) {
		res.json({ success: false })
		return
	}

	const dataRendered = utils.renderSearchOpenDataTemplate({
		datosAbiertos
	})
	res.json({
		success: true,
		dataLength: datosAbiertos.length,
		dataRendered
	})

})

routes.get("/administrador/login", isNotAuthenticated, (req, res) => {
	const info_login = req.flash('login');
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/administrador-login", { info_login });
})

routes.post("/administrador/login", passport.authenticate('local-login', {
	successRedirect: "/administrador",
	failureRedirect: "/administrador/login",
	passReqToCallback: true
}))

routes.get("/administrador/logout", (req, res) => {
	req.logOut();
	res.redirect("/administrador/login")
})


routes.get("/administrador", isAuthenticated, (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { categories, types } = utils.constants;
	const info_document = req.flash('document');
	res.render("pages/administrador", { categories, types, info_document })
})

routes.get("/secciones-admin/footer", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: footer } = await mysql.getFooterData();
	const info_document = req.flash('document');
	res.render("pages/secciones-admin/footer", {
		...footer,
		info_document
	});
})

routes.post("/secciones-admin/footer", isAuthenticated, async (req, res) => {
	const {
		telefono,
		email,
		direccion,
		piePagina
	} = req.body;
	const { success, message } = await mysql.updateFooterData({
		telefono,
		email,
		direccion,
		piePagina
	})
	const style = `alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show`
	req.flash("document", {
		style,
		message
	})
	res.redirect("/secciones-admin/footer")
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

routes.get("/secciones-admin/regiones/:page?", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const info_document = req.flash('document');



	const pageSize = 6;
	const page = req.params.page ? Number(req.params.page) : 1;

	const {
		searchedRegionId,
	} = req.query

	const conditions = {
		id: Number(searchedRegionId)
	}

	const { pages, amount } = await mysql.getRegionesMeta({
		pageSize,
		conditions
	})

	if (amount === 0) {
		res.render("pages/secciones-admin/regiones", {
			hasResults: false,
			regiones: [],
			info_document,
			pagination,
			searched: conditions
		})
		return
	}

	const pagination = {
		pages,
		limit: pageSize,
		page,
		total: amount,
		url_page: 'secciones-admin/regiones'
	}
	pagination.next = page < pagination.pages ? page + 1 : null
	pagination.prev = page > 1 ? page - 1 : null

	const regionIdQuery = searchedRegionId ? `searchedRegionId=${searchedRegionId}&` : '';
	const urlQuery = `?${regionIdQuery}`.slice(0, -1);

	pagination.url_query = urlQuery

	if (page < 1) {
		console.log({
			message: `Redirecting from unexisting page ${page} to first page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/1${urlQuery}`);
		return
	}

	if (pagination.pages < page) {
		console.log({
			message: `Redirecting from unexisting page ${page} to last page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/${pagination.pages}${urlQuery}`);
		return
	}

	const [
		{ data: regiones },
		{	data: allRegiones }
	] = await Promise.all([
		mysql.getRegiones({
			paginate: true,
			page,
			pageSize,
			conditions
		}),
		mysql.getRegiones({
			paginate: false,
		}),
	]);

	res.render("pages/secciones-admin/regiones", {
		hasResults: true,
		regiones,
		allRegiones: allRegiones.map(region => ({
			id: region.id,
			value: region.value,
			selected: region.id === conditions.id
		})),
		info_document,
		pagination,
		searched: conditions
	})
})

routes.put("/secciones-admin/regiones", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		nombreEncargado,
		celularEncargado,
		correoEncargado,
		existingImage,
		pageLink
	} = req.body;

	let imageUrl = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imageUrl = `${IMG_PATH}/${file.filename}`
	} else {
		imageUrl = existingImage
	}

	console.log({ imageUrl })

	const { success, message } = await mysql.updateRegiones({
		id,
		nombreEncargado,
		celularEncargado,
		correoEncargado,
		imageUrl,
		pageLink
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

routes.post("/secciones-admin/cifras", isAuthenticated, async (req, res) => {
	const {
		lesionados,
		accidentados,
		fallecidos,
		mensaje1,
		mensaje2
	} = req.body;
	const { success, message } = await mysql.updateCifras({
		lesionados,
		accidentados,
		fallecidos,
		mensaje1,
		mensaje2
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

routes.post("/secciones-admin/mision-vision", isAuthenticated, async (req, res) => {
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

routes.get("/secciones-admin/analitica-menu", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: menu } = await mysql.getMenu();

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/analitica-menu", {
		menu,
		info_document
	})
})

routes.post("/secciones-admin/analitica-menu", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_descripcion,
		new_existingImage,
		new_observacion,
		new_estaActivo
	} = req.body;

	let urlImagen = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		urlImagen = `${IMG_PATH}/${file.filename}`
	} else {
		urlImagen = new_existingImage
	}

	const { success, message } = await mysql.createMenu({
		descripcion: new_descripcion,
		urlImagen: urlImagen,
		observacion: new_observacion,
		estaActivo: new_estaActivo
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

routes.put("/secciones-admin/analitica-menu", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		descripcion,
		existingImage,
		observacion,
		estaActivo
	} = req.body;

	let urlImagen = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		urlImagen = `${IMG_PATH}/${file.filename}`
	} else {
		urlImagen = existingImage
	}

	const { success, message } = await mysql.updateMenu({
		id,
		descripcion,
		urlImagen,
		observacion,
		estaActivo
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

routes.delete("/secciones-admin/analitica-menu", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteMenu(id);

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

routes.get("/secciones-admin/comunicaciones-eventos/:page?", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const info_document = req.flash('document');
	const pageSize = 6;
	const {
		searchedEvento,
		searchedTipoEvento,
		searchedStartDate,
		searchedEndDate,
	} = req.query
	const page = req.params.page ? Number(req.params.page) : 1;

	const conditions = {
		title: searchedEvento,
		idTipoEvento: searchedTipoEvento,
		startDate: searchedStartDate,
		endDate: searchedEndDate
	}

	const [
		{ pages, amount },
		{ data: tiposEvento }
	] = await Promise.all([
		mysql.getComunicationsMeta({
			pageSize,
			conditions
		}),
		mysql.getTiposEvento()
	])

	const pagination = {
		pages,
		limit: pageSize,
		page: page,
		total: amount,
		url_page: 'secciones-admin/comunicaciones-eventos'
	}
	pagination.next = page < pagination.pages ? page + 1 : null
	pagination.prev = page > 1 ? page - 1 : null

	if (amount === 0) {
		res.render("pages/secciones-admin/comunicaciones-eventos", {
			hasResults: false,
			eventos: [],
			tiposEvento: tiposEvento.map(t => ({
				...t,
				selected: t.id === Number(searchedTipoEvento)
			})),
			info_document,
			pagination,
			searched: {
				evento: searchedEvento,
				tipoEvento: searchedTipoEvento,
				startDate: searchedStartDate,
				endDate: searchedEndDate
			}
		})
		return
	}

	const eventoQuery = searchedEvento ? `searchedEvento=${searchedEvento}&` : '';
	const tipoEventoQuery = searchedTipoEvento ? `searchedTipoEvento=${searchedTipoEvento}&` : '';
	const startDateQuery = searchedStartDate ? `searchedStartDate=${searchedStartDate}&` : '';
	const endDateQuery = searchedEndDate ? `searchedEndDate=${searchedEndDate}&` : '';

	const urlQuery = `?${eventoQuery}${tipoEventoQuery}${startDateQuery}${endDateQuery}`.slice(0, -1);

	pagination.url_query = urlQuery

	if (page < 1) {
		console.log({
			message: `Redirecting from unexisting page ${page} to first page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/1${urlQuery}`);
		return
	}

	if (pagination.pages < page) {
		console.log({
			message: `Redirecting from unexisting page ${page} to last page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/${pagination.pages}${urlQuery}`);
		return
	}


	const { data: eventos } = await mysql.getComunications({
		paginate: true,
		page,
		pageSize,
		conditions
	})

	res.render("pages/secciones-admin/comunicaciones-eventos", {
		hasResults: eventos?.length !== 0,
		eventos,
		tiposEvento: tiposEvento.map(t => ({
			...t,
			selected: t.id === Number(searchedTipoEvento)
		})),
		info_document,
		pagination,
		searched: {
			evento: searchedEvento,
			tipoEvento: searchedTipoEvento,
			startDate: searchedStartDate,
			endDate: searchedEndDate
		}
	})
})

routes.post("/secciones-admin/comunicaciones-eventos", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_title,
		new_idTipoEvento,
		new_organizedBy,
		new_place,
		new_direccion,
		new_shortDescription,
		new_description,
		new_startDay,
		new_startTime,
		new_endDay,
		new_endTime,
		new_price,
		new_existingImage,
		new_reunionLink,
		new_facebookLink,
		new_youtubeLink,
		new_twitterLink,
		new_isActive
	} = req.body;

	let imageUrl = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imageUrl = `${IMG_PATH}/${file.filename}`
	} else {
		imageUrl = new_existingImage
	}

	const { success, message } = await mysql.createComunication({
		title: new_title,
		idTipoEvento: new_idTipoEvento,
		organizedBy: new_organizedBy,
		place: new_place,
		shortDescription: new_shortDescription,
		description: new_description,
		startDay: new_startDay,
		startTime: new_startTime,
		endDay: new_endDay,
		endTime: new_endTime,
		price: new_price,
		imageUrl,
		direccion: new_direccion,
		reunionLink: new_reunionLink,
		facebookLink: new_facebookLink,
		youtubeLink: new_youtubeLink,
		twitterLink: new_twitterLink,
		isActive: new_isActive === 'on' ? 1 : 0
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

routes.put("/secciones-admin/comunicaciones-eventos", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		idTipoEvento,
		title,
		organizedBy,
		place,
		shortDescription,
		description,
		startDay,
		startTime,
		endDay,
		endTime,
		price,
		existingImage,
		direccion,
		reunionLink,
		facebookLink,
		youtubeLink,
		twitterLink,
		isActive,
	} = req.body;

	let imageUrl = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		imageUrl = `${IMG_PATH}/${file.filename}`
	} else {
		imageUrl = existingImage
	}

	const { success, message } = await mysql.updateComunication({
		id,
		idTipoEvento,
		title,
		organizedBy,
		place,
		shortDescription,
		description,
		startDay,
		startTime,
		endDay,
		endTime,
		price,
		imageUrl,
		direccion,
		existingImage,
		reunionLink,
		facebookLink,
		youtubeLink,
		twitterLink,
		isActive: isActive === 'on',
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

routes.delete("/secciones-admin/comunicaciones-eventos", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteMenu(id);

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

routes.get("/secciones-admin/datos-abiertos/:page?", async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const pageSize = 6;
	const {
		searchedTitulo,
		searchedDescripcion,
		searchedCategoria,
		searchedFecha,
	} = req.query
	const page = req.params.page ? Number(req.params.page) : 1;

	const conditions = {
		description: searchedDescripcion,
		title: searchedTitulo,
		idCategoria: searchedCategoria,
		fecha: searchedFecha
	}

	const { data: pages, dataLength: total } = await mysql.getDatosAbiertosPages({
		pageLength: pageSize,
		conditions
	})
	const pagination = {
		pages,
		limit: pageSize,
		page: page,
		total,
		url_page: 'secciones-admin/datos-abiertos'
	}

	pagination.next = page < pagination.pages ? page + 1 : null
	pagination.prev = page > 1 ? page - 1 : null

	const tituloQuery = searchedTitulo ? `searchedTitulo=${searchedTitulo}&` : '';
	const descripcionQuery = searchedDescripcion ? `searchedDescripcion=${searchedDescripcion}&` : '';
	const categoriaQuery = searchedCategoria ? `searchedCategoria=${searchedCategoria}&` : '';
	const fechaQuery = searchedFecha ? `searchedFecha=${searchedFecha}&` : '';

	const urlQuery = `?${tituloQuery}${descripcionQuery}${categoriaQuery}${fechaQuery}`.slice(0, -1);

	pagination.url_query = urlQuery

	if (page < 1) {
		console.log({
			message: `Redirecting from unexisting page ${page} to first page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/1${urlQuery}`);
		return
	}

	if (pagination.pages < page) {
		console.log({
			message: `Redirecting from unexisting page ${page} to last page ${pagination.pages}`
		})
		res.redirect(`/${pagination.url_page}/${pagination.pages}${urlQuery}`);
		return
	}

	const [
		{ data: categorias },
		{ data: tipos },
		{ data: datos }
	] = await Promise.all([
		await mysql.getCategorias(),
		await mysql.getTipos(),
		await mysql.getDatosAbiertos({
			paginate: true,
			page,
			pageLength: pageSize,
			conditions
		})
	])

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/datos-abiertos", {
		hasResults: total !== 0,
		datos,
		categorias: categorias.map(c => ({
			...c,
			selected: c.id === Number(searchedCategoria)
		})),
		tipos,
		info_document,
		pagination,
		searched: {
			titulo: searchedTitulo,
			descripcion: searchedDescripcion,
			categoria: searchedCategoria,
			fecha: searchedFecha
		}
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
		idCategoria: Number(new_categoria),
		idTipo: Number(new_tipo),
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
		idCategoria: Number(categoria),
		idTipo: Number(tipo),
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


routes.get("/secciones-admin/datos-abiertos-categorias", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: categorias } = await mysql.getCategorias();

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/datos-abiertos-categorias", {
		categorias,
		info_document
	})
})

routes.post("/secciones-admin/datos-abiertos-categorias", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_value,
		new_existingImage,
		new_estaActivo,
	} = req.body;

	let icon = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		icon = `${IMG_PATH}/${file.filename}`
	} else {
		icon = new_existingImage
	}

	const { success, message } = await mysql.createCategoria({
		value: new_value,
		icon,
		estaActivo: new_estaActivo === 'true'
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

routes.put("/secciones-admin/datos-abiertos-categorias", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		value,
		existingImage,
		estaActivo,
	} = req.body;

	let icon = ''
	if (req.files['img-file']) {
		const file = req.files['img-file'][0]
		icon = `${IMG_PATH}/${file.filename}`
	} else {
		icon = existingImage
	}

	const { success, message } = await mysql.updateCategoria({
		id,
		value,
		icon,
		estaActivo: estaActivo === 'true',
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

routes.delete("/secciones-admin/datos-abiertos-categorias", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteCategoria(id);

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


routes.get("/secciones-admin/datos-abiertos-tipos", isAuthenticated, async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	const { data: tipos } = await mysql.getTipos();

	const info_document = req.flash('document');
	res.render("pages/secciones-admin/datos-abiertos-tipos", {
		tipos,
		info_document
	})
})

routes.post("/secciones-admin/datos-abiertos-tipos", isAuthenticated, customUploader, async (req, res) => {
	const {
		new_value,
		new_estaActivo
	} = req.body;

	const { success, message } = await mysql.createTipo({
		value: new_value,
		estaActivo: new_estaActivo === 'true'
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

routes.put("/secciones-admin/datos-abiertos-tipos", isAuthenticated, customUploader, async (req, res) => {
	const {
		id,
		value,
		estaActivo
	} = req.body;


	const { success, message } = await mysql.updateTipo({
		id,
		value,
		estaActivo: estaActivo === 'true'
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

routes.delete("/secciones-admin/datos-abiertos-tipos", isAuthenticated, async (req, res) => {
	const { id } = req.body;

	const { success, message } = await mysql.deleteTipo(id);

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
	res.redirect('/administrador/login');
	return;
}

function isNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('/administrador');
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
