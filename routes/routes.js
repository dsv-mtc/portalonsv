const routes = require("express").Router();
const consejoRegionalRoutes = require("./consejoRegionalRoutes");
const adminRoutes = require("./admin/routes");

const apiGhost = new (require("../api/ghost"));
const utils = require("../utils/utils");
const moment = require("moment");
const seo = require("../controllers/seo");
const feedController = new (require("../controllers/feed"));
const youtubeApi = new (require("../api/gcp/Youtube"));


const mysql = new (require("../api/mysql"));
mysql.setQuery();

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
	res.render("pages/regiones", { post });
})

routes.get("/region/:name", async (req, res) => {
	const { name } = req.params;

	const { data: region, success } = await mysql.getRegion(name);
	const { data: planesRegionales } = await mysql.getPlanesRegionales({
		conditions: {
			idRegion: region.id
		}
	})


	const dataRendered = utils.renderTemplate("partials/consejo-regional/planes-regionales-card-body", {
		planesRegionales
	})

	res.json({
		ok: success,
		region,
		planesRegionales,
		dataRendered
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

routes.use("/administrador", adminRoutes);

routes.use("/consejo-regional", consejoRegionalRoutes);

/* FIN DE ZONA DE DATOS ABIERTOS */

/****SEARCH **/
routes.post("/search", async (req, res) => {
	const slug = req.body["search"];
	const lang = req.body["lang"];
	const filter = req.body["filter"];

	const results = await apiGhost.getSearchPosts(`tags:${filter}`, slug);

	if (results.success) {
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
