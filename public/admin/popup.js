const API_URL = '/secciones-admin/popup'
const $popupForm = document.getElementById('popupForm')

function checkFile(selector, allowed) {
	const $inputFile = document.querySelector(selector);
	const existFile = $inputFile.files.length > 0
	if (!existFile) return true
	const fileName = $inputFile.files[0].name
	if(allowed.exec(fileName)) return true
	return false
}

const $imgFile=document.querySelector('#img-file');
$imgFile.addEventListener('change',()=>{
	document.querySelector('#img-f').value = $imgFile.files[0].name;
})

$popupForm.addEventListener('submit', async (e) => {
	e.preventDefault()
	const allowedImgExtensions=/\.(png|jpg|jpeg)/;
	const isIncorrectFile = !checkFile('#img-file',allowedImgExtensions);
	if (isIncorrectFile) {
		e.preventDefault()
		alert(`Archivo inválido`)
		window.location.reload();
		return
	}
	const data = new FormData($popupForm)
	const response = await fetch(API_URL, {
		method: 'POST',
		body: data
	})

	const {style, message} = await response.json()

	document
		.querySelector('#sectionContainer > h3')
		.insertAdjacentHTML('afterend', `
			<div class="col-12">
				<div class="${style}" role="alert">
					<strong>${message}</strong> 
					<button type="button" class="close" data-dismiss="alert" aria-label="Close">
							<span aria-hidden="true">&times;</span>
					</button>
				</div>
			</div>
		`)
})



