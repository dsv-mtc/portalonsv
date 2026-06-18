const Permission = Object.freeze({
  contentManagement: {
    meta: {
      alias: 'Manejo de contenidos',
    },
    read: 'content_management.read',
    create: 'content_management.create',
    update: 'content_management.update',
    delete: 'content_management.delete',
  },
  consejoRegional: {
    meta: {
      alias: 'Consejo Regional',
    },
    read: 'consejo_regional.read',
  },
  planRegional: {
    meta: {
      alias: 'Plan Regional',
    },
    read: 'plan_regional.read',
    create: 'plan_regional.create',
    update: 'plan_regional.update',
    delete: 'plan_regional.delete',
  }
})

/**
 * @param {string[]} permissionsList
 * @param {string[]} requiredPermissions 
 * @returns 
 */
function hasPermissions(permissionsList, requiredPermissions) {
  const hasPermission = requiredPermissions.every(permission => permissionsList.includes(permission))
  return hasPermission
}
  
module.exports = { Permission, hasPermissions }