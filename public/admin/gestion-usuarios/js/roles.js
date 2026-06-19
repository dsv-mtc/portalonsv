const API_URL = "/administrador/gestion-usuarios/roles"

function extractRowMenu($row) {
	return {
		id: $row.dataset.id,
		value: $row.dataset.value,
		permissionValues: JSON.parse($row.dataset.permissionValues),
	}
}

function handleSelectAllButton(buttonId, roleContainerId) {
	const $roleContainer = document.getElementById(roleContainerId)
	const $selectAllButton = document.getElementById(buttonId)

	let isChecked = $selectAllButton.checked
	const $label = document.querySelector(`label[for="${buttonId}"]`)
	$label.textContent = isChecked ? 'Deseleccionar todo' : 'Seleccionar todo'
	
	$selectAllButton.addEventListener('change', (e) => {
		isChecked = e.target.checked

		$label.textContent = isChecked ? 'Deseleccionar todo' : 'Seleccionar todo'

		$roleContainer.querySelectorAll('input[type="checkbox"]').forEach($checkbox => {
			$checkbox.checked = isChecked
		})
	})

}

window.addEventListener('DOMContentLoaded', () => {
	const $container = document.getElementById('crud')
	const $dataTable = document.getElementById('data-table')
	const $botonAgregar = document.querySelector('[data-target="#modalAgregar"]')
	const $formAgregar = document.getElementById('formAgregar')
	const $formEditar = document.getElementById('formEditar')
	const $formEliminar = document.getElementById('formEliminar')
	const $editSelectAllButton = document.getElementById('editSelectAllButton')
	const $editRoleContainer = document.getElementById('editRoleContainer')

	handleSelectAllButton('addSelectAllButton', 'addRoleContainer')
	handleSelectAllButton('editSelectAllButton', 'editRoleContainer')

	$dataTable.addEventListener('click', (e) => {
		const $target = e.target
		if (!$target.closest('button')) return
		const $row = $target.closest('tr')
		if (!$row) return
		$formEditar.reset()
		const rol = extractRowMenu($row)
		$formEditar.value.value = rol.value

		const $allPermissions = $editRoleContainer.querySelectorAll('input[type="checkbox"]')
		const $permissions = $editRoleContainer.querySelectorAll(
			rol.permissionValues.map(pv => `input[name="${pv}"]`).join(', ')
		)

		if ($allPermissions.length === $permissions.length) {
			$editSelectAllButton.click()
		} else {
			$permissions.forEach($permission => $permission.checked = true)
		}


		$container.dataset.roleId = rol.id
	})

	$botonAgregar.addEventListener('click', () => {
		$formAgregar.reset()
	})

	$formAgregar.addEventListener('submit', async (e) => {
		e.preventDefault()
		const data = new FormData($formAgregar)

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
					<span aria-hidden="true">&times</span>
				</button>
			</div>
		`
		$formAgregar.querySelector('.modal-body').prepend(alert)
		$formAgregar.reset()
		location.reload()

	})

	$formEditar.addEventListener('submit', async (e) => {
		e.preventDefault()
		const id = $container.dataset.roleId
		const data = new FormData($formEditar)
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
					<span aria-hidden="true">&times</span>
				</button>
			</div>
		`
		$formEditar.querySelector('.modal-body').prepend(alert)
		location.reload()
	})

	$formEliminar.addEventListener('submit', async (e) => {
		e.preventDefault()
		const id = $container.dataset.roleId
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
				<span aria-hidden="true">&times</span>
			</button>
		</div>
		`
		$formEditar.querySelector('.modal-body').prepend(alert)
		location.reload()
	})
})