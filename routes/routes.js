const routes=require("express").Router();
const apiGhost=new (require("../api/ghost"));
const utils = require("../utils/utils");
const passport=require("passport");

routes.use(async(req,res,next)=>{
    res.locals.settings= await apiGhost.getSettings();
    res.locals.allTags=await apiGhost.getTagsTitles();
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

 routes.get("/noticias-eventos/:page?", async(req,res)=>{  
   const page=req.params.page?req.params.page:1;
     const post=await apiGhost.getPosts(7,"tags,authors","tag:noticias-eventos","published_at DESC",page);
     const pagination = post.meta.pagination;
     pagination.url_page='noticias-eventos';
     res.render("pages/noticias-eventos",{post,pagination});
 })

 routes.get("/post/:slug", async(req,res)=>{
    const post = await apiGhost.getPost(req.params.slug);
    const primary_author=`authors:${post.primary_author.slug}`;
    const postsRelatives = await apiGhost.getPosts(3,"tags,authors",primary_author,"published_at DESC");
    res.render("pages/post",{post,postsRelatives});
 })

 routes.get("/regiones",async(req,res)=>{
    const post = await apiGhost.getPosts(8,"tags,authors","tag:noticias-eventos", "published_at DESC");
    res.render("pages/regiones",{post});
 })

 routes.get("/analitica",async(req,res)=>{
     res.locals.enabledFooter=false;
     res.render("pages/analitica")
 })

 routes.get("/srat", async(req,res)=>{
    res.locals.enabledFooter=false;
    res.locals.enabledNavigation=false;
    res.render("pages/srat");
 })

 routes.get("/publicaciones",async(req,res)=>{
    const post = await apiGhost.getPosts(6,"tags,authors","tags:[publicaciones]","published_at DESC")
    const tags = await apiGhost.getTags("tags","all");
    res.render("pages/publicaciones",{post,tags});
 })

 routes.get("/normas-legales",async(req,res)=>{
   const post = await apiGhost.getPosts(6,"tags,authors","tags:[normas-legales]","published_at DESC")
   const tags = await apiGhost.getTags("tags","all");
    res.render("pages/normas-legales",{post,tags})
 })

 routes.get("/contacto",async(req,res)=>{
    //await apiMailChimp.getAllLists();
    //await apiMailChimp.getSegment("aebee11048")
    const info = req.flash('info')
    res.render("pages/contacto",{info:info})
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

 /* ZONA DE DATOS ABIERTOS */
 routes.get("/datosabiertos",(req,res)=>{
   res.locals.enabledFooter=false;
   res.locals.enabledNavigation=false;
    res.render("pages/datos-abiertos")
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
   const {categories, types}=utils.constants
   res.render("pages/datos-abiertos-admin",{categories,types})
 })
 routes.post("/datosabiertos-admin",(req,res)=>{
   res.send("hola2");
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

 routes.post("/services-map",async (req,res)=>{
    //TODO es posible que en algunas regiones no existan noticias  y los posts sean vacío
    const regionRequest= req.body['region'];
    const lang=req.body['lang']
    const filter=`tags:[noticias-eventos,${regionRequest}]`;
    const post = await apiGhost.getPosts(8,"tags,authors",filter, "published_at DESC");
    
    const data=utils.serviceMap(regionRequest,{post,lang})
    res.send(data)
 })

 routes.post("/subscribe",async(req,res)=>{
    const form=req.body;
    const response=await utils.subscribeUser(form)
    console.log(response);
    res.send(response);
 })
 


module.exports=routes;
