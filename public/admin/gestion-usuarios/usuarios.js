const API_URL = "/administrador/gestion-usuarios/usuarios"

function extractRowMenu($row) {
	return {
		id: $row.dataset.id,
    user: $row.dataset.user,
    roleId: $row.dataset.roleId,
	}
}

window.addEventListener('DOMContentLoaded', () => {
	const $container = document.getElementById('crud');
	const $table = document.getElementById('data-table');
	const $botonAgregar = document.querySelector('[data-target="#modalAgregar"]');
	const $formAgregar = document.getElementById('formAgregar');
	const $formEditar = document.getElementById('formEditar');
	const $formEliminar = document.getElementById('formEliminar');

  new DataTable('#data-table');

	$table.addEventListener('click', (e) => {
		const $target = e.target;
		if(!$target.closest('button')) return;
		const $row = $target.closest('tr');
		if (!$row) return;
		$formEditar.reset()
		const user = extractRowMenu($row);
		$container.dataset.userId = user.id;
		$formEditar.user.value = user.user;
		$formEditar.roleId.value = user.roleId;
	})

	$botonAgregar.addEventListener('click', () => {
		$formAgregar.reset()
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
		$formAgregar.querySelector('.modal-body').prepend(alert);
		$formAgregar.reset()
		location.reload();
	})

	$formEditar.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = $container.dataset.userId
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
		const id = $container.dataset.userId
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