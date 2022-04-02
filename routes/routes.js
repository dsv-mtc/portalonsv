const routes=require("express").Router();
const apiGhost=new (require("../api/ghost"));
const utils = require("../utils/utils");
const passport=require("passport");
const uploader=require("../controllers/multer");
const seo=require("../controllers/seo");
const feedController=new (require("../controllers/feed"));
const gcpUploaderController=require("../controllers/uploader.gcp");
const youtubeApi = new (require("../api/gcp/Youtube"));
const openDataController=new(require("../controllers/opendatasearch"));
require('dotenv').config();

routes.use(async(req,res,next)=>{
   res.locals.settings= await apiGhost.getSettings();
   res.locals.titlesPosts= await apiGhost.getLastFivePostsTitleAndUrl();
   res.locals.seoMetas=await seo.setMetaTags(req.originalUrl);
   if(req.originalUrl.includes("/en/")){
       res.locals.secondary_navigation=true;
       req.url= req.originalUrl.replace("en/","")
       res.locals.lang="en"
    }
    else{
       res.locals.lang="es"
    }
    if(!res.locals.enabledFooter){
        res.locals.enabledFooter=true;
    }
    if(!res.locals.enabledNavigation){
        res.locals.enabledNavigation=true;
    }
    next();
})


routes.get("/",async (req,res)=>{
    const accidents=await utils.getAccidents();
    const post2=await apiGhost.getPosts(4,"tags","tags: [noticias-eventos]");
    const post3=await apiGhost.getPosts(3,"tags,authors","tags:[publicaciones]","published_at DESC");
    const banners=await utils.getImagesFiles('banner');
    const modalinfo= await apiGhost.getModalPosts();
    res.render("index",{post3,post2,accidents,banners,modalinfo});
 })

 
/**NOTICIAS Y EVENTOS */
 routes.get("/noticias-eventos/:page?", async(req,res)=>{  
   const page=req.params.page?req.params.page:1;
     const post=await apiGhost.getPosts(7,"tags,authors","tag:noticias-eventos","published_at DESC",page);
     const pagination = post.meta.pagination;
     pagination.url_page='noticias-eventos';
     res.render("pages/noticias-eventos",{post,pagination});
 })

 /**POSTS */
 /**
  * @description: Retorna el post con el contenido de noticias relacionadas en función del tag primario del post
  */
 routes.get("/post/:slug", async(req,res)=>{
    const post = await apiGhost.getPost(req.params.slug);
    //console.log(post)
    const primary_tag=`tag:${post.primary_tag.slug}`
    const postsRelatives = await apiGhost.getPosts(4,"tags,authors",primary_tag,"published_at DESC");
    res.render("pages/post",{post,postsRelatives});
 })

 /**REGIONES*/
 routes.get("/regiones",async(req,res)=>{
    //general: tags:[noticias-eventos]
    const post = await apiGhost.getPosts(8,"tags,authors","tags:[lima]", "published_at DESC");
    res.render("pages/regiones",{post});
 })

 routes.post("/services-map",async (req,res)=>{
   //TODO es posible que en algunas regiones no existan noticias  y los posts sean vacío
   let regionRequest= req.body['region'];
   if(regionRequest==='San Martín') regionRequest='san-martin';
   if(regionRequest === 'La Libertad') regionRequest = 'la-libertad';
   const lang=req.body['lang']
   const filter=`tags:[${regionRequest}]`;
   const post = await apiGhost.getPosts(8,"tags,authors",filter, "published_at DESC");
   const data=utils.serviceMap(regionRequest,{post,lang})
   res.send(data)
})

/**ANALÍTICA */
 routes.get("/analitica",async(req,res)=>{
   res.locals.enabledNavigation=false;  
   res.locals.enabledFooter=false;
     res.render("pages/analitica")
 })

 /**WEBINARS */
routes.get("/webinars",async(req,res)=>{
  //await youtubeApi.getPlayLists();
  const playlist=await youtubeApi.getItemsFromPlayList(); 
  res.render("pages/webinars",{playlist});
})
 /**SRAT */
 routes.get("/srat", async(req,res)=>{
    res.locals.enabledFooter=false;
    res.locals.enabledNavigation=false;
    res.render("pages/srat");
 })

 /** PERU-WORLD */
 routes.get("/peru-in-world", async(req,res)=>{
   res.locals.enabledFooter=false;
   res.locals.enabledNavigation=false;
   res.render("pages/peru-world");
})
/**PUBLICACIONES */
 routes.get("/publicaciones",async(req,res)=>{
    const post = await apiGhost.getPosts(6,"tags,authors","tags:[publicaciones]","published_at DESC")
    //const tags = await apiGhost.getTags("tags","all");
    const tags=utils.filterTags(post);
    res.render("pages/publicaciones",{post,tags});
 })

 /**NORMAS LEGALES */
 routes.get("/normas-legales",async(req,res)=>{
   const post = await apiGhost.getPosts(6,"tags,authors","tags:[normas-legales]","published_at DESC")
   //const tags = await apiGhost.getTags("tags","all");
   const tags=utils.filterTags(post);
    res.render("pages/normas-legales",{post,tags})
 })

 /**CONTACTO */
 routes.get("/contacto",async(req,res)=>{
    const info = req.flash('info');
    res.render("pages/contacto",{info:info});
 })

 routes.post("/contacto",async(req,res)=>{
    const form = req.body;
      //existe validación desde el backend
    const response= await utils.sendEmail(form);
    if (response.success){
        req.flash("info",{style:"alert alert-success alert-dismissible fade show",message:response.message})
    }else{
        req.flash('info',{style:"alert alert-danger alert-dismissible fade show",message:response.message});
    }
    if(form.lang=='en'){
      res.redirect("/en/contacto")
    }else{
      res.redirect("/contacto")
    }

 })

 /** AULA VIRTUAL */
 routes.get("/aulavirtual",async(req,res)=>{
   res.locals.enabledNavigation=false;  
   res.locals.enabledFooter=false;
   res.render("pages/aula-virtual");
 })

 /** BÚSQUEDA POR TAGS */
 routes.get("/tag/:tag/:page?",async(req,res)=>{
    const tag =req.params.tag;
    const page=req.params.page?req.params.page:1;
    const filter=`tags:[${tag}]`;
    const post = await apiGhost.getPosts(6,'tags,authors',filter,'published_at DESC',page);
    const pagination=post.meta.pagination;
    pagination.url_page=`tag/${tag}`;
    res.render('pages/tags',{tag,post,pagination})
 })

 /**FEED */
 routes.get("/feed",async(req,res)=>{
   const xmlString=await feedController._createFeedXml();
   res.set('Content-Type','application/xml');
   res.send(xmlString)
 })

 /* ZONA DE DATOS ABIERTOS */
 routes.get("/datosabiertos",async (req,res)=>{
   res.locals.enabledFooter=false;
   res.locals.enabledNavigation=false;
   const {categories}=utils.constants;
   let documentsList=[];
   if(process.env.STRATEGY_MODE==='ON_PREMISE'){
      documentsList= await utils.getDocuments();
   }
   if(process.env.STRATEGY_MODE==='GCP'){
      documentsList=await gcpUploaderController.getDocumentsList();
   }

    res.render("pages/datos-abiertos",{categories,documentsList});
 })

 routes.post("/datosabiertos",async (req,res)=>{
    const form = req.body;
    console.log("datos",req.body)
    const lang = req.body['lang'];
   if(process.env.STRATEGY_MODE==='GCP'){
      let result=await openDataController.searchMetadaByGcp(form);
     res.send(result);
   }
   if(process.env.STRATEGY_MODE==='ON_PREMISE'){
     
      let result=await openDataController.searchMetadataByMysql(form);
      console.log(result)
      if(result.success){
         const searchRendered = utils.renderSearchOpenDataTemplate({documentsList:result.posts, lang:lang})
         res.send({success:true, posts:searchRendered});
      }else {
         res.send({success:false});
      }
   }  
 })

 routes.get("/datosabiertos-login",isNotAuthenticated,(req,res)=>{
   const info_login=req.flash('login');
   res.locals.enabledFooter=false;
   res.locals.enabledNavigation=false;
   res.render("pages/datos-abiertos-login",{info_login});
 })

 routes.get("/datosabiertos-logout",(req,res)=>{
    req.logOut(); 
    res.redirect("/datosabiertos-login")
 })

routes.post("/datosabiertos-login",passport.authenticate('local-login',{
   successRedirect:"/datosabiertos-admin",
   failureRedirect:"/datosabiertos-login",
   passReqToCallback:true
}))

routes.get("/datosabiertos-admin",isAuthenticated,(req,res)=>{
   res.locals.enabledFooter=false;
   res.locals.enabledNavigation=false;
   const {categories, types}=utils.constants;
   const info_document = req.flash('document');
   res.render("pages/datos-abiertos-admin",{categories,types,info_document})
 })
 routes.post("/datosabiertos-admin",uploader,async (req,res)=>{
   let response=null;
   if(process.env.STRATEGY_MODE==='GCP'){
      response=await gcpUploaderController.uploadFileAndRegisterMetadata(req)
   }
   if(process.env.STRATEGY_MODE==='ON_PREMISE'){
      response=await utils.saveDocument(req);
   }
   
   if (response.success){
      req.flash("document",{style:"alert alert-success alert-dismissible fade show",message:response.message})
  }else{
      req.flash('document',{style:"alert alert-danger alert-dismissible fade show",message:response.message});
  }
   res.redirect("/datosabiertos-admin")
 })


 function isAuthenticated(req,res,next){
    if(req.isAuthenticated()){
       return next();
    }
    res.redirect('/datosabiertos-login');
    return;
 }

 function isNotAuthenticated(req,res,next){
   if(req.isAuthenticated()){
      res.redirect('/datosabiertos-admin');
      return;
   }
   return next();
   
 }

 /* FIN DE ZONA DE DATOS ABIERTOS */

 /****SEARCH **/
 routes.post("/search",async(req,res)=>{
    const slug = req.body["search"];
   const lang =req.body["lang"];
    const results = await apiGhost.getSearchPosts(`tags:${req.body["filter"]}`,slug);
   // console.log(results)
    if(results.success && req.body['filter']!='noticias-eventos'){
      const searchRendered=utils.renderSearchTemplate({posts: results.posts,lang:lang});
      const tags=utils.filterTags(results.posts);
      const tagsRendered=utils.renderTagTemplate({tags})
      res.send({success:true,posts:searchRendered,tags:tagsRendered});
    }else if(results.success && req.body['filter']=='noticias-eventos'){
     const {page,prev,next,step}=req.body;
      const searchRendered= utils.renderNoticiasEventosTemplate({post:results.posts,lang,keyword:req.body['search'],page,prev,next,step})
      res.send({success:true,posts:searchRendered});
    }else{
      res.send({success:false})
    }
 })
 
//SusCripción
 routes.post("/subscribe",async(req,res)=>{
    const form=req.body;
    const response=await utils.subscribeUser(form);
//     if (response.success){
//       req.flash("document",{style:"alert alert-success alert-dismissible fade show",message:'Usuario suscrito'})
//   }else{
//       req.flash('document',{style:"alert alert-danger alert-dismissible fade show",message:'No se ha podido suscribir al usuario'});
//   }
   if(response.success){
      res.send('Te has suscrito con éxito');
   }else{
      res.send('No te has podido suscribir');
   }

 })

 //SITEMAP
 routes.get('/sitemap',async(req,res)=>{
   const sitemap=seo.createSiteMapV2();
   res.set('Content-Type','application/xhtml+xml');
   res.status(200).send(sitemap);
 })
 
// REDIRECCIÓN DE ERRORES
 routes.use((req,res)=>{
    res.status(404).redirect('/');
 })


module.exports=routes;
