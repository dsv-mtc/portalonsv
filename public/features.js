// Social media
const tabFacebook = document.getElementById('tab_facebook')
const tabTwitter = document.getElementById('tab_twitter')
const iframeFacebook = document.getElementById('iframe_facebook')
const iframeTwitter = document.getElementById('iframe_twitter')

addEventListener('DOMContentLoaded', (event) => {
	const aboutTabs = document.querySelectorAll('.about_section .about_tabs .tab_item')
	if (aboutTabs.length > 0) {
		aboutTabs[0].classList.add('active')
		const aboutList = document.querySelector('.about_section .about_list .about_item')
		aboutList.classList.add('active')
		
		aboutTabs.forEach((a) => {
			a.addEventListener('click', () => {
				document.querySelectorAll('.about_section .about_list .about_item').forEach((it) => {
					it.classList.remove('active')
				})
				document.querySelectorAll('.about_section .about_tabs .tab_item.active').forEach((ab) => {
					ab.classList.remove('active')
				})
				a.classList.add('active')
				const tabId = a.getAttribute('data-tab');
				document.getElementById(`about_item_${tabId}`).classList.add('active')
			})
		})
	}

	document.querySelectorAll('.about_section .about_list .about_item p').forEach((text) => {
			text.innerHTML = text.textContent
	})
});

if(tabFacebook) {
	tabFacebook.addEventListener('click', () => {
		tabFacebook.classList.add('active')
		tabTwitter.classList.remove('active')
		iframeFacebook.classList.add('show')
		iframeTwitter.classList.remove('show')
	})
}

if(tabTwitter) {
	tabTwitter.addEventListener('click', () => {
		tabFacebook.classList.remove('active')
		tabTwitter.classList.add('active')
		iframeFacebook.classList.remove('show')
		iframeTwitter.classList.add('show')
	})
}
