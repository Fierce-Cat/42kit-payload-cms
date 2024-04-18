import type { CollectionConfig, CollectionAfterChangeHook } from 'payload/types'
import { generateId } from '../utilities/GenerateMeta'

// Access Control
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'

const EventCategories: CollectionConfig = {
  slug: 'event-categories',
  admin: {
    useAsTitle: 'name',
  },
  labels: {
    singular: {
      zh: '活动分类',
      en: 'Event Category',
    },
    plural: {
      zh: '活动分类',
      en: 'Event Categories',
    },
  },
  access: {
    create: (req) => {
      return isAdmin(req)
    },
    read: () => true,
    update: (req) => {
      return isAdmin(req)
    },
    delete: (req) => {
      return isAdmin(req)
    },
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'name',
      label: {
        zh: '名称',
        en: 'Name',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: {
        zh: '别名',
        en: 'Slug',
      },
      type: 'text',
      required: true,
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [generateId],
  },
}

export default EventCategories
