const API_URL = "/secciones-admin/datos-abiertos"

function new_loadFile(value) {
	document.querySelector(`#new_${value}-file`).click();
}


function extractRowData($row) {
	return {
		id: $row.dataset.id,
		titulo: $row.dataset.titulo,
		autor: $row.dataset.autor,
		descripcion: $row.dataset.descripcion,
		idCategoria: Number($row.dataset.idCategoria),
		idTipo: Number($row.dataset.idTipo),
		excelfile: $row.dataset.excelfile,
		pdffile: $row.dataset.pdffile,
		csvfile: $row.dataset.csvfile,
		fecha: $row.dataset.fecha
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
	const $clearButton = document.getElementById("clearButton")

	$clearButton.addEventListener("click", evt => {
		evt.preventDefault()
		location.href = "/secciones-admin/datos-abiertos"
	})


	const $container = document.querySelector('#datos-abiertos-crud');
	const $dataTable = document.querySelector('#data-table');
	const $formAgregar = document.querySelector('#formAgregar');
	const $formEditar = document.querySelector('#formEditar');
	const $formEliminar = document.querySelector('#formEliminarDatosAbiertos');

	$dataTable.addEventListener('click', (e) => {
		const $target = e.target;
		if(!$target.closest('button')) return;
		const $row = $target.closest('tr');
		if (!$row) return;
		const data = extractRowData($row);
		$formEditar.reset()
		$container.dataset.dataId = data.id;
		$formEditar.titulo.value = data.titulo;
		$formEditar.autor.value = data.autor;
		$formEditar.descripcion.value = data.descripcion;
		$formEditar.categoria.value = data.idCategoria;
		$formEditar.tipo.value = data.idTipo;
		if (data.excelfile !== 'No existe') {
			$formEditar.excelFileName.value = data.excelfile;
		}
		if (data.pdffile !== 'No existe') {
			$formEditar.pdfFileName.value = data.pdffile;
		}
		if (data.csvfile !== 'No existe') {
			$formEditar.csvFileName.value = data.csvfile;
		}
		$formEditar.fecha.value = data.fecha;
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