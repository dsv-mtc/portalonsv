
const { canonicals } = require('../utils/canonicals_urls');
const { BASE_URL, DEFAULTS, SEO_BY_ROUTE, FAQ_HOME, matchRoute, buildCanonical, buildHreflang, toEs, stripQuery, normalizePath } = require('../utils/seo-dictionary');
const schema = require('./schema');
const logger = require('./logger');
const apiGhost = new (require("../api/ghost"));
const sitemap = require('express-sitemap');
const { hbs2 } = require("./hbs");
const fs = require('fs');
const path = require('path');

const _sanitize = (s) => (s == null ? '' : String(s)).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const _trimTitle = (t) => {
	t = _sanitize(t);
	if (t.length > 60) t = t.slice(0, 57).trim() + '…';
	return t;
};

const _trimDesc = (d) => {
	d = _sanitize(d);
	if (d.length > 160) d = d.slice(0, 157).trim() + '…';
	return d;
};

const _reduceUrl = (url) => normalizePath(url);

const setMetaTags = async (url, ctx = {}) => {
	const lang = ctx.lang || 'es';
	const settings = ctx.settings || {};
	const footerData = ctx.footerData || {};
	const sameAs = (footerData.redesSociales || []).map(r => ({ url: r.enlace || r.url })).filter(r => r.url);

	const pathEs = toEs(stripQuery(url));
	const routeKey = matchRoute(url);
	const routeSeo = routeKey ? SEO_BY_ROUTE[routeKey] : null;

	let title, description, robots, ogType, priority, changefreq;

	if (/\/post\//.test(url) && ctx.post) {
		const p = ctx.post;
		title = _trimTitle(p.meta_title || p.title || (DEFAULTS.orgName.es + ' - Artículo'));
		description = _trimDesc(p.meta_description || p.custom_excerpt || p.excerpt || '');
		robots = 'index,follow';
		ogType = 'article';
	} else if (/\/post\//.test(url)) {
		try {
			const slug = url.split('/').filter(Boolean)[1] || '';
			const p = await apiGhost.getTitleAndExcerptBySlug(slug);
			title = _trimTitle((p && p.title) || (DEFAULTS.orgName.es + ' - Artículo'));
			description = _trimDesc((p && (p.custom_excerpt || p.excerpt)) || '');
		} catch (e) {
			title = DEFAULTS.orgName.es;
			description = '';
		}
		robots = 'index,follow';
		ogType = 'article';
	} else if (/\/tag\//.test(url)) {
		try {
			const slug = url.split('/').filter(Boolean)[1] || '';
			const t = await apiGhost.getTitleAndExcerptByTag(slug);
			title = _trimTitle((t && t.name) || '#' + slug);
			description = _trimDesc((t && t.description) || '');
		} catch (e) {
			title = '#' + (url.split('/').filter(Boolean)[1] || 'tag');
			description = '';
		}
		robots = 'index,follow';
		ogType = 'website';
	} else if (/\/comunicaciones\//.test(url) && /^\d+$/.test(stripQuery(url).split('/').pop()) && ctx.evento) {
		const e = ctx.evento;
		title = _trimTitle(e.title);
		description = _trimDesc(e.shortDescription || e.description || '');
		robots = 'index,follow';
		ogType = 'article';
	} else {
		title = _trimTitle(routeSeo ? (routeSeo[lang] ? routeSeo[lang].title : routeSeo.es.title) : (DEFAULTS.orgName[lang] || DEFAULTS.orgName.es));
		description = _trimDesc(routeSeo ? (routeSeo[lang] ? routeSeo[lang].description : routeSeo.es.description) : '');
		robots = routeSeo ? (routeSeo.robots || 'index,follow') : 'index,follow';
		ogType = routeSeo ? (routeSeo.ogType || 'website') : 'website';
		priority = routeSeo ? routeSeo.priority : 0.5;
		changefreq = routeSeo ? routeSeo.changefreq : 'monthly';
	}

	const paginationPage = (() => {
		const m = stripQuery(url).match(/\/(\d+)\/?(?:\?|$)/) || stripQuery(url).match(/\/(\d+)$/);
		return m ? Number(m[1]) : null;
	})();
	const isSecondPage = paginationPage && paginationPage > 1;
	const hasQuery = stripQuery(url) !== url;

	if (isSecondPage && !ctx.forceIndex) {
		robots = 'index,follow';
	}
	if (hasQuery && !/\/buscar(\?|$|\/)/.test(url) && ctx.nofollowQuery !== false) {
		robots = ctx.keepQueryIndex ? 'index,follow' : 'noindex,follow';
	}

	const canonical = buildCanonical(url, lang);
	const hreflang = buildHreflang(url);
	const imageAbs = ctx.image
		? (/^https?:\/\//i.test(ctx.image) ? ctx.image : BASE_URL + (ctx.image.startsWith('/') ? '' : '/') + ctx.image)
		: (settings.icon ? (settings.icon.startsWith('http') ? settings.icon : BASE_URL + (settings.icon.startsWith('/') ? '' : '/') + settings.icon) : BASE_URL + DEFAULTS.logoPath);

	const prev = ctx.prev ? buildCanonical(ctx.prev, lang) : null;
	const next = ctx.next ? buildCanonical(ctx.next, lang) : null;

	const seoMetas = {
		title,
		description,
		canonical,
		robots,
		ogType,
		og: {
			type: ogType,
			url: canonical,
			title: _sanitize(title),
			description: description,
			image: imageAbs,
			locale: lang === 'en' ? 'en_US' : 'es_PE',
			siteName: DEFAULTS.siteName
		},
		twitter: {
			card: 'summary_large_image',
			site: DEFAULTS.twitterSite,
			title: _sanitize(title),
			description: description,
			image: imageAbs
		},
		hreflang,
		prev,
		next,
		jsonLd: ''
	};

	const graphBase = [
		schema.buildOrganization({ settings, footerData, sameAs }),
		schema.buildWebSite({ lang, settings })
	];

	let extra = [];
	if (/\/post\//.test(url) && ctx.post) {
		extra.push(schema.buildBlogPosting({ post: ctx.post, canonical, lang }));
		extra.push(schema.buildBreadcrumb([{ name: 'Inicio', url: '/' }, { name: ctx.post.title, url: canonical }]));
	} else if (/\/comunicaciones\//.test(url) && /^\d+$/.test(stripQuery(url).split('/').pop()) && ctx.evento) {
		extra.push(schema.buildEvent({ evento: ctx.evento, canonical }));
		extra.push(schema.buildBreadcrumb([{ name: 'Inicio', url: '/' }, { name: 'Eventos', url: '/comunicaciones/eventos' }, { name: ctx.evento.title, url: canonical }]));
	} else if (/\/contacto/.test(pathEs)) {
		extra.push(schema.buildContactPage({ canonical, lang, title, description, footerData }));
		extra.push(schema.buildBreadcrumb([{ name: 'Inicio', url: '/' }, { name: lang === 'en' ? 'Contact' : 'Contacto', url: canonical }]));
	} else if (/\/buscar/.test(pathEs) || /\/buscar/.test(url)) {
		extra.push(schema.buildSearchResultsPage({ canonical, lang, query: (url.match(/[?&]q=([^&]*)/) || [])[1] }));
		extra.push(schema.buildBreadcrumb([{ name: 'Inicio', url: '/' }, { name: lang === 'en' ? 'Search' : 'Buscar', url: canonical }]));
	} else if (/\/tag\//.test(url)) {
		extra.push(schema.buildCollectionPage({ canonical, lang, title, description, items: (ctx.items || []) }));
		extra.push(schema.buildBreadcrumb([{ name: 'Inicio', url: '/' }, { name: '#' + (url.split('/').filter(Boolean)[1] || 'tag'), url: canonical }]));
	} else if (/\/(publicaciones|normas-legales|revistas|datosabiertos|comunicaciones)/.test(pathEs)) {
		extra.push(schema.buildCollectionPage({ canonical, lang, title, description, items: (ctx.items || []) }));
		const crumbs = [{ name: 'Inicio', url: '/' }, { name: title, url: canonical }];
		extra.push(schema.buildBreadcrumb(crumbs));
	} else if (pathEs === '/' || pathEs === '') {
		extra.push(schema.buildWebPage({ canonical, lang, title, description, image: imageAbs }));
		extra.push(schema.buildFAQ(lang));
		extra.push(schema.buildBreadcrumb([{ name: 'Inicio', url: '/' }]));
	} else {
		extra.push(schema.buildWebPage({ canonical, lang, title, description, image: imageAbs }));
		const crumbs = [{ name: 'Inicio', url: '/' }, { name: title, url: canonical }];
		extra.push(schema.buildBreadcrumb(crumbs));
	}

	seoMetas.jsonLd = schema.serialize({ '@context': 'https://schema.org', '@graph': graphBase.concat(extra.filter(Boolean)) });

	return seoMetas;
};

const createSiteMapV2 = async (opts = {}) => {
	const mysql = opts.mysql || new (require("../api/mysql"));
	if (typeof mysql.setQuery === 'function' && !mysql._seoInited) {
		try { mysql.setQuery(); mysql._seoInited = true; } catch (e) {}
	}
	let sites = [];

	canonicals.forEach(c => {
		c.links.forEach(l => {
			sites.push({
				url: BASE_URL + l.url,
				changefreq: c.changefreq,
				priority: c.priority,
				lastmod: '',
				alternateEs: BASE_URL + c.links[0].url,
				alternateEn: BASE_URL + c.links[1].url
			});
		});
	});

	if (SEO_BY_ROUTE) {
		Object.keys(SEO_BY_ROUTE).forEach(route => {
			if (canonicals.some(c => c.url === route || c.url === route + '/')) return;
			['es', 'en'].forEach(lang => {
				const urlPath = lang === 'en' ? (route === '/' ? '/en/' : '/en' + route) : route;
				sites.push({
					url: BASE_URL + urlPath,
					changefreq: SEO_BY_ROUTE[route].changefreq || 'monthly',
					priority: SEO_BY_ROUTE[route].priority || 0.5,
					lastmod: '',
					alternateEs: BASE_URL + (route === '/' ? '/' : route),
					alternateEn: BASE_URL + (route === '/' ? '/en/' : '/en' + route)
				});
			});
		});
	}

	try {
		const posts = await apiGhost.getPosts(0, 'tags,authors', 'featured:false', 'published_at DESC');
		(posts || []).forEach(p => {
			const slug = p.slug;
			if (!slug) return;
			const lastmod = _isoSitemap(p.updated_at || p.published_at);
			sites.push({
				url: BASE_URL + '/post/' + slug,
				changefreq: 'weekly',
				priority: 0.7,
				lastmod,
				alternateEs: BASE_URL + '/post/' + slug,
				alternateEn: BASE_URL + '/en/post/' + slug
			});
		});
	} catch (e) {
		logger.error && logger.error('sitemap posts: ' + e.message);
	}

	try {
		const tags = await apiGhost.getTags('count.posts', 'all');
		(tags || []).forEach(t => {
			if (!t.slug || t.count && t.count.posts === 0) return;
			sites.push({
				url: BASE_URL + '/tag/' + t.slug,
				changefreq: 'weekly',
				priority: 0.5,
				lastmod: '',
				alternateEs: BASE_URL + '/tag/' + t.slug,
				alternateEn: BASE_URL + '/en/tag/' + t.slug
			});
		});
	} catch (e) {
		logger.error && logger.error('sitemap tags: ' + e.message);
	}

	try {
		const { data: eventos } = await mysql.getComunications({ pageSize: 1000, conditions: { isActive: true } });
		(eventos || []).forEach(e => {
			if (!e.id) return;
			const lastmod = _isoSitemap(e.update_time || e.create_time || e.startTime);
			sites.push({
				url: BASE_URL + '/comunicaciones/' + e.id,
				changefreq: 'weekly',
				priority: 0.6,
				lastmod,
				alternateEs: BASE_URL + '/comunicaciones/' + e.id,
				alternateEn: BASE_URL + '/en/comunicaciones/' + e.id
			});
		});
	} catch (e) {
		logger.error && logger.error('sitemap eventos: ' + e.message);
	}

	const seen = new Set();
	sites = sites.filter(s => {
		if (seen.has(s.url)) return false;
		seen.add(s.url);
		return true;
	});

	let template = fs.readFileSync(path.join(__dirname, "../views/pages/sitemap.hbs"), 'utf-8');
	let compiled = hbs2.compile(template);
	return compiled({ sites });
};

const _isoSitemap = (d) => {
	if (!d) return '';
	try {
		const dt = new Date(d);
		if (isNaN(dt.getTime())) return '';
		return dt.toISOString().split('T')[0];
	} catch (e) { return ''; }
};

const createSiteMapV1 = async () => {
	let canonicalUrls = [...canonicals];
	let urls = [];
	const siteMapOptions = {
		http: `${process.env.PROTOCOL_HTTP}`,
		url: process.env.URL_PATH ? process.env.URL_PATH.replace(/^https?:\/\//, '') : '',
		map: {},
		route: {}
	};
	canonicalUrls.forEach(canonicalUrl => {
		siteMapOptions.map[`${canonicalUrl.url}`] = canonicalUrl.httpProtocol;
		siteMapOptions.route[`${canonicalUrl.url}`] = {
			changefreq: canonicalUrl.changefreq,
			priority: canonicalUrl.priority,
		};
	});
	return sitemap(siteMapOptions);
};

module.exports = {
	createSiteMapV1,
	createSiteMapV2,
	setMetaTags
};
