const exphbs=require("express-handlebars");
const path=require("path");
const fs=require("fs");
const moment =require("moment");
const handlebars=require("handlebars");
const dotenv = require('dotenv');

dotenv.config();

moment.defineLocale('es',{
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
function t(lang,text){
    let rawData=fs.readFileSync(path.join(__dirname,`../utils/locales/${lang}.json`))
    let data=JSON.parse(rawData);
    return data[text];
}

function createMenu(menuList,secondary_navigation){
    let htmlMenu="";
    menuList.forEach(menuObj=>{
        const target=setTarget(menuObj.label);
        if(menuObj.label=='analítica' || menuObj.label=='analytics'){
            const tablero=secondary_navigation?'Applications':'Aplicaciones'
            const srat = menuList.find(menu=>{if(menu.label=='srat') return menu});
            const peruWorld = menuList.find(menu=>{if(menu.label=='peru-in-world') return menu});
            const auxTarget=setTarget(srat.label);//SRAT
            const auxTarget2=setTarget(srat.label)
            htmlMenu+=`<li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="menudrop1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${tablero}</a>
                    <div class="dropdown-menu" aria-labelledby="menudrop1">
                        <a class="dropdown-item" href="${menuObj.url}" target="${target}">${menuObj.label}</a>
                        <a class="dropdown-item" href="${srat.url}" target="${auxTarget}">${srat.label}</a>
                        <a class="dropdown-item" href="${peruWorld.url}" target="${auxTarget2}">${peruWorld.label}</a>
                    </div>
                </li>`;
        }else{
            if(menuObj.label=='srat' || menuObj.label=='peru-in-world'){
                return;
            }else{
                htmlMenu+= `<li class="nav-item"><a class="nav-link" href="${menuObj.url}" target="${target}">${menuObj.label}</a></li>`;   
            }
        }

        

    });

    if(secondary_navigation){
        const menu={
            title:'Vial Education',
            urls:{
                url1:"/en/webinars",
                url2:"https://aulavirtual.mtc.gob.pe/seguridadvial/",
               
            },
            labels:{
                label1:"Webinars",
                label2:"Virtual Room"
            }
        }
        htmlMenu+=`<li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="menudrop1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${menu.title}</a>
                        <div class="dropdown-menu" aria-labelledby="menudrop1">
                            <a class="dropdown-item" href="${menu.urls.url1}" target="_self">${menu.labels.label1}</a>
                            <a class="dropdown-item" href="${menu.urls.url2}" target="_blank">${menu.labels.label2}</a>
                        </div>
                    </li>`
    }else{
        const menu={
            title:'Educación Vial',
            urls:{
                url1:"/webinars",
                url2:"https://aulavirtual.mtc.gob.pe/seguridadvial/",
          
            },
            labels:{
                label1:"Webinars",
                label2:"Aula Virtual",
                
            }
        }
        htmlMenu+=`<li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="menudrop1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${menu.title}</a>
                        <div class="dropdown-menu" aria-labelledby="menudrop1">
                            <a class="dropdown-item" href="${menu.urls.url1}" target="_self">${menu.labels.label1}</a>
                            <a class="dropdown-item" href="${menu.urls.url2}" target="_blank">${menu.labels.label2}</a>
                        </div>
                    </li>`
    }
    return htmlMenu;
}

function parseDate(dateString){
    return moment(dateString).format("MMM DD YYYY");
}

function parseHour(dateString,format){
    return moment(dateString).format(format);
}
function parseHttp(urlString){
    const pattern=/^http:/
    if(pattern.test(urlString)){
        return urlString.replace(/http:/,'https:')
    }
    return urlString;
}
function assets(pathImg){
    return  path.join(__dirname,`../public/assets/${pathImg}`);
}
//Usado solo en la paginación
function page_url(url_page,index,lang){
    const url=process.env.URL_PATH
    if(lang=="es"){
        return `${url}/${url_page}/${index}`
    }else{
        return `${url}/${lang}/${url_page}/${index}`
    }

}
function page_url_search(url_page,index,lang,keyword){
    const url=process.env.URL_PATH
    if(lang=="es"){
        return `${url}/${url_page}/${index}?keyword=${keyword}`
    }else{
        return `${url}/${lang}/${url_page}/${index}?keyword=${keyword}`
    }
}

function endpointPostParse(url,lang){
    url=parseHttp(url);
    console.log(url)
    const pattern=process.env.URL_PATH_API
    if(lang=='es'){
        return url.replace(pattern,`${process.env.URL_PATH}/post`);

    }else{
        return url.replace(pattern,`${process.env.URL_PATH}/${lang}/post`);
    }

}

/**
 * @description: Usado para convertir un url tipo (HTTPS) https:w3.onsve.gob.pe/X a localhost/X
 * @param {*} url Endpoint al que apunta originalmente la plataforma
 * @returns  Un url parseado con la url origen de la web
 */
function endpointRebase(url){
    const pattern=process.env.URL_PATH_API
    return url.replace(pattern,`${process.env.URL_PATH}`)
}

/**
 * @description: Usado para convertir un url tipo (HTTP) http:w3.onsve.gob.pe/X a localhost/X
 * @param {*} url Endpoint al que apunta originalmente la plataforma
 * @returns  Un url parseado con la url origen de la web
 */
function endpointRebase2(url){
    const pattern=process.env.URL_PATH_API2;
    return url.replace(pattern,`${process.env.URL_PATH}`)
}

function checkTagsVisible(url){
    if(url.includes('404')){
        return 'display:none';
    }else{
        return '';
    }

}

function setTarget(label){
    if(label=="srat" || label=="analítica"){
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
function checkHtml(htmlString){
    if(htmlString.search('https')==-1){
        return htmlString.replace('http','https');        
    }else{
        return htmlString;
    }

    
}

function parseCategory(categoryValue){
    const categories=[
        {key:"Economía y Finanzas",value:"economia"},
        {key:"Gobernabilidad", value:"gobernabilidad"},
        {key:"Transporte", value:"transporte"},
        {key:"Desarrollo Social", value:"desarrollo-social"},
        {key:"Desarrollo Urbano", value:"desarrollo-urbano"},
        {key:"Educación", value:"educacion"},
        {key:"Medio Ambiente", value:"medio-ambiente"},
        {key:"Salud", value:"salud"},
        {key:"COVID-19", value:"covid"},
        {key:"Energía", value:"energia"},
        {key:"Agua y Saneamiento", value:"agua-saneamiento"},
        {key:"Alimentación y Nutrición", value:"alimentacion-nutricion"},
        
    ];
    let categoryToSend="";
    categories.forEach(category=>{
        if(category.value===categoryValue){
            categoryToSend=category.key;
        }
    })
    return categoryToSend;
}
function parseIcon(categoryValue){
    const iconsList=[
        {key:"far fa-chart-bar",value:"economia"},
        {key:"fas fa-university", value:"gobernabilidad"},
        {key:"fas fa-bus-alt", value:"transporte"},
        {key:"fas fa-users", value:"desarrollo-social"},
        {key:"fab fa-hive", value:"desarrollo-urbano"},
        {key:"fas fa-graduation-cap", value:"educacion"},
        {key:"fas fa-leaf", value:"medio-ambiente"},
        {key:"far fa-hospital", value:"salud"},
        {key:"fas fa-virus", value:"covid"},
        {key:"fas fa-ligthbulb", value:"energia"},
        {key:"fas fa-tint", value:"agua-saneamiento"},
        {key:"fab fa-nutritionix", value:"alimentacion-nutricion"},
        
    ];
    let iconToSend="";
    iconsList.forEach(icon=>{
        if(icon.value===categoryValue){
            iconToSend=icon.key;
        }
    })
    //console.log(iconToSend)
    return iconToSend;
}

function _createTemplate(foldername,filename){
 const basePathPartial=path.join(__dirname,'../views/partials/');
 let template = fs.readFileSync(`${basePathPartial}${foldername}/${filename}.hbs`,'utf-8')
 return template;
}

function parseUrlToDownload(url){
    if(url && url!=null && url!='null'){
        return `${process.env.URL_PATH_FILES}/${url}`;
    }
    else{
        return '#';
    }
}

function parseClassToDownload(url){
    if(url && url!='#' && url!=null && url!='null'){
        return 'display:flex';
    }else{
        return 'display:none';
    }

}

var hbs=exphbs.create({
    extname:'hbs', 
    layoutsDir:path.join(__dirname,'../views/layouts'),
    defaultLayout:"default",
    partialsDir:path.join(__dirname,"../views/partials"),
    helpers:{
        t:t,
        parseDate:parseDate,
        parseHttp:parseHttp,
        assets:assets,
        page_url:page_url,
        endpointPostParse:endpointPostParse,
        endpointRebase:endpointRebase,
        endpointRebase2:endpointRebase2,
        parseHour:parseHour,
        setTarget:setTarget,
        parseCategory:parseCategory,
        parseIcon:parseIcon,
        checkHtml:checkHtml,
        createMenu:createMenu,
        page_url_search:page_url_search,
        parseUrlToDownload:parseUrlToDownload,
        parseClassToDownload:parseClassToDownload,
        checkTagsVisible:checkTagsVisible

    }
});

var hbs2=handlebars.create()
hbs2.registerHelper({
    t:t,
    parseDate:parseDate,
    parseHttp:parseHttp,
    assets:assets,
    page_url:page_url,
    endpointPostParse:endpointPostParse,
    endpointRebase:endpointRebase,
    endpointRebase2:endpointRebase2,
    parseHour:parseHour,
    setTarget:setTarget,
    parseCategory:parseCategory,
    parseIcon:parseIcon,
    checkHtml:checkHtml,
    createMenu:createMenu,
    page_url_search:page_url_search,
    parseUrlToDownload:parseUrlToDownload,
    parseClassToDownload:parseClassToDownload,
    checkTagsVisible: checkTagsVisible
})



hbs2.registerPartial({
    "noticias-eventos-card-head":_createTemplate('noticias-eventos','noticias-eventos-card-head'),
    "noticias-eventos-card-body":_createTemplate('noticias-eventos','noticias-eventos-card-body'),
    "search-pagination":_createTemplate('noticias-eventos','search-pagination')
})


module.exports={hbs,hbs2};
