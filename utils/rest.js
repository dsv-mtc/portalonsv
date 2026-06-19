const { hasPermissions } = require("../controllers/permission")

function pageAuthorize(request, response, requiredPermissions) {
	const permissions = request.permissions.map(p => p.value)
	const isAuthorized = hasPermissions(permissions, requiredPermissions)

	if (!isAuthorized) {
		const style = `alert alert-danger alert-dismissible fade show`
		const message = 'No tienes permiso para realizar esta acción'

		request.flash("document", {
			style,
			message
		})

		response.json({
			success: false,
			style,
			message
		})
	}

	return isAuthorized
}


module.exports = {
	pageAuthorize
}