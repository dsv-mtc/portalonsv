const API_URL = "/secciones-admin/datos-abiertos-tipos"

function extractRowData($row) {
	return {
		id: $row.dataset.id,
		value: $row.dataset.value,
		estaActivo: $row.dataset.estaActivo === 'true',
	}
}

window.addEventListener('DOMContentLoaded', () => {
	const $container = document.querySelector('#datos-abiertos-tipos-crud');
	const $dataTable = document.querySelector('#data-table');
	const $formAgregar = document.querySelector('#formAgregar');
	const $formEditar = document.querySelector('#formEditar');
	const $formEliminar = document.querySelector('#formEliminar');

	$dataTable.addEventListener('click', (e) => {
		const $target = e.target;
		if(!$target.closest('button')) return;
		const $row = $target.closest('tr');
		if (!$row) return;
		
		const data = extractRowData($row);
		$formEditar.reset()
		$container.dataset.dataId = data.id;
		$formEditar.value.value = data.value;
		$formEditar.estaActivo.checked = data.estaActivo;
	})

	$formAgregar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const data = new FormData($formAgregar);

		data.append('new_estaActivo', $formAgregar.new_estaActivo.checked)

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
		const id = $container.dataset.dataId
		const data = new FormData($formEditar);

		data.append('id', id)
		data.append('estaActivo', $formEditar.estaActivo.checked)

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
		const id = $container.dataset.dataId
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