import { CollectionBeforeChangeHook } from 'payload/types'
import { v4 as uuidv4 } from 'uuid'

export const generateId: CollectionBeforeChangeHook = async ({ req, operation, data }) => {
  if (operation === 'create')
  {
    if(!data._id && !data.id) {
      data._id = uuidv4()
    }
  }
  return data
}

export const generateCreatedBy: CollectionBeforeChangeHook = async ({ req, operation, data }) => {
  if (operation === 'create')
  {
    if(!data.createdBy) {
      data.createdBy = req.user.id
    }
  }
  return data
}

export const generateRandomSlug: CollectionBeforeChangeHook = async ({ req, operation, data }) => {
  if (operation === 'create')
  {
    if(!data.slug) {
      // Generate a random slug by using the random() function, 8 characters long
      data.slug = Math.random().toString(36).substring(2, 10).padEnd(8, '0')
    }
  }
  return data
}
