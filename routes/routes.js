const routes=require("express").Router();
const apiGhost=new (require("../api/ghost"));
const { Router } = require("express");
const utils = require("../utils/utils")

routes.use(async(req,res,next)=>{
    res.locals.settings= await apiGhost.getSettings();

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

 routes.get("/contacto",async(req,res)=>{
    const info = req.flash('info')
    console.log("info",info)
    res.render("pages/contacto",{info:info})
 })

 routes.post("/contacto",async(req,res)=>{
    const form = req.body;
    console.log(form);
    const response= await utils.sendEmail(form);
    if (response.success){
        req.flash("info",{style:"alert alert-success alert-dismissible fade show",message:"¡Gracias por contactar al Observatorio!"})
    }else{
        req.flash('info',{style:"alert alert-danger alert-dismissible fade show",message:'Error al enviar el formulario; intentelo de nuevo'});
    }
    res.redirect("/contacto")
 })


module.exports=routes;
