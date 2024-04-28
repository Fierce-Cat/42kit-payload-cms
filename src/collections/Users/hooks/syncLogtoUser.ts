import type { CollectionBeforeChangeHook } from 'payload/types'

import { updateLogtoUser } from '../functions/logtoHelpers'

export const syncLogtoUser: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create') {
    if (!data.external_identifier && data.sub) {
      data.external_provider = data.iss // 同步外部提供者
    }
    if (!data.roles) {
      data.roles = ['user']
    }
  }
  if (operation === 'update') {
    if (!data.external_provider && data.sub) {
      data.external_provider = data.iss // 同步外部提供者
      return data
    }
    if (data.sub) {
      await updateLogtoUser(data)
    }
  }
  return data
}
