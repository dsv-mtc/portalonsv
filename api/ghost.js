const GhostContentApi=require("@tryghost/content-api");
const {readingTime, tags}=require("@tryghost/helpers");
const utils = require("../utils/utils");
const MiniSearch = require("minisearch");
const api=new GhostContentApi({
    url:"https://www.onsv.gob.pe",
    key:"a20fd9a819b97254868897c806",
    version:"v3"
})
class GhostApi {
    
    getPosts=async (limit=0,include="tags",filter="featured:false", order="published_at DESC",page=1)=>{
        let posts=[];
        try {
            posts=await api.posts
            .browse({
                filter:filter,
                limit:limit,
                include:include,
                order:order,
                page:page
            })
            .catch(err=>console.log(err))
    
            posts.forEach(post => {
                readingTime(post,{minute: "a hot minute",minutes:"% minutes"})
            });
            posts.forEach(post=>{
                tags(post,{suffix:'.'})
            })
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
    getPost=async (slug)=>{
        return api.posts.read({slug:slug},{include:['tags','authors']},{formats:['html','plaintext']})
    }

    getTags=async (include,limit)=>{
        return api.tags.browse({
            include:include,
            limit:limit,
            
        });
    }
    getTagsTitles=async()=>{
        return api.tags.browse({
            limit:"all",
            fields:['name','id']
        })
    }
    getSearchPosts=async(filter,slug)=>{
        let posts=[];
        let miniSearch = new MiniSearch({
            fields:['title'],
            storeFields:['id']
        })
        let resultsRaw= [];
        resultsRaw = await  api.posts.browse({
            limit:"all",
            filter:filter,
            include:['tags','authors']
            //fields:"id,title"
        })
        miniSearch.addAll(resultsRaw);
        let searchResults = miniSearch.search(slug,{fuzzy:0.2});
        if(searchResults.length==0){
            let suggestions=miniSearch.autoSuggest(slug,{fuzzy:0.2});
            console.log("suggestions",suggestions)
            if(suggestions.length==0){
                return {success:false, posts:posts};
            }
            else{
                searchResults = miniSearch.search(suggestions[0].suggestion,{fuzzy:0.2});
            }
        }
        searchResults.forEach(element=>{
        let aux=resultsRaw.find(x=>{
            if(x.id==element.id){
                return x
            }
        })
        posts.push(aux)
        })
        return {success:true,posts:posts};
    }

}

module.exports=GhostApi

