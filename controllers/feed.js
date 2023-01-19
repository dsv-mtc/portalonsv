const apiGhost = new(require("../api/ghost"));
const RSS=require("rss");
const fs=require("fs");
const path=require("path");
const apiCloudStorage=new(require("../api/gcp/CloudStorage"));
//documentation https://mailchimp.com/es/help/rss-merge-tags/
class Feed {
    _endpointRebase(url){
        const pattern=/^https?:\/\/www.onsv.gob.pe/;
        return url.replace(pattern,`${process.env.URL_PATH}/post`);
    }
    _transformHttps=(element)=>{
        const patttern = /^http:/ 
        return element.replace(patttern,'https:');
    }
    _getSettings=async()=>{
        const result= await apiGhost.getSettings();
        //return result
        return {title:result["title"],description:result["description"]}
    }
    _getArticles=async()=>{
        //Se obtienen todos los posts
        const posts = await apiGhost.getPosts(8,"tags,authors","featured:false", "published_at DESC");
        //console.log(posts)
        let articles =[];
        posts.forEach(post => {
            let article={
                image:this._transformHttps(post.feature_image),
                title:post.title,
                description:post.excerpt,
                url:this._endpointRebase(post.url),
                publishedDate:post.created_at
            }
            console.log(article.image)
            articles.push(article);
            
        });
        return articles;
    }

    _createFeedXml=async()=>{
        const {title, description} = await this._getSettings();
        const blog={
              title:title,
              description:description,
              author:'ONSV',
              articles:await this._getArticles()
          }
        const feed =new RSS({
            title:blog.title,
            description:blog.description,
            author:blog.author,
            custom_namespaces:{
                'media':`${process.env.URL_PATH}`
            }
        });
        for(const article of blog.articles){
            feed.item({
                title:article.title,
                description:article.description,
                date:article.publishedDate,
                url:article.url,
                custom_elements:[
                    {'media:content':{_attr:{url:article.image}}}
                ]
            })
        }
        return feed.xml({indent:true});
    }
    buildRssFileSystem=async()=>{
        const xml=await  this._createFeedXml()
        const filePath=path.join(__dirname,'../xml/feed.xml');
        fs.writeFileSync(filePath,xml);
        return filePath;
    }


    buildRssGcp=async()=>{
        const xml= await this._createFeedXml();
        await apiCloudStorage.uploadFile(xml,'feed.xml');
        await apiCloudStorage.downloadFile('feed.xml')
    }
}


module.exports = Feed;