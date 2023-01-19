const API_URL = "/secciones-admin/analitica-submenu"

function new_loadFile(value) {
	document.querySelector(`#new_${value}-file`).click();
}

function extractRowSubmenu($row) {
	return {
		id: $row.dataset.id,
		submenu: $row.dataset.submenu,
		menuId: $row.dataset.menuid,
		rutabi: $row.dataset.rutabi,
		linkvideo: $row.dataset.linkvideo,
		linkpdf: $row.dataset.linkpdf,
		imagen: $row.dataset.imagen,
		estado: $row.dataset.estado === 'true',
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
	const $container = document.querySelector('#submenu-crud');
	const $dataTable = document.querySelector('#data-table');
	const $formAgregar = document.querySelector('#formAgregarSubmenu');
	const $formEditar = document.querySelector('#formEditarSubmenu');
	const $formEliminar = document.querySelector('#formEliminarSubmenu');

	$dataTable.addEventListener('click', (e) => {
		
		const $target = e.target;
		if (!$target.matches('button')) return
		const $row = $target.closest('tr');
		if (!$row) return;
		$formEditar.reset()
		const submenu = extractRowSubmenu($row);
		$container.dataset.submenuId = submenu.id;
		$formEditar.submenu.value = submenu.submenu;
		$formEditar.menu_id.value = submenu.menuId;
		$formEditar.rutabi.value = submenu.rutabi;
		$formEditar.linkvideo.value = submenu.linkvideo;
		$formEditar.linkpdf.value = submenu.linkpdf;
		if (submenu.imagen !== 'No existe') {
			$formEditar.imgFileName.value = submenu.imagen;
		}
		$formEditar.estado.checked = submenu.estado;
	})

	$formAgregar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const data = new FormData($formAgregar);

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
		$formEditar.querySelector('.modal-body').prepend(alert);
		location.reload();

	})

	$formEditar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = $container.dataset.submenuId
		const data = new FormData($formEditar);
		data.append('id', id)
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