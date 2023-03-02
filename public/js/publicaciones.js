document.addEventListener("DOMContentLoaded", () => {
	const $clearButton = document.getElementById("clearButton")

	$clearButton.addEventListener("click", evt => {
		evt.preventDefault()
		location.href = "/publicaciones"
	})
})