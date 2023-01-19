const GhostContentApi = require("@tryghost/content-api");
const { readingTime, tags } = require("@tryghost/helpers");
const utils = require("../utils/utils");
const MiniSearch = require("minisearch");
const api = new GhostContentApi({
	url: "https://www.onsv.gob.pe:5000",
	key: "a20fd9a819b97254868897c806",
	version: "v3"
})
class GhostApi {

	getPosts = async (limit = 0, include = "tags", filter = "featured:false", order = "published_at DESC", page = 1) => {
		let posts = [];
		try {
			posts = await api.posts
				.browse({
					filter: filter,
					limit: limit,
					include: include,
					order: order,
					page: page
				})
				.catch(err => {
					// console.error(err);
					console.error('Doesnt exist post with region tag')
					return [];
				});

			posts.forEach(post => {
				readingTime(post, { minute: "a hot minute", minutes: "% minutes" })
			});
			posts.forEach(post => {
				tags(post, { suffix: '.' })
			})

		} catch (error) {
			console.error(error);
			return posts
		}
		return posts
	}
	getSettings = async () => {
		try {
			let settings = await api.settings.browse();
			settings = utils.transformHttps(settings);
			return settings
		} catch (error) {
			console.error(error)
		}

	}
	getPost = async (slug) => {
		return await api.posts.read({ slug: slug }, { include: ['tags', 'authors'] }, { formats: ['html', 'plaintext'] })
	}

	getTags = async (include, limit) => {
		return api.tags.browse({
			include: include,
			limit: limit,

		});
	}
	getTagsTitles = async () => {
		return api.tags.browse({
			limit: "all",
			fields: ['name', 'id'],
		})
	}
	getLastFivePostsTitleAndUrl = async () => {
		return await api.posts.browse(
			{
				limit: 5,
				fields: ['title', 'url'],
				order: "published_at DESC"
			});
	}

	getModalPosts = async () => {
		const publish = await this.getPosts(1, 'tags,authors', 'tags:[publicaciones]', "published_at DESC");
		//const legal=await this.getPosts(1,'tags,authors','tags:[normas-legales]',"published_at DESC");
		//return publish.concat(legal);
		return publish;

	}
	getSearchPosts = async (filter, slug) => {
		let posts = [];
		let stopWords = new Set(['de', 'o', 'la', 'los', 'las'])
		let miniSearch = new MiniSearch({
			fields: ['title'],
			storeFields: ['id'],
			tokenize: (string) => string.split(/\s+/).filter(word => !stopWords.has(word))
		})
		let resultsRaw = [];
		resultsRaw = await api.posts.browse({
			limit: "all",
			filter: filter,
			include: ['tags', 'authors']
			//fields:"id,title"
		})
		miniSearch.addAll(resultsRaw);
		let searchResults = miniSearch.search(slug, { fuzzy: 0.2 });
		if (searchResults.length == 0) {
			let suggestions = miniSearch.autoSuggest(slug, { fuzzy: 0.2 });
			if (suggestions.length == 0) {
				return { success: false, posts: posts };
			}
			else {
				searchResults = miniSearch.search(suggestions[0].suggestion, { fuzzy: 0.2 });
			}
		}
		searchResults.forEach(element => {
			let aux = resultsRaw.find(x => {
				if (x.id == element.id) {
					return x
				}
			})
			posts.push(aux)
		})
		return { success: true, posts: posts };
	}
	getTitleAndExcerptBySlug = async (slug) => {
		return await api.posts.read({ slug: slug }, { fields: 'title,custom_excerpt,excerpt' });
	}

	getTitleAndExcerptByTag = async (slug) => {
		return await api.tags.read({ slug: slug })
	}

}

module.exports = GhostApi

