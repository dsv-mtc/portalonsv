const exphbs=require("express-handlebars");
const path=require("path");
const fs=require("fs");
const moment =require("moment");
const handlebars=require("handlebars");


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
//Usado solo en la paginación
function page_url(url_page,index,lang){
    const url=process.env.URL_PATH
    if(lang=="es"){
        return `${url}/${url_page}/${index}`
    }else{
        return `${url}/${lang}/${url_page}/${index}`
    }

}

function endpointPostParse(url){
    const pattern=process.env.URL_PATH_API
    return url.replace(pattern,`${process.env.URL_PATH}/post`)
}

function endpointRebase(url){
    const pattern=process.env.URL_PATH_API
    return url.replace(pattern,`${process.env.URL_PATH}`)
}

function setTarget(label){
    if(label=="srat"){
        return "_blank"
    }
    return "_self"
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
            console.log("entre")
            iconToSend=icon.key;
        }
    })
    console.log(iconToSend)
    return iconToSend;
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
        parseHour:parseHour,
        setTarget:setTarget,
        parseCategory:parseCategory,
        parseIcon:parseIcon
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
    parseHour:parseHour,
    setTarget:setTarget,
    parseCategory:parseCategory,
    parseIcon:parseIcon
})


module.exports={hbs,hbs2};
