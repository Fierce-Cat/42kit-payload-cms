import { CollectionConfig } from 'payload/types'

const StarSystems: CollectionConfig = {
  slug: 'star-systems',
  admin: {
    useAsTitle: 'name',
  },
  labels: {
    singular: {
      'zh-CN': '星系',
      en: 'Star System',
    },
    plural: {
      'zh-CN': '星系',
      en: 'Star Systems',
    },
  },
  fields: [
    {
      name: 'name',
      required: true,
      type: 'text', 
      localized: true,
      label: {
        'zh-CN': '名称',
        en: 'Name',
      },
    },
  ],
}

export default StarSystems
