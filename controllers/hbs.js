const exphbs=require("express-handlebars");
const path=require("path");
const fs=require("fs");
const moment =require("moment");
const { parse } = require("dotenv");

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

function page_url(url_page,index){
    const url=process.env.URL_PATH
    return `${url}/${url_page}/${index}`
}

function endpointPostParse(url){
    const pattern=process.env.URL_PATH_API
    return url.replace(pattern,`${process.env.URL_PATH}/post`)
}

function endpointRebase(url){
    const pattern=process.env.URL_PATH_API
    return url.replace(pattern,`${process.env.URL_PATH}`)
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
        parseHour:parseHour
    }
});

module.exports=hbs;
