
const {canonicals, canonical_description}= require('../utils/canonicals_urls');
const logger = require('./logger');
const apiGhost=new (require("../api/ghost"));
const sitemap=require('express-sitemap');
const {hbs2}= require("./hbs");
const fs=require('fs');
const path=require('path');

//protocols: https://www.sitemaps.org/protocol.html


const _modifyUrl=(url)=>{
    const urlModified=url.replace(/https?:\/\//,'')
    return urlModified;
}

const createSiteMapV2=()=>{
    sites=[];
    let canonicalUrls=[...canonicals];
    sites=canonicalUrls.map(cannonicalUrl=>{
        let element={}
        element.url=`${process.env.URL_PATH}${cannonicalUrl.url}`;
        element.changefreq=`${cannonicalUrl.changefreq}`;
        element.priority=`${cannonicalUrl.priority}`;
        element.alternate=`${process.env.URL_PATH}${cannonicalUrl.links[1].url}`
        return element;
    })
    let template=fs.readFileSync(path.join(__dirname,"../views/pages/sitemap.hbs"),'utf-8');
    let compiled=hbs2.compile(template);
    return compiled({sites});
}

const createSiteMapV1=async()=>{
    _modifyUrl(process.env.URL_PATH)
    let canonicalUrls=[...canonicals];
    let urls=[];
    const siteMapOptions={
        http:`${process.env.PROTOCOL_HTTP}`, 
        url:_modifyUrl(process.env.URL_PATH),
        map:{},
        route:{}
    };

    canonicalUrls.forEach(cannonicalUrl=>{
        siteMapOptions.map[`${cannonicalUrl.url}`]=cannonicalUrl.httpProtocol;
        siteMapOptions.route[`${cannonicalUrl.url}`]={
            changefreq:cannonicalUrl.changefreq,
            priority:cannonicalUrl.priority,
            
        }
    });
     //const sitemap=await seo.createSiteMapV1(); 
    //sitemap.XMLtoWeb(res);
    return sitemap(siteMapOptions);
}

const setMetaTags=async(url)=>{
    let metaTags={description:null,url:null, title:null};
    canonical_description.forEach(canonicalUrl=>{
        if(url.includes(canonicalUrl.url) && !url.includes('/tag/')) metaTags=canonicalUrl; 
    });
    if(/\/post\//.test(url)){
        const slug=url.split('/')[2];
        const data=await apiGhost.getTitleAndExcerptBySlug(slug);
        metaTags.url=url;
        metaTags.title=`ONSV - ${data.title}`;
        metaTags.description=data.excerpt?data.excerpt:(data.custom_excerpt?data.custom_excerpt:'');
    }
    
    if(/\/tag\//.test(url)){
        const tag=url.split('/')[2];
        const data= await apiGhost.getTitleAndExcerptByTag(tag)
        metaTags.url=url;
        metaTags.title=`ONSV - ${data.slug}`;
        metaTags.description=data.description?data.description:data.slug;
    }
    if(!metaTags.description) metaTags=canonical_description.find(canonicalUrl=>canonicalUrl.url=='/')
    //console.log(metaTags);
    return metaTags
}
module.exports= {
    createSiteMapV1,
    createSiteMapV2,   
    setMetaTags
}