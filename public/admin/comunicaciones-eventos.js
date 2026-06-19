const API_URL = "/administrador/comunicaciones-eventos"

function new_loadFile(value) {
	document.querySelector(`#new_${value}-file`).click();
}

function extractRowEvento($row) {
	return {
		id: $row.dataset.id,
		idTipoEvento: $row.dataset.idTipoEvento,
		title: $row.dataset.title,
		organizedBy: $row.dataset.organizedBy,
		place: $row.dataset.place,
		shortDescription: $row.dataset.shortDescription,
		description: $row.dataset.description,
		startDay: $row.dataset.startDay,
		startTime: $row.dataset.startTime,
		endDay: $row.dataset.endDay,
		endTime: $row.dataset.endTime,
		price: $row.dataset.price,
		imageUrl: $row.dataset.imageUrl,
		direccion: $row.dataset.direccion,
		reunionLink: $row.dataset.reunionLink,
		facebookLink: $row.dataset.facebookLink,
		youtubeLink: $row.dataset.youtubeLink,
		twitterLink: $row.dataset.twitterLink,
		isActive: $row.dataset.isActive === "true",
	}
}

function addChangeFileInput(referenceSelector, selector) {
	const $reference = document.querySelector(referenceSelector)
	$reference.addEventListener('change', () => {
		document.querySelector(selector).value = $reference.files[0].name;
	})
}

async function buildEditor($textArea) {
	const createOptions = {
		fontFamily: {
			options: [
				'Arial, Helvetica, sans-serif',
				'Courier New, Courier, monospace',
				'Lucida Sans Unicode, Lucida Grande, sans-serif',
				'Tahoma, Geneva, sans-serif',
				'Trebuchet MS, Helvetica, sans-serif',
				'Verdana, Geneva, sans-serif'
			],
		},
	}

	return await ClassicEditor.create($textArea, createOptions)
}

addChangeFileInput('#img-file', '#img-f')
addChangeFileInput('#new_img-file', '#new_img-f')

window.addEventListener('DOMContentLoaded', async () => {
	const $clearButton = document.getElementById("clearButton")

	$clearButton.addEventListener("click", evt => {
		evt.preventDefault()
		location.href = "/secciones-admin/comunicaciones-eventos"
	})

	const $agregarDescripcion = document.getElementById('new_description')
	const $agregarShortDescripcion = document.getElementById('new_shortDescription')
	const $editarDescripcion = document.getElementById('description')
	const $editarShortDescripcion = document.getElementById('shortDescription')
	
	await buildEditor($agregarDescripcion);
	await buildEditor($agregarShortDescripcion);

	const $editorDescripcion = await buildEditor($editarDescripcion);
	const $editorShortDescripcion = await buildEditor($editarShortDescripcion);

	const $container = document.querySelector('#comunicaciones-eventos-crud');
	const $dataTable = document.querySelector('#data-table');
	const $formAgregar = document.querySelector('#formAgregar');
	const $formEditar = document.querySelector('#formEditar');
	const $formEliminar = document.querySelector('#formEliminar');

	$dataTable.addEventListener('click', (e) => {
		const $target = e.target;
		if (!$target.closest('button')) return;
		const $row = $target.closest('tr');
		if (!$row) return;
		$formEditar.reset()
		const evento = extractRowEvento($row);
		$container.dataset.eventoId = evento.id;

		$formEditar.title.value = evento.title;
		$formEditar.idTipoEvento.value = evento.idTipoEvento;
		$formEditar.organizedBy.value = evento.organizedBy;
		$formEditar.place.value = evento.place;
		$formEditar.direccion.value = evento.direccion;

		$formEditar.startDay.value = evento.startDay;
		$formEditar.startTime.value = evento.startTime;
		$formEditar.endDay.value = evento.endDay;
		$formEditar.endTime.value = evento.endTime;

		$formEditar.price.value = evento.price;
		$formEditar.reunionLink.value = evento.reunionLink;
		$formEditar.facebookLink.value = evento.facebookLink;
		$formEditar.youtubeLink.value = evento.youtubeLink;
		$formEditar.twitterLink.value = evento.twitterLink;

		$formEditar.description.value = evento.description;
		$editorDescripcion.setData(evento.description ?? '');

		$formEditar.shortDescription.value = evento.shortDescription;
		$editorShortDescripcion.setData(evento.shortDescription ?? '');

		if (evento.imageUrl !== '') {
			$formEditar.existingImage.value = evento.imageUrl;
		}
		$formEditar.isActive.checked = evento.isActive;
	})

	$formAgregar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const data = new FormData($formAgregar);

		if (data.get('new_existingImage') === '') {
			return window.alert('Debe seleccionar una imagen')
		}

		const fetchOptions = {
			method: 'POST',
			body: data
		}

		const response = await fetch(API_URL, fetchOptions)
		const { style, message } = await response.json()

		const alert = document.createElement('div')
		alert.classList.add('col-12')
		alert.innerHTML = `
			<div class="${style}" role="alert">
				<strong>${message}</strong> 
				<button type="button" class="close" data-dismiss="alert" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
		`
		$formEditar.querySelector('.modal-body').prepend(alert);
		location.reload();

	})

	$formEditar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = $container.dataset.eventoId
		const data = new FormData($formEditar);

		if (data.get('existingImage') === '') {
			return window.alert('Debe seleccionar una imagen')
		}

		data.append('id', id)
		const fetchOptions = {
			method: 'PUT',
			body: data
		}

		const response = await fetch(API_URL, fetchOptions)
		const { style, message } = await response.json()

		const alert = document.createElement('div')
		alert.classList.add('col-12')
		alert.innerHTML = `
			<div class="${style}" role="alert">
				<strong>${message}</strong> 
				<button type="button" class="close" data-dismiss="alert" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
		`
		$formEditar.querySelector('.modal-body').prepend(alert);
		location.reload();
	})

	$formEliminar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = $container.dataset.eventoId
		const fetchOptions = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id })
		}


		const response = await fetch(API_URL, fetchOptions)
		const { style, message } = await response.json()

		const alert = document.createElement('div')
		alert.classList.add('col-12')
		alert.innerHTML = `
		<div class="${style}" role="alert">
			<strong>${message}</strong> 
			<button type="button" class="close" data-dismiss="alert" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		`
		$formEditar.querySelector('.modal-body').prepend(alert);
		location.reload();
	})
})