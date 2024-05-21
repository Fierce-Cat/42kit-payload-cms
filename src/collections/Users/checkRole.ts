import type { User } from '../../payload-types'

export const checkRole = (allRoles: User['roles'] = [], user?: User): boolean => {
  if (user) {
    // If user.roles is empty, return false
    if (user.roles.length === 0) {
      return false
    }

    // If user.roles contains any of the roles in allRoles, return true
    for (const role of allRoles) {
      if (user.roles.includes(role)) {
        return true
      }
    }
    return false
  }
  return false
}
