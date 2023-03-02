const $iframe = document.getElementById('analitica')
const $iframeContainer= document.getElementById('iframe_container')
const $currentNavigationMenu = document.getElementById('current')
const $currentNavigationSubmenuList = document.getElementById('submenu_list_alt')
const $navigation = document.getElementById('nav')
const $subnavigation = document.getElementById('subnav')
const $footer= document.querySelector('.footer_analitica')
const $menuContainer = document.querySelector('.menu-container')


const $menusWrapper = document.getElementById('menus-wrapper')
const $submenusWrapper = document.getElementById('submenus-wrapper')

$menusWrapper.addEventListener('click', evt => {
	const $target = evt.target
	const $menu = $target.closest('.menu')
	if (!$menu) return
	$currentNavigationSubmenuList.innerHTML = '';

	const $submenuList = document.querySelector(`[data-list-menu-target="${$menu.dataset.menuId}"]`)
	if (!$submenuList) return

	$menusWrapper.querySelectorAll('.menu.active').forEach($menu => {
		$menu.classList.remove('active')
	})
	$submenusWrapper.querySelectorAll('.submenu-list:not(.d-none)').forEach($submenuList => {
		$submenuList.classList.add('d-none')
	})

	$submenusWrapper.classList.remove('d-none')
	$submenuList.classList.remove('d-none')
	$menu.classList.add('active')

	$currentNavigationMenu.textContent = $menu.querySelector('p').textContent
	$currentNavigationSubmenuList.innerHTML = [...$submenuList.querySelectorAll('.submenu')].map($submenu => {
		return `
			<li id="subnav_${$submenu.dataset.submenuId}" data-rutabi="${$submenu.dataset.submenuRutabi}">
				${$submenu.querySelector('.submenu-info p').textContent}
			</li>
		`
	}).join('')
})

$submenusWrapper.addEventListener('click', evt => {
	const $target = evt.target
	const $submenu = $target.closest('.submenu')
	if (!$submenu) return

	$submenusWrapper.querySelectorAll('.submenu.active').forEach($submenu => {
		$submenu.classList.remove('active')
	})

	$submenu.classList.add('active')

	$iframe.setAttribute('src', $submenu.dataset.submenuRutabi)
	$iframeContainer.classList.remove('d-none')

	$menuContainer.classList.add('d-none')

	$navigation.classList.add('d-none')
	$subnavigation.classList.remove('d-none')
	$footer.classList.add('d-none')

	document.getElementById(`subnav_${$submenu.dataset.submenuId}`).classList.add('active')

})

$currentNavigationSubmenuList.addEventListener('click', evt => {
	const $target = evt.target
	const $submenuNavigation = $target.closest('li')
	if (!$submenuNavigation) return

	$currentNavigationSubmenuList.querySelectorAll('li.active').forEach($submenu => {
		$submenu.classList.remove('active')
	})

	$iframe.setAttribute('src', $submenuNavigation.dataset.rutabi)
	$submenuNavigation.classList.add('active')
})

const $exitIframe= document.getElementById('close-frame')

$exitIframe.addEventListener('click', () => {
	$iframe.setAttribute('src', '')
	$iframeContainer.classList.add('d-none')
	$menuContainer.classList.remove('d-none')
	$navigation.classList.remove('d-none')
	$subnavigation.classList.add('d-none')
	$footer.classList.remove('d-none')
})