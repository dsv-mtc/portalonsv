const axios = require("axios").default;
const regions=require("./regiones");
const {hbs2}= require("../controllers/hbs");
const fs=require("fs");
const path= require("path");
const apiMailChimp=new (require("../api/mail-chimp"));
const CryptoJs= require("crypto-js")
const  DataBase=require("../api/mysql");
const mysqlClient=new DataBase();
const os = require("os");

mysqlClient.setQuery()

const transformHttps=(element)=>{
    const patttern = /^http:/ 
    Object.keys(element).forEach(function(key){
        if(patttern.test(element[key])){
            element[key]= element[key].replace(/http:/,'https:')
        }
     })
    return element
}
const filterTags=(posts)=>{
    let tagsWithOutFilter=[];
    let tagsFiltered=[];
    posts.forEach(post=>{
        post.tags.forEach(tag=>{
            const auxTag={name:tag.name,url:tag.url}
            tagsWithOutFilter.push(auxTag);
        })
    });
    //reference: https://dev.to/marinamosti/removing-duplicates-in-an-array-of-objects-in-js-with-sets-3fep
    tagsFiltered=Array.from(new Set(tagsWithOutFilter.map(tag=>tag.name))).map(name=>{
        return tagsWithOutFilter.find(tag=>tag.name==name)
    })
    return tagsFiltered
}

const getAccidents=async ()=>{
    let accidents=[]
    try {
        let results= await (await axios.get("https://sratma.mtc.gob.pe/WSSRATMA/api/Mapa/listarUltimosDiezAccidentes")).data;
        let accidents_raw= results['lista_accidentes']['accidentes'];
        accidents_raw.forEach((accident)=>{
            let accident_raw={}
            for(const property in accident){
                if(accident[property]!=null){
                    accident_raw[property]=accident[property];
                }else{
                    accident_raw[property]='- -';
                }
            }
            accident['vehiculos-lista']=accident['vehiculos'].map(vehiculo=>{
                return vehiculo['tipovehiculo'];
            }).toString();
            accident['descripcion-lista'] = accident['consecuencias'].map(consecuencias=>{
                return consecuencias['descripcion']
            }).toString();
            accidents.push(accident)
        })
        return accidents;        
    } catch (error) {
        console.error(error);
        return accidents;
    }

}
/**
 * @description: Método empleado para el envío de formulario de la zona de contacto
 * @param {*} form : Objeto  de la forma {nombre:String, correo:String, asunto:String, mensaje:String}
 * @returns Un objeto {succes:bool, message:String}
 */
const sendEmail= async (form)=>{
    const cuerpo={nombre:form.nombre,email:form.mail,subject:form.subject,text:form.text}
    let message="";
    try {
        if(validationForm(cuerpo)){
            await axios.post("https://www.onsv.gob.pe/api/contact",cuerpo);
            if(form.lang=='en'){
                message="Thank you for contact to Observatory"
            }else{
                message="¡Gracias por contactar al Observatorio!"
            }
            
            return {success:true,message:message}
    
        }else{
            if(form.lang=='en'){
                message="Some fields are wrong, try again"
            }else{
                message="Algunos campos están mal, inténtalo de nuevo"
            }
            console.log("no se envía el correo")
            return {success:false, message:message}
        }
    } catch (error) {
        console.error(error);
        if(form.lang=='en'){
            message="something went wrong, try again"
        }else{
            message="Algo salió mal, inténtalo de nuevo"
        }
        return {success:false, message:message}
    }
}

const validationForm=(form)=>{
    const emailPattern=/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(form.nombre=='' || form.email=='' || form.subject=='' || form.text=='' ||  !emailPattern.test(form.email)){
        return false;
    }
    return true;
}   

const deleteDiacritics= (text)=>{
    return text
    .normalize('NFD')
    .replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,"$1")
    .normalize();
}

const serviceMap=(region,dataGhost)=>{
    let data={regionData:{},template:''}
    let condicion = region;
    if(condicion ==='san-martin') region='SAN MARTIN';
    if(condicion ==='la-libertad') region='LA LIBERTAD';
    region=deleteDiacritics(region).toUpperCase();
    //console.log(region)
    regions.REGIONES.forEach(x=>{
        //console.log(x.REGION,region)
        if(x.REGION==region){
            data.regionData =x;
        }})
    data.template = renderCarouselRegions(dataGhost) ;
    return data;
}

const renderCarouselRegions=(data)=>{
    let template =fs.readFileSync(path.join(__dirname,"../views/partials/regiones/carousel-regions.hbs"),'utf-8')
    let compiled=hbs2.compile(template);
    return compiled(data);
}

const renderSearchTemplate=(data)=>{
    let template = fs.readFileSync(path.join(__dirname,"../views/partials/search-results.hbs"),'utf-8');
    let compiled=hbs2.compile(template);
    return compiled(data);
}
const renderTagTemplate=(data)=>{
    let template = fs.readFileSync(path.join(__dirname,"../views/partials/sidebar-widgets/tags.hbs"),'utf-8');
    let compiled=hbs2.compile(template);
    return compiled(data);
}
const _createPagination=(itemsPerPage,totalItems,page,step)=>{
    //console.log(page,step)
    let pagination={page:1,limit:1,pages:1,total:1,next:2,prev:null}
    if(itemsPerPage>=totalItems.length){
        pagination.limit=itemsPerPage;
        pagination.total=totalItems.length;
        pagination.next=null;
    }else{
        pagination.limit=itemsPerPage;
        pagination.total=totalItems.length;
        pagination.page=page?(step=='next'?(page+1):(page-1)):1;//A la página que se desea ir
        pagination.prev=pagination.page==1?pagination.prev:(pagination.page-1)
        pagination.pages=Math.round(totalItems.length/itemsPerPage)+1
        pagination.next=pagination.page>=pagination.pages?null:(pagination.page+1)
    }

    return pagination;
}

const _resizeLengthPosts=(size,posts,page,step)=>{
    console.log('pagina',page,step)
    const minIndex=page?(step=='next'?page*size:(page-2)*size):0;
    const maxIndex=page?(step=='next'?(page+1)*size:(page-1)*size):size;
    console.log(minIndex,maxIndex)
    if(posts.length>size){
        let postsFiltereds= posts.filter((element,index)=>{
            if(minIndex<=index && index<maxIndex){
                return element;
            }
        })
        //referencia: https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        return postsFiltereds.sort((a,b)=>{
            return new Date(b.created_at)-new Date(a.created_at)
        })
    }
    return posts
}

const renderNoticiasEventosTemplate=(data)=>{
    console.log(data.prev,data.page,data.next)
    let template = fs.readFileSync(path.join(__dirname,"../views/partials/noticias-eventos/search-noticias-eventos.hbs"),'utf-8');
    data.pagination=_createPagination(7,data.post,data.page,data.step);
    data.post=_resizeLengthPosts(7,data.post,data.page,data.step);
    let compiled=hbs2.compile(template);
    data.pagination.url_page='search';
    data.pagination.keyword=data.keyword;
    return compiled(data);
}

/**
 * @description Método utilizado al momento de la suscripción del usuario a la plataforma, el método conecta con la APi
 * de MailChimp suscribiendolo a la audiencia por defecto agregando los tags suscritos; Si el usuario existe se actualiza su información de tags, sino
 * Se le suscribe con el valor del formulario.
 * @param {*} form Objeto de la forma {email:String, name:String, lastname:String}
 * @returns 
 */
const subscribeUserWithTags=async (form)=>{  
    const subscriber_hash=CryptoJs.MD5(form.email).toString() //mailchimp require md5 hash 
    const responseGetMember=await apiMailChimp.getMemberFromList(subscriber_hash)
    if(responseGetMember.success){
       return apiMailChimp.updateTagsFromMemberInList(subscriber_hash,form.name);
    }else{
        return apiMailChimp.addMemberToList(form); 
    } 

}
/**
 * @description Método utilizado al momento de la suscripción del usuario a la plataforma, el método conecta con la APi
 * de MailChimp suscribiendolo a la audiencia por defecto; Si el usuario existe se actualiza su información de tags, sino
 * Se le suscribe con el valor del formulario.
 * @param {*} form Objeto de la forma {email:String, name:String, lastname:String}
 * @returns 
 */
const subscribeUser=async (form)=>{ 
    const subscriber_hash=CryptoJs.MD5(form.email).toString() //mailchimp require md5 hash 
    const responseGetMember=await apiMailChimp.getMemberFromList(subscriber_hash)
    if(responseGetMember.success){
       return {success:true,message:'User already subscribe'}
    }else{
        return apiMailChimp.addMemberToList(form); 
    } 

}

const unSubscribeUser=async()=>{
    console.log("método desconocido")
}

const saveDocument=async(request)=>{
    const files_name=['excel-file','csv-file','pdf-file'];
    let data = {...request.body}
    // console.log(data);
    files_name.forEach(name=>{
        const folder=name.split("-")[0];
        if(name in request.files){
            const localFilePath=`../../docs_uploaded/${folder}/${request.files[name][0].originalname}`
            //const filePath=path.join(__dirname,localFilePath).replace(/\\/g,"/");
            const filePath=localFilePath;
            Object.defineProperty(data,`${folder}file`,{
                value:filePath,
                writable:true,
                enumerable:true,
                configurable:true
            })
            //data[`${folder}file`]=path.join(__dirname,filePath)
        }else{
            Object.defineProperty(data,`${folder}file`,{
                value:null,
                writable:true,
                enumerable:true,
                configurable:true
            })
        }

    })
    return  mysqlClient.saveDocument(data);
}

const getDocuments=async()=>{
    const response = await mysqlClient.getDocuments();
    console.log(response)
    if(response.success){
        return response.data;
    }else{
        return null;
    }
}

const getImagesFiles=async(prefixName)=>{
    const imageFilesName=await fs.promises.readdir(path.join(__dirname,`../public/assets/`));
    const imagesRequest=imageFilesName.filter(filename=>{
        if(filename.match(prefixName)) return filename
    })
    return imagesRequest;
}


const getHost=()=>{
    console.log(os.networkInterfaces());
}


const constants={
    categories:[
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
        
    ],
    types:[
        {key:"Recurso",value:"recurso"},
        {key:"Dataset",value:"dataset"},
        {key:"Grupo",value:"grupo"},
        {key:"Harvest Source",value:"harvest-source"},
        {key:"Página",value:"pagina"},
        {key:"Data Dashboard",value:"dashboard"},
    ]
}
module.exports ={
    transformHttps:transformHttps,
    getAccidents:getAccidents,
    sendEmail: sendEmail,
    deleteDiacritics:deleteDiacritics,
    serviceMap:serviceMap,
    renderCarouselRegions:renderCarouselRegions,
    subscribeUser:subscribeUser,
    unSubscribeUser:unSubscribeUser,
    constants:constants,
    saveDocument:saveDocument,
    getDocuments:getDocuments,
    filterTags:filterTags,
    renderSearchTemplate:renderSearchTemplate,
    renderTagTemplate:renderTagTemplate,
    renderNoticiasEventosTemplate:renderNoticiasEventosTemplate,
    getImagesFiles:getImagesFiles,
    getHost:getHost
}