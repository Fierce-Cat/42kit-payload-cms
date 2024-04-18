import type { Access, FieldAccess } from 'payload/types'

import type { User } from '../payload-types'

export const isCreatedBy: Access<
  any, // eslint-disable-line @typescript-eslint/no-explicit-any
  User
> = ({ req: { user } }) => {
  return {
    createdBy: {
      equals: user.id,
    },
  }
}

export const isCreatedByFieldLevel: FieldAccess<{ id: string }, unknown, User> = ({
  req: { user },
}) => {
  return {
    createdBy: {
      equals: user.id,
    },
  }
}

