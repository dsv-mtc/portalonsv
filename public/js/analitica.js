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
const $menusPagination = document.getElementById('menus-pagination')

let loadingIframe = false

const MENUS_PER_PAGE = 6
const $allMenuCards = Array.from(document.querySelectorAll('.menu-card'))
const totalMenuPages = Math.max(1, Math.ceil($allMenuCards.length / MENUS_PER_PAGE))
let currentMenuPage = 1

function showMenusPage(page) {
  const start = (page - 1) * MENUS_PER_PAGE
  const end = start + MENUS_PER_PAGE
  $allMenuCards.forEach(($card, index) => {
    $card.style.display = index >= start && index < end ? '' : 'none'
  })
}

function renderMenusPagination() {
  $menusPagination.innerHTML = ''

  const prevBtn = document.createElement('button')
  prevBtn.className = 'menu-page-btn'
  prevBtn.disabled = currentMenuPage === 1
  prevBtn.setAttribute('aria-label', 'Página anterior')
  prevBtn.innerHTML = '<i class="fal fa-chevron-left"></i>'
  prevBtn.addEventListener('click', () => goToMenusPage(currentMenuPage - 1))
  $menusPagination.appendChild(prevBtn)

  for (let i = 1; i <= totalMenuPages; i++) {
    const pageBtn = document.createElement('button')
    pageBtn.className = 'menu-page-btn'
    if (i === currentMenuPage) pageBtn.classList.add('active')
    pageBtn.textContent = i
    pageBtn.setAttribute('aria-label', `Página ${i}`)
    pageBtn.addEventListener('click', () => goToMenusPage(i))
    $menusPagination.appendChild(pageBtn)
  }

  const nextBtn = document.createElement('button')
  nextBtn.className = 'menu-page-btn'
  nextBtn.disabled = currentMenuPage === totalMenuPages
  nextBtn.setAttribute('aria-label', 'Siguiente página')
  nextBtn.innerHTML = '<i class="fal fa-chevron-right"></i>'
  nextBtn.addEventListener('click', () => goToMenusPage(currentMenuPage + 1))
  $menusPagination.appendChild(nextBtn)
}

function goToMenusPage(page) {
  if (page < 1 || page > totalMenuPages) return
  currentMenuPage = page
  showMenusPage(page)
  renderMenusPagination()
}

function initMenusPagination() {
  if ($allMenuCards.length === 0) return
  if (totalMenuPages <= 1) {
    $menusPagination.classList.add('d-none')
    showMenusPage(1)
    return
  }
  $menusPagination.classList.remove('d-none')
  goToMenusPage(1)
}

initMenusPagination()

// Paginación de submenús dentro del modal
const SUBMENUS_PER_PAGE = 6
const $submenusPagination = document.getElementById('submenus-pagination')
let currentSubmenuPage = 1
let totalSubmenuPages = 1
let $currentSubmenuCards = []

function showSubmenusPage(page) {
  const start = (page - 1) * SUBMENUS_PER_PAGE
  const end = start + SUBMENUS_PER_PAGE
  $currentSubmenuCards.forEach(($card, index) => {
    $card.style.display = index >= start && index < end ? '' : 'none'
  })
}

function renderSubmenusPagination() {
  $submenusPagination.innerHTML = ''

  const prevBtn = document.createElement('button')
  prevBtn.className = 'menu-page-btn'
  prevBtn.disabled = currentSubmenuPage === 1
  prevBtn.setAttribute('aria-label', 'Página anterior')
  prevBtn.innerHTML = '<i class="fal fa-chevron-left"></i>'
  prevBtn.addEventListener('click', () => goToSubmenusPage(currentSubmenuPage - 1))
  $submenusPagination.appendChild(prevBtn)

  for (let i = 1; i <= totalSubmenuPages; i++) {
    const pageBtn = document.createElement('button')
    pageBtn.className = 'menu-page-btn'
    if (i === currentSubmenuPage) pageBtn.classList.add('active')
    pageBtn.textContent = i
    pageBtn.setAttribute('aria-label', `Página ${i}`)
    pageBtn.addEventListener('click', () => goToSubmenusPage(i))
    $submenusPagination.appendChild(pageBtn)
  }

  const nextBtn = document.createElement('button')
  nextBtn.className = 'menu-page-btn'
  nextBtn.disabled = currentSubmenuPage === totalSubmenuPages
  nextBtn.setAttribute('aria-label', 'Siguiente página')
  nextBtn.innerHTML = '<i class="fal fa-chevron-right"></i>'
  nextBtn.addEventListener('click', () => goToSubmenusPage(currentSubmenuPage + 1))
  $submenusPagination.appendChild(nextBtn)
}

function goToSubmenusPage(page) {
  if (page < 1 || page > totalSubmenuPages) return
  currentSubmenuPage = page
  showSubmenusPage(page)
  renderSubmenusPagination()
}

function initSubmenusPagination(cards) {
  $currentSubmenuCards = cards
  totalSubmenuPages = Math.max(1, Math.ceil(cards.length / SUBMENUS_PER_PAGE))
  if (totalSubmenuPages <= 1) {
    $submenusPagination.classList.add('d-none')
    showSubmenusPage(1)
    return
  }
  $submenusPagination.classList.remove('d-none')
  goToSubmenusPage(1)
}

document.querySelectorAll('.menu-card').forEach($card => {
  $card.addEventListener('click', () => {
    const menuId = $card.dataset.menuId
    const $data = document.querySelector(`.menu-submenu-data[data-menu-id="${menuId}"]`)
    if (!$data) return
    $modalTitle.textContent = $data.dataset.menuDesc
    $modalBody.innerHTML = ''
    const $clonedSubs = []
    $data.querySelectorAll('.submenu-card').forEach($sub => {
      const $clone = $sub.cloneNode(true)
      $modalBody.appendChild($clone)
      $clonedSubs.push($clone)
    })
    $modal.classList.remove('d-none')
    initSubmenusPagination($clonedSubs)
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
