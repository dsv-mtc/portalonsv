const API_URL = "/consejo-regional/planes-regionales/"

function new_loadFile(value) {
	document.querySelector(`#new_${value}-file`).click();
}

function extractRowData($row) {
	return {
		id: Number($row.dataset.id),
		titulo: $row.dataset.titulo,
		descripcion: $row.dataset.descripcion,
		idRegion: Number($row.dataset.idRegion),
		idAuthor: Number($row.dataset.idAuthor),
		excelFileUrl: $row.dataset.excelFileUrl,
		pdfFileUrl: $row.dataset.pdfFileUrl,
		csvFileUrl: $row.dataset.csvFileUrl,
		fechaCreacion: $row.dataset.fechaCreacion,
		estaActivo: $row.dataset.estaActivo === "true",
	}
}

function addChangeFileInput(referenceSelector, selector) {
	const $reference = document.querySelector(referenceSelector)
	$reference.addEventListener('change', () => {
		document.querySelector(selector).value = $reference.files[0].name;
	})
}

addChangeFileInput('#excel-file', '#excel-f')
addChangeFileInput('#pdf-file', '#pdf-f')
addChangeFileInput('#csv-file', '#csv-f')

addChangeFileInput('#new_excel-file', '#new_excel-f')
addChangeFileInput('#new_pdf-file', '#new_pdf-f')
addChangeFileInput('#new_csv-file', '#new_csv-f')

window.addEventListener('DOMContentLoaded', () => {
	const $container = document.querySelector('#crud');
	const $dataTable = document.querySelector('#data-table');
	const $formAgregar = document.querySelector('#formAgregar');
	const $formEditar = document.querySelector('#formEditar');
	const $formEliminar = document.querySelector('#formEliminarDatosAbiertos');

	new DataTable('#data-table');

	$dataTable.addEventListener('click', (e) => {
		const $target = e.target;
		if(!$target.closest('button')) return;
		const $row = $target.closest('tr');
		if (!$row) return;
		const planRegional = extractRowData($row);
		$formEditar.reset()
		$container.dataset.dataId = planRegional.id;
		$formEditar.titulo.value = planRegional.titulo;
		$formEditar.descripcion.value = planRegional.descripcion;
		$formEditar.idRegion.value = planRegional.idRegion;
		if (planRegional.excelFileUrl !== "") {
			$formEditar.excelFileName.value = planRegional.excelFileUrl;
		}
		if (planRegional.pdfFileUrl !== "") {
			$formEditar.pdfFileName.value = planRegional.pdfFileUrl;
		}
		if (planRegional.csvFileUrl !== "") {
			$formEditar.csvFileName.value = planRegional.csvFileUrl;
		}
		$formEditar.fechaCreacion.value = planRegional.fechaCreacion;
		$formEditar.estaActivo.checked = planRegional.estaActivo;
	})

	$formAgregar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const data = new FormData($formAgregar);

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