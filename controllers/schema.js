
const { BASE_URL, DEFAULTS, FAQ_HOME, buildHreflang } = require('../utils/seo-dictionary');

const _sanitize = (s) => (s == null ? '' : String(s)).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const _abs = (url) => {
	if (!url) return '';
	const u = String(url);
	if (/^https?:\/\//i.test(u)) return u;
	if (u.startsWith('//')) return 'https:' + u;
	return BASE_URL + (u.startsWith('/') ? '' : '/') + u;
};

const _iso = (d) => {
	if (!d) return '';
	try { return new Date(d).toISOString(); } catch (e) { return ''; }
};

const buildOrganization = ({ settings, footerData, sameAs }) => {
	const logo = _abs((settings && settings.icon) || DEFAULTS.logoPath);
	const org = {
		'@type': 'Organization',
		'@id': BASE_URL + '/#organization',
		name: DEFAULTS.orgName.es,
		alternateName: DEFAULTS.orgAlternateName,
		url: BASE_URL,
		logo: {
			'@type': 'ImageObject',
			'@id': BASE_URL + '/#logo',
			url: logo,
			width: 240,
			height: 240,
			caption: DEFAULTS.orgName.es
		},
		image: logo,
		areaServed: { '@type': 'Country', name: 'Perú' },
		parentOrganization: {
			'@type': 'Organization',
			name: DEFAULTS.orgParent.es
		}
	};
	if (sameAs && sameAs.length) org.sameAs = sameAs.map(s => s.url || s).filter(Boolean);
	if (footerData) {
		if (footerData.telefono || footerData.telephone) {
			org.contactPoint = {
				'@type': 'ContactPoint',
				contactType: 'customer service',
				telephone: footerData.telefono || footerData.telephone,
				email: footerData.email || footerData.correo || undefined,
				areaServed: 'Perú',
				availableLanguage: ['Spanish', 'English']
			};
		}
		if (footerData.direccion || footerData.address) {
			org.address = {
				'@type': 'PostalAddress',
				streetAddress: footerData.direccion || footerData.address,
				addressCountry: 'PE'
			};
		}
	}
	return org;
};

const buildWebSite = ({ lang, settings }) => ({
	'@type': 'WebSite',
	'@id': BASE_URL + '/#website',
	url: BASE_URL,
	name: DEFAULTS.siteName,
	description: (settings && settings.description) || '',
	inLanguage: lang === 'en' ? 'en-US' : 'es-PE',
	publisher: { '@id': BASE_URL + '/#organization' },
	potentialAction: {
		'@type': 'SearchAction',
		target: {
			'@type': 'EntryPoint',
			urlTemplate: BASE_URL + (lang === 'en' ? '/en/buscar?q={search_term_string}' : '/buscar?q={search_term_string}')
		},
		'query-input': 'required name=search_term_string'
	}
});

const buildWebPage = ({ canonical, lang, title, description, image, routeKey }) => ({
	'@type': 'WebPage',
	'@id': canonical + '#webpage',
	url: canonical,
	name: _sanitize(title),
	description: _sanitize(description),
	inLanguage: lang === 'en' ? 'en-US' : 'es-PE',
	isPartOf: { '@id': BASE_URL + '/#website' },
	primaryImageOfPage: image ? { '@id': image } : undefined,
	datePublished: undefined,
	dateModified: undefined
});

const buildBreadcrumb = (items) => ({
	'@type': 'BreadcrumbList',
	'@id': BASE_URL + '/#breadcrumb-' + Math.random().toString(36).slice(2, 8),
	itemListElement: (items || []).filter(Boolean).map((it, i) => ({
		'@type': 'ListItem',
		position: i + 1,
		name: _sanitize(it.name),
		item: it.url ? _abs(it.url) : undefined
	}))
});

const buildFAQ = (lang) => ({
	'@type': 'FAQPage',
	'@id': BASE_URL + '/#faq-home',
	mainEntity: (FAQ_HOME[lang] || FAQ_HOME.es).map(f => ({
		'@type': 'Question',
		name: _sanitize(f.q),
		acceptedAnswer: { '@type': 'Answer', text: _sanitize(f.a) }
	}))
});

const buildBlogPosting = ({ post, canonical, lang }) => {
	const headline = _sanitize(post.meta_title || post.title);
	const desc = _sanitize(post.meta_description || post.custom_excerpt || post.excerpt || '');
	const img = _abs(post.og_image || post.feature_image);
	const pub = _iso(post.published_at);
	const mod = _iso(post.updated_at || post.published_at);
	const keywords = (post.tags || []).map(t => t.name).filter(Boolean).join(', ');
	const author = (post.authors && post.authors[0]) ? { '@type': 'Person', name: _sanitize(post.authors[0].name) } : undefined;
	return {
		'@type': 'BlogPosting',
		'@id': canonical + '#article',
		headline,
		description: desc,
		image: img ? { '@type': 'ImageObject', url: img } : undefined,
		datePublished: pub || undefined,
		dateModified: mod || undefined,
		inLanguage: lang === 'en' ? 'en-US' : 'es-PE',
		author,
		publisher: { '@id': BASE_URL + '/#organization' },
		mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
		keywords: keywords || undefined,
		articleSection: (post.primary_tag && post.primary_tag.name) || undefined,
		isPartOf: { '@id': BASE_URL + '/#website' }
	};
};

const buildEvent = ({ evento, canonical }) => {
	const name = _sanitize(evento.title);
	const desc = _sanitize(evento.shortDescription || evento.description || '');
	const img = _abs(evento.imageUrl);
	const start = _iso(evento.startTime);
	const end = _iso(evento.endTime || evento.startTime);
	const place = _sanitize(evento.place);
	const addr = _sanitize(evento.direccion);
	return {
		'@type': 'Event',
		'@id': canonical + '#event',
		name,
		description: desc,
		image: img ? { '@type': 'ImageObject', url: img } : undefined,
		startDate: start || undefined,
		endDate: end || undefined,
		eventAttendanceMode: (evento.reunionLink || evento.facebookLink) ? 'Online' : 'Offline',
		location: place ? {
			'@type': 'Place',
			name: place,
			address: addr ? { '@type': 'PostalAddress', streetAddress: addr, addressCountry: 'PE' } : undefined
		} : undefined,
		organizer: evento.organizedBy ? { '@type': 'Organization', name: _sanitize(evento.organizedBy) } : undefined,
		isPartOf: { '@id': BASE_URL + '/#website' }
	};
};

const buildCollectionPage = ({ canonical, lang, title, description, items }) => ({
	'@type': 'CollectionPage',
	'@id': canonical + '#collection',
	url: canonical,
	name: _sanitize(title),
	description: _sanitize(description),
	inLanguage: lang === 'en' ? 'en-US' : 'es-PE',
	isPartOf: { '@id': BASE_URL + '/#website' },
	about: { '@id': BASE_URL + '/#organization' },
	mainEntity: items && items.length ? {
		'@type': 'ItemList',
		numberOfItems: items.length,
		itemListElement: items.slice(0, 20).map((it, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: _sanitize(it.name),
			url: _abs(it.url)
		}))
	} : undefined
});

const buildContactPage = ({ canonical, lang, title, description, footerData }) => ({
	'@type': 'ContactPage',
	'@id': canonical + '#contactpage',
	url: canonical,
	name: _sanitize(title),
	description: _sanitize(description),
	inLanguage: lang === 'en' ? 'en-US' : 'es-PE',
	isPartOf: { '@id': BASE_URL + '/#website' },
	primaryContactPoint: footerData && (footerData.telefono || footerData.email) ? {
		'@type': 'ContactPoint',
		contactType: 'customer service',
		telephone: footerData.telefono || undefined,
		email: footerData.email || undefined,
		areaServed: 'Perú',
		availableLanguage: ['Spanish', 'English']
	} : undefined
});

const buildSearchResultsPage = ({ canonical, lang, query }) => ({
	'@type': 'SearchResultsPage',
	'@id': canonical + '#search',
	url: canonical,
	name: 'Buscar' + (query ? ' - ' + _sanitize(query) : ''),
	inLanguage: lang === 'en' ? 'en-US' : 'es-PE',
	isPartOf: { '@id': BASE_URL + '/#website' }
});

const serialize = (graph) => {
	const clean = JSON.parse(JSON.stringify(graph, (k, v) => (v === undefined || v === null || v === '') ? undefined : v));
	return '<script type="application/ld+json">' + JSON.stringify(clean).replace(/</g, '\\u003c') + '</script>';
};

module.exports = {
	buildOrganization,
	buildWebSite,
	buildWebPage,
	buildBreadcrumb,
	buildFAQ,
	buildBlogPosting,
	buildEvent,
	buildCollectionPage,
	buildContactPage,
	buildSearchResultsPage,
	serialize
};
