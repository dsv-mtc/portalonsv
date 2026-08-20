

const BASE_URL = (process.env.URL_PATH || 'https://www.onsv.gob.pe').replace(/\/$/, '');

const DEFAULTS = {
	orgName: {
		es: 'Observatorio Nacional de Seguridad Vial',
		en: 'National Road Safety Observatory'
	},
	orgAlternateName: 'ONSV',
	orgParent: {
		es: 'Ministerio de Transportes y Comunicaciones del Perú',
		en: 'Ministry of Transport and Communications of Peru'
	},
	siteName: 'ONSV',
	twitterSite: '@ONSV_MTC',
	logoPath: '/img/logos/onvs-logo.png',
	themeColor: '#14213D'
};

const SEO_BY_ROUTE = {
	'/': {
		es: { title: 'ONSV | Observatorio Nacional de Seguridad Vial del Perú', description: 'Sistematiza, analiza y difunde información sobre siniestros viales en el Perú para fortalecer las políticas de prevención, fiscalización y respuesta en seguridad vial.' },
		en: { title: 'ONSV | National Road Safety Observatory of Peru', description: 'Systematizes, analyzes and disseminates information on road accidents in Peru to strengthen prevention, enforcement and road safety response policies.' },
		ogType: 'website', robots: 'index,follow', priority: 1.0, changefreq: 'weekly'
	},
	'/quienes-somos': {
		es: { title: 'Quiénes somos | ONSV', description: 'Conoce la misión, visión, valores y componentes tecnológicos del Observatorio Nacional de Seguridad Vial del Perú.' },
		en: { title: 'Who we are | ONSV', description: 'Learn about the mission, vision, values and technological components of the National Road Safety Observatory of Peru.' },
		ogType: 'website', robots: 'index,follow', priority: 0.8, changefreq: 'monthly'
	},
	'/comunicaciones/noticias': {
		es: { title: 'Noticias de seguridad vial | ONSV', description: 'Noticias y notas sobre siniestros viales, prevención y gestión de la seguridad vial en el Perú.' },
		en: { title: 'Road safety news | ONSV', description: 'News and notes on road accidents, prevention and road safety management in Peru.' },
		ogType: 'website', robots: 'index,follow', priority: 0.8, changefreq: 'weekly'
	},
	'/comunicaciones/nota-prensa': {
		es: { title: 'Notas de prensa | ONSV', description: 'Comunicados y notas de prensa del Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'Press releases | ONSV', description: 'Press releases and statements from the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.8, changefreq: 'weekly'
	},
	'/comunicaciones/eventos': {
		es: { title: 'Eventos de seguridad vial | ONSV', description: 'Calendario de eventos, campañas, entrevistas y webinars del Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'Road safety events | ONSV', description: 'Calendar of events, campaigns, interviews and webinars of the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.8, changefreq: 'weekly'
	},
	'/comunicaciones/campanias': {
		es: { title: 'Campañas de seguridad vial | ONSV', description: 'Campañas de concientización y educación vial impulsadas por el Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'Road safety campaigns | ONSV', description: 'Awareness and road safety education campaigns driven by the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.8, changefreq: 'weekly'
	},
	'/comunicaciones/entrevistas': {
		es: { title: 'Entrevistas | ONSV', description: 'Entrevistas sobre seguridad vial del Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'Interviews | ONSV', description: 'Road safety interviews from the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.7, changefreq: 'weekly'
	},
	'/comunicaciones/todos': {
		es: { title: 'Noticias y eventos | ONSV', description: 'Todas las noticias, campañas, eventos y entrevistas de seguridad vial del Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'News and events | ONSV', description: 'All news, campaigns, events and road safety interviews from the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.8, changefreq: 'weekly'
	},
	'/regiones': {
		es: { title: 'Regiones | ONSV', description: 'Información de seguridad vial por regiones del Perú y consejos regionales de seguridad vial.' },
		en: { title: 'Regions | ONSV', description: 'Road safety information by regions of Peru and regional road safety councils.' },
		ogType: 'website', robots: 'index,follow', priority: 0.8, changefreq: 'weekly'
	},
	'/analitica': {
		es: { title: 'Analítica | ONSV', description: 'Tableros, reportes y visualizaciones de datos de siniestralidad vial del Perú.' },
		en: { title: 'Analytics | ONSV', description: 'Dashboards, reports and visualizations of road accident data in Peru.' },
		ogType: 'website', robots: 'index,follow', priority: 0.8, changefreq: 'weekly'
	},
	'/datosabiertos': {
		es: { title: 'Datos abiertos | ONSV', description: 'Conjuntos de datos abiertos sobre siniestros viales en el Perú disponibles para descarga.' },
		en: { title: 'Open data | ONSV', description: 'Open datasets on road accidents in Peru available for download.' },
		ogType: 'website', robots: 'index,follow', priority: 0.8, changefreq: 'weekly'
	},
	'/publicaciones': {
		es: { title: 'Publicaciones | ONSV', description: 'Publicaciones, informes y reportes técnicos sobre seguridad vial del Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'Publications | ONSV', description: 'Publications, reports and technical documents on road safety from the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.9, changefreq: 'weekly'
	},
	'/revistas': {
		es: { title: 'Revistas | ONSV', description: 'Revistas institucionales y ediciones periódicas sobre seguridad vial del Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'Journals | ONSV', description: 'Institution journals and periodic editions on road safety from the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.7, changefreq: 'monthly'
	},
	'/normas-legales': {
		es: { title: 'Normas legales | ONSV', description: 'Normativa, reglamentos y dispositivos legales sobre seguridad vial en el Perú.' },
		en: { title: 'Legal standards | ONSV', description: 'Regulations, rules and legal provisions on road safety in Peru.' },
		ogType: 'website', robots: 'index,follow', priority: 0.9, changefreq: 'weekly'
	},
	'/webinars': {
		es: { title: 'Webinars | ONSV', description: 'Webinars y sesiones en línea sobre seguridad vial del Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'Webinars | ONSV', description: 'Webinars and online sessions on road safety from the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.7, changefreq: 'monthly'
	},
	'/capacitaciones': {
		es: { title: 'Capacitaciones | ONSV', description: 'Capacitaciones y recursos formativos en seguridad vial del Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'Trainings | ONSV', description: 'Trainings and educational resources on road safety from the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.7, changefreq: 'monthly'
	},
	'/entornos-viales': {
		es: { title: 'Entornos viales | ONSV', description: 'Acciones para reducir el riesgo en corredores de alto tránsito y proteger a los usuarios vulnerables.' },
		en: { title: 'Road environments | ONSV', description: 'Actions to reduce risk in high-traffic corridors and protect vulnerable users.' },
		ogType: 'website', robots: 'index,follow', priority: 0.7, changefreq: 'monthly'
	},
	'/contacto': {
		es: { title: 'Contacto | ONSV', description: 'Contacto con el Observatorio Nacional de Seguridad Vial del Ministerio de Transportes y Comunicaciones del Perú.' },
		en: { title: 'Contact | ONSV', description: 'Contact the National Road Safety Observatory of the Ministry of Transport and Communications of Peru.' },
		ogType: 'website', robots: 'index,follow', priority: 0.6, changefreq: 'yearly'
	},
	'/buscar': {
		es: { title: 'Buscar | ONSV', description: 'Resultados de búsqueda de artículos, noticias, eventos y publicaciones del Observatorio Nacional de Seguridad Vial.' },
		en: { title: 'Search | ONSV', description: 'Search results for articles, news, events and publications of the National Road Safety Observatory.' },
		ogType: 'website', robots: 'index,follow', priority: 0.5, changefreq: 'weekly'
	}
};

const FAQ_HOME = {
	es: [
		{ q: '¿Qué es el Observatorio Nacional de Seguridad Vial?', a: 'Es un organismo del Ministerio de Transportes y Comunicaciones del Perú que sistematiza, analiza y difunde información sobre siniestros viales para alimentar las políticas de prevención, fiscalización y respuesta.' },
		{ q: '¿Qué datos sobre siniestros viales puedo encontrar?', a: 'Datos georreferenciados de siniestros, lesiones y muertes en las vías del Perú, además de analítica, publicaciones, normas y datos abiertos.' },
		{ q: '¿Cómo accedo a los datos abiertos?', a: 'Desde la sección de Datos Abiertos del sitio, donde se disponibilizan conjuntos de datos descargables sobre siniestralidad vial a nivel nacional.' },
		{ q: '¿Qué es el SRAT?', a: 'El Sistema de Registro de Accidentes de Tránsito (SRAT) es el visor de alerta de siniestros del Observatorio, con monitoreo georreferenciado en tiempo cercano al real.' }
	],
	en: [
		{ q: 'What is the National Road Safety Observatory?', a: 'It is a body of the Ministry of Transport and Communications of Peru that systematizes, analyzes and disseminates information on road accidents to inform prevention, enforcement and response policies.' },
		{ q: 'What road accident data can I find?', a: 'Georeferenced data on accidents, injuries and deaths on Peruvian roads, as well as analytics, publications, regulations and open data.' },
		{ q: 'How do I access open data?', a: 'From the Open Data section of the site, where downloadable datasets on national road accidents are made available.' },
		{ q: 'What is SRAT?', a: 'The Traffic Accident Registry System (SRAT) is the Observatory\'s accident alert viewer, with georeferenced monitoring in near real time.' }
	]
};

const stripQuery = (path) => (path || '').split('?')[0].split('#')[0];

const normalizePath = (p) => {
	p = stripQuery(p);
	if (p !== '/' && p.endsWith('/') && p.length > 1) p = p.replace(/\/$/, '');
	return p || '/';
};

const toEs = (p) => normalizePath(p.replace(/^\/en\//, '/').replace(/^\/en$/, '/'));

const toEn = (p) => {
	const es = toEs(p);
	return es === '/' ? '/en/' : '/en' + es;
};

const buildCanonical = (originalUrl, lang) => {
	const p = normalizePath(originalUrl);
	const target = lang === 'en' ? toEn(p) : toEs(p);
	return BASE_URL + target;
};

const buildHreflang = (originalUrl) => {
	const p = normalizePath(originalUrl);
	const es = toEs(p);
	const en = toEn(p);
	return [
		{ lang: 'es', url: BASE_URL + es },
		{ lang: 'en', url: BASE_URL + en },
		{ lang: 'x-default', url: BASE_URL + es }
	];
};

const matchRoute = (originalUrl) => {
	const path = stripQuery(originalUrl).replace(/^\/en\//, '/').replace(/^\/en$/, '/');
	for (const key of Object.keys(SEO_BY_ROUTE)) {
		if (path === key || path === key + '/' || path.startsWith(key + '/')) return key;
	}
	return null;
};

module.exports = {
	BASE_URL,
	DEFAULTS,
	SEO_BY_ROUTE,
	FAQ_HOME,
	stripQuery,
	normalizePath,
	toEs,
	toEn,
	buildCanonical,
	buildHreflang,
	matchRoute
};
