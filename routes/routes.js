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

 routes.get("/noticias-eventos", async(req,res)=>{
     const post=await apiGhost.getPosts(10,"tags,authors","tags: [noticias-eventos]");
     console.log(post)
     res.render("pages/noticias-eventos",{post});
 })

module.exports=routes;
