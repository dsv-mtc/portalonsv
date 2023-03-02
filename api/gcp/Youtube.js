const { google } = require('googleapis');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');

const youtube = google.youtube({
	version: 'v3',
	auth: process.env.YOUTUBE_API_KEY
});

class Webinars {
	//https://www.youtube.com/channel/UCdNz5eyTZClohkpJgk4oa2Q
	/**
	 * @description:Retorna todos los playlists del canal que sean públicos
	 */
	async getPlayLists () {
		const res = await youtube.playlists.list({
			channelId: process.env.ID_CHANNEL_YOUTUBE_PROD,
			part: 'snippet',
			maxResults: 50
		})
		return res.data.items;
	}

	async getItemsFromPlayList (playlistId) {
		//https://developers.google.com/youtube/v3/docs/playlistItems?hl=es#resource
		const res = await youtube.playlistItems.list({
			part: 'snippet',
			playlistId,
			maxResults: 50
		})
		const videoIdsList = res.data.items.map(item => {
			return { video: item.snippet.resourceId.videoId, description: item.snippet.description, title: item.snippet.title };
		})
		return videoIdsList;
	}

	async getItemsFromWebinarsPlayList () {
		//https://developers.google.com/youtube/v3/docs/playlistItems?hl=es#resource
		const res = await youtube.playlistItems.list({
			part: 'snippet',
			playlistId: process.env.ID_PLAYLIST_YOUTUBE_DEV,
			maxResults: 50
		})
		const videoIdsList = res.data.items.map(item => {
			return { video: item.snippet.resourceId.videoId, description: item.snippet.description, title: item.snippet.title };
		})
		return videoIdsList;
	}

}

module.exports = Webinars;