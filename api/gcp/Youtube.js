const  {google} = require('googleapis');
const path = require('path');
const {authenticate} = require('@google-cloud/local-auth');

const youtube =google.youtube({
    version:'v3',
    auth:process.env.YOUTUBE_API_KEY
});

class Webinars {
    //https://www.youtube.com/channel/UCdNz5eyTZClohkpJgk4oa2Q
    /**
     * @description:Retorna todos los playlists del canal que sean públicos
     */
    getPlayLists=async ()=>{
        const res=await youtube.playlists.list({
            channelId:process.env.ID_CHANNEL_YOUTUBE_DEV,
            part:'snippet',
            maxResults:50
        })
        //El id es e plylistID en getItemsFromPlayList
        console.log(res.data.items)
    }
    getItemsFromPlayList=async()=>{
        //https://developers.google.com/youtube/v3/docs/playlistItems?hl=es#resource
        const res=await youtube.playlistItems.list({
            part:'snippet',
            playlistId:process.env.ID_PLAYLIST_YOUTUBE_DEV,
            maxResults:50
        })
        const videoIdsList=res.data.items.map(item=>{
            return {video:item.snippet.resourceId.videoId,description:item.snippet.description, title:item.snippet.title};
        })
        return videoIdsList;
    }

}

module.exports=Webinars;