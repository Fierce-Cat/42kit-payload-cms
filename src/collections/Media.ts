import { CollectionConfig, CollectionBeforeOperationHook } from 'payload/types'
import type { Access } from 'payload/config'

// Utilities
import { generateId, generateCreatedBy } from '../utilities/GenerateMeta'

// Access Control
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { isUser, isUserFieldLevel } from '../access/isUser'

const isCreator: Access = ({ req: { user } }) => {
  if (!user) return false
  return {
    createdBy: {
      equals: user.id,
    },
  }
}

const hasMediaId: Access = ({req, id}) => {
  if (req.baseUrl !== '/api/media') return true
  if (!id)
    return false
  return true
}

// Hooks
const generateAltName: CollectionBeforeOperationHook = async ({ args }) => {
  const files = args.req?.files;
  if (files && files.file && files.file.name) {
    const parts = files.file.name.split('.');
    files.file.name = `${(Math.random() + 1).toString(36).substring(2)}.${parts[parts.length - 1]}`;
  }
}

const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: (req) => {
      return (isUser(req))
    },
    read: (req) => {
      return (hasMediaId(req) || isAdmin(req) || isCreator(req))
    },
    update: (req) => {
      return (isCreator(req) || isAdmin(req))

    },
    delete: (req) => {
      return (isCreator(req) || isAdmin(req))
    }
  },
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
      {
        name: 'avatar',
        width: 100,
        height: 100,
        position: 'centre',
      }
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
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
      access: {
        create: () => false,
        update: isAdminFieldLevel,
      },
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'original',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'credit',
      type: 'text',
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: '42Kit',
    },
    {
      name: 'license',
      type: 'select',
      options: [
        { label: 'RSI', value: 'RSI'},
        { label: 'CC-BY', value: 'CC-BY' },
        { label: 'CC-BY-SA', value: 'CC-BY-SA' },
        { label: 'CC-BY-NC', value: 'CC-BY-NC' },
        { label: 'CC-BY-NC-SA', value: 'CC-BY-NC-SA' },
        { label: 'CC-BY-NC-ND', value: 'CC-BY-NC-ND' },
        { label: 'CC0', value: 'CC0' },
        { label: 'Public Domain', value: 'Public Domain' },
        { label: 'All Rights Reserved', value: 'All Rights Reserved' },
      ],
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  hooks: {
    beforeOperation: [generateAltName],
    beforeChange: [generateId, generateCreatedBy],
  },
}

export default Media
