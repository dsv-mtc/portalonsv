const { SitemapStream, streamToPromise } = require( 'sitemap' );
const { Readable } = require( 'stream' );
const {canonicals, canonical_description}= require('../utils/canonicals_urls');
const apiGhost=new (require("../api/ghost"));
//protocols: https://www.sitemaps.org/protocol.html

const _createUrls=()=>{
    let canonicalUrls=[...canonicals];
    let urls=[];
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
    setMetaTags
}