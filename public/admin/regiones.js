const API_URL = "/secciones-admin/regiones"

function extractRowRegion($row) {
	return {
		id: $row.dataset.id,
		nombreEncargado: $row.dataset.nombreEncargado,
		celularEncargado: $row.dataset.celularEncargado,
		correoEncargado: $row.dataset.correoEncargado,
		imageUrl: $row.dataset.imageUrl,
		pageLink: $row.dataset.pageLink
	}
}

function addChangeFileInput(referenceSelector, selector) {
	const $reference = document.querySelector(referenceSelector)
	$reference.addEventListener('change', () => {
		document.querySelector(selector).value = $reference.files[0].name;
	})
}

addChangeFileInput('#img-file', '#img-f')

window.addEventListener('DOMContentLoaded', () => {
	const $clearButton = document.getElementById("clearButton")

	$clearButton.addEventListener("click", evt => {
		evt.preventDefault()
		location.href = "/secciones-admin/regiones"
	})

	const $container = document.getElementById('crud');
	const $dataTable = document.getElementById('data-table');
	const $formEditar = document.getElementById('formEditar');

	$dataTable.addEventListener('click', (e) => {
		const $target = e.target;
		if(!$target.closest('button')) return;
		const $row = $target.closest('tr');
		if (!$row) return;
		$formEditar.reset()
		const region = extractRowRegion($row);
		$container.dataset.regionId = region.id;
		$formEditar.nombreEncargado.value = region.nombreEncargado;
		$formEditar.celularEncargado.value = region.celularEncargado;
		$formEditar.correoEncargado.value = region.correoEncargado;
		$formEditar.pageLink.value = region.pageLink;

		if (region.imageUrl !== '') {
			$formEditar.existingImage.value = region.imageUrl;
		}

	})

	$formEditar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = $container.dataset.regionId
		const data = new FormData($formEditar);
		data.append('id', id)

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

})