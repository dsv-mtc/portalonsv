const $iframe = document.getElementById('analitica')
const $iframeContainer = document.getElementById('iframe_container')
const $currentNavigationMenu = document.getElementById('current')
const $currentNavigationSubmenuList = document.getElementById('submenu_list_alt')
const $navigation = document.getElementById('nav')
const $subnavigation = document.getElementById('subnav')
const $footer = document.querySelector('.footer_analitica')
const $menuContainer = document.querySelector('.menu-container')

const $menusWrapper = document.getElementById('menus-wrapper')
const $modal = document.getElementById('submenu-modal')
const $modalTitle = document.getElementById('modal-title')
const $modalBody = document.getElementById('modal-body')
const $modalClose = document.getElementById('modal-close')

let loadingIframe = false

document.querySelectorAll('.menu-card').forEach($card => {
  $card.addEventListener('click', () => {
    const menuId = $card.dataset.menuId
    const $data = document.querySelector(`.menu-submenu-data[data-menu-id="${menuId}"]`)
    if (!$data) return
    $modalTitle.textContent = $data.dataset.menuDesc
    $modalBody.innerHTML = ''
    $data.querySelectorAll('.submenu-card').forEach($sub => {
      $modalBody.appendChild($sub.cloneNode(true))
    })
    $modal.classList.remove('d-none')
  })
})

$modalBody.addEventListener('click', evt => {
  const $sub = evt.target.closest('.submenu-card')
  if (!$sub || loadingIframe) return
  const rutabi = $sub.dataset.rutabi
  if (!rutabi || rutabi === '#') return
  loadingIframe = true
  $modal.classList.add('d-none')
  $iframe.setAttribute('src', rutabi)
  $iframeContainer.classList.remove('d-none')
  $menuContainer.classList.add('d-none')
  if ($navigation) $navigation.classList.add('d-none')
  $subnavigation.classList.remove('d-none')
  if ($footer) $footer.classList.add('d-none')
  const submenuName = $sub.querySelector('.submenu-card-info p').textContent
  $currentNavigationMenu.textContent = $modalTitle.textContent
  $currentNavigationSubmenuList.innerHTML = `<li class="active">${submenuName}</li>`
})

$iframe.addEventListener('load', () => {
  loadingIframe = false
})

function closeModal() {
  $modal.classList.add('d-none')
}

$modalClose.addEventListener('click', closeModal)

$modal.addEventListener('click', evt => {
  if (evt.target === $modal) closeModal()
})

document.getElementById('close-frame').addEventListener('click', () => {
  $iframe.setAttribute('src', '')
  $iframeContainer.classList.add('d-none')
  $menuContainer.classList.remove('d-none')
  if ($navigation) $navigation.classList.remove('d-none')
  $subnavigation.classList.add('d-none')
  if ($footer) $footer.classList.remove('d-none')
  loadingIframe = false
})
