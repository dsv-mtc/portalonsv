const isEn = location.href.includes('/en/');

// Nuevos colores para sincronizar con los botones del diseño actual
const TIPO_EVENTO_COLOR = {
  ['Campaña']: '#f9d57b',   // Amarillo
  ['Evento']: '#1f61ac',    // Azul
  ['Entrevista']: '#81b88a', // Verde
}

// Color del texto (Oscuro para el amarillo, blanco para el resto)
const TIPO_EVENTO_TEXT = {
  ['Campaña']: '#162645',
  ['Evento']: '#ffffff',
  ['Entrevista']: '#ffffff',
}

const ID_TIPO_EVENTO = {
  "todos": 0,
  "campanias": 1,
  "eventos": 2,
  "entrevistas": 3
}

const TIPO_EVENTO = {
  "0": isEn ? "Events" : "Eventos",
  "1": isEn ? "Campaigns" : "Campañas",
  "2": isEn ? "Events" : "Eventos",
  "3": isEn ? "Interviews" : "Entrevistas"
}

function activeButton($buttons, $activeButton) {
  $buttons.forEach($button => {
    $button.classList.remove('active')
    $button.removeAttribute('disabled')
  })
  if ($activeButton) {
    $activeButton.classList.add('active')
    $activeButton.setAttribute('disabled', '')
  }
}

function handleFilterButtons($domCalendar, $calendar) {
  const pageTipoEvento = window.location.pathname.split('/')[2]
  const $buttonsContainer = document.querySelector('.filter-buttons')
  const $buttons = $buttonsContainer.querySelectorAll('[data-filter]')
  const $activeButton = [...$buttons].find($button => $button.dataset.filter === pageTipoEvento)

  activeButton($buttons, $activeButton)

  const allEventos = JSON.parse($buttonsContainer.dataset.allEventos)
  const allNearEventos = JSON.parse($buttonsContainer.dataset.allNearEventos)

  $buttonsContainer.addEventListener('click', evt => {
    const $button = evt.target.closest('[data-filter]')
    if (!$button) return

    activeButton($buttons, $button)

    const { filter } = $button.dataset
    const idTipoEvento = ID_TIPO_EVENTO[filter]

    const viewEventos = idTipoEvento === 0 
      ? allEventos 
      : allEventos.filter(evento => evento.idTipoEvento === idTipoEvento)

    const viewNearEventos = idTipoEvento === 0
      ? allNearEventos.slice(0, 5)
      : allNearEventos.filter(evento => evento.idTipoEvento === idTipoEvento).slice(0, 5)


    $calendar.destroy();

    const parsedEventos = viewEventos.map(evento => ({
      title: evento.title,
      start: evento.startTime,
      end: evento.endTime,
      url: `/comunicaciones/${evento.id}`,
      backgroundColor: TIPO_EVENTO_COLOR[evento.tipoEvento],
      textColor: TIPO_EVENTO_TEXT[evento.tipoEvento] || '#ffffff',
      borderColor: 'transparent'
    }))
    
    const calendar = new window.FullCalendar.Calendar($domCalendar, {
      initialView: 'dayGridMonth',
      // NUEVA ESTRUCTURA DE LA BARRA SUPERIOR
      headerToolbar: {
        left: 'title',
        center: '',
        right: 'today prev,next'
      },
      buttonText: {
        today: isEn ? 'TODAY' : 'HOY'
      },
      locale: 'es',
      events: parsedEventos
    });
    calendar.render();
    
    // Buscar el contenedor del sidebar
    const $nearEventosContainer = document.querySelector('.events-sidebar') || document.querySelector('.events')

    if ($nearEventosContainer) {
      // Actualiza el título del sidebar dinámicamente
      const $sidebarTitle = $nearEventosContainer.querySelector('.sidebar-title') || $nearEventosContainer.querySelector('h3');
      if ($sidebarTitle) {
        $sidebarTitle.innerHTML = `${isEn ? 'UPCOMING: ' : 'PRÓXIMOS: '}${TIPO_EVENTO[idTipoEvento]}`;
      }

      // Inyecta las tarjetas con el NUEVO DISEÑO HTML (.nxt-event-card)
      const $results = $nearEventosContainer.querySelector('.results');
      if ($results) {
        $results.innerHTML = viewNearEventos.map(e => `
          <article class="nxt-event-card">
            <a class="nxt-card-body" href="/comunicaciones/${e.id}">
              
              <div class="nxt-date">
                <span class="nxt-day">${e.startDay}</span>
                <span class="nxt-month">${e.startMonth}</span>
              </div>
          
              <div class="nxt-info">
                <h6 class="nxt-title">${e.title}</h6>
                <div class="nxt-desc">
                  ${e.shortDescription ?? ''}
                </div>
              </div>
          
            </a>
          </article>
        `).join('')
      }
    }
  })
}

function pageFilteredEventos ($calendar) {
  const filteredEventos = JSON.parse($calendar.dataset.filteredEventos)

  const parsedEventos = filteredEventos.map(evento => ({
    title: evento.title,
    start: evento.startTime,
    end: evento.endTime,
    url: `/comunicaciones/${evento.id}`,
    backgroundColor: TIPO_EVENTO_COLOR[evento.tipoEvento],
    textColor: TIPO_EVENTO_TEXT[evento.tipoEvento] || '#ffffff',
    borderColor: 'transparent'
  }))

  const calendar = new window.FullCalendar.Calendar($calendar, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'today prev,next'
    },
    buttonText: {
      today: 'HOY'
    },
    locale: 'es',
    events: parsedEventos
  });
  calendar.render();
  return calendar
}

document.addEventListener('DOMContentLoaded', () => {
  const $domCalendar = document.getElementById('calendar');
  const $calendar = pageFilteredEventos($domCalendar)
  handleFilterButtons($domCalendar, $calendar)
})