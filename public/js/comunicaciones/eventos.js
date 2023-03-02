const TIPO_EVENTO_COLOR = {
	['Campaña']: 'hsla(35, 84%, 62%, 0.35)',
	['Evento']: 'hsla(211, 42%, 61%, 0.35)',
	['Entrevista']: 'hsla(120, 39%, 54%, 0.30)',
}

const ID_TIPO_EVENTO = {
	"todos": 0,
	"campanias": 1,
	"eventos": 2,
	"entrevistas": 3
}

const TIPO_EVENTO = {
	"0": "Eventos",
	"1": "Campaña",
	"2": "Evento",
	"3": "Entrevista"
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
		}))
		
		const calendar = new window.FullCalendar.Calendar($domCalendar, {
			initialView: 'dayGridMonth',
			buttonText: {
				today: 'Hoy'
			},
			locale: 'es',
			events: parsedEventos
		});
		calendar.render();
		
		const $nearEventosContainer = document.querySelector('.events')

		$nearEventosContainer
			.querySelector('h3').innerHTML = `Próximos: ${TIPO_EVENTO[idTipoEvento]}`

		$nearEventosContainer
			.querySelector('.results').innerHTML = viewNearEventos.map(e => `
				<article class="card">
					<a class="card-body" href="/comunicaciones/${e.id}">
						
						<div class="date">
							<span class="day">${e.startDay}</span>
							<span class="month">${e.startMonth}</span>
						</div>
				
						<div class="event-info">
							<h6 class="card-title ft-bold">${e.title}</h6>
							<p class="text-justify">
								${e.shortDescription ?? ''}
							</p>
						</div>
				
					</a>
				</article>
			`).join('')
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
	}))

	const calendar = new window.FullCalendar.Calendar($calendar, {
		initialView: 'dayGridMonth',
		buttonText: {
			today: 'Hoy'
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