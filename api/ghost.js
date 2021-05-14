const GhostContentApi=require("@tryghost/content-api");
const {readingTime, tags}=require("@tryghost/helpers");
const utils = require("../utils/utils")
const api=new GhostContentApi({
    url:"https://www.onsv.gob.pe",
    key:"a20fd9a819b97254868897c806",
    version:"v3"
})
class GhostApi {
    
    getPosts=async (limit=0,include="tags",filter="featured:false", order="published_at DESC")=>{
        let posts=[];
        try {
            posts=await api.posts
            .browse({
                filter:filter,
                limit:limit,
                include:include,
                order:order
            })
            .catch(err=>console.log(err))
    
            posts.forEach(post => {
                readingTime(post,{minute: "a hot minute",minutes:"% minutes"})
            });
            const data=posts.forEach(post=>{
                tags(post,{suffix:'.'})
            })
            console.log(data)
                
        } catch (error) {
            console.error(error);
            return posts            
        }
        return posts
    }
    getSettings=async ()=>{
        let settings = await api.settings.browse();
        settings = utils.transformHttps(settings);
        return settings
    }

}

module.exports=GhostApi

