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
	menuList.forEach(menuObj => {
		const target = setTarget(menuObj.label);
		const addColor = getMenuSelected(url_selected, menuObj.label)

		//inicio //home
		if (menuObj.label == 'inicio' || menuObj.label == 'home') {
			const menu = {
				title: secondary_navigation ? 'WHO ARE WE' : 'QUIENES SOMOS',
				urls: {
					url1: "/quienes-somos"

				},
				labels: {
					label1: secondary_navigation ? 'What is ONSV' : "QUIENES SOMOS"
				}
			}

			const tablero = secondary_navigation ? 'home' : 'inicio'

			htmlMenu += `
			<li class="nav-item nav-special ${addColor}">
				<a 
					class="nav-link" 
					href="${menuObj.url}" 
					target="${target}"
				>
					<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
						<path id="homeSVGPath"
							d="M 12 2 A 1 1 0 0 0 11.289062 2.296875 L 1.203125 11.097656 A 0.5 0.5 0 0 0 1 11.5 A 0.5 0.5 0 0 0 1.5 12 L 4 12 L 4 20 C 4 20.552 4.448 21 5 21 L 9 21 C 9.552 21 10 20.552 10 20 L 10 14 L 14 14 L 14 20 C 14 20.552 14.448 21 15 21 L 19 21 C 19.552 21 20 20.552 20 20 L 20 12 L 22.5 12 A 0.5 0.5 0 0 0 23 11.5 A 0.5 0.5 0 0 0 22.796875 11.097656 L 12.716797 2.3027344 A 1 1 0 0 0 12.710938 2.296875 A 1 1 0 0 0 12 2 z" />
					</svg>
				</a>
			</li>
			<li 
				class="nav-item nav-special dropdown"
			>
				<a 
					class="nav-link dropdown-toggle" 
					href="#" 
					id="menudrop1" 
					role="button" 
					data-toggle="dropdown" 
					aria-haspopup="true" 
					aria-expanded="false"
				>
					${tablero}
				</a>
				<div 
					class="dropdown-menu" 
					aria-labelledby="menudrop1"
				>
					<a 
						class="dropdown-item" 
						href="${secondary_navigation ? "/en" : ""}${menu.urls.url1}" 
						target="_self"
					>
						${menu.labels.label1}
					</a>
				</div>
			</li>`;

			return;
		}
		// terminos de home

		if (menuObj.label == 'analítica' || menuObj.label == 'analytics') {
			const tablero = secondary_navigation ? 'Applications' : 'Aplicaciones'
			const srat = menuList.find(menu => { if (menu.label == 'srat') return menu });
			const peruWorld = menuList.find(menu => { if (menu.label == 'peru-in-world') return menu });
			const datosabiertosurl = "/datosabiertos";
			const auxTarget = setTarget(srat.label);//SRAT
			const auxTarget2 = setTarget(srat.label)
			htmlMenu += `
				<li class="nav-item nav-special dropdown">
					<a class="nav-link dropdown-toggle" href="#" id="menudrop1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${tablero}</a>
					<div class="dropdown-menu" aria-labelledby="menudrop1">
						<a class="dropdown-item" href="${menuObj.url}" target="${target}">${menuObj.label}</a>
						<a class="dropdown-item" href="${srat.url}" target="${auxTarget}">${srat.label}</a>
						<a class="dropdown-item" href="${datosabiertosurl}" target="${auxTarget2}">datos abiertos</a>
					</div>
				</li>`;
			return;
		}
		
		if (menuObj.label == 'noticias y eventos' || menuObj.label == 'news and events') {
			const tablero = secondary_navigation ? 'Comunications' : 'Comunicaciones'
			const news = {
				label: secondary_navigation ? 'News' : 'Noticias',
				url: secondary_navigation ? '/en/comunicaciones/noticias' : '/comunicaciones/noticias'
			}
			const campaing = {
				label: secondary_navigation ? 'Campaing' : 'Campaña',
				url: secondary_navigation ? '/en/comunicaciones/campania' : '/comunicaciones/campanias'
			}
			const events = {
				label: secondary_navigation ? 'Events' : 'Eventos',
				url: secondary_navigation ? '/en/comunicaciones/eventos' : '/comunicaciones/eventos'
			}
			const pressRelease = {
				label: secondary_navigation ? 'Press release' : 'Nota de prensa',
				url: secondary_navigation ? '/en/comunicaciones/nota-prensa' : '/comunicaciones/nota-prensa'
			}
			const interview = {
				label: secondary_navigation ? 'Interview' : 'Entrevista',
				url: secondary_navigation ? '/en/comunicaciones/entrevistas' : '/comunicaciones/entrevistas'
			}
			htmlMenu += `
				<li class="nav-item nav-special dropdown">
					<a 
						class="nav-link dropdown-toggle" 
						role="button" 
						data-toggle="dropdown" 
						aria-haspopup="true" 
						aria-expanded="false"
					>
						${tablero}
					</a>
					<div class="dropdown-menu" aria-labelledby="menudrop1">
						<a class="dropdown-item" href="${news.url}">${news.label}</a>
						<a class="dropdown-item" href="${pressRelease.url}">${pressRelease.label}</a>
						<a class="dropdown-item" href="${campaing.url}">${campaing.label}</a>
						<a class="dropdown-item" href="${events.url}">${events.label}</a>
						<a class="dropdown-item" href="${interview.url}">${interview.label}</a>
					</div>
				</li>`;
			return;
		} 
		
		if (menuObj.label == 'srat' || menuObj.label == 'peru-in-world') {
			return;
		} 

		htmlMenu += `
			<li class="nav-item nav-special ${addColor}">
				<a class="nav-link" href="${menuObj.url}" target="${target}">
					${menuObj.label}
				</a>
			</li>
		`;

	});

	if (secondary_navigation) {
		const menu = {
			title: 'Vial Education',
			urls: [
				{
					link: "/en/webinars",
					label: "Webinars",
					target: "_self",
				},
				{
					link: "/en/capacitaciones",
					label: "Trainings",
					target: "_self",
				},
				{
					link: "https://aulavirtual.mtc.gob.pe/seguridadvial/",
					label: "Virtual Room",
					target: "_blank",
				},
				{
					link: "/en/peru-in-world/",
					label: "PERU-IN-world",
					target: "_blank",
				}
			]
		}
		htmlMenu += `
			<li class="nav-item dropdown ${getMenuSelected(url_selected)}">
				<a class="nav-link dropdown-toggle" href="#" id="menudrop1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${menu.title}</a>
				<div class="dropdown-menu" aria-labelledby="menudrop1">
					${
						menu.urls
							.map(url => 
								`<a class="dropdown-item" href="${url.link}" target="${url.target}">${url.label}</a>`
							)
							.join('')
					}
				</div>
			</li>
		`
	} else {
		const menu = {
			title: 'Educación Vial',
			urls: [
				{
					link: "/webinars",
					label: "Webinars",
					target: "_self",
				},
				{
					link: "/capacitaciones",
					label: "Capacitaciones",
					target: "_self",
				},
				{
					link: "https://aulavirtual.mtc.gob.pe/seguridadvial/",
					label: "Aula Virtual",
					target: "_blank",
				},
				{
					link: "/peru-in-world/",
					label: "peru-in-world",
					target: "_blank",
				}
			],
		}
		htmlMenu += `
			<li class="nav-item ${getMenuSelected2(url_selected)} dropdown">
				<a class="nav-link dropdown-toggle" href="#" id="menudrop1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${menu.title}</a>
				<div class="dropdown-menu" aria-labelledby="menudrop1">
					${
						menu.urls
							.map(url =>
								`<a class="dropdown-item" href="${url.link}" target="${url.target}">${url.label}</a>`
							)
							.join('')
					}
				</div>
			</li>
		`
	}
	return htmlMenu;
}

function getMenuSelected2(url_selected) {
	if (url_selected === '/webinars') {
		return "add-color"
	}
	if (url_selected === '/capacitaciones') {
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
		ifCond: ifCond
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
	checkTagsVisible: checkTagsVisible
})



hbs2.registerPartial({
	"noticias-eventos-card-head": _createTemplate('noticias-eventos', 'noticias-eventos-card-head'),
	"noticias-eventos-card-body": _createTemplate('noticias-eventos', 'noticias-eventos-card-body'),
	"search-pagination": _createTemplate('noticias-eventos', 'search-pagination')
})


module.exports = { hbs, hbs2 };
