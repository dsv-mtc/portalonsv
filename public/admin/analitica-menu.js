const API_URL = "/secciones-admin/analitica-menu"

function new_loadFile(value) {
	document.querySelector(`#new_${value}-file`).click();
}

function extractRowMenu($row) {
	return {
		id: $row.dataset.id,
		descripcion: $row.dataset.descripcion,
		urlImagen: $row.dataset.urlImagen,
		observacion: $row.dataset.observacion,
		estaActivo: $row.dataset.estaActivo === 'true',
	}
}

function addChangeFileInput(referenceSelector, selector) {
	const $reference = document.querySelector(referenceSelector)
	$reference.addEventListener('change', () => {
		document.querySelector(selector).value = $reference.files[0].name;
	})
}

addChangeFileInput('#img-file', '#img-f')
addChangeFileInput('#new_img-file', '#new_img-f')

window.addEventListener('DOMContentLoaded', () => {
	const $container = document.getElementById('analitica-menu-crud');
	const $dataTable = document.getElementById('data-table');
	const $botonAgregar = document.querySelector('[data-target="#modalAgregar"]');
	const $formAgregar = document.getElementById('formAgregar');
	const $formEditar = document.getElementById('formEditar');
	const $formEliminar = document.getElementById('formEliminar');

	$dataTable.addEventListener('click', (e) => {
		const $target = e.target;
		if(!$target.closest('button')) return;
		const $row = $target.closest('tr');
		if (!$row) return;
		$formEditar.reset()
		const menu = extractRowMenu($row);
		$container.dataset.submenuId = menu.id;
		$formEditar.descripcion.value = menu.descripcion;
		$formEditar.observacion.value = menu.observacion;
		if (menu.urlImagen !== '') {
			$formEditar.existingImage.value = menu.urlImagen;
		}
		$formEditar.estaActivo.checked = menu.estaActivo;
	})

	$botonAgregar.addEventListener('click', () => {
		$formAgregar.reset()
		$formAgregar.new_estaActivo.checked = true;
	})

	$formAgregar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const data = new FormData($formAgregar);
		data.set('new_observacion', undefined)

		if (data.get('new_existingImage') === '') {
			return window.alert('Debe seleccionar una imagen')
		}
		
		const fetchOptions = {
			method: 'POST',
			body: data
		}

		const response = await fetch(API_URL, fetchOptions)
		const {style, message} = await response.json()

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
		$formAgregar.querySelector('.modal-body').prepend(alert);
		$formAgregar.reset()
		$formAgregar.new_estaActivo.checked = true;
		location.reload();

	})

	$formEditar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = $container.dataset.submenuId
		const data = new FormData($formEditar);
		data.append('id', id)
		data.set('observacion', undefined)

		if (data.get('existingImage') === '') {
			return window.alert('Debe seleccionar una imagen')
		}

		const fetchOptions = {
			method: 'PUT',
			body: data
		}

		const response = await fetch(API_URL, fetchOptions)
		const {style, message} = await response.json()

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
		const id = $container.dataset.submenuId
		const fetchOptions = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({id})	
		}

		
		const response = await fetch(API_URL, fetchOptions)
		const {style, message} = await response.json()

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