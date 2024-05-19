import type { CollectionBeforeValidateHook } from 'payload/types'

import { APIError } from 'payload/errors'

import { getLogtoUsernameAvaliable } from '../functions/logtoHelpers'

export const checkUsername: CollectionBeforeValidateHook = async ({ data, originalDoc }) => {
  // When logto connected user changed, Check if the username is available
  if (data && originalDoc && data.sub) {
    if (data.username && data.username !== originalDoc?.username) {
      const isAval = await getLogtoUsernameAvaliable(data.username)
      if (!isAval) {
        throw new APIError('Username is not available', 400)
      }
      return data
    }
  }
  return data
}
