const exphbs = require("express-handlebars");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const handlebars = require("handlebars");
const dotenv = require('dotenv');

dotenv.config();

moment.defineLocale('es', {
	months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
	monthsShort: 'Ene._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
	weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
	weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
	weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
})
moment.locale("es");
/**
 * @description: Referido a traducir en otro idioma de turno
 */
function t(lang, text) {
	let rawData = fs.readFileSync(path.join(__dirname, `../utils/locales/${lang}.json`))
	let data = JSON.parse(rawData);
	return data[text];
}


function ifCond(v1, v2, options) {
	if (v1 === v2) {
		return options.fn(this);
	}
	return options.inverse(this);
};

/**
 * 
 * @param {string} url_selected 
 * @param {string} label 
 * @returns 
 */
function getMenuSelected(url_selected, label) {
	if (url_selected == '/') {
		if (label === 'inicio') {
			return 'add-color';
		}
		return '';
	} else {
		let getLabel = url_selected.split('/')[1]
		if (getLabel === label) {
			return 'add-color';
		} else {
			let afterLabel = '';
			if (label == 'noticias y eventos') afterLabel = "noticias-eventos";
			if (label == 'normas legales') afterLabel = "normas-legales";
			if (getLabel === afterLabel) {
				return 'add-color';
			}
		}
	}
}

function createMenu(menuList, secondary_navigation, url_selected) {
	let htmlMenu = "";

	function findGhost(label) {
		return menuList.find(function (m) { return m.label === label; });
	}

	function findGhostCI(label) {
		return menuList.find(function (m) { return m.label.toLowerCase() === label.toLowerCase(); });
	}

	function renderGhostItem(menuObj) {
		var target = setTarget(menuObj.label);
		var addColor = getMenuSelected(url_selected, menuObj.label);
		return '<li class="nav-item nav-special ' + addColor + '"><a class="nav-link" href="' + menuObj.url + '" target="' + target + '">' + menuObj.label + '</a></li>';
	}

	function renderDropdownItem(i) {
		var cls = 'dropdown-item' + (i.wrap ? ' dropdown-item-wrap' : '');
		return '<a class="' + cls + '" href="' + i.url + '">' + i.label + '</a>';
	}

	// 1. Home icon (always first, sin dropdown)
	var homeActive = url_selected === '/' || url_selected === '/en/' ? 'add-color' : '';
	htmlMenu += `
		<li class="nav-item nav-special ${homeActive}">
			<a class="nav-link" href="${secondary_navigation ? '/en/' : '/'}">
				<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
					<path d="M 12 2 A 1 1 0 0 0 11.289062 2.296875 L 1.203125 11.097656 A 0.5 0.5 0 0 0 1 11.5 A 0.5 0.5 0 0 0 1.5 12 L 4 12 L 4 20 C 4 20.552 4.448 21 5 21 L 9 21 C 9.552 21 10 20.552 10 20 L 10 14 L 14 14 L 14 20 C 14 20.552 14.448 21 15 21 L 19 21 C 19.552 21 20 20.552 20 20 L 20 12 L 22.5 12 A 0.5 0.5 0 0 0 23 11.5 A 0.5 0.5 0 0 0 22.796875 11.097656 L 12.716797 2.3027344 A 1 1 0 0 0 12.710938 2.296875 A 1 1 0 0 0 12 2 z" />
				</svg>
			</a>
		</li>`;

	// 2. Quiénes somos (hardcoded dropdown)
	var qsLabel = secondary_navigation ? 'Who we are' : 'Quiénes somos';
	var qsActive = url_selected === '/quienes-somos' || url_selected === '/en/quienes-somos' ? 'add-color' : '';
	var qsItems = secondary_navigation
		? [
			{ label: 'Who we are?', url: '/en/quienes-somos#quienes-somos' },
			{ label: 'Mission', url: '/en/quienes-somos#mision' },
			{ label: 'Vision', url: '/en/quienes-somos#vision' },
			{ label: 'Values', url: '/en/quienes-somos#valores' },
			{ label: 'Tech Components', url: '/en/quienes-somos#componentes', wrap: true }
		]
		: [
			{ label: '¿Quienes somos?', url: '/quienes-somos#quienes-somos' },
			{ label: 'Misión', url: '/quienes-somos#mision' },
			{ label: 'Visión', url: '/quienes-somos#vision' },
			{ label: 'Valores', url: '/quienes-somos#valores' },
			{ label: 'Componentes Tecnológicos', url: '/quienes-somos#componentes', wrap: true }
		];
	htmlMenu += `
		<li class="nav-item nav-special ${qsActive} dropdown">
			<a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${qsLabel}</a>
			<div class="dropdown-menu">${qsItems.map(renderDropdownItem).join('')}</div>
		</li>`;

	// 3. Comunicaciones (hardcoded dropdown)
	var commLabel = secondary_navigation ? 'Communications' : 'Comunicaciones';
	var commActive = url_selected.startsWith('/comunicaciones/') || url_selected.startsWith('/en/comunicaciones/') ? 'add-color' : '';
	var commItems = secondary_navigation
		? [
			{ label: 'News', url: '/en/comunicaciones/noticias' },
			{ label: 'Press release', url: '/en/comunicaciones/nota-prensa' },
			{ label: 'Events', url: '/en/comunicaciones/eventos' }
		]
		: [
			{ label: 'Noticias', url: '/comunicaciones/noticias' },
			{ label: 'Nota de prensa', url: '/comunicaciones/nota-prensa' },
			{ label: 'Eventos', url: '/comunicaciones/eventos' }
		];
	htmlMenu += `
		<li class="nav-item nav-special ${commActive} dropdown">
			<a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${commLabel}</a>
			<div class="dropdown-menu">${commItems.map(renderDropdownItem).join('')}</div>
		</li>`;

	// 4. Publicaciones (Ghost)
	var pubGhost = secondary_navigation
		? findGhostCI('publications') || findGhostCI('Publications') || findGhostCI('Publicaciones') || findGhostCI('publicaciones')
		: findGhostCI('Publicaciones') || findGhostCI('publicaciones') || findGhostCI('publications') || findGhostCI('Publications');
	if (pubGhost) htmlMenu += renderGhostItem(pubGhost);

	// 5. Aplicaciones (hardcoded dropdown)
	var appGhost = findGhost('analítica') || findGhost('analytics');
	var sratGhost = findGhost('srat');
	var appLabel = secondary_navigation ? 'Applications' : 'Aplicaciones';
	var appLabelItem = appGhost ? appGhost.label : (secondary_navigation ? 'Analytics' : 'Analítica');
	var sratLabelItem = sratGhost ? sratGhost.label : 'SRAT';
	var sratUrl = sratGhost ? sratGhost.url : '#';
	var sratTarget = setTarget(sratGhost ? sratGhost.label : 'srat');
	var appActive = (url_selected === '/analitica' || url_selected === '/analitica/' ||
		url_selected === '/srat' || url_selected === '/srat/' ||
		url_selected === '/datosabiertos' || url_selected.startsWith('/datosabiertos/') ||
		url_selected === '/en/analitica' || url_selected === '/en/analitica/' ||
		url_selected === '/en/srat' || url_selected === '/en/srat/' ||
		url_selected === '/en/datosabiertos' || url_selected.startsWith('/en/datosabiertos/'))
		? 'add-color' : '';
	htmlMenu += `
		<li class="nav-item nav-special ${appActive} dropdown">
			<a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${appLabel}</a>
			<div class="dropdown-menu">
				<a class="dropdown-item" href="${appGhost ? appGhost.url : '#'}" target="${appGhost ? setTarget(appGhost.label) : '_self'}">${appLabelItem}</a>
				<a class="dropdown-item" href="${sratUrl}" target="${sratTarget}">${sratLabelItem}</a>
				<a class="dropdown-item" href="/datosabiertos" target="_self">${secondary_navigation ? 'Open Data' : 'Datos abiertos'}</a>
			</div>
		</li>`;

	// 6. Normas legales (Ghost)
	var normasGhost = secondary_navigation
		? findGhostCI('laws') || findGhostCI('Normas legales') || findGhostCI('normas legales')
		: findGhostCI('Normas legales') || findGhostCI('normas legales') || findGhostCI('laws');
	if (normasGhost) htmlMenu += renderGhostItem(normasGhost);

	// 7. Regiones (Ghost)
	var regionGhost = secondary_navigation
		? findGhostCI('regions') || findGhostCI('Regions') || findGhostCI('Regiones') || findGhostCI('regiones')
		: findGhostCI('Regiones') || findGhostCI('regiones') || findGhostCI('regions') || findGhostCI('Regions');
	if (regionGhost) htmlMenu += renderGhostItem(regionGhost);

	// 8. Orientación a víctimas (hardcoded link)
	var victimLabel = secondary_navigation ? 'Victim Support' : 'Orientación a víctimas';
	htmlMenu += '<li class="nav-item nav-special"><a class="nav-link" href="#">' + victimLabel + '</a></li>';

	// 9. Programas (hardcoded dropdown)
	var progLabel = secondary_navigation ? 'Programs' : 'Programas';
	var progItemLabel = secondary_navigation ? 'Road Environments' : 'Entornos viales';
	htmlMenu += `
		<li class="nav-item nav-special dropdown">
			<a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${progLabel}</a>
			<div class="dropdown-menu"><a class="dropdown-item" href="#">${progItemLabel}</a></div>
		</li>`;

	// 10. Educación Vial (dropdown)
	if (secondary_navigation) {
		htmlMenu += `
			<li class="nav-item nav-special ${getMenuSelected2(url_selected)} dropdown">
				<a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Road Education</a>
				<div class="dropdown-menu">
					<a class="dropdown-item" href="/en/webinars" target="_self">Webinars</a>
					<a class="dropdown-item" href="/en/capacitaciones" target="_self">Trainings</a>
					<a class="dropdown-item" href="/en/peru-in-world/" target="_blank">PERU-IN-world</a>
					<a class="dropdown-item" href="https://aulavirtual.mtc.gob.pe/seguridadvial/" target="_blank">Virtual Room</a>
				</div>
			</li>`;
	} else {
		htmlMenu += `
			<li class="nav-item nav-special ${getMenuSelected2(url_selected)} dropdown">
				<a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Educación Vial</a>
				<div class="dropdown-menu">
					<a class="dropdown-item" href="/webinars" target="_self">Webinars</a>
					<a class="dropdown-item" href="/capacitaciones" target="_self">Capacitaciones</a>
					<a class="dropdown-item" href="/peru-in-world/" target="_blank">peru-in-world</a>
					<a class="dropdown-item" href="https://aulavirtual.mtc.gob.pe/seguridadvial/" target="_blank">Aula Virtual</a>
				</div>
			</li>`;
	}

	// Resto de items Ghost no incluidos arriba
	var skip = ['inicio', 'home', 'analítica', 'analytics', 'noticias y eventos', 'news and events', 'srat', 'peru-in-world', 'PERU-IN-world', 'contacto', 'contact', 'Publicaciones', 'publicaciones', 'Publications', 'publications', 'Normas legales', 'normas legales', 'Legal Standards', 'legal standards', 'laws', 'Regiones', 'regiones', 'Regions', 'regions'];
	menuList.forEach(function (menuObj) {
		if (skip.indexOf(menuObj.label) !== -1) return;
		var target = setTarget(menuObj.label);
		var addColor = getMenuSelected(url_selected, menuObj.label);
		htmlMenu += '<li class="nav-item nav-special ' + addColor + '"><a class="nav-link" href="' + menuObj.url + '" target="' + target + '">' + menuObj.label + '</a></li>';
	});

	return htmlMenu;
}

function getMenuSelected2(url_selected) {
	if (url_selected === '/webinars' || url_selected === '/en/webinars') {
		return "add-color"
	}
	if (url_selected === '/capacitaciones' || url_selected === '/en/capacitaciones') {
		return "add-color"
	}
	if (url_selected.startsWith('/peru-in-world') || url_selected.startsWith('/en/peru-in-world')) {
		return "add-color"
	}
}

function parseDate(dateString) {
	return moment(dateString).format("MMM DD YYYY");
}

function parseHour(dateString, format) {
	return moment(dateString).format(format);
}
/**
 * 
 * @param {string} urlString 
 * @returns {string}
 */
function parseHttp(urlString) {
	//const pattern=/^http:\/\/www\.onsv\.gob\.pe/
	const pattern = /^http:/
	if (pattern.test(urlString)) {

		return urlString.replace(/http:/, 'https:')
	}
	const pattern2 = /^https:/
	if (pattern2.test(urlString)) {
		return urlString.replace(/https:/, 'https:')
	}
	return urlString;
}
/**
 * 
 * @param {string} urlString 
 * @returns {string}
 */
function parseHttpImage(urlString) {
	if (urlString.includes("http://www.onsv.gob.pe")) {
		return urlString.replace("http://www.onsv.gob.pe", "https://www.onsv.gob.pe:5000")
	}
	if (urlString.includes("https://www.onsv.gob.pe")) {
		return urlString.replace("https://www.onsv.gob.pe", "https://www.onsv.gob.pe:5000")
	}
}

function assets(pathImg) {
	return path.join(__dirname, `../public/assets/${pathImg}`);
}
//Usado solo en la paginación
function page_url(url_page, index, lang) {
	const url = process.env.URL_PATH
	if (lang == "es") {
		return `${url}/${url_page}/${index}`
	} else {
		return `${url}/${lang}/${url_page}/${index}`
	}

}
function page_url_search(url_page, index, lang, keyword) {
	const url = process.env.URL_PATH
	if (lang == "es") {
		return `${url}/${url_page}/${index}?keyword=${keyword}`
	} else {
		return `${url}/${lang}/${url_page}/${index}?keyword=${keyword}`
	}
}

function endpointPostParse(url, lang) {
	url = parseHttp(url);
	/*console.log("url", url)*/
	const pattern = process.env.URL_PATH_API3

	if (lang == "es") {
		return url.replace(pattern, `${process.env.URL_PATH_POSTS}/post`);
	}

	if (lang == "en") {
		return url.replace(pattern, `${process.env.URL_PATH_POSTS}/en/post`);
	}


}

/**
 * @description: Usado para convertir un url tipo (HTTPS) https:w3.onsve.gob.pe/X a localhost/X
 * @param {*} url Endpoint al que apunta originalmente la plataforma
 * @returns  Un url parseado con la url origen de la web
 */
function endpointRebase(url) {
	const pattern = process.env.URL_PATH_API
	return url.replace(pattern, `${process.env.URL_PATH}`)
}

/**
 * @description: Usado para convertir un url tipo (HTTP) http:w3.onsve.gob.pe/X a localhost/X
 * @param {*} url Endpoint al que apunta originalmente la plataforma
 * @returns  Un url parseado con la url origen de la web
 */
function endpointRebase2(url) {
	const pattern = process.env.URL_PATH_API2;
	return url.replace(pattern, `${process.env.URL_PATH}`)
}

function checkTagsVisible(url) {
	if (url.includes('404')) {
		return 'display:none';
	} else {
		return '';
	}

}

function setTarget(label) {
	if (label == "srat" || label == "analítica") {
		return "_blank"
	}
	return "_self"
}

/**
 * @description: Regulas direcciones que contienen http a https, busca en todo el string y los modifica, si
 * la dirección ya posee un https, lo retorna tal cual
 * @param {*} htmlString: Contenido del post estructurado en html e inserto en un string
 * @returns 
 */
function checkHtml(htmlString) {
	if (htmlString.search('https') == -1) {
		htmlString.replace('http', 'https');
	}

	if (/http:\/\/www\.onsv\.gob\.pe\/content\/images/g.test(htmlString)) {
		htmlString = htmlString
			.replace(
				/http:\/\/www\.onsv\.gob\.pe\/content\/images/g, 
				'https://www.onsv.gob.pe:5000/content/images'
			);
	}
 
	return htmlString;


}

function parseCategory(categoryValue) {
	const categories = [
		{ key: "Economía y Finanzas", value: "economia" },
		{ key: "Gobernabilidad", value: "gobernabilidad" },
		{ key: "Transporte", value: "transporte" },
		{ key: "Desarrollo Social", value: "desarrollo-social" },
		{ key: "Desarrollo Urbano", value: "desarrollo-urbano" },
		{ key: "Educación", value: "educacion" },
		{ key: "Medio Ambiente", value: "medio-ambiente" },
		{ key: "Salud", value: "salud" },
		{ key: "COVID-19", value: "covid" },
		{ key: "Energía", value: "energia" },
		{ key: "Agua y Saneamiento", value: "agua-saneamiento" },
		{ key: "Alimentación y Nutrición", value: "alimentacion-nutricion" },

	];
	let categoryToSend = "";
	categories.forEach(category => {
		if (category.value === categoryValue) {
			categoryToSend = category.key;
		}
	})
	return categoryToSend;
}
function parseIcon(categoryValue) {
	const iconsList = [
		{ key: "far fa-chart-bar", value: "economia" },
		{ key: "fas fa-university", value: "gobernabilidad" },
		{ key: "fas fa-bus-alt", value: "transporte" },
		{ key: "fas fa-users", value: "desarrollo-social" },
		{ key: "fab fa-hive", value: "desarrollo-urbano" },
		{ key: "fas fa-graduation-cap", value: "educacion" },
		{ key: "fas fa-leaf", value: "medio-ambiente" },
		{ key: "far fa-hospital", value: "salud" },
		{ key: "fas fa-virus", value: "covid" },
		{ key: "fas fa-ligthbulb", value: "energia" },
		{ key: "fas fa-tint", value: "agua-saneamiento" },
		{ key: "fab fa-nutritionix", value: "alimentacion-nutricion" },

	];
	let iconToSend = "";
	iconsList.forEach(icon => {
		if (icon.value === categoryValue) {
			iconToSend = icon.key;
		}
	})
	//console.log(iconToSend)
	return iconToSend;
}

function normalizeText(str) {
	return (str || "")
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toUpperCase()
		.trim();
}

function parseRegion(tags) {
	var regionesList = require('../utils/regiones').REGIONES;
	if (!tags || !Array.isArray(tags)) return 'Regional';
	var match = null;
	tags.forEach(function (tag) {
		if (match) return;
		var tagNormalized = normalizeText(tag.name);
		var found = regionesList.find(function (r) {
			return normalizeText(r.REGION) === tagNormalized;
		});
		if (found) match = tag.name; // se devuelve el nombre TAL CUAL viene de Ghost (ya con su tilde/mayúscula correcta), no el de regiones.js
	});
	return match || 'Regional';
}

function _createTemplate(foldername, filename) {
	const basePathPartial = path.join(__dirname, '../views/partials/');
	let template = fs.readFileSync(`${basePathPartial}${foldername}/${filename}.hbs`, 'utf-8')
	return template;
}

function parseUrlToDownload(url) {
	if (url && url != null && url != 'null') {
		return `${process.env.URL_PATH_FILES}/${url}`;
	}
	else {
		return '#';
	}
}

function parseClassToDownload(url) {
	if (url && url != '#' && url != null && url != 'null') {
		return 'display:flex';
	} else {
		return 'display:none';
	}

}

function parseClassToDownloadCol(url) {
	if (url && url != '#' && url != null && url != 'null') {
		return 'display:flex';
	} else {
		return 'display:none';
	}
}

var hbs = exphbs.create({
	extname: 'hbs',
	layoutsDir: path.join(__dirname, '../views/layouts'),
	defaultLayout: "default",
	partialsDir: path.join(__dirname, "../views/partials"),
	helpers: {
		t: t,
		parseDate: parseDate,
		parseHttp: parseHttp,
		parseHttpImage: parseHttpImage,
		assets: assets,
		page_url: page_url,
		endpointPostParse: endpointPostParse,
		endpointRebase: endpointRebase,
		endpointRebase2: endpointRebase2,
		parseHour: parseHour,
		setTarget: setTarget,
		parseCategory: parseCategory,
		parseIcon: parseIcon,
		checkHtml: checkHtml,
		createMenu: createMenu,
		page_url_search: page_url_search,
		parseUrlToDownload: parseUrlToDownload,
		parseClassToDownloadCol: parseClassToDownloadCol,
		parseClassToDownload: parseClassToDownload,
		checkTagsVisible: checkTagsVisible,
		ifCond: ifCond,
		parseCategory: parseCategory,
		parseIcon: parseIcon,
		parseRegion: parseRegion,
	}
});

var hbs2 = handlebars.create()
hbs2.registerHelper({
	t: t,
	parseDate: parseDate,
	parseHttp: parseHttp,
	parseHttpImage: parseHttpImage,
	assets: assets,
	page_url: page_url,
	endpointPostParse: endpointPostParse,
	endpointRebase: endpointRebase,
	endpointRebase2: endpointRebase2,
	parseHour: parseHour,
	setTarget: setTarget,
	parseCategory: parseCategory,
	parseIcon: parseIcon,
	checkHtml: checkHtml,
	createMenu: createMenu,
	page_url_search: page_url_search,
	parseUrlToDownload: parseUrlToDownload,
	parseClassToDownloadCol: parseClassToDownloadCol,
	parseClassToDownload: parseClassToDownload,
	checkTagsVisible: checkTagsVisible,
	parseCategory: parseCategory,
	parseIcon: parseIcon,
	parseRegion: parseRegion,
})



hbs2.registerPartial({
	"noticias-eventos-card-head": _createTemplate('noticias-eventos', 'noticias-eventos-card-head'),
	"noticias-eventos-card-body": _createTemplate('noticias-eventos', 'noticias-eventos-card-body'),
	"search-pagination": _createTemplate('noticias-eventos', 'search-pagination')
})


module.exports = { hbs, hbs2 };
