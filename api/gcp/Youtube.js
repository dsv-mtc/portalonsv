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

	/**
	 * @description Retorna los videos más vistos del canal (orden descendente por viewCount).
	 *              Usa search.list con order=viewCount sobre el channelId configurado.
	 *              Costo de cuota: 100 unidades por llamada.
	 * @param {number} limit - Cantidad de videos a retornar (por defecto 5).
	 */
	async getTopVideos (limit = 5) {
		const res = await youtube.search.list({
			part: 'snippet',
			channelId: process.env.ID_CHANNEL_YOUTUBE_PROD,
			order: 'viewCount',
			type: 'video',
			maxResults: limit
		});
		return (res.data.items || []).map(item => {
			const thumb = (item.snippet.thumbnails && (item.snippet.thumbnails.medium || item.snippet.thumbnails.default || item.snippet.thumbnails.high)) || {};
			return {
				video: item.id.videoId,
				title: item.snippet.title,
				description: item.snippet.description,
				thumbnail: thumb.url || '',
				publishedAt: item.snippet.publishedAt
			};
		});
	}

}

module.exports = Webinars;