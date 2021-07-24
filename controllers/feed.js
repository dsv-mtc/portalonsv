const apiGhost = new(require("../api/ghost"));
const RSS=require("rss");
const fs=require("fs");
const path=require("path");
const apiCloudStorage=new(require("../api/gcp/CloudStorage"))
class Feed {

    _getSettings=async()=>{
        const result= await apiGhost.getSettings();
        //return result
        return {title:result["title"],description:result["description"]}
    }
    _getArticles=async()=>{
        //Se obtienen todos los posts
        const posts = await apiGhost.getPosts(8,"tags,authors","featured:false", "published_at DESC");
        let articles =[];
        posts.forEach(post => {
            let article={
                title:post.title,
                description:post.excerpt,
                url:post.url,
                publishedDate:post.created_at
            }

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
            author:blog.author
        });
        for(const article of blog.articles){
            feed.item({
                title:article.title,
                description:article.description,
                date:article.publishedDate
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