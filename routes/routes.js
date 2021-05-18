const routes=require("express").Router();
const apiGhost=new (require("../api/ghost"));
const { Router } = require("express");
const utils = require("../utils/utils")

routes.use(async(req,res,next)=>{
    res.locals.settings= await apiGhost.getSettings();
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
     pagination.url_page='noticias-eventos'
     res.render("pages/noticias-eventos",{post,pagination});
 })

 routes.get("/post/:slug", async(req,res)=>{
    const post = await apiGhost.getPost(req.params.slug);
    const primary_author=`authors:${post.primary_author.slug}`;
    const postsRelatives = await apiGhost.getPosts(3,"tags,authors",primary_author,"published_at DESC");
    res.render("pages/post",{post,postsRelatives});
 })

 routes.get("/regiones",async(req,res)=>{
    const post = await apiGhost.getPosts(8,"tags,authors","tag:noticias-eventos", "published_at DESC")
    console.log(post[0])
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
    res.render("pages/normas-legales")
 })

 routes.get("/contacto",async(req,res)=>{
    const info = req.flash('info')
    res.render("pages/contacto",{info:info})
 })

 routes.post("/contacto",async(req,res)=>{
    const form = req.body;
    //TODO validar formulario desde el backend
    console.log(form);
    const response= await utils.sendEmail(form);
    if (response.success){
        req.flash("info",{style:"alert alert-success alert-dismissible fade show",message:"¡Gracias por contactar al Observatorio!"})
    }else{
        req.flash('info',{style:"alert alert-danger alert-dismissible fade show",message:'Error al enviar el formulario; intentelo de nuevo'});
    }
    res.redirect("/contacto")
 })

 routes.post("/search",async(req,res)=>{
    const slug = req.body["search"]
    res.locals.enabledFooter=false;
    res.locals.enabledNavigation=false;
    const results = await apiGhost.getSearchPosts(`tags:${req.body["filter"]}`,slug);
    if(results.success){
      res.render("partials/search-results",{posts: results.posts, layout:false});
    }else{
      res.send(results.success)
    }

 })
 


module.exports=routes;
