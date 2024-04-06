import { CollectionConfig, CollectionBeforeValidateHook  ,CollectionBeforeChangeHook } from 'payload/types'
import { v4 as uuidv4 } from 'uuid'

const printFileInfo: CollectionBeforeValidateHook  = async ({ req, operation, data, originalDoc }) => {
  console.log('printFileInfo')
  console.log('req', req)
  console.log('operation', operation)
  console.log('data', data)
  console.log('originalDoc', originalDoc)
  return data
}

const generateId: CollectionBeforeChangeHook = async ({ operation, data }) => {
  if (operation === 'create') 
  {
    if(!data._id && !data.id) {
      data._id = uuidv4()
    }
  }
  console.log('generateId', operation, data)
  return data
}

const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticURL: 'https://r2-citizencat-data.citizenwiki.cn/cms-assets',
    staticDir: 'media',
    disableLocalStorage: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'filename',
      type: 'text',
    },
  ],
  hooks: {
    beforeValidate: [printFileInfo],
    beforeChange: [generateId],
  },
}

export default Media