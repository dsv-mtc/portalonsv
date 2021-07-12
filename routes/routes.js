const routes=require("express").Router();
const apiGhost=new (require("../api/ghost"));
const utils = require("../utils/utils");
const passport=require("passport");
const uploader=require("../controllers/multer");


routes.use(async(req,res,next)=>{
    res.locals.settings= await apiGhost.getSettings();
   res.locals.titlesPosts= await apiGhost.getLastFivePostsTitle();
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
    const post3=await apiGhost.getPosts(3);
    res.render("index",{post3,post2,accidents});
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
 routes.get("/post/:slug", async(req,res)=>{
    const post = await apiGhost.getPost(req.params.slug);
    const primary_author=`authors:${post.primary_author.slug}`;
    const postsRelatives = await apiGhost.getPosts(3,"tags,authors",primary_author,"published_at DESC");
    res.render("pages/post",{post,postsRelatives});
 })

 /**REGIONES*/
 routes.get("/regiones",async(req,res)=>{
    const post = await apiGhost.getPosts(8,"tags,authors","tag:noticias-eventos", "published_at DESC");
    res.render("pages/regiones",{post});
 })

 routes.post("/services-map",async (req,res)=>{
   //TODO es posible que en algunas regiones no existan noticias  y los posts sean vacío
   const regionRequest= req.body['region'];
   const lang=req.body['lang']
   const filter=`tags:[${regionRequest}]`;
   const post = await apiGhost.getPosts(8,"tags,authors",filter, "published_at DESC");
   const data=utils.serviceMap(regionRequest,{post,lang})
   res.send(data)
})

/**ANALÍTICA */
 routes.get("/analitica",async(req,res)=>{
     res.locals.enabledFooter=false;
     res.render("pages/analitica")
 })

 /**SRAT */
 routes.get("/srat", async(req,res)=>{
    res.locals.enabledFooter=false;
    res.locals.enabledNavigation=false;
    res.render("pages/srat");
 })
/**PUBLICACIONES */
 routes.get("/publicaciones",async(req,res)=>{
    const post = await apiGhost.getPosts(6,"tags,authors","tags:[publicaciones]","published_at DESC")
    const tags = await apiGhost.getTags("tags","all");
    res.render("pages/publicaciones",{post,tags});
 })

 /**NORMAS LEGALES */
 routes.get("/normas-legales",async(req,res)=>{
   const post = await apiGhost.getPosts(6,"tags,authors","tags:[normas-legales]","published_at DESC")
   const tags = await apiGhost.getTags("tags","all");
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
    console.log(form);
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

 /* ZONA DE DATOS ABIERTOS */
 routes.get("/datosabiertos",async (req,res)=>{
   res.locals.enabledFooter=false;
   res.locals.enabledNavigation=false;
   const {categories}=utils.constants;
   const documentsList= await utils.getDocuments();
    res.render("pages/datos-abiertos",{categories,documentsList})
 })

 routes.post("/datosabiertos",(req,res)=>{
    const form = req.body;
    console.log(form);
    res.send("ok");
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
   const response=await utils.saveDocument(req);
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
    res.redirect('/datosabiertos-login')
 }

 function isNotAuthenticated(req,res,next){
   if(req.isAuthenticated()){
      res.redirect('/datosabiertos-admin');
   }
   return next();
   
 }

 /* FIN DE ZONA DE DATOS ABIERTOS */

 routes.post("/search",async(req,res)=>{
    const slug = req.body["search"];
   const lang =req.body["lang"];
    const results = await apiGhost.getSearchPosts(`tags:${req.body["filter"]}`,slug);
    if(results.success){
      res.render("partials/search-results",{posts: results.posts,lang:lang, layout:false});
    }else{
      res.send(results.success)
    }

 })

 

//SusCripción
 routes.post("/subscribe",async(req,res)=>{
    const form=req.body;
    const response=await utils.subscribeUser(form)
    console.log(response);
    res.send(response);
 })
 


module.exports=routes;
