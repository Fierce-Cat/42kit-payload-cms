import type { Access, FieldAccess } from 'payload/types'

import type { User } from '../payload-types'

import { checkRole } from '../collections/Users/checkRole'

export const isAdmin: Access<
  any, // eslint-disable-line @typescript-eslint/no-explicit-any
  User
> = ({ req: { user } }) => {
  // Return true or false based on if the user has an admin role
  return checkRole(['admin'], user)
}

export const isAdminFieldLevel: FieldAccess<{ id: string }, unknown, User> = ({
  req: { user },
}) => {
  // Return true or false based on if the user has an admin role
  return checkRole(['admin'], user)
}
