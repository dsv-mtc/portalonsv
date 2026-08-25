const routes = require("express").Router();
const consejoRegionalRoutes = require("./consejoRegionalRoutes");
const adminRoutes = require("./admin/routes");
const adminApiRoutes = require("./admin/api");

const apiGhost = new (require("../api/ghost"));
const utils = require("../utils/utils");
const moment = require("moment");
const seo = require("../controllers/seo");
const { formLimiter } = require("../controllers/rateLimit");

const feedController = new (require("../controllers/feed"));
const youtubeApi = new (require("../api/gcp/Youtube"));
const staticRegions = require("../utils/regiones").REGIONES;


const mysql = new (require("../api/mysql"));
mysql.setQuery();

require('dotenv').config();

function slugify(texto) {
	return (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractVideoId(url) {
	if (!url) return null;
	const m = String(url).match(/(?:youtu\.be\/|watch\?v=|embed\/|shorts\/)([\w-]{11})/);
	return m ? m[1] : null;
}

function mapYoutubeVideos(videos, { withThumb } = {}) {
	return (videos || []).map(v => {
		const videoId = extractVideoId(v.video_url);
		const mapped = {
			video: videoId,
			title: v.titulo,
			description: v.descripcion
		};
		if (withThumb) {
			mapped.thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
			mapped.publishedAt = v.create_time;
		}
		return mapped;
	});
}

function prepareRelatedPosts(posts, regiones, currentPostId) {
	const sectionSlugs = new Set(['noticias-eventos', 'notas-prensa', 'publicaciones', 'normas-legales']);
	const ignoredCategorySlugs = new Set([...sectionSlugs, 'regiones']);
	const isYear = /^\d{4}$/;
	const regionSlugs = new Set((regiones || []).map(region => region.slug));
	const normalizeRegion = value => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
	const staticRegionNames = new Map(staticRegions.map(region => [normalizeRegion(region.REGION), region.REGION]));

	return (posts || [])
		.filter(post => post.id !== currentPostId)
		.map(post => {
			const postTags = post.tags || [];
			const sectionTag = postTags.find(tag => sectionSlugs.has(tag.slug));
			const regionTag = postTags.find(tag =>
				regionSlugs.has(tag.slug) || staticRegionNames.has(normalizeRegion(tag.name))
			);
			const regionData = regionTag ? regiones.find(region => region.slug === regionTag.slug) : null;
			const categoryTag = postTags.find(tag =>
				!ignoredCategorySlugs.has(tag.slug) &&
				!isYear.test(tag.slug) &&
				!regionSlugs.has(tag.slug)
			);

			post.relatedType = sectionTag ? sectionTag.slug : 'publicaciones';
			post.categoryTag = categoryTag ? categoryTag.name : null;
			if (!post.categoryTag && post.relatedType === 'normas-legales') {
				post.categoryTag = 'Norma';
			}
			post.regionName = regionData
				? regionData.value
				: regionTag
					? (staticRegionNames.get(normalizeRegion(regionTag.name)) || regionTag.name)
					: null;
			if (!post.regionName) {
				post.regionName = utils.extractDepartmentFromText(post.title, regiones) ||
					utils.extractDepartmentFromText(post.custom_excerpt || post.excerpt, regiones) ||
					'Nacional';
			}
			if (normalizeRegion(post.regionName) === 'regiones') {
				post.regionName = utils.extractDepartmentFromText(post.title, regiones) ||
					utils.extractDepartmentFromText(post.custom_excerpt || post.excerpt, regiones) ||
					'Regional';
			}
			if (post.relatedType === 'noticias-eventos' || post.relatedType === 'notas-prensa') {
				post.categoryTag = post.regionName || 'Noticia';
			}
			return post;
		});
}

function getPageNumbers(current, total, delta = 3) {
	if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
	const result = [];
	const left  = Math.max(2, current - delta);
	const right = Math.min(total - 1, current + delta);
	result.push(1);
	if (left > 2) result.push('...');
	for (let i = left; i <= right; i++) result.push(i);
	if (right < total - 1) result.push('...');
	result.push(total);
	return result;
}

function paginatePlaylist(playlist, pageParam, urlPage) {
	const pageLength = 5;
	const page = pageParam ? Number(pageParam) : 1;
	if (!playlist || playlist.length < pageLength) {
		return { playlist, pagination: null };
	}
	const splitArray = (arr, n) => {
		const r = [];
		for (let i = 0; i < arr.length; i += n) r.push(arr.slice(i, i + n));
		return r;
	};
	const pages = splitArray(playlist, pageLength);
	const totalPages = pages.length;
	const current = Math.min(page, Math.max(1, totalPages));
	const pagination = {
		page: current,
		pages: totalPages,
		next: current < totalPages ? current + 1 : null,
		prev: current > 1 ? current - 1 : null,
		url_page: urlPage,
		pages_list: getPageNumbers(current, totalPages)
	};
	if (page > totalPages && page > 1) {
		return { redirect: `/${urlPage}/${totalPages}`, pagination, playlist: pages[totalPages - 1] ?? [] };
	}
	return { playlist: pages[current - 1] ?? [], pagination };
}

const revistasData = require("../data/revistas.json");

const COMPONENTES_ICONS = [
	{ icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>', color: "#dc2626", bg: "#fde2e2", link: "https://aulavirtual.mtc.gob.pe/seguridadvial/", external: true },
	{ icon: '<path d="M18 20V10M12 20V4M6 20v-6"/>', color: "#2563eb", bg: "#dbeafe", link: "/analitica", external: false },
	{ icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', color: "#0ea5e9", bg: "#e0f2fe", link: "/analitica", external: false },
	{ icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>', color: "#16a34a", bg: "#d1fae5", link: "/", external: false },
	{ icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>', color: "#eab308", bg: "#fef9c3", link: "/datosabiertos", external: false },
	{ icon: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/>', color: "#7e22ce", bg: "#f3e8ff", link: "#", external: false },
	{ icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>', color: "#f97316", bg: "#fff7ed", link: "#", external: false },
	{ icon: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>', color: "#14b8a6", bg: "#ccfbf1", link: "#", external: false },
	{ icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', color: "#ef4444", bg: "#fee2e2", link: "https://sratma.mtc.gob.pe/SRATMA/mapa/", external: true },
];

routes.use(async (req, res, next) => {
	res.locals.settings = await apiGhost.getSettings();
	res.locals.titlesPosts = await apiGhost.getLastFivePostsTitleAndUrl();
	const footerData = await mysql.getFooterData();
	const { data: redesSociales } = await mysql.getRedesSociales();
	res.locals.url_selected = req.originalUrl;
	res.locals.footerData = {
		...footerData.data,
		redesSociales: redesSociales || [],
		year: new Date().getFullYear()
	};
	const redUrlGlobal = (nombre) => {
		const r = (redesSociales || []).find(x => String(x.red || '').toLowerCase() === nombre && x.isActive);
		return r && r.url ? r.url : '#';
	};
	res.locals.popupSocial = { facebook: redUrlGlobal('facebook'), twitter: redUrlGlobal('twitter') };
	if (req.originalUrl.includes("/en/")) {
		res.locals.secondary_navigation = true;
		req.url = req.originalUrl.replace("en/", "")
		res.locals.lang = "en"
	}
	else {
		res.locals.lang = "es"
	}
	res.locals.seoMetas = await seo.setMetaTags(req.originalUrl, {
		lang: res.locals.lang,
		settings: res.locals.settings,
		footerData: res.locals.footerData
	});
const { data: programasList } = await mysql.getProgramas();
	res.locals.programas = (programasList || [])
		.filter(p => p.estaActivo)
		.map(p => {
			const titulo = p.nombre;
			const slug = slugify(titulo);
			const url = (p.enlace && p.enlace.trim()) ? p.enlace.trim() : '#';
			return { id: p.id, titulo, slug, url, descripcion: p.descripcion || '', imagen: p.imagen || '' };
		});
	const { data: menuSubitemsRaw } = await mysql.getMenuSubitems();
	res.locals.menuSubitems = menuSubitemsRaw || [];
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
	const { data: bannersData } = await mysql.getBanners();
	const lang = res.locals.secondary_navigation ? 'en' : 'es';
	const langFields = {
		es: { kicker: 'kicker_es', titulo: 'titulo_es', parrafo: 'parrafo_es', btn1_label: 'btn1_label_es', btn2_label: 'btn2_label_es' },
		en: { kicker: 'kicker_en', titulo: 'titulo_en', parrafo: 'parrafo_en', btn1_label: 'btn1_label_en', btn2_label: 'btn2_label_en' },
	}[lang];
	const banners = (bannersData || []).filter(b => b.activo).map(b => ({
		archivo: b.archivo,
		kicker:     b[langFields.kicker],
		titulo:     b[langFields.titulo],
		parrafo:    b[langFields.parrafo],
		btn1_label: b[langFields.btn1_label],
		btn1_href:  b.btn1_href,
		btn1_externo: /^https?:\/\//.test(b.btn1_href || ''),
		btn2_label: b[langFields.btn2_label],
		btn2_href:  b.btn2_href,
		btn2_externo: /^https?:\/\//.test(b.btn2_href || ''),
	}));
	const modalinfo = await apiGhost.getModalPosts();

	const { data: cifras } = await mysql.getCifras();
	const { data: contenido } = await mysql.getContenidoQuienesSomos(res.locals.secondary_navigation);

	const { data: componentesRaw } = await mysql.getComponentesTecnologicos(res.locals.secondary_navigation);
	const componentesCards = (componentesRaw || []).map((c, i) => {
		const fb = COMPONENTES_ICONS[i % COMPONENTES_ICONS.length];
		const link = c.link || fb.link;
		return {
			icon: c.icon || fb.icon,
			color: fb.color,
			bg: fb.bg,
			link,
			external: /^https?:\/\//.test(link),
			titulo: c.titulo,
			descripcion: c.descripcion,
		};
	});

	const popupData = await mysql.getPopup()
	const popupSlides = (popupData.data && popupData.data.slides) || []
	const popupEstado = (popupData.data && popupData.data.estado) ? 1 : 0
	const redesPopup = res.locals.footerData.redesSociales || []
	const redUrl = (nombre) => {
		const r = redesPopup.find(x => String(x.red || '').toLowerCase() === nombre && x.isActive);
		return r && r.url ? r.url : '#';
	};
	const popupSocial = { facebook: redUrl('facebook'), twitter: redUrl('twitter') }

	let youtubeTopVideos = [];
	try {
		const { data: videos } = await mysql.getYoutubeVideos('home');
		youtubeTopVideos = mapYoutubeVideos(videos || [], { withThumb: true });
	} catch (e) {
		console.error("YouTube top videos:", e.message);
	}

	const { data: accesosRapidosRaw } = await mysql.getAccesosRapidos(res.locals.lang);
	const accesosRapidos = (accesosRapidosRaw || []).map(c => ({
		eyebrow: c.eyebrow,
		titulo: c.titulo,
		descripcion: c.descripcion,
		texto_boton: c.texto_boton,
		enlace_boton: c.enlace_boton,
		external: c.external,
		imagen: c.imagen,
	}));

	res.render("index", {
		post3,
		post2,
		accidents,
		banners,
		modalinfo,
		...cifras,
		componentesCards,
		popupSlides,
		popupSocial,
		popupStatus: JSON.stringify(popupEstado),
		youtubeTopVideos,
		accesosRapidos
	});
})

routes.get("/quienes-somos", async (req, res) => {
	const { data: contenido } = await mysql.getContenidoQuienesSomos(res.locals.secondary_navigation)

	const { data: componentesRaw } = await mysql.getComponentesTecnologicos(res.locals.secondary_navigation);
	const componentesCards = (componentesRaw || []).map((c, i) => {
		const fb = COMPONENTES_ICONS[i % COMPONENTES_ICONS.length];
		const link = c.link || fb.link;
		return {
			icon: c.icon || fb.icon,
			color: fb.color,
			bg: fb.bg,
			titulo: c.titulo,
			descripcion: c.descripcion,
			link,
			external: /^https?:\/\//.test(link),
		};
	});
	res.render("pages/quienes-somos", {
		contenido,
		componentesCards,
	});
})


/**NOTICIAS Y EVENTOS */
routes.get("/comunicaciones/noticias/:page?", async (req, res) => {
	const PER_PAGE = 7;
	const { title } = req.query;
	const page = parseInt(req.params.page) || 1;
	const allPosts = await apiGhost.getPosts('all', "tags,authors", "tag:noticias-eventos", "published_at DESC");
	const { data: disabledIds = [] } = await mysql.getDisabledGhostIds('noticias');
	let enabledPosts = (allPosts || []).filter(p => !disabledIds.includes(p.id));
	if (title) {
		enabledPosts = enabledPosts.filter(p => `${p.slug} ${p.title}`.toLowerCase().includes(title.toLowerCase()));
	}
	const totalPages = Math.max(1, Math.ceil(enabledPosts.length / PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * PER_PAGE;
	const post = enabledPosts.slice(start, start + PER_PAGE);
	const pagination = { page: currentPage, pages: totalPages, total: enabledPosts.length, limit: PER_PAGE, next: currentPage < totalPages ? currentPage + 1 : null, prev: currentPage > 1 ? currentPage - 1 : null, url_page: 'comunicaciones/noticias', pages_list: getPageNumbers(currentPage, totalPages) };
	const hasResults = post.length > 0;

	res.render("pages/comunicaciones/noticias", { post, pagination, title, hasResults, popupSocial: res.locals.popupSocial });
})

routes.get("/comunicaciones/nota-prensa/:page?", async (req, res) => {
	const PER_PAGE = 6;
	const { title } = req.query;
	const page = parseInt(req.params.page) || 1;
	const allPosts = await apiGhost.getPosts('all', "tags,authors", "tag:notas-prensa", "published_at DESC");
	const { data: disabledIds = [] } = await mysql.getDisabledGhostIds('notas-prensa');
	let enabledPosts = (allPosts || []).filter(p => !disabledIds.includes(p.id));
	if (title) {
		enabledPosts = enabledPosts.filter(p => `${p.slug} ${p.title}`.toLowerCase().includes(title.toLowerCase()));
	}
	const totalPages = Math.max(1, Math.ceil(enabledPosts.length / PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * PER_PAGE;
	const post = enabledPosts.slice(start, start + PER_PAGE);
	const pagination = { page: currentPage, pages: totalPages, total: enabledPosts.length, limit: PER_PAGE, next: currentPage < totalPages ? currentPage + 1 : null, prev: currentPage > 1 ? currentPage - 1 : null, url_page: 'comunicaciones/nota-prensa', pages_list: getPageNumbers(currentPage, totalPages) };
	const hasResults = post.length > 0;

	res.render("pages/comunicaciones/notas-prensa", { post, pagination, title, hasResults, popupSocial: res.locals.popupSocial });
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

		res.locals.seoMetas = await seo.setMetaTags(req.originalUrl, {
			lang: res.locals.lang,
			settings: res.locals.settings,
			footerData: res.locals.footerData,
			evento
		});
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
		{ data: all = [] },
		{ data: allNear = [] },
		{ data: eventos = [] },
		{ data: eventosProximos = [] },
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
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	const post = await apiGhost.getPost(req.params.slug);
	if (!post) return res.redirect('/');
	if (post) {
		const allDisabled = await Promise.all([
			mysql.getDisabledGhostIds('noticias'),
			mysql.getDisabledGhostIds('notas-prensa'),
			mysql.getDisabledGhostIds('publicaciones'),
			mysql.getDisabledGhostIds('normas-legales'),
		]);
		const disabledIds = allDisabled.flatMap(r => r.data || []);
		if (disabledIds.includes(post.id)) return res.redirect('/');
	}
	const primary_tag = post.primary_tag ? `tag:${post.primary_tag.slug}` : null;
	const rawRelatedPosts = primary_tag
		? await apiGhost.getPosts(5, "tags,authors", primary_tag, "published_at DESC")
		: [];
	const { data: regiones } = await mysql.getRegiones();
	const postsRelatives = prepareRelatedPosts(rawRelatedPosts, regiones || [], post.id).slice(0, 4);

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

	res.locals.seoMetas = await seo.setMetaTags(req.originalUrl, {
		lang: res.locals.lang,
		settings: res.locals.settings,
		footerData: res.locals.footerData,
		post
	});

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
	const { data: planesRegionales = [] } = await mysql.getPlanesRegionales({
		conditions: {
			idRegion: region?.id
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
	const data = await utils.serviceMap(regionRequest, { post, lang })
	res.send(data)
})

/**ANALÍTICA */
routes.get("/analitica", async (req, res) => {
	let fullMenu = [];
	try {
		const [{ data: menu }, { data: submenu }] = await Promise.all([
			mysql.getMenuActivos(),
			mysql.getSubmenuActivos()
		]);
		fullMenu = menu.map((m) => ({
			...m,
			submenu: submenu.filter((sub) => sub.menu_id === m.id)
		}));
	} catch (e) {
		fullMenu = [];
	}

	res.render("pages/analitica", {
		menu: fullMenu
	});
})

/**WEBINARS */
routes.get("/webinars/:page?", async (req, res) => {
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	let playlist = [];
	try {
		const { data: videos } = await mysql.getYoutubeVideos('webinars');
		playlist = mapYoutubeVideos(videos);
	} catch (e) {
		console.error("YouTube webinars:", e.message);
	}
	const result = paginatePlaylist(playlist, req.params.page, 'webinars');
	if (result.redirect) { res.redirect(result.redirect); return; }
	res.render("pages/webinars", { playlist: result.playlist, submenu: "webinars", pagination: result.pagination });
})

routes.get("/capacitaciones/:page?", async (req, res) => {
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	let playlist = [];
	try {
		const { data: videos } = await mysql.getYoutubeVideos('capacitaciones');
		playlist = mapYoutubeVideos(videos);
	} catch (e) {
		console.error("YouTube capacitaciones:", e.message);
	}
	const result = paginatePlaylist(playlist, req.params.page, 'capacitaciones');
	if (result.redirect) { res.redirect(result.redirect); return; }
	res.render("pages/webinars", { playlist: result.playlist, submenu: "capacitaciones", pagination: result.pagination });
})
/**SRAT */
routes.get("/srat", async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/srat", { layout: false });
})

/** PERU-WORLD */
routes.get("/peru-in-world", async (req, res) => {
	res.locals.enabledFooter = false;
	res.locals.enabledNavigation = false;
	res.render("pages/peru-world", { layout: false });
})

/** ENTORNOS VIALES */
routes.get("/entornos-viales", async (req, res) => {
	const { data: programas } = await mysql.getProgramas();
	const tarjetas = (programas || [])
		.filter(p => p.estaActivo)
		.map(p => ({
			badge: p.codigo || "",
			titulo: p.nombre,
			descripcion: "",
			imagen_url: "",
			orden: p.id
		}));
	res.render("pages/entornos-viales", { tarjetas, lang: res.locals.lang, tieneCarrusel: tarjetas.length > 3 });
});

/** PROGRAMAS (página individual de cada programa creado en el admin) */
routes.get("/programas/:slug", async (req, res) => {
	const lang = res.locals.lang === "en" ? "en" : "es";
	if (req.params.slug === "orientacion-victimas") {
		return res.render("pages/programa-orientacion-victimas", { lang });
	}

	const { data: programas } = await mysql.getProgramas();
	const programa = (programas || []).find(p => p.estaActivo && slugify(p.nombre) === req.params.slug);

	if (!programa) return res.status(404).redirect('/');

	return res.render("pages/programa", {
		lang,
		titulo: programa.nombre,
		descripcion: programa.descripcion || '',
		imagen: programa.imagen || '',
		enlace: String(programa.codigo || '').toLowerCase() === 'orientacion-victimas'
			? '/programas/orientacion-victimas'
			: programa.enlace || ''
	});
});

/**PUBLICACIONES */
routes.get("/publicaciones/:page?", async (req, res) => {
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
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
				limit: 'all',
				include: 'tags,authors',
				order: "published_at DESC",
			})
	} catch (error) {
		console.error(error)
	}

	const { data: disabledIdsPub = [] } = await mysql.getDisabledGhostIds('publicaciones');
	posts = (posts || []).filter(p => !disabledIdsPub.includes(p.id));

	const categoriaQuery = categoria ? `categoria=${categoria}&` : '';
	const regionQuery = region ? `region=${region}&` : '';
	const yearQuery = year ? `year=${year}&` : '';
	const titleQuery = title ? `title=${title}&` : '';

	const urlQuery = `?${titleQuery}${categoriaQuery}${regionQuery}${yearQuery}`.slice(0, -1);

	if (title) {
		posts = posts.filter(post => {
			titleMatch = `${post.slug} ${post.title}`.toLowerCase().includes(title.toLowerCase())
			return titleMatch;
		})
	}

	const splitArray = (array, size) => {
		const result = [];
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size));
		}
		return result;
	};

	const paginateFilteredPosts = splitArray(posts, pageSize)
	const totalPagesPub = paginateFilteredPosts.length
	const currentPagePub = Math.min(page, Math.max(1, totalPagesPub))
	const pagination = {
		page: currentPagePub,
		pages: totalPagesPub,
		limit: pageSize,
		total: posts.length,
		next: currentPagePub < totalPagesPub ? currentPagePub + 1 : null,
		prev: currentPagePub > 1 ? currentPagePub - 1 : null,
		url_page: 'publicaciones',
		url_query: urlQuery,
		pages_list: getPageNumbers(currentPagePub, totalPagesPub),
	}
	posts = paginateFilteredPosts[currentPagePub - 1] ?? []

	if (pagination.pages < page && page > 1) {
		console.log({
			message: `Redirecting from page ${page} to page ${pagination.pages}`
		})
		res.redirect(`/publicaciones/${pagination.pages}${urlQuery}`);
		return
	}

	const { data: regiones = [] } = await mysql.getRegiones();

	let seccionPosts = [];
	try {
		seccionPosts = await apiGhost.get().posts.browse({
			filter: "tags:[publicaciones]",
			limit: 'all',
			include: 'tags',
			order: "published_at DESC",
		});
	} catch (error) {
		console.error(error);
	}
	seccionPosts = (seccionPosts || []).filter(p => !disabledIdsPub.includes(p.id));

	const isYearRegExp = /^\d{4}$/;
	const seccionTagMap = new Map();
	seccionPosts.forEach(post => {
		(post.tags || []).forEach(tag => {
			if (!seccionTagMap.has(tag.slug)) seccionTagMap.set(tag.slug, tag);
		});
	});

	const filteredTags = [...seccionTagMap.values()]
		.filter(tag => !(isYearRegExp.test(tag.slug) || regiones.some(r => r.slug === tag.slug) || tag.slug === 'publicaciones'))
		.map(tag => ({
			name: utils.capitalizeNameRecursive(tag.name),
			slug: tag.slug,
			estaSeleccionado: tag.slug === categoria
		}));

	const years = [...seccionTagMap.values()]
		.filter(tag => isYearRegExp.test(tag.slug))
		.map(tag => ({
			name: tag.name,
			slug: tag.slug,
			estaSeleccionado: tag.slug === year
		}));

	const tags = utils.filterTags(posts);

	posts.forEach(post => {
		if (post.tags) {
			const categoryTag = post.tags.find(tag =>
				!isYearRegExp.test(tag.slug) &&
				!regiones.some(r => r.slug === tag.slug) &&
				tag.slug !== 'publicaciones'
			);
			post.categoryTag = categoryTag ? categoryTag.name : null;

			const regionTag = post.tags.find(tag =>
				regiones.some(r => r.slug === tag.slug)
			);
			const regionData = regionTag ? regiones.find(r => r.slug === regionTag.slug) : null;
			if (regionData) {
				post.regionName = regionData.value;
			}
		}

		if (!post.regionName) {
			const regionFromText =
				utils.extractDepartmentFromText(post.title, regiones) ||
				utils.extractDepartmentFromText(post.custom_excerpt || post.excerpt, regiones);
			post.regionName = regionFromText || 'Nacional';
		}
	});

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

/**REVISTAS */
routes.get("/revistas/:page?", async (req, res) => {
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	const pageSize = 6;
	const {
		tema,
		title,
	} = req.query
	const page = req.params.page ? Number(req.params.page) : 1;

	const { data: allRevistas } = await mysql.getRevistas();
	const revistasActivas = (allRevistas || []).filter(r => r.esta_activo);

	const { data: tiposRevista } = await mysql.getTiposRevista();
	const temasDisponibles = (tiposRevista || [])
		.filter(t => t.isActive)
		.map(t => ({ id: t.id, name: t.value, slug: slugify(t.value) }));

	let revistasFiltradas = [...revistasActivas];

	if (title) {
		revistasFiltradas = revistasFiltradas.filter(r =>
			`${r.slug} ${r.titulo}`.toLowerCase().includes(title.toLowerCase())
		);
	}

	if (tema) {
		const temaSeleccionado = temasDisponibles.find(t => t.slug === tema);
		if (temaSeleccionado) {
			revistasFiltradas = revistasFiltradas.filter(r => r.idTemaRevista === temaSeleccionado.id);
		}
	}

	const splitArray = (array, size) => {
		const result = [];
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size));
		}
		return result;
	};

	const pages = splitArray(revistasFiltradas, pageSize);
	const totalPages = pages.length;
	const currentPage = Math.min(page, Math.max(totalPages, 1));
	const revistasPagina = pages[currentPage - 1] || [];

	const qs = [];
	if (title) qs.push(`title=${encodeURIComponent(title)}`);
	if (tema) qs.push(`tema=${encodeURIComponent(tema)}`);
	const pagination = {
		page: currentPage,
		pages: totalPages,
		total: revistasFiltradas.length,
		limit: pageSize,
		next: currentPage < totalPages ? currentPage + 1 : null,
		prev: currentPage > 1 ? currentPage - 1 : null,
		url_page: 'revistas',
		pages_list: getPageNumbers(currentPage, totalPages),
		url_query: qs.length ? `?${qs.join('&')}` : '',
	};

	res.render("pages/revistas", {
		revistas: revistasPagina.map(r => ({ ...r, title: r.titulo, image: r.imagen_url, pdf: r.pdf_url })),
		hasResults: revistasPagina.length > 0,
		temas: temasDisponibles.map(t => ({
			...t,
			estaSeleccionado: t.slug === tema
		})),
		tema,
		title,
		totalPages,
		pagination,
	});
})

/**NORMAS LEGALES */
routes.get("/normas-legales/:page?", async (req, res) => {
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
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
				limit: 'all',
				include: 'tags,authors',
				order: "published_at DESC",
			})
	} catch (error) {
		console.error(error)
	}

	const { data: disabledIdsNormas = [] } = await mysql.getDisabledGhostIds('normas-legales');
	posts = (posts || []).filter(p => !disabledIdsNormas.includes(p.id));

	const categoriaQuery = categoria ? `categoria=${categoria}&` : '';
	const regionQuery = region ? `region=${region}&` : '';
	const yearQuery = year ? `year=${year}&` : '';
	const titleQuery = title ? `title=${title}&` : '';

	const urlQuery = `?${titleQuery}${categoriaQuery}${regionQuery}${yearQuery}`.slice(0, -1);

	if (title) {
		posts = posts.filter(post => {
			titleMatch = `${post.slug} ${post.title}`.toLowerCase().includes(title.toLowerCase())
			return titleMatch;
		})
	}

	const splitArray = (array, size) => {
		const result = [];
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size));
		}
		return result;
	};

	const paginateFilteredPosts = splitArray(posts, pageSize)
	const totalPagesNormas = paginateFilteredPosts.length
	const currentPageNormas = Math.min(page, Math.max(1, totalPagesNormas))
	const pagination = {
		page: currentPageNormas,
		pages: totalPagesNormas,
		limit: pageSize,
		total: posts.length,
		next: currentPageNormas < totalPagesNormas ? currentPageNormas + 1 : null,
		prev: currentPageNormas > 1 ? currentPageNormas - 1 : null,
		url_page: 'normas-legales',
		url_query: urlQuery,
		pages_list: getPageNumbers(currentPageNormas, totalPagesNormas),
	}
	posts = paginateFilteredPosts[currentPageNormas - 1] ?? []

	if (pagination.pages < page && page > 1) {
		console.log({
			message: `Redirecting from page ${page} to page ${pagination.pages}`
		})
		res.redirect(`/normas-legales/${pagination.pages}${urlQuery}`);
		return
	}

	const { data: regiones = [] } = await mysql.getRegiones();

	let seccionPosts = [];
	try {
		seccionPosts = await apiGhost.get().posts.browse({
			filter: "tags:[normas-legales]",
			limit: 'all',
			include: 'tags',
			order: "published_at DESC",
		});
	} catch (error) {
		console.error(error);
	}
	seccionPosts = (seccionPosts || []).filter(p => !disabledIdsNormas.includes(p.id));

	const isYearRegExp = /^\d{4}$/;
	const seccionTagMap = new Map();
	seccionPosts.forEach(post => {
		(post.tags || []).forEach(tag => {
			if (!seccionTagMap.has(tag.slug)) seccionTagMap.set(tag.slug, tag);
		});
	});

	const filteredTags = [...seccionTagMap.values()]
		.filter(tag => !(isYearRegExp.test(tag.slug) || regiones.some(r => r.slug === tag.slug) || tag.slug === 'normas-legales'))
		.map(tag => ({
			name: utils.capitalizeNameRecursive(tag.name),
			slug: tag.slug,
			estaSeleccionado: tag.slug === categoria
		}));

	const years = [...seccionTagMap.values()]
		.filter(tag => isYearRegExp.test(tag.slug))
		.map(tag => ({
			name: tag.name,
			slug: tag.slug,
			estaSeleccionado: tag.slug === year
		}));

	const tags = utils.filterTags(posts);

	posts.forEach(post => {
		if (post.tags) {
			const categoryTag = post.tags.find(tag =>
				!isYearRegExp.test(tag.slug) &&
				!regiones.some(r => r.slug === tag.slug) &&
				tag.slug !== 'normas-legales'
			);
			post.categoryTag = categoryTag ? categoryTag.name : null;

			const regionTag = post.tags.find(tag =>
				regiones.some(r => r.slug === tag.slug)
			);
			const regionData = regionTag ? regiones.find(r => r.slug === regionTag.slug) : null;
			if (regionData) {
				post.regionName = regionData.value;
			}
		}

		if (!post.regionName) {
			const regionFromText =
				utils.extractDepartmentFromText(post.title, regiones) ||
				utils.extractDepartmentFromText(post.custom_excerpt || post.excerpt, regiones);
			post.regionName = regionFromText || 'Nacional';
		}
	});

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

routes.post("/contacto", formLimiter, async (req, res) => {
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
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
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
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	const page = req.params.page ? Number(req.params.page) : 1;
	const pageLength = 5
	const { data: pages = 0 } = await mysql.getDatosAbiertosPages({
		pageLength,
		conditions: { estaActivo: 1 }
	})

	const pagination = {
		page,
		pages,
		next: (page + 1) > pages ? null : (page + 1),
		prev: (page - 1) < 1 ? null : (page - 1),
		url_page: 'datosabiertos',
		pages_list: getPageNumbers(page, pages)
    }

    const { data: datosAbiertos, success } = await mysql.getDatosAbiertos({
		paginate: true,
		page,
		pageLength,
		conditions: { estaActivo: 1 }
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

routes.use("/administrador/api", adminApiRoutes);
routes.use("/administrador", adminRoutes);

routes.use("/consejo-regional", consejoRegionalRoutes);

/* FIN DE ZONA DE DATOS ABIERTOS */

/****SEARCH **/
routes.get("/buscar", async (req, res) => {
	const q = (req.query.q || "").toString().trim();
	const lang = res.locals.lang;
	let results = [];
	let query = q;

	if (q.length >= 2) {
		try {
			const TIPO_MAP = { 'noticias-eventos': 'noticias', 'notas-prensa': 'notas-prensa', 'publicaciones': 'publicaciones', 'normas-legales': 'normas-legales' };
			const ghostResults = await apiGhost.getSearchPosts('tags:-hash-noindex', q);
			if (ghostResults.success) {
				results = results.concat((ghostResults.posts || []).map(p => ({
					tipo: 'post',
					titulo: p.title,
					descripcion: p.custom_excerpt || p.excerpt || '',
					url: p.url ? p.url.replace(process.env.URL_PATH_API || 'http://www.onsv.gob.pe', '/post') : '/post/' + p.slug,
					slug: p.slug,
					fecha: p.published_at,
					imagen: p.feature_image || ''
				})));
			}
		} catch (e) {
			console.error("buscar ghost:", e.message);
		}
		try {
			const { data: eventos } = await mysql.getComunications({ pageSize: 500, conditions: { isActive: true } });
			const ql = q.toLowerCase();
			const eventosMatch = (eventos || []).filter(e =>
				(`${e.title} ${e.shortDescription || ''} ${e.description || ''}`).toLowerCase().includes(ql)
			).map(e => ({
				tipo: 'evento',
				titulo: e.title,
				descripcion: e.shortDescription || e.description || '',
				url: '/comunicaciones/' + e.id,
				slug: String(e.id),
				fecha: e.startTime,
				imagen: e.imageUrl || ''
			}));
			results = results.concat(eventosMatch);
		} catch (e) {
			console.error("buscar eventos:", e.message);
		}
	}

	res.locals.seoMetas = await seo.setMetaTags(req.originalUrl, {
		lang: res.locals.lang,
		settings: res.locals.settings,
		footerData: res.locals.footerData
	});

	res.render("pages/buscar", {
		query,
		results,
		total: results.length
	});
})

routes.post("/search", async (req, res) => {
	const slug = req.body["search"];
	const lang = req.body["lang"];
	const filter = req.body["filter"];
	const featured = filter !== 'notas-prensa';

	const TIPO_MAP = { 'noticias-eventos': 'noticias', 'notas-prensa': 'notas-prensa', 'publicaciones': 'publicaciones', 'normas-legales': 'normas-legales' };
	const results = await apiGhost.getSearchPosts(`tags:${filter}`, slug);

	if (results.success) {
		const tipo = TIPO_MAP[filter];
		let filteredPosts = results.posts;
		if (tipo) {
			const { data: disabledIds = [] } = await mysql.getDisabledGhostIds(tipo);
			filteredPosts = (results.posts || []).filter(p => !disabledIds.includes(p.id));
		}
		const { page, prev, next, step } = req.body;
		const searchRendered = utils.renderNoticiasEventosTemplate({ post: filteredPosts, lang, keyword: req.body['search'], page, prev, next, step, featured })
		res.send({ success: true, posts: searchRendered });
	} else {
		res.send({ success: false })
	}
})

//SusCripción
routes.post("/subscribe", formLimiter, async (req, res) => {
	const form = req.body;
	const response = await utils.subscribeUser(form);
	if (response.success) {
		res.send('Te has suscrito con éxito');
	} else {
		res.send('No te has podido suscribir');
	}

})

//SITEMAP
routes.get(['/sitemap', '/sitemap.xml'], async (req, res) => {
	const sitemap = await seo.createSiteMapV2({ mysql });
	res.set('Content-Type', 'application/xml; charset=utf-8');
	res.status(200).send(sitemap);
})


// REDIRECCIÓN DE ERRORES
routes.use((req, res) => {
	const hasFileExtension = /\.[a-z0-9]{2,5}($|\?)/i.test(req.path);
	if (hasFileExtension) {
		return res.status(404).json({ success: false, message: 'Archivo no disponible' });
	}
	res.status(404).redirect('/');
})


module.exports = routes;
